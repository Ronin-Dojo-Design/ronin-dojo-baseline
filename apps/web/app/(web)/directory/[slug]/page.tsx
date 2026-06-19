import { notFound } from "next/navigation"
import { getRequestBrand } from "~/lib/brand-context"
import { findProfileBySlug } from "~/server/web/directory/queries"
import { DirectoryProfile } from "./_components/directory-profile"
import { loadDirectoryProfile } from "./_components/directory-profile/directory-profile-data"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const profile = await findProfileBySlug({ slug, brand })

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
  const view = await loadDirectoryProfile(slug)

  if (!view) {
    notFound()
  }

  return <DirectoryProfile {...view} />
}
