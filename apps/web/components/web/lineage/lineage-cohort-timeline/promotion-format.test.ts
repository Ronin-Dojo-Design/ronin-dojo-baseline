// @ts-expect-error — bun:test (no @types/bun; see docs/runbooks/sops/sop-test-writing.md §13)
import { describe, expect, it } from "bun:test"
import { formatPromotionDate, promotionYear, sortByPromotion } from "./promotion-format"

/**
 * Pure-logic unit test (SOP §1 "pure logic / lib", §15 "Keep") for the promotion
 * provenance helpers extracted from the LineageCohortTimeline single file during the
 * folder-module decomposition. No DB / no mocks — these are presentation-agnostic
 * pure functions. Proves the date-provenance contract the timeline's chronological
 * ordering + dated connector rails depend on (the lineage USP, ADR 0027).
 */

describe("promotionYear", () => {
  it("returns the UTC year for a valid ISO date", () => {
    expect(promotionYear("2009-07-08T00:00:00.000Z")).toBe("2009")
  })

  it("returns null for a null date", () => {
    expect(promotionYear(null)).toBeNull()
  })

  it("returns null for an unparseable date", () => {
    expect(promotionYear("not-a-date")).toBeNull()
  })
})

describe("formatPromotionDate", () => {
  it("formats a valid ISO date as 'Mon YYYY' in UTC", () => {
    expect(formatPromotionDate("2009-07-08T00:00:00.000Z")).toBe("Jul 2009")
  })

  it("uses UTC so a pre-midnight-UTC instant does not slip a month", () => {
    // 2009-07-01T00:00Z is July in UTC even though it is June 30 in US timezones.
    expect(formatPromotionDate("2009-07-01T00:00:00.000Z")).toBe("Jul 2009")
  })

  it("returns null for a null date", () => {
    expect(formatPromotionDate(null)).toBeNull()
  })

  it("returns null for an unparseable date", () => {
    expect(formatPromotionDate("not-a-date")).toBeNull()
  })
})

describe("sortByPromotion", () => {
  it("orders earliest promotion first", () => {
    const earlier = { promotionDate: "2005-01-01T00:00:00.000Z" }
    const later = { promotionDate: "2012-01-01T00:00:00.000Z" }
    expect(sortByPromotion(earlier, later)).toBeLessThan(0)
    expect(sortByPromotion(later, earlier)).toBeGreaterThan(0)
  })

  it("sorts undated members last (after any dated member)", () => {
    const dated = { promotionDate: "2005-01-01T00:00:00.000Z" }
    const undated = { promotionDate: null }
    expect(sortByPromotion(dated, undated)).toBeLessThan(0)
    expect(sortByPromotion(undated, dated)).toBeGreaterThan(0)
  })

  it("keeps multiple undated members in input order (the undated tie is a no-swap)", () => {
    // Two undated members compare as NaN (Infinity − Infinity); Array.sort treats a
    // NaN comparator result as no-reorder, so undated members hold their input order.
    const rows: { id: string; promotionDate: string | null }[] = [
      { id: "a", promotionDate: null },
      { id: "b", promotionDate: null },
    ]
    expect([...rows].sort(sortByPromotion).map(row => row.id)).toEqual(["a", "b"])
  })

  it("sorts a mixed list chronologically with undated last", () => {
    const rows = [
      { promotionDate: null },
      { promotionDate: "2012-01-01T00:00:00.000Z" },
      { promotionDate: "2005-01-01T00:00:00.000Z" },
    ]
    const years = [...rows].sort(sortByPromotion).map(row => promotionYear(row.promotionDate))
    expect(years).toEqual(["2005", "2012", null])
  })
})
