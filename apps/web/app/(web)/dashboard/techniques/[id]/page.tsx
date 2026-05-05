import { notFound, redirect } from "next/navigation"
import { getServerSession } from "~/lib/auth"
import { db } from "~/services/db"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"

type Props = { params: Promise<{ id: string }> }

export default async function EditTechniquePage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession()
  if (!session?.user) redirect("/login")

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
    <TechniqueForm
      organizationId={technique.organizationId}
      disciplines={disciplines}
      technique={technique}
    />
  )
}
