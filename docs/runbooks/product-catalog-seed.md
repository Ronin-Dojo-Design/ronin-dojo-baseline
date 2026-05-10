---
title: "Product Catalog Seed Runbook"
slug: product-catalog-seed
type: runbook
status: active
created: 2026-05-08
updated: 2026-05-09
last_agent: copilot-session-0111
pairs_with:
  - docs/runbooks/schema-migration.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - apps/web/prisma/seed-tuffbuffs-affiliate.ts
  - apps/web/prisma/seed-tuffbuffs-merch.ts
  - apps/web/prisma/seed-pricing-plans.ts
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0105.md
tags:
  - seed
  - products
  - pricing-plans
  - tuffbuffs
  - affiliate
  - merch
  - metadata
---

# Product Catalog Seed Runbook

## Purpose

Add, update, or remove products from the PricingPlan table. This covers both operational pricing plans (memberships, enrollments, registrations) and affiliate/merch products stored via the `metadata Json?` pattern.

## When to use

- Adding new affiliate products (e.g., new TuffBuffs gear)
- Updating prices, descriptions, affiliate URLs, or images for existing products
- Adding a new product vertical (e.g., apparel, supplements)
- Re-seeding after a `prisma migrate reset`
- Onboarding a new brand's product catalog

## Architecture context

Products live in the `PricingPlan` model. Affiliate/merch products use the `metadata Json?` column for extensible fields:

```typescript
metadata: {
  externalId: string       // Original catalog ID (e.g., "amz-bjj-gi")
  description: string      // Product description
  category: string         // "training" | "accessories" | "recovery"
  affiliateUrl: string     // Amazon affiliate link
  imagePath: string | null // Path to product image in /public/images/merch/
  recommendedFor: string[] // Program keys: "bjj", "muay-thai", etc.
  source: string           // Catalog source identifier (e.g., "tuffbuffs-affiliate")
}
```

**Key principle:** The DB price is the *display price*, not the checkout price (which is Amazon's for affiliate products). Changing prices in admin updates the gear page display only.

## Prerequisites

- [ ] Local Postgres running (`ronindojo_dev` database exists)
- [ ] Migrations are current (`bunx prisma migrate status` shows no pending)
- [ ] Prisma client is generated (`bunx prisma generate`)
- [ ] At least one Organization exists for the target brand (run main seed first if needed)

## Seed scripts

| Script | Purpose | Products |
|---|---|---|
| `prisma/seed-pricing-plans.ts` | Operational BMA plans (memberships, enrollments, etc.) | 32 rows |
| `prisma/seed-tuffbuffs-affiliate.ts` | TuffBuffs affiliate gear catalog | 36 rows |
| `prisma/seed-tuffbuffs-merch.ts` | TuffBuffs own-brand merch (shirts, rash guards, hoodies, gear, accessories) | 24 rows |

## Steps

### 1. Pre-flight check

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web

# Verify DB is reachable
/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_dev -c "SELECT 1;"

# Verify migrations are current
bunx prisma migrate status

# Verify an org exists
/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_dev -c \
  "SELECT id, name FROM \"Organization\" WHERE brand = 'BASELINE_MARTIAL_ARTS' LIMIT 1;"
```

### 2. Run main seed (if DB was reset)

```bash
bun run db:seed
```

This creates users, categories, disciplines, ranks, roles, orgs, programs, and class schedules.

### 3. Seed operational pricing plans

```bash
bun run prisma/seed-pricing-plans.ts
# Or with explicit org:
bun run prisma/seed-pricing-plans.ts --org-id <cuid>
```

Idempotent — skips rows that already exist (matched by brand + org + name).

### 4. Seed TuffBuffs affiliate products

```bash
bun run prisma/seed-tuffbuffs-affiliate.ts
# Or with explicit org:
bun run prisma/seed-tuffbuffs-affiliate.ts --org-id <cuid>
```

Idempotent — skips rows that already exist (matched by brand + org + name).

### 4b. Seed TuffBuffs merch products

```bash
bun run prisma/seed-tuffbuffs-merch.ts
# Or with explicit org:
bun run prisma/seed-tuffbuffs-merch.ts --org-id <cuid>
```

Idempotent — skips rows that already exist (matched by brand + org + name). Seeds 24 own-brand merch products (shirts, rash guards, hoodies, gear, accessories) with `metadata.source = "tuffbuffs-merch"`.

### 5. Verify in admin

Navigate to `/admin/pricing-plans` and confirm:

- All expected rows appear in the table
- Affiliate products show `CUSTOM` pricing model
- Click into a product to verify metadata is present

### 6. Verify on public page

Navigate to `/gear` and confirm:

- Products render with correct names, prices, and images
- Category tabs show correct product counts
- Affiliate links point to correct Amazon URLs

Navigate to `/merch` and confirm:

- Merch products render with correct names, prices, sizes, and images
- Category tabs filter correctly (Apparel, Rash Guards, Training Gear, Accessories)
- Featured products appear in the Featured section

## Adding new products

### Adding to the hardcoded catalog first

> **Note (SESSION_0111):** Both `affiliate-gear.ts` and `merch-catalog.ts` have been deleted. Product data is now inlined in the seed scripts. To add new products, add them directly to the relevant seed script's inline array.

1. Add the product to the inline array in the appropriate seed script (`seed-tuffbuffs-affiliate.ts` or `seed-tuffbuffs-merch.ts`).
2. Add the product image to `apps/web/public/images/merch/`.
3. Run the seed script.
4. Verify in admin and on the public page (`/gear` or `/merch`).

### Adding directly to the DB via admin

1. Go to `/admin/pricing-plans/new`.
2. Set name, pricing model (`CUSTOM` for affiliate), amount in cents.
3. Select organization.
4. Metadata JSON must be set manually (future: JSON editor component).

### Adding a new product vertical

1. If the vertical needs new metadata fields, extend the `AffiliateProductMetadata` type in `server/web/affiliate-products/queries.ts`.
2. Create a new seed script following the pattern in `seed-tuffbuffs-affiliate.ts`.
3. Use a distinct `source` value in metadata (e.g., `"tuffbuffs-merch"`, `"brand-apparel"`).
4. Create a server query filtered by the new `source` value.
5. Wire the public page to the new query.

## After a DB reset

The full re-seed sequence is:

```bash
cd /Users/brianscott/dev/ronin-dojo-app/apps/web

# 1. Reset and re-apply migrations
bunx prisma migrate reset --force

# 2. Main seed (orgs, users, disciplines, etc.)
bun run db:seed

# 3. Operational pricing plans
bun run prisma/seed-pricing-plans.ts

# 4. Affiliate products
bun run prisma/seed-tuffbuffs-affiliate.ts

# 5. Merch products
bun run prisma/seed-tuffbuffs-merch.ts
```

## Troubleshooting

| Problem | Fix |
|---|---|
| "No BASELINE_MARTIAL_ARTS organization found" | Run `bun run db:seed` first |
| Drift detected on `prisma migrate dev` | Run `bunx prisma migrate reset --force` then re-seed |
| Products don't appear on gear page | Check `metadata.source` equals `"tuffbuffs-affiliate"` exactly |
| Type errors in seed script after schema change | Run `bunx prisma generate` to regenerate client |

## Related docs

- [Schema Migration Runbook](schema-migration.md) — for schema changes
- [Stripe Setup Runbook](stripe-setup-runbook.md) — for Stripe product/price sync
- [ADR 0014 — Stripe Product Policy](../architecture/decisions/0014-stripe-product-policy.md) — naming conventions

## Lessons learned

- **Three-phase extraction pattern:** Proven twice (affiliate-gear SESSION_0107→0110, merch SESSION_0111). The playbook: Phase 1 (seed from hardcoded source → DB), Phase 2 (build public page reading from DB), Phase 4 (inline data into seed script, delete hardcoded source). This is the standard approach for any new product catalog.
- **`as const satisfies` friction:** When a product array uses `as const satisfies readonly Type[]`, optional fields become absent on items that omit them, creating a discriminated union. This requires type casts in consumers. For seed data, prefer explicit `readonly Type[]` annotation instead.
- **Seed script self-containment:** After Phase 4, seed scripts carry their own product data inline. This makes them independently runnable after a DB reset without depending on any library module. Trade-off: larger files (~500 lines), but seed data changes rarely.
- **Metadata JSON pattern:** Both affiliate and merch products use `PricingPlan.metadata` with a `source` discriminator (`"tuffbuffs-affiliate"`, `"tuffbuffs-merch"`). Query functions filter by `metadata.path.source`. If metadata gets unwieldy, consider a dedicated model — but for <50 products per vertical, JSON is fine.
