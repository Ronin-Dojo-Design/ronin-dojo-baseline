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
import {
  getLineageAncestryForPassport,
  type LineageAncestryEntry,
} from "~/server/web/lineage/ancestry"
import type { MyProfile } from "~/server/web/directory/profile-projection"
import { canUploadMediaForUser } from "~/server/web/media/permissions"
import type { DirectoryProfileOne, PassportOne } from "~/server/web/passport/payloads"
import { getDirectoryProfileByUserId, getPassportByUserId } from "~/server/web/passport/queries"
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

/**
 * The owner's editable Passport + DirectoryProfile forms, mounted by the inline-edit drawer
 * (FI-024 H1). Loaded eagerly so any edit affordance on `/me` opens the ONE `PassportEditor`
 * in-place instead of bouncing to `/app/profile`. Null when the profile isn't provisioned.
 */
export type OwnerEditorData = {
  userId: string
  passport: PassportOne
  directoryProfile: DirectoryProfileOne
  canUploadVideo: boolean
}

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
  /**
   * The owner's PUBLIC promotion up-chain [founder … member] (FI-024 H3) — the SAME walk the
   * public directory arm renders. Empty when the owner has no public lineage node / up-chain; the
   * `AncestrySection` self-gates (renders nothing under 2 entries).
   */
  ancestry: LineageAncestryEntry[]
  /** Inline-edit form data (FI-024 H1); `null` when the profile isn't provisioned (empty state). */
  editor: OwnerEditorData | null
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
      ancestry: [],
      editor: null,
      viewerContext,
    }
  }

  const [lineageProfile, attachments, ancestry, passport, directoryProfile, canUploadVideo] =
    await Promise.all([
      profile.lineageNodeId ? getOwnLineageProfile(userId) : Promise.resolve(null),
      getDashboardMediaAttachments({
        brand,
        // The `/me` page already authenticated; the media ACL needs the session user object.
        user: session!.user,
        target: { kind: "passport", id: profile.passportId },
      }),
      // FI-024 H3: the owner's PUBLIC lineage up-chain, rendered by the same `AncestrySection`
      // the public directory arm uses. The walk is PUBLIC-only, so it self-gates for a member
      // whose node isn't public.
      getLineageAncestryForPassport(profile.passportId),
      // FI-024 H1: the editable Passport + DirectoryProfile forms for the inline-edit drawer —
      // the SAME payloads the `/app/profile` Profile tab feeds the ONE `PassportEditor`.
      getPassportByUserId(userId),
      getDirectoryProfileByUserId(userId),
      canUploadMediaForUser(session!.user, brand),
    ])

  const galleryImages = (attachments ?? []).filter(attachment => attachment.type === "IMAGE")

  // Both are provisioned together at sign-up; only mount the editor when both are present.
  const editor: OwnerEditorData | null =
    passport && directoryProfile ? { userId, passport, directoryProfile, canUploadVideo } : null

  return {
    isOwner: true,
    brand,
    profile,
    lineageProfile,
    galleryImages,
    ancestry,
    editor,
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

  // Doug LOW-3 (SESSION_0515): `findProfileBySlug` already resolved the tier render policy for the
  // same account, so reuse the one it threads back (`profile.renderPolicy`) instead of re-querying.
  const renderPolicy = profile.renderPolicy

  const [origin, viewerClaimState, claimFunnelHref, ancestry] = await Promise.all([
    getRequestOrigin(),
    resolveViewerClaimState(db, { passportId: profile.passportId, viewerUserId }),
    resolveClaimFunnelHref(profile),
    // Placeholder profiles early-return to the claim teaser (no sections) — skip the walk.
    profile.isClaimablePlaceholder
      ? Promise.resolve<LineageAncestryEntry[]>([])
      : getLineageAncestryForPassport(profile.passportId),
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
