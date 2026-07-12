import { notFound } from "next/navigation"
import { Brand, type DirectoryVisibility } from "~/.generated/prisma/client"
import { TechniqueDetail } from "~/app/(web)/techniques/[slug]/_components/technique-detail"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { getServerSession } from "~/lib/auth"
import { findAuthoredTechnique } from "~/server/web/techniques/queries"
import {
  gateTechniqueMedia,
  hasPremiumTechniqueMedia,
} from "~/server/web/techniques/technique-media-gate"
import { isTechniqueViewerEntitled } from "~/server/web/techniques/technique-access"
import { db } from "~/services/db"

type PageProps = {
  params: Promise<{ slug: string; techniqueSlug: string }>
}

/**
 * SESSION_0529 Slice 3B (ADR 0046) — the PUBLIC authored-technique watch page, PROFILE-SCOPED:
 * `/directory/[slug]/techniques/[techniqueSlug]`. The technique read is keyed by the profile's
 * `authorPassportId` + slug (`findAuthoredTechnique` — no discovery filter, published only), so a
 * profile-only authored row renders HERE while staying off the canonical `/techniques/[slug]`
 * browse/watch (the D4 `isFeatured` gate is untouched). A slug that belongs to a DIFFERENT
 * passport, or an unpublished row, 404s.
 *
 * Freemium gating is EXACTLY the canonical watch page's: per-clip entitlement resolved off the
 * session, media gated + url-stripped server-side (`gateTechniqueMedia`) before render — a locked
 * premium tile ships with NO playable url (payload-layer no-leak invariant).
 */
export default async function AuthoredTechniqueWatchPage({ params }: PageProps) {
  const { slug, techniqueSlug } = await params

  // Resolve the profile → passport with the SAME visibility rules as `/directory/[slug]` itself
  // (HIDDEN never resolves; MEMBERS_ONLY needs a session) — the watch page can't be a side door
  // around a profile's directory visibility.
  const session = await getServerSession()
  const allowedVisibility: DirectoryVisibility[] = session?.user
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]
  const profile = await db.directoryProfile.findFirst({
    where: { slug, visibility: { in: allowedVisibility } },
    select: { passportId: true, passport: { select: { displayName: true } } },
  })

  if (!profile) {
    notFound()
  }

  const technique = await findAuthoredTechnique({
    authorPassportId: profile.passportId,
    slug: techniqueSlug,
    brand: Brand.BBL,
  })

  if (!technique) {
    notFound()
  }

  // Per-clip freemium (SESSION_0527, mirrored from the canonical watch page): entitlement is
  // resolved only when a premium attachment exists; the technique's AUTHOR (this profile's
  // passport) counts as an owner, so authors always see their own clips unlocked.
  const attachments = technique.mediaAttachments
  const attachmentAuthorIds = attachments
    .map(attachment => attachment.passportId)
    .filter((id): id is string => id != null)
  const viewerEntitled = hasPremiumTechniqueMedia(attachments)
    ? await isTechniqueViewerEntitled({
        userId: session?.user?.id ?? null,
        role: session?.user?.role,
        authorPassportIds: [profile.passportId, ...attachmentAuthorIds],
      })
    : true
  const gatedMedia = gateTechniqueMedia(attachments, viewerEntitled)

  // WL-P2-52 — a profile-scoped watch page needs attribution + a way back: crumb up to the
  // author's directory profile (Directory → {profile} → {technique}). Mirrors the `[id]`/`new`
  // editor breadcrumbs.
  const profileName = profile.passport?.displayName ?? slug

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/directory", title: "Directory" },
          { url: `/directory/${slug}`, title: profileName },
          { url: `/directory/${slug}/techniques/${techniqueSlug}`, title: technique.name },
        ]}
      />
      <TechniqueDetail technique={technique} brand={Brand.BBL} gatedMedia={gatedMedia} />
    </>
  )
}
