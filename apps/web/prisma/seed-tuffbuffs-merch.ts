import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-tuffbuffs-merch.ts
 *
 * Seeds all TuffBuffs merch products (shirts, rash guards, hoodies, gear,
 * accessories) as PricingPlan rows with metadata JSON containing merch-specific
 * fields: colors, sizes, features, imagePaths, classType, inStock, etc.
 *
 * Product data is self-contained in this file (Phase 4 extraction — SESSION_0111).
 * Previously imported from ~/lib/tuffbuffs/merch-catalog.ts.
 *
 * Follows the same pattern as seed-tuffbuffs-affiliate.ts.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-tuffbuffs-merch.ts
 *   bun run apps/web/prisma/seed-tuffbuffs-merch.ts --org-id <cuid>
 *
 * @see docs/sprints/SESSION_0111.md TASK_01
 * @see docs/sprints/SESSION_0111.md Phase 4
 */

const TUFFBUFFS_MERCH_SHIPPING_FEE_CENTS = 499

type TuffBuffsMerchProduct = {
  id: string
  name: string
  category: "apparel" | "rashguards" | "gear" | "accessories"
  type: string
  classType?: "bjj" | "boxing" | "eskrima" | "muay-thai"
  amountCents: number
  currency: "usd"
  colors?: readonly string[]
  sizes?: readonly string[]
  description: string
  features: readonly string[]
  imagePath: string
  imagePaths?: readonly string[]
  featured?: boolean
  inStock: boolean
}

const PLACEHOLDER_IMAGE_PATH = "/images/merch/placeholder.svg"

const tuffBuffsMerchProducts: readonly TuffBuffsMerchProduct[] = [
  {
    id: "tb-tshirt-classic-black",
    name: "TuffBuffs Classic Tee",
    category: "apparel",
    type: "T-Shirt",
    amountCents: 2800,
    currency: "usd",
    colors: ["Black", "Gold"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Premium cotton tee with TuffBuffs logo. CU Gold on Black.",
    features: ["100% Ring-spun Cotton", "Pre-shrunk", "Screen-printed logo"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    featured: true,
    inStock: true,
  },
  {
    id: "tb-tshirt-muaythai",
    name: "Muay Thai Division Tee",
    category: "apparel",
    type: "T-Shirt",
    classType: "muay-thai",
    amountCents: 3000,
    currency: "usd",
    colors: ["Black", "Red"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Muay Thai program shirt with traditional Thai script.",
    features: ["Moisture-wicking blend", "Athletic fit", "Side vents"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-tshirt-boxing",
    name: "Boxing Division Tee",
    category: "apparel",
    type: "T-Shirt",
    classType: "boxing",
    amountCents: 3000,
    currency: "usd",
    colors: ["Black", "Gold"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Boxing program shirt with classic boxing gloves design.",
    features: ["Moisture-wicking blend", "Athletic fit", "Side vents"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-tshirt-eskrima",
    name: "Eskrima Division Tee",
    category: "apparel",
    type: "T-Shirt",
    classType: "eskrima",
    amountCents: 3000,
    currency: "usd",
    colors: ["Black", "Green"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Filipino Martial Arts shirt with crossed sticks emblem.",
    features: ["Moisture-wicking blend", "Athletic fit", "Side vents"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-athletic-tshirt-men",
    name: "Tuff Buffs Athletic T-Shirt (Men's)",
    category: "apparel",
    type: "T-Shirt",
    amountCents: 3499,
    currency: "usd",
    colors: ["Black", "White"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Moisture-wicking sport jersey built for Brian's workouts, tournaments, or everyday wear.",
    features: ["Moisture-wicking jersey", "Breathable fabric", "Athletic fit", "Durable print"],
    imagePath: "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-front-698dda8dd7a1b.png",
    imagePaths: [
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-front-698dda8dd7a1b.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-back-698dda8dd888e.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-back-698dda8dd7f01.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-product-details-698dda8dd8b0f.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-front-698dda8dd86eb.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-front-698dda8dd81d6.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-front-698dda8dd7c86.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-back-698dda8dd890b.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-back-698dda8dd84aa.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-back-698dda8dd7f89.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-product-details-698dda8dd8b93.png",
    ],
    inStock: true,
  },
  {
    id: "tb-athletic-tshirt-womens",
    name: "Tuff Buffs Athletic T-Shirt (Women's)",
    category: "apparel",
    type: "T-Shirt",
    amountCents: 3499,
    currency: "usd",
    colors: ["Black", "White"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Moisture-wicking sport jersey built for Brian's workouts, tournaments, or everyday wear.",
    features: ["Moisture-wicking jersey", "Breathable fabric", "Athletic fit", "Durable print"],
    imagePath: "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-front-698dda8dd86eb.png",
    imagePaths: [
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-front-698dda8dd86eb.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-front-698dda8dd81d6.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-front-698dda8dd7c86.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-back-698dda8dd890b.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-back-698dda8dd84aa.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-back-698dda8dd7f89.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-white-product-details-698dda8dd8b93.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-front-698dda8dd7a1b.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-back-698dda8dd888e.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-back-698dda8dd7f01.png",
      "/images/merch/Tuff-Buffs-Athletic-T-Shirt-unisex-sports-jersey-black-product-details-698dda8dd8b0f.png",
    ],
    inStock: true,
  },
  {
    id: "tb-hoodie-womens",
    name: "TuffBuffs Women's Hoodie",
    category: "apparel",
    type: "Hoodie",
    amountCents: 4900,
    currency: "usd",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Cotton heritage pullover hoodie with TuffBuffs branding.",
    features: ["Soft fleece interior", "Pullover fit", "Kangaroo pocket", "Drawstring hood"],
    imagePath: "/images/merch/Tuff-Buffs-Hoodies-cotton-heritage-m2580-i-unisex-premium-pullover-female-black-front-left-front-698dd20f65162.png",
    imagePaths: [
      "/images/merch/Tuff-Buffs-Hoodies-cotton-heritage-m2580-i-unisex-premium-pullover-female-black-front-left-front-698dd20f65162.png",
      "/images/merch/Tuff-Buffs-Hoodies-cotton-heritage-m2580-i-unisex-premium-pullover-female-black-front-right-front-698dd20f65916.png",
      "/images/merch/Tuff-Buffs-Hoodies-cotton-heritage-m2580-i-unisex-premium-pullover-female-black-back-698dd20f64dfd.png",
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "tb-hoodie-mens",
    name: "TuffBuffs Men's Hoodie",
    category: "apparel",
    type: "Hoodie",
    amountCents: 4900,
    currency: "usd",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Cotton heritage pullover hoodie with TuffBuffs branding.",
    features: ["Soft fleece interior", "Pullover fit", "Kangaroo pocket", "Drawstring hood"],
    imagePath: "/images/merch/Tuff-Buffs-Hoodie-cotton-heritage-m2580-i-unisex-premium-pullover-hoodie-black-front-698dd20f6602d.png",
    imagePaths: [
      "/images/merch/Tuff-Buffs-Hoodie-cotton-heritage-m2580-i-unisex-premium-pullover-hoodie-black-front-698dd20f6602d.png",
      "/images/merch/Tuff-Buffs-Hoodie-cotton-heritage-m2580-i-unisex-premium-pullover-hoodie-black-left-front-698dd20f6707f.png",
      "/images/merch/Tuff-Buffs-Hoodie-cotton-heritage-m2580-i-unisex-premium-pullover-hoodie-black-back-698dd20f663c6.png",
    ],
    inStock: true,
  },
  {
    id: "tb-long-sleeve-rash-guard",
    name: "TuffBuffs Long Sleeve Rash Guard",
    category: "rashguards",
    type: "Rash Guard",
    classType: "bjj",
    amountCents: 5900,
    currency: "usd",
    colors: ["Black", "Gold"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "All-over print long sleeve rash guard with TuffBuffs branding.",
    features: ["Compression fit", "Anti-microbial fabric", "Sublimated design", "Reinforced stitching"],
    imagePath: "/images/merch/Tuff-Buffs-long-sleeve-all-over-print-mens-rash-guard-front-68bb1b3d6a895-68bb1b3d694b3.png",
    imagePaths: [
      "/images/merch/Tuff-Buffs-long-sleeve-all-over-print-mens-rash-guard-front-68bb1b3d6a895-68bb1b3d694b3.png",
      "/images/merch/Tuff-Buffs-long-sleeve-all-over-print-mens-rash-guard-back-68bb1b3d6a895.png",
      "/images/merch/Tuff-Buffs-long-sleeve-all-over-print-mens-rash-guard-right-68bb1b3d6b70e.png",
    ],
    featured: true,
    inStock: true,
  },
  {
    id: "tb-rg-ranked-white",
    name: "Ranked Rash Guard - White",
    category: "rashguards",
    type: "Rash Guard",
    classType: "bjj",
    amountCents: 5500,
    currency: "usd",
    colors: ["White"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "IBJJF-compliant white ranked rash guard for BJJ competition.",
    features: ["4-way stretch fabric", "Flatlock stitching", "Sublimated graphics", "IBJJF compliant"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-rg-ranked-black",
    name: "Ranked Rash Guard - Black",
    category: "rashguards",
    type: "Rash Guard",
    classType: "bjj",
    amountCents: 5500,
    currency: "usd",
    colors: ["Black"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "IBJJF-compliant black ranked rash guard for BJJ competition.",
    features: ["4-way stretch fabric", "Flatlock stitching", "Sublimated graphics", "IBJJF compliant"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-rg-nogi",
    name: "TuffBuffs No-Gi Rash Guard",
    category: "rashguards",
    type: "Rash Guard",
    classType: "bjj",
    amountCents: 5000,
    currency: "usd",
    colors: ["Black/Gold"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Premium no-gi rash guard with full TuffBuffs branding.",
    features: ["Compression fit", "Anti-microbial fabric", "Sublimated design", "Reinforced stitching"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    featured: true,
    inStock: true,
  },
  {
    id: "tb-rg-shortsleeve",
    name: "Short Sleeve Rash Guard",
    category: "rashguards",
    type: "Rash Guard",
    amountCents: 4500,
    currency: "usd",
    colors: ["Black", "Gold"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    description: "Versatile short sleeve rash guard for training.",
    features: ["Lightweight fabric", "UV protection", "Quick-dry material"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-gloves-boxing",
    name: "TuffBuffs Boxing Gloves",
    category: "gear",
    type: "Gloves",
    amountCents: 7500,
    currency: "usd",
    sizes: ["12oz", "14oz", "16oz"],
    description: "Quality boxing gloves with TuffBuffs branding.",
    features: ["Multi-layer foam padding", "Velcro wrist closure", "Synthetic leather", "Thumb lock"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-gloves-mma",
    name: "TuffBuffs MMA Gloves",
    category: "gear",
    type: "Gloves",
    amountCents: 4500,
    currency: "usd",
    sizes: ["S", "M", "L", "XL"],
    description: "Open-finger MMA gloves for grappling and striking.",
    features: ["Open palm design", "Knuckle protection", "Velcro closure"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-shinpads",
    name: "Muay Thai Shin Guards",
    category: "gear",
    type: "Shin Guards",
    classType: "muay-thai",
    amountCents: 6500,
    currency: "usd",
    sizes: ["S", "M", "L", "XL"],
    description: "Traditional-style shin guards for Muay Thai training.",
    features: ["High-density foam", "Instep protection", "Velcro straps", "Synthetic leather"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-headgear",
    name: "Sparring Headgear",
    category: "gear",
    type: "Headgear",
    amountCents: 5500,
    currency: "usd",
    sizes: ["S", "M", "L", "XL"],
    description: "Protective headgear for sparring sessions.",
    features: ["Full face protection", "Adjustable chin strap", "Open top design", "Synthetic leather"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-eskrima-sticks",
    name: "Rattan Eskrima Sticks (Pair)",
    category: "gear",
    type: "Weapons",
    classType: "eskrima",
    amountCents: 2500,
    currency: "usd",
    description: "Traditional rattan sticks for Eskrima training.",
    features: ['28" length', "Natural rattan", "Balanced weight", "Includes carrying bag"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-padded-sticks",
    name: "Padded Training Sticks (Pair)",
    category: "gear",
    type: "Weapons",
    classType: "eskrima",
    amountCents: 3500,
    currency: "usd",
    description: "Foam-padded sticks for safe partner drills.",
    features: ["High-density foam", "Durable core", "Safe for contact", "Great for beginners"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-bag-gym",
    name: "TuffBuffs Gym Bag",
    category: "accessories",
    type: "Bag",
    amountCents: 4500,
    currency: "usd",
    colors: ["Black"],
    description: "Spacious duffel bag with TuffBuffs branding.",
    features: ["Large main compartment", "Shoe pocket", "Shoulder strap", "Water-resistant"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-tote-bag",
    name: "Tuff Buffs Large Organic Tote Bag",
    category: "accessories",
    type: "Tote Bag",
    amountCents: 2499,
    currency: "usd",
    colors: ["Black"],
    description: "Large organic tote bag - perfect for gear, gis, and gloves.",
    features: ["Durable canvas", "Reinforced straps", "Large capacity", "Easy clean"],
    imagePath: "/images/merch/Tuff-Buffs-Tote-Bag-large-eco-tote-black-front-698dd861a3b29.png",
    imagePaths: [
      "/images/merch/Tuff-Buffs-Tote-Bag-large-eco-tote-black-front-698dd861a3b29.png",
      "/images/merch/Tuff-Buffs-Tote-Bag-large-eco-tote-black-front-698dd861a424e.png",
      "/images/merch/Tuff-Buffs-Tote-Bag-large-eco-tote-black-back-698dd861a3eb1.png",
      "/images/merch/Tuff-Buffs-Tote-Bag-large-eco-tote-black-back-698dd861a446c.png",
      "/images/merch/Tuff-Buffs-Tote-Bag-large-eco-tote-black-product-details-698dd861a4088.png",
    ],
    inStock: true,
  },
  {
    id: "tb-mouthguard",
    name: "Custom Mouthguard",
    category: "accessories",
    type: "Mouthguard",
    amountCents: 1500,
    currency: "usd",
    description: "Boil-and-bite mouthguard with case.",
    features: ["Custom moldable", "Includes case", "BPA-free material"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-handwraps",
    name: "Hand Wraps (Pair)",
    category: "accessories",
    type: "Hand Wraps",
    amountCents: 1200,
    currency: "usd",
    colors: ["Black", "Gold", "Red"],
    description: '180" Mexican-style hand wraps with TuffBuffs logo.',
    features: ['180" length', "Thumb loop", "Velcro closure", "Machine washable"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
  {
    id: "tb-waterbottle",
    name: "TuffBuffs Water Bottle",
    category: "accessories",
    type: "Water Bottle",
    amountCents: 1800,
    currency: "usd",
    colors: ["Black", "Gold"],
    description: "32oz insulated water bottle with TuffBuffs logo.",
    features: ["32oz capacity", "Double-wall insulated", "BPA-free", "Leak-proof lid"],
    imagePath: PLACEHOLDER_IMAGE_PATH,
    inStock: true,
  },
]

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const args = process.argv.slice(2)
const orgIdFlag = args.includes("--org-id")
  ? args[args.indexOf("--org-id") + 1]
  : null

async function main() {
  // Resolve org
  let organizationId = orgIdFlag
  if (!organizationId) {
    const org = await db.organization.findFirst({
      where: { brand: "BASELINE_MARTIAL_ARTS" },
      select: { id: true, name: true },
    })
    if (!org) {
      console.error(
        "❌ No BASELINE_MARTIAL_ARTS organization found. Run main seed first or pass --org-id.",
      )
      process.exit(1)
    }
    organizationId = org.id
    console.log(`📍 Using org: ${org.name} (${org.id})`)
  }

  console.log(
    `\n🌱 Seeding ${tuffBuffsMerchProducts.length} TuffBuffs merch products as PricingPlan rows...\n`,
  )

  let created = 0
  let skipped = 0

  for (const product of tuffBuffsMerchProducts) {
    // Idempotent: skip if a row with this name already exists for this org
    const existing = await db.pricingPlan.findFirst({
      where: {
        brand: "BASELINE_MARTIAL_ARTS",
        organizationId,
        name: product.name,
      },
    })

    if (existing) {
      console.log(`   ⏭️  Skipped (exists): ${product.name}`)
      skipped++
      continue
    }

    await db.pricingPlan.create({
      data: {
        brand: "BASELINE_MARTIAL_ARTS",
        name: product.name,
        pricingModel: "CUSTOM",
        amountCents: product.amountCents,
        isActive: true,
        organizationId,
        sortOrder: created,
        metadata: {
          externalId: product.id,
          description: product.description,
          category: product.category,
          type: product.type,
          classType: product.classType ?? null,
          colors: product.colors ? [...product.colors] : [],
          sizes: product.sizes ? [...product.sizes] : [],
          features: [...product.features],
          imagePath: product.imagePath,
          imagePaths: product.imagePaths ? [...product.imagePaths] : [],
          featured: product.featured ?? false,
          inStock: product.inStock,
          currency: product.currency,
          shippingFeeCents: TUFFBUFFS_MERCH_SHIPPING_FEE_CENTS,
          source: "tuffbuffs-merch",
        },
      },
    })
    console.log(
      `   ✅ Created: ${product.name} ($${(product.amountCents / 100).toFixed(2)})`,
    )
    created++
  }

  console.log(
    `\n🎉 Done! Created: ${created}, Skipped: ${skipped}, Total: ${tuffBuffsMerchProducts.length}`,
  )
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
