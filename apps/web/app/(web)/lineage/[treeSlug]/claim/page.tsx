import { notFound, redirect } from "next/navigation"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
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

  if (!tree.tree.isClaimable) {
    return (
      <Stack direction="column" className="mx-auto max-w-2xl py-8">
        <H4>Claim a Lineage Node</H4>
        <Note>This lineage tree is not currently accepting profile claims.</Note>
      </Stack>
    )
  }

  // Build member list for the node selector.
  const members = tree.members
    .filter(m => m.isClaimable)
    .map(m => ({
      nodeId: m.nodeId,
      displayName: m.node.user?.passport?.displayName ?? m.node.user?.name ?? "Unknown",
    }))

  if (members.length === 0) {
    return (
      <Stack direction="column" className="mx-auto max-w-2xl py-8">
        <H4>Claim a Lineage Node</H4>
        <Note>No profiles in this lineage tree are currently accepting claims.</Note>
      </Stack>
    )
  }

  const origin = await getRequestOrigin()
  const claimUrl = buildAbsoluteUrl(`/lineage/${treeSlug}/claim`, origin)

  return (
    <Stack direction="column" className="mx-auto max-w-2xl py-8">
      <Stack size="sm" wrap className="items-start justify-between">
        <H4>Claim a Lineage Node</H4>
        <QrShareButton
          url={claimUrl}
          title="Lineage Claim QR Code"
          description="Scan to open this lineage claim link."
          fileName={`lineage-${treeSlug}-claim`}
        />
      </Stack>
      <p className="text-muted-foreground text-sm">
        Submit a claim to take ownership of a node on the <strong>{tree.tree.name}</strong> lineage
        tree. After review, you&#39;ll be able to edit your profile and choose a listing tier.
      </p>

      <LineageClaimForm treeId={tree.tree.id} members={members} />
    </Stack>
  )
}
