---
title: "SESSION 0332 — Trophy.so rank-progression proof (no-new-schema)"
slug: session-0332
type: session--implement
status: in-progress
created: 2026-06-02
updated: 2026-06-02
last_agent: claude-session-0332
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0331.md
  - docs/petey-plan-0305.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0332 — Trophy.so rank-progression proof (no-new-schema)

## Date

2026-06-02

## Operator

Brian + claude-session-0332 (autonomous run via `scripts/auto-session.sh`)

## Goal

Land the minimal automatable Trophy.so rank-progression proof (Run 3 of the
SESSION_0328 stacked autonomous lineage plan; `docs/petey-plan-0305.md` §Phase 4
Slice 2). Build a no-new-schema **Points/Levels belt progression** (White → Black)
computed from existing `Rank` + `RankAward` data, themed by `Rank.colorHex`, plus
an **Achievements Unlocked** surface keyed off existing `RankAward` facts. Surface
both inside the existing `LineageRankHistoryTab` so the proof rides the public
lineage payload that already powers the drawer — no new server query, no new
schema, no vendor UI install.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0331.md`
- Carryover: SESSION_0331 landed Phase 3f-smaller (in-tree `LineageSearchBar`).
  The `auto/session-0332` branch is stacked on `auto/session-0331` and inherits
  the landed search bar — this session must not remove or revert it.

### Branch and worktree

- Branch: `auto/session-0332`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `e46d827`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — pure Ronin lineage-domain composition. New panel composes existing L1 `Card`/`Badge`/`Avatar`/`Stack`/`Note`/`Separator`/`Heading` primitives only; pure-function read-model lives under `apps/web/lib/lineage/`. |
| Extension or replacement | Extension: new `LineageRankProgressionPanel` rides the existing `lineageNodeProfilePayload` (additive `select` widen on `rank.rankSystem.ranks` adds `name`/`shortName`/`colorHex` — not a schema change). Wired into `LineageRankHistoryTab` above the existing per-award rows. |
| Why justified | The petey plan's Phase 4 Slice 2 calls for a Trophy.so-style "Points Levels List" + "Achievement Unlocked" surface backed by `RankAward` + `Rank` data. No L1 equivalent exists in the Dirstarter inventory; this is a Ronin-specific gamification proof. |
| Risk if bypassed | Without the proof, the Phase 4 Slice 2 plan is unverified — the open question of whether Trophy.so-style UI can ride existing schema is unanswered, and the next session would re-litigate it. |

Live docs checked during planning: not applicable — no L1 storage/payments/media/auth/Prisma change.

### Graphify check

- Graph status: current at bow-in; stats: 9004 nodes, 13937 edges, 1345 communities, 1543 files tracked.
- Queries used:
  - `trophy achievements points levels leaderboard RankAward Rank gamification GamificationEvent lineage rank progression belt promotion`
- Files selected from graph and confirmed by direct read:
  - `apps/web/prisma/schema.prisma` (`model Rank`, `model RankAward`, `model GamificationEvent`, `model GamificationEventType`)
  - `apps/web/prisma/seed-baseline-platform.ts` (existing `BELT_PROMOTION` seed with `defaultPoints: 100`)
  - `apps/web/server/web/lineage/payloads.ts` (`lineageNodeProfilePayload` already joins `rank.rankSystem.ranks`)
  - `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` (existing render of per-award rows)
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx` (`rankProgressPercent` already implements a single-percent ladder calc)
  - `apps/web/lib/lineage/canvas-model.ts` + `apps/web/lib/lineage/tree-layout.test.ts` (test pattern: `node:test` + cast-through-unknown fixtures)
- Verification note: Graphify used as navigation only; exact files read directly.

### Grill outcome

Plan-locked. Headless session, no live grill. Locked decisions inherited from
`docs/petey-plan-0305.md` (Phase 4 Slice 2) and the SESSION_0328 Run-3 brief in
`docs/runbooks/dev-environment/autonomous-sessions.md`:

1. **Reuse existing schema; do not add gamification models.** `GamificationEventType.BELT_PROMOTION` (defaultPoints: 100, system-seeded) is sufficient as the points constant; `RankAward` is the canonical achievement record; `Rank.colorHex` themes it. The plan's "Points Levels List" maps cleanly to `RankSystem.ranks` ordered by `sortOrder`, with the user's earned set computed from their `RankAward.rankId` history.
2. **Widen the payload, not the schema.** `lineageNodeProfilePayload` already pulls `rank.rankSystem.ranks` with `{id, sortOrder}` — add `name`/`shortName`/`colorHex` so the ladder can render unearned belts with canonical color. This is a Prisma `select` widening; no migration, no DB change.
3. **No vendor install.** Trophy.so/shadcn install is **not** required for this proof. The petey plan explicitly says "Compose with existing Card/Badge/Avatar/Stack primitives where possible" — and the existing L1 primitives are sufficient for a Points-Levels list + Achievement Unlocked rail.
4. **Skip leaderboard for this slice.** The plan's optional leaderboard would need an additional cross-user read model. The proof stands without it; flag as next-slice follow-up.
5. **Skip operator-only browser smoke.** Headless run — flag the visual smoke as operator-side, do not block on it.

### Drift logged

- Path drift recorded: the `docs/runbooks/dev-environment/autonomous-sessions.md` brief points at `docs/runbooks/schema-migration.md`; the live file is `docs/runbooks/database/schema-migration.md`. Read the live file; drift is already noted in the runbook itself ("Path drift note: older handoffs may say `docs/runbooks/schema-migration.md`...").

## Petey plan

### Goal

Build a no-new-schema Trophy.so-style rank-progression panel that renders inside
the existing `LineageRankHistoryTab` — a Points/Levels belt ladder + Achievements
Unlocked rail — purely from existing `Rank` + `RankAward` + `GamificationEventType`
data, with `Rank.colorHex` driving the visual theme.

### Tasks

#### SESSION_0332_TASK_01 — Widen `lineageNodeProfilePayload` (additive select)

- **Agent:** Cody
- **What:** Add `name`, `shortName`, `colorHex` to the existing nested `rank.rankSystem.ranks` select in `lineageNodeProfilePayload`. No schema change; pure additive Prisma `select` widening.
- **Steps:**
  1. Open `apps/web/server/web/lineage/payloads.ts`.
  2. Update the `ranks: { select: { id: true, sortOrder: true } }` block inside `lineageNodeProfilePayload.user.rankAwards.rank.rankSystem` to also select `name: true`, `shortName: true`, `colorHex: true`.
  3. Leave the row-payload (`lineageNodeRowPayload`) alone — only the drawer profile payload needs the wider belt-ladder shape.
- **Done means:** Prisma typegen still types the existing consumers; the new fields are available to the progression-panel.
- **Depends on:** nothing.

#### SESSION_0332_TASK_02 — Pure read-model: `lib/lineage/rank-progression.ts`

- **Agent:** Cody
- **What:** Pure functions that derive Points/Levels + Achievements Unlocked records from `RankAward[]`.
- **Steps:**
  1. Create `apps/web/lib/lineage/rank-progression.ts`.
  2. Export `BELT_PROMOTION_POINTS = 100` constant (mirrors `GamificationEventType.BELT_PROMOTION.defaultPoints` from `seed-baseline-platform.ts:203`).
  3. Export `buildBeltProgressions(awards)` → `BeltProgression[]`, one per `RankSystem` the user has any award in. Each progression carries:
     - `rankSystem: { id, name, discipline?: { name } | null }`
     - `levels: ProgressionLevel[]` (ordered by `sortOrder`), each `{ rank: { id, name, shortName, colorHex, sortOrder }, status: "earned" | "current" | "locked", awardedAt: Date | null }`
     - `currentLevelIndex: number | null`
     - `earnedCount: number`
     - `totalLevels: number`
     - `points: number` (earnedCount × `BELT_PROMOTION_POINTS`)
     The "current" level is the highest-sortOrder earned rank within the system; lower earned ranks are "earned"; higher ranks are "locked".
  4. Export `buildAchievementsUnlocked(awards)` → `AchievementUnlock[]` ordered by `awardedAt` descending. Each entry: `{ id: rankAwardId, rank: { id, name, shortName, colorHex, sortOrder }, rankSystemName, disciplineName?, awardedAt, awarderName?, organizationName?, points: BELT_PROMOTION_POINTS }`.
  5. Export `totalProgressionPoints(progressions)` → sum across all systems.
- **Done means:** Pure module, no React/Prisma imports beyond the payload type. Tested by SESSION_0332_TASK_03.
- **Depends on:** SESSION_0332_TASK_01 (widened payload type).

#### SESSION_0332_TASK_03 — Focused tests: `rank-progression.test.ts`

- **Agent:** Cody / Doug
- **What:** `node:test` unit tests for `rank-progression.ts` covering the ladder shape, earned/current/locked classification, and achievements-unlocked ordering.
- **Steps:**
  1. Create `apps/web/lib/lineage/rank-progression.test.ts`.
  2. Build minimal `RankAward[]` fixtures using `as unknown as` cast (matching the pattern in `tree-layout.test.ts`).
  3. Cover: (a) no awards → empty progression list + 0 points; (b) one award → one progression with the awarded rank as `current`, lower ranks as `locked` (NOT earned — they were never awarded), higher ranks as `locked`; only ranks AT or BELOW the highest earned rank are classifiable, and the spec is: ranks earned via `RankAward` → "earned"/"current", ranks with `sortOrder` ≤ current but never awarded → "locked", ranks above current → "locked". The current rank is the HIGHEST earned; ranks below it that were never awarded stay locked (we don't infer them).
  4. (c) multi-system: awards in two distinct `RankSystem`s yield two progressions, sorted by discipline name then system name for stable rendering.
  5. (d) `buildAchievementsUnlocked` sorts by `awardedAt` descending with null-dates pushed to the bottom.
- **Done means:** Tests pass via `cd apps/web && bun test lib/lineage/rank-progression`.
- **Depends on:** SESSION_0332_TASK_02.

#### SESSION_0332_TASK_04 — UI: `LineageRankProgressionPanel`

- **Agent:** Cody
- **What:** New component that renders the progression ladder + achievements rail, composed entirely from existing L1 primitives.
- **Steps:**
  1. Create `apps/web/components/web/lineage/lineage-rank-progression-panel.tsx`.
  2. Props: `{ profile: LineageNodeProfile }`. Internally derives `buildBeltProgressions(profile.user.rankAwards)` and `buildAchievementsUnlocked(profile.user.rankAwards)`.
  3. Layout (top to bottom):
     - Header `Stack`: `H6` "Belt Progression" + `Badge variant="primary"` showing total points (e.g. `100 pts`, `200 pts`).
     - Per progression: a `Card`-like container with the `RankSystem`/discipline title; a horizontal `Stack` of belt swatches (one per level), each rendered as a small chip themed by `Rank.colorHex`. Earned/current chips get filled background + name; locked chips get muted styling with their canonical color showing at low opacity. The current level chip gets a `Badge variant="primary"` overlay.
     - A `Note` line: "X of Y belts earned · N pts".
     - Achievements Unlocked rail: a `Stack` of cards (one per `RankAward`) using the same belt-color accent as the existing `RankAwardRow`, but with a Trophy.so-style "Achievement Unlocked" header treatment.
  4. Reduced-motion safe — no entrance animations on this surface; the ladder is static.
  5. Empty state: if no progressions (no awards), return `null` so the existing `RankAwardRow` empty-state in `LineageRankHistoryTab` continues to drive the UI.
- **Done means:** Renders cleanly inside the drawer Rank History tab; typecheck + Biome pass on the file.
- **Depends on:** SESSION_0332_TASK_02 (read-model).

#### SESSION_0332_TASK_05 — Wire panel into `LineageRankHistoryTab`

- **Agent:** Cody
- **What:** Render `LineageRankProgressionPanel` above the existing per-award rows inside `LineageRankHistoryTab`.
- **Steps:**
  1. Import `LineageRankProgressionPanel` in `lineage-rank-history-tab.tsx`.
  2. In the main `Stack`, render `<LineageRankProgressionPanel profile={profile} />` directly after the header `Stack` and before the existing `Separator`. The existing per-award list stays — the new panel is additive.
- **Done means:** No public-API change to `LineageRankHistoryTab` or `LineageProfileDrawer`; the tab now leads with the progression surface, followed by the existing rank-history list.
- **Depends on:** SESSION_0332_TASK_04.

#### SESSION_0332_TASK_06 — Full close with single push order

- **Agent:** Petey + Doug
- **What:** Run typecheck + changed-file Biome + focused tests + `bun run wiki:lint`, refresh Graphify, write the SESSION close evidence, commit (no push — runner handles push + PR per the override).
- **Done means:** All real gates pass; SESSION_0332 reflects landed state.
- **Depends on:** SESSION_0332_TASK_05.

### Parallelism

Sequential — each task depends on the prior. Single coherent slice; no sub-agent fan-out.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0332_TASK_01 | Cody | Single-file Prisma `select` widening. |
| SESSION_0332_TASK_02 | Cody | Pure-function read-model in `apps/web/lib/lineage/`. |
| SESSION_0332_TASK_03 | Cody / Doug | Focused tests for the read-model. |
| SESSION_0332_TASK_04 | Cody | New L1-composed React component. |
| SESSION_0332_TASK_05 | Cody | One import + one JSX block wire-up. |
| SESSION_0332_TASK_06 | Petey + Doug | Close gates + evidence. |

### Open decisions

None — plan-locked by `docs/petey-plan-0305.md` §Phase 4 Slice 2 + the SESSION_0328 Run-3 brief.

### Risks

- **Discoverability:** The proof rides the existing drawer Rank History tab, which the public viewer only reaches via tapping a member. Acceptable for a proof — flag as a follow-up if the operator wants the progression on the public member page (`/members/[slug]`) or on a dedicated discipline-leaderboard surface.
- **No GamificationEvent writes:** The proof reads `RankAward` directly and treats each award as 100 pts (matching the seeded `BELT_PROMOTION` defaultPoints). It does NOT create `GamificationEvent` records. The next slice (if desired) could write `GamificationEvent` rows on promotion to make the points balance durable, but the proof stands without that — the data is derived.
- **Ladder rendering for very long rank systems (BJJ has many stripes per belt):** The horizontal swatch row scales to many levels; if it overflows the drawer width, allow horizontal scroll on small viewports.

### Scope guard

- Do not add `GamificationEvent` writes or any new server action.
- Do not add `RankAward` writes (the canonical promotion fact is governed by ADR 0016 and is unchanged this slice).
- Do not install Trophy.so or shadcn vendor components.
- Do not add a leaderboard (deferred).
- Do not modify the public lineage page templates beyond the drawer — the progression rides the drawer only this slice.
- Do not revert or modify `LineageSearchBar` from SESSION_0331.

### Dirstarter implementation template

- **Docs read first:** Cody pre-flight + `docs/petey-plan-0305.md` (§Phase 4 Slice 2), `docs/runbooks/dev-environment/autonomous-sessions.md`, `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`, `docs/runbooks/database/schema-migration.md` (read — no migration is needed), `docs/protocols/cody-preflight.md`, `apps/web/prisma/schema.prisma`.
- **Baseline pattern to extend:** existing `LineageRankHistoryTab` (renders per-award rows from `LineageNodeProfile.user.rankAwards`) + L1 `Card`/`Badge`/`Avatar`/`Stack`/`Note`/`Separator`/`Heading` primitives.
- **Custom delta:** Trophy.so-style Points/Levels ladder + Achievements Unlocked rail, derived purely from existing schema data — no schema change, no vendor UI.
- **No-bypass proof:** No Dirstarter L1 primitive covers a Points/Levels gamification surface; the closest L1 patterns are the read-only `Badge` chip and the `Card` container, which are exactly what we compose with.

## Cody pre-flight

### Pre-flight: SESSION_0332_TASK_01 — Widen `lineageNodeProfilePayload`

#### 1. Existing component scan

- Graphify query used: `trophy achievements points levels leaderboard RankAward Rank gamification GamificationEvent lineage rank progression belt promotion`.
- Found: `lineageNodeProfilePayload` already pulls `rank.rankSystem.ranks` with `{id, sortOrder}`; `lineageNodeRowPayload` keeps its narrow shape; the drawer's `rankProgressPercent` already reads `rankSystem.ranks` for a single-percent calc.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes — this is a server-payload select edit, not a component change.
- Closest L1 pattern: existing Prisma-select widening pattern used throughout `payloads.ts`.

#### 3. Composition decision

- Extending: `lineageNodeProfilePayload` (additive select widen). No new server file.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes — SESSION_0331's "Next session" block + the SESSION_0328 Run-3 brief.
- ADR read: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md` (RankAward stays canonical; this slice consumes the existing promotion facts).
- Runbook consulted: `docs/runbooks/database/schema-migration.md` (read; confirmed no migration needed).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (not run — autonomous run; operator-side smoke deferred).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: deferred to operator-side smoke.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0024 (cwd guard — passed at bow-in, `pwd` + `git remote -v` confirmed); FS-0020 (Graphify-first — followed); FS-0001/FS-0008 (L1 reuse — all primitive APIs spot-checked).

### Pre-flight: SESSION_0332_TASK_02 — Pure read-model `lib/lineage/rank-progression.ts`

#### 1. Existing component scan

- Graphify query used: same as TASK_01.
- Found: `apps/web/lib/lineage/canvas-model.ts` + `tree-layout.ts` (existing pure-function modules); `tree-layout.test.ts` (matching test pattern); no existing `rank-progression` or `gamification` module under `apps/web/lib/`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes — pure read-model modules live under `apps/web/lib/<domain>/` per existing convention. No L1 primitive applies.
- Closest L1 pattern: `apps/web/lib/lineage/tree-layout.ts` (pure function + sibling `.test.ts`).

#### 3. Composition decision

- New module — no L1 match exists for "compute points/levels from RankAward". Justified: this is the entire premise of the proof.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: ADR 0016 (RankAward canonical).
- Runbook consulted: `docs/runbooks/domain-features/lineage-hub.md` is the cross-reference; lineage-hub is informational and does not constrain this slice.

#### 5. Dev environment confirmed

- Test runner: `cd apps/web && bun test` (matches `tree-layout.test.ts` convention).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.

#### 6. FAILED_STEPS check

- Prior failures: none specific to this lane. General FS-0001/FS-0008 (L1 reuse) — not applicable to a pure-function module.

### Pre-flight: SESSION_0332_TASK_04 — `LineageRankProgressionPanel`

#### 1. Existing component scan

- Graphify query used: same as TASK_01 + scoped Bash `find` for `gamif`/`achievement`/`trophy`/`level*progression` (returned only schema/seed/runbook docs — no existing gamification UI components).
- Found: `LineageRankHistoryTab` is the existing render of per-award rows; `LineageProfileDrawer` carries the belt-progress header bar (`rankProgressPercent`); no existing progression-ladder component.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Closest L1 pattern: composition of `Card` + `Badge` + `Stack` + `Note` (no progression-specific L1 primitive exists).
- Primitive API spot-check (from `components/common/`):
  - `Badge` — `variant: 'primary'|'soft'|'outline'|'success'|'caution'|'warning'|'info'|'danger'`, `size: 'sm'|'md'|'lg'`, `prefix`, `suffix`, `children`.
  - `Stack` — `size: 'xs'|'sm'|'md'|'lg'`, `direction: 'row'|'column'`, `wrap`.
  - `H6` (heading) — wraps `h6` with typographic tokens.
  - `Note` — small muted-text wrapper.
  - `Separator` — horizontal divider.

#### 3. Composition decision

- New component — `LineageRankProgressionPanel`. Justified: no L1 equivalent for a Points/Levels gamification ladder; the closest L1 primitives are `Card`, `Badge`, `Stack`, `Note`, which are what this composes.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: ADR 0016 (RankAward canonical — re-confirmed; this slice does not change provenance, it derives a read view).
- Runbook consulted: `docs/runbooks/design/motion-system.md` (reviewed — no animation added on this surface; static ladder is reduced-motion-safe by construction).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (not run; operator-side smoke deferred).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: deferred to operator-side smoke.

#### 6. FAILED_STEPS check

- Prior failures: FS-0001/FS-0008 (L1 reuse) — all composed primitives' APIs spot-checked above.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0332_TASK_01 | landed | Widened `lineageNodeProfilePayload.user.rankAwards.rank.rankSystem.ranks` select to include `name`, `shortName`, `colorHex` (previously `{id, sortOrder}` only). Pure additive Prisma `select`; no schema change. `bunx prisma generate` confirmed the widened type. |
| SESSION_0332_TASK_02 | landed | Added `apps/web/lib/lineage/rank-progression.ts` exporting `BELT_PROMOTION_POINTS = 100` + `buildBeltProgressions`, `buildAchievementsUnlocked`, `totalProgressionPoints`. Pure functions; one accumulator per `RankSystem`; highest-`sortOrder` earned rank classified as `"current"`; lower earned ranks `"earned"`; never-awarded ranks `"locked"`. Achievements rail ordered by `awardedAt` desc with null dates pushed to bottom. Progressions sorted by discipline name then system name for stable rendering. |
| SESSION_0332_TASK_03 | landed | Added `apps/web/lib/lineage/rank-progression.test.ts` (8 tests across `buildBeltProgressions`, `buildAchievementsUnlocked`, `totalProgressionPoints`) — covers empty awards, single-belt classification, multi-belt earned/current ordering, multi-system grouping/sort, skipped-rank locked invariant, achievements date-desc sort, null-date sink-to-bottom, and cross-system points sum. All 8 pass via `bun test lib/lineage/rank-progression`. |
| SESSION_0332_TASK_04 | landed | Added `apps/web/components/web/lineage/lineage-rank-progression-panel.tsx`. Composes L1 `Badge`/`Stack`/`H6`/`Note`/`Separator` plus `lucide-react` `TrophyIcon`/`SparklesIcon`. Header shows total points across systems. Per system: a ProgressionRow with the belt-ladder chip strip (themed by `Rank.colorHex`; current chip ringed in `primary` with a "now" badge; locked chips dashed-bordered at 60% color opacity). Achievements rail: one card per `RankAward`, `Rank.colorHex` left bar + "Achievement Unlocked" `Badge variant="primary"` + `+100 pts` `Badge variant="outline"`. Returns `null` when no awards; `role="img"` + `aria-label` on each progression chip for screen-reader semantics. |
| SESSION_0332_TASK_05 | landed | `LineageRankHistoryTab` now imports `LineageRankProgressionPanel` and renders it at the top of the tab's main `Stack`, before the existing `Separator` + per-award rows. No public-API change on the tab; no change to `LineageProfileDrawer`'s prop contract. |
| SESSION_0332_TASK_06 | landed | Close gates green: typecheck (`bun run typecheck`), changed-file Biome (`./node_modules/.bin/biome check` on the 5 touched files), focused tests (`bun test lib/lineage/rank-progression` — 8/8 pass), `bun run wiki:lint` (0 errors, 3 pre-existing warnings unchanged). Wiki index + custom-component inventory updated. Graphify refreshed pre-commit. Single-commit close per FS-0025. |

## What landed

- **Payload widen (additive `select`):** `apps/web/server/web/lineage/payloads.ts` — the existing nested `ranks` select inside `lineageNodeProfilePayload.user.rankAwards.rank.rankSystem` now pulls `name`, `shortName`, and `colorHex` alongside `id` + `sortOrder`. No schema migration; pure widening so the belt ladder can render unearned levels with their canonical names + colors.
- **New pure read-model:** `apps/web/lib/lineage/rank-progression.ts` — `BELT_PROMOTION_POINTS = 100` (mirrors the seeded `GamificationEventType.BELT_PROMOTION.defaultPoints` from `seed-baseline-platform.ts:203`); `buildBeltProgressions(awards)` returns one `BeltProgression` per `RankSystem` the user has any `RankAward` in, with all ladder levels classified `earned`/`current`/`locked`; `buildAchievementsUnlocked(awards)` returns one record per `RankAward` ordered newest-first; `totalProgressionPoints(progressions)` sums points across all systems. Module is pure, takes the payload type as input, and has no React or Prisma dependency.
- **New focused tests:** `apps/web/lib/lineage/rank-progression.test.ts` — 8 `node:test` cases covering empty awards, single-belt current classification, multi-belt earned/current ordering, multi-system grouping + discipline-name sort, skipped-rank locked invariant (Black awarded with no Brown stays Brown=locked), achievements date-desc sort, null-date sink-to-bottom, and cross-system points sum. `bun test lib/lineage/rank-progression` → 8/8 pass in ~50ms.
- **New UI:** `apps/web/components/web/lineage/lineage-rank-progression-panel.tsx` — composes L1 `Badge`/`Stack`/`H6`/`Note`/`Separator` + `lucide-react` `TrophyIcon`/`SparklesIcon`. Two surfaces: (1) Points/Levels belt ladder per `RankSystem` themed by `Rank.colorHex` (earned, current, locked statuses with visual differentiation; current chip ringed primary + "now" badge); (2) Achievements Unlocked rail listing each `RankAward` as an themed card with "+100 pts" badge. Static surface — reduced-motion safe by construction.
- **Wire-up:** `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` — imports `LineageRankProgressionPanel` and renders it at the top of the tab's main `Stack`. No public-API change.
- **Wiki:** index + custom-component inventory updated. `LineageRankProgressionPanel` row added under the Lineage public surfaces table; `LineageRankHistoryTab` entry annotated with the new lead surface.

## Decisions resolved

- **No new schema.** `GamificationEventType.BELT_PROMOTION` (defaultPoints: 100, system-seeded) is sufficient as the points constant; `RankAward` is the canonical achievement record; `Rank.colorHex` themes it. The plan's "Points Levels List" maps cleanly to `RankSystem.ranks` ordered by `sortOrder`, with the user's earned set computed from their `RankAward.rankId` history. No `GamificationEvent` writes — the proof is purely derivative.
- **Widen the payload, not the schema.** `lineageNodeProfilePayload` already pulled `rank.rankSystem.ranks` with `{id, sortOrder}` for the existing `rankProgressPercent` helper in the drawer header; widening to also pull `name`, `shortName`, `colorHex` is the minimum needed to render unearned belts with canonical theming. This is a Prisma `select` widening; no migration.
- **No vendor install.** The petey plan explicitly says "Compose with existing `Card`/`Badge`/`Avatar`/`Stack` primitives where possible." All proof surfaces compose L1 primitives — no `components.json`, no `npx shadcn add`, no Radix dependency drift.
- **Skipped ranks stay locked, not auto-filled.** If a user has Black with no Brown award, the ladder shows White/Blue/Purple/Brown as `locked` and Black as `current`. We do not invent intermediate `earned` states the data doesn't support — `RankAward` is the canonical promotion fact (ADR 0016) and the proof respects that.
- **Leaderboard deferred.** The plan's optional leaderboard would need a cross-user query (top earners by rank/points within a discipline) and a public placement decision. The proof stands without it; flag as next-slice follow-up.
- **Operator browser smoke deferred.** Headless run — flagged as operator-only, not blocking.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/lineage/payloads.ts` | Widened nested `ranks` select inside `lineageNodeProfilePayload.user.rankAwards.rank.rankSystem` to include `name`, `shortName`, `colorHex` (additive — no schema change). |
| `apps/web/lib/lineage/rank-progression.ts` | New: pure read-model. `BELT_PROMOTION_POINTS`, `buildBeltProgressions`, `buildAchievementsUnlocked`, `totalProgressionPoints` + types. |
| `apps/web/lib/lineage/rank-progression.test.ts` | New: 8 `node:test` cases for the read-model. |
| `apps/web/components/web/lineage/lineage-rank-progression-panel.tsx` | New: Trophy.so-style progression panel composing L1 primitives + `lucide-react` icons. |
| `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` | Import + JSX wire-up — renders `LineageRankProgressionPanel` at the top of the tab before the existing per-award rows. |
| `docs/sprints/SESSION_0332.md` | New SESSION ledger. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0332 row; refreshed `updated` + `last_agent`. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Added `LineageRankProgressionPanel` row; annotated `LineageRankHistoryTab` with the new lead surface; refreshed `updated` + `last_agent`. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pwd && git remote -v` | FS-0024 guard pass: cwd `/Users/brianscott/dev/ronin-dojo-app`, remote `Ronin-Dojo-Design/ronin-dojo-baseline`. |
| `cd apps/web && bunx prisma generate` | Pass: regenerated Prisma client to `./.generated/prisma` (1.55s). Confirms the widened `ranks` select compiles. |
| `cd apps/web && bun run typecheck` | Pass: `next typegen` then `tsc --noEmit --pretty false` both exit 0. |
| `cd apps/web && bun test lib/lineage/rank-progression` | Pass: 8/8 tests across `buildBeltProgressions`, `buildAchievementsUnlocked`, `totalProgressionPoints` in ~50ms. |
| `./apps/web/node_modules/.bin/biome check <changed files>` | Pass: 0 errors after one applied formatting pass + one `role="img"` addition on the progression chip span (initial run flagged `aria-label` without role). |
| `bun run wiki:lint` | Pass: 0 errors, 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`) — unchanged from SESSION_0331. |
| Browser proof (operator-only) | Deferred: open `/lineage/<slug>` → tap a multi-belt member (e.g. a seeded Coral Belt or Black Belt in the BJJ trees) → switch to Rank History tab → confirm the progression ladder renders with correct belt colors, the current-belt marker lands on the highest earned rank, and the achievements rail shows newest-first with "+100 pts" badges. The drawer's existing header progress bar (which already uses the same `rankSystem.ranks` join) continues to render unchanged. |
| `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` | Ran pre-commit per FS-0025; stats reported in `Full close evidence` below. |

## Open decisions / blockers

- Operator-side device smoke: open `/lineage/<treeId>`, select a member with a multi-belt history (e.g. a Coral Belt or Black Belt from the seeded BJJ trees), switch to the Rank History tab, and confirm the progression ladder + achievements rail render with correct belt colors and the current-level marker on the highest earned rank. Flagged operator-only — not blocking.
- Leaderboard surface (Phase 4 Slice 2 optional sub-feature): deferred to a follow-up slice. Needs a cross-user query (top earners by rank/points within a discipline) and a public placement decision.

## Next session

### Goal

After the rank-progression proof lands, the next automatable slice should pick
between (a) the Phase 4 Slice 2 leaderboard sub-feature (cross-user query +
public placement), (b) the Phase 4 Slice 3 lineage-overlay gamification
(Achievement Grid + Points Chart over the tree canvas), or (c) the Phase 3f-PDF
export deferred from SESSION_0331. Pick by Petey grill at next bow-in.

### First task

Bow in against `docs/petey-plan-0305.md` §Phase 4 Slice 2/3 or §Phase 3f-PDF.
If the operator confirms the Trophy.so proof renders correctly in the drawer,
the next slice is either the leaderboard (additional cross-user read model,
no schema change needed if it derives from `RankAward` data) or a public-page
hoist that exposes the progression panel outside the drawer.

## Review log

### SESSION_0332_REVIEW_01 — Trophy.so rank-progression proof

- **Reviewed tasks:** SESSION_0332_TASK_01 → SESSION_0332_TASK_06
- **Dirstarter docs check:** not applicable — no L1 storage/payments/media/auth/Prisma area touched.
- **Verdict:** Pass. The slice executes the petey-plan-0305 Phase 4 Slice 2 brief at minimum surface: a no-new-schema Trophy.so-style proof composed entirely of existing L1 primitives + a pure read-model module. The payload widen is the smallest possible addition (one nested `select` block, three fields, no migration). The read-model has thorough unit coverage (8 cases including the trickiest "skipped-rank stays locked" invariant). The UI returns `null` on the empty state, so the existing `LineageRankHistoryTab` empty-state UX still leads when a user has no awards. No `GamificationEvent` writes, no `RankAward` mutations, no schema delta — the proof is a pure read-view.
- **Score:** 9.5/10
- **Follow-up:** Operator browser smoke against a multi-belt seeded profile; consider hoisting the panel to the public member page (`/members/[slug]`) once the visual is approved; the leaderboard sub-feature is the next slice.

## Hostile close review

### SESSION_0332 — Trophy.so rank-progression proof

- **Giddy:** Pass. No schema change, no migration, no new server action, no new API route. The widened `select` only reads three additional columns from the `Rank` table that were already in the schema (`name`, `shortName`, `colorHex`); no PII, no permission-gated surface added. The progression panel reads only the public-lineage `LineageNodeProfile` payload that already powers the drawer; no information leak.
- **Doug:** Pass. Typecheck green; 8/8 focused unit tests green; changed-file Biome green after one auto-applied formatting pass + one ARIA fix (`role="img"` on the chip span). The read-model uses pure functions over the payload type, so it tests in isolation without needing Prisma or React. The `BELT_PROMOTION_POINTS = 100` constant is wired explicitly to the seeded `GamificationEventType.BELT_PROMOTION.defaultPoints` — if that seed value ever changes, the points constant has a clear single-source-of-truth comment in the module header.
- **Desi:** Pass. The panel reuses the same visual idiom as the existing `RankAwardRow` (`Rank.colorHex` left bar, themed background) and composes the same L1 primitives that drive the rest of the drawer, so the Rank History tab reads as a coherent stack: ladder → divider → existing per-award rows. The progression chip's locked state (dashed border + 60% opacity color tile) gives the unearned belts a clear "ghost" treatment while still surfacing canonical colors. The current-rank chip's primary ring + "now" badge is unambiguous. Reduced-motion safe by construction — no animations on this surface.

### Findings (severity ≥ medium)

None.

### Kaizen aggregate

9.5/10 — the slice meets the brief's hard constraints (no new schema, reuse existing facts, compose existing primitives, skip operator smoke) and produces a complete two-surface Trophy.so proof. The remaining 0.5 is operator-side browser smoke and the open question of whether the panel should also be hoisted to the public member page (`/members/[slug]`) — both flagged as follow-ups, neither blocking.

#### Kaizen questions

- **Safe and secure?** Yes. No new permission surface, no new server action, no new write path. Pure read-side derivation over already-public payload data.
- **Failed steps prevented?** FS-0020 (Graphify-first): followed. FS-0024 (cwd guard): followed at bow-in and before commit. FS-0025 (single close commit): followed. FS-0001/FS-0008/FS-0014 (L1 reuse): all composed primitives' APIs spot-checked in the per-task pre-flights. FS-0017 (root `bun run lint` is broken/accepted-risk): not invoked — used `bun run typecheck` + changed-file Biome instead, per the session override.
- **Scale confidence:** 100: 9.5/10, 1,000: 9.4/10, 10,000: 9.0/10. The read-model is O(N awards) with a per-system `Map`; runs in microseconds for any realistic profile. At 10,000 awards on one profile (impossible in practice — would require 10,000 distinct rank promotions), the linear scan plus map insert would still complete in well under a single render frame.

## ADR / ubiquitous-language check

- ADR update **not required**. The slice does not change the lineage promotion source-of-truth contract (ADR 0016) — `RankAward` remains the canonical promotion fact, and this proof is a pure read-side derivation. No new domain term introduced; "belt progression" and "achievement unlocked" are presentation-layer phrasings, not ubiquitous-language additions.
- Ubiquitous language update **not required**. No new domain terms.
- Custom component inventory: add `LineageRankProgressionPanel` row at bow-out.

## Reflections

- The existing `lineageNodeProfilePayload` already carried the entire `rank.rankSystem.ranks` ladder (with `id` + `sortOrder`) precisely because the drawer's header progress-bar (`rankProgressPercent`) had needed it since SESSION_0314. That meant the Trophy.so proof was *already 90% wired* — the only missing piece was three extra fields (`name`/`shortName`/`colorHex`) on the same nested select. The lesson is the one SESSION_0331 also pointed at: search for the prior-art payload before reaching for a new server query. The "no new server query" line in the petey plan turned out to be literal.
- `GamificationEvent` writes were explicitly *not* the proof. The petey-plan-0305 brief said "data: `RankAward` + `Rank` models provide the progression data," and the SESSION_0328 Run-3 brief said "reuse existing `GamificationEventType` ... or explicitly justify why they are insufficient." The cleanest justification is also the smallest scope: treat `RankAward` as the canonical achievement record (which it already is per ADR 0016) and derive points by multiplying the per-award `BELT_PROMOTION.defaultPoints`. No writes needed; the read view is the proof.
- The "skipped-rank stays locked" invariant is the subtle correctness gate. If a member's seed history shows Black with no Brown award (which can absolutely happen with imported legacy data), the ladder must *not* invent a Brown earned state — `RankAward` is the source of truth. The test case (`preserves earned status when the user skipped a rank`) pins this; a future contributor reading the ladder code would naturally want to write a "fill in below current" loop and that test would catch it.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log contains SESSION_0332_TASK_01 → SESSION_0332_TASK_06, all `landed`. |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0332.md` created with current frontmatter (`last_agent: claude-session-0332`); `docs/knowledge/wiki/index.md` + `docs/knowledge/wiki/custom-component-inventory.md` updated in-place (`updated: 2026-06-02`, `last_agent: claude-session-0332`). |
| Backlinks/index sweep | Wiki index now lists SESSION_0332; SESSION `pairs_with` SESSION_0331 + petey-plan-0305 + autonomous-sessions runbook + ADR 0016. |
| Wiki lint | `bun run wiki:lint` returned 0 errors, 3 pre-existing warnings unchanged from SESSION_0331. |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | `SESSION_0332` block present above; no findings ≥ medium. |
| Review & Recommend | Next-session goal + first task written; candidate slices: Phase 4 Slice 2 leaderboard, Phase 4 Slice 3 lineage-overlay gamification, or Phase 3f-PDF export. |
| ADR / ubiquitous-language check | Not required this slice (pure read-side derivation; no provenance / domain-term change). |
| Memory sweep | No operator-memory update needed; the rank-progression read-model + panel pattern is documented in the custom-component inventory entry and this SESSION's Reflections. |
| Next session unblock check | Next agent inherits a clean `auto/session-0332` tip with the SESSION_0331 search bar still landed and the Phase 4 Slice 2 proof landed; leaderboard, overlay gamification, and PDF export are all unblocked. |
| Git hygiene | FS-0024 guard passed at bow-in and before commit (`pwd` + remote verified). Single commit per FS-0025; runner handles push + PR per the session override. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the close commit; stats after refresh: 9018 nodes, 13993 edges, 1367 communities, 1546 files tracked. |
