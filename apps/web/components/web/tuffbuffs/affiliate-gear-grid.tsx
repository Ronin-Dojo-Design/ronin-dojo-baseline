import { AffiliateGearCard } from "~/components/web/tuffbuffs/affiliate-gear-card"
import type { TuffBuffsAffiliateGearProduct } from "~/types/tuffbuffs-gear"

type AffiliateGearGridProps = {
  products: readonly TuffBuffsAffiliateGearProduct[]
  badge?: string
}

export function AffiliateGearGrid({ products, badge }: AffiliateGearGridProps) {
  if (products.length === 0) return null

  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map(product => (
        <AffiliateGearCard key={product.id} product={product} badge={badge} />
      ))}
    </div>
  )
}
