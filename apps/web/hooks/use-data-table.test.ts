// @ts-expect-error — bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { mergeDefaultColumnFilters } from "~/hooks/use-data-table"

const draftDefault: ColumnFiltersState = [{ id: "status", value: ["Draft"] }]

describe("mergeDefaultColumnFilters", () => {
  it("restores a default facet when clear removes it", () => {
    expect(mergeDefaultColumnFilters([], draftDefault)).toEqual(draftDefault)
  })

  it("preserves an explicit replacement for the default facet", () => {
    const published = [{ id: "status", value: ["Published"] }]

    expect(mergeDefaultColumnFilters(published, draftDefault)).toBe(published)
  })

  it("preserves all selected choices as the explicit All view", () => {
    const allStatuses = [{ id: "status", value: ["Draft", "Scheduled", "Published"] }]

    expect(mergeDefaultColumnFilters(allStatuses, draftDefault)).toBe(allStatuses)
  })
})
