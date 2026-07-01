// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { SCHOOL_OUTREACH_KIND } from "~/server/web/school-lead/emit-school-lead"
import { type PipelineLeadRow, toPipelineLead } from "~/lib/leads-pipeline/project"

const row = (over: Partial<PipelineLeadRow> = {}): PipelineLeadRow => ({
  id: "lead-1",
  status: "NEW",
  firstName: "Alex",
  lastName: "Doe",
  email: "alex@example.com",
  meta: null,
  organizationId: "org-1",
  organization: { name: "Gracie Barra HQ" },
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-02T00:00:00.000Z"),
  ...over,
})

describe("toPipelineLead", () => {
  it("projects a plain person lead: name title + contact, not school outreach", () => {
    const lead = toPipelineLead(row())
    expect(lead.title).toBe("Alex Doe")
    expect(lead.contactName).toBe("Alex Doe")
    expect(lead.contactEmail).toBe("alex@example.com")
    expect(lead.isSchoolOutreach).toBe(false)
    expect(lead.demandCount).toBe(0)
    expect(lead.organizationName).toBe("Gracie Barra HQ")
  })

  it("detects a school-outreach lead via meta.kind and reads the demand-count", () => {
    const lead = toPipelineLead(
      row({
        firstName: "Atlantis Jiu-Jitsu",
        lastName: null,
        email: null,
        meta: { kind: SCHOOL_OUTREACH_KIND, demandCount: 4 },
      }),
    )
    expect(lead.isSchoolOutreach).toBe(true)
    expect(lead.demandCount).toBe(4)
    // A school-outreach lead's title is the org (school) name; contact is suppressed.
    expect(lead.title).toBe("Gracie Barra HQ")
    expect(lead.contactName).toBeNull()
  })

  it("guards a malformed / missing demand-count to 0", () => {
    expect(toPipelineLead(row({ meta: { kind: SCHOOL_OUTREACH_KIND } })).demandCount).toBe(0)
    expect(
      toPipelineLead(row({ meta: { kind: SCHOOL_OUTREACH_KIND, demandCount: -2 } })).demandCount,
    ).toBe(0)
    expect(
      toPipelineLead(row({ meta: { kind: SCHOOL_OUTREACH_KIND, demandCount: "x" } })).demandCount,
    ).toBe(0)
  })

  it("surfaces a lost reason from meta and falls back to the org name when nameless", () => {
    const lead = toPipelineLead(
      row({
        firstName: "",
        lastName: null,
        status: "LOST",
        meta: { lostReason: "Chose a rival gym" },
      }),
    )
    expect(lead.lostReason).toBe("Chose a rival gym")
    expect(lead.title).toBe("Gracie Barra HQ")
  })
})
