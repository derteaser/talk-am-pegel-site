#!/usr/bin/env python3
"""Parse the Renovate Dependency Dashboard into structured, classified JSON.

Input  : the markdown body of the dashboard issue (Renovate issue #427), read from
         stdin or a file argument. Get it with:
             gh issue view 427 --repo derteaser/talk-am-pegel-site \
               | python3 .claude/skills/dependency-updates/scripts/parse_dashboard.py
Output : JSON on stdout grouped by ecosystem (npm / github-actions),
         one entry per actionable bump with a major / non-major classification.

Why a script: the major-vs-non-major call (incl. the 0.x-is-breaking nuance) and the
ecosystem/file bookkeeping are fiddly and easy to get subtly wrong by eye. Doing it once,
deterministically, keeps every run honest and frees the model to focus on applying and
verifying the bumps.

Classification rules:
  * Strip leading ^ ~ v = and whitespace, then compare numeric segments.
  * current == target (constraint unchanged) -> non-major "lockfile update".
  * segment[0] differs                        -> major.
  * 0.x special case: current and target both start with 0 and segment[1] differs
    -> treated as breaking (is_major=True, reason "0.x minor is breaking"), because
    a 0.x minor bump can carry breaking changes under semver.
  * github-actions digest re-pin (target is the same ref, e.g. v7) -> non-major;
    a higher ref major (v6 -> v7) -> major.
Only npm / github-actions are emitted (the ecosystems this project acts on);
nvm / regex / renovate-config detected blocks are ignored.
"""

from __future__ import annotations

import json
import re
import sys

ACTIONABLE = ("npm", "github-actions")

BUMP_RE = re.compile(r"^\s*-\s*`([^`]+)`\s*→\s*\[Updates:\s*`([^`]+)`\]")
SUMMARY_RE = re.compile(r"<summary>([^<(]+?)(?:\s*\(\d+\))?</summary>")
BLOCKED_RE = re.compile(r"recreate-branch=(renovate/[^\s-]+(?:-[^\s-]+)*)")


def _segments(version: str) -> list[int]:
    """Leading numeric segments of a version string, ignoring ^ ~ v and suffixes."""
    cleaned = version.strip().lstrip("^~v=").strip()
    parts = re.split(r"[.\-+ ]", cleaned)
    out: list[int] = []
    for part in parts:
        if part.isdigit():
            out.append(int(part))
        else:
            break
    return out


def classify(current: str, target: str, ecosystem: str) -> tuple[bool, str]:
    """Return (is_major, reason) for a bump."""
    if ecosystem == "github-actions":
        cur_ref = current.split("@", 1)[0]
        cur_seg = _segments(cur_ref)
        tgt_seg = _segments(target)
        if cur_seg and tgt_seg and cur_seg[0] != tgt_seg[0]:
            return True, f"action major {cur_ref} → {target}"
        return False, "digest re-pin"

    cur_seg = _segments(current)
    tgt_seg = _segments(target)

    if current.strip() == target.strip() or cur_seg == tgt_seg:
        return False, "constraint unchanged (lockfile update)"
    if not cur_seg or not tgt_seg:
        return False, "non-numeric version"
    if cur_seg[0] != tgt_seg[0]:
        return True, f"major {cur_seg[0]} → {tgt_seg[0]}"
    if cur_seg[0] == 0 and tgt_seg[0] == 0 and len(cur_seg) > 1 and len(tgt_seg) > 1 and cur_seg[1] != tgt_seg[1]:
        return True, "0.x minor is breaking"
    return False, "non-major"


def parse(text: str) -> dict:
    blocked_branches = BLOCKED_RE.findall(text)
    blocked_stems = {
        token
        for branch in blocked_branches
        for token in branch.split("/", 1)[-1].split("-")
        if token and not token[0].isdigit() and token not in {"x"}
    }

    ecosystems: dict[str, list[dict]] = {name: [] for name in ACTIONABLE}
    gha_index: dict[str, dict] = {}

    current_ecosystem: str | None = None
    current_file: str | None = None

    for line in text.splitlines():
        for summary in SUMMARY_RE.findall(line):
            name = summary.strip()
            if "." in name or "/" in name:
                current_file = name
            else:
                current_ecosystem = name
                current_file = None

        match = BUMP_RE.match(line)
        if not match or current_ecosystem not in ACTIONABLE:
            continue

        spec, target = match.group(1).strip(), match.group(2).strip()
        package, _, current = spec.rpartition(" ")
        package, current = package.strip(), current.strip()
        if not package:
            continue

        is_major, reason = classify(current, target, current_ecosystem)
        last_seg = package.rsplit("/", 1)[-1].lower()
        blocked = last_seg in blocked_stems

        if current_ecosystem == "github-actions":
            entry = gha_index.get(package)
            if entry is None:
                entry = {
                    "package": package,
                    "current": current,
                    "target": target,
                    "is_major": is_major,
                    "blocked": blocked,
                    "reason": reason,
                    "files": [],
                }
                gha_index[package] = entry
                ecosystems["github-actions"].append(entry)
            if current_file and current_file not in entry["files"]:
                entry["files"].append(current_file)
        else:
            ecosystems[current_ecosystem].append(
                {
                    "package": package,
                    "current": current,
                    "target": target,
                    "is_major": is_major,
                    "blocked": blocked,
                    "reason": reason,
                }
            )

    return {"blocked_branches": blocked_branches, "ecosystems": ecosystems}


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] not in ("-", "/dev/stdin"):
        with open(sys.argv[1], encoding="utf-8") as handle:
            text = handle.read()
    else:
        text = sys.stdin.read()
    json.dump(parse(text), sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
