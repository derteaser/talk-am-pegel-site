#!/usr/bin/env bash
#
# Stop hook: rebuild and re-run the verify.mjs assertions whenever a turn changed
# something that ends up in dist/.
#
# scripts/verify.mjs is a deploy gate — it runs in CI and inside the Cloudflare build
# command, so a regression that slips out of a turn becomes a red build on main.
#
# Configured with asyncRewake, so this costs the turn nothing: it runs in the
# background and only wakes the model on exit 2. Measured on this repo: ~14s warm,
# ~45s when dist/ is absent and all 879 image variants have to be written.
#
# Deliberately silent on success. It fires on every stop, and a turn that only
# answered a question should leave no trace.
set -uo pipefail

repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd) || exit 0
cd "$repo" || exit 0

payload=$(cat 2>/dev/null || true)
session=$(printf '%s' "$payload" | jq -r '.session_id // "unknown"' 2>/dev/null || echo unknown)

cache="$repo/node_modules/.cache/tap-verify"
mkdir -p "$cache" 2>/dev/null || exit 0
stamp_file="$cache/stamp"
blocks_file="$cache/blocks-$session"
lock="$cache/lock"

# Anything that can change dist/. package.json and pnpm-lock.yaml are in because a
# dependency bump changes the emitted CSS and JS.
watch=(src astro.config.mjs public wrangler.jsonc scripts package.json pnpm-lock.yaml)

# Fingerprint = committed state + uncommitted state. HEAD alone would miss a dirty
# tree; porcelain alone would miss a turn that ended in a commit, which is exactly the
# turn most worth verifying.
fingerprint=$(
    printf '%s\n' "$(git rev-parse HEAD 2>/dev/null || echo nohead)"
    git status --porcelain -- "${watch[@]}" 2>/dev/null
    git diff --stat HEAD -- "${watch[@]}" 2>/dev/null
)
fingerprint=$(printf '%s' "$fingerprint" | shasum -a 256 | cut -d' ' -f1)

[ -f "$stamp_file" ] && [ "$(cat "$stamp_file")" = "$fingerprint" ] && exit 0

# Async means a later stop can fire while this one is still building. Two concurrent
# `astro build` runs would race over dist/, so the second one just yields — its state
# is a superset and the next stop re-checks anyway.
mkdir "$lock" 2>/dev/null || exit 0
trap 'rmdir "$lock" 2>/dev/null' EXIT

pnpm_bin=$(command -v pnpm 2>/dev/null || true)
if [ -z "$pnpm_bin" ]; then
    # nvm-managed installs are absent from a stripped PATH; take the newest.
    pnpm_bin=$(ls -t "$HOME"/Library/Application\ Support/Herd/config/nvm/versions/node/*/bin/pnpm 2>/dev/null | head -1)
fi
if [ -z "$pnpm_bin" ]; then
    echo "Stop hook skipped: pnpm not found on PATH, so build + verify did not run." >&2
    exit 0
fi

if ! out=$("$pnpm_bin" --silent build 2>&1); then
    step="pnpm build"
elif ! out=$("$pnpm_bin" --silent verify 2>&1); then
    step="pnpm verify"
else
    printf '%s' "$fingerprint" >"$stamp_file"
    rm -f "$blocks_file"
    exit 0
fi

# Surface the failing lines, not just the tail: verify.mjs prints ~37 passing "✓"
# lines, so a plain tail shows the summary and hides the assertion that broke.
tail_out=$(printf '%s' "$out" | grep -E '✗|FAIL|^ *Error|error( TS[0-9]+)?:' | head -30)
[ -z "$tail_out" ] && tail_out=$(printf '%s' "$out" | tail -40)

# Loop guard: if two consecutive stops in this session could not get the build green,
# stop waking the model and hand it to the user rather than spinning.
blocks=$(cat "$blocks_file" 2>/dev/null || echo 0)
if [ "$blocks" -ge 2 ]; then
    rm -f "$blocks_file"
    echo "Stop hook: $step is still failing after two attempts — not re-waking." >&2
    printf '%s\n' "$tail_out" >&2
    exit 0
fi
printf '%s' "$((blocks + 1))" >"$blocks_file"

cat >&2 <<MSG
$step failed, so dist/ is not deploy-clean. scripts/verify.mjs gates the Cloudflare
build, so this would go red on main. Fix it, or tell the user plainly what is broken
and why you are leaving it.

Failures:
$tail_out
MSG
exit 2
