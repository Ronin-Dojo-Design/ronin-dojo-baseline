import type { LineageClaimStatus, LineageVerificationStatus } from "~/.generated/prisma/client"

export type LineageTrustStatus =
  | "disputed"
  | "verified"
  | "claimed"
  | "claim-pending"
  | "imported"
  | "unverified"

export type LineageClaimBadgeStatus = "claimable"

type ClaimSummary = {
  status: LineageClaimStatus
}

export type ResolveLineageTrustStatusInput = {
  verificationStatus?: LineageVerificationStatus | null
  isVerified?: boolean | null
  isPlaceholder?: boolean | null
  claimStatus?: LineageClaimStatus | null
}

export type ResolveLineageClaimBadgeStatusInput = {
  isClaimable?: boolean | null
  claimStatus?: LineageClaimStatus | null
}

export function pickLineageClaimStatus(
  claims: readonly ClaimSummary[] | null | undefined,
): LineageClaimStatus | null {
  if (!claims?.length) return null

  const statuses = new Set(claims.map(claim => claim.status))
  if (statuses.has("APPROVED")) return "APPROVED"
  if (statuses.has("PENDING")) return "PENDING"
  if (statuses.has("NEEDS_INFO")) return "NEEDS_INFO"

  return null
}

export function resolveLineageTrustStatus({
  verificationStatus,
  isVerified,
  isPlaceholder,
  claimStatus,
}: ResolveLineageTrustStatusInput): LineageTrustStatus {
  if (verificationStatus === "DISPUTED") return "disputed"
  if (verificationStatus === "VERIFIED" || isVerified === true) return "verified"
  if (claimStatus === "APPROVED") return "claimed"
  if (claimStatus === "PENDING" || claimStatus === "NEEDS_INFO") return "claim-pending"
  if (isPlaceholder === true) return "imported"

  return "unverified"
}

export function resolveLineageClaimBadgeStatus({
  isClaimable,
  claimStatus,
}: ResolveLineageClaimBadgeStatusInput): LineageClaimBadgeStatus | null {
  if (claimStatus === "APPROVED") return null
  return isClaimable === true ? "claimable" : null
}
