---
title: Plan vs Current
slug: plan-vs-current
type: file
status: active
created: 2026-04-25
updated: 2026-04-26
last_agent: copilot-session-0006
health: 7
pairs_with:
  - docs/architecture/program-plan.md
  - docs/architecture/s1-schema-design.md
  - docs/architecture/source/chatgpt-original-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Behavioral roadmap — plan spec vs current build

This document treats the [ChatGPT-authored plan](source/chatgpt-original-plan.md) as a **functional spec** (what behaviors the system must support) and compares it against what's currently built in the codebase. We don't copy the plan's MySQL schema verbatim — we adopt its behavioral requirements onto the new Postgres + Prisma + Dirstarter foundation.

Use this doc to:
- judge whether each thing we ship covers a real spec'd requirement
- track what's missing and why we're choosing to defer or prioritize it
- not silently drift from the original product intent

---

## Plan's core architecture: Passport + Shells

The plan is built around **two primitives** (sections 1–2):

1. **Passport** — global identity. *One per user.* Holds: legal/display name, DOB, gender, phone, emergency contact, avatar. Independent of any org/league/tournament.
2. **Shells** — context-specific identity. The same person has **different attributes** in different contexts:
   - **Organization Shell** (dojo/league/school): membership status, roles, rank
   - **Discipline Shell** (Karate vs BJJ vs TKD): different rank system per discipline
   - **Tournament Shell**: registration status, role for that event, **rank snapshotted at registration time** so future promotions don't rewrite competitive history

This model isn't optional — it's the spine of the data architecture and resolves the requirement *"same profile passport, but different ranks/roles/member statuses across different shells."*

### Plan's primary entities (section 2)

| Entity | Role |
|---|---|
| **User** | Login/account |
| **Passport** | Global profile (1:1 with User) |
| **DirectoryProfile** | Privacy/visibility settings (1:1 with User) |
| **Organization** | Dojo / league / school / club |
| **Discipline** | Karate / BJJ / TKD / etc. |
| **RankSystem + Rank** | Belt/dan/kyu lists per discipline |
| **Membership** | User × Organization × Discipline (with rank, status, multiple roles) |
| **Tournament** | Tournament event |
| **TournamentDiscipline** | Tournament × Discipline (one tournament can support many) |
| **Division** | Age/weight/rank/gender/format categories under a tournament discipline |
| **Registration** | User signs up for tournament |
| **RegistrationEntry** | One row per division × role the user entered, with rank/org snapshot |

---

## Current schema (apps/web/prisma/schema.prisma) — what we have

> **Updated SESSION_0006 (2026-04-26):** S1 schema rev landed. All renames and new models are in place. Seed data loaded (12 disciplines, 13 rank systems, 194 ranks).

| Plan entity | Our model | Status |
|---|---|---|
| User | `User` (Better-Auth) | ✅ exists |
| Passport | `Passport` | ✅ renamed from `Profile`; has DOB, gender, legal names, emergency contact, avatar |
| DirectoryProfile | `DirectoryProfile` | ✅ exists — visibility + per-field privacy flags |
| Organization | `Organization` | ✅ renamed from `School`; has `type` enum (DOJO/LEAGUE/SCHOOL/CLUB) |
| Discipline | `Discipline` | ✅ renamed from `Style`; has `isSystem` + `brand` for extensibility |
| RankSystem | `RankSystem` | ✅ exists — links Discipline → Rank ladder; has `kind` (BELT/KYU_DAN/PRAJIOUD/GRADE/OTHER), `isSystem` + `brand` |
| Rank | `Rank` | ✅ renamed from `Belt`; has `kind`, `colorHex`, `shortName`, `sortOrder`, `isSystem` + `brand` |
| Membership | `Membership` | ✅ reshaped — has `disciplineId`, `status` enum (INVITED/PENDING/ACTIVE/SUSPENDED/EXPIRED), M:N roles via `MembershipRoleAssignment` |
| Tournament | `Tournament` | ✅ reshaped — has `status` enum (DRAFT/PUBLISHED/CLOSED/ARCHIVED), venue fields |
| TournamentDiscipline | `TournamentDiscipline` | ✅ exists — tournament × discipline join |
| Division | `Division` | ✅ exists — age/weight/rank/gender constraints, format enum |
| Registration | `Registration` | ✅ reshaped from `TournamentRegistration` — has status, payment status, `submittedAt` |
| RegistrationEntry | `RegistrationEntry` | ✅ exists — rank/org snapshot fields (`snapshotRankName`, `snapshotOrgName`) |

---

## Where Brand fits (our addition, not in the plan)

The plan has no `Brand` concept. We added it (ADR 0004) because the rebuild needs to support multiple brand-faces (Ronin Dojo Design, Baseline Martial Arts, BBL, WEKAF) on one shared DB.

These two models are **orthogonal and compatible**:

- **Brand** = which marketing face / domain the user is in (host-derived).
- **Passport + Shells** = the identity/membership model the plan describes.

Practically: a `School` (or, post-rename, `Organization`) belongs to a `Brand`. The brand-as-column scoping (ADR 0004) is fine and stays. The Passport+Shells redesign happens *inside* the brand-scoped tables.

---

## Plan's behavioral requirements — coverage after S1

> **Updated SESSION_0006:** Schema now supports all behavioral requirements. Implementation (server actions, UI) starts in S2.

1. **Membership lifecycle**: invited → pending → active → suspended → expired. ✅ Schema has `MembershipStatus` enum and `status` field on `Membership`.

2. **Multiple roles per membership**: ✅ `MembershipRoleAssignment` join table exists.

3. **Rank-at-registration snapshot**: ✅ `RegistrationEntry` has `snapshotRankName` + `snapshotOrgName`.

4. **Directory search with privacy**: ✅ `DirectoryProfile` model exists with `visibility` enum + per-field flags. UI not yet built (S4).

5. **Tournament division eligibility**: ✅ `Division` model has gender/age/weight/rank constraints + format enum. Enforcement logic not yet built (S9).

6. **Idempotent registration submission**: ⏸ Schema supports it (`idempotencyKey` on `Registration`). Server action not yet built (S9).

7. **Per-discipline rank systems**: ✅ `RankSystem` links `Discipline` → `Rank` ladder. 13 rank systems seeded with 194 ranks.

---

## UI behavioral spec (plan section 5: "Ronin Bar")

The plan calls for a Mac-menu-bar-style top chrome:

- **Compact mode**: context switcher, search, notifications, avatar
- **Full mode**: full app navigation
- **Traffic-light buttons** (left side): red (close panel / hold to log out), yellow (compact), green (full / focus)
- **⌘K command palette** in the center: search across directory, tournaments, members
- **Right side**: context dropdown (Dojo / Tournament / Admin), notifications, profile

We haven't built any of this. **The "context dropdown" the plan describes is functionally what we've been calling the Brand Switcher** — but the plan's version is more general (it switches between Dojo / Tournament / Admin contexts, not just brands).

---

## Plan's milestone ordering

The plan's recommended build order (section 6):

1. **Milestone 1 — Identity + Membership Shells**
   1. Auth + User + Passport CRUD
   2. Organization create/join
   3. Membership per (org × discipline)
   4. Directory search (basic) with privacy controls
2. **Milestone 2 — Tournament registration**
   1. Tournament create (draft → published)
   2. Add disciplines + divisions
   3. Registration + entries + rank/org snapshotting

Our current todo list jumps to per-brand rollouts (Ronin Dojo Design, BBL, etc.) without first nailing the Identity + Membership Shells milestone. **The plan's order is better** — get the identity/membership/directory loop working once, then per-brand work becomes data + theming, not architectural rework.

---

## Recommended sequencing (revised against plan)

Each item below is "one task" in the user's sense — pick one, finish it, then come back for the next.

### Phase 0 — finish the foundations we started

- ✅ `lib/authz.ts` — exists, renames pending post-S1 cleanup.
- ✅ `middleware.ts` — host→brand resolution, fine as-is.
- ⏸ Prisma client extension for brand scoping — defer until S2+.
- ⏸ Better-Auth `lastActiveBrandId` field — S2 deliverable.

### Phase 1 — schema rev to align with Passport + Shells ✅ DONE (S1)

Completed in SESSION_0003–0005:
1. ✅ Renamed `Style` → `Discipline`, `School` → `Organization`, `Belt` → `Rank`, `Profile` → `Passport`
2. ✅ Added `Organization.type` enum
3. ✅ Created `RankSystem` with `kind` enum
4. ✅ Expanded `Passport` with all plan-required fields
5. ✅ Added `DirectoryProfile`
6. ✅ Reshaped `Membership` with `disciplineId`, `status` enum, `MembershipRoleAssignment`
7. ✅ Reshaped `Tournament` → `Tournament` + `TournamentDiscipline` + `Division`
8. ✅ Added `RegistrationEntry` with snapshot fields
9. ✅ Added `isSystem` + `brand` extensibility to Discipline/RankSystem/Rank
10. ✅ Seeded 12 disciplines, 13 rank systems, 194 ranks, roles, tiers, styles

### Phase 2 — Milestone 1 (Identity + Membership Shells)

Sequence per the plan:
1. Better-Auth wired with Passport linkage (sign-up creates User + Passport stub).
2. Passport CRUD UI (a `/me` route).
3. Organization create + join flow.
4. Membership creation tied to (Organization × Discipline) with role assignment.
5. Directory search with `DirectoryProfile` privacy filters.

### Phase 3 — Milestone 2 (Tournament registration)

Per the plan:
1. Tournament create wizard (draft → published).
2. Add disciplines + divisions to a tournament.
3. Registration → entries with rank/org snapshot at submit time.
4. Idempotency + audit log on submission.

### Phase 4 — Per-brand rollout

Each brand becomes:
- A subdomain mapping in `middleware.ts`
- Theming (colors, logo, copy) via the brand cookie/header
- Optional brand-specific seed data

This is when the legacy frontends get ported visually, but they all consume the same Phase 1–3 APIs.

### Phase 5 — Ronin Bar UI shell

Compact/full mode, traffic-light buttons, ⌘K palette, context dropdown. Layered on top once the data + flows are working.

---

## Open questions — resolved in S1

All five questions were resolved during SESSION_0003–0005:

1. ✅ **`School` → `Organization`** — renamed.
2. ✅ **`Style` → `Discipline`** — renamed.
3. ✅ **`Profile` → `Passport`** — renamed.
4. ✅ **`Belt` → `Rank`** with `RankSystem` parent — done.
5. ✅ **Multiple roles per membership** — `MembershipRoleAssignment` join table implemented.
