import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"
import { tuffBuffsAffiliateGearProducts } from "~/lib/tuffbuffs/affiliate-gear"

/**
 * seed-tuffbuffs-affiliate.ts
 *
 * Seeds all TuffBuffs affiliate gear products as PricingPlan rows with
 * metadata JSON containing affiliate URL, image path, description, category,
 * and recommendedFor programs.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-tuffbuffs-affiliate.ts
 *   bun run apps/web/prisma/seed-tuffbuffs-affiliate.ts --org-id <cuid>
 *
 * @see docs/sprints/SESSION_0105.md TASK_02
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const args = process.argv.slice(2)
const orgIdFlag = args.includes("--org-id")
  ? args[args.indexOf("--org-id") + 1]
  : null

async function main() {
  // Resolve org
  let organizationId = orgIdFlag
  if (!organizationId) {
    const org = await db.organization.findFirst({
      where: { brand: "BASELINE_MARTIAL_ARTS" },
      select: { id: true, name: true },
    })
    if (!org) {
      console.error(
        "❌ No BASELINE_MARTIAL_ARTS organization found. Run main seed first or pass --org-id.",
      )
      process.exit(1)
    }
    organizationId = org.id
    console.log(`📍 Using org: ${org.name} (${org.id})`)
  }

  console.log(
    `\n🌱 Seeding ${tuffBuffsAffiliateGearProducts.length} TuffBuffs affiliate products as PricingPlan rows...\n`,
  )

  let created = 0
  let skipped = 0

  for (const product of tuffBuffsAffiliateGearProducts) {
    // Idempotent: skip if a row with this externalId already exists
    const existing = await db.pricingPlan.findFirst({
      where: {
        brand: "BASELINE_MARTIAL_ARTS",
        organizationId,
        name: product.name,
      },
    })

    if (existing) {
      console.log(`   ⏭️  Skipped (exists): ${product.name}`)
      skipped++
      continue
    }

    await db.pricingPlan.create({
      data: {
        brand: "BASELINE_MARTIAL_ARTS",
        name: product.name,
        pricingModel: "CUSTOM",
        amountCents: product.amountCents,
        isActive: true,
        organizationId,
        metadata: {
          externalId: product.id,
          description: product.description,
          category: product.category,
          affiliateUrl: product.affiliateUrl,
          imagePath: "imagePath" in product ? product.imagePath : null,
          recommendedFor: [...product.recommendedFor],
          source: "tuffbuffs-affiliate",
        },
      },
    })
    console.log(
      `   ✅ Created: ${product.name} ($${(product.amountCents / 100).toFixed(2)})`,
    )
    created++
  }

  console.log(
    `\n🎉 Done! Created: ${created}, Skipped: ${skipped}, Total: ${tuffBuffsAffiliateGearProducts.length}`,
  )
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
