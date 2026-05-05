import { redirect } from "next/navigation"
import { SchoolForm } from "~/app/(web)/dashboard/school-form"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findUserOrganization } from "~/server/web/dashboard/queries"

export async function DashboardSchoolTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/dashboard")
  }

  const brand = await getRequestBrand()
  const organization = await findUserOrganization(session.user.id, brand)

  return <SchoolForm organization={organization} />
}
