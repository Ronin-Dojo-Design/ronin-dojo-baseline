/**
 * SESSION_0438 P5 (ADR 0036) — admin person-claim queue queries.
 *
 * Run: cd apps/web && bun test server/admin/lineage/claim-queries.test.ts
 *
 * Pins the P5 repoint: `findPendingClaims`/`findClaimById` read PassportClaimRequest,
 * and — the un-stub win — a **directory-only person claim with no node/tree** now
 * SURFACES in the queue (the old `tree.brand` scope dropped node-less claims). Brand
 * comes off the claim column directly, so it's still brand-scoped without a tree.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { mock } from "bun:test"

// `claim-queries.ts` is a `server-only` module; that package has no runtime export and
// is unresolvable under bun:test. Stub it BEFORE the static import below pulls it in.
mock.module("server-only", () => ({}))

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { db } from "~/services/db"

// Dynamic import AFTER the mock above — a static import is hoisted above mock.module,
// so `server-only` would resolve (and fail) before the stub registers.
const { findClaimById, findPendingClaims } = await import("./claim-queries")

const TS = Date.now()
const tag = (name: string) => `s0438-cq-${TS}-${name}`

let claimantUserId = ""
let placeholderPassportId = ""
let nodelessClaimId = ""
// Slice V5 (SESSION_0491): a member's own belt-promotion claim in the same queue.
let memberPassportId = ""
let promotionClaimId = ""
let promotionRankName = ""
let evidenceMediaId = ""
let evidenceMediaUrl = ""

beforeAll(async () => {
  const claimant = await db.user.create({
    data: { id: tag("claimant"), name: tag("Claimant"), email: `${tag("claimant")}@test.local` },
    select: { id: true },
  })
  claimantUserId = claimant.id

  // A claimable directory-only placeholder Passport — NO lineage node, NO tree.
  const placeholder = await db.passport.create({
    data: { id: tag("placeholder"), displayName: tag("Directory Only Person") },
    select: { id: true },
  })
  placeholderPassportId = placeholder.id

  const claim = await db.passportClaimRequest.create({
    data: {
      passportId: placeholder.id,
      claimantUserId: claimant.id,
      brand: "BBL",
      status: "PENDING",
      claimantNote: tag("note"),
      evidence: { create: [{ label: tag("ev"), text: "proof" }] },
    },
    select: { id: true },
  })
  nodelessClaimId = claim.id

  // --- Slice V5 fixtures: a RANK_PROMOTION claim (member's own Passport + asserted belt +
  // photo evidence carried as a Media join on the evidence row). Uses a seeded BJJ rank.
  const memberPassport = await db.passport.create({
    data: { id: tag("member-passport"), displayName: tag("Promoting Member"), userId: claimant.id },
    select: { id: true },
  })
  memberPassportId = memberPassport.id

  const rank = await db.rank.findFirst({
    where: { rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true, name: true },
  })
  if (!rank) throw new Error("Test requires a seeded BJJ rank")
  promotionRankName = rank.name

  const media = await db.media.create({
    data: {
      id: tag("media"),
      brand: "BBL",
      type: "IMAGE",
      url: `https://example.com/${tag("cert")}.jpg`,
      uploadedById: claimant.id,
    },
    select: { id: true, url: true },
  })
  evidenceMediaId = media.id
  evidenceMediaUrl = media.url

  const promotion = await db.passportClaimRequest.create({
    data: {
      type: "RANK_PROMOTION",
      passportId: memberPassport.id,
      claimantUserId: claimant.id,
      brand: "BBL",
      status: "PENDING",
      claimedRankId: rank.id,
      evidence: { create: [{ label: "Certificate photo", mediaId: media.id }] },
    },
    select: { id: true },
  })
  promotionClaimId = promotion.id
})

afterAll(async () => {
  await db.passportClaimEvidence
    .deleteMany({
      where: { claimRequest: { passportId: { in: [placeholderPassportId, memberPassportId] } } },
    })
    .catch(() => {})
  await db.passportClaimRequest.deleteMany({
    where: { passportId: { in: [placeholderPassportId, memberPassportId] } },
  })
  await db.media.deleteMany({ where: { id: evidenceMediaId } })
  await db.passport.deleteMany({ where: { id: { in: [placeholderPassportId, memberPassportId] } } })
  await db.user.deleteMany({ where: { id: claimantUserId } })
})

describe("admin person-claim queue (PassportClaimRequest, P5)", () => {
  it("findPendingClaims surfaces a node-less directory-person claim with the Passport name", async () => {
    const claims = await findPendingClaims()
    const row = claims.find(c => c.id === nodelessClaimId)

    expect(row).toBeDefined()
    // Display name resolves off the Passport (identity SoT), not node.passport.
    expect(row?.passport.displayName).toBe(tag("Directory Only Person"))
    // A directory-only claim carries no node/tree context — and is no longer dropped.
    expect(row?.node).toBeNull()
    expect(row?.tree).toBeNull()
    expect(row?.status).toBe("PENDING")
  })

  it("findClaimById returns the unified detail (passport name + evidence) for a node-less claim", async () => {
    const detail = await findClaimById(nodelessClaimId)

    expect(detail).not.toBeNull()
    expect(detail?.passport.displayName).toBe(tag("Directory Only Person"))
    expect(detail?.tree).toBeNull()
    expect(detail?.node).toBeNull()
    expect(detail?.evidence).toHaveLength(1)
    expect(detail?.evidence[0]?.label).toBe(tag("ev"))
  })

  // --- Slice V5 (SESSION_0491): RANK_PROMOTION rows carry belt context ----------------------

  it("findPendingClaims surfaces a RANK_PROMOTION row with type + claimedRank populated", async () => {
    const claims = await findPendingClaims()
    const row = claims.find(c => c.id === promotionClaimId)

    expect(row).toBeDefined()
    expect(row?.type).toBe("RANK_PROMOTION")
    expect(row?.claimedRank?.name).toBe(promotionRankName)
    // colorHex is selected (may be null for an unstyled rank — the swatch falls back).
    expect(row?.claimedRank).toHaveProperty("colorHex")
    // Identity rows still carry their (default) type — additive select, no behavior change.
    const identityRow = claims.find(c => c.id === nodelessClaimId)
    expect(identityRow?.type).toBe("IDENTITY")
  })

  it("findClaimById joins evidence media so promotion photos can render", async () => {
    const detail = await findClaimById(promotionClaimId)

    expect(detail).not.toBeNull()
    expect(detail?.type).toBe("RANK_PROMOTION")
    expect(detail?.claimedRank?.name).toBe(promotionRankName)
    expect(detail?.evidence).toHaveLength(1)
    expect(detail?.evidence[0]?.media?.url).toBe(evidenceMediaUrl)
    expect(detail?.evidence[0]?.media?.type).toBe("IMAGE")
  })
})
