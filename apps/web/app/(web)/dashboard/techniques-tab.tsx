import { redirect } from "next/navigation"
import { TechniquesTable } from "~/app/(web)/dashboard/techniques-table"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { findUserTechniques } from "~/server/web/dashboard/queries"

export async function DashboardTechniquesTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/app/profile")
  }

  const techniques = await findUserTechniques(session.user.id, Brand.BBL)

  return <TechniquesTable techniques={techniques} />
}
