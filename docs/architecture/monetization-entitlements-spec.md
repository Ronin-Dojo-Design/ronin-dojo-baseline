---
title: "Monetization and Entitlements Spec"
slug: monetization-entitlements-spec
type: file
status: active
created: 2026-04-30
updated: 2026-05-07
last_agent: codex-session-0096
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
  - docs/sprints/SESSION_0094.md
  - docs/sprints/SESSION_0095.md
  - docs/sprints/SESSION_0096.md
  - docs/knowledge/wiki/index.md
---

# Monetization and Entitlements Spec

## Purpose

Define the commercial access contract that connects Stripe, pricing, invoices, subscriptions, program enrollments, course access, certificate issuance, refunds, and revocation.

This doc started as a SESSION_0029 spec. SESSION_0094 reconciled it against the current code: the entitlement schema and Stripe Price mapping now exist. SESSION_0095 proved one-time and subscription Checkout entitlement grant/revoke behavior in the webhook harness. SESSION_0096 added current-brand Stripe customer mapping, Customer Portal session creation, processed-event storage, non-tournament ledger projection, and subscription/refund/dispute lifecycle proof; protected checkout hardening, manual/admin payment parity, certificate pricing, and drift audit remain open.

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
| PricingPlan | Ronin's internal price/terms row for an organization and optional Program. | Exists with brand, org, program, pricing model, amount, interval/class/trial fields, Stripe Product/Price IDs, invoice line item relation, and entitlement grants. |
| Subscription | Ongoing paid relationship that renews and can expire/cancel/past-due. | `UserBrandSubscription` exists for brand-tier access. Stripe subscription state maps to subscription-sourced `UserEntitlement` rows; SESSION_0096 handles update, delete, failed-payment grace, and paid-renewal ledger events without adding a third subscription table. |
| Payment | Record of actual money movement. | Exists as invoice-linked `Payment` with Stripe payment intent id and manual payment methods. |
| Invoice | Billing document with line items and payment records. | `Invoice` and `InvoiceLineItem` exist. |
| Entitlement | Durable permission key granted by purchase, subscription, manual grant, membership, or promo. | Exists with `brand`, stable `key`, name, description, grants, and assignments. |
| EntitlementGrant | Join row from `PricingPlan` to the entitlement(s) it grants. | Exists with unique `[pricingPlanId, entitlementId]`. |
| UserEntitlement | A user's assignment of one entitlement, with source, status, and time window. | Exists with source type/id, active/revoked/expired status, start/end window, and indexes for user/status and source lookup. |

## Current Schema Inventory

| Area | Existing model/code | Notes |
| --- | --- | --- |
| Pricing | `PricingPlan` | Program-scoped today with `stripeProductId`, `stripePriceId`, and `entitlementGrants`. `stripePriceId` is nullable and not unique, so launch code must not claim DB-enforced one-to-one Price mapping yet. |
| Invoices | `Invoice`, `InvoiceLineItem` | Good internal ledger shape for school billing. |
| Payments | `Payment` | Stores `stripePaymentIntentId` and SESSION_0096 `stripeCheckoutSessionId`; mapped non-tournament Checkout and paid subscription invoices now write ledger rows. |
| Stripe Connect | `StripeAccount`, `PayoutSplit` | Organization-level Connect foundation exists. |
| Promo codes | `PromoCode` | Discount record exists but is not an entitlement source yet. |
| Brand subscriptions | `SubscriptionTier`, `UserBrandSubscription` | Useful for BBL/directory-style tiers, but not enough for program/course access. |
| Entitlements | `Entitlement`, `EntitlementGrant`, `UserEntitlement`, `server/web/entitlement/*` | The schema bridge now exists; current helpers check active brand-scoped access and grant manually by entitlement key. |
| Stripe webhook | `app/api/stripe/webhooks/route.ts` | Handles `checkout.session.completed`, customer subscription update/delete, invoice paid/payment-failed, full charge refund, and charge dispute creation. SESSION_0095 tests prove one-time replay/source isolation and subscription grant/revoke by source id. SESSION_0096 tests prove processed-event dedupe, customer persistence, ledger projection, failed-payment grace, paid-renewal recovery, refund revoke, and dispute revoke. |
| Dirstarter product UI | `server/web/products/*`, `apps/web/scripts/setup-stripe-products.ts`, `app/api/stripe/webhooks/route.ts` | Uses Stripe Products/Prices directly for listing plans and updates Dirstarter `Tool.isFeatured`; generic checkout action is not the protected Ronin paid-access template. |
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
- `stripeProductId`
- `stripePriceId`
- active/sort metadata
- `entitlementGrants`

Remaining hardening fields/decisions:

| Field | Reason |
| --- | --- |
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

The P0 entitlement schema addition has landed. Source of truth is `apps/web/prisma/schema.prisma`; the excerpt below reflects the SESSION_0094 spot-check.

```prisma
model Entitlement {
  id          String @id @default(cuid())
  brand       Brand
  key         String
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  grants      EntitlementGrant[]
  assignments UserEntitlement[]

  @@unique([brand, key])
}

model EntitlementGrant {
  id              String @id @default(cuid())
  createdAt       DateTime @default(now())
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
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  entitlement    Entitlement @relation(fields: [entitlementId], references: [id])

  @@index([userId, status])
  @@index([entitlementId])
  @@index([sourceType, sourceId])
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
| Stripe Product | External representation of Product/PricingPlan package. `PricingPlan.stripeProductId` exists. |
| Stripe Price | External representation of a price/interval. `PricingPlan.stripePriceId` exists and is used by the webhook to find entitlement grants. |
| Checkout Session completed | Current webhook grants `UserEntitlement` first by line-item price; program enrollment and tournament registration are projection paths. SESSION_0096 writes non-tournament `Invoice`/`InvoiceLineItem`/`Payment` rows for mapped paid access. |
| Subscription created/updated | Checkout subscription completion grants subscription-sourced entitlements when the line item maps to a `PricingPlan`; `customer.subscription.updated` syncs active/cancel-at-period-end entitlements from current Stripe Price items. |
| Subscription deleted/cancelled | Current webhook revokes active `UserEntitlement` rows where `sourceType = SUBSCRIPTION` and `sourceId` matches the subscription id, then suspends related program enrollment projections. |
| Invoice paid/payment failed | `invoice.paid` restores subscription access and writes renewal ledger rows; `invoice.payment_failed` keeps access active only through a seven-day `endsAt` grace window. |
| Refund/dispute | Tournament paid registration has refund proof for at-capacity rejection. General full refund and dispute events revoke matching Stripe-sourced access and suspend program enrollment projection without deleting ledger history. |

MVP mapping should reuse Dirstarter's Stripe service/client and checkout session pattern. Do not create a second payment provider abstraction in this slice.

Implementation caution: the current webhook finds plans with `findFirst({ stripePriceId })`, and `stripePriceId` is nullable/non-unique in the schema. Do not present Stripe Price mapping as DB-enforced until that is changed or intentionally accepted as a launch bridge.

## Launch-Safe Payment Flow Matrix

| Purchase type | Stripe mode | Ronin source of truth | Fulfillment projection | Required proof before launch |
| --- | --- | --- | --- | --- |
| Tournament/event registration | `payment` | `Registration` + `RegistrationEntry` | Registration submitted, or cancelled/refunded after webhook capacity re-check | Existing webhook tests remain the template: synthesized Checkout event, real DB state, active count invariant, refund call assertion. |
| Course/curriculum one-time access | `payment` | `PricingPlan` -> `EntitlementGrant` -> `UserEntitlement` + `Invoice`/`Payment` | `ProgramEnrollment` or `CourseEnrollment` activation after entitlement grant | SESSION_0096 synthesized Checkout event with mapped `stripePriceId` creates entitlement, projection, customer mapping, processed-event row, and ledger row. |
| Certification/certificate order | `payment` | `PricingPlan` or `CertificateOrder` during launch bridge | `CertificateOrder` paid; optional `CertificateIssuance` only after approval | Checkout event creates order/payment and entitlement if applicable; certificate issuance remains approval-gated. |
| Class or school membership | `subscription` | Recurring `PricingPlan` + subscription-sourced `UserEntitlement` + renewal ledger rows | Membership/class/program access active while entitlement is active | Subscription checkout grants access; cancellation revokes or expires access; Customer Portal path uses stored current-brand Stripe Customer ID; failed payment has seven-day grace and paid renewal restores access. |
| Brand/directory tier | `subscription` or `payment` | `SubscriptionTier`/`UserBrandSubscription` plus Dirstarter listing monetization where applicable | Featured listing or premium brand/directory access | Keep listing monetization separate unless protected access requires entitlement. |
| Manual/cash/check/barter/comp | none | `Invoice` + `Payment` plus admin grant/revoke service | Same `UserEntitlement` result as Stripe purchase | Admin-only proof grants/revokes entitlement without Stripe dependency and records audit/ledger state. |

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

## Payment Proof Template

Use the tournament webhook harness as the proof shape for every launch-critical paid-access path:

1. Mock Stripe signature verification and outbound Stripe calls; never hit live Stripe in tests.
2. Synthesize the exact `checkout.session.completed` or subscription lifecycle event payload the webhook reads.
3. Build real Prisma fixtures with the same brand, user, organization, price, and entitlement relationships production uses.
4. POST to the real webhook handler.
5. Assert durable database state, not only response status: entitlement, projection, payment/ledger row where required, cancellation/revocation, and refund calls.
6. Include a negative or lifecycle proof where money and access can drift, such as cancellation, failed renewal, refund, dispute, or capacity rejection.

## Remaining Gaps Before Paid Launch

| Gap | Why it matters | Target |
| --- | --- | --- |
| Generic checkout action accepts caller-supplied metadata | Fine for Dirstarter listing flow, but protected Ronin paid access should derive user/brand/org/metadata server-side. SESSION_0096 attaches stored customers only when authenticated session metadata matches the current user. | Protected checkout action before paid learning surfaces. |
| Stripe event monitoring | Processed event IDs now persist, but alerting/dashboarding for duplicate or failed webhook events is not wired. | Launch hardening / monitoring. |
| Certificate pricing bridge unresolved | `CertificateTemplate.priceCents` exists while entitlement-oriented paid certificates may need `PricingPlan`. | Owner/Petey decision before paid certificate launch. |
| Manual/admin payment parity incomplete | Manual/cash/check/barter/comp payments do not yet write the same entitlement and ledger state as Stripe. | Dedicated admin payment session. |
| Payment/entitlement drift audit missing | Webhook paths are proven, but no scheduled or admin-triggered audit reconciles Stripe/ledger/entitlement state. | Launch hardening. |
| Entitlement idempotency is app-level | SESSION_0095 proves sequential replay for one-time and subscription checkout events, and SESSION_0096 adds event-id dedupe, but `UserEntitlement` still has lookup indexes rather than a DB unique constraint for user/entitlement/source. | Decide whether launch needs a DB constraint or accepted-risk note. |

## What Not To Build Yet

- Full LMS quiz engine.
- Advanced nested bundles.
- Affiliate payouts.
- Marketplace revenue sharing.
- New payment provider path.
- Automatic rank promotion from payment alone.

## Open Questions

1. Certificate pricing: should `CertificateTemplate.priceCents` remain inline for launch, or should paid certificates become `PricingPlan` rows immediately?
2. Should `UserBrandSubscription` be folded into the entitlement model or remain a separate brand-tier concept?
3. Should tournament paid registration also write `Invoice`/`Payment` before launch, or stay registration-local until after launch?
4. Should `PricingPlan.stripePriceId` and Stripe-sourced `UserEntitlement` rows get DB-level uniqueness before launch?
