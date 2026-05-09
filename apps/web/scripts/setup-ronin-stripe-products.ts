import type { Stripe } from "stripe"
import { stripe } from "~/services/stripe"

/**
 * setup-ronin-stripe-products.ts
 *
 * Idempotent Stripe product creation script following ADR 0014 policy.
 * Creates products for Baseline Martial Arts launch verticals with:
 *   - Naming: {BRAND_CODE}_{vertical}_{identifier}
 *   - Metadata: brand, vertical, entitlement_key, created_by
 *   - Idempotency: checks existing products by name before creating
 *
 * Usage: bun run apps/web/scripts/setup-ronin-stripe-products.ts
 * NOTE: Requires STRIPE_SECRET_KEY in environment.
 *
 * @see docs/architecture/decisions/0014-stripe-product-policy.md
 * @see docs/architecture/pwcc-commerce-port-map.md
 */

// ── Brand codes (ADR 0014 §2) ──

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const BRAND_CODE = "BMA" as const

// ── Types ──

interface RoninProductDef {
  /** Stripe Product name: {BRAND_CODE}_{vertical}_{identifier} */
  name: string
  description: string
  active: boolean
  /** ADR 0014 §3 metadata */
  metadata: {
    brand: typeof BRAND
    vertical: string
    entitlement_key: string
    created_by: "script"
  }
  marketing_features?: Stripe.ProductCreateParams.MarketingFeature[]
  default_price_data: {
    unit_amount: number
    currency: "usd"
    recurring?: {
      interval: "month" | "year"
      interval_count: number
    }
  }
  /** Additional prices beyond the default */
  additional_prices?: {
    unit_amount: number
    currency: "usd"
    recurring?: {
      interval: "month" | "year"
      interval_count: number
    }
  }[]
}

// ── Product definitions (ADR 0014 naming + PWCC port map verticals) ──

const products: RoninProductDef[] = [
  // ── Vertical 2: Organization Membership Dues (Stripe Subscription) ──
  {
    name: `${BRAND_CODE}_membership_monthly`,
    description: "Monthly school membership with full class access and scheduling.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "membership",
      entitlement_key: "membership:org:active",
      created_by: "script",
    },
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
      recurring: { interval: "month", interval_count: 1 },
    },
  },
  {
    name: `${BRAND_CODE}_membership_quarterly`,
    description: "Quarterly school membership — save 5% vs monthly, billed every 3 months.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "membership",
      entitlement_key: "membership:org:active",
      created_by: "script",
    },
    marketing_features: [
      { name: "✓ Unlimited class attendance" },
      { name: "✓ Online scheduling" },
      { name: "✓ Progress tracking" },
      { name: "✓ Belt testing eligibility" },
      { name: "✓ 5% savings vs monthly" },
    ],
    default_price_data: {
      unit_amount: 42500,
      currency: "usd",
      recurring: { interval: "month", interval_count: 3 },
    },
  },
  {
    name: `${BRAND_CODE}_membership_annual`,
    description: "Annual school membership — save over 15% compared to monthly.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "membership",
      entitlement_key: "membership:org:active",
      created_by: "script",
    },
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
      recurring: { interval: "year", interval_count: 1 },
    },
  },

  // ── Vertical 3: Program Enrollment (Stripe One-Time / Subscription) ──
  {
    name: `${BRAND_CODE}_program_enrollment_free`,
    description: "Free access to the program curriculum and community resources.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "program",
      entitlement_key: "program:enrollment:free",
      created_by: "script",
    },
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
    name: `${BRAND_CODE}_program_enrollment_standard`,
    description: "Full program access with instructor feedback and rank progression.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "program",
      entitlement_key: "program:enrollment:standard",
      created_by: "script",
    },
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
    additional_prices: [
      {
        unit_amount: 4900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 1 },
      },
      {
        unit_amount: 13900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 3 },
      },
      {
        unit_amount: 49900,
        currency: "usd",
        recurring: { interval: "year", interval_count: 1 },
      },
    ],
  },
  {
    name: `${BRAND_CODE}_program_enrollment_premium`,
    description: "Full program access with certification eligibility and priority support.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "program",
      entitlement_key: "program:enrollment:premium",
      created_by: "script",
    },
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
    additional_prices: [
      {
        unit_amount: 9900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 1 },
      },
      {
        unit_amount: 27900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 3 },
      },
      {
        unit_amount: 99900,
        currency: "usd",
        recurring: { interval: "year", interval_count: 1 },
      },
    ],
  },

  // ── Vertical 4: Tournament Registration (Stripe One-Time) ──
  {
    name: `${BRAND_CODE}_tournament_registration`,
    description: "Register for a tournament — compete in one or more divisions.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "tournament",
      entitlement_key: "tournament:registration:entry",
      created_by: "script",
    },
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

  // ── Vertical 5: Certificate Order (Stripe + Fulfillment) ──
  {
    name: `${BRAND_CODE}_certificate_order`,
    description: "Official certificate issued for rank promotion or course completion.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "certificate",
      entitlement_key: "certificate:order:issued",
      created_by: "script",
    },
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

  // ── Vertical 6: Course Enrollment (Stripe One-Time) ──
  {
    name: `${BRAND_CODE}_course_free`,
    description: "Free access to course curriculum materials.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "course",
      entitlement_key: "course:enrollment:free",
      created_by: "script",
    },
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
    name: `${BRAND_CODE}_course_standard`,
    description: "Full course access with completion tracking and certificate eligibility.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "course",
      entitlement_key: "course:enrollment:standard",
      created_by: "script",
    },
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
    additional_prices: [
      {
        unit_amount: 2900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 1 },
      },
      {
        unit_amount: 7900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 3 },
      },
      {
        unit_amount: 29900,
        currency: "usd",
        recurring: { interval: "year", interval_count: 1 },
      },
    ],
  },

  // ── Vertical 7: Belt Test Registration (Stripe One-Time) ──
  {
    name: `${BRAND_CODE}_belt_test_registration`,
    description: "Register for a belt promotion test at your school.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "belt_test",
      entitlement_key: "belt_test:registration:entry",
      created_by: "script",
    },
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

  // ── Vertical 8: Event Registration (Stripe One-Time) ──
  {
    name: `${BRAND_CODE}_event_free`,
    description: "Free community event — open to all members.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "event",
      entitlement_key: "event:registration:free",
      created_by: "script",
    },
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
    name: `${BRAND_CODE}_event_paid`,
    description: "Seminar, workshop, or camp registration with full materials.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "event",
      entitlement_key: "event:registration:paid",
      created_by: "script",
    },
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

  // ── Vertical: Org/League Annual Fee (Stripe Subscription) ──
  {
    name: `${BRAND_CODE}_org_annual_fee`,
    description: "Annual organization or league affiliation fee.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "org_fee",
      entitlement_key: "org:affiliation:active",
      created_by: "script",
    },
    marketing_features: [
      { name: "✓ Organization listing in directory" },
      { name: "✓ Tournament sanctioning eligibility" },
      { name: "✓ Member rank verification" },
      { name: "✓ Platform admin tools" },
    ],
    default_price_data: {
      unit_amount: 29900,
      currency: "usd",
      recurring: { interval: "year", interval_count: 1 },
    },
    additional_prices: [
      {
        unit_amount: 2900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 1 },
      },
      {
        unit_amount: 7900,
        currency: "usd",
        recurring: { interval: "month", interval_count: 3 },
      },
    ],
  },

  // ── Vertical: Branded Merch (Stripe One-Time / Stripe + Fulfillment) ──
  {
    name: `${BRAND_CODE}_merch_training_gear`,
    description: "Training gear — gi, rash guards, shorts, gloves, and protective equipment.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "merch",
      entitlement_key: "merch:order:training",
      created_by: "script",
    },
    marketing_features: [
      { name: "✓ Quality training equipment" },
      { name: "✓ School-approved gear" },
      { name: "✓ Ships direct" },
    ],
    default_price_data: {
      unit_amount: 5999,
      currency: "usd",
    },
  },
  {
    name: `${BRAND_CODE}_merch_accessories`,
    description: "Accessories — bags, water bottles, wraps, tape, and training aids.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "merch",
      entitlement_key: "merch:order:accessories",
      created_by: "script",
    },
    marketing_features: [
      { name: "✓ Essential training accessories" },
      { name: "✓ School-branded options available" },
      { name: "✓ Ships direct" },
    ],
    default_price_data: {
      unit_amount: 2499,
      currency: "usd",
    },
  },
  {
    name: `${BRAND_CODE}_merch_recovery`,
    description: "Recovery gear — foam rollers, massage tools, supplements, and rehab aids.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "merch",
      entitlement_key: "merch:order:recovery",
      created_by: "script",
    },
    marketing_features: [
      { name: "✓ Recovery and conditioning tools" },
      { name: "✓ Instructor-recommended" },
      { name: "✓ Ships direct" },
    ],
    default_price_data: {
      unit_amount: 2999,
      currency: "usd",
    },
  },

  // ── Vertical 9: Directory Listing (Dirstarter baseline, brand-scoped) ──
  {
    name: `${BRAND_CODE}_directory_listing_free`,
    description: "Free listing with a wait time and a direct link to your website.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "directory",
      entitlement_key: "directory:listing:free",
      created_by: "script",
    },
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
    name: `${BRAND_CODE}_directory_listing_standard`,
    description: "Do-follow link with faster processing and content updates.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "directory",
      entitlement_key: "directory:listing:standard",
      created_by: "script",
    },
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
    name: `${BRAND_CODE}_directory_listing_premium`,
    description: "Featured placement with a homepage spot and prominent listing position.",
    active: true,
    metadata: {
      brand: BRAND,
      vertical: "directory",
      entitlement_key: "directory:listing:premium",
      created_by: "script",
    },
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
      recurring: { interval: "month", interval_count: 1 },
    },
    additional_prices: [
      {
        unit_amount: 197000,
        currency: "usd",
        recurring: { interval: "year", interval_count: 1 },
      },
    ],
  },
]

// ── Idempotent creation logic ──

async function findExistingProduct(name: string): Promise<Stripe.Product | null> {
  const existing = await stripe.products.search({
    query: `name:'${name}'`,
  })
  return existing.data[0] ?? null
}

async function main() {
  console.log(`🥋 Setting up Ronin Stripe products for ${BRAND}...`)
  console.log(`   Products to process: ${products.length}`)
  console.log()

  let created = 0
  let skipped = 0

  for (const productDef of products) {
    const existing = await findExistingProduct(productDef.name)

    if (existing) {
      console.log(`⏭️  Skipped (exists): ${productDef.name} [${existing.id}]`)
      skipped++
      continue
    }

    // Create the product with default price
    const { additional_prices, ...createParams } = productDef
    const product = await stripe.products.create(createParams)
    console.log(`✅ Created: ${productDef.name} [${product.id}]`)

    // Create additional prices if defined
    if (additional_prices) {
      for (const priceData of additional_prices) {
        const price = await stripe.prices.create({
          ...priceData,
          product: product.id,
          metadata: {
            currency: priceData.currency,
          },
        })
        console.log(`   └─ Additional price: ${price.id} (${priceData.recurring?.interval ?? "one-time"})`)
      }
    }

    created++
  }

  console.log()
  console.log(`🎉 Done! Created: ${created}, Skipped: ${skipped}, Total: ${products.length}`)
}

main().catch((error) => {
  console.error("❌ Error setting up Ronin Stripe products:", error)
  process.exit(1)
})
