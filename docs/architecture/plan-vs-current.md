---
title: Plan vs Current
slug: plan-vs-current
type: file
status: active
created: 2026-04-25
updated: 2026-04-30
last_agent: codex-session-0029
pairs_with:
  - docs/architecture/program-plan.md
  - docs/architecture/s1-schema-design.md
  - docs/architecture/s2-schema-additions.md
  - docs/architecture/source/chatgpt-original-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0029.md
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

> **Updated SESSION_0029 (2026-04-30):** S1 schema rev and Schema Waves A-D are live in `schema.prisma` (97 models, 65 enums). Many feature slices are still pending route/action/UI work and production migration hardening. See [WORKFLOW_5.0](../protocols/WORKFLOW_5.0.md), [s2-schema-additions.md](s2-schema-additions.md), and [PETEY_PLAN_S2_SCHEMA_PASS4.md](PETEY_PLAN_S2_SCHEMA_PASS4.md).

### S1 models (live in schema)

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

### S2 and Wave D models (schema live; feature slices pending)

| Model group | Models | Status |
| --- | --- | --- |
| Programs + scheduling | Program, ProgramCourse, ProgramEnrollment, ClassSchedule, ClassInstructorAssignment, ClassSession, CheckIn, Attendance | ✅ schema live; feature slices pending |
| Belt testing | BeltTestEvent, BeltTestRegistration, BeltTestPrerequisiteConfig | ✅ schema live; feature slice pending |
| Family / guardian | FamilyGroup, FamilyMember | ✅ schema live; feature slice pending |
| Payments / billing | PricingPlan, Invoice, InvoiceLineItem, Payment, StripeAccount, PayoutSplit, PromoCode | ✅ schema live; entitlement/payment feature slice pending |
| Contracts | MembershipContract | ✅ schema live; feature slice pending |
| Notifications | NotificationPreference, Announcement | ✅ schema live; feature slice pending |
| Org network + settings | OrgRelationship, OrgSettings | ✅ schema live; feature slice pending |
| Invitations | Invite, InviteClaim | ✅ schema live; feature slice pending |
| Generic events | Event, EventRegistration | ✅ schema live; feature slice pending |
| Tournament execution | Bracket, Match, MatchCompetitor | ✅ schema live; feature slice pending |
| Fight records | FightRecord | ✅ schema live; feature slice pending |
| Audit log | AuditLog | ✅ schema live; feature slice pending |
| Lead / CRM | Lead, LeadFollowUp | ✅ schema live; feature slice pending |
| Tournament rules | RuleSet | ✅ schema live; feature slice pending |
| Tournament operations | WeighInRecord, MatAssignment | ✅ schema live; feature slice pending |
| Media, techniques, certificates, lists | Media, MediaAttachment, Technique, TechniquePrerequisite, TechniqueCurriculumLink, TechniqueProgress, CertificateTemplate, CertificateOrder, CertificateIssuance, Favorite, StudentList, StudentListMember | ✅ schema live; content/certificate feature slices pending |

---

## Where Brand fits (our addition, not in the plan)

The plan has no `Brand` concept. We added it (ADR 0004) because the rebuild needs to support multiple brand-faces (Ronin Dojo Design, Baseline Martial Arts, BBL, WEKAF) on one shared DB.

These two models are **orthogonal and compatible**:

- **Brand** = which marketing face / domain the user is in (host-derived).
- **Passport + Shells** = the identity/membership model the plan describes.

Practically: a `School` (or, post-rename, `Organization`) belongs to a `Brand`. The brand-as-column scoping (ADR 0004) is fine and stays. The Passport+Shells redesign happens *inside* the brand-scoped tables.

---

## Plan's behavioral requirements — coverage after S1 + S2 design

> **Updated SESSION_0029:** S1 behavioral requirements are met at schema/initial feature level. S2 and Wave D schema are live. The remaining work is vertical slices, entitlement access, production migration hardening, and cross-brand proof.

### Original plan requirements (S1 — all met)

1. **Membership lifecycle**: invited → pending → active → suspended → expired. ✅ Live.
2. **Multiple roles per membership**: ✅ `MembershipRoleAssignment` join table. Live.
3. **Rank-at-registration snapshot**: ✅ `RegistrationEntry` snapshot fields. Live.
4. **Directory search with privacy**: ✅ `DirectoryProfile` + UI. Live (S4).
5. **Tournament division eligibility**: ✅ `Division` model with constraints. Schema live, enforcement logic pending.
6. **Idempotent registration submission**: ✅ `idempotencyKey` on `Registration`. Schema live, server action pending.
7. **Per-discipline rank systems**: ✅ 13 rank systems, 194 ranks seeded. Live.

### Operational requirements (S2 design — all addressed)

| # | Requirement | Coverage | Status |
| --- | --- | --- | --- |
| 8 | Class scheduling + attendance | Program → ClassSchedule → ClassSession → CheckIn → Attendance | ✅ schema live; feature slice pending |
| 9 | Belt testing + prerequisites | BeltTestEvent + Registration + PrerequisiteConfig | ✅ schema live; feature slice pending |
| 10 | Family / guardian accounts | FamilyGroup + FamilyMember | ✅ schema live; feature slice pending |
| 11 | Payments / invoicing / Stripe Connect | PricingPlan → Invoice → Payment + StripeAccount | ✅ schema live; entitlement/payment feature slice pending |
| 12 | Check-in / kiosk | CheckIn with QR/manual/kiosk/app methods | ✅ schema live; feature slice pending |
| 13 | Notifications (per-category × channel × program) | NotificationPreference + Announcement | ✅ schema live; feature slice pending |
| 14 | Membership contracts | MembershipContract (term, renewal, cooling-off) | ✅ schema live; feature slice pending |
| 15 | Programs vs courses (M:N) | Program ↔ ProgramCourse ↔ Course | ✅ schema live; Program CRUD landed; enrollment/course slices pending |
| 16 | Instructor assignment + titles | ClassInstructorAssignment + displayTitle | ✅ schema live; feature slice pending |
| 17 | Org configurability | OrgSettings (all operational toggles) | ✅ schema live; feature slice pending |

### Extended requirements (S2 Passes 2–3)

| # | Requirement | Coverage | Status |
| --- | --- | --- | --- |
| 18 | Invitations / QR invite | Invite + InviteClaim, universal type system | ✅ schema live; feature slice pending |
| 19 | Generic events (seminars, camps) | Event + EventRegistration | ✅ schema live; feature slice pending |
| 20 | Tournament brackets + matches | Bracket → Match → MatchCompetitor | ✅ schema live; feature slice pending |
| 21 | Fight records | FightRecord per user × discipline × type | ✅ schema live; feature slice pending |
| 22 | Audit trail | AuditLog append-only | ✅ schema live; feature slice pending |
| 23 | Lead / CRM pipeline | Lead + LeadFollowUp + conversion tracking | ✅ schema live; feature slice pending |
| 24 | Tournament rules engine | RuleSet with structured scoring config | ✅ schema live; feature slice pending |
| 25 | Weigh-in tracking | WeighInRecord per registration | ✅ schema live; feature slice pending |
| 26 | Mat/ring assignment | MatAssignment per match | ✅ schema live; feature slice pending |

### Deferred (post-launch)

| Requirement | Rationale |
| --- | --- |
| White-label sites/templates | RDD-specific; deferred per Option A-plus |
| Athlete journal / HealthKit | BJJBuddy-style features; post-launch |
| Ranking series | Cross-tournament rankings; post-launch |

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

## Recommended sequencing (revised — governed by WORKFLOW 5.0)

> **Updated SESSION_0020:** The original Phase 2–5 sequencing below was based on the 12-sprint plan. Execution is now governed by [WORKFLOW_5.0.md](../protocols/WORKFLOW_5.0.md) with 20 sessions (0021–0040) targeting May 18. The phase model below is preserved for conceptual reference.

### Phase 0 — finish the foundations we started ✅ DONE

- ✅ `lib/authz.ts` — exists, renames complete.
- ✅ `middleware.ts` — host→brand resolution, working.
- ⏸ Prisma client extension for brand scoping — SESSION_0022.
- ⏸ Better-Auth `lastActiveBrandId` field — SESSION_0022.

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

### Phase 2 — Milestone 1 (Identity + Membership Shells) ✅ DONE (S2–S4)

1. ✅ Better-Auth wired with Passport linkage (S2).
2. ✅ Passport CRUD UI — `/me` route (S2).
3. ✅ Organization create + join flow (S3).
4. ✅ Membership creation tied to (Organization × Discipline) with role assignment (S3).
5. ✅ Directory search with `DirectoryProfile` privacy filters (S4).

### Phase 3 — Schema Wave A–C + operational features (SESSION_0021–0029)

Supersedes the old "Milestone 2 (Tournament registration)" phase. Now governed by WORKFLOW 5.0:

- **Wave A (SESSION_0021–0022):** School ops — programs, schedules, attendance, billing, family, org settings
- **Wave B (SESSION_0023–0025):** Promotions, events, leads, invitations, belt testing
- **Wave C (SESSION_0027–0029):** Tournament execution — brackets, matches, scoring, rules engine, weigh-ins, mat assignments

### Phase 4 — Per-brand launch (SESSION_0031–0034)

Each brand gets:

- Brand-specific theme tokens, content, seed data
- Core journey verification per brand
- Launch pages and onboarding flows

### Phase 5 — QA + launch (SESSION_0035–0040)

- E2E lifecycle tests, fixtures, seeds, migration rehearsal
- Cross-brand UAT, accessibility, performance
- Release execution, monitoring, support

---

## Open questions — resolved in S1

All five questions were resolved during SESSION_0003–0005:

1. ✅ **`School` → `Organization`** — renamed.
2. ✅ **`Style` → `Discipline`** — renamed.
3. ✅ **`Profile` → `Passport`** — renamed.
4. ✅ **`Belt` → `Rank`** with `RankSystem` parent — done.
5. ✅ **Multiple roles per membership** — `MembershipRoleAssignment` join table implemented.

---

## Cross-references (added SESSION_0010)

- [Repo Truth Index](../knowledge/wiki/repo-truth-index.md) — authoritative source map for the layers this doc compares against

---

## S2 Schema Additions — gap closure (SESSION_0020)

> **This section is a pointer, not a duplicate.** Full spec lives in [s2-schema-additions.md](s2-schema-additions.md).

SESSION_0020 identified 10 operational gaps that were NOT covered by S1. All 10 are launch blockers. Three design passes produced the Wave A-C implementation plan, and SESSION_0026 landed Waves B-D in schema after the first School Ops wave.

- Programs, scheduling, attendance, check-in (Pass 1)
- Belt testing, family accounts, billing/Stripe Connect, contracts, notifications, org settings (Pass 1)
- Invitations, generic events, tournament brackets/matches, fight records, audit logging (Pass 2)
- Lead/CRM pipeline, tournament rules engine, weigh-ins, mat assignments (Pass 3)

**Status:** Design complete and schema landed locally through Waves A-D. Production migration artifacts and feature implementation remain scheduled in [WORKFLOW_5.0](../protocols/WORKFLOW_5.0.md). See [s2-schema-additions.md](s2-schema-additions.md) for the original implementation spec.

---

## Cross-references (continued)

- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — items currently "code complete / smoke pending" that this doc tracks against the spec
- [Command Center and Intake](../knowledge/wiki/content-engine/command-center-and-intake.md) — content-engine view of how authored content lands against the data spine
