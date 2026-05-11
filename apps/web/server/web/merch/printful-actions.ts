"use server"

import { db } from "~/services/db"
import { createOrder, type PrintfulRecipient, type PrintfulOrderItem } from "~/services/printful"

// ---------------------------------------------------------------------------
// Printful Variant Mapping
// ---------------------------------------------------------------------------
// Maps merch product IDs (from seed-tuffbuffs-merch.ts) to Printful catalog
// variant IDs. Each size/color combo maps to a different Printful variant.
//
// TODO(Brian): Populate with actual Printful catalog variant IDs.
// Use `GET https://api.printful.com/products/{product_id}/variants` to find
// the variant_id for each size/color combo.
//
// Example: Bella+Canvas 3001 (Unisex Short Sleeve Jersey Tee)
//   Product ID: 71
//   Variant for Black/L: 4012
//   Full list: curl -s 'https://api.printful.com/products/71' \
//     --header 'Authorization: Bearer $PRINTFUL_API_KEY' | python3 -m json.tool
//
// @see docs/architecture/printful-pod-spec.md — Product Mapping section
// @see docs/runbooks/printful-setup-runbook.md
// ---------------------------------------------------------------------------

/**
 * Printful catalog variant lookup.
 *
 * Structure: merchProductId → size → color → printful variant_id
 * If a product doesn't have size/color variants, use "*" as the key.
 */
const PRINTFUL_VARIANT_MAP: Record<string, Record<string, Record<string, number>>> = {
  // ──────────────────────────────────────────────────────────────
  // Cotton T-Shirts — Bella+Canvas 3001 (Printful product 71)
  // ──────────────────────────────────────────────────────────────
  "tb-tshirt-classic-black": {
    "S":   { "Black": 4016, "Gold": 4081 },
    "M":   { "Black": 4017, "Gold": 4082 },
    "L":   { "Black": 4018, "Gold": 4083 },
    "XL":  { "Black": 4019, "Gold": 4084 },
    "2XL": { "Black": 4020, "Gold": 4085 },
  },
  "tb-tshirt-muaythai": {
    "S":   { "Black": 4016, "Red": 4141 },
    "M":   { "Black": 4017, "Red": 4142 },
    "L":   { "Black": 4018, "Red": 4143 },
    "XL":  { "Black": 4019, "Red": 4144 },
    "2XL": { "Black": 4020, "Red": 4145 },
  },
  "tb-tshirt-boxing": {
    "S":   { "Black": 4016, "Gold": 4081 },
    "M":   { "Black": 4017, "Gold": 4082 },
    "L":   { "Black": 4018, "Gold": 4083 },
    "XL":  { "Black": 4019, "Gold": 4084 },
    "2XL": { "Black": 4020, "Gold": 4085 },
  },
  "tb-tshirt-eskrima": {
    "S":   { "Black": 4016, "Green": 17203 },
    "M":   { "Black": 4017, "Green": 17204 },
    "L":   { "Black": 4018, "Green": 17205 },
    "XL":  { "Black": 4019, "Green": 17206 },
    "2XL": { "Black": 4020, "Green": 17209 },
  },

  // ──────────────────────────────────────────────────────────────
  // Athletic/Performance T-Shirts — A4 N3142 (Printful product 679)
  // Moisture-wicking material
  // ──────────────────────────────────────────────────────────────
  "tb-athletic-tshirt-men": {
    "S":   { "Black": 17004, "White": 17053 },
    "M":   { "Black": 17005, "White": 17054 },
    "L":   { "Black": 17006, "White": 17055 },
    "XL":  { "Black": 17007, "White": 17056 },
    "2XL": { "Black": 17008, "White": 17057 },
  },
  "tb-athletic-tshirt-womens": {
    "S":   { "Black": 17004, "White": 17053 },
    "M":   { "Black": 17005, "White": 17054 },
    "L":   { "Black": 17006, "White": 17055 },
    "XL":  { "Black": 17007, "White": 17056 },
    "2XL": { "Black": 17008, "White": 17057 },
  },

  // ──────────────────────────────────────────────────────────────
  // Hoodies — Bella+Canvas 3719 (Printful product 294)
  // ──────────────────────────────────────────────────────────────
  "tb-hoodie-womens": {
    "S":   { "Black": 9227 },
    "M":   { "Black": 9228 },
    "L":   { "Black": 9229 },
    "XL":  { "Black": 9230 },
    "2XL": { "Black": 9231 },
  },
  "tb-hoodie-mens": {
    "S":   { "Black": 9227 },
    "M":   { "Black": 9228 },
    "L":   { "Black": 9229 },
    "XL":  { "Black": 9230 },
    "2XL": { "Black": 9231 },
  },

  // ──────────────────────────────────────────────────────────────
  // Rash Guards — All-Over Print Men's Rash Guard (Printful product 301)
  // Note: Printful rash guards are all-over-print (CUT-SEW).
  // The color/design is in the print file, not the base variant.
  // All variants use the White base; design applied via print files.
  // ──────────────────────────────────────────────────────────────
  "tb-long-sleeve-rash-guard": {
    "S":   { "Black": 9327, "Gold": 9327 },
    "M":   { "Black": 9328, "Gold": 9328 },
    "L":   { "Black": 9329, "Gold": 9329 },
    "XL":  { "Black": 9330, "Gold": 9330 },
    "2XL": { "Black": 9331, "Gold": 9331 },
  },
  "tb-rg-ranked-white": {
    "S":   { "White": 9327 },
    "M":   { "White": 9328 },
    "L":   { "White": 9329 },
    "XL":  { "White": 9330 },
    "2XL": { "White": 9331 },
  },
  "tb-rg-ranked-black": {
    "S":   { "Black": 9327 },
    "M":   { "Black": 9328 },
    "L":   { "Black": 9329 },
    "XL":  { "Black": 9330 },
    "2XL": { "Black": 9331 },
  },
  "tb-rg-nogi": {
    "S":   { "Black/Gold": 9327 },
    "M":   { "Black/Gold": 9328 },
    "L":   { "Black/Gold": 9329 },
    "XL":  { "Black/Gold": 9330 },
    "2XL": { "Black/Gold": 9331 },
  },
  "tb-rg-shortsleeve": {
    "S":   { "Black": 9327, "Gold": 9327 },
    "M":   { "Black": 9328, "Gold": 9328 },
    "L":   { "Black": 9329, "Gold": 9329 },
    "XL":  { "Black": 9330, "Gold": 9330 },
    "2XL": { "Black": 9331, "Gold": 9331 },
  },

  // ──────────────────────────────────────────────────────────────
  // NOT PRINTFUL-FULFILLABLE (gear + accessories)
  // These are physical inventory items, not print-on-demand:
  //   tb-gloves-boxing, tb-gloves-mma, tb-shinpads, tb-headgear,
  //   tb-eskrima-sticks, tb-padded-sticks, tb-bag-gym, tb-tote-bag,
  //   tb-mouthguard, tb-handwraps, tb-waterbottle
  // ──────────────────────────────────────────────────────────────
}

/**
 * Look up the Printful catalog variant_id for a merch product + size + color.
 * Returns undefined if not mapped yet.
 */
export function getPrintfulVariantId(
  merchProductId: string,
  size?: string | null,
  color?: string | null,
): number | undefined {
  const sizeMap = PRINTFUL_VARIANT_MAP[merchProductId]
  if (!sizeMap) return undefined

  const sizeKey = size ?? "*"
  const colorMap = sizeMap[sizeKey]
  if (!colorMap) return undefined

  const colorKey = color ?? "*"
  return colorMap[colorKey]
}

// ---------------------------------------------------------------------------
// createPrintfulOrder — called from Stripe webhook after merch_purchase
// ---------------------------------------------------------------------------

type CreatePrintfulOrderParams = {
  /** Our MerchOrder record ID (used as Printful external_id) */
  merchOrderId: string
  /** Customer shipping details from Stripe checkout session */
  recipient: {
    name: string
    email: string
    address1: string
    address2?: string | null
    city: string
    state: string
    postalCode: string
    countryCode: string
    phone?: string | null
  }
  /** Line items to fulfill */
  items: {
    merchProductId: string
    size?: string | null
    color?: string | null
    quantity: number
    /** Optional print file URL from S3 */
    printFileUrl?: string
  }[]
}

/**
 * Create a Printful order for a paid merch purchase.
 *
 * Called from the Stripe webhook merch_purchase handler via `after()`.
 * Updates the MerchOrder record with Printful order ID and status.
 *
 * @see docs/architecture/printful-pod-spec.md — Order Creation Flow
 * @see apps/web/app/api/stripe/webhooks/route.ts — merch_purchase handler
 */
export async function createPrintfulOrder(params: CreatePrintfulOrderParams): Promise<void> {
  const { merchOrderId, recipient, items } = params

  // Build Printful recipient
  const printfulRecipient: PrintfulRecipient = {
    name: recipient.name,
    email: recipient.email,
    address1: recipient.address1,
    address2: recipient.address2 ?? undefined,
    city: recipient.city,
    state_code: recipient.state,
    country_code: recipient.countryCode,
    zip: recipient.postalCode,
    phone: recipient.phone ?? undefined,
  }

  // Build Printful items — resolve variant IDs from mapping
  const printfulItems: PrintfulOrderItem[] = []
  const unmappedItems: string[] = []

  for (const item of items) {
    const variantId = getPrintfulVariantId(item.merchProductId, item.size, item.color)

    if (!variantId) {
      unmappedItems.push(
        `${item.merchProductId} (size=${item.size ?? "n/a"}, color=${item.color ?? "n/a"})`,
      )
      continue
    }

    const printfulItem: PrintfulOrderItem = {
      sync_variant_id: variantId,
      quantity: item.quantity,
    }

    // Attach print file if provided
    if (item.printFileUrl) {
      printfulItem.files = [{ url: item.printFileUrl }]
    }

    printfulItems.push(printfulItem)
  }

  // If any items couldn't be mapped, log and mark order as failed
  if (unmappedItems.length > 0) {
    const reason = `Unmapped Printful variants: ${unmappedItems.join(", ")}`
    console.error(`❌ Printful order ${merchOrderId}: ${reason}`)

    await db.merchOrder.update({
      where: { id: merchOrderId },
      data: {
        fulfillmentStatus: "FAILED",
        failureReason: reason,
      },
    })
    return
  }

  if (printfulItems.length === 0) {
    console.warn(`⚠️ Printful order ${merchOrderId}: No items to fulfill`)
    return
  }

  try {
    const printfulOrder = await createOrder({
      externalId: merchOrderId,
      recipient: printfulRecipient,
      items: printfulItems,
    })

    // Update MerchOrder with Printful details
    await db.merchOrder.update({
      where: { id: merchOrderId },
      data: {
        printfulOrderId: printfulOrder.id,
        printfulExternalId: merchOrderId,
        fulfillmentStatus: "SUBMITTED",
      },
    })

    console.log(
      `🖨️ Printful order created: merchOrder=${merchOrderId} printfulId=${printfulOrder.id} status=${printfulOrder.status}`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ Printful order failed: merchOrder=${merchOrderId} error=${message}`)

    await db.merchOrder.update({
      where: { id: merchOrderId },
      data: {
        fulfillmentStatus: "FAILED",
        failureReason: `Printful API error: ${message}`,
      },
    })
  }
}
