---
name: dependency-updates
description: "Use when updating dependencies in this repo from the Renovate Dependency Dashboard (issue #427) — bumping or upgrading pnpm or GitHub Actions packages, or bundling several pending updates into PRs instead of one Renovate PR per bump. Triggers on: 'update dependencies', 'update our deps', 'Renovate dashboard', 'bump packages', 'upgrade <package>', 'apply the pending updates', 'what updates are pending / which are breaking'. Splits major/breaking vs non-major, ships one bundled non-major PR per ecosystem and one PR per major, and only opens a PR once `pnpm build` + `pnpm verify` are green. Do not use for application feature work, writing tests, or content edits."
disable-model-invocation: true
---

# Dependency updates from the Renovate dashboard

Renovate maintains a **Dependency Dashboard** (issue #427) listing every pending pnpm and GitHub
Actions update. Left alone, Renovate opens one PR per bump — noisy and slow to review. This skill
bundles the safe ones and isolates the risky ones, so review is quick and nothing lands red.

**The shape of a run:** read the dashboard → classify → apply **all non-major** bumps as
**one PR per ecosystem** (pnpm / GitHub Actions) → **report majors** for the user to take one at a
time. Every PR must be green before it opens.

## Guardrails (read first)

These reflect hard rules of this repo — violating them causes real damage.

- **Never `git add -A` / `git add .`.** Stage only the dependency files you changed, by explicit
  path (`git add package.json pnpm-lock.yaml`).
- **Branch from `main`; never commit to `main`.** One branch per PR.
- **A bump that can't go green is dropped, not forced.** Leave it out of the bundle and report it
  with the error — a half-green PR helps no one.
- **One ecosystem's failure must not block the others.** pnpm going red shouldn't stop the Actions
  PR.
- **`scripts/expected-urls.txt` is a guarded file.** A `PreToolUse` hook prompts when it is edited.
  Dependency bumps should never need to touch it — if a bump breaks the URL inventory, that bump is
  the one to investigate, not the guard.
- **TypeScript is pinned to 6.x.** `astro check` needs TypeScript 6's API; TS 7 does not expose it.
  A major TS upgrade is not a routine bump — skip it unless explicitly asked.

## Step 1 — Read and classify the dashboard

Fetch the dashboard and run it through the bundled parser. The parser does the fiddly major/non-major
call (including the semver 0.x-is-breaking nuance) deterministically:

```bash
gh issue view 427 --repo derteaser/talk-am-pegel-site \
  | python3 .claude/skills/dependency-updates/scripts/parse_dashboard.py
```

The JSON groups bumps by ecosystem (`npm`, `github-actions`), each with `is_major`, `blocked`, and a
`reason`. Notes on reading it:

- `is_major: true` — a major bump **or** a 0.x minor bump (`0.7 → 0.8`), which can break under
  semver. These are handled one PR at a time (Step 3), never in the non-major bundle.
- `blocked: true` — the package sits behind a closed/blocked Renovate PR. **Skip it** unless the
  user explicitly asks for it.
- `reason: "constraint unchanged (lockfile update)"` — all `devDependencies` here are exact-pinned,
  so this is rare; it means only the lockfile needs to move.

Present a short classified table (per ecosystem, major vs non-major, flag blocked ones) so the user
sees scope before anything is written. By default, **proceed with all non-major, non-blocked bumps**
and **report the majors** — don't start a major upgrade unless asked.

## Step 2 — Non-major bumps: one bundled PR per ecosystem

For each ecosystem that has non-major, non-blocked bumps, create a dedicated branch off the latest
`main` and apply every such bump for that ecosystem together:

```bash
git fetch origin
git switch -c update-<ecosystem>-deps origin/main   # e.g. update-pnpm-deps
```

### pnpm (Renovate calls this ecosystem "npm")

Packages live in `package.json`. `devDependencies` are **exact-pinned** (e.g. `"tailwindcss":
"4.3.5"`); the package manager itself is the `packageManager: "pnpm@x.y.z"` field.

- **Exact-pinned** package → edit the version in `package.json` to the target.
- **`pnpm` bump** → update the `packageManager` field.

Then refresh the lock and confirm the build passes:

```bash
pnpm install
pnpm build    # includes prune-dist.mjs
pnpm verify   # 64 assertions against dist/
```

`pnpm build` + `pnpm verify` is the CI gate. **Do not skip `pnpm verify`** — it catches URL parity
violations, broken asset references, invalid JSON-LD, CSP hash mismatches, and JS budget overruns
that a successful build alone does not prove.

Stage only:

```bash
git add package.json pnpm-lock.yaml
```

If `git status` shows anything else (rebuilt `dist/`, caches), you did something wrong — stop and
investigate.

#### Respect pnpm's minimum-release-age policy

pnpm enforces a **`minimumReleaseAge`** supply-chain policy here: a version published more recently
than the cutoff is rejected. Two signals show a bump is too young:

- `pnpm install` prints **"Added `<pkg>@<version>` to minimumReleaseAgeExclude in
  pnpm-workspace.yaml"**, or
- `pnpm install` fails with **`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`**.

**Drop that bump — do not force it in.** Never commit the `minimumReleaseAgeExclude` bypass that
pnpm auto-adds; revert `pnpm-workspace.yaml` and pin the package back to its current version. The
too-young version comes through on a later run once it has aged out. Reset a lockfile that already
captured the rejected version with `git checkout origin/main -- pnpm-lock.yaml` before reinstalling
the remaining (aged-out) bumps. Report the held-back package to the user.

### GitHub Actions

The dashboard `github-actions` entries are pinned-SHA actions due for a **digest re-pin** to the same
major tag (e.g. `pnpm/action-setup` to the latest `v6`). The parser lists every workflow file each
action appears in (`files`). For each action:

1. Resolve the current SHA of the target ref:
   ```bash
   gh api repos/<owner>/<action>/commits/<ref> --jq .sha   # e.g. repos/pnpm/action-setup/commits/v6
   ```
2. In **every** file under `files`, replace the old SHA with the new one and keep the trailing
   `# vN` version comment in sync.

There's nothing to install or test for Actions-only changes; the gate is that the workflow YAML still
parses and the SHA/comment match. Stage only the workflow files you edited.

### Commit message and PR (all ecosystems)

Use a plain, descriptive title matching this repo's history (e.g. `Update non-major pnpm
dependencies`). List the bumps in the body. End every commit with the `Co-Authored-By` trailer your
harness specifies for the session.

Push and open the PR:

```bash
git push -u origin update-<ecosystem>-deps
gh pr create --fill   # or --title/--body; target main
```

## Step 3 — Major / breaking bumps: one PR each, on request

Majors (and 0.x-breaking bumps) often need code changes, so they're reported by default and taken
**only when the user asks** for a specific one. For each requested major:

1. Branch off `main`: `git switch -c upgrade-<package>-vN origin/main`.
2. **Read the changelog / UPGRADE notes** for the version range before changing anything — find the
   breaking changes that affect this codebase.
3. Apply the bump: edit the version in `package.json` then `pnpm install`.
4. Fix any breaking usages in `src/`, `scripts/`, `astro.config.mjs`, or `wrangler.jsonc` as needed.
5. Run the **full** gate: `pnpm build` + `pnpm verify`.
6. Commit (with the trailer), push, and open a PR explaining the breaking changes handled.

Dev-only 0.x tooling is usually low-risk despite the breaking flag — use judgment, but still verify
green.

## Step 4 — Verify before every PR

Before opening any PR, confirm:

- [ ] The gate passed: `pnpm build` + `pnpm verify` green (pnpm); workflow YAML parses (Actions).
- [ ] `git status` shows **only** the intended dependency files — nothing under `dist/`, no stray
      config changes.
- [ ] The commit ends with the `Co-Authored-By` trailer.
- [ ] Blocked and major bumps were not silently swept into a non-major bundle.

Then summarize for the user: which PRs were opened (with links), which bumps were dropped and why,
and which majors are waiting to be tackled.
