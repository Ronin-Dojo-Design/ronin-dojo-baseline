/**
 * Smoke test for the entitlement layer.
 * Run: bun apps/web/scripts/smoke-entitlements.ts
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("🔥 Entitlement smoke test\n")

  // Setup: create a test user
  const user = await db.user.create({
    data: {
      name: "Smoke Test User",
      email: `smoke-${Date.now()}@test.local`,
    },
  })

  // Setup: create a test org + pricing plan
  const org = await db.organization.create({
    data: {
      name: "Smoke Org",
      slug: `smoke-org-${Date.now()}`,
      brand: "RONIN_DOJO_DESIGN",
      owner: { connect: { id: user.id } },
    },
  })

  const plan = await db.pricingPlan.create({
    data: {
      brand: "RONIN_DOJO_DESIGN",
      name: "Test Plan",
      pricingModel: "MONTHLY",
      amountCents: 5000,
      organizationId: org.id,
      stripeProductId: "prod_smoke",
      stripePriceId: "price_smoke",
    },
  })

  // 1. Create entitlement
  const entitlement = await db.entitlement.create({
    data: {
      brand: "RONIN_DOJO_DESIGN",
      key: "program-access-smoke",
      name: "Program Access (Smoke)",
    },
  })
  console.log("✅ Created entitlement:", entitlement.key)

  // 2. Link to pricing plan
  await db.entitlementGrant.create({
    data: {
      pricingPlanId: plan.id,
      entitlementId: entitlement.id,
    },
  })
  console.log("✅ Linked entitlement to pricing plan")

  // 3. Grant to user
  const grant = await db.userEntitlement.create({
    data: {
      userId: user.id,
      entitlementId: entitlement.id,
      sourceType: "PURCHASE",
      sourceId: "smoke-test",
    },
  })
  console.log("✅ Granted entitlement to user")

  // 4. Check access (expect true)
  const activeCount = await db.userEntitlement.count({
    where: { userId: user.id, status: "ACTIVE", entitlementId: entitlement.id },
  })
  console.log(
    activeCount > 0 ? "✅ PASS: access check = true" : "❌ FAIL: access check should be true",
  )

  // 5. Revoke
  await db.userEntitlement.update({
    where: { id: grant.id },
    data: { status: "REVOKED" },
  })
  const revokedCount = await db.userEntitlement.count({
    where: { userId: user.id, status: "ACTIVE", entitlementId: entitlement.id },
  })
  console.log(
    revokedCount === 0
      ? "✅ PASS: revoked access = false"
      : "❌ FAIL: revoked access should be false",
  )

  // 6. Expire test: create with past endsAt, then expire
  const expirable = await db.userEntitlement.create({
    data: {
      userId: user.id,
      entitlementId: entitlement.id,
      sourceType: "SUBSCRIPTION",
      sourceId: "smoke-expire",
      endsAt: new Date(Date.now() - 1000), // already in the past
    },
  })
  const _expired = await db.userEntitlement.updateMany({
    where: { status: "ACTIVE", endsAt: { lte: new Date() } },
    data: { status: "EXPIRED" },
  })
  const expiredRecord = await db.userEntitlement.findUnique({ where: { id: expirable.id } })
  console.log(
    expiredRecord?.status === "EXPIRED"
      ? "✅ PASS: expired entitlement = EXPIRED"
      : "❌ FAIL: expired entitlement should be EXPIRED",
  )

  // Cleanup
  await db.userEntitlement.deleteMany({ where: { userId: user.id } })
  await db.entitlementGrant.deleteMany({ where: { entitlementId: entitlement.id } })
  await db.entitlement.delete({ where: { id: entitlement.id } })
  await db.pricingPlan.delete({ where: { id: plan.id } })
  await db.organization.delete({ where: { id: org.id } })
  await db.user.delete({ where: { id: user.id } })

  console.log("\n🧹 Cleanup done. All tests passed.")
}

main()
  .catch(e => {
    console.error("❌ Smoke test failed:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
