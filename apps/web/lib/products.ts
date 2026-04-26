import { addDays, differenceInMonths } from "date-fns"
import plur from "plur"
import type { ReactNode } from "react"
import type Stripe from "stripe"
import { submissionsConfig } from "~/config/submissions"
import {
  findStripeCoupon,
  findStripePricesByProduct,
  findStripeProducts,
} from "~/server/web/products/queries"

const SYMBOLS = {
  positive: "✓ ",
  neutral: "• ",
  negative: "✗ ",
} as const

type SymbolType = keyof typeof SYMBOLS

export type ProductInterval = "month" | "year"

export type ProductFeature = {
  name: ReactNode
  footnote?: ReactNode
  type?: keyof typeof SYMBOLS
}

export type ProductWithPrices = {
  product: Stripe.Product
  prices: Stripe.Price[]
  coupon: Stripe.Coupon | undefined
  isFeatured: boolean
}

export const calculateQueueDuration = (queueSize: number) => {
  const queueDays = Math.ceil((queueSize / submissionsConfig.postingRate) * 7)
  const queueMonths = Math.max(differenceInMonths(addDays(new Date(), queueDays), new Date()), 1)

  return `${queueMonths} ${plur("month", queueMonths)}`
}

const extractFeatureTypeFromName = (featureName?: string) => {
  return Object.keys(SYMBOLS).find(key => featureName?.startsWith(SYMBOLS[key as SymbolType])) as
    | SymbolType
    | undefined
}

const removeTypeSymbolFromName = (name: string, type?: SymbolType) => {
  return type ? name.replace(SYMBOLS[type], "") : name
}

/**
 * Get the price amount from a Stripe price object or string.
 *
 * @param price - The price to get the amount from.
 * @returns The price amount.
 */
const extractPriceAmount = (price?: Stripe.Price | string | null) => {
  return typeof price === "object" && price !== null ? (price.unit_amount ?? 0) : 0
}

/*
 * Sort products by price
 */
export const sortProductsByPrice = (products: Stripe.Product[]) => {
  return products.sort(
    (a, b) => extractPriceAmount(a.default_price) - extractPriceAmount(b.default_price),
  )
}

/**
 * Determine if a product should be featured in the UI.
 *
 * @param index - The index of the product in the list.
 * @param products - The list of all products.
 * @param coupon - The coupon being applied, if any.
 * @param isEligibleForDiscount - Whether the product is eligible for a discount.
 * @returns Whether the product should be featured.
 */
const isProductFeatured = (
  index: number,
  products: Stripe.Product[],
  coupon?: Stripe.Coupon,
  isEligibleForDiscount = true,
) => {
  if (!coupon) return index === products.length - 1

  const lastDiscountedIndex = findLastDiscountedProductIndex(products, coupon)
  return isEligibleForDiscount && index === lastDiscountedIndex
}

/**
 * Check if a product is eligible for a discount with the given coupon.
 *
 * @param productId - The ID of the product to check.
 * @param coupon - The coupon to check against.
 * @returns Whether the product is eligible for the discount.
 */
const isProductEligibleForDiscount = (productId: string, coupon?: Stripe.Coupon) => {
  return !coupon?.applies_to || coupon.applies_to.products.includes(productId)
}

/**
 * Find the index of the last discounted product in a list of products.
 *
 * @param products - The list of products to check.
 * @param coupon - The coupon to check against.
 * @returns The index of the last discounted product, or -1 if none are discounted.
 */
const findLastDiscountedProductIndex = (products: Stripe.Product[], coupon?: Stripe.Coupon) => {
  return products.reduce((lastIndex, product, currentIndex) => {
    if (isProductEligibleForDiscount(product.id, coupon)) {
      return currentIndex
    }

    return lastIndex
  }, -1)
}

/**
 * Get the normalized features of a product.
 *
 * @param product - The product to get the features of.
 * @returns The normalized features of the product.
 */
export const getProductFeatures = (product: Stripe.Product) => {
  return product.marketing_features.map(feature => {
    const type = extractFeatureTypeFromName(feature.name)
    const name = removeTypeSymbolFromName(feature.name || "", type)

    return { name, type } satisfies ProductFeature
  })
}

/**
 * Fetch prices for a list of products and prepare them for display.
 *
 * @param products - The list of products to prepare.
 * @param coupon - The coupon being applied, if any.
 * @param stripe - The Stripe instance to use for fetching prices.
 * @returns A promise that resolves to an array of products with their prices and discount status.
 */
export const getProductsWithPrices = async (products: Stripe.Product[], coupon?: Stripe.Coupon) => {
  return Promise.all(
    products.map(async (product, index) => {
      const prices = await findStripePricesByProduct(product.id)
      const isEligibleForDiscount = isProductEligibleForDiscount(product.id, coupon)

      return {
        product,
        prices,
        coupon: isEligibleForDiscount ? coupon : undefined,
        isFeatured: isProductFeatured(index, products, coupon, isEligibleForDiscount),
      } satisfies ProductWithPrices
    }),
  )
}

export const getProductsForListing = async (
  discountCode?: string,
  productFilter?: (product: Stripe.Product) => boolean,
  productMapper?: (product: Stripe.Product) => Stripe.Product,
) => {
  const [allProducts, coupon] = await Promise.all([
    findStripeProducts(),
    findStripeCoupon(discountCode),
  ])

  // Apply filters if provided
  const filteredProducts = productFilter ? allProducts.filter(productFilter) : allProducts

  // Apply mapper if provided
  const mappedProducts = productMapper ? filteredProducts.map(productMapper) : filteredProducts

  // Sort products by price
  const sortedProducts = sortProductsByPrice(mappedProducts)

  // Get products with their prices
  return await getProductsWithPrices(sortedProducts, coupon)
}
