/**
 * Identity display helpers — Passport is the identity source of truth (SOT-ADR D1).
 *
 * Person-rooted reads resolve a display name from the Passport first, then fall
 * back to the linked account (`passport.user.name`) for account-linked people.
 * Accountless placeholders (claimable) have `passport.user == null`, so the chain
 * degrades to whatever final fallback the call site supplies (slug, id, "Unnamed").
 *
 * This collapses the repeated `passport?.displayName ?? passport?.user?.name ?? …`
 * chains flagged by the SESSION_0392 fallow advisory into one seam.
 */

export type PassportNameSource =
  | {
      displayName?: string | null
      user?: { name?: string | null } | null
    }
  | null
  | undefined

/**
 * Resolve a Passport's display name: own `displayName`, else the linked account's
 * `name`, else `null`. Append a call-site-specific final fallback as needed, e.g.
 * `passportDisplayName(node.passport) ?? node.slug ?? node.id`.
 */
export function passportDisplayName(passport: PassportNameSource): string | null {
  return passport?.displayName ?? passport?.user?.name ?? null
}
