import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function MemberDetailRedirectPage({ params }: PageProps) {
  const { slug } = await params

  redirect(`/directory/${slug}`)
}
