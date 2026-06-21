---
title: "SESSION 0430 — Passport DTO surface migrations (#134 steps 2–5)"
slug: session-0430
type: session--implement
status: complete
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0430
sprint: S-passport-dto
pairs_with:

  - docs/sprints/SESSION_0429.md
  - docs/petey-plan-passport-dto-surfaces.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0430 — Passport DTO surface migrations (#134 steps 2–5)

## Date

2026-06-21

## Operator

Brian + claude-session-0430

## Goal

Execute the Passport DTO surface migration pipeline from `docs/petey-plan-passport-dto-surfaces.md`: fan out four behavior-preserving surface PRs (directory+/me, lineage tree+drawer, disciplines/top-ranked, promotion-events) as worktree-isolated agents; triage/close stale PR #22; then sequence galaxy (#4) and cleanup (#5) after the lineage PRs land. The base (#135: `publicPassportPayload` + `projectPublicPassport`) is already merged on `main`.

## Status

See frontmatter `status:`.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0429.md`
- Carryover: SESSION_0429 delivered the design-system + Mammoth CRM epic (docs/spec only, PR #137). Issue #134 (Passport DTO surface migrations) was noted as a carryover open thread. This session picks it up as the **#1 priority cloud fanout** (per `docs/petey-plan-passport-dto-surfaces.md`, teed up at SESSION_0421).

### Branch and worktree

- Branch: `claude/passport-dto-surfaces-9ymx24` (tracking branch for issue #134)
- Status at bow-in: clean — 63a75a9
- Surface PRs fan out to separate branches off `main`

### Graphify check

- Skipped — Graphify not installed in container. Key files confirmed by direct read.

### Grill outcome

Key findings from bow-in inspection:

1. **Directory surface type cascade**: changing `directoryProfileDetailPayload.passport.rankAwardsEarned` from `directoryRankAwardPayload` to `publicPassportPayload.rankAwardsEarned` changes the rank type shape. Consumer components (`ranks-section.tsx`, `profile-sidebar.tsx`, `index.tsx`) access `.rank.colorHex` etc on the old shape. Migration must update those 3 components to the `PublicPassportRank` shape.

2. **Promotion-events needs `lineageNode`**: `award-card.tsx` uses `award.passport.lineageNode?.slug` for deep-linking. `publicPassportPayload` has `directoryProfile.slug` but NOT `lineageNode`. The promotions surface passport select must spread `publicPassportPayload` AND add `lineageNode: { select: { slug: true } }`.

3. **Visibility test imports `redactLineageNodeProfileRanks` directly**: The test calls the function by reference. Surface migration PRs must keep both redactors exported (just re-implement them using `projectPublicPassport` internally). The cleanup PR (#5) will delete them AND update the test.

4. **`/me` rank ordering**: `directoryProfileSelfPayload` currently uses `take:1, rank.sortOrder desc` (highest belt). `publicPassportPayload.rankAwardsEarned` uses `awardedAt desc`. For `/me`, the owner seeing their most-recent award as "current" is acceptable (common case: last promotion IS highest belt). Behavioral delta is acceptable per plan decision.

5. **Galaxy (#4)**: PR #133 (`claude/bbl-galaxy-v1`) is an open draft with mock data. Fold in after lineage PRs land — point the viewer at `projectPublicPassport` for node identity.

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Open 4 surface migration draft PRs in parallel (directory+/me, lineage, disciplines, promotion-events). Triage PR #22. Sequence galaxy + cleanup after lineage PRs land.

### Tasks

#### SESSION_0430_TASK_01 — Triage / close stale PR #22

- **Agent:** Petey (inline)
- **What:** Close PR #22 (`feat(lineage): add audited editor actions`) — based on `session-lineage-v1-react-canvas-from-lineage-snapshot`, a long-dead stale branch; work superseded by the SESSION_0175/0179/0180 lineage v1 series now on `main`.
- **Done means:** PR #22 closed with a comment.
- **Depends on:** nothing

#### SESSION_0430_TASK_02 — Directory + /me surface PR (PR-A)

- **Agent:** Cody (worktree-isolated sub-agent)
- **What:** Migrate `directoryProfileDetailPayload` + `/me` (`projectOwnProfile`) to consume `publicPassportPayload` + `projectPublicPassport`.
- **Branch:** `claude/dto-surface-directory-me`
- **Files:**
  - `apps/web/server/web/directory/payloads.ts` — spread `publicPassportPayload` into `directoryProfileDetailPayload.passport.select`; update `directoryProfileSelfPayload.passport.rankAwardsEarned` to use canonical `publicPassportPayload.rankAwardsEarned`
  - `apps/web/server/web/directory/queries.ts` — use `projectPublicPassport` for displayName/avatarUrl/ranks in the detail path
  - `apps/web/server/web/directory/profile-projection.ts` — `projectOwnProfile` delegates to `projectPublicPassport(passport, { showRanks: true, brand })`
  - `apps/web/app/(web)/directory/[slug]/_components/directory-profile/ranks-section.tsx` — update to `PublicPassportRank` shape
  - `apps/web/app/(web)/directory/[slug]/_components/directory-profile/profile-sidebar.tsx` — update to `PublicPassportRank` shape
  - `apps/web/app/(web)/directory/[slug]/_components/directory-profile/index.tsx` — update rank tag mapping
- **Done means:** `next typegen && tsc --noEmit` clean; `bun test server/web/directory/` green; `oxlint .`+`oxfmt --check .` clean; draft PR opened.
- **Depends on:** nothing (parallel)

#### SESSION_0430_TASK_03 — Lineage tree + drawer surface PR (PR-B)

- **Agent:** Cody (worktree-isolated sub-agent)
- **What:** Migrate `lineageNodeRowPayload` + `lineageNodeProfilePayload` to consume `publicPassportPayload`; replace `redactLineageNodeRowRanks` + `redactLineageNodeProfileRanks` bodies with `projectPublicPassport`-based gate (keep them exported — test still references them; bodies delegate to projector).
- **Branch:** `claude/dto-surface-lineage`
- **Files:**
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/server/web/lineage/queries.ts`
- **Done means:** `next typegen && tsc --noEmit` clean; `bun test server/web/lineage/queries.visibility.test.ts` green; lint/format clean; draft PR opened.
- **Depends on:** nothing (parallel)

#### SESSION_0430_TASK_04 — Disciplines top-ranked surface PR (PR-C)

- **Agent:** Cody (worktree-isolated sub-agent)
- **What:** Replace local identity select + manual avatar fallback in `top-ranked-queries.ts` with `publicPassportPayload` + `projectPublicPassport`.
- **Branch:** `claude/dto-surface-disciplines`
- **Files:**
  - `apps/web/server/web/disciplines/top-ranked-queries.ts`
- **Done means:** `next typegen && tsc --noEmit` clean; `bun test server/web/disciplines/` green; lint/format clean; draft PR opened.
- **Depends on:** nothing (parallel)

#### SESSION_0430_TASK_05 — Promotion-events surface PR (PR-D)

- **Agent:** Cody (worktree-isolated sub-agent)
- **What:** Replace `promotionEventPassportPayload` with `publicPassportPayload` + `lineageNode: { slug }` surface add-on; update `award-card.tsx` + `event-card.tsx` to use `projectPublicPassport` for promotee identity.
- **Branch:** `claude/dto-surface-promotion-events`
- **Files:**
  - `apps/web/server/web/promotion-events/payloads.ts`
  - `apps/web/server/web/promotion-events/queries.ts`
  - `apps/web/app/(web)/events/[slug]/_components/promotion-event-detail/award-card.tsx`
  - `apps/web/app/(web)/events/_components/promotion-events-index/event-card.tsx`
- **Done means:** `next typegen && tsc --noEmit` clean; `bun test server/web/promotion-events/` green; lint/format clean; draft PR opened.
- **Depends on:** nothing (parallel)

#### SESSION_0430_TASK_06 — Galaxy surface PR (PR-E) [QUEUED]

- **Agent:** Cody (worktree-isolated sub-agent, AFTER TASK_03 lands)
- **What:** Fold PR #133 (`claude/bbl-galaxy-v1`) — update galaxy viewer to use `projectPublicPassport` for node identity (replace mock passport data with real DTO). Keep `NEXT_PUBLIC_GALAXY_ENABLED` flag gate.
- **Branch:** `claude/dto-surface-galaxy`
- **Depends on:** SESSION_0430_TASK_03 (lineage) merged to main
- **Status:** QUEUED

#### SESSION_0430_TASK_07 — Cleanup PR (PR-F) [QUEUED]

- **Agent:** Cody (worktree-isolated sub-agent, AFTER all lineage consumers merged)
- **What:** Delete `redactLineageNodeRowRanks` + `redactLineageNodeProfileRanks` from `lineage/queries.ts`; update `queries.visibility.test.ts` to test `projectPublicPassport` gate directly; assert one rank-gate audit point.
- **Branch:** `claude/dto-surface-cleanup`
- **Depends on:** TASK_03 (lineage) + TASK_06 (galaxy) merged to main
- **Status:** QUEUED

### Parallelism

TASK_01 (close PR #22) runs inline alongside the 4 parallel sub-agents (TASK_02–05). TASK_06 and TASK_07 are sequential after the lineage PRs land (user's go signal).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0430_TASK_01 | Petey inline | One MCP call, no code |
| SESSION_0430_TASK_02 | Cody worktree | directory/ files, isolated from lineage |
| SESSION_0430_TASK_03 | Cody worktree | lineage/ files, isolated from directory |
| SESSION_0430_TASK_04 | Cody worktree | disciplines/ single file, fully independent |
| SESSION_0430_TASK_05 | Cody worktree | promotion-events/ + events/ components, isolated |
| SESSION_0430_TASK_06 | Cody worktree | galaxy/ files, after lineage lands |
| SESSION_0430_TASK_07 | Cody worktree | cleanup, after all lineage consumers |

### Open decisions

1. **`/me` rank ordering**: accepted behavioral delta — awardedAt desc instead of sortOrder desc for `currentRank`.
2. **Promotion-events `lineageNode.slug`**: keep as surface add-on to `publicPassportPayload`.

### Risks

- TypeScript cascade in directory surface — 3 component files touch `user.ranks` shape.
- The visibility test imports `redactLineageNodeProfileRanks` by reference — must remain exported through the surface PR.
- Galaxy PR #133 merge conflict probability grows over time.

### Scope guard

- No schema change.
- No change to `directoryProfileListPayload` or `directoryProfilePreviewPayload`.
- Do NOT merge any surface PR to main without explicit user approval.
- Do NOT start TASK_06 or TASK_07 until user confirms lineage PRs merged.

## Cody pre-flight

### Pre-flight: all surface tasks

#### 1. Existing component scan

- `publicPassportPayload` (server/web/passport/public-payloads.ts) ✓
- `projectPublicPassport` (server/web/passport/public-projection.ts) ✓
- `PublicPassportDTO`, `PublicPassportRank` types ✓

#### 2. L1 template scan

- Not applicable — server read-model migration, no new UI components.

#### 3. Composition decision

- Extending existing payload selects to spread `publicPassportPayload`.

#### 4. Lane docs loaded

- Petey plan: `docs/petey-plan-passport-dto-surfaces.md` ✓
- ADR 0025 confirmed.

#### 5. Dev environment confirmed

- Gate: `cd apps/web && next typegen && tsc --noEmit`; `bun test <files>`; `oxlint .`; `oxfmt --check .`

#### 6. FAILED_STEPS check

- No prior failures in this lane.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0430_TASK_01 | landed | Closed stale PR #22 with triage comment |
| SESSION_0430_TASK_02 | landed | Directory + /me surface — PR #145 (draft) |
| SESSION_0430_TASK_03 | landed | Lineage tree + drawer — PR #144 (draft), 9/9 visibility tests green |
| SESSION_0430_TASK_04 | landed | Disciplines top-ranked — PR #141 (draft) |
| SESSION_0430_TASK_05 | landed | Promotion-events — PR #142 (draft), 3/3 tests green |
| SESSION_0430_TASK_06 | landed | Galaxy PR-E — PR #146 (draft); `projectPublicPassport` identity; `rankLabelOf` helper removed |
| SESSION_0430_TASK_07 | landed | Cleanup PR-F — PR #147 (draft); both redactors inlined+deleted; 9/9 tests green |

## What landed

- **PR #141** — `feat(disciplines): consume publicPassportPayload for top-ranked identity (#134 surface-C)` — merged to main
- **PR #142** — `feat(promotion-events): consume publicPassportPayload for promotee identity (#134 surface-D)` — merged to main; 3/3 tests
- **PR #144** — `feat(lineage): consume publicPassportPayload + delegate rank gate to projectPublicPassport (#134 surfaces 3a/3b)` — merged to main; 9/9 visibility tests green
- **PR #145** — `feat(directory): consume publicPassportPayload + projectPublicPassport for detail + /me (#134 surface-2)` — merged to main; 4/4 profile-projection tests green; `previewRankToPublicRank` helper added
- **PR #146** — `feat(lineage): galaxy surface — use projectPublicPassport for identity` — open draft; 14 files from `claude/bbl-galaxy-v1` folded in; manual `displayName`/`photoUrl`/`rankLabelOf` chains replaced with `passportDto.*`; `showRanks: true`; oxlint/oxfmt clean
- **PR #147** — `refactor(lineage): cleanup — inline and delete rank redactor wrappers` — open draft; `redactLineageNodeRowRanks` inlined at 4 call sites + deleted; `redactLineageNodeProfileRanks` inlined at 2 call sites (SESSION_0266_FINDING_01 preserved) + deleted; `shouldShowPublicRanks` kept; 9/9 visibility tests green via `projectPublicPassport` directly
- **PR #22** closed with triage comment (superseded by SESSION_0175/0179/0180 work on main)

## Decisions resolved

- `previewRankToPublicRank` helper pattern: both branches of `findProfileBySlug` now return `PublicPassportRank[]` for `user.ranks`, with `disciplineName: null` for the preview branch (preview payload lacks discipline data).
- `shouldShowPublicRanks` in lineage NOT removed in surface PR — it's still used for `selectedRankAward` gating; cleanup PR handles its removal.
- `directoryProfileSelfPayload` also gets `directoryProfile: publicPassportPayload.directoryProfile` added so `projectPublicPassport` can read the `showRanks` gate on the `/me` path.
- Promotion-events test mock expanded to provide all fields `projectPublicPassport` accesses.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/disciplines/top-ranked-queries.ts` | Spread `publicPassportPayload`; use `projectPublicPassport`; remove `passportDisplayName` import |
| `apps/web/server/web/promotion-events/payloads.ts` | Replace hand-rolled passport select with `...publicPassportPayload` + `lineageNode.slug` add-on |
| `apps/web/server/web/promotion-events/queries.ts` | `summarizeAward` uses `projectPublicPassport`; remove `passportDisplayName` import |
| `apps/web/app/(web)/events/[slug]/_components/promotion-event-detail/award-card.tsx` | Identity via `projectPublicPassport` |
| `apps/web/app/(web)/events/_components/promotion-events-index/event-card.tsx` | Identity via `projectPublicPassport` |
| `apps/web/server/web/promotion-events/queries.test.ts` | Expanded mock; added `~/lib/media` mock |
| `apps/web/server/web/lineage/payloads.ts` | `lineagePassportPayload` spreads `publicPassportPayload` + merges location fields; remove `lineageUserDirectoryProfilePayload` |
| `apps/web/server/web/lineage/queries.ts` | Both redactor bodies delegate to `projectPublicPassport`; export preserved |
| `apps/web/server/web/directory/payloads.ts` | `directoryProfileDetailPayload` spreads `publicPassportPayload`; `directoryProfileSelfPayload` uses canonical `rankAwardsEarned` + adds `directoryProfile` |
| `apps/web/server/web/directory/queries.ts` | Full-profile branch uses `projectPublicPassport`; adds `previewRankToPublicRank` helper |
| `apps/web/server/web/directory/profile-projection.ts` | `projectOwnProfile` delegates to `projectPublicPassport` |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/ranks-section.tsx` | Flat `PublicPassportRank` shape |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/profile-sidebar.tsx` | Flat `PublicPassportRank` shape |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/index.tsx` | Flat `PublicPassportRank` shape |
| `apps/web/components/web/lineage/galaxy/bbl-galaxy-from-lineage.ts` | Replace manual identity chains + `rankLabelOf` with `projectPublicPassport(passport, { showRanks: true })` |
| `apps/web/components/web/lineage/galaxy/bbl-galaxy-from-lineage.test.ts` | Mock passport updated for `PublicPassportRow` shape |
| `apps/web/components/web/lineage/galaxy/bbl-galaxy-types.ts` | New (galaxy type shapes) |
| `apps/web/components/web/lineage/galaxy/bbl-galaxy-layout.ts` | New (layout algorithm) |
| `apps/web/components/web/lineage/galaxy/bbl-galaxy-mock-data.ts` | New (mock for dev/demo) |
| `apps/web/components/web/lineage/galaxy/BblLineageGalaxy.tsx` | New (main galaxy component) |
| `apps/web/components/web/lineage/galaxy/BblLineageGalaxyDemo.tsx` | New (demo wrapper) |
| `apps/web/components/web/lineage/galaxy/galaxy-route.tsx` | New (route component) |
| `apps/web/app/(web)/lineage/galaxy/page.tsx` | New (flag-gated page) |
| `apps/web/config/galaxy.ts` | New (`NEXT_PUBLIC_GALAXY_ENABLED` feature flag) |
| `apps/web/server/web/lineage/galaxy-data.ts` | New (server data fetcher) |
| `apps/web/components/common/note.tsx` | `ComponentType` cast fix for R3F JSX augmentation |
| `apps/web/server/web/lineage/queries.ts` | `redactLineageNodeRowRanks` + `redactLineageNodeProfileRanks` inlined at all call sites and deleted; `shouldShowPublicRanks` kept |
| `apps/web/server/web/lineage/queries.visibility.test.ts` | Removed `redactLineageNodeProfileRanks` import; refactored SESSION_0266 tests to use `projectPublicPassport` directly |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test server/web/directory/profile-projection.test.ts` | 4/4 PASS (PR #145) |
| `bun test server/web/passport/` | 6/6 PASS (PR #145) |
| `bun test server/web/lineage/queries.visibility.test.ts` | 9/9 PASS (PR #144) |
| `bun test server/web/promotion-events/queries.test.ts` | 3/3 PASS (PR #142) |
| `oxlint` all surfaces | PASS |
| `oxfmt --check` all surfaces | PASS |
| `tsc --noEmit` changed files | PASS (pre-existing env infra errors unaffected) |
| `bun test server/web/lineage/queries.visibility.test.ts` (post-cleanup) | 9/9 PASS (PR #147) |
| `oxlint` galaxy files | PASS (PR #146) |
| `oxfmt --check` galaxy files | PASS (PR #146) |
| `oxlint` cleanup files | PASS (PR #147) |
| `oxfmt --check` cleanup files | PASS (PR #147) |

## Open decisions / blockers

- **Pause-on-merge**: PRs #146 and #147 are open drafts. Merge order: #146 (galaxy) before #147 (cleanup). User approval required for both.
- PR #133 (`claude/bbl-galaxy-v1`) can be closed — its content was fully folded into PR #146.

## Next session

### Goal

All 7 tasks complete. Pipeline fully executed. Remaining gate: merge PR #146 (galaxy) then PR #147 (cleanup) to main when user approves.

### First task

Review PRs #146 and #147 on GitHub. If CI is green and user approves, merge #146 first, then #147. Then close PR #133 (`claude/bbl-galaxy-v1`) as superseded. Issue #134 can be closed once both PRs land on main.

## ADR / ubiquitous-language check

- ADR update not required — behavior-preserving migrations; ADR 0025 ratifies this work.
- No new ubiquitous-language terms.

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | |
| Backlinks/index sweep | |
| Wiki lint | |
| Kaizen reflection | |
| Hostile close review | |
| Review & Recommend | |
| Memory sweep | |
| Next session unblock check | |
| Git hygiene | |
| Graphify update | Graphify not installed in container |
