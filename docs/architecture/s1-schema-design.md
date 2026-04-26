# S1 Schema Design — Phase 1 Rev

Design doc for sign-off before migration. No code changes until Brian approves.

**Author:** Petey (SESSION_0002)
**Inputs:** program-plan.md S1 row, plan-vs-current.md, ADR 0004, chatgpt-original-plan.md §2, current schema.prisma, TuffBuffs legacy rank data

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
8. Replaces single-role with `MembershipRoleAssignment` join table
9. Renames `Progress` → `RankAward` (clearer intent)
10. Reshapes `Tournament` (status enum, venue fields, org-hosted instead of school-hosted)
11. Adds `TournamentDiscipline`, `Division`, reshapes `TournamentRegistration` → `Registration`, adds `RegistrationEntry` with snapshot fields
12. Renames `Course.schoolId` → `organizationId`, `Course.styleId` → `disciplineId`

No changes to Dirstarter template models (User core, Session, Account, Verification, Tool, Category, Tag, Report, Ad). No changes to `GamificationEvent` or `CurriculumItem` beyond FK renames.

---

## Enums

```prisma
enum Brand {
  RONIN_DOJO_DESIGN
  BASELINE_MARTIAL_ARTS
  BBL
  WEKAF
}

// EXISTING — no change
enum MembershipRole {
  STUDENT
  INSTRUCTOR
  OWNER
  COACH
  JUDGE        // NEW — plan spec includes judge as tournament role
  VOLUNTEER    // NEW — plan spec includes volunteer
}

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

  // Current rank in this discipline at this org (nullable = unranked)
  rank           Rank?        @relation(fields: [rankId], references: [id])
  rankId         String?

  roleAssignments MembershipRoleAssignment[]
  registrationEntries RegistrationEntry[]

  @@unique([userId, organizationId, disciplineId])
  @@index([brand, organizationId])
  @@index([organizationId, status])
  @@index([userId])
}
```

**Changes from current:**

- Removed single `role` field → replaced by `MembershipRoleAssignment` M:N
- Added `disciplineId` — membership is now per (user × org × discipline)
- Added `status` lifecycle enum
- Added `rankId` — user's current rank in this discipline at this org
- Added `memberNumber`, `joinedAt`, `leftAt` per plan spec
- Unique constraint changed from `[userId, schoolId, role]` → `[userId, organizationId, disciplineId]`

---

### MembershipRoleAssignment (new)

```prisma
model MembershipRoleAssignment {
  id           String         @id @default(cuid())
  role         MembershipRole
  assignedAt   DateTime       @default(now())

  membership   Membership @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  membershipId String

  @@unique([membershipId, role])
  @@index([membershipId])
}
```

A user who is both STUDENT and COACH at the same (org × discipline) has two rows here.

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

  @@unique([userId, rankId])
  @@index([userId, awardedAt])
  @@index([rankId])
}
```

**Changes from Progress:** `beltId` → `rankId`, added `location` and `mediaUrls`. The location and media fields come from the BBL legacy `beltInfoSchema.js` which captures where each promotion happened and promotion photos per belt — important for BBL's community features and generally useful for any brand.

---

### Course (FK renames only)

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
  curriculumItems CurriculumItem[]

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
  roleRequired            MembershipRole @default(STUDENT) // who can enter: competitor, coach, judge, volunteer
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

  rankMin    Rank? @relation("DivisionRankMin", fields: [rankMinId], references: [id])
  rankMinId  String?
  rankMax    Rank? @relation("DivisionRankMax", fields: [rankMaxId], references: [id])
  rankMaxId  String?

  entries RegistrationEntry[]

  @@index([tournamentDisciplineId, sortOrder])
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
  role                     MembershipRole @default(STUDENT)
  snapshotRankName         String?     // frozen at registration time
  snapshotOrgName          String?     // frozen at registration time
  status                   EntryStatus @default(ACTIVE)
  createdAt                DateTime    @default(now())

  registration             Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  registrationId           String
  division                 Division     @relation(fields: [divisionId], references: [id], onDelete: Restrict)
  divisionId               String
  representingMembership   Membership?  @relation(fields: [representingMembershipId], references: [id], onDelete: SetNull)
  representingMembershipId String?

  @@unique([registrationId, divisionId, role])
}
```

**Critical design:** `snapshotRankName` and `snapshotOrgName` are denormalized strings frozen at registration time. A future promotion doesn't rewrite competitive history. The `representingMembershipId` links back to the live membership for audit but the snapshots are the record of truth for the division entry.

---

## What is NOT changing in S1

| Model | Reason |
| --- | --- |
| `Tool`, `Category`, `Tag`, `Report`, `Ad` | Dirstarter template models — kept as working reference |
| `GamificationEvent` | Shape is fine; no S1 dependency |
| `CurriculumItem` | Shape is fine; only its parent `Course` gets FK renames |
| `Account`, `Session`, `Verification` | Better-Auth models — untouched |

---

## Open questions for sign-off

### Q1: Rank relation on Membership — direct FK or through RankAward?

**Current design:** `Membership.rankId` is a direct FK to the user's current rank. `RankAward` is the historical log of all awards.

**Alternative:** No `rankId` on Membership; derive current rank from the latest `RankAward` for that (user × discipline).

**Recommendation:** Keep the direct FK. It's faster to query ("what rank is this person at this org?"), and the `RankAward` table serves as the audit log. When a promotion happens, update both atomically.

### Q2: Should `Rank` have a `stripes` column for BJJ?

**Current design:** Each stripe level is a distinct Rank row (15 rows for BJJ). Stripe count is embedded in the `name` and `shortName`.

**Alternative:** Add an optional `stripes Int?` column so UI can render stripe indicators without parsing the name.

**Recommendation:** No separate column for now. If the UI needs stripe count, extract it from `shortName` conventions or add a `metadata Json?` column on Rank for discipline-specific display hints. Avoids polluting a universal model with BJJ-specific fields.

### Q3: Should `MembershipRole` stay as an enum or become a table?

**Plan spec** uses a `roles` table (`id`, `code`, `name`). Our current schema uses an enum.

**Recommendation:** Stay with the enum for MVP. We have a known, small set of roles (STUDENT, INSTRUCTOR, OWNER, COACH, JUDGE, VOLUNTEER). If custom roles emerge post-MVP, migrate to a table then. The `MembershipRoleAssignment` join table structure doesn't change either way.

### Q4: Judo and Kajukenbo — include in S1 schema or defer to S5 seed?

Both exist in the legacy data. The schema supports them already (just add `Discipline` rows + `RankSystem` + `Rank` rows). No schema change needed.

**Recommendation:** Defer to S5. The schema is discipline-agnostic. Seeding specific discipline data is S5's job.

### Q5: Should `Division.roleRequired` use `MembershipRole` or a separate `DivisionRole` enum?

The plan spec uses a smaller enum (`competitor, coach, judge, volunteer`). Our `MembershipRole` includes `STUDENT`, `INSTRUCTOR`, `OWNER` which don't map cleanly to tournament roles.

**Recommendation:** Use `MembershipRole` for now — `STUDENT` means "competitor" in a tournament context. If the semantic mismatch bothers us, we can add a `TournamentRole` enum later. Not worth the extra type for MVP.

### Q6: Should `Course` get a `rankId` FK in S1 to connect curriculum to ranks?

The legacy TuffBuffs data shows a clear pattern: each curriculum level maps to a rank (e.g., `level1Curriculum` → `BJJ_LEVELS.LEVEL_1`). Currently `Course` has no rank connection — a course can have a `disciplineId` but no way to say "this course covers Blue Belt requirements."

**Option A:** Add `rankId String?` to `Course` now (one nullable FK, cheap).
**Option B:** Defer entirely to S6 when curriculum CRUD is the sprint focus.

**Recommendation:** Option A — add the FK now. It's one line, avoids a migration in S6, and makes the curriculum→rank relationship queryable from day one. The deeper curriculum structure (sections, technique metadata, key points, tags, `isRequired` flags) stays as S6 work.

### Q7: Should S1 include a subscription tier model?

BBL's `bblTiers.js` reveals a **paid access tier** system (Free → Premium → Instructor → School Owner → Legend) that's orthogonal to `MembershipRole`. Roles describe *what you do* (student, instructor, coach); tiers describe *what you can access* (free techniques vs. premium library, limited vs. unlimited favorites). TuffBuffs has an equivalent via `ACCESS_LEVELS` (PUBLIC/STUDENT/MEMBER) on curriculum items.

This is a cross-brand need — every brand will want free vs. paid feature gating.

**Option A:** Add a `SubscriptionTier` enum + `subscriptionTier` field on `Membership` or `User` now.
**Option B:** Defer to S10 (Payments + Stripe) when we have the payment infrastructure to enforce tiers.
**Option C:** Add a lightweight `UserBrandSubscription` model now (user × brand × tier + expiresAt) so the schema is ready, even though Stripe wiring comes later.

**Recommendation:** Option C if we want to be forward-looking — the model is small and it avoids a migration at S10. But Option B is defensible if we want to stay lean. This is a sign-off question.

### Q8: Should S1 include a lineage model?

BBL's `lineageSchemas.js` reveals a **martial arts lineage tree** — who trained under whom, going back generations. This is a core BBL feature but applies to all brands (every practitioner has a lineage). The legacy data models:

- **Vertical lineage:** instructor → student teaching chain
- **School grouping:** instructors clustered under academies
- **Partner relationships:** horizontal connections (tournament partners, affiliations, training partners, seminar connections)
- **Visibility controls:** public/unlisted/restricted/private per node

Our current schema partially covers this: `RankAward.awardedById` captures "who promoted me" and `Organization` captures school grouping. But the full lineage is richer — it's a graph, not just individual promotions. Key missing pieces:

1. **`LineageNode`** — a user's place in the lineage tree, with visibility, verified status, and shareable slug
2. **`LineageRelationship`** — horizontal partner connections between nodes (type: tournament/affiliation/training/seminar/competition_team)

**Option A:** Add `LineageNode` + `LineageRelationship` models now.
**Option B:** Defer entirely — lineage is a feature, not foundation. Build it when a sprint calls for it.

**Recommendation:** Option B — defer. Lineage is important but it's a feature build, not a schema foundation. The `RankAward.awardedById` chain already captures the vertical lineage data implicitly. When we build the lineage UI (likely post-MVP or as a BBL-specific sprint), we can add these models then. The existing schema doesn't block it.

---

## Migration strategy

Since no real data exists yet, this is a **destructive reset** — not an incremental migration:

1. Rewrite `schema.prisma` with the new model definitions
2. `prisma migrate dev --name s1-schema-rev` (creates fresh migration)
3. Update `lib/authz.ts` — rename all `School` → `Organization`, `Style` → `Discipline` references
4. Update `middleware.ts` — any references to old model names
5. Verify: `prisma generate` + `tsc --noEmit`

This will be SESSION_0003's work.
