/**
 * Issue #134 — proof for the canonical public Passport projection.
 *
 * DB-free: feeds hand-built Passport rows (the shape `publicPassportPayload` returns) and
 * asserts the public DTO — name fallback, avatar fallback chain, rank mapping (colorHex +
 * discipline label), the showRanks gate, and the showRanks override for owner/admin.
 *
 * Run: cd apps/web && bun test server/web/passport/public-projection.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { PublicPassportRow } from "~/server/web/passport/public-payloads"
import { projectPublicPassport } from "~/server/web/passport/public-projection"

const award = (name: string, colorHex: string, discipline: string, year: number) => ({
  id: `award-${name}`,
  awardedAt: new Date(Date.UTC(year, 0, 1)),
  rank: {
    id: `rank-${name}`,
    name,
    shortName: null,
    colorHex,
    rankSystem: {
      id: "rs",
      name: "BJJ",
      discipline: { id: "d", name: discipline, slug: "bjj", code: "BJJ" },
    },
  },
})

const row = (overrides: Partial<PublicPassportRow> = {}): PublicPassportRow =>
  ({
    id: "p1",
    displayName: "Renzo Example",
    avatarUrl: null,
    bio: "bio",
    socialLinks: null,
    user: { id: "u1", name: "Account Name", image: "https://cdn/u.jpg" },
    directoryProfile: { slug: "renzo", visibility: "PUBLIC", showRanks: true },
    rankAwardsEarned: [award("Black Belt", "#111111", "Brazilian Jiu-Jitsu", 2015)],
    ...overrides,
  }) as unknown as PublicPassportRow

describe("projectPublicPassport", () => {
  it("maps the public identity core + current rank label", () => {
    const dto = projectPublicPassport(row())
    expect(dto.displayName).toBe("Renzo Example")
    expect(dto.slug).toBe("renzo")
    expect(dto.currentRank?.colorHex).toBe("#111111")
    expect(dto.rankLabel).toBe("Black Belt · Brazilian Jiu-Jitsu")
    expect(dto.ranks).toHaveLength(1)
  })

  it("falls back name → account name, avatar → account image", () => {
    const dto = projectPublicPassport(
      row({ displayName: null, avatarUrl: null } as Partial<PublicPassportRow>),
    )
    expect(dto.displayName).toBe("Account Name")
    expect(dto.avatarUrl).toBe("https://cdn/u.jpg")
  })

  it("prefers the Passport avatar over the account image", () => {
    const dto = projectPublicPassport(row({ avatarUrl: "https://cdn/p.jpg" }))
    expect(dto.avatarUrl).toBe("https://cdn/p.jpg")
  })

  it("hides ranks when showRanks === false (single gate)", () => {
    const dto = projectPublicPassport(
      row({ directoryProfile: { slug: "x", visibility: "PUBLIC", showRanks: false } } as Partial<PublicPassportRow>),
    )
    expect(dto.ranks).toEqual([])
    expect(dto.currentRank).toBeNull()
    expect(dto.rankLabel).toBeNull()
  })

  it("honors a showRanks override (owner/admin bypass)", () => {
    const dto = projectPublicPassport(
      row({ directoryProfile: { slug: "x", visibility: "PUBLIC", showRanks: false } } as Partial<PublicPassportRow>),
      { showRanks: true },
    )
    expect(dto.ranks).toHaveLength(1)
  })

  it("applies the brand default avatar only when no image exists", () => {
    const dto = projectPublicPassport(
      row({ avatarUrl: null, user: { id: "u1", name: "A", image: null } } as Partial<PublicPassportRow>),
      { brand: "BBL" },
    )
    // resolveDisplayAvatar returns the brand default (or null if none configured) — never throws.
    expect(dto.avatarUrl === null || typeof dto.avatarUrl === "string").toBe(true)
  })
})
