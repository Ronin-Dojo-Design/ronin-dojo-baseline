import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"
import type { TuffBuffsAffiliateGearProduct } from "~/types/tuffbuffs-gear"

/**
 * seed-tuffbuffs-affiliate.ts
 *
 * Seeds all TuffBuffs affiliate gear products as PricingPlan rows with
 * metadata JSON containing affiliate URL, image path, description, category,
 * and recommendedFor programs.
 *
 * Product data is self-contained in this file (Phase 3 extraction — SESSION_0110).
 * Previously imported from ~/lib/tuffbuffs/affiliate-gear.ts.
 *
 * Usage:
 *   bun run apps/web/prisma/seed-tuffbuffs-affiliate.ts
 *   bun run apps/web/prisma/seed-tuffbuffs-affiliate.ts --org-id <cuid>
 *
 * @see docs/sprints/SESSION_0105.md TASK_02
 * @see docs/sprints/SESSION_0110.md TASK_02
 */

const tuffBuffsAffiliateGearProducts: readonly TuffBuffsAffiliateGearProduct[] = [
  {
    id: "amz-bjj-gi",
    name: "Hayabusa Classic Pearl Weave Jiu Jitsu Gi",
    description: "Classic pearl weave gi with an IBJJF-compliant training fit.",
    amountCents: 5999,
    category: "training",
    affiliateUrl: "https://amzn.to/4cqiK7z",
    imagePath: "/images/merch/Hayabusa-Classic-Pearl-Weave-Jiu-Jitsu-Gi-For-Men-and-Women.jpg",
    recommendedFor: ["bjj"],
  },
  {
    id: "amz-bjj-gi-elite-sports-men",
    name: "Elite Sports Men's BJJ Gi",
    description: "Preshrunk IBJJF-ready gi with a free belt included.",
    amountCents: 5999,
    category: "training",
    affiliateUrl: "https://amzn.to/4auCVPk",
    imagePath: "/images/merch/Elite-Sports-BJJ-GI-for-Men-IBJJF-Kimono.jpg",
    recommendedFor: ["bjj"],
  },
  {
    id: "amz-bjj-gi-hayabusa-ultra-light",
    name: "Hayabusa Ultra-Lightweight Pearlweave Gi",
    description: "Light pearlweave gi built for comfort and fast drying.",
    amountCents: 12900,
    category: "training",
    affiliateUrl: "https://amzn.to/4rk052a",
    imagePath: "/images/merch/Hayabusa-Ultra-Lightweight-Pearlweave-Jiu-Jitsu-Gi.jpg",
    recommendedFor: ["bjj"],
  },
  {
    id: "amz-bjj-gi-elite-sports-women",
    name: "Elite Sports Women's Ultra-Light BJJ Gi",
    description: "Ultra-light women's gi designed for IBJJF competition.",
    amountCents: 5999,
    category: "training",
    affiliateUrl: "https://amzn.to/4auaeBW",
    imagePath:
      "/images/merch/Elite-Sports-Ultra-Light-Womens-BJJ-GI-IBJJF-Jiu-Jitsu-Gi-for-Girls-and-women.jpg",
    recommendedFor: ["bjj"],
  },
  {
    id: "amz-bjj-shorts-men",
    name: "Men's No-Gi Grappling Shorts",
    description: "Lightweight grappling shorts for BJJ, Muay Thai, boxing, kickboxing, and MMA.",
    amountCents: 1999,
    category: "training",
    affiliateUrl: "https://amzn.to/4krRA28",
    imagePath:
      "/images/merch/BJJ-Shorts-for-Men-No-Gi-Jiu-Jitsu-Grappling-Muay-Thai-Shorts-Boxing-Kickboxing-MMA-Fight-Shorts-Cage-UFC-Training-Shorts.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-bjj-shorts-gold-women",
    name: "Gold BJJ Women's Pacific Shorts",
    description: "Women's no-gi fight shorts with a flexible waistband.",
    amountCents: 3995,
    category: "training",
    affiliateUrl: "https://amzn.to/4qvJG9k",
    imagePath:
      "/images/merch/Gold-BJJ-Womens-Pacific-Short-No-Gi-Jiu-Jitsu-Fight-Shorts-for-Women.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-bjj-rashguard-gold-men",
    name: "Gold BJJ Foundation Rash Guard",
    description: "Ranked rash guard for no-gi and gi training.",
    amountCents: 4299,
    category: "training",
    affiliateUrl: "https://amzn.to/4kt65Tk",
    imagePath:
      "/images/merch/Gold-BJJ-Foundation-Rash-Guard-Ranked-No-Gi-and-Gi-Jiu-Jitsu-Rashguard.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-bjj-rashguard-gold-women",
    name: "Gold BJJ Women's Foundation Rash Guard",
    description: "Women's foundation rash guard for no-gi and gi sessions.",
    amountCents: 4299,
    category: "training",
    affiliateUrl: "https://amzn.to/4tvPGBN",
    imagePath:
      "/images/merch/Gold-BJJ-Foundation-Womens-Rash-Guard-No-Gi-and-Gi-Jiu-Jitsu-Rashguard-for-Women.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-bjj-spats-runhit",
    name: "Runhit Compression Spats",
    description: "Compression spats for no-gi training and layering.",
    amountCents: 1499,
    category: "training",
    affiliateUrl: "https://amzn.to/4c9cfGr",
    imagePath:
      "/images/merch/Runhit-Mens-BJJ-Rash-Guard-Jiu-Jitsu-Compression-Spats-Pants-No-Gi-MMA-Leggings-Martial-Arts-Sports-Tights-Base-Layer.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-thai-shorts",
    name: "Muay Thai Boxing Shorts",
    description: "Retro Muay Thai boxing trunks for training.",
    amountCents: 4999,
    category: "training",
    affiliateUrl: "https://amzn.to/4qyUnYX",
    imagePath:
      "/images/merch/Muay-Thai-Boxing-Shorts-MMA-Training-Kickboxing-Trunks-Retro-Shorts.jpg",
    recommendedFor: ["muay-thai"],
  },
  {
    id: "amz-boxing-gloves",
    name: "Everlast Powerlock 2 Boxing Gloves",
    description: "Secure-fit gloves with triple-layer foam and wrist support.",
    amountCents: 3999,
    category: "training",
    affiliateUrl: "https://amzn.to/49JoKXr",
    imagePath:
      "/images/merch/Everlast-Powerlock-2-Boxing-Gloves-Pro-Flight-Gloves-Secure-Fit-Hook-and-Loop-with-Triple-Layer-Foam-&-Wrist-Support-for-Injury-Prevention.jpg",
    recommendedFor: ["muay-thai", "boxing", "self-defense"],
  },
  {
    id: "amz-boxing-gloves-white",
    name: "Everlast Pro Flight Gloves",
    description: "White Everlast Pro Flight gloves with secure hook-and-loop fit.",
    amountCents: 8999,
    category: "training",
    affiliateUrl: "https://amzn.to/4rejVeq",
    imagePath: "/images/merch/Everlast-Elite-2-Boxing-Gloves.jpg",
    recommendedFor: ["muay-thai", "boxing", "self-defense"],
  },
  {
    id: "amz-hand-wraps",
    name: "Everlast Hand Wraps, 3-Pack",
    description: "Three-pack hand wraps for boxing and striking sessions.",
    amountCents: 999,
    category: "training",
    affiliateUrl: "https://amzn.to/4cpLNrT",
    imagePath: "/images/merch/Everlast-three-pack-handwraps.jpg",
    recommendedFor: ["muay-thai", "boxing", "self-defense"],
  },
  {
    id: "amz-hand-wraps-rdx",
    name: "RDX Boxing Hand Wraps",
    description:
      "Mexican-style semi-elastic 180-inch wraps with thumb loop and hook-and-loop closure.",
    amountCents: 1299,
    category: "training",
    affiliateUrl: "https://amzn.to/4txNCcr",
    imagePath: "/images/merch/RDX-Mexican-Style-180-in-Handwraps.jpg",
    recommendedFor: ["muay-thai", "boxing", "self-defense"],
  },
  {
    id: "amz-hand-wraps-jenaai",
    name: "Jenaai 10-Pair Hand Wraps",
    description: "Bulk elastic 180-inch hand wraps in five colors.",
    amountCents: 1999,
    category: "training",
    affiliateUrl: "https://amzn.to/3Oazd5U",
    imagePath:
      "/images/merch/Jenaai-10-Pairs-Elastic-180-Inch-Boxing-Hand-Wraps-Bulk-Hand-Wraps-Boxing-Wrist-Wraps-for-Men-Women-Kickboxing-MMA-Muay-Thai-Boxing-Wrist-Protection-5-Colors.jpg",
    recommendedFor: ["muay-thai", "boxing", "self-defense"],
  },
  {
    id: "amz-shin-pads",
    name: "Fairtex SP5 Muay Thai Shin Pads",
    description: "Fairtex shin and instep guards for Muay Thai training.",
    amountCents: 3499,
    category: "training",
    affiliateUrl: "https://amzn.to/4sZWp6G",
    imagePath: "/images/merch/Fairtex-SP5-Muay-Thai-Shin-Pads.jpg",
    recommendedFor: ["muay-thai"],
  },
  {
    id: "amz-shin-pads-alt",
    name: "Shin/Instep Pads Alternate",
    description: "Alternate shin guard option for Muay Thai training.",
    amountCents: 3999,
    category: "training",
    affiliateUrl: "https://amzn.to/3Z1FQK8",
    recommendedFor: ["muay-thai"],
  },
  {
    id: "amz-focus-mitts",
    name: "RDX Curved Focus Mitts",
    description: "Curved leather focus mitts with adjustable straps.",
    amountCents: 3899,
    category: "training",
    affiliateUrl: "https://amzn.to/3ZxjpMY",
    imagePath:
      "/images/merch/RDX-Boxing-Pads-Curved-Focus-Mitts-Maya-Hide-Leather-Kara-Hook-and-jab-Training-Pads-Adjustable-Strap-Ventilate-MMA-Muay-Thai-Kickboxing-Coaching-Martial-Arts-Punching-Hand-Target-Strike-Shield.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-focus-mitts-hayabusa",
    name: "Hayabusa PTS 3 Focus Mitts",
    description: "Premium focus mitts designed for impact absorption.",
    amountCents: 8999,
    category: "training",
    affiliateUrl: "https://amzn.to/4rDnon2",
    imagePath: "/images/merch/Hayabusa-PTS-3-Focus-Mitts-Pair-Black-Standard.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-thai-pads-fairtex",
    name: "Fairtex Curved Thai Pads",
    description: "Curved Thai pads with extra padding for sparring and coaching.",
    amountCents: 17999,
    category: "training",
    affiliateUrl: "https://amzn.to/3MhbXCJ",
    imagePath:
      "/images/merch/Fairtex-Curved-MMA-Muay-Thai-Pads-for-Punching-Blocking-Kicking-Punch-Hitting-Light-Weight-Shock-Absorbent-Boxing-Mitts-Extra-Padding-for-Sparring-for-Kickboxing-self-Defense.jpg",
    recommendedFor: ["muay-thai", "eskrima", "self-defense"],
  },
  {
    id: "amz-headgear-hayabusa-pro",
    name: "Hayabusa Pro Leather Boxing Headgear",
    description: "Premium leather boxing headgear with adjustable fit.",
    amountCents: 21900,
    category: "training",
    affiliateUrl: "https://amzn.to/4r9wurT",
    imagePath: "/images/merch/Hayabusa-Pro-Leather-Boxing-Headgear-Adjustable-Black-One-Size.jpg",
    recommendedFor: ["muay-thai", "boxing"],
  },
  {
    id: "amz-headgear-hayabusa-t3-lx",
    name: "Hayabusa T3 LX MMA Headgear",
    description: "Leather MMA headgear with adjustable fit and sparring coverage.",
    amountCents: 19900,
    category: "training",
    affiliateUrl: "https://amzn.to/406xSQa",
    imagePath: "/images/merch/Hayabusa-T3-LX-Leather-Adjustable-MMA-Headgear-Brown-One-Size.jpg",
    recommendedFor: ["muay-thai", "boxing"],
  },
  {
    id: "amz-headgear-ringside-competition",
    name: "Ringside Competition Headgear",
    description: "Competition-style headgear without cheek protectors.",
    amountCents: 11499,
    category: "training",
    affiliateUrl: "https://amzn.to/3Mkuxdc",
    imagePath:
      "/images/merch/Ringside-Competition-Boxing-Muay-Thai-MMA-Sparring-Head-Protection-Headgear-Without-Cheeks.jpg",
    recommendedFor: ["muay-thai", "boxing"],
  },
  {
    id: "amz-mouthguard-safejawz",
    name: "SafeJawz Sports Mouthguard",
    description: "Dual-layer premium mouthguard with case.",
    amountCents: 1999,
    category: "training",
    affiliateUrl: "https://amzn.to/4rKqTYW",
    imagePath:
      "/images/merch/SafeJawz-Sports-Mouthguard-Dual-Layer-Premium-Mouth-Guard-with-Case.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-mouthguard-bulletproof",
    name: "Bulletproof Breathable Mouthguard",
    description: "Thin, breathable mouthguard for combat sports.",
    amountCents: 2499,
    category: "training",
    affiliateUrl: "https://amzn.to/46N4diG",
    imagePath: "/images/merch/Bulletproof-Worlds-Thinnest-Most-Breathable-Mouthguard.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-mouthguard-sisu-aero",
    name: "SISU Aero Large Mouthguard",
    description: "Remoldable mouthguard with a slim profile.",
    amountCents: 2499,
    category: "training",
    affiliateUrl: "https://amzn.to/3M8P7x8",
    imagePath: "/images/merch/SISU-Aero-Large-Mouthguard.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-mouthguard-case-sisu",
    name: "SISU Mouthguard Case",
    description: "Protective case for SISU mouthguards.",
    amountCents: 999,
    category: "accessories",
    affiliateUrl: "https://amzn.to/4qsGOdD",
    imagePath: "/images/merch/SISU-Mouthguard-Case.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-cup",
    name: "Shock Doctor Cup",
    description: "Protective cup for combat sports training.",
    amountCents: 2499,
    category: "training",
    affiliateUrl: "https://amzn.to/4rootiQ",
    imagePath: "/images/merch/Shock Doctor-2-Pack-Compression-Shorts-with-Cup-and-Cup-Pocket.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-cup-shorts-shock-doctor",
    name: "Shock Doctor Compression Shorts with Cup",
    description: "Compression shorts with built-in cup pocket and included cup.",
    amountCents: 4499,
    category: "training",
    affiliateUrl: "https://amzn.to/4rootiQ",
    imagePath: "/images/merch/Shock Doctor-2-Pack-Compression-Shorts-with-Cup-and-Cup-Pocket.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-cup-shorts-diamond-mma",
    name: "Diamond MMA Compression Jock Short",
    description: "Compression jock shorts with built-in strap and athletic cup.",
    amountCents: 9999,
    category: "training",
    affiliateUrl: "https://amzn.to/4abVed9",
    imagePath:
      "/images/merch/Diamond-MMA-Compression-Jock-Short-with-Built-in-Jock-Strap-Athletic-Cup-Groin-Protection-System.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-jump-rope",
    name: "HUEY Sport Weighted Leather Jump Rope",
    description: "Weighted leather jump rope for speed and conditioning.",
    amountCents: 1899,
    category: "training",
    affiliateUrl: "https://amzn.to/4bLPNTq",
    imagePath:
      "/images/merch/HUEY-Sport-Weighted-1lb-Leather-Jump-Rope-Adjustable-Skipping-Rope-for-Speed-Quiet-Training-Boxing-MMA-Cardio-Crossfit-Fitness-Workout-Indoor-and-Outside-Exercise-for-Beginner-Kids-Men-and-Women.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-kettlebells",
    name: "bintiva Soft Kettlebells",
    description: "Soft kettlebell sets with color-coded weights.",
    amountCents: 12999,
    category: "training",
    affiliateUrl: "https://amzn.to/4tu3CME",
    imagePath:
      "/images/merch/bintiva-Soft-Kettlebells-Sea-and-Iron-Sand-Filled-Weights-for-Women-and-Men-Color-Coded-Kettle-Bell-Sets.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-kettlebells-cast-iron",
    name: "Professional Grade Cast Iron Kettlebell Set",
    description: "Cast iron kettlebell set for strength training.",
    amountCents: 31824,
    category: "training",
    affiliateUrl: "https://amzn.to/4cpwZJV",
    imagePath:
      "/images/merch/Kettlebell-Sets-Professional-Grade-Strength-Training-Kettlebells-for-Home-Workout-Cast-Iron-Kettle-Bell-Weight-Sets-for-Men-Women-with-Special-Protective-Bottom.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-defense-soap-wipes",
    name: "Defense Soap Body Wipes",
    description: "No-rinse wipes for post-training cleanup and travel.",
    amountCents: 2699,
    category: "recovery",
    affiliateUrl: "https://amzn.to/4kGGl6b",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-defense-soap-body-wash",
    name: "Defense Soap Tea Tree Body Wash",
    description: "Tea tree body wash for post-workout odor control and skin protection.",
    amountCents: 3329,
    category: "recovery",
    affiliateUrl: "https://amzn.to/46ASnbn",
    imagePath:
      "/images/merch/Defense-Soap-Tea-Tree-Body-Wash-All-Natural-Organic-Shower-Soap-for-Athletes-Odor-Control-Skin-Fungal-Protection-for-Sports-Post-Workout-Recovery-32oz.jpg",
    recommendedFor: ["bjj", "muay-thai", "boxing", "eskrima", "self-defense"],
  },
  {
    id: "amz-theragun",
    name: "Therabody Relief Massage Gun",
    description: "Lightweight percussion massager for daily recovery.",
    amountCents: 13999,
    category: "recovery",
    affiliateUrl: "https://amzn.to/4rMk9dk",
    imagePath:
      "/images/merch/TheraGun-Therabody-Relief-Handheld-Percussion-Massage-Gun-Easy-to-Use-Comfortable-Light-Personal-Massager-for-Every-Day-Pain-Relief-Massage-Therapy-in-Neck-Back-Leg-Shoulder-and-Body-Navy.jpg",
    recommendedFor: ["self-defense"],
  },
]

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const args = process.argv.slice(2)
const orgIdFlag = args.includes("--org-id") ? args[args.indexOf("--org-id") + 1] : null

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
    `\n🌱 Seeding ${tuffBuffsAffiliateGearProducts.length} TuffBuffs affiliate products as PricingPlan rows...\n`,
  )

  let created = 0
  let skipped = 0

  for (const product of tuffBuffsAffiliateGearProducts) {
    // Idempotent: skip if a row with this externalId already exists
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
        metadata: {
          externalId: product.id,
          description: product.description,
          category: product.category,
          affiliateUrl: product.affiliateUrl,
          imagePath: "imagePath" in product ? product.imagePath : null,
          recommendedFor: [...product.recommendedFor],
          source: "tuffbuffs-affiliate",
        },
      },
    })
    console.log(`   ✅ Created: ${product.name} ($${(product.amountCents / 100).toFixed(2)})`)
    created++
  }

  console.log(
    `\n🎉 Done! Created: ${created}, Skipped: ${skipped}, Total: ${tuffBuffsAffiliateGearProducts.length}`,
  )
}

main()
  .catch(e => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
