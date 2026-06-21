// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { type DirectoryRosterProjection, mapToRosterCard } from "~/lib/m-card/map-roster"

/**
 * Representative `projectDirectoryProfileListItem` output — already projected + already gated.
 * Public surface, full-render policy: name, avatar, top rank (belt colorHex), location, org,
 * trust/claim, premium tier badge. Crucially this also carries the projection's `email` field
 * (here `null`, as the public projection redacts it) to prove the card mapper never forwards it.
 */
function rosterProjectionFixture(
  overrides: Partial<DirectoryRosterProjection> = {},
): DirectoryRosterProjection {
  return {
    id: "dp_1",
    passportId: "pp_1",
    slug: "rickson-gracie",
    userId: "u_1",
    name: "Rickson Gracie",
    profileTier: "premium",
    canRenderFullProfile: true,
    trustStatus: "verified",
    claimBadgeStatus: null,
    image: "https://cdn.example.com/rickson.png",
    locationCity: "Los Angeles",
    locationRegion: "CA",
    locationCountry: "USA",
    email: null,
    organizations: [
      { id: "org_1", name: "Gracie Academy", slug: "gracie-academy", discipline: null },
    ],
    ranks: [
      {
        id: "ra_1",
        awardedAt: new Date("2010-01-01"),
        rank: {
          id: "rk_1",
          name: "Black Belt",
          sortOrder: 100,
          colorHex: "#1a1a1a",
          rankSystem: { id: "rs_1", name: "BJJ Belts" },
        },
      },
    ],
    ...overrides,
  } as DirectoryRosterProjection
}

/** Fields a public roster card must NEVER carry — redaction lives upstream, not in the card. */
const FORBIDDEN_FIELDS = [
  "email",
  "phone",
  "legalName",
  "dob",
  "dateOfBirth",
  "emergencyContact",
  "userId",
  "passportId",
]

describe("mapToRosterCard", () => {
  it("maps the projected list item onto the roster card shape", () => {
    const card = mapToRosterCard(rosterProjectionFixture())

    expect(card).toEqual({
      id: "dp_1",
      name: "Rickson Gracie",
      avatarUrl: "https://cdn.example.com/rickson.png",
      rank: { name: "Black Belt", colorHex: "#1a1a1a", disciplineCode: null },
      eyebrow: null,
      schoolLabel: "Gracie Academy",
      locationLine: "Los Angeles, CA",
      trustStatus: "verified",
      claimStatus: null,
      badges: [{ label: "Premium", variant: "outline" }],
    })
  })

  it("carries the data-driven belt tint (Rank.colorHex) through to the card", () => {
    const card = mapToRosterCard(rosterProjectionFixture())
    expect(card.rank?.colorHex).toBe("#1a1a1a")
  })

  it("does NOT leak any non-public field from the projection into the card", () => {
    const card = mapToRosterCard(rosterProjectionFixture())
    const keys = Object.keys(card)
    for (const forbidden of FORBIDDEN_FIELDS) {
      expect(keys).not.toContain(forbidden)
    }
    // Even a serialized dump must not contain the redacted email value path.
    expect(JSON.stringify(card)).not.toContain("email")
  })

  it("emits no rank and no tier badge for a free profile with hidden ranks", () => {
    // Mirrors the projection gating ranks to [] when showRanks is false.
    const card = mapToRosterCard(rosterProjectionFixture({ profileTier: "free", ranks: [] }))
    expect(card.rank).toBeNull()
    expect(card.badges).toEqual([])
  })

  it("falls back to 'Anonymous' and null location when the projection omits them", () => {
    const card = mapToRosterCard(
      rosterProjectionFixture({
        name: null,
        locationCity: null,
        locationRegion: null,
        locationCountry: null,
      }),
    )
    expect(card.name).toBe("Anonymous")
    expect(card.locationLine).toBeNull()
  })
})
