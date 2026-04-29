---
title: S1 Schema Design
slug: s1-schema-design
type: file
status: active
created: 2026-04-25
updated: 2026-04-29
last_agent: codex-session-0025
pairs_with:
  - docs/architecture/plan-vs-current.md
  - docs/architecture/program-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/data-model.md
  - docs/knowledge/wiki/concepts/passport-and-shells.md
  - docs/knowledge/wiki/files/schema-prisma.md
---

# S1 Schema Design — Phase 1 Rev

Design doc for sign-off before migration. No code changes until Brian approves.

**Author:** Petey (SESSION_0002, updated SESSION_0003)
**Inputs:** program-plan.md S1 row, plan-vs-current.md, ADR 0004, chatgpt-original-plan.md §1–7, current schema.prisma, TuffBuffs legacy rank data, BBL tiers + lineage schemas

---

## Summary of changes

One migration that:

1. Renames `Profile` → `Passport` (expanded fields)
2. Adds `DirectoryProfile`
3. Renames `School` → `Organization` (adds `type` enum)
4. Renames `Style` → `Discipline`
5. Replaces `SchoolStyle` → `OrganizationDiscipline`
6. Adds `RankSystem` + renames `Belt` → `Rank` (expanded fields)
7. Adds `MembershipStatus` enum, reshapes `Membership` with `disciplineId` + `status`
8. Replaces single-role enum with `Role` table + `MembershipRoleAssignment` join table (Q3 resolved: table, not enum)
9. Renames `Progress` → `RankAward` (clearer intent)
10. Reshapes `Tournament` (status enum, venue fields, org-hosted instead of school-hosted)
11. Adds `TournamentDiscipline`, `Division`, reshapes `TournamentRegistration` → `Registration`, adds `RegistrationEntry` with snapshot fields
12. Renames `Course.schoolId` → `organizationId`, `Course.styleId` → `disciplineId`, adds `rankId` FK (Q6)
13. Adds `Style` model for substyles (Shotokan, Goju-Ryu, etc.) with approval workflow (Gap 4)
14. Adds `TournamentRole` table for tournament-specific roles (Q5 resolved: table, not enum)
15. Adds `SubscriptionTier` table + `UserBrandSubscription` model (Q7 resolved: Option C)
16. Adds `LineageNode` + `LineageRelationship` models (Q8 resolved: add now)
17. Adds `GamificationEvent` FKs to `RankAward`, `Course`, `Organization`, `Discipline` + `GamificationEventType` table (Gap 1)
18. Adds `CourseEnrollment` + `CurriculumItemCompletion` models for student progress tracking (Gap 2)
19. Adds `Waiver` + `WaiverSignature` models for tournament/org consent records (Gap 3)
20. Adds `TournamentStaffAssignment` for judge/ref/director assignments (Gap 5)
21. Adds `Certification` model for safety/coach certification records (Gap 6)

Seeds all 7 Baseline Martial Arts disciplines + rank systems in S1 (Q4 resolved: include now).

No changes to Dirstarter template models (User core, Session, Account, Verification, Tool, Category, Tag, Report, Ad).

---

## Enums

```prisma
enum Brand {
  RONIN_DOJO_DESIGN
  BASELINE_MARTIAL_ARTS
  BBL
  WEKAF
}

// REMOVED — MembershipRole is now a `Role` table (Q3 resolved)
// Universal seed roles: STUDENT, INSTRUCTOR, OWNER, COACH, ORG_ADMIN, STYLE_APPROVER
// Per-brand custom roles supported via brand column

// EXISTING — no change
enum CertificationType {
  BELT_RANK
  SAFETY
  COACH
}

// NEW
enum OrganizationType {
  DOJO
  LEAGUE
  SCHOOL
  CLUB
}

// NEW
enum MembershipStatus {
  INVITED
  PENDING
  ACTIVE
  SUSPENDED
  EXPIRED
}

// NEW
enum RankSystemKind {
  BELT        // BJJ, Eskrima, Kajukenbo
  PRAJIOUD    // Muay Thai armband system
  GRADE       // Boxing skill levels, Self Defense levels
  KYU_DAN     // Judo, Karate (future)
  OTHER
}

// NEW
enum TournamentStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}

// NEW
enum RegistrationStatus {
  STARTED
  SUBMITTED
  APPROVED
  WAITLISTED
  CANCELLED
}

// NEW
enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
  PARTIAL
}

// NEW
enum DivisionFormat {
  SINGLE_ELIM
  ROUND_ROBIN
  POOL_TO_BRACKET
  KATA
  SPARRING
  FORMS
}

// NEW
enum DivisionGender {
  ANY
  FEMALE
  MALE
}

// NEW
enum DirectoryVisibility {
  HIDDEN
  MEMBERS_ONLY
  PUBLIC
}

// NEW
enum Gender {
  FEMALE
  MALE
  NONBINARY
  PREFER_NOT_TO_SAY
}

// NEW
enum EntryStatus {
  ACTIVE
  CANCELLED
}

// NEW — Style approval workflow (Gap 4)
enum StyleStatus {
  APPROVED
  PENDING
  REJECTED
}

// NEW — Waiver types (Gap 3)
enum WaiverType {
  LIABILITY          // general liability waiver
  TOURNAMENT         // tournament-specific waiver
  MINOR_CONSENT      // parental consent for minors
  MEDIA_RELEASE      // photo/video consent
  MEDICAL            // medical clearance
}

// NEW — Subscription status (Q7)
enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PAST_DUE
}

// NEW — Lineage visibility (Q8)
enum LineageVisibility {
  PUBLIC
  UNLISTED
  RESTRICTED
  PRIVATE
}

// NEW — Lineage relationship type (Q8)
enum LineageRelationType {
  TOURNAMENT_PARTNER
  AFFILIATION
  TRAINING_PARTNER
  SEMINAR
  COMPETITION_TEAM
}

// NEW — Certification status (Gap 6)
enum CertificationStatus {
  ACTIVE
  EXPIRED
  REVOKED
}
```

---

## Models

### User (extended — minimal changes)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("user")
  banned        Boolean?  @default(false)
  banReason     String?
  banExpires    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastActiveBrandId Brand?

  // Dirstarter relations (unchanged)
  accounts Account[]
  sessions Session[]
  tools    Tool[]

  // Ronin Dojo relations (renamed)
  passport            Passport?
  directoryProfile    DirectoryProfile?
  memberships         Membership[]
  rankAwards          RankAward[]              @relation("EarnedBy")
  awardedRankAwards   RankAward[]              @relation("AwardedBy")
  ownedOrganizations  Organization[]           @relation("OrganizationOwner")
  gamificationLog     GamificationEvent[]
  registrations       Registration[]

  // NEW relations (SESSION_0003 additions)
  subscriptions            UserBrandSubscription[]
  lineageNode              LineageNode?
  courseEnrollments         CourseEnrollment[]
  waiverSignatures         WaiverSignature[]
  waiverSignaturesOnBehalf WaiverSignature[]    @relation("SignedOnBehalf")
  tournamentStaffAssignments TournamentStaffAssignment[]
  certifications           Certification[]
  issuedCertifications     Certification[]      @relation("CertIssuedBy")
  createdStyles            Style[]              @relation("StyleCreatedBy")
  approvedStyles           Style[]              @relation("StyleApprovedBy")
  verifiedItemCompletions  CurriculumItemCompletion[] @relation("ItemVerifiedBy")

  @@index([id])
}
```

**Changes:** `profile` → `passport`, `ownedSchools` → `ownedOrganizations`, `earnedBelts`/`awardedBelts` → `rankAwards`/`awardedRankAwards`, `tournamentEntries` → `registrations`, added `directoryProfile`.

---

### Passport (replaces Profile)

```prisma
model Passport {
  id                      String   @id @default(cuid())
  displayName             String?
  legalFirstName          String?
  legalLastName           String?
  dob                     DateTime? @db.Date
  gender                  Gender?
  phoneE164               String?    // E.164 format
  emergencyContactName    String?
  emergencyContactPhoneE164 String?
  avatarUrl               String?
  bio                     String?
  socialLinks             Json?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String @unique
}
```

**Source:** plan spec `passports` table + legacy `Profile` fields (`bio`, `socialLinks`). `phone` → `phoneE164` for format clarity.

---

### DirectoryProfile (new)

```prisma
model DirectoryProfile {
  id              String              @id @default(cuid())
  visibility      DirectoryVisibility @default(MEMBERS_ONLY)
  locationCity    String?
  locationRegion  String?
  locationCountry String?             @db.Char(2) // ISO 3166-1 alpha-2
  showEmail       Boolean             @default(false)
  showPhone       Boolean             @default(false)
  showOrgs        Boolean             @default(true)
  showRanks       Boolean             @default(true)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String @unique
}
```

**Source:** plan spec `directory_profiles`. Controls what's visible in the directory search (S4).

---

### Organization (replaces School)

```prisma
model Organization {
  id         String           @id @default(cuid())
  brand      Brand
  name       String
  slug       String
  type       OrganizationType @default(DOJO)
  address    String?
  websiteUrl String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  owner        User?                    @relation("OrganizationOwner", fields: [ownerId], references: [id])
  ownerId      String?
  disciplines  OrganizationDiscipline[]
  memberships  Membership[]
  courses      Course[]
  tournaments  Tournament[]
  waivers      Waiver[]
  certifications Certification[]
  gamificationEvents GamificationEvent[]

  @@unique([brand, slug])
  @@index([brand])
  @@index([ownerId])
}
```

**Changes from School:** added `type` enum. Everything else is a rename.

---

### Discipline (replaces Style)

```prisma
model Discipline {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  code      String?  @unique  // short code: "bjj", "eskrima", "muay-thai", etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organizations OrganizationDiscipline[]
  rankSystems   RankSystem[]
  courses       Course[]
  memberships   Membership[]
  tournamentDisciplines TournamentDiscipline[]
  styles        Style[]
  gamificationEvents GamificationEvent[]
}
```

**Changes from Style:** added `code` (for programmatic lookup), added `memberships` and `tournamentDisciplines` relations.

---

### OrganizationDiscipline (replaces SchoolStyle)

```prisma
model OrganizationDiscipline {
  organizationId String
  disciplineId   String

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  discipline   Discipline   @relation(fields: [disciplineId], references: [id], onDelete: Cascade)

  @@id([organizationId, disciplineId])
}
```

Pure rename of `SchoolStyle`.

---

### RankSystem (new) + Rank (replaces Belt)

```prisma
model RankSystem {
  id           String         @id @default(cuid())
  name         String         // "Brazilian Jiu-Jitsu Belt System", "Muay Thai Prajioud System"
  kind         RankSystemKind @default(BELT)
  createdAt    DateTime       @default(now())

  discipline   Discipline @relation(fields: [disciplineId], references: [id])
  disciplineId String

  ranks Rank[]

  @@unique([disciplineId, name])
  @@index([disciplineId])
}

model Rank {
  id           String   @id @default(cuid())
  sortOrder    Int
  name         String   // "White Belt - 1 Stripe", "Blue Prajioud", "Level 3"
  shortName    String?  // "W1", "Blue", "L3"
  colorHex     String?  // "#FFFFFF", "#2563eb"
  createdAt    DateTime @default(now())

  rankSystem   RankSystem @relation(fields: [rankSystemId], references: [id])
  rankSystemId String

  // Used by divisions for eligibility ranges
  divisionRankMin Division[] @relation("DivisionRankMin")
  divisionRankMax Division[] @relation("DivisionRankMax")

  // Used by other models
  memberships  Membership[]
  rankAwards   RankAward[]
  courses      Course[]

  @@unique([rankSystemId, sortOrder])
  @@unique([rankSystemId, name])
  @@index([rankSystemId])
}
```

**Design note — BJJ stripes:** Each stripe level is a separate `Rank` row (sort_order 1–15). This matches how the legacy data already models it (`LEVEL_1` through `LEVEL_15`). Stripes are a display concern, not a schema concern — the `name` field carries "White Belt - 2 Stripes" and `shortName` carries "W2". No separate `stripes` column needed.

**Seed data preview (from TuffBuffs legacy):**

| RankSystem | Kind | Discipline | # Ranks |
| --- | --- | --- | --- |
| Brazilian Jiu-Jitsu Belt System | BELT | BJJ | 15 (White 0–3 stripe, Blue 0–3, Purple 0–3, Brown 0–1, Black) |
| Doce Pares Eskrima Level System | BELT | Eskrima | 13 (Levels 1–11 + 1st/2nd Degree Black Belt) |
| Muay Thai Prajioud System | PRAJIOUD | Muay Thai | 8 (White→Red armband) |
| Boxing Skill Levels | GRADE | Boxing | 8 (Fundamentals→Competition Ready) |
| Self Defense Levels | GRADE | Self Defense | 8 (Awareness→Multiple Attackers) |

Judo and Kajukenbo rank systems exist in the legacy data but weren't fully extracted. They'll be seeded in S5 alongside the others.

**Note on BBL:** The BBL brand uses a full IBJJF degree system (White through 10th Degree Black Belt, with coral belt distinctions at 7th–8th degree). TuffBuffs' BJJ rank system only goes to 1st Degree. At S5 seed time, we'll create a single comprehensive BJJ rank system that covers the full degree range — both brands reference the same `RankSystem`, and a student's `Membership.rankId` simply points to whichever `Rank` row matches their current level.

---

### Membership (reshaped)

```prisma
model Membership {
  id           String           @id @default(cuid())
  brand        Brand
  status       MembershipStatus @default(PENDING)
  memberNumber String?
  joinedAt     DateTime?        @db.Date
  leftAt       DateTime?        @db.Date
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  discipline     Discipline   @relation(fields: [disciplineId], references: [id])
  disciplineId   String
  style          Style?       @relation(fields: [styleId], references: [id]) // NEW Gap 4: optional substyle
  styleId        String?

  // Current rank in this discipline at this org (nullable = unranked)
  rank           Rank?        @relation(fields: [rankId], references: [id])
  rankId         String?

  roleAssignments MembershipRoleAssignment[]
  registrationEntries RegistrationEntry[]

  @@unique([userId, organizationId, disciplineId])
  @@index([brand, organizationId])
  @@index([organizationId, status])
  @@index([userId])
  @@index([styleId])
}
```

**Changes from current:**

- Removed single `role` field → replaced by `MembershipRoleAssignment` M:N (references `Role` table per Q3)
- Added `disciplineId` — membership is now per (user × org × discipline)
- Added `styleId` — optional substyle (e.g., Shotokan under Karate) per Gap 4
- Added `status` lifecycle enum
- Added `rankId` — user's current rank in this discipline at this org (Q1: direct FK)
- Added `memberNumber`, `joinedAt`, `leftAt` per plan spec
- Unique constraint changed from `[userId, schoolId, role]` → `[userId, organizationId, disciplineId]`

---

### MembershipRoleAssignment (new)

```prisma
model MembershipRoleAssignment {
  id           String   @id @default(cuid())
  assignedAt   DateTime @default(now())

  membership   Membership @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  membershipId String
  role         Role       @relation(fields: [roleId], references: [id]) // UPDATED: FK to Role table (Q3)
  roleId       String

  @@unique([membershipId, roleId])
  @@index([membershipId])
  @@index([roleId])
}
```

A user who is both STUDENT and COACH at the same (org × discipline) has two rows here. The `Role` table replaces the old `MembershipRole` enum (Q3 resolved).

---

### RankAward (replaces Progress)

```prisma
model RankAward {
  id        String   @id @default(cuid())
  awardedAt DateTime @default(now())
  notes     String?
  location  String?  // where the promotion happened (e.g., "Bass Academy, Rancho Cucamonga")
  mediaUrls Json?    // promotion photos/videos — array of URLs
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user        User   @relation("EarnedBy", fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  rank        Rank   @relation(fields: [rankId], references: [id], onDelete: Restrict)
  rankId      String
  awardedBy   User?  @relation("AwardedBy", fields: [awardedById], references: [id])
  awardedById String?

  gamificationEvents GamificationEvent[]

  @@unique([userId, rankId])
  @@index([userId, awardedAt])
  @@index([rankId])
}
```

**Changes from Progress:** `beltId` → `rankId`, added `location` and `mediaUrls`. The location and media fields come from the BBL legacy `beltInfoSchema.js` which captures where each promotion happened and promotion photos per belt — important for BBL's community features and generally useful for any brand.

---

### Course (FK renames + rankId added, Q6)

```prisma
model Course {
  id                String            @id @default(cuid())
  brand             Brand
  title             String
  slug              String
  description       String?
  certificationType CertificationType
  isPublished       Boolean           @default(false)
  publishedAt       DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  discipline     Discipline?  @relation(fields: [disciplineId], references: [id])
  disciplineId   String?
  rank           Rank?        @relation(fields: [rankId], references: [id]) // NEW Q6: connects curriculum to target rank
  rankId         String?
  curriculumItems   CurriculumItem[]
  enrollments       CourseEnrollment[]    // NEW Gap 2
  gamificationEvents GamificationEvent[] // NEW Gap 1
  certifications    Certification[]      // NEW Gap 6

  @@unique([brand, organizationId, slug])
  @@index([brand, organizationId])
  @@index([disciplineId])
}
```

`schoolId` → `organizationId`, `styleId` → `disciplineId`. No structural change.

---

### Tournament (reshaped)

```prisma
model Tournament {
  id            String           @id @default(cuid())
  brand         Brand
  name          String
  slug          String
  description   String?
  status        TournamentStatus @default(DRAFT)
  startDate     DateTime         @db.Date
  endDate       DateTime         @db.Date
  timezone      String?          // IANA timezone
  venueName     String?
  venueCity     String?
  venueRegion   String?
  venueCountry  String?          @db.Char(2)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  host            Organization          @relation(fields: [hostId], references: [id])
  hostId          String
  disciplines     TournamentDiscipline[]
  registrations   Registration[]
  waivers         Waiver[]
  staffAssignments TournamentStaffAssignment[]

  @@unique([brand, slug])
  @@index([brand, startDate])
  @@index([hostId])
}
```

**Changes:** added `status`, `timezone`, venue fields, renamed `startsAt`/`endsAt` → `startDate`/`endDate` (Date type, not DateTime). Dropped direct `registrations` from tournament — they now go through the new `Registration` model. `host` is an `Organization` (was `School`).

---

### TournamentDiscipline (new)

```prisma
model TournamentDiscipline {
  id           String  @id @default(cuid())
  rulesetName  String? // e.g., "IBJJF Rules", "WKF Kumite"

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  tournamentId String
  discipline   Discipline @relation(fields: [disciplineId], references: [id])
  disciplineId String

  divisions Division[]

  @@unique([tournamentId, disciplineId])
}
```

A tournament can host multiple disciplines. Divisions are nested under a tournament-discipline pair.

---

### Division (new)

```prisma
model Division {
  id                      String         @id @default(cuid())
  name                    String         // "Adult Male Blue Belt Featherweight"
  format                  DivisionFormat
  gender                  DivisionGender @default(ANY)
  ageMin                  Int?
  ageMax                  Int?
  weightMinKg             Decimal?       @db.Decimal(5, 2)
  weightMaxKg             Decimal?       @db.Decimal(5, 2)
  feeCents                Int            @default(0)
  capacity                Int?
  sortOrder               Int            @default(0)
  createdAt               DateTime       @default(now())

  tournamentDiscipline    TournamentDiscipline @relation(fields: [tournamentDisciplineId], references: [id], onDelete: Cascade)
  tournamentDisciplineId  String

  // Who can enter this division — FK to TournamentRole table (Q5)
  roleRequired       TournamentRole @relation("DivisionRoleRequired", fields: [roleRequiredId], references: [id])
  roleRequiredId     String

  rankMin    Rank? @relation("DivisionRankMin", fields: [rankMinId], references: [id])
  rankMinId  String?
  rankMax    Rank? @relation("DivisionRankMax", fields: [rankMaxId], references: [id])
  rankMaxId  String?

  entries            RegistrationEntry[]
  staffAssignments   TournamentStaffAssignment[]

  @@index([tournamentDisciplineId, sortOrder])
  @@index([roleRequiredId])
}
```

Rank eligibility is enforced by `rankMinId`/`rankMaxId` referencing the discipline's rank system.

---

### Registration (replaces TournamentRegistration)

```prisma
model Registration {
  id              String             @id @default(cuid())
  status          RegistrationStatus @default(STARTED)
  paymentStatus   PaymentStatus      @default(UNPAID)
  totalFeeCents   Int                @default(0)
  currency        String             @default("USD") @db.Char(3)
  submittedAt     DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  tournamentId String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String

  entries RegistrationEntry[]

  @@unique([tournamentId, userId])
  @@index([tournamentId, status])
  @@index([userId])
}
```

**Changes from TournamentRegistration:** added `status`, `paymentStatus`, `totalFeeCents`, `currency`, `submittedAt`. Removed `division`/`weightClass` strings — those now live on `RegistrationEntry`.

---

### RegistrationEntry (new)

```prisma
model RegistrationEntry {
  id                       String      @id @default(cuid())
  snapshotRankName         String?     // frozen at registration time
  snapshotOrgName          String?     // frozen at registration time
  status                   EntryStatus @default(ACTIVE)
  createdAt                DateTime    @default(now())

  registration             Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  registrationId           String
  division                 Division     @relation(fields: [divisionId], references: [id], onDelete: Restrict)
  divisionId               String
  // What role the entrant plays in this division — FK to TournamentRole (Q5)
  tournamentRole           TournamentRole @relation(fields: [tournamentRoleId], references: [id])
  tournamentRoleId         String
  representingMembership   Membership?  @relation(fields: [representingMembershipId], references: [id], onDelete: SetNull)
  representingMembershipId String?

  @@unique([registrationId, divisionId, tournamentRoleId])
  @@index([tournamentRoleId])
}
```

**Critical design:** `snapshotRankName` and `snapshotOrgName` are denormalized strings frozen at registration time. A future promotion doesn't rewrite competitive history. The `representingMembershipId` links back to the live membership for audit but the snapshots are the record of truth for the division entry.

---

### Role (new — replaces MembershipRole enum, Q3 resolved)

```prisma
model Role {
  id          String  @id @default(cuid())
  code        String  // e.g., "STUDENT", "INSTRUCTOR", "OWNER", "COACH", "ORG_ADMIN", "STYLE_APPROVER"
  name        String  // human-readable: "Student", "Instructor", etc.
  description String?
  isSystem    Boolean @default(false) // true = universal default, cannot be deleted
  brand       Brand?  // null = universal across all brands; set = brand-specific custom role
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  roleAssignments MembershipRoleAssignment[]

  @@unique([code, brand])
  @@index([brand])
}
```

**Design notes:** Universal seed roles (isSystem=true, brand=null): STUDENT, INSTRUCTOR, OWNER, COACH, ORG_ADMIN, STYLE_APPROVER. White-label SaaS clients can add custom roles scoped to their brand (e.g., brand=BBL, code="SENIOR_INSTRUCTOR"). The `isSystem` flag prevents deletion of universal defaults.

---

### TournamentRole (new — Q5 resolved)

```prisma
model TournamentRole {
  id          String  @id @default(cuid())
  code        String  // e.g., "COMPETITOR", "COACH", "JUDGE", "VOLUNTEER", "REFEREE", "TIMEKEEPER"
  name        String
  description String?
  isSystem    Boolean @default(false)
  brand       Brand?  // null = universal; set = brand-specific
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  divisionRoleRequired Division[]       @relation("DivisionRoleRequired")
  registrationEntries  RegistrationEntry[]
  staffAssignments     TournamentStaffAssignment[]

  @@unique([code, brand])
  @@index([brand])
}
```

**Design notes:** Universal seed roles (isSystem=true): COMPETITOR, COACH, JUDGE, VOLUNTEER. Tournament organizers can add custom roles per brand (e.g., "REFEREE", "TIMEKEEPER", "MEDICAL_STAFF", "CORNER_JUDGE"). `Division.roleRequired` now FKs to this table instead of using the old MembershipRole enum.

---

### Style (new — Gap 4, substyle model with approval workflow)

```prisma
model Style {
  id              String      @id @default(cuid())
  code            String      // server-slugified from name
  name            String
  status          StyleStatus @default(APPROVED)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  approvedAt      DateTime?

  discipline      Discipline  @relation(fields: [disciplineId], references: [id])
  disciplineId    String
  parentStyle     Style?      @relation("StyleParent", fields: [parentStyleId], references: [id])
  parentStyleId   String?
  childStyles     Style[]     @relation("StyleParent")
  createdBy       User?       @relation("StyleCreatedBy", fields: [createdByUserId], references: [id])
  createdByUserId String?
  approvedBy      User?       @relation("StyleApprovedBy", fields: [approvedByUserId], references: [id])
  approvedByUserId String?

  memberships     Membership[]

  @@unique([disciplineId, code])
  @@index([disciplineId, status])
}
```

**Design notes:** Disciplines are the big buckets (BJJ, Karate, Muay Thai). Styles are substyles within a discipline. Karate seeds: Shotokan, Wado-Ryu, Goju-Ryu, Hawaiian Kenpo, Kajukenbo. Parent/child hierarchy supports depth (e.g., "Kenpo" parent → "Hawaiian Kenpo" child). User-submitted styles start as PENDING; approved by org_owner/org_admin/instructor/style_approver via the Role table.

---

### SubscriptionTier (new — Q7 resolved)

```prisma
model SubscriptionTier {
  id          String  @id @default(cuid())
  code        String  // e.g., "FREE", "PREMIUM", "INSTRUCTOR", "SCHOOL_OWNER", "LEGEND"
  name        String
  description String?
  level       Int     // ordering/comparison: higher = more access. FREE=0, PREMIUM=10, etc.
  isSystem    Boolean @default(false)
  brand       Brand?  // null = universal; set = brand-specific
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subscriptions UserBrandSubscription[]

  @@unique([code, brand])
  @@index([brand, level])
}
```

---

### UserBrandSubscription (new — Q7 resolved)

```prisma
model UserBrandSubscription {
  id        String             @id @default(cuid())
  brand     Brand
  status    SubscriptionStatus @default(ACTIVE)
  startsAt  DateTime           @default(now())
  expiresAt DateTime?
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  user   User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  tier   SubscriptionTier @relation(fields: [tierId], references: [id])
  tierId String

  @@unique([userId, brand])
  @@index([brand, status])
  @@index([userId])
}
```

**Design notes:** One subscription per user per brand. Universal tiers seeded (isSystem=true, brand=null): FREE (level=0). BBL-specific tiers (brand=BBL): FREE(0), PREMIUM(10), INSTRUCTOR(20), SCHOOL_OWNER(30), LEGEND(40). Stripe wiring comes at S10 but the schema is ready. `level` int enables access checks: `if (userTier.level >= requiredTier.level)`.

---

### LineageNode (new — Q8 resolved)

```prisma
model LineageNode {
  id          String            @id @default(cuid())
  visibility  LineageVisibility @default(PUBLIC)
  isVerified  Boolean           @default(false)
  slug        String?           @unique // shareable URL: /lineage/:slug
  bio         String?           // lineage-specific bio
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String @unique

  relationshipsFrom LineageRelationship[] @relation("LineageFrom")
  relationshipsTo   LineageRelationship[] @relation("LineageTo")
}
```

---

### LineageRelationship (new — Q8 resolved)

```prisma
model LineageRelationship {
  id          String               @id @default(cuid())
  type        LineageRelationType
  description String?
  startedAt   DateTime?
  endedAt     DateTime?
  isVerified  Boolean              @default(false)
  createdAt   DateTime             @default(now())

  fromNode    LineageNode @relation("LineageFrom", fields: [fromNodeId], references: [id], onDelete: Cascade)
  fromNodeId  String
  toNode      LineageNode @relation("LineageTo", fields: [toNodeId], references: [id], onDelete: Cascade)
  toNodeId    String

  @@unique([fromNodeId, toNodeId, type])
  @@index([fromNodeId])
  @@index([toNodeId])
}
```

**Design notes:** Vertical lineage (instructor→student) is already captured by `RankAward.awardedById`. These models capture the richer graph: horizontal partner connections, affiliations, seminar links. Visibility per node allows users to control who sees their lineage. Verified status supports admin/peer verification of claimed relationships.

---

### GamificationEventType (new — Gap 1, replaces freeform eventType string)

```prisma
model GamificationEventType {
  id          String  @id @default(cuid())
  code        String  // e.g., "CLASS_ATTENDED", "BELT_AWARDED", "TOURNAMENT_PLACED", "COURSE_COMPLETED", "CURRICULUM_ITEM_COMPLETED"
  name        String
  description String?
  defaultPoints Int   @default(0) // default point value when this event fires
  isSystem    Boolean @default(false)
  brand       Brand?
  createdAt   DateTime @default(now())

  events GamificationEvent[]

  @@unique([code, brand])
  @@index([brand])
}
```

---

### GamificationEvent (reshaped — Gap 1)

```prisma
model GamificationEvent {
  id        String   @id @default(cuid())
  brand     Brand
  points    Int      @default(0)
  meta      Json?    // event-type-specific payload
  createdAt DateTime @default(now())

  user           User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  eventType      GamificationEventType @relation(fields: [eventTypeId], references: [id])
  eventTypeId    String
  // Optional FKs — link back to the source event for traceability
  rankAward      RankAward?            @relation(fields: [rankAwardId], references: [id])
  rankAwardId    String?
  course         Course?               @relation(fields: [courseId], references: [id])
  courseId       String?
  organization   Organization?         @relation(fields: [organizationId], references: [id])
  organizationId String?
  discipline     Discipline?           @relation(fields: [disciplineId], references: [id])
  disciplineId   String?

  @@index([userId, createdAt])
  @@index([brand, eventTypeId])
  @@index([rankAwardId])
  @@index([courseId])
}
```

**Changes from current:** `eventType` string → FK to `GamificationEventType` table (extensible per brand, consistent with Role/TournamentRole pattern). Added optional FKs to `RankAward`, `Course`, `Organization`, `Discipline` so gamification events are traceable to their source. A belt promotion creates both a `RankAward` and a `GamificationEvent` pointing back to it.

---

### CourseEnrollment (new — Gap 2)

```prisma
model CourseEnrollment {
  id          String    @id @default(cuid())
  enrolledAt  DateTime  @default(now())
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId   String
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  courseId  String

  itemCompletions CurriculumItemCompletion[]

  @@unique([userId, courseId])
  @@index([courseId])
  @@index([userId])
}
```

---

### CurriculumItemCompletion (new — Gap 2)

```prisma
model CurriculumItemCompletion {
  id          String   @id @default(cuid())
  completedAt DateTime @default(now())
  notes       String?
  createdAt   DateTime @default(now())

  enrollment       CourseEnrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  enrollmentId     String
  curriculumItem   CurriculumItem   @relation(fields: [curriculumItemId], references: [id], onDelete: Cascade)
  curriculumItemId String
  verifiedBy       User?            @relation("ItemVerifiedBy", fields: [verifiedById], references: [id])
  verifiedById     String?

  @@unique([enrollmentId, curriculumItemId])
  @@index([curriculumItemId])
}
```

**Design notes:** A student enrolls in a course (`CourseEnrollment`), then completes individual items (`CurriculumItemCompletion`). When all required items are complete, the system can flag the student as eligible for the course's target rank (`Course.rankId`). An instructor can then award the promotion (`RankAward`), which also fires a `GamificationEvent`. The `verifiedById` allows an instructor to sign off on individual item completions (e.g., confirming a technique was demonstrated).

---

### Waiver (new — Gap 3)

```prisma
model Waiver {
  id          String     @id @default(cuid())
  type        WaiverType
  title       String
  content     String     // full waiver text (markdown or plain text)
  version     String     @default("1.0") // version tracking for legal compliance
  isRequired  Boolean    @default(true)
  isActive    Boolean    @default(true)
  brand       Brand?     // null = universal; set = brand-specific
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Optional scoping — a waiver can belong to an org or tournament
  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?
  tournament     Tournament?   @relation(fields: [tournamentId], references: [id])
  tournamentId   String?

  signatures WaiverSignature[]

  @@index([brand, type, isActive])
  @@index([organizationId])
  @@index([tournamentId])
}
```

---

### WaiverSignature (new — Gap 3)

```prisma
model WaiverSignature {
  id        String   @id @default(cuid())
  signedAt  DateTime @default(now())
  ipAddress String?  // for legal audit
  userAgent String?  // for legal audit
  createdAt DateTime @default(now())

  waiver   Waiver @relation(fields: [waiverId], references: [id], onDelete: Restrict)
  waiverId String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId   String
  // For minors: the parent/guardian who signed on their behalf
  signedOnBehalfOf   User?  @relation("SignedOnBehalf", fields: [signedOnBehalfOfId], references: [id])
  signedOnBehalfOfId String?

  @@unique([waiverId, userId]) // one signature per waiver per user
  @@index([userId])
}
```

**Design notes:** Waivers can be scoped to an organization (membership waiver), a tournament (competition waiver), or global (brand=null). Tournament registration can require specific waivers — the registration submit flow checks `WaiverSignature` exists for all required waivers. Minor consent is handled by `signedOnBehalfOfId` — a parent signs the waiver and the FK links to the minor's user record. Version tracking supports legal compliance when waiver text changes.

---

### TournamentStaffAssignment (new — Gap 5)

```prisma
model TournamentStaffAssignment {
  id        String   @id @default(cuid())
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tournament     Tournament     @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  tournamentId   String
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  tournamentRole TournamentRole @relation(fields: [tournamentRoleId], references: [id])
  tournamentRoleId String
  // Optional: assigned to specific division(s)
  division       Division?      @relation(fields: [divisionId], references: [id])
  divisionId     String?

  @@unique([tournamentId, userId, tournamentRoleId, divisionId])
  @@index([tournamentId])
  @@index([userId])
}
```

**Design notes:** This is how judges, referees, directors, timekeepers, and medical staff get assigned to a tournament and optionally to specific divisions. Without this model, the E2E lifecycle for judge/ref/director roles has no schema home. The `TournamentRole` FK ensures tournament staff roles are extensible per brand (same pattern as `Role`).

---

### Certification (new — Gap 6)

```prisma
model Certification {
  id            String              @id @default(cuid())
  type          CertificationType   // BELT_RANK, SAFETY, COACH
  status        CertificationStatus @default(ACTIVE)
  issuedAt      DateTime            @default(now())
  expiresAt     DateTime?           // safety/coach certs can expire
  revokedAt     DateTime?
  certificateNumber String?         // external cert number if applicable
  notes         String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  organization   Organization  @relation(fields: [organizationId], references: [id])
  organizationId String
  course         Course?       @relation(fields: [courseId], references: [id])
  courseId        String?       // the course that led to this certification
  issuedBy       User?         @relation("CertIssuedBy", fields: [issuedById], references: [id])
  issuedById     String?

  @@index([userId, type, status])
  @@index([organizationId])
  @@index([courseId])
}
```

**Design notes:** `RankAward` handles belt/rank promotions specifically. `Certification` handles the broader set: safety certifications (CPR, first aid), coaching certifications, and can also record formal belt certifications with external certificate numbers. A safety cert earned through a `Course` links back via `courseId`. Expiry tracking (`expiresAt`) is critical for safety certs that need renewal. Status lifecycle: ACTIVE → EXPIRED (automatic by date) or REVOKED (manual).

---

## What is NOT changing in S1

| Model | Reason |
| --- | --- |
| `Tool`, `Category`, `Tag`, `Report`, `Ad` | Dirstarter template models — kept as working reference |
| `CurriculumItem` | Shape is fine; gains `completions` relation but no column changes |
| `Account`, `Session`, `Verification` | Better-Auth models — untouched |

---

## Resolved questions (signed off SESSION_0003)

### Q1: Rank relation on Membership — direct FK ✅

**Decision:** Keep direct FK `Membership.rankId`. Promotion updates both `Membership.rankId` and inserts `RankAward` atomically via `prisma.$transaction()`. Supports multi-discipline members (e.g., White Belt in BJJ + 2nd Degree Black Belt in Eskrima) because each `Membership` row is per-discipline with its own `rankId`.

### Q2: No stripes column ✅

**Decision:** No separate `stripes` column on `Rank`. Each stripe level is a distinct `Rank` row. Stripe info stays in `name`/`shortName` conventions. If UI needs structured stripe data, use a `metadata Json?` column.

### Q3: Role table (not enum) ✅

**Decision:** `MembershipRole` enum replaced by `Role` table. Universal defaults seeded as `isSystem=true, brand=null`. White-label SaaS clients can add custom roles per brand. `MembershipRoleAssignment` join table references `Role` by FK.

### Q4: All 7 Baseline disciplines in S1 ✅

**Decision:** Include all 7 now: BJJ, Eskrima, Muay Thai, Boxing, Self Defense, Judo, Kajukenbo. These serve as the default template for white-label clients. Full rank system data seeded per discipline.

### Q5: TournamentRole table (not enum) ✅

**Decision:** Separate `TournamentRole` table, not merged into `Role`. Tournament roles are semantically different from org membership roles. Same extensibility pattern: `isSystem` defaults (COMPETITOR, COACH, JUDGE, VOLUNTEER), brand-customizable. `Division.roleRequired` FKs to `TournamentRole`.

### Q6: Course.rankId FK added now ✅

**Decision:** Add `rankId String?` on `Course` in S1. Connects curriculum to the rank it targets, queryable from day one. Deeper curriculum structure (sections, technique metadata) stays as S6 work.

### Q7: SubscriptionTier table + UserBrandSubscription ✅

**Decision:** Option C — add lightweight subscription model now. `SubscriptionTier` as a table (extensible per brand, same pattern). `UserBrandSubscription` model: user × brand × tier + status + expiresAt. Universal tier: FREE. BBL-specific tiers: FREE, PREMIUM, INSTRUCTOR, SCHOOL_OWNER, LEGEND. Stripe wiring deferred to S10.

### Q8: LineageNode + LineageRelationship added now ✅

**Decision:** Add both models now. Vertical lineage is partially captured by `RankAward.awardedById`. These models capture the richer graph: horizontal partner connections, affiliations, seminar links, tournament partners. Per-node visibility controls. Verified status supports admin/peer verification.

---

## Gap analysis resolved (SESSION_0003)

### Gap 1: GamificationEvent FKs + GamificationEventType table ✅

**Problem:** `eventType` was a freeform string with no traceability to source events. No way to link a "belt awarded" gamification event back to the specific `RankAward`.

**Solution:** `GamificationEventType` table (extensible per brand, consistent with Role pattern). Optional FKs on `GamificationEvent` to `RankAward`, `Course`, `Organization`, `Discipline` for source traceability.

### Gap 2: CourseEnrollment + CurriculumItemCompletion ✅

**Problem:** No model for tracking student progress through a course. No way to know which curriculum items a student has completed or whether they're eligible for the course's target rank.

**Solution:** `CourseEnrollment` (user × course) + `CurriculumItemCompletion` (enrollment × item). Instructor can verify individual completions. When all required items are done, student is flagged for promotion eligibility.

### Gap 3: Waiver + WaiverSignature ✅

**Problem:** The ChatGPT plan explicitly lists "Waivers / consent" under Passport. Tournaments and orgs often require signed waivers. No model existed.

**Solution:** `Waiver` (scoped to org, tournament, or global) with version tracking. `WaiverSignature` with IP/UA for legal audit. Minor consent via `signedOnBehalfOfId`. Registration submit can enforce required waiver signatures.

### Gap 4: Style substyle model ✅

**Problem:** ChatGPT plan Delta B introduced a `styles` table for Karate substyles. Our S1 design had `Discipline` but no sub-model for substyles.

**Solution:** `Style` model with `disciplineId`, parent/child hierarchy, approval workflow (PENDING/APPROVED/REJECTED), `createdBy`/`approvedBy` user FKs. Karate seeds: Shotokan, Wado-Ryu, Goju-Ryu, Hawaiian Kenpo, Kajukenbo. `Membership` gains optional `styleId` FK.

### Gap 5: TournamentStaffAssignment ✅

**Problem:** No schema for assigning judges, referees, directors, medical staff to tournaments/divisions. The E2E lifecycle for tournament staff had no home.

**Solution:** `TournamentStaffAssignment` (tournament × user × tournamentRole, optionally scoped to division).

### Gap 6: Certification record model ✅

**Problem:** `data-model.md` lists `SafetyCertification` and `CoachCertification` but the S1 design only had `CertificationType` enum on `Course`. When someone completes a safety course, there was no record model.

**Solution:** `Certification` model with type (BELT_RANK/SAFETY/COACH), status lifecycle (ACTIVE/EXPIRED/REVOKED), expiry tracking, optional link to `Course` and issuing `User`.

---

## Migration strategy

Since no real data exists yet, this is a **destructive reset** — not an incremental migration:

1. Rewrite `schema.prisma` with the new model definitions
2. `prisma migrate dev --name s1-schema-rev` (creates fresh migration)
3. Update `lib/authz.ts` — rename all `School` → `Organization`, `Style` → `Discipline` references
4. Update `middleware.ts` — any references to old model names
5. Verify: `prisma generate` + `tsc --noEmit`

This will be SESSION_0003's work.
