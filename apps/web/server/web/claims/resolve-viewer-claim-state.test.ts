/**
 * SESSION_0440 "Full A" (ADR 0036) — viewer claim-state resolver tests.
 *
 * Run: cd apps/web && bun test server/web/claims/resolve-viewer-claim-state.test.ts
 *
 * Two layers:
 *   - `deriveClaimViewerState` — the pure 5-row state machine, exhaustive + fast.
 *   - `resolveViewerClaimStates` — integration against the dev DB, proving the two
 *     indexed queries feed the machine correctly (and that ANOTHER user's pending
 *     claim never leaks into the viewer's state).
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// Mock next/cache (pulled in via the import chain).
mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

import { db } from "~/services/db"
import {
  CLAIM_VIEWER_STATE,
  deriveClaimViewerState,
  resolveViewerClaimState,
  resolveViewerClaimStates,
} from "./resolve-viewer-claim-state"

const VIEWER = "viewer-1"
const OTHER = "other-1"

describe("deriveClaimViewerState — the 5-row CTA machine", () => {
  it("row 1: unclaimed, no pending, SIGNED OUT → UNCLAIMED", () => {
    expect(
      deriveClaimViewerState({
        passportUserId: null,
        viewerUserId: null,
        viewerHasOpenClaim: false,
      }),
    ).toBe(CLAIM_VIEWER_STATE.UNCLAIMED)
  })

  it("row 1: unclaimed, no pending, SIGNED IN → UNCLAIMED", () => {
    expect(
      deriveClaimViewerState({
        passportUserId: null,
        viewerUserId: VIEWER,
        viewerHasOpenClaim: false,
      }),
    ).toBe(CLAIM_VIEWER_STATE.UNCLAIMED)
  })

  it("row 2: unclaimed, I have a PENDING claim → PENDING_MINE", () => {
    expect(
      deriveClaimViewerState({
        passportUserId: null,
        viewerUserId: VIEWER,
        viewerHasOpenClaim: true,
      }),
    ).toBe(CLAIM_VIEWER_STATE.PENDING_MINE)
  })

  it("row 3: unclaimed, someone ELSE pending (none mine) → UNCLAIMED (other claim never exposed)", () => {
    // By construction the resolver only ever sets viewerHasOpenClaim for the viewer's
    // own claims, so "someone else pending" is indistinguishable from "no pending".
    expect(
      deriveClaimViewerState({
        passportUserId: null,
        viewerUserId: VIEWER,
        viewerHasOpenClaim: false,
      }),
    ).toBe(CLAIM_VIEWER_STATE.UNCLAIMED)
  })

  it("row 4: claimed by me → CLAIMED_MINE", () => {
    expect(
      deriveClaimViewerState({
        passportUserId: VIEWER,
        viewerUserId: VIEWER,
        viewerHasOpenClaim: false,
      }),
    ).toBe(CLAIM_VIEWER_STATE.CLAIMED_MINE)
  })

  it("row 5: claimed by someone else → CLAIMED_OTHER", () => {
    expect(
      deriveClaimViewerState({
        passportUserId: OTHER,
        viewerUserId: VIEWER,
        viewerHasOpenClaim: false,
      }),
    ).toBe(CLAIM_VIEWER_STATE.CLAIMED_OTHER)
  })

  it("claimed Passport viewed while SIGNED OUT → CLAIMED_OTHER (not mine)", () => {
    expect(
      deriveClaimViewerState({
        passportUserId: OTHER,
        viewerUserId: null,
        viewerHasOpenClaim: false,
      }),
    ).toBe(CLAIM_VIEWER_STATE.CLAIMED_OTHER)
  })

  it("claimed axis WINS over a stale open-claim flag (attached account is terminal)", () => {
    // Should not happen (finalize is atomic), but if a stale APPROVED row coexists with
    // the attached account, the claimed state must dominate the pending state.
    expect(
      deriveClaimViewerState({
        passportUserId: VIEWER,
        viewerUserId: VIEWER,
        viewerHasOpenClaim: true,
      }),
    ).toBe(CLAIM_VIEWER_STATE.CLAIMED_MINE)
  })
})

// ---------------------------------------------------------------------------
// Integration — prove the two queries feed the machine correctly.
// ---------------------------------------------------------------------------

const TS = Date.now()
const tag = (name: string) => `s0440-rvcs-${TS}-${name}`

type Fixtures = {
  unclaimedId: string // placeholder, no claims
  unclaimedMinePendingId: string // placeholder, viewer has a PENDING claim
  unclaimedOtherPendingId: string // placeholder, OTHER user has a PENDING claim
  claimedMineId: string // attached to viewer
  claimedOtherId: string // attached to other
  viewerUserId: string
  otherUserId: string
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const viewer = await db.user.create({
    data: { id: tag("viewer"), name: tag("Viewer"), email: `${tag("viewer")}@test.local` },
  })
  const other = await db.user.create({
    data: { id: tag("other"), name: tag("Other"), email: `${tag("other")}@test.local` },
  })

  const [unclaimed, unclaimedMine, unclaimedOther, claimedMine, claimedOther] = await Promise.all([
    db.passport.create({ data: { id: tag("p-unclaimed"), displayName: tag("Unclaimed") } }),
    db.passport.create({ data: { id: tag("p-mine-pending"), displayName: tag("MinePending") } }),
    db.passport.create({ data: { id: tag("p-other-pending"), displayName: tag("OtherPending") } }),
    db.passport.create({
      data: { id: tag("p-claimed-mine"), displayName: tag("ClaimedMine"), userId: viewer.id },
    }),
    db.passport.create({
      data: { id: tag("p-claimed-other"), displayName: tag("ClaimedOther"), userId: other.id },
    }),
  ])

  // Viewer's PENDING claim on the "mine pending" placeholder.
  await db.passportClaimRequest.create({
    data: {
      passportId: unclaimedMine.id,
      claimantUserId: viewer.id,
      brand: "BASELINE_MARTIAL_ARTS",
      status: "PENDING",
    },
  })
  // OTHER user's PENDING claim on the "other pending" placeholder — must stay invisible
  // to the viewer.
  await db.passportClaimRequest.create({
    data: {
      passportId: unclaimedOther.id,
      claimantUserId: other.id,
      brand: "BASELINE_MARTIAL_ARTS",
      status: "PENDING",
    },
  })

  fx = {
    unclaimedId: unclaimed.id,
    unclaimedMinePendingId: unclaimedMine.id,
    unclaimedOtherPendingId: unclaimedOther.id,
    claimedMineId: claimedMine.id,
    claimedOtherId: claimedOther.id,
    viewerUserId: viewer.id,
    otherUserId: other.id,
  }
})

afterAll(async () => {
  if (!fx) return
  const passportIds = [
    fx.unclaimedId,
    fx.unclaimedMinePendingId,
    fx.unclaimedOtherPendingId,
    fx.claimedMineId,
    fx.claimedOtherId,
  ]
  await db.passportClaimRequest.deleteMany({ where: { passportId: { in: passportIds } } })
  await db.passport.deleteMany({ where: { id: { in: passportIds } } })
  await db.user.deleteMany({ where: { id: { in: [fx.viewerUserId, fx.otherUserId] } } })
})

describe("resolveViewerClaimStates — batch (integration)", () => {
  it("resolves every row from the live DB in one batch", async () => {
    const states = await resolveViewerClaimStates(db, {
      passportIds: [
        fx!.unclaimedId,
        fx!.unclaimedMinePendingId,
        fx!.unclaimedOtherPendingId,
        fx!.claimedMineId,
        fx!.claimedOtherId,
      ],
      viewerUserId: fx!.viewerUserId,
    })

    expect(states.get(fx!.unclaimedId)).toBe(CLAIM_VIEWER_STATE.UNCLAIMED)
    expect(states.get(fx!.unclaimedMinePendingId)).toBe(CLAIM_VIEWER_STATE.PENDING_MINE)
    // The other user's pending claim must NOT surface to the viewer.
    expect(states.get(fx!.unclaimedOtherPendingId)).toBe(CLAIM_VIEWER_STATE.UNCLAIMED)
    expect(states.get(fx!.claimedMineId)).toBe(CLAIM_VIEWER_STATE.CLAIMED_MINE)
    expect(states.get(fx!.claimedOtherId)).toBe(CLAIM_VIEWER_STATE.CLAIMED_OTHER)
  })

  it("signed-out viewer never gets PENDING_MINE/CLAIMED_MINE", async () => {
    const states = await resolveViewerClaimStates(db, {
      passportIds: [fx!.unclaimedMinePendingId, fx!.claimedMineId],
      viewerUserId: null,
    })
    expect(states.get(fx!.unclaimedMinePendingId)).toBe(CLAIM_VIEWER_STATE.UNCLAIMED)
    // Attached to a real account, but not the (anonymous) viewer → CLAIMED_OTHER.
    expect(states.get(fx!.claimedMineId)).toBe(CLAIM_VIEWER_STATE.CLAIMED_OTHER)
  })

  it("empty input → empty map (no query)", async () => {
    const states = await resolveViewerClaimStates(db, {
      passportIds: [],
      viewerUserId: fx!.viewerUserId,
    })
    expect(states.size).toBe(0)
  })
})

describe("resolveViewerClaimState — single wrapper (integration)", () => {
  it("returns the same state as the batch for one Passport", async () => {
    expect(
      await resolveViewerClaimState(db, {
        passportId: fx!.unclaimedMinePendingId,
        viewerUserId: fx!.viewerUserId,
      }),
    ).toBe(CLAIM_VIEWER_STATE.PENDING_MINE)
  })

  it("falls back to UNCLAIMED for an unknown Passport id", async () => {
    expect(
      await resolveViewerClaimState(db, {
        passportId: "nonexistent-passport-id",
        viewerUserId: fx!.viewerUserId,
      }),
    ).toBe(CLAIM_VIEWER_STATE.UNCLAIMED)
  })
})
