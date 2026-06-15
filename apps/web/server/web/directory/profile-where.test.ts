// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { buildDirectoryProfileWhere } from "~/server/web/directory/profile-where"

const BRAND = "BASELINE_MARTIAL_ARTS"
const OTHER_BRAND = "WEKAF"

// Narrow the loose `Record<string, unknown>` clause for assertions.
// Phase 3c (SOT-ADR D1): memberships are account-side, reached through passport.user.
function membershipSome(where: Record<string, unknown>) {
  const passport = where.passport as {
    user: { memberships: { some: Record<string, unknown> } }
  }
  return passport.user.memberships.some
}
function organization(where: Record<string, unknown>) {
  return membershipSome(where).organization as { brand: string; slug?: string }
}

describe("buildDirectoryProfileWhere — brand scope", () => {
  it("always pins the server-derived brand inside the membership filter", () => {
    const where = buildDirectoryProfileWhere({}, BRAND)
    expect(organization(where).brand).toBe(BRAND)
    expect(organization(where).slug).toBeUndefined()
  })

  it("ANDs an org slug WITHIN the brand — a cross-brand slug cannot widen results", () => {
    // An attacker supplies a slug that belongs to another brand via the URL.
    const where = buildDirectoryProfileWhere({ org: "wekaf-only-school" }, BRAND)
    const org = organization(where)
    // brand stays the server-derived brand; the slug only narrows within it.
    expect(org.brand).toBe(BRAND)
    expect(org.slug).toBe("wekaf-only-school")
    // The resulting clause is `{ brand: BASELINE, slug: wekaf-only-school }` which
    // matches no organization across brands → zero results, never a cross-brand leak.
    expect(org.brand).not.toBe(OTHER_BRAND)
  })

  it("never reads brand from the filter inputs", () => {
    // Even a malicious `brand`-shaped key in the search object is ignored.
    const where = buildDirectoryProfileWhere(
      { org: "x", discipline: "y" } as Record<string, string>,
      BRAND,
    )
    expect(organization(where).brand).toBe(BRAND)
  })
})

describe("buildDirectoryProfileWhere — visibility", () => {
  it("restricts anonymous viewers to PUBLIC only", () => {
    const where = buildDirectoryProfileWhere({}, BRAND)
    expect(where.visibility).toEqual({ in: ["PUBLIC"] })
  })

  it("widens authenticated viewers to PUBLIC + MEMBERS_ONLY", () => {
    const where = buildDirectoryProfileWhere({}, BRAND, "viewer-1")
    expect(where.visibility).toEqual({ in: ["PUBLIC", "MEMBERS_ONLY"] })
  })

  it("never exposes HIDDEN profiles to any viewer", () => {
    const anon = buildDirectoryProfileWhere({}, BRAND)
    const authed = buildDirectoryProfileWhere({}, BRAND, "viewer-1")
    expect(JSON.stringify(anon)).not.toContain("HIDDEN")
    expect(JSON.stringify(authed)).not.toContain("HIDDEN")
  })
})

describe("buildDirectoryProfileWhere — filter narrowing", () => {
  it("adds discipline as a slug match inside the brand-scoped membership", () => {
    const where = buildDirectoryProfileWhere({ discipline: "bjj" }, BRAND)
    expect(membershipSome(where).discipline).toEqual({ slug: "bjj" })
    expect(organization(where).brand).toBe(BRAND)
  })

  it("applies case-insensitive contains for city and region", () => {
    const where = buildDirectoryProfileWhere({ city: "Boulder", region: "CO" }, BRAND)
    expect(where.locationCity).toEqual({ contains: "Boulder", mode: "insensitive" })
    expect(where.locationRegion).toEqual({ contains: "CO", mode: "insensitive" })
  })

  it("omits empty/invalid filters but keeps the brand pin", () => {
    const where = buildDirectoryProfileWhere(
      { discipline: "", org: "", city: "", region: "", q: "" },
      BRAND,
    )
    expect(organization(where).slug).toBeUndefined()
    expect(membershipSome(where).discipline).toBeUndefined()
    expect(where.locationCity).toBeUndefined()
    expect(where.locationRegion).toBeUndefined()
    expect(where.OR).toBeUndefined()
    expect(organization(where).brand).toBe(BRAND)
  })

  it("builds a free-text OR across name + location without leaking private fields", () => {
    const where = buildDirectoryProfileWhere({ q: "smith" }, BRAND)
    expect(where.OR).toEqual([
      { passport: { displayName: { contains: "smith", mode: "insensitive" } } },
      { passport: { user: { name: { contains: "smith", mode: "insensitive" } } } },
      { locationCity: { contains: "smith", mode: "insensitive" } },
      { locationRegion: { contains: "smith", mode: "insensitive" } },
    ])
    // q search must never reach email or other private columns.
    expect(JSON.stringify(where.OR)).not.toContain("email")
  })
})
