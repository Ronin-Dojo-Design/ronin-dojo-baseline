import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"
import { tuffBuffsAffiliateGearCollections } from "~/lib/tuffbuffs/affiliate-gear"

/**
 * seed-gear-recommendations.ts
 *
 * Seeds GearRecommendation rows linking Disciplines to PricingPlans (gear products).
 * Maps the hardcoded tuffBuffsAffiliateGearCollections data into DB rows.
 *
 * Prerequisites: seed-tuffbuffs-affiliate.ts must have run first (PricingPlan rows exist).
 *
 * Usage:
 *   bun run apps/web/prisma/seed-gear-recommendations.ts
 *
 * @see docs/sprints/SESSION_0109.md TASK_03
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

async function main() {
  // 1. Load all disciplines (system + BASELINE) keyed by slug
  const disciplines = await db.discipline.findMany({
    where: {
      OR: [
        { brand: "BASELINE_MARTIAL_ARTS" },
        { isSystem: true },
      ],
    },
    select: { id: true, slug: true },
  })
  const disciplineBySlug = new Map(disciplines.map((d) => [d.slug, d.id]))

  // 2. Load all affiliate PricingPlan rows keyed by metadata.externalId
  const plans = await db.pricingPlan.findMany({
    where: {
      brand: "BASELINE_MARTIAL_ARTS",
      metadata: { path: ["source"], equals: "tuffbuffs-affiliate" },
    },
    select: { id: true, metadata: true },
  })
  const planByExternalId = new Map<string, string>()
  for (const plan of plans) {
    const meta = plan.metadata as Record<string, unknown> | null
    if (meta?.externalId && typeof meta.externalId === "string") {
      planByExternalId.set(meta.externalId, plan.id)
    }
  }

  console.log(
    `📍 Found ${disciplines.length} disciplines, ${plans.length} affiliate PricingPlans\n`,
  )

  let created = 0
  let skipped = 0
  let missing = 0

  for (const collection of tuffBuffsAffiliateGearCollections) {
    const disciplineId = disciplineBySlug.get(collection.id)
    if (!disciplineId) {
      console.log(`   ⚠️  No discipline found for slug "${collection.id}" — skipping collection`)
      missing++
      continue
    }

    // Seed REQUIRED recommendations
    for (let i = 0; i < collection.requiredProductIds.length; i++) {
      const productId = collection.requiredProductIds[i]
      const pricingPlanId = planByExternalId.get(productId)
      if (!pricingPlanId) {
        console.log(`   ⚠️  No PricingPlan for externalId "${productId}" — skipping`)
        missing++
        continue
      }

      const existing = await db.gearRecommendation.findUnique({
        where: {
          disciplineId_pricingPlanId_type: {
            disciplineId,
            pricingPlanId,
            type: "REQUIRED",
          },
        },
      })
      if (existing) {
        skipped++
        continue
      }

      await db.gearRecommendation.create({
        data: {
          brand: "BASELINE_MARTIAL_ARTS",
          type: "REQUIRED",
          disciplineId,
          pricingPlanId,
          sortOrder: i,
        },
      })
      created++
    }

    // Seed RECOMMENDED recommendations
    for (let i = 0; i < collection.recommendedProductIds.length; i++) {
      const productId = collection.recommendedProductIds[i]
      const pricingPlanId = planByExternalId.get(productId)
      if (!pricingPlanId) {
        console.log(`   ⚠️  No PricingPlan for externalId "${productId}" — skipping`)
        missing++
        continue
      }

      const existing = await db.gearRecommendation.findUnique({
        where: {
          disciplineId_pricingPlanId_type: {
            disciplineId,
            pricingPlanId,
            type: "RECOMMENDED",
          },
        },
      })
      if (existing) {
        skipped++
        continue
      }

      await db.gearRecommendation.create({
        data: {
          brand: "BASELINE_MARTIAL_ARTS",
          type: "RECOMMENDED",
          disciplineId,
          pricingPlanId,
          sortOrder: i,
        },
      })
      created++
    }

    console.log(`   ✅ ${collection.name}: seeded`)
  }

  console.log(
    `\n🎉 Done! Created: ${created}, Skipped: ${skipped}, Missing refs: ${missing}`,
  )
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
