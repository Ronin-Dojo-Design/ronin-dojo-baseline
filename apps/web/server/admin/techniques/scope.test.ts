// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { resolveTechniqueOrderBy, techniqueScopeWhere } from "./scope"

// Pure logic, no DB: `scope.ts` imports only types, so this suite never touches Prisma (FI-027).

describe("techniqueScopeWhere", () => {
  it("pending-promotion = authored ∧ published ∧ not-featured (the promote queue)", () => {
    expect(techniqueScopeWhere["pending-promotion"]).toEqual({
      authorPassportId: { not: null },
      isPublished: true,
      isFeatured: false,
    })
  })

  it("featured = isFeatured only", () => {
    expect(techniqueScopeWhere.featured).toEqual({ isFeatured: true })
  })

  it("authored = has an author Passport (any publish/feature state)", () => {
    expect(techniqueScopeWhere.authored).toEqual({ authorPassportId: { not: null } })
  })

  it("all = no extra filter (brand base applies at the query)", () => {
    expect(techniqueScopeWhere.all).toEqual({})
  })

  it("covers exactly the four scopes", () => {
    expect(Object.keys(techniqueScopeWhere).sort()).toEqual(
      ["all", "authored", "featured", "pending-promotion"].sort(),
    )
  })
})

describe("resolveTechniqueOrderBy", () => {
  it("maps an orderable header to its Prisma order", () => {
    expect(resolveTechniqueOrderBy([{ id: "name", desc: false }])).toEqual({ name: "asc" })
    expect(resolveTechniqueOrderBy([{ id: "isFeatured", desc: true }])).toEqual({
      isFeatured: "desc",
    })
    expect(resolveTechniqueOrderBy([{ id: "isPublished", desc: false }])).toEqual({
      isPublished: "asc",
    })
    expect(resolveTechniqueOrderBy([{ id: "createdAt", desc: true }])).toEqual({
      createdAt: "desc",
    })
  })

  it("falls back to createdAt desc for a computed/unknown column", () => {
    expect(resolveTechniqueOrderBy([{ id: "premiumMix", desc: true }])).toEqual({
      createdAt: "desc",
    })
    expect(resolveTechniqueOrderBy([{ id: "author", desc: false }])).toEqual({ createdAt: "desc" })
  })

  it("falls back to createdAt desc when no sort is provided", () => {
    expect(resolveTechniqueOrderBy([])).toEqual({ createdAt: "desc" })
  })
})
