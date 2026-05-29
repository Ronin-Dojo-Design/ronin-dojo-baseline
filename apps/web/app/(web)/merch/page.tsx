import type { Metadata } from "next"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { StructuredData } from "~/components/web/structured-data"
import { MerchBrowser, type MerchCategoryTab } from "~/components/web/tuffbuffs/merch-browser"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"
import {
  findMerchProducts,
  getMerchMetadata,
  type MerchProductMetadata,
} from "~/server/web/merch/queries"

export const revalidate = 3600

const PAGE_URL = "/merch"
const PAGE_TITLE = "Merch Store"
const PAGE_DESCRIPTION =
  "TuffBuffs own-brand merchandise — shirts, rash guards, hoodies, training gear, and accessories."

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

const categoryOrder = ["apparel", "rashguards", "gear", "accessories"] as const

const categoryLabels: Record<string, string> = {
  apparel: "Apparel",
  rashguards: "Rash Guards",
  gear: "Training Gear",
  accessories: "Accessories",
}

export default async function MerchPage() {
  const rows = await findMerchProducts()

  // Build metadata map and category counts
  const metadataMap: Record<string, MerchProductMetadata> = {}
  const categoryCounts: Record<string, number> = {}

  for (const row of rows) {
    const meta = getMerchMetadata(row)
    if (!meta) continue
    metadataMap[row.id] = meta
    categoryCounts[meta.category] = (categoryCounts[meta.category] ?? 0) + 1
  }

  const categories: MerchCategoryTab[] = categoryOrder
    .filter(id => (categoryCounts[id] ?? 0) > 0)
    .map(id => ({
      id,
      label: categoryLabels[id] ?? id,
      count: categoryCounts[id] ?? 0,
    }))

  return (
    <>
      <StructuredData
        data={createGraph([generateCollectionPage(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION)])}
      />

      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Section>
        <Section.Content>
          <Intro className="max-w-3xl">
            <Stack size="sm" className="flex-wrap">
              <Badge variant="outline">TuffBuffs</Badge>
              <Badge variant="soft">Own-brand merch</Badge>
            </Stack>
            <IntroTitle>{PAGE_TITLE}</IntroTitle>
            <IntroDescription>
              Official TuffBuffs merchandise — shirts, rash guards, hoodies, training gear, and
              accessories built for fighters.
            </IntroDescription>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Free shipping on orders over $75. Flat rate $4.99 shipping on all other orders.
            </p>
          </Intro>

          <MerchBrowser products={rows} metadataMap={metadataMap} categories={categories} />
        </Section.Content>
      </Section>
    </>
  )
}
