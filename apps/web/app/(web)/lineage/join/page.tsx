import type { Metadata } from "next"
import { cache } from "react"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { findLineageMembershipPlans } from "~/server/web/billing/lineage-membership"
import { db } from "~/services/db"
import { JoinLegacyForm } from "./join-legacy-form"
import { LineageMembershipCheckout } from "./lineage-membership-checkout"

const getData = cache(async () => {
  const brand = await getRequestBrand()
  const url = "/lineage/join"
  const title = "Join the Legacy"
  const description =
    "Share your martial arts history, claim your lineage profile, and choose a free or premium Black Belt Legacy listing path."

  const [claimableTree, membershipPlans] = await Promise.all([
    db.lineageTree.findFirst({
      where: {
        brand,
        isPublished: true,
        isClaimable: true,
        members: { some: { isClaimable: true } },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        members: {
          where: { isClaimable: true },
          orderBy: { visualSortOrder: "asc" },
          select: {
            nodeId: true,
            node: {
              select: {
                passport: { select: { displayName: true, user: { select: { name: true } } } },
              },
            },
          },
        },
      },
    }),
    findLineageMembershipPlans(brand),
  ])

  return {
    ...(await getPageData(url, title, description, {
      breadcrumbs: [{ url, title }],
    })),
    claimableTree: claimableTree
      ? {
          id: claimableTree.id,
          name: claimableTree.name,
          members: claimableTree.members.map(member => ({
            nodeId: member.nodeId,
            displayName:
              member.node.passport?.displayName ?? member.node.passport?.user?.name ?? "Unnamed",
          })),
        }
      : null,
    membershipPlans,
  }
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

type JoinLegacyPageProps = {
  searchParams?: Promise<{ cancelled?: string; submitted?: string; node?: string }>
}

export default async function JoinLegacyPage({ searchParams }: JoinLegacyPageProps) {
  const params = await searchParams
  const isCancelled = params?.cancelled === "true"
  const isSubmitted = params?.submitted === "true"
  const { metadata, claimableTree, membershipPlans } = await getData()

  // Preselect the claim node only when it's an actual claimable member of the
  // resolved tree (e.g. arriving from a View A card "Claim this profile").
  const initialNodeId =
    params?.node && claimableTree?.members.some(member => member.nodeId === params.node)
      ? params.node
      : undefined

  return (
    <Wrapper size="lg" gap="lg">
      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      {isCancelled && (
        <Card hover={false} className="p-4" data-testid="lineage-checkout-cancelled">
          <Stack direction="column" size="xs">
            <Badge variant="warning">Checkout cancelled</Badge>
            <Note className="text-sm">
              No lineage membership payment was completed. Your claim intake is still available.
            </Note>
          </Stack>
        </Card>
      )}

      {isSubmitted && (
        <Card hover={false} className="p-4" data-testid="join-legacy-submitted">
          <Stack direction="column" size="xs">
            <Badge variant="success">Intake saved</Badge>
            <Note className="text-sm">
              Your lineage information was received. Free profiles wait for steward review; Premium
              and Elite paths continue through the lineage membership checkout below.
            </Note>
          </Stack>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5">
          <JoinLegacyForm claimableTree={claimableTree} initialNodeId={initialNodeId} />
        </Card>

        <Stack direction="column" className="gap-4">
          <Card className="p-4">
            <Stack direction="column" size="xs">
              <strong>What this creates</strong>
              <Note className="text-sm">
                A private lead record for steward review and, when you are signed in and select a
                lineage node, a profile claim request.
              </Note>
            </Stack>
          </Card>
          <Card className="p-4">
            <Stack direction="column" size="xs">
              <strong>Premium path</strong>
              <Note className="text-sm">
                Free claim intake stays separate from paid lineage membership access.
              </Note>
            </Stack>
          </Card>
          <div id="lineage-membership" className="scroll-mt-24">
            <LineageMembershipCheckout plans={membershipPlans} />
          </div>
        </Stack>
      </div>
    </Wrapper>
  )
}
