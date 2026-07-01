---
title: "schema.prisma"
slug: schema-prisma
type: file
status: active
created: 2026-04-25
updated: 2026-07-01
author: Brian + Copilot
last_agent: codex-session-0479
pairs_with:
  - knowledge/wiki/files/seed-ts
  - architecture/data-model
  - architecture/s1-schema-design
  - docs/architecture/decisions/0042-rank-award-fact-vs-member-milestone.md
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0004
  - sprints/SESSION_0005
  - architecture/data-model
  - knowledge/wiki/content-engine/content-atoms
  - knowledge/wiki/content-engine/curriculum-extract-schema
  - docs/knowledge/wiki/files/dirstarter-l1-baseline.md
  - docs/knowledge/wiki/files/discipline-queries.md
  - docs/sprints/SESSION_0152.md
  - docs/sprints/SESSION_0479.md
needs_fix:
  - "Single-brand BBL prune (ADR 0034): the 4-brand Brand enum harness + ~170 vestigial getRequestBrand sites are slated for full prune; multi-brand is dead, multi-product is the model"
  - "Tool/Category/Tag NOT removable as plain Dirstarter boilerplate — Tool is repurposed as the join-the-legacy non-claim 'Legacy Profile' record (createJoinLegacyInterest); confirm consumers before any removal"
  - "Legacy LineageClaimRequest table retained for stragglers only (ADR 0036 P5) — drop in a later migration"
wiring:
  - "apps/web/prisma/seed.ts — seeds data into these models"
  - "apps/web/services/db.ts — creates PrismaClient from generated types"
  - "apps/web/lib/authz.ts — permission checks against Organization, Rank, Role"
  - "apps/web/.generated/prisma/ — generated client output"
tags: [prisma, schema, database, s1]
---

# schema.prisma

## Summary

The Prisma schema defining all database models for the Ronin Dojo platform. **127 models, 88 enums,
4,216 lines** (63 migrations). Source of truth for the data layer. *(Counts refreshed SESSION_0479 after
`RankMilestone`; the prior 125/87/~4127 figure was frozen before the latest rank-history migrations.)*

## Intent

Single schema file defining the complete data model for the platform. Everything from identity
(**Passport** as the identity root, ADR 0025) through tournaments, gamification, subscriptions,
lineage, and the **unified person-claim** flow is modeled here. Originally multi-brand (`isSystem` +
`brand` columns on reference tables); per **ADR 0034** multi-*brand* is dead (single-brand collapse to
BBL) and multi-*product* (apps in one monorepo) is the model — the 4-brand harness is slated for prune.

## Architecture

Two sections:

1. **Dirstarter template models** (top) — User, Session, Account, Verification, Tool, Category, Tag,
   Report, Ad. **No longer pure boilerplate:** `Tool` is repurposed as the join-the-legacy non-claim
   "Legacy Profile" record (`createJoinLegacyInterest`); auth models (User/Session/Account) are core.
2. **Ronin Dojo platform models** (bottom) — organized by concern: Identity, Organization + Discipline,
   Rank System, Membership + Roles, Rank Awards, Courses + Curriculum, Tournaments, Gamification,
   Styles, Subscriptions, **Lineage (trees + nodes + relationships)**, **Claims (unified)**, Leads,
   Media, Entitlements, Waivers, Certifications.

## Key exports / models

- **Identity (Passport-rooted, ADR 0025):** Passport (identity SoT; `userId` nullable — account
  attaches on claim), User, DirectoryProfile
  - `User.role` is now a typed `UserRole` enum (`user` / `admin` / `tournament_director`) as of
    SESSION_0449 — was free-text String; Better Auth's `admin()` plugin owns the field;
    `lineage_tree_admin` and `guest` are synthetic UI/code labels, never stored.
- **Organization:** Organization, Discipline, OrganizationDiscipline, Affiliation (school axis,
  separate from Membership)
- **Ranks:** RankSystem, Rank (`colorHex` belt color), RankAward (canonical promotion fact), RankMilestone
  (Belt Journey story/media enrichment)
- **Lineage:** LineageTree, LineageTreeMember, LineageNode, LineageRelationship, LineageVisualGroup,
  LineageTreeAccess
- **Claims (unified, ADR 0036):** **PassportClaimRequest** (THE person-claim record — keyed on
  Passport; `claimedRankId` + the SESSION_0441 `claimedSchoolId`/`trainedUnderNodeId`/`representTreeId`
  typed refs), PassportClaimEvidence, ProfileClaimRequest (org claims — sibling), LineagePendingClaim
  (email→node binding), LineageClaimRequest (legacy, retired writer)
- **Membership:** Membership, MembershipRoleAssignment, Role
- **Leads / intake:** Lead, LeadFollowUp (join-the-legacy intake + CRM)
- **Saves:** Bookmark (polymorphic — `BookmarkSubjectType` + nullable FKs, ADR 0028/0029)
- **Curriculum:** Course, CurriculumItem, CourseEnrollment, CurriculumItemCompletion
- **Tournaments:** Tournament, TournamentDiscipline, Division, Registration, RegistrationEntry,
  TournamentRole, TournamentStaffAssignment
- **Gamification:** GamificationEventType, GamificationEvent
- **Subscriptions / billing:** SubscriptionTier, UserBrandSubscription, UserEntitlement (comp/paid
  grants)
- **Styles · Waivers · Certifications:** Style; Waiver, WaiverSignature; Certification

## Health

- Compiles: ✅ (`prisma generate` clean, Prisma 7.8)
- Type-checks: ✅ (`tsc --noEmit` clean)
- Tested: ◑ (model-level zod/action tests exist per-feature; no whole-schema test)
- Seeded: ✅ (per-brand seeds run clean)
- Migration history: ✅ 63 migrations. **⚠ prodsnap/prod drift hazard (SESSION_0441):** the
  hand-stamped `20260622000000_add_claimed_rank_to_lineage_claim_request` is **pending** and marked
  *"DO NOT APPLY in cloud sessions"* — a deploy's `prisma migrate deploy` applies ALL pending
  migrations, so check `prisma migrate status` before any schema-touching push.
- Score: **8/10** (the doc body drifted ~30 sessions before this refresh; whole-schema test still absent)

## Teachable explanation

This file is the single source of truth for what the database looks like. Every model here becomes a TypeScript type and a set of Prisma Client methods (`.create()`, `.findMany()`, etc.). The schema is organized into two halves: the Dirstarter boilerplate (which we'll remove eventually) and the Ronin Dojo domain models (which are the real product).

Key design pattern: reference tables like `Role`, `TournamentRole`, `GamificationEventType`, `SubscriptionTier`, `Discipline`, `RankSystem`, and `Rank` all follow the same extensibility pattern — `isSystem: Boolean` (true = platform default, false = client-added) + `brand: Brand?` (null = universal, set = brand-specific). This lets white-label SaaS clients customize without polluting other brands' data.
