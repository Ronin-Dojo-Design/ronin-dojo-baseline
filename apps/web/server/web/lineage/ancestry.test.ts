/**
 * SESSION_0493 TASK_05 — assembleAncestryEntries (pure projection, no DB).
 * SESSION_0498 TASK_01 — story-scene projection (Epic A, Lineage Journey).
 *
 * Run: cd apps/web && bun run test server/web/lineage/ancestry.test.ts
 *
 * Author: Cody / SESSION_0493 TASK_05.
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  type AncestryStorySceneRow,
  ancestryStorySceneWhere,
  assembleAncestryEntries,
} from "~/server/web/lineage/ancestry"
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

describe("assembleAncestryEntries — story-scene projection (Epic A, SESSION_0498)", () => {
  // makeNode assigns passportId = `${id}-passport`; scenes key by that.
  const makeScene = (
    passportId: string,
    overrides: Partial<AncestryStorySceneRow> = {},
  ): AncestryStorySceneRow => ({
    passportId,
    quote: "A founder quote.",
    storyBio: null,
    heroImageUrl: null,
    enabled: true,
    ...overrides,
  })

  it("attaches each scene to the RIGHT entry by passportId; entries without one carry story undefined", () => {
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Tony Hua" })],
      ["founder", makeNode({ id: "founder", displayName: "Rigan Machado" })],
    ])
    const scenes = new Map([
      [
        "founder-passport",
        makeScene("founder-passport", {
          quote: "Jiu-Jitsu is not about fighting; it's about solving problems.",
          heroImageUrl: "https://img.test/rigan.webp",
        }),
      ],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "founder", narrative: null },
      ],
      nodes,
      scenes,
    )

    // Founder-first order: [founder, member]. Exact shape via toEqual — the view is
    // deliberately minimal (P3-1: a PUBLIC RSC payload projects only what renders;
    // provenance/dormant/storyboard fields must NOT appear here). `enabled` joined
    // in SESSION_0498 TASK_04 — consumed by the beta preview's disabled marker.
    expect(entries[0].story).toEqual({
      quote: "Jiu-Jitsu is not about fighting; it's about solving problems.",
      storyBio: null,
      heroImageUrl: "https://img.test/rigan.webp",
      enabled: true,
    })
    expect(entries[1].story).toBeUndefined()
  })

  it("projects a DISABLED scene row with enabled: false — the beta preview's marker signal", () => {
    // A disabled row only ever reaches the map via the includeDisabledScenes
    // read (the where defaults to enabled-only); assembly is mode-agnostic and
    // must project the flag faithfully so the preview can mark it.
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Member" })],
      ["founder", makeNode({ id: "founder", displayName: "Founder" })],
    ])
    const scenes = new Map([
      ["founder-passport", makeScene("founder-passport", { enabled: false })],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "founder", narrative: null },
      ],
      nodes,
      scenes,
    )

    expect(entries[0].story?.enabled).toBe(false)
  })

  it("omitted scene map (2-arg call) leaves every entry's story undefined — back-compat", () => {
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Member" })],
      ["instructor", makeNode({ id: "instructor", displayName: "Instructor" })],
    ])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "instructor", narrative: null },
      ],
      nodes,
    )

    expect(entries).toHaveLength(2)
    for (const entry of entries) expect(entry.story).toBeUndefined()
  })

  it("a scene keyed to a HIDDEN node never surfaces — visibility truncation unchanged", () => {
    // "middle" dropped from the PUBLIC batch; its scene must not resurrect it or
    // attach anywhere else. Truncation behavior is identical to the no-scene case.
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Member" })],
      ["below-gap", makeNode({ id: "below-gap", displayName: "Below Gap" })],
      ["founder", makeNode({ id: "founder", displayName: "Founder" })],
    ])
    const scenes = new Map([["middle-passport", makeScene("middle-passport")]])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "below-gap", narrative: null },
        { nodeId: "middle", narrative: null }, // missing from the batch
        { nodeId: "founder", narrative: null },
      ],
      nodes,
      scenes,
    )

    expect(entries.map(e => e.nodeId)).toEqual(["below-gap", "member"])
    for (const entry of entries) expect(entry.story).toBeUndefined()
  })

  it("a scene on a PUBLIC node ABOVE the truncation gap vanishes with its truncated entry (Giddy A0 P3-3)", () => {
    // "founder" IS in the PUBLIC batch AND has a scene — but the chain truncates at
    // "middle" below it. The founder entry (and its scene) must vanish with the
    // truncation: attachment happens only for entries that survive the walk, so a
    // refactor of the truncation `break` cannot leak an above-gap scene back in.
    const nodes = new Map([
      ["member", makeNode({ id: "member", displayName: "Member" })],
      ["founder", makeNode({ id: "founder", displayName: "Founder" })],
    ])
    const scenes = new Map([["founder-passport", makeScene("founder-passport")]])

    const entries = assembleAncestryEntries(
      [
        { nodeId: "member", narrative: null },
        { nodeId: "middle", narrative: null }, // missing from the batch — the gap
        { nodeId: "founder", narrative: null }, // PUBLIC + scened, but above the gap
      ],
      nodes,
      scenes,
    )

    // Chain truncates to [member] alone → below the 2-entry floor → renders nothing.
    // The founder's scene neither surfaces nor resurrects the chain.
    expect(entries).toEqual([])
  })

  it("query boundary excludes disabled scenes and keys strictly by the given passportIds", () => {
    const where = ancestryStorySceneWhere(["p-1", "p-2"])
    // enabled: true is the DB-side gate — a disabled scene can never reach the map.
    expect(where.enabled).toBe(true)
    // Strict in-list on the PUBLIC-filtered chain's passportIds — never a widener.
    expect(where.passportId).toEqual({ in: ["p-1", "p-2"] })
    expect(Object.keys(where).sort()).toEqual(["enabled", "passportId"])
  })

  it("PUBLIC-caller invariant: the no-options call and explicit flag-off are the SAME enabled-only shape", () => {
    // The public read path (AncestrySection → getLineageAncestryForPassport with
    // no options) MUST stay enabled-gated forever — the beta preview flag
    // (SESSION_0498 TASK_04) may never shift this default.
    const defaultWhere = ancestryStorySceneWhere(["p-1", "p-2"])
    const explicitOff = ancestryStorySceneWhere(["p-1", "p-2"], { includeDisabledScenes: false })
    expect(defaultWhere).toEqual({ passportId: { in: ["p-1", "p-2"] }, enabled: true })
    expect(explicitOff).toEqual(defaultWhere)
  })

  it("includeDisabledScenes relaxes ONLY the enabled filter — the passportId key is untouched", () => {
    const where = ancestryStorySceneWhere(["p-1", "p-2"], { includeDisabledScenes: true })
    // The kill-switch gate drops entirely (no `enabled: false` flip — BOTH
    // states render in preview)…
    expect(where.enabled).toBeUndefined()
    // …and nothing else about the boundary moves: still a strict in-list on the
    // PUBLIC-filtered chain's passportIds, no extra keys (never a visibility
    // widener — node-level PUBLIC gates live upstream of this where).
    expect(where.passportId).toEqual({ in: ["p-1", "p-2"] })
    expect(Object.keys(where)).toEqual(["passportId"])
  })
})
