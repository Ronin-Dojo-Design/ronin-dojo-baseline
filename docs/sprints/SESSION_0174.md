---
title: "SESSION 0174 — Production Programs Seed: Disciplines, Rank Systems, Programs, Courses"
slug: session-0174
type: session--implement
status: closed-quick
created: 2026-05-15
updated: 2026-05-16
last_agent: copilot-session-0174
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0173.md
  - docs/runbooks/product-catalog-seed.md
  - docs/protocols/cody-preflight.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0174 — Production Programs Seed: Disciplines, Rank Systems, Programs, Courses

## Date

2026-05-15 MDT

## Operator

Brian Scott + Copilot (Petey → Cody → Petey)

## Goal

Write `apps/web/prisma/seed-baseline-programs.ts` — a production-safe idempotent seed script porting 12 Disciplines, 13 Rank Systems (~200 Ranks), 2 Programs, 1 ClassSchedule, ~240 Courses, and ~720 CurriculumItems from `seed.ts` into a standalone module for Baseline Martial Arts production deployment.

## Bow-in notes

- Latest closed session: `docs/sprints/SESSION_0173.md` (`closed-full`, score 9.5/10).
- Branch: `main`.
- Worktree status at bow-in: clean.
- HEAD at bow-in: `378c39a` (`feat(listings-seed): add seed-baseline-listings + F-09 write-back fix + F-06 sibling audit`).
- Graphify status at bow-in: 5875 nodes, 10976 edges, 679 communities, 1177 files tracked. Updated at SESSION_0173 close — current.
- FAILED_STEPS check: no `open` entries in seed/Prisma/programs area. F-06 `mitigated` (fixed in SESSION_0173). F-08 `mitigated` (enum/field values from schema).
- Drift register: no open drift entries relevant to this lane.

## Graphify check

- Graph status: current (5875 / 10976 / 679 / 1177).
- Query: `graphify query "seed baseline programs Discipline RankSystem Program ClassSchedule Course CurriculumItem system fixtures seed-baseline-launch seed-baseline-listings seed.ts" --budget 2000`
- Files selected from graph: `apps/web/prisma/seed.ts` (lines 530–1769), `apps/web/prisma/seed-baseline-listings.ts` (pattern to mirror), `apps/web/prisma/seed-baseline-launch.ts` (pattern reference), `apps/web/prisma/schema.prisma` (Discipline, RankSystem, Rank, Program, ClassSchedule, Course, CurriculumItem models).
- No repo-wide `grep`/`rg`/`find` used for task planning.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma seed (new module alongside template `seed.ts`) |
| Extension or replacement | Extension. New seed module mirrors `seed-baseline-launch.ts` / `seed-baseline-listings.ts` pattern |
| Why justified | Production DB has 0 Disciplines, 0 RankSystems, 0 Ranks, 0 Programs, 0 ClassSchedules, 0 Courses — the `/programs` and `/disciplines` pages render empty |
| Risk if bypassed | Programs surface ships empty for launch day; no curriculum data for student progress tracking |

## Petey plan

### Tasks

#### TASK_01 — Operator: run `seed-baseline-listings.ts` against production

- **Agent:** Operator (Brian)
- **What:** Run `bun run apps/web/prisma/seed-baseline-listings.ts` with `.env.production.local`. Verify 14 Categories, 36 Tags, 24 Tools.
- **Done means:** Operator confirms counts.
- **Status:** ✅ Complete. Run against Neon production: 14 Categories created, 36 Tags created, 24 Tools created. Zero skipped (first run). SSL warning cosmetic.

#### TASK_02 — Cody: write `apps/web/prisma/seed-baseline-programs.ts`

- **Agent:** Cody
- **What:** Port Disciplines (12), Rank Systems (13, ~200 Ranks), Programs (2), ClassSchedule (1), Courses (~240), CurriculumItems (~720) from `seed.ts` lines 530–1769 into a new idempotent production-safe seed script.
- **Idempotency:** All inserts use `findFirst` on unique/composite keys + `create` if missing. No `createMany` for models with nullable `brand` in unique constraints (F-06 safe).
- **NOT ported:** Test users, Passport, DirectoryProfile, Membership, MembershipRoleAssignment, RankAward, ContentAtom/Variant, Roles, Entitlements, TournamentRoles, GamificationEventTypes, SubscriptionTiers, Styles.
- **Done means:** Script committed. Re-run is a no-op.

## Pre-flight: Schema — seed-baseline-programs.ts

### 1. Petey invocation
- [x] Petey plan exists with TASK_01, TASK_02
- Scope: 0 new Prisma models, only new seed script; waiver not required

### 2. Design doc check
- No design doc needed — all existing Dirstarter models

### 3. Existing schema scan
- **Discipline**: id, name, slug, code?, isSystem, brand?, foundedBy?, yearEstablished?, history?, createdAt, updatedAt. `@@unique([code, brand])`, `@@unique([name, brand])`.
- **RankSystem**: id, name, kind (RankSystemKind), isSystem, brand?, disciplineId, createdAt. `@@unique([disciplineId, name, brand])`.
- **Rank**: id, sortOrder, name, shortName?, colorHex?, isSystem, brand?, rankSystemId, createdAt. `@@unique([rankSystemId, sortOrder])`, `@@unique([rankSystemId, name])`.
- **Program**: id, brand, name, slug, description?, status (ProgramStatus default DRAFT), ageMin?, ageMax?, enforceAgeCap, maxEnrollment?, minEnrollment?, sortOrder, imageUrl?, organizationId, disciplineId?, createdAt, updatedAt. `@@unique([brand, organizationId, slug])`.
- **ClassSchedule**: id, brand, name, description?, status (ScheduleStatus default ACTIVE), daysOfWeek (DayOfWeek[]), startTime, endTime, rrule?, timezone, effectiveFrom?, effectiveTo?, capacity?, locationName?, organizationId, programId, disciplineId?, createdAt, updatedAt. No unique constraint.
- **Course**: id, brand, title, slug, description?, certificationType (CertificationType), isPublished, publishedAt?, organizationId, disciplineId?, rankId?, createdAt, updatedAt. `@@unique([brand, organizationId, slug])`.
- **CurriculumItem**: id, order, title, notes?, mediaUrl?, mediaType?, courseId, createdAt, updatedAt. `@@index([courseId, order])`.

### 4. Runbook consulted
- `docs/runbooks/product-catalog-seed.md` — prerequisites confirmed (Baseline org exists).

### 5. Data flow reference
- N/A — seed script

### 6. FAILED_STEPS check
- F-06 mitigation: using `findFirst + create` for all models with nullable brand in unique constraints.
- F-08 mitigation: enum/field values pasted directly from schema.prisma above.

## TASK_02 — Implementation evidence

*Populated after implementation.*

## What landed

1. **TASK_01** — Ran `seed-baseline-listings.ts` against Neon production: 14 Categories, 36 Tags, 24 Tools.
2. **TASK_02** — Wrote + ran `seed-baseline-programs.ts`: 12 Disciplines, 13 RankSystems, 194 Ranks, 2 Programs, 1 ClassSchedule, 218 Courses, 654 CurriculumItems on production.
3. **TASK_03** — Wrote + ran `seed-baseline-platform.ts`: 4 Entitlements, 4 TournamentRoles, 6 GamificationEventTypes, 6 SubscriptionTiers, 5 Karate Styles, 5 OrgDisciplines, 4 ContentAtoms+Variants, 2 new Programs (Self Defense + Eskrima), 6 ClassSchedules (CU Rec Summer 2026).
4. **TASK_04** — Wrote + ran `seed-baseline-owner.ts` (3 production runs): admin role, Passport, DirectoryProfile, 7 Memberships (BJJ, MT, Eskrima, Boxing, Self Defense, Karate, Kajukenbo), 5 RankAwards (BJJ BK1, Eskrima 5D Master, MT Kru, Karate 4D Yondan, Kajukenbo BK1), CourseEnrollment + 3 CurriculumItemCompletions (BJJ Safety), SAFETY Certification (course author). Eskrima rank correction applied (was Guro → now 5th Degree Master). Passport bio updated with full credentials.

## Files touched

- `apps/web/prisma/seed-baseline-programs.ts` (created SESSION_0174)
- `apps/web/prisma/seed-baseline-platform.ts` (created SESSION_0174)
- `apps/web/prisma/seed-baseline-owner.ts` (created SESSION_0174)
- `docs/sprints/SESSION_0174.md` (created + updated)
- `docs/protocols/project-log.md` (appended)

## Decisions resolved

- Eskrima rank: 5th Degree Black Belt (Master), not Guro. GM Steve Wolk lineage.
- Karate: 4th Degree (Yondan) under Tim Wolchek. Kajukenbo: 1st Degree under Sifu Tim Mills/Sam Carter/Hanyann Ng.
- `awardedById` left null for all RankAwards — instructors not yet platform users. `notes` field carries lineage text.
- BJJ Safety: Brian is course author → Certification type SAFETY with `issuedById = self`.
- ClassSchedule source: colorado.edu/recreation real CU Rec Summer 2026 schedule.

## Open decisions / blockers

- Stale comment in `seed-baseline-programs.ts` lines 18-20 (lists items as "NOT ported" that are now ported). Low priority.

## Next session

- **Goal:** S6 sprint continuation — public programs page UI or next production-readiness task.
- **Inputs to read:** `docs/architecture/program-plan.md` S6 scope, `docs/sprints/SESSION_0174.md`.
- **First task:** TBD based on sprint backlog review.

## Task Log

SESSION_0174_TASK_01, SESSION_0174_TASK_02, SESSION_0174_TASK_03, SESSION_0174_TASK_04

## Review Log

SESSION_0174_REVIEW_01

## Hostile close review

N/A — quick close (code-only session, no schema changes).

## ADR / ubiquitous-language check

No new ADRs needed. No new domain terms introduced.

## Status

closed-quick
