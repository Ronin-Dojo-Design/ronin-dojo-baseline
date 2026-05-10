import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"
import { stripe } from "~/services/stripe"

/**
 * fix-merch-stripe-display-names.ts
 *
 * One-time script: updates all TuffBuffs merch Stripe Products to use
 * the friendly PricingPlan.name instead of the ADR 0014 internal name.
 * Stores the original internal name as `metadata.adr0014_name`.
 *
 * Usage:
 *   bun run apps/web/scripts/fix-merch-stripe-display-names.ts              # apply
 *   bun run apps/web/scripts/fix-merch-stripe-display-names.ts --dry-run    # preview
 *
 * @see docs/sprints/SESSION_0113.md — cosmetic fix from smoke test
 */

const DRY_RUN = process.argv.includes("--dry-run")

async function main() {
  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
  })
  const db = new PrismaClient({ adapter })

  try {
    const plans = await db.pricingPlan.findMany({
      where: {
        brand: "BASELINE_MARTIAL_ARTS",
        isActive: true,
        stripeProductId: { not: null },
      },
      select: {
        id: true,
        name: true,
        stripeProductId: true,
        metadata: true,
      },
    })

    const merchPlans = plans.filter((p) => {
      const meta = p.metadata as Record<string, unknown> | null
      return meta?.source === "tuffbuffs-merch"
    })

    console.log(`📦 Found ${merchPlans.length} linked merch products.\n`)
    if (DRY_RUN) console.log("🏜️  DRY RUN — no changes.\n")

    let updated = 0
    let skipped = 0

    for (const plan of merchPlans) {
      if (!plan.stripeProductId) {
        skipped++
        continue
      }

      const stripeProduct = await stripe.products.retrieve(plan.stripeProductId)

      // Already has friendly name?
      if (stripeProduct.name === plan.name) {
        console.log(`   ⏭️  Already friendly: "${plan.name}"`)
        skipped++
        continue
      }

      const oldName = stripeProduct.name

      if (DRY_RUN) {
        console.log(`   🔍 Would rename: "${oldName}" → "${plan.name}"`)
        updated++
        continue
      }

      await stripe.products.update(plan.stripeProductId, {
        name: plan.name,
        metadata: {
          ...stripeProduct.metadata,
          adr0014_name: oldName,
        },
      })

      console.log(`   ✅ Renamed: "${oldName}" → "${plan.name}"`)
      updated++
    }

    console.log(`\n📊 Done — ${updated} updated, ${skipped} skipped.`)
  } finally {
    await db.$disconnect()
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err)
  process.exit(1)
})
