import { notFound } from "next/navigation"
import { OrderStatusBadge } from "~/app/admin/merch/orders/_components/order-status-badge"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { getRequestBrand } from "~/lib/brand-context"
import { findMerchOrderById } from "~/server/web/merch/queries"

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100)
}

type LineItem = {
  name?: string
  size?: string
  color?: string
  quantity?: number
  printfulVariantId?: number
}

export default withAdminPage(async ({ params }: PageProps<"/admin/merch/orders/[id]">) => {
  const { id } = await params
  const brand = await getRequestBrand()
  const order = await findMerchOrderById(id, brand)

  if (!order) {
    notFound()
  }

  const lineItems = Array.isArray(order.lineItems) ? (order.lineItems as LineItem[]) : []

  return (
    <Stack size="lg" direction="column">
      {/* Header */}
      <Stack size="md" direction="row" className="items-center justify-between">
        <Stack size="sm" direction="row" className="items-center">
          <H3>Order {order.id.slice(-8).toUpperCase()}</H3>
          <OrderStatusBadge status={order.fulfillmentStatus} />
        </Stack>
        <Button variant="secondary" size="sm" render={<Link href="/admin/merch/orders" />}>
          ← Back to orders
        </Button>
      </Stack>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <H3>Customer</H3>
          </CardHeader>
          <Stack size="sm" direction="column" className="p-6 pt-0">
            <div>
              <Note>Name</Note>
              <div>{order.customerName ?? "—"}</div>
            </div>
            <div>
              <Note>Email</Note>
              <div>{order.customerEmail}</div>
            </div>
          </Stack>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <H3>Payment</H3>
          </CardHeader>
          <Stack size="sm" direction="column" className="p-6 pt-0">
            <div>
              <Note>Subtotal</Note>
              <div>{formatCents(order.amountCents, order.currency)}</div>
            </div>
            <div>
              <Note>Shipping</Note>
              <div>{formatCents(order.shippingCents, order.currency)}</div>
            </div>
            <div>
              <Note>Total</Note>
              <div className="font-semibold">{formatCents(order.totalCents, order.currency)}</div>
            </div>
            {order.stripePaymentIntentId && (
              <div>
                <Note>Stripe Payment Intent</Note>
                <div className="font-mono text-xs">{order.stripePaymentIntentId}</div>
              </div>
            )}
          </Stack>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <H3>Shipping Address</H3>
          </CardHeader>
          <Stack size="sm" direction="column" className="p-6 pt-0">
            {order.shippingName && <div>{order.shippingName}</div>}
            {order.shippingAddress1 && <div>{order.shippingAddress1}</div>}
            {order.shippingAddress2 && <div>{order.shippingAddress2}</div>}
            <div>
              {[order.shippingCity, order.shippingState, order.shippingPostalCode]
                .filter(Boolean)
                .join(", ")}
            </div>
            {order.shippingCountryCode && <div>{order.shippingCountryCode}</div>}
          </Stack>
        </Card>

        {/* Fulfillment / Printful */}
        <Card>
          <CardHeader>
            <H3>Fulfillment</H3>
          </CardHeader>
          <Stack size="sm" direction="column" className="p-6 pt-0">
            {order.printfulOrderId && (
              <div>
                <Note>Printful Order ID</Note>
                <div>{order.printfulOrderId}</div>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <Note>Tracking</Note>
                <div>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      {order.trackingNumber}
                    </a>
                  ) : (
                    order.trackingNumber
                  )}
                  {order.carrier && (
                    <Badge variant="soft" className="ml-2">
                      {order.carrier}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {order.shippedAt && (
              <div>
                <Note>Shipped</Note>
                <div>{new Date(order.shippedAt).toLocaleDateString()}</div>
              </div>
            )}
            {order.deliveredAt && (
              <div>
                <Note>Delivered</Note>
                <div>{new Date(order.deliveredAt).toLocaleDateString()}</div>
              </div>
            )}
            {order.failureReason && (
              <div>
                <Note>Failure Reason</Note>
                <div className="text-red-600">{order.failureReason}</div>
              </div>
            )}
          </Stack>
        </Card>
      </div>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <H3>Line Items</H3>
            <CardDescription>{lineItems.length} item(s)</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Stack size="sm" direction="column">
              {lineItems.map((item, i) => (
                <Stack
                  key={i}
                  size="sm"
                  direction="row"
                  className="items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <div className="font-medium">{item.name ?? "Unknown product"}</div>
                    <Note>
                      {[item.size, item.color].filter(Boolean).join(" / ")}
                      {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ""}
                    </Note>
                  </div>
                </Stack>
              ))}
            </Stack>
          </div>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <H3>Timestamps</H3>
        </CardHeader>
        <Stack size="sm" direction="row" className="p-6 pt-0">
          <div>
            <Note>Created</Note>
            <div>{new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <Note>Updated</Note>
            <div>{new Date(order.updatedAt).toLocaleString()}</div>
          </div>
        </Stack>
      </Card>
    </Stack>
  )
})
