---
title: "Feature Data Prerequisites"
slug: feature-data-prerequisites
type: architecture
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0015
health: 8
pairs_with:
  - docs/runbooks/sop-e2e-user-lifecycle.md
  - docs/runbooks/sop-data-and-wiring-flows.md
backlinks:
  - docs/knowledge/wiki/index.md
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

## Course + Curriculum (S6 — upcoming)

```text
Organization → Course (orgId, disciplineId)
            → CurriculumItem (courseId, sortOrder)
            → CourseEnrollment (userId, courseId)
            → CurriculumItemCompletion (userId, itemId)
```

- **Minimum:** 1 Course with ≥2 CurriculumItems, 1 enrolled user, 1 completion
- **Seed covers:** ❌ Not yet seeded — add before building S6

## Progress + Gamification (S7 — upcoming)

```text
User → RankAward (userId, rankId, awardedById)
     → GamificationEvent (userId, eventTypeId)
     → GamificationEventType (system defaults exist)
```

- **Minimum:** 1 RankAward linking user→rank, 1 GamificationEvent
- **Seed covers:** ⚠️ RankAwards exist (sensei=Blue, alpha=White, beta=L3). GamificationEvents not yet seeded.

## Tournament (S8–S9 — upcoming)

```text
Organization → Tournament (orgId, brand, status)
            → TournamentDiscipline (tournamentId, disciplineId)
            → Division (tournamentDisciplineId, format, gender, rank constraints)
            → Registration (userId, tournamentId)
            → RegistrationEntry (registrationId, divisionId, snapshot fields)
```

- **Minimum:** 1 Published Tournament with 1 Division, 1 Registration with snapshot
- **Seed covers:** ❌ Not yet seeded — add before building S8

---

## How to use this doc

1. **Before building a feature:** Find the section above. Confirm every record type listed exists in your dev DB.
2. **If missing:** Update `prisma/seed.ts` to create the missing records, then `dropdb ronindojo_dev && createdb ronindojo_dev && npx prisma migrate dev` (or use Postgres.app binaries if not on PATH).
3. **After adding seed data:** Update this doc to mark the section as ✅.
