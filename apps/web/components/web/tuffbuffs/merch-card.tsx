import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { resolvePublicMediaUrl } from "~/lib/public-media-url"
import { formatGearPrice } from "~/lib/tuffbuffs/gear-utils"
import type { MerchProductMetadata } from "~/server/web/merch/queries"
import type { MerchProductRow } from "~/server/web/merch/queries"

type MerchCardProps = {
  product: MerchProductRow
  metadata: MerchProductMetadata
}

const categoryLabel: Record<string, string> = {
  apparel: "Apparel",
  rashguards: "Rash Guards",
  gear: "Training Gear",
  accessories: "Accessories",
}

export function MerchCard({ product, metadata }: MerchCardProps) {
  const imageSrc =
    resolvePublicMediaUrl(metadata.imagePath ?? "/images/merch/placeholder.svg") ??
    "/images/merch/placeholder.svg"

  const isPlaceholder = metadata.imagePath === "/images/merch/placeholder.svg" || !metadata.imagePath

  return (
    <Card hover className="h-full overflow-hidden p-0">
      <div className="flex h-52 w-full items-center justify-center bg-muted/50 p-4">
        {isPlaceholder ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/30">
            <span className="text-2xl font-bold text-muted-foreground/40">TB</span>
            <span className="text-xs text-muted-foreground/50">Image coming soon</span>
          </div>
        ) : (
          <img src={imageSrc} alt="" loading="lazy" className="h-full w-full object-contain" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <Stack size="sm" className="min-w-0 flex-wrap">
          <Badge variant="outline">{categoryLabel[metadata.category] ?? metadata.category}</Badge>
          {metadata.featured && <Badge variant="soft">Featured</Badge>}
          {!metadata.inStock && <Badge variant="danger">Out of Stock</Badge>}
        </Stack>

        <div className="space-y-2">
          <H4 as="h3" className="line-clamp-2 text-base">
            {product.name}
          </H4>
          <p className="line-clamp-3 min-h-16 text-sm text-secondary-foreground">
            {metadata.description}
          </p>
        </div>

        {metadata.sizes.length > 0 && (
          <Stack size="xs" className="flex-wrap">
            {metadata.sizes.map(size => (
              <Badge key={size} variant="outline" size="sm">
                {size}
              </Badge>
            ))}
          </Stack>
        )}

        {metadata.colors.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {metadata.colors.join(" · ")}
          </p>
        )}

        <Stack className="mt-auto w-full justify-between gap-3" wrap={false}>
          <span className="text-sm font-semibold">{formatGearPrice(product.amountCents)}</span>
          <Button size="sm" variant="primary" disabled={!metadata.inStock}>
            {metadata.inStock ? "Buy Now" : "Sold Out"}
          </Button>
        </Stack>
      </div>
    </Card>
  )
}
