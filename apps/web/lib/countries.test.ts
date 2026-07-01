// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { COUNTRIES, countryFlagEmoji, getCountryLabel } from "./countries"

describe("COUNTRIES (static ISO 3166-1 alpha-2 list)", () => {
  it("stores alpha-2 codes (exactly two uppercase letters)", () => {
    for (const country of COUNTRIES) {
      expect(country.code).toMatch(/^[A-Z]{2}$/)
    }
  })
  it("has no duplicate codes", () => {
    const codes = COUNTRIES.map(c => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe("getCountryLabel", () => {
  it("resolves a known code to its name", () => {
    expect(getCountryLabel("BR")).toBe("Brazil")
    expect(getCountryLabel("us")).toBe("United States")
  })
  it("returns the upper-cased code for an unknown value and empty for nullish", () => {
    expect(getCountryLabel("ZZ")).toBe("ZZ")
    expect(getCountryLabel("")).toBe("")
    expect(getCountryLabel(null)).toBe("")
    expect(getCountryLabel(undefined)).toBe("")
  })
})

describe("countryFlagEmoji (Regional Indicator transform)", () => {
  it("builds the flag from the two alpha-2 codepoints", () => {
    // 🇧🇷 = U+1F1E7 U+1F1F7
    expect(countryFlagEmoji("BR")).toBe("\u{1F1E7}\u{1F1F7}")
    expect(countryFlagEmoji("us")).toBe("\u{1F1FA}\u{1F1F8}")
  })
  it("returns empty string for malformed / nullish codes", () => {
    expect(countryFlagEmoji("USA")).toBe("")
    expect(countryFlagEmoji("1")).toBe("")
    expect(countryFlagEmoji("")).toBe("")
    expect(countryFlagEmoji(null)).toBe("")
  })
})
