// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  hasLeadLineageSelections,
  parseLeadLineageMeta,
  type ResolvedLeadLineageSelections,
} from "./lineage-selections"

describe("parseLeadLineageMeta", () => {
  it("extracts both ref ids and text from a join-the-legacy meta", () => {
    const parsed = parseLeadLineageMeta({
      source: "join-the-legacy",
      currentRank: "Black Belt",
      currentRankId: "rank_123",
      schoolName: "Combat Base",
      schoolOrgId: "org_456",
      trainedUnder: "Alexander Martinez",
      trainedUnderNodeId: "node_789",
      represent: "Rigan Machado Lineage",
      representTreeId: "tree_abc",
    })

    expect(parsed).toEqual({
      currentRank: "Black Belt",
      currentRankId: "rank_123",
      schoolName: "Combat Base",
      schoolOrgId: "org_456",
      trainedUnder: "Alexander Martinez",
      trainedUnderNodeId: "node_789",
      represent: "Rigan Machado Lineage",
      representTreeId: "tree_abc",
    })
  })

  it("keeps custom text with a null ref id (the typed-not-picked case)", () => {
    const parsed = parseLeadLineageMeta({
      schoolName: "Atlantis Jiu-Jitsu Reykjavik",
      schoolOrgId: null,
    })

    expect(parsed.schoolName).toBe("Atlantis Jiu-Jitsu Reykjavik")
    expect(parsed.schoolOrgId).toBeNull()
  })

  it("trims whitespace and treats blank strings as null", () => {
    const parsed = parseLeadLineageMeta({
      currentRank: "  Purple Belt  ",
      currentRankId: "   ",
      schoolName: "",
    })

    expect(parsed.currentRank).toBe("Purple Belt")
    expect(parsed.currentRankId).toBeNull()
    expect(parsed.schoolName).toBeNull()
  })

  it("returns all-null for non-object meta (null / array / scalar)", () => {
    const allNull = {
      currentRank: null,
      currentRankId: null,
      schoolName: null,
      schoolOrgId: null,
      trainedUnder: null,
      trainedUnderNodeId: null,
      represent: null,
      representTreeId: null,
    }

    expect(parseLeadLineageMeta(null)).toEqual(allNull)
    expect(parseLeadLineageMeta(undefined)).toEqual(allNull)
    expect(parseLeadLineageMeta(["x"])).toEqual(allNull)
    expect(parseLeadLineageMeta("string")).toEqual(allNull)
    expect(parseLeadLineageMeta(42)).toEqual(allNull)
  })

  it("ignores non-string ref values", () => {
    const parsed = parseLeadLineageMeta({ currentRankId: 123, schoolOrgId: { id: "x" } })
    expect(parsed.currentRankId).toBeNull()
    expect(parsed.schoolOrgId).toBeNull()
  })
})

describe("hasLeadLineageSelections", () => {
  const empty: ResolvedLeadLineageSelections = {
    rank: null,
    school: null,
    trainedUnder: null,
    represent: null,
  }

  it("is false when every selection is null", () => {
    expect(hasLeadLineageSelections(empty)).toBe(false)
  })

  it("is true when any selection (registered or custom) is present", () => {
    expect(
      hasLeadLineageSelections({ ...empty, rank: { kind: "custom", text: "Brown Belt" } }),
    ).toBe(true)
    expect(
      hasLeadLineageSelections({
        ...empty,
        school: { kind: "registered", name: "Combat Base", slug: "combat-base" },
      }),
    ).toBe(true)
  })
})
