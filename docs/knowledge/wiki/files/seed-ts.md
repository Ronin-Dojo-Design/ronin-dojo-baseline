---
title: "seed.ts"
slug: seed-ts
type: file
status: active
created: 2026-04-26
updated: 2026-04-27
author: Brian + Copilot
last_agent: Copilot (SESSION_0015)
pairs_with:
  - knowledge/wiki/files/schema-prisma
  - architecture/data-model
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0005
  - sprints/SESSION_0015
  - architecture/data-model
  - architecture/feature-data-prerequisites
health: 8
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

Provide a reproducible baseline dataset for local development. Any developer (or agent) can `dropdb && createdb && prisma db push && bun run prisma/seed.ts` and have a fully working dev environment with real-world martial arts data.

## Architecture

Two sections:

1. **Dirstarter demo data** — admin/user accounts, categories, tags, 17 sample tools
2. **Ronin Dojo seed data** — disciplines, rank systems, ranks, roles, tournament roles, gamification event types, subscription tiers, Karate substyles
3. **Test users (SESSION_0015)** — 5 practitioners with full identity graph: Passport, DirectoryProfile, Organization, Membership, RankAward. Covers PUBLIC/MEMBERS_ONLY/HIDDEN visibility + ACTIVE/PENDING membership status.

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

## Health

- Runs clean: ✅
- Idempotent: ❌ (must run against empty DB — no upsert logic)
- Score: **8/10**

## Teachable explanation

Run this file after `prisma db push` to populate the database. It creates demo users first (Dirstarter pattern), then seeds all the martial arts reference data. The helper function `seedRankSystem()` handles creating a RankSystem and its ordered Ranks in one call. Brand-specific data uses `isSystem: false, brand: "BASELINE_MARTIAL_ARTS"` or `brand: "BBL"`.
