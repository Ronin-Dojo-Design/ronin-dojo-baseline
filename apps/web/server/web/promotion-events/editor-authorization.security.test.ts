/**
 * SESSION_0510 item 5 — adversarial characterization of the hand-rolled promotion-event
 * authoring gate (`server/web/promotion-events/editor-authorization.ts`).
 *
 * This gate resolves `LineageTreeAccess` in PARALLEL to the canonical
 * `canWithGrants`/`canForResource` (SOT-ADR D4). A future migration to the canonical
 * resolver MUST NOT silently loosen the security boundary. These tests PIN THE CURRENT
 * ALLOW/DENY BEHAVIOR — with the DENY paths and escalation attempts front and center,
 * because those are exactly what a bad migration could weaken.
 *
 * Characterization only: it asserts what the code DOES today, not what it SHOULD do. Any
 * latent gap surfaced here is REPORTED, not fixed (this task adds tests + a proposal only).
 *
 * Two layers, per SOP §5d + §10b:
 *   - `resolvePromotionEventAuthoringScope` takes a Prisma client → tested against REAL
 *     Postgres inside an always-rolled-back transaction (SOP §5d). This exercises the true
 *     query semantics (the `revokedAt: null` filter, the membership/role WHERE clauses,
 *     the org-admin ORGANIZATION-tree join) rather than a hand-emulated fake — a fake would
 *     be its own source of error and could mask a real gap.
 *   - `canAuthorRankAward` / `canAuthorPromotionEvent` / `canAuthorHostOrganization` /
 *     `canAuthorRankAwards` / `buildAuthorizedRankAwardWhere` are PURE (they take a plain
 *     `scope`) → tested with no DB, adversarial input tables (SOP §10b).
 *
 * Run: cd apps/web && bun run test server/web/promotion-events/editor-authorization.security.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import { LineageTreeAccessRole } from "~/.generated/prisma/client"
import type { AuthzUser } from "~/lib/authz"
import {
  type AuthorizableRankAward,
  type PromotionEventAuthoringScope,
  buildAuthorizedRankAwardWhere,
  canAuthorHostOrganization,
  canAuthorPromotionEvent,
  canAuthorRankAward,
  canAuthorRankAwards,
  resolvePromotionEventAuthoringScope,
} from "~/server/web/promotion-events/editor-authorization"
import { db } from "~/services/db"

const BRAND = "BBL" as const

// biome-ignore lint/suspicious/noExplicitAny: tx client surface.
type Tx = any

const TS = Date.now()
let seq = 0
const uid = (name: string) => `pea-${TS}-${seq++}-${name}`

class Rollback extends Error {}

/** Run `body` inside a transaction that is ALWAYS rolled back — zero persistence, zero teardown. */
async function inRolledBackTx(body: (tx: Tx) => Promise<void>): Promise<void> {
  try {
    await db.$transaction(async (tx: Tx) => {
      await body(tx)
      throw new Rollback()
    })
  } catch (error) {
    if (!(error instanceof Rollback)) throw error
  }
}

// -----------------------------------------------------------------------------
// Fixture builders (all keyed off the tx; unique-within-tx ids via `uid`).
// -----------------------------------------------------------------------------

/** A Passport + its @unique LineageNode. Returns both ids. */
async function makeNode(tx: Tx): Promise<{ passportId: string; nodeId: string }> {
  const passport = await tx.passport.create({
    data: { id: uid("passport"), displayName: uid("Person") },
    select: { id: true },
  })
  const node = await tx.lineageNode.create({
    data: { id: uid("node"), passportId: passport.id, visibility: "PUBLIC" },
    select: { id: true },
  })
  return { passportId: passport.id, nodeId: node.id }
}

async function makeTree(
  tx: Tx,
  overrides: {
    brand?: string
    scopeType?: "DISCIPLINE" | "ORGANIZATION" | "BRAND"
    organizationId?: string | null
  } = {},
): Promise<string> {
  const tree = await tx.lineageTree.create({
    data: {
      id: uid("tree"),
      brand: overrides.brand ?? BRAND,
      slug: uid("tree"),
      name: uid("Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: overrides.scopeType ?? "DISCIPLINE",
      organizationId: overrides.organizationId ?? null,
    },
    select: { id: true },
  })
  return tree.id
}

async function makeMember(
  tx: Tx,
  { treeId, nodeId, parentMemberId }: { treeId: string; nodeId: string; parentMemberId?: string },
): Promise<string> {
  const member = await tx.lineageTreeMember.create({
    data: {
      id: uid("member"),
      treeId,
      nodeId,
      primaryVisualParentMemberId: parentMemberId ?? null,
    },
    select: { id: true },
  })
  return member.id
}

async function makeUser(tx: Tx): Promise<AuthzUser> {
  const user = await tx.user.create({
    data: { id: uid("user"), name: uid("User"), email: `${uid("user")}@test.local` },
    select: { id: true },
  })
  return { id: user.id, role: "user" }
}

async function grant(
  tx: Tx,
  {
    userId,
    treeId,
    role,
    rootMemberId,
    nodeId,
    memberId,
    revokedAt,
  }: {
    userId: string
    treeId: string
    role: string
    rootMemberId?: string
    nodeId?: string
    memberId?: string
    revokedAt?: Date
  },
): Promise<void> {
  await tx.lineageTreeAccess.create({
    data: {
      id: uid("grant"),
      userId,
      treeId,
      role,
      rootMemberId: rootMemberId ?? null,
      nodeId: nodeId ?? null,
      memberId: memberId ?? null,
      revokedAt: revokedAt ?? null,
    },
  })
}

/** A brand Organization, optionally owned by `ownerId`. */
async function makeOrg(
  tx: Tx,
  { brand = BRAND, ownerId }: { brand?: string; ownerId?: string } = {},
): Promise<string> {
  const org = await tx.organization.create({
    data: {
      id: uid("org"),
      brand,
      name: uid("Org"),
      slug: uid("org"),
      ownerId: ownerId ?? null,
    },
    select: { id: true },
  })
  return org.id
}

/** A Discipline for the Membership FK. */
async function makeDiscipline(tx: Tx): Promise<string> {
  const discipline = await tx.discipline.create({
    data: { id: uid("disc"), name: uid("Discipline"), slug: uid("disc") },
    select: { id: true },
  })
  return discipline.id
}

/** A brand Role with the given code. */
async function makeRole(tx: Tx, code: string): Promise<string> {
  const role = await tx.role.create({
    data: { id: uid("role"), code, name: code, brand: BRAND },
    select: { id: true },
  })
  return role.id
}

/**
 * An ACTIVE membership for `userId` at `organizationId` holding `roleCode`, so the resolver's
 * `memberships.some({ status: ACTIVE, roleAssignments.some({ role.code }) })` predicate matches.
 */
async function makeActiveMembershipWithRole(
  tx: Tx,
  {
    userId,
    organizationId,
    disciplineId,
    roleCode,
  }: { userId: string; organizationId: string; disciplineId: string; roleCode: string },
): Promise<void> {
  const membership = await tx.membership.create({
    data: {
      id: uid("membership"),
      brand: BRAND,
      status: "ACTIVE",
      userId,
      organizationId,
      disciplineId,
    },
    select: { id: true },
  })
  const roleId = await makeRole(tx, roleCode)
  await tx.membershipRoleAssignment.create({
    data: { id: uid("mra"), membershipId: membership.id, roleId },
  })
}

// The shared linear tree used across scope tests:
//   root -> mid -> leaf   (visual-parent chain)   plus a sibling under root
async function makeLinearTree(tx: Tx): Promise<{
  treeId: string
  rootMemberId: string
  midMemberId: string
  leafMemberId: string
  siblingMemberId: string
  nodes: { root: string; mid: string; leaf: string; sibling: string }
}> {
  const treeId = await makeTree(tx)
  const root = await makeNode(tx)
  const mid = await makeNode(tx)
  const leaf = await makeNode(tx)
  const sibling = await makeNode(tx)
  const rootMemberId = await makeMember(tx, { treeId, nodeId: root.nodeId })
  const midMemberId = await makeMember(tx, {
    treeId,
    nodeId: mid.nodeId,
    parentMemberId: rootMemberId,
  })
  const leafMemberId = await makeMember(tx, {
    treeId,
    nodeId: leaf.nodeId,
    parentMemberId: midMemberId,
  })
  const siblingMemberId = await makeMember(tx, {
    treeId,
    nodeId: sibling.nodeId,
    parentMemberId: rootMemberId,
  })
  return {
    treeId,
    rootMemberId,
    midMemberId,
    leafMemberId,
    siblingMemberId,
    nodes: { root: root.nodeId, mid: mid.nodeId, leaf: leaf.nodeId, sibling: sibling.nodeId },
  }
}

// -----------------------------------------------------------------------------
// Pure-function fixtures (no DB).
// -----------------------------------------------------------------------------

const pureScope = (
  overrides: Partial<PromotionEventAuthoringScope> = {},
): PromotionEventAuthoringScope => ({
  isGlobalAdmin: false,
  organizationIds: new Set(),
  fullTreeNodeIds: new Set(),
  scopedNodeIds: new Set(),
  canAuthorHostlessEvents: false,
  ...overrides,
})

const award = (overrides: Partial<AuthorizableRankAward> = {}): AuthorizableRankAward => ({
  id: "award-1",
  awardedById: "someone-else",
  organizationId: null,
  promotionEventId: null,
  passport: { lineageNode: { id: "node-x" } },
  ...overrides,
})

// =============================================================================
// resolvePromotionEventAuthoringScope — real DB, rolled-back tx (SOP §5d).
// =============================================================================

describe("resolvePromotionEventAuthoringScope — cross-tree isolation", () => {
  it("a TREE_ADMIN on tree A scopes ONLY tree-A nodes; tree B (no grant) is excluded", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)

      const treeA = await makeTree(tx)
      const a = await makeNode(tx)
      await makeMember(tx, { treeId: treeA, nodeId: a.nodeId })
      await grant(tx, { userId: user.id, treeId: treeA, role: "TREE_ADMIN" })

      const treeB = await makeTree(tx)
      const b = await makeNode(tx)
      await makeMember(tx, { treeId: treeB, nodeId: b.nodeId })
      // NO grant on tree B.

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.isGlobalAdmin).toBe(false)
      expect(scope.fullTreeNodeIds.has(a.nodeId)).toBe(true)
      // Cross-tree DENY: tree B's node is in NO scope set.
      expect(scope.fullTreeNodeIds.has(b.nodeId)).toBe(false)
      expect(scope.scopedNodeIds.has(b.nodeId)).toBe(false)

      expect(
        canAuthorRankAward({
          scope,
          award: award({ passport: { lineageNode: { id: b.nodeId } } }),
          userId: user.id,
        }),
      ).toBe(false)
    })
  })

  it("a full-tree grant on a NON-brand tree does not leak into the queried brand", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)

      // Grant lives on a WEKAF tree; we resolve scope for BBL.
      const otherBrandTree = await makeTree(tx, { brand: "WEKAF" })
      const n = await makeNode(tx)
      await makeMember(tx, { treeId: otherBrandTree, nodeId: n.nodeId })
      await grant(tx, { userId: user.id, treeId: otherBrandTree, role: "TREE_ADMIN" })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      // Brand filter denies the cross-brand tree entirely.
      expect(scope.fullTreeNodeIds.size).toBe(0)
      expect(scope.scopedNodeIds.size).toBe(0)
    })
  })
})

describe("resolvePromotionEventAuthoringScope — BRANCH_EDITOR scope boundary", () => {
  it("covers the rooted subtree (mid, leaf) but NOT the ancestor root or the cousin sibling", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const tree = await makeLinearTree(tx)
      // Branch rooted at mid: covers mid + leaf, NOT root, NOT sibling.
      await grant(tx, {
        userId: user.id,
        treeId: tree.treeId,
        role: "BRANCH_EDITOR",
        rootMemberId: tree.midMemberId,
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.scopedNodeIds.has(tree.nodes.mid)).toBe(true)
      expect(scope.scopedNodeIds.has(tree.nodes.leaf)).toBe(true)
      // Out-of-branch nodes are DENIED.
      expect(scope.scopedNodeIds.has(tree.nodes.root)).toBe(false)
      expect(scope.scopedNodeIds.has(tree.nodes.sibling)).toBe(false)
      expect(scope.fullTreeNodeIds.size).toBe(0)

      // An award on the sibling (just outside the branch) is denied.
      expect(
        canAuthorRankAward({
          scope,
          award: award({ passport: { lineageNode: { id: tree.nodes.sibling } } }),
          userId: user.id,
        }),
      ).toBe(false)
      // An award inside the branch is allowed.
      expect(
        canAuthorRankAward({
          scope,
          award: award({ passport: { lineageNode: { id: tree.nodes.leaf } } }),
          userId: user.id,
        }),
      ).toBe(true)
    })
  })

  it("a BRANCH_EDITOR has no hostless-event authority (canAuthorHostlessEvents=false)", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const tree = await makeLinearTree(tx)
      await grant(tx, {
        userId: user.id,
        treeId: tree.treeId,
        role: "BRANCH_EDITOR",
        rootMemberId: tree.midMemberId,
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.canAuthorHostlessEvents).toBe(false)
      expect(
        canAuthorPromotionEvent({
          scope,
          event: null,
          hostOrganizationId: null,
          awards: [],
          userId: user.id,
        }),
      ).toBe(false)
    })
  })
})

describe("resolvePromotionEventAuthoringScope — NODE_EDITOR scope boundary", () => {
  it("covers its single node (grant.nodeId) but NOT descendants or siblings", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const tree = await makeLinearTree(tx)
      await grant(tx, {
        userId: user.id,
        treeId: tree.treeId,
        role: "NODE_EDITOR",
        nodeId: tree.nodes.mid,
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.scopedNodeIds.has(tree.nodes.mid)).toBe(true)
      // A NODE grant is single-node — the descendant leaf and the sibling are NOT covered.
      expect(scope.scopedNodeIds.has(tree.nodes.leaf)).toBe(false)
      expect(scope.scopedNodeIds.has(tree.nodes.sibling)).toBe(false)
      expect(scope.scopedNodeIds.size).toBe(1)
      expect(scope.fullTreeNodeIds.size).toBe(0)

      expect(
        canAuthorRankAward({
          scope,
          award: award({ passport: { lineageNode: { id: tree.nodes.leaf } } }),
          userId: user.id,
        }),
      ).toBe(false)
    })
  })

  it("resolves its node from the linked member (grant.member.nodeId) when grant.nodeId is null", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const tree = await makeLinearTree(tx)
      // NODE_EDITOR bound via memberId only; nodeId null → resolver falls back to member.nodeId.
      await grant(tx, {
        userId: user.id,
        treeId: tree.treeId,
        role: "NODE_EDITOR",
        memberId: tree.leafMemberId,
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.scopedNodeIds.has(tree.nodes.leaf)).toBe(true)
      expect(scope.scopedNodeIds.size).toBe(1)
    })
  })
})

describe("resolvePromotionEventAuthoringScope — role insufficiency", () => {
  it("a user with NO grants gets a fully-empty scope", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.isGlobalAdmin).toBe(false)
      expect(scope.organizationIds.size).toBe(0)
      expect(scope.fullTreeNodeIds.size).toBe(0)
      expect(scope.scopedNodeIds.size).toBe(0)
      expect(scope.canAuthorHostlessEvents).toBe(false)
    })
  })

  it("the LineageTreeAccessRole enum holds ONLY the four editor roles (no non-editor grant is representable)", () => {
    // LATENT-SCOPE NOTE: the resolver's `role: { in: editorRoles }` filter is defensive but
    // a no-op at the DB layer — the enum cannot hold a non-editor value (there is no VIEWER /
    // READ_ONLY role), so "a grant with an insufficient role" reduces to the no-grant case
    // (covered above). The canonical `LINEAGE_RESOURCE_GRANTS` keys off this SAME set, so a
    // migration inherits the identical closed enum. This is pinned so anyone ADDING a
    // non-editor role to the enum sees this deny-boundary test go red and must decide its
    // authoring scope explicitly. (Source of truth: prisma/schema.prisma `LineageTreeAccessRole`.)
    const editorRoles = ["TREE_ADMIN", "TREE_EDITOR", "BRANCH_EDITOR", "NODE_EDITOR"].sort()
    // Runtime-enumerate the generated enum object to catch a schema addition.
    expect(Object.keys(LineageTreeAccessRole).sort()).toEqual(editorRoles)
  })
})

describe("resolvePromotionEventAuthoringScope — grant hygiene (revoked ignored)", () => {
  it("a REVOKED TREE_ADMIN grant contributes NO scope (revokedAt filtered)", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const tree = await makeLinearTree(tx)
      await grant(tx, {
        userId: user.id,
        treeId: tree.treeId,
        role: "TREE_ADMIN",
        revokedAt: new Date("2020-01-01T00:00:00.000Z"),
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      // The resolver's `explicitAccessWhere` pins `revokedAt: null` on BOTH the tree filter
      // and the accessGrants sub-select — a revoked grant is invisible, no nodes leak.
      expect(scope.fullTreeNodeIds.size).toBe(0)
      expect(scope.scopedNodeIds.size).toBe(0)
    })
  })

  it("an active grant alongside a revoked one keeps ONLY the active scope", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const tree = await makeLinearTree(tx)
      // Revoked TREE_ADMIN (whole tree) + active NODE_EDITOR (single node).
      await grant(tx, {
        userId: user.id,
        treeId: tree.treeId,
        role: "TREE_ADMIN",
        revokedAt: new Date("2020-01-01T00:00:00.000Z"),
      })
      await grant(tx, {
        userId: user.id,
        treeId: tree.treeId,
        role: "NODE_EDITOR",
        nodeId: tree.nodes.mid,
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      // The revoked TREE_ADMIN would have unlocked the whole tree — it must NOT.
      expect(scope.fullTreeNodeIds.size).toBe(0)
      expect(scope.scopedNodeIds.has(tree.nodes.mid)).toBe(true)
      expect(scope.scopedNodeIds.size).toBe(1)
    })
  })
})

describe("resolvePromotionEventAuthoringScope — org-role paths", () => {
  it("an event-authoring role (COACH) puts the org in organizationIds; a STUDENT does not", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const disciplineId = await makeDiscipline(tx)

      const coachOrg = await makeOrg(tx)
      await makeActiveMembershipWithRole(tx, {
        userId: user.id,
        organizationId: coachOrg,
        disciplineId,
        roleCode: "COACH",
      })

      const studentOrg = await makeOrg(tx)
      await makeActiveMembershipWithRole(tx, {
        userId: user.id,
        organizationId: studentOrg,
        disciplineId,
        roleCode: "STUDENT",
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      // COACH is in eventOrganizationRoles → authoring-eligible; STUDENT is not.
      expect(scope.organizationIds.has(coachOrg)).toBe(true)
      expect(scope.organizationIds.has(studentOrg)).toBe(false)
      expect(canAuthorHostOrganization(scope, coachOrg)).toBe(true)
      expect(canAuthorHostOrganization(scope, studentOrg)).toBe(false)
    })
  })

  it("an org OWNER (ownerId) gets the org in organizationIds via the ownership branch", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const ownedOrg = await makeOrg(tx, { ownerId: user.id })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.organizationIds.has(ownedOrg)).toBe(true)
      expect(canAuthorHostOrganization(scope, ownedOrg)).toBe(true)
    })
  })

  it("ONLY OWNER/ORG_ADMIN unlock a full ORGANIZATION-scoped tree; COACH does not", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const disciplineId = await makeDiscipline(tx)
      const org = await makeOrg(tx)
      // COACH is an event-authoring role but NOT an org-admin role.
      await makeActiveMembershipWithRole(tx, {
        userId: user.id,
        organizationId: org,
        disciplineId,
        roleCode: "COACH",
      })

      const orgTree = await makeTree(tx, { scopeType: "ORGANIZATION", organizationId: org })
      const n = await makeNode(tx)
      await makeMember(tx, { treeId: orgTree, nodeId: n.nodeId })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      // COACH → org in organizationIds (authoring), but the ORGANIZATION tree is NOT unlocked
      // (that requires an org-ADMIN role: OWNER/ORG_ADMIN).
      expect(scope.organizationIds.has(org)).toBe(true)
      expect(scope.fullTreeNodeIds.has(n.nodeId)).toBe(false)
      expect(scope.fullTreeNodeIds.size).toBe(0)
    })
  })

  it("an ORG_ADMIN of an ORGANIZATION-scoped tree unlocks the WHOLE tree (org-admin path)", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const disciplineId = await makeDiscipline(tx)
      const org = await makeOrg(tx)
      await makeActiveMembershipWithRole(tx, {
        userId: user.id,
        organizationId: org,
        disciplineId,
        roleCode: "ORG_ADMIN",
      })

      const orgTree = await makeTree(tx, { scopeType: "ORGANIZATION", organizationId: org })
      const a = await makeNode(tx)
      const b = await makeNode(tx)
      await makeMember(tx, { treeId: orgTree, nodeId: a.nodeId })
      await makeMember(tx, { treeId: orgTree, nodeId: b.nodeId })

      // A DIFFERENT org's tree the user has no admin over.
      const otherOrg = await makeOrg(tx)
      const otherTree = await makeTree(tx, {
        scopeType: "ORGANIZATION",
        organizationId: otherOrg,
      })
      const c = await makeNode(tx)
      await makeMember(tx, { treeId: otherTree, nodeId: c.nodeId })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      // Every member node in the admin's org tree is full-tree scoped.
      expect(scope.fullTreeNodeIds.has(a.nodeId)).toBe(true)
      expect(scope.fullTreeNodeIds.has(b.nodeId)).toBe(true)
      // The other org's tree is NOT reachable.
      expect(scope.fullTreeNodeIds.has(c.nodeId)).toBe(false)
    })
  })

  it("an INACTIVE membership (status != ACTIVE) confers no org authority", async () => {
    await inRolledBackTx(async tx => {
      const user = await makeUser(tx)
      const disciplineId = await makeDiscipline(tx)
      const org = await makeOrg(tx)

      // A membership with ORG_ADMIN role but status PENDING — the resolver requires ACTIVE.
      const membership = await tx.membership.create({
        data: {
          id: uid("membership"),
          brand: BRAND,
          status: "PENDING",
          userId: user.id,
          organizationId: org,
          disciplineId,
        },
        select: { id: true },
      })
      const roleId = await makeRole(tx, "ORG_ADMIN")
      await tx.membershipRoleAssignment.create({
        data: { id: uid("mra"), membershipId: membership.id, roleId },
      })

      const scope = await resolvePromotionEventAuthoringScope({ db: tx, brand: BRAND, user })

      expect(scope.organizationIds.has(org)).toBe(false)
      expect(scope.organizationIds.size).toBe(0)
    })
  })
})

describe("resolvePromotionEventAuthoringScope — admin short-circuit", () => {
  it("a global admin gets isGlobalAdmin without touching lineage/org grants", async () => {
    await inRolledBackTx(async tx => {
      const adminUser: AuthzUser = { id: uid("admin"), role: "admin" }

      const scope = await resolvePromotionEventAuthoringScope({
        db: tx,
        brand: BRAND,
        user: adminUser,
      })

      expect(scope.isGlobalAdmin).toBe(true)
      expect(scope.canAuthorHostlessEvents).toBe(true)
      // Admin authors across every tree/org via the pure short-circuit checks.
      expect(canAuthorHostOrganization(scope, "any-org")).toBe(true)
      expect(
        canAuthorRankAward({
          scope,
          award: award({ passport: { lineageNode: { id: "node-anywhere" } } }),
          userId: adminUser.id,
        }),
      ).toBe(true)
    })
  })
})

// =============================================================================
// Pure authorization checks — no DB (SOP §10b adversarial tables).
// =============================================================================

describe("canAuthorRankAward (pure)", () => {
  it("global admin authors any award", () => {
    const scope = pureScope({ isGlobalAdmin: true })
    expect(canAuthorRankAward({ scope, award: award({ awardedById: "x" }), userId: "u" })).toBe(
      true,
    )
  })

  it("self-awarded (awardedById === userId) authors with NO lineage/org grant", () => {
    const scope = pureScope()
    expect(
      canAuthorRankAward({
        scope,
        award: award({ awardedById: "u", passport: { lineageNode: { id: "far-away" } } }),
        userId: "u",
      }),
    ).toBe(true)
  })

  it("org path: award.organizationId in scope.organizationIds authors; a different org denies", () => {
    const scope = pureScope({ organizationIds: new Set(["org-1"]) })
    expect(
      canAuthorRankAward({
        scope,
        award: award({ organizationId: "org-1", passport: { lineageNode: null } }),
        userId: "u",
      }),
    ).toBe(true)
    expect(
      canAuthorRankAward({
        scope,
        award: award({ organizationId: "org-2", passport: { lineageNode: null } }),
        userId: "u",
      }),
    ).toBe(false)
  })

  it("node path: full-tree and scoped node ids author; an unlisted node denies", () => {
    const scope = pureScope({
      fullTreeNodeIds: new Set(["node-full"]),
      scopedNodeIds: new Set(["node-scoped"]),
    })
    expect(
      canAuthorRankAward({
        scope,
        award: award({ passport: { lineageNode: { id: "node-full" } } }),
        userId: "u",
      }),
    ).toBe(true)
    expect(
      canAuthorRankAward({
        scope,
        award: award({ passport: { lineageNode: { id: "node-scoped" } } }),
        userId: "u",
      }),
    ).toBe(true)
    expect(
      canAuthorRankAward({
        scope,
        award: award({ passport: { lineageNode: { id: "node-other" } } }),
        userId: "u",
      }),
    ).toBe(false)
  })

  it("an award whose passport has NO lineage node (and no org/self match) is denied", () => {
    const scope = pureScope({ fullTreeNodeIds: new Set(["node-full"]) })
    expect(
      canAuthorRankAward({
        scope,
        award: award({ passport: { lineageNode: null } }),
        userId: "u",
      }),
    ).toBe(false)
  })
})

describe("canAuthorRankAwards (pure) — batch DENIES if ANY award is out of scope", () => {
  const scope = pureScope({ scopedNodeIds: new Set(["node-ok"]) })
  const inScope = award({ id: "ok", passport: { lineageNode: { id: "node-ok" } } })
  const outOfScope = award({ id: "bad", passport: { lineageNode: { id: "node-bad" } } })

  it("allows a wholly in-scope batch", () => {
    expect(canAuthorRankAwards({ scope, awards: [inScope], userId: "u" })).toBe(true)
  })

  it("denies a batch containing one out-of-scope award", () => {
    expect(canAuthorRankAwards({ scope, awards: [inScope, outOfScope], userId: "u" })).toBe(false)
  })

  it("an empty batch is vacuously allowed (`.every` of [])", () => {
    expect(canAuthorRankAwards({ scope, awards: [], userId: "u" })).toBe(true)
  })
})

describe("canAuthorHostOrganization (pure)", () => {
  it("admin authors any host org; scoped user authors ONLY listed orgs; null/absent denies", () => {
    expect(canAuthorHostOrganization(pureScope({ isGlobalAdmin: true }), "any")).toBe(true)
    const scope = pureScope({ organizationIds: new Set(["org-1"]) })
    expect(canAuthorHostOrganization(scope, "org-1")).toBe(true)
    expect(canAuthorHostOrganization(scope, "org-2")).toBe(false)
    expect(canAuthorHostOrganization(scope, null)).toBe(false)
    expect(canAuthorHostOrganization(scope, undefined)).toBe(false)
  })
})

describe("canAuthorPromotionEvent (pure)", () => {
  it("a no-authority user cannot author (host org set, but not in scope)", () => {
    const scope = pureScope()
    expect(
      canAuthorPromotionEvent({
        scope,
        event: null,
        hostOrganizationId: "org-1",
        awards: [],
        userId: "u",
      }),
    ).toBe(false)
  })

  it("cross-tree award denies even when the caller holds a full-tree grant elsewhere", () => {
    const scope = pureScope({ fullTreeNodeIds: new Set(["node-a"]) })
    expect(
      canAuthorPromotionEvent({
        scope,
        event: null,
        hostOrganizationId: null,
        awards: [award({ passport: { lineageNode: { id: "node-b" } } })],
        userId: "u",
      }),
    ).toBe(false)
  })

  it("authors when the EXISTING event's host org is in scope (event.hostOrganizationId path)", () => {
    const scope = pureScope({ organizationIds: new Set(["org-1"]) })
    expect(
      canAuthorPromotionEvent({
        scope,
        event: { id: "e1", hostOrganizationId: "org-1", rankAwards: [] },
        hostOrganizationId: null,
        awards: [],
        userId: "u",
      }),
    ).toBe(true)
  })

  it("a hostless/awardless NEW event needs canAuthorHostlessEvents (full-tree grant)", () => {
    expect(
      canAuthorPromotionEvent({
        scope: pureScope({ canAuthorHostlessEvents: false }),
        event: null,
        hostOrganizationId: null,
        awards: [],
        userId: "u",
      }),
    ).toBe(false)
    expect(
      canAuthorPromotionEvent({
        scope: pureScope({ canAuthorHostlessEvents: true }),
        event: null,
        hostOrganizationId: null,
        awards: [],
        userId: "u",
      }),
    ).toBe(true)
  })
})

describe("buildAuthorizedRankAwardWhere (pure) — the where must not leak out-of-scope rows", () => {
  it("global admin returns an UNSCOPED where ({}) — all rows", () => {
    expect(
      buildAuthorizedRankAwardWhere({ scope: pureScope({ isGlobalAdmin: true }), userId: "u" }),
    ).toEqual({})
  })

  it("a scoped user's where is a closed OR of ONLY authorized dimensions (own + org + nodes)", () => {
    const scope = pureScope({
      organizationIds: new Set(["org-1"]),
      fullTreeNodeIds: new Set(["node-full"]),
      scopedNodeIds: new Set(["node-scoped"]),
    })

    const where = buildAuthorizedRankAwardWhere({ scope, userId: "u" }) as {
      OR: Array<Record<string, unknown>>
    }

    // Self-award clause is ALWAYS present.
    expect(where.OR).toContainEqual({ awardedById: "u" })
    // Org clause present because organizationIds is non-empty.
    expect(where.OR).toContainEqual({ organizationId: { in: ["org-1"] } })
    // Node clause unions full-tree + scoped ids — and ONLY those.
    const nodeClause = where.OR.find(clause => "passport" in clause) as
      | { passport: { lineageNode: { is: { id: { in: string[] } } } } }
      | undefined
    expect(nodeClause).toBeDefined()
    const nodeIds = nodeClause!.passport.lineageNode.is.id.in
    expect(new Set(nodeIds)).toEqual(new Set(["node-full", "node-scoped"]))
    expect(nodeIds).not.toContain("node-elsewhere")
    // Exactly the three authorized dimensions — no catch-all clause that would widen.
    expect(where.OR).toHaveLength(3)
  })

  it("omits the org clause entirely when the user holds NO org authority (no empty-in widening)", () => {
    const where = buildAuthorizedRankAwardWhere({ scope: pureScope(), userId: "u" }) as {
      OR: Array<Record<string, unknown>>
    }
    // A no-authority user's where is JUST the self-award clause — never a bare OR member
    // that would match all rows.
    expect(where.OR).toEqual([{ awardedById: "u" }])
  })

  it("extraIds add ONLY the explicit ids (current-event awards), nothing broader", () => {
    const where = buildAuthorizedRankAwardWhere({
      scope: pureScope(),
      userId: "u",
      extraIds: ["award-current-1", "award-current-2"],
    }) as { OR: Array<Record<string, unknown>> }

    expect(where.OR).toContainEqual({ id: { in: ["award-current-1", "award-current-2"] } })
    expect(where.OR).toContainEqual({ awardedById: "u" })
    expect(where.OR).toHaveLength(2)
  })
})
