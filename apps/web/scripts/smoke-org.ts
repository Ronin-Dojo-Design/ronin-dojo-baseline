/**
 * Organization create + join smoke proof — SESSION_0011 TASK_03
 *
 * Exercises the S3 org flow at Prisma level:
 *   1. Create User + Passport (prereq from S2)
 *   2. Create Discipline
 *   3. Create Organization with discipline + owner membership (mirrors createOrganization action)
 *   4. Join Organization as second user (mirrors joinOrganization action)
 *   5. Verify all relationships
 *   6. Cleanup
 *
 * Run: cd apps/web && bun scripts/smoke-org.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client.js"

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev"
const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const db = new PrismaClient({ adapter })

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const TS = Date.now()

async function main() {
  console.log("🔥 Organization create + join smoke proof — start\n")

  // ── Step 1: Create two users with Passports ──────────────────────────────
  console.log("1️⃣  Creating owner + joiner users…")
  const owner = await db.user.create({
    data: { name: "Org Owner", email: `smoke-owner-${TS}@test.local` },
  })
  const ownerPassport = await db.passport.create({
    data: { userId: owner.id, displayName: "Owner" },
    select: { id: true },
  })
  await db.directoryProfile.create({ data: { passportId: ownerPassport.id } })

  const joiner = await db.user.create({
    data: { name: "Org Joiner", email: `smoke-joiner-${TS}@test.local` },
  })
  const joinerPassport = await db.passport.create({
    data: { userId: joiner.id, displayName: "Joiner" },
    select: { id: true },
  })
  await db.directoryProfile.create({ data: { passportId: joinerPassport.id } })
  console.log(`   Owner: ${owner.id}, Joiner: ${joiner.id}`)

  // ── Step 2: Create a Discipline ──────────────────────────────────────────
  console.log("\n2️⃣  Creating Discipline…")
  const discipline = await db.discipline.create({
    data: { name: `Smoke Discipline ${TS}`, slug: `smoke-disc-${TS}`, brand: BRAND },
  })
  console.log(`   Discipline: ${discipline.id} (${discipline.name})`)

  // ── Step 3: Create Organization + link discipline + owner membership ─────
  console.log("\n3️⃣  Creating Organization (mirrors createOrganization action)…")
  const org = await db.organization.create({
    data: {
      brand: BRAND,
      name: `Smoke Dojo ${TS}`,
      slug: `smoke-dojo-${TS}`,
      type: "DOJO",
      ownerId: owner.id,
    },
  })
  console.log(`   Org: ${org.id} (${org.name})`)

  // Link discipline
  await db.organizationDiscipline.create({
    data: { organizationId: org.id, disciplineId: discipline.id },
  })

  // Owner membership
  const ownerMembership = await db.membership.create({
    data: {
      brand: BRAND,
      userId: owner.id,
      organizationId: org.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  })
  console.log(`   Owner membership: ${ownerMembership.id} (status=${ownerMembership.status})`)

  // ── Step 4: Joiner joins the org (mirrors joinOrganization action) ───────
  console.log("\n4️⃣  Joiner joining Organization…")
  const joinerMembership = await db.membership.create({
    data: {
      brand: BRAND,
      userId: joiner.id,
      organizationId: org.id,
      disciplineId: discipline.id,
      status: "PENDING",
    },
  })
  console.log(`   Joiner membership: ${joinerMembership.id} (status=${joinerMembership.status})`)

  // ── Step 5: Verify relationships ─────────────────────────────────────────
  console.log("\n5️⃣  Verifying relationships…")

  const fullOrg = await db.organization.findUnique({
    where: { id: org.id },
    include: {
      disciplines: { include: { discipline: true } },
      memberships: true,
      owner: { select: { id: true, name: true } },
    },
  })

  if (!fullOrg) throw new Error("FAIL: Org not found")
  if (fullOrg.ownerId !== owner.id) throw new Error("FAIL: Owner mismatch")
  if (fullOrg.disciplines.length !== 1)
    throw new Error(`FAIL: Expected 1 discipline, got ${fullOrg.disciplines.length}`)
  if (fullOrg.memberships.length !== 2)
    throw new Error(`FAIL: Expected 2 memberships, got ${fullOrg.memberships.length}`)

  const activeMembers = fullOrg.memberships.filter(m => m.status === "ACTIVE")
  const pendingMembers = fullOrg.memberships.filter(m => m.status === "PENDING")
  if (activeMembers.length !== 1) throw new Error("FAIL: Expected 1 ACTIVE member")
  if (pendingMembers.length !== 1) throw new Error("FAIL: Expected 1 PENDING member")

  console.log(`   ✅ Org owner: ${fullOrg.owner?.name}`)
  console.log(`   ✅ Disciplines: ${fullOrg.disciplines.map(d => d.discipline.name).join(", ")}`)
  console.log(`   ✅ Memberships: ${activeMembers.length} active, ${pendingMembers.length} pending`)

  // ── Cleanup ──────────────────────────────────────────────────────────────
  console.log("\n🧹 Cleaning up test data…")
  await db.membership.deleteMany({ where: { organizationId: org.id } })
  await db.organizationDiscipline.deleteMany({ where: { organizationId: org.id } })
  await db.organization.delete({ where: { id: org.id } })
  await db.discipline.delete({ where: { id: discipline.id } })
  for (const u of [owner, joiner]) {
    await db.directoryProfile.deleteMany({ where: { passport: { userId: u.id } } })
    await db.passport.delete({ where: { userId: u.id } })
    await db.user.delete({ where: { id: u.id } })
  }
  console.log("   Cleaned up.")

  console.log("\n✅ ORG CREATE + JOIN SMOKE PROOF PASSED — all 5 steps verified.")
}

main()
  .catch(e => {
    console.error("\n❌ SMOKE PROOF FAILED:", e.message)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
