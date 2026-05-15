import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-pricing-plans.ts
 *
 * Seeds PricingPlan rows for Baseline Martial Arts (BMA) based on the
 * product definitions in setup-ronin-stripe-products.ts.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-pricing-plans.ts
 *   bun run apps/web/prisma/seed-pricing-plans.ts --org-id <cuid>
 *
 * If --org-id is not provided, uses the first BASELINE_MARTIAL_ARTS org found.
 *
 * @see docs/sprints/SESSION_0104.md TASK_01
 * @see docs/architecture/decisions/0014-stripe-product-policy.md
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const args = process.argv.slice(2)
const orgIdFlag = args.includes("--org-id") ? args[args.indexOf("--org-id") + 1] : null
const BRAND = "BASELINE_MARTIAL_ARTS" as const

// ── PricingPlan definitions mapped from setup-ronin-stripe-products.ts ──
// Each entry maps to one Stripe product's default price.
// Additional subscription intervals get their own PricingPlan row.

interface PlanDef {
  name: string
  vertical: string
  entitlementKey: string
  pricingModel:
    | "MONTHLY"
    | "ANNUAL"
    | "DROP_IN"
    | "PER_TEST"
    | "FREE_TRIAL"
    | "CLASS_PACK"
    | "CUSTOM"
  amountCents: number
  intervalMonths: number | null // null = one-time
  needsProgram: boolean // true = requires programId (deferred, left null)
}

const BMA_PLANS: PlanDef[] = [
  // Membership
  {
    name: "Membership — Monthly",
    vertical: "membership",
    entitlementKey: "membership:org:active",
    pricingModel: "MONTHLY",
    amountCents: 14900,
    intervalMonths: 1,
    needsProgram: false,
  },
  {
    name: "Membership — Quarterly",
    vertical: "membership",
    entitlementKey: "membership:org:active",
    pricingModel: "MONTHLY",
    amountCents: 42500,
    intervalMonths: 3,
    needsProgram: false,
  },
  {
    name: "Membership — Annual",
    vertical: "membership",
    entitlementKey: "membership:org:active",
    pricingModel: "ANNUAL",
    amountCents: 149900,
    intervalMonths: 12,
    needsProgram: false,
  },

  // Program enrollment
  {
    name: "Program Enrollment — Free",
    vertical: "program",
    entitlementKey: "program:enrollment:free",
    pricingModel: "FREE_TRIAL",
    amountCents: 0,
    intervalMonths: null,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Standard (one-time)",
    vertical: "program",
    entitlementKey: "program:enrollment:standard",
    pricingModel: "DROP_IN",
    amountCents: 4900,
    intervalMonths: null,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Standard (monthly)",
    vertical: "program",
    entitlementKey: "program:enrollment:standard",
    pricingModel: "MONTHLY",
    amountCents: 4900,
    intervalMonths: 1,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Standard (quarterly)",
    vertical: "program",
    entitlementKey: "program:enrollment:standard",
    pricingModel: "MONTHLY",
    amountCents: 13900,
    intervalMonths: 3,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Standard (annual)",
    vertical: "program",
    entitlementKey: "program:enrollment:standard",
    pricingModel: "ANNUAL",
    amountCents: 49900,
    intervalMonths: 12,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Premium (one-time)",
    vertical: "program",
    entitlementKey: "program:enrollment:premium",
    pricingModel: "DROP_IN",
    amountCents: 9900,
    intervalMonths: null,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Premium (monthly)",
    vertical: "program",
    entitlementKey: "program:enrollment:premium",
    pricingModel: "MONTHLY",
    amountCents: 9900,
    intervalMonths: 1,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Premium (quarterly)",
    vertical: "program",
    entitlementKey: "program:enrollment:premium",
    pricingModel: "MONTHLY",
    amountCents: 27900,
    intervalMonths: 3,
    needsProgram: true,
  },
  {
    name: "Program Enrollment — Premium (annual)",
    vertical: "program",
    entitlementKey: "program:enrollment:premium",
    pricingModel: "ANNUAL",
    amountCents: 99900,
    intervalMonths: 12,
    needsProgram: true,
  },

  // Tournament registration
  {
    name: "Tournament Registration",
    vertical: "tournament",
    entitlementKey: "tournament:registration:entry",
    pricingModel: "DROP_IN",
    amountCents: 7500,
    intervalMonths: null,
    needsProgram: false,
  },

  // Certificate order
  {
    name: "Certificate Order",
    vertical: "certificate",
    entitlementKey: "certificate:order:issued",
    pricingModel: "DROP_IN",
    amountCents: 2500,
    intervalMonths: null,
    needsProgram: false,
  },

  // Course enrollment
  {
    name: "Course Enrollment — Free",
    vertical: "course",
    entitlementKey: "course:enrollment:free",
    pricingModel: "FREE_TRIAL",
    amountCents: 0,
    intervalMonths: null,
    needsProgram: true,
  },
  {
    name: "Course Enrollment — Standard (one-time)",
    vertical: "course",
    entitlementKey: "course:enrollment:standard",
    pricingModel: "DROP_IN",
    amountCents: 2900,
    intervalMonths: null,
    needsProgram: true,
  },
  {
    name: "Course Enrollment — Standard (monthly)",
    vertical: "course",
    entitlementKey: "course:enrollment:standard",
    pricingModel: "MONTHLY",
    amountCents: 2900,
    intervalMonths: 1,
    needsProgram: true,
  },
  {
    name: "Course Enrollment — Standard (quarterly)",
    vertical: "course",
    entitlementKey: "course:enrollment:standard",
    pricingModel: "MONTHLY",
    amountCents: 7900,
    intervalMonths: 3,
    needsProgram: true,
  },
  {
    name: "Course Enrollment — Standard (annual)",
    vertical: "course",
    entitlementKey: "course:enrollment:standard",
    pricingModel: "ANNUAL",
    amountCents: 29900,
    intervalMonths: 12,
    needsProgram: true,
  },

  // Belt test
  {
    name: "Belt Test Registration",
    vertical: "belt_test",
    entitlementKey: "belt_test:registration:entry",
    pricingModel: "PER_TEST",
    amountCents: 5000,
    intervalMonths: null,
    needsProgram: false,
  },

  // Events
  {
    name: "Event Registration — Free",
    vertical: "event",
    entitlementKey: "event:registration:free",
    pricingModel: "FREE_TRIAL",
    amountCents: 0,
    intervalMonths: null,
    needsProgram: false,
  },
  {
    name: "Event Registration — Paid",
    vertical: "event",
    entitlementKey: "event:registration:paid",
    pricingModel: "DROP_IN",
    amountCents: 4900,
    intervalMonths: null,
    needsProgram: false,
  },

  // Org/league annual fee
  {
    name: "Org Annual Fee (annual)",
    vertical: "org_fee",
    entitlementKey: "org:affiliation:active",
    pricingModel: "ANNUAL",
    amountCents: 29900,
    intervalMonths: 12,
    needsProgram: false,
  },
  {
    name: "Org Annual Fee (quarterly)",
    vertical: "org_fee",
    entitlementKey: "org:affiliation:active",
    pricingModel: "MONTHLY",
    amountCents: 7900,
    intervalMonths: 3,
    needsProgram: false,
  },
  {
    name: "Org Annual Fee (monthly)",
    vertical: "org_fee",
    entitlementKey: "org:affiliation:active",
    pricingModel: "MONTHLY",
    amountCents: 2900,
    intervalMonths: 1,
    needsProgram: false,
  },

  // Merch
  {
    name: "Merch — Training Gear",
    vertical: "merch",
    entitlementKey: "merch:order:training",
    pricingModel: "DROP_IN",
    amountCents: 5999,
    intervalMonths: null,
    needsProgram: false,
  },
  {
    name: "Merch — Accessories",
    vertical: "merch",
    entitlementKey: "merch:order:accessories",
    pricingModel: "DROP_IN",
    amountCents: 2499,
    intervalMonths: null,
    needsProgram: false,
  },
  {
    name: "Merch — Recovery",
    vertical: "merch",
    entitlementKey: "merch:order:recovery",
    pricingModel: "DROP_IN",
    amountCents: 2999,
    intervalMonths: null,
    needsProgram: false,
  },

  // Directory listing
  {
    name: "Directory Listing — Free",
    vertical: "directory",
    entitlementKey: "directory:listing:free",
    pricingModel: "FREE_TRIAL",
    amountCents: 0,
    intervalMonths: null,
    needsProgram: false,
  },
  {
    name: "Directory Listing — Standard",
    vertical: "directory",
    entitlementKey: "directory:listing:standard",
    pricingModel: "DROP_IN",
    amountCents: 9700,
    intervalMonths: null,
    needsProgram: false,
  },
  {
    name: "Directory Listing — Premium (monthly)",
    vertical: "directory",
    entitlementKey: "directory:listing:premium",
    pricingModel: "MONTHLY",
    amountCents: 19700,
    intervalMonths: 1,
    needsProgram: false,
  },
  {
    name: "Directory Listing — Premium (annual)",
    vertical: "directory",
    entitlementKey: "directory:listing:premium",
    pricingModel: "ANNUAL",
    amountCents: 197000,
    intervalMonths: 12,
    needsProgram: false,
  },
]

function formatEntitlementName(key: string) {
  return key
    .split(":")
    .map(part => part.replace(/[-_]+/g, " "))
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ")
}

async function main() {
  // Resolve org
  let organizationId = orgIdFlag
  if (!organizationId) {
    const org = await db.organization.findFirst({
      where: { brand: BRAND },
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

  console.log(`\n🌱 Seeding ${BMA_PLANS.length} PricingPlan rows for BMA...\n`)

  let created = 0
  let skipped = 0
  let entitlementsCreated = 0
  let grantsCreated = 0
  let grantsSkipped = 0

  for (const plan of BMA_PLANS) {
    // Upsert by brand + org + name to be idempotent
    const existing = await db.pricingPlan.findFirst({
      where: {
        brand: BRAND,
        organizationId,
        name: plan.name,
      },
    })

    let pricingPlan: NonNullable<typeof existing>
    if (existing) {
      pricingPlan = existing
      console.log(`   ⏭️  Skipped (exists): ${plan.name}`)
      skipped++
    } else {
      pricingPlan = await db.pricingPlan.create({
        data: {
          brand: BRAND,
          name: plan.name,
          pricingModel: plan.pricingModel,
          amountCents: plan.amountCents,
          intervalMonths: plan.intervalMonths,
          isActive: true,
          organizationId,
          // programId left null — will be linked when programs are seeded
        },
      })
      console.log(
        `   ✅ Created: ${plan.name} ($${(plan.amountCents / 100).toFixed(2)}, ${plan.intervalMonths ? `${plan.intervalMonths}mo` : "one-time"})`,
      )
      created++
    }

    let entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand: BRAND, key: plan.entitlementKey } },
    })

    if (!entitlement) {
      entitlement = await db.entitlement.create({
        data: {
          brand: BRAND,
          key: plan.entitlementKey,
          name: formatEntitlementName(plan.entitlementKey),
          description: `Granted by Baseline pricing plans for the ${plan.vertical} vertical.`,
        },
      })
      entitlementsCreated++
    }

    const existingGrant = await db.entitlementGrant.findUnique({
      where: {
        pricingPlanId_entitlementId: {
          pricingPlanId: pricingPlan.id,
          entitlementId: entitlement.id,
        },
      },
    })

    if (existingGrant) {
      grantsSkipped++
      continue
    }

    await db.entitlementGrant.create({
      data: {
        pricingPlanId: pricingPlan.id,
        entitlementId: entitlement.id,
      },
    })
    grantsCreated++
  }

  console.log(
    `\n🎉 Done! PricingPlans created: ${created}, skipped: ${skipped}, total: ${BMA_PLANS.length}`,
  )
  console.log(
    `🔐 Entitlements created: ${entitlementsCreated}, grants created: ${grantsCreated}, grants skipped: ${grantsSkipped}`,
  )
}

main()
  .catch(e => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
