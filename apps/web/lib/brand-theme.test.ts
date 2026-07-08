/**
 * brand-theme HSL-triplet helpers (WL-P2-36) — pure, total parse/format table.
 *
 * The color picker (`components/web/forms/color-field.tsx`) stores/reads the same
 * space-separated triplet form the CSS-injection path consumes (`"234 98% 61%"`).
 * `parseHslTriplet` must be strict (malformed → null, never throw); `formatHslTriplet`
 * must round to integers and always emit an `isHslSafe` string. The round-trip
 * `parse∘format` must be stable so a picker drag doesn't drift the value.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { formatHslTriplet, type HslColor, isHslSafe, parseHslTriplet } from "~/lib/brand-theme"

describe("parseHslTriplet", () => {
  const VALID: Array<[label: string, input: string, expected: HslColor]> = [
    ["basic triplet", "234 98% 61%", { h: 234, s: 98, l: 61 }],
    ["zeros", "0 0% 0%", { h: 0, s: 0, l: 0 }],
    ["leading/trailing whitespace", "  120 50% 40%  ", { h: 120, s: 50, l: 40 }],
    ["decimals", "234.5 98.2% 61.7%", { h: 234.5, s: 98.2, l: 61.7 }],
  ]

  for (const [label, input, expected] of VALID) {
    it(`parses ${label}`, () => {
      expect(parseHslTriplet(input)).toEqual(expected)
    })
  }

  const NULLISH: Array<[label: string, input: string]> = [
    ["empty string", ""],
    ["whitespace only", "   "],
    ["missing percent signs", "234 98 61"],
    ["hsl() wrapper", "hsl(234 98% 61%)"],
    ["hex value", "#3b5bfd"],
    ["comma-separated", "234, 98%, 61%"],
    ["too few components", "234 98%"],
    ["too many components", "234 98% 61% 1%"],
    ["trailing garbage", "234 98% 61% x"],
    ["negative hue", "-10 50% 50%"],
  ]

  for (const [label, input] of NULLISH) {
    it(`returns null for ${label}`, () => {
      expect(parseHslTriplet(input)).toBeNull()
    })
  }
})

describe("formatHslTriplet", () => {
  it("formats integer components verbatim", () => {
    expect(formatHslTriplet({ h: 234, s: 98, l: 61 })).toBe("234 98% 61%")
  })

  it("rounds fractional components to integers", () => {
    expect(formatHslTriplet({ h: 234.4, s: 98.6, l: 61.5 })).toBe("234 99% 62%")
  })

  it("output always passes isHslSafe", () => {
    expect(isHslSafe(formatHslTriplet({ h: 234.4, s: 98.6, l: 61.5 }))).toBe(true)
    expect(isHslSafe(formatHslTriplet({ h: 0, s: 0, l: 0 }))).toBe(true)
    expect(isHslSafe(formatHslTriplet({ h: 359, s: 100, l: 50 }))).toBe(true)
  })
})

describe("round-trip parse ∘ format", () => {
  const TRIPLETS = ["234 98% 61%", "0 0% 0%", "359 100% 50%", "120 50% 40%"]

  for (const triplet of TRIPLETS) {
    it(`is stable for ${triplet}`, () => {
      const parsed = parseHslTriplet(triplet)
      expect(parsed).not.toBeNull()
      expect(formatHslTriplet(parsed as HslColor)).toBe(triplet)
    })
  }

  it("normalizes a decimal input through one round-trip", () => {
    const parsed = parseHslTriplet("234.4 98.6% 61.5%")
    expect(parsed).not.toBeNull()
    const formatted = formatHslTriplet(parsed as HslColor)
    expect(formatted).toBe("234 99% 62%")
    // Re-parsing the normalized value is a fixed point.
    expect(formatHslTriplet(parseHslTriplet(formatted) as HslColor)).toBe(formatted)
  })
})
