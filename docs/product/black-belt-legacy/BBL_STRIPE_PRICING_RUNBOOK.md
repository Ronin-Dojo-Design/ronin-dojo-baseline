---
title: "BBL Stripe Pricing — Go-Live Runbook (executable form of the spec)"
slug: bbl-stripe-pricing-runbook
type: runbook
status: active
created: 2026-07-08
updated: 2026-07-08
last_agent: claude-session-0511
pairs_with:
  - docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
  - apps/web/scripts/seed-bbl-lineage-pricing.ts
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - stripe
  - payments
  - membership
  - runbook
---

# Codex Runbook — Create BBL Stripe products/prices + wire the pricing seed

**Goal:** create the ratified BBL lineage-membership products/prices in the **BBL Stripe account**, map
their price ids into `apps/web/scripts/seed-bbl-lineage-pricing.ts`, and make `/lineage/join` sellable —
the executable form of [`BBL_STRIPE_PRODUCTS_SPEC.md`](BBL_STRIPE_PRODUCTS_SPEC.md) (SOT-ADR D13 /
SESSION_0473 reprice).

**Why Codex:** the Stripe CLI is authenticated on disk; `codex exec` can drive it. The *decisions* below
are pinned — Codex executes, it does not re-decide amounts, accounts, or entitlement mapping.

## Ratified target (do NOT change these numbers)

| Product (BBL account) | Price | Amount (USD cents) | Entitlement |
| --- | --- | --- | --- |
| Black Belt Legacy — Premium | annual | 3500 ($35/yr) | `LINEAGE_PREMIUM` |
| Black Belt Legacy — Elite | annual (standard) | 6500 ($65/yr) | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` |
| ↳ same Elite product | annual (Black Belt rate) | 4500 ($45/yr) | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` |

Annual-only. The $45 < $65 inversion is intentional (verified-black-belt subsidy). `LINEAGE_LEGEND` is
comp-only — never sold. The seed derives grant keys from `getLineageCompEntitlementKeys(tier)`; you only
create the Stripe prices + hand back the ids.

## Prerequisites — one-time BBL account setup (operator, before any run)

The BBL account touches **four** places, not just the CLI. Set these up once (SESSION_0511):

### 1. Point the Stripe CLI at BBL (unblocks this runbook / Codex)

The CLI ships authed to **Tuff Buffs** (`acct_1T065aPm73j3q757`) with no `bbl` profile — the exact trap
below. If you hold the BBL keys, skip the interactive OAuth and add a `[bbl]` profile to
`~/.config/stripe/config.toml` (mirror the existing `[default]` block):

```toml
[bbl]
test_mode_api_key = 'sk_test_…BBL…'
live_mode_api_key = 'sk_live_…BBL…'
```

Then `stripe … --project-name bbl` resolves to BBL (test commands use the test key, `--live` the live
key). Verify: `stripe config --list` shows a `[bbl]` block with the **BBL** `account_id`. (Alternatively
`stripe login --project-name bbl` — interactive OAuth, generates restricted keys.)

### 2. App env — so `/lineage/join` checkout + the webhook use BBL (ADR 0030)

`services/stripe.ts` resolves BBL through a dedicated seam and **falls back to the platform account if
these are unset** — so set both on the **BBL Vercel deployment** (and locally for the rehearsal):

| Env var | Value | Used by |
| --- | --- | --- |
| `STRIPE_SECRET_KEY_BBL` | BBL `sk_live` (prod) / `sk_test` (rehearsal) | checkout + billing portal (`getStripeClient(BBL)`) |
| `STRIPE_WEBHOOK_SECRET_BBL` | BBL `whsec_…` | webhook verify (`/api/stripe/webhooks/bbl`) |

### 3. Webhook signing secret (NOT one of the two API keys)

`STRIPE_WEBHOOK_SECRET_BBL` is generated when you register the endpoint, not from the keys:
- **Live:** in the BBL dashboard add webhook endpoint `https://blackbeltlegacy.com/api/stripe/webhooks/bbl`
  → copy its `whsec_…` → set on BBL Vercel prod.
- **Test rehearsal:** `stripe listen --forward-to localhost:3000/api/stripe/webhooks/bbl --project-name bbl`
  prints a test `whsec_…`.

### 4. Seed DB target (Phase 4)

The seed writes `PricingPlan` rows (no Stripe key needed) but defaults `DATABASE_URL` to **local dev**.
Phase 4 forces `bun --env-file=.env.prod` pointed at the **BBL production DB** — confirm the host is BBL's
Neon before the apply.

> **Minimum to run the TEST-mode phases (1–2):** just #1 with the BBL **test** key. #2–#4 are required for
> the live go-live + the webhook rehearsal.

## ⛔ Hard preconditions (verify BEFORE any create)

1. **Account = BBL, not Tuff Buffs / Baseline.** `stripe config --list` must show the **BBL** account
   (ADR 0030). SESSION_0473 caught the CLI shipped pointed at Tuff Buffs `acct_1T065aPm73j3q757` — the
   exact trap. If default isn't BBL: `stripe login --project-name bbl` and pass `--project-name bbl` on
   **every** command below. Print the resolved account id and STOP for operator confirmation if unsure.
2. **Test mode first.** Everything in Phase 1–2 is TEST mode (CLI default, no `--live`). Do not touch
   live until Phase 3's operator gate.
3. **Seed DB target.** The seed defaults `DATABASE_URL` to LOCAL dev
   (`postgresql://brianscott@localhost:5432/ronindojo_dev`). Seeding prod requires
   `bun --env-file=.env.prod` (or an explicit `DATABASE_URL`) pointing at the **BBL production DB** (the
   one `blackbeltlegacy.com` reads). Confirm the host is BBL prod (Neon) — do NOT run the apply against
   local dev or the wrong product's DB.

## Phase 1 — TEST-mode create (Codex autonomous)

```bash
stripe config --list                       # PRECONDITION 1 — confirm BBL account, else STOP
stripe products create --name "Black Belt Legacy — Premium" --project-name bbl
stripe products create --name "Black Belt Legacy — Elite"   --project-name bbl
# capture prod_… ids → PROD_PREMIUM, PROD_ELITE

stripe prices create --product $PROD_PREMIUM --currency usd --unit-amount 3500 \
  --recurring.interval year --nickname "Premium $35/yr" --project-name bbl
stripe prices create --product $PROD_ELITE   --currency usd --unit-amount 6500 \
  --recurring.interval year --nickname "Elite $65/yr" --project-name bbl
stripe prices create --product $PROD_ELITE   --currency usd --unit-amount 4500 \
  --recurring.interval year --nickname "Elite Black Belt rate $45/yr" --project-name bbl
# capture price_… ids → PRICE_PREMIUM, PRICE_ELITE, PRICE_ELITE_BB
```

## Phase 2 — validate test shapes (Codex autonomous)

- `stripe prices list --project-name bbl` — confirm 3 annual/recurring-year prices at 3500/6500/4500,
  each on the right product, `active: true`.
- Report the captured ids back.

## Phase 3 — GO-LIVE — ⛔ OPERATOR GATE (do NOT run `--live` without explicit "go")

Only after the operator confirms **0 live paid subscribers** on the BBL live dashboard:

```bash
# re-run the SAME 5 create commands with --live appended (test-mode ids are NOT reusable live)
stripe products create --name "Black Belt Legacy — Premium" --project-name bbl --live
# … (repeat all 5, --live) → capture the LIVE prod_… / price_… ids
```

## Phase 4 — seed the BBL prod DB with the LIVE price ids

Dry-run first, then apply. **Target the BBL prod DB (precondition 3).**

```bash
cd apps/web
# preview:
BBL_STRIPE_PRODUCT_PREMIUM=<live prod_premium> \
BBL_STRIPE_PRICE_PREMIUM_ANNUAL=<live price_premium> \
BBL_STRIPE_PRODUCT_ELITE=<live prod_elite> \
BBL_STRIPE_PRICE_ELITE_ANNUAL=<live price_elite_65> \
BBL_STRIPE_PRICE_ELITE_BLACKBELT_ANNUAL=<live price_elite_45> \
bun --env-file=.env.prod scripts/seed-bbl-lineage-pricing.ts --dry-run
# then re-run WITHOUT --dry-run to apply.
```

The seed is idempotent: ensures the 3 BBL entitlement rows (incl. comp-only `LINEAGE_LEGEND`) and
**archives** any prior lineage-membership `PricingPlan` rows not in the new set (`isActive: false`).

## Phase 5 — archive the OLD Stripe prices — ⛔ OPERATOR GATE

After seeding, deactivate the superseded live prices (legacy $59.99/$299 monthly+annual) so no new
checkout can hit them:

```bash
stripe prices update <old_price_id> --active=false --project-name bbl --live
```

The seed already flipped the matching `PricingPlan.isActive`; this closes the Stripe side. **Existing
subscriptions on old prices are NOT touched.** Migrating any live payer is a SEPARATE, rehearsed,
operator-gated step — out of scope for this run.

## Phase 6 — gates before declaring sellable

1. `/lineage/join` on the BBL deployment lists **3 annual plans**; a non-black-belt sees Premium + Elite
   ($65), a verified BJJ black belt also sees the $45 rate (`findLineageMembershipPlans` /
   `isBlackBeltRateEligible`).
2. **Test-mode webhook rehearsal** (BBL account): `stripe listen --forward-to <app>/api/stripe/webhooks/bbl`,
   real test-card checkout → confirm entitlement granted on `checkout.session.completed`, revoked on
   `customer.subscription.deleted` (pattern: `scripts/stripe-rehearsal-seed.ts`). Hard gate (ADR 0030).

## What Codex must NOT do autonomously

- No `--live` create (Phase 3) or old-price archive (Phase 5) without the explicit operator gate.
- No migration of existing live subscribers to new prices.
- No changes to the amounts / entitlement mapping — those are ratified.

## Cross-references

- [`BBL_STRIPE_PRODUCTS_SPEC.md`](BBL_STRIPE_PRODUCTS_SPEC.md) — the spec this runbook executes.
- ADR 0030 — per-brand Stripe account.
- [SOT-ADR](SOT-ADR.md) D13 — the ratified membership-tier model.
