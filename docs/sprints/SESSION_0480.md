---
title: "SESSION 0480 — Belt Journey Slice 3: gated belt oRPC + the ceiling invariant"
slug: session-0480
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0480
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0479.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0480 — Belt Journey Slice 3: gated belt oRPC + the ceiling invariant

> **Autonomous epic, Slice 3 of [`petey-plan-0477`](../petey-plan-0477-belt-journey-crm-epic.md).** Driven by
> `claude-session-0480` (Petey→Cody) after the Codex `auto-session-codex.sh` run stalled at Slice 3 on
> "workspace out of credits" (external). Slices 1–2 landed as PRs #177/#178; this is the stacked continuation.

## Goal

Ship the member belt oRPC — `upsertBeltMilestone` / `updateRankAwardFact` / `attach|detachMilestoneMedia` /
`deleteRankAward` — own-Passport, gated to the member's highest awarded belt (the invariant that makes
self-service safe).

## Status

Closed. Slice 3 complete; verified; committed to `auto/session-0480` for PR (stacked on `auto/session-0479`).

## What landed

- **`apps/web/server/belt/` module** — 5 `authedProcedure`s (`meta.permission = "belt.manage"`, rateLimit
  120/hr, own-Passport only, `revalidate(["/app/profile"])`):
  - `upsertBeltMilestone({ rankId, story? })` — gates `sortOrder ≤ ceiling`, upserts a self-report `RankAward`
    (`STATED`/`UNVERIFIED`) then the 1:1 `RankMilestone`.
  - `updateRankAwardFact({ rankAwardId, awardedAt?, promoter?, school? })` — **UNVERIFIED-only** (verified →
    FORBIDDEN/403); no `rankId` input (can't change a card's rank); promoter FK→`awardedByPassportId` /
    freetext→`notes`; school FK→`organizationId` / freetext→`location` + `emitSchoolLead({source:"belt-journey"})`.
  - `attach|detachMilestoneMedia` — via `MediaAttachment.rankMilestoneId`, `purpose ∈ {belt,instructor,certificate,competition}`.
  - `deleteRankAward` — **forbids the current top award** (would drop the ceiling); cascades the milestone.
- **The invariant is proven** — `belt-gate.ts` (pure predicates: `ceilingSortOrder`/`isWithinCeiling`/
  `isFactEditable`/`isTopAward`) + 25 tests (11 pure + 14 real-DB integration): cannot create/edit above
  ceiling, cannot edit a verified fact, cannot delete the top award, cannot change `rankId`, edits only own
  Passport. Integration tests ride the seeded BJJ ladder (no parallel discipline).
- `belt.manage` grant added to `USER_GRANTS` (every member may enrich their OWN belts; ownership + ceiling
  enforced per-call — a flat role can't express per-resource ownership, SOT-ADR D4).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/belt/{belt-gate,queries,schemas,router}.ts` | **NEW** — gated belt oRPC + pure invariant predicates |
| `apps/web/server/belt/{belt-gate,router.integration}.test.ts` | **NEW** — 25 invariant tests (11 pure + 14 DB) |
| `apps/web/server/router.ts` | Registered `belt` into `appRouter` |
| `apps/web/server/orpc/roles.ts` | Added `belt.manage` to `USER_GRANTS` |

## Verification

| Gate | Result |
| --- | --- |
| `tsc --noEmit` | ✅ 0 errors |
| `oxlint` / `oxfmt --check` (8 files) | ✅ clean |
| `bun run test server/belt/` (`--parallel=1`) | ✅ 25 pass / 0 fail |
| `bun run build` (app-code gate) | ✅ PASS |

## Open decisions / blockers

- **Codex out of credits** (external) — the autonomous run can resume once the operator tops up:
  `AUTO_BASE_BRANCH=auto/session-0479 scripts/auto-session-codex.sh 4`. Being driven in Claude meanwhile.
- **Adjacent debt (flagged, not fixed):** `setPassportRank` (`server/web/onboarding/actions.ts`) upserts a
  self-report `RankAward` **ungated** (no ceiling check) — a near-duplicate seam. Slice 4/5 wiring should
  converge the profile "set my belt" path onto these gated procedures.

## Next session

### Goal

**Slice 4** of `petey-plan-0477` — `BeltEditCard` + `BeltJourneyGrid` + the edit form + `CountrySelect`
(promoter/school via the resolve-or-create combobox → `emitSchoolLead`). Branch `auto/session-0481` off this one.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0480_TASK_01 | ✅ done | Gated belt oRPC (5 procedures) + `belt-gate` predicates + 25 invariant tests; `belt.manage` grant |
