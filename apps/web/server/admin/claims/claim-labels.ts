/**
 * Client-safe claim label helpers. Kept OUT of `claim-queries.ts` (which is
 * `server-only` + pulls Prisma) so `"use client"` column files can import the pure
 * label logic without dragging `node:module`/Prisma into the browser bundle
 * (the Prisma-in-client-chrome Turbopack trap).
 */

/** Subject display label for a claim row (org name or person display name). */
export function profileClaimSubjectLabel(claim: {
  subjectType: "PERSON" | "ORGANIZATION"
  organization: { name: string } | null
  directoryProfile: {
    passport: { displayName: string | null } | null
  } | null
}): string {
  if (claim.subjectType === "ORGANIZATION")
    return claim.organization?.name ?? "Unknown organization"
  return claim.directoryProfile?.passport?.displayName ?? "Unknown profile"
}
