import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"
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

  // Verify user has access
  const membership = await db.membership.findFirst({
    where: {
      userId: session.user.id,
      organizationId: technique.organizationId,
      roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } },
    },
  })

  if (!membership) notFound()

  const disciplines = await db.discipline.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const brand = await getRequestBrand()
  const mediaAttachments =
    (await getDashboardMediaAttachments({
      brand,
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
