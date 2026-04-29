---
title: "schema.prisma"
slug: schema-prisma
type: file
status: active
created: 2026-04-25
updated: 2026-04-29
author: Brian + Copilot
last_agent: codex-session-0025
pairs_with:
  - knowledge/wiki/files/seed-ts
  - architecture/data-model
  - architecture/s1-schema-design
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0004
  - sprints/SESSION_0005
  - architecture/data-model
  - knowledge/wiki/content-engine/content-atoms
  - knowledge/wiki/content-engine/curriculum-extract-schema
  - docs/knowledge/wiki/files/dirstarter-l1-baseline.md
  - docs/knowledge/wiki/files/discipline-queries.md
health: 8
needs_fix:
  - "Dirstarter template models (Tool, Category, Tag, Report, Ad) still present — remove before prod"
  - "prisma migrate dev hangs — using db push for now"
wiring:
  - "apps/web/prisma/seed.ts — seeds data into these models"
  - "apps/web/services/db.ts — creates PrismaClient from generated types"
  - "apps/web/lib/authz.ts — permission checks against Organization, Rank, Role"
  - "apps/web/.generated/prisma/ — generated client output"
tags: [prisma, schema, database, s1]
---

# schema.prisma

## Summary

The Prisma schema defining all database models for the Ronin Dojo platform. 31 models, 18 enums, ~1100 lines. Source of truth for the data layer.

## Intent

Single schema file defining the complete data model for a multi-brand martial arts SaaS. Everything from identity (Passport) through tournaments, gamification, subscriptions, and lineage is modeled here. Brand extensibility is built in via `isSystem` + `brand` columns on key reference tables.

## Architecture

Two sections:

1. **Dirstarter template models** (top) — User, Session, Account, Verification, Tool, Category, Tag, Report, Ad. Kept as working reference for Prisma patterns.
2. **Ronin Dojo platform models** (bottom) — All 31 domain models organized by concern: Identity, Organization + Discipline, Rank System, Membership + Roles, Rank Awards, Courses + Curriculum, Tournaments, Gamification, Styles, Subscriptions, Lineage, Waivers, Certifications.

## Key exports / models

- **Identity:** User, Passport, DirectoryProfile
- **Organization:** Organization, Discipline, OrganizationDiscipline
- **Ranks:** RankSystem, Rank, RankAward
- **Membership:** Membership, MembershipRoleAssignment, Role
- **Curriculum:** Course, CurriculumItem, CourseEnrollment, CurriculumItemCompletion
- **Tournaments:** Tournament, TournamentDiscipline, Division, Registration, RegistrationEntry, TournamentRole, TournamentStaffAssignment
- **Gamification:** GamificationEventType, GamificationEvent
- **Styles:** Style
- **Subscriptions:** SubscriptionTier, UserBrandSubscription
- **Lineage:** LineageNode, LineageRelationship
- **Waivers:** Waiver, WaiverSignature
- **Certifications:** Certification

## Health

- Compiles: ✅ (`prisma generate` clean)
- Type-checks: ✅ (`tsc --noEmit` clean, only pre-existing Dirstarter errors)
- Tested: ❌ (no automated schema tests yet)
- Seeded: ✅ (seed.ts runs clean)
- Migration history: ❌ (`prisma migrate dev` hangs — using `db push`)
- Score: **8/10**

## Teachable explanation

This file is the single source of truth for what the database looks like. Every model here becomes a TypeScript type and a set of Prisma Client methods (`.create()`, `.findMany()`, etc.). The schema is organized into two halves: the Dirstarter boilerplate (which we'll remove eventually) and the Ronin Dojo domain models (which are the real product).

Key design pattern: reference tables like `Role`, `TournamentRole`, `GamificationEventType`, `SubscriptionTier`, `Discipline`, `RankSystem`, and `Rank` all follow the same extensibility pattern — `isSystem: Boolean` (true = platform default, false = client-added) + `brand: Brand?` (null = universal, set = brand-specific). This lets white-label SaaS clients customize without polluting other brands' data.
