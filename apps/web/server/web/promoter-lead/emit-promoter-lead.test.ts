// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, expect, it } from "bun:test"

import {
  emitPromoterLead,
  PROMOTER_OUTREACH_FOLLOW_UP_NOTE,
  PROMOTER_OUTREACH_KIND,
} from "~/server/web/promoter-lead/emit-promoter-lead"
import { db } from "~/services/db"

const COACH_OUTREACH_ORG_SLUG = "bbl-coach-outreach"
const PREFIX = `session-0540-promoter-lead-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

afterAll(async () => {
  await db.lead.deleteMany({ where: { firstName: { startsWith: PREFIX } } })
  // Only remove the shared bucket org if this run left it empty (never nuke real demand).
  await db.organization.deleteMany({
    where: { slug: COACH_OUTREACH_ORG_SLUG, leads: { none: {} } },
  })
})

function metaRecord(meta: unknown): Record<string, unknown> {
  return meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {}
}

it("emitPromoterLead creates one lead + unsent follow-up on the shared bucket org on a miss", async () => {
  const promoterName = tag("Professor Atlantis")

  const result = await emitPromoterLead({ promoterName, source: "belt-journey" })
  expect(result).not.toBeNull()
  const created = result!

  expect(created.createdLead).toBe(true)
  expect(created.matchedBy).toBe("none")
  expect(created.demandCount).toBe(1)

  const [organization, lead] = await Promise.all([
    db.organization.findUnique({ where: { id: created.organizationId } }),
    db.lead.findUnique({ where: { id: created.leadId }, include: { followUps: true } }),
  ])
  expect(organization?.slug).toBe(COACH_OUTREACH_ORG_SLUG)
  expect(lead).not.toBeNull()

  const meta = metaRecord(lead!.meta)
  expect(meta.kind).toBe(PROMOTER_OUTREACH_KIND)
  expect(meta.promoterName).toBe(promoterName)
  expect(meta.demandCount).toBe(1)
  expect(lead!.followUps[0]?.notes).toBe(PROMOTER_OUTREACH_FOLLOW_UP_NOTE)
})

it("dedups the same coach into one demand-counted lead (idempotent upsert)", async () => {
  const promoterName = tag("Master Deduplicated")

  const first = await emitPromoterLead({ promoterName, source: "belt-journey" })
  const second = await emitPromoterLead({ promoterName, source: "join-the-legacy" })

  expect(first?.leadId).toBe(second?.leadId)
  expect(second?.createdLead).toBe(false)
  expect(second?.matchedBy).toBe("lead")
  expect(second?.demandCount).toBe(2)

  const lead = await db.lead.findUnique({ where: { id: second!.leadId } })
  const sources = metaRecord(lead!.meta).sources
  expect(Array.isArray(sources) ? sources : []).toContain("join-the-legacy")
})

it("returns null for a blank promoter name (nothing to capture)", async () => {
  expect(await emitPromoterLead({ promoterName: "   ", source: "belt-journey" })).toBeNull()
})
