import { redirect } from "next/navigation"
import { SchoolForm } from "~/app/(web)/dashboard/school-form"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { findUserOrganization } from "~/server/web/dashboard/queries"

export async function DashboardSchoolTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/app/profile")
  }

  const organization = await findUserOrganization(session.user.id, Brand.BBL)

  return <SchoolForm organization={organization} />
}
