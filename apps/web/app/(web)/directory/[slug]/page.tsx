import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { ProfileView } from "~/app/(web)/_components/profile-view"
import { findProfileBySlug } from "~/server/web/directory/queries"
import { loadProfileViewBySlug } from "~/server/web/directory/profile-view"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const profile = await findProfileBySlug({ slug, brand: Brand.BBL })

  if (!profile) return { title: "Profile Not Found" }

  return {
    title: profile.user.name ?? "Directory Profile",
    description: profile.canRenderFullProfile
      ? `View ${profile.user.name}'s profile in the directory.`
      : `View ${profile.user.name}'s directory listing preview.`,
  }
}

export default async function DirectoryProfilePage({ params }: PageProps) {
  const { slug } = await params
  const view = await loadProfileViewBySlug(slug)

  if (!view) {
    notFound()
  }

  return <ProfileView view={view} />
}
