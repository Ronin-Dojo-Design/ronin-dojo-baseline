import { notFound } from "next/navigation"
import { Brand, TechniqueProgressStatus } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { findOwnTechniqueProgress } from "~/server/web/techniques/progress"
import {
  gateTechniqueMedia,
  hasPremiumTechniqueMedia,
} from "~/server/web/techniques/technique-media-gate"
import { findTechniqueBySlug } from "~/server/web/techniques/queries"
import { resolveTechniqueViewerEntitled } from "~/server/web/techniques/technique-access"
import { TechniqueDetail } from "./_components/technique-detail"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function TechniqueDetailPage({ params }: PageProps) {
  const { slug } = await params
  const technique = await findTechniqueBySlug(slug, Brand.BBL)

  if (!technique) {
    notFound()
  }

  // Freemium (SESSION_0527 Slice 0, per-video): each attachment is gated individually so a technique
  // can mix free + premium clips. Entitlement is resolved OUTSIDE the cached `findTechniqueBySlug`
  // (it reads the session) — only when the technique actually has a premium attachment — and the media
  // is gated + url-stripped server-side BEFORE render, so no premium url reaches an unentitled payload.
  const attachments = technique.mediaAttachments
  const authorPassportIds = attachments
    .map(attachment => attachment.passportId)
    .filter((id): id is string => id != null)
  const viewerEntitled = hasPremiumTechniqueMedia(attachments)
    ? await resolveTechniqueViewerEntitled(authorPassportIds)
    : true
  const gatedMedia = gateTechniqueMedia(attachments, viewerEntitled)

  // G-022 Lane B (SESSION_0580) — resolve the viewer's OWN progress. `null` for an anonymous
  // visitor (the control renders nothing for them); a signed-in viewer always gets an object, even
  // when they have never tracked this technique (`isTracked: false`, status defaults NOT_STARTED).
  const session = await getServerSession()
  const ownProgress = session?.user
    ? await findOwnTechniqueProgress(session.user.id, technique.id)
    : null
  const progress = session?.user
    ? {
        status: ownProgress?.status ?? TechniqueProgressStatus.NOT_STARTED,
        isTracked: Boolean(ownProgress),
      }
    : null

  return (
    <TechniqueDetail
      technique={technique}
      brand={Brand.BBL}
      gatedMedia={gatedMedia}
      progress={progress}
    />
  )
}
