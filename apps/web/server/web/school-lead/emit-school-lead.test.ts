// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, expect, it } from "bun:test"

import {
  emitSchoolLead,
  SCHOOL_OUTREACH_FOLLOW_UP_NOTE,
  SCHOOL_OUTREACH_KIND,
} from "~/server/web/school-lead/emit-school-lead"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const PREFIX = `session-0478-school-lead-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

afterAll(async () => {
  await db.lead.deleteMany({
    where: {
      OR: [
        { firstName: { startsWith: PREFIX } },
        { organization: { slug: { startsWith: PREFIX } } },
      ],
    },
  })
  await db.organization.deleteMany({ where: { slug: { startsWith: PREFIX } } })
})

function metaRecord(meta: unknown): Record<string, unknown> {
  return meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {}
}

it("emitSchoolLead creates one placeholder organization, lead, and unsent email follow-up on a miss", async () => {
  const schoolName = tag("Atlantis Jiu-Jitsu")

  const result = await emitSchoolLead({
    schoolName,
    memberEmail: `${tag("member-one")}@test.local`,
    source: "join-the-legacy",
  })

  expect(result.createdOrganization).toBe(true)
  expect(result.createdLead).toBe(true)
  expect(result.matchedBy).toBe("none")
  expect(result.demandCount).toBe(1)

  const [organization, lead] = await Promise.all([
    db.organization.findUnique({ where: { id: result.organizationId } }),
    db.lead.findUnique({
      where: { id: result.leadId },
      include: { followUps: true },
    }),
  ])
  expect(organization).not.toBeNull()
  expect(lead).not.toBeNull()

  const orgRecord = organization!
  const leadRecord = lead!
  const meta = metaRecord(leadRecord.meta)
  const followUp = leadRecord.followUps[0]!

  expect(orgRecord.brand).toBe(TEST_BRAND)
  expect(orgRecord.ownerId).toBeNull()
  expect(orgRecord.type).toBe("SCHOOL")
  expect(leadRecord.source).toBe("OTHER")
  expect(meta.kind).toBe(SCHOOL_OUTREACH_KIND)
  expect(meta.demandCount).toBe(1)
  expect(meta.schoolName).toBe(schoolName)
  expect(leadRecord.followUps).toHaveLength(1)
  expect(followUp.channel).toBe("email")
  expect(followUp.notes).toBe(SCHOOL_OUTREACH_FOLLOW_UP_NOTE)
  expect(followUp.completedAt).toBeNull()
})

it("emitSchoolLead bumps demand count instead of creating another row for the same custom school", async () => {
  const schoolName = tag("Duplicate Demand Academy")

  const first = await emitSchoolLead({
    schoolName,
    memberEmail: `${tag("member-two")}@test.local`,
    source: "join-the-legacy",
  })
  const second = await emitSchoolLead({
    schoolName: `${schoolName}!!!`,
    memberEmail: `${tag("member-three")}@test.local`,
    source: "join-the-legacy",
  })

  expect(second.leadId).toBe(first.leadId)
  expect(second.organizationId).toBe(first.organizationId)
  expect(second.createdOrganization).toBe(false)
  expect(second.createdLead).toBe(false)
  expect(second.matchedBy).toBe("lead")
  expect(second.demandCount).toBe(2)

  const [organizationCount, leadCount, followUpCount, lead] = await Promise.all([
    db.organization.count({ where: { name: schoolName } }),
    db.lead.count({
      where: {
        organizationId: first.organizationId,
        meta: { path: ["kind"], equals: SCHOOL_OUTREACH_KIND },
      },
    }),
    db.leadFollowUp.count({ where: { leadId: first.leadId } }),
    db.lead.findUnique({ where: { id: first.leadId } }),
  ])
  expect(lead).not.toBeNull()

  const meta = metaRecord(lead!.meta)

  expect(organizationCount).toBe(1)
  expect(leadCount).toBe(1)
  expect(followUpCount).toBe(1)
  expect(meta.demandCount).toBe(2)
  expect(meta.memberEmails).toEqual([
    `${tag("member-three")}@test.local`,
    `${tag("member-two")}@test.local`,
  ])
})

it("emitSchoolLead links to an existing organization match without creating a placeholder org", async () => {
  const organization = await db.organization.create({
    data: {
      brand: TEST_BRAND,
      name: tag("Carlson Gracie Academy"),
      slug: tag("carlson-gracie-academy"),
      type: "SCHOOL",
    },
  })

  const result = await emitSchoolLead({
    schoolName: tag("Carlson Gracie Academi"),
    memberEmail: `${tag("member-four")}@test.local`,
    source: "join-the-legacy",
  })

  expect(result.organizationId).toBe(organization.id)
  expect(result.createdOrganization).toBe(false)
  expect(result.createdLead).toBe(true)
  expect(result.matchedBy).toBe("organization")

  const placeholderCount = await db.organization.count({
    where: { slug: { startsWith: tag("carlson-gracie-academi") } },
  })
  expect(placeholderCount).toBe(0)
})
