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
  passportId: "passport-session-0347",
  // Phase 3c (SOT-ADR D1): identity is Passport-rooted; account is `passport.user`.
  passport: {
    id: "passport-session-0347",
    displayName: "Public Name",
    avatarUrl: "https://images.test/passport.jpg",
    // Bio Slice A (SESSION_0510 TASK_04): bio is Passport-rooted now (was node-level).
    bio: "Private biography should not render on a free card.",
    user: {
      id: "user-session-0347",
      name: "Legal Name",
      image: "https://images.test/user.jpg",
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
    directoryProfile: {
      locationCity: null,
      locationRegion: null,
      locationCountry: null,
      visibility: "PUBLIC",
      showRanks: true,
    },
    rankAwardsEarned: [
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
        awardedByPassport: null,
        // WL-P2-46: trust sources from the top non-PENDING RankEntry, not `node.isVerified`.
        rankEntry: { status: "VERIFIED" },
      },
    ],
  },
} as LineageNodeRow

describe("LineageNodeCard tier policy", () => {
  it("renders free listings with name, rank, avatar, and the verified badge (school gated; claim badge moved to drawer/directory; drawer opens for everyone)", () => {
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
    // Free cards show the single rank-derived trust badge (Verified/Unverified, WL-P2-46)...
    expect(html).toContain("Verified")
    // ...but NOT the Claim badge — claim affordance moved to the drawer + directory only (SESSION_0474).
    expect(html).not.toContain("Claimable")
    // SESSION_0474: the free tier now shows the avatar (its immediate value). The Radix AvatarImage src
    // loads client-side so it's absent from static markup — we assert the avatar BLOCK via its fallback
    // initials (present only when the avatar feature is on). School stays tier-gated.
    expect(html).toContain(">PN<")
    expect(html).not.toContain("Hidden School")
    // SESSION_0356: the drawer now opens for EVERYONE — tier gates the drawer's
    // contents (LineageProfileDetailRenderPolicy), not whether it opens. So a free
    // card's open affordance reads "Open lineage profile", not "Highlight ... path".
    expect(html).toContain("Open lineage profile")
    expect(html).not.toContain("Highlight lineage path")
  })
})
