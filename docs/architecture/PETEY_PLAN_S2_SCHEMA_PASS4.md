---
title: "Petey Plan — S2 Schema Pass 4: Media, Techniques, Certificates, Gamification Alignment"
slug: petey-plan-s2-schema-pass4
type: plan
status: signed-off
created: 2026-04-28
updated: 2026-04-28
last_agent: copilot-session-0022
sprint: S2
pairs_with:
  - docs/architecture/s2-schema-additions.md
  - docs/ronin_dojo_baseline_systems_pack/08_SOP_DATA_AND_WIRING_FLOWS_BASELINE.md
  - docs/ronin_dojo_baseline_systems_pack/09_SOP_E2E_USER_LIFECYCLE_BASELINE.md
  - docs/ronin_dojo_baseline_systems_pack/11_CONTENT_ENGINE_COMMAND_CENTER_AND_INTAKE_BASELINE.md
  - docs/knowledge/wiki/content-engine/curriculum-extract-schema.md
backlinks:
  - docs/sprints/SESSION_0022.md
  - docs/knowledge/wiki/index.md
---

# Petey Plan — S2 Schema Pass 4

## Context

Pass 1–3 of `s2-schema-additions.md` landed 38 new models and 29 new enums. This pass closes the remaining gaps identified by:

1. **Grill audit** against blackbeltlegacy.com advertised features
2. **SOP sweep** across `08_DATA_FLOWS`, `09_E2E_LIFECYCLE`, `10_AGENT_WORKFLOWS`, `11_CONTENT_ENGINE`
3. **User requirements**: media uploads, technique library + graph, certificates (purchasable digital/physical), favorites, student lists, gamification alignment
4. **Content engine status alignment** — `ContentAtomStatus` enum vs. content engine SOP states

## Objective

Add all remaining models/enums to `s2-schema-additions.md` so the spec is **complete and sign-off-ready** before migration begins. No code in this plan — spec only.

---

## Gap inventory

### GAP 1: Media / Upload system (CRITICAL)

**Source:** BBL landing page ("customizable profiles with space for media"), every user role needs photo/video.

**Problem:** No `Media` model. Current schema uses scattered `avatarUrl`, `imageUrl`, `mediaUrl`, `mediaUrls: Json` fields. No unified upload tracking, no YouTube link support, no S3 reference model.

**Who needs it:**
- Student: profile photos, promotion photos, training videos
- Instructor: technique videos, profile media, class photos
- School owner: promo reels, event galleries, logo/branding assets
- Admin: content engine media assets

**Solution:** `Media` model with polymorphic attach via a `MediaAttachment` join table (cleaner than nullable FKs).

### GAP 2: Technique library + TechniqueGraph (CRITICAL)

**Source:** BBL landing page ("curriculum and technique libraries with custom filters", "technique breakdowns and video libraries"), muay-technique-graph.png and bjj-technique-graph.png flow chart components from tuffbuffs.

**Problem:** `CurriculumItem` is an ordered line inside a `Course` — not a standalone, browsable, filterable technique. No graph/prerequisite relationships between techniques.

**Solution:**
- `Technique` model — standalone, filterable, taggable, linked to discipline/style
- `TechniquePrerequisite` self-join — directed graph (prereq → technique) for the TechniqueGraph component
- `TechniqueCurriculumLink` M:N join — one technique appears in multiple curriculum items
- Technique fields align with `CurriculumExtract` interface from `curriculum-extract-schema.md`

### GAP 3: Certificate products (CRITICAL)

**Source:** User requirement — sell digital and physical belt certificates, seminar certificates, course completion certificates. Show on profile.

**Problem:** `Certification` model exists but tracks credential STATUS only (ACTIVE/EXPIRED/REVOKED). It doesn't model:
- A purchasable certificate PRODUCT (digital PDF, physical printed)
- Order/fulfillment for physical certificates
- The displayable certificate on a profile page
- Pricing / payment linkage

**Solution:**
- `CertificateTemplate` — the template (layout, fields, branding) for a certificate type
- `CertificateOrder` — purchase record linking user → template → payment
- `CertificateIssuance` — the actual issued certificate (PDF URL, serial number, QR verification code)
- Extend `Certification` with `issuanceId` FK to link credential → issued certificate
- `CertificateDeliveryMethod` enum: DIGITAL, PHYSICAL, BOTH
- Physical fulfillment tracked via `shippingStatus` on `CertificateOrder`

### GAP 4: Favorites / Bookmarks (MODERATE)

**Source:** BBL landing page ("save favorites and student lists").

**Solution:** `Favorite` model with `entityType` + `entityId` polymorphic pattern (simpler than multiple nullable FKs, works for any future entity).

### GAP 5: Student lists / custom groups (MODERATE)

**Source:** BBL landing page ("save favorites and student lists"), instructor workflow need.

**Solution:** `StudentList` + `StudentListMember` join table. Owned by instructor/admin, scoped to organization.

### GAP 6: DirectoryProfile media enrichment (MINOR)

**Source:** BBL profiles show cover photo, video intro, gallery.

**Solution:** Add `coverPhotoUrl`, `videoIntroUrl` fields to `DirectoryProfile`. Gallery handled by `Media` + `MediaAttachment`.

### GAP 7: ContentAtomStatus enum misalignment (MINOR)

**Source:** `11_CONTENT_ENGINE_COMMAND_CENTER` §2 defines states: INBOX, TRIAGE, ATOMIZING, SCRIPTING, RECORDING, EDITING, READY_REVIEW, READY_PUBLISH, PUBLISHED, ARCHIVED.

Current `ContentAtomStatus`: INBOX, DRAFT, REVIEW, APPROVED, PUBLISHED, ARCHIVED.

**Decision needed:** Do we expand the enum to match the full content engine SOP, or keep the current simpler set and let the command center dashboard use `ContentTask` status for granular workflow states?

**Recommendation:** Keep `ContentAtomStatus` as-is (6 states). The SOP's granular states (TRIAGE, ATOMIZING, SCRIPTING, RECORDING, EDITING) are **workflow phases**, not atom lifecycle states. They map to `ContentTask.type` + `ContentTask.status` combinations. The atom itself moves through INBOX → DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED. The tasks track the work within each phase.

### GAP 8: Content intake record (MINOR)

**Source:** `11_CONTENT_ENGINE` §4 defines an intake record shape separate from ContentAtom.

**Decision needed:** Separate `ContentIntake` model or use ContentAtom with status=INBOX?

**Recommendation:** Use ContentAtom with status=INBOX. The intake record fields (source_type, raw_media_present, suggested_outputs) map to `ContentAtom.meta` Json field. Adding a `sourceType` enum field to ContentAtom is cleaner than a separate model. Avoids double-entry.

### GAP 9: Gamification ↔ Technique/Curriculum alignment (MODERATE)

**Source:** User requirement — gamification, rank, courses, techniques all need to be aligned.

**Problem:** `GamificationEvent` links to `RankAward` and `Course` but NOT to:
- Technique completion/mastery
- CurriculumItem completion
- Attendance streaks
- Belt test passage

**Solution:**
- Add `techniqueId` FK to `GamificationEvent` — points for technique mastery
- Add `curriculumItemCompletionId` FK to `GamificationEvent` — points for curriculum progress
- Add `attendanceId` FK to `GamificationEvent` — points for attendance (closing the CheckIn → Attendance → GamificationEvent chain documented in s2-schema-additions)
- Add `beltTestRegistrationId` FK to `GamificationEvent` — points for passing belt test
- Add new `GamificationEventType` seed codes: `TECHNIQUE_MASTERED`, `CURRICULUM_ITEM_COMPLETED`, `ATTENDANCE_STREAK_7`, `ATTENDANCE_STREAK_30`, `BELT_TEST_PASSED`, `COURSE_COMPLETED`, `FIRST_TOURNAMENT`, `FIRST_CLASS`

### GAP 10: Technique mastery tracking (MODERATE)

**Source:** TechniqueGraph component needs to know which techniques a student has "completed" or "mastered" to color the graph nodes.

**Solution:** `TechniqueProgress` model — tracks per-user, per-technique mastery status with instructor verification.

---

## New models (Pass 4)

### Enums

```prisma
enum MediaType {
  IMAGE
  VIDEO
  YOUTUBE
  DOCUMENT
}

enum CertificateDeliveryMethod {
  DIGITAL
  PHYSICAL
  BOTH
}

enum ShippingStatus {
  NOT_APPLICABLE
  PENDING
  SHIPPED
  DELIVERED
}

enum TechniqueCategory {
  STRIKE
  KICK
  THROW
  SUBMISSION
  SWEEP
  ESCAPE
  BLOCK
  FORM
  DRILL
  CONDITIONING
  TRANSITION
  TAKEDOWN
}

enum TechniquePosition {
  STANDING
  GUARD
  HALF_GUARD
  MOUNT
  SIDE_CONTROL
  BACK
  TURTLE
  CLINCH
  OPEN
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

enum TechniqueProgressStatus {
  NOT_STARTED
  LEARNING
  DRILLING
  SPARRING
  MASTERED
}

enum FavoriteEntityType {
  TECHNIQUE
  CONTENT_ATOM
  EVENT
  USER_PROFILE
  COURSE
  ORGANIZATION
}

enum ContentSourceType {
  MANUAL
  VOICE_MEMO
  VIDEO_CAPTURE
  CLASS_NOTE
  TOURNAMENT_RESULT
  SESSION_FILE
  WIKI_PAGE
  IPHONE_SHORTCUT
  OPERATOR_REQUEST
}
```

### Models

#### Media

```prisma
model Media {
  id            String    @id @default(cuid())
  brand         Brand
  type          MediaType
  url           String         /// S3 key or full YouTube URL
  thumbnailUrl  String?
  title         String?
  description   String?
  altText       String?        /// accessibility
  mimeType      String?        /// "image/jpeg", "video/mp4"
  sizeBytes     Int?
  widthPx       Int?
  heightPx      Int?
  durationSec   Int?           /// for video
  sortOrder     Int            @default(0)
  isPublic      Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  uploadedBy     User          @relation("MediaUploadedBy", fields: [uploadedById], references: [id])
  uploadedById   String
  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?

  attachments MediaAttachment[]

  @@index([brand, uploadedById])
  @@index([organizationId])
  @@index([type])
}
```

#### MediaAttachment

Polymorphic join: attaches a Media to any entity. Exactly one entity FK is non-null per row.

```prisma
model MediaAttachment {
  id        String   @id @default(cuid())
  purpose   String?  /// "gallery", "cover", "technique_video", "promotion_photo", "certificate_bg"
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  media   Media  @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  mediaId String

  // Attach points — exactly one non-null per row
  passportId          String?
  techniqueId         String?
  eventId             String?
  rankAwardId         String?
  courseId             String?
  organizationId      String?
  contentAtomId       String?
  certificateTemplateId String?

  @@index([mediaId])
  @@index([passportId])
  @@index([techniqueId])
  @@index([eventId])
  @@index([rankAwardId])
  @@index([courseId])
  @@index([organizationId])
  @@index([contentAtomId])
  @@index([certificateTemplateId])
}
```

#### Technique

Standalone, browsable, filterable technique entry. Aligns with `CurriculumExtract` interface.

```prisma
model Technique {
  id               String             @id @default(cuid())
  brand            Brand
  name             String
  slug             String
  description      String?
  position         TechniquePosition?
  category         TechniqueCategory?
  difficultyLevel  DifficultyLevel?
  isGi             Boolean?           /// null = both
  isFoundational   Boolean            @default(false)
  requiresPartner  Boolean            @default(false)
  requiresEquipment Boolean           @default(false)
  movementPattern  String?            /// "linear", "circular", "angular" — free text for flexibility
  rangeBand        String?            /// "close", "mid", "long", "clinch", "ground"
  teachingCues     String[]           /// ["shoulder relaxed", "return on same line"]
  commonErrors     String[]           /// ["dropping guard", "telegraphing"]
  safetyNotes      String?
  isPublished      Boolean            @default(false)
  sortOrder        Int                @default(0)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  discipline     Discipline   @relation(fields: [disciplineId], references: [id])
  disciplineId   String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  style          Style?       @relation(fields: [styleId], references: [id])
  styleId        String?
  beltLevelMin   Rank?        @relation("TechBeltMin", fields: [beltLevelMinId], references: [id])
  beltLevelMinId String?
  beltLevelMax   Rank?        @relation("TechBeltMax", fields: [beltLevelMaxId], references: [id])
  beltLevelMaxId String?

  mediaAttachments   MediaAttachment[]
  curriculumLinks    TechniqueCurriculumLink[]
  prerequisiteFor    TechniquePrerequisite[]    @relation("TechPrereqTarget")
  prerequisites      TechniquePrerequisite[]    @relation("TechPrereqSource")
  progress           TechniqueProgress[]
  favorites          Favorite[]
  gamificationEvents GamificationEvent[]

  @@unique([brand, organizationId, slug])
  @@index([brand, disciplineId])
  @@index([position, category])
  @@index([disciplineId, difficultyLevel])
}
```

#### TechniquePrerequisite

Directed graph edge for TechniqueGraph component. "You need X before you can learn Y."

```prisma
model TechniquePrerequisite {
  id          String   @id @default(cuid())
  description String?  /// "Must understand basic guard before learning sweeps"
  isStrict    Boolean  @default(false) /// strict = blocks progression; soft = recommended
  createdAt   DateTime @default(now())

  technique       Technique @relation("TechPrereqTarget", fields: [techniqueId], references: [id], onDelete: Cascade)
  techniqueId     String
  prerequisite    Technique @relation("TechPrereqSource", fields: [prerequisiteId], references: [id], onDelete: Cascade)
  prerequisiteId  String

  @@unique([techniqueId, prerequisiteId])
  @@index([techniqueId])
  @@index([prerequisiteId])
}
```

#### TechniqueCurriculumLink

M:N: one technique can appear in multiple curriculum items; one curriculum item can reference multiple techniques.

```prisma
model TechniqueCurriculumLink {
  techniqueId      String
  curriculumItemId String
  sortOrder        Int @default(0)

  technique      Technique      @relation(fields: [techniqueId], references: [id], onDelete: Cascade)
  curriculumItem CurriculumItem @relation(fields: [curriculumItemId], references: [id], onDelete: Cascade)

  @@id([techniqueId, curriculumItemId])
}
```

#### TechniqueProgress

Per-user, per-technique mastery tracking. Powers TechniqueGraph node coloring.

```prisma
model TechniqueProgress {
  id           String                  @id @default(cuid())
  status       TechniqueProgressStatus @default(NOT_STARTED)
  lastDrilledAt DateTime?
  notes        String?
  createdAt    DateTime                @default(now())
  updatedAt    DateTime                @updatedAt

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String
  technique    Technique @relation(fields: [techniqueId], references: [id], onDelete: Cascade)
  techniqueId  String
  verifiedBy   User?     @relation("TechProgressVerifiedBy", fields: [verifiedById], references: [id])
  verifiedById String?

  @@unique([userId, techniqueId])
  @@index([userId, status])
  @@index([techniqueId])
}
```

#### CertificateTemplate

The printable/downloadable template for a certificate type. Reusable across orgs.

```prisma
model CertificateTemplate {
  id              String                   @id @default(cuid())
  brand           Brand
  name            String                   /// "Belt Rank Certificate", "Seminar Attendance"
  type            CertificationType        /// BELT_RANK, SAFETY, COACH + new values below
  deliveryMethod  CertificateDeliveryMethod @default(DIGITAL)
  description     String?
  layoutConfig    Json?                    /// template layout: logo placement, fields, fonts
  backgroundUrl   String?                  /// background image/PDF template URL
  priceCents      Int                      @default(0)    /// 0 = included, >0 = purchasable
  currency        String                   @default("USD") @db.Char(3)
  isActive        Boolean                  @default(true)
  createdAt       DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt

  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?       /// null = platform-wide template

  orders         CertificateOrder[]
  issuances      CertificateIssuance[]
  mediaAttachments MediaAttachment[]

  @@index([brand, type])
  @@index([organizationId])
}
```

#### CertificateOrder

Purchase record for a certificate (digital download or physical shipment).

```prisma
model CertificateOrder {
  id                    String         @id @default(cuid())
  amountCents           Int
  currency              String         @default("USD") @db.Char(3)
  paymentStatus         PaymentStatus  @default(UNPAID)
  shippingStatus        ShippingStatus @default(NOT_APPLICABLE)
  shippingName          String?
  shippingAddressLine1  String?
  shippingAddressLine2  String?
  shippingCity          String?
  shippingState         String?
  shippingZip           String?
  shippingCountry       String?        @default("US")
  trackingNumber        String?
  stripePaymentIntentId String?
  notes                 String?
  orderedAt             DateTime       @default(now())
  shippedAt             DateTime?
  deliveredAt           DateTime?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId             String
  certificateTemplate CertificateTemplate @relation(fields: [certificateTemplateId], references: [id])
  certificateTemplateId String

  issuance CertificateIssuance?

  @@index([userId])
  @@index([certificateTemplateId])
  @@index([paymentStatus])
}
```

#### CertificateIssuance

The actual issued certificate artifact. Contains the PDF URL, serial number, QR verification code. Displayed on profile.

```prisma
model CertificateIssuance {
  id                String   @id @default(cuid())
  certificateNumber String   @unique /// human-readable serial: "BMA-BELT-2026-00142"
  qrVerificationCode String  @unique /// UUID for public verification URL
  pdfUrl            String?          /// S3 URL to generated PDF
  issuedAt          DateTime @default(now())
  expiresAt         DateTime?
  revokedAt         DateTime?
  meta              Json?            /// { recipientName, rankName, orgName, instructorName, date }
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  certificateTemplate CertificateTemplate @relation(fields: [certificateTemplateId], references: [id])
  certificateTemplateId String
  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                String
  certification         Certification?      @relation(fields: [certificationId], references: [id])
  certificationId       String?             /// links to the credential record
  order                 CertificateOrder?   @relation(fields: [orderId], references: [id])
  orderId               String?             @unique /// null if auto-issued (included in membership)

  @@index([userId])
  @@index([certificateTemplateId])
  @@index([certificationId])
}
```

#### Favorite

Universal bookmark. Polymorphic via entityType + entityId.

```prisma
model Favorite {
  id         String             @id @default(cuid())
  entityType FavoriteEntityType
  entityId   String             /// cuid of the bookmarked entity
  notes      String?
  createdAt  DateTime           @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  @@unique([userId, entityType, entityId])
  @@index([userId, entityType])
}
```

#### StudentList + StudentListMember

Ad-hoc groups: test group, competition team, demo team, etc.

```prisma
model StudentList {
  id          String   @id @default(cuid())
  name        String   /// "Competition Team", "Belt Test Group May 2026"
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdBy      User         @relation("ListCreatedBy", fields: [createdById], references: [id])
  createdById    String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String

  members StudentListMember[]

  @@index([createdById])
  @@index([organizationId])
}

model StudentListMember {
  id        String   @id @default(cuid())
  addedAt   DateTime @default(now())

  studentList   StudentList @relation(fields: [studentListId], references: [id], onDelete: Cascade)
  studentListId String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String

  @@unique([studentListId, userId])
  @@index([userId])
}
```

---

## Modifications to existing models

### CertificationType — expand enum

```prisma
enum CertificationType {
  BELT_RANK
  SAFETY
  COACH
  SEMINAR_ATTENDANCE    /// NEW
  COURSE_COMPLETION     /// NEW
  TOURNAMENT_PLACEMENT  /// NEW
  INSTRUCTOR            /// NEW
}
```

### ContentAtom — add sourceType field

```prisma
model ContentAtom {
  // ...existing fields...
  sourceType ContentSourceType? /// NEW — intake source tracking
}
```

### DirectoryProfile — add media fields

```prisma
model DirectoryProfile {
  // ...existing fields...
  coverPhotoUrl  String?  /// NEW
  videoIntroUrl  String?  /// NEW — YouTube or S3
}
```

### GamificationEvent — add technique/curriculum/attendance/beltTest FKs

```prisma
model GamificationEvent {
  // ...existing fields and relations...

  // NEW relations — close the gamification loop
  technique                Technique?               @relation(fields: [techniqueId], references: [id])
  techniqueId              String?
  attendance               Attendance?              @relation(fields: [attendanceId], references: [id])
  attendanceId             String?
  curriculumItemCompletion CurriculumItemCompletion? @relation(fields: [curriculumItemCompletionId], references: [id])
  curriculumItemCompletionId String?
  beltTestRegistration     BeltTestRegistration?    @relation(fields: [beltTestRegistrationId], references: [id])
  beltTestRegistrationId   String?
}
```

### Certification — add issuance link

```prisma
model Certification {
  // ...existing fields...
  issuance CertificateIssuance?
}
```

### Rank — add technique belt-level relations

```prisma
model Rank {
  // ...existing relations...
  techniqueBeltMin Technique[] @relation("TechBeltMin")
  techniqueBeltMax Technique[] @relation("TechBeltMax")
}
```

### CurriculumItem — add technique link relation

```prisma
model CurriculumItem {
  // ...existing relations...
  techniqueLinks TechniqueCurriculumLink[]
}
```

### User — new relations (Pass 4)

```prisma
model User {
  // ...existing relations...

  // PASS 4 additions
  uploadedMedia         Media[]              @relation("MediaUploadedBy")
  favorites             Favorite[]
  studentListMemberships StudentListMember[]
  createdStudentLists   StudentList[]        @relation("ListCreatedBy")
  techniqueProgress     TechniqueProgress[]
  verifiedTechProgress  TechniqueProgress[]  @relation("TechProgressVerifiedBy")
  certificateOrders     CertificateOrder[]
  certificateIssuances  CertificateIssuance[]
}
```

### Organization — new relations (Pass 4)

```prisma
model Organization {
  // ...existing relations...

  // PASS 4 additions
  media              Media[]
  techniques         Technique[]
  studentLists       StudentList[]
  certificateTemplates CertificateTemplate[]
}
```

### Discipline — new relation

```prisma
model Discipline {
  // ...existing relations...
  techniques Technique[]
}
```

### Style — new relation

```prisma
model Style {
  // ...existing relations...
  techniques Technique[]
}
```

### Attendance — new relation

```prisma
model Attendance {
  // ...existing relations...
  gamificationEvents GamificationEvent[]
}
```

### BeltTestRegistration — new relation

```prisma
model BeltTestRegistration {
  // ...existing relations...
  gamificationEvents GamificationEvent[]
}
```

### CurriculumItemCompletion — new relation

```prisma
model CurriculumItemCompletion {
  // ...existing relations...
  gamificationEvents GamificationEvent[]
}
```

---

## Pass 4 model count

| Category | New models | New enums |
|---|---|---|
| Media system | 2 (Media, MediaAttachment) | 1 (MediaType) |
| Technique library + graph | 4 (Technique, TechniquePrerequisite, TechniqueCurriculumLink, TechniqueProgress) | 4 (TechniqueCategory, TechniquePosition, DifficultyLevel, TechniqueProgressStatus) |
| Certificate products | 3 (CertificateTemplate, CertificateOrder, CertificateIssuance) | 2 (CertificateDeliveryMethod, ShippingStatus) |
| Favorites | 1 (Favorite) | 1 (FavoriteEntityType) |
| Student lists | 2 (StudentList, StudentListMember) | 0 |
| Content engine | 0 (field additions only) | 1 (ContentSourceType) |
| Gamification alignment | 0 (FK additions only) | 0 |
| **Pass 4 total** | **12 new models** | **9 new enums** |

---

## Updated grand total (Pass 1 + 2 + 3 + 4)

| | Pass 1 | Pass 2 | Pass 3 | Pass 4 | Combined |
|---|---|---|---|---|---|
| New models | 24 | 9 | 5 | 12 | **50** |
| New enums | 17 | 8 | 4 | 9 | **38** |
| **Total platform models** | | | | | **~86** (36 existing + 50 new) |

---

## Gamification alignment matrix

This closes the loop: every meaningful user action can trigger points.

| User action | Trigger entity | GamificationEvent FK | Seed event type code |
|---|---|---|---|
| Attend class | Attendance | `attendanceId` | `CLASS_ATTENDED` |
| 7-day streak | Attendance (derived) | `attendanceId` | `ATTENDANCE_STREAK_7` |
| 30-day streak | Attendance (derived) | `attendanceId` | `ATTENDANCE_STREAK_30` |
| Complete curriculum item | CurriculumItemCompletion | `curriculumItemCompletionId` | `CURRICULUM_ITEM_COMPLETED` |
| Complete course | CourseEnrollment | `courseId` | `COURSE_COMPLETED` |
| Master technique | TechniqueProgress | `techniqueId` | `TECHNIQUE_MASTERED` |
| Pass belt test | BeltTestRegistration | `beltTestRegistrationId` | `BELT_TEST_PASSED` |
| Earn rank | RankAward | `rankAwardId` | `RANK_PROMOTED` (exists) |
| First tournament | Registration | (via meta) | `FIRST_TOURNAMENT` |
| Win match | Match (via meta) | (via meta) | `MATCH_WON` |

---

## TechniqueGraph component data contract

The TechniqueGraph component (porting muay-technique-graph / bjj-technique-graph from TuffBuffs) needs this query shape:

```typescript
interface TechniqueGraphNode {
  id: string
  name: string
  position: TechniquePosition
  category: TechniqueCategory
  difficultyLevel: DifficultyLevel
  isFoundational: boolean
  progressStatus: TechniqueProgressStatus  // from TechniqueProgress for current user
  prerequisites: string[]                   // technique IDs
  prerequisiteFor: string[]                 // technique IDs
}

// Query: all techniques for a discipline + org, with user's progress overlaid
// Render: directed graph with colored nodes (not started / learning / drilling / sparring / mastered)
```

Schema supports this via:
- `Technique` → filtered by discipline + org
- `TechniquePrerequisite` → graph edges
- `TechniqueProgress` → per-user coloring
- `Media` via `MediaAttachment` → video thumbnails on hover

---

## Certificate product flow

```text
Admin creates CertificateTemplate
  |
  +--> type: BELT_RANK / SEMINAR_ATTENDANCE / COURSE_COMPLETION
  +--> deliveryMethod: DIGITAL / PHYSICAL / BOTH
  +--> priceCents: 0 (included) or > 0 (purchasable)
  |
  v
Student earns Certification (belt test, course, seminar)
  |
  v
System or admin creates CertificateIssuance
  |
  +--> generates PDF (digital)
  +--> assigns certificateNumber + qrVerificationCode
  |
  v
If purchasable → CertificateOrder created
  |
  +--> payment via existing Invoice/Payment flow
  +--> if PHYSICAL → shippingStatus tracked
  |
  v
Certificate appears on user's profile
  |
  v
Public verification via QR code → /verify/:qrVerificationCode
```

---

## SOP alignment check

| SOP document | Schema gaps found | Resolution |
|---|---|---|
| `08_DATA_FLOWS` §5 Identity shell | No gap — Passport + DirectoryProfile + Membership chain complete | ✅ |
| `08_DATA_FLOWS` §6 Tournament flow | No gap — extended with Bracket/Match/MatAssignment in pass 2-3 | ✅ |
| `08_DATA_FLOWS` §7 Content truth | `ContentSourceType` added for intake tracking | ✅ fixed |
| `09_E2E_LIFECYCLE` §4 Course/curriculum | Technique model + TechniqueCurriculumLink closes the "technique library" gap | ✅ fixed |
| `09_E2E_LIFECYCLE` §5 Rank lifecycle | Gamification alignment closes rank→points gap | ✅ fixed |
| `09_E2E_LIFECYCLE` §8 Subscription/certification | CertificateTemplate/Order/Issuance closes purchasable cert gap | ✅ fixed |
| `09_E2E_LIFECYCLE` §10 Content touchpoints | Media model enables member spotlight photos/videos | ✅ fixed |
| `09_E2E_LIFECYCLE` §12 Failure states | No new schema needed — edge states are query/UI logic | ✅ |
| `10_AGENT_WORKFLOWS` | No schema implications — operational protocol only | ✅ |
| `11_CONTENT_ENGINE` §2 States | Keep ContentAtomStatus as-is; granular states = ContentTask workflow | ✅ decided |
| `11_CONTENT_ENGINE` §4 Intake | ContentAtom.sourceType field + status=INBOX handles intake | ✅ fixed |
| `11_CONTENT_ENGINE` §9 Video shortcuts | Media model + MediaAttachment handles capture artifacts | ✅ fixed |
| `curriculum-extract-schema.md` | Technique model fields align with CurriculumExtract interface | ✅ aligned |

---

## Decision log (for Brian sign-off)

| # | Decision | Recommendation | Status |
|---|---|---|---|
| D1 | Media: polymorphic FKs vs MediaAttachment join table | **Join table** — cleaner, extensible, no null FK sprawl | ✅ signed off |
| D2 | ContentAtomStatus: expand to 10 states or keep 6 | **Keep 6** — workflow phases tracked via ContentTask | ✅ signed off |
| D3 | Content intake: separate model or ContentAtom+INBOX | **ContentAtom+INBOX** + sourceType field | ✅ signed off |
| D4 | Favorite: polymorphic entityType+entityId vs nullable FKs | **entityType+entityId** — simpler, extensible | ✅ signed off |
| D5 | CertificationType: expand enum with 4 new values | **Yes** — SEMINAR_ATTENDANCE, COURSE_COMPLETION, TOURNAMENT_PLACEMENT, INSTRUCTOR | ✅ signed off |
| D6 | Technique position/category: enum vs free text | **Enums** — enables filtered graph views, avoids typo drift | ✅ signed off |
| D7 | TechniquePrerequisite: strict vs soft prerequisite flag | **Both** — `isStrict` boolean; strict blocks progression, soft = recommended | ✅ signed off |
| D8 | Certificate pricing: through PricingPlan or inline priceCents | **Inline priceCents** on CertificateTemplate — certificates aren't recurring subscriptions | ✅ signed off |

---

## Execution plan (for Cody, post sign-off)

### Wave A (school ops — already defined in SESSION_0021)
Pass 1 models: Program through OrgSettings (~24 models)

### Wave B (competition + CRM — pass 2 + 3)
Pass 2+3 models: Invite, Event, Bracket, Match, Lead, RuleSet, etc. (~14 models)

### Wave C (media + technique + certificates + gamification — pass 4)
Pass 4 models: Media, Technique, Certificate, Favorite, StudentList, gamification FKs (~12 models)

### Wave D (field modifications to existing models)
All `ALTER TABLE` additions across passes 1-4 on existing models.

Each wave = one Prisma migration. Waves run in order. Total: 4 migrations before UI wiring begins.

---

## Runbook inventory + launch readiness

### Existing runbooks (6)

| Runbook | Status | Needs update? |
| --- | --- | --- |
| `database.md` | ✅ active | Add `use_count` to JETTY |
| `dev-environment.md` | ✅ active | Add `use_count` to JETTY |
| `prisma-workflow.md` | ✅ active | Add `use_count` to JETTY; update for `migrate dev` vs `db push` decision |
| `sop-agent-workflows-and-rituals.md` | ✅ active | Add `use_count` to JETTY |
| `sop-data-and-wiring-flows.md` | ✅ active | Add `use_count` to JETTY; add Pass 4 flows (Media, Technique, Certificate) |
| `sop-e2e-user-lifecycle.md` | ✅ active | Add `use_count` to JETTY; add certificate purchase + technique progress to lifecycle |

### Missing runbooks — needed before May 18 launch (7)

| Runbook | Purpose | Create when |
| --- | --- | --- |
| `schema-migration.md` | Step-by-step for running Wave A–D migrations | **NOW — created this session** |
| `deploy.md` | Neon production deploy: migrate, seed, env vars, DNS | Wave A lands |
| `staging-smoke.md` | Pre-launch smoke test checklist per brand | Before first staging deploy |
| `stripe-setup.md` | Stripe Connect onboarding, webhook config, test mode | Sprint with billing UI |
| `media-upload-setup.md` | S3 bucket config, presigned URLs, size limits, CDN | Sprint with media UI |
| `content-publish.md` | MDX → site + ContentAtom → variant → publication flow | Sprint with content engine UI |
| `seed-data.md` | Seed script management: what's seeded, how to extend, how to reset | Wave A lands |

### JETTY 3.0 `use_count` field

All runbooks need `use_count: 0` added to their JETTY frontmatter. This tracks how many sessions have referenced/used the runbook. Increment by 1 each time a session references it. This is a low-cost addition — one field per file, updated during bow-out.

### Schema implications from runbook sweep

**No additional models needed.** The missing runbooks are operational (deploy steps, smoke tests, config guides) — they don't surface new data entities. The schema spec (passes 1–4) fully covers the data layer. The runbooks tell you HOW to use it.

### Baseline systems pack coverage check

| Baseline pack file | Adopted into runbooks? | Status |
| --- | --- | --- |
| 01 Repo audit | N/A — one-time audit | ✅ |
| 02 Repo truth index | `docs/knowledge/wiki/repo-truth-index.md` | ✅ |
| 03 Aliases | `docs/knowledge/wiki/` | ✅ |
| 04 Manual boundary registry | `docs/knowledge/wiki/` | ✅ |
| 05 JETTY 3.0 profile | Governs all frontmatter | ✅ |
| 06 How to use registries | `docs/knowledge/wiki/` | ✅ |
| 07 Next session loading order | `docs/protocols/next-session-loading-order.md` | ✅ |
| 08 Data flows | `docs/runbooks/sop-data-and-wiring-flows.md` | ✅ |
| 09 E2E lifecycle | `docs/runbooks/sop-e2e-user-lifecycle.md` | ✅ |
| 10 Agent workflows | `docs/runbooks/sop-agent-workflows-and-rituals.md` | ✅ |
| 11 Content engine | **Not yet a runbook** — add `content-publish.md` when UI sprint starts | ⚠️ planned |
| 12 Video shortcuts/Iggy | **Not yet a runbook** — add when Iggy automation lane activates | ⚠️ deferred |

---

## What this plan is NOT

- Not frontend specs. No component designs. No page layouts.
- Not API contracts. Server actions come after schema lands.
- Not seed data. Seed scripts follow schema migration.
- Not a timeline. Session-by-session scheduling lives in WORKFLOW_5.0.

---

## Next steps

1. Brian reviews this plan + decision table
2. Brian signs off (or requests changes)
3. Decisions get locked into s2-schema-additions.md as Pass 4
4. Cody executes migrations in 4 waves
5. SOPs get updated with Pass 4 model references post-migration

---

## Petey close

86 models. 38 enums. Four migration waves. Every BBL feature, every SOP flow, every user role — covered.

The recipe is written. The ingredients list is complete. Sign off and we cook.

**Planned Passion Produces Purpose.**
**OSSS.**
