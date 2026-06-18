import type { AffiliationRole, DirectoryVisibility } from "~/.generated/prisma/client"
import type { MyProfile } from "~/server/web/directory/profile-projection"

/** Display label for the directory visibility badge. */
export const VISIBILITY_LABEL: Record<DirectoryVisibility, string> = {
  PUBLIC: "Public",
  MEMBERS_ONLY: "Members only",
  HIDDEN: "Hidden",
}

/** Display label for an affiliation's role on the school list. */
export const AFFILIATION_ROLE_LABEL: Record<AffiliationRole, string> = {
  TRAINS_AT: "Trains at",
  TEACHES_AT: "Teaches at",
  HEAD_INSTRUCTOR: "Head instructor",
  OWNER: "Owner",
  MEMBER: "Member",
}

/** First initial for the hero avatar fallback. */
export function profileInitial(name: string | null | undefined): string {
  return (name ?? "M").charAt(0).toUpperCase()
}

/** UTC year string for the "Training since" identity row, or null when unset/invalid. */
function formatYear(date: Date | null): string | null {
  if (!date) {
    return null
  }
  const year = new Date(date).getUTCFullYear()
  return Number.isNaN(year) ? null : String(year)
}

export type IdentityRow = { label: string; value: string }

/** The "Identity" sidebar rows, with empty fields dropped. */
export function buildIdentityRows(profile: MyProfile): IdentityRow[] {
  const trainingSince = formatYear(profile.startedTrainingAt)
  return [
    { label: "Born in", value: profile.placeOfBirth },
    { label: "Based in", value: profile.locationLine },
    { label: "Training since", value: trainingSince },
  ].filter((row): row is IdentityRow => Boolean(row.value))
}
