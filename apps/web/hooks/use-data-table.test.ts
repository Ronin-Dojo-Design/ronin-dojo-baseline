// @ts-expect-error — bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"
import { clearedFilterValue } from "~/hooks/use-data-table"

describe("clearedFilterValue", () => {
  it("clears a defaulted faceted filter to an explicit-empty array (the All sentinel)", () => {
    // `[]` serializes to `?status=` — a present, empty param that out-ranks the `withDefault`
    // Drafts-first default, so an explicit Clear reaches the unfiltered (All) view.
    expect(clearedFilterValue(true, true)).toEqual([])
  })

  it("clears a defaulted search filter to an explicit-empty string", () => {
    expect(clearedFilterValue(false, true)).toBe("")
  })

  it("clears a non-defaulted faceted filter to null (param removed — base-kit behavior)", () => {
    expect(clearedFilterValue(true, false)).toBeNull()
  })

  it("clears a non-defaulted search filter to null (param removed — base-kit behavior)", () => {
    expect(clearedFilterValue(false, false)).toBeNull()
  })
})
