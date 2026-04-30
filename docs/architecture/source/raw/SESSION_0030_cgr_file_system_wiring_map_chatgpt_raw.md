---
title: "SESSION 0030 Raw Source — CGR File System and Wiring Map"
slug: session-0030-cgr-file-system-wiring-map-chatgpt-raw
type: source
status: active
created: 2026-04-30
updated: 2026-04-30
last_agent: codex-session-0030-petey-plan
pairs_with:
  - docs/sprints/SESSION_0030.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0030 raw source — CGR file system and wiring map

The content below is preserved from Brian's pasted ChatGPT chat for SESSION_0030 planning. It is source material, not accepted schema or file layout by itself.

---

OSSS. Here is the **CGR file system + wiring map** for `ronin-dojo-baseline`.

The repo is already Next.js + Expo + Postgres + Prisma + Better Auth, with `Passport`, `DirectoryProfile`, `Organization`, `Discipline`, `RankSystem`, `Rank`, `Membership`, and content models already present.  So this build should extend the existing spine, not replace it.

# 1. New folder system

```txt
apps/web/
  app/
    (public)/
      programs/
        page.tsx
        [programSlug]/
          page.tsx
      certifications/
        page.tsx
        [certificationSlug]/
          page.tsx
      verify-certificate/
        [verifyCode]/
          page.tsx

    (dashboard)/
      dashboard/
        my-path/
          page.tsx
        courses/
          [courseSlug]/
            page.tsx
        lessons/
          [lessonSlug]/
            page.tsx
        rank/
          page.tsx
        certificates/
          page.tsx

    (admin)/
      admin/
        cgr/
          page.tsx
          programs/
            page.tsx
          courses/
            page.tsx
          certifications/
            page.tsx
          reviews/
            page.tsx
          entitlements/
            page.tsx

  components/
    cgr/
      ProgramHero.tsx
      ProgramCard.tsx
      ProgramPricingCard.tsx
      CourseModuleAccordion.tsx
      LessonPlayer.tsx
      LessonCompleteButton.tsx
      StudentPathProgress.tsx
      RankProgressCard.tsx
      CertificationProgressCard.tsx
      CertificateVerifyCard.tsx
      InstructorReviewQueue.tsx
      AdminCGRNav.tsx

  lib/
    cgr/
      cgr-permissions.ts
      cgr-progress.ts
      cgr-certification-rules.ts
      cgr-entitlements.ts
      cgr-gamification.ts

  server/
    cgr/
      program-service.ts
      course-service.ts
      enrollment-service.ts
      progress-service.ts
      entitlement-service.ts
      certification-service.ts
      rank-service.ts
      review-service.ts

  types/
    cgr.ts

  prisma/
    seed-cgr.ts
```

# 2. Prisma models to add

Add these after the existing membership/rank/course area. The core missing layer is still the commercial contract: Product → PricingPlan → Entitlement → Enrollment → Progress → Certification. 

```prisma
model Product {
  id              String @id @default(cuid())
  brand           Brand
  slug            String
  name            String
  description     String?
  productType     ProductType
  status          ProductStatus @default(DRAFT)

  programId       String?
  courseId        String?
  certificationId String?

  pricingPlans    PricingPlan[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([brand, slug])
  @@index([brand, status])
}

model PricingPlan {
  id              String @id @default(cuid())
  productId       String
  brand           Brand
  name            String
  priceCents      Int
  currency        String @default("USD")
  billingInterval BillingInterval
  stripePriceId   String?
  status          PricingStatus @default(ACTIVE)

  product         Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  grants          EntitlementGrant[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

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
  id            String @id @default(cuid())
  pricingPlanId String
  entitlementId String

  pricingPlan   PricingPlan @relation(fields: [pricingPlanId], references: [id], onDelete: Cascade)
  entitlement   Entitlement @relation(fields: [entitlementId], references: [id], onDelete: Cascade)

  @@unique([pricingPlanId, entitlementId])
}

model UserEntitlement {
  id            String @id @default(cuid())
  userId        String
  entitlementId String
  sourceType    EntitlementSourceType
  sourceId      String?
  startsAt      DateTime @default(now())
  endsAt        DateTime?
  status        EntitlementStatus @default(ACTIVE)

  entitlement   Entitlement @relation(fields: [entitlementId], references: [id])

  @@index([userId, status])
}
```

Then add:

```prisma
model Program {
  id                String @id @default(cuid())
  brand             Brand
  organizationId    String?
  slug              String
  title             String
  description       String?
  programType       ProgramType
  status            ProgramStatus @default(DRAFT)
  visibility        ProgramVisibility @default(PRIVATE)
  level             ProgramLevel?
  grantsCertificate Boolean @default(false)

  courses           ProgramCourse[]
  enrollments       ProgramEnrollment[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([brand, slug])
  @@index([brand, status])
}

model ProgramCourse {
  id        String @id @default(cuid())
  programId String
  courseId  String
  sortOrder Int

  program   Program @relation(fields: [programId], references: [id], onDelete: Cascade)
  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([programId, courseId])
  @@unique([programId, sortOrder])
}

model ProgramEnrollment {
  id              String @id @default(cuid())
  programId       String
  userId          String
  status          EnrollmentStatus @default(PENDING)
  sourceType      EnrollmentSourceType
  sourceId        String?
  progressPercent Int @default(0)
  startedAt       DateTime?
  completedAt     DateTime?
  expiresAt       DateTime?

  program         Program @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@unique([programId, userId])
  @@index([userId, status])
}
```

# 3. Service wiring

```txt
program-service.ts
  getPublicPrograms()
  getProgramBySlug()
  getProgramForDashboard()

course-service.ts
  getCourseOutline()
  getLessonForUser()

entitlement-service.ts
  userHasEntitlement()
  grantEntitlement()
  revokeEntitlement()

enrollment-service.ts
  enrollUserInProgram()
  getUserEnrollment()

progress-service.ts
  markLessonComplete()
  calculateCourseProgress()
  calculateProgramProgress()

certification-service.ts
  evaluateCertification()
  issueCertificate()
  verifyCertificate()

rank-service.ts
  getRankProgress()
  evaluateRankRequirements()

review-service.ts
  listPendingReviews()
  approveReview()
  requestRevision()
```

# 4. Access logic

Create:

```txt
apps/web/lib/cgr/cgr-permissions.ts
```

```ts
export function canViewLesson(args: {
  isPreview: boolean;
  hasEntitlement: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
}) {
  return args.isPreview || args.hasEntitlement || args.isAdmin || args.isInstructor;
}

export function canApproveCGR(args: {
  isAdmin: boolean;
  isInstructor: boolean;
  sameBrand: boolean;
}) {
  return args.sameBrand && (args.isAdmin || args.isInstructor);
}

export function canIssueCertificate(args: {
  rulesPassed: boolean;
  instructorApproved: boolean;
  paymentSatisfied: boolean;
}) {
  return args.rulesPassed && args.instructorApproved && args.paymentSatisfied;
}
```

Brand isolation is non-negotiable because the repo’s schema doctrine uses brand-as-column and treats cross-brand leakage as a critical bug class. 

# 5. UI wiring order

Build in this order:

```txt
1. Public programs page
2. Public program detail page
3. Student my-path dashboard
4. Course outline page
5. Lesson player page
6. Lesson complete button
7. Rank progress page
8. Certification progress page
9. Instructor review queue
10. Admin CGR manager
11. Certificate verification page
```

# 6. First launch routes

```txt
/programs
/programs/baseline-foundations
/programs/eskrima-level-1
/programs/bjj-level-1

/dashboard/my-path
/dashboard/courses/baseline-foundations
/dashboard/rank
/dashboard/certificates

/admin/cgr
/admin/cgr/reviews

/verify-certificate/[verifyCode]
```

# 7. MVP seed file

Create:

```txt
apps/web/prisma/seed-cgr.ts
```

Seed:

```txt
Baseline Foundations
Eskrima Level 1
BJJ Level 1
Coach Certification Level 1

Disciplines:
Boxing
Muay Thai
BJJ
Eskrima
Karate
Judo
Self Defense

Entitlements:
baseline.program.foundations
baseline.course.eskrima-l1
baseline.course.bjj-l1
baseline.cert.coach-l1
```

# 8. Task order for Cody

```txt
TASK_01 Add CGR Prisma models/enums
TASK_02 Add seed-cgr.ts
TASK_03 Add cgr types
TASK_04 Add permission helpers
TASK_05 Add entitlement service
TASK_06 Add enrollment service
TASK_07 Add program/course services
TASK_08 Add progress service
TASK_09 Add certification service
TASK_10 Add public program pages
TASK_11 Add dashboard my-path
TASK_12 Add course + lesson views
TASK_13 Add admin review queue
TASK_14 Add certificate verification
TASK_15 Add smoke tests
```

# 9. Critical rule

Do **entitlements before Stripe UI**.

The clean path is:

```txt
PricingPlan
→ EntitlementGrant
→ UserEntitlement
→ ProgramEnrollment
→ Lesson Access
```

Then Stripe simply becomes one source that grants entitlement. That prevents payment logic from leaking everywhere.

OSSS.
