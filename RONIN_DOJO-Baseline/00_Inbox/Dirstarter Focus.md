Here’s the next-session orchestration plan crafted as Petey.  It assigns clear roles and tasks for SESSION_0027 and ties each responsibility back to the relevant sections of Dirstarter’s documentation  .  The plan includes setup steps, data seeding, content workflows, automation integration, monetization features and QA/documentation deliverables.  It ensures everyone knows what to do and why, and it keeps us compliant with the official Dirstarter guide.

  

You can download and review the detailed plan here:  .

  

If you need any adjustments to the plan or want to discuss specific tasks, let me know!


SESSION_0027 – Ronin Dojo Baseline Petey Plan

Overview

In this session we will extend the ronin‑dojo‑baseline repository to build a functional martial‑arts directory using the Dirstarter template.  The goal of SESSION_0027 is to bootstrap a local development environment, seed it with initial data, and configure content automation, monetization and content management features in alignment with Dirstarter’s documentation.

Key references

- Setup & Installation – Dirstarter’s getting‑started guide outlines prerequisites (Node.js 22+, Git and a package manager) and describes how to clone the repository, set up environment variables, install dependencies and initialize the database .
- Content Management – The content workflow covers how users submit tools, how admins review drafts, schedule publication and optionally automate processing and publication .
- Monetization – Dirstarter supports premium listings and a built‑in advertising system  .  Selecting a premium listing notifies administrators and automatically features the listing .
- Automation – Automation uses Jina AI for scraping and Vercel AI Gateway for content generation .  Environment variables such as JINA_API_KEY, AI_GATEWAY_API_KEY, AI_CHAT_MODEL and AI_COMPLETION_MODEL enable these integrations .

Agents & Assignments
|   |   |   |
|---|---|---|
|Role|AssignedÂ agent|Responsibilities|
|EnvironmentÂ Architect|[AgentÂ Kensho]|Ensure prerequisites (Node.jsÂ 22+, Git, package manager) are installed and clone the Dirstarter repository if not already present.Â  Set up a new Postgres database and capture the connection string .Â  Copy .env.example to .env and populate variables for the database, automation keys (JINA_API_KEY, AI_GATEWAY_API_KEY, AI_CHAT_MODEL, AI_COMPLETION_MODEL) as described in the Automation setup .Â  Install dependencies (npm install) and initialize the database with Prisma (npm run db:generate, npm run db:migrateÂ deploy, npm run db:seed) .Â  Start the dev server (npm run dev) so other agents can test features .|
|DataÂ Seeder|[AgentÂ Mizuno]|Review the default seed data and extend it to include martialâ€‘arts tools relevant to the RoninÂ Dojo context.Â  Use the provided seed files or create a custom CSV to import new entries.Â  Ensure that each entry contains name, description, URL and relevant metadata.Â  This prepares content for the directory and allows the Content team to validate listing workflows.|
|ContentÂ Manager|[AgentÂ Tatsu]|Using the admin dashboard (/admin), test user submission and adminâ€‘review workflows.Â  Submit a new tool, verify it appears as a draft and exercise the admin actions: approve, schedule publication and delete.Â  Ensure the scheduling interface supports selecting a future publication date and sending notification emails .Â  Document any issues for the developer team.|
|AutomationÂ Engineer|[AgentÂ Yori]|Integrate automation by configuring JinaÂ AI and Vercel AI Gateway.Â  Verify that when a new tool with a URL is approved, automation triggers scraping (JinaÂ AI) and generates structured content and media via Vercel AI models .Â  Adjust the CONTENT_SYSTEM_PROMPT in lib/ai.ts to produce consistent descriptions and experiment with model parameters (temperature and model choice) .Â  Confirm that screenshots and favicons are generated automatically .|
|MonetizationÂ Specialist|[AgentÂ Rei]|Implement premium listing tiers (Free, Standard, Premium) and verify that the listing plan selection page appears after submission.Â  Ensure that selecting Premium triggers admin notifications and sets the listing as featured .Â  Configure the builtâ€‘in advertising system by defining ad placements (Banner, Tools, ToolPage, BlogPost, Bottom and All) and enabling scheduling and rotation features .Â  Set up Stripe or the chosen payment provider (relying on the Payments guide) and create a test product to validate payment flows.|
|QAÂ &Â Documentation|[AgentÂ Sakura]|Test the endâ€‘toâ€‘end workflow across all features: submission, approval, scheduling, automation, publication, premium listing purchase and ad bookings.Â  Record any bugs or UX issues and ensure they are filed with clear reproduction steps.Â  Update the projectâ€™s SESSION_0027.md or equivalent session log with a summary of tasks completed, decisions made and any deviations from the plan.|


Deliverables

- A configured Dirstarter instance running locally with environment variables set and database seeded.
- Extended seed data covering multiple martial‑arts tools.
- Functional content submission and scheduling workflow verified through admin interface.
- Automation integrated with working AI content generation and media scraping.
- Premium listing and advertising features implemented and tested.
- QA report and session summary documented.

Alignment notes

This plan adheres to Dirstarter’s official documentation: prerequisites and database setup are drawn from the Getting‑Started guide , content workflow details come from the Content‑Management page , monetization features follow the Monetization guide  , and automation configuration comes from the Automation page .  Each agent’s tasks map directly to these documented processes, ensuring our implementation remains compliant and up‑to‑date.


OSSS. Bow in.

I’m in the repo now. The target repo is Ronin-Dojo-Design/ronin-dojo-baseline, and the live repo confirms docs/sprints/SESSION_0027.md already exists and is closed as a governance audit + SOP compliance restoration session, not the Dirstarter feature implementation plan we drafted earlier. That matters: the repo’s actual SESSION_0027 was used to restore WORKFLOW 5.0 discipline, mitigate FS-0006/FS-0007, merge logs into project-log.md, drop fake health scores, and wire the SOPs into cody-preflight.md.  

Petey read: what actually changed

The “above plan” should not replace SESSION_0027. It should be treated as the external Petey/Dirstarter implementation intent and folded into the next planning lane, because SESSION_0027 is already closed with a 9.5 governance review. Its own follow-up says the next session should re-sequence WORKFLOW_5.0.md, then begin the first real feature lane.  

The current WORKFLOW_5.0.md calendar is stale. It still maps SESSION_0027 to “Tournament operations,” even though actual SESSION_0027 became governance cleanup. The file’s own hard rules require a Dirstarter-baseline check every session, one primary lane, max three deliverables, scoring, and a fresh follow-up if below 9.5.  

The repo also already has a Dirstarter docs inventory. It names the official docs surface we should align against: setup, codebase, integrations, content management, monetization, automation, blog, SEO, i18n, auth, theming, Prisma, deployment, and cron jobs.  

Petey correction

The right move is:

Do not redo SESSION_0027.  
Use SESSION_0027 as the governance correction that makes the next implementation safe.

The plan we created around Dirstarter setup, content workflows, automation, monetization, QA, and seeded martial-arts directory content should become part of:

SESSION_0028 — WORKFLOW 5.0 Calendar Re-sequence + Dirstarter-Aligned Feature Lane

SESSION_0028 primary lane

Core platform → School Operations / Directory Foundation

Reason: SESSION_0027 says schema work from SESSION_0026 is complete enough to proceed, but the calendar must be fixed before feature work resumes. It recommends Programs first, but your Dirstarter-aligned plan points toward directory/content/monetization foundations. I would merge those as:

1. Re-sequence WORKFLOW_5.0
2. Run Cody pre-flight for the first implementation lane
3. Begin the smallest Dirstarter-aligned slice: Programs/Directory seed + content workflow proof

That keeps WORKFLOW honest and still preserves the Dirstarter plan.

Agent assignments for next session

|   |   |   |
|---|---|---|
|Task|Agent|Assignment|
|SESSION_0028_TASK_01|Petey|Re-sequence docs/protocols/WORKFLOW_5.0.md so SESSION_0021–0027 reflect reality and SESSION_0028–0040 reflect the actual next implementation order.|
|SESSION_0028_TASK_02|Giddy|Verify branch/worktree posture, source-of-truth paths, Dirstarter baseline scope, and confirm whether feature work should start in wt-school-ops, wt-core-platform, or direct main documentation first.|
|SESSION_0028_TASK_03|Cody|Run the expanded cody-preflight.md Schema + Backend checklist before touching feature code. This is now required for schema/backend/server-action work.|
|SESSION_0028_TASK_04|Iggy|Convert the Dirstarter content/automation/monetization plan into reusable content atoms, seed records, publication variants, and QA proof requirements.|
|SESSION_0028_TASK_05|Doug|Define pass/fail proof: Dirstarter alignment table filled, Program/Directory page renders, seed data works, permission and brand filtering checked, docs updated.|
|SESSION_0028_TASK_06|Brandon + Desi|Keep Baseline Martial Arts voice and UX aligned while not prematurely renaming internal Tuff Buffs/Baseline identifiers.|

How the old Petey plan folds in

The previous Petey/Dirstarter plan becomes a source packet, not the session truth. Fold it into WORKFLOW 5.0 as the next feature sequence:

|   |   |
|---|---|
|New calendar lane|Folded-in Dirstarter plan|
|SESSION_0028|Calendar re-sequence + Program/Directory foundation|
|SESSION_0029|Dirstarter content-management workflow proof: submit → draft → admin review → publish|
|SESSION_0030|Seed martial-arts directory content: organizations, disciplines, programs, ranks, trial flows|
|SESSION_0031|Automation proof: scrape/generate/enrich content only where Dirstarter automation layer supports it|
|SESSION_0032|Monetization proof: listing tiers, featured listings, ads/payment boundaries|
|SESSION_0033|QA hardening: Playwright/browser smoke + Dirstarter compliance score|
|SESSION_0034+|Brand/content launch lanes for Baseline, BBL, WEKAF, RDD|

Dirstarter alignment guard

Every next session should explicitly answer the required table from WORKFLOW 5.0:

|   |   |
|---|---|
|Field|SESSION_0028 answer|
|Dirstarter baseline touched|Docs/calendar governance, then School Ops / content foundation|
|Extension or replacement|Extend Dirstarter baseline; do not replace auth, Prisma, storage, content, monetization, or automation unless justified|
|Why justified|Repo calendar is stale; feature work needs an accurate launch operating system and pre-flight gate|
|Risk if bypassed|Agents load wrong lane expectations, skip pre-flight, and repeat FS-0006/FS-0007 failures|

Petey next-session prompt

Use this as the bow-in for the next session:

Bow in. Act as Petey in `Ronin-Dojo-Design/ronin-dojo-baseline`.

  

Read:

1. `docs/rituals/opening.md`

2. `docs/sprints/SESSION_0027.md`

3. `docs/protocols/WORKFLOW_5.0.md`

4. `docs/protocols/cody-preflight.md`

5. `docs/knowledge/wiki/dirstarter-docs-inventory.md`

6. `docs/runbooks/dev-environment.md`

7. `apps/web/prisma/schema.prisma`

  

Primary objective:

Re-sequence WORKFLOW_5.0 calendar so SESSION_0021–0027 reflect actual repo history and SESSION_0028–0040 reflect the next real Dirstarter-aligned implementation path.

  

Then begin SESSION_0028 as a strict WORKFLOW 5.0 lane:

- one primary lane

- max three deliverables

- Dirstarter alignment table

- Cody pre-flight before implementation

- Doug QA proof

- 9.5 close target

  

Fold the earlier Petey Dirstarter implementation plan into the calendar, but do not overwrite SESSION_0027. SESSION_0027 is already closed as governance restoration.

Final Petey call

The repo is healthier than the previous plan assumed. SESSION_0027 already did the governance cleanup we needed. The next move is not “implement SESSION_0027.” It is:

Use SESSION_0027 as the guardrail, fix WORKFLOW_5.0’s stale calendar, then start the first Dirstarter-aligned feature lane cleanly.

Planned Passion Produces Purpose. OSSS.

OSSS. Great question. I tried to search the connected GitHub code index for the live schema/spec, but GitHub repo search is not selected in the file connector right now. I can still ground this in what we already opened through the GitHub API earlier: SESSION_0027, WORKFLOW_5.0, cody-preflight, and the local Dirstarter docs inventory.

From a schema + spec-design standpoint, the big missing layer is this:

You have pieces for Programs, Courses, Certificates, Pricing, and media, but you still need the commercial product contract that connects them into sellable learning paths, entitlements, completion rules, certificates, renewals, upsells, and launch-ready Dirstarter-aligned flows.

The core gap

Right now, the architecture is moving toward:

Program

  -> ProgramEnrollment

  -> ProgramCourse

  -> Course

  -> Technique / Curriculum / Media

  -> Progress

  -> Certificate

  -> Pricing / Subscription / Invoice / Payment

That is good, but for monetization you need more than those nouns.

You need clear answers to:

1. What exactly is being sold?
2. Who can buy it?
3. What access does purchase unlock?
4. How is curriculum completion measured?
5. When does certification become available?
6. Is a certificate automatic, instructor-approved, paid, renewable, printable, or all of those?
7. How does the system handle trials, bundles, coupons, family/household access, school licensing, and refunds?

That is the missing spec spine.

  

1. Program schema: what is still missing

A Program should not just be a container. It needs to be a sellable, enrollable, brand-scoped training product.

Add or confirm these fields on

Program

model Program {

  id              String   @id @default(cuid())

  brand           Brand

  organizationId  String?

  slug            String

  title           String

  subtitle        String?

  description     String?

  status          ProgramStatus @default(DRAFT)

  

  programType     ProgramType

  visibility      ProgramVisibility @default(PRIVATE)

  

  level           ProgramLevel?

  estimatedWeeks  Int?

  estimatedHours  Decimal?

  coverImageUrl   String?

  trailerVideoUrl String?

  

  enrollmentMode  EnrollmentMode @default(MANUAL)

  capacity        Int?

  startsAt        DateTime?

  endsAt          DateTime?

  

  requiresWaiver      Boolean @default(false)

  requiresApproval    Boolean @default(false)

  grantsCertificate   Boolean @default(false)

  

  createdAt       DateTime @default(now())

  updatedAt       DateTime @updatedAt

  

  organization    Organization? @relation(fields: [organizationId], references: [id])

  courses         ProgramCourse[]

  enrollments     ProgramEnrollment[]

  pricingPlans    ProgramPricingPlan[]

  

  @@unique([brand, slug])

  @@index([brand, status])

  @@index([organizationId])

}

Needed enums

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

Why this matters

For monetization, Program becomes the public offer. Examples:

|   |   |
|---|---|
|Program|Monetization type|
|Beginner Martial Arts Foundations|one-time course or monthly membership|
|Baseline Black Belt Path|subscription|
|Eskrima Certification Level 1|paid certification|
|WEKAF Tournament Prep|cohort / bootcamp|
|Instructor Certification|approval-gated premium product|

Without these fields, Programs remain admin data instead of commercial products.

  

2. Course schema: what is still missing

A Course should be a reusable curriculum object. It may be used inside one or many Programs.

Add or confirm these fields on

Course

model Course {

  id              String @id @default(cuid())

  brand           Brand

  organizationId  String?

  disciplineId    String?

  slug            String

  title           String

  description     String?

  status          CourseStatus @default(DRAFT)

  

  courseType      CourseType @default(STANDARD)

  difficulty      ProgramLevel?

  estimatedMinutes Int?

  

  isPublicPreview Boolean @default(false)

  requiresEnrollment Boolean @default(true)

  

  createdAt       DateTime @default(now())

  updatedAt       DateTime @updatedAt

  

  modules         CourseModule[]

  programs        ProgramCourse[]

  certificates    CertificationRule[]

  

  @@unique([brand, slug])

  @@index([brand, status])

  @@index([disciplineId])

}

Add

CourseModule

and

Lesson

This is the curriculum gap. A Course without modules/lessons becomes a flat object.

model CourseModule {

  id          String @id @default(cuid())

  courseId    String

  title       String

  description String?

  sortOrder   Int

  isLocked    Boolean @default(false)

  

  lessons     Lesson[]

  

  course      Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  

  @@unique([courseId, sortOrder])

}

  

model Lesson {

  id             String @id @default(cuid())

  moduleId       String

  title          String

  slug           String

  lessonType     LessonType

  contentBody    String?

  videoUrl       String?

  durationSeconds Int?

  sortOrder      Int

  isPreview      Boolean @default(false)

  

  module         CourseModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  requirements   LessonRequirement[]

  progress       LessonProgress[]

  

  @@unique([moduleId, slug])

  @@unique([moduleId, sortOrder])

}

Needed enum

enum LessonType {

  TEXT

  VIDEO

  QUIZ

  DRILL

  TECHNIQUE

  ASSIGNMENT

  LIVE_CLASS

}

Why this matters

Dirstarter-style content/monetization flows usually separate:

marketing page

  -> product/price

  -> purchase/subscription

  -> protected content

  -> user progress

  -> fulfillment/certificate

So your Course model must support both public teaser content and protected paid curriculum.

  

3. Curriculum progress: what is still missing

You need progress at multiple levels:

ProgramEnrollment

CourseProgress

ModuleProgress

LessonProgress

TechniqueProgress

CertificationProgress

The minimum useful MVP is:

model CourseProgress {

  id            String @id @default(cuid())

  userId        String

  courseId      String

  enrollmentId  String?

  status        ProgressStatus @default(NOT_STARTED)

  percent       Int @default(0)

  startedAt     DateTime?

  completedAt   DateTime?

  

  @@unique([userId, courseId, enrollmentId])

  @@index([userId])

  @@index([courseId])

}

  

model LessonProgress {

  id           String @id @default(cuid())

  userId       String

  lessonId     String

  status       ProgressStatus @default(NOT_STARTED)

  completedAt  DateTime?

  lastViewedAt DateTime?

  

  lesson       Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  

  @@unique([userId, lessonId])

  @@index([userId])

}

enum ProgressStatus {

  NOT_STARTED

  IN_PROGRESS

  COMPLETED

  APPROVED

  FAILED

}

Missing spec decision

You need to decide whether completion is:

|   |   |
|---|---|
|Completion type|Example|
|User self-completes|“Mark lesson complete”|
|System-completes|watched 90% of video|
|Instructor approves|technique test / belt test|
|Assessment score|quiz or test|
|Attendance-based|attended 8 of 10 live classes|

For martial arts, I would not rely only on self-completion. You need instructor approval for rank/certification-linked material.

  

4. Certification schema: the big missing monetization piece

This is the most important missing layer.

You need to separate:

CertificateTemplate = what the certificate looks like

Certification = what credential exists

CertificationRule = what earns it

CertificateIssuance = who received it

CertificateOrder = paid/printed/shipped certificate transaction

Add

Certification

model Certification {

  id             String @id @default(cuid())

  brand          Brand

  organizationId String?

  disciplineId   String?

  slug           String

  title          String

  description    String?

  status         CertificationStatus @default(DRAFT)

  

  level          String?

  expiresAfterDays Int?

  requiresRenewal Boolean @default(false)

  

  templateId     String?

  template       CertificateTemplate? @relation(fields: [templateId], references: [id])

  

  rules          CertificationRule[]

  issuances      CertificateIssuance[]

  pricingPlans   CertificationPricingPlan[]

  

  createdAt      DateTime @default(now())

  updatedAt      DateTime @updatedAt

  

  @@unique([brand, slug])

  @@index([brand, status])

  @@index([disciplineId])

}

Add

CertificationRule

model CertificationRule {

  id              String @id @default(cuid())

  certificationId String

  courseId         String?

  programId        String?

  rankId           String?

  

  requiredPercent  Int?

  requiresInstructorApproval Boolean @default(true)

  requiresPayment  Boolean @default(false)

  requiresAttendanceCount Int?

  requiresAssessmentScore Int?

  

  certification Certification @relation(fields: [certificationId], references: [id], onDelete: Cascade)

  course        Course? @relation(fields: [courseId], references: [id])

  program       Program? @relation(fields: [programId], references: [id])

  rank          Rank? @relation(fields: [rankId], references: [id])

  

  @@index([certificationId])

}

Add

CertificateIssuance

model CertificateIssuance {

  id               String @id @default(cuid())

  certificationId  String

  userId           String

  issuedById       String?

  status           CertificateStatus @default(ISSUED)

  

  certificateNumber String @unique

  issuedAt         DateTime @default(now())

  expiresAt        DateTime?

  revokedAt        DateTime?

  revokeReason     String?

  

  publicVerifyCode String @unique

  pdfUrl           String?

  metadata         Json?

  

  certification    Certification @relation(fields: [certificationId], references: [id])

  user             User @relation(fields: [userId], references: [id])

  

  @@index([userId])

  @@index([certificationId])

  @@index([status])

}

Add

CertificateOrder

model CertificateOrder {

  id                  String @id @default(cuid())

  certificateIssuanceId String

  userId              String

  status              CertificateOrderStatus @default(PENDING)

  paymentId           String?

  amountCents         Int

  currency            String @default("USD")

  

  printName           String?

  shippingAddressJson Json?

  shippedAt           DateTime?

  trackingNumber      String?

  

  createdAt           DateTime @default(now())

  updatedAt           DateTime @updatedAt

  

  @@index([userId])

  @@index([certificateIssuanceId])

  @@index([status])

}

Needed enums

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

Why this matters

This unlocks:

|   |   |
|---|---|
|Revenue path|Schema support|
|Paid certification course|Program + PricingPlan + CertificationRule|
|Certificate fee after completion|CertificateOrder|
|Printable certificate upsell|CertificateOrder|
|Renewal fee|Certification.expiresAfterDays + Renewal product|
|Instructor approval|CertificationRule.requiresInstructorApproval|
|Public credential verification|CertificateIssuance.publicVerifyCode|

  

5. Monetization schema: what is still missing

You likely already have PricingPlan, Invoice, Payment, PromoCode, maybe Stripe-related models. But you need a sellable object abstraction so Programs, Courses, Certifications, Events, and Memberships can all attach to pricing.

Add a generic

Product

model Product {

  id          String @id @default(cuid())

  brand       Brand

  slug        String

  name        String

  description String?

  status      ProductStatus @default(DRAFT)

  productType ProductType

  

  programId       String?

  courseId        String?

  certificationId String?

  eventId         String?

  

  pricingPlans PricingPlan[]

  

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  

  @@unique([brand, slug])

  @@index([brand, status])

  @@index([productType])

}

Strengthen

PricingPlan

model PricingPlan {

  id             String @id @default(cuid())

  productId      String?

  brand          Brand

  name           String

  description    String?

  priceCents     Int

  currency       String @default("USD")

  billingInterval BillingInterval

  trialDays      Int?

  status         PricingStatus @default(ACTIVE)

  

  stripePriceId  String?

  stripeProductId String?

  

  entitlements   EntitlementGrant[]

  

  createdAt      DateTime @default(now())

  updatedAt      DateTime @updatedAt

  

  product        Product? @relation(fields: [productId], references: [id])

  

  @@index([brand, status])

  @@index([stripePriceId])

}

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

Add

Entitlement

This is the monetization bridge. Payment should unlock entitlements, not random booleans.

model Entitlement {

  id          String @id @default(cuid())

  brand       Brand

  key         String

  name        String

  description String?

  

  grants      EntitlementGrant[]

  assignments UserEntitlement[]

  

  @@unique([brand, key])

}

  

model EntitlementGrant {

  id              String @id @default(cuid())

  pricingPlanId   String

  entitlementId   String

  

  pricingPlan     PricingPlan @relation(fields: [pricingPlanId], references: [id], onDelete: Cascade)

  entitlement     Entitlement @relation(fields: [entitlementId], references: [id], onDelete: Cascade)

  

  @@unique([pricingPlanId, entitlementId])

}

  

model UserEntitlement {

  id             String @id @default(cuid())

  userId         String

  entitlementId  String

  sourceType     EntitlementSourceType

  sourceId       String?

  startsAt       DateTime @default(now())

  endsAt         DateTime?

  status         EntitlementStatus @default(ACTIVE)

  

  entitlement    Entitlement @relation(fields: [entitlementId], references: [id])

  

  @@index([userId, status])

  @@index([entitlementId])

}

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

Why this matters

Entitlements make monetization clean:

|   |   |
|---|---|
|Purchase|Entitlement granted|
|Baseline Foundations Course|baseline.course.foundations|
|Baseline Monthly Membership|baseline.program.member-path|
|Eskrima Cert Level 1|baseline.cert.eskrima-l1|
|BBL Premium|bbl.premium.directory|
|WEKAF Event Registration|wekaf.event.registration.active|

This keeps the app from turning into a mess of if paidPlanId === X.

  

6. Program enrollment needs commerce awareness

ProgramEnrollment should know whether access came from manual admin enrollment, purchase, trial, coupon, or org membership.

model ProgramEnrollment {

  id          String @id @default(cuid())

  programId   String

  userId      String

  status      EnrollmentStatus @default(PENDING)

  

  sourceType  EnrollmentSourceType

  sourceId    String?

  

  startedAt   DateTime?

  completedAt DateTime?

  expiresAt   DateTime?

  

  progressPercent Int @default(0)

  

  program     Program @relation(fields: [programId], references: [id], onDelete: Cascade)

  

  @@unique([programId, userId])

  @@index([userId, status])

  @@index([programId, status])

}

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

  

7. Curriculum-to-rank relationship is missing or under-specified

For martial arts, Courses and Programs often map to rank requirements.

You need a clear model for:

Rank

  requires

    Techniques

    Lessons

    Attendance

    Instructor approval

    Belt test registration/payment

Add

RankRequirement

model RankRequirement {

  id          String @id @default(cuid())

  rankId      String

  requirementType RequirementType

  

  courseId    String?

  lessonId    String?

  techniqueId String?

  programId   String?

  

  requiredCount Int?

  requiredPercent Int?

  requiresApproval Boolean @default(true)

  

  rank        Rank @relation(fields: [rankId], references: [id], onDelete: Cascade)

  

  @@index([rankId])

}

enum RequirementType {

  COURSE_COMPLETION

  LESSON_COMPLETION

  TECHNIQUE_APPROVAL

  ATTENDANCE_COUNT

  TEST_PASS

  MANUAL_APPROVAL

}

This is critical for paid testing/certification later.

  

8. Spec docs you still need before building

From a spec-design standpoint, I would create these before heavy implementation:

A.

docs/architecture/programs-curriculum-certification-spec.md

Must define:

- Program vs Course vs Certification
- enrollment lifecycle
- curriculum hierarchy
- completion rules
- instructor approval rules
- certificate issuance rules
- paid vs free access
- public preview behavior

B.

docs/architecture/monetization-entitlements-spec.md

Must define:

- Product
- PricingPlan
- Subscription
- Payment
- Invoice
- Entitlement
- UserEntitlement
- Refund/revoke behavior
- Stripe mapping
- access-control flow

C.

docs/architecture/dirstarter-commerce-alignment.md

Must map your schema to Dirstarter docs areas:

|   |   |
|---|---|
|Dirstarter area|Ronin interpretation|
|Auth|Better Auth user/session protection|
|Prisma|Schema/migration discipline|
|Payments|Stripe-backed PricingPlan/Product|
|Content Management|Courses, lessons, curriculum, blog/articles|
|Monetization|Products, pricing, subscriptions, entitlements|
|Automation|content atom generation, tasks, publish workflow|
|Blog/SEO|public program/course/certification landing pages|
|Theming|brand-specific Baseline/BBL/WEKAF/RDD presentation|
|Cron Jobs|subscription sync, certificate expiry, renewal reminders|

The repo already says every session must begin with a Dirstarter-baseline check and must not bypass baseline capabilities without justification.  

  

9. What I would not build yet

Do not overbuild these yet:

- full LMS quiz engine
- complex SCORM-like course tracking
- full affiliate payout system
- full multi-school certificate accreditation
- automatic belt promotion without instructor approval
- advanced course bundles with nested subscriptions
- marketplace revenue sharing

Those can come later. The first monetizable spine should be:

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

That is the MVP money path.

  

Petey’s recommended SESSION_0028 spec task

Before implementation, make SESSION_0028’s first design deliverable:

SESSION_0028_TASK_01 — Programs/Curriculum/Certification monetization spec

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

My hard recommendation

Build the entitlement layer before you build more UI.

Without entitlements, monetization logic will leak everywhere. With entitlements, the system stays clean:

Payment succeeds

  -> grant entitlement

  -> entitlement unlocks program/course/certification

  -> progress earns certificate

  -> certificate can trigger paid print/order/renewal

That is the clean business spine.