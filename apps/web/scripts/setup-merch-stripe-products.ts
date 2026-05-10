import { PrismaPg } from "@prisma/adapter-pg"
import type { Stripe } from "stripe"
import { PrismaClient } from "~/.generated/prisma/client"
import { stripe } from "~/services/stripe"

/**
 * setup-merch-stripe-products.ts
 *
 * Creates Stripe Products + one-time Prices for all TuffBuffs merch items
 * stored as PricingPlan rows with `metadata.source = "tuffbuffs-merch"`.
 *
 * Follows ADR 0014 naming: BMA_merch_{product_id}
 * Writes stripeProductId + stripePriceId back to PricingPlan rows.
 *
 * Idempotent — skips products that already exist in Stripe (by name search)
 * and links existing products back to DB rows if not yet linked.
 *
 * Usage:
 *   bun run apps/web/scripts/setup-merch-stripe-products.ts              # create all
 *   bun run apps/web/scripts/setup-merch-stripe-products.ts --dry-run    # preview only
 *
 * NOTE: Requires STRIPE_SECRET_KEY in environment.
 *
 * @see docs/architecture/decisions/0014-stripe-product-policy.md
 * @see docs/sprints/SESSION_0112.md TASK_01
 */

// ── CLI args ──

const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")

// ── Constants ──

const BRAND_CODE = "BMA"
const BRAND_ENUM = "BASELINE_MARTIAL_ARTS"

/** Branded fallback image for products without real images */
const FALLBACK_STRIPE_IMAGE =
  "https://baselinemartialarts.com/images/merch/tuffbuffs-stripe-fallback.png"

// ── Helpers ──

async function findExistingProduct(name: string): Promise<Stripe.Product | null> {
  const existing = await stripe.products.search({
    query: `name:'${name}'`,
  })
  return existing.data[0] ?? null
}

function isPlaceholderImage(path: string): boolean {
  return path.includes("placeholder")
}

/**
 * Build a public URL for a merch image.
 * Stripe requires absolute URLs for product images.
 */
function resolveImageUrl(imagePath: string): string {
  if (isPlaceholderImage(imagePath)) {
    return FALLBACK_STRIPE_IMAGE
  }
  // Assume images are served from the same domain
  return `https://baselinemartialarts.com${imagePath}`
}

// ── Main ──

async function main() {
  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
  })
  const db = new PrismaClient({ adapter })

  try {
    // Find all merch PricingPlan rows
    const plans = await db.pricingPlan.findMany({
      where: {
        brand: BRAND_ENUM,
        isActive: true,
      },
      include: { organization: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    })

    // Filter to merch items by checking metadata.source
    const merchPlans = plans.filter((p) => {
      const meta = p.metadata as Record<string, unknown> | null
      return meta?.source === "tuffbuffs-merch"
    })

    if (merchPlans.length === 0) {
      console.log("✅ No TuffBuffs merch PricingPlan rows found. Run seed-tuffbuffs-merch.ts first.")
      return
    }

    console.log(`📦 Found ${merchPlans.length} TuffBuffs merch products.\n`)

    if (DRY_RUN) {
      console.log("🏜️  DRY RUN — no Stripe API calls will be made.\n")
    }

    let created = 0
    let linked = 0
    let skipped = 0

    for (const plan of merchPlans) {
      const meta = plan.metadata as Record<string, unknown>
      const externalId = (meta.externalId as string) ?? plan.id
      const productName = `${BRAND_CODE}_merch_${externalId}`
      const description = (meta.description as string) ?? plan.name
      const imagePath = (meta.imagePath as string) ?? ""
      const category = (meta.category as string) ?? "general"
      const productType = (meta.type as string) ?? "unknown"
      const classType = (meta.classType as string) ?? undefined

      // Already linked?
      if (plan.stripeProductId && plan.stripePriceId) {
        console.log(`   ⏭️  Already linked: ${plan.name} [${plan.stripeProductId}]`)
        skipped++
        continue
      }

      if (DRY_RUN) {
        console.log(`   🔍 Would create: ${productName} — ${plan.name} ($${(plan.amountCents / 100).toFixed(2)})`)
        console.log(`      └─ Image: ${isPlaceholderImage(imagePath) ? "fallback" : imagePath}`)
        created++
        continue
      }

      // Check if Stripe product already exists by name
      const existing = await findExistingProduct(productName)
      if (existing) {
        const defaultPrice =
          typeof existing.default_price === "string"
            ? existing.default_price
            : existing.default_price?.id
        await db.pricingPlan.update({
          where: { id: plan.id },
          data: {
            stripeProductId: existing.id,
            stripePriceId: defaultPrice ?? null,
          },
        })
        console.log(`   🔗 Linked existing: ${productName} [${existing.id}] → PricingPlan ${plan.id}`)
        linked++
        continue
      }

      // Build Stripe Product params (ADR 0014 §2–3)
      const productParams: Stripe.ProductCreateParams = {
        name: productName,
        description,
        active: true,
        images: [resolveImageUrl(imagePath)],
        metadata: {
          brand: BRAND_ENUM,
          vertical: "merch",
          category,
          type: productType,
          ...(classType ? { class_type: classType } : {}),
          pricing_plan_id: plan.id,
          organization_id: plan.organizationId ?? "",
          created_by: "script:setup-merch",
        },
        default_price_data: {
          unit_amount: plan.amountCents,
          currency: "usd",
          // One-time payment, not subscription
        },
      }

      const product = await stripe.products.create(productParams)

      // Write back to DB
      const defaultPriceId =
        typeof product.default_price === "string"
          ? product.default_price
          : product.default_price?.id

      await db.pricingPlan.update({
        where: { id: plan.id },
        data: {
          stripeProductId: product.id,
          stripePriceId: defaultPriceId ?? null,
        },
      })

      console.log(`   ✅ Created: ${productName} [${product.id}] → PricingPlan ${plan.id} ($${(plan.amountCents / 100).toFixed(2)})`)
      created++
    }

    const mode = DRY_RUN ? "Would create" : "Created"
    console.log(`\n🎉 Done! ${mode}: ${created}, Linked existing: ${linked}, Skipped: ${skipped}, Total: ${merchPlans.length}`)
  } finally {
    await db.$disconnect()
  }
}

main().catch((error) => {
  console.error("❌ Error setting up merch Stripe products:", error)
  process.exit(1)
})
