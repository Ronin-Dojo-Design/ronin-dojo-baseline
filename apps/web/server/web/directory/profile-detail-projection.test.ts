// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
} from "~/lib/entitlements/lineage-tier-policy"
import type { DirectoryProfileDetail } from "~/server/web/directory/payloads"
import { projectDirectoryDetailProfile } from "~/server/web/directory/profile-projection"

/**
 * SESSION_0502 (TASK_03) — unit test for the one policy-parameterized detail projector.
 *
 * Proves the operator-ratified free/paid boundary WITHOUT the DB: a free claimed profile
 * publishes full BASIC fields (bio, organizations, full rank history) and NULLs every rich
 * field (cover/video/social/location/email) even though every field is populated in the
 * fixture; premium unlocks them; an owner viewing their own free profile bypasses the gate.
 *
 * The list-card projector (`projectDirectoryProfileListItem`) is a different surface and is
 * covered separately in `profile-projection.test.ts`.
 */

function detailFixture(): DirectoryProfileDetail {
  return {
    id: "profile-1",
    slug: "rickson-gracie",
    visibility: "PUBLIC",
    locationCity: "Los Angeles",
    locationRegion: "CA",
    locationCountry: "US",
    showEmail: true,
    showPhone: true,
    showOrgs: true,
    showRanks: true,
    coverPhotoUrl: "https://cdn.example.com/cover.jpg",
    videoIntroUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    passport: {
      id: "passport-1",
      displayName: "Rickson Gracie",
      avatarUrl: "https://cdn.example.com/avatar.jpg",
      bio: "Rickson public bio",
      socialLinks: { website: "https://example.com/rickson" },
      user: {
        id: "user-1",
        name: "Rickson Gracie",
        image: "https://cdn.example.com/user.jpg",
        email: "secret@example.com",
        memberships: [
          {
            organization: { id: "org-1", name: "Gracie Academy", slug: "gracie-academy" },
            discipline: { id: "discipline-1", name: "BJJ" },
            status: "ACTIVE",
            joinedAt: new Date("2010-01-01T00:00:00.000Z"),
          },
        ],
        techniqueProgress: [{ id: "tp-1", status: "MASTERED", verifiedById: "coach-1" }],
      },
      directoryProfile: { slug: "rickson-gracie", visibility: "PUBLIC", showRanks: true },
      lineageNode: {
        id: "node-1",
        isVerified: true,
        verificationStatus: "VERIFIED",
        visibility: "PUBLIC",
        claimRequests: [{ status: "APPROVED" }],
      },
      rankAwardsEarned: [
        {
          id: "rank-award-1",
          awardedAt: new Date("2010-01-01T00:00:00.000Z"),
          rank: {
            id: "rank-1",
            name: "Black Belt",
            shortName: "BB",
            colorHex: "#000000",
            secondaryColorHex: null,
            degree: 1,
            beltFamily: "BLACK",
            rankSystem: {
              id: "rank-system-1",
              name: "BJJ Belt System",
              discipline: { id: "discipline-1", name: "BJJ", slug: "bjj", code: "bjj" },
            },
          },
          // Trust source (WL-P2-46): the current rank's RankEntry status → "verified".
          rankEntry: { status: "VERIFIED" },
        },
        {
          id: "rank-award-2",
          awardedAt: new Date("2008-01-01T00:00:00.000Z"),
          rank: {
            id: "rank-2",
            name: "Brown Belt",
            shortName: "BR",
            colorHex: "#8B4513",
            secondaryColorHex: null,
            degree: 0,
            beltFamily: "COLORED",
            rankSystem: {
              id: "rank-system-1",
              name: "BJJ Belt System",
              discipline: { id: "discipline-1", name: "BJJ", slug: "bjj", code: "bjj" },
            },
          },
          rankEntry: { status: "VERIFIED" },
        },
      ],
    },
  } as DirectoryProfileDetail
}

describe("projectDirectoryDetailProfile", () => {
  it("publishes full BASIC fields for a free claimed profile while gating rich media", () => {
    const projected = projectDirectoryDetailProfile({
      profile: detailFixture(),
      policy: FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
    })

    expect(projected.profileTier).toBe("free")
    // canRenderFullProfile is aliased to canRenderRichMedia for the 7 component consumers.
    expect(projected.canRenderFullProfile).toBe(false)
    expect(projected.isClaimablePlaceholder).toBe(false)
    expect(projected.trustStatus).toBe("verified")

    // BASIC — always published for a claimed profile.
    expect(projected.user.bio).toBe("Rickson public bio")
    expect(projected.user.name).toBe("Rickson Gracie")
    expect(projected.user.image).toBe("https://cdn.example.com/avatar.jpg")
    expect(projected.user.organizations).toHaveLength(1)
    // Full rank history — NOT truncated to a 1-rank summary.
    expect(projected.user.ranks).toHaveLength(2)

    // RICH — gated on free even though every field is populated in the fixture.
    expect(projected.coverPhotoUrl).toBeNull()
    expect(projected.videoIntroUrl).toBeNull()
    expect(projected.locationCity).toBeNull()
    expect(projected.locationRegion).toBeNull()
    expect(projected.locationCountry).toBeNull()
    expect(projected.user.socialLinks).toBeNull()
    expect(projected.user.email).toBeNull()
    expect(projected.user.techniqueProgress).toEqual([])
    // The redacted values must not leak anywhere in the serialized object.
    expect(JSON.stringify(projected)).not.toContain("secret@example.com")
    expect(JSON.stringify(projected)).not.toContain("cover.jpg")
  })

  it("unlocks rich media for a premium profile", () => {
    const projected = projectDirectoryDetailProfile({
      profile: detailFixture(),
      policy: PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
    })

    expect(projected.profileTier).toBe("premium")
    expect(projected.canRenderFullProfile).toBe(true)

    // BASIC still present.
    expect(projected.user.bio).toBe("Rickson public bio")
    expect(projected.user.organizations).toHaveLength(1)
    expect(projected.user.ranks).toHaveLength(2)

    // RICH unlocked.
    expect(projected.coverPhotoUrl).toBe("https://cdn.example.com/cover.jpg")
    expect(projected.videoIntroUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    expect(projected.locationCity).toBe("Los Angeles")
    expect(projected.user.email).toBe("secret@example.com")
    expect(projected.user.socialLinks).toMatchObject({ website: "https://example.com/rickson" })
    expect(projected.user.techniqueProgress).toHaveLength(1)
  })

  it("gives the owner rich media on their own free profile", () => {
    const projected = projectDirectoryDetailProfile({
      profile: detailFixture(),
      policy: FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
      viewerUserId: "user-1",
    })

    expect(projected.profileTier).toBe("free")
    expect(projected.canRenderFullProfile).toBe(true)
    expect(projected.isOwnProfile).toBe(true)
    expect(projected.coverPhotoUrl).toBe("https://cdn.example.com/cover.jpg")
    expect(projected.locationCity).toBe("Los Angeles")
    expect(projected.user.email).toBe("secret@example.com")
  })

  it("gates email behind showEmail even for a premium viewer", () => {
    const profile = detailFixture()
    profile.showEmail = false

    const projected = projectDirectoryDetailProfile({
      profile,
      policy: PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
    })

    expect(projected.canRenderFullProfile).toBe(true)
    expect(projected.user.email).toBeNull()
    // The rest of the rich media is still unlocked.
    expect(projected.coverPhotoUrl).toBe("https://cdn.example.com/cover.jpg")
  })
})
