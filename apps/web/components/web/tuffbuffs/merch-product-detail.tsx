"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H2 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { MerchImageGallery } from "~/components/web/tuffbuffs/merch-image-gallery"
import { formatGearPrice } from "~/lib/tuffbuffs/gear-utils"
import { createMerchCheckout } from "~/server/web/merch/actions"
import type { MerchProductMetadata, MerchProductRow } from "~/server/web/merch/queries"

type MerchProductDetailProps = {
  product: MerchProductRow
  metadata: MerchProductMetadata
}

/**
 * Client component for merch product detail page.
 * Handles size/color selection state and Stripe Checkout action.
 *
 * @see docs/sprints/SESSION_0112.md TASK_03
 */
export function MerchProductDetail({ product, metadata }: MerchProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string>(metadata.sizes[0] ?? "")
  const [selectedColor, setSelectedColor] = useState<string>(metadata.colors[0] ?? "")

  const { execute, isPending } = useAction(createMerchCheckout, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong. Please try again.")
    },
  })

  const handleBuyNow = () => {
    execute({
      pricingPlanId: product.id,
      quantity: 1,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    })
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Image gallery */}
      <MerchImageGallery images={metadata.imagePaths ?? [metadata.imagePath]} alt={product.name} />

      {/* Product info */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Stack size="sm" className="flex-wrap">
            <Badge variant="outline">TuffBuffs</Badge>
            {metadata.featured && <Badge variant="soft">Featured</Badge>}
            {!metadata.inStock && <Badge variant="danger">Out of Stock</Badge>}
          </Stack>

          <H2>{product.name}</H2>
          <p className="text-secondary-foreground">{metadata.description}</p>
          <p className="text-2xl font-bold">{formatGearPrice(product.amountCents)}</p>
        </div>

        {/* Size selector */}
        {metadata.sizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Size</p>
            <Stack size="xs" className="flex-wrap">
              {metadata.sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  title={`Select size ${size}`}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {size}
                </button>
              ))}
            </Stack>
          </div>
        )}

        {/* Color selector */}
        {metadata.colors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Color</p>
            <Stack size="xs" className="flex-wrap">
              {metadata.colors.map(color => (
                <button
                  key={color}
                  type="button"
                  title={`Select color ${color}`}
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedColor === color
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {color}
                </button>
              ))}
            </Stack>
          </div>
        )}

        {/* Features */}
        {metadata.features.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Features</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-secondary-foreground">
              {metadata.features.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Buy button + shipping info */}
        <div className="space-y-3 border-t pt-6">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!metadata.inStock || isPending}
            isPending={isPending}
            onClick={handleBuyNow}
          >
            {metadata.inStock ? "Buy Now" : "Sold Out"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Flat rate $4.99 shipping · Free shipping on orders over $75
          </p>
        </div>
      </div>
    </div>
  )
}
