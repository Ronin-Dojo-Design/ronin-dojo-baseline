---
title: "SESSION 0111 — Merch Catalog DB Extraction: Shirts, Rash Guards, Hoodies"
slug: session-0111
type: session
status: in-progress
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0111
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0110.md
  - apps/web/lib/tuffbuffs/merch-catalog.ts
  - apps/web/server/web/affiliate-products/queries.ts
  - apps/web/prisma/schema.prisma
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - docs/architecture/monetization-entitlements-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0111 — Merch Catalog DB Extraction: Shirts, Rash Guards, Hoodies

## Date

2026-05-09

## Operator

Brian Scott + Copilot acting as Petey (planner)

## Status

in-progress

## Goal

Extract the hardcoded `merch-catalog.ts` (28 TuffBuffs own-brand products: shirts, rash guards, hoodies, gear, accessories) into DB-backed `PricingPlan` rows with merch-specific metadata, build a merch store page, and prepare for Stripe checkout integration. Follow the same three-phase pattern that succeeded for affiliate-gear (SESSION_0107→0110).

## Graphify check

- Graph status: current (`d11d6f0`)
- Queries used:
  1. `merch catalog shirts rash guards hoodies products sell ship store` → `merch-catalog.ts`, storage monitoring queries
  2. `merch store page shop checkout stripe product catalog sell ship order` → ADR 0014, monetization-entitlements-spec, ubiquitous-language commerce section
- Key findings:
  - `merch-catalog.ts` has **zero runtime importers** — monitoring dependency was removed in SESSION_0106
  - No `/shop` or `/store` or `/merch` route exists yet
  - Stripe service exists (`services/stripe.ts`) but no checkout flow is wired
  - ADR 0014 defines Stripe product policy: 1 PricingPlan ↔ 1 Stripe Product
  - Monetization spec defines Product, PricingPlan, Entitlement models
  - 28 products across 4 categories: apparel (8), rashguards (5), gear (5), accessories (5) + 5 placeholder-only items
  - Some products have real `imagePaths` arrays (athletic tees, hoodies, tote bag, long-sleeve rash guard), most have `placeholder.svg`

## Petey Plan

### Goal

Multi-session epic to make the TuffBuffs merch catalog fully DB-driven with a public store page. This session plans the full arc and executes Phase 1 (seed merch products into DB).

### Context: How merch differs from affiliate gear

| Dimension | Affiliate gear (done) | Merch (this epic) |
| --- | --- | --- |
| **What it is** | Amazon affiliate links — customer buys on Amazon | Own-brand products — customer buys from us, we ship |
| **Revenue model** | Affiliate commission | Direct sale (Stripe checkout) |
| **DB model** | `PricingPlan` with `metadata.source = "tuffbuffs-affiliate"` | `PricingPlan` with `metadata.source = "tuffbuffs-merch"` |
| **Extra fields** | `affiliateUrl`, `category`, `imagePath` | `colors`, `sizes`, `features`, `imagePaths`, `inStock`, `classType`, `type` |
| **Store page** | `/gear` (browse + external links) | `/shop` or `/merch` (browse + Stripe checkout) |
| **Stripe** | Not needed (Amazon handles payment) | Required — Stripe Product + Price per item (ADR 0014) |
| **Shipping** | Amazon handles | We handle ($4.99 flat per ADR) or print-on-demand partner |

### Phase breakdown (same pattern as affiliate-gear)

#### Phase 1 — Seed merch products as PricingPlan rows (this session)

- Create `seed-tuffbuffs-merch.ts` that reads from `merch-catalog.ts` and creates `PricingPlan` rows with `metadata.source = "tuffbuffs-merch"`.
- Metadata JSON stores: `externalId`, `description`, `category`, `type`, `classType`, `colors`, `sizes`, `features`, `imagePath`, `imagePaths`, `inStock`, `shippingFeeCents`.
- Run seed. Verify rows in DB.

#### Phase 2 — Merch store page (next session)

- Create `/shop` route with category browser (apparel, rash guards, gear, accessories).
- Query `PricingPlan` rows where `metadata.source = "tuffbuffs-merch"`.
- Product detail view with size/color selectors, image gallery.
- **No checkout yet** — just the catalog browsing experience.

#### Phase 3 — Stripe checkout integration (future session)

- Create Stripe Products + Prices for each merch item (ADR 0014 pattern).
- Checkout session creation server action.
- Order confirmation page.
- Webhook handler for payment confirmation.

#### Phase 4 — Cleanup (future session)

- Inline merch data into seed script (same as SESSION_0110 for affiliate-gear).
- Delete `merch-catalog.ts`.
- Verify zero importers remain.

### This session's tasks (Phase 1 only)

#### TASK_01 — Create merch seed script

- **Agent:** Cody
- **What:** Create `apps/web/prisma/seed-tuffbuffs-merch.ts` that imports the 28 products from `merch-catalog.ts` and creates `PricingPlan` rows with `metadata.source = "tuffbuffs-merch"`. Follow the exact pattern of `seed-tuffbuffs-affiliate.ts`. Use `pricingModel: "CUSTOM"`. Store merch-specific fields in metadata JSON.
- **Steps:**
  1. Import `tuffBuffsMerchProducts` and types from `merch-catalog.ts`
  2. Resolve BASELINE_MARTIAL_ARTS org (same pattern as affiliate seed)
  3. For each product, upsert a PricingPlan row with full metadata
  4. Include `TUFFBUFFS_MERCH_SHIPPING_FEE_CENTS` in metadata for reference
- **Done means:** Script runs, creates 28 PricingPlan rows. Idempotent on re-run.

#### TASK_02 — Add merch query function

- **Agent:** Cody
- **What:** Add `findMerchProducts()` and `findMerchProductById()` to `apps/web/server/web/affiliate-products/queries.ts` (or create a new `server/web/merch/queries.ts` if separation is cleaner). Filter by `metadata.source = "tuffbuffs-merch"`.
- **Done means:** Query functions compile and return typed merch product data.

#### TASK_03 — Run seed and verify

- **Agent:** Cody
- **What:** Run `bun run apps/web/prisma/seed-tuffbuffs-merch.ts`. Verify 28 rows created.
- **Done means:** Seed output shows 28 created (or skipped if already seeded). DB has merch PricingPlan rows.

#### TASK_04 — Type-check

- **Agent:** Doug (QA)
- **What:** Run `bunx tsc --noEmit`. Verify zero new errors.
- **Done means:** Pre-existing errors only.

### Parallelism

TASK_01 → TASK_02 (parallel, disjoint files) → TASK_03 (needs TASK_01) → TASK_04 (last).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Seed script, follows affiliate seed pattern exactly |
| TASK_02 | Cody | Query function, follows existing query pattern |
| TASK_03 | Cody | Seed execution |
| TASK_04 | Doug | QA verification |

### Open decisions

1. ~~**Route path:**~~ ✅ **Resolved:** `/merch` for the merch catalog, `/shop` as a commerce hub linking to `/merch`, `/gear`, and future purchasable categories (memberships, events, courses). Both routes, distinct purposes. User signed off.
2. ~~**Separate query file:**~~ ✅ **Resolved:** New `server/web/merch/queries.ts` — merch is a distinct product category with different metadata shape. User signed off.
3. **Print-on-demand vs inventory:** Both models needed across all brands. Some products (tees, hoodies, rash guards) → print-on-demand (Printful/Printify). Others (eskrima sticks, gloves, branded gear) → physical inventory. Explore requirements for both in Phase 3. **Deferred to Phase 3.**

### Risks

- Merch metadata is richer than affiliate metadata (`colors`, `sizes`, `features`, `imagePaths` arrays). JSON metadata in PricingPlan works but gets unwieldy — if it becomes a pain, may need a dedicated `MerchProduct` model later. For now, JSON metadata is fine (same approach as affiliate gear, proven pattern).
- Many products still have `placeholder.svg` images — functional but visually incomplete. Not a blocker for DB extraction.
- Stripe Product creation (Phase 3) will need real product images and descriptions. Placeholder products shouldn't be pushed to Stripe.

### Scope guard

If additional work surfaces during execution, note it in SESSION file under `Open decisions / blockers` — do NOT expand scope mid-task. Phase 2 (store page), Phase 3 (Stripe), and Phase 4 (cleanup) are explicitly future sessions.

### Dirstarter implementation template

- **Docs read first:** ADR 0014 (Stripe Product Policy), monetization-entitlements-spec.md — both read via graphify query.
- **Baseline pattern to extend:** `PricingPlan` model, `seed-tuffbuffs-affiliate.ts` seed pattern, `findAffiliateProducts()` query pattern.
- **Custom delta:** New seed script for merch products, new query function for merch-specific filtering.
- **No-bypass proof:** No Dirstarter capability replaced — Dirstarter has no merch store. This is L2 custom domain.
