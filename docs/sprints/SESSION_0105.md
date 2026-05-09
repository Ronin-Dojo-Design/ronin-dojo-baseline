---
title: "SESSION 0105 - Admin PricingPlan CRUD Verification & TuffBuffs Catalog-to-DB Migration"
slug: session-0105
type: session
status: in-progress
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0105
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0104.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - docs/architecture/monetization-entitlements-spec.md
  - apps/web/prisma/schema.prisma
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0105 — Admin PricingPlan CRUD Verification & TuffBuffs Catalog-to-DB Migration

## Date

2026-05-08

## Operator

Brian Scott + Copilot acting as Petey (planner), Cody (builder)

## Status

in-progress

## Goal

Verify the existing admin PricingPlan CRUD UI works end-to-end (list, create, edit, delete), then migrate the hardcoded TuffBuffs affiliate gear catalog into DB-backed PricingPlan + Product rows so real product data (names, prices, images, affiliate URLs) is editable from the admin dashboard.

## Petey Plan

### Context

**What exists today:**

| Asset | Location | State |
| --- | --- | --- |
| PricingPlan model | `apps/web/prisma/schema.prisma` | ✅ Live, 32 BMA rows seeded |
| Admin PricingPlan UI | `apps/web/app/admin/pricing-plans/` | ⚠️ Scaffolded (748 lines UI + 240 lines server), untested with real data |
| Server queries/actions | `apps/web/server/admin/pricing-plans/` | ⚠️ 93-line actions, 96-line queries, 51-line schema — needs verification |
| TuffBuffs affiliate catalog | `apps/web/lib/tuffbuffs/affiliate-gear.ts` | Hardcoded, 582 lines, ~30+ specific products with names/prices/images/affiliate URLs |
| TuffBuffs merch catalog | `apps/web/lib/tuffbuffs/merch-catalog.ts` | Hardcoded, 468 lines, helper functions |
| Gear page | `apps/web/app/(web)/gear/page.tsx` | Reads from hardcoded catalog, renders grid |
| Generic seed PricingPlans | `apps/web/prisma/seed-pricing-plans.ts` | 32 rows with placeholder names ("Merch — Training Gear" $59.99) — not the real products |

**Gap:** The admin can't edit real TuffBuffs product details because the catalog is hardcoded in TypeScript. The seed PricingPlans are generic vertical-level placeholders, not the actual product catalog.

### Tasks

#### TASK_01 — Verify admin PricingPlan CRUD works end-to-end

- **Agent:** Cody
- **What:** Boot dev server, navigate to `/admin/pricing-plans`, verify the 32 seeded rows display. Test create, edit, delete flows. Fix any runtime errors.
- **Steps:**
  1. Read `apps/web/server/admin/pricing-plans/queries.ts` — confirm it queries PricingPlan correctly.
  2. Read `apps/web/server/admin/pricing-plans/actions.ts` — confirm upsert/delete actions work.
  3. Read `apps/web/server/admin/pricing-plans/schema.ts` — confirm Zod validation matches PricingPlan model.
  4. Read `apps/web/app/admin/pricing-plans/_components/pricing-plan-form.tsx` — confirm form fields map to schema.
  5. Boot dev server, open `/admin/pricing-plans`. Screenshot or describe what renders.
  6. Test: create a new plan, edit an existing plan's price, delete a test plan.
  7. Fix any errors found.
- **Done means:** Admin can list, create, edit, and delete PricingPlan rows from the dashboard. No runtime errors.
- **Depends on:** Nothing.

#### TASK_02 — Seed real TuffBuffs affiliate products as PricingPlan rows

- **Agent:** Cody
- **What:** Create a seed script that reads from `affiliate-gear.ts` and creates PricingPlan rows with the actual product names, prices, and metadata (affiliate URL, image path stored in a JSON field or new columns).
- **Steps:**
  1. Audit `affiliate-gear.ts` — count products, extract structure (id, name, description, amountCents, category, affiliateUrl, imagePath, recommendedFor).
  2. Decide: do TuffBuffs affiliate products map to PricingPlan rows, or do they need a separate Product model? PricingPlan has `name`, `amountCents`, `pricingModel` but lacks `affiliateUrl`, `imagePath`, `description`. **Decision needed from Brian.**
  3. If PricingPlan is sufficient: extend with a `metadata Json?` column (or use existing fields creatively). If not: plan a Product seed instead.
  4. Write the seed script.
  5. Run and verify rows appear in admin UI.
- **Done means:** Real TuffBuffs product names and prices visible and editable in admin PricingPlan table.
- **Depends on:** TASK_01 (admin UI must work first).

#### TASK_03 — Wire gear page to read from DB instead of hardcoded catalog

- **Agent:** Cody
- **What:** Update the gear page to query PricingPlan/Product rows from DB instead of importing from `affiliate-gear.ts`. Keep the hardcoded catalog as a fallback or remove it.
- **Steps:**
  1. Create a server query that fetches merch-category PricingPlans with metadata.
  2. Update gear page to use the DB query.
  3. Verify the gear page renders the same products from DB.
- **Done means:** Gear page reads from DB. Admin edits to product names/prices reflect on the public page.
- **Depends on:** TASK_02.

### Parallelism

TASK_01 first (must verify admin works). TASK_02 and TASK_03 are sequential after TASK_01.

### Agent Assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Verification + bug fixes on existing code |
| TASK_02 | Cody | Seed script authoring — clear execution |
| TASK_03 | Cody | Page wiring — clear execution |

### Open Decisions (for Brian at bow-in)

1. **Product model vs PricingPlan for merch:** PricingPlan lacks `affiliateUrl`, `imagePath`, `description`. Options:
   - (a) Add a `metadata Json?` column to PricingPlan for extensible product details.
   - (b) Use the existing `Product` model from the entitlement schema (if it has the right fields).
   - (c) Create a `MerchProduct` model with a FK to PricingPlan.
   - **Petey recommendation:** Option (a) — `metadata Json?` is the lightest lift and keeps the admin UI working without schema migration. Revisit with a proper Product model when the merch vertical matures.

2. **Scope of "real products":** Do we seed ALL ~30+ TuffBuffs affiliate products from `affiliate-gear.ts`, or just the 3 category-level products already in PricingPlan? **Petey recommendation:** Seed all specific products — that's the whole point of making them editable.

3. **Affiliate URL handling:** Should affiliate URLs be editable from admin? If yes, they need to be in the DB (metadata JSON or dedicated column). **Petey recommendation:** Yes, store in metadata JSON.

### Risks

- PricingPlan `metadata Json?` column requires a schema migration. Low risk but needs `prisma migrate dev`.
- Admin pricing UI may have bugs since it's never been tested with real data.
- TuffBuffs affiliate gear products are Amazon affiliate links — changing prices in admin won't change Amazon's prices. The DB price is our display price, not the checkout price (which is Amazon's).

### Scope Guard

Do NOT build: merch checkout flow, Amazon affiliate tracking, inventory management, or public product detail pages beyond the existing gear grid.

### Dirstarter Implementation Template

- **Docs read first:** Dirstarter admin patterns already followed in existing pricing-plans UI. Component inventory consulted.
- **Baseline pattern to extend:** Dirstarter admin CRUD pattern (table + form + actions + queries). Already scaffolded.
- **Custom delta:** Metadata JSON for affiliate product details. DB-driven gear page.
- **No-bypass proof:** Extending existing Dirstarter admin scaffold, not replacing.

### Graphify Check

- Graph status: current (b64b5d5)
- Queries used:
  - `"Tuff Buffs catalog products pricing admin dashboard"` → `merch-catalog.ts`
  - `"affiliate gear merch page shop store products component"` → `affiliate-gear.ts`, `affiliate-gear-grid.tsx`, `affiliate-gear-browser.tsx`, `affiliate-gear-card.tsx`, `gear/page.tsx`
  - `"admin pricing CRUD edit update PricingPlan management"` → confirmed admin UI exists at `admin/pricing-plans/`
- Files selected: `affiliate-gear.ts`, `merch-catalog.ts`, `gear/page.tsx`, admin pricing-plans components, server queries/actions/schema
- Verification: Admin UI scaffolded with 748 lines, but untested. Affiliate gear catalog has ~30+ specific products hardcoded.

## What Landed

*(To be filled during execution)*

## Files Touched

*(To be filled during execution)*

## Task Log

- `SESSION_0105_TASK_01` — planned (admin CRUD verification)
- `SESSION_0105_TASK_02` — planned (TuffBuffs catalog seed)
- `SESSION_0105_TASK_03` — planned (gear page DB wiring)

## Review Log

*(To be filled at close)*

## Decisions Resolved

*(To be filled during execution)*

## Open Decisions / Blockers

- Brian: Product model vs PricingPlan metadata JSON for merch details (see Open Decisions above).
- Brian: Scope of affiliate product seeding (all ~30+ or category-level only).
- Brian: Affiliate URL editability from admin.
- Carry-forward: ADR 0014 upgrade from `proposed` to `accepted`.

## Next Session

*(To be filled at close)*
