/**
 * Null-safety + untrusted-input tests for the promotion OG card's param normalization
 * (SESSION_0705, PL-027 renderer graduation). `/api/og` is PUBLIC — these params arrive as
 * raw query-string input, and `parsePromotionCardParams` is the ONE seam between that input
 * and the inline-styled satori render:
 *   1. legacy/empty payload URLs (title/description only) → null → the route keeps rendering
 *      the generic OgBase (the SESSION_0688 preview column stays null-safe end to end)
 *   2. a non-hex belt color NEVER reaches an inline style — accent fallback
 *   3. free-text lines are length-clamped
 *
 * Run: cd apps/web && bun run test (never a bare multi-file `bun test` — FS-0027)
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  OG_BELT_COLOR_FALLBACK,
  OG_CARD_RANK_PROMOTION,
  parsePromotionCardParams,
  safeBeltColorHex,
} from "~/components/web/og/promotion-card-params"

/** All-null loader output — what a legacy `/api/og?title=…` URL produces for these keys. */
const empty = {
  card: null,
  name: null,
  beltName: null,
  beltColorHex: null,
  date: null,
  lineageLine: null,
}

const full = {
  card: OG_CARD_RANK_PROMOTION,
  name: "Jane Doe",
  beltName: "Black Belt",
  beltColorHex: "#111111",
  date: "July 12, 2026",
  lineageLine: "Rigan Machado → Bob Bass → Jane Doe",
}

describe("parsePromotionCardParams — null-safety (legacy/empty payloads fall back to OgBase)", () => {
  it("a legacy title/description-only URL (no card param) → null", () => {
    expect(parsePromotionCardParams(empty)).toBeNull()
  })

  it("an unknown card kind → null (never a half-rendered variant)", () => {
    expect(parsePromotionCardParams({ ...full, card: "legacy-wrapped" })).toBeNull()
  })

  it("card=rank-promotion but a missing/blank name or beltName → null", () => {
    expect(parsePromotionCardParams({ ...full, name: null })).toBeNull()
    expect(parsePromotionCardParams({ ...full, name: "   " })).toBeNull()
    expect(parsePromotionCardParams({ ...full, beltName: null })).toBeNull()
    expect(parsePromotionCardParams({ ...full, beltName: "" })).toBeNull()
  })

  it("a complete URL parses to render-safe props", () => {
    expect(parsePromotionCardParams(full)).toEqual({
      name: "Jane Doe",
      beltName: "Black Belt",
      beltColor: "#111111",
      date: "July 12, 2026",
      lineageLine: "Rigan Machado → Bob Bass → Jane Doe",
    })
  })

  it("null date / lineageLine are OPTIONAL — the card renders without them", () => {
    const parsed = parsePromotionCardParams({ ...full, date: null, lineageLine: null })
    expect(parsed).toMatchObject({ name: "Jane Doe", date: null, lineageLine: null })
  })

  it("whitespace-only date / lineageLine normalize to null, not empty strings", () => {
    const parsed = parsePromotionCardParams({ ...full, date: " ", lineageLine: "  " })
    expect(parsed).toMatchObject({ date: null, lineageLine: null })
  })
})

describe("safeBeltColorHex — untrusted color input never reaches an inline style", () => {
  it("accepts #RGB / #RGBA / #RRGGBB / #RRGGBBAA", () => {
    for (const hex of ["#111", "#111a", "#111111", "#111111ff", "#A1b2C3"]) {
      expect(safeBeltColorHex(hex)).toBe(hex)
    }
  })

  it("anything else falls back to the brand accent (CSS-injection attempts included)", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "red",
      "url(javascript:alert(1))",
      "#11111", // 5 digits — not a valid hex form
      "111111", // missing #
      "#11111g",
      "hsl(1 79% 51%)", // even a well-formed non-hex color is rejected — hex or fallback
    ]) {
      expect(safeBeltColorHex(bad)).toBe(OG_BELT_COLOR_FALLBACK)
    }
  })

  it("the parse path applies the same fallback", () => {
    expect(parsePromotionCardParams({ ...full, beltColorHex: "javascript:x" })?.beltColor).toBe(
      OG_BELT_COLOR_FALLBACK,
    )
    expect(parsePromotionCardParams({ ...full, beltColorHex: null })?.beltColor).toBe(
      OG_BELT_COLOR_FALLBACK,
    )
  })
})

describe("length clamping — a crafted URL cannot blow up the render", () => {
  it("clamps name/beltName/date/lineageLine with an ellipsis", () => {
    const parsed = parsePromotionCardParams({
      card: OG_CARD_RANK_PROMOTION,
      name: "N".repeat(300),
      beltName: "B".repeat(300),
      beltColorHex: "#111111",
      date: "D".repeat(300),
      lineageLine: "L".repeat(300),
    })
    expect(parsed?.name.length).toBeLessThanOrEqual(80)
    expect(parsed?.beltName.length).toBeLessThanOrEqual(60)
    expect(parsed?.date?.length).toBeLessThanOrEqual(40)
    expect(parsed?.lineageLine?.length).toBeLessThanOrEqual(160)
    expect(parsed?.name.endsWith("…")).toBe(true)
  })

  it("values at/under the clamp ride through untouched", () => {
    expect(parsePromotionCardParams(full)?.name).toBe("Jane Doe")
  })
})
