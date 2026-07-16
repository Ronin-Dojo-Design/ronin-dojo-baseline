---
title: "seed.ts"
slug: seed-ts
type: file
status: active
created: 2026-04-26
updated: 2026-07-16
author: Brian + Copilot
last_agent: codex-session-0542
pairs_with:
  - docs/knowledge/wiki/files/schema-prisma.md
  - docs/architecture/data-model.md
parent: docs/architecture/program-plan.md
backlinks:
  - docs/sprints/_archive/SESSION_0005.md
  - docs/sprints/_archive/SESSION_0015.md
  - docs/architecture/data-model.md
  - docs/architecture/feature-data-prerequisites.md
needs_fix:
  - "Kajukenbo TuffBuffs-specific rank system (#14) deferred — need to confirm from monorepo"
  - "GamificationEventType point values are placeholder — needs design pass"
  - "Baseline + WEKAF subscription tiers not yet defined"
wiring:
  - "apps/web/prisma/schema.prisma — models being seeded"
  - "apps/web/prisma.config.ts — references seed command"
  - "apps/web/.generated/prisma/ — generated client types"
tags: [prisma, seed, data, s1]
---

# seed.ts

## Summary

Prisma seed file that populates the database with all system defaults for the Ronin Dojo platform plus Dirstarter template demo data.

## Intent

Provide a reproducible baseline dataset for an explicitly named disposable local database. The canonical
`ronindojo_prodsnap` mirror is non-disposable and must never be reset, db-pushed, or seeded. The executable
`assertSafeSeedTarget` guard refuses prodsnap/Neon before constructing a Prisma client and accepts only the
named test/E2E/dev fixtures or a `ronindojo_*scratch*` database.

## Architecture

Two sections:

1. **Dirstarter demo data** — admin/user accounts, categories, tags, 17 sample tools
2. **Ronin Dojo seed data** — disciplines, rank systems, ranks, roles, tournament roles, gamification event types, subscription tiers, Karate substyles
3. **Test users (SESSION_0015)** — 5 practitioners with full identity graph: Passport, DirectoryProfile, Organization, Membership, RankAward. Covers PUBLIC/MEMBERS_ONLY/HIDDEN visibility + ACTIVE/PENDING membership status.
4. **School Ops seed data (SESSION_0028)** — Baseline Programs plus Sensei OWNER role assignment for Program CRUD.

Creates its own PrismaClient directly (bypasses `env.ts` validation which requires all production env vars).

## Key data seeded

| Entity | Count | Notes |
| --- | --- | --- |
| Disciplines | 12 | All `isSystem: true` — BJJ through Wing Chun |
| Rank Systems | 13 | 11 universal, 2 Baseline-specific (Boxing, Self Defense) |
| Ranks | ~194 | Full ladders — IBJJF 30, Eskrima 22×2, Muay Thai 9, etc. |
| Roles | 6 | STUDENT, INSTRUCTOR, OWNER, COACH, ORG_ADMIN, STYLE_APPROVER |
| Tournament Roles | 4 | COMPETITOR, COACH, JUDGE, VOLUNTEER |
| Gamification Event Types | 6 | BELT_PROMOTION through CURRICULUM_ITEM_COMPLETION |
| Subscription Tiers | 6 | 1 universal FREE + 5 BBL-specific |
| Karate Substyles | 5 | Shotokan, Wado-Ryu, Goju-Ryu, Hawaiian Kenpo, Kajukenbo |
| Test Users | 5 | Sensei (PUBLIC/Blue), Alpha (PUBLIC/White), Beta (MEMBERS_ONLY/L3), Ghost (HIDDEN), Pending (PUBLIC/PENDING) |
| Organizations | 1 | Baseline Academy (Boulder, CO) with BJJ, Muay Thai, Eskrima |
| Memberships | 5 | 4 ACTIVE + 1 PENDING, all BASELINE_MARTIAL_ARTS |
| RankAwards | 3 | Sensei→BJJ Blue, Alpha→BJJ White, Beta→Eskrima L3 |
| MembershipRoleAssignments | 1 | Sensei has OWNER role for Baseline Academy |
| Programs | 2 | Adult BJJ and Muay Thai Striking for Baseline Academy |

## Current Notes

- Runs against an empty, explicitly named disposable database; it is not idempotent.
- Program CRUD smoke coverage lives in `apps/web/scripts/smoke-program.ts`.
- GamificationEventType point values are still placeholders and need a design pass.

## Teachable explanation

Provision a literal scratch target from committed migrations, then run the seed with both URLs pinned:

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/dropdb --if-exists --force ronindojo_seed_scratch
/Applications/Postgres.app/Contents/Versions/latest/bin/createdb ronindojo_seed_scratch
cd apps/web

env DATABASE_URL=postgresql://brianscott@localhost:5432/ronindojo_seed_scratch \
  DIRECT_URL=postgresql://brianscott@localhost:5432/ronindojo_seed_scratch \
  bun run db:migrate:deploy

env DATABASE_URL=postgresql://brianscott@localhost:5432/ronindojo_seed_scratch \
  DIRECT_URL=postgresql://brianscott@localhost:5432/ronindojo_seed_scratch \
  bun run prisma/seed.ts
```

The file creates demo users first (Dirstarter pattern), then seeds the martial-arts reference data. The helper
`seedRankSystem()` creates a `RankSystem` and its ordered `Rank` rows. Brand-specific data uses
`isSystem: false, brand: "BASELINE_MARTIAL_ARTS"` or `brand: "BBL"`.
