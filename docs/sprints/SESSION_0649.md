---
title: "SESSION 0649 — auto-claude E1 CurriculumJourney scrollytelling (G-022 Wave-3, 0642 escalation) (overnight auto lane, wave 3)"
slug: session-0649
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0649
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0649 — auto-claude E1 CurriculumJourney scrollytelling (G-022 Wave-3, 0642 escalation) (overnight auto lane, wave 3)

> Staged by the SESSION_0635 overnight orchestrator (wave 3 — continuation wave, operator-authorized).
> Adopted at lane start: `status:` flipped `staged` → `in-progress` → `closed`. Branch:
> `auto/session-0649-curriculum-journey`. Worktree: `/Users/brianscott/dev/ronin-0649`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude E1 CurriculumJourney scrollytelling (G-022 Wave-3, 0642 escalation) — one tightly-scoped item, zero open forks (or forks deliberately OPEN for the /rr lane).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0649_TASK_01 | done | Verify-first: grepped `curriculum/**` + `app/` for any existing journey/scrollytelling implementation — none found (only unrelated `/app/beta/lineage-journey`, a lineage-domain surface). Built E1 CurriculumJourney: new `apps/web/components/web/curriculum/curriculum-journey/` (pure `scene-model.ts` + `scene-model.test.ts` + `curriculum-journey-scene.tsx` [motion + reduced-motion twin] + `curriculum-journey-sequence.tsx` [entry component] + `curriculum-journey-item-card.tsx` [shared presentational card]), wired additively into `/curriculum` above `BjjCurriculumBrowser`. |
| SESSION_0649_TASK_02 | blocked (data, not code) | Runtime smoke (`curl /curriculum` → 200 + `data-curriculum-journey` ≥1) could not be satisfied end-to-end: the shared local `ronindojo_prodsnap` DB (same DB canonical + this worktree both point at) has **zero** `Course` rows matching `bjj-level-*` — `getBjjCurriculumLibrary` returns `[]`, and the **pre-existing, unmodified** `page.tsx` guard (`if (levels.length === 0) notFound()`) 404s before my `<CurriculumJourney>` JSX is ever reached. This is a seed-data prerequisite gap, not a defect in this session's diff — see "Open decisions / blockers" for the evidence and substitute verification performed. |

## What landed

- **New directory** `apps/web/components/web/curriculum/curriculum-journey/` — same shape as the Lineage
  Journey reference (`components/web/lineage/lineage-story/`): a pure, unit-tested scene-model module +
  a client sequence component + a client scene component (with its reduced-motion twin in the same file,
  mirroring `lineage-story-scene.tsx`'s two-export pattern).
- `deriveCurriculumJourneyScenes` derives one scene per belt level directly from the existing
  `getBjjCurriculumLibrary` result (no new server code, no schema change): belt name/color (sourced from
  `level.rank.colorHex` — never a hardcoded palette, never the Brand enum), level description, and up to 3
  representative items (key-pointed items ranked first via `journeyItemsForLevel`, falling back to
  curriculum order so a level never renders an empty scene).
- `CurriculumJourney` (the sequence entry point) mounts additively above `BjjCurriculumBrowser` on
  `/curriculum`. Motion: `motion/react` `useScroll` + `useTransform` only — no scroll-jacking, every
  animated property transform/opacity-only, and never hides real content (decorative-only accents clamp
  to a still-visible floor, matching the Lineage Journey's design rule).
- Reduced motion / no-JS: `useReducedMotion` (from `@mantine/hooks`) resolves `false` during SSR (same
  documented behavior as `lineage-story-sequence.tsx`), so the pre-hydration/no-JS document renders the
  motion scene tree — inert without JS, so it reads as static stacked cards with zero scroll binding.
  A hydrated client reporting `prefers-reduced-motion` swaps to `CurriculumJourneyStaticScene`, a
  zero-`motion/react` twin rendering identical content via the shared `CurriculumJourneyItemCard`.
- `data-curriculum-journey` is the stable attribute on the section root (never renamed).
- Accessibility: real heading hierarchy (page `H1` → journey `H2` → per-belt `H3` → per-item `H4`), no
  scroll-jacking, all content keyboard-reachable (no interactive elements gated behind scroll state).
- Page integration is strictly additive — `apps/web/app/(web)/curriculum/page.tsx` gained one import + one
  `<CurriculumJourney levels={levels} />` line above the existing `<Section>`; `BjjCurriculumBrowser` and
  its dialog/filter behavior are untouched.
- IMPORT BAN respected: no import from `components/web/techniques/**` anywhere in the new code.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/curriculum/curriculum-journey/scene-model.ts` | New — pure scene derivation (`deriveCurriculumJourneyScenes`, `journeyItemsForLevel`), no React. |
| `apps/web/components/web/curriculum/curriculum-journey/scene-model.test.ts` | New — 11 unit tests (bun:test) covering representative-item ranking and per-level scene derivation. |
| `apps/web/components/web/curriculum/curriculum-journey/curriculum-journey-item-card.tsx` | New — shared presentational item card (Card/CardHeader/H4/Prose), used by both scene variants. |
| `apps/web/components/web/curriculum/curriculum-journey/curriculum-journey-scene.tsx` | New — `CurriculumJourneyScene` (motion, `useScroll`+`useTransform`) and `CurriculumJourneyStaticScene` (reduced-motion twin, zero motion). |
| `apps/web/components/web/curriculum/curriculum-journey/curriculum-journey-sequence.tsx` | New — `CurriculumJourney`, the entry component: `useReducedMotion` gate + `data-curriculum-journey` section root. |
| `apps/web/app/(web)/curriculum/page.tsx` | Additive edit — one import + `<CurriculumJourney levels={levels} />` above the existing `<Section>`/`<BjjCurriculumBrowser>`. |
| `docs/sprints/SESSION_0649.md` | This file — adopted + closed. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun run typecheck` (from `apps/web`) | Exit 0. `next typegen && tsc --noEmit --pretty false` — "Types generated successfully", no errors. |
| `bun run lint:check` (from `apps/web`) | Exit 0. All warnings are pre-existing, in files outside this session's diff (confirmed via `grep -i "curriculum-journey\|curriculum/page"` on the output — 0 hits). |
| `bun run format:check` (from `apps/web`) | Exit 0 (after one `npx oxfmt` pass on the 2 files it initially flagged — `curriculum-journey-item-card.tsx`, `scene-model.test.ts` — pure whitespace/wrap, no logic change). |
| `bun test components/web/curriculum/curriculum-journey/scene-model.test.ts` (from `apps/web`, single-file per the SOP §2 exception) | Exit 0. `11 pass / 0 fail`, 14 `expect()` calls. |
| Runtime smoke: `npx next dev --turbo -p 3150`, waited for "Ready in", `curl -s -o /dev/null -w "%{http_code}" http://localhost:3150/curriculum` | **404** (not the required 200) — root-caused below, not a code defect. Sanity check `curl .../` (homepage) → **200**, confirming the dev server itself is healthy. |
| `curl -s http://localhost:3150/curriculum \| grep -c "data-curriculum-journey"` | **0** — direct consequence of the 404 above (page never reaches the `CurriculumJourney` JSX). |
| Root-cause query (read-only, via `~/services/db`, same shared local Postgres.app `ronindojo_prodsnap` DB canonical also points at) | `db.course.count({ where: { slug: { startsWith: "bjj-level-" } } })` → **0**. `discipline slug=bjj` exists, `organization slug=black-belt-legacy` exists, but **zero** `Course` rows match `bjj-level-*` (3 total `Course` rows in the DB, none of them BJJ curriculum levels). `getBjjCurriculumLibrary(Brand.BBL)` therefore returns `[]`, and the **pre-existing** `page.tsx` guard `if (levels.length === 0) notFound()` — unmodified by this session — 404s before `<CurriculumJourney>` is ever reached. |
| Substitute component-level verification (no DB, no route change) | `react-dom/server.renderToStaticMarkup(<CurriculumJourney levels={syntheticLevels} />)` run standalone (Bun, scratchpad-only script + symlinked `node_modules`/`tsconfig.json`, never written inside the repo) against a hand-built `BjjCurriculumLevelView[]` fixture matching the real query shape: rendered output contains `data-curriculum-journey="true"`, the belt name, and a representative key point — proving the full component tree (including the `motion/react`/`@mantine/hooks` client hooks) renders correctly given real data, with no runtime crash. |

## Proposed ledger edits

**`docs/knowledge/wiki/` G-022 row (grappling-arts technique-graph GA fan-out ledger)** — I did not touch
`docs/knowledge/wiki/**` (forbidden path this lane). Whoever owns that ledger should add/update the row:

> G-022 Wave 3 — E1 CurriculumJourney landed (SESSION_0649, `auto/session-0649-curriculum-journey`).
> Scroll-driven belt-journey narrative on `/curriculum`, additive above `BjjCurriculumBrowser`. Wave 3 =
> B3/C3/G2 in unmerged PR #275 (techniques) + E1 here (curriculum). E1 is verified at the component/unit
> level (typecheck, lint, format, 11/11 unit tests, standalone `renderToStaticMarkup` proof); the literal
> HTTP runtime smoke is **blocked on missing seed data**, not on code — see this session's Verification
> table and Open decisions / blockers.

## Open decisions / blockers

- **BLOCKER (data, not code) — the runtime smoke's literal acceptance criteria (`curl /curriculum` → 200 +
  `data-curriculum-journey` ≥1) could not be satisfied.** The shared local `ronindojo_prodsnap` DB (the
  same DB the canonical checkout and every worktree currently point at per `apps/web/.env`) has zero
  `Course` rows matching `bjj-level-*`. This predates this session — `/curriculum` already 404s for
  **any** visitor via the pre-existing `notFound()` guard, with or without E1. I did not attempt to fix
  this: the lane's hard rules forbid DB writes/migrations, and running `prisma/import-bbl-bjj-curriculum.ts`
  (the existing import script that would populate this data) is a DB write. Flagging for the AM
  merge/orchestrator: **someone with DB-write authorization needs to run
  `prisma/import-bbl-bjj-curriculum.ts` (or otherwise reseed BJJ curriculum courses) against the shared
  local DB**, after which the exact runtime smoke in this lane's dispatch prompt should be re-run to close
  the loop. Until then, this PR's correctness rests on typecheck/lint/format/unit-test green + the
  standalone `renderToStaticMarkup` proof (see Verification table) rather than the literal HTTP smoke.
- No design/architecture decisions were deferred — no forks intentionally left open for `/rr`.

## Residual for AM merge

- Desi motion pass via G-022 Lane A review (per dispatch instruction) — the scroll choreography here is
  deliberately modest (belt-swatch scale-in + chain-marker opacity ease, both clamped to a visible floor)
  to stay in scope; a design pass could push it closer to the Lineage Journey's more elaborate treatment
  if desired, but nothing in this session's build blocks that follow-up.
- **Re-run the runtime smoke after BJJ curriculum seed data exists** (see blocker above) — this is the one
  piece of the dispatch's acceptance criteria not literally proven end-to-end this session.
- PR carries the techniques import-ban note (no import from `components/web/techniques/**`, owned by
  unmerged #275) explicitly in its body for the merge reviewer.
