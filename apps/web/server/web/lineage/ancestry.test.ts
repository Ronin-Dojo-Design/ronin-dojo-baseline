/**
 * SESSION_0493 TASK_05 — assembleAncestryEntries (pure projection, no DB).
 *
 * Run: cd apps/web && bun run test server/web/lineage/ancestry.test.ts
 *
 * Author: Cody / SESSION_0493 TASK_05.
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { assembleAncestryEntries } from "~/server/web/lineage/ancestry"
import type { LineageNodeRow } from "~/server/web/lineage/payloads"

/**
 * Minimal LineageNodeRow-shaped fixture. The full payload type carries many fields the
 * assembly never reads (claimRequests, memberships, affiliations…) — cast per the
 * established pure-projection test idiom (tree-where.test.ts).
 */
const makeNode = ({
  id,
  displayName,
  avatarUrl = null,
  userImage = null,
  showRanks = true,
  awards = [],
}: {
  id: string
  displayName: string
  avatarUrl?: string | null
  userImage?: string | null
  showRanks?: boolean
  awards?: Array<{
    rankId: string
    name: string
    colorHex: string | null
    sortOrder: number
    disciplineName?: string | null
  }>
}): LineageNodeRow =>
  ({
    id,
    slug: `${id}-slug`,
    visibility: "PUBLIC",
    isVerified: true,
    verificationStatus: "VERIFIED",
    bio: null,
    passportId: `${id}-passport`,
    claimRequests: [],
    relationshipsTo: [],
    passport: {
      id: `${id}-passport`,
      displayName,
      avatarUrl,
      bio: null,
      socialLinks: null,
      directoryProfile: { slug: `${id}-dir`, visibility: "PUBLIC", showRanks },
      user: userImage ? { id: `${id}-user`, name: displayName, image: userImage } : null,
      // Pre-ordered highest-first, mirroring the payload's orderBy.
      rankAwardsEarned: awards.map((award, index) => ({
        id: `${id}-award-${index}`,
        awardedAt: new Date("2020-01-01"),
        location: null,
        awardedBy: null,
        awardedByPassport: null,
        rank: {
          id: award.rankId,
          name: award.name,
          shortName: null,
          colorHex: award.colorHex,
          sortOrder: award.sortOrder,
          rankSystem: {
            id: "rs-1",
            name: "BJJ Adult",
            discipline: {
              id: "d-1",
              name: award.disciplineName ?? "Brazilian Jiu-Jitsu",
              slug: "bjj",
              code: "BJJ",
            },
          },
        },
      })),
      affiliations: [],
    },
  }) as unknown as LineageNodeRow

const BLACK = { rankId: "r-black", name: "Black Belt", colorHex: "#111111", sortOrder: 9 }
const CORAL = { rankId: "r-coral", name: "Coral Belt", colorHex: "#e63946", sortOrder: 11 }

describe("assembleAncestryEntries — ordering + owner contract", () => {
  it("returns [founder … member] with the member LAST, from a member-up walk", () => {
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Tony Hua", awards: [BLACK] })],
      ["instructor", makeNode({ id: "instructor", displayName: "Bob Bass", awards: [BLACK] })],
      ["founder", makeNode({ id: "founder", displayName: "Rigan Machado", awards: [CORAL] })],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: "Promoted to black belt in 2019." },
        { nodeId: "instructor", narrative: null },
        { nodeId: "founder", narrative: null },
      ],
      nodes,
    )

    expect(entries.map(e => e.displayName)).toEqual(["Rigan Machado", "Bob Bass", "Tony Hua"])
    // The owner (member) is the LAST entry by contract.
    expect(entries[entries.length - 1].nodeId).toBe("member")
  })

  it("keeps the narrative attached to the STUDENT side of each edge", () => {
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Student" })],
      ["instructor", makeNode({ id: "instructor", displayName: "Instructor" })],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: "Awarded under the founder's supervision." },
        { nodeId: "instructor", narrative: null },
      ],
      nodes,
    )

    // Founder-first order: the instructor (no edge above) carries null; the member
    // carries the caption for the edge UP to its instructor.
    expect(entries[0].narrative).toBeNull()
    expect(entries[1].narrative).toBe("Awarded under the founder's supervision.")
  })
})

describe("assembleAncestryEntries — rank projection (ADR 0035 awarded truth)", () => {
  it("projects the top awarded rank + discipline label, degree seam = null", () => {
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Member", awards: [CORAL, BLACK] })],
      ["instructor", makeNode({ id: "instructor", displayName: "Instructor", awards: [] })],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "instructor", narrative: null },
      ],
      nodes,
    )

    const member = entries[1]
    expect(member.rank?.name).toBe("Coral Belt")
    expect(member.rank?.colorHex).toBe("#e63946")
    expect(member.rank?.sortOrder).toBe(11)
    // TODO(SESSION_0493_TASK_01) seam — null until Rank.degree lands.
    expect(member.rank?.degree).toBeNull()
    expect(member.disciplineLabel).toBe("Brazilian Jiu-Jitsu")

    // No awards → no rank, no discipline label (no fabricated belt).
    expect(entries[0].rank).toBeNull()
    expect(entries[0].disciplineLabel).toBeNull()
  })

  it("withholds the rank when showRanks === false (SESSION_0266 redaction idiom)", () => {
    const nodes = new Map([
      [
        "member",
        makeNode({
          id: "member",
          displayName: "Private Member",
          showRanks: false,
          awards: [BLACK],
        }),
      ],
      ["instructor", makeNode({ id: "instructor", displayName: "Instructor", awards: [BLACK] })],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "instructor", narrative: null },
      ],
      nodes,
    )

    expect(entries[1].rank).toBeNull()
    expect(entries[1].disciplineLabel).toBeNull()
    // Identity still renders — only the rank is withheld.
    expect(entries[1].displayName).toBe("Private Member")
  })

  it("falls back to the account image when the Passport has no avatar (canon order)", () => {
    const nodes = new Map([
      [
        "member",
        makeNode({ id: "member", displayName: "Member", userImage: "https://img.test/acct.webp" }),
      ],
      [
        "instructor",
        makeNode({
          id: "instructor",
          displayName: "Instructor",
          avatarUrl: "https://img.test/passport.webp",
          userImage: "https://img.test/ignored.webp",
        }),
      ],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "instructor", narrative: null },
      ],
      nodes,
    )

    expect(entries[0].avatarUrl).toBe("https://img.test/passport.webp")
    expect(entries[1].avatarUrl).toBe("https://img.test/acct.webp")
  })
})

describe("assembleAncestryEntries — truncation + empty states", () => {
  it("returns [] when there is no up-chain (member alone)", () => {
    const nodes = new Map([["member", makeNode({ id: "member", displayName: "Member" })]])
    expect(assembleAncestryEntries([{ nodeId: "member", narrative: null }], nodes)).toEqual([])
  })

  it("TRUNCATES at a gap instead of splicing a false adjacency", () => {
    // "middle" went non-PUBLIC between the walk and the batch fetch — everything
    // above it must drop; member + instructor-below-the-gap survive.
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Member" })],
      ["below-gap", makeNode({ id: "below-gap", displayName: "Below Gap" })],
      ["founder", makeNode({ id: "founder", displayName: "Founder" })],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "below-gap", narrative: null },
        { nodeId: "middle", narrative: null }, // missing from the batch
        { nodeId: "founder", narrative: null },
      ],
      nodes,
    )

    expect(entries.map(e => e.nodeId)).toEqual(["below-gap", "member"])
  })

  it("returns [] when the gap truncation leaves fewer than two nodes", () => {
    const nodes = new Map([["member", makeNode({ id: "member", displayName: "Member" })]])
    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "hidden", narrative: null },
      ],
      nodes,
    )
    expect(entries).toEqual([])
  })
})
