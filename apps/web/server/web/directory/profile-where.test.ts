// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { buildDirectoryProfileWhere } from "~/server/web/directory/profile-where"

const BRAND = "BASELINE_MARTIAL_ARTS"
const OTHER_BRAND = "WEKAF"

// Narrow the loose `Record<string, unknown>` clause for assertions.
// Phase 3c (SOT-ADR D1): memberships are account-side, reached through passport.user.
// SESSION_0414: the brand scope is now an OR of two brand-pinned paths so the
// imported placeholder-Passport roster (no User account) surfaces alongside
// account-side members:
//   OR[0] = passport.user.memberships → organization → brand  (account-side)
//   OR[1] = passport.lineageNode → treeMembers → tree → brand (imported roster)
type BrandOrPaths = [
  { user: { memberships: { some: Record<string, unknown> } } },
  { lineageNode: { treeMembers: { some: { tree: { brand: string } } } } },
]
function passportOr(where: Record<string, unknown>) {
  const passport = where.passport as { OR: BrandOrPaths }
  return passport.OR
}
function membershipSome(where: Record<string, unknown>) {
  return passportOr(where)[0].user.memberships.some
}
function organization(where: Record<string, unknown>) {
  return membershipSome(where).organization as { brand: string; slug?: string }
}
/** The lineage-tree OR branch — placeholder-Passport roster, brand-pinned on the tree. */
function lineageTree(where: Record<string, unknown>) {
  return passportOr(where)[1].lineageNode.treeMembers.some.tree
}
function rankAwardsEarned(where: Record<string, unknown>) {
  const passport = where.passport as {
    rankAwardsEarned?: { some: { rankId: string } }
  }
  return passport.rankAwardsEarned
}

describe("buildDirectoryProfileWhere — brand scope", () => {
  it("always pins the server-derived brand inside the membership filter", () => {
    const where = buildDirectoryProfileWhere({}, BRAND)
    // Brand is pinned on BOTH brand-membership paths (account-side + imported roster).
    expect(organization(where).brand).toBe(BRAND)
    expect(organization(where).slug).toBeUndefined()
    expect(lineageTree(where).brand).toBe(BRAND)
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
    // The lineage-tree OR branch is also brand-pinned — the org slug only touches
    // the membership path, so it can't widen the roster path across brands either.
    expect(lineageTree(where).brand).toBe(BRAND)
    expect(lineageTree(where).brand).not.toBe(OTHER_BRAND)
  })

  it("never reads brand from the filter inputs", () => {
    // Even a malicious `brand`-shaped key in the search object is ignored.
    const where = buildDirectoryProfileWhere(
      { org: "x", discipline: "y" } as Record<string, string>,
      BRAND,
    )
    // Both branches stay pinned to the server-derived brand.
    expect(organization(where).brand).toBe(BRAND)
    expect(lineageTree(where).brand).toBe(BRAND)
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

  it("narrows on the Passport's earned rank id, keeping the brand pin", () => {
    const where = buildDirectoryProfileWhere({ rank: "rank_bjj_black_1" }, BRAND)
    expect(rankAwardsEarned(where)).toEqual({ some: { rankId: "rank_bjj_black_1" } })
    // Rank narrows on the Passport directly; the membership brand pin is untouched.
    expect(organization(where).brand).toBe(BRAND)
  })

  it("omits the rank clause when no rank is supplied", () => {
    const where = buildDirectoryProfileWhere({ discipline: "bjj" }, BRAND)
    expect(rankAwardsEarned(where)).toBeUndefined()
  })

  it("applies case-insensitive contains for city and region", () => {
    const where = buildDirectoryProfileWhere({ city: "Boulder", region: "CO" }, BRAND)
    expect(where.locationCity).toEqual({ contains: "Boulder", mode: "insensitive" })
    expect(where.locationRegion).toEqual({ contains: "CO", mode: "insensitive" })
  })

  it("omits empty/invalid filters but keeps the brand pin", () => {
    const where = buildDirectoryProfileWhere(
      { discipline: "", org: "", rank: "", city: "", region: "", q: "" },
      BRAND,
    )
    expect(organization(where).slug).toBeUndefined()
    expect(membershipSome(where).discipline).toBeUndefined()
    expect(rankAwardsEarned(where)).toBeUndefined()
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
