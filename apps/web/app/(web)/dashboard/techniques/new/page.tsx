import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { db } from "~/services/db"

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    url: "/dashboard/techniques/new",
    metadata: {
      title: "New Technique",
      description: "Create a technique in the dashboard.",
      robots: { index: false, follow: false },
    },
  })
}

export default async function NewTechniquePage() {
  const session = await getServerSession()
  if (!session?.user) redirect("/auth/login?next=/dashboard/techniques/new")

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

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/dashboard", title: "Dashboard" },
          { url: "/dashboard", title: "Techniques" },
          { url: "/dashboard/techniques/new", title: "New Technique" },
        ]}
      />

      <TechniqueForm organizationId={membership.organization.id} disciplines={disciplines} />
    </>
  )
}
