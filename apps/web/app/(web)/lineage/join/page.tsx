import type { Metadata } from "next"
import { cache } from "react"
import { Card } from "~/components/common/card"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { db } from "~/services/db"
import { JoinLegacyForm } from "./join-legacy-form"

const getData = cache(async () => {
  const brand = await getRequestBrand()
  const url = "/lineage/join"
  const title = "Join the Legacy"
  const description =
    "Share your martial arts history, claim your lineage profile, and choose a free or premium Black Belt Legacy listing path."

  const claimableTree = await db.lineageTree.findFirst({
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
          node: { select: { user: { select: { name: true } } } },
        },
      },
    },
  })

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
            displayName: member.node.user.name,
          })),
        }
      : null,
  }
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function JoinLegacyPage() {
  const { metadata, claimableTree } = await getData()

  return (
    <Wrapper size="lg" gap="lg">
      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5">
          <JoinLegacyForm claimableTree={claimableTree} />
        </Card>

        <Stack direction="column" className="gap-4">
          <Card className="p-4">
            <Stack direction="column" size="xs">
              <strong>What this creates</strong>
              <Note className="text-sm">
                A lead record, a draft directory listing, and, when you are signed in and select a
                lineage node, a profile claim request.
              </Note>
            </Stack>
          </Card>
          <Card className="p-4">
            <Stack direction="column" size="xs">
              <strong>Premium path</strong>
              <Note className="text-sm">
                Premium and Elite choices route to the existing paid listing checkout after the
                intake is saved.
              </Note>
            </Stack>
          </Card>
        </Stack>
      </div>
    </Wrapper>
  )
}
