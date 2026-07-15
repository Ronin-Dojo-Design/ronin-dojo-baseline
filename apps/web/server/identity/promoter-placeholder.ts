import { fuzzyMatchSchool } from "~/lib/dedup"
import { createPassport } from "~/server/identity/person-service"
import { db } from "~/services/db"

/**
 * Find-or-create a CLAIMABLE PLACEHOLDER Passport for a free-typed promoter (SESSION_0540 —
 * supersedes the org-anchored "BBL Coach Outreach" `Lead`, operator rework).
 *
 * A coach a member free-types when backfilling a belt is a PERSON, not a lead: this mints the
 * exact identity shape the WP-import / admin add-person / place-lead paths already use — an
 * ACCOUNTLESS (`userId` null), off-tree placeholder `Passport` via `createPassport` (SOT-ADR D1).
 * It is hidden (no `DirectoryProfile` / `LineageNode` → surfaced nowhere public) and claimable
 * precisely because it has no attached account, so the coach can later claim their Passport in
 * the phase-2 confirm loop — exactly like a claim placeholder (ADR 0025 / ADR 0036). The returned
 * `passportId` becomes the award's `awardedByPassportId` FK, so the promoter is now a real person
 * on the identity graph instead of a name buried in `notes`.
 *
 * DEDUP (mirrors the school-lead flywheel): re-typing the same coach reuses the same placeholder,
 * so a coach is one person no matter how many members name them. The candidate set is scoped tight
 * on purpose — accountless (`userId: null`), off-tree (`lineageNode: is null`) Passports already
 * referenced as a promoter (`rankAwardsPromoted: some`). That scope guarantees a fuzzy match can
 * NEVER attach a typed name onto a real on-tree person or an unrelated import placeholder (either
 * would wrongly link them as someone's promoter). Same `fuzzyMatchSchool` matcher the school-lead
 * uses (the name is generic despite the "school" label).
 *
 * NOTE (phase-2 boundary): this mints the recruitment/identity artifact only. Placing the coach ON
 * the tree (a `LineageNode` + `LineageTreeMember` + slug) and the claim CTA are the phase-2 confirm
 * loop — deliberately NOT built here (the bare Passport IS the recruitment artifact; the tree-sit +
 * claim surface would balloon this slice).
 *
 * `createdPlaceholder` reports whether a FRESH coach was minted vs an existing one reused (useful
 * telemetry); the trust decision itself keys off a STATELESS re-read of the promoter Passport (see
 * `router.applyBackfillTrustDecision`), not this flag, so it stays correct on later re-edits.
 */
export type EnsurePromoterPlaceholderResult = {
  passportId: string
  createdPlaceholder: boolean
}

export async function ensurePromoterPlaceholder(
  promoterName: string,
): Promise<EnsurePromoterPlaceholderResult | null> {
  const name = promoterName.trim()
  if (!name) return null

  // Prior coach placeholders only (see DEDUP): accountless + off-tree + already a promoter.
  const candidates = await db.passport.findMany({
    where: {
      userId: null,
      lineageNode: { is: null },
      rankAwardsPromoted: { some: {} },
    },
    select: { id: true, displayName: true },
  })

  const match = fuzzyMatchSchool(
    name,
    candidates.map(candidate => ({ name: candidate.displayName ?? "", passportId: candidate.id })),
  )
  if (match) return { passportId: match.passportId, createdPlaceholder: false }

  const created = await createPassport({ displayName: name })
  return { passportId: created.id, createdPlaceholder: true }
}
