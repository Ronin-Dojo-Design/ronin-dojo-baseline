import { Brand } from "~/.generated/prisma/client"
import type { LineageProfileDetailRenderPolicy } from "~/lib/entitlements/lineage-tier-policy"
import { getServerSession } from "~/lib/auth"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import {
  type ClaimViewerState,
  resolveViewerClaimState,
} from "~/server/web/claims/resolve-viewer-claim-state"
import { findProfileBySlug } from "~/server/web/directory/queries"
import { buildProfileMedia, type ProfileMedia } from "~/server/web/directory/profile-media"
import {
  getLineageAncestryForPassport,
  type LineageAncestryEntry,
} from "~/server/web/lineage/ancestry"
import { getPublicPassportMedia, type PublicPassportMedia } from "~/server/web/media/queries"
import type { DirectoryProfileView } from "~/app/(web)/directory/[slug]/_components/directory-profile/directory-profile-data"
import { db } from "~/services/db"

/**
 * The ONE public profile read model, keyed by slug (`/directory/[slug]`), backing the ONE
 * `ProfileView` renderer (WL-P2-37, TICKET-0502-A → SESSION_0525 C0).
 *
 * The owner (`/me`) arm — `loadProfileViewForOwner` + `OwnerProfileView` + the `me-profile/*`
 * section tree — was deleted with the `/me` redirect (SESSION_0522 TASK_04 → migration step 7):
 * `/me` now redirects to `/app/profile`, so the only live read is the public one. The projectors +
 * payloads + derivations (`findProfileBySlug` + the retired `loadDirectoryProfile`'s
 * origin/claim-funnel/location derivations, absorbed here) are reused verbatim so the tier contract
 * + on-the-wire shape stay byte-identical (the pinning tests + paywall e2e are the net).
 */

/** The public (`/directory/[slug]`) arm — a visitor viewing someone's public profile. */
export type PublicProfileView = DirectoryProfileView & {
  isOwner: false
  /**
   * Rich-media-gated profile-highlight rails (technique videos + podcasts) — parity with the
   * legacy "Profile Highlights" (SESSION_0525 C1). Assembled here (not in the projector) so the
   * section stays fetch-free; EMPTY on the free tier / placeholders (the gate is applied below).
   */
  profileMedia: ProfileMedia
  viewerContext: { isOwner: false; renderPolicy: LineageProfileDetailRenderPolicy }
}

export type ProfileView = PublicProfileView

/**
 * Account-optional claim funnel for a placeholder person. Returns the `/lineage/join` wizard
 * URL (preselecting the person's CLAIMABLE node when they have one), or null when the profile
 * is already claimed. Moved verbatim from the old `directory-profile-data.ts` loader.
 */
async function resolveClaimFunnelHref(
  profile: PublicProfileView["profile"],
): Promise<string | null> {
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
function buildLocationLine(profile: PublicProfileView["profile"]): string | null {
  if (!profile.locationCity) {
    return null
  }
  return [profile.locationCity, profile.locationRegion, profile.locationCountry]
    .filter(Boolean)
    .join(", ")
}

/**
 * `/directory/[slug]` — the public profile view. Returns `null` for a missing / privacy-hidden
 * profile (caller `notFound()`s). A claimable placeholder is NOT null — it carries
 * `isClaimablePlaceholder` and the renderer shows the claim teaser. The tier `renderPolicy` is
 * carried on the viewer context (the projected `profile` already applied the rich-media gate; the
 * policy is threaded so the renderer can drive tier-scoped affordances without re-deriving it).
 */
export async function loadProfileViewBySlug(slug: string): Promise<PublicProfileView | null> {
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

  // Doug LOW-3 (SESSION_0515): `findProfileBySlug` already resolved the tier render policy for the
  // same account, so reuse the one it threads back (`profile.renderPolicy`) instead of re-querying.
  const renderPolicy = profile.renderPolicy

  // `canRenderFullProfile` is the projector's rich-media decision (tier OR admin OR owner) — the
  // SAME gate cover/video/social ride. Only pull public media when eligible + not a placeholder.
  const canRenderRichMedia = profile.canRenderFullProfile
  const shouldLoadMedia = canRenderRichMedia && !profile.isClaimablePlaceholder

  const [origin, viewerClaimState, claimFunnelHref, ancestry, publicMedia] = await Promise.all([
    getRequestOrigin(),
    resolveViewerClaimState(db, { passportId: profile.passportId, viewerUserId }),
    resolveClaimFunnelHref(profile),
    // Placeholder profiles early-return to the claim teaser (no sections) — skip the walk.
    profile.isClaimablePlaceholder
      ? Promise.resolve<LineageAncestryEntry[]>([])
      : getLineageAncestryForPassport(profile.passportId),
    shouldLoadMedia
      ? getPublicPassportMedia(profile.passportId)
      : Promise.resolve<PublicPassportMedia[]>([]),
  ])

  return {
    isOwner: false,
    profile,
    slug,
    profileUrl: buildAbsoluteUrl(`/directory/${slug}`, origin),
    locationLine: buildLocationLine(profile),
    claimFunnelHref,
    viewerClaimState,
    ancestry,
    profileMedia: buildProfileMedia({ canRenderRichMedia, media: publicMedia }),
    viewerContext: { isOwner: false, renderPolicy },
  }
}

export type { ClaimViewerState }
