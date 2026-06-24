import { Wrapper } from "~/components/common/wrapper"
import { BblHeritage } from "~/app/(web)/(home)/bbl/bbl-landing/bbl-heritage"
import { getStaticBblRankColors } from "~/app/(web)/(home)/bbl/bbl-landing/bbl-rank-colors"
import { BblVideo } from "~/app/(web)/(home)/bbl/bbl-landing/bbl-video"
import { heritageContent } from "~/app/(web)/(home)/bbl/bbl-landing-content"
import { JoinLegacyLanding } from "~/app/(web)/lineage/join/join-legacy-landing"
import { Brand } from "~/.generated/prisma/client"
import { findLineageMembershipPlans } from "~/server/web/billing/lineage-membership"
import { getJoinWizardOptions } from "~/server/web/lineage/join-options"
import { db } from "~/services/db"

/**
 * BBL home / landing — the same composition as `/lineage/join` (scrolling-phone hero →
 * Rigan heritage → Rigan video → claim wizard → email capture), promoted to the main
 * page (SESSION_0416). The `/lineage/join` route is kept as-is; this is the generic
 * variant for `/` (no `?node=` preselect). Behind the countdown gate — only the
 * bob-tony preview cookie sees it.
 */
export async function BblJoinLanding() {
  const [claimableTree, membershipPlans, rankColors, joinOptions] = await Promise.all([
    db.lineageTree.findFirst({
      where: {
        brand: Brand.BBL,
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
    findLineageMembershipPlans(Brand.BBL),
    getStaticBblRankColors([heritageContent.badge]),
    getJoinWizardOptions(),
  ])

  return (
    <Wrapper size="lg" gap="lg">
      <JoinLegacyLanding
        claimableTree={
          claimableTree
            ? {
                id: claimableTree.id,
                name: claimableTree.name,
                members: claimableTree.members.map(member => ({
                  nodeId: member.nodeId,
                  displayName:
                    member.node.passport?.displayName ??
                    member.node.passport?.user?.name ??
                    "Unnamed",
                })),
              }
            : null
        }
        membershipPlans={membershipPlans}
        joinOptions={joinOptions}
        isCancelled={false}
        isSubmitted={false}
        riganSlot={<BblHeritage rankColors={rankColors} />}
        videoSlot={<BblVideo />}
      />
    </Wrapper>
  )
}
