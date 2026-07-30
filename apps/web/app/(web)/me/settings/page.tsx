import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
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

  const settings = await getOwnMemberSettings(session.user.id)

  return <MemberSettingsView brand={Brand.BBL} settings={settings} />
}
