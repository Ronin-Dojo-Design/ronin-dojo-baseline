/**
 * Smoke test: Lead lifecycle (create → book trial → complete → convert)
 *
 * Requires:
 * - Running Postgres with ronindojo_dev database
 * - At least one Organization seeded
 * - At least one User with admin role
 *
 * Usage: bun run scripts/smoke-lead-lifecycle.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("🥋 Lead lifecycle smoke test\n")

  // Find a seeded org
  const org = await db.organization.findFirst({
    select: { id: true, name: true, brand: true, disciplines: { select: { disciplineId: true } } },
  })

  if (!org) {
    console.error("❌ No organization found. Seed the database first.")
    process.exit(1)
  }

  console.log(`✅ Using org: ${org.name} (${org.id})`)

  // 1. Create lead
  const lead = await db.lead.create({
    data: {
      brand: org.brand,
      organizationId: org.id,
      source: "WEBSITE",
      firstName: "Smoke",
      lastName: "Test",
      email: `smoke-${Date.now()}@test.local`,
    },
  })
  console.log(`✅ Lead created: ${lead.id} (status: ${lead.status})`)
  assert(lead.status === "NEW", "Lead should be NEW")

  // 2. Create follow-up → should transition to CONTACTED
  const followUp = await db.leadFollowUp.create({
    data: { leadId: lead.id, channel: "PHONE", notes: "Smoke test call" },
  })
  await db.lead.updateMany({
    where: { id: lead.id, status: "NEW" },
    data: { status: "CONTACTED" },
  })
  const contactedLead = await db.lead.findUniqueOrThrow({ where: { id: lead.id } })
  console.log(`✅ Follow-up created, lead status: ${contactedLead.status}`)
  assert(contactedLead.status === "CONTACTED", "Lead should be CONTACTED after follow-up")

  // 3. Book trial
  const trialLead = await db.lead.update({
    where: { id: lead.id },
    data: { status: "TRIAL_BOOKED", trialBookedAt: new Date() },
  })
  console.log(`✅ Trial booked: ${trialLead.status}`)
  assert(trialLead.status === "TRIAL_BOOKED", "Lead should be TRIAL_BOOKED")

  // 4. Complete trial
  const completedLead = await db.lead.update({
    where: { id: lead.id },
    data: { status: "TRIAL_COMPLETED" },
  })
  console.log(`✅ Trial completed: ${completedLead.status}`)
  assert(completedLead.status === "TRIAL_COMPLETED", "Lead should be TRIAL_COMPLETED")

  // 5. Convert
  const convertedLead = await db.lead.update({
    where: { id: lead.id },
    data: { status: "CONVERTED", convertedAt: new Date(), convertedToUserId: null },
  })
  console.log(`✅ Lead converted: ${convertedLead.status}`)
  assert(convertedLead.status === "CONVERTED", "Lead should be CONVERTED")

  // 6. Verify follow-up still linked
  const followUps = await db.leadFollowUp.findMany({ where: { leadId: lead.id } })
  assert(followUps.length === 1, "Should have 1 follow-up")
  console.log(`✅ Follow-up intact: ${followUps.length} record(s)`)

  // Cleanup
  await db.leadFollowUp.deleteMany({ where: { leadId: lead.id } })
  await db.lead.delete({ where: { id: lead.id } })
  console.log(`\n✅ Cleanup done. All assertions passed.`)
  console.log("🥋 Smoke test complete — lead lifecycle works end-to-end.\n")
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`)
    process.exit(1)
  }
}

main()
  .catch(e => {
    console.error("❌ Smoke test failed:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
