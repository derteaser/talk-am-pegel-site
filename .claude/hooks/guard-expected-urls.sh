#!/usr/bin/env bash
#
# PreToolUse guard for scripts/expected-urls.txt.
#
# That file is the URL-parity invariant made executable: scripts/verify.mjs asserts
# dist/ contains exactly those 57 pages, and it gates the Cloudflare deploy. Adding a
# line is routine (a new talk). Removing one silently de-indexes a live URL, which is
# the one mistake in this repo that no test can catch afterwards — the page is simply
# gone. So every write here turns into a confirmation prompt instead of an
# auto-accepted edit.
set -uo pipefail

path=$(jq -r '.tool_input.file_path // ""' 2>/dev/null) || exit 0

case "$path" in
    */scripts/expected-urls.txt | scripts/expected-urls.txt) ;;
    *) exit 0 ;;
esac

read -r -d '' reason <<'TXT' || true
scripts/expected-urls.txt is the URL-parity guard. All 57 entries are indexed and must
keep resolving without a redirect; scripts/verify.mjs asserts dist/ against this list
and gates the deploy.

ADDING a line is routine — a new talk needs one.
REMOVING or renaming one takes a live URL off the site. That is a deliberate SEO
decision, never a cleanup. Confirm it is intended before allowing this edit.
TXT

jq -n --arg r "$reason" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'
