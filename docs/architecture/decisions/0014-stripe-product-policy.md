---
title: "ADR 0014 — Stripe Product Policy"
slug: adr-0014-stripe-product-policy
type: decision
status: proposed
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0101
pairs_with:
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/pwcc-commerce-port-map.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/adr-0014-stripe-product-policy-research.md
backlinks:
  - docs/sprints/SESSION_0101.md
  - docs/knowledge/wiki/index.md
---

# ADR 0014 — Stripe Product Policy

**Status:** Proposed
**Date:** 2026-05-08
**Deciders:** Brian + Copilot acting as Petey
**Related:** ADR 0011, SESSION_0101, PWCC Commerce Port Map

## Context

The platform has 9 identified commerce verticals (see [PWCC Commerce Port Map](../pwcc-commerce-port-map.md)). Sessions 0094–0098 proved Stripe Checkout, webhook handling, subscription lifecycle, refund/dispute processing, and entitlement grant/revoke. The entitlement schema exists (`Entitlement` → `EntitlementGrant` → `UserEntitlement`).

What's missing is a **policy** for how Stripe Products and Prices are created, named, organized, and mapped to the internal entitlement system across brands and verticals. Without this, each vertical risks ad-hoc Stripe product creation, inconsistent metadata, and brand leakage.

Dirstarter's baseline is simple: three listing-tier products (Free/Standard/Premium) created via `scripts/setup-stripe-products.ts`. Ronin needs to scale that pattern across memberships, programs, tournaments, certificates, directory listings, and brand tiers — all multi-brand.

## Decision

### 1. Platform-level Stripe account (not Connect per org) for Baseline launch

The platform owns one Stripe account for the Baseline Martial Arts launch. Organizations do not get individual Stripe Connect accounts at Baseline launch.

**Brand-specific Connect plan (signed off 2026-05-08):**

| Brand | Stripe Model | Rationale |
| --- | --- | --- |
| Baseline Martial Arts | Platform-level account (no Connect) | Prototype school site; Connect added later before whitelabel |
| BBL | Individual Stripe Connect account | Separate revenue stream and banking |
| WEKAF | Individual Stripe Connect account (likely) | Separate revenue stream and banking |
| Ronin Dojo Design | Platform/umbrella account | Baseline template whitelabeled with Connect before RDD clients use it |

**Sequencing:** Baseline proves all commerce flows on a single platform account. Connect is added to the Baseline template before it becomes the whitelabel product for Ronin Dojo Design school clients. BBL and WEKAF each get Connect accounts when their brands port. The existing `StripeAccount` + `PayoutSplit` schema supports this progression.

### 2. Product naming convention

All Stripe Product names follow:

```text
{BRAND_CODE}_{vertical}_{identifier}
```

| Brand | Code |
| --- | --- |
| Baseline Martial Arts | `BMA` |
| Ronin Dojo Design | `RDD` |
| BBL | `BBL` |
| WEKAF | `WEKAF` |

| Vertical | Code | Examples |
| --- | --- | --- |
| Membership | `membership` | `BMA_membership_monthly`, `BMA_membership_annual` |
| Program | `program` | `BMA_program_fundamentals_bjj` |
| Tournament | `tournament` | `BBL_tournament_spring_open_2026_adult_black` |
| Certificate | `certificate` | `BMA_certificate_bjj_blue_belt` |
| Directory Listing | `directory` | `BMA_directory_listing_premium` |
| Brand Tier | `tier` | `BBL_tier_premium_monthly` |

### 3. Product metadata schema

Every Stripe Product must include these metadata keys:

```json
{
  "brand": "BASELINE_MARTIAL_ARTS",
  "vertical": "membership",
  "entitlement_key": "membership:baseline-bjj:active",
  "organization_id": "clx...",
  "created_by": "admin|script|webhook"
}
```

Every Stripe Price must include:

```json
{
  "pricing_plan_id": "clx...",
  "currency": "usd"
}
```

This metadata is used by the webhook handler to:
1. Route events to the correct brand context
2. Map checkout completion to the correct `EntitlementGrant`
3. Audit which admin or script created the product

### 4. One Stripe Product per sellable unit

Each `PricingPlan` row maps to exactly one Stripe Product with one or more Stripe Prices. A program with monthly and annual options is one Product with two Prices.

```text
PricingPlan (Ronin)  ←→  Stripe Product (1:1)
                          └── Stripe Price (1:N, one per interval/amount)
```

`PricingPlan.stripeProductId` and `stripePriceId` store the mapping. The primary Price is stored on `PricingPlan`; additional Prices are resolved from Stripe at checkout time.

### 5. Entitlement grant flow

```text
Stripe checkout.session.completed
  → webhook handler reads metadata.brand, metadata.entitlement_key
  → finds or creates Entitlement by key + brand
  → creates UserEntitlement (source: "stripe", sourceId: checkout session ID)
  → for subscriptions: UserEntitlement.endAt = subscription period end

Stripe customer.subscription.deleted
  → webhook handler revokes UserEntitlement (status: REVOKED)

Stripe charge.refunded
  → webhook handler revokes UserEntitlement (status: REVOKED)
```

This is already proved by Sessions 0095–0096. ADR 0014 formalizes it as policy.

### 6. Webhook routing

Single webhook endpoint: `POST /api/stripe/webhooks` (Dirstarter baseline pattern).

Brand routing uses `event.data.object.metadata.brand` to scope all database operations. Events without brand metadata are logged and skipped (not failed).

### 7. Price structure rules

- **Currency:** USD only at launch. Multi-currency deferred.
- **Per-brand pricing:** Allowed. Each brand can have different prices for equivalent products.
- **Tax:** Stripe Tax deferred. Manual tax configuration per region is out of scope for launch.
- **Refund policy:** Automatic entitlement revocation on full refund. Partial refunds do not auto-revoke (manual review required).

### 8. Product creation script

Extend Dirstarter's `scripts/setup-stripe-products.ts` pattern. Create `scripts/setup-ronin-stripe-products.ts` that:
1. Reads `PricingPlan` rows from the database
2. Creates corresponding Stripe Products and Prices
3. Writes `stripeProductId` and `stripePriceId` back to `PricingPlan`
4. Is idempotent (checks for existing products by metadata before creating)

## Dirstarter Docs Proof

| Baseline area | Source | Alignment |
| --- | --- | --- |
| Stripe setup | [Payments](https://dirstarter.com/docs/integrations/payments) | Extends product config pattern from 3 listing tiers to multi-vertical |
| Product creation | `scripts/setup-stripe-products.ts` | New script follows same pattern for Ronin products |
| Webhook handling | `app/api/stripe/webhooks/route.ts` | Same endpoint, extended event handling with brand metadata routing |
| Monetization tiers | [Monetization](https://dirstarter.com/docs/monetization) | Directory listing tiers use Dirstarter baseline directly; other verticals extend the pattern |
| Environment | [Environment Setup](https://dirstarter.com/docs/environment-setup) | `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` already in env validation |

## Consequences

### Positive

- Every commerce vertical has a consistent product structure in Stripe.
- Brand metadata on every product prevents cross-brand data leakage in payment flows.
- Entitlement keys are human-readable and auditable.
- Single Stripe account simplifies launch operations.
- Product creation is scripted and idempotent — no manual Stripe Dashboard configuration required.

### Negative

- Platform-level account means no automatic org-level revenue splitting at launch.
- Product naming convention requires discipline — ad-hoc product creation in Stripe Dashboard should be discouraged.
- Metadata-driven routing adds a soft dependency on correct metadata at product creation time.

## Implementation Notes

- Do not create Stripe Products manually in the Dashboard. Use the setup script.
- Tournament products are created dynamically when a Tournament is published (each Division becomes a line item, not a separate Product).
- Certificate products may be per-template or per-order depending on pricing model — decide during implementation.
- `PricingPlan.stripePriceId` nullable constraint should be reviewed: if launch requires all active plans to have Stripe Prices, add a migration to enforce non-null for plans with `pricingModel != FREE`.
- Stripe Connect activation is a future ADR when multi-org revenue splitting is needed.

## Open Questions (for user sign-off)

1. **Tournament fee model:** One Stripe Product per tournament (with Division fees as line items), or one Product per Division? Recommendation: per-tournament with line items.
2. **Certificate pricing:** Flat fee per certificate type, or variable based on rank level? Recommendation: flat fee per template initially.
3. ~~**Connect timeline:**~~ **Resolved 2026-05-08.** Baseline launches without Connect; Connect added before whitelabel. BBL and WEKAF get individual Connect accounts at port time.
