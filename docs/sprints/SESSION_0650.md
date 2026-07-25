---
title: "SESSION 0650 — auto-claude render-deck markdown→branded HTML slides (G-030-adjacent) (overnight auto lane, wave 3)"
slug: session-0650
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0650
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0650 — auto-claude render-deck markdown→branded HTML slides (G-030-adjacent) (overnight auto lane, wave 3)

> Staged by the SESSION_0635 overnight orchestrator (wave 3 — continuation wave, operator-authorized).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0650-render-deck`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude render-deck markdown→branded HTML slides (G-030-adjacent) — one tightly-scoped item, zero open forks (or forks deliberately OPEN for the /rr lane).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0650_TASK_01 | done | Built `scripts/render-deck` — standalone markdown-outline → branded HTML slide-deck renderer (G-030-adjacent) |

## What landed

`scripts/render-deck/`: a self-contained CLI (`bun scripts/render-deck/index.ts <outline.md>
[-o out.html]`) that parses a markdown outline (YAML frontmatter + `## `-delimited slides)
into ONE self-contained HTML slide deck — inline CSS, no external assets, 16:9 slides,
arrow-key + click navigation, a slide counter/progress bar, and a `@media print`
one-slide-per-page stylesheet for browser PDF export.

Outline contract: `title`/`brand` required frontmatter (`brand: rdd|bbl|mmb`), `subtitle`/
`author`/`date` optional; each `## ` heading starts a slide; consecutive `- `/`* ` lines
become a bullets block; consecutive `> ` lines become a quote block (a slide whose *only*
body content is one blockquote renders as a big centered "statement" slide); a trailing
`Notes:` paragraph becomes hidden speaker notes (`<aside class="notes" hidden>`); inline
`**bold**`/`*italic*`/`` `code` `` supported, everything else HTML-escaped. The deck always
gets an implicit title slide first, built from frontmatter.

Brand tokens (`tokens.ts`) for `rdd` (blue `#3b82f6`, read from `apps/rdd/app/globals.css`),
`bbl` (red `#e52421`, read from `apps/web/app/styles.css` `[data-brand="BBL"]`), and `mmb`
(orange `#ff6a1a`, read from `clients/mammoth-build-crm/app/globals.css`) — read, not
imported, to keep the dir standalone per the owned-paths contract.

Visual reference: studied (via `git show`, read-only, not copied) the shared-ref deck at
`origin/auto/session-0646-mmb-pitch-deck:docs/product/mammoth-build/assets/rdd-mammoth-pitch-deck.html`
for slide-shell/typography/chrome conventions (fixed `.slide` sections toggled by
`.is-active`, footer nav-cluster with counter, big display headings) — no code copied, no
import/dependency created.

## Files touched

| File | Change |
| --- | --- |
| `scripts/render-deck/index.ts` | CLI entry — `parseArgs`, `renderFile`, `main` (guarded by `import.meta.main`) |
| `scripts/render-deck/core/parse.ts` | Pure frontmatter + slide-splitting parser (no I/O) |
| `scripts/render-deck/core/parse.test.ts` | Frontmatter + slide-splitting edge-case tests |
| `scripts/render-deck/templates/deck.ts` | Pure HTML-string renderer (`renderDeck`, `renderInline`) |
| `scripts/render-deck/templates/deck.test.ts` | Render + inline-formatting/XSS-escaping tests |
| `scripts/render-deck/tokens.ts` | Brand palette/type tokens for `rdd`/`bbl`/`mmb` |
| `scripts/render-deck/tokens.test.ts` | Brand-token lookup tests |
| `scripts/render-deck/index.test.ts` | CLI `parseArgs` + `renderFile` end-to-end tests |
| `scripts/render-deck/fixtures/sample-outline.md` | Sample outline (4 slides: bullets+notes, statement quote, bullets) |
| `scripts/render-deck/fixtures/sample-outline.html` | Committed golden-fixture render output |
| `scripts/render-deck/fixtures/golden.test.ts` | Golden-fixture exact-match test |
| `scripts/render-deck/tsconfig.json` | Self-contained typecheck config (root `scripts/tsconfig.json` `include:["*.ts"]` doesn't reach subdirs — 0640-lane-proven pattern) |
| `scripts/render-deck/out/.gitignore` | Scratch-output dir marker (force-added — root `.gitignore` has a blanket `out/` rule) |
| `scripts/render-deck/README.md` | Usage, outline-format contract, structure, known-debt note |
| `docs/sprints/SESSION_0650.md` | This session record — adopted, filled at close |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun test scripts/render-deck` | `44 pass, 0 fail, 68 expect() calls` across 5 files — exit 0 |
| `bunx tsc --noEmit -p scripts/render-deck/tsconfig.json` | exit 0, no output |
| `bunx oxlint scripts/render-deck` | exit 0, no output |
| `bun scripts/render-deck/index.ts scripts/render-deck/fixtures/sample-outline.md -o scripts/render-deck/fixtures/sample-outline.html` | `render-deck: wrote 4 slides -> .../fixtures/sample-outline.html`, exit 0. Output file exists, contains the frontmatter title (`Ronin Dojo Design — Q3 Overview`) and 4 `<section class="slide` blocks (>= the required 3) |

Note: the repo-wide `bun run test` (`bun run --filter '*' test`) does NOT reach `scripts/`
at all — `scripts` isn't a `package.json` workspace member (only `apps/*`/`packages/*`
are). The lane prompt's explicit gate (`bun test scripts/render-deck`) is the correct and
only command that exercises this dir; used as specified.

## Proposed ledger edits

**G-030 note (deck-genre token duplication):** `scripts/render-deck/tokens.ts` duplicates
the brand-palette/type-token idea already prototyped in `scripts/render-doc` (unmerged,
PR #268) — deliberately, per this lane's standalone owned-paths isolation (zero imports
outside `scripts/render-deck`, no touching the frozen `scripts/render-doc/**`). Once #268
merges, consolidate the two token sets under one shared G-030 module (doc-genre + deck-genre
both need brand palette/type, and today they'll drift independently) rather than
maintaining `render-deck/tokens.ts` and render-doc's token file in parallel forever. Filing
this as a proposed ledger note for the human/merge-sweep owner to route into the G-030
epic tracking doc — not actioned in this lane (out of owned-paths scope).

## Open decisions / blockers

None. Task completed within owned-paths scope; no ambiguity encountered.

## Residual for AM merge

- PR ready for review/merge at the operator's word (never merged by this lane).
- Post-#268-merge: action the G-030 consolidation note above (route to the G-030 epic doc,
  not actioned here).

