#!/usr/bin/env bash
#
# Post-deploy sweep of the PRODUCTION site.
#
# scripts/verify.mjs proves dist/ is correct. This proves the edge serves it correctly,
# which is a different question: URL handling, redirects, cache regimes and the security
# headers all come from Cloudflare — `html_handling` in wrangler.jsonc plus zone
# settings that live outside this repo — and none of it is exercised by a local build.
#
# Read-only: GETs and HEADs against public URLs. Safe to run any time.
#
#   scripts/verify-live.sh                    # https://www.talk-am-pegel.de
#   scripts/verify-live.sh <base-url>         # a preview deployment
set -uo pipefail

BASE=${1:-https://www.talk-am-pegel.de}
BASE=${BASE%/}

# Production 403s unusual user agents, so a bare curl UA fails every request and looks
# like a total outage. Present as a browser.
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
CURL=(curl -sS --max-time 20 -A "$UA")

# Zone-owned behaviour (apex redirect, HSTS, the managed robots.txt block) only exists
# on talk-am-pegel.de. A workers.dev preview is outside the zone, so those checks are
# skipped there rather than reported as regressions.
case "$BASE" in
    *.workers.dev) on_zone=0 ;;
    *) on_zone=1 ;;
esac

pass=0
fail=0
ok() {
    pass=$((pass + 1))
    printf '  \033[32m✓\033[0m %s\n' "$1"
}
no() {
    fail=$((fail + 1))
    printf '  \033[31m✗\033[0m %s\n' "$1"
}

skip() {
    printf '  \033[90m-\033[0m %s\n' "$1"
}

# status + location in one request, without following redirects
probe() { "${CURL[@]}" -o /dev/null -w '%{http_code} %{redirect_url}' "$1"; }
headers() { "${CURL[@]}" -D - -o /dev/null "$1"; }

hdr() { printf '%s' "$2" | tr -d '\r' | grep -i "^$1:" | head -1 | cut -d' ' -f2-; }

echo
echo "Sweeping $BASE"
echo

# ---------------------------------------------------------------------------
echo "1. URL inventory — every indexed page, 200 and no redirect"
missing=()
redirected=()
while read -r p; do
    read -r code loc <<<"$(probe "$BASE$p")"
    if [ "$code" != "200" ]; then
        missing+=("$p -> $code")
    elif [ -n "$loc" ]; then
        redirected+=("$p -> $loc")
    fi
done < <(grep -v '^#' scripts/expected-urls.txt | sed '/^$/d')

total=$(grep -vc '^#\|^$' scripts/expected-urls.txt)
if [ ${#missing[@]} -eq 0 ]; then ok "all $total indexed URLs return 200"; else
    no "${#missing[@]}/$total not 200:"
    printf '      %s\n' "${missing[@]}"
fi
# A redirect on an indexed URL is the specific SEO regression this repo is built around.
if [ ${#redirected[@]} -eq 0 ]; then ok "no indexed URL redirects"; else
    no "${#redirected[@]} redirect:"
    printf '      %s\n' "${redirected[@]}"
fi

# ---------------------------------------------------------------------------
echo
echo "2. Collision cases — a .html file and a directory of the same name"
# dist/ holds both talks.html and talks/. No Cloudflare doc covers which wins;
# resolution order puts the file first. Regression here would 404 two hub pages.
for p in / /talks /persons; do
    read -r code loc <<<"$(probe "$BASE$p")"
    [ "$code" = "200" ] && [ -z "$loc" ] && ok "$p -> 200" || no "$p -> $code ${loc:+(-> $loc)}"
done

# ---------------------------------------------------------------------------
echo
echo "3. Canonicalisation — variants redirect to the extensionless URL"
for variant in /kontakt/ /kontakt.html /talks/talk-am-pegel-11-sicherheit-als-standortfaktor.html; do
    want=${variant%.html}
    want=${want%/}
    read -r code loc <<<"$(probe "$BASE$variant")"
    case "$code" in
        30*) [ "${loc%/}" = "$BASE$want" ] && ok "$variant -> $code $loc" || no "$variant -> $code $loc (expected $BASE$want)" ;;
        *) no "$variant -> $code, expected a 3xx to $BASE$want" ;;
    esac
done

# ---------------------------------------------------------------------------
echo
echo "4. Apex redirects to www"
apex=$(printf '%s' "$BASE" | sed 's#//www\.#//#')
if [ "$apex" != "$BASE" ]; then
    read -r code loc <<<"$(probe "$apex")"
    case "$code" in
        30*) [ "${loc%/}" = "$BASE" ] && ok "$apex -> $code $loc" || no "$apex -> $code $loc (expected $BASE)" ;;
        *) no "$apex -> $code, expected a 3xx to $BASE" ;;
    esac
else
    skip "apex redirect not checked (not a www host)"
fi

# ---------------------------------------------------------------------------
echo
echo "5. 404 handling — status AND a branded body"
read -r code _ <<<"$(probe "$BASE/definitely-not-a-page-$RANDOM")"
[ "$code" = "404" ] && ok "unknown path -> 404" || no "unknown path -> $code"
body=$("${CURL[@]}" "$BASE/definitely-not-a-page-$RANDOM")
# not_found_handling defaults to "none", which serves a bodyless 404. wrangler.jsonc
# sets "404-page"; this is the check that it is still in effect.
printf '%s' "$body" | grep -q 'talk-am-pegel\|Talk am Pegel' && ok "404 serves the branded page, not a bare status" || no "404 body is not the site's error page"

# ---------------------------------------------------------------------------
echo
echo "6. Cache regimes — the two must stay different"
h=$(headers "$BASE/")
cc=$(hdr cache-control "$h")
printf '%s' "$cc" | grep -q 'max-age=0' && ok "HTML: $cc" || no "HTML cache-control is '$cc', expected max-age=0"

# Hashed assets are immutable for a year; find a real one rather than guessing a hash.
asset=$("${CURL[@]}" "$BASE/" | grep -o '/_astro/[A-Za-z0-9._-]*\.css' | head -1)
if [ -n "$asset" ]; then
    h=$(headers "$BASE$asset")
    cc=$(hdr cache-control "$h")
    printf '%s' "$cc" | grep -q 'immutable' && ok "/_astro/*: $cc" || no "/_astro/* cache-control is '$cc', expected immutable"
else
    no "could not find an /_astro/ asset on the homepage to probe"
fi

# ---------------------------------------------------------------------------
echo
echo "7. Security headers"
h=$(headers "$BASE/")
# HSTS is zone-owned. nosniff is not: it survives on a workers.dev preview, which is
# outside the zone, so its source is public/_headers.
sts=$(hdr strict-transport-security "$h")
if [ "$on_zone" = 1 ]; then
    [ -n "$sts" ] && ok "HSTS: $sts" || no "no Strict-Transport-Security — the zone setting may have been switched off"
else
    skip "HSTS not checked (off-zone host)"
fi
xcto=$(hdr x-content-type-options "$h")
[ "$xcto" = "nosniff" ] && ok "X-Content-Type-Options: nosniff" || no "X-Content-Type-Options is '$xcto', expected nosniff"

# The rest of the /* block in public/_headers. All of it is invisible to verify.mjs —
# dist/_headers is a Cloudflare instruction file, not output, so only a live response
# proves the platform parsed and applied it. A typo in that file fails silently.
xfo=$(hdr x-frame-options "$h")
[ "$xfo" = "DENY" ] && ok "X-Frame-Options: DENY" || no "X-Frame-Options is '$xfo', expected DENY"

ref=$(hdr referrer-policy "$h")
[ "$ref" = "strict-origin-when-cross-origin" ] && ok "Referrer-Policy: $ref" || no "Referrer-Policy is '$ref', expected strict-origin-when-cross-origin"

pp=$(hdr permissions-policy "$h")
case "$pp" in
    *camera=\(\)*microphone=\(\)*) ok "Permissions-Policy denies the unused device APIs" ;;
    "") no "no Permissions-Policy" ;;
    *) no "Permissions-Policy present but does not deny camera/microphone: $pp" ;;
esac

coop=$(hdr cross-origin-opener-policy "$h")
[ "$coop" = "same-origin" ] && ok "Cross-Origin-Opener-Policy: $coop" || no "Cross-Origin-Opener-Policy is '$coop', expected same-origin"

corp=$(hdr cross-origin-resource-policy "$h")
[ "$corp" = "same-site" ] && ok "Cross-Origin-Resource-Policy: $corp" || no "Cross-Origin-Resource-Policy is '$corp', expected same-site"

nvs=$(hdr no-vary-search "$h")
case "$nvs" in
    *utm_source*) ok "No-Vary-Search ignores the campaign params" ;;
    "") no "no No-Vary-Search" ;;
    *) no "No-Vary-Search present but without utm_source: $nvs" ;;
esac

# The /* block must reach the hashed assets too, or the security headers cover only
# HTML. Cloudflare applies every matching rule, so this is a check on that behaviour
# continuing to hold, not on our own file.
# $asset is the path picked up in section 6, and may be empty if the parse failed.
if [ -n "$asset" ]; then
    a=$(headers "$BASE$asset")
    [ "$(hdr x-frame-options "$a")" = "DENY" ] && ok "the /* headers reach /_astro/* as well" || no "/_astro/* did not inherit the /* security headers"
else
    skip "asset header inheritance not checked (no /_astro asset found on the home page)"
fi

# ---------------------------------------------------------------------------
echo
echo "8. robots.txt and sitemap.xml"
r=$("${CURL[@]}" "$BASE/robots.txt")
printf '%s' "$r" | grep -qi 'sitemap:.*sitemap\.xml' && ok "robots.txt points at /sitemap.xml" || no "robots.txt has no sitemap line"
# Cloudflare PREPENDS a managed AI-bot block to the origin file. It has silently stopped
# doing so once before, and only this check notices.
if [ "$on_zone" = 1 ]; then
    printf '%s' "$r" | grep -qi 'Content-Signal' && ok "Cloudflare's managed AI-bot block is being prepended" || no "no Content-Signal in robots.txt — the Cloudflare managed block is missing"
else
    skip "managed AI-bot block not checked (off-zone host)"
fi
read -r code _ <<<"$(probe "$BASE/sitemap.xml")"
locs=$("${CURL[@]}" "$BASE/sitemap.xml" | grep -c '<loc>')
[ "$code" = "200" ] && ok "/sitemap.xml -> 200 with $locs <loc> entries" || no "/sitemap.xml -> $code"
[ "$locs" = "$total" ] && ok "sitemap lists all $total URLs" || no "sitemap lists $locs URLs, expected $total"
# @astrojs/sitemap would emit sitemap-index.xml and change the URL Search Console holds.
read -r code _ <<<"$(probe "$BASE/sitemap-index.xml")"
[ "$code" = "404" ] && ok "no sitemap-index.xml (the hand-rolled endpoint is still in use)" || no "sitemap-index.xml -> $code; something replaced the hand-rolled sitemap"

echo
if [ "$fail" -eq 0 ]; then
    printf '\033[32mPASS\033[0m — %s checks, 0 failures\n\n' "$pass"
else
    printf '\033[31mFAIL\033[0m — %s passed, %s failure(s)\n\n' "$pass" "$fail"
    exit 1
fi
