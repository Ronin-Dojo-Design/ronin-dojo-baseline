---
title: "Programs, Curriculum, and Certification Spec"
slug: programs-curriculum-certification-spec
type: file
status: active
created: 2026-04-30
updated: 2026-04-30
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/source/raw/SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md
  - apps/web/prisma/schema.prisma
backlinks:
  - docs/sprints/SESSION_0029.md
  - docs/knowledge/wiki/index.md
---

# Programs, Curriculum, and Certification Spec

## Purpose

Define the product-facing learning path contract before more School Ops or curriculum UI is built.

This doc converts the raw SESSION_0029 ChatGPT paste into accepted repo guidance. The raw source is preserved in [SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md](source/raw/SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md). The raw Prisma blocks are examples and gap prompts, not migration instructions.

## Authority

| Layer | Source |
| --- | --- |
| L1 structure | Dirstarter docs: [Project Structure](https://dirstarter.com/docs/codebase/structure), [Prisma Setup](https://dirstarter.com/docs/database/prisma), [Authentication](https://dirstarter.com/docs/authentication) |
| Current schema | `apps/web/prisma/schema.prisma` |
| Existing schema design | [S2 Schema Additions](s2-schema-additions.md), [Petey Pass 4](PETEY_PLAN_S2_SCHEMA_PASS4.md), [Data Model](data-model.md) |
| Commercial access | [Monetization + Entitlements Spec](monetization-entitlements-spec.md) |

## Definitions

| Concept | Definition | Current schema status |
| --- | --- | --- |
| Program | A brand- and organization-scoped sellable/enrollable offering, such as "Kids Karate 5-8", "Baseline Black Belt Path", or "Eskrima Certification Level 1". | `Program` exists with org, discipline, status, age/capacity, course, pricing, waiver, announcement, lead relations. |
| Course | A reusable curriculum object. A course can belong to an org/discipline/rank and can be used by one or more Programs through `ProgramCourse`. | `Course`, `CurriculumItem`, `CourseEnrollment`, and `CurriculumItemCompletion` exist. |
| Certification | A formal credential record issued to a user by an organization. For now this is a user-owned credential, not the definition of a credential product. | `Certification` exists as an issuance-like credential record. Do not duplicate it with a second raw-style `Certification` model without a migration plan. |
| CertificateTemplate | The branded certificate layout/product template. May be included or purchasable. | Exists with delivery method, price, layout, org scope, orders, and issuances. |
| CertificateIssuance | The actual issued certificate artifact with number, QR verification, PDF URL, expiry/revocation. | Exists. |
| CertificateOrder | The purchase/fulfillment record for a certificate. | Exists with amount, payment status, shipping status, and Stripe payment intent id. |

## Current Schema Inventory

| Area | Existing models/enums | Notes |
| --- | --- | --- |
| Programs | `Program`, `ProgramCourse`, `ProgramEnrollment`, `ProgramStatus`, `EnrollmentStatus` | `Program` already links to `PricingPlan`; raw `ProgramPricingPlan` would duplicate this. |
| Curriculum | `Course`, `CurriculumItem`, `CourseEnrollment`, `CurriculumItemCompletion` | Raw `CourseModule`, `Lesson`, `CourseProgress`, and `LessonProgress` overlap with these. |
| Techniques | `Technique`, `TechniqueCurriculumLink`, `TechniqueProgress` | Technique approval already exists as a separate progress path. |
| Certificates | `Certification`, `CertificateTemplate`, `CertificateOrder`, `CertificateIssuance`, `CertificationStatus`, `CertificateDeliveryMethod`, `PaymentStatus`, `ShippingStatus` | Raw certificate models are mostly already landed, with naming/status differences. |
| Billing connection | `PricingPlan`, `Invoice`, `InvoiceLineItem`, `Payment` | Commercial access behavior belongs in entitlements, not in Program/Course booleans. |

## DRY Findings

Do not blindly add the raw models. The repo already has the core nouns.

| Raw suggestion | DRY risk | Accepted handling |
| --- | --- | --- |
| `Program.title` with `@@unique([brand, slug])` | Current model uses `name` and `@@unique([brand, organizationId, slug])`; removing org from uniqueness would break multi-school reuse. | Keep current `name` and org-scoped slug. Add public offer fields later only as deltas. |
| `ProgramPricingPlan` | Current `PricingPlan.programId` already links plans to programs. | Do not add a join table unless one plan must attach to many programs. |
| `CourseModule` and `Lesson` | Current `CurriculumItem` is the lesson-like ordered unit. | Use `CurriculumItem` for MVP. Add modules/lessons only if nested curriculum becomes launch-critical. |
| `CourseProgress` and `LessonProgress` | Current `CourseEnrollment` and `CurriculumItemCompletion` already track course/item completion. | Extend existing tables with status/percent fields if needed. Do not add parallel progress ledgers. |
| Raw `Certification` as credential definition | Current `Certification` is a user credential record. | If a credential catalog is needed, name it `CertificationDefinition` or `CredentialDefinition` in a later migration plan. |
| Raw `CertificateOrderStatus` | Current order uses `PaymentStatus` + `ShippingStatus`. | Reuse current statuses. Add status only if fulfillment needs a single combined state. |
| Raw `CertificateIssuance.publicVerifyCode` | Current equivalent is `qrVerificationCode`. | Keep current field name unless public URL semantics require a rename migration. |

## Learning Path Lifecycle

```txt
Public Program Page
  -> PricingPlan
  -> Checkout
  -> Entitlement
  -> ProgramEnrollment
  -> ProgramCourse
  -> Course
  -> CurriculumItem / Technique
  -> Completion or approval
  -> Certification
  -> CertificateIssuance
  -> Optional CertificateOrder
```

The entitlement handoff is mandatory for paid access. A successful payment should grant access; UI code should not check plan IDs directly.

## Enrollment Lifecycle

Accepted lifecycle for Program enrollment with the current enum:

```txt
WAITLISTED or ACTIVE
  -> COMPLETED
  -> WITHDRAWN or SUSPENDED
```

Current `EnrollmentStatus` supports `ACTIVE`, `WAITLISTED`, `COMPLETED`, `WITHDRAWN`, and `SUSPENDED`. The raw source's `PENDING` state should not be added unless purchase-required or approval-required enrollment needs a separate pre-active state.

Future schema deltas to consider before enrollment/payment implementation:

| Field | Target | Reason |
| --- | --- | --- |
| `sourceType` | `ProgramEnrollment` | Manual, purchase, subscription, trial, invite, org membership. |
| `sourceId` | `ProgramEnrollment` | Link to payment/subscription/invite/manual grant source. |
| `startedAt` | `ProgramEnrollment` | Separate start from created/enrolled time. |
| `completedAt` | `ProgramEnrollment` | Completion lifecycle. |
| `expiresAt` | `ProgramEnrollment` | Trials, camps, subscription windows. |
| `progressPercent` | `ProgramEnrollment` | Program-level progress rollup. |

## Curriculum Hierarchy

MVP hierarchy uses current schema:

```txt
Program
  -> ProgramCourse
  -> Course
  -> CurriculumItem
  -> CurriculumItemCompletion
  -> TechniqueCurriculumLink
  -> TechniqueProgress
```

`CurriculumItem` may represent a lesson, technique, drill, note, video, assignment, or assessment checkpoint. Do not introduce a separate `Lesson` table until one of these is true:

- Modules/sections must be nested beyond a single ordered list.
- Lesson previews need separate public URLs and SEO metadata.
- Quiz/assignment/live-class types need behavior that cannot live on `CurriculumItem`.
- Existing curriculum data cannot be migrated cleanly into `CurriculumItem`.

## Completion Rules

Completion can be earned through one or more mechanisms:

| Completion type | Example | MVP stance |
| --- | --- | --- |
| User self-completion | Mark item complete | Allowed only for non-rank, non-cert content. |
| System-completion | Watched required video portion | Deferred. |
| Instructor approval | Technique test, belt test, certification review | Required for rank/certification-linked material. |
| Assessment score | Quiz or written test | Deferred beyond simple manual approval. |
| Attendance-based | Attended 8 of 10 classes | Use `Attendance` once the class slice lands. |

MVP rule: rank/certification progress must have instructor or admin approval before issuing credentials.

## Public Preview Behavior

| Surface | Public behavior | Protected behavior |
| --- | --- | --- |
| Program page | Published/active Programs can show title, description, schedule summary, price summary, and CTA. | Enrollment, protected curriculum, and progress require auth and entitlement/enrollment checks. |
| Course page | Course metadata and explicit preview items can be shown. | Full course content requires enrollment or entitlement. |
| Certificate verification | Verification page can expose certificate number, recipient display name, issuer, status, and expiry. | Private metadata, order details, user profile internals, and payment details stay protected. |

Future schema deltas:

- Add a preview flag to `CurriculumItem` if public teasers are needed before a nested `Lesson` model.
- Add Program offer fields such as `subtitle`, `level`, `estimatedWeeks`, `estimatedHours`, `coverImageUrl`, `trailerVideoUrl`, `visibility`, and `enrollmentMode` only when public landing pages need them.

## Certification and Certificate Rules

### Current accepted split

```txt
Certification
  = the user credential record

CertificateTemplate
  = the certificate layout/product template

CertificateIssuance
  = the issued artifact with PDF/verification

CertificateOrder
  = optional purchase/fulfillment record
```

### Issuance flow

```txt
Completion evidence
  -> instructor/admin approval if required
  -> Certification record
  -> CertificateIssuance
  -> optional CertificateOrder if digital/physical certificate is paid
```

### Certificate product flow

```txt
Admin creates CertificateTemplate
  -> type: BELT_RANK, SAFETY, COACH, or future expanded type
  -> deliveryMethod: DIGITAL, PHYSICAL, BOTH
  -> priceCents: 0 included, greater than 0 purchasable
Student earns Certification
  -> system/admin creates CertificateIssuance
  -> CertificateOrder created only when a paid certificate is selected
```

This flow preserves the examples from the raw source while using the schema that already exists.

## Rank Requirements

Raw source proposes `RankRequirement`. The repo currently links:

- `Course.rankId`
- `CurriculumItemCompletion.verifiedById`
- `TechniqueProgress.status`
- Belt testing models and prerequisite configs from S2 schema additions

Accepted stance: do not add `RankRequirement` until belt-test implementation proves that `BeltTestPrerequisiteConfig`, `Course.rankId`, and technique progress are insufficient. If needed, design it as an extension of belt-test prerequisites rather than a parallel rules engine.

## Paid vs Free Access

Paid/free access is defined in [Monetization + Entitlements Spec](monetization-entitlements-spec.md).

Short version:

- Public content is controlled by publication/visibility fields.
- Authenticated but free content is controlled by enrollment and role.
- Paid content is controlled by `UserEntitlement`.
- Instructor/admin overrides are role-based and audited.

## Future Schema Delta Queue

These are candidate additions, not SESSION_0029 implementation work.

| Priority | Delta | Why |
| --- | --- | --- |
| P0 | `Entitlement`, `EntitlementGrant`, `UserEntitlement` | Prevent monetization logic from leaking into UI and feature actions. |
| P0 | Commerce source fields on `ProgramEnrollment` | Tie enrollment to purchase, subscription, trial, invite, or manual grant. |
| P1 | Stripe IDs on `PricingPlan` | Map internal plans to Stripe Product/Price. |
| P1 | Public offer fields on `Program` | Needed for public landing pages. |
| P1 | Preview flag on `CurriculumItem` | Needed for public previews without adding Lesson tables. |
| P2 | `CertificationDefinition` or `CertificationRule` | Needed only if credential catalogs/rules cannot be represented by Course/Program/BeltTest prerequisites. |
| P2 | Curriculum modules/lessons | Needed only after flat `CurriculumItem` becomes limiting. |

## MVP Cut Line

Build now:

- Program public page and protected enrollment path.
- PricingPlan -> Checkout -> Entitlement -> ProgramEnrollment.
- Course/CurriculumItem access gated by enrollment/entitlement.
- Instructor-approved completion for rank/certification-linked content.
- CertificateIssuance and optional CertificateOrder.

Do not build yet:

- Full LMS quiz engine.
- SCORM-style tracking.
- Automatic belt promotion without instructor approval.
- Multi-school certificate accreditation.
- Nested subscription bundles.
- Marketplace revenue sharing.

## Open Questions

1. Should credential cataloging use `CertificationDefinition`, `CredentialDefinition`, or a refactor of current `Certification`?
1. Do public course previews need a `CurriculumItem.isPreview` field before the Course CRUD slice?
1. Should certificate purchases continue using inline `CertificateTemplate.priceCents`, or should certificate templates map to `PricingPlan` once entitlements exist?
1. Should Program visibility use a new `ProgramVisibility` enum or be derived from status plus entitlement requirements?
