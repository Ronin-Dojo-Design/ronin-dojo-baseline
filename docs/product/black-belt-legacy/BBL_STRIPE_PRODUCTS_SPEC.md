---
title: "BBL — Stripe Products & Prices Spec (lineage membership, BBL account)"
slug: bbl-stripe-products-spec
type: spec
status: active
created: 2026-06-17
updated: 2026-06-29
last_agent: claude-session-0473
pairs_with:
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/sprints/SESSION_0473.md
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

The exact products/prices the operator creates in the **BBL Stripe account** (ADR 0030 — BBL transacts on its
own account, **NOT** Baseline or Tuff Buffs), and how they map onto the Baseline lineage-membership seam. Hand
the price ids back to the pricing seed (`apps/web/scripts/seed-bbl-lineage-pricing.ts`) to make `/lineage/join`
on the BBL deployment sellable.

> **Repriced at SESSION_0473 (S1)** to the ratified membership-tier model (SOT-ADR D13 / SESSION_0472
> D472-1,2). Supersedes the pre-0473 amounts (the legacy BBLApp ladder — Premium $9.99/mo·$59.99/yr,
> Instructor $29.99/mo·$299/yr). **Annual-only** now; monthly is dropped.

## Source of the amounts

The ratified tier model (SOT-ADR D13). USD cents:

| Plan (customer label) | Internal entitlement | Billing | Amount |
| --- | --- | --- | --- |
| **Premium Member** | `LINEAGE_PREMIUM` | recurring yearly | $35.00 (3500) |
| **Elite Member** | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` | recurring yearly | $65.00 (6500) |
| **Elite — Black Belt rate** | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` | recurring yearly | $45.00 (4500) |

> **The $45 < $65 inversion is intentional** (D472-1): a verified BJJ black belt pays *less* for the Elite
> tier — belt rank is a price axis, not a feature axis (supply-side subsidy for the lineage-holders who anchor
> the graph). The $45 price is gated to verified black belts (`isBlackBeltRateEligible`, SESSION_0473 TASK_03);
> everyone else sees $65. `LINEAGE_LEGEND` is comp-only (never sold).

## Decision — what BBL sells: 2 products, 3 prices

Two Stripe **products** (Premium, Elite); the Elite product carries **two prices** ($65 standard + $45
black-belt rate), both granting the same cumulative `LINEAGE_ELITE` set. Entitlement grants are cumulative
(`LINEAGE_PREMIUM` ⊂ `LINEAGE_ELITE` ⊂ `LINEAGE_LEGEND`, `lib/entitlements/lineage-comp.ts`), so a paid and a
comped member at the same tier carry the identical entitlement-key signal. The seed derives the grant keys
from `getLineageCompEntitlementKeys(tier)`; you only create the Stripe prices.

| Product (BBL account) | Price | Grants | Amount |
| --- | --- | --- | --- |
| **Black Belt Legacy — Premium** | annual | `LINEAGE_PREMIUM` | $35.00/yr |
| **Black Belt Legacy — Elite** | annual (standard) | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` | $65.00/yr |
| ↳ same Elite product | annual (Black Belt rate) | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` | $45.00/yr |

## Operator steps — create via the Stripe CLI (BBL account)

> ⚠ **Account check FIRST.** `stripe config --list` must show the **BBL** account (ADR 0030), not Tuff Buffs /
> Baseline. If the CLI default is another account, create a named profile — `stripe login --project-name bbl` —
> and pass `--project-name bbl` on every command below. Rehearse in **test mode** first; confirm 0 live payers
> on the dashboard before any live edit. (SESSION_0473: the CLI shipped pointed at "Tuff Buffs"
> `acct_1T065aPm73j3q757` — the wrong account; this is the exact trap ADR 0030 warns about.)

Test-mode rehearsal (test mode is the CLI default — omit `--live`; add `--project-name bbl`):

```bash
# Products
stripe products create --name "Black Belt Legacy — Premium" --project-name bbl
stripe products create --name "Black Belt Legacy — Elite"   --project-name bbl

# Prices (annual / recurring yearly, USD) — use the prod_… ids from the two creates above
stripe prices create --product <prod_premium> --currency usd --unit-amount 3500 \
  --recurring.interval year --nickname "Premium $35/yr" --project-name bbl
stripe prices create --product <prod_elite>   --currency usd --unit-amount 6500 \
  --recurring.interval year --nickname "Elite $65/yr" --project-name bbl
stripe prices create --product <prod_elite>   --currency usd --unit-amount 4500 \
  --recurring.interval year --nickname "Elite Black Belt rate $45/yr" --project-name bbl
```

Validate the test-mode shapes, then re-confirm against the **live** dashboard that there are 0 paid
subscribers, and re-run the same commands with `--live` to create the live products/prices. Copy the ids and
run the seed (from `apps/web`):

```bash
BBL_STRIPE_PRODUCT_PREMIUM=prod_…               \
BBL_STRIPE_PRICE_PREMIUM_ANNUAL=price_…         \
BBL_STRIPE_PRODUCT_ELITE=prod_…                 \
BBL_STRIPE_PRICE_ELITE_ANNUAL=price_…           \
BBL_STRIPE_PRICE_ELITE_BLACKBELT_ANNUAL=price_… \
bun run scripts/seed-bbl-lineage-pricing.ts
```

Preview first with `--dry-run`; stage rows before you have ids with `--allow-missing-price-ids` (those rows
stay non-sellable until a real `price_…` is backfilled). The seed is idempotent, ensures the 3 BBL entitlement
rows (incl. comp-only `LINEAGE_LEGEND`), and **archives** any prior lineage-membership plans not in the new
set (the old monthly/annual rows → `isActive: false`).

| Env var | Holds | Maps to |
| --- | --- | --- |
| `BBL_STRIPE_PRODUCT_PREMIUM` | `prod_…` | Premium product (optional) |
| `BBL_STRIPE_PRICE_PREMIUM_ANNUAL` | `price_…` | Premium $35/yr |
| `BBL_STRIPE_PRODUCT_ELITE` | `prod_…` | Elite product (optional; both Elite prices) |
| `BBL_STRIPE_PRICE_ELITE_ANNUAL` | `price_…` | Elite $65/yr |
| `BBL_STRIPE_PRICE_ELITE_BLACKBELT_ANNUAL` | `price_…` | Elite Black Belt rate $45/yr |

## Archive the OLD prices

After seeding, **archive the superseded Stripe prices** in the BBL account (the legacy $59.99/$299 monthly +
annual prices) so no new checkout can hit them: `stripe prices update <old_price> --active=false
--project-name bbl`. The seed already deactivated the matching `PricingPlan` rows; this closes the Stripe side.
Existing subscriptions on old prices are NOT touched — prodsnap = 0 payers; re-confirm live. **Migrating any
live payer is a separate, rehearsed, operator-gated step** (never `cs_live` unrehearsed).

## After seeding (gates before sellable)

1. Confirm `/lineage/join` on the BBL deployment lists the **3 annual plans** (`findLineageMembershipPlans`
   returns only `isActive`, `programId: null`, `stripePriceId != null` plans with an entitlement grant); a
   non-black-belt viewer sees Premium + Elite ($65) only, a verified BJJ black belt also sees the $45 rate.
2. Run the **BBL-account test-mode rehearsal** (`stripe listen --forward-to .../api/stripe/webhooks/bbl`, real
   test-card checkout) and confirm the entitlement is granted on `checkout.session.completed` and revoked on
   `customer.subscription.deleted` — pattern: `scripts/stripe-rehearsal-seed.ts`. Hard gate (ADR 0030).

## Cross-references

- ADR 0030 — per-brand Stripe account (`docs/architecture/decisions/0030-per-brand-stripe-account.md`)
- [SOT-ADR](SOT-ADR.md) D13 — the ratified membership-tier model
- [SESSION_0473](../../sprints/SESSION_0473.md) — S1 reprice + consolidate
- [CUTOVER_CHECKLIST](CUTOVER_CHECKLIST.md) — BBL go-live steps
- [Gift / comp membership epic](GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md) — tier-gating + comp cohort
