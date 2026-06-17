// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { buildPublishedLineageTreeWhere } from "~/server/web/lineage/tree-where"

const BRAND = "BASELINE_MARTIAL_ARTS"
const OTHER_BRAND = "WEKAF"

describe("buildPublishedLineageTreeWhere — published/brand/visibility scope", () => {
  it("always pins the server-derived brand, isPublished, and PUBLIC visibility", () => {
    const where = buildPublishedLineageTreeWhere({}, BRAND)
    expect(where.brand).toBe(BRAND)
    expect(where.isPublished).toBe(true)
    expect(where.visibility).toEqual({ in: ["PUBLIC"] })
  })

  it("never reads brand from the filter inputs", () => {
    const where = buildPublishedLineageTreeWhere(
      { discipline: "x", organization: "y" } as Record<string, string>,
      BRAND,
    )
    expect(where.brand).toBe(BRAND)
    expect(where.brand).not.toBe(OTHER_BRAND)
  })

  it("never exposes non-PUBLIC trees to any caller", () => {
    const where = buildPublishedLineageTreeWhere({ kind: "PERSON" }, BRAND)
    expect(JSON.stringify(where.visibility)).not.toContain("MEMBERS_ONLY")
    expect(JSON.stringify(where.visibility)).not.toContain("HIDDEN")
    expect(where.isPublished).toBe(true)
  })
})

describe("buildPublishedLineageTreeWhere — kind (scopeType) facet", () => {
  it("adds a scopeType clause for a valid kind, keeping the brand pin", () => {
    const where = buildPublishedLineageTreeWhere({ kind: "STYLE" }, BRAND)
    expect(where.scopeType).toBe("STYLE")
    expect(where.brand).toBe(BRAND)
  })

  it("accepts every LineageTreeScopeType enum value", () => {
    for (const kind of ["BRAND", "ORGANIZATION", "DISCIPLINE", "STYLE", "PERSON", "CUSTOM"]) {
      expect(buildPublishedLineageTreeWhere({ kind }, BRAND).scopeType).toBe(kind)
    }
  })

  it("omits the scopeType clause when kind is empty", () => {
    const where = buildPublishedLineageTreeWhere({ kind: "" }, BRAND)
    expect(where.scopeType).toBeUndefined()
  })

  it("ignores a bogus kind rather than passing garbage to Prisma", () => {
    const where = buildPublishedLineageTreeWhere({ kind: "NOT_A_REAL_SCOPE" }, BRAND)
    expect(where.scopeType).toBeUndefined()
    // The brand/publish scope still stands — a junk kind can only narrow, never widen.
    expect(where.brand).toBe(BRAND)
    expect(where.isPublished).toBe(true)
  })
})

describe("buildPublishedLineageTreeWhere — discipline/org narrowing", () => {
  it("adds discipline + organization as slug matches", () => {
    const where = buildPublishedLineageTreeWhere(
      { discipline: "bjj", organization: "gracie-academy" },
      BRAND,
    )
    expect(where.discipline).toEqual({ slug: "bjj" })
    expect(where.organization).toEqual({ slug: "gracie-academy" })
  })

  it("omits empty filters but keeps the brand pin", () => {
    const where = buildPublishedLineageTreeWhere(
      { q: "", discipline: "", organization: "", kind: "" },
      BRAND,
    )
    expect(where.discipline).toBeUndefined()
    expect(where.organization).toBeUndefined()
    expect(where.scopeType).toBeUndefined()
    expect(where.OR).toBeUndefined()
    expect(where.brand).toBe(BRAND)
  })

  it("trims whitespace-only filter values to omitted clauses", () => {
    const where = buildPublishedLineageTreeWhere(
      { discipline: "  ", organization: "  ", kind: "  " },
      BRAND,
    )
    expect(where.discipline).toBeUndefined()
    expect(where.organization).toBeUndefined()
    expect(where.scopeType).toBeUndefined()
  })
})

describe("buildPublishedLineageTreeWhere — free-text search", () => {
  it("builds an OR across name + description + discipline/org names", () => {
    const where = buildPublishedLineageTreeWhere({ q: "gracie" }, BRAND)
    expect(where.OR).toEqual([
      { name: { contains: "gracie", mode: "insensitive" } },
      { description: { contains: "gracie", mode: "insensitive" } },
      { discipline: { name: { contains: "gracie", mode: "insensitive" } } },
      { organization: { name: { contains: "gracie", mode: "insensitive" } } },
    ])
  })

  it("omits the OR when q is whitespace-only", () => {
    const where = buildPublishedLineageTreeWhere({ q: "   " }, BRAND)
    expect(where.OR).toBeUndefined()
  })
})
