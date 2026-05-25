import { notFound, redirect } from "next/navigation"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getLineageTreeBySlug } from "~/server/web/lineage/queries"
import { LineageClaimForm } from "./claim-form"

/**
 * Lineage claim page — lets an authenticated user claim a node on a published tree.
 *
 * Route: `/lineage/[treeSlug]/claim`
 *
 * Author: Cody / SESSION_0182 TASK_02.
 */

interface Props {
  params: Promise<{ treeSlug: string }>
}

export default async function LineageClaimPage({ params }: Props) {
  const { treeSlug } = await params

  // Auth gate: redirect to sign-in if no session.
  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/login?next=/lineage/${treeSlug}/claim`)
  }

  const brand = await getRequestBrand()
  const tree = await getLineageTreeBySlug({ brand, slug: treeSlug })

  if (!tree) {
    notFound()
  }

  // Build member list for the node selector.
  const members = tree.members.map(m => ({
    nodeId: m.nodeId,
    displayName: m.node.user?.passport?.displayName ?? m.node.user?.name ?? "Unknown",
  }))

  return (
    <Stack direction="column" className="mx-auto max-w-2xl py-8">
      <H4>Claim a Lineage Node</H4>
      <p className="text-muted-foreground text-sm">
        Submit a claim to take ownership of a node on the <strong>{tree.tree.name}</strong> lineage
        tree. After review, you&#39;ll be able to edit your profile and choose a listing tier.
      </p>

      <LineageClaimForm treeId={tree.tree.id} members={members} />
    </Stack>
  )
}
