// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  pickLineageClaimStatus,
  pickTopTrustStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
  resolveMemberTrustStatus,
} from "~/lib/lineage/trust-status"

describe("lineage trust status", () => {
  // Trust now sources from the member's rank (top non-PENDING RankEntry) — the retired node-level
  // `isVerified`/`verificationStatus` axis no longer feeds display (LR 0008 / WL-P2-46).
  it("prioritizes disputed above verified rank", () => {
    const status = resolveLineageTrustStatus({
      rankStatus: "DISPUTED",
      claimStatus: "APPROVED",
      isPlaceholder: true,
    })

    expect(status).toBe("disputed")
  })

  it("prioritizes verified rank above claimed", () => {
    const status = resolveLineageTrustStatus({
      rankStatus: "VERIFIED",
      claimStatus: "APPROVED",
    })

    expect(status).toBe("verified")
  })

  it("uses approved claims when the rank is unverified", () => {
    const status = resolveLineageTrustStatus({
      rankStatus: "UNVERIFIED",
      claimStatus: "APPROVED",
      isPlaceholder: true,
    })

    expect(status).toBe("claimed")
  })

  it("uses pending claim before imported placeholder status", () => {
    const status = resolveLineageTrustStatus({
      rankStatus: "UNVERIFIED",
      claimStatus: "PENDING",
      isPlaceholder: true,
    })

    expect(status).toBe("claim-pending")
  })

  it("marks placeholder records as imported when no stronger status exists", () => {
    const status = resolveLineageTrustStatus({
      rankStatus: "UNVERIFIED",
      isPlaceholder: true,
    })

    expect(status).toBe("imported")
  })

  it("defaults to unverified (no verified rank, no claim, not placeholder)", () => {
    expect(resolveLineageTrustStatus({ rankStatus: "UNVERIFIED" })).toBe("unverified")
    expect(resolveLineageTrustStatus({ rankStatus: null })).toBe("unverified")
  })

  it("pickTopTrustStatus: first non-PENDING entry in the (pre-ordered) awards is the trust", () => {
    const award = (
      status: "PENDING" | "UNVERIFIED" | "VERIFIED" | "DISPUTED" | null,
      disc = "bjj",
    ) => ({
      rank: { rankSystem: { id: `rs-${disc}`, discipline: { id: disc } } },
      rankEntry: status ? { status } : null,
    })
    // Highest belt PENDING → skip to the next non-PENDING entry (VERIFIED).
    expect(pickTopTrustStatus([award("PENDING"), award("VERIFIED")])).toBe("VERIFIED")
    // Entry-less top award → skipped; the disputed lower entry wins.
    expect(pickTopTrustStatus([award(null), award("DISPUTED")])).toBe("DISPUTED")
    // No entries at all → null (→ unverified/imported at the resolver).
    expect(pickTopTrustStatus([award(null), award(null)])).toBeNull()
    // Discipline scoping: only the matching-discipline entry counts.
    expect(pickTopTrustStatus([award("VERIFIED", "tkd"), award("UNVERIFIED", "bjj")], "bjj")).toBe(
      "UNVERIFIED",
    )
  })

  it("resolveMemberTrustStatus: RankEntry wins; beltless falls back to node membership verification", () => {
    const belt = (status: "PENDING" | "UNVERIFIED" | "VERIFIED" | "DISPUTED") => [
      { rank: { rankSystem: { id: "rs-bjj", discipline: { id: "bjj" } } }, rankEntry: { status } },
    ]
    // (3) VERIFIED belt + node NOT verified → VERIFIED (belt precedence — the intended fix stays).
    expect(resolveMemberTrustStatus(belt("VERIFIED"), { isVerified: false })).toBe("VERIFIED")
    // (4) DISPUTED belt beats a node-verified fallback (belt precedence).
    expect(
      resolveMemberTrustStatus(belt("DISPUTED"), {
        isVerified: true,
        verificationStatus: "VERIFIED",
      }),
    ).toBe("DISPUTED")
    // (4b) UNVERIFIED belt + node VERIFIED → stays UNVERIFIED (belt precedence — a PRESENT belt is
    // NOT upgraded by the node fallback; guards the `if (rankStatus) return rankStatus` short-circuit).
    expect(
      resolveMemberTrustStatus(belt("UNVERIFIED"), {
        isVerified: true,
        verificationStatus: "VERIFIED",
      }),
    ).toBe("UNVERIFIED")
    // (1) beltless + node VERIFIED (isVerified OR verificationStatus) → VERIFIED.
    expect(resolveMemberTrustStatus([], { isVerified: true })).toBe("VERIFIED")
    expect(resolveMemberTrustStatus([], { verificationStatus: "VERIFIED" })).toBe("VERIFIED")
    // (5) beltless + node DISPUTED → DISPUTED.
    expect(resolveMemberTrustStatus([], { verificationStatus: "DISPUTED" })).toBe("DISPUTED")
    // (2) beltless + node NOT verified → null (→ unverified at the resolver).
    expect(resolveMemberTrustStatus([], { isVerified: false })).toBeNull()
    expect(resolveMemberTrustStatus([], {})).toBeNull()
    // All-PENDING (no non-PENDING entry) is treated as beltless → node fallback applies.
    expect(resolveMemberTrustStatus(belt("PENDING"), { isVerified: true })).toBe("VERIFIED")
  })

  it("picks the strongest active claim status from a claim list", () => {
    const status = pickLineageClaimStatus([
      { status: "NEEDS_INFO" },
      { status: "PENDING" },
      { status: "APPROVED" },
    ])

    expect(status).toBe("APPROVED")
  })

  it("renders claimable as a secondary badge unless already claimed", () => {
    expect(resolveLineageClaimBadgeStatus({ isClaimable: true })).toBe("claimable")
    expect(
      resolveLineageClaimBadgeStatus({ isClaimable: true, claimStatus: "APPROVED" }),
    ).toBeNull()
  })
})
