---
title: Data Model
slug: data-model
type: concept
status: active
created: 2026-04-25
updated: 2026-04-29
author: Brian + Copilot
last_agent: codex-session-0025
pairs_with:
  - architecture/s1-schema-design
  - docs/architecture/s2-schema-additions.md
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0004
  - sprints/SESSION_0005
  - sprints/SESSION_0020
  - knowledge/wiki/files/schema-prisma
  - docs/knowledge/wiki/files/seed-ts.md
  - knowledge/wiki/content-engine/content-atoms
wiring:
  - "apps/web/prisma/schema.prisma — 36 existing models (live), 38 new models (s2-schema-additions, migration pending)"
  - "apps/web/prisma/seed.ts — seed data for disciplines, ranks, roles, etc."
  - "apps/web/lib/authz.ts — permission checks reference Organization, Rank, Role"
tags: [schema, prisma, data-model, s1, s2]
---

# Data Model

Source of truth: `apps/web/prisma/schema.prisma`. This document is the human-readable rationale and reference.

## Summary

36 Prisma models currently in schema, with 38 additional models designed in [s2-schema-additions.md](s2-schema-additions.md) (target: ~74 total). 29 new enums across 3 design passes. The schema supports a multi-brand martial arts SaaS platform with identity (Passport + DirectoryProfile), organization membership with per-discipline ranks and multi-role assignments, curriculum and course tracking, tournament registration with rank snapshots, gamification, subscriptions, lineage, waivers, certifications, substyle taxonomy, class scheduling, attendance tracking, belt testing, family/guardian accounts, invoicing/payments (Stripe Connect), CRM/lead pipeline, membership contracts, notification preferences, org network relationships, and audit logging.

## Status

Schema is live in local dev with 36 models. Migration via `prisma db push`. Seed file populates 12 disciplines, 13 rank systems (~194 ranks), 6 roles, 4 tournament roles, 6 gamification event types, 6 subscription tiers, and 5 Karate substyles.

**S2 additions (not yet migrated):** 38 new models across 3 passes covering programs, scheduling, attendance, belt testing, family, billing, contracts, notifications, org network, invitations, generic events, tournament brackets/matches, fight records, audit logging, CRM/leads, tournament rules engine, weigh-ins, and mat assignments. See [s2-schema-additions.md](s2-schema-additions.md) for full spec.

---

## Brand scoping

Every brand-scoped model has a `brand: Brand` column. See [ADR 0004](decisions/0004-multi-brand-as-column.md). The four brands:

- `RONIN_DOJO_DESIGN` — umbrella/admin brand
- `BASELINE_MARTIAL_ARTS` — first user-facing brand (built from TuffBuffs reference)
- `BBL` — second brand (data migration planned, see ADR 0007)
- `WEKAF` — fourth brand (greenfield, post-MVP)

---

## Identity shell

```text
User (Better-Auth core)
  └─ Passport (1:1)           displayName, legalName, dob, gender, phone, emergency, avatar, bio, socialLinks
  └─ DirectoryProfile (1:1)   visibility (HIDDEN/MEMBERS_ONLY/PUBLIC), location, per-field show/hide flags
```

The Passport is the user's global identity — not tied to any organization, discipline, or brand. The DirectoryProfile controls what's visible in the directory search.

---

## Organization + Discipline

```text
Organization
  ├─ brand: Brand
  ├─ type: DOJO | LEAGUE | SCHOOL | CLUB
  ├─ owner: User
  ├─ OrganizationDiscipline (M:N to Discipline)
  └─ Memberships, Courses, Tournaments, Waivers, Certifications, GamificationEvents

Discipline (12 system defaults)
  ├─ isSystem / brand — extensible per white-label client
  └─ RankSystems (1:N), Styles (1:N), Courses, Memberships, TournamentDisciplines
```

### 12 seeded disciplines

| # | Code | Name | Rank system kind |
| --- | --- | --- | --- |
| 1 | bjj | Brazilian Jiu-Jitsu | BELT (IBJJF, 30 ranks) |
| 2 | eskrima | Doce Pares Eskrima | BELT (2 systems: PIMA Denver 22, PIMA Jersey 22) |
| 3 | muay-thai | Muay Thai | PRAJIOUD (Sak Va Roon, 9 ranks) |
| 4 | boxing | Boxing | GRADE (Baseline-specific, 8 levels) |
| 5 | self-defense | Self Defense | GRADE (Baseline-specific, 8 levels) |
| 6 | judo | Judo | KYU_DAN (Kodokan, 16 ranks) |
| 7 | kajukenbo | Kajukenbo | BELT (19 ranks) — also a Karate substyle |
| 8 | karate | Karate | KYU_DAN (USA Karate Fed, 20 ranks) |
| 9 | tkd | Taekwondo | KYU_DAN (USA TKD/WT, 20 ranks) |
| 10 | wrestling | Wrestling | GRADE (6 levels) |
| 11 | krav-maga | Krav Maga | GRADE (6 levels) |
| 12 | wing-chun | Wing Chun | OTHER (Forms progression, 8 ranks) |

---

## Rank system

```text
RankSystem
  ├─ discipline: Discipline
  ├─ kind: BELT | PRAJIOUD | GRADE | KYU_DAN | OTHER
  ├─ isSystem / brand — extensible per client
  └─ Ranks (1:N, ordered by sortOrder)

Rank
  ├─ sortOrder, name, shortName, colorHex
  └─ isSystem / brand
```

An Organization picks which RankSystem(s) it follows for each Discipline. Multiple RankSystems per Discipline are supported (e.g., Eskrima has PIMA Denver and PIMA Jersey).

---

## Membership + Roles

```text
Membership
  ├─ brand: Brand
  ├─ user → organization → discipline (unique triple)
  ├─ style: Style? (optional substyle, e.g., Shotokan under Karate)
  ├─ rank: Rank? (current rank — nullable = unranked)
  ├─ status: INVITED | PENDING | ACTIVE | SUSPENDED | EXPIRED
  └─ MembershipRoleAssignment (M:N to Role)

Role (6 system defaults)
  ├─ code: STUDENT | INSTRUCTOR | OWNER | COACH | ORG_ADMIN | STYLE_APPROVER
  ├─ isSystem / brand — extensible per client
  └─ MembershipRoleAssignment
```

A user who is both STUDENT and COACH at the same (org × discipline) has two MembershipRoleAssignment rows. No duplicate Memberships needed.

---

## Rank awards

```text
RankAward
  ├─ user (earnedBy)
  ├─ rank
  ├─ awardedBy: User? (instructor)
  ├─ awardedAt, notes, location, mediaUrls
  └─ GamificationEvents (1:N)
```

Promotion updates both `Membership.rankId` (current) and inserts a `RankAward` (history) atomically via `$transaction()`.

---

## Styles (substyles within a Discipline)

```text
Style
  ├─ discipline: Discipline
  ├─ parentStyle: Style? (hierarchy: Kenpo → Hawaiian Kenpo)
  ├─ status: APPROVED | PENDING | REJECTED
  ├─ createdBy / approvedBy: User?
  └─ Memberships (optional FK)
```

5 seeded Karate substyles: Shotokan, Wado-Ryu, Goju-Ryu, Hawaiian Kenpo, Kajukenbo. User-submitted styles start PENDING; approved by org_owner/instructor/style_approver.

---

## Courses + Curriculum

```text
Course
  ├─ brand, organization, discipline?, rank?
  ├─ certificationType: BELT_RANK | SAFETY | COACH
  └─ CurriculumItems (1:N, ordered)

CurriculumItem
  ├─ order, title, notes, mediaUrl, mediaType
  └─ CurriculumItemCompletion (1:N via CourseEnrollment)

CourseEnrollment
  ├─ user × course (unique)
  └─ CurriculumItemCompletion (tracks per-item progress, verifiedBy instructor)
```

---

## Tournaments

```text
Tournament
  ├─ brand, host: Organization
  ├─ status: DRAFT | PUBLISHED | CLOSED | ARCHIVED
  └─ TournamentDiscipline (1:N)
       └─ Division (1:N)
            ├─ format: SINGLE_ELIM | ROUND_ROBIN | POOL_TO_BRACKET | KATA | SPARRING | FORMS
            ├─ gender, age, weight, rank constraints
            ├─ roleRequired: TournamentRole (e.g., COMPETITOR)
            └─ RegistrationEntry (1:N)

Registration
  ├─ tournament × user (unique)
  ├─ status: STARTED | SUBMITTED | APPROVED | WAITLISTED | CANCELLED
  ├─ paymentStatus: UNPAID | PAID | REFUNDED | PARTIAL
  └─ RegistrationEntry (1:N)
       ├─ snapshotRankName, snapshotOrgName (frozen at submit)
       └─ tournamentRole, representingMembership

TournamentRole (4 system defaults)
  ├─ COMPETITOR, COACH, JUDGE, VOLUNTEER
  └─ isSystem / brand — extensible

TournamentStaffAssignment
  └─ tournament × user × tournamentRole, optionally scoped to division
```

---

## Gamification

```text
GamificationEventType (6 system defaults)
  ├─ BELT_PROMOTION, CLASS_ATTENDANCE, TOURNAMENT_WIN,
  │  TOURNAMENT_PARTICIPATION, COURSE_COMPLETION, CURRICULUM_ITEM_COMPLETION
  ├─ defaultPoints, isSystem / brand
  └─ GamificationEvent (1:N)

GamificationEvent
  ├─ brand, user, eventType, points, meta (Json)
  └─ optional FKs: rankAward, course, organization, discipline
```

Aggregate views (level, badges) are computed, not stored. Point values and badge triggers need a future design pass.

---

## Subscriptions

```text
SubscriptionTier
  ├─ code, name, level (int for comparison), isSystem / brand
  └─ Universal: FREE (level=0)
  └─ BBL: FREE(0), PREMIUM(10), INSTRUCTOR(20), SCHOOL_OWNER(30), LEGEND(40)

UserBrandSubscription
  ├─ user × brand (unique)
  ├─ tier, status: ACTIVE | EXPIRED | CANCELLED | PAST_DUE
  └─ startsAt, expiresAt
```

Stripe wiring deferred to S10.

---

## Lineage

```text
LineageNode
  ├─ user (1:1)
  ├─ visibility: PUBLIC | UNLISTED | RESTRICTED | PRIVATE
  └─ LineageRelationship (M:N, from/to)
       ├─ type: TOURNAMENT_PARTNER | AFFILIATION | TRAINING_PARTNER | SEMINAR | COMPETITION_TEAM
       └─ isVerified
```

---

## Waivers

```text
Waiver
  ├─ type: LIABILITY | TOURNAMENT | MINOR_CONSENT | MEDIA_RELEASE | MEDICAL
  ├─ organization? / tournament? / brand?
  ├─ version, isRequired, isActive
  └─ WaiverSignature (1:N)
       ├─ user, signedAt, IP, userAgent
       └─ signedOnBehalfOf: User? (minor consent)
```

---

## Certifications

```text
Certification
  ├─ type: BELT_RANK | SAFETY | COACH
  ├─ status: ACTIVE | EXPIRED | REVOKED
  ├─ user, organization, course?, issuedBy?
  └─ issuedAt, expiresAt, certificateNumber
```

---

## Content Engine

```text
ContentAtom (canonical teaching/marketing unit)
  ├─ canonicalId, title, slug, status (INBOX→PUBLISHED)
  ├─ hook, promise, proof, cta, teachingTruth, longFormCopy
  ├─ curriculumExtract (Json), videoExtract (Json)
  ├─ siteTargets: Brand[], channelTargets: ContentChannel[]
  ├─ discipline?, style?, organization?, createdBy
  └─ ContentVariant (1:N), ContentTask (1:N), ContentPublication (1:N)

ContentVariant (brand × channel adaptation)
  ├─ atom × brand × channel (unique)
  ├─ publicTitle, publicSlug, renderedCopy, voiceNotes
  └─ status: DRAFT | READY | PUBLISHED | ARCHIVED

ContentTask (operational workflow)
  ├─ type: WRITING | MEDIA | REVIEW | PUBLISH | QA
  ├─ status, priority, dueAt, assignee
  └─ dependsOn: ContentTask? (dependency chain)

ContentPublication (publication log)
  ├─ brand × channel, platformPostId, publicUrl
  └─ publishedAt, checksum
```

See [Content Atoms](../knowledge/wiki/content-engine/content-atoms.md) for the full architecture concept.

---

## Indexes

All brand-scoped tables: `@@index([brand])`. Key composite indexes:

- `Membership`: `[brand, organizationId]`, `[organizationId, status]`, `[userId]`
- `Organization`: `[brand]`, `[ownerId]`
- `RankAward`: `[userId, awardedAt]`
- `GamificationEvent`: `[userId, createdAt]`, `[brand, eventTypeId]`
- `Tournament`: `[brand, startDate]`
- `Registration`: `[tournamentId, status]`

---

## Dirstarter template models (retained)

The following models come from the Dirstarter directory template and are kept as working reference for Prisma patterns (citext, indexes, owner relations, soft enums, implicit M:N):

- `Tool`, `Category`, `Tag`, `Report`, `Ad`
- `Account`, `Session`, `Verification` (Better-Auth)

TODO: remove before production (tracked in follow-up before BBL DNS cutover, see ADR 0007).

---

## S2 Schema Additions (38 new models — design complete, migration pending)

Full Prisma definitions in [s2-schema-additions.md](s2-schema-additions.md). Below is the human-readable rationale for each model group.

### Programs & Scheduling (8 models)

The missing operational backbone. A **Program** is a student-facing offering ("Adult BJJ", "Kids Karate 5–8") that determines schedule access and pricing. Programs link to Courses via the **ProgramCourse** M:N join. Students enroll via **ProgramEnrollment** (with waitlist support and age enforcement).

Each Program has **ClassSchedules** — recurring definitions ("Mon/Wed/Fri 6–7:30pm") storing both iCal RRULE and parsed day/time columns. **ClassInstructorAssignment** maps instructors to schedules with customizable titles ("Guro", "Sensei"). **ClassSession** represents a specific date instance auto-generated from the schedule.

**CheckIn** captures raw kiosk/QR/app events. When matched to a ClassSession, it creates an **Attendance** record that triggers the existing GamificationEvent chain.

```text
Program → ClassSchedule → ClassSession → Attendance ← CheckIn
   ↕            ↕                              ↕
ProgramEnrollment  ClassInstructorAssignment   GamificationEvent (existing)
   ↕
ProgramCourse ↔ Course (existing)
```

### Belt Testing (3 models)

**BeltTestEvent** is a scheduled exam day scoped to an org and optionally a rank system. Students register via **BeltTestRegistration** (with fee tracking, prerequisite verification, and per-technique score breakdown). **BeltTestPrerequisiteConfig** defines per-rank requirements (time-in-rank, attendance count, curriculum completion, instructor approval) — configurable per org.

### Family & Guardian (2 models)

**FamilyGroup** + **FamilyMember** groups users under one billing/management umbrella. Supports guardian, child, and spouse roles. Primary billing contact is flagged. Enables family discount billing and minor account management.

### Payments & Billing (6 models)

**PricingPlan** defines purchasable options (monthly, annual, drop-in, class pack, trial, intro pack). **Invoice** → **InvoiceLineItem** → **Payment** is the billing chain. Payments support card, bank, cash, check, barter, coupon, and comp methods.

**StripeAccount** stores Stripe Connect credentials per org (Express default, Standard for independent clients). **PayoutSplit** defines revenue sharing between instructors/staff.

**PromoCode** supports org-level and platform-wide discount codes.

### Contracts (1 model)

**MembershipContract** — legally distinct from waivers. Stores term length, auto-renewal, cancellation notice period, cooling-off period, and monthly amount.

### Notifications (2 models)

**NotificationPreference** provides full granularity: per-category (class reminder, billing, belt test, etc.) × per-channel (email, SMS, push) × per-program. **Announcement** supports org-wide or program-specific broadcast messages across multiple channels.

### Org Network (1 model)

**OrgRelationship** tracks parent-child relationships between organizations: affiliation, white-label, and franchise types. Enables the three usage modes (owner-operated, affiliation, white-label).

### Org Settings (1 model)

**OrgSettings** is the per-org configuration singleton. Stores all operational toggles: check-in window, late check-in, waiver enforcement, waiver renewal, SMS cost pass-through, drop-in fees, barter membership, gamification, belt test scoring.

### Invitations (2 models)

**Invite** is a universal invite system — QR code, link, or manual — covering org join, program enroll, tournament registration, and event attendance. **InviteClaim** records who claimed what and when.

### Generic Events (2 models)

**Event** covers seminars, workshops, birthday parties, summer camps, open mats, and custom events (NOT tournaments — those have their own richer model). **EventRegistration** tracks attendance and payment.

### Tournament Execution (3 models)

Extends the existing Tournament → Division chain. **Bracket** lives inside a Division (single elim, pool play, repechage). **Match** is a single bout with round/match positioning, result, and structured score data. **MatchCompetitor** links RegistrationEntry to match slots.

### Fight Records (1 model)

**FightRecord** — per-fighter, per-discipline competition record (wins/losses/draws/no-contests). Supports tournament, exhibition, smoker, and professional types. One fighter can have separate records for BJJ, boxing, eskrima, etc.

### Audit Log (1 model)

**AuditLog** — append-only log for sensitive operations (rank promotions, payment modifications, role changes, belt test results). Stores before/after snapshots, IP, and user agent.

### Lead / CRM (2 models)

**Lead** captures prospect data before they become a User — source tracking, trial booking, conversion tracking, UTM params. **LeadFollowUp** tracks outreach attempts across channels with assignee and scheduling.

### Tournament Rules Engine (1 model)

**RuleSet** — structured scoring templates ("IBJJF Gi Rules", "WEKAF Single Stick") with match duration, overtime, scoring method, and configurable point values/penalties. Links to TournamentDiscipline, replacing the flat `rulesetName` string.

### Tournament Operations (2 models)

**WeighInRecord** tracks official weigh-ins per registration with decimal weight, official status, and recorder. **MatAssignment** assigns matches to physical mats/rings with time slots and status tracking.

---

## Full relationship map (74 models)

```text
User (Better-Auth)
  ├─ Passport (1:1)
  ├─ DirectoryProfile (1:1)
  ├─ Membership (1:N) → MembershipRoleAssignment
  ├─ ProgramEnrollment (1:N)
  ├─ Attendance (1:N) ← CheckIn (1:N)
  ├─ BeltTestRegistration (1:N)
  ├─ FamilyMember → FamilyGroup
  ├─ Invoice (1:N) → InvoiceLineItem → Payment
  ├─ MembershipContract (1:N)
  ├─ NotificationPreference (1:N)
  ├─ PayoutSplit (1:N)
  ├─ ClassInstructorAssignment (1:N)
  ├─ Invite (created, 1:N) ← InviteClaim (1:N)
  ├─ EventRegistration (1:N)
  ├─ Registration (1:N) → RegistrationEntry → MatchCompetitor
  ├─ FightRecord (1:N)
  ├─ LeadFollowUp (assignee, 1:N)
  ├─ WeighInRecord (1:N)
  ├─ AuditLog (1:N)
  ├─ RankAward (1:N)
  ├─ CourseEnrollment (1:N)
  ├─ GamificationEvent (1:N)
  ├─ LineageNode (1:1) → LineageRelationship
  ├─ WaiverSignature (1:N)
  └─ Certification (1:N)

Organization
  ├─ Program (1:N) → ClassSchedule → ClassSession → Attendance
  ├─ BeltTestEvent (1:N)
  ├─ BeltTestPrerequisiteConfig (1:N)
  ├─ Invoice (1:N) → Payment
  ├─ MembershipContract (1:N)
  ├─ PricingPlan (1:N)
  ├─ PromoCode (1:N)
  ├─ StripeAccount (1:1) → PayoutSplit
  ├─ OrgSettings (1:1)
  ├─ OrgRelationship (parent/child)
  ├─ Announcement (1:N)
  ├─ Invite (1:N)
  ├─ Event (1:N) → EventRegistration
  ├─ Lead (1:N) → LeadFollowUp
  ├─ AuditLog (1:N)
  ├─ Tournament (1:N) → TournamentDiscipline → Division → Bracket → Match
  ├─ MatAssignment (via Tournament)
  ├─ Membership (1:N)
  ├─ Course (1:N) → CurriculumItem
  └─ Waiver (1:N) → WaiverSignature

Tournament
  ├─ TournamentDiscipline (1:N) → RuleSet
  ├─ Division (1:N) → Bracket → Match → MatchCompetitor
  ├─ Registration (1:N) → RegistrationEntry → WeighInRecord
  ├─ MatAssignment (1:N)
  └─ TournamentStaffAssignment (1:N)
```

---

## Model count

| Category | Existing (S1) | New (S2 design) | Total |
| --- | ---: | ---: | ---: |
| Identity + directory | 3 | 0 | 3 |
| Organization + membership | 5 | 0 | 5 |
| Rank + awards | 4 | 0 | 4 |
| Courses + curriculum | 4 | 0 | 4 |
| Tournaments + registration | 7 | 0 | 7 |
| Gamification | 2 | 0 | 2 |
| Subscriptions | 2 | 0 | 2 |
| Lineage | 2 | 0 | 2 |
| Waivers | 2 | 0 | 2 |
| Certifications | 1 | 0 | 1 |
| Content engine | 4 | 0 | 4 |
| Programs + scheduling | 0 | 8 | 8 |
| Belt testing | 0 | 3 | 3 |
| Family | 0 | 2 | 2 |
| Payments + billing | 0 | 7 | 7 |
| Contracts | 0 | 1 | 1 |
| Notifications | 0 | 2 | 2 |
| Org network + settings | 0 | 2 | 2 |
| Invitations | 0 | 2 | 2 |
| Generic events | 0 | 2 | 2 |
| Tournament execution | 0 | 3 | 3 |
| Fight records | 0 | 1 | 1 |
| Audit log | 0 | 1 | 1 |
| Lead / CRM | 0 | 2 | 2 |
| Tournament rules + ops | 0 | 3 | 3 |
| **Subtotal** | **36** | **38** | **74** |
| Dirstarter template (to remove) | 5 | 0 | — |
