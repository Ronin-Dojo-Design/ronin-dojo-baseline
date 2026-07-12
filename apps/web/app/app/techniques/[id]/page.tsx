import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"
import { getTechniqueFormOptions } from "~/server/web/techniques/queries"
import { db } from "~/services/db"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return await getPageMetadata({
    url: `/app/techniques/${id}`,
    metadata: {
      title: "Edit Technique",
      description: "Manage a technique in the dashboard.",
      robots: { index: false, follow: false },
    },
  })
}

export default async function EditTechniquePage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession()
  if (!session?.user) redirect(`/auth/login?next=/app/techniques/${id}`)

  const technique = await db.technique.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      disciplineId: true,
      position: true,
      category: true,
      difficultyLevel: true,
      beltLevelMinId: true,
      isGi: true,
      isFoundational: true,
      requiresPartner: true,
      requiresEquipment: true,
      movementPattern: true,
      rangeBand: true,
      teachingCues: true,
      commonErrors: true,
      safetyNotes: true,
      isPublished: true,
      organizationId: true,
    },
  })

  if (!technique) notFound()

  // @changed SESSION_0528 (ADR 0046) — `organizationId` is now nullable. This org-library editor stays
  // org-membership-gated; an authored profile-only technique (null org) has no org gate and is edited
  // via the profile authoring flow (Slice 3B), so it 404s here. Narrows org to a non-null string below.
  if (!technique.organizationId) notFound()

  // Verify user has access
  const membership = await db.membership.findFirst({
    where: {
      userId: session.user.id,
      organizationId: technique.organizationId,
      roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } },
    },
  })

  if (!membership) notFound()

  const { disciplines, belts } = await getTechniqueFormOptions()

  const mediaAttachments =
    (await getDashboardMediaAttachments({
      brand: Brand.BBL,
      user: session.user,
      target: { kind: "technique", id: technique.id },
    })) ?? []

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/app/profile", title: "Dashboard" },
          { url: "/app/profile", title: "Techniques" },
          { url: `/app/techniques/${id}`, title: technique.name },
        ]}
      />

      <TechniqueForm
        organizationId={technique.organizationId}
        disciplines={disciplines}
        belts={belts}
        technique={technique}
      />

      <Section>
        <Section.Content>
          <MediaAttachmentManager
            target={{ kind: "technique", id: technique.id }}
            initialAttachments={mediaAttachments}
            title="Technique media"
            description="Images or video that demonstrate this technique. Public items appear on the technique page."
          />
        </Section.Content>
      </Section>
    </>
  )
}
