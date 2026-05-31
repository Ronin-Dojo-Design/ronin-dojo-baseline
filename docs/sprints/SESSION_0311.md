---
title: "SESSION 0311 — Lineage Phase 3-0: RankAward.organizationId migration (awarding school)"
slug: session-0311
type: session--implement
status: closed
created: 2026-05-30
updated: 2026-05-30
last_agent: claude-session-0311
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0310.md
  - docs/petey-plan-0305.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/runbooks/database/schema-migration.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0311 — Lineage Phase 3-0: RankAward.organizationId migration (awarding school)

## Date

2026-05-30

## Operator

Brian + claude-session-0311 (operator-overseen, not autonomous — schema migration is DB-bound)

## Goal

Land lineage epic Phase 3-0: add a nullable `RankAward.organizationId` FK → `Organization` (the
school that awarded a belt), the one schema change behind the Org Chart Board's persistent-panel
promotion history (Phase 3d). Run with operator oversight per the agreed plan (DB-bound migration).

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0310.md`
- Carryover: Phase 2 (entrance stagger 0307, path trace 0308, connector grow-in 0309, hover lift
  0310) is fully merged + firefox-green on `main`. A pre-existing global `UserMenu` SSR hydration
  bug (surfaced via the firefox e2e flake) was fixed en route (#50). Phase 3-0 is the staged next slice.

### Branch and worktree

- Branch: `feat/rankaward-organization`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (after reverting 2 stale pre-session floating edits — see Decisions)
- Current HEAD at bow-in: `8db3646`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database (additive FK on `RankAward`) |
| Extension or replacement | Extension: one nullable FK + index on an existing model; no Dirstarter capability replaced |
| Why justified | Records the awarding school per promotion — the structured datum behind Phase 3d's promotion-history school links; the multi-instructor model (ADR 0016) had promoter + free-text location but no structured school |
| Risk if bypassed | Promotion provenance can't link to a real `Organization`; school stays unstructured free-text only |

Live docs checked during planning: Dirstarter Prisma path confirmed via ADR 0016's Dirstarter docs
proof table (`https://dirstarter.com/docs/database/prisma`).

## Petey plan

### Goal

Add `RankAward.organizationId` (nullable FK + index), amend ADR 0016, verify, PR with CI.

### Tasks

#### SESSION_0311_TASK_01 — RankAward.organizationId migration

- **Agent:** Cody (operator-overseen)
- **What:** Add nullable `organizationId` FK → `Organization` (ON DELETE SET NULL) + `@@index` to
  `RankAward`; add the `rankAwards` back-relation to `Organization`; `prisma migrate dev`.
- **Done means:** Migration created + applied, DB in sync, schema valid, no new typecheck errors in
  the changed area, ADR 0016 amended.
- **Depends on:** nothing

### Scope guard

- Nullable + additive only — no backfill, no data migration, no touching `awardedBy`/`location`/`PROMOTED_BY`.
- Do NOT build the Phase 3d panel consumer here (separate slice).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0311_TASK_01 | landed | `RankAward.organizationId` nullable FK + index + Organization back-relation; migration `20260531033236_add_rankaward_organization` applied (additive); ADR 0016 amended |

## What landed

- **`RankAward.organizationId`** — nullable FK → `Organization`, `ON DELETE SET NULL`, indexed; plus the
  `rankAwards RankAward[]` back-relation on `Organization`. Migration `20260531033236_add_rankaward_organization`
  created + applied locally; SQL is purely additive (ADD COLUMN nullable + CREATE INDEX + ADD FK).
- **ADR 0016 amended** with a SESSION_0311 amendment documenting the awarding-school axis (distinct
  from `awardedBy` promoter and from `Membership` affiliation); core "RankAward is canonical" decision unchanged.

## Decisions resolved

- Awarding school = structured `organizationId` (grill outcome SESSION_0306), `location` retained as fallback.
- Reverted 2 stale **pre-session** floating working-tree edits that were present at SESSION_0306 bow-in
  and never committed: `docs/sprints/SESSION_0305.md` (evidence rows deleted) and
  `scripts/capture-balkan-orgchart.ts` (emptied to 0 bytes). Restored to `main`'s correct versions —
  non-destructive (no committed work lost); they were unintended cruft that would trip the autonomous
  clean-tree brake.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | `RankAward.organizationId` FK + index; `Organization.rankAwards` back-relation |
| `apps/web/prisma/migrations/20260531033236_add_rankaward_organization/migration.sql` | New — additive migration |
| `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md` | Amendment: awarding-school link |
| `docs/sprints/SESSION_0311.md` | This session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx prisma validate` | Valid |
| `bunx prisma migrate dev` | Migration created + applied; DB in sync (no drift/reset) |
| Migration SQL review | Purely additive — `ADD COLUMN organizationId TEXT` (nullable) + index + FK `ON DELETE SET NULL`; no data loss |
| `bun run typecheck` | No new errors referencing `RankAward`/`Organization`/`organizationId`. Pre-existing, unrelated: `next.config.ts` + `resend.ts` (from SESSION_0304) and a widespread zod/react-hook-form resolver type skew (`Zod3Type` vs `$ZodType`) across several forms — pre-existing dependency-level, does not block CI (Vercel build tolerates). Filed for a dedicated look. |
| CI (PR) | Verified on the PR (Playwright + Vercel) |

## Open decisions / blockers

- **Finding (pre-existing, not 3-0):** widespread zod/RHF resolver typecheck errors (`Zod3Type` vs
  `$ZodType`) in form components — dependency-level type skew, CI-tolerated. Needs a dedicated dependency/typing pass.
- DESI-06 / DESI-07, D7 (S3 bucket) — long-standing carryovers.

## Next session

### Goal

Lineage Phase 3a — board-layout mode on `LineageTreeCanvas` + `LineageCompactChildList` (the composite
root + avatar-forward cards + inline expandable child lists — the Org Chart Board "money" cluster).
Rendering-only on existing tree data; no schema dependency. Safe to run hands-off via the auto-merge driver.

### First task

Add `layout="board"` to `LineageTreeCanvas` and build `LineageCompactChildList` (avatar + name + role
inline rows with expand carets + counts), composing existing `Card`/`Avatar`/`Badge`/`Stack`/`Button`.
Reuse `LineageVisualGroup` for the composite multi-person root card. Per `docs/petey-plan-0305.md` Phase 3.

## Review log

### SESSION_0311_REVIEW_01 — RankAward.organizationId

- **Reviewed tasks:** SESSION_0311_TASK_01
- **Dirstarter docs check:** Prisma path confirmed via ADR 0016 proof table.
- **Verdict:** Minimal, correct, additive schema slice done with operator oversight (DB-bound, not
  blind-autonomous, per the agreed plan). Nullable FK + SET NULL means zero blast radius on existing
  rows; ADR 0016 amended rather than superseded (core decision intact). The one new axis (awarding
  school) is cleanly distinct from promoter + affiliation. Stale pre-session floating cruft caught + reverted.
- **Score:** 9.3/10
- **Follow-up:** Phase 3a board layout (hands-off); dedicated zod/RHF resolver-typing pass.

## Hostile close review

- **Giddy:** pass — additive nullable FK, `ON DELETE SET NULL`, indexed; back-relation present; migration
  applied cleanly with no drift/reset; no existing code/data touched.
- **Doug:** pass — migration SQL verified additive; no new typecheck errors in the changed area;
  pre-existing zod/next.config/resend errors correctly attributed; CI-verified on the PR.
- **Kaizen aggregate:** 9.3/10 — clean schema slice, ADR discipline honored, pre-session cruft cleaned.

## ADR / ubiquitous-language check

- ADR update **done** — ADR 0016 amended (awarding-school link); core decision unchanged.
- Ubiquitous language update **not required** — `Organization`, `RankAward` are existing terms; no new
  domain vocabulary (the field names an existing relationship more precisely).

## Reflections

- Doing the schema slice with operator oversight (vs blind-autonomous) was the right call: `migrate dev`
  is interactive-by-nature and DB-bound, and the auto-merge driver's schema-guard would have stopped on
  it anyway. The migration itself was trivially safe (additive nullable), which validated that the *only*
  reason for caution was the migration *mechanics*, not the change.
- The 2 floating pre-session edits had silently ridden the working tree since SESSION_0306 bow-in. Worth
  a bow-in habit: check `git status` for pre-existing uncommitted changes and resolve them before they
  get swept into an unrelated commit or trip an autonomous brake.
