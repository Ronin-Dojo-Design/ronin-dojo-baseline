import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Shell } from "~/components/admin/shell"
import { getServerSession } from "~/lib/auth"

export const metadata: Metadata = {
  title: "Admin Panel",
}

export default async function ({ children }: LayoutProps<"/admin">) {
  const session = await getServerSession()

  if (session?.user.role !== "admin") {
    redirect("/auth/login")
  }

  return <Shell>{children}</Shell>
}
