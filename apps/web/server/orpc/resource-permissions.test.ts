// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { SessionUser } from "~/server/orpc/context"
import {
  canWithGrants,
  type LineageGrant,
  type LineageResource,
} from "~/server/orpc/resource-permissions"

const asUser = (role: string, id = "u1") => {
  return { id, role } as unknown as SessionUser
}

const admin = asUser("admin", "admin-1")
const member = asUser("user", "user-1")
const guest = null

// A canonical tree used across the scope tests.
const TREE = "tree-1"
const OTHER_TREE = "tree-2"

// Target node sitting in branch rooted at member "m-root" (ancestor chain:
// itself "m-node" → "m-mid" → "m-root"). Branch matching is pre-resolved into
// `branchRootMemberIds` by the caller (the matcher stays pure).
const nodeResource: LineageResource = {
  treeId: TREE,
  nodeId: "n-1",
  memberId: "m-node",
  branchRootMemberIds: ["m-node", "m-mid", "m-root"],
}

const treeGrant = (role: LineageGrant["role"], over?: Partial<LineageGrant>): LineageGrant => ({
  role,
  treeId: TREE,
  ...over,
})

describe("canWithGrants — flat-role short-circuit (byte-compatible with can)", () => {
  it("admin global role bypasses resource scope entirely", () => {
    expect(canWithGrants(admin, "claim.review", nodeResource, [])).toBe(true)
    expect(canWithGrants(admin, "lineage.member.edit", nodeResource, [])).toBe(true)
    expect(canWithGrants(admin, "anything.at.all", nodeResource, [])).toBe(true)
  })

  it("a globally-granted permission authorizes without any resource grant", () => {
    // `health.read` is public — granted to everyone by the flat roles.
    expect(canWithGrants(guest, "health.read", nodeResource, [])).toBe(true)
    expect(canWithGrants(member, "health.read", nodeResource, [])).toBe(true)
  })

  it("denies a non-global permission when there are no resource grants", () => {
    expect(canWithGrants(member, "claim.review", nodeResource, [])).toBe(false)
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, [])).toBe(false)
  })
})

describe("canWithGrants — guest / null", () => {
  it("denies an anonymous caller (no resource grants are ever loaded for one)", () => {
    // The pure matcher assumes `grants` were preloaded for THIS user; the
    // resolver (`canForResource`) returns early for a null user and never
    // queries, so a guest reaches the pure layer with an empty grant set.
    expect(canWithGrants(guest, "claim.review", nodeResource, [])).toBe(false)
    expect(canWithGrants(guest, "lineage.member.edit", nodeResource, [])).toBe(false)
  })

  it("still serves a guest the public flat grants (deny is non-public only)", () => {
    expect(canWithGrants(guest, "health.read", nodeResource, [])).toBe(true)
  })
})

describe("canWithGrants — TREE scope", () => {
  it("TREE_ADMIN authorizes any lineage permission + claim.review within its tree", () => {
    const grants = [treeGrant("TREE_ADMIN")]
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(true)
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(true)
    expect(canWithGrants(member, "lineage.group.edit", nodeResource, grants)).toBe(true)
  })

  it("TREE_EDITOR authorizes member/relationship edits but NOT admin-only group edits", () => {
    const grants = [treeGrant("TREE_EDITOR")]
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(true)
    expect(canWithGrants(member, "lineage.relationship.edit", nodeResource, grants)).toBe(true)
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(true)
    expect(canWithGrants(member, "lineage.group.edit", nodeResource, grants)).toBe(false)
  })

  it("a tree grant does not leak across trees", () => {
    const grants = [treeGrant("TREE_ADMIN")]
    const otherTreeResource: LineageResource = { ...nodeResource, treeId: OTHER_TREE }
    expect(canWithGrants(member, "claim.review", otherTreeResource, grants)).toBe(false)
  })

  it("ignores a revoked grant", () => {
    const grants = [treeGrant("TREE_ADMIN", { revokedAt: new Date() })]
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(false)
  })
})

describe("canWithGrants — BRANCH scope", () => {
  it("authorizes within the granted branch", () => {
    const grants = [treeGrant("BRANCH_EDITOR", { rootMemberId: "m-root" })]
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(true)
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(true)
  })

  it("does NOT cross into a sibling branch", () => {
    // Grant roots at a member that is not in the target's ancestor chain.
    const grants = [treeGrant("BRANCH_EDITOR", { rootMemberId: "m-other-branch" })]
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(false)
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(false)
  })

  it("denies a branch grant with no rootMemberId (malformed scope)", () => {
    const grants = [treeGrant("BRANCH_EDITOR", { rootMemberId: null })]
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(false)
  })

  it("does not grant admin-only group edits inside the branch", () => {
    const grants = [treeGrant("BRANCH_EDITOR", { rootMemberId: "m-root" })]
    expect(canWithGrants(member, "lineage.group.edit", nodeResource, grants)).toBe(false)
  })
})

describe("canWithGrants — NODE scope", () => {
  it("authorizes only its own node", () => {
    const grants = [treeGrant("NODE_EDITOR", { nodeId: "n-1", memberId: "m-node" })]
    expect(canWithGrants(member, "lineage.node.edit", nodeResource, grants)).toBe(true)
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(true)
  })

  it("matches by memberId when nodeId is absent on the grant", () => {
    const grants = [treeGrant("NODE_EDITOR", { memberId: "m-node" })]
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(true)
  })

  it("does NOT authorize a different node", () => {
    const grants = [treeGrant("NODE_EDITOR", { nodeId: "n-2", memberId: "m-other" })]
    expect(canWithGrants(member, "lineage.node.edit", nodeResource, grants)).toBe(false)
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(false)
  })

  it("cannot re-parent (no member-edit grant) — mirrors NODE_EDITOR_CANNOT_REPARENT", () => {
    const grants = [treeGrant("NODE_EDITOR", { nodeId: "n-1", memberId: "m-node" })]
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(false)
  })
})

describe("canWithGrants — unknown / unsupported roles", () => {
  it("denies a grant carrying an unknown role string", () => {
    const grants = [treeGrant("OWNER" as unknown as LineageGrant["role"])]
    expect(canWithGrants(member, "claim.review", nodeResource, grants)).toBe(false)
  })

  it("denies a permission no resource role grants", () => {
    const grants = [treeGrant("TREE_ADMIN")]
    expect(canWithGrants(member, "users.delete", nodeResource, grants)).toBe(false)
  })
})

describe("canWithGrants — multiple grants", () => {
  it("authorizes if ANY grant matches (most-permissive wins)", () => {
    const grants = [
      treeGrant("NODE_EDITOR", { nodeId: "n-other", memberId: "m-other" }),
      treeGrant("BRANCH_EDITOR", { rootMemberId: "m-root" }),
    ]
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(true)
  })

  it("denies when every grant is out of scope", () => {
    const grants = [
      treeGrant("NODE_EDITOR", { nodeId: "n-other", memberId: "m-other" }),
      treeGrant("BRANCH_EDITOR", { rootMemberId: "m-other-branch" }),
    ]
    expect(canWithGrants(member, "lineage.member.edit", nodeResource, grants)).toBe(false)
  })
})
