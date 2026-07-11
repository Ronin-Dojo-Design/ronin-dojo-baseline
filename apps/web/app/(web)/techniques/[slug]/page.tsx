import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
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

  return <TechniqueDetail technique={technique} brand={Brand.BBL} gatedMedia={gatedMedia} />
}
