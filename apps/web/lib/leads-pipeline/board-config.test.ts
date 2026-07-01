// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { LeadStatus } from "~/.generated/prisma/browser"
import {
  isPipelineStageId,
  LEADS_PIPELINE_BOARD,
  pipelineLeadToCard,
  schoolOutreachQueue,
  stageForStatus,
} from "~/lib/leads-pipeline/board-config"
import type { PipelineLead } from "~/lib/leads-pipeline/types"

const lead = (over: Partial<PipelineLead> = {}): PipelineLead => ({
  id: "lead-1",
  status: LeadStatus.NEW,
  title: "Gracie Barra HQ",
  organizationName: "Gracie Barra HQ",
  organizationId: "org-1",
  contactName: null,
  contactEmail: null,
  isSchoolOutreach: false,
  demandCount: 0,
  lostReason: null,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z",
  ...over,
})

describe("LEADS_PIPELINE_BOARD config", () => {
  it("has the five plan stages in order: NEW → TRIAL_BOOKED → CONTACTED → CONVERTED → LOST", () => {
    expect(LEADS_PIPELINE_BOARD.stages.map(s => s.id)).toEqual([
      "NEW",
      "TRIAL_BOOKED",
      "CONTACTED",
      "CONVERTED",
      "LOST",
    ])
  })

  it("marks LOST terminal + reason-on-lost (no silent drops) and CONVERTED terminal", () => {
    const lost = LEADS_PIPELINE_BOARD.stages.find(s => s.id === "LOST")
    expect(lost?.terminal).toBe(true)
    expect(lost?.reasonOnLost).toBe(true)
    expect(LEADS_PIPELINE_BOARD.stages.find(s => s.id === "CONVERTED")?.terminal).toBe(true)
  })

  it("flags NEW as the intake column and skins with the bbl token block", () => {
    expect(LEADS_PIPELINE_BOARD.stages.find(s => s.id === "NEW")?.intake).toBe(true)
    expect(LEADS_PIPELINE_BOARD.brand).toBe("bbl")
    expect(LEADS_PIPELINE_BOARD.cardKind).toBe("deal")
  })
})

describe("stageForStatus", () => {
  it("maps each column status to its own stage", () => {
    for (const status of ["NEW", "TRIAL_BOOKED", "CONTACTED", "CONVERTED", "LOST"] as const) {
      expect(stageForStatus(status)).toBe(status)
    }
  })

  it("collapses off-board statuses so no lead is invisible", () => {
    // TRIAL_COMPLETED is still an active deal → CONTACTED; NURTURE is parked → NEW.
    expect(stageForStatus(LeadStatus.TRIAL_COMPLETED)).toBe("CONTACTED")
    expect(stageForStatus(LeadStatus.NURTURE)).toBe("NEW")
  })
})

describe("isPipelineStageId", () => {
  it("accepts only the five writable board stages", () => {
    expect(isPipelineStageId("NEW")).toBe(true)
    expect(isPipelineStageId("LOST")).toBe(true)
    // Off-board statuses are NOT writable stages (the store never writes them).
    expect(isPipelineStageId("NURTURE")).toBe(false)
    expect(isPipelineStageId("TRIAL_COMPLETED")).toBe(false)
    expect(isPipelineStageId("garbage")).toBe(false)
  })
})

describe("pipelineLeadToCard", () => {
  it("maps a plain lead to a card with contact + org fields, no school badges", () => {
    const card = pipelineLeadToCard(
      lead({ contactName: "Alex Doe", contactEmail: "alex@example.com", status: "CONTACTED" }),
    )
    expect(card.id).toBe("lead-1")
    expect(card.stage).toBe("CONTACTED")
    expect(card.contact).toEqual({ name: "Alex Doe", email: "alex@example.com" })
    expect(card.badges).toBeUndefined()
    expect(card.value).toBeUndefined()
    expect(card.fields?.organizationName).toBe("Gracie Barra HQ")
  })

  it("badges a school-outreach lead, uses demand as the focal value, and sorts by demand via order", () => {
    const card = pipelineLeadToCard(lead({ isSchoolOutreach: true, demandCount: 3 }))
    expect(card.value).toBe(3)
    expect(card.order).toBe(-3) // higher demand → smaller order → top of column
    expect(card.badges).toContainEqual({ label: "School outreach", tone: "accent" })
    expect(card.badges).toContainEqual({ label: "3× demand", tone: "positive" })
  })

  it("surfaces a lost reason on a LOST card", () => {
    const card = pipelineLeadToCard(lead({ status: "LOST", lostReason: "Went with a rival gym" }))
    expect(card.lostReason).toBe("Went with a rival gym")
  })
})

describe("schoolOutreachQueue", () => {
  it("keeps only school-outreach leads, ranked by demand-count (highest first)", () => {
    const queue = schoolOutreachQueue([
      lead({ id: "a", isSchoolOutreach: true, demandCount: 1 }),
      lead({ id: "b", isSchoolOutreach: false, demandCount: 9 }), // not school outreach → excluded
      lead({ id: "c", isSchoolOutreach: true, demandCount: 5 }),
      lead({ id: "d", isSchoolOutreach: true, demandCount: 2 }),
    ])
    expect(queue.map(l => l.id)).toEqual(["c", "d", "a"])
  })

  it("returns an empty queue when nothing is school outreach", () => {
    expect(schoolOutreachQueue([lead(), lead({ id: "x" })])).toHaveLength(0)
  })
})
