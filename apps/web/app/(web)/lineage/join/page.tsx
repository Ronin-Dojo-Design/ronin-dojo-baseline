import type { Metadata } from "next"
import { cache } from "react"
import { Wrapper } from "~/components/common/wrapper"
import { Brand } from "~/.generated/prisma/client"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { findLineageMembershipPlans } from "~/server/web/billing/lineage-membership"
import { getJoinWizardOptions } from "~/server/web/lineage/join-options"
import { isLifetimeComp } from "~/lib/lineage/dirty-dozen"
import { db } from "~/services/db"
import { BblHeritage } from "~/app/(web)/(home)/bbl/bbl-landing/bbl-heritage"
import { BblVideo } from "~/app/(web)/(home)/bbl/bbl-landing/bbl-video"
import { getStaticBblRankColors } from "~/app/(web)/(home)/bbl/bbl-landing/bbl-rank-colors"
import { heritageContent } from "~/app/(web)/(home)/bbl/bbl-landing-content"
import { JoinLegacyLanding } from "./join-legacy-landing"

const getData = cache(async (nodeId?: string) => {
  const url = "/lineage/join"
  const title = "Join the Legacy"
  const description =
    "Share your martial arts history, claim your lineage profile, and choose a free or premium Black Belt Legacy listing path."

  const findClaimableTree = (constrainNode: boolean) =>
    db.lineageTree.findFirst({
      where: {
        brand: Brand.BBL,
        isPublished: true,
        isClaimable: true,
        // When arriving with a specific ?node= (a claim link), resolve the tree
        // that actually CONTAINS that node — don't assume it's the most-recently
        // -updated claimable tree, or the node silently fails to preselect.
        members: { some: { isClaimable: true, ...(constrainNode && nodeId ? { nodeId } : {}) } },
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
            // Visual-group label drives the comp term shown on the locked tier card:
            // Dirty Dozen → lifetime Elite, everyone else → first-year-comp Elite. SAME
            // signal `createJoinLegacyInterest` uses to grant the comp, so the UI never
            // contradicts the grant (SESSION_0445 #1).
            visualGroup: { select: { label: true } },
            node: {
              select: {
                passport: { select: { displayName: true, user: { select: { name: true } } } },
              },
            },
          },
        },
      },
    })

  const [nodeTree, membershipPlans, joinOptions] = await Promise.all([
    nodeId ? findClaimableTree(true) : Promise.resolve(null),
    findLineageMembershipPlans(Brand.BBL),
    getJoinWizardOptions(),
  ])
  // Prefer the node's own tree; fall back to the first claimable tree for the
  // generic entry, or when a stale/invalid node link doesn't resolve (so the
  // visitor still lands on a usable form).
  const claimableTree = nodeTree ?? (await findClaimableTree(false))

  // For a claim-link arrival (?node=), is the claimed node a Dirty Dozen member?
  // → the comp tier card shows "Elite for life" vs "first year complimentary".
  const claimMember = nodeId
    ? claimableTree?.members.find(member => member.nodeId === nodeId)
    : undefined
  const compIsLifetime = isLifetimeComp(claimMember?.visualGroup?.label)

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
    compIsLifetime,
    membershipPlans,
    joinOptions,
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
  const { claimableTree, compIsLifetime, membershipPlans, joinOptions } = await getData(
    params?.node,
  )

  // Preselect the claim node only when it's an actual claimable member of the
  // resolved tree (e.g. arriving from a View A card "Claim this profile").
  const initialNodeId =
    params?.node && claimableTree?.members.some(member => member.nodeId === params.node)
      ? params.node
      : undefined

  // Belt color for the Rigan heritage section's badge (Rank.colorHex data).
  const rankColors = await getStaticBblRankColors([heritageContent.badge])

  return (
    <Wrapper size="lg" gap="lg">
      <JoinLegacyLanding
        claimableTree={claimableTree}
        initialNodeId={initialNodeId}
        compIsLifetime={compIsLifetime}
        membershipPlans={membershipPlans}
        joinOptions={joinOptions}
        isCancelled={isCancelled}
        isSubmitted={isSubmitted}
        riganSlot={<BblHeritage rankColors={rankColors} />}
        videoSlot={<BblVideo />}
      />
    </Wrapper>
  )
}
