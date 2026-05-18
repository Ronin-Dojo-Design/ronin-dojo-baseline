import { redirect } from "next/navigation"
import { ProfileForm } from "~/app/(web)/dashboard/profile-form"
import { getServerSession } from "~/lib/auth"
import { findUserDirectoryProfile, findUserPassport } from "~/server/web/dashboard/queries"

export async function DashboardProfileTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/dashboard")
  }

  const [passport, directoryProfile] = await Promise.all([
    findUserPassport(session.user.id),
    findUserDirectoryProfile(session.user.id),
  ])

  return <ProfileForm passport={passport} directoryProfile={directoryProfile} />
}
