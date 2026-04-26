import type Stripe from "stripe"
import type { ProductInterval } from "~/lib/products"

const findPriceForInterval = (prices: Stripe.Price[], interval?: ProductInterval) => {
  if (prices.length === 0) {
    return undefined
  }

  const matchingPrice = prices.find(price => price.recurring?.interval === interval)
  return matchingPrice ?? prices[0]
}

const calculateCouponDiscount = (initialPrice: number, coupon?: Stripe.Coupon | null) => {
  if (!coupon) return 0
  if (coupon.percent_off) return (initialPrice * coupon.percent_off) / 100
  if (coupon.amount_off) return coupon.amount_off / 100
  return 0
}

const calculateDiscountPercentage = (basePrice: number, discountedPrice: number) => {
  return basePrice > 0 ? Math.round(((basePrice - discountedPrice) / basePrice) * 100) : 0
}

export const useProductPrices = (
  prices: Stripe.Price[],
  coupon: Stripe.Coupon | undefined,
  interval: ProductInterval,
) => {
  const isSubscription = prices.some(p => p.type === "recurring")
  const currentPrice = findPriceForInterval(prices, isSubscription ? interval : undefined)
  const currentPriceValue = (currentPrice?.unit_amount ?? 0) / 100
  const monthlyPrice = isSubscription ? findPriceForInterval(prices, "month") : currentPrice
  const monthlyPriceValue = (monthlyPrice?.unit_amount ?? 0) / 100

  const initialPrice = isSubscription
    ? currentPriceValue / (interval === "month" ? 1 : 12)
    : currentPriceValue

  const couponDiscountAmount = calculateCouponDiscount(initialPrice, coupon)

  const finalPrice = Math.max(0, initialPrice - couponDiscountAmount)
  const originalPrice = monthlyPriceValue > finalPrice ? monthlyPriceValue : null

  const basePriceForDiscount = interval === "year" ? monthlyPriceValue : currentPriceValue
  const discountPercentage = calculateDiscountPercentage(basePriceForDiscount, finalPrice)

  return {
    isSubscription,
    currentPrice,
    price: finalPrice,
    fullPrice: originalPrice,
    discount: discountPercentage,
  }
}
