import { createLoader, parseAsString, type SearchParams } from "nuqs/server"
import type { ComponentProps } from "react"
import type Stripe from "stripe"
import type { Product } from "~/components/web/products/product"
import { ProductList } from "~/components/web/products/product-list"
import { getProductsForListing } from "~/lib/products"

type ProductQueryProps = Omit<ComponentProps<typeof ProductList>, "products" | "urls"> & {
  searchParams: Promise<SearchParams>
  checkoutData: ComponentProps<typeof Product>["checkoutData"]
  productFilter?: (product: Stripe.Product) => boolean
  productMapper?: (product: Stripe.Product) => Stripe.Product
}

export const ProductQuery = async ({
  searchParams,
  checkoutData,
  productFilter,
  productMapper,
  ...props
}: ProductQueryProps) => {
  const loadSearchParams = createLoader({ discountCode: parseAsString.withDefault("") })
  const { discountCode } = await loadSearchParams(searchParams)
  const products = await getProductsForListing(discountCode, productFilter, productMapper)

  return <ProductList products={products} checkoutData={checkoutData} {...props} />
}
