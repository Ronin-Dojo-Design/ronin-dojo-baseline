import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import { deriveDrawerProfileView, formatDate } from "./use-drawer-profile"

// Colocated test (SESSION_0737 / D-062): `deriveDrawerProfileView` was the drawer's only untested pure
// projector — the crap³ metric artifact fallow flagged. Exercising it here also covers the now
// module-private `rankProgressPercent` (through `panelRankProgress`).

const BJJ_LADDER = [
  {
    id: "r-white",
    sortOrder: 1,
    name: "White Belt",
    shortName: "White",
    colorHex: "#ffffff",
    beltFamily: "COLORED",
  },
  {
    id: "r-blue",
    sortOrder: 2,
    name: "Blue Belt",
    shortName: "Blue",
    colorHex: "#1d4ed8",
    beltFamily: "COLORED",
  },
  {
    id: "r-black",
    sortOrder: 3,
    name: "Black Belt",
    shortName: "Black",
    colorHex: "#0f172a",
    beltFamily: "BLACK",
  },
] as const

function makeProfile(opts: {
  displayName?: string | null
  avatarUrl?: string | null
  userImage?: string | null
  /** false => accountless placeholder (`passport.user === null`). */
  hasAccount?: boolean
  membershipOrg?: string | null
  /** which ladder rank the member holds (default: black = top). */
  rankId?: string
  entryStatus?: string
}): LineageNodeProfile {
  const hasAccount = opts.hasAccount ?? true
  const rank = BJJ_LADDER.find(r => r.id === (opts.rankId ?? "r-black"))!
  return {
    isVerified: true,
    verificationStatus: "VERIFIED",
    relationshipsTo: [],
    claimRequests: [],
    passport: {
      displayName: opts.displayName ?? null,
      avatarUrl: opts.avatarUrl ?? null,
      user: hasAccount
        ? {
            name: null,
            image: opts.userImage ?? null,
            memberships: opts.membershipOrg
              ? [{ organization: { id: "org-1", name: opts.membershipOrg } }]
              : [],
          }
        : null,
      rankEntries: [
        {
          status: opts.entryStatus ?? "VERIFIED",
          rank: {
            id: rank.id,
            name: rank.name,
            shortName: rank.shortName,
            colorHex: rank.colorHex,
            sortOrder: rank.sortOrder,
            beltFamily: rank.beltFamily,
            rankSystem: {
              id: "sys-bjj",
              name: "IBJJF Belt System",
              discipline: { id: "disc-bjj", name: "Brazilian Jiu-Jitsu", slug: "bjj", code: "BJJ" },
              ranks: BJJ_LADDER,
            },
          },
        },
      ],
    },
    // Only the fields deriveDrawerProfileView reads are populated; the rest of the wide
    // LineageNodeProfile payload is intentionally omitted (matches the sibling rank-progression test).
  } as unknown as LineageNodeProfile
}

describe("deriveDrawerProfileView", () => {
  test("projects a claimed member's shown rank, avatar, membership + progress", () => {
    const view = deriveDrawerProfileView(
      makeProfile({
        displayName: "Alice Silva",
        avatarUrl: "https://cdn.example/a.jpg",
        userImage: "https://cdn.example/u.jpg",
        membershipOrg: "Gracie Barra",
        rankId: "r-black",
      }),
    )
    assert.equal(view.displayName, "Alice Silva")
    // passport.avatarUrl wins over user.image
    assert.equal(view.avatarSrc, "https://cdn.example/a.jpg")
    assert.equal(view.headerRankName, "Black Belt")
    assert.equal(view.panelRankColor, "#0f172a")
    assert.equal(view.headerDisciplineName, "Brazilian Jiu-Jitsu")
    assert.equal(view.latestMembership?.organization.name, "Gracie Barra")
    // black is the 3rd of 3 ladder ranks => 100%
    assert.equal(view.panelRankProgress, 100)
    // a VERIFIED RankEntry resolves the trust axis to "verified" (ADR 0035 / LR 0008)
    assert.equal(view.trustStatus, "verified")
  })

  test("avatar falls back to user.image when the passport has no avatarUrl", () => {
    const view = deriveDrawerProfileView(
      makeProfile({ displayName: "Bob", avatarUrl: null, userImage: "https://cdn.example/u.jpg" }),
    )
    assert.equal(view.avatarSrc, "https://cdn.example/u.jpg")
  })

  test("accountless placeholder => Unnamed fallback + null membership", () => {
    const view = deriveDrawerProfileView(makeProfile({ displayName: null, hasAccount: false }))
    assert.equal(view.displayName, "Unnamed")
    assert.equal(view.latestMembership, null)
  })

  test("a mid-ladder rank yields a proportional progress percent", () => {
    const view = deriveDrawerProfileView(makeProfile({ rankId: "r-blue" }))
    // blue is the 2nd of 3 ladder ranks => round(2/3 * 100) = 67
    assert.equal(view.panelRankProgress, 67)
  })
})

describe("formatDate", () => {
  test("formats a date in UTC (never off-by-one near midnight)", () => {
    assert.equal(formatDate("2024-06-01T00:00:00Z"), "Jun 1, 2024")
  })

  test("returns null for nullish or unparseable input", () => {
    assert.equal(formatDate(null), null)
    assert.equal(formatDate(undefined), null)
    assert.equal(formatDate("not-a-date"), null)
  })
})
