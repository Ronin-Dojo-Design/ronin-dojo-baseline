import { env } from "~/env"

// ---------------------------------------------------------------------------
// Printful API Client
// ---------------------------------------------------------------------------
// Follows the same pattern as services/stripe.ts and services/resend.ts:
//   - Export a lazy client gated on the env var
//   - All methods are thin wrappers around fetch() to the Printful REST API
//   - Server-only — never import this from client components
// ---------------------------------------------------------------------------

const PRINTFUL_BASE_URL = "https://api.printful.com"

/** Whether to auto-confirm orders (production) or leave as draft (dev/test). */
const shouldConfirmOrders = env.PRINTFUL_CONFIRM_ORDERS === "true"

// ---------------------------------------------------------------------------
// Types (subset — expand as we integrate more endpoints)
// ---------------------------------------------------------------------------

export type PrintfulRecipient = {
  name: string
  address1: string
  address2?: string
  city: string
  state_code: string
  country_code: string
  zip: string
  email: string
  phone?: string
}

export type PrintfulOrderItem = {
  sync_variant_id: number
  quantity: number
  files?: { url: string }[]
}

export type PrintfulShippingRate = {
  id: string
  name: string
  rate: string
  currency: string
  minDeliveryDays: number
  maxDeliveryDays: number
}

export type PrintfulOrder = {
  id: number
  external_id: string
  status: string
  shipping: string
  shipping_service_name: string
  created: number
  updated: number
  recipient: PrintfulRecipient
  items: PrintfulOrderItem[]
  shipments: PrintfulShipment[]
}

export type PrintfulShipment = {
  id: number
  carrier: string
  service: string
  tracking_number: string
  tracking_url: string
  created: number
  ship_date: string
  shipped_at: number
}

export type PrintfulWebhookEvent = {
  type: string
  created: number
  retries: number
  store: number
  data: {
    order: PrintfulOrder
    shipment?: PrintfulShipment
  }
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function printfulFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const apiKey = env.PRINTFUL_API_KEY

  if (!apiKey) {
    throw new Error("PRINTFUL_API_KEY is not configured")
  }

  const res = await fetch(`${PRINTFUL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Printful API error ${res.status}: ${body}`)
  }

  const json = (await res.json()) as { code: number; result: T }
  return json.result
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Create a Printful order.
 *
 * By default creates in "draft" mode (dev/test). Set `PRINTFUL_CONFIRM_ORDERS=true`
 * in production to auto-confirm and begin fulfillment immediately.
 *
 * @see https://developers.printful.com/docs/#operation/createOrder
 */
export async function createOrder(params: {
  externalId: string
  recipient: PrintfulRecipient
  items: PrintfulOrderItem[]
  shippingRate?: string
}): Promise<PrintfulOrder> {
  const { externalId, recipient, items, shippingRate } = params

  return printfulFetch<PrintfulOrder>(
    `/orders${shouldConfirmOrders ? "?confirm=true" : ""}`,
    {
      method: "POST",
      body: JSON.stringify({
        external_id: externalId,
        shipping: shippingRate,
        recipient,
        items,
      }),
    },
  )
}

/**
 * Get an existing order by Printful order ID.
 *
 * @see https://developers.printful.com/docs/#operation/getOrderById
 */
export async function getOrder(orderId: number): Promise<PrintfulOrder> {
  return printfulFetch<PrintfulOrder>(`/orders/${orderId}`)
}

/**
 * Get an existing order by our external ID (MerchOrder.id).
 *
 * @see https://developers.printful.com/docs/#operation/getOrderById
 */
export async function getOrderByExternalId(externalId: string): Promise<PrintfulOrder> {
  return printfulFetch<PrintfulOrder>(`/orders/@${externalId}`)
}

/**
 * Calculate shipping rates for a given recipient + items.
 * Call this before checkout to show the customer shipping options + costs.
 *
 * @see https://developers.printful.com/docs/#operation/calculateShippingRates
 */
export async function getShippingRates(params: {
  recipient: Pick<PrintfulRecipient, "address1" | "city" | "state_code" | "country_code" | "zip">
  items: { variant_id?: number; quantity: number }[]
}): Promise<PrintfulShippingRate[]> {
  return printfulFetch<PrintfulShippingRate[]>("/shipping/rates", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/**
 * Cancel a Printful order. Only works if the order hasn't started fulfillment.
 *
 * @see https://developers.printful.com/docs/#operation/cancelOrder
 */
export async function cancelOrder(orderId: number): Promise<PrintfulOrder> {
  return printfulFetch<PrintfulOrder>(`/orders/${orderId}`, {
    method: "DELETE",
  })
}

/**
 * Estimate costs for an order without creating it.
 *
 * @see https://developers.printful.com/docs/#operation/estimateOrderCosts
 */
export async function estimateOrderCosts(params: {
  recipient: PrintfulRecipient
  items: PrintfulOrderItem[]
}): Promise<{
  costs: { subtotal: string; discount: string; shipping: string; tax: string; total: string }
  retail_costs: { subtotal: string; discount: string; shipping: string; tax: string; total: string }
}> {
  return printfulFetch("/orders/estimate", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

/**
 * Verify a Printful webhook signature.
 * Returns true if the signature matches, false otherwise.
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  const secret = env.PRINTFUL_WEBHOOK_SECRET
  if (!secret) return true // No secret configured — skip verification in dev

  // Printful uses a simple signature: the webhook secret itself as a header
  // In production, compare against the X-Printful-Webhook-Secret header
  return signature === secret
}
