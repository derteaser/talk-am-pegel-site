---
name: spec-audit
description: Audit the site against The Website Specification and turn the findings into labelled GitHub issues. Use for a fresh full audit, or to re-audit after the spec itself changes.
disable-model-invocation: true
---

# Audit against The Website Specification

[specification.website](https://specification.website) is an external, versioned standard for what
a website owes the platform: 168 items across ten categories, each graded `required`,
`recommended`, `optional` or `avoid`. This skill runs the site against it and lands the result as
GitHub issues rather than a wall of terminal output nobody reads twice.

The first full pass was **2026-09-04**, tracked in **#1495**, children **#1480–#1494**. Read that
issue before starting — a re-audit is a diff against it, not a fresh start.

## Getting the spec

`.mcp.json` registers the server; if its tools are approved in the session, use them:

| tool | use |
| --- | --- |
| `get_categories` | the ten categories and their item counts |
| `get_checklist(category, status)` | the audit worklist — one line per item |
| `list_topics(category, status)` | the same set, unranked, as structured rows |
| `get_topic(slug)` | full Markdown for one item, when a one-liner is not enough to judge |
| `search(query)` | when you know the concept but not the slug |
| `get_changes(since)` | **what the spec itself changed** — the entry point for a re-audit |

If the server is not approved in this session, do not stop: it is read-only HTTP and the audit
works the same over curl.

```bash
call() { curl -s -m 30 -X POST https://mcp.specification.website/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d "$1"; }

call '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_checklist","arguments":{"category":"security","status":"required"}}}'
```

Two traps. The endpoint is on the **`mcp.` subdomain** — the documented
`specification.website/mcp/` is a docs page and 405s on POST. And the full spec text is one
789 KB file at `https://specification.website/llms-full.txt`: fetch it to the scratchpad and
`grep -n` a heading, never read it whole.

## Scope

**Every `required` and `recommended` item, in all categories except `i18n`** — the site is German
only, so i18n's 1 required + 7 recommended items are out of scope by decision. That is 109 items.

`optional` and `avoid` are not audited. Revisit that if the site ever grows a second language, a
feed, a form, or cookies — several current N/A verdicts hang on their absence.

## Running it

Build first — the audit reads rendered output, and a stale `dist/` produces confident nonsense:

```bash
pnpm build
```

Then fan out **three parallel Explore agents**, split so each one owns a coherent slice and they
never touch the same files:

| agent | categories |
| --- | --- |
| 1 | foundations, seo, agent-readiness, well-known |
| 2 | accessibility, privacy, resilience |
| 3 | security, performance |

Each agent prompt has to carry all six of these, or the results come back wrong in ways that are
expensive to unpick:

1. **Read `CLAUDE.md` first.** Most of this repo's oddities are deliberate and documented. An agent
   without that context reports the invariants as bugs — see the table below.
2. **Audit `dist/`, then trace back to source.** 58 rendered HTML files are the ground truth for
   anything in the markup; the template is where the fix goes.
3. **Read `scripts/verify.mjs` before reporting anything missing.** It already asserts a lot, and
   "missing" things that are actually guarded waste a whole issue.
4. **Live checks need a browser UA.** Production 403s unusual user agents, so a bare `curl` sweep
   reads like a total outage:
   ```bash
   curl -sI -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' https://www.talk-am-pegel.de/
   ```
   Everything header-shaped is only observable at the edge. `scripts/verify-live.sh` shows what is
   already asserted there.
5. **Say what could not be measured.** No browser is available unless the Playwright MCP server is
   connected, so Core Web Vitals, real contrast rendering and forced-colours cannot be *measured* —
   an agent must identify the structural risk and say measurement is still required, never invent a
   number. Colour contrast is the exception: extract the OKLCH tokens from `src/styles/site.css` and
   compute the ratios arithmetically.
6. **One compact row per item** — `category | slug | tier | PASS/FAIL/PARTIAL/N/A | evidence
   (file:line or exact curl fact) | fix sketch | effort` — plus a closing note on which failures
   share a file or a fix. Ask for FAIL/PARTIAL rows first. N/A needs a reason.

Then **re-verify every P0 and P1 by hand** before writing a single issue. Agents are good at
finding candidates and occasionally wrong about them; a wrong P0 costs more credibility than a
missed P2.

## Deliberate, and not to be re-reported

Each of these looks like a failure and is a decision. An audit that reports them has not read
`CLAUDE.md`.

| Looks broken | Actually |
| --- | --- |
| HSTS missing from `public/_headers` | The Cloudflare zone owns it. Setting it in both places comma-joins the value. `nosniff` is genuinely sourced from `_headers` — that asymmetry is real. |
| `Thumbnail` has no `layout` | Astro's `layout` generates a `sizes` that is wrong for the 50vw two-column layouts. Explicit `widths`/`sizes` are the point. |
| Fonts are not preloaded | Deliberate; the reasoning is in `Layout.astro`'s own comment. |
| One hand-rolled `sitemap.xml` | `@astrojs/sitemap` would emit `sitemap-index.xml` and move the URL robots.txt and Search Console point at. |
| Tailwind scans only `src/` | `source(none)` plus one `@source`. Never touch this for "CSS size" reasons without the proof CLAUDE.md specifies. |
| No cookie banner | Nothing sets a cookie; Fathom is cookieless. The spec agrees no banner is needed. |
| Ticket CTA logic runs client-side | `past()` is build-time and there is no scheduled rebuild, so Alpine takes over. The `:class` **object** syntax is required for that handoff. |
| Scroll reveals sit beside named elements, not on them | A view transition snapshots the incoming page before `IntersectionObserver` fires. A reveal on a `transition:name` element morphs to something invisible. |
| Blockquotes are one line in MDX; two files skip Prettier | Both prevent real breakage — see `.prettierignore`. |

The four recommended items assessed and left without an issue (`container-queries`,
`anchor-positioning`, `reporting-endpoints`, the HTML half of `conditional-requests`) are recorded
in #1495 with reasons. Do not silently re-open them; if the reasoning has changed, say why.

## Turning findings into issues

**Bundle by shared file or shared fix**, not by category — one `public/_headers` edit closed six
items in the first pass, one document-structure edit closed four. Aim for PR-sized issues, roughly
12–16 of them.

**Labels** (all already exist): `website-spec` on everything, one or more `spec:<category>`, exactly
one `priority:P0|P1|P2`, and `cloudflare-zone` on anything changed in the dashboard rather than the
repo. Dashboard work gets its own issue — it cannot ship as a PR and `verify.mjs` cannot see it.

**Priority** is spec tier plus real impact:

- **P0** — required item causing user-visible harm right now
- **P1** — the remaining required items
- **P2** — recommended items

Impact can raise a tier but not lower one. In the first pass, `graceful-degradation` went to P1
despite being recommended, because the failure hides most of the page.

**Every issue body follows one shape:** spec links with tiers → evidence with `file:line` or the
exact command output → a fix checklist → acceptance criteria that name **the assertion to add to
`scripts/verify.mjs`** (for anything visible in `dist/`) **or `scripts/verify-live.sh`** (for
anything only the edge can see). That last part is what stops a fix regressing quietly, and it is
this repo's own established habit — `verify.mjs` runs in CI *and* in the Cloudflare build.

Where a fix is genuinely the user's call — a brand colour, a trade-off with no clean answer — the
issue **states the options with numbers and does not pick one**. #1481 is the model.

**The master issue** carries the scope statement, the PASS/FAIL table, children as a task list
grouped by priority, a suggested order, the "assessed, no action" table with reasons, and the
re-audit command. Link children as real sub-issues so GitHub renders progress:

```bash
for n in <child numbers>; do
  id=$(gh api repos/derteaser/talk-am-pegel-site/issues/$n --jq .id)
  gh api --method POST repos/derteaser/talk-am-pegel-site/issues/<master>/sub_issues -F sub_issue_id="$id"
done
```

Write bodies to files and use `gh issue create --body-file` — they contain backticks, tables and
fences, so heredocs on the command line will bite.

## Re-auditing

Cheaper than a first pass, and a different job. Two things drift: the site and the standard.

```
get_changes(since: "2026-09-04")    # or the date of the last audit
```

That reports `added`, `changed`, `status` (an item promoted or downgraded) and `removed` items. Then:

1. Audit only the deltas, plus anything whose issue closed since — a closed issue is a claim, and
   `verify.mjs`/`verify-live.sh` assertions are the evidence it is still true.
2. A `status` change matters most: an item promoted from recommended to required moves its issue's
   priority, and one that was `optional` may now be in scope.
3. A `removed` item means closing its issue as no longer part of the standard, not as done.
4. Update #1495 in place — its counts, its task list, its assessed-no-action table — rather than
   opening a second tracking issue. One audit trail, extended.

Record the new audit date in the master issue so the next `get_changes` has a floor.
