/**
 * @added   SESSION_0542 (2026-07-16)
 * @why     Give every belt workflow one definition of a recruited coach identity
 * @wired   server/belt/router.ts, server/belt/profile-projection.ts,
 *          server/belt/promoter-proposal-core.ts
 */
type PromoterIdentityShape = {
  userId: string | null
  lineageNode: unknown | null
  directoryProfile: unknown | null
}

/** ADR 0047 D1: only a doorless, accountless Passport is a recruited-coach placeholder. */
export function isRecruitedCoachIdentity(
  passport: PromoterIdentityShape | null | undefined,
): boolean {
  return (
    passport?.userId === null && passport.lineageNode === null && passport.directoryProfile === null
  )
}
