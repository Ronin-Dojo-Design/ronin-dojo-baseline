import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import {
  type ClaimViewerState,
  resolveViewerClaimState,
} from "~/server/web/claims/resolve-viewer-claim-state"
import { findProfileBySlug } from "~/server/web/directory/queries"
import { db } from "~/services/db"

/**
 * `/directory/[slug]` server loader (component-launch-sweep step 1 — data-heavy route).
 *
 * Owns ALL server work for the public member/listing detail: brand + session
 * resolution, the slug fetch (`findProfileBySlug` applies the visibility/tier privacy
 * rules), and the presentation-only derivations (absolute profile URL, the joined
 * location line). `page.tsx` collapses to `params → load → notFound() → <Orchestrator>`;
 * the orchestrator owns only composition + lazy boundaries (zero fetch, zero derivation).
 *
 * On-the-wire only (Hard boundary): every field comes from the existing
 * `findProfileBySlug` projection — no new Prisma fields, no schema-requiring selects.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */

/** The projected profile returned by `findProfileBySlug` (the privacy-gated union). */
export type DirectoryProfile = NonNullable<Awaited<ReturnType<typeof findProfileBySlug>>>

/** Everything the `/directory/[slug]` orchestrator renders. `null` → the page 404s. */
export type DirectoryProfileView = {
  /** The projected, privacy-gated profile (full or listing-preview branch). */
  profile: DirectoryProfile
  /** Route slug, threaded for the QR file name + (re-)derived URLs. */
  slug: string
  /** Absolute URL for the QR share button. */
  profileUrl: string
  /** Pre-joined "City, Region, Country" intro line, or null when no city. */
  locationLine: string | null
  /**
   * The viewer's claim state for this person's Passport (ADR 0036, SESSION_0440).
   * The shared resolver both claim surfaces consume — drives the claim/pending/yours
   * CTA without the surface re-deriving it.
   */
  viewerClaimState: ClaimViewerState
}

/** Joined "City, Region, Country" line, or null when the city is unset. */
function buildLocationLine(profile: DirectoryProfile): string | null {
  if (!profile.locationCity) {
    return null
  }
  return [profile.locationCity, profile.locationRegion, profile.locationCountry]
    .filter(Boolean)
    .join(", ")
}

/**
 * Resolve the profile for a slug. Returns `null` for a missing / privacy-hidden
 * profile (caller `notFound()`s) — note a *claimable placeholder* is NOT null: it
 * carries `isClaimablePlaceholder` and the orchestrator renders the claim teaser.
 */
export async function loadDirectoryProfile(slug: string): Promise<DirectoryProfileView | null> {
  const session = await getServerSession()
  const viewerUserId = session?.user?.id ?? null

  const profile = await findProfileBySlug({
    slug,
    brand: Brand.BBL,
    viewerUserId,
    viewerRole: session?.user?.role,
  })

  if (!profile) {
    return null
  }

  const [origin, viewerClaimState] = await Promise.all([
    getRequestOrigin(),
    resolveViewerClaimState(db, { passportId: profile.passportId, viewerUserId }),
  ])

  return {
    profile,
    slug,
    profileUrl: buildAbsoluteUrl(`/directory/${slug}`, origin),
    locationLine: buildLocationLine(profile),
    viewerClaimState,
  }
}
