// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
} from "~/lib/lineage/trust-status"

describe("lineage trust status", () => {
  it("prioritizes disputed above legacy verified", () => {
    const status = resolveLineageTrustStatus({
      verificationStatus: "DISPUTED",
      isVerified: true,
      claimStatus: "APPROVED",
      isPlaceholder: true,
    })

    expect(status).toBe("disputed")
  })

  it("prioritizes verified above claimed", () => {
    const status = resolveLineageTrustStatus({
      verificationStatus: "VERIFIED",
      claimStatus: "APPROVED",
    })

    expect(status).toBe("verified")
  })

  it("uses approved claims when verification is pending", () => {
    const status = resolveLineageTrustStatus({
      verificationStatus: "PENDING",
      claimStatus: "APPROVED",
      isPlaceholder: true,
    })

    expect(status).toBe("claimed")
  })

  it("uses pending claim before imported placeholder status", () => {
    const status = resolveLineageTrustStatus({
      verificationStatus: "PENDING",
      claimStatus: "PENDING",
      isPlaceholder: true,
    })

    expect(status).toBe("claim-pending")
  })

  it("marks placeholder records as imported when no stronger status exists", () => {
    const status = resolveLineageTrustStatus({
      verificationStatus: "PENDING",
      isPlaceholder: true,
    })

    expect(status).toBe("imported")
  })

  it("defaults to unverified", () => {
    expect(resolveLineageTrustStatus({ verificationStatus: "PENDING" })).toBe("unverified")
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
