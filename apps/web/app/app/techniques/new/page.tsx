import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { getServerSession } from "~/lib/auth"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { getTechniqueFormOptions } from "~/server/web/techniques/queries"
import { db } from "~/services/db"

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/app/techniques/new",
    metadata: {
      title: "New Technique",
      description: "Create a technique in the dashboard.",
      robots: { index: false, follow: false },
    },
  })
}

export default async function NewTechniquePage() {
  const session = await getServerSession()
  if (!session?.user) redirect("/auth/login?next=/app/techniques/new")

  // Find org where user is owner/instructor
  const membership = await db.membership.findFirst({
    where: {
      userId: session.user.id,
      roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } },
      organization: { brand: Brand.BBL },
    },
    include: { organization: { select: { id: true } } },
  })

  if (!membership) notFound()

  const { disciplines, belts } = await getTechniqueFormOptions()

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/app/profile", title: "Dashboard" },
          { url: "/app/profile", title: "Techniques" },
          { url: "/app/techniques/new", title: "New Technique" },
        ]}
      />

      <TechniqueForm
        organizationId={membership.organization.id}
        disciplines={disciplines}
        belts={belts}
      />
    </>
  )
}
