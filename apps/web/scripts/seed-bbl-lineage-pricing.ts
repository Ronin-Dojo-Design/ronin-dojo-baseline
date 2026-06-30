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
 * The ratified BBL membership-tier model (SOT-ADR D13 / SESSION_0472 D472-1,2;
 * reprice landed SESSION_0473 TASK_02). THREE annual-only `PricingPlan`s on two
 * Stripe products, mapped onto the Baseline lineage entitlement spine:
 *
 *   "Premium Member"          → LINEAGE_PREMIUM   $35/yr (3500)
 *   "Elite Member"            → LINEAGE_ELITE     $65/yr (6500)
 *   "Elite — Black Belt rate" → LINEAGE_ELITE     $45/yr (4500), verified-BB only
 *
 * Monthly billing is dropped (annual-only). The $45 Elite price is a verified-black-
 * belt rate ($45 < $65 — intentional supply-side subsidy, D472-1): it grants the
 * SAME LINEAGE_ELITE entitlement and carries `metadata.eligibility = "black_belt"`,
 * which the read model + /lineage/join filter with `isBlackBeltRateEligible`
 * (TASK_03) — rank gates the PRICE, never the features.
 *
 * Entitlement grants are cumulative (ELITE plans also grant PREMIUM) via the
 * canonical `getLineageCompEntitlementKeys` helper, so a PAID member and a
 * COMPED member at the same tier carry the identical entitlement-key signal
 * (the read model the tier-gating epic relies on). The comp-only LINEAGE_LEGEND
 * entitlement row is also ensured up-front (TASK_01) so `grantUserComp(LEGEND)` works.
 *
 * Each plan carries `metadata.surface = "lineage_membership"` so
 * `findLineageMembershipPlans` (server/web/billing/lineage-membership.ts) lists
 * it on `/lineage/join`. Prior lineage-membership plans NOT in the current set
 * (the old monthly/annual rows) are deactivated (archived) on each run.
 *
 * ── Stripe price IDs (real, BBL account) ───────────────────────────────────
 * `findLineageMembershipPlans` only returns plans with a non-null `stripePriceId`,
 * so each row needs the BBL **account's** real `price_…` id (ADR 0030 — BBL transacts
 * on its OWN account; NOT Baseline/Tuff Buffs). The operator creates the prices in the
 * BBL Stripe account (see docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md)
 * and supplies the ids via env. This script reads them from env and refuses to seed
 * sellable rows without them (use --allow-missing-price-ids to stage not-yet-sellable
 * rows, or --dry-run to preview).
 *
 *   BBL_STRIPE_PRODUCT_PREMIUM              prod_… (optional; display/admin only)
 *   BBL_STRIPE_PRICE_PREMIUM_ANNUAL        price_…  (3500/yr → Premium $35)
 *   BBL_STRIPE_PRODUCT_ELITE               prod_… (optional; shared by both Elite prices)
 *   BBL_STRIPE_PRICE_ELITE_ANNUAL          price_…  (6500/yr → Elite $65)
 *   BBL_STRIPE_PRICE_ELITE_BLACKBELT_ANNUAL price_…  (4500/yr → Elite Black Belt rate $45)
 *
 * Idempotent: upserts by (brand, organizationId, name); re-running after the
 * operator supplies real price ids backfills them onto the existing rows.
 *
 * Usage (from apps/web):
 *   bun run scripts/seed-bbl-lineage-pricing.ts --dry-run
 *   BBL_STRIPE_PRICE_PREMIUM_ANNUAL=price_… (…all three…) \
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
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
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
  [LINEAGE_LEGEND_ENTITLEMENT_KEY]: "Black Belt Legacy — Legend",
}

// The full BBL lineage entitlement set. PREMIUM/ELITE are also ensured lazily by
// the per-plan grant loop, but LEGEND is comp-only (no plan grants it), so without
// an explicit up-front ensure the `LINEAGE_LEGEND` row never exists and
// `grantUserComp(tier: LEGEND)` throws "Entitlement not found" (SESSION_0473 TASK_01;
// the gap D472-6 found in prodsnap). Seeding all three here makes running this seed
// against prod self-healing for the comp path.
const BBL_BASE_ENTITLEMENT_KEYS = [
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_LEGEND_ENTITLEMENT_KEY,
] as const

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
  /**
   * When true, this price is only offered to a verified BJJ black belt (the $45
   * "Black Belt rate" Elite price). Materialized into plan metadata as
   * `eligibility: "black_belt"`; the read model + `/lineage/join` filter it with
   * `isBlackBeltRateEligible` (SESSION_0473 TASK_03). The plan still grants the
   * normal LINEAGE_ELITE entitlement — rank gates the PRICE, never the features.
   */
  requiresBlackBelt?: boolean
}

// Amounts (USD cents) — the ratified BBL membership-tier model (SOT-ADR D13 /
// SESSION_0472 D472-1,2). ANNUAL-ONLY (monthly dropped). Three plans on two Stripe
// products: Premium ($35), Elite ($65), and a second Elite price at the verified-
// black-belt rate ($45 < $65 — intentional supply-side subsidy, D472-1). Customer
// copy below is a DRAFT pending operator confirm; internal entitlement keys stay.
const BBL_LINEAGE_PLANS: PlanDef[] = [
  {
    name: "Premium Member",
    tier: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    pricingModel: "ANNUAL",
    amountCents: 3500,
    intervalMonths: 12,
    priceIdEnv: "BBL_STRIPE_PRICE_PREMIUM_ANNUAL",
    productIdEnv: "BBL_STRIPE_PRODUCT_PREMIUM",
    sortOrder: 10,
    summary: "Full public profile, members-only video library, and certificate download.",
    features: [
      "Full public profile (bio, links, rank history, QR)",
      "Members-only video library",
      "Certificate download",
      "Submit your rank for verification",
    ],
    ctaLabel: "Join Premium",
  },
  {
    name: "Elite Member",
    tier: LINEAGE_ELITE_ENTITLEMENT_KEY,
    pricingModel: "ANNUAL",
    amountCents: 6500,
    intervalMonths: 12,
    priceIdEnv: "BBL_STRIPE_PRICE_ELITE_ANNUAL",
    productIdEnv: "BBL_STRIPE_PRODUCT_ELITE",
    sortOrder: 20,
    summary: "Everything in Premium plus the Instructor / School-Owner Hub.",
    features: [
      "Everything in Premium",
      "Instructor / School-Owner Hub",
      "Manage your academy, students, and lineage",
    ],
    ctaLabel: "Become an Instructor",
  },
  {
    name: "Elite — Black Belt rate",
    tier: LINEAGE_ELITE_ENTITLEMENT_KEY,
    pricingModel: "ANNUAL",
    amountCents: 4500,
    intervalMonths: 12,
    priceIdEnv: "BBL_STRIPE_PRICE_ELITE_BLACKBELT_ANNUAL",
    productIdEnv: "BBL_STRIPE_PRODUCT_ELITE",
    sortOrder: 21,
    requiresBlackBelt: true,
    summary: "The Elite tier at the verified-black-belt rate.",
    features: ["Everything in Elite", "Discounted rate for verified BJJ black belts"],
    ctaLabel: "Join at the Black Belt rate",
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

  // ── Ensure the full BBL lineage entitlement set exists (incl. comp-only LEGEND). ──
  // The per-plan loop below only ensures keys a plan grants (PREMIUM/ELITE); LEGEND is
  // comp-only, so it is ensured here so `grantUserComp(tier: LEGEND)` resolves the row.
  if (!isDryRun) {
    for (const key of BBL_BASE_ENTITLEMENT_KEYS) {
      await db.entitlement.upsert({
        where: { brand_key: { brand: BRAND, key } },
        update: {},
        create: {
          brand: BRAND,
          key,
          name: ENTITLEMENT_NAMES[key] ?? key,
          description: "Black Belt Legacy lineage membership tier (paid or comped).",
        },
      })
    }
    console.log(
      `🔑 Ensured ${BBL_BASE_ENTITLEMENT_KEYS.length} BBL entitlements (PREMIUM, ELITE, LEGEND).`,
    )
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
  let archived = 0

  for (const plan of BBL_LINEAGE_PLANS) {
    const stripePriceId = process.env[plan.priceIdEnv] ?? null
    const stripeProductId = process.env[plan.productIdEnv] ?? null
    const entitlementKeys = getLineageCompEntitlementKeys(plan.tier)
    const metadata = {
      surface: LINEAGE_MEMBERSHIP_SURFACE,
      summary: plan.summary,
      features: plan.features,
      ctaLabel: plan.ctaLabel,
      // The verified-black-belt rate carries an eligibility marker; the read model
      // + /lineage/join filter it with isBlackBeltRateEligible (SESSION_0473 TASK_03).
      ...(plan.requiresBlackBelt ? { eligibility: "black_belt" as const } : {}),
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

  // ── Archive prior BBL lineage-membership plans not in the new set. ──
  // The reprice relabels the plans (Premium/Elite Member, Black Belt rate), so the
  // old monthly/annual rows would otherwise linger as active + sellable on
  // /lineage/join. Deactivate any lineage_membership plan whose name is not in the
  // current set (SESSION_0473 TASK_02 / D472-2 "archive old prices"). NOTE: this only
  // flips PricingPlan.isActive — archiving the matching Stripe *prices* is a separate
  // operator/CLI step (the price ids stay valid until archived in Stripe).
  const keepNames = new Set(BBL_LINEAGE_PLANS.map(p => p.name))
  const priorPlans = await db.pricingPlan.findMany({
    where: { brand: BRAND, organizationId, isActive: true },
    select: { id: true, name: true, metadata: true },
  })
  for (const prior of priorPlans) {
    const meta = prior.metadata
    const isMembership =
      typeof meta === "object" &&
      meta !== null &&
      !Array.isArray(meta) &&
      (meta as Record<string, unknown>).surface === LINEAGE_MEMBERSHIP_SURFACE
    if (isMembership && !keepNames.has(prior.name)) {
      await db.pricingPlan.update({ where: { id: prior.id }, data: { isActive: false } })
      archived++
      console.log(`   📦 Archived (deactivated): ${prior.name}`)
    }
  }

  console.log(
    `\n🎉 Done. Plans created: ${created}, updated: ${updated} (of ${BBL_LINEAGE_PLANS.length}); ` +
      `entitlement grants created: ${grantsCreated}; old plans archived: ${archived}.`,
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
