"use client"

import { useState } from "react"
import { Badge } from "~/components/common/badge"
import { H2, H3 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { MerchCard } from "~/components/web/tuffbuffs/merch-card"
import { cx } from "~/lib/utils"
import type { MerchProductMetadata, MerchProductRow } from "~/server/web/merch/queries"

export type MerchCategoryTab = {
  id: string
  label: string
  count: number
}

type MerchBrowserProps = {
  products: MerchProductRow[]
  metadataMap: Record<string, MerchProductMetadata>
  categories: MerchCategoryTab[]
}

export function MerchBrowser({ products, metadataMap, categories }: MerchBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? products.filter(p => {
        const meta = metadataMap[p.id]
        return meta?.category === activeCategory
      })
    : products

  const featuredProducts = products.filter(p => metadataMap[p.id]?.featured)

  return (
    <div className="space-y-14">
      {/* Featured section */}
      {!activeCategory && featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-2">
            <H2>Featured</H2>
            <p className="max-w-2xl text-sm text-secondary-foreground">
              Our most popular TuffBuffs gear — handpicked for fighters.
            </p>
          </div>

          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map(product => {
              const meta = metadataMap[product.id]
              if (!meta) return null
              return <MerchCard key={product.id} product={product} metadata={meta} />
            })}
          </div>
        </section>
      )}

      {/* Category filter tabs + grid */}
      <section className="space-y-6">
        <Stack className="w-full justify-between gap-4" wrap={false}>
          <div className="space-y-2">
            <H2>{activeCategory ? categories.find(c => c.id === activeCategory)?.label ?? "All Merch" : "All Merch"}</H2>
            <p className="max-w-2xl text-sm text-secondary-foreground">
              Own-brand TuffBuffs merchandise — shirts, rash guards, hoodies, gear, and accessories.
            </p>
          </div>
          <Badge variant="outline">{filtered.length} items</Badge>
        </Stack>

        {/* Category tabs */}
        <div className="inline-flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cx(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === null
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-secondary-foreground hover:bg-muted",
            )}
          >
            All ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-secondary-foreground hover:bg-muted",
              )}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(product => {
            const meta = metadataMap[product.id]
            if (!meta) return null
            return <MerchCard key={product.id} product={product} metadata={meta} />
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No products in this category yet.
          </div>
        )}
      </section>
    </div>
  )
}
