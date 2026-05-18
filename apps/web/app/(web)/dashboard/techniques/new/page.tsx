import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

export default async function NewTechniquePage() {
  const session = await getServerSession()
  if (!session?.user) redirect("/login")

  const brand = await getRequestBrand()

  // Find org where user is owner/instructor
  const membership = await db.membership.findFirst({
    where: {
      userId: session.user.id,
      roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } },
      organization: { brand },
    },
    include: { organization: { select: { id: true } } },
  })

  if (!membership) notFound()

  const disciplines = await db.discipline.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return <TechniqueForm organizationId={membership.organization.id} disciplines={disciplines} />
}
