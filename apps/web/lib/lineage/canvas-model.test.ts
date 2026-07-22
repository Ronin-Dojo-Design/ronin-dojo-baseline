import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { CanvasMember } from "~/lib/lineage/canvas-model"
import {
  buildChildGroups,
  buildDescendantCounts,
  memberAvatarSrc,
  memberBeltColor,
  memberInitials,
  memberRankLabel,
  memberSchool,
  memberTopRank,
  memberTopRankAward,
  memberTrustStatus,
  memberSchoolLabel,
  nodeDisplayName,
  resolveLineageMemberView,
  sortMembers,
} from "~/lib/lineage/canvas-model"
import type { LineageNodeRow, LineageVisualGroupRow } from "~/server/web/lineage/payloads"

function makeNode({
  id,
  name = null,
  displayName = null,
  slug = id,
}: {
  id: string
  name?: string | null
  displayName?: string | null
  slug?: string | null
}): LineageNodeRow {
  return {
    id,
    slug,
    visibility: "PUBLIC",
    isVerified: false,
    verificationStatus: "UNVERIFIED",
    bio: null,
    passportId: `passport-${id}`,
    // Phase 3c (SOT-ADR D1): identity is Passport-rooted; account is `passport.user` (nullable).
    passport: {
      id: `passport-${id}`,
      displayName,
      avatarUrl: null,
      user: name != null ? { id: `user-${id}`, name, image: null, memberships: [] } : null,
      directoryProfile: null,
      rankAwardsEarned: [],
      affiliations: [],
    },
  } as unknown as LineageNodeRow
}

function makeMember({
  id,
  name,
  displayName,
  parentId = null,
  groupId = null,
  sort = 0,
}: {
  id: string
  name: string
  displayName?: string | null
  parentId?: string | null
  groupId?: string | null
  sort?: number
}): CanvasMember {
  return {
    id,
    nodeId: `node-${id}`,
    node: makeNode({ id: `node-${id}`, name, displayName }),
    visualSortOrder: sort,
    primaryVisualParentMemberId: parentId,
    visualGroupId: groupId,
    isCollapsedDefault: false,
  }
}

function makeGroup(id: string, label: string, sortOrder: number): LineageVisualGroupRow {
  return {
    id,
    label,
    groupType: "PROMOTION_EVENT",
    promotionDate: null,
    sortOrder,
    showPublicLabel: true,
    isCollapsedDefault: false,
    parentMemberId: "root",
    treeId: "tree",
    promotionEvent: null,
  } as unknown as LineageVisualGroupRow
}

describe("nodeDisplayName", () => {
  test("prefers passport display name, then user name, slug, and id", () => {
    assert.equal(
      nodeDisplayName(makeNode({ id: "node-1", name: "User Name", displayName: "Passport Name" })),
      "Passport Name",
    )
    assert.equal(nodeDisplayName(makeNode({ id: "node-2", name: "User Name" })), "User Name")
    assert.equal(nodeDisplayName(makeNode({ id: "node-3", slug: "lineage-slug" })), "lineage-slug")
    assert.equal(nodeDisplayName(makeNode({ id: "node-4", slug: null })), "node-4")
  })
})

describe("sortMembers", () => {
  test("sorts by visual order before display name", () => {
    const alpha = makeMember({ id: "alpha", name: "Alpha", sort: 2 })
    const beta = makeMember({ id: "beta", name: "Beta", sort: 1 })
    const charlie = makeMember({ id: "charlie", name: "Charlie", sort: 1 })

    const sorted = [alpha, charlie, beta].sort(sortMembers)

    assert.deepEqual(
      sorted.map(member => member.id),
      ["beta", "charlie", "alpha"],
    )
  })
})

describe("buildChildGroups", () => {
  test("groups children by visual group, sorts grouped members, and places ungrouped last", () => {
    const earlyGroup = makeGroup("early", "Early promotions", 1)
    const laterGroup = makeGroup("later", "Later promotions", 2)
    const visualGroupById = new Map([
      [laterGroup.id, laterGroup],
      [earlyGroup.id, earlyGroup],
    ])

    const groups = buildChildGroups({
      visualGroupById,
      children: [
        makeMember({ id: "zulu", name: "Zulu", groupId: "later", sort: 2, parentId: "root" }),
        makeMember({ id: "alpha", name: "Alpha", groupId: "later", sort: 1, parentId: "root" }),
        makeMember({ id: "ungrouped", name: "Ungrouped", parentId: "root" }),
        makeMember({ id: "early", name: "Early", groupId: "early", parentId: "root" }),
      ],
    })

    assert.deepEqual(
      groups.map(group => group.id),
      ["early", "later", "ungrouped-root"],
    )
    assert.deepEqual(
      groups.find(group => group.id === "later")?.members.map(member => member.id),
      ["alpha", "zulu"],
    )
  })
})

describe("buildDescendantCounts", () => {
  test("counts full subtrees and guards cycles", () => {
    const root = makeMember({ id: "root", name: "Root" })
    const child = makeMember({ id: "child", name: "Child", parentId: "root" })
    const grandchild = makeMember({ id: "grandchild", name: "Grandchild", parentId: "child" })
    const cycleA = makeMember({ id: "cycle-a", name: "Cycle A", parentId: "cycle-b" })
    const cycleB = makeMember({ id: "cycle-b", name: "Cycle B", parentId: "cycle-a" })
    const childrenByParentId = new Map<string | null, CanvasMember[]>([
      [null, [root]],
      ["root", [child]],
      ["child", [grandchild]],
      ["cycle-a", [cycleB]],
      ["cycle-b", [cycleA]],
    ])

    const counts = buildDescendantCounts(childrenByParentId)

    assert.equal(counts.get("root"), 2)
    assert.equal(counts.get("child"), 1)
    assert.equal(counts.get("grandchild"), 0)
    assert.ok((counts.get("cycle-a") ?? Number.POSITIVE_INFINITY) <= 2)
    assert.ok((counts.get("cycle-b") ?? Number.POSITIVE_INFINITY) <= 2)
  })
})

describe("memberInitials", () => {
  test("returns stable avatar fallback initials", () => {
    assert.equal(memberInitials(null), "?")
    assert.equal(memberInitials("   "), "?")
    assert.equal(memberInitials("rigan"), "RI")
    assert.equal(memberInitials("Carlos Gracie Jr"), "CJ")
  })
})

describe("member view-model derivations", () => {
  function makeRichNode(): LineageNodeRow {
    return {
      id: "n1",
      slug: "n1",
      visibility: "PUBLIC",
      isVerified: true,
      verificationStatus: "VERIFIED",
      bio: null,
      passportId: "p1",
      // Phase 3c (SOT-ADR D1): identity is Passport-rooted; account is `passport.user` (nullable).
      passport: {
        id: "p1",
        displayName: "Public Name",
        avatarUrl: "https://img.test/passport.jpg",
        user: {
          id: "u1",
          name: "Legal Name",
          image: "https://img.test/account.jpg",
          memberships: [{ organization: { name: "Gracie Barra" } }],
        },
        directoryProfile: null,
        rankAwardsEarned: [
          {
            verificationStatus: "VERIFIED",
            rank: {
              name: "Black Belt",
              colorHex: "#111111",
              sortOrder: 8,
              rankSystem: { discipline: { name: "Brazilian Jiu-Jitsu" } },
            },
          },
        ],
        affiliations: [],
      },
    } as unknown as LineageNodeRow
  }

  test("memberAvatarSrc prefers passport avatar, falls back to account image, else null", () => {
    const node = makeRichNode()
    assert.equal(memberAvatarSrc(node), "https://img.test/passport.jpg")
    node.passport.avatarUrl = null
    assert.equal(memberAvatarSrc(node), "https://img.test/account.jpg")
    node.passport.user!.image = null
    assert.equal(memberAvatarSrc(node), null)
  })

  test("memberBeltColor: highest awarded belt ([0]) — display = awarded truth (ADR 0035)", () => {
    const node = makeRichNode()
    assert.equal(memberBeltColor(node), "#111111")
    node.passport.rankAwardsEarned = []
    assert.equal(memberBeltColor(node), null)
  })

  test("memberRankLabel: highest awarded belt with discipline (ADR 0035)", () => {
    const node = makeRichNode()
    assert.equal(memberRankLabel(node), "Black Belt · Brazilian Jiu-Jitsu")
    node.passport.rankAwardsEarned = []
    assert.equal(memberRankLabel(node), null)
  })

  // ADR 0035 §3: a multi-discipline holder (Andre Lima = BJJ Black 3rd + TKD 8th Dan). The
  // TKD dan sorts higher globally, so a discipline-scoped surface MUST pass its discipline.
  function makeMultiDisciplineNode(): LineageNodeRow {
    return {
      passport: {
        // Payload contract: pre-ordered by Rank.sortOrder desc → TKD (20) before BJJ (8).
        rankAwardsEarned: [
          {
            id: "ra-tkd",
            awardedAt: new Date(Date.UTC(2024, 0, 1)),
            rank: {
              name: "8th Dan",
              colorHex: "#tkd",
              sortOrder: 20,
              rankSystem: { discipline: { id: "disc-tkd", name: "Taekwondo" } },
            },
          },
          {
            id: "ra-bjj",
            awardedAt: new Date(Date.UTC(2020, 0, 1)),
            rank: {
              name: "Black Belt",
              colorHex: "#bjj",
              sortOrder: 8,
              rankSystem: { discipline: { id: "disc-bjj", name: "Brazilian Jiu-Jitsu" } },
            },
          },
        ],
      },
    } as unknown as LineageNodeRow
  }

  test("discipline-scoped rank: the BJJ tree shows BJJ; the drawer (no discipline) shows highest overall", () => {
    const node = makeMultiDisciplineNode()

    // Discipline-scoped surface (the BBL tree carries the BJJ discipline) → the BJJ rank,
    // NOT the globally-higher TKD dan.
    assert.equal(memberTopRank(node, "disc-bjj")?.name, "Black Belt")
    assert.equal(memberTopRankAward(node, "disc-bjj")?.id, "ra-bjj")
    assert.equal(memberBeltColor(node, "disc-bjj"), "#bjj")
    assert.equal(memberRankLabel(node, "disc-bjj"), "Black Belt · Brazilian Jiu-Jitsu")

    // The member's OTHER discipline is reachable by its own id.
    assert.equal(memberTopRank(node, "disc-tkd")?.name, "8th Dan")

    // No discipline (drawer / directory — multi-discipline) → highest awarded overall (TKD).
    assert.equal(memberTopRank(node)?.name, "8th Dan")
    assert.equal(memberTopRankAward(node)?.id, "ra-tkd")

    // A discipline the member holds no award in → null (no leak from another system).
    assert.equal(memberTopRank(node, "disc-judo"), null)
    assert.equal(memberBeltColor(node, "disc-judo"), null)
  })

  // SESSION_0496 pass-2 (Giddy P2): memberSchool pairs name + logo from ONE org — the new
  // invariant behind the V2 player card. A surface must never show school A's label with
  // school B's logo, and a free-text school (no org) must never borrow a membership logo.
  test("memberSchool: org affiliation pairs name AND logo from the SAME org", () => {
    const node = makeRichNode()
    node.passport.affiliations = [
      {
        organization: { name: "Rigan Machado Academy", logoUrl: "https://img.test/rma-logo.png" },
        schoolName: null,
      },
    ] as never
    // Membership org (Gracie Barra) is present too — the affiliation org must win BOTH slots.
    assert.deepEqual(memberSchool(node), {
      name: "Rigan Machado Academy",
      logoUrl: "https://img.test/rma-logo.png",
    })
  })

  test("memberSchool: free-text school has no org → logoUrl null (never a borrowed logo)", () => {
    const node = makeRichNode()
    node.passport.affiliations = [{ organization: null, schoolName: "Backyard BJJ" }] as never
    // The membership org has a logo available — it must NOT leak onto the free-text school.
    node.passport.user!.memberships = [
      { organization: { name: "Gracie Barra", logoUrl: "https://img.test/gb-logo.png" } },
    ] as never
    assert.deepEqual(memberSchool(node), { name: "Backyard BJJ", logoUrl: null })
  })

  test("memberSchool: membership fallback carries the membership org's own logo", () => {
    const node = makeRichNode()
    node.passport.affiliations = []
    node.passport.user!.memberships = [
      { organization: { name: "Gracie Barra", logoUrl: "https://img.test/gb-logo.png" } },
    ] as never
    assert.deepEqual(memberSchool(node), {
      name: "Gracie Barra",
      logoUrl: "https://img.test/gb-logo.png",
    })
    // No affiliation and no membership → null (unaffiliated).
    node.passport.user!.memberships = []
    assert.equal(memberSchool(node), null)
  })

  test("memberSchool: pure placeholder resolves to null", () => {
    const node = makeNode({ id: "placeholder" })
    assert.equal(memberSchool(node), null)
  })

  test("memberSchoolLabel prefers current Affiliation (org, then free-text), else Membership, else null", () => {
    const node = makeRichNode()
    // No affiliation → falls back to the active membership org.
    assert.equal(memberSchoolLabel(node), "Gracie Barra")
    // Current affiliation with a linked org wins over membership.
    node.passport.affiliations = [
      { organization: { name: "Rigan Machado Affiliation" }, schoolName: null },
    ] as never
    assert.equal(memberSchoolLabel(node), "Rigan Machado Affiliation")
    // Free-text school (no linked org) is used when present.
    node.passport.affiliations = [{ organization: null, schoolName: "Backyard BJJ" }] as never
    assert.equal(memberSchoolLabel(node), "Backyard BJJ")
    // No affiliation and no membership → null.
    node.passport.affiliations = []
    node.passport.user!.memberships = []
    assert.equal(memberSchoolLabel(node), null)
  })
})

describe("resolveLineageMemberView — the one ruleset every surface shares", () => {
  function withAward(
    node: LineageNodeRow,
    name: string,
    color: string,
    entryStatus: "PENDING" | "UNVERIFIED" | "VERIFIED" | "DISPUTED" | null = null,
  ) {
    node.passport.rankAwardsEarned = [
      {
        rank: {
          name,
          colorHex: color,
          sortOrder: 8,
          rankSystem: { id: "rs-bjj", discipline: { id: "disc-bjj", name: "Brazilian Jiu-Jitsu" } },
        },
        rankEntry: entryStatus ? { status: entryStatus } : null,
      },
    ] as never
    return node
  }

  test("verified member → verified trust, highest awarded belt, no claim badge", () => {
    // Trust is the top non-PENDING `RankEntry.status` (WL-P2-46) — NOT the node-level flag.
    const node = withAward(
      makeNode({ id: "v", name: "Verified" }),
      "Black Belt",
      "#111111",
      "VERIFIED",
    )
    // Node flag deliberately LEFT false to prove trust comes from the entry, not `node.isVerified`.
    const view = resolveLineageMemberView(node)
    assert.equal(view.trustStatus, "verified")
    assert.equal(view.rankLabel, "Black Belt · Brazilian Jiu-Jitsu")
    assert.equal(view.beltColor, "#111111")
    assert.equal(view.claimBadgeStatus, null)
  })

  test("fresh member (unverified rank entry) → unverified trust, belt still shows", () => {
    // makeNode defaults: has a linked user (not placeholder); the entry is UNVERIFIED.
    const node = withAward(
      makeNode({ id: "u", name: "Fresh" }),
      "Purple Belt",
      "#7c3aed",
      "UNVERIFIED",
    )
    const view = resolveLineageMemberView(node)
    assert.equal(view.trustStatus, "unverified")
    assert.equal(view.rankLabel, "Purple Belt · Brazilian Jiu-Jitsu")
    assert.equal(view.beltColor, "#7c3aed")
  })

  test("memberTrustStatus: top non-PENDING entry, discipline-scoped like memberTopRank", () => {
    const node = makeNode({ id: "t", name: "Trust" })
    node.passport.rankAwardsEarned = [
      {
        rank: {
          sortOrder: 8,
          rankSystem: { id: "rs-bjj", discipline: { id: "disc-bjj" } },
        },
        rankEntry: { status: "PENDING" }, // highest belt PENDING → skipped
      },
      {
        rank: {
          sortOrder: 6,
          rankSystem: { id: "rs-bjj", discipline: { id: "disc-bjj" } },
        },
        rankEntry: { status: "VERIFIED" }, // next non-PENDING → the trust
      },
    ] as never
    assert.equal(memberTrustStatus(node), "VERIFIED")
    assert.equal(memberTrustStatus(node, "disc-bjj"), "VERIFIED")
    // A discipline the member holds no entry in → null (node not verified → no fallback).
    assert.equal(memberTrustStatus(node, "disc-tkd"), null)
    // No awards → null (→ unverified/imported at the resolver).
    node.passport.rankAwardsEarned = [] as never
    assert.equal(memberTrustStatus(node), null)
  })

  test("memberTrustStatus: BELTLESS member falls back to node membership verification (WL-P2-46)", () => {
    // A documented lineage member with NO belt → the node's membership verification carries trust.
    const node = makeNode({ id: "bl", name: "Beltless" })
    node.passport.rankAwardsEarned = [] as never
    node.isVerified = true
    assert.equal(memberTrustStatus(node), "VERIFIED")
    node.isVerified = false
    node.verificationStatus = "DISPUTED"
    assert.equal(memberTrustStatus(node), "DISPUTED")
    node.verificationStatus = "PENDING"
    assert.equal(memberTrustStatus(node), null)
    // A present RankEntry ALWAYS wins over the node fallback (a VERIFIED belt on a node-unverified
    // member reads verified; a DISPUTED belt reads disputed).
    node.isVerified = true
    node.verificationStatus = "VERIFIED"
    node.passport.rankAwardsEarned = [
      {
        rank: { sortOrder: 6, rankSystem: { id: "rs", discipline: { id: "d" } } },
        rankEntry: { status: "DISPUTED" },
      },
    ] as never
    assert.equal(memberTrustStatus(node), "DISPUTED")
  })

  test("resolveLineageMemberView: beltless node-verified → verified badge (kept in galaxy)", () => {
    const node = makeNode({ id: "blv", name: "Beltless Verified" })
    node.passport.rankAwardsEarned = [] as never
    node.isVerified = true
    assert.equal(resolveLineageMemberView(node).trustStatus, "verified")
    // Beltless + node not verified → the unchanged unverified path.
    node.isVerified = false
    assert.equal(resolveLineageMemberView(node).trustStatus, "unverified")
  })

  test("claimable placeholder → claim badge surfaces (drawer/directory only)", () => {
    const node = makeNode({ id: "c", slug: "placeholder" }) // no name → user null → placeholder
    const view = resolveLineageMemberView(node, { isClaimable: true })
    assert.equal(view.claimBadgeStatus, "claimable")
  })
})
