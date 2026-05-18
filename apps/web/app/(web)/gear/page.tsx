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
  findAffiliateProducts,
  findAllGearRecommendations,
  getMetadata,
} from "~/server/web/affiliate-products/queries"
import type { TuffBuffsGearCategory, TuffBuffsProgramGearKey } from "~/types/tuffbuffs-gear"

export const revalidate = 3600

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

type DbProduct = {
  id: string
  name: string
  description: string
  amountCents: number
  category: TuffBuffsGearCategory
  affiliateUrl: string
  imagePath?: string
  recommendedFor: readonly TuffBuffsProgramGearKey[]
}

export default async function GearPage() {
  const [rows, gearByDiscipline] = await Promise.all([
    findAffiliateProducts(),
    findAllGearRecommendations(),
  ])

  // Convert DB rows to the product shape the browser component expects
  const dbProducts: DbProduct[] = []
  for (const row of rows) {
    const meta = getMetadata(row)
    if (!meta) continue
    dbProducts.push({
      id: meta.externalId,
      name: row.name,
      description: meta.description,
      amountCents: row.amountCents,
      category: meta.category as TuffBuffsGearCategory,
      affiliateUrl: meta.affiliateUrl,
      ...(meta.imagePath ? { imagePath: meta.imagePath } : {}),
      recommendedFor: meta.recommendedFor as TuffBuffsProgramGearKey[],
    })
  }

  const productById = new Map(dbProducts.map(p => [p.id, p]))

  // Build program sections from DB gear recommendations
  const programSections: AffiliateGearViewSection[] = []
  for (const [slug, group] of gearByDiscipline) {
    const requiredProducts: DbProduct[] = []
    for (const row of group.required) {
      const meta = getMetadata(row)
      if (!meta) continue
      const p = productById.get(meta.externalId)
      if (p) requiredProducts.push(p)
    }
    const recommendedProducts: DbProduct[] = []
    for (const row of group.recommended) {
      const meta = getMetadata(row)
      if (!meta) continue
      const p = productById.get(meta.externalId)
      if (p) recommendedProducts.push(p)
    }
    const previewProducts = recommendedProducts.slice(0, 6)
    const items = [
      ...requiredProducts.map(product => ({ product, badge: "Required" as const })),
      ...previewProducts.map(product => ({ product, badge: "Recommended" as const })),
    ]

    programSections.push({
      id: slug,
      title: group.name,
      description:
        requiredProducts.length > 0
          ? `${requiredProducts.length} required Amazon item and ${recommendedProducts.length} recommended options. Showing starter picks here.`
          : `${recommendedProducts.length} recommended Amazon options. Showing starter picks here.`,
      countLabel: `${items.length} shown`,
      items,
    })
  }

  const categorySections: AffiliateGearViewSection[] = categoryOrder.map(category => {
    const products = dbProducts.filter(product => product.category === category)

    return {
      id: category,
      title: categoryLabels[category],
      description: undefined,
      countLabel: `${products.length} items`,
      items: products.map(product => ({ product })),
    }
  })
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
