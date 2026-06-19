// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { joinLegacyFormSchema } from "./schema"

const validInput = {
  firstName: "Rigan",
  lastName: "Machado",
  preferredName: "Master Rigan Machado",
  email: "rigan@example.com",
  phoneE164: "+15555551234",
  currentRank: "8th degree coral belt",
  role: "BLACK_BELT",
  schoolName: "Machado Jiu-Jitsu",
  location: "Los Angeles, CA",
  trainedUnder: "Carlos Gracie Jr.",
  represent: "Machado lineage",
  evidenceUrl: "https://example.com/certificate",
  bio: "Legacy profile context.",
  profileUrl: "https://example.com/profile",
  instagramUrl: "https://instagram.com/example",
  martialArtsExperience: "Decades of teaching and lineage stewardship.",
  primaryGoal: "PRESERVE_LINEAGE",
  discoverySource: "INSTRUCTOR",
  discoverySourceOther: "",
  shareConsent: true,
  membershipPath: "PREMIUM",
  treeId: "tree_123",
  nodeId: "node_123",
}

describe("joinLegacyFormSchema", () => {
  it("accepts the promo parity fields without requiring new storage columns", () => {
    const result = joinLegacyFormSchema.safeParse(validInput)

    expect(result.success).toBe(true)
    expect(result.data?.preferredName).toBe("Master Rigan Machado")
    expect(result.data?.primaryGoal).toBe("PRESERVE_LINEAGE")
    expect(result.data?.instagramUrl).toBe("https://instagram.com/example")
  })

  it("requires explicit private-review consent before final submit", () => {
    const result = joinLegacyFormSchema.safeParse({ ...validInput, shareConsent: false })

    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.shareConsent?.[0]).toContain("private intake")
  })

  it("rejects non-http promo and evidence URLs", () => {
    const result = joinLegacyFormSchema.safeParse({
      ...validInput,
      instagramUrl: "mailto:test@example.com",
      evidenceUrl: "ftp://example.com/cert",
    })

    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.instagramUrl?.[0]).toContain("http or https")
    expect(result.error?.flatten().fieldErrors.evidenceUrl?.[0]).toContain("http or https")
  })
})
