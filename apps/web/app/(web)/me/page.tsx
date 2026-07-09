import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "~/lib/auth"
import { getPageMetadata } from "~/lib/pages"
import { ProfileView } from "~/app/(web)/_components/profile-view"
import { loadProfileViewForOwner } from "~/server/web/directory/profile-view"

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/me",
    metadata: {
      title: "My Passport",
      description: "Your martial arts identity, promotion history, and directory profile.",
      robots: { index: false, follow: false },
    },
  })
}

export default async function MePage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Post-S2 sign-up always creates a Passport + DirectoryProfile, but the loader degrades
  // gracefully (no redirect loop) — a null profile renders the "set up your Passport" state.
  const view = await loadProfileViewForOwner(session.user.id)

  return <ProfileView view={view} />
}
