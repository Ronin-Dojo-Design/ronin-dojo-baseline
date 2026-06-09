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
  memberSchoolLabel,
  nodeDisplayName,
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
    userId: `user-${id}`,
    user: {
      id: `user-${id}`,
      name,
      image: null,
      passport: displayName ? { displayName, avatarUrl: null } : null,
      directoryProfile: null,
      rankAwards: [],
      memberships: [],
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
      userId: "u1",
      user: {
        id: "u1",
        name: "Legal Name",
        image: "https://img.test/account.jpg",
        passport: { displayName: "Public Name", avatarUrl: "https://img.test/passport.jpg" },
        directoryProfile: null,
        rankAwards: [
          {
            rank: {
              name: "Black Belt",
              colorHex: "#111111",
              rankSystem: { discipline: { name: "Brazilian Jiu-Jitsu" } },
            },
          },
        ],
        affiliations: [],
        memberships: [{ organization: { name: "Gracie Barra" } }],
      },
    } as unknown as LineageNodeRow
  }

  test("memberAvatarSrc prefers passport avatar, falls back to account image, else null", () => {
    const node = makeRichNode()
    assert.equal(memberAvatarSrc(node), "https://img.test/passport.jpg")
    node.user.passport = null
    assert.equal(memberAvatarSrc(node), "https://img.test/account.jpg")
    node.user.image = null
    assert.equal(memberAvatarSrc(node), null)
  })

  test("memberBeltColor: selectedRank wins, else latest award, else null", () => {
    const node = makeRichNode()
    assert.equal(memberBeltColor(node, { colorHex: "#abcabc" } as never), "#abcabc")
    assert.equal(memberBeltColor(node), "#111111")
    node.user.rankAwards = []
    assert.equal(memberBeltColor(node), null)
  })

  test("memberRankLabel: selectedRank wins, else latest award with discipline, else null", () => {
    const node = makeRichNode()
    assert.equal(
      memberRankLabel(node, { name: "Coral Belt", disciplineName: "BJJ" } as never),
      "Coral Belt · BJJ",
    )
    assert.equal(memberRankLabel(node), "Black Belt · Brazilian Jiu-Jitsu")
    node.user.rankAwards = []
    assert.equal(memberRankLabel(node), null)
  })

  test("memberSchoolLabel prefers current Affiliation (org, then free-text), else Membership, else null", () => {
    const node = makeRichNode()
    // No affiliation → falls back to the active membership org.
    assert.equal(memberSchoolLabel(node), "Gracie Barra")
    // Current affiliation with a linked org wins over membership.
    node.user.affiliations = [
      { organization: { name: "Rigan Machado Affiliation" }, schoolName: null },
    ] as never
    assert.equal(memberSchoolLabel(node), "Rigan Machado Affiliation")
    // Free-text school (no linked org) is used when present.
    node.user.affiliations = [{ organization: null, schoolName: "Backyard BJJ" }] as never
    assert.equal(memberSchoolLabel(node), "Backyard BJJ")
    // No affiliation and no membership → null.
    node.user.affiliations = []
    node.user.memberships = []
    assert.equal(memberSchoolLabel(node), null)
  })
})
