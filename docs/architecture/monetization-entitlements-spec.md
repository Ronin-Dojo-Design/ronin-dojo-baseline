---
title: "Monetization and Entitlements Spec"
slug: monetization-entitlements-spec
type: file
status: active
created: 2026-04-30
updated: 2026-04-30
last_agent: codex-session-0030
pairs_with:
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/source/raw/SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md
  - apps/web/prisma/schema.prisma
backlinks:
  - docs/sprints/SESSION_0029.md
  - docs/sprints/SESSION_0030.md
  - docs/knowledge/wiki/index.md
---

# Monetization and Entitlements Spec

## Purpose

Define the commercial access contract that connects Stripe, pricing, invoices, subscriptions, program enrollments, course access, certificate issuance, refunds, and revocation.

This doc is intentionally a spec, not an implementation patch. SESSION_0029 does not add Prisma models or Stripe products.

## Authority

| Layer | Source |
| --- | --- |
| Payments baseline | Dirstarter [Payments](https://dirstarter.com/docs/integrations/payments) and [Monetization](https://dirstarter.com/docs/monetization) docs |
| Data baseline | Dirstarter [Prisma Setup](https://dirstarter.com/docs/database/prisma) |
| Auth baseline | Dirstarter [Authentication](https://dirstarter.com/docs/authentication) |
| Current schema | `apps/web/prisma/schema.prisma` |
| Learning path spec | [Programs, Curriculum, and Certification Spec](programs-curriculum-certification-spec.md) |

## Core Principle

Payment state should grant or revoke entitlements. Feature code should ask "does this user have access?" rather than checking random product IDs, plan IDs, Stripe metadata, or booleans scattered through pages and actions.

```txt
Payment succeeds
  -> grant UserEntitlement
  -> entitlement unlocks Program/Course/Certification access
  -> enrollment/progress earns credential
  -> optional certificate order/renewal creates another payment and entitlement event
```

## Definitions

| Concept | Definition | Current schema status |
| --- | --- | --- |
| Product | The sellable commercial offer: program, course, certification, membership, event, certificate print, or bundle. | No internal Prisma `Product` model exists. Dirstarter currently uses live Stripe `Product`/`Price` objects for listing plans. |
| PricingPlan | Ronin's internal price/terms row for an organization and optional Program. | Exists with brand, org, program, pricing model, amount, interval/class/trial fields, and invoice line item relation. |
| Subscription | Ongoing paid relationship that renews and can expire/cancel/past-due. | `UserBrandSubscription` exists for brand-tier access. Dirstarter Stripe subscriptions exist through checkout/webhook code for premium listings. A school-ops subscription table does not yet exist. |
| Payment | Record of actual money movement. | Exists as invoice-linked `Payment` with Stripe payment intent id and manual payment methods. |
| Invoice | Billing document with line items and payment records. | `Invoice` and `InvoiceLineItem` exist. |
| Entitlement | Durable permission key granted by purchase, subscription, manual grant, membership, or promo. | Not yet modeled. This is the key missing commercial bridge. |
| UserEntitlement | A user's assignment of one entitlement, with source, status, and time window. | Not yet modeled. |

## Current Schema Inventory

| Area | Existing model/code | Notes |
| --- | --- | --- |
| Pricing | `PricingPlan` | Program-scoped today; no Stripe Product/Price IDs yet. |
| Invoices | `Invoice`, `InvoiceLineItem` | Good internal ledger shape for school billing. |
| Payments | `Payment` | Stores `stripePaymentIntentId`; does not yet grant access. |
| Stripe Connect | `StripeAccount`, `PayoutSplit` | Organization-level Connect foundation exists. |
| Promo codes | `PromoCode` | Discount record exists but is not an entitlement source yet. |
| Brand subscriptions | `SubscriptionTier`, `UserBrandSubscription` | Useful for BBL/directory-style tiers, but not enough for program/course access. |
| Dirstarter product UI | `server/web/products/*`, `apps/web/scripts/setup-stripe-products.ts`, `app/api/stripe/webhooks/route.ts` | Uses Stripe Products/Prices directly for listing plans and updates Dirstarter `Tool.isFeatured`. |
| Certificates | `CertificateTemplate.priceCents`, `CertificateOrder.stripePaymentIntentId` | Inline certificate pricing already exists from Pass 4. |

## DRY Findings

| Raw suggestion | Risk | Accepted handling |
| --- | --- | --- |
| Add generic `Product` immediately | Could collide with live Stripe-product UI and existing `PricingPlan.programId` plus certificate inline pricing. | Treat Product as a commercial abstraction first. Add Prisma `Product` only when one pricing/access system must cover Programs, Courses, Certifications, Events, Memberships, and Bundles. |
| Replace `PricingPlan` with raw fields | Existing `PricingPlan` already has Ronin-specific `pricingModel`, `intervalMonths`, class packs, trials, org/program scoping. | Extend current model with Stripe IDs and entitlement grants. Do not replace. |
| Add a second Subscription model without design | `UserBrandSubscription` already exists and Stripe subscriptions are already used by Dirstarter listing plans. | Define subscription semantics before adding another table. School subscriptions may need `MembershipContract` + `PricingPlan` + `UserEntitlement` before a new model. |
| Use payment success as direct ProgramEnrollment | Refund/cancel/revoke behavior becomes hard to reason about. | Payment success grants entitlement; entitlement service creates or activates enrollment as a projection. |

## Product

For the next implementation pass, "Product" is a domain concept:

```txt
Product = sellable offer
  -> has one or more PricingPlans
  -> grants one or more Entitlements
  -> may point to a Program, Course, Certification, Event, Membership, CertificateTemplate, or Bundle
```

Future internal `Product` table is justified only when all of these are true:

- More than one sellable entity type needs shared checkout/admin/product management.
- Stripe metadata is no longer enough to map checkout sessions back to Ronin entities.
- PricingPlans need to attach to something other than one Program.
- Admin UI needs a unified product catalog.

If added, use the raw source as a starting point but reconcile with current schema:

```txt
Product
  brand
  organization?
  slug
  name
  status
  productType
  programId?
  courseId?
  certificationDefinitionId?
  eventId?
  certificateTemplateId?
```

Do not make `Product` the access check. `Product` is sellable packaging; `Entitlement` is access.

## PricingPlan

`PricingPlan` remains the internal source for Ronin pricing and terms.

Current fields cover:

- `brand`
- `organizationId`
- optional `programId`
- `pricingModel`
- `amountCents`
- `currency`
- `intervalMonths`
- `classCount`
- `trialDays`
- active/sort metadata

Future fields before Stripe checkout wiring:

| Field | Reason |
| --- | --- |
| `stripeProductId` | Map internal plan/package to Stripe Product. |
| `stripePriceId` | Avoid price lookup by name or metadata. |
| `status` enum or current `isActive` hardening | Archive plans without deleting historical invoices. |
| optional `productId` | Only if internal `Product` is added. |

## Subscription

There are two separate subscription meanings today:

| Subscription kind | Current representation | Use |
| --- | --- | --- |
| Brand tier subscription | `SubscriptionTier` + `UserBrandSubscription` | Directory/BBL-style brand access levels. |
| Stripe subscription | Stripe Checkout/session/subscription data | Recurring payment provider state. |

MVP rule: do not add a third subscription table until the billing slice defines whether school membership recurring billing is represented by `MembershipContract`, `PricingPlan`, `Invoice`, and `UserEntitlement`, or by a dedicated subscription model.

## Invoice and Payment

Accepted flow:

```txt
Checkout or manual sale
  -> Invoice
  -> InvoiceLineItem(s)
  -> Payment(s)
  -> Entitlement grant/revoke service
```

Invoices remain the internal billing ledger. Stripe remains the external payment processor. Manual payments, comps, cash, checks, barter, and coupons must also pass through the same entitlement grant/revoke path.

## Entitlement Model

This is the P0 future schema addition.

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

## Entitlement Key Examples

| Purchase | Entitlement granted |
| --- | --- |
| Baseline Foundations Course | `baseline.course.foundations` |
| Baseline Monthly Membership | `baseline.program.member-path` |
| Eskrima Certification Level 1 | `baseline.cert.eskrima-l1` |
| BBL Premium | `bbl.premium.directory` |
| WEKAF Event Registration | `wekaf.event.registration.active` |

Keys are examples from the raw source. Final keys should be lowercase, brand-prefixed, stable, and never user-visible as marketing copy.

## Access-Control Flow

```txt
Request
  -> host-derived Brand
  -> Better Auth session
  -> role/admin override check
  -> entitlement check
  -> enrollment/progress projection check
  -> data query filtered by brand/org
```

Rules:

- Public pages may render public metadata without session.
- Protected curriculum requires session plus active entitlement or enrollment.
- Instructor/admin views require role authorization, not just entitlement.
- Brand is server-derived from host/request context; do not trust client-submitted brand.
- All access queries must filter by brand and, where applicable, organization.

## Stripe Mapping

| Stripe object/event | Ronin mapping |
| --- | --- |
| Stripe Product | External representation of Product/PricingPlan package. Store `stripeProductId` on `PricingPlan` or future `Product`. |
| Stripe Price | External representation of a price/interval. Store `stripePriceId` on `PricingPlan`. |
| Checkout Session completed | Create/update `Invoice`, `Payment`, and `UserEntitlement`; optionally create `ProgramEnrollment`. |
| Subscription created/updated | Keep payment provider status in sync; set entitlement window and status. |
| Subscription deleted/cancelled | Expire/revoke entitlement at the correct effective date. |
| Refund | Mark payment/invoice refund state and revoke or shorten entitlement. |

MVP mapping should reuse Dirstarter's Stripe service/client and checkout session pattern. Do not create a second payment provider abstraction in this slice.

## Refund and Revoke Behavior

| Case | Required behavior |
| --- | --- |
| Full refund before use | `Payment`/`Invoice` becomes refunded; `UserEntitlement` becomes `REVOKED`; access projections are disabled. |
| Full refund after partial progress | Same as above, but progress records remain for audit and are not deleted. |
| Subscription cancellation at period end | Entitlement remains active until `endsAt`, then expires. |
| Failed renewal | Entitlement moves toward expired/past-due based on billing policy; protected access must not stay active indefinitely. |
| Chargeback/dispute | Revoke entitlement pending manual review unless the org chooses a grace policy. |
| Manual admin revoke | Set `UserEntitlement.status = REVOKED`; record audit metadata when AuditLog wiring is available. |
| Certificate revocation | Revoke/expire `Certification` or `CertificateIssuance`; do not delete the order or payment history. |

## MVP Money Path

```txt
Public Program Page
  -> PricingPlan
  -> Stripe Checkout
  -> Invoice/Payment
  -> UserEntitlement
  -> ProgramEnrollment
  -> Course/CurriculumItem access
  -> Instructor approval
  -> CertificateIssuance
  -> optional CertificateOrder
```

## What Not To Build Yet

- Full LMS quiz engine.
- Advanced nested bundles.
- Affiliate payouts.
- Marketplace revenue sharing.
- New payment provider path.
- Automatic rank promotion from payment alone.

## Open Questions

1. Should internal `Product` be added in the same migration as entitlements, or should `PricingPlan` carry Stripe IDs first?
2. Should `CertificateTemplate.priceCents` remain inline after entitlements, or should paid certificates become `PricingPlan` rows?
3. Should `UserBrandSubscription` be folded into the entitlement model or remain a separate brand-tier concept?
4. What grace policy applies to failed subscription renewals for school memberships?
