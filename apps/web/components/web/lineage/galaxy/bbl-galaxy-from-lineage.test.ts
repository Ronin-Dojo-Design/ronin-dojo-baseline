/**
 * Galaxy epic slice 2 — proof for the public-safe lineage→galaxy projection.
 *
 * DB-free: feeds a tiny hand-built public tree (already the shape the lineage query layer
 * returns) and asserts the deterministic galaxy graph — generations/roles from the visual
 * parent chain, orbit slotting, primary-lineage edges, public group labels, and the
 * display-name / rank-label / photo mapping. No private fields are read.
 *
 * TASK_06 update: identity derivation now delegates to `projectPublicPassport`, so the
 * mock passport shape uses `rankAwardsEarned` (not `selectedRankAward`) for rank data and
 * must include the `directoryProfile` field that `PublicPassportRow` requires.
 *
 * Run: cd apps/web && bun test components/web/lineage/galaxy/bbl-galaxy-from-lineage.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { LineageTreePublicResult } from "~/server/web/lineage/payloads"
import { lineageTreeToGalaxyGraph } from "./bbl-galaxy-from-lineage"

type Member = {
  id: string
  nodeId: string
  visualSortOrder: number
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  node: unknown
}

const member = (
  id: string,
  opts: {
    parent?: string | null
    sort?: number
    group?: string | null
    displayName?: string | null
    accountName?: string | null
    avatarUrl?: string | null
    rankName?: string | null
    discipline?: string | null
    awardYear?: number | null
    verified?: boolean
    /** WL-P2-46: a documented lineage member with NO belt — trust comes from the node fallback. */
    beltless?: boolean
  } = {},
): Member => ({
  id,
  nodeId: `node-${id}`,
  visualSortOrder: opts.sort ?? 0,
  primaryVisualParentMemberId: opts.parent ?? null,
  visualGroupId: opts.group ?? null,
  node: {
    slug: `slug-${id}`,
    // WL-P2-46 beltless fallback: node membership verification carries trust ONLY when the member
    // has no belt. `verified` drives BOTH the belt entry (when present) and this node flag; when a
    // belt IS present the RankEntry always wins, so this only matters for the beltless case.
    isVerified: opts.verified !== false,
    verificationStatus: opts.verified === false ? "UNVERIFIED" : "VERIFIED",
    passport: {
      id: `passport-${id}`,
      displayName: opts.displayName ?? null,
      avatarUrl: opts.avatarUrl ?? null,
      bio: null,
      socialLinks: [],
      directoryProfile: null,
      user: opts.accountName ? { id: `user-${id}`, name: opts.accountName, image: null } : null,
      // Belted members carry one award whose RankEntry status encodes `verified` (the belt-trust
      // axis, LR 0008); `rankAwardsEarned` also feeds projectPublicPassport's rankLabel. A beltless
      // member has NO award → trust resolves via the node fallback above.
      rankAwardsEarned: opts.beltless
        ? []
        : [
            {
              id: `award-${id}`,
              awardedAt: opts.awardYear ? new Date(Date.UTC(opts.awardYear, 0, 1)) : null,
              rank: {
                id: `rank-${id}`,
                name: opts.rankName ?? "Belt",
                shortName: null,
                colorHex: null,
                rankSystem: {
                  id: `system-${id}`,
                  name: "BJJ",
                  discipline: opts.discipline
                    ? { id: `disc-${id}`, name: opts.discipline, slug: "bjj", code: "BJJ" }
                    : null,
                },
              },
              rankEntry: { status: opts.verified === false ? "UNVERIFIED" : "VERIFIED" },
            },
          ],
    },
  },
})

const build = (members: Member[], visualGroups: unknown[] = []): LineageTreePublicResult =>
  ({ members, visualGroups, tree: { disciplineId: null } }) as unknown as LineageTreePublicResult

describe("lineageTreeToGalaxyGraph", () => {
  it("derives generation + role from the visual parent chain", () => {
    const graph = lineageTreeToGalaxyGraph(
      build([
        member("root", { displayName: "Root Anchor" }),
        member("a", { parent: "root", sort: 0, displayName: "Legend A" }),
        member("b", { parent: "root", sort: 1, displayName: "Legend B" }),
        member("c", { parent: "a", sort: 0, displayName: "Instructor C" }),
        member("d", { parent: "c", sort: 0, displayName: "Student D" }),
      ]),
    )

    const byId = Object.fromEntries(graph.nodes.map(node => [node.id, node]))
    expect(byId["node-root"].role).toBe("ROOT_STAR")
    expect(byId["node-root"].generation).toBe(0)
    expect(byId["node-a"].role).toBe("LEGEND_STAR")
    expect(byId["node-a"].generation).toBe(1)
    expect(byId["node-c"].role).toBe("INSTRUCTOR_PLANET")
    expect(byId["node-c"].generation).toBe(2)
    expect(byId["node-d"].role).toBe("STUDENT_MOON")
    expect(byId["node-d"].generation).toBe(3)
  })

  it("slots orbit index/total within a generation band by visualSortOrder", () => {
    const graph = lineageTreeToGalaxyGraph(
      build([
        member("root", { displayName: "Root" }),
        member("a", { parent: "root", sort: 5, displayName: "A" }),
        member("b", { parent: "root", sort: 1, displayName: "B" }),
      ]),
    )
    const a = graph.nodes.find(n => n.id === "node-a")!
    const b = graph.nodes.find(n => n.id === "node-b")!
    expect(a.orbitTotal).toBe(2)
    expect(b.orbitTotal).toBe(2)
    // b (sort 1) comes before a (sort 5)
    expect(b.orbitIndex).toBe(0)
    expect(a.orbitIndex).toBe(1)
  })

  it("emits a primary-lineage edge per visual parent pointer (nodeId-keyed)", () => {
    const graph = lineageTreeToGalaxyGraph(
      build([
        member("root", { displayName: "Root" }),
        member("a", { parent: "root", displayName: "A" }),
      ]),
    )
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0]).toMatchObject({
      sourceId: "node-root",
      targetId: "node-a",
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
    })
  })

  it("maps public fields: name fallback, photo, rank label, timeline year (via projectPublicPassport)", () => {
    const graph = lineageTreeToGalaxyGraph(
      build([
        member("root", {
          accountName: "Account Only", // no passport displayName → falls back to account name
          avatarUrl: "https://cdn/x.jpg",
          rankName: "Black Belt",
          discipline: "Brazilian Jiu-Jitsu",
          awardYear: 2018,
        }),
      ]),
    )
    const node = graph.nodes[0]
    expect(node.displayName).toBe("Account Only")
    expect(node.initials).toBe("AO")
    expect(node.photoUrl).toBe("https://cdn/x.jpg")
    // rankLabel comes from projectPublicPassport (rankAwardsEarned[0]) — same format
    expect(node.rankLabel).toBe("Black Belt · Brazilian Jiu-Jitsu")
    expect(node.timelineYear).toBe(2018)
    expect(node.verifiedStatus).toBe("VERIFIED")
  })

  it("only exposes public group labels", () => {
    const graph = lineageTreeToGalaxyGraph(
      build(
        [
          member("root", { displayName: "Root", group: "g-public" }),
          member("a", { parent: "root", displayName: "A", group: "g-private" }),
        ],
        [
          { id: "g-public", label: "Dirty Dozen", showPublicLabel: true },
          { id: "g-private", label: "Hidden Cohort", showPublicLabel: false },
        ],
      ),
    )
    expect(graph.groups.map(g => g.id)).toEqual(["g-public"])
    const root = graph.nodes.find(n => n.id === "node-root")!
    const a = graph.nodes.find(n => n.id === "node-a")!
    expect(root.groupLabel).toBe("Dirty Dozen")
    // private group is dropped from the node projection too
    expect(a.groupId).toBeUndefined()
    expect(a.groupLabel).toBeUndefined()
  })

  it("drops unverified nodes and any edges touching them (verified-only galaxy)", () => {
    const graph = lineageTreeToGalaxyGraph(
      build([
        member("root", { displayName: "Root", verified: true }),
        member("ghost", { parent: "root", displayName: "Unverified", verified: false }),
      ]),
    )
    expect(graph.nodes.map(n => n.id)).toEqual(["node-root"])
    // the root→ghost edge is dropped because ghost was filtered out
    expect(graph.edges).toHaveLength(0)
    expect(graph.nodes.every(n => n.verifiedStatus === "VERIFIED")).toBe(true)
  })

  it("keeps a BELTLESS node-verified member via the node fallback (WL-P2-46)", () => {
    // A documented lineage member with NO belt but node-verified must STAY in the public galaxy
    // (pure top-RankEntry would have dropped them — the regression this fallback fixes).
    const graph = lineageTreeToGalaxyGraph(
      build([
        member("root", { displayName: "Root", verified: true }),
        member("beltless", {
          parent: "root",
          displayName: "Documented",
          beltless: true,
          verified: true,
        }),
        member("beltless-unverified", {
          parent: "root",
          displayName: "Beltless Unverified",
          beltless: true,
          verified: false,
        }),
      ]),
    )
    expect(graph.nodes.map(n => n.id).sort()).toEqual(["node-beltless", "node-root"])
    expect(graph.nodes.every(n => n.verifiedStatus === "VERIFIED")).toBe(true)
  })
})
