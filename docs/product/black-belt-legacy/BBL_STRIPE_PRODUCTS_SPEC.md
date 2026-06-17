---
title: "BBL — Stripe Products & Prices Spec (lineage membership, BBL account)"
slug: bbl-stripe-products-spec
type: spec
status: active
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0403
pairs_with:
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
  - docs/sprints/SESSION_0402.md
  - docs/sprints/SESSION_0403.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - blackbeltlegacy
  - stripe
  - payments
  - membership
---

# BBL — Stripe Products & Prices Spec (lineage membership)

The exact products/prices the operator creates in the **BBL Stripe account** (ADR 0030 — BBL transacts on
its own account), and how they map onto the Baseline lineage-membership seam. Hand the price ids back to the
pricing seed (`apps/web/scripts/seed-bbl-lineage-pricing.ts`, SESSION_0403 TASK_01) to make `/lineage/join`
sellable on the BBL deployment.

## Source of the amounts

Amounts are the live BBLApp tier prices, in USD cents, from the monorepo:
`wordpress/blackbeltlegacy-payments.php::resolve_tier_amount`.

| BBLApp tier (monorepo) | Monthly | Annual |
| --- | --- | --- |
| `member_premium` | `999` ($9.99) | `5999` ($59.99) |
| `instructor` | `2999` ($29.99) | `29900` ($299.00) |
| `school_owner` | `9999` ($99.99) | `99900` ($999.00) |
| `dirty_dozen_legend` | invite-only, lifetime (comp) | — |

## Decision — what BBL sells (SESSION_0403)

**Two paid tiers; Legend is comp-only (never sold).** The Baseline lineage entitlements are cumulative
(`LINEAGE_PREMIUM` ⊂ `LINEAGE_ELITE` ⊂ `LINEAGE_LEGEND`, `lib/entitlements/lineage-comp.ts`). BBL's
`instructor` tier maps to `LINEAGE_ELITE`; `school_owner` is folded in for go-live (re-add later as its own
product if needed). `LINEAGE_LEGEND` is reserved for invited legends / the Dirty Dozen comp cohort
(SESSION_0403 TASK_02), not a checkout product.

| Product to create (BBL account) | Grants (cumulative) | Billing | Amount |
| --- | --- | --- | --- |
| **Black Belt Legacy — Premium** | `LINEAGE_PREMIUM` | recurring monthly | $9.99 |
| ↳ same product, annual price | `LINEAGE_PREMIUM` | recurring yearly | $59.99 |
| **Black Belt Legacy — Elite (Instructor)** | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` | recurring monthly | $29.99 |
| ↳ same product, annual price | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` | recurring yearly | $299.00 |

> Entitlement grants are cumulative so a **paid** Elite member and a **comped** Elite member carry the
> identical entitlement-key set — the one signal the tier-gating read model consumes. The seed derives the
> grant keys from `getLineageCompEntitlementKeys(tier)`; you only create the Stripe prices.

## Operator steps (BBL Stripe account, live mode)

1. Create **two Products** ("Black Belt Legacy — Premium", "Black Belt Legacy — Elite (Instructor)").
2. On each product create **two recurring Prices** (monthly + yearly) at the amounts above, currency USD.
3. Copy the ids and run the seed with them in env (from `apps/web`):

   ```bash
   BBL_STRIPE_PRODUCT_PREMIUM=prod_…        \
   BBL_STRIPE_PRICE_PREMIUM_MONTHLY=price_… \
   BBL_STRIPE_PRICE_PREMIUM_ANNUAL=price_…  \
   BBL_STRIPE_PRODUCT_ELITE=prod_…          \
   BBL_STRIPE_PRICE_ELITE_MONTHLY=price_…   \
   BBL_STRIPE_PRICE_ELITE_ANNUAL=price_…    \
   bun run scripts/seed-bbl-lineage-pricing.ts
   ```

   Preview first with `--dry-run`; stage rows before you have ids with `--allow-missing-price-ids`
   (those rows stay non-sellable until a real `price_…` is backfilled — the seed is idempotent and
   re-running updates the ids in place).

| Env var | Holds | Maps to |
| --- | --- | --- |
| `BBL_STRIPE_PRODUCT_PREMIUM` | `prod_…` | Premium product (optional) |
| `BBL_STRIPE_PRICE_PREMIUM_MONTHLY` | `price_…` | Premium $9.99/mo |
| `BBL_STRIPE_PRICE_PREMIUM_ANNUAL` | `price_…` | Premium $59.99/yr |
| `BBL_STRIPE_PRODUCT_ELITE` | `prod_…` | Elite product (optional) |
| `BBL_STRIPE_PRICE_ELITE_MONTHLY` | `price_…` | Elite $29.99/mo |
| `BBL_STRIPE_PRICE_ELITE_ANNUAL` | `price_…` | Elite $299.00/yr |

## After seeding (gates before the DNS flip)

1. Confirm `/lineage/join` on the BBL deployment lists the four plans (`findLineageMembershipPlans` returns
   only `isActive`, `programId: null`, `stripePriceId != null` plans with an entitlement grant).
2. Run the **BBL-account test-mode rehearsal** (`stripe listen --forward-to .../api/stripe/webhooks/bbl`,
   real test-card checkout) and confirm the entitlement is granted on `checkout.session.completed` and
   revoked on `customer.subscription.deleted` — pattern: `scripts/stripe-rehearsal-seed.ts`. This is a hard
   gate (ADR 0030: the Baseline proxy only proves the shared code path, not the BBL account wiring).

## Cross-references

- ADR 0030 — per-brand Stripe account (`docs/architecture/decisions/0030-per-brand-stripe-account.md`, lands with PR #76)
- SESSION_0402 — the per-brand seam + operator checklist (`docs/sprints/SESSION_0402.md`, lands with PR #76)
- [SESSION_0403](../../sprints/SESSION_0403.md) — this seed + the Dirty Dozen import
- [CUTOVER_CHECKLIST](CUTOVER_CHECKLIST.md) — BBL go-live steps
- [Gift / comp membership epic](GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md) — tier-gating + comp cohort
