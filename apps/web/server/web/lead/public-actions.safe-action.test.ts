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
// Capture the env so each test can claim a FRESH IP — the action rate-limits to
// 5 submissions per IP/hour, and this file fires more than 5, so a shared IP
// would trip the limiter (SESSION_0418).
const safeActionEnv = installSafeActionMocks({ brand: "BBL", host: "blackbeltlegacy.com" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { mock } from "bun:test"

// (The harness already provides getRequestOrigin + a unique per-run x-forwarded-for
// IP, so no brand-context / next/headers re-mock is needed here — see safe-action-env.)

// CRITICAL: stub the email seam BEFORE importing the action. `bun test` fires
// REAL Resend sends otherwise (project memory: unit tests send real emails).
// These record-only stubs keep the `after()` notify calls from touching the
// network AND let us assert WHICH email fired per branch (SESSION_0418).
type NotifyCall = { fn: string; to?: string; isLifetime?: boolean; profileName?: string }
const notifyCalls: NotifyCall[] = []
mock.module("~/lib/notifications", () => ({
  notifyUserOfBblJoinLegacy: async (p: { to: string }) => {
    notifyCalls.push({ fn: "notifyUserOfBblJoinLegacy", to: p.to })
  },
  notifyAdminOfBblJoinLegacy: async (p: { to: string }) => {
    notifyCalls.push({ fn: "notifyAdminOfBblJoinLegacy", to: p.to })
  },
  notifyMemberOfBblClaimYourProfile: async (p: {
    to: string
    isLifetime?: boolean
    profileName?: string
  }) => {
    notifyCalls.push({
      fn: "notifyMemberOfBblClaimYourProfile",
      to: p.to,
      isLifetime: p.isLifetime,
      profileName: p.profileName,
    })
  },
  notifyUserOfBblFreeSignup: async (p: { to: string }) => {
    notifyCalls.push({ fn: "notifyUserOfBblFreeSignup", to: p.to })
  },
  notifyFounderOfTheLongRoad: async (p: { to: string }) => {
    notifyCalls.push({ fn: "notifyFounderOfTheLongRoad", to: p.to })
  },
}))

// Stub the magic-link minter so `after()` never calls Better Auth / writes a
// real verification token. Record the destination so we can assert claim vs /me.
// The action also imports the path helpers from this module, so re-export them.
const mintCalls: Array<{ email: string; nextPath: string }> = []
mock.module("~/server/web/lineage/mint-claim-magic-link", () => ({
  claimAcceptNextPath: (nodeId: string) => `/lineage/claim/accept?node=${nodeId}`,
  FREE_SIGNUP_NEXT_PATH: "/me",
  mintClaimMagicLink: async (opts: { email: string; nextPath: string }) => {
    mintCalls.push({ email: opts.email, nextPath: opts.nextPath })
    return `https://blackbeltlegacy.com/api/auth/magic-link/verify?token=stub&callbackURL=stub`
  },
}))

/** Find the most recent notify call to a given recipient. */
const notifyTo = (to: string) => notifyCalls.filter(c => c.to === to)
const mintTo = (email: string) => mintCalls.filter(c => c.email === email)

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { BBL_FOUNDER_NODE_SLUG, DIRTY_DOZEN_LABEL } from "~/lib/lineage/dirty-dozen"
import { createJoinLegacyInterest } from "~/server/web/lead/public-actions"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const PREFIX = `session-0412-jli-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

let claimTreeId = ""
let claimNodeId = ""
let claimantUserId = ""

// Dirty-Dozen fixture (lifetime comp) — a node whose member carries the seeded cohort label.
let dozenTreeId = ""
let dozenNodeId = ""

// Founder fixture (Bob Bass, slug `bob-bass`). Created best-effort: if the dev DB already
// seeded a `bob-bass` node the unique slug collides, so we soft-skip the founder positive case.
let founderTreeId = ""
let founderNodeId = ""

type ClaimFixtureOptions = {
  /** Suffix so each fixture's tagged rows are unique. */
  key: string
  /** Display name for the node's placeholder Passport — surfaces as the claim email profileName. */
  displayName?: string
  /** When set, the member is tagged into a visual group with this label (e.g. the Dirty Dozen). */
  visualGroupLabel?: string
  /** Override the node slug (the founder fixture needs the exact `bob-bass` slug). */
  slug?: string
}

/** A claimable member node (accountless Passport) in a published+claimable BBL tree. */
const createClaimFixture = async (options: ClaimFixtureOptions) => {
  const { key } = options
  const nodePassport = await db.passport.create({
    data: { displayName: options.displayName ?? tag(`${key}-node-passport`) },
    select: { id: true },
  })

  const node = await db.lineageNode.create({
    data: {
      passportId: nodePassport.id,
      slug: options.slug ?? tag(`${key}-node`),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
    select: { id: true },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag(`${key}-tree`),
      brand: TEST_BRAND,
      slug: tag(`${key}-tree`),
      name: tag(`${key}-tree`),
      visibility: "PUBLIC",
      isPublished: true,
      isClaimable: true,
      scopeType: "DISCIPLINE",
    },
    select: { id: true },
  })

  let visualGroupId: string | undefined
  if (options.visualGroupLabel) {
    const group = await db.lineageVisualGroup.create({
      data: {
        treeId: tree.id,
        label: options.visualGroupLabel,
        groupType: "PROMOTION_DATE",
      },
      select: { id: true },
    })
    visualGroupId = group.id
  }

  await db.lineageTreeMember.create({
    data: {
      id: tag(`${key}-member`),
      treeId: tree.id,
      nodeId: node.id,
      isClaimable: true,
      visualSortOrder: 0,
      visualGroupId,
    },
  })

  return { treeId: tree.id, nodeId: node.id }
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

  const ordinary = await createClaimFixture({ key: "ord", displayName: tag("Chayce Johnson") })
  claimTreeId = ordinary.treeId
  claimNodeId = ordinary.nodeId

  const dozen = await createClaimFixture({
    key: "dozen",
    displayName: tag("Dozen Member"),
    visualGroupLabel: DIRTY_DOZEN_LABEL,
  })
  dozenTreeId = dozen.treeId
  dozenNodeId = dozen.nodeId

  // Founder: the node MUST carry the exact `bob-bass` slug for deterministic detection. On a
  // dev DB already seeded with that node the create collides — soft-skip rather than fail.
  try {
    const founder = await createClaimFixture({
      key: "founder",
      displayName: tag("Bob Bass"),
      visualGroupLabel: DIRTY_DOZEN_LABEL,
      slug: BBL_FOUNDER_NODE_SLUG,
    })
    founderTreeId = founder.treeId
    founderNodeId = founder.nodeId
  } catch {
    console.warn("[test] founder fixture skipped — `bob-bass` slug already present in this DB")
  }
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
  // P5 (ADR 0036): the lead door now writes PassportClaimRequest — sweep it (+ evidence)
  // by the same tagged treeId so signed-in reruns start clean.
  await db.passportClaimEvidence
    .deleteMany({ where: { claimRequest: { treeId: { startsWith: PREFIX } } } })
    .catch(() => {})
  await db.passportClaimRequest.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageVisualGroup.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { slug: { startsWith: PREFIX } } })
  // The founder node carries the literal `bob-bass` slug (not PREFIX-tagged) — sweep it by id,
  // but only the one THIS run created (guarded by founderNodeId so a seeded node is never touched).
  if (founderNodeId) {
    await db.lineageNode.deleteMany({ where: { id: founderNodeId } }).catch(() => {})
  }

  // Tools the action created carry the tagged submitter email; sweep by that.
  await db.tool.deleteMany({ where: { submitterEmail: { contains: PREFIX } } })
  // Leads the action created carry the tagged submitter email.
  await db.lead.deleteMany({ where: { email: { contains: PREFIX } } })

  await db.passport.deleteMany({ where: { displayName: { startsWith: PREFIX } } })
  await db.organization.deleteMany({ where: { slug: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
})

// Each test claims a fresh IP so the 5-per-IP/hour submission limiter never bites
// across this file's >5 submissions.
let ipSeq = 0
beforeEach(() => {
  ipSeq += 1
  safeActionEnv.setIp(`jli-${TS}-${ipSeq}`)
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
      // P5 (ADR 0036): the lead door now writes the unified PassportClaimRequest.
      db.passportClaimRequest.count({ where: { claimantUserId } }),
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

    // Signed out → no claim is persisted yet (the emailed magic link finishes it).
    const claimCount = await db.passportClaimRequest.count({
      where: { treeId: claimTreeId, nodeId: claimNodeId },
    })
    expect(claimCount).toBe(0)

    // SESSION_0418: the guest now gets a branded claim magic link (no sign-in bounce).
    const email = `${tag(submitter)}@test.local`
    const minted = mintTo(email)
    expect(minted).toHaveLength(1)
    expect(minted[0]?.nextPath).toBe(`/lineage/claim/accept?node=${claimNodeId}`)

    const sent = notifyTo(email).map(c => c.fn)
    expect(sent).toContain("notifyMemberOfBblClaimYourProfile")
    expect(sent).toContain("notifyAdminOfBblJoinLegacy")
    // The generic confirmation must NOT fire on the guest-claim path.
    expect(sent).not.toContain("notifyUserOfBblJoinLegacy")

    // Non-Dirty-Dozen node → one free year (isLifetime false), profileName from the node Passport.
    const claimEmail = notifyTo(email).find(c => c.fn === "notifyMemberOfBblClaimYourProfile")
    expect(claimEmail?.isLifetime).toBe(false)
    expect(claimEmail?.profileName).toBe(tag("Chayce Johnson"))
  })

  it("Dirty-Dozen node, signed OUT: claim email mints lifetime comp (isLifetime true)", async () => {
    setTestSession(null)
    const submitter = "dozen-claim"
    const email = `${tag(submitter)}@test.local`

    const result = await createJoinLegacyInterest({
      ...baseInput(submitter),
      treeId: dozenTreeId,
      nodeId: dozenNodeId,
    })

    expect(result?.serverError).toBeUndefined()

    const minted = mintTo(email)
    expect(minted).toHaveLength(1)
    expect(minted[0]?.nextPath).toBe(`/lineage/claim/accept?node=${dozenNodeId}`)

    const claimEmail = notifyTo(email).find(c => c.fn === "notifyMemberOfBblClaimYourProfile")
    expect(claimEmail).toBeDefined()
    // Dirty Dozen cohort → lifetime Elite.
    expect(claimEmail?.isLifetime).toBe(true)
  })

  it("free signup, no node, signed OUT: mints a /me magic link + free-signup verify email (no claim email)", async () => {
    setTestSession(null)
    const submitter = "free-signup"
    const email = `${tag(submitter)}@test.local`

    const result = await createJoinLegacyInterest(baseInput(submitter))

    expect(result?.serverError).toBeUndefined()
    // No node selected → a placeholder Tool is still created, and isFounder is false.
    expect(result?.data?.toolSlug).not.toBeNull()
    expect(result?.data?.isFounder).toBe(false)

    const minted = mintTo(email)
    expect(minted).toHaveLength(1)
    expect(minted[0]?.nextPath).toBe("/me")

    const sent = notifyTo(email).map(c => c.fn)
    expect(sent).toContain("notifyUserOfBblFreeSignup")
    expect(sent).toContain("notifyAdminOfBblJoinLegacy")
    expect(sent).not.toContain("notifyMemberOfBblClaimYourProfile")
  })

  it("claim of existing node, signed IN: no duplicate Tool; PassportClaimRequest PENDING created; claimRequiresSignIn false", async () => {
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

    // A PENDING unified claim IS persisted for the signed-in claimant — keyed on the
    // node's Passport (identity SoT), with node/tree context back-filled.
    const claim = await db.passportClaimRequest.findFirst({
      where: { treeId: claimTreeId, nodeId: claimNodeId, claimantUserId },
    })
    expect(claim).not.toBeNull()
    expect(claim?.status).toBe("PENDING")

    // SESSION_0418: signed-in users keep the immediate claim — NO magic link is minted,
    // and the generic confirmation (not the claim email) fires.
    const email = `${tag(submitter)}@test.local`
    expect(mintTo(email)).toHaveLength(0)
    const sent = notifyTo(email).map(c => c.fn)
    expect(sent).toContain("notifyUserOfBblJoinLegacy")
    expect(sent).not.toContain("notifyMemberOfBblClaimYourProfile")
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

  it("founder (Bob Bass) claim, signed OUT: isFounder true + lifetime claim email", async () => {
    if (!founderNodeId) {
      console.warn("[test] skipping founder positive case — fixture unavailable")
      return
    }
    setTestSession(null)
    const submitter = "founder-claim"
    const email = `${tag(submitter)}@test.local`

    const result = await createJoinLegacyInterest({
      ...baseInput(submitter),
      treeId: founderTreeId,
      nodeId: founderNodeId,
    })

    expect(result?.serverError).toBeUndefined()
    // The founder is detected deterministically off the `bob-bass` node slug.
    expect(result?.data?.isFounder).toBe(true)

    // He still gets the branded claim magic link.
    const minted = mintTo(email)
    expect(minted).toHaveLength(1)

    // The founder receives "The Long Road" letter — NOT the generic claim email.
    const sent = notifyTo(email).map(c => c.fn)
    expect(sent).toContain("notifyFounderOfTheLongRoad")
    expect(sent).not.toContain("notifyMemberOfBblClaimYourProfile")
  })
})
