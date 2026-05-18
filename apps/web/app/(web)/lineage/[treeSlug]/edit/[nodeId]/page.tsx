import { notFound, redirect } from "next/navigation"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getEditableLineageNodeProfile } from "~/server/web/lineage/node-profile-queries"
import { LineageNodeProfileForm } from "./_components/lineage-node-profile-form"

interface Props {
  params: Promise<{ treeSlug: string; nodeId: string }>
}

export default async function EditLineageNodeProfilePage({ params }: Props) {
  const { treeSlug, nodeId } = await params

  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/sign-in?callbackUrl=/lineage/${treeSlug}/edit/${nodeId}`)
  }

  const brand = await getRequestBrand()
  const profile = await getEditableLineageNodeProfile({
    brand,
    treeSlug,
    nodeId,
    userId: session.user.id,
  })

  if (!profile) {
    notFound()
  }

  return (
    <Stack direction="column" className="mx-auto max-w-2xl py-8">
      <Stack size="xs" direction="column">
        <H4 as="h1">Edit Lineage Profile</H4>
        <Note>Update how this approved lineage node appears on the published tree.</Note>
      </Stack>

      <LineageNodeProfileForm profile={profile} />
    </Stack>
  )
}
