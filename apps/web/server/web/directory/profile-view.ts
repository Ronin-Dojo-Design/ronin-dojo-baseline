import { Brand } from "~/.generated/prisma/client"
import {
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  type LineageProfileDetailRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import { getServerSession } from "~/lib/auth"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import {
  type ClaimViewerState,
  resolveViewerClaimState,
} from "~/server/web/claims/resolve-viewer-claim-state"
import { findProfileBySlug, getOwnDirectoryProfile } from "~/server/web/directory/queries"
import { getLineageProfileDetailRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import {
  getLineageAncestryForPassport,
  type LineageAncestryEntry,
} from "~/server/web/lineage/ancestry"
import type { MyProfile } from "~/server/web/directory/profile-projection"
import { getOwnLineageProfile } from "~/server/web/lineage/queries"
import {
  getDashboardMediaAttachments,
  type DashboardMediaAttachment,
} from "~/server/web/media/queries"
import type { DirectoryProfileView } from "~/app/(web)/directory/[slug]/_components/directory-profile/directory-profile-data"
import { db } from "~/services/db"

/**
 * ONE profile read model, keyed by either the session user (`/me`) or a slug
 * (`/directory/[slug]`), backing the ONE `ProfileView` renderer (WL-P2-37, TICKET-0502-A).
 *
 * Both surfaces used to have their own loader + renderer + section copies. This consolidates
 * the ASSEMBLY: the underlying projectors + payloads + derivations (`getOwnDirectoryProfile`
 * / `getOwnLineageProfile` / `findProfileBySlug` + the retired `loadDirectoryProfile`'s
 * origin/claim-funnel/location derivations, absorbed here) are reused verbatim so the tier
 * contract + on-the-wire shapes stay byte-identical (the pinning tests + paywall e2e are the
 * net). The renderer branches on the returned `viewerContext.isOwner`.
 *
 * Viewer context is the single seam that lets ONE renderer serve both:
 *  - `isOwner: true`  → `/me`: owner affordances (edit, gallery, identity/affiliations cards),
 *    all sections, tier-independent (a member always sees their own profile in full — the
 *    existing `canRenderRichMediaForViewer` "own profile" rule, ADR 0025).
 *  - `isOwner: false` → `/directory/[slug]`: public tier-gated render; `renderPolicy` gates
 *    rich media exactly as the pre-refactor `loadDirectoryProfile` did.
 */

/** The owner (`/me`) arm — the member viewing their own Passport. */
export type OwnerProfileView = {
  isOwner: true
  brand: Brand
  /** The owner's projected directory profile; `null` when not yet provisioned (→ empty state). */
  profile: MyProfile | null
  /** Lineage node profile backing the dated belt-history timeline; `null` when unplaced. */
  lineageProfile: Awaited<ReturnType<typeof getOwnLineageProfile>>
  /** Public IMAGE attachments for the gallery grid. */
  galleryImages: DashboardMediaAttachment[]
  viewerContext: { isOwner: true; renderPolicy: LineageProfileDetailRenderPolicy }
}

/** The public (`/directory/[slug]`) arm — a visitor viewing someone's public profile. */
export type PublicProfileView = DirectoryProfileView & {
  isOwner: false
  viewerContext: { isOwner: false; renderPolicy: LineageProfileDetailRenderPolicy }
}

export type ProfileView = OwnerProfileView | PublicProfileView

/**
 * `/me` — the authenticated member's own profile view. No tier/visibility gate: the owner
 * always sees their own profile in full, so the render policy is fixed to the free BASIC
 * policy purely to satisfy the shared `viewerContext` shape — the renderer keys owner-vs-public
 * off `isOwner`, never off the policy, on this arm.
 */
export async function loadProfileViewForOwner(userId: string): Promise<OwnerProfileView> {
  const brand = Brand.BBL
  const viewerContext = {
    isOwner: true as const,
    renderPolicy: FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  }

  const [session, profile] = await Promise.all([
    getServerSession(),
    getOwnDirectoryProfile({ userId, brand }),
  ])

  if (!profile) {
    return {
      isOwner: true,
      brand,
      profile: null,
      lineageProfile: null,
      galleryImages: [],
      viewerContext,
    }
  }

  const [lineageProfile, attachments] = await Promise.all([
    profile.lineageNodeId ? getOwnLineageProfile(userId) : Promise.resolve(null),
    getDashboardMediaAttachments({
      brand,
      // The `/me` page already authenticated; the media ACL needs the session user object.
      user: session!.user,
      target: { kind: "passport", id: profile.passportId },
    }),
  ])

  const galleryImages = (attachments ?? []).filter(attachment => attachment.type === "IMAGE")

  return {
    isOwner: true,
    brand,
    profile,
    lineageProfile,
    galleryImages,
    viewerContext,
  }
}

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

  const account = profile.user

  const [origin, viewerClaimState, claimFunnelHref, ancestry, renderPolicy] = await Promise.all([
    getRequestOrigin(),
    resolveViewerClaimState(db, { passportId: profile.passportId, viewerUserId }),
    resolveClaimFunnelHref(profile),
    // Placeholder profiles early-return to the claim teaser (no sections) — skip the walk.
    profile.isClaimablePlaceholder
      ? Promise.resolve<LineageAncestryEntry[]>([])
      : getLineageAncestryForPassport(profile.passportId),
    getLineageProfileDetailRenderPolicyForUser({ userId: account.id ?? null, brand: Brand.BBL }),
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
    viewerContext: { isOwner: false, renderPolicy },
  }
}

export type { ClaimViewerState }
