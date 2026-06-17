/**
 * seed-bbl-lineage-pricing.ts
 *
 * Seeds the production Black Belt Legacy (BBL) lineage-membership `PricingPlan`
 * rows so `/lineage/join` on the BBL deployment lists sellable plans, and the
 * BBL-account Stripe webhook (`/api/stripe/webhooks/bbl`, ADR 0030) can grant
 * the corresponding entitlements on checkout.
 *
 * This is SESSION_0402 TASK_05 (the follow-up the per-brand Stripe seam PR #76
 * named as blocked-on-operator) and SESSION_0403 TASK_01.
 *
 * ── What it creates ────────────────────────────────────────────────────────
 * Two paid tiers (operator decision SESSION_0403 — Legend is comp-only, never
 * sold), each with a Monthly + Annual `PricingPlan`, amounts sourced from the
 * monorepo BBLApp (`wordpress/blackbeltlegacy-payments.php::resolve_tier_amount`,
 * USD cents) and mapped onto the Baseline lineage entitlement spine:
 *
 *   BBL "Premium"    → LINEAGE_PREMIUM          $9.99/mo (999),  $59.99/yr (5999)
 *   BBL "Instructor" → LINEAGE_PREMIUM + ELITE  $29.99/mo (2999), $299/yr (29900)
 *
 * Entitlement grants are cumulative (ELITE plans also grant PREMIUM) via the
 * canonical `getLineageCompEntitlementKeys` helper, so a PAID member and a
 * COMPED member at the same tier carry the identical entitlement-key signal
 * (the read model the tier-gating epic relies on).
 *
 * Each plan carries `metadata.surface = "lineage_membership"` so
 * `findLineageMembershipPlans` (server/web/billing/lineage-membership.ts) lists
 * it on `/lineage/join`.
 *
 * ── Stripe price IDs (real, BBL account) ───────────────────────────────────
 * `findLineageMembershipPlans` only returns plans with a non-null
 * `stripePriceId`, so each row needs the BBL **account's** real `price_…` id.
 * Those do not exist in code — the operator creates the products/prices in the
 * BBL Stripe account (see docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md)
 * and supplies the ids via env. This script reads them from env and refuses to
 * seed sellable rows without them (use --allow-missing-price-ids to stage
 * not-yet-sellable rows, or --dry-run to preview).
 *
 *   BBL_STRIPE_PRODUCT_PREMIUM        prod_… (optional; display/admin only)
 *   BBL_STRIPE_PRICE_PREMIUM_MONTHLY  price_…  (999/mo)
 *   BBL_STRIPE_PRICE_PREMIUM_ANNUAL   price_…  (5999/yr)
 *   BBL_STRIPE_PRODUCT_ELITE          prod_… (optional)
 *   BBL_STRIPE_PRICE_ELITE_MONTHLY    price_…  (2999/mo)
 *   BBL_STRIPE_PRICE_ELITE_ANNUAL     price_…  (29900/yr)
 *
 * Idempotent: upserts by (brand, organizationId, name); re-running after the
 * operator supplies real price ids backfills them onto the existing rows.
 *
 * Usage (from apps/web):
 *   bun run scripts/seed-bbl-lineage-pricing.ts --dry-run
 *   BBL_STRIPE_PRICE_PREMIUM_MONTHLY=price_… (…all four…) \
 *     bun run scripts/seed-bbl-lineage-pricing.ts
 *   bun run scripts/seed-bbl-lineage-pricing.ts --org-id <cuid>
 *   bun run scripts/seed-bbl-lineage-pricing.ts --allow-missing-price-ids
 *
 * @see docs/sprints/SESSION_0402.md (operator checklist + product spec)
 * @see docs/sprints/SESSION_0403.md TASK_01
 * @see docs/architecture/decisions/0030-per-brand-stripe-account.md
 * @see docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"
import {
  getLineageCompEntitlementKeys,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  type LineageCompTier,
} from "../lib/entitlements/lineage-comp"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BBL" as const

const args = process.argv.slice(2)
const orgIdFlag = args.includes("--org-id") ? args[args.indexOf("--org-id") + 1] : null
const isDryRun = args.includes("--dry-run")
const allowMissingPriceIds = args.includes("--allow-missing-price-ids")

const LINEAGE_MEMBERSHIP_SURFACE = "lineage_membership"

// Human label for each entitlement key, used when ensuring the Entitlement row.
const ENTITLEMENT_NAMES: Record<string, string> = {
  [LINEAGE_PREMIUM_ENTITLEMENT_KEY]: "Black Belt Legacy — Premium",
  [LINEAGE_ELITE_ENTITLEMENT_KEY]: "Black Belt Legacy — Elite",
}

interface PlanDef {
  /** Display name; also the idempotency key (brand + org + name). */
  name: string
  /** The membership tier this plan sells; entitlement grants derive from it. */
  tier: LineageCompTier
  pricingModel: "MONTHLY" | "ANNUAL"
  amountCents: number
  intervalMonths: number
  /** env var holding the real BBL-account price id (price_…). */
  priceIdEnv: string
  /** env var holding the BBL-account product id (prod_…); optional. */
  productIdEnv: string
  sortOrder: number
  summary: string
  features: string[]
  ctaLabel: string
}

// Amounts (USD cents) sourced from the monorepo BBLApp:
//   wordpress/blackbeltlegacy-payments.php::resolve_tier_amount
//   member_premium → { monthly: 999,  yearly: 5999 }
//   instructor     → { monthly: 2999, yearly: 29900 }
// Tier mapping is the SESSION_0403 operator decision (2 paid tiers; Legend comp-only).
const BBL_LINEAGE_PLANS: PlanDef[] = [
  {
    name: "Black Belt Legacy — Premium (Monthly)",
    tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    pricingModel: "MONTHLY",
    amountCents: 999,
    intervalMonths: 1,
    priceIdEnv: "BBL_STRIPE_PRICE_PREMIUM_MONTHLY",
    productIdEnv: "BBL_STRIPE_PRODUCT_PREMIUM",
    sortOrder: 10,
    summary: "Full member card, technique library, and unlimited favorites.",
    features: [
      "Full lineage member card (photo, bio, links, attachments)",
      "Complete technique library",
      "Unlimited favorites + video downloads",
    ],
    ctaLabel: "Join Premium",
  },
  {
    name: "Black Belt Legacy — Premium (Annual)",
    tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    pricingModel: "ANNUAL",
    amountCents: 5999,
    intervalMonths: 12,
    priceIdEnv: "BBL_STRIPE_PRICE_PREMIUM_ANNUAL",
    productIdEnv: "BBL_STRIPE_PRODUCT_PREMIUM",
    sortOrder: 11,
    summary: "Premium membership billed yearly (best value).",
    features: ["Everything in Premium", "Two months free vs. monthly billing"],
    ctaLabel: "Join Premium — Annual",
  },
  {
    name: "Black Belt Legacy — Elite (Monthly)",
    tier: LINEAGE_ELITE_ENTITLEMENT_KEY,
    pricingModel: "MONTHLY",
    amountCents: 2999,
    intervalMonths: 1,
    priceIdEnv: "BBL_STRIPE_PRICE_ELITE_MONTHLY",
    productIdEnv: "BBL_STRIPE_PRODUCT_ELITE",
    sortOrder: 20,
    summary: "Instructor tier — create techniques, manage students and lineage.",
    features: [
      "Everything in Premium",
      "Publish technique posts",
      "Invite + track students, instructor dashboard",
      "Lineage tree management",
    ],
    ctaLabel: "Become an Instructor",
  },
  {
    name: "Black Belt Legacy — Elite (Annual)",
    tier: LINEAGE_ELITE_ENTITLEMENT_KEY,
    pricingModel: "ANNUAL",
    amountCents: 29900,
    intervalMonths: 12,
    priceIdEnv: "BBL_STRIPE_PRICE_ELITE_ANNUAL",
    productIdEnv: "BBL_STRIPE_PRODUCT_ELITE",
    sortOrder: 21,
    summary: "Instructor tier billed yearly (best value).",
    features: ["Everything in Elite", "Two months free vs. monthly billing"],
    ctaLabel: "Become an Instructor — Annual",
  },
]

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

async function main() {
  console.log(`\n🥋 BBL lineage-membership pricing seed${isDryRun ? " (DRY RUN)" : ""}\n`)

  // ── Resolve the BBL organization (PricingPlan requires organizationId). ──
  let organizationId = orgIdFlag
  if (!organizationId) {
    const org = await db.organization.findFirst({
      where: { brand: BRAND },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    })
    if (!org) {
      console.error(
        "❌ No BBL organization found. Run `bun run prisma/seed-bbl-org.ts` first, or pass --org-id <cuid>.",
      )
      process.exit(1)
    }
    organizationId = org.id
    console.log(`📍 Org: ${org.name} (${org.id})`)
  } else {
    console.log(`📍 Org (flag): ${organizationId}`)
  }

  // ── Validate price ids up front (real BBL-account price_… from env). ──
  const missing = BBL_LINEAGE_PLANS.filter(p => !process.env[p.priceIdEnv]).map(p => p.priceIdEnv)
  if (missing.length > 0) {
    console.log(
      "\n⚠️  Missing BBL-account Stripe price ids (set these from the BBL Stripe account):",
    )
    for (const env of missing) {
      console.log(`     ${env}`)
    }
    if (!allowMissingPriceIds && !isDryRun) {
      console.error(
        "\n❌ Refusing to seed: plans without a stripePriceId are not sellable on /lineage/join.\n" +
          "   Provide the env vars above, or re-run with --allow-missing-price-ids to stage the rows,\n" +
          "   or --dry-run to preview. See BBL_STRIPE_PRODUCTS_SPEC.md.",
      )
      process.exit(1)
    }
    console.log(
      allowMissingPriceIds
        ? "   Proceeding with --allow-missing-price-ids: rows will be staged (stripePriceId = null, NOT sellable).\n"
        : "   (dry run — showing what would be created)\n",
    )
  }

  let created = 0
  let updated = 0
  let grantsCreated = 0

  for (const plan of BBL_LINEAGE_PLANS) {
    const stripePriceId = process.env[plan.priceIdEnv] ?? null
    const stripeProductId = process.env[plan.productIdEnv] ?? null
    const entitlementKeys = getLineageCompEntitlementKeys(plan.tier)
    const metadata = {
      surface: LINEAGE_MEMBERSHIP_SURFACE,
      summary: plan.summary,
      features: plan.features,
      ctaLabel: plan.ctaLabel,
    }

    const label =
      `${plan.name} — ${dollars(plan.amountCents)} / ${plan.intervalMonths}mo ` +
      `→ [${entitlementKeys.join(", ")}] price=${stripePriceId ?? "(unset)"}`

    if (isDryRun) {
      console.log(`   • ${label}`)
      continue
    }

    const existing = await db.pricingPlan.findFirst({
      where: { brand: BRAND, organizationId, name: plan.name },
      select: { id: true },
    })

    let pricingPlanId: string
    if (existing) {
      await db.pricingPlan.update({
        where: { id: existing.id },
        data: {
          pricingModel: plan.pricingModel,
          amountCents: plan.amountCents,
          intervalMonths: plan.intervalMonths,
          isActive: true,
          sortOrder: plan.sortOrder,
          stripeProductId,
          stripePriceId,
          metadata,
        },
      })
      pricingPlanId = existing.id
      updated++
      console.log(`   ⏭️  Updated: ${label}`)
    } else {
      const row = await db.pricingPlan.create({
        data: {
          brand: BRAND,
          organizationId,
          name: plan.name,
          pricingModel: plan.pricingModel,
          amountCents: plan.amountCents,
          intervalMonths: plan.intervalMonths,
          isActive: true,
          sortOrder: plan.sortOrder,
          stripeProductId,
          stripePriceId,
          metadata,
        },
        select: { id: true },
      })
      pricingPlanId = row.id
      created++
      console.log(`   ✅ Created: ${label}`)
    }

    // ── Ensure entitlements + cumulative grants. ──
    for (const key of entitlementKeys) {
      const entitlement = await db.entitlement.upsert({
        where: { brand_key: { brand: BRAND, key } },
        update: {},
        create: {
          brand: BRAND,
          key,
          name: ENTITLEMENT_NAMES[key] ?? key,
          description: "Black Belt Legacy lineage membership tier (paid or comped).",
        },
        select: { id: true },
      })

      const existingGrant = await db.entitlementGrant.findUnique({
        where: { pricingPlanId_entitlementId: { pricingPlanId, entitlementId: entitlement.id } },
        select: { id: true },
      })
      if (!existingGrant) {
        await db.entitlementGrant.create({
          data: { pricingPlanId, entitlementId: entitlement.id },
        })
        grantsCreated++
      }
    }
  }

  if (isDryRun) {
    console.log(
      `\n✅ Dry run complete — ${BBL_LINEAGE_PLANS.length} plans previewed. Nothing written.\n`,
    )
    return
  }

  console.log(
    `\n🎉 Done. Plans created: ${created}, updated: ${updated} (of ${BBL_LINEAGE_PLANS.length}); ` +
      `entitlement grants created: ${grantsCreated}.`,
  )
  console.log(
    "   Next: confirm /lineage/join lists the plans on the BBL deployment, then run the BBL-account\n" +
      "   test-mode rehearsal (Stripe CLI → /api/stripe/webhooks/bbl) proving grant + revoke.\n",
  )
}

main()
  .catch(e => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
