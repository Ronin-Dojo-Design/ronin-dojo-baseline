/**
 * SESSION_0726 ggr pass 1 — security-scope test for `findLineageTreeAccessGrants`.
 *
 * Pins the four-way row-scoping matrix that the shared `treeAdminScopeWhere` helper
 * (server/admin/lineage/tree-admin-scope.ts, extracted in this same pass — FIX 1) now backs:
 *   (a) no session at all                                            → []
 *   (b) a non-admin caller with NO TREE_ADMIN grant on this tree,
 *       including a caller who holds TREE_ADMIN on a DIFFERENT tree
 *       (cross-tree isolation)                                        → []
 *   (c) a platform admin                                              → every active grant on the tree
 *   (d) a TREE_ADMIN of THIS tree                                     → every active grant on the tree
 *
 * Mocking mirrors `server/web/lineage/node-profile-actions.test.ts` (mutable session read
 * live by a `~/lib/auth` module stub); the deny-path-first, cross-tree-isolation-first structure
 * mirrors `server/web/promotion-events/editor-authorization.security.test.ts`.
 *
 * Run: cd apps/web && bun test server/web/lineage/tree-access-queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// `tree-access-queries.ts` is a `server-only` module; that package has no runtime export and
// is unresolvable under bun:test. Stub it BEFORE the dynamic import below pulls it in.
mock.module("server-only", () => ({}))

// Mutable session the mock reads live — each test sets it right before calling the query under test.
type MockSessionUser = { id: string; role?: string } | undefined
let mockSession: { user: MockSessionUser } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

import { db } from "~/services/db"

// Dynamic import AFTER the mocks above register — a static import is hoisted above
// `mock.module`, so both stubs would resolve too late.
const { findLineageTreeAccessGrants } = await import("./tree-access-queries")

// Collision-free ids: a Date.now() timestamp tag, unique per test-file run (no truncated
// near-constant codes here — LineageTree/User/LineageTreeAccess carry no length-capped code
// column, so the full tag is used everywhere).
const TS = Date.now()
const tag = (name: string) => `s0726-tacq-${TS}-${name}`

let treeAId = ""
let treeBId = ""
let treeAdminUserId = ""
let treeEditorUserId = ""
let crossTreeAdminUserId = ""
let plainUserId = ""
const grantAdminAId = tag("grant-admin-a")
const grantEditorAId = tag("grant-editor-a")
const grantAdminBId = tag("grant-admin-b")

beforeAll(async () => {
  const [treeAdminUser, treeEditorUser, crossTreeAdminUser, plainUser] = await Promise.all([
    db.user.create({
      data: {
        id: tag("tree-admin"),
        name: tag("Tree Admin"),
        email: `${tag("tree-admin")}@test.local`,
      },
      select: { id: true },
    }),
    db.user.create({
      data: {
        id: tag("tree-editor"),
        name: tag("Tree Editor"),
        email: `${tag("tree-editor")}@test.local`,
      },
      select: { id: true },
    }),
    db.user.create({
      data: {
        id: tag("cross-tree-admin"),
        name: tag("Cross Tree Admin"),
        email: `${tag("cross-tree-admin")}@test.local`,
      },
      select: { id: true },
    }),
    db.user.create({
      data: { id: tag("plain"), name: tag("Plain User"), email: `${tag("plain")}@test.local` },
      select: { id: true },
    }),
  ])
  treeAdminUserId = treeAdminUser.id
  treeEditorUserId = treeEditorUser.id
  crossTreeAdminUserId = crossTreeAdminUser.id
  plainUserId = plainUser.id

  const [treeA, treeB] = await Promise.all([
    db.lineageTree.create({
      data: { id: tag("tree-a"), brand: "BBL", slug: tag("tree-a"), name: tag("Tree A") },
      select: { id: true },
    }),
    db.lineageTree.create({
      data: { id: tag("tree-b"), brand: "BBL", slug: tag("tree-b"), name: tag("Tree B") },
      select: { id: true },
    }),
  ])
  treeAId = treeA.id
  treeBId = treeB.id

  await Promise.all([
    db.lineageTreeAccess.create({
      data: { id: grantAdminAId, treeId: treeAId, userId: treeAdminUserId, role: "TREE_ADMIN" },
    }),
    db.lineageTreeAccess.create({
      data: { id: grantEditorAId, treeId: treeAId, userId: treeEditorUserId, role: "TREE_EDITOR" },
    }),
    // A TREE_ADMIN grant that lives on the OTHER tree — proves cross-tree isolation (case b).
    db.lineageTreeAccess.create({
      data: {
        id: grantAdminBId,
        treeId: treeBId,
        userId: crossTreeAdminUserId,
        role: "TREE_ADMIN",
      },
    }),
  ])
})

afterAll(async () => {
  await db.lineageTreeAccess.deleteMany({ where: { treeId: { in: [treeAId, treeBId] } } })
  await db.lineageTree.deleteMany({ where: { id: { in: [treeAId, treeBId] } } })
  await db.user.deleteMany({
    where: { id: { in: [treeAdminUserId, treeEditorUserId, crossTreeAdminUserId, plainUserId] } },
  })
})

describe("findLineageTreeAccessGrants — row-scoping security matrix", () => {
  it("(a) no session at all → []", async () => {
    mockSession = null
    const grants = await findLineageTreeAccessGrants(treeAId)
    expect(grants).toEqual([])
  })

  it("(b) a non-admin caller with no TREE_ADMIN grant on this tree → []", async () => {
    mockSession = { user: { id: plainUserId, role: "user" } }
    const grants = await findLineageTreeAccessGrants(treeAId)
    expect(grants).toEqual([])
  })

  it("(b) a TREE_ADMIN of a DIFFERENT tree does not leak into this tree (cross-tree isolation) → []", async () => {
    mockSession = { user: { id: crossTreeAdminUserId, role: "user" } }
    const grants = await findLineageTreeAccessGrants(treeAId)
    expect(grants).toEqual([])
  })

  it("(c) a platform admin sees every active grant on the tree", async () => {
    mockSession = { user: { id: tag("some-admin"), role: "admin" } }
    const grants = await findLineageTreeAccessGrants(treeAId)
    expect(grants.map(g => g.id).sort()).toEqual([grantAdminAId, grantEditorAId].sort())
  })

  it("(d) a TREE_ADMIN of this tree sees the tree's grants", async () => {
    mockSession = { user: { id: treeAdminUserId, role: "user" } }
    const grants = await findLineageTreeAccessGrants(treeAId)
    expect(grants.map(g => g.id).sort()).toEqual([grantAdminAId, grantEditorAId].sort())
  })
})
