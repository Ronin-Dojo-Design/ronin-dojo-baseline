import type { Metadata } from "next"
import { cache } from "react"
import { Wrapper } from "~/components/common/wrapper"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { findLineageMembershipPlans } from "~/server/web/billing/lineage-membership"
import { db } from "~/services/db"
import { JoinLegacyLanding } from "./join-legacy-landing"

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
  const { claimableTree, membershipPlans } = await getData()

  // Preselect the claim node only when it's an actual claimable member of the
  // resolved tree (e.g. arriving from a View A card "Claim this profile").
  const initialNodeId =
    params?.node && claimableTree?.members.some(member => member.nodeId === params.node)
      ? params.node
      : undefined

  return (
    <Wrapper size="lg" gap="lg">
      <JoinLegacyLanding
        claimableTree={claimableTree}
        initialNodeId={initialNodeId}
        membershipPlans={membershipPlans}
        isCancelled={isCancelled}
        isSubmitted={isSubmitted}
      />
    </Wrapper>
  )
}
