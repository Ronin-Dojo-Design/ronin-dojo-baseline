import type { Metadata } from "next"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import {
  AffiliateGearBrowser,
  type AffiliateGearViewSection,
} from "~/components/web/tuffbuffs/affiliate-gear-browser"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import {
  getTuffBuffsAffiliateGearByIds,
  type TuffBuffsGearCategory,
  tuffBuffsAffiliateGearCollections,
  tuffBuffsAffiliateGearProducts,
} from "~/lib/tuffbuffs/affiliate-gear"

export const metadata: Metadata = {
  title: "Training Gear",
  description: "Amazon affiliate gear links for BJJ, Muay Thai, boxing, Eskrima, and self-defense.",
}

const categoryOrder: TuffBuffsGearCategory[] = ["training", "accessories", "recovery"]

const categoryLabels: Record<TuffBuffsGearCategory, string> = {
  training: "Training Gear",
  accessories: "Accessories",
  recovery: "Recovery",
}

const programSections = tuffBuffsAffiliateGearCollections.map(collection => {
  const requiredProducts = getTuffBuffsAffiliateGearByIds(collection.requiredProductIds)
  const recommendedProducts = getTuffBuffsAffiliateGearByIds(collection.recommendedProductIds)
  const previewProducts = recommendedProducts.slice(0, 6)
  const items = [
    ...requiredProducts.map(product => ({ product, badge: "Required" })),
    ...previewProducts.map(product => ({ product, badge: "Recommended" })),
  ]

  return {
    id: collection.id,
    title: collection.name,
    description:
      requiredProducts.length > 0
        ? `${requiredProducts.length} required Amazon item and ${recommendedProducts.length} recommended options. Showing starter picks here.`
        : `${recommendedProducts.length} recommended Amazon options. Showing starter picks here.`,
    countLabel: `${items.length} shown`,
    items,
  } satisfies AffiliateGearViewSection
})

const categorySections = categoryOrder.map(category => {
  const products = tuffBuffsAffiliateGearProducts.filter(product => product.category === category)

  return {
    id: category,
    title: categoryLabels[category],
    description: undefined,
    countLabel: `${products.length} items`,
    items: products.map(product => ({ product })),
  } satisfies AffiliateGearViewSection
})

export default function GearPage() {
  return (
    <Wrapper gap="lg">
      <Intro className="max-w-3xl">
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">TuffBuffs</Badge>
          <Badge variant="soft">Amazon affiliate</Badge>
        </Stack>
        <IntroTitle>Training Gear</IntroTitle>
        <IntroDescription>
          Curated Amazon gear links from the TuffBuffs catalog for BJJ, Muay Thai, boxing, Eskrima,
          and self-defense training.
        </IntroDescription>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Affiliate disclosure: qualifying purchases may earn a commission. Product pricing and
          availability are controlled by Amazon.
        </p>
      </Intro>

      <AffiliateGearBrowser programSections={programSections} categorySections={categorySections} />
    </Wrapper>
  )
}
