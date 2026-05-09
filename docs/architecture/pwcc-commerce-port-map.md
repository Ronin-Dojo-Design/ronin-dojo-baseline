---
title: "PWCC Commerce Port Map"
slug: pwcc-commerce-port-map
type: file
status: active
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0101
pairs_with:
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/ubiquitous-language.md
  - docs/runbooks/adr-0014-stripe-product-policy-research.md
  - docs/runbooks/stripe-setup-runbook.md
backlinks:
  - docs/sprints/SESSION_0101.md
  - docs/knowledge/wiki/index.md
---

# PWCC Commerce Port Map

## Purpose

Classify every commerce concern from the TuffBuffs/Baseline Martial Arts legacy and current Ronin Dojo platform into distinct categories so Stripe product creation, entitlement wiring, and fulfillment flows can be planned without ambiguity.

**PWCC** = Products, Wallets, Certificates, Commerce — the four pillars of the platform's commercial layer.

## Authority

| Source | Role |
| --- | --- |
| [Monetization & Entitlements Spec](monetization-entitlements-spec.md) | Entitlement model and payment flow definitions |
| [ADR 0011 — Entitlement-First Commerce](decisions/0011-entitlement-first-commerce.md) | Payments grant entitlements; features check entitlements |
| [Dirstarter Commerce Alignment](dirstarter-commerce-alignment.md) | Baseline Stripe patterns (Free/Standard/Premium listing tiers) |
| [Security, Privacy, Payments Plan](security-privacy-payments-monitoring-plan.md) | PCI scope, webhook verification, data classification |
| [Dirstarter Payments Docs](https://dirstarter.com/docs/integrations/payments) | Stripe setup, product config, webhook events (checked 2026-05-08) |
| [Dirstarter Monetization Docs](https://dirstarter.com/docs/monetization) | Listing tiers, ads, affiliate patterns (checked 2026-05-08) |
| `apps/web/lib/tuffbuffs/affiliate-gear.ts` | Current affiliate product catalog (34 products) |
| `docs/architecture/ubiquitous-language.md` | Tournament, membership, certification domain terms |

## Port Categories

| Category | Definition | Stripe Involvement |
| --- | --- | --- |
| **Affiliate Display** | Product shown with external affiliate link (e.g., Amazon). No payment through Ronin. | None |
| **Stripe One-Time** | Single checkout → entitlement grant. No recurring billing. | Stripe Checkout (payment mode) |
| **Stripe Subscription** | Recurring billing → entitlement maintained while subscription active. | Stripe Checkout (subscription mode) + webhook lifecycle |
| **Stripe + Fulfillment** | Stripe checkout + physical item delivery or manual processing step. | Stripe Checkout + fulfillment tracking |
| **Platform Fee** | Event/transaction fee collected by platform. May use Stripe Connect. | Stripe Checkout or Connect transfer |
| **Future/Deferred** | Identified but not in launch scope. | None yet |

## Commerce Port Map

### Vertical 1: Affiliate Gear

| Field | Value |
| --- | --- |
| **Legacy Source** | TuffBuffs Amazon affiliate store; `apps/web/lib/tuffbuffs/affiliate-gear.ts` |
| **Current State** | 34 products across 3 categories (training, accessories, recovery), 5 program collections (BJJ, Muay Thai, Boxing, Eskrima, Self-defense). All Amazon affiliate links. |
| **Port Category** | **Affiliate Display** |
| **Stripe Product Type** | None — external affiliate links only |
| **Brand Scope** | Currently BASELINE_MARTIAL_ARTS only; extensible to all brands |
| **Entitlement** | None — public display, no access gating |
| **Priority** | ✅ Landed (SESSION_0098) |
| **Blocked By** | Nothing (live) |
| **Future Option** | Could add direct Stripe checkout for branded merch alongside affiliate display. That would be a new vertical, not a conversion of this one. |

### Vertical 2: Organization Membership Dues

| Field | Value |
| --- | --- |
| **Legacy Source** | TuffBuffs membership model; current `Membership` + `MembershipStatus` schema |
| **Current State** | Schema supports INVITED → PENDING → ACTIVE → SUSPENDED → EXPIRED lifecycle. No payment attached to membership transitions. |
| **Port Category** | **Stripe Subscription** |
| **Stripe Product Type** | Recurring subscription per organization membership tier |
| **Brand Scope** | Per-brand, per-organization |
| **Entitlement** | `membership:{orgSlug}:{tier}` — grants access to org content, schedules, programs |
| **Priority** | High — launch path for Baseline |
| **Blocked By** | ADR 0014 (product naming/metadata), entitlement key standardization |
| **Schema Notes** | `PricingPlan` already supports org + program scoping with Stripe IDs. Membership dues would use `PricingPlan` with `pricingModel: MONTHLY` or `ANNUAL`. |

### Vertical 3: Program Enrollment

| Field | Value |
| --- | --- |
| **Legacy Source** | TuffBuffs program structure; current `Program` + `ProgramEnrollment` + `PricingPlan` schema |
| **Current State** | SESSION_0097 proved protected program enrollment Checkout with server-derived metadata. Entitlement grant on checkout.session.completed. |
| **Port Category** | **Stripe One-Time** or **Stripe Subscription** (per program) |
| **Stripe Product Type** | One-time (drop-in, seminar) or subscription (ongoing program) per PricingPlan |
| **Brand Scope** | Per-brand, per-organization, per-program |
| **Entitlement** | `program:{programSlug}:access` — grants access to program content and curriculum |
| **Priority** | High — partially proved (SESSION_0097) |
| **Blocked By** | Production Stripe product creation for real programs |
| **Schema Notes** | `PricingPlan.stripeProductId` and `stripePriceId` exist. `EntitlementGrant` links plan to entitlement. |

### Vertical 4: Tournament Registration Fees

| Field | Value |
| --- | --- |
| **Legacy Source** | TuffBuffs/BBL tournament system; current `Tournament` + `Registration` + `RegistrationEntry` + `Division` schema |
| **Current State** | Schema supports multi-division registration with rank/org snapshots. `Division.feeCents` exists. No Stripe wiring. |
| **Port Category** | **Stripe One-Time** (per registration) or **Platform Fee** (if using Connect) |
| **Stripe Product Type** | One-time checkout per Registration, with line items per Division entry |
| **Brand Scope** | Per-brand tournament |
| **Entitlement** | `tournament:{tournamentSlug}:registered` — gates competitor check-in, bracket access |
| **Priority** | Medium — needed for BBL/WEKAF, not Baseline launch |
| **Blocked By** | ADR 0014, Stripe Connect decision (platform collects vs org collects), Division fee → Stripe Price mapping |
| **Schema Notes** | `Division.feeCents` is the price source. Registration creates one checkout with multiple line items (one per RegistrationEntry/Division). |

### Vertical 5: Certificate Orders

| Field | Value |
| --- | --- |
| **Legacy Source** | TuffBuffs rank certificates; current `CertificateTemplate` + `CertificateOrder` + `CertificateIssuance` schema |
| **Current State** | Schema supports template → order → issuance pipeline. No Stripe checkout wired. |
| **Port Category** | **Stripe One-Time** (digital) or **Stripe + Fulfillment** (physical) |
| **Stripe Product Type** | One-time checkout per certificate order |
| **Brand Scope** | Per-brand |
| **Entitlement** | `certificate:{templateSlug}:issued` — grants access to download/verify |
| **Priority** | Medium — launch as digital-only, physical fulfillment deferred |
| **Blocked By** | ADR 0014, physical vs digital delivery decision, certificate pricing signoff (SESSION_0098 open item) |
| **Schema Notes** | `CertificateOrder` already has `totalCents`, `status`, `paymentId`. Needs Stripe checkout session mapping. |

### Vertical 6: Directory Listing Tiers

| Field | Value |
| --- | --- |
| **Legacy Source** | Dirstarter Tool listing; D-014 resolved as Directory Listing (ADR 0013) |
| **Current State** | Free/Standard/Premium tiers defined. Dirstarter has full Stripe wiring for this pattern. |
| **Port Category** | **Stripe One-Time** (Standard) + **Stripe Subscription** (Premium) |
| **Stripe Product Type** | Matches Dirstarter baseline exactly: Free (no payment), Standard (one-time), Premium (monthly subscription) |
| **Brand Scope** | Per-brand directory |
| **Entitlement** | `directory:listing:{tier}` — gates listing features (do-follow link, featured placement) |
| **Priority** | Medium — Dirstarter baseline already works; Ronin adds brand scoping |
| **Blocked By** | Nothing (Dirstarter provides the implementation) |
| **Schema Notes** | Dirstarter's `scripts/setup-stripe-products.ts` creates the three products. Ronin extends with brand metadata. |

### Vertical 7: Brand Subscription Tiers

| Field | Value |
| --- | --- |
| **Legacy Source** | BBL premium directory access; current `SubscriptionTier` + `UserBrandSubscription` schema |
| **Current State** | Schema supports per-brand tiers (FREE, PREMIUM, INSTRUCTOR, SCHOOL_OWNER, LEGEND). No Stripe checkout wired to tier upgrades. |
| **Port Category** | **Stripe Subscription** |
| **Stripe Product Type** | Recurring subscription per brand tier |
| **Brand Scope** | Per-brand |
| **Entitlement** | `brand:{brandSlug}:tier:{tierSlug}` — gates brand-specific premium features |
| **Priority** | Low for Baseline launch; High for BBL |
| **Blocked By** | ADR 0014, BBL port timeline |
| **Schema Notes** | `SubscriptionTier` and `UserBrandSubscription` exist. Need Stripe Product/Price mapping on `SubscriptionTier`. |

### Vertical 8: Branded Merch (Direct Sales)

| Field | Value |
| --- | --- |
| **Legacy Source** | TuffBuffs branded merchandise (t-shirts, patches, etc.) — not currently in repo |
| **Current State** | No implementation. Affiliate gear is separate (Vertical 1). |
| **Port Category** | **Future/Deferred** |
| **Stripe Product Type** | One-time checkout with fulfillment (when implemented) |
| **Brand Scope** | Per-brand |
| **Entitlement** | None — physical goods, no digital access gating |
| **Priority** | Low — deferred past launch |
| **Blocked By** | Fulfillment partner selection, inventory management decision |

### Vertical 9: Private Lessons / Booking

| Field | Value |
| --- | --- |
| **Legacy Source** | TuffBuffs instructor booking — not currently in repo |
| **Current State** | No implementation. |
| **Port Category** | **Future/Deferred** |
| **Stripe Product Type** | One-time or package pricing (when implemented) |
| **Brand Scope** | Per-brand, per-organization |
| **Entitlement** | `lesson:{instructorSlug}:booked` |
| **Priority** | Low — deferred past launch |
| **Blocked By** | Booking/scheduling system design |

## Launch Priority Summary

| Priority | Verticals | Status |
| --- | --- | --- |
| ✅ Landed | V1: Affiliate Gear | Display-only, live |
| 🔴 High | V2: Membership Dues, V3: Program Enrollment | Schema exists, Checkout proved, needs Stripe products |
| 🟡 Medium | V4: Tournament Fees, V5: Certificates, V6: Directory Listings, V7: Brand Tiers | Schema exists, needs Stripe wiring |
| ⚪ Deferred | V8: Branded Merch, V9: Private Lessons | No implementation yet |

## Entitlement Key Convention

All entitlement keys follow the pattern: `{domain}:{scope}:{access-type}`

```text
membership:baseline-bjj:active
program:fundamentals-bjj:access
tournament:spring-open-2026:registered
certificate:bjj-blue-belt:issued
directory:listing:premium
brand:baseline:tier:premium
```

## Stripe Product Naming Convention (Proposed)

See [ADR 0014](decisions/0014-stripe-product-policy.md) for the full policy. Summary:

```text
{brand_code}_{vertical}_{identifier}
```

Examples:

```text
BMA_membership_monthly
BMA_program_fundamentals_bjj
BBL_tournament_spring_open_2026
BMA_certificate_bjj_blue_belt
BMA_directory_listing_standard
BMA_directory_listing_premium
```

## Cross-References

- [ADR 0014 — Stripe Product Policy](decisions/0014-stripe-product-policy.md)
- [ADR 0011 — Entitlement-First Commerce](decisions/0011-entitlement-first-commerce.md)
- [Monetization & Entitlements Spec](monetization-entitlements-spec.md)
- [Dirstarter Commerce Alignment](dirstarter-commerce-alignment.md)
- [Security, Privacy, Payments Plan](security-privacy-payments-monitoring-plan.md)
- [ADR Research Runbook](../runbooks/adr-0014-stripe-product-policy-research.md)
- [SESSION_0101](../sprints/SESSION_0101.md) — session that created this document
