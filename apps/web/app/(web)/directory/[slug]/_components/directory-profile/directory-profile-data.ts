import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import {
  type ClaimViewerState,
  resolveViewerClaimState,
} from "~/server/web/claims/resolve-viewer-claim-state"
import { findProfileBySlug } from "~/server/web/directory/queries"
import {
  getLineageAncestryForPassport,
  type LineageAncestryEntry,
} from "~/server/web/lineage/ancestry"
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
  /**
   * Account-optional claim funnel for a placeholder person (SESSION_0440 follow-up).
   * The directory "Claim" CTA routes here — the SAME `/lineage/join` wizard the lineage
   * drawer uses (guest enters an email → magic link), NOT the login-gated inline form
   * (which dead-ended logged-out visitors with "User not authenticated"). Carries the
   * person's claimable node so the wizard preselects it; `/lineage/join` with no node is
   * still a valid entry. Null when the profile is already claimed (no CTA).
   */
  claimFunnelHref: string | null
  /**
   * The member's PUBLIC promotion up-chain, ordered [founder … member] (SESSION_0493
   * TASK_05). Empty when the person has no PUBLIC lineage node / no public up-chain —
   * the ancestry section renders nothing. Skipped (empty) for claimable placeholders:
   * the orchestrator early-returns to the claim teaser before any section renders.
   */
  ancestry: LineageAncestryEntry[]
}

/**
 * Account-optional claim funnel for a placeholder person. Returns the `/lineage/join`
 * wizard URL (preselecting the person's CLAIMABLE node when they have one), or null when
 * the profile is already claimed. A guest claims without signing in first — the wizard
 * emails a magic link — so the directory door behaves like the lineage drawer's CTA.
 */
async function resolveClaimFunnelHref(profile: DirectoryProfile): Promise<string | null> {
  if (!profile.isClaimablePlaceholder) {
    return null
  }
  const node = await db.lineageNode.findFirst({
    where: {
      passportId: profile.passportId,
      treeMembers: {
        some: {
          isClaimable: true,
          tree: { brand: Brand.BBL, isPublished: true, isClaimable: true },
        },
      },
    },
    select: { id: true },
  })
  return node ? `/lineage/join?node=${node.id}` : "/lineage/join"
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

  const [origin, viewerClaimState, claimFunnelHref, ancestry] = await Promise.all([
    getRequestOrigin(),
    resolveViewerClaimState(db, { passportId: profile.passportId, viewerUserId }),
    resolveClaimFunnelHref(profile),
    // Placeholder profiles early-return to the claim teaser (no sections) — skip the walk.
    profile.isClaimablePlaceholder
      ? Promise.resolve([])
      : getLineageAncestryForPassport(profile.passportId),
  ])

  return {
    profile,
    slug,
    profileUrl: buildAbsoluteUrl(`/directory/${slug}`, origin),
    locationLine: buildLocationLine(profile),
    claimFunnelHref,
    viewerClaimState,
    ancestry,
  }
}
