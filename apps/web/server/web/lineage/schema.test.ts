// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import {
  LINEAGE_DEFAULT_PER_PAGE,
  LINEAGE_MAX_PER_PAGE,
  lineageFilterParamsCache,
  normalizeLineageSearchParams,
} from "~/server/web/lineage/schema"

describe("lineageFilterParamsCache", () => {
  it("parses default URL params", () => {
    expect(lineageFilterParamsCache.parse({})).toEqual({
      q: "",
      sort: "name.asc",
      page: 1,
      perPage: LINEAGE_DEFAULT_PER_PAGE,
      discipline: "",
      organization: "",
    })
  })

  it("parses q, page, perPage, discipline, organization, and sort from strings", () => {
    expect(
      lineageFilterParamsCache.parse({
        q: "karate",
        page: "2",
        perPage: "12",
        sort: "updatedAt.desc",
        discipline: "shotokan",
        organization: "honbu",
      }),
    ).toEqual({
      q: "karate",
      sort: "updatedAt.desc",
      page: 2,
      perPage: 12,
      discipline: "shotokan",
      organization: "honbu",
    })
  })
})

describe("normalizeLineageSearchParams", () => {
  it("trims whitespace-only q to empty", () => {
    const result = normalizeLineageSearchParams({
      q: "   ",
      sort: "name.asc",
      page: 1,
      perPage: 24,
      discipline: "",
      organization: "",
    })

    expect(result.q).toBe("")
  })

  it("normalizes invalid and oversized numeric bounds", () => {
    const result = normalizeLineageSearchParams({
      q: "",
      sort: "name.asc",
      page: -4,
      perPage: LINEAGE_MAX_PER_PAGE + 1,
      discipline: "",
      organization: "",
    })
    const zeroPerPage = normalizeLineageSearchParams({
      q: "",
      sort: "name.asc",
      page: 1,
      perPage: 0,
      discipline: "",
      organization: "",
    })

    expect(result.page).toBe(1)
    expect(result.perPage).toBe(LINEAGE_MAX_PER_PAGE)
    expect(zeroPerPage.perPage).toBe(LINEAGE_DEFAULT_PER_PAGE)
  })
})
