---
title: "Feature Data Prerequisites"
slug: feature-data-prerequisites
type: architecture
status: active
created: 2026-04-27
updated: 2026-07-20
last_agent: claude-session-0587
pairs_with:
  - docs/runbooks/sops/sop-e2e-user-lifecycle.md
  - docs/runbooks/sops/sop-data-and-wiring-flows.md
  - docs/knowledge/wiki/files/seed-ts.md
  - docs/runbooks/domain-features/course-curriculum-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/_archive/SESSION_0157.md
---

# Feature data prerequisites

Before building or smoke-testing a feature, this is the minimum data graph that must exist in the dev database for the feature to render anything meaningful.

**This is a Cody pre-flight input.** Before building feature X, confirm these records exist. If they don't, update `prisma/seed.ts` first.

---

## Auth + Passport (S2)

```text
User → Passport (stub)
     → DirectoryProfile (stub, default MEMBERS_ONLY)
```

- **Minimum:** 1 User with emailVerified=true, 1 Passport, 1 DirectoryProfile
- **Seed covers:** ✅ 5 test users (sensei, alpha, beta, ghost, pending)

## Organization create + join (S3)

```text
User → Organization (brand=BASELINE_MARTIAL_ARTS)
     → OrganizationDiscipline (org × discipline link)
     → Membership (userId, orgId, disciplineId, status, brand)
```

- **Minimum:** 1 Organization with brand + at least 1 OrganizationDiscipline + 1 ACTIVE Membership
- **Seed covers:** ✅ Baseline Academy (BJJ, Muay Thai, Eskrima) + 4 active memberships + 1 pending

## Directory search (S4)

```text
User → DirectoryProfile (visibility=PUBLIC or MEMBERS_ONLY)
     → Membership (status=ACTIVE, org.brand=BASELINE_MARTIAL_ARTS)
     → Organization (brand=BASELINE_MARTIAL_ARTS)
```

- **Minimum:** At least 1 user with PUBLIC DirectoryProfile + ACTIVE membership in a brand-scoped org
- **Test matrix:**
  - PUBLIC profiles (sensei, alpha, pending) → visible to unauthenticated
  - MEMBERS_ONLY profile (beta) → visible only to authenticated
  - HIDDEN profile (ghost) → never visible in directory
  - PENDING membership (pending) → has membership but not ACTIVE
- **Seed covers:** ✅ All visibility states + mixed membership statuses

## RankSystem + Rank (S5, pulled into S1)

```text
Discipline → RankSystem → Rank (ordered by sortOrder)
```

- **Minimum:** 1 Discipline with 1 RankSystem with ≥2 Ranks
- **Seed covers:** ✅ 12 disciplines, 13 rank systems, 194 ranks

## Program CRUD (School Ops — SESSION_0028)

```text
Organization (brand=BASELINE_MARTIAL_ARTS)
  ├─ OrganizationDiscipline
  ├─ owner or ACTIVE member with OWNER/ORG_ADMIN/INSTRUCTOR role
  └─ Program (brand, orgId, optional disciplineId, status=ACTIVE)
```

- **Minimum:** 1 brand-scoped Organization with at least 1 linked Discipline, 1 editable user, and 1 ACTIVE Program
- **Auth requirement:** Create/update/archive must verify session, active brand, organization brand, editable org permission, and optional discipline linkage
- **Seed covers:** ✅ Baseline Academy + Sensei OWNER role + 2 ACTIVE Programs (BJJ, Muay Thai)
- **Smoke proof:** `cd apps/web && bun scripts/smoke-program.ts`

## Course + Curriculum (S6)

```text
Organization → Course (orgId, disciplineId)
            → CurriculumItem (courseId, order)
            → CourseEnrollment (userId, courseId)
            → CurriculumItemCompletion (enrollmentId, curriculumItemId)
```

- **Minimum:** 1 Course with ≥2 CurriculumItems, 1 enrolled user, 1 completion
- **Seed covers:** ✅ SESSION_0156 seed creates 218 Courses, 654 CurriculumItems, 1 CourseEnrollment, and 1 CurriculumItemCompletion. See `docs/runbooks/domain-features/course-curriculum-runbook.md`.
- **SESSION_0583 finding:** `/curriculum` 404s locally on both `ronindojo_prodsnap` and a freshly-migrated `ronindojo_e2e` — zero `Course` rows with slug prefix `bjj-level-` on either local DB, despite SESSION_0546 recording a prod import (61 techniques / 75 prereqs / 80 items at SESSION_0435). Local render of `/curriculum` requires importing that data first.

## Progress + Gamification (S7 — upcoming)

```text
User → RankAward (userId, rankId, awardedById)
     → GamificationEvent (userId, eventTypeId)
     → GamificationEventType (system defaults exist)
```

- **Minimum:** 1 RankAward linking user→rank, 1 GamificationEvent
- **Seed covers:** ⚠️ RankAwards exist (sensei=Blue, alpha=White, beta=L3). GamificationEvents not yet seeded.

## Tournament (S8–S9 — live seed/proof exists)

```text
Organization → Tournament (orgId, brand, status)
            → TournamentDiscipline (tournamentId, disciplineId)
            → Division (tournamentDisciplineId, format, gender, rank constraints)
            → Registration (userId, tournamentId)
            → RegistrationEntry (registrationId, divisionId, snapshot fields)
```

- **Minimum:** 1 Published Tournament with 1 Division, 1 Registration with snapshot
- **Seed covers:** ✅ Current seed/test stack includes tournament fixture data and later registration proof. Before new tournament work, still confirm the specific event/division/registration shape needed by that feature.
- **Proof note:** tournament CRUD/registration work landed after the original version of this doc; do not treat this section as a blocker unless the target feature needs new fixture variants.

---

## How to use this doc

1. **Before building a feature:** Find the section above. Confirm every record type listed exists in your dev DB.
1. **If missing:** Update `prisma/seed.ts` to create the missing records, then `dropdb ronindojo_dev && createdb ronindojo_dev && npx prisma migrate dev` (or use Postgres.app binaries if not on PATH).
1. **After adding seed data:** Update this doc to mark the section as ✅.
