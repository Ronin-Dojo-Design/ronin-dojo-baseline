---
title: "S2 Schema Additions — Production Launch Requirements"
slug: s2-schema-additions
type: file
status: signed-off
created: 2026-04-28
updated: 2026-04-28
last_agent: copilot-session-0022
pairs_with:
  - docs/architecture/s1-schema-design.md
  - docs/architecture/SCHEMA_NEEDS_MANIFEST.md
  - apps/web/prisma/schema.prisma
backlinks:
  - docs/sprints/SESSION_0020.md
---

# S2 Schema Additions — Production Launch Requirements

Produced during SESSION_0020 Petey deep dive. Covers every new model, enum, and field change needed to make the platform production-ready for all brands by 2026-05-18.

**Decisions locked during grill rounds 1–3:**

- All 10 operational gaps are launch blockers
- Every feature must be configurable per-org (SaaS platform, not single-school app)
- Three usage modes: owner-operated, affiliation, white-label — modeled via SubscriptionTier + parent-child org
- Stripe Express Connect default, Standard Connect for independent clients
- iCal RRULE + parsed day/time columns for schedules
- CheckIn → ClassSession match → Attendance → GamificationEvent chain
- Full notification granularity: per-category × per-channel × per-program

---

## Table of contents

1. [New enums](#1-new-enums)
2. [New models](#2-new-models)
3. [Modifications to existing models](#3-modifications-to-existing-models)
4. [Enum modifications](#4-enum-modifications)
5. [Model relationship map](#5-model-relationship-map)
6. [Model count summary](#6-model-count-summary)

---

## 1. New enums

### ScheduleStatus
```prisma
enum ScheduleStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}
```

### DayOfWeek
```prisma
enum DayOfWeek {
  MON
  TUE
  WED
  THU
  FRI
  SAT
  SUN
}
```

### ClassSessionStatus
```prisma
enum ClassSessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### AttendanceStatus
```prisma
enum AttendanceStatus {
  PRESENT
  LATE
  EXCUSED
  NO_SHOW
}
```

### CheckInMethod
```prisma
enum CheckInMethod {
  QR_SCAN
  MANUAL
  KIOSK_TAP
  APP
}
```

### ProgramStatus
```prisma
enum ProgramStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}
```

### EnrollmentStatus
```prisma
enum EnrollmentStatus {
  ACTIVE
  WAITLISTED
  COMPLETED
  WITHDRAWN
  SUSPENDED
}
```

### BeltTestStatus
```prisma
enum BeltTestStatus {
  DRAFT
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### BeltTestResult
```prisma
enum BeltTestResult {
  PASS
  FAIL
  CONDITIONAL_PASS
}
```

### InvoiceStatus
```prisma
enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  PARTIAL
  OVERDUE
  VOID
  REFUNDED
}
```

### PaymentMethodType
```prisma
enum PaymentMethodType {
  CARD
  BANK_ACCOUNT
  CASH
  CHECK
  BARTER
  COUPON
  COMP
}
```

### PricingModel
```prisma
enum PricingModel {
  MONTHLY
  ANNUAL
  DROP_IN
  CLASS_PACK
  PER_TEST
  FREE_TRIAL
  INTRO_PACK
  CUSTOM
}
```

### ContractStatus
```prisma
enum ContractStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PAUSED
}
```

### StripeConnectMode
```prisma
enum StripeConnectMode {
  EXPRESS
  STANDARD
}
```

### NotificationChannel
```prisma
enum NotificationChannel {
  EMAIL
  SMS
  PUSH
}
```

### NotificationCategory
```prisma
enum NotificationCategory {
  CLASS_REMINDER
  CLASS_CANCELLED
  BELT_TEST
  BILLING
  PROMOTION
  ANNOUNCEMENT
  SYSTEM
}
```

### FamilyRole
```prisma
enum FamilyRole {
  GUARDIAN
  CHILD
  SPOUSE
}
```

### OrgRelationType
```prisma
enum OrgRelationType {
  AFFILIATION
  WHITE_LABEL
  FRANCHISE
}
```

---

## 2. New models

### 2.1 Programs & Scheduling

#### Program

A student-facing offering (e.g., "Adult BJJ", "Kids Karate 5-8"). Determines schedule access and pricing.

```prisma
model Program {
  id             String        @id @default(cuid())
  brand          Brand
  name           String
  slug           String
  description    String?
  status         ProgramStatus @default(DRAFT)
  ageMin         Int?
  ageMax         Int?
  enforceAgeCap  Boolean       @default(false)
  maxEnrollment  Int?          /// null = unlimited
  minEnrollment  Int?
  sortOrder      Int           @default(0)
  imageUrl       String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  discipline     Discipline?  @relation(fields: [disciplineId], references: [id])
  disciplineId   String?

  classSchedules   ClassSchedule[]
  programEnrollments ProgramEnrollment[]
  courses          ProgramCourse[]
  pricingPlans     PricingPlan[]
  waivers          ProgramWaiver[]
  notificationPreferences NotificationPreference[]

  @@unique([brand, organizationId, slug])
  @@index([brand, organizationId])
  @@index([disciplineId])
}
```

#### ProgramCourse

Join table: one program can include multiple courses; one course can serve multiple programs.

```prisma
model ProgramCourse {
  programId String
  courseId   String

  program Program @relation(fields: [programId], references: [id], onDelete: Cascade)
  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@id([programId, courseId])
}
```

#### ProgramEnrollment

A student's enrollment in a program. Tracks status, waitlist position, age verification.

```prisma
model ProgramEnrollment {
  id              String           @id @default(cuid())
  status          EnrollmentStatus @default(ACTIVE)
  waitlistPosition Int?
  enrolledAt      DateTime         @default(now())
  withdrawnAt     DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  user       User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  program    Program @relation(fields: [programId], references: [id], onDelete: Cascade)
  programId  String

  @@unique([userId, programId])
  @@index([programId, status])
  @@index([userId])
}
```

#### ClassSchedule

A recurring class definition. "Adult BJJ, Mon/Wed/Fri 6-7:30pm." Stores both RRULE and parsed fields.

```prisma
model ClassSchedule {
  id            String         @id @default(cuid())
  brand         Brand
  name          String
  description   String?
  status        ScheduleStatus @default(ACTIVE)
  daysOfWeek    DayOfWeek[]
  startTime     String         /// "18:00" (HH:mm, 24h)
  endTime       String         /// "19:30"
  rrule         String?        /// iCal RRULE for export/sync
  timezone      String         @default("America/Denver")
  effectiveFrom DateTime?      @db.Date
  effectiveTo   DateTime?      @db.Date
  capacity      Int?           /// null = use program default
  locationName  String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  program        Program      @relation(fields: [programId], references: [id], onDelete: Cascade)
  programId      String
  discipline     Discipline?  @relation(fields: [disciplineId], references: [id])
  disciplineId   String?

  sessions           ClassSession[]
  instructorAssignments ClassInstructorAssignment[]

  @@index([brand, organizationId])
  @@index([programId])
}
```

#### ClassInstructorAssignment

Which instructors teach which class schedules. Supports head + assistants with customizable title.

```prisma
model ClassInstructorAssignment {
  id            String   @id @default(cuid())
  isPrimary     Boolean  @default(false)
  displayTitle  String?  /// "Guro", "Kru", "Sensei" — overrides discipline default
  createdAt     DateTime @default(now())

  classSchedule   ClassSchedule @relation(fields: [classScheduleId], references: [id], onDelete: Cascade)
  classScheduleId String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String

  @@unique([classScheduleId, userId])
  @@index([userId])
}
```

#### ClassSession

A specific instance of a scheduled class (e.g., "Mon Apr 28 6pm BJJ"). Auto-generated or created on the fly.

```prisma
model ClassSession {
  id          String             @id @default(cuid())
  date        DateTime           @db.Date
  startTime   String             /// "18:00"
  endTime     String             /// "19:30"
  status      ClassSessionStatus @default(SCHEDULED)
  notes       String?
  substituteInstructorId String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  classSchedule   ClassSchedule @relation(fields: [classScheduleId], references: [id], onDelete: Cascade)
  classScheduleId String

  attendances Attendance[]

  @@unique([classScheduleId, date])
  @@index([date])
}
```

#### CheckIn

Raw check-in event from kiosk/QR/app. Matched to a ClassSession to create Attendance.

```prisma
model CheckIn {
  id          String        @id @default(cuid())
  method      CheckInMethod
  deviceId    String?       /// kiosk/tablet identifier
  ipAddress   String?
  timestamp   DateTime      @default(now())
  matchedToAttendanceId String? @unique
  createdAt   DateTime      @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  attendance Attendance? @relation(fields: [matchedToAttendanceId], references: [id])

  @@index([userId, timestamp])
}
```

#### Attendance

Confirmed attendance record linking student → class session. Triggers gamification.

```prisma
model Attendance {
  id        String           @id @default(cuid())
  status    AttendanceStatus @default(PRESENT)
  notes     String?
  createdAt DateTime         @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  classSession   ClassSession @relation(fields: [classSessionId], references: [id], onDelete: Cascade)
  classSessionId String
  checkIn        CheckIn?

  @@unique([userId, classSessionId])
  @@index([classSessionId])
  @@index([userId])
}
```

### 2.2 Belt Testing

#### BeltTestEvent

A scheduled belt test event. Students register, pay fees, get tested, results recorded.

```prisma
model BeltTestEvent {
  id            String         @id @default(cuid())
  brand         Brand
  name          String
  status        BeltTestStatus @default(DRAFT)
  scheduledDate DateTime       @db.Date
  scheduledTime String?        /// "10:00"
  location      String?
  feeCents      Int            @default(0)
  notes         String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  rankSystem     RankSystem?  @relation(fields: [rankSystemId], references: [id])
  rankSystemId   String?

  registrations BeltTestRegistration[]

  @@index([brand, organizationId])
  @@index([scheduledDate])
}
```

#### BeltTestRegistration

A student's registration for a belt test. Tracks prerequisites, result, scores.

```prisma
model BeltTestRegistration {
  id               String          @id @default(cuid())
  result           BeltTestResult?
  feePaidCents     Int             @default(0)
  paymentStatus    PaymentStatus   @default(UNPAID)
  notes            String?
  scoreBreakdown   Json?           /// per-technique scores if enabled
  prerequisitesMet Json?           /// { timeInRank: true, attendance: true, curriculum: true, instructorApproval: true }
  testedAt         DateTime?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  beltTestEvent   BeltTestEvent @relation(fields: [beltTestEventId], references: [id], onDelete: Cascade)
  beltTestEventId String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String
  targetRank      Rank          @relation(fields: [targetRankId], references: [id])
  targetRankId    String

  @@unique([beltTestEventId, userId])
  @@index([userId])
}
```

#### BeltTestPrerequisiteConfig

Per-rank-system configuration for what's required before testing.

```prisma
model BeltTestPrerequisiteConfig {
  id                      String  @id @default(cuid())
  minTimeInRankDays       Int?
  minAttendanceCount      Int?
  requireCurriculumComplete Boolean @default(false)
  requireInstructorApproval Boolean @default(true)
  customRules             Json?   /// extensible per-org rules
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  rankSystem     RankSystem   @relation(fields: [rankSystemId], references: [id])
  rankSystemId   String
  rank           Rank?        @relation(fields: [rankId], references: [id])
  rankId         String?
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String

  @@unique([rankSystemId, rankId, organizationId])
}
```

### 2.3 Family / Guardian

#### FamilyGroup

Groups users under one billing/management umbrella.

```prisma
model FamilyGroup {
  id        String   @id @default(cuid())
  name      String?  /// "The Scott Family"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members FamilyMember[]

  @@index([id])
}
```

#### FamilyMember

Links a user to a family group with a role (guardian, child, spouse).

```prisma
model FamilyMember {
  id         String     @id @default(cuid())
  role       FamilyRole
  isPrimary  Boolean    @default(false) /// primary billing contact
  createdAt  DateTime   @default(now())

  familyGroup   FamilyGroup @relation(fields: [familyGroupId], references: [id], onDelete: Cascade)
  familyGroupId String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String

  @@unique([familyGroupId, userId])
  @@index([userId])
}
```

### 2.4 Payments / Billing

#### PricingPlan

Defines a purchasable pricing option for a program or org. Supports all models: monthly, drop-in, class pack, trial, etc.

```prisma
model PricingPlan {
  id              String       @id @default(cuid())
  brand           Brand
  name            String       /// "Unlimited Monthly", "10-Class Pack", "Drop-In"
  pricingModel    PricingModel
  amountCents     Int          /// 15000 = $150.00
  currency        String       @default("USD") @db.Char(3)
  intervalMonths  Int?         /// 1 = monthly, 12 = annual, null = one-time
  classCount      Int?         /// for CLASS_PACK: 10 classes
  trialDays       Int?         /// for FREE_TRIAL: 7 days
  isActive        Boolean      @default(true)
  sortOrder       Int          @default(0)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  program        Program?     @relation(fields: [programId], references: [id])
  programId      String?

  invoiceLineItems InvoiceLineItem[]

  @@index([brand, organizationId])
  @@index([programId])
}
```

#### Invoice

A billing document. Can be auto-generated (subscription renewal) or manual.

```prisma
model Invoice {
  id             String        @id @default(cuid())
  brand          Brand
  invoiceNumber  String?
  status         InvoiceStatus @default(DRAFT)
  subtotalCents  Int           @default(0)
  discountCents  Int           @default(0)
  taxCents       Int           @default(0)
  totalCents     Int           @default(0)
  currency       String        @default("USD") @db.Char(3)
  issuedAt       DateTime?
  dueAt          DateTime?
  paidAt         DateTime?
  notes          String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String

  lineItems InvoiceLineItem[]
  payments  Payment[]

  @@index([brand, organizationId])
  @@index([userId])
  @@index([status])
}
```

#### InvoiceLineItem

Individual line on an invoice. Links to a pricing plan or custom charge.

```prisma
model InvoiceLineItem {
  id            String  @id @default(cuid())
  description   String
  amountCents   Int
  quantity      Int     @default(1)
  createdAt     DateTime @default(now())

  invoice       Invoice     @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId     String
  pricingPlan   PricingPlan? @relation(fields: [pricingPlanId], references: [id])
  pricingPlanId String?

  @@index([invoiceId])
}
```

#### Payment

Actual money movement. Links to Stripe payment intent or records cash/barter.

```prisma
model Payment {
  id                  String            @id @default(cuid())
  amountCents         Int
  currency            String            @default("USD") @db.Char(3)
  method              PaymentMethodType
  stripePaymentIntentId String?
  barterNote          String?           /// "Mat cleaning - April 2026"
  paidAt              DateTime          @default(now())
  createdAt           DateTime          @default(now())

  invoice   Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId String

  @@index([invoiceId])
  @@index([stripePaymentIntentId])
}
```

#### StripeAccount

Stripe Connect account for an organization. Express or Standard.

```prisma
model StripeAccount {
  id                 String           @id @default(cuid())
  mode               StripeConnectMode @default(EXPRESS)
  stripeAccountId    String           @unique /// acct_xxxxx
  chargesEnabled     Boolean          @default(false)
  payoutsEnabled     Boolean          @default(false)
  applicationFeeBps  Int              @default(500) /// 500 = 5.00%
  onboardingComplete Boolean          @default(false)
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String       @unique

  payoutSplits PayoutSplit[]

  @@index([stripeAccountId])
}
```

#### PayoutSplit

Defines how revenue is split between instructors/staff for an org.

```prisma
model PayoutSplit {
  id              String  @id @default(cuid())
  recipientLabel  String  /// "Head Instructor", "Social Media Manager"
  splitBps        Int     /// 7000 = 70.00%
  isActive        Boolean @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  stripeAccount   StripeAccount @relation(fields: [stripeAccountId], references: [id], onDelete: Cascade)
  stripeAccountId String
  recipientUser   User          @relation(fields: [recipientUserId], references: [id])
  recipientUserId String

  @@index([stripeAccountId])
  @@index([recipientUserId])
}
```

#### PromoCode

Discount codes. Can be org-level or platform-wide (brand-level).

```prisma
model PromoCode {
  id              String   @id @default(cuid())
  brand           Brand
  code            String
  description     String?
  discountType    String   /// "PERCENT" or "FIXED"
  discountValue   Int      /// percent (10 = 10%) or cents (2000 = $20)
  maxUses         Int?     /// null = unlimited
  currentUses     Int      @default(0)
  validFrom       DateTime?
  validTo         DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?       /// null = platform-wide promo

  @@unique([brand, code])
  @@index([brand, isActive])
}
```

### 2.5 Contracts

#### MembershipContract

Legally distinct from waivers. Terms of payment agreement.

```prisma
model MembershipContract {
  id                String         @id @default(cuid())
  status            ContractStatus @default(ACTIVE)
  termMonths        Int?           /// null = month-to-month
  autoRenew         Boolean        @default(true)
  cancellationNoticeDays Int       @default(30)
  coolingOffDays    Int            @default(3)
  monthlyCents      Int
  currency          String         @default("USD") @db.Char(3)
  signedAt          DateTime?
  startsAt          DateTime
  endsAt            DateTime?
  cancelledAt       DateTime?
  notes             String?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String

  @@index([userId])
  @@index([organizationId, status])
}
```

### 2.6 Notifications

#### NotificationPreference

Full granularity: per-category × per-channel × per-program.

```prisma
model NotificationPreference {
  id        String               @id @default(cuid())
  category  NotificationCategory
  channel   NotificationChannel
  enabled   Boolean              @default(true)
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  program   Program? @relation(fields: [programId], references: [id])
  programId String?  /// null = applies to all programs

  @@unique([userId, category, channel, programId])
  @@index([userId])
}
```

#### Announcement

Org-wide or program-specific broadcast messages.

```prisma
model Announcement {
  id          String   @id @default(cuid())
  brand       Brand
  title       String
  body        String
  channels    NotificationChannel[]
  publishAt   DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  program        Program?     @relation(fields: [programId], references: [id])
  programId      String?

  @@index([brand, organizationId])
  @@index([publishAt])
}
```

### 2.7 Org Network (Parent-Child)

#### OrgRelationship

Tracks affiliation / white-label / franchise relationships between organizations.

```prisma
model OrgRelationship {
  id           String          @id @default(cuid())
  type         OrgRelationType
  isActive     Boolean         @default(true)
  agreedAt     DateTime?
  expiresAt    DateTime?
  notes        String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  parentOrg    Organization @relation("OrgParent", fields: [parentOrgId], references: [id], onDelete: Cascade)
  parentOrgId  String
  childOrg     Organization @relation("OrgChild", fields: [childOrgId], references: [id], onDelete: Cascade)
  childOrgId   String

  @@unique([parentOrgId, childOrgId, type])
  @@index([parentOrgId])
  @@index([childOrgId])
}
```

### 2.8 Org Settings

#### OrgSettings

Per-org configuration. Stores all the toggles: check-in windows, waiver enforcement, SMS cost pass-through, etc.

```prisma
model OrgSettings {
  id                       String  @id @default(cuid())
  defaultInstructorTitle   String? /// "Sensei", "Coach" — override at discipline level
  checkInWindowMinutes     Int     @default(30) /// how early before class
  allowLateCheckIn         Boolean @default(true)
  requireWaiverBeforeCheckIn Boolean @default(true)
  waiverRenewalMonths      Int?    /// null = one-time only
  smsCostPassthrough       Boolean @default(false) /// true = school pays SMS costs
  dropInFeeCents           Int?    /// null = no drop-ins allowed
  dropInRequiresWaiver     Boolean @default(true)
  allowBarterMembership    Boolean @default(false)
  enableGamification       Boolean @default(true)
  enableBeltTestScoring    Boolean @default(false)
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String       @unique
}
```

---

## 3. Modifications to existing models

### User — new relations

```prisma
model User {
  // ...existing fields...

  // NEW relations
  programEnrollments      ProgramEnrollment[]
  attendances             Attendance[]
  checkIns                CheckIn[]
  beltTestRegistrations   BeltTestRegistration[]
  familyMemberships       FamilyMember[]
  invoices                Invoice[]
  contracts               MembershipContract[]
  notificationPreferences NotificationPreference[]
  payoutSplits            PayoutSplit[]
  classInstructorAssignments ClassInstructorAssignment[]
  announcements           Announcement[]  // if needed for "created by"
}
```

### Organization — new relations

```prisma
model Organization {
  // ...existing fields...

  // NEW relations
  programs               Program[]
  classSchedules         ClassSchedule[]
  beltTestEvents         BeltTestEvent[]
  beltTestPrereqConfigs  BeltTestPrerequisiteConfig[]
  invoices               Invoice[]
  contracts              MembershipContract[]
  pricingPlans           PricingPlan[]
  promoCodes             PromoCode[]
  stripeAccount          StripeAccount?
  orgSettings            OrgSettings?
  announcements          Announcement[]
  parentRelationships    OrgRelationship[] @relation("OrgChild")
  childRelationships     OrgRelationship[] @relation("OrgParent")
}
```

### Discipline — new fields + relations

```prisma
model Discipline {
  // ...existing fields...

  defaultInstructorTitle String? /// "Sensei" for Karate, "Guro" for Eskrima, etc.

  // NEW relations
  programs       Program[]
  classSchedules ClassSchedule[]
}
```

### Role — new field

```prisma
model Role {
  // ...existing fields...

  displayTitle String? /// Overrides default: "Head Guro", "Assistant Kru"
}
```

### RankSystem — new relation

```prisma
model RankSystem {
  // ...existing relations...

  beltTestEvents        BeltTestEvent[]
  prerequisiteConfigs   BeltTestPrerequisiteConfig[]
}
```

### Rank — new relation

```prisma
model Rank {
  // ...existing relations...

  beltTestRegistrations    BeltTestRegistration[]
  prerequisiteConfigs      BeltTestPrerequisiteConfig[]
}
```

### Course — new relation

```prisma
model Course {
  // ...existing relations...

  programs ProgramCourse[]
}
```

---

## 4. Enum modifications

### LineageRelationType — add INSTRUCTOR_STUDENT

```prisma
enum LineageRelationType {
  INSTRUCTOR_STUDENT   // ← NEW
  TOURNAMENT_PARTNER
  AFFILIATION
  TRAINING_PARTNER
  SEMINAR
  COMPETITION_TEAM
}
```

---

## 5. Model relationship map

```
Organization
  ├── Program (1:N)
  │     ├── ClassSchedule (1:N)
  │     │     ├── ClassSession (1:N, per date)
  │     │     │     └── Attendance (1:N)
  │     │     │           └── CheckIn (1:1)
  │     │     └── ClassInstructorAssignment (1:N)
  │     ├── ProgramEnrollment (1:N, per student)
  │     ├── ProgramCourse (M:N → Course)
  │     ├── PricingPlan (1:N)
  │     └── NotificationPreference (1:N, per user)
  ├── BeltTestEvent (1:N)
  │     └── BeltTestRegistration (1:N, per student)
  ├── BeltTestPrerequisiteConfig (1:N, per rank)
  ├── Invoice (1:N)
  │     ├── InvoiceLineItem (1:N)
  │     └── Payment (1:N)
  ├── MembershipContract (1:N)
  ├── StripeAccount (1:1)
  │     └── PayoutSplit (1:N)
  ├── PromoCode (1:N)
  ├── OrgSettings (1:1)
  ├── OrgRelationship (parent/child)
  └── Announcement (1:N)

User
  ├── FamilyMember → FamilyGroup (M:N)
  ├── ProgramEnrollment (1:N)
  ├── Attendance (1:N)
  ├── CheckIn (1:N)
  ├── BeltTestRegistration (1:N)
  ├── Invoice (1:N)
  ├── MembershipContract (1:N)
  ├── NotificationPreference (1:N)
  └── PayoutSplit (1:N)
```

---

## 6. Model count summary

| Category | New models | New enums |
|---|---|---|
| Programs & Scheduling | 7 (Program, ProgramCourse, ProgramEnrollment, ClassSchedule, ClassSession, ClassInstructorAssignment, CheckIn, Attendance) | 6 |
| Belt Testing | 3 (BeltTestEvent, BeltTestRegistration, BeltTestPrerequisiteConfig) | 2 |
| Family | 2 (FamilyGroup, FamilyMember) | 1 |
| Payments / Billing | 6 (PricingPlan, Invoice, InvoiceLineItem, Payment, StripeAccount, PayoutSplit) | 4 |
| Promo Codes | 1 (PromoCode) | 0 |
| Contracts | 1 (MembershipContract) | 1 |
| Notifications | 2 (NotificationPreference, Announcement) | 2 |
| Org Network | 1 (OrgRelationship) | 1 |
| Org Settings | 1 (OrgSettings) | 0 |
| **TOTAL** | **24 new models** | **17 new enums** |

Combined with existing 36 Ronin Dojo models → **~69 models total** (plus Dirstarter template models to be removed before prod).

---

## 7. Supplement — Pass 2 additions (SESSION_0020)

Models identified in the final-pass review. These fill gaps in: invitations/QR invite, generic events (seminars, camps, birthday parties), tournament bracket execution, fight records, and audit logging.

### 7.1 New enums (supplement)

```prisma
enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}

enum InviteType {
  ORGANIZATION     /// join an org
  PROGRAM          /// enroll in a program
  TOURNAMENT       /// register for tournament
  EVENT            /// attend a generic event
}

enum EventType {
  SEMINAR
  WORKSHOP
  BIRTHDAY_PARTY
  SUMMER_CAMP
  OPEN_MAT
  CUSTOM
}

enum EventStatus {
  DRAFT
  PUBLISHED
  SOLD_OUT
  CANCELLED
  COMPLETED
}

enum EventRegistrationStatus {
  REGISTERED
  WAITLISTED
  CANCELLED
  ATTENDED
}

enum MatchStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  NO_CONTEST
  BYE
}

enum MatchResult {
  WIN_POINTS
  WIN_SUBMISSION
  WIN_KO_TKO
  WIN_DECISION
  WIN_DQ
  WIN_DEFAULT
  DRAW
  NO_CONTEST
}

enum FightRecordType {
  TOURNAMENT
  EXHIBITION
  SMOKER
  PROFESSIONAL
}
```

### 7.2 Invitations

#### Invite

Universal invite system. QR code, link, or manual. Covers org join, program enroll, tournament reg, events. Any admin/instructor/school owner with appropriate role can create invites.

```prisma
model Invite {
  id          String       @id @default(cuid())
  brand       Brand
  type        InviteType
  code        String       @unique @default(cuid()) /// used in QR code / link
  status      InviteStatus @default(PENDING)
  maxUses     Int?         /// null = unlimited
  currentUses     Int      @default(0)
  expiresAt   DateTime?
  meta        Json?        /// { programId, tournamentId, eventId, roleCode, etc. }
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  createdBy      User         @relation("InviteCreatedBy", fields: [createdById], references: [id])
  createdById    String

  claims InviteClaim[]

  @@index([brand, organizationId])
  @@index([code])
  @@index([createdById])
}
```

#### InviteClaim

Records who claimed an invite and when.

```prisma
model InviteClaim {
  id        String   @id @default(cuid())
  claimedAt DateTime @default(now())

  invite   Invite @relation(fields: [inviteId], references: [id], onDelete: Cascade)
  inviteId String
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId   String

  @@unique([inviteId, userId])
  @@index([userId])
}
```

### 7.3 Generic Events

#### Event

Covers seminars, birthday parties, summer camps, open mats, workshops, custom events. NOT tournaments (those have their own richer model).

```prisma
model Event {
  id            String      @id @default(cuid())
  brand         Brand
  type          EventType
  name          String
  slug          String
  description   String?
  status        EventStatus @default(DRAFT)
  startDate     DateTime
  endDate       DateTime?
  timezone      String      @default("America/Denver")
  locationName  String?
  capacity      Int?
  feeCents      Int         @default(0)
  currency      String      @default("USD") @db.Char(3)
  ageMin        Int?
  ageMax        Int?
  imageUrl      String?
  requiresWaiver Boolean    @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  discipline     Discipline?  @relation(fields: [disciplineId], references: [id])
  disciplineId   String?

  registrations EventRegistration[]

  @@unique([brand, organizationId, slug])
  @@index([brand, organizationId])
  @@index([startDate])
}
```

#### EventRegistration

```prisma
model EventRegistration {
  id            String                  @id @default(cuid())
  status        EventRegistrationStatus @default(REGISTERED)
  feePaidCents  Int                     @default(0)
  paymentStatus PaymentStatus           @default(UNPAID)
  notes         String?
  registeredAt  DateTime                @default(now())
  createdAt     DateTime                @default(now())
  updatedAt     DateTime                @updatedAt

  event   Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId String
  user    User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId  String

  @@unique([eventId, userId])
  @@index([eventId, status])
  @@index([userId])
}
```

### 7.4 Tournament Execution (Brackets & Matches)

These extend the existing Tournament → Division chain with live bracket execution.

#### Bracket

A bracket within a division. A division may have one bracket (single elim) or multiple (pool play → finals).

```prisma
model Bracket {
  id          String   @id @default(cuid())
  name        String   /// "Pool A", "Main Bracket", "Repechage"
  sortOrder   Int      @default(0)
  seedData    Json?    /// seeding order
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  division   Division @relation(fields: [divisionId], references: [id], onDelete: Cascade)
  divisionId String

  matches Match[]

  @@index([divisionId])
}
```

#### Match

A single bout/fight/match within a bracket.

```prisma
model Match {
  id            String      @id @default(cuid())
  roundNumber   Int
  matchNumber   Int         /// position within the round
  status        MatchStatus @default(SCHEDULED)
  scheduledAt   DateTime?
  startedAt     DateTime?
  endedAt       DateTime?
  result        MatchResult?
  winnerEntryId String?     /// FK to RegistrationEntry of winner
  notes         String?
  scoreData     Json?       /// { competitor1Points: 5, competitor2Points: 3, penalties: [...] }
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  bracket   Bracket @relation(fields: [bracketId], references: [id], onDelete: Cascade)
  bracketId String

  competitors MatchCompetitor[]

  @@unique([bracketId, roundNumber, matchNumber])
  @@index([bracketId, roundNumber])
}
```

#### MatchCompetitor

Links a RegistrationEntry to a match slot (competitor 1 / competitor 2).

```prisma
model MatchCompetitor {
  id       String @id @default(cuid())
  seed     Int?   /// seeding position
  slot     Int    /// 1 or 2

  match              Match             @relation(fields: [matchId], references: [id], onDelete: Cascade)
  matchId            String
  registrationEntry  RegistrationEntry @relation(fields: [registrationEntryId], references: [id])
  registrationEntryId String

  @@unique([matchId, slot])
  @@unique([matchId, registrationEntryId])
  @@index([registrationEntryId])
}
```

#### FightRecord

Per-fighter, per-discipline competition record. Aggregates across tournaments. One fighter can have separate records for BJJ, Boxing, Muay Thai, Eskrima, etc.

```prisma
model FightRecord {
  id           String          @id @default(cuid())
  type         FightRecordType @default(TOURNAMENT)
  wins         Int             @default(0)
  losses       Int             @default(0)
  draws        Int             @default(0)
  noContests   Int             @default(0)
  updatedAt    DateTime        @updatedAt

  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String
  discipline   Discipline @relation(fields: [disciplineId], references: [id])
  disciplineId String

  @@unique([userId, disciplineId, type])
  @@index([userId])
}
```

#### AuditLog

Append-only log for sensitive operations: rank promotions, payment modifications, role changes, belt test results.

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  brand       Brand
  action      String   /// "RANK_PROMOTED", "PAYMENT_REFUNDED", "ROLE_ASSIGNED"
  entityType  String   /// "RankAward", "Payment", "Membership"
  entityId    String
  before      Json?    /// snapshot of previous state
  after       Json?    /// snapshot of new state
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  user           User          @relation(fields: [userId], references: [id])
  userId         String
  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?

  @@index([brand, entityType, entityId])
  @@index([userId, createdAt])
  @@index([organizationId])
}
```

### 7.7 Existing model modifications (supplement)

#### User — additional relations

```prisma
model User {
  // ...existing + pass-1 relations...

  // PASS 2 additions
  createdInvites     Invite[]            @relation("InviteCreatedBy")
  inviteClaims       InviteClaim[]
  eventRegistrations EventRegistration[]
  fightRecords       FightRecord[]
  auditLogs          AuditLog[]
}
```

#### Organization — additional relations

```prisma
model Organization {
  // ...existing + pass-1 relations...

  // PASS 2 additions
  invites    Invite[]
  events     Event[]
  auditLogs  AuditLog[]
}
```

#### Division — additional relation

```prisma
model Division {
  // ...existing relations...
  brackets Bracket[]
}
```

#### RegistrationEntry — additional relation

```prisma
model RegistrationEntry {
  // ...existing relations...
  matchCompetitors MatchCompetitor[]
}
```

#### Discipline — additional relations

```prisma
model Discipline {
  // ...existing + pass-1 relations...
  events       Event[]
  fightRecords FightRecord[]
}
```

---

## 8. Grand total (pass 1 + pass 2)

| | Pass 1 | Pass 2 | Combined |
|---|---|---|---|
| New models | 24 | 9 | **33** |
| New enums | 17 | 8 | **25** |
| Existing models modified | 7 | 5 | **~10 unique** |
| Enum modifications | 1 | 0 | **1** |
| **Total platform models** | | | **~69** (36 existing + 33 new) |

---

## 9. Final-pass checklist — anything else missing?

| Area | Status | Notes |
|---|---|---|
| Class scheduling & attendance | ✅ COVERED | Program → ClassSchedule → ClassSession → CheckIn → Attendance |
| Belt testing & exam events | ✅ COVERED | BeltTestEvent + Registration + PrerequisiteConfig |
| Family / guardian | ✅ COVERED | FamilyGroup + FamilyMember |
| Payments / invoicing | ✅ COVERED | PricingPlan → Invoice → Payment + Stripe Connect |
| Check-in / kiosk | ✅ COVERED | CheckIn with QR/manual/kiosk methods |
| Notifications | ✅ COVERED | NotificationPreference (full granularity) + Announcement |
| Contracts | ✅ COVERED | MembershipContract |
| Programs vs courses | ✅ COVERED | Program ↔ ProgramCourse ↔ Course M:N |
| Instructor assignment | ✅ COVERED | ClassInstructorAssignment + displayTitle |
| Invitations / QR invite | ✅ COVERED | Invite + InviteClaim, universal type system |
| Generic events (seminars, camps, parties) | ✅ COVERED | Event + EventRegistration |
| Tournament brackets & matches | ✅ COVERED | Bracket → Match → MatchCompetitor |
| Fight records | ✅ COVERED | FightRecord per user × discipline × type |
| Org network (affiliation/white-label) | ✅ COVERED | OrgRelationship parent/child |
| Org settings / configurability | ✅ COVERED | OrgSettings with all toggles |
| Promo codes / coupons | ✅ COVERED | PromoCode org-level + platform-wide |
| Barter / comps | ✅ COVERED | PaymentMethodType.BARTER + barterNote |
| Audit trail | ✅ COVERED | AuditLog append-only |
| Rank system + awards | ✅ EXISTED | No changes needed |
| Tournament + division + registration | ✅ EXISTED | Extended with Bracket/Match |
| Gamification | ✅ EXISTED | Attendance triggers events via existing chain |
| Lineage | ✅ EXISTED | +INSTRUCTOR_STUDENT enum value |
| Content engine | ✅ EXISTED | No changes needed |
| Waivers | ✅ EXISTED | No changes needed |

**Nothing identified as missing. Schema spec is comprehensive for production launch.**

---

## 10. Pass 3 — Deep Research Gaps (SESSION_0020 preflight)

Gaps identified by ChatGPT deep research brief + Launch OS doc against PushPress, Wodify, Zen Planner, Kihapp, Smoothcomp, and BJJBuddy. Source: `docs/architecture/source/Ronin-Dojo-Launch-Deep-Research-Brief.md`.

### 10.1 New enums (pass 3)

```prisma
enum LeadStatus {
  NEW
  CONTACTED
  TRIAL_BOOKED
  TRIAL_COMPLETED
  CONVERTED
  LOST
  NURTURE
}

enum LeadSource {
  WEBSITE
  REFERRAL
  WALK_IN
  SOCIAL_MEDIA
  EVENT
  PARTNER
  AD_CAMPAIGN
  OTHER
}

enum ScoringMethod {
  POINTS
  SUBMISSION
  DECISION
  DISQUALIFICATION
  TIME
  CUSTOM
}

enum MatAssignmentStatus {
  PENDING
  ACTIVE
  COMPLETED
}
```

### 10.2 Lead / CRM

The research brief and every competitor (PushPress, Wodify, Zen Planner) treat lead-to-member conversion as core, not optional. Current schema has no CRM lane.

#### Lead

```prisma
model Lead {
  id            String     @id @default(cuid())
  brand         Brand
  status        LeadStatus @default(NEW)
  source        LeadSource @default(WEBSITE)
  firstName     String
  lastName      String?
  email         String?
  phoneE164     String?
  notes         String?
  referredBy    String?    /// free text or userId
  trialBookedAt DateTime?
  convertedAt   DateTime?
  convertedToUserId String? /// links to User upon conversion
  meta          Json?      /// UTM params, ad campaign, etc.
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId String
  program        Program?     @relation(fields: [programId], references: [id])
  programId      String?      /// which program they expressed interest in

  followUps LeadFollowUp[]

  @@index([brand, organizationId, status])
  @@index([email])
  @@index([convertedToUserId])
}
```

#### LeadFollowUp

```prisma
model LeadFollowUp {
  id          String   @id @default(cuid())
  channel     String   /// "EMAIL", "SMS", "PHONE", "IN_PERSON"
  notes       String?
  scheduledAt DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())

  lead       Lead   @relation(fields: [leadId], references: [id], onDelete: Cascade)
  leadId     String
  assignedTo User?  @relation("FollowUpAssignee", fields: [assignedToId], references: [id])
  assignedToId String?

  @@index([leadId])
  @@index([assignedToId])
}
```

### 10.3 Tournament Rules Engine

The brief identifies that `TournamentDiscipline.rulesetName` (string) is insufficient for Smoothcomp/Kihapp-level competition. Need structured rules and scoring templates.

#### RuleSet

```prisma
model RuleSet {
  id              String   @id @default(cuid())
  name            String   /// "IBJJF Gi Rules", "WEKAF Single Stick"
  description     String?
  matchDurationSec Int?    /// default match length
  overtimeSec     Int?
  scoringMethod   ScoringMethod @default(POINTS)
  scoringConfig   Json?    /// { pointValues: { takedown: 2, sweep: 2, mount: 4 }, penalties: [...] }
  isSystem        Boolean  @default(false)
  brand           Brand?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  discipline   Discipline? @relation(fields: [disciplineId], references: [id])
  disciplineId String?

  tournamentDisciplines TournamentDiscipline[]

  @@unique([name, brand])
  @@index([brand])
  @@index([disciplineId])
}
```

#### WeighInRecord

```prisma
model WeighInRecord {
  id            String   @id @default(cuid())
  weightKg      Decimal  @db.Decimal(5, 2)
  recordedAt    DateTime @default(now())
  recordedBy    String?  /// userId of official
  isOfficial    Boolean  @default(false)
  notes         String?
  createdAt     DateTime @default(now())

  registration   Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  registrationId String
  user           User         @relation(fields: [userId], references: [id])
  userId         String

  @@index([registrationId])
  @@index([userId])
}
```

#### MatAssignment

For tournament operations — which mat/ring a match is assigned to.

```prisma
model MatAssignment {
  id        String              @id @default(cuid())
  matName   String              /// "Mat 1", "Ring A"
  status    MatAssignmentStatus @default(PENDING)
  startTime DateTime?
  endTime   DateTime?
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt

  match        Match      @relation(fields: [matchId], references: [id], onDelete: Cascade)
  matchId      String     @unique
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  tournamentId String

  @@index([tournamentId, matName])
}
```

### 10.4 Existing model modifications (pass 3)

#### User — additional relations

```prisma
model User {
  // ...existing + pass-1 + pass-2 relations...

  // PASS 3 additions
  leadFollowUps  LeadFollowUp[] @relation("FollowUpAssignee")
  weighInRecords WeighInRecord[]
}
```

#### Organization — additional relation

```prisma
model Organization {
  // ...existing + pass-1 + pass-2 relations...

  // PASS 3 additions
  leads Lead[]
}
```

#### Program — additional relation

```prisma
model Program {
  // ...existing relations...
  leads Lead[]
}
```

#### TournamentDiscipline — add ruleSet FK

```prisma
model TournamentDiscipline {
  // ...existing fields...
  ruleSet      RuleSet? @relation(fields: [ruleSetId], references: [id])
  ruleSetId    String?
  // rulesetName remains for display override
}
```

#### Discipline — additional relation

```prisma
model Discipline {
  // ...existing relations...
  ruleSets RuleSet[]
}
```

#### Registration — additional relation

```prisma
model Registration {
  // ...existing relations...
  weighInRecords WeighInRecord[]
}
```

#### Match — additional relation

```prisma
model Match {
  // ...existing relations...
  matAssignment MatAssignment?
}
```

#### Tournament — additional relation

```prisma
model Tournament {
  // ...existing relations...
  matAssignments MatAssignment[]
}
```

---

## 10. Grand total (pass 1 + pass 2 + pass 3)

| | Pass 1 | Pass 2 | Pass 3 | Combined |
|---|---|---|---|---|
| New models | 24 | 9 | 5 | **38** |
| New enums | 17 | 8 | 4 | **29** |
| **Total platform models** | | | | **~74** (36 existing + 38 new) |

### 10.7 Final coverage check (all 3 passes)

| Area | Status | Notes |
|---|---|---|
| Lead pipeline / CRM | ✅ NOW COVERED | Lead + LeadFollowUp + conversion tracking |
| Tournament rules engine | ✅ NOW COVERED | RuleSet with structured scoring config |
| Weigh-in tracking | ✅ NOW COVERED | WeighInRecord per registration |
| Mat/ring assignment | ✅ NOW COVERED | MatAssignment per match |
| White-label (Sites/Templates) | ⏳ POST-LAUNCH | RDD-specific; deferred per Option A-plus |
| Athlete journal/HealthKit | ⏳ POST-LAUNCH | BJJBuddy-style features post-launch |
| Ranking series | ⏳ POST-LAUNCH | Cross-tournament rankings deferred |

---

## Sign-off

- [x] Brian approves model names and relationships (pass 1 + 2 + 3 + 4)
- [x] Brian approves enum values
- [x] Brian confirms nothing is missing for May 18 launch
- [x] Launch strategy: **Option A-plus** confirmed
- [x] Pass 4 decisions D1–D8 signed off (SESSION_0022)
- [x] Ready for Cody to implement migration in 4 waves

**Signed off SESSION_0022 (2026-04-28). This is the implementation spec for the schema migration.**

---

## 11. Pass 4 — Media, Techniques, Certificates, Gamification Alignment (SESSION_0022)

Gaps identified by grill audit against blackbeltlegacy.com features, SOP sweep across baseline systems pack docs 08–12, and user requirements for media uploads, technique library + graph, purchasable certificates, favorites, student lists, and gamification alignment.

**Decisions D1–D8 signed off by Brian (SESSION_0022, 2026-04-28).** Full decision log in `PETEY_PLAN_S2_SCHEMA_PASS4.md`.

### 11.1 New enums (pass 4)

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

### 11.2 Media system

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

```prisma
model MediaAttachment {
  id        String   @id @default(cuid())
  purpose   String?  /// "gallery", "cover", "technique_video", "promotion_photo", "certificate_bg"
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  media   Media  @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  mediaId String

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

### 11.3 Technique library + graph

#### Technique

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
  movementPattern  String?
  rangeBand        String?
  teachingCues     String[]
  commonErrors     String[]
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

```prisma
model TechniquePrerequisite {
  id          String   @id @default(cuid())
  description String?
  isStrict    Boolean  @default(false)
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

### 11.4 Certificate products

#### CertificateTemplate

```prisma
model CertificateTemplate {
  id              String                   @id @default(cuid())
  brand           Brand
  name            String
  type            CertificationType
  deliveryMethod  CertificateDeliveryMethod @default(DIGITAL)
  description     String?
  layoutConfig    Json?
  backgroundUrl   String?
  priceCents      Int                      @default(0)
  currency        String                   @default("USD") @db.Char(3)
  isActive        Boolean                  @default(true)
  createdAt       DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt

  organization   Organization? @relation(fields: [organizationId], references: [id])
  organizationId String?

  orders         CertificateOrder[]
  issuances      CertificateIssuance[]
  mediaAttachments MediaAttachment[]

  @@index([brand, type])
  @@index([organizationId])
}
```

#### CertificateOrder

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

```prisma
model CertificateIssuance {
  id                String   @id @default(cuid())
  certificateNumber String   @unique
  qrVerificationCode String  @unique
  pdfUrl            String?
  issuedAt          DateTime @default(now())
  expiresAt         DateTime?
  revokedAt         DateTime?
  meta              Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  certificateTemplate CertificateTemplate @relation(fields: [certificateTemplateId], references: [id])
  certificateTemplateId String
  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                String
  certification         Certification?      @relation(fields: [certificationId], references: [id])
  certificationId       String?
  order                 CertificateOrder?   @relation(fields: [orderId], references: [id])
  orderId               String?             @unique

  @@index([userId])
  @@index([certificateTemplateId])
  @@index([certificationId])
}
```

### 11.5 Favorites + Student lists

#### Favorite

```prisma
model Favorite {
  id         String             @id @default(cuid())
  entityType FavoriteEntityType
  entityId   String
  notes      String?
  createdAt  DateTime           @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  @@unique([userId, entityType, entityId])
  @@index([userId, entityType])
}
```

#### StudentList

```prisma
model StudentList {
  id          String   @id @default(cuid())
  name        String
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
```

#### StudentListMember

```prisma
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

### 11.6 Enum modifications (pass 4)

#### CertificationType — expand

```prisma
enum CertificationType {
  BELT_RANK
  SAFETY
  COACH
  SEMINAR_ATTENDANCE
  COURSE_COMPLETION
  TOURNAMENT_PLACEMENT
  INSTRUCTOR
}
```

### 11.7 Existing model modifications (pass 4)

#### ContentAtom — add sourceType

```prisma
model ContentAtom {
  // ...existing fields...
  sourceType ContentSourceType?
}
```

#### DirectoryProfile — add media fields

```prisma
model DirectoryProfile {
  // ...existing fields...
  coverPhotoUrl  String?
  videoIntroUrl  String?
}
```

#### GamificationEvent — close the gamification loop

```prisma
model GamificationEvent {
  // ...existing relations...
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

#### Certification — add issuance link

```prisma
model Certification {
  // ...existing fields...
  issuance CertificateIssuance?
}
```

#### Rank — technique belt-level relations

```prisma
model Rank {
  // ...existing relations...
  techniqueBeltMin Technique[] @relation("TechBeltMin")
  techniqueBeltMax Technique[] @relation("TechBeltMax")
}
```

#### CurriculumItem — technique links

```prisma
model CurriculumItem {
  // ...existing relations...
  techniqueLinks TechniqueCurriculumLink[]
}
```

#### User — pass 4 relations

```prisma
model User {
  // ...existing relations...
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

#### Organization — pass 4 relations

```prisma
model Organization {
  // ...existing relations...
  media              Media[]
  techniques         Technique[]
  studentLists       StudentList[]
  certificateTemplates CertificateTemplate[]
}
```

#### Discipline, Style, Attendance, BeltTestRegistration, CurriculumItemCompletion — new relations

```prisma
// Discipline
techniques Technique[]

// Style
techniques Technique[]

// Attendance
gamificationEvents GamificationEvent[]

// BeltTestRegistration
gamificationEvents GamificationEvent[]

// CurriculumItemCompletion
gamificationEvents GamificationEvent[]
```

### 11.8 Pass 4 model count

| Category | New models | New enums |
| --- | --- | --- |
| Media system | 2 (Media, MediaAttachment) | 1 (MediaType) |
| Technique library + graph | 4 (Technique, TechniquePrerequisite, TechniqueCurriculumLink, TechniqueProgress) | 4 (TechniqueCategory, TechniquePosition, DifficultyLevel, TechniqueProgressStatus) |
| Certificate products | 3 (CertificateTemplate, CertificateOrder, CertificateIssuance) | 2 (CertificateDeliveryMethod, ShippingStatus) |
| Favorites | 1 (Favorite) | 1 (FavoriteEntityType) |
| Student lists | 2 (StudentList, StudentListMember) | 0 |
| Content engine | 0 (field additions only) | 1 (ContentSourceType) |
| Gamification alignment | 0 (FK additions only) | 0 |
| **Pass 4 total** | **12 new models** | **9 new enums** |

### 11.9 Final grand total (pass 1 + pass 2 + pass 3 + pass 4)

| | Pass 1 | Pass 2 | Pass 3 | Pass 4 | Combined |
| --- | --- | --- | --- | --- | --- |
| New models | 24 | 9 | 5 | 12 | **50** |
| New enums | 17 | 8 | 4 | 9 | **38** |
| **Total platform models** | | | | | **~86** (36 existing + 50 new) |
