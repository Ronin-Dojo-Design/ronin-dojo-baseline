import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { getServerSession } from "~/lib/auth"
import { getPageMetadata } from "~/lib/pages"
import { db } from "~/services/db"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return await getPageMetadata({
    url: `/dashboard/techniques/${id}`,
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
  if (!session?.user) redirect(`/auth/login?next=/dashboard/techniques/${id}`)

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

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/dashboard", title: "Dashboard" },
          { url: "/dashboard", title: "Techniques" },
          { url: `/dashboard/techniques/${id}`, title: technique.name },
        ]}
      />

      <TechniqueForm
        organizationId={technique.organizationId}
        disciplines={disciplines}
        technique={technique}
      />
    </>
  )
}
