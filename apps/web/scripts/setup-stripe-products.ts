import type { Stripe } from "stripe"
import { stripe } from "~/services/stripe"

const products: (Stripe.ProductCreateParams & { price_data?: Stripe.PriceCreateParams[] })[] = [
  // ── Dirstarter L1 baseline: Directory Listing products ──
  {
    name: "Free Listing",
    description: "Free listing with a wait time and a direct link to your website.",
    active: true,
    metadata: { tier: "Free", type: "listing" },
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
    name: "Standard Listing",
    description: "Do-follow link with faster processing and content updates.",
    active: true,
    metadata: { label: "Choose Standard", tier: "Standard", type: "listing" },
    marketing_features: [
      { name: "✓ 24h processing time" },
      { name: "✓ Unlimited content updates" },
      { name: "✓ Do-follow backlink" },
      { name: "✗ No featured spot" },
      { name: "✗ No prominent placement" },
    ],
    default_price_data: {
      unit_amount: 9700,
      currency: "usd",
    },
  },
  {
    name: "Premium Listing",
    description: "Featured placement with a homepage spot and prominent listing position.",
    active: true,
    metadata: { label: "Choose Premium", tier: "Premium", type: "listing" },
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

  // ── Martial Arts: Program Enrollment products ──
  {
    name: "Free Enrollment",
    description: "Free access to the program curriculum and community resources.",
    active: true,
    metadata: { tier: "Free", type: "enrollment" },
    marketing_features: [
      { name: "✓ Access to curriculum" },
      { name: "✓ Community forum access" },
      { name: "✗ No instructor feedback" },
      { name: "✗ No rank progression" },
      { name: "✗ No certificate eligibility" },
    ],
    default_price_data: {
      unit_amount: 0,
      currency: "usd",
    },
  },
  {
    name: "Standard Enrollment",
    description: "Full program access with instructor feedback and rank progression.",
    active: true,
    metadata: { label: "Enroll Now", tier: "Standard", type: "enrollment" },
    marketing_features: [
      { name: "✓ Access to curriculum" },
      { name: "✓ Community forum access" },
      { name: "✓ Instructor feedback" },
      { name: "✓ Rank progression tracking" },
      { name: "✗ No certificate eligibility" },
    ],
    default_price_data: {
      unit_amount: 4900,
      currency: "usd",
    },
  },
  {
    name: "Premium Enrollment",
    description: "Full program access with certification eligibility and priority support.",
    active: true,
    metadata: { label: "Enroll Premium", tier: "Premium", type: "enrollment" },
    marketing_features: [
      { name: "✓ Access to curriculum" },
      { name: "✓ Community forum access" },
      { name: "✓ Instructor feedback" },
      { name: "✓ Rank progression tracking" },
      { name: "✓ Certificate eligibility" },
    ],
    default_price_data: {
      unit_amount: 9900,
      currency: "usd",
    },
  },

  // ── Martial Arts: Membership products ──
  {
    name: "Monthly Membership",
    description: "Monthly school membership with full class access and scheduling.",
    active: true,
    metadata: { label: "Join Monthly", tier: "Standard", type: "membership" },
    marketing_features: [
      { name: "✓ Unlimited class attendance" },
      { name: "✓ Online scheduling" },
      { name: "✓ Progress tracking" },
      { name: "✓ Belt testing eligibility" },
      { name: "✓ Cancel anytime" },
    ],
    default_price_data: {
      unit_amount: 14900,
      currency: "usd",
      recurring: {
        interval: "month",
        interval_count: 1,
      },
    },
  },
  {
    name: "Annual Membership",
    description: "Annual school membership — save over 15% compared to monthly.",
    active: true,
    metadata: { label: "Join Annual", tier: "Premium", type: "membership" },
    marketing_features: [
      { name: "✓ Unlimited class attendance" },
      { name: "✓ Online scheduling" },
      { name: "✓ Progress tracking" },
      { name: "✓ Belt testing eligibility" },
      { name: "✓ Priority seminar registration" },
    ],
    default_price_data: {
      unit_amount: 149900,
      currency: "usd",
      recurring: {
        interval: "year",
        interval_count: 1,
      },
    },
  },

  // ── Martial Arts: Certificate Order ──
  {
    name: "Certificate Order",
    description: "Official certificate issued for rank promotion or course completion.",
    active: true,
    metadata: { label: "Order Certificate", tier: "Standard", type: "certificate" },
    marketing_features: [
      { name: "✓ Official certificate document" },
      { name: "✓ Verified by issuing organization" },
      { name: "✓ Digital and physical copy" },
      { name: "✓ Added to your Passport record" },
    ],
    default_price_data: {
      unit_amount: 2500,
      currency: "usd",
    },
  },

  // ── Martial Arts: Course Enrollment ──
  {
    name: "Free Course",
    description: "Free access to course curriculum materials.",
    active: true,
    metadata: { tier: "Free", type: "course" },
    marketing_features: [
      { name: "✓ Access to course materials" },
      { name: "✓ Self-paced learning" },
      { name: "✗ No completion certificate" },
      { name: "✗ No instructor review" },
    ],
    default_price_data: {
      unit_amount: 0,
      currency: "usd",
    },
  },
  {
    name: "Standard Course",
    description: "Full course access with completion tracking and certificate eligibility.",
    active: true,
    metadata: { label: "Enroll in Course", tier: "Standard", type: "course" },
    marketing_features: [
      { name: "✓ Access to course materials" },
      { name: "✓ Self-paced learning" },
      { name: "✓ Completion certificate" },
      { name: "✓ Instructor review" },
    ],
    default_price_data: {
      unit_amount: 2900,
      currency: "usd",
    },
  },

  // ── Martial Arts: Tournament Registration ──
  {
    name: "Tournament Registration",
    description: "Register for a tournament — compete in one or more divisions.",
    active: true,
    metadata: { label: "Register Now", tier: "Standard", type: "tournament" },
    marketing_features: [
      { name: "✓ Division entry" },
      { name: "✓ Bracket placement" },
      { name: "✓ Official scoring and results" },
      { name: "✓ Fight record tracking" },
    ],
    default_price_data: {
      unit_amount: 7500,
      currency: "usd",
    },
  },

  // ── Martial Arts: Belt Test Registration ──
  {
    name: "Belt Test Registration",
    description: "Register for a belt promotion test at your school.",
    active: true,
    metadata: { label: "Register for Test", tier: "Standard", type: "belt_test" },
    marketing_features: [
      { name: "✓ Belt test entry" },
      { name: "✓ Prerequisite verification" },
      { name: "✓ Score breakdown provided" },
      { name: "✓ Rank updated on pass" },
    ],
    default_price_data: {
      unit_amount: 5000,
      currency: "usd",
    },
  },

  // ── Martial Arts: Event Registration (seminars, workshops, camps) ──
  {
    name: "Free Event",
    description: "Free community event — open to all members.",
    active: true,
    metadata: { tier: "Free", type: "event" },
    marketing_features: [
      { name: "✓ Event access" },
      { name: "✓ Community networking" },
      { name: "✗ No materials included" },
    ],
    default_price_data: {
      unit_amount: 0,
      currency: "usd",
    },
  },
  {
    name: "Paid Event",
    description: "Seminar, workshop, or camp registration with full materials.",
    active: true,
    metadata: { label: "Register for Event", tier: "Standard", type: "event" },
    marketing_features: [
      { name: "✓ Event access" },
      { name: "✓ Community networking" },
      { name: "✓ Training materials included" },
      { name: "✓ Certificate of attendance" },
    ],
    default_price_data: {
      unit_amount: 4900,
      currency: "usd",
    },
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
