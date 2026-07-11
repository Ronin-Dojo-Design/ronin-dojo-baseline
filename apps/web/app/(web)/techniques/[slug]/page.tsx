import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
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

  // Freemium (SESSION_0525): a free technique plays for everyone; a premium one plays only for an
  // entitled viewer (premium tier / admin / the author). The gate is resolved OUTSIDE the cached
  // `findTechniqueBySlug` (it reads the session), so the technique payload stays cacheable.
  const authorPassportIds = technique.mediaAttachments
    .map(attachment => attachment.passportId)
    .filter((id): id is string => id != null)
  const viewerEntitled = technique.isPremium
    ? await resolveTechniqueViewerEntitled(authorPassportIds)
    : true

  return <TechniqueDetail technique={technique} brand={Brand.BBL} viewerEntitled={viewerEntitled} />
}
