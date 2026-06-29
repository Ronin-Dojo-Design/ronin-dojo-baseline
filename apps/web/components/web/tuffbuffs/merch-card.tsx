import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { ListingCard } from "~/components/web/listing/listing-card"
import { resolvePublicMediaUrl } from "~/lib/public-media-url"
import { formatGearPrice } from "~/lib/tuffbuffs/gear-utils"
import type { MerchProductMetadata, MerchProductRow } from "~/server/web/merch/queries"

/**
 * MerchCard — a thin adapter over `ListingCard` (doctrine §5; SESSION_0470). The product image uses
 * the `mediaTop` rich density and the `footer` slot carries the commerce action (`price · Buy`)
 * instead of View+Save — same ONE catalog card, commerce-tuned. No bespoke card markup.
 */
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
  const href = `/merch/${product.id}`
  const imageSrc =
    resolvePublicMediaUrl(metadata.imagePath ?? "/images/merch/placeholder.svg") ??
    "/images/merch/placeholder.svg"

  const isPlaceholder =
    metadata.imagePath === "/images/merch/placeholder.svg" || !metadata.imagePath

  return (
    <ListingCard
      href={href}
      name={product.name}
      mediaTop={
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
      }
      categories={[{ name: categoryLabel[metadata.category] ?? metadata.category }]}
      tagline={metadata.description}
      statusBadges={
        <Stack direction="column" size="sm" className="w-full">
          {(metadata.featured || !metadata.inStock) && (
            <Stack size="sm" className="flex-wrap">
              {metadata.featured && <Badge variant="soft">Featured</Badge>}
              {!metadata.inStock && <Badge variant="danger">Out of Stock</Badge>}
            </Stack>
          )}

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
            <p className="text-xs text-muted-foreground">{metadata.colors.join(" · ")}</p>
          )}
        </Stack>
      }
      footer={
        <>
          <span className="text-sm font-semibold">{formatGearPrice(product.amountCents)}</span>
          <Button
            size="sm"
            variant="primary"
            disabled={!metadata.inStock}
            render={metadata.inStock ? <Link href={href} /> : undefined}
          >
            {metadata.inStock ? "Buy Now" : "Sold Out"}
          </Button>
        </>
      }
    />
  )
}
