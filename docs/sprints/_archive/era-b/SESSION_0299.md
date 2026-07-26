---
title: "SESSION 0299 — Docs infrastructure: link repair, lint sweep, navigator, runbook nesting"
slug: session-0299
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0299
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0298.md
  - docs/knowledge/wiki/doc-pruning-register.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0299 — Docs infrastructure: link repair, lint sweep, navigator, runbook nesting

## Date

2026-05-29

## Operator

Brian + claude-session-0299

## Goal

Reactive docs-infrastructure lane that grew out of operator feedback during SESSION_0298
bow-out ("why record broken things instead of fixing them?"). Drive `wiki:lint` to zero
errors, build a navigable docs browser, and organize the runbooks — without breaking links.

## Status

### Status: closed

> **Close note:** This lane was not opened with a formal bow-in — it began as post-0298
> follow-up on `main` and is recorded here retroactively as the audit ledger for the work.

## What landed

Five commits on `main` (after SESSION_0298 `f4cd2bd`):

- `797112c` — **Fixed all 232 broken wiki-lint links.** Root cause: docs moved into `_archive/`
  kept old relative-link depth, and `index.md` omitted the `_archive/` segment. Resolved with a
  basename resolver (`/tmp/fix_wiki_links2.py`): 232 link-path swaps across 23 docs, 1:1, no
  content edits. Errors 232 → 0.

- `5ae35b1` — **Cleared lint warnings.** Inserted blank line before lists (wiki-lint R8 /
  markdownlint MD032): 636 insertions across 138 docs, purely additive (0 deletions, no reflow),
  scoped to the linter's exact file set. Fixed 4 `pairs_with` reciprocity gaps + 3 orphan index
  entries. Used a targeted fixer mirroring R8 rather than Prettier (which would have churned
  tables/markers/ASCII diagrams repo-wide). Warnings 699 → 55 (remaining are honest 30-day
  staleness reminders, intentionally not date-bumped).

- `6545b88` — **Searchable HTML docs navigator.** `scripts/generate-docs-nav.py` →
  `bun run docs:nav` builds a self-contained `docs/index.html` (no deps/network): full-text
  search, virtual module tree, in-pane markdown rendering with working internal links, status +
  stale badges. Embedded data escapes `</` so no doc can break the `<script>`. Output git-ignored
  (regenerable, ~7 MB). Documented in `runbooks/dev-environment/docs-navigator.md`.
- `6b12ea4` — **Nested 31 runbooks into domain modules** (`runbooks/<domain>/`) via `git mv`
  (history preserved). Relinked all inbound references with the resolver: 108 link rewrites
  across 26 docs + 4 code `@see` comments + `index.md`. Added `runbooks/README.md` domain hub.

- `17b897b` — **Resolved the `_imports/*` + systems-pack archive candidates** in the
  doc-pruning-register (kept in place; see Decisions).

## Decisions resolved

- **Targeted fixer over Prettier** for the blank-line sweep — matches `wiki:lint` R8 exactly,
  minimal additive diff, avoids reflowing tables/markers/diagrams across hundreds of files.

- **Navigator output git-ignored** — it regenerates on every docs change; committing a 6.7 MB
  file would churn every session. Commit the generator + `docs:nav` script instead.

- **Archive candidates kept in place (not physically moved).** `_imports/` and
  `ronin_dojo_baseline_systems_pack/` are excluded **by directory name** from both `wiki:lint`
  and the navigator, so they are already out of the active load path. A move to `_archive/` would
  give zero functional benefit and push 28 cold files one level deeper, breaking their outbound
  relative links (hidden, since excluded). Recorded as RESOLVED in the doc-pruning-register.

## Files touched

- `scripts/generate-docs-nav.py` — new (navigator generator)
- `package.json` — `docs:nav` script; `.gitignore` — ignore `docs/index.html`
- `docs/runbooks/**` — 31 runbooks moved into domain subdirs; new `README.md` hub
- `docs/knowledge/wiki/index.md` — link repairs, backfills, navigator/hub/orphan entries
- `docs/knowledge/wiki/doc-pruning-register.md` — archive candidates resolved
- ~160 docs — relative-link repairs + blank-line-before-list normalization
- 4 code files — `@see` runbook path updates

## Verification

- `bun run wiki:lint` → **0 errors / 55 warnings** (all 30-day staleness; honest).
- `npm run typecheck` → clean (the 4 touched `.ts` files were comment-only `@see` edits).
- Navigator: embedded JSON parses (525 docs); `node --check` on the 6.9 MB script passes.
- Graphify refreshed after each push; tree clean.

## Reflections

- **A move without an atomic relink creates exactly the debt it looks like it's avoiding.** The
  232 broken links all traced to past `_archive/` moves; the cure (and the prevention) is the
  basename resolver run in the same step as any future move. Used it twice more this session
  (runbook nesting) with zero residual breakage.
- **Mirror the repo's own linter, don't import a new one.** Writing a fixer against `wiki:lint`'s
  R8 rule produced a 636-line-exact, churn-free diff; Prettier would have "fixed" far more than
  asked.

- **"Execute the archive" sometimes means decide, not move.** The most useful, lowest-risk
  archive action was recording a reasoned keep-in-place decision — the candidates were already
  cold (excluded by dir name), so relocating them was value-negative.

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, needs AWS creds (carried).
- **55 staleness warnings**: docs >30 days since `updated`. Not defects; clear them via genuine
  review, not date-bumps. Optional future "doc review" pass.

## Next session

- **Goal**: Resume the product lane — the member-management → invite slice-3 follow-ups staged in
  SESSION_0298 (auth consolidation of `updateOrganization` onto `assertOrgAdminAccess` / drift
  D-017, or invite polish), or the next sprint deliverable.

- **Inputs to read**: SESSION_0298 Next-session block, drift register D-017.
- **First task**: Per SESSION_0298 — point `updateOrganization` at `assertOrgAdminAccess` and
  retire the OWNER-role check, verifying the dashboard school-form still authorizes owners.
