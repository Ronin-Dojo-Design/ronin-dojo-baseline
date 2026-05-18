import type { Metadata } from "next"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { MerchBrowser, type MerchCategoryTab } from "~/components/web/tuffbuffs/merch-browser"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import {
  findMerchProducts,
  getMerchMetadata,
  type MerchProductMetadata,
} from "~/server/web/merch/queries"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Merch Store",
  description:
    "TuffBuffs own-brand merchandise — shirts, rash guards, hoodies, training gear, and accessories.",
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
    <Wrapper gap="lg">
      <Intro className="max-w-3xl">
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">TuffBuffs</Badge>
          <Badge variant="soft">Own-brand merch</Badge>
        </Stack>
        <IntroTitle>Merch Store</IntroTitle>
        <IntroDescription>
          Official TuffBuffs merchandise — shirts, rash guards, hoodies, training gear, and
          accessories built for fighters.
        </IntroDescription>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Free shipping on orders over $75. Flat rate $4.99 shipping on all other orders.
        </p>
      </Intro>

      <MerchBrowser products={rows} metadataMap={metadataMap} categories={categories} />
    </Wrapper>
  )
}
