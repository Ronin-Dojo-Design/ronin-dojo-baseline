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
