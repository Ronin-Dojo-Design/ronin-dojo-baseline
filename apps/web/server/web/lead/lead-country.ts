import { Brand } from "~/.generated/prisma/client"
import { COUNTRIES } from "~/lib/countries"
import { db } from "~/services/db"

/**
 * SESSION_0496 TASK_05 — resolve the country a new signup asserted in the
 * Join-the-Legacy wizard, from their newest matching lead.
 *
 * Consumed by `ensureIdentityShell` (`lib/auth.ts`) on the CREATION-only path (after
 * the existing-Passport early return) to seed `DirectoryProfile.locationCountry`, so
 * the wizard's country answer isn't lost between the guest intake and the magic-link
 * signup. Leads store email lowercased (`createJoinLegacyInterest`); `Lead.email`
 * carries a DB index (`@@index([email])`), so the lookup is cheap.
 *
 * `meta` is untyped JSON written by an older (or direct) caller — every step narrows
 * defensively: object shape → string → alpha-2 letters → known `COUNTRIES` code.
 * NEVER throws: a bad lead must not block signup (the same swallow contract as
 * `reconcilePendingLineageClaims`). Anything invalid resolves to null (skip — the
 * profile stub simply gets no country).
 */

type LeadCountryDb = Pick<typeof db, "lead">

const ALPHA2 = /^[A-Za-z]{2}$/

export async function findJoinLegacyLeadCountry({
  db: dbClient = db,
  email,
}: {
  db?: LeadCountryDb
  email: string
}): Promise<string | null> {
  try {
    const lead = await dbClient.lead.findFirst({
      where: {
        brand: Brand.BBL,
        email: email.trim().toLowerCase(),
        // The join-the-legacy lead shape — `createJoinLegacyInterest` stamps meta.source.
        meta: { path: ["source"], equals: "join-the-legacy" },
      },
      orderBy: { createdAt: "desc" },
      select: { meta: true },
    })

    const meta = lead?.meta
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null

    const raw = (meta as Record<string, unknown>).country
    if (typeof raw !== "string") return null

    const code = raw.trim().toUpperCase()
    if (!ALPHA2.test(code)) return null

    return COUNTRIES.some(country => country.code === code) ? code : null
  } catch (error) {
    console.error("[identity] join-legacy lead country lookup failed", { error })
    return null
  }
}
