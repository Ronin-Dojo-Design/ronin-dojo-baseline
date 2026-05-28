import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { hasLineageAdminAccess } from "~/components/admin/auth-hoc"
import { Shell } from "~/components/admin/shell"
import { getServerSession } from "~/lib/auth"

export const metadata: Metadata = {
  title: "Admin Panel",
}

export default async function ({ children }: LayoutProps<"/admin">) {
  const session = await getServerSession()

  const role = session?.user.role
  const hasLineageAccess = session?.user
    ? await hasLineageAdminAccess(session.user.id, role)
    : false

  if (role !== "admin" && role !== "tournament_director" && !hasLineageAccess) {
    redirect("/auth/login")
  }

  return (
    <Shell
      userRole={role === "admin" || role === "tournament_director" ? role : "lineage_tree_admin"}
    >
      {children}
    </Shell>
  )
}
