/**
 * Passport bootstrap smoke proof — SESSION_0011 TASK_02
 *
 * Exercises the S2 identity shell pipeline:
 *   1. Create User + Passport + DirectoryProfile in transaction (mirrors auth hook)
 *   2. Read Passport by userId
 *   3. Update Passport displayName
 *   4. Re-read confirms persistence
 *   5. Cleanup
 *
 * Run: cd apps/web && bun scripts/smoke-passport.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client.js"

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev"
const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const db = new PrismaClient({ adapter })
const TEST_EMAIL = `smoke-passport-${Date.now()}@test.local`

async function main() {
  console.log("🔥 Passport smoke proof — start\n")

  // ── Step 1: Create User + identity shell (mirrors auth.ts hook) ──────────
  console.log("1️⃣  Creating User + Passport + DirectoryProfile…")
  const user = await db.user.create({
    data: {
      name: "Smoke Test User",
      email: TEST_EMAIL,
    },
  })
  console.log(`   User created: ${user.id}`)

  // Simulate the auth hook transaction
  const [passport, dirProfile] = await db.$transaction([
    db.passport.create({
      data: {
        userId: user.id,
        displayName: "Smoke Display",
      },
    }),
    db.directoryProfile.create({
      data: {
        userId: user.id,
      },
    }),
  ])
  console.log(`   Passport created: ${passport.id}`)
  console.log(`   DirectoryProfile created: ${dirProfile.id}`)

  // ── Step 2: Read Passport by userId ──────────────────────────────────────
  console.log("\n2️⃣  Reading Passport by userId…")
  const readPassport = await db.passport.findUnique({ where: { userId: user.id } })
  if (!readPassport) throw new Error("FAIL: Passport not found after creation")
  if (readPassport.displayName !== "Smoke Display") {
    throw new Error(`FAIL: displayName mismatch — got "${readPassport.displayName}"`)
  }
  console.log(`   ✅ Passport read OK: displayName="${readPassport.displayName}"`)

  // ── Step 3: Update Passport displayName ──────────────────────────────────
  console.log("\n3️⃣  Updating Passport displayName…")
  const updated = await db.passport.update({
    where: { userId: user.id },
    data: { displayName: "Updated Smoke" },
  })
  if (updated.displayName !== "Updated Smoke") {
    throw new Error(`FAIL: update didn't persist — got "${updated.displayName}"`)
  }
  console.log(`   ✅ Update OK: displayName="${updated.displayName}"`)

  // ── Step 4: Re-read confirms persistence ─────────────────────────────────
  console.log("\n4️⃣  Re-reading to confirm persistence…")
  const reRead = await db.passport.findUnique({ where: { userId: user.id } })
  if (reRead?.displayName !== "Updated Smoke") {
    throw new Error(`FAIL: re-read mismatch — got "${reRead?.displayName}"`)
  }
  console.log(`   ✅ Re-read confirmed: displayName="${reRead.displayName}"`)

  // ── Step 5: Read DirectoryProfile defaults ───────────────────────────────
  console.log("\n5️⃣  Verifying DirectoryProfile defaults…")
  const dp = await db.directoryProfile.findUnique({ where: { userId: user.id } })
  if (!dp) throw new Error("FAIL: DirectoryProfile not found")
  if (dp.visibility !== "MEMBERS_ONLY") {
    throw new Error(`FAIL: default visibility wrong — got "${dp.visibility}"`)
  }
  if (dp.showOrgs !== true || dp.showRanks !== true) {
    throw new Error("FAIL: default showOrgs/showRanks not true")
  }
  console.log(
    `   ✅ DirectoryProfile defaults OK: visibility=${dp.visibility}, showOrgs=${dp.showOrgs}, showRanks=${dp.showRanks}`,
  )

  // ── Cleanup ──────────────────────────────────────────────────────────────
  console.log("\n🧹 Cleaning up test data…")
  await db.directoryProfile.delete({ where: { userId: user.id } })
  await db.passport.delete({ where: { userId: user.id } })
  await db.user.delete({ where: { id: user.id } })
  console.log("   Cleaned up.")

  console.log("\n✅ PASSPORT SMOKE PROOF PASSED — all 5 steps verified.")
}

main()
  .catch(e => {
    console.error("\n❌ SMOKE PROOF FAILED:", e.message)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
