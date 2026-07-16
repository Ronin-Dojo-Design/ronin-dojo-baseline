import { fuzzyMatchSchool } from "~/lib/dedup"
import { createPassport } from "~/server/identity/person-service"
import { db } from "~/services/db"

/** Prisma surface this resolver needs — `db` or a `$transaction` client (folds into the award tx). */
type PromoterPlaceholderClient = Pick<typeof db, "passport">

/**
 * Find-or-create a **recruited-coach placeholder** Passport for a free-typed promoter (SESSION_0540 —
 * supersedes the org-anchored "BBL Coach Outreach" `Lead`, operator rework). This is the pure
 * IDENTITY resolver — the recruitment `Lead` side-effect is a separate call (`emitPromoterLead`);
 * see `router.resolveFactUpdateWithCapture`, which invokes both inside the award tx.
 *
 * A coach a member free-types when backfilling a belt is a PERSON, not a lead: this mints the exact
 * identity shape the WP-import / admin add-person / place-lead paths already use — an ACCOUNTLESS
 * (`userId` null), off-tree placeholder `Passport` via `createPassport` (SOT-ADR D1). It is hidden
 * (no `DirectoryProfile` / `LineageNode` → surfaced nowhere public). The returned `passportId`
 * becomes the award's `awardedByPassportId` FK, so the promoter is a real person on the identity
 * graph instead of a name buried in `notes`.
 *
 * CLAIM DOOR IS PHASE-2 (do not call this "claimable" yet, D-045/FINDING_01): a bare Passport has no
 * ADR 0036 claim door (no node / tree / directoryProfile) and no ADR 0032 email-reconcile hook, so
 * **no claim path reaches it today**. The coach becomes claimable only once the phase-2 confirm loop
 * mints that door (leaded coach registers → belts bind FK → coach confirms → UNVERIFIED→VERIFIED).
 * Until then this is a recruitment/identity artifact, not a claimable identity.
 *
 * DEDUP — EXACT-NORMALIZED (bias to duplicates, D-045/FINDING_03): re-typing the SAME coach reuses
 * the same placeholder, but matching is exact on the NORMALIZED name (`threshold: 1`), not fuzzy.
 * The moat's promotion provenance is the asset, and there a **duplicate is the safe error (a phase-2
 * admin MERGE repoints its edges) while a false-merge is the dangerous one (two distinct coaches
 * collapsed onto one Passport → a claimant inherits the wrong students; splitting is far harder).**
 * Exact-normalized keeps "Prof. John Smith" / "John Smith" as separate placeholders (mergeable later)
 * rather than risk collapsing two different coaches on a fuzzy near-miss. Two coaches whose names
 * normalize identically are indistinguishable by name and still merge — inherent to name-only dedup,
 * and the phase-2 admin MERGE/split tool is the escape (see the promoter-as-placeholder ADR).
 *
 * The candidate set is scoped tight on purpose — accountless (`userId: null`), off-tree
 * (`lineageNode: is null`) Passports already referenced as a promoter (`rankAwardsPromoted: some`).
 * That scope guarantees a match can NEVER attach a typed name onto a real on-tree person or an
 * unrelated import placeholder (either would wrongly link them as someone's promoter).
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
  client: PromoterPlaceholderClient = db,
): Promise<EnsurePromoterPlaceholderResult | null> {
  const name = promoterName.trim()
  if (!name) return null

  // Prior coach placeholders only (see DEDUP): accountless + off-tree + already a promoter.
  const candidates = await client.passport.findMany({
    where: {
      userId: null,
      lineageNode: { is: null },
      rankAwardsPromoted: { some: {} },
    },
    select: { id: true, displayName: true },
  })

  // Exact-normalized match (threshold 1) — bias to duplicates over false-merges (see DEDUP).
  const match = fuzzyMatchSchool(
    name,
    candidates.map(candidate => ({ name: candidate.displayName ?? "", passportId: candidate.id })),
    1,
  )
  if (match) return { passportId: match.passportId, createdPlaceholder: false }

  // `createPassport` wants the full identity client; the tx client is structurally compatible
  // (documented "callers cast tx" idiom, person-service.ts).
  const created = await createPassport({ displayName: name }, client as typeof db)
  return { passportId: created.id, createdPlaceholder: true }
}
