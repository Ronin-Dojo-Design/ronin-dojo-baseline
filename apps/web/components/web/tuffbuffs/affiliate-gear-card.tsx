import { ExternalLinkIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { ExternalLink } from "~/components/web/external-link"
import { resolvePublicMediaUrl } from "~/lib/public-media-url"
import { formatGearPrice, type TuffBuffsAffiliateGearProduct } from "~/lib/tuffbuffs/affiliate-gear"

type AffiliateGearCardProps = {
  product: TuffBuffsAffiliateGearProduct
  badge?: string
}

const categoryLabel: Record<TuffBuffsAffiliateGearProduct["category"], string> = {
  training: "Training",
  accessories: "Accessory",
  recovery: "Recovery",
}

export function AffiliateGearCard({ product, badge }: AffiliateGearCardProps) {
  const imageSrc =
    resolvePublicMediaUrl(product.imagePath ?? "/images/merch/placeholder.svg") ??
    "/images/merch/placeholder.svg"

  return (
    <Card hover className="h-full overflow-hidden p-0">
      <div data-gear-media className="flex h-52 w-full items-center justify-center bg-muted/50 p-4">
        <img src={imageSrc} alt="" loading="lazy" className="h-full w-full object-contain" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <Stack size="sm" className="min-w-0 flex-wrap">
          <Badge variant="outline">{categoryLabel[product.category]}</Badge>
          {badge && <Badge variant="soft">{badge}</Badge>}
        </Stack>

        <div className="space-y-2">
          <H4 as="h3" className="line-clamp-2 text-base">
            {product.name}
          </H4>
          <p className="line-clamp-3 min-h-16 text-sm text-secondary-foreground">
            {product.description}
          </p>
        </div>

        <Stack className="mt-auto w-full justify-between gap-3" wrap={false}>
          <span className="text-sm font-semibold">{formatGearPrice(product.amountCents)}</span>
          <Button size="sm" variant="secondary" suffix={<ExternalLinkIcon />} asChild>
            <ExternalLink
              href={product.affiliateUrl}
              doTrack
              eventName="click_affiliate_gear"
              eventProps={{ productId: product.id, source: "tuffbuffs_gear" }}
            >
              Amazon
            </ExternalLink>
          </Button>
        </Stack>
      </div>
    </Card>
  )
}
