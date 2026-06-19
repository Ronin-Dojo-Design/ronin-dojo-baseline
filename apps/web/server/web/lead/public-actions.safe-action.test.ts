/**
 * SESSION_0412 FIX #4 + #2 — createJoinLegacyInterest (Join the Legacy) tests.
 *
 * `createJoinLegacyInterest` is a `publicActionClient` action: NO auth is
 * required. The session is read only to decide whether to persist a
 * LineageClaimRequest. Two recent behaviors are pinned here:
 *
 *   #4  A submission that claims an EXISTING claimable node must NOT spawn a
 *       second pending "Legacy Profile" Tool (a duplicate identity). The pure
 *       lead path (no node / non-claimable node / empty nodeId) still creates
 *       the Tool.
 *   #2  `claimRequiresSignIn` is true ONLY when the submission IS a claim of an
 *       existing claimable node AND the user is signed out — that's the
 *       sign-in handoff signal the join page uses.
 *
 * This action fires `notifyUserOfBblJoinLegacy` + `notifyAdminOfBblJoinLegacy`
 * inside `after()`. Those hit Resend (live sends on `bun test` — project
 * gotcha). We stub `~/lib/notifications` BEFORE importing the action so NO
 * email leaves the box.
 *
 * Run: cd apps/web && bun test server/web/lead/public-actions.safe-action.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install the standard §3 mock seams (next/headers, next/cache, ~/lib/auth,
// next/server-inline-after, ~/lib/rate-limiter, ~/lib/brand-context) BEFORE any
// import of the action / server modules. Brand=BBL — the action looks up the
// brand's Organization and the whole Join-the-Legacy surface is BBL.
installSafeActionMocks({ brand: "BBL", host: "blackbeltlegacy.com" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { mock } from "bun:test"

// (The harness already provides getRequestOrigin + a unique per-run x-forwarded-for
// IP, so no brand-context / next/headers re-mock is needed here — see safe-action-env.)

// CRITICAL: stub the email seam BEFORE importing the action. `bun test` fires
// REAL Resend sends otherwise (project memory: unit tests send real emails).
// These no-ops keep the `after()` notify calls from touching the network.
mock.module("~/lib/notifications", () => ({
  notifyUserOfBblJoinLegacy: async () => {},
  notifyAdminOfBblJoinLegacy: async () => {},
}))

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { createJoinLegacyInterest } from "~/server/web/lead/public-actions"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const PREFIX = `session-0412-jli-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

let claimTreeId = ""
let claimNodeId = ""
let claimantUserId = ""

/** A claimable member node (accountless Passport) in a published+claimable BBL tree. */
const createClaimFixture = async () => {
  const nodePassport = await db.passport.create({
    data: { displayName: tag("node-passport") },
    select: { id: true },
  })

  const node = await db.lineageNode.create({
    data: {
      passportId: nodePassport.id,
      slug: tag("node"),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
    select: { id: true },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree"),
      name: tag("tree"),
      visibility: "PUBLIC",
      isPublished: true,
      isClaimable: true,
      scopeType: "DISCIPLINE",
    },
    select: { id: true },
  })

  await db.lineageTreeMember.create({
    data: {
      id: tag("member"),
      treeId: tree.id,
      nodeId: node.id,
      isClaimable: true,
      visualSortOrder: 0,
    },
  })

  claimTreeId = tree.id
  claimNodeId = node.id
}

beforeAll(async () => {
  // The action throws if no Organization exists for the brand — guarantee one
  // exists. The action selects the brand's OLDEST org, so on a populated dev DB
  // this fixture may not be the one chosen; that's fine — we only need a BBL org
  // to exist so the action doesn't throw.
  await db.organization.create({
    data: {
      brand: TEST_BRAND,
      name: tag("org"),
      slug: tag("org"),
    },
  })

  const claimant = await db.user.create({
    data: { id: tag("claimant"), name: tag("claimant"), email: `${tag("claimant")}@test.local` },
    select: { id: true },
  })
  claimantUserId = claimant.id

  await createClaimFixture()
})

afterAll(async () => {
  setTestSession(null)

  // Two-phase, cascade-aware cleanup (reverse dependency order). Phase 1 sweeps
  // this run's tagged rows; the prefix match also drains zombies from any
  // crashed prior run with the same PREFIX shape.
  await db.lineageClaimEvidence
    .deleteMany({ where: { claimRequest: { treeId: { startsWith: PREFIX } } } })
    .catch(() => {})
  await db.lineageClaimRequest.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { slug: { startsWith: PREFIX } } })

  // Tools the action created carry the tagged submitter email; sweep by that.
  await db.tool.deleteMany({ where: { submitterEmail: { contains: PREFIX } } })
  // Leads the action created carry the tagged submitter email.
  await db.lead.deleteMany({ where: { email: { contains: PREFIX } } })

  await db.passport.deleteMany({ where: { displayName: { startsWith: PREFIX } } })
  await db.organization.deleteMany({ where: { slug: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
})

/** Minimal valid input for the action's schema; per-case overrides on top. */
const baseInput = (submitter: string) => ({
  firstName: "Test",
  lastName: submitter,
  email: `${tag(submitter)}@test.local`,
  role: "STUDENT" as const,
  membershipPath: "FREE" as const,
})

describe("createJoinLegacyInterest (wrapped publicActionClient)", () => {
  // NOTE: there is no "unauthenticated" gate to assert here — this is a
  // publicActionClient action with NO auth requirement, so the §5b
  // "User not authenticated" case is N/A and intentionally omitted.

  it("pure lead (no node, signed out): creates Lead + pending Tool; no claim; claimRequiresSignIn false", async () => {
    setTestSession(null)
    const submitter = "pure-lead"

    const result = await createJoinLegacyInterest(baseInput(submitter))

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.leadId).toBeTruthy()
    expect(result?.data?.toolSlug).not.toBeNull()
    expect(result?.data?.claimRequiresSignIn).toBe(false)
    expect(result?.data?.claimCreated).toBe(false)

    const [lead, tool, claimCount] = await Promise.all([
      db.lead.findUnique({ where: { id: result!.data!.leadId } }),
      db.tool.findUnique({ where: { slug: result!.data!.toolSlug! } }),
      db.lineageClaimRequest.count({ where: { claimantUserId } }),
    ])

    expect(lead?.brand).toBe(TEST_BRAND)
    // The action picks the brand's oldest Organization (orderBy createdAt asc),
    // which may be a pre-existing dev-DB row, not our fixture — just assert it
    // resolved one.
    expect(lead?.organizationId).toBeTruthy()
    expect(tool?.status).toBe("Pending")
    // No node was targeted, so no claim could be created.
    expect(claimCount).toBe(0)
  })

  it("claim of existing node, signed OUT: no Tool; claimRequiresSignIn true; toolSlug null; no claim", async () => {
    setTestSession(null)
    const submitter = "claim-signed-out"

    const result = await createJoinLegacyInterest({
      ...baseInput(submitter),
      treeId: claimTreeId,
      nodeId: claimNodeId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.toolSlug).toBeNull()
    expect(result?.data?.claimRequiresSignIn).toBe(true)
    expect(result?.data?.claimCreated).toBe(false)

    // #4: claiming an existing node must NOT spawn a duplicate placeholder Tool.
    const toolCount = await db.tool.count({
      where: { submitterEmail: `${tag(submitter)}@test.local` },
    })
    expect(toolCount).toBe(0)

    // Signed out → no LineageClaimRequest is persisted.
    const claimCount = await db.lineageClaimRequest.count({
      where: { treeId: claimTreeId, nodeId: claimNodeId },
    })
    expect(claimCount).toBe(0)
  })

  it("claim of existing node, signed IN: no duplicate Tool; LineageClaimRequest PENDING created; claimRequiresSignIn false", async () => {
    setTestSession({ id: claimantUserId })
    const submitter = "claim-signed-in"

    const result = await createJoinLegacyInterest({
      ...baseInput(submitter),
      treeId: claimTreeId,
      nodeId: claimNodeId,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.toolSlug).toBeNull()
    expect(result?.data?.claimRequiresSignIn).toBe(false)
    expect(result?.data?.claimCreated).toBe(true)

    // #4: still no duplicate placeholder Tool.
    const toolCount = await db.tool.count({
      where: { submitterEmail: `${tag(submitter)}@test.local` },
    })
    expect(toolCount).toBe(0)

    // A PENDING claim IS persisted for the signed-in claimant.
    const claim = await db.lineageClaimRequest.findFirst({
      where: { treeId: claimTreeId, nodeId: claimNodeId, claimantUserId },
    })
    expect(claim).not.toBeNull()
    expect(claim?.status).toBe("PENDING")
  })

  it("empty-string nodeId (form default) is treated as no-claim: Tool created, claimRequiresSignIn false, meta.claimIntent false", async () => {
    setTestSession(null)
    const submitter = "empty-node"

    const result = await createJoinLegacyInterest({
      ...baseInput(submitter),
      treeId: "",
      nodeId: "",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.toolSlug).not.toBeNull()
    expect(result?.data?.claimRequiresSignIn).toBe(false)
    expect(result?.data?.claimCreated).toBe(false)

    // The §11 nit: empty-string nodeId must NOT register as a claim intent.
    const lead = await db.lead.findUnique({ where: { id: result!.data!.leadId } })
    const meta = lead?.meta as Record<string, unknown> | null
    expect(meta?.claimIntent).toBe(false)
  })
})
