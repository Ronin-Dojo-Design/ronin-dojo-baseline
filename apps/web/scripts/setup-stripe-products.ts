import type { Stripe } from "stripe"
import { stripe } from "~/services/stripe"

const products: (Stripe.ProductCreateParams & { price_data?: Stripe.PriceCreateParams[] })[] = [
  {
    name: "Free Listing",
    description: "Free listing with a wait time and a direct link to your website.",
    active: true,
    metadata: {},
    marketing_features: [
      { name: "• Few weeks processing time" },
      { name: "✗ No content updates" },
      { name: "✗ No do-follow backlink" },
      { name: "✗ No featured spot" },
      { name: "✗ No prominent placement" },
    ],
    default_price_data: {
      unit_amount: 0,
      currency: "usd",
    },
  },
  {
    name: "Expedited Listing",
    description: "Skip the queue and get your site published on the site within 24 hours.",
    active: true,
    metadata: { label: "Expedite Listing" },
    marketing_features: [
      { name: "✓ 24h processing time" },
      { name: "✓ Unlimited content updates" },
      { name: "✗ Do-follow backlink" },
      { name: "✗ No featured spot" },
      { name: "✗ No prominent placement" },
    ],
    default_price_data: {
      unit_amount: 9700,
      currency: "usd",
    },
  },
  {
    name: "Featured Listing",
    description: "Featured listing with a homepage spot and a prominent placement.",
    active: true,
    metadata: { label: "Feature Listing" },
    marketing_features: [
      { name: "✓ 12h processing time" },
      { name: "✓ Unlimited content updates" },
      { name: "✓ Do-follow backlink" },
      { name: "✓ Featured spot on homepage" },
      { name: "✓ Prominent placement" },
    ],
    default_price_data: {
      unit_amount: 19700,
      currency: "usd",
      recurring: {
        interval: "month",
        interval_count: 1,
      },
    },
    price_data: [
      {
        unit_amount: 197000,
        currency: "usd",
        recurring: {
          interval: "year",
          interval_count: 1,
        },
      },
    ],
  },
]

async function main() {
  try {
    // Create products
    for (const { price_data, ...productData } of products) {
      const product = await stripe.products.create(productData)

      // Create prices
      if (price_data) {
        for (const priceData of price_data) {
          await stripe.prices.create({ ...priceData, product: product.id })
        }
      }
    }

    console.log("🎉 All products and prices replicated successfully!")
  } catch (error) {
    console.error("❌ Error replicating products:", error)
    process.exit(1)
  }
}

main().catch(console.error)
