---
title: "SESSION 0029 Raw Source — Programs Curriculum Monetization ChatGPT Paste"
slug: session-0029-programs-curriculum-monetization-chatgpt-raw
type: source
status: active
created: 2026-04-30
updated: 2026-04-30
last_agent: codex-session-0029
pairs_with:
  - docs/sprints/SESSION_0029.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0029 raw source — Programs curriculum monetization ChatGPT paste

The content below is preserved from Brian's pasted ChatGPT chat for SESSION_0029. It is source material, not accepted schema by itself.

---

OSSS. Great question. I tried to search the connected GitHub code index for the live schema/spec, but GitHub repo search is not selected in the file connector right now. I can still ground this in what we already opened through the GitHub API earlier: `SESSION_0027`, `WORKFLOW_5.0`, `cody-preflight`, and the local Dirstarter docs inventory.

From a **schema + spec-design standpoint**, the big missing layer is this:

> You have pieces for Programs, Courses, Certificates, Pricing, and media, but you still need the **commercial product contract** that connects them into sellable learning paths, entitlements, completion rules, certificates, renewals, upsells, and launch-ready Dirstarter-aligned flows.

## The core gap

Right now, the architecture is moving toward:

```txt
Program
  -> ProgramEnrollment
  -> ProgramCourse
  -> Course
  -> Technique / Curriculum / Media
  -> Progress
  -> Certificate
  -> Pricing / Subscription / Invoice / Payment
```

That is good, but for monetization you need more than those nouns.

You need clear answers to:

1. **What exactly is being sold?**
2. **Who can buy it?**
3. **What access does purchase unlock?**
4. **How is curriculum completion measured?**
5. **When does certification become available?**
6. **Is a certificate automatic, instructor-approved, paid, renewable, printable, or all of those?**
7. **How does the system handle trials, bundles, coupons, family/household access, school licensing, and refunds?**

That is the missing spec spine.

---

# 1. Program schema: what is still missing

A `Program` should not just be a container. It needs to be a sellable, enrollable, brand-scoped training product.

## Add or confirm these fields on `Program`

```prisma
model Program {
  id              String   @id @default(cuid())
  brand           Brand
  organizationId  String?
  slug            String
  title           String
  subtitle        String?
  description     String?
  status          ProgramStatus @default(DRAFT)

  programType     ProgramType
  visibility      ProgramVisibility @default(PRIVATE)

  level           ProgramLevel?
  estimatedWeeks  Int?
  estimatedHours  Decimal?
  coverImageUrl   String?
  trailerVideoUrl String?

  enrollmentMode  EnrollmentMode @default(MANUAL)
  capacity        Int?
  startsAt        DateTime?
  endsAt          DateTime?

  requiresWaiver      Boolean @default(false)
  requiresApproval    Boolean @default(false)
  grantsCertificate   Boolean @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization? @relation(fields: [organizationId], references: [id])
  courses         ProgramCourse[]
  enrollments     ProgramEnrollment[]
  pricingPlans    ProgramPricingPlan[]

  @@unique([brand, slug])
  @@index([brand, status])
  @@index([organizationId])
}
```

## Needed enums

```prisma
enum ProgramStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ProgramType {
  COURSE_TRACK
  MEMBERSHIP
  CERTIFICATION
  BOOTCAMP
  CAMP
  PRIVATE_TRAINING
  EVENT_PREP
}

enum ProgramVisibility {
  PRIVATE
  MEMBERS_ONLY
  PUBLIC
}

enum ProgramLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  ALL_LEVELS
}

enum EnrollmentMode {
  MANUAL
  SELF_SERVE
  INVITE_ONLY
  PURCHASE_REQUIRED
}
```

## Why this matters

For monetization, `Program` becomes the public offer. Examples:

| Program                           | Monetization type                     |
| --------------------------------- | ------------------------------------- |
| Beginner Martial Arts Foundations | one-time course or monthly membership |
| Baseline Black Belt Path          | subscription                          |
| Eskrima Certification Level 1     | paid certification                    |
| WEKAF Tournament Prep             | cohort / bootcamp                     |
| Instructor Certification          | approval-gated premium product        |

Without these fields, Programs remain admin data instead of commercial products.

---

# 2. Course schema: what is still missing

A `Course` should be a reusable curriculum object. It may be used inside one or many Programs.

## Add or confirm these fields on `Course`

```prisma
model Course {
  id              String @id @default(cuid())
  brand           Brand
  organizationId  String?
  disciplineId    String?
  slug            String
  title           String
  description     String?
  status          CourseStatus @default(DRAFT)

  courseType      CourseType @default(STANDARD)
  difficulty      ProgramLevel?
  estimatedMinutes Int?

  isPublicPreview Boolean @default(false)
  requiresEnrollment Boolean @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  modules         CourseModule[]
  programs        ProgramCourse[]
  certificates    CertificationRule[]

  @@unique([brand, slug])
  @@index([brand, status])
  @@index([disciplineId])
}
```

## Add `CourseModule` and `Lesson`

This is the curriculum gap. A Course without modules/lessons becomes a flat object.

```prisma
model CourseModule {
  id          String @id @default(cuid())
  courseId    String
  title       String
  description String?
  sortOrder   Int
  isLocked    Boolean @default(false)

  lessons     Lesson[]

  course      Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([courseId, sortOrder])
}

model Lesson {
  id             String @id @default(cuid())
  moduleId       String
  title          String
  slug           String
  lessonType     LessonType
  contentBody    String?
  videoUrl       String?
  durationSeconds Int?
  sortOrder      Int
  isPreview      Boolean @default(false)

  module         CourseModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  requirements   LessonRequirement[]
  progress       LessonProgress[]

  @@unique([moduleId, slug])
  @@unique([moduleId, sortOrder])
}
```

## Needed enum

```prisma
enum LessonType {
  TEXT
  VIDEO
  QUIZ
  DRILL
  TECHNIQUE
  ASSIGNMENT
  LIVE_CLASS
}
```

## Why this matters

Dirstarter-style content/monetization flows usually separate:

```txt
marketing page
  -> product/price
  -> purchase/subscription
  -> protected content
  -> user progress
  -> fulfillment/certificate
```

So your Course model must support both public teaser content and protected paid curriculum.

---

# 3. Curriculum progress: what is still missing

You need progress at multiple levels:

```txt
ProgramEnrollment
CourseProgress
ModuleProgress
LessonProgress
TechniqueProgress
CertificationProgress
```

The minimum useful MVP is:

```prisma
model CourseProgress {
  id            String @id @default(cuid())
  userId        String
  courseId      String
  enrollmentId  String?
  status        ProgressStatus @default(NOT_STARTED)
  percent       Int @default(0)
  startedAt     DateTime?
  completedAt   DateTime?

  @@unique([userId, courseId, enrollmentId])
  @@index([userId])
  @@index([courseId])
}

model LessonProgress {
  id           String @id @default(cuid())
  userId       String
  lessonId     String
  status       ProgressStatus @default(NOT_STARTED)
  completedAt  DateTime?
  lastViewedAt DateTime?

  lesson       Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
}
```

```prisma
enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  APPROVED
  FAILED
}
```

## Missing spec decision

You need to decide whether completion is:

| Completion type     | Example                       |
| ------------------- | ----------------------------- |
| User self-completes | “Mark lesson complete”        |
| System-completes    | watched 90% of video          |
| Instructor approves | technique test / belt test    |
| Assessment score    | quiz or test                  |
| Attendance-based    | attended 8 of 10 live classes |

For martial arts, I would not rely only on self-completion. You need instructor approval for rank/certification-linked material.

---

# 4. Certification schema: the big missing monetization piece

This is the most important missing layer.

You need to separate:

```txt
CertificateTemplate = what the certificate looks like
Certification = what credential exists
CertificationRule = what earns it
CertificateIssuance = who received it
CertificateOrder = paid/printed/shipped certificate transaction
```

## Add `Certification`

```prisma
model Certification {
  id             String @id @default(cuid())
  brand          Brand
  organizationId String?
  disciplineId   String?
  slug           String
  title          String
  description    String?
  status         CertificationStatus @default(DRAFT)

  level          String?
  expiresAfterDays Int?
  requiresRenewal Boolean @default(false)

  templateId     String?
  template       CertificateTemplate? @relation(fields: [templateId], references: [id])

  rules          CertificationRule[]
  issuances      CertificateIssuance[]
  pricingPlans   CertificationPricingPlan[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([brand, slug])
  @@index([brand, status])
  @@index([disciplineId])
}
```

## Add `CertificationRule`

```prisma
model CertificationRule {
  id              String @id @default(cuid())
  certificationId String
  courseId         String?
  programId        String?
  rankId           String?

  requiredPercent  Int?
  requiresInstructorApproval Boolean @default(true)
  requiresPayment  Boolean @default(false)
  requiresAttendanceCount Int?
  requiresAssessmentScore Int?

  certification Certification @relation(fields: [certificationId], references: [id], onDelete: Cascade)
  course        Course? @relation(fields: [courseId], references: [id])
  program       Program? @relation(fields: [programId], references: [id])
  rank          Rank? @relation(fields: [rankId], references: [id])

  @@index([certificationId])
}
```

## Add `CertificateIssuance`

```prisma
model CertificateIssuance {
  id               String
  certificationId  String
  userId           String
  issuedById       String?
  status           CertificateStatus @default(ISSUED)

  certificateNumber String @unique
  issuedAt         DateTime @default(now())
  expiresAt        DateTime?
  revokedAt        DateTime?
  revokeReason     String?

  publicVerifyCode String @unique
  pdfUrl           String?
  metadata         Json?

  certification    Certification @relation(fields: [certificationId], references: [id])
  user             User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([certificationId])
  @@index([status])
}
```

## Add `CertificateOrder`

```prisma
model CertificateOrder {
  id                  String @id @default(cuid())
  certificateIssuanceId String
  userId              String
  status              CertificateOrderStatus @default(PENDING)
  paymentId           String?
  amountCents         Int
  currency            String @default("USD")

  printName           String?
  shippingAddressJson Json?
  shippedAt           DateTime?
  trackingNumber      String?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([certificateIssuanceId])
  @@index([status])
}
```

## Needed enums

```prisma
enum CertificationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum CertificateStatus {
  ISSUED
  EXPIRED
  REVOKED
}

enum CertificateOrderStatus {
  PENDING
  PAID
  PRINTING
  SHIPPED
  CANCELLED
  REFUNDED
}
```

## Why this matters

This unlocks:

| Revenue path                     | Schema support                                   |
| -------------------------------- | ------------------------------------------------ |
| Paid certification course        | Program + PricingPlan + CertificationRule        |
| Certificate fee after completion | CertificateOrder                                 |
| Printable certificate upsell     | CertificateOrder                                 |
| Renewal fee                      | Certification.expiresAfterDays + Renewal product |
| Instructor approval              | CertificationRule.requiresInstructorApproval     |
| Public credential verification   | CertificateIssuance.publicVerifyCode             |

---

# 5. Monetization schema: what is still missing

You likely already have `PricingPlan`, `Invoice`, `Payment`, `PromoCode`, maybe Stripe-related models. But you need a **sellable object abstraction** so Programs, Courses, Certifications, Events, and Memberships can all attach to pricing.

## Add a generic `Product`

```prisma
model Product {
  id          String @id @default(cuid())
  brand       Brand
  slug        String
  name        String
  description String?
  status      ProductStatus @default(DRAFT)
  productType ProductType

  programId       String?
  courseId        String?
  certificationId String?
  eventId         String?

  pricingPlans PricingPlan[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([brand, slug])
  @@index([brand, status])
  @@index([productType])
}
```

## Strengthen `PricingPlan`

```prisma
model PricingPlan {
  id             String @id @default(cuid())
  productId      String?
  brand          Brand
  name           String
  description    String?
  priceCents     Int
  currency       String @default("USD")
  billingInterval BillingInterval
  trialDays      Int?
  status         PricingStatus @default(ACTIVE)

  stripePriceId  String?
  stripeProductId String?

  entitlements   EntitlementGrant[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  product        Product? @relation(fields: [productId], references: [id])

  @@index([brand, status])
  @@index([stripePriceId])
}
```

```prisma
enum ProductType {
  PROGRAM
  COURSE
  CERTIFICATION
  EVENT
  MEMBERSHIP
  CERTIFICATE_PRINT
  BUNDLE
}

enum BillingInterval {
  ONE_TIME
  MONTHLY
  ANNUAL
}

enum PricingStatus {
  ACTIVE
  ARCHIVED
}
```

## Add `Entitlement`

This is the monetization bridge. Payment should unlock entitlements, not random booleans.

```prisma
model Entitlement {
  id          String @id @default(cuid())
  brand       Brand
  key         String
  name        String
  description String?

  grants      EntitlementGrant[]
  assignments UserEntitlement[]

  @@unique([brand, key])
}

model EntitlementGrant {
  id              String @id @default(cuid())
  pricingPlanId   String
  entitlementId   String

  pricingPlan     PricingPlan @relation(fields: [pricingPlanId], references: [id], onDelete: Cascade)
  entitlement     Entitlement @relation(fields: [entitlementId], references: [id], onDelete: Cascade)

  @@unique([pricingPlanId, entitlementId])
}

model UserEntitlement {
  id             String @id @default(cuid())
  userId         String
  entitlementId  String
  sourceType     EntitlementSourceType
  sourceId       String?
  startsAt       DateTime @default(now())
  endsAt         DateTime?
  status         EntitlementStatus @default(ACTIVE)

  entitlement    Entitlement @relation(fields: [entitlementId], references: [id])

  @@index([userId, status])
  @@index([entitlementId])
}
```

```prisma
enum EntitlementSourceType {
  PURCHASE
  SUBSCRIPTION
  MANUAL_GRANT
  MEMBERSHIP
  PROMO
}

enum EntitlementStatus {
  ACTIVE
  EXPIRED
  REVOKED
}
```

## Why this matters

Entitlements make monetization clean:

| Purchase                    | Entitlement granted               |
| --------------------------- | --------------------------------- |
| Baseline Foundations Course | `baseline.course.foundations`     |
| Baseline Monthly Membership | `baseline.program.member-path`    |
| Eskrima Cert Level 1        | `baseline.cert.eskrima-l1`        |
| BBL Premium                 | `bbl.premium.directory`           |
| WEKAF Event Registration    | `wekaf.event.registration.active` |

This keeps the app from turning into a mess of `if paidPlanId === X`.

---

# 6. Program enrollment needs commerce awareness

`ProgramEnrollment` should know whether access came from manual admin enrollment, purchase, trial, coupon, or org membership.

```prisma
model ProgramEnrollment {
  id          String @id @default(cuid())
  programId   String
  userId      String
  status      EnrollmentStatus @default(PENDING)

  sourceType  EnrollmentSourceType
  sourceId    String?

  startedAt   DateTime?
  completedAt DateTime?
  expiresAt   DateTime?

  progressPercent Int @default(0)

  program     Program @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@unique([programId, userId])
  @@index([userId, status])
  @@index([programId, status])
}
```

```prisma
enum EnrollmentStatus {
  PENDING
  ACTIVE
  COMPLETED
  CANCELLED
  EXPIRED
}

enum EnrollmentSourceType {
  MANUAL
  PURCHASE
  SUBSCRIPTION
  TRIAL
  INVITE
  ORG_MEMBERSHIP
}
```

---

# 7. Curriculum-to-rank relationship is missing or under-specified

For martial arts, Courses and Programs often map to rank requirements.

You need a clear model for:

```txt
Rank
  requires
    Techniques
    Lessons
    Attendance
    Instructor approval
    Belt test registration/payment
```

## Add `RankRequirement`

```prisma
model RankRequirement {
  id          String @id @default(cuid())
  rankId      String
  requirementType RequirementType

  courseId    String?
  lessonId    String?
  techniqueId String?
  programId   String?

  requiredCount Int?
  requiredPercent Int?
  requiresApproval Boolean @default(true)

  rank        Rank @relation(fields: [rankId], references: [id], onDelete: Cascade)

  @@index([rankId])
}
```

```prisma
enum RequirementType {
  COURSE_COMPLETION
  LESSON_COMPLETION
  TECHNIQUE_APPROVAL
  ATTENDANCE_COUNT
  TEST_PASS
  MANUAL_APPROVAL
}
```

This is critical for paid testing/certification later.

---

# 8. Spec docs you still need before building

From a spec-design standpoint, I would create these before heavy implementation:

## A. `docs/architecture/programs-curriculum-certification-spec.md`

Must define:

* Program vs Course vs Certification
* enrollment lifecycle
* curriculum hierarchy
* completion rules
* instructor approval rules
* certificate issuance rules
* paid vs free access
* public preview behavior

## B. `docs/architecture/monetization-entitlements-spec.md`

Must define:

* Product
* PricingPlan
* Subscription
* Payment
* Invoice
* Entitlement
* UserEntitlement
* Refund/revoke behavior
* Stripe mapping
* access-control flow

## C. `docs/architecture/dirstarter-commerce-alignment.md`

Must map your schema to Dirstarter docs areas:

| Dirstarter area    | Ronin interpretation                                     |
| ------------------ | -------------------------------------------------------- |
| Auth               | Better Auth user/session protection                      |
| Prisma             | Schema/migration discipline                              |
| Payments           | Stripe-backed PricingPlan/Product                        |
| Content Management | Courses, lessons, curriculum, blog/articles              |
| Monetization       | Products, pricing, subscriptions, entitlements           |
| Automation         | content atom generation, tasks, publish workflow         |
| Blog/SEO           | public program/course/certification landing pages        |
| Theming            | brand-specific Baseline/BBL/WEKAF/RDD presentation       |
| Cron Jobs          | subscription sync, certificate expiry, renewal reminders |

The repo already says every session must begin with a Dirstarter-baseline check and must not bypass baseline capabilities without justification. 

---

# 9. What I would not build yet

Do **not** overbuild these yet:

* full LMS quiz engine
* complex SCORM-like course tracking
* full affiliate payout system
* full multi-school certificate accreditation
* automatic belt promotion without instructor approval
* advanced course bundles with nested subscriptions
* marketplace revenue sharing

Those can come later. The first monetizable spine should be:

```txt
Public Program Page
  -> PricingPlan
  -> Checkout
  -> Entitlement
  -> ProgramEnrollment
  -> Course/Lesson access
  -> Progress
  -> Instructor approval
  -> CertificateIssuance
  -> Optional CertificateOrder
```

That is the MVP money path.

---

# Petey’s recommended SESSION_0029 spec task

Before implementation, make SESSION_0029’s first design deliverable:

```md
SESSION_0029_TASK_01 — Programs/Curriculum/Certification monetization spec
Agent: Petey + Cody + Doug

Deliverable:
Create `docs/architecture/programs-curriculum-certification-spec.md`.

Must include:
1. Program/Course/Certification definitions
2. Schema additions/deviations from current Prisma
3. Monetization mapping
4. Entitlement model
5. Completion/certificate lifecycle
6. Dirstarter alignment table
7. Open questions
8. MVP cut line
```

## My hard recommendation

Build the **entitlement layer** before you build more UI.

Without entitlements, monetization logic will leak everywhere. With entitlements, the system stays clean:

```txt
Payment succeeds
  -> grant entitlement
  -> entitlement unlocks program/course/certification
  -> progress earns certificate
  -> certificate can trigger paid print/order/renewal
```

That is the clean business spine.
