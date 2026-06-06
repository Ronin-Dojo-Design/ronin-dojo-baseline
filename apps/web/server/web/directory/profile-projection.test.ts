// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
} from "~/lib/entitlements/lineage-tier-policy"
import type { DirectoryProfileList } from "~/server/web/directory/payloads"
import { projectDirectoryProfileListItem } from "~/server/web/directory/profile-projection"

function profileFixture(): DirectoryProfileList {
  return {
    id: "profile-1",
    slug: "brian-scott",
    visibility: "PUBLIC",
    locationCity: "Boulder",
    locationRegion: "CO",
    locationCountry: "US",
    showEmail: true,
    showPhone: true,
    showOrgs: true,
    showRanks: true,
    user: {
      id: "user-1",
      name: "Brian Scott",
      image: "https://example.com/user.jpg",
      email: "secret@example.com",
      isPlaceholder: false,
      passport: { avatarUrl: "https://example.com/passport.jpg" },
      lineageNode: {
        id: "node-1",
        isVerified: true,
        verificationStatus: "VERIFIED",
        visibility: "PUBLIC",
        claimRequests: [{ status: "APPROVED" }],
      },
      memberships: [
        {
          organization: { id: "org-1", name: "Baseline Boulder", slug: "baseline-boulder" },
          discipline: { id: "discipline-1", name: "BJJ" },
          status: "ACTIVE",
        },
      ],
      rankAwards: [
        {
          id: "rank-award-1",
          rank: {
            id: "rank-1",
            name: "Black Belt",
            sortOrder: 10,
            rankSystem: { id: "rank-system-1", name: "BJJ Belt System" },
          },
          awardedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        {
          id: "rank-award-2",
          rank: {
            id: "rank-2",
            name: "Brown Belt",
            sortOrder: 9,
            rankSystem: { id: "rank-system-1", name: "BJJ Belt System" },
          },
          awardedAt: new Date("2025-01-01T00:00:00.000Z"),
        },
      ],
    },
  }
}

describe("projectDirectoryProfileListItem", () => {
  it("redacts free public profile fields while keeping trust, avatar, and rank summary", () => {
    const projected = projectDirectoryProfileListItem({
      profile: profileFixture(),
      policy: FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
    })

    expect(projected.profileTier).toBe("free")
    expect(projected.canRenderFullProfile).toBe(false)
    expect(projected.trustStatus).toBe("verified")
    expect(projected.claimBadgeStatus).toBeNull()
    expect(projected.image).toBe("https://example.com/passport.jpg")
    expect(projected.locationCity).toBeNull()
    expect(projected.locationRegion).toBeNull()
    expect(projected.locationCountry).toBeNull()
    expect(projected.email).toBeNull()
    expect(projected.organizations).toEqual([])
    expect(projected.ranks).toHaveLength(1)
    expect(JSON.stringify(projected)).not.toContain("secret@example.com")
    expect(JSON.stringify(projected)).not.toContain("Baseline Boulder")
  })

  it("returns full allowed fields for premium profiles", () => {
    const projected = projectDirectoryProfileListItem({
      profile: profileFixture(),
      policy: PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
    })

    expect(projected.profileTier).toBe("premium")
    expect(projected.canRenderFullProfile).toBe(true)
    expect(projected.locationCity).toBe("Boulder")
    expect(projected.email).toBe("secret@example.com")
    expect(projected.organizations).toHaveLength(1)
    expect(projected.ranks).toHaveLength(2)
  })

  it("marks owner context without widening free listing-card fields", () => {
    const projected = projectDirectoryProfileListItem({
      profile: profileFixture(),
      policy: FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
      viewerUserId: "user-1",
    })

    expect(projected.profileTier).toBe("free")
    expect(projected.canRenderFullProfile).toBe(true)
    expect(projected.locationCity).toBeNull()
    expect(projected.email).toBeNull()
    expect(projected.organizations).toEqual([])
  })
})
