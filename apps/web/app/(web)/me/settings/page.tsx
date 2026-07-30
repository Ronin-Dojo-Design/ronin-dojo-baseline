import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { getOwnMemberSettings } from "~/server/web/settings/queries"
import { MemberSettingsView } from "./_components/settings"

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/me/settings",
    metadata: {
      title: "Settings",
      description: "Manage your profile visibility, notifications, and account controls.",
      robots: { index: false, follow: false },
    },
  })
}

export default async function MeSettingsPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const [brand, settings] = await Promise.all([
    getRequestBrand(),
    getOwnMemberSettings(session.user.id),
  ])

  return <MemberSettingsView brand={brand} settings={settings} />
}
