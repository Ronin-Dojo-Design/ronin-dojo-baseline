import { after, type NextRequest, NextResponse } from "next/server"
import { notifyAdminOfPrintfulFailure, notifyCustomerOfShipment } from "~/lib/notifications"
import { db } from "~/services/db"
import { type PrintfulWebhookEvent, verifyWebhookSignature } from "~/services/printful"

// ---------------------------------------------------------------------------
// Printful Webhook Handler
// ---------------------------------------------------------------------------
// Receives fulfillment status updates from Printful:
//   - package_shipped  → update tracking info, notify customer
//   - order_failed     → mark order failed, notify admin
//   - package_returned → mark order returned, notify admin
//
// @see docs/architecture/printful-pod-spec.md — Fulfillment Webhook Flow
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.text()

  // Verify webhook signature if configured
  const signature = req.headers.get("x-printful-webhook-secret") ?? ""
  if (!verifyWebhookSignature(body, signature)) {
    console.error("❌ Printful webhook: invalid signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: PrintfulWebhookEvent
  try {
    event = JSON.parse(body) as PrintfulWebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  console.log(`📦 Printful webhook: ${event.type} (order ${event.data.order?.id})`)

  const externalId = event.data.order?.external_id
  if (!externalId) {
    console.warn("⚠️ Printful webhook: no external_id on order")
    return NextResponse.json({ received: true })
  }

  // Look up our MerchOrder by external_id (= our MerchOrder.id).
  //
  // BRAND SCOPING NOTE (SESSION_0121 TASK_04, SESSION_0119 FINDING_03):
  // This lookup is intentionally NOT brand-scoped. Printful webhooks are
  // server-to-server callbacks that don't carry brand context. The lookup key
  // is a cuid that we originally sent to Printful as `external_id` — Printful
  // can only know valid IDs we provided. Filtering by brand here would require
  // maintaining a brand→Printful-store mapping and is unnecessary given:
  //   1. cuid IDs are unguessable (122-bit entropy)
  //   2. Webhook signature verification gates entry to this handler
  //   3. Printful only sends webhooks for orders we created
  // Verified-acceptable per ADR 0004 cross-brand policy.
  const merchOrder = await db.merchOrder.findUnique({
    where: { id: externalId },
  })

  if (!merchOrder) {
    console.warn(`⚠️ Printful webhook: no MerchOrder found for external_id=${externalId}`)
    return NextResponse.json({ received: true })
  }

  console.log(
    `📦 Printful webhook: processing ${event.type} for MerchOrder ${merchOrder.id} (brand: ${merchOrder.brand})`,
  )

  switch (event.type) {
    case "package_shipped": {
      const shipment = event.data.shipment ?? event.data.order?.shipments?.[0]

      await db.merchOrder.update({
        where: { id: merchOrder.id },
        data: {
          fulfillmentStatus: "SHIPPED",
          trackingNumber: shipment?.tracking_number ?? null,
          trackingUrl: shipment?.tracking_url ?? null,
          carrier: shipment?.carrier ?? null,
          shippedAt: new Date(),
        },
      })

      console.log(
        `📬 MerchOrder ${merchOrder.id} → SHIPPED (tracking: ${shipment?.tracking_number ?? "none"})`,
      )

      // Notify customer in background
      after(async () => {
        await notifyCustomerOfShipment({
          customerEmail: merchOrder.customerEmail,
          customerName: merchOrder.customerName,
          trackingNumber: shipment?.tracking_number ?? null,
          trackingUrl: shipment?.tracking_url ?? null,
          carrier: shipment?.carrier ?? null,
        })
      })
      break
    }

    case "order_failed": {
      const reason = `Printful order ${event.data.order.id} failed`

      await db.merchOrder.update({
        where: { id: merchOrder.id },
        data: {
          fulfillmentStatus: "FAILED",
          failureReason: reason,
        },
      })

      console.error(`❌ MerchOrder ${merchOrder.id} → FAILED: ${reason}`)

      after(async () => {
        await notifyAdminOfPrintfulFailure({
          merchOrderId: merchOrder.id,
          customerEmail: merchOrder.customerEmail,
          reason,
        })
      })
      break
    }

    case "package_returned": {
      await db.merchOrder.update({
        where: { id: merchOrder.id },
        data: {
          fulfillmentStatus: "RETURNED",
        },
      })

      console.warn(`📦↩️ MerchOrder ${merchOrder.id} → RETURNED`)

      after(async () => {
        await notifyAdminOfPrintfulFailure({
          merchOrderId: merchOrder.id,
          customerEmail: merchOrder.customerEmail,
          reason: "Package returned to sender",
        })
      })
      break
    }

    default: {
      console.log(`ℹ️ Printful webhook: unhandled event type "${event.type}"`)
    }
  }

  return NextResponse.json({ received: true })
}
