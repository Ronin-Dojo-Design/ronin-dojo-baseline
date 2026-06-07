// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { submitProfileClaimSchema } from "./claim-schemas"

const CUID = "ckv9z1a2b0000qz1q2w3e4r5t"

describe("submitProfileClaimSchema", () => {
  it("accepts a valid person claim", () => {
    const parsed = submitProfileClaimSchema.safeParse({
      subjectType: "PERSON",
      subjectId: CUID,
      relationship: "SELF",
    })
    expect(parsed.success).toBe(true)
  })

  it("accepts a valid organization claim with a note", () => {
    const parsed = submitProfileClaimSchema.safeParse({
      subjectType: "ORGANIZATION",
      subjectId: CUID,
      relationship: "OWNER",
      claimantNote: "I run this dojo.",
    })
    expect(parsed.success).toBe(true)
  })

  it("rejects an unknown subjectType", () => {
    const parsed = submitProfileClaimSchema.safeParse({
      subjectType: "LINEAGE",
      subjectId: CUID,
      relationship: "SELF",
    })
    expect(parsed.success).toBe(false)
  })

  it("rejects an unknown relationship", () => {
    const parsed = submitProfileClaimSchema.safeParse({
      subjectType: "PERSON",
      subjectId: CUID,
      relationship: "STUDENT_OF",
    })
    expect(parsed.success).toBe(false)
  })

  it("rejects a non-cuid subjectId", () => {
    const parsed = submitProfileClaimSchema.safeParse({
      subjectType: "PERSON",
      subjectId: "not-a-cuid",
      relationship: "SELF",
    })
    expect(parsed.success).toBe(false)
  })
})
