import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Shell } from "~/components/admin/shell"
import { getServerSession } from "~/lib/auth"

export const metadata: Metadata = {
  title: "Admin Panel",
}

export default async function ({ children }: LayoutProps<"/admin">) {
  const session = await getServerSession()

  const role = session?.user.role

  if (role !== "admin" && role !== "tournament_director") {
    redirect("/auth/login")
  }

  return <Shell userRole={role}>{children}</Shell>
}
