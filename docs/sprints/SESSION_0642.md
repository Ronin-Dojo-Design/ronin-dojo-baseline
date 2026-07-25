---
title: "SESSION 0642 — auto-claude G-013 Wave-3 (B3/C3/G2 + E1 stretch, verify-first) (overnight auto lane, wave 2)"
slug: session-0642
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0642
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0642 — auto-claude G-013 Wave-3 (B3/C3/G2 + E1 stretch, verify-first) (overnight auto lane, wave 2)

> Staged by the SESSION_0635 overnight orchestrator (wave 2, operator-directed). Adopted at lane
> start: `status` staged → in-progress → closed at bow-out. Branch:
> `auto/session-0642-curriculum-wave3`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude G-013 Wave-3 (B3/C3/G2 + E1 stretch, verify-first) — one tightly-scoped item, zero open
forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0642_TASK_01 | landed | Verify-first recon: confirmed Wave-2 (C4/C5/D3/B2, WL-P2-65/66/67, D-4) is fully landed on `main` — read `technique-graph.tsx` end-to-end, no re-work needed. |
| SESSION_0642_TASK_02 | landed | B3 — curriculum-link key-point hover peek (own commit `5a83177e`). |
| SESSION_0642_TASK_03 | landed | C3 — technique grid entrance stagger (own commit `a74842f2`). |
| SESSION_0642_TASK_04 | landed | G2 — node-modal ellipsis menu, folds AUD2-12 (own commit `f659af72`). |
| SESSION_0642_TASK_05 | skip-evidence | E1 CurriculumJourney stretch — genuine write-scope conflict, not attempted. See "Open decisions / blockers". |

## What landed

**Verify-first recon (before any build).** The lane prompt's own stale-spec hazard warning was
correct on the facts, but the referenced evidence session (SESSION_0637, "documented this") does
not exist in this worktree's history or in canonical `ronin-dojo-app` — it is presumably still
in-flight in a sibling lane. Verification was done directly against source instead: read
`apps/web/components/web/techniques/technique-graph.tsx` in full (906 lines). Confirmed shipped and
present, byte-inspected, not re-touched:

- **C4** eased zoom/fit transition (`transition-transform duration-[260ms] ease-[cubic-bezier(...)]
  motion-reduce:transition-none`, `isInteracting` drag/pinch gate) — lines ~60–64, 620–627.
- **C5** hover/selection-driven neighborhood glow (`glowSourceId`, `neighborNodeIds`,
  edge/node ring highlighting) — lines ~189–284, 664–673.
- **D3** empty state (`EmptyList` + "Show all techniques" reset on zero-match type filter) — lines
  ~779–805.
- **B2** difficulty-term tooltip glossary (`difficultyDefinitionFor`/`difficultyLabelFor` in
  `node-tooltip.ts`, `Tooltip` on the dialog's difficulty `Badge`) — lines ~833–851.
- **WL-P2-67** `FIT_ZOOM_FLOOR` bypass for `fitToView` vs the interactive `ZOOM_MIN` floor — lines
  ~55–59, 290–301.
- **D-4** cooperative two-finger touch pan/zoom (`touchPointers`, `pinchStart`,
  `distanceBetween`/`midpointBetween`) — lines ~136–144, 219–384.

Also read [`docs/epics/technique-graph-ga-fanout.md`](../epics/technique-graph-ga-fanout.md) and
[`docs/knowledge/wiki/goals-ledger.md`](../knowledge/wiki/goals-ledger.md)'s G-022 row (the current
canonical tracker — **G-013 was superseded by G-022 at SESSION_0578**; the lane prompt's "G-013"
framing is the stale part, not the item list). G-022's own progress note confirms the exact same
scope this lane was dispatched with: "**Open:** Lane A S3 (E1/B3/C3/G2) + S4 (multi-art + AUD2-4
flip)". `docs/sprints/SESSION_0583.md` (Lane A S2, the direct predecessor) additionally confirmed
**B1's tooltip contract is explicitly conforms-do-not-touch** (epic doc line 139–141) — this ruled
out modifying the existing node-hover tooltip for B3 and pointed at the real gap instead (below).

**B3 — curriculum-link key-point hover peek** (`technique-graph.tsx`, commit `5a83177e`). The node
dialog's "Curriculum links" rows showed only `title`/`courseTitle`; each linked curriculum item's
parsed key points (`keyPointsFromNotes` — already selected into `BjjTechniqueGraphNode.
curriculumItems[].keyPoints` by `graph-query.ts`, but never rendered anywhere in the dialog) is now
a text-only hover/focus tooltip peek on that row, same `Tooltip`/`TooltipTrigger`/`TooltipContent`
composition as the existing B2 difficulty tooltip. Capped at 3 points
(`CURRICULUM_KEY_POINT_PEEK_CAP`, mirrors `node-tooltip.ts`'s `KEY_POINT_CAP`). `disabled` skips the
trigger for items with no authored key points (Base UI Tooltip does not render an empty popup).

**C3 — technique grid entrance stagger** (`technique-list.tsx`, commit `a74842f2`). Each
`TechniqueCard` in the `/techniques` grid (`TechniqueList`) now renders inside a `motion.div`:
`opacity 0→1, y 6→0`, 250ms `deliberate` duration, entrance `ease-out` `[0.16, 1, 0.3, 1]` (the
repo's standing motion-system tokens, matching `motion-system.md`'s documented "List/grid item
stagger on load" pattern), 50ms/item stagger capped at 500ms total (mirrors the lineage-tree
`ENTRANCE_DELAY_CAP` idiom, kept as a small local constant rather than a cross-feature import from
`components/web/lineage/*`). The pre-existing `style={{ order }}` moved from `TechniqueCard` to the
new wrapping `motion.div` (it is the actual CSS grid item now).

**G2 — node-modal ellipsis menu, folds AUD2-12** (`technique-graph.tsx`, commit `f659af72`). Added
an ellipsis (kebab) `DropdownMenu` to the node dialog's footer — Copy link / Open in new tab — using
the same shell composition already shipped in `community-share-menu.tsx` (L1 `DropdownMenu` +
`Button` trigger, no new component). This let the fold-in fix land in the same commit: AUD2-12
flagged "Technique Detail" as wrongly styled `secondary` while it was the ONLY footer action; it is
now the one `primary` CTA, with the copy/open-in-new-tab utility actions moved behind the new menu.

**E1 stretch — not attempted.** See "Open decisions / blockers" below.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/techniques/technique-graph.tsx` | B3 curriculum-link key-point hover peek (commit `5a83177e`); G2 node-modal ellipsis menu + AUD2-12 CTA fix (commit `f659af72`). |
| `apps/web/components/web/techniques/technique-list.tsx` | C3 technique grid entrance stagger (commit `a74842f2`). |
| `docs/sprints/SESSION_0642.md` | This session record. |

No other files touched. `apps/web/components/web/curriculum/*`, `apps/web/app/(web)/curriculum/*`,
and every other write-scope-excluded path are untouched (verified: `git diff <branch-base> HEAD
--stat` shows exactly the two component files above).

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun run typecheck` (after B3-only edit) | `exit=0` |
| `bun run format:check` (after B3-only edit) | `exit=0` |
| `bun run lint:check` — grep for `technique-graph` (B3-only edit) | no match (`grep exit=1`) |
| `bun run typecheck` (after C3-only edit) | `exit=0` |
| `bun run format:check` (after C3-only edit) | `exit=0` |
| `bun run lint:check` — grep for `technique-list` (C3-only edit) | no match (`grep exit=1`) |
| `bun run typecheck` (after G2-only edit) | `exit=0` |
| `bun run format:check` (after G2-only edit) | `exit=0` |
| `bun run lint:check` — grep for `technique-graph` (G2-only edit) | no match (`grep exit=1`) |
| `bun run typecheck` (final, all 3 commits) | `exit=0` |
| `bun run lint:check` (final, all 3 commits, full repo) | `exit=0` — only pre-existing warnings in unrelated files (blog/certificate/tournament/etc. admin forms, `services/db.ts`, `hooks/use-media-action.ts`) |
| `bun run format:check` (final, all 3 commits) | `exit=0` |
| Focused `bun test <file>` for any spec touched/added | N/A — no test files exist under `components/web/techniques/*` or `app/(web)/techniques/*` (verified via `find`); none added (no new pure logic warranting a new spec beyond what's already covered by `graph-query`/`node-tooltip` tests, which are untouched). |
| Playwright / `next build` / full `bun run test` | Not run — explicitly out of scope per HARD RULES. |
| Browser/visual verification (motion timing, tooltip placement, dropdown positioning) | Not run — worktree `preview_start` is locked to canonical (memory: `preview-start-cannot-serve-worktree`); flagged below for AM merge review instead of forcing a workaround mid-lane. |

Each of the three commits was gated (typecheck + format:check + a targeted lint grep) **before**
being committed, then the full three-commit stack was re-gated together as a final check — all nine
individual gates plus the three combined gates are real, unpiped exit codes as shown above.

## Proposed ledger edits

**G-022 row correction** (`docs/knowledge/wiki/goals-ledger.md`), for the operator/Giddy sweep to
apply verbatim or adapt:

- Wave-2 remainder (C4/C5/D3/B2) + WL-P2-65/66/67 + D-4 were **already fully landed** prior to this
  lane (SESSION_0581/0583, confirmed by direct source read tonight, not re-touched).
- **Lane A S3 (B3, C3, G2) is now DONE** (SESSION_0642, three independently-gated commits
  `5a83177e`/`a74842f2`/`f659af72` on `auto/session-0642-curriculum-wave3`, pending PR review/merge).
- **E1 (CurriculumJourney scrollytelling) remains OPEN** — not attempted this lane; needs a
  follow-up session scoped to `components/web/curriculum/*` + `app/(web)/curriculum/page.tsx` (see
  below). Recommend the ledger keep E1 as its own explicit open child rather than bundling it back
  into "S3" now that B3/C3/G2 are separately closed.
- **Lane A S4** (multi-art layout expansion + AUD2-4 GA flip) is still fully open, unchanged by this
  lane.
- The lane prompt's dispatch referenced this work under "G-013" — worth a small hygiene note that
  G-013 was superseded by G-022 at SESSION_0578 (G-013's own row already says this: "the design
  waves fold into Lane A; G-013 remains the design-epic tracker"), so both row numbers are correct
  to cite, but G-022 is the one with the live "Open:" line to update.

No new WL-/D-/FS- IDs proposed — this lane didn't surface a new wiring gap, drift, or SOP miss, only
a scope/spec-currency finding (E1's write-scope conflict, captured below).

## Open decisions / blockers

- **E1 (CurriculumJourney scrollytelling) has a real write-scope conflict, not a judgment call I
  should resolve unilaterally.** Per `docs/epics/technique-graph-ga-fanout.md`'s own Lane A
  ownership section, `CurriculumJourney` belongs in `apps/web/components/web/curriculum/*` and gets
  wired into `apps/web/app/(web)/curriculum/page.tsx` — **both explicitly outside this lane's
  WRITE ONLY allowlist** (`components/web/techniques/**` + `app/(web)/techniques/**` only). Building
  a same-named "journey" component somewhere inside `techniques/**` instead (e.g. mounted on the
  `/techniques` index) would be an off-spec architecture decision about where new curriculum-facing
  content should live — exactly the kind of call this role escalates rather than silently makes.
  **Recommendation:** a follow-up lane scoped to `components/web/curriculum/*` +
  `app/(web)/curriculum/page.tsx` (mirroring this lane's read-only-reference constraint on
  `components/web/lineage/*`) to land E1 as originally specified.
- Full-suite `bun run test`, Playwright, and `next build` were not run per HARD RULES — CI remains
  the authoritative gate for those.

## Residual for AM merge

- **Visual/motion verification** (not run in-lane — worktree preview is locked to canonical):
  - B3: hover/focus a curriculum-link row in the node dialog on `/techniques/graph`, confirm the
    key-point peek tooltip positions correctly (`side="top"`) and never renders for items with zero
    parsed key points.
  - C3: load `/techniques` with a full page of results, confirm the stagger reads as a deliberate
    settle (not a jank/flash), and confirm `prefers-reduced-motion: reduce` renders the grid
    instantly with no stagger (both via OS emulation and DevTools `Emulate CSS media feature`).
  - G2: open a node dialog, confirm the ellipsis menu opens/closes correctly, "Copy link" toasts and
    actually copies an absolute URL, "Open in new tab" opens `dialogNode.href` in a new tab, and the
    "Technique Detail" button now reads visually primary (not secondary) — desktop AND mobile
    (footer is `flex-col-reverse` below `md:`, so confirm the primary CTA still lands as the more
    prominent of the two on a narrow viewport).
- **E1 follow-up lane** — see "Open decisions / blockers" above; needs its own dispatch scoped to
  `components/web/curriculum/*` + `app/(web)/curriculum/page.tsx`.
- **Keyboard parity spot-check**: B3's Tooltip trigger is a `next/link` `<Link>` (not the common
  `~/components/common/link`), so Base UI's `render` prop composition onto it is untested elsewhere
  in this codebase (no prior `TooltipTrigger render={<Link .../>}` precedent was found repo-wide) —
  low risk (Base UI's render-prop merge is a first-class, documented API, and typecheck/lint were
  clean), but worth an explicit Tab-to-the-row-then-observe-tooltip check alongside the mouse-hover
  check above.
- SESSION_0637 (cited in the dispatch as evidence for the Wave-2-already-landed claim) does not
  exist in canonical or this worktree's history — likely still in-flight in a sibling lane; once it
  lands, worth reconciling its own account of Wave-2 status against this session's direct-source
  verification (they should agree, since both point at the same shipped code).
