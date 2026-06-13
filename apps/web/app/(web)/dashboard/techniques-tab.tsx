import { redirect } from "next/navigation"
import { TechniquesTable } from "~/app/(web)/dashboard/techniques-table"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findUserTechniques } from "~/server/web/dashboard/queries"

export async function DashboardTechniquesTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/app/profile")
  }

  const brand = await getRequestBrand()
  const techniques = await findUserTechniques(session.user.id, brand)

  return <TechniquesTable techniques={techniques} />
}
