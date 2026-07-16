// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import {
  exactNormalizedNameMatch,
  fuzzyMatchSchool,
  normalizeSchoolName,
  schoolNameSimilarity,
} from "./dedup"

describe("normalizeSchoolName", () => {
  it("normalizes case, punctuation, diacritics, and whitespace", () => {
    expect(normalizeSchoolName("  São Paulo Jiu-Jitsu & MMA  ")).toBe("sao paulo jiu jitsu and mma")
  })
})

describe("schoolNameSimilarity", () => {
  it("treats punctuation-only differences as the same school", () => {
    expect(schoolNameSimilarity("Combat Base Jiu-Jitsu", "combat base jiu jitsu")).toBe(1)
  })

  it("keeps unrelated schools below the match threshold", () => {
    expect(schoolNameSimilarity("Renzo Gracie Austin", "Gracie Barra Denver")).toBeLessThan(0.9)
  })
})

describe("fuzzyMatchSchool", () => {
  const candidates = [
    { id: "a", name: "Ralph Gracie Jiu-Jitsu Academy" },
    { id: "b", name: "Carlson Gracie Team" },
    { id: "c", name: "Alliance Atlanta" },
  ]

  it("returns the strongest match when it crosses the threshold", () => {
    expect(fuzzyMatchSchool("ralph gracie jiu jitsu academy", candidates)?.id).toBe("a")
  })

  it("matches small spelling differences without a heavy dependency", () => {
    expect(fuzzyMatchSchool("Carlson Gracie Teem", candidates)?.id).toBe("b")
  })

  it("returns null when no candidate is close enough", () => {
    expect(fuzzyMatchSchool("Completely Different Martial Arts", candidates)).toBeNull()
  })
})

describe("exactNormalizedNameMatch", () => {
  const candidates = [{ id: "john", name: "Prof. José Smith" }]

  it("matches only normalization-equivalent case, punctuation, whitespace, and diacritics", () => {
    expect(exactNormalizedNameMatch("  PROF jose smith  ", candidates)?.id).toBe("john")
  })

  it("keeps a near-miss spelling as a distinct identity", () => {
    expect(exactNormalizedNameMatch("Prof Jon Smith", candidates)).toBeNull()
  })

  it("keeps reordered or repeated tokens as distinct identities", () => {
    expect(exactNormalizedNameMatch("Smith Prof Jose", candidates)).toBeNull()
    expect(exactNormalizedNameMatch("Prof Jose Jose Smith", candidates)).toBeNull()
  })
})
