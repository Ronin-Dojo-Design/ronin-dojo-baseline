import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-gear-recommendations-remaining.ts
 *
 * Seeds GearRecommendation rows for the 7 disciplines that had no hardcoded
 * collection data. Maps universal cross-training gear (mouthguards, cups,
 * jump rope, kettlebells, soap, focus mitts) as RECOMMENDED.
 *
 * Prerequisites: seed-tuffbuffs-affiliate.ts must have run first.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-gear-recommendations-remaining.ts
 *
 * @see docs/sprints/SESSION_0109.md TASK_03 addendum
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

// Universal cross-training gear product IDs (shared across all martial arts)
const universalProductIds = [
  "amz-mouthguard-safejawz",
  "amz-mouthguard-bulletproof",
  "amz-mouthguard-sisu-aero",
  "amz-mouthguard-case-sisu",
  "amz-cup-shorts-shock-doctor",
  "amz-cup-shorts-diamond-mma",
  "amz-jump-rope",
  "amz-kettlebells",
  "amz-kettlebells-cast-iron",
  "amz-defense-soap-wipes",
  "amz-defense-soap-body-wash",
  "amz-focus-mitts",
  "amz-focus-mitts-hayabusa",
  "amz-bjj-spats-runhit",
]

// Disciplines that also benefit from striking gear
const strikingDisciplineSlugs = ["karate", "tkd", "kajukenbo", "krav-maga"]
const strikingProductIds = [
  "amz-boxing-gloves",
  "amz-boxing-gloves-white",
  "amz-hand-wraps",
  "amz-hand-wraps-rdx",
  "amz-hand-wraps-jenaai",
  "amz-thai-pads-fairtex",
]

// Grappling disciplines that benefit from gi gear
const grapplingDisciplineSlugs = ["judo", "wrestling"]
const grapplingProductIds = [
  "amz-bjj-rashguard-gold-men",
  "amz-bjj-rashguard-gold-women",
  "amz-bjj-shorts-men",
  "amz-bjj-shorts-gold-women",
]

const remainingSlugs = ["judo", "kajukenbo", "karate", "tkd", "wrestling", "krav-maga", "wing-chun"]

async function main() {
  // Load disciplines
  const disciplines = await db.discipline.findMany({
    where: { slug: { in: remainingSlugs } },
    select: { id: true, slug: true },
  })
  const disciplineBySlug = new Map(disciplines.map(d => [d.slug, d.id]))

  // Load affiliate PricingPlan rows keyed by metadata.externalId
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
    `📍 Found ${disciplines.length} remaining disciplines, ${plans.length} affiliate PricingPlans\n`,
  )

  let created = 0
  let skipped = 0
  let missing = 0

  for (const slug of remainingSlugs) {
    const disciplineId = disciplineBySlug.get(slug)
    if (!disciplineId) {
      console.log(`   ⚠️  No discipline for slug "${slug}"`)
      missing++
      continue
    }

    // Build product list: universal + discipline-specific extras
    const productIds = [...universalProductIds]
    if (strikingDisciplineSlugs.includes(slug)) {
      productIds.push(...strikingProductIds)
    }
    if (grapplingDisciplineSlugs.includes(slug)) {
      productIds.push(...grapplingProductIds)
    }

    for (let i = 0; i < productIds.length; i++) {
      const pricingPlanId = planByExternalId.get(productIds[i])
      if (!pricingPlanId) {
        console.log(`   ⚠️  No PricingPlan for "${productIds[i]}" — skipping`)
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

    console.log(`   ✅ ${slug}: seeded`)
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}, Missing refs: ${missing}`)
}

main()
  .catch(e => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
