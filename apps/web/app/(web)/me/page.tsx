import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getPageMetadata } from "~/lib/pages"
import { getOwnDirectoryProfile } from "~/server/web/directory/queries"
import { getOwnLineageProfile } from "~/server/web/lineage/queries"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"
import { MeProfile } from "./_components/me-profile"

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

  const userId = session.user.id
  const profile = await getOwnDirectoryProfile({ userId, brand: Brand.BBL })

  // Post-S2 sign-up always creates a Passport + DirectoryProfile, but degrade
  // gracefully (no redirect loop) if the profile hasn't been provisioned yet.
  if (!profile) {
    return <MeProfile brand={Brand.BBL} profile={null} lineageProfile={null} galleryImages={[]} />
  }

  const [lineageProfile, attachments] = await Promise.all([
    profile.lineageNodeId ? getOwnLineageProfile(userId) : Promise.resolve(null),
    getDashboardMediaAttachments({
      brand: Brand.BBL,
      user: session.user,
      target: { kind: "passport", id: profile.passportId },
    }),
  ])

  const galleryImages = (attachments ?? []).filter(attachment => attachment.type === "IMAGE")

  return (
    <MeProfile
      brand={Brand.BBL}
      profile={profile}
      lineageProfile={lineageProfile}
      galleryImages={galleryImages}
    />
  )
}
