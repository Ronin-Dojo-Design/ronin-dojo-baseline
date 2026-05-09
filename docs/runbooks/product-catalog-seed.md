---
title: "Product Catalog Seed Runbook"
slug: product-catalog-seed
type: runbook
status: active
created: 2026-05-08
updated: 2026-05-08
last_agent: copilot-session-0105
pairs_with:
  - docs/runbooks/schema-migration.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - apps/web/prisma/seed-tuffbuffs-affiliate.ts
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

## Adding new products

### Adding to the hardcoded catalog first

1. Add the product to `apps/web/lib/tuffbuffs/affiliate-gear.ts` in the `tuffBuffsAffiliateGearProducts` array.
2. If the product belongs to program collections, add its ID to the relevant `tuffBuffsAffiliateGearCollections` entries.
3. Add the product image to `apps/web/public/images/merch/`.
4. Update the seed script if it reads from the catalog, or add the product directly to the seed.
5. Run the seed script.
6. Verify in admin and on the gear page.

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
