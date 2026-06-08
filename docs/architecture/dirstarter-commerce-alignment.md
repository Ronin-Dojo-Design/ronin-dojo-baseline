---
title: "Dirstarter Commerce Alignment"
slug: dirstarter-commerce-alignment
type: file
status: active
created: 2026-04-30
updated: 2026-06-06
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/dirstarter-architecture-map.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/sprints/SESSION_0029.md
  - docs/sprints/SESSION_0030.md
  - docs/knowledge/wiki/index.md
---

# Dirstarter Commerce Alignment

## Purpose

Map the Programs/Curriculum/Certification monetization work to current Dirstarter docs so Ronin extends the baseline instead of bypassing it.

This page is a SESSION_0029 Dirstarter-baseline check artifact. It uses the live Dirstarter docs as of 2026-04-30. Note that the current Dirstarter URLs are `<https://dirstarter.com/docs/content`> and `<https://dirstarter.com/docs/seo`>; pre-SESSION_0029 references to `content-management` and `search-engine-optimization` are stale aliases.

## Required Alignment Table

| Dirstarter area | Ronin interpretation | Current docs checked | Implementation rule |
| --- | --- | --- | --- |
| Auth | Better Auth user/session protection, role checks, and server-derived brand context. | [Authentication](https://dirstarter.com/docs/authentication) | Middleware is not enough; server actions/queries still enforce auth, role, brand, and organization predicates. |
| Prisma | Schema/migration discipline through `schema.prisma`, seed data, generated client, and DB commands. | [Prisma Setup](https://dirstarter.com/docs/database/prisma) | Reconcile raw model ideas against current Prisma before adding models; avoid duplicate nouns. |
| Payments | Stripe-backed checkout, products/prices, subscriptions, webhooks, invoices, and refunds. | [Payments](https://dirstarter.com/docs/integrations/payments) | Reuse existing Stripe client/service and checkout pattern; do not introduce a second payment path. |
| Content Management | Courses, curriculum items, certificates, content atoms, submissions/review, and publish workflow. | [Content Management](https://dirstarter.com/docs/content) | Curriculum and public content should follow review/publish concepts where applicable. |
| Monetization | Products, pricing, subscriptions, ads/listings, and entitlement-backed paid access. | [Monetization](https://dirstarter.com/docs/monetization) | Payments grant entitlements; features check entitlements rather than hard-coded plan IDs. |
| Automation | Content atom generation, tasks, screenshots/media, structured extraction, and publish workflow. | [Automation](https://dirstarter.com/docs/automation) | Automation may draft curriculum/marketing content, but credential issuance remains approval-gated. |
| Blog/SEO | Public program, course, certification, event, and article landing pages with metadata and OG handling. | [Blog](https://dirstarter.com/docs/blog), [SEO](https://dirstarter.com/docs/seo) | Use Dirstarter/Next metadata conventions for public landing pages; drafts stay private. |
| Theming | Brand-specific Baseline/BBL/WEKAF/RDD presentation on shared UI primitives. | [Theming](https://dirstarter.com/docs/theming) | Extend theme tokens and existing components; do not fork UI per brand unless justified by ADR. |
| Cron Jobs | Subscription sync, certificate expiry, renewal reminders, scheduled publishing, and cleanup jobs. | [Cron Jobs](https://dirstarter.com/docs/cron-jobs) | Add cron jobs only for durable scheduled work; keep publish/sync jobs explicit and documented. |

## Dirstarter Baseline Facts

| Baseline fact | Relevance to Ronin |
| --- | --- |
| Dirstarter uses modular App Router directories with `app`, `components`, `lib`, `prisma`, `server`, and `services`. | Ronin feature slices should keep using `server/web/&lt;entity&gt;` and existing component groups. |
| Server-side code is organized by feature, with actions, queries, schemas, and related server code in feature folders. | Future Course/Entitlement/Checkout work should mirror Program CRUD and Dirstarter products/actions patterns. |
| Dirstarter's Prisma docs name `prisma/schema.prisma`, `prisma/seed.ts`, and `services/db.ts` as core files. | Schema work must update seed/proof paths and run Prisma validation/generation where models change. |
| Dirstarter uses Better Auth with role-based access control and session management. | Entitlements complement auth; they do not replace auth or role checks. |
| Dirstarter's payment docs use Stripe for payments and subscriptions. | Ronin uses Stripe for checkout/subscription events and Ronin models for internal ledgers/access. |
| Dirstarter monetization starts with listing plans and paid visibility. | Ronin translates that pattern into Programs, Courses, Certifications, Memberships, Events, and Certificate Orders. |

## Ronin Translation

| Dirstarter concept | Ronin commerce equivalent |
| --- | --- |
| Tool listing plan | Program/Course/Certification/Membership offer plan |
| Stripe Product | External payment-provider product mapped to `PricingPlan` or future internal `Product` |
| Stripe Price | External price mapped to `PricingPlan.stripePriceId` |
| Premium listing | Paid Program/Course/Certification access, BBL premium directory access, or WEKAF event registration |
| Tool draft/review/publish | Course/curriculum/certificate content draft/review/publish; credential issuance still requires instructor approval |
| Scheduled publishing cron | Scheduled content publish, subscription sync, certificate expiry, renewal reminders |
| Tool detail SEO | Public Program/Course/Certification landing page metadata |

## Do Not Bypass List

| Baseline capability | Do not bypass by |
| --- | --- |
| Better Auth/session checks | Reading protected curriculum from anonymous routes without server-side auth. |
| Prisma schema discipline | Adding raw ChatGPT models that duplicate `Program`, `Course`, `PricingPlan`, `Certification`, or certificate models. |
| Stripe checkout/webhooks | Building a second checkout provider or ad hoc payment confirmation endpoint. |
| Dirstarter server feature folders | Placing domain queries/actions directly in route files when a reusable server slice is needed. |
| Existing UI primitives | Rebuilding form, card, table, button, or dashboard primitives for commerce pages. |
| Metadata/SEO helpers | Shipping public offer pages without canonical metadata and OG behavior. |
| Cron pattern | Hiding subscription/certificate sync in page requests or manual-only admin work. |

## DRY Risks From Raw Source

| Raw source item | Existing Ronin/Dirstarter surface | Decision |
| --- | --- | --- |
| `Product` model | Dirstarter live Stripe Product use; Ronin `PricingPlan`; certificate inline pricing | Treat Product as conceptual until the unified catalog is needed. |
| `PricingPlan` replacement | Existing Ronin `PricingPlan` | Extend current model with Stripe IDs/entitlement grants. |
| `CourseModule`/`Lesson` | `CurriculumItem` | Keep flat curriculum for MVP. |
| `CourseProgress`/`LessonProgress` | `CourseEnrollment`/`CurriculumItemCompletion` | Extend existing progress tables if needed. |
| Raw certificate models | `CertificateTemplate`, `CertificateOrder`, `CertificateIssuance` already exist | Reuse landed models. |
| `RankRequirement` | `BeltTestPrerequisiteConfig`, `Course.rankId`, `TechniqueProgress` | Defer until belt-test implementation proves a gap. |

## Launch-Safe Alignment Path

1. Keep SESSION_0029 docs as the contract.
1. Build the entitlement layer before further monetized UI.
1. Add Stripe IDs to current `PricingPlan` before introducing an internal `Product` table.
1. Gate protected Program/Course/Certification content through auth + brand + entitlement/enrollment checks.
1. Add public landing pages using Dirstarter page/SEO/theming patterns.
1. Add cron-backed expiry/sync only after the billing/entitlement tables exist.

## Open Questions

1. Should the local [Dirstarter Docs Inventory](../knowledge/wiki/dirstarter-docs-inventory.md) be refreshed because current live paths changed?
1. Should the future internal `Product` catalog live in core platform or school operations ownership?

## Resolved Since Original Draft

- `D-014` is resolved: Dirstarter `Tool` stays and is repurposed as the paid directory/listing substrate until a focused relabel/promotion lane changes it.
- Stripe/webhook/entitlement proof has advanced beyond this original alignment artifact; use [Monetization and Entitlements Spec](monetization-entitlements-spec.md), the payment/security docs, and the latest SESSION file for launch-state truth.
