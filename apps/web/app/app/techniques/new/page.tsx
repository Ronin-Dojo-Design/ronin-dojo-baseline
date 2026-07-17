import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { TechniqueForm } from "~/app/(web)/dashboard/technique-form"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { getServerSession } from "~/lib/auth"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { findActiveStaffMembership } from "~/server/web/techniques/permissions"
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

  // Find org where user is an ACTIVE owner/instructor — the ONE shared ACTIVE-staff predicate
  // (WL-P2-49; a CANCELLED staff membership must not authorize, matching the techniques-tab gate).
  const membership = await findActiveStaffMembership(db, session.user.id, { brand: Brand.BBL })

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
        organizationId={membership.organizationId}
        disciplines={disciplines}
        belts={belts}
      />
    </>
  )
}
