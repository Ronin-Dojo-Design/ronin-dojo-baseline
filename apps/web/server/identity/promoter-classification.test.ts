// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dependency.
import { describe, expect, it } from "bun:test"
import { isRecruitedCoachIdentity } from "./promoter-classification"

describe("isRecruitedCoachIdentity", () => {
  it("requires an accountless Passport with no public identity satellite", () => {
    expect(
      isRecruitedCoachIdentity({ userId: null, lineageNode: null, directoryProfile: null }),
    ).toBe(true)
    expect(
      isRecruitedCoachIdentity({
        userId: null,
        lineageNode: null,
        directoryProfile: { id: "directory" },
      }),
    ).toBe(false)
    expect(
      isRecruitedCoachIdentity({
        userId: null,
        lineageNode: { id: "node" },
        directoryProfile: null,
      }),
    ).toBe(false)
    expect(
      isRecruitedCoachIdentity({ userId: "user", lineageNode: null, directoryProfile: null }),
    ).toBe(false)
  })
})
