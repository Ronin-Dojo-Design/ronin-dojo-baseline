// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { FREE_LINEAGE_LISTING_RENDER_POLICY } from "~/lib/entitlements/lineage-tier-policy"
import type { LineageNodeRow } from "~/server/web/lineage/payloads"
import { LineageNodeCard } from "./lineage-node-card"

const node = {
  id: "node-session-0347",
  slug: "node-session-0347",
  visibility: "PUBLIC",
  isVerified: true,
  verificationStatus: "VERIFIED",
  bio: "Private biography should not render on a free card.",
  userId: "user-session-0347",
  user: {
    id: "user-session-0347",
    name: "Legal Name",
    image: "https://images.test/user.jpg",
    passport: {
      displayName: "Public Name",
      avatarUrl: "https://images.test/passport.jpg",
    },
    directoryProfile: {
      locationCity: null,
      locationRegion: null,
      locationCountry: null,
      visibility: "PUBLIC",
      showRanks: true,
    },
    rankAwards: [
      {
        id: "rank-award-session-0347",
        awardedAt: new Date("2026-01-01T00:00:00.000Z"),
        location: null,
        rank: {
          id: "rank-session-0347",
          name: "Black Belt",
          shortName: "BB",
          colorHex: "#111111",
          sortOrder: 10,
          rankSystem: {
            id: "rank-system-session-0347",
            name: "BJJ",
            discipline: {
              id: "discipline-session-0347",
              name: "Brazilian Jiu-Jitsu",
              slug: "bjj",
              code: "bjj",
            },
          },
        },
        awardedBy: {
          id: "promoter-session-0347",
          name: "Promoter",
          image: null,
        },
      },
    ],
    memberships: [
      {
        id: "membership-session-0347",
        discipline: {
          id: "discipline-session-0347",
          name: "Brazilian Jiu-Jitsu",
          slug: "bjj",
        },
        organization: {
          id: "org-session-0347",
          name: "Hidden School",
          slug: "hidden-school",
          city: "Denver",
          state: "CO",
        },
      },
    ],
  },
} as LineageNodeRow

describe("LineageNodeCard tier policy", () => {
  it("renders free listings as name and rank only", () => {
    const html = renderToStaticMarkup(
      <LineageNodeCard
        node={node}
        isClaimable
        onSelect={() => {}}
        showActions={false}
        renderPolicy={FREE_LINEAGE_LISTING_RENDER_POLICY}
      />,
    )

    expect(html).toContain("Public Name")
    expect(html).toContain("Black Belt")
    expect(html).not.toContain("https://images.test/passport.jpg")
    expect(html).not.toContain("Hidden School")
    expect(html).not.toContain("Verified")
    expect(html).not.toContain("Claimable")
    expect(html).not.toContain("Open lineage profile")
    expect(html).toContain("Highlight lineage path")
  })
})
