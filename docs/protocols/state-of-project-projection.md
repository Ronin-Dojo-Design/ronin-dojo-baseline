---
title: "State-of-the-Dojo Projection"
slug: state-of-project-projection
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0585
pairs_with:
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/knowledge/wiki/goals-ledger.md
  - docs/rituals/opening.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - dashboard
  - projection
  - ledgers
---

# State-of-the-Dojo Projection

A read-only "State of the Dojo" dashboard rendered from the existing ledgers + session
frontmatter — a projection, not a new store. This is **slice 1** (feed + render, SESSION_0585,
a G-023 child): a script that renders a self-contained HTML file. Slice 2 (`/app/state`, a live
in-app surface) is separately ledgered and NOT built here.

## Projection-only law

**The ledgers and session files stay the single source of truth.** This projection never
writes back to `docs/sprints/*` or `docs/knowledge/wiki/goals-ledger.md` — it only reads them.
If a number here looks wrong, the fix is in the source file, never in the renderer's output.
This mirrors the existing `/app/loop-board` + `scripts/ledger-backlog.ts` posture (same law,
same shared parsing idiom).

## Sources (the feed)

| Layer | File | What it adds |
| --- | --- | --- |
| Pure parse/classify | `scripts/lib/state-of-project-parse.ts` | Frontmatter field reader, session/goal detail types, product (brand-tab) classification, the 4-stage phase bucketer, push-gate/operator-pending/review-signal detectors. Self-contained (no `fs`, no network) — mirrors `apps/web/lib/loop-board/ledger-parse.ts`'s shape. |
| Feed CLI | `scripts/ledger-backlog.ts --json` | ADDITIVE `sessions` (frontmatter scan of `docs/sprints/SESSION_*.md`) and `goals` (G-rows from `goals-ledger.md`, reusing the ledger content that aggregator already reads) fields, alongside the pre-existing `items` array. The default (non-JSON) text output is untouched — byte-identical before/after this session. |
| Renderer | `scripts/state-of-project.ts [outPath]` | Shells to `ledger-backlog.ts --json`, renders one self-contained HTML file (inline CSS + a small vanilla-JS tab switcher, no runtime deps) to `outPath` (default `out/state-of-project.html`, gitignored — **never commit a render**). |

The lane brief's "+ `gh` (PR count)" arrives **through** the JSON feed: `ledger-backlog.ts`'s
existing live `PR` ledger rows are already sourced from `gh pr list` (G-007). The renderer
derives the open-PR count from `items.filter(i => i.ledger === "PR").length` rather than
shelling to `gh` a second time — one external call, one resilience/fallback path, not two.

## The re-render ritual (publishing is an agent step, not a script step)

1. Run `bun scripts/state-of-project.ts` (from the repo root) to refresh `out/state-of-project.html`.
2. **An agent** (not the script) publishes that HTML via the Artifact tool to get a stable,
   shareable URL. Re-publishing under the SAME artifact updates the one URL in place — this is
   the "one URL" the v3 mock review referred to (SESSION_0582 `2cc94f39…`). The script's job
   ends at "wrote a local file"; turning that file into a link the operator can open is
   deliberately a human-in-the-loop / agent-in-the-loop step, not automated (NON-GOAL for
   slice 1 — see `docs/sprints/SESSION_0585.md`).
3. Nothing in this ritual mutates a ledger. If the render surfaces something that SHOULD change
   a ledger (a stale status, a miscategorized lane), that's a normal ledger edit through the
   existing finding-router (`docs/rituals/closing.md` §6.7) — not a special-case for this tool.

## Brand tabs = skin × lane filter

Three tabs, matching the ratified v3 mock: **RDD** (the umbrella/default — anything not
classified BBL or Mammoth: platform, governance, design-system, automation…), **BBL**, **MMB**.
Each tab is a **filter**, not a merge — the RDD tab shows only rows classified `rdd`, not
"everything." Belt-ladder segment colors (white/blue/purple/black) are IDENTICAL across all
three tabs; only the accompanying **word** swaps — RDD and BBL keep the literal belt words
("White"/"Blue"/"Purple"/"Black" — BBL's whole domain is belts, RDD is the house default),
MMB shows neutral labels ("Planned"/"In flight"/"Review"/"Done"). Semantic severity colors
(good/warn/crit, used in risk-watch and card status pills) are brand-invariant EXCEPT one named
exception: BBL's `--crit` is darkened (`hsl(1 60% 34%)` vs the default `#dc2626`) so it stays
visually distinct from BBL's own crimson accent (`hsl(1 79% 51%)`) — never re-skinned to a
different hue, just shade-adjusted for contrast against that one brand's accent.

### Classification is a slice-1 heuristic, not the formal enum

Sessions already carry a formal `lane:` frontmatter short-code (`repo | rdd | bbl | mmb | bma |
usa`, ADR 0049) — `classifySessionProduct` reads it directly (`bbl`/`mmb` split out; everything
else, including the common case of NO `lane:` field on pre-ADR-0049 sessions, collapses to the
`rdd` umbrella). **Goals have no such enum yet** — G-023's Session C (`lane` facet +
`--lane=` filter on the universal ledgers, not yet started) is where that formal machinery
lands. Until then, `classifyGoalProduct` is a **keyword heuristic** over the free-text
`- **Lane:**` bullet (`mammoth` → mmb; `bbl`/`lineage`/`belt`/`technique`/`bjj`/`grappling` →
bbl; else → rdd). This is good enough to drive slice-1's tabs but will drift if goals-ledger
prose changes wording — re-verify the classifier's keyword list whenever G-023 Session C lands
the real enum, and prefer the enum over the heuristic once it exists.

## The shared phase vocabulary (belt ladder AND work board)

One 4-stage vocabulary drives both projections: **planned** (white) → **in-flight** (blue) →
**review** (purple) → **done** (black). White segments get a 1px edge (`border:1px solid
var(--line)`) so the white stage never visually disappears against the paper background (Desi's
v3-mock note).

- **Sessions:** `staged`/`open`/`pending` → planned; `in-progress` → in-flight, UNLESS the
  session body names a held push gate (`detectPushGateHeld`) → review; any `closed*` status →
  done.
- **Goals:** `open`/`proposed`/`pending` → planned; `in-progress` → in-flight, UNLESS the goal's
  body names a pending-ratification/review condition (`detectReviewSignal`) → review;
  `done`/`landed`/`shipped` → done. `dropped` goals have no natural ladder position (the mock's
  4 stops don't include one) — the renderer badges them separately and renders their ladder
  fully dim rather than inventing a 5th stop.

## Dashboard sections and their scope

- **Work board** — sessions as cards, one column per phase. Mobile order is in-flight-first
  (CSS `order`, ≤480px): triage what's moving before what's planned or already done. The
  `done` column is capped to the most recent 12 (by session number) with a "+N more" note —
  RDD alone has 300+ closed sessions; rendering the full historical archive inline defeats the
  board's purpose as a triage surface. The column header count is always the TRUE total, capped
  or not.
- **Goal belt-ladders + goal ladder table** — the same data, two projections (visual ladder,
  plain accessible table with ✓/· ticks per stage) — brand-tab scoped like the work board.
- **Risk watch** and **Needs you** — deliberately **cross-brand** (not tab-scoped). Risk-ledger
  rows carry no lane/brand classification today, and an operator wants one nagging list
  regardless of which tab happens to be open. Slice-1 simplification — revisit if/when RISK rows
  get a lane facet.
- **Needs you** derives from two signals: sessions where `pushGateHeld` is true AND the session
  is still open (`phase !== "done"` — a closed session's push gate is by definition resolved;
  its close notes routinely say "push gate held" in the past tense, which would otherwise flood
  this list with historical noise), plus goals flagged `operatorPending` (body names an
  operator-pending/ratification-pending condition).
- **Honest empties** — every section renders a plain "nothing here" sentence on zero rows,
  never a silently blank block.

## Known slice-1 gaps (named, not fixed here)

- **Goal product classification is a keyword heuristic** (see above) — will need to repoint to
  the formal `lane` enum once G-023 Session C ships it.
- **Pre-ADR-0049 sessions and any session file missing `status:` frontmatter** default to the
  `planned` phase / `rdd` product (defensive fallback, not a real signal). One concrete instance:
  `SESSION_0500.md` has no `status:` field at all, so it always reads as still-open even though
  it's historically long done (per `goals-ledger.md` G-004). Backfilling frontmatter across
  ~300 historical session files is out of scope for this slice — named here for whoever does
  that sweep.
- **`/app/state` (slice 2) is a separate, ledgered build** — this protocol covers the script-only
  feed + render; nothing here wires an in-app route.

## Regenerating

```
bun scripts/state-of-project.ts                 # writes out/state-of-project.html
bun scripts/state-of-project.ts path/to/out.html # explicit output path
```

`out/` is gitignored — the render is always regenerate-on-demand, never committed.
