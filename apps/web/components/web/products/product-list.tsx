import type { ComponentProps, ReactNode } from "react"
import type Stripe from "stripe"
import { Product, ProductSkeleton } from "~/components/web/products/product"
import type { ProductWithPrices } from "~/lib/products"
import { cx } from "~/lib/utils"

type ProductListProps = ComponentProps<"div"> & {
  products: ProductWithPrices[]
  checkoutData: ComponentProps<typeof Product>["checkoutData"]
  buttonLabel?: (product: Stripe.Product) => ReactNode
}

export const ProductList = ({
  className,
  products,
  checkoutData,
  buttonLabel,
  ...props
}: ProductListProps) => {
  if (products.length === 0) {
    return null
  }

  return (
    <div className={cx("flex flex-wrap justify-center gap-5", className)} {...props}>
      {products.map(({ product, prices, coupon, isFeatured }) => (
        <Product
          key={product.id}
          data={{ product, prices, coupon }}
          checkoutData={checkoutData}
          isFeatured={isFeatured}
          buttonLabel={buttonLabel?.(product)}
        />
      ))}
    </div>
  )
}

export const ProductListSkeleton = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cx("flex flex-wrap justify-center gap-5", className)} {...props}>
      {[...Array(3)].map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  )
}
