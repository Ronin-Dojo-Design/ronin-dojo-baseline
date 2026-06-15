import { db } from "~/services/db"
import {
  attachAccountSchema,
  createPassportSchema,
  type AttachAccountInput,
  type CreatePassportInput,
} from "~/server/identity/person-schema"

/**
 * The one-door identity service (SOT-ADR D1 — Passport = person-rooted SoT).
 *
 * - `createPassport` mints an **accountless** Passport (`userId` null) — the placeholder, replacing
 *   the synthetic `User { isPlaceholder: true }` + `@placeholder.invalid` email hack.
 * - `attachAccount` binds a Better-Auth account to a Passport (sign-up / claim-approve). Because the
 *   identity satellites point at the Passport, one attach propagates across every surface.
 * - `derivePersonName` is the single name-derivation rule (`displayName ?? "First Last"`).
 *
 * The functions accept an injectable `client` so they compose inside an existing `$transaction`
 * (the minters call them within their tx in Phase 3c) and so tests can pass a fake — no DB, no email.
 *
 * NOTE (Phase 3a / additive window): satellite rows (DirectoryProfile / RankAward / Affiliation /
 * LineageNode) still carry NOT-NULL `userId` until the 3b column flip, so `createPassport` mints the
 * bare Passport only. Satellite-on-passport creation is wired in 3b/3c when the columns accept
 * `passportId`-only. Do not add accountless-satellite creation here before then.
 *
 * @added SESSION_0390 (Phase 3a)
 */

/** Prisma surface the identity service needs — `db` or a transaction client (callers cast `tx`). */
type IdentityClient = typeof db

/**
 * The display name for a person: the user-pickable `displayName` wins; otherwise the legal first +
 * last name; otherwise a stable fallback (Better-Auth `User.name` is non-null, so this is never "").
 */
export function derivePersonName(input: {
  displayName?: string | null
  legalFirstName?: string | null
  legalLastName?: string | null
}): string {
  const display = input.displayName?.trim()
  if (display) return display

  const full = [input.legalFirstName, input.legalLastName]
    .map(part => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ")

  return full || "Unnamed Member"
}

/** Raised when an account is already attached to a *different* Passport (the `userId @unique` guard). */
export class ClaimantHasPassportError extends Error {
  readonly code = "CLAIMANT_HAS_PASSPORT" as const

  constructor(
    readonly userId: string,
    readonly existingPassportId: string,
  ) {
    super(`Account ${userId} is already attached to Passport ${existingPassportId}.`)
    this.name = "ClaimantHasPassportError"
  }
}

/**
 * Mint an accountless Passport (the placeholder, D1). `userId` is omitted → null. Satellites are NOT
 * created here in Phase 3a (see module note).
 */
export async function createPassport(input: CreatePassportInput, client: IdentityClient = db) {
  const data = createPassportSchema.parse(input)

  return client.passport.create({
    // `userId` omitted → null: an accountless placeholder Passport (D1).
    data: {
      displayName: derivePersonName(data),
      legalFirstName: data.legalFirstName ?? null,
      legalLastName: data.legalLastName ?? null,
      dob: data.dob ?? null,
      phoneE164: data.phoneE164 ?? null,
      avatarUrl: data.avatarUrl ?? null,
      bio: data.bio ?? null,
      placeOfBirth: data.placeOfBirth ?? null,
    },
    select: { id: true },
  })
}

/**
 * Resolve the Passport id for an account, minting one (linked to the account) if none exists yet.
 *
 * Phase 3c bridge (SOT-ADR D1): the identity satellites are Passport-rooted, but several write paths
 * still start from a `User` id (sign-up profile creation, admin add-person, lead import). This finds
 * that account's Passport, creating an account-linked Passport on first use so the caller can set the
 * satellite `passportId`. Accountless placeholders use `createPassport` directly instead.
 */
export async function ensurePassportForUser(
  userId: string,
  input: Omit<CreatePassportInput, never> = {},
  client: IdentityClient = db,
): Promise<{ id: string }> {
  const existing = await client.passport.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (existing) return existing

  const data = createPassportSchema.parse(input)
  return client.passport.create({
    data: {
      userId,
      displayName: derivePersonName(data),
      legalFirstName: data.legalFirstName ?? null,
      legalLastName: data.legalLastName ?? null,
      dob: data.dob ?? null,
      phoneE164: data.phoneE164 ?? null,
      avatarUrl: data.avatarUrl ?? null,
      bio: data.bio ?? null,
      placeOfBirth: data.placeOfBirth ?? null,
    },
    select: { id: true },
  })
}

/**
 * Attach a Better-Auth account to an existing Passport (D1 claim primitive). Pre-checks the
 * `Passport.userId @unique` constraint so the caller gets `CLAIMANT_HAS_PASSPORT` rather than a raw
 * DB unique violation. Idempotent: re-attaching the same account to the same Passport is a no-op-ish
 * update, not an error.
 */
export async function attachAccount(input: AttachAccountInput, client: IdentityClient = db) {
  const { passportId, userId } = attachAccountSchema.parse(input)

  const existing = await client.passport.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existing && existing.id !== passportId) {
    throw new ClaimantHasPassportError(userId, existing.id)
  }

  return client.passport.update({
    where: { id: passportId },
    data: { userId },
    select: { id: true, userId: true },
  })
}
