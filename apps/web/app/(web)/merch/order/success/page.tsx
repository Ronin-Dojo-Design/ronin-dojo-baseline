import type { Metadata } from "next"
import type Stripe from "stripe"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { findMerchProductById } from "~/server/web/merch/queries"
import { stripe } from "~/services/stripe"

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you for your TuffBuffs merch order.",
}

type Props = {
  searchParams: Promise<{ sessionId?: string }>
}

export default async function MerchOrderSuccessPage({ searchParams }: Props) {
  const { sessionId } = await searchParams

  if (!sessionId) {
    return (
      <Wrapper gap="lg">
        <Intro>
          <IntroTitle>Order Not Found</IntroTitle>
          <IntroDescription>
            We couldn't find your order. Please check your email for confirmation.
          </IntroDescription>
          <Link href="/merch">
            <Button variant="primary">Back to Merch Store</Button>
          </Link>
        </Intro>
      </Wrapper>
    )
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    })
  } catch {
    return (
      <Wrapper gap="lg">
        <Intro>
          <IntroTitle>Order Not Found</IntroTitle>
          <IntroDescription>
            We couldn't retrieve your order details. Please check your email for confirmation.
          </IntroDescription>
          <Link href="/merch">
            <Button variant="primary">Back to Merch Store</Button>
          </Link>
        </Intro>
      </Wrapper>
    )
  }

  const shippingDetails = (session as any).shipping_details as {
    name?: string | null
    address?: {
      line1?: string | null
      line2?: string | null
      city?: string | null
      state?: string | null
      postal_code?: string | null
    } | null
  } | null
  const lineItems = session.line_items?.data ?? []
  const totalCents = session.amount_total ?? 0

  // Resolve friendly product name from DB if available
  const pricingPlanId = session.metadata?.pricingPlanId
  const dbProduct = pricingPlanId ? await findMerchProductById(pricingPlanId) : null

  return (
    <Wrapper gap="lg">
      <Intro className="max-w-2xl">
        <Stack size="sm">
          <Badge variant="success">Order Confirmed</Badge>
        </Stack>
        <IntroTitle>Thank you for your order!</IntroTitle>
        <IntroDescription>
          Your TuffBuffs merch is on its way. You'll receive a confirmation email shortly.
        </IntroDescription>
      </Intro>

      <div className="mx-auto grid max-w-2xl gap-6">
        {/* Order summary */}
        <Card className="space-y-4 p-6">
          <H3>Order Summary</H3>
          <div className="divide-y">
            {lineItems.map((item, index) => {
              // Prefer DB product name → Stripe product name → line item description
              const stripeProduct = item.price?.product
              const stripeProductName =
                typeof stripeProduct === "object" && stripeProduct && "name" in stripeProduct
                  ? (stripeProduct as { name: string }).name
                  : null
              const displayName =
                (index === 0 && dbProduct?.name) || stripeProductName || item.description || "Item"
              return (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    {displayName}
                    {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </span>
                  <span className="shrink-0 font-medium">
                    ${((item.amount_total ?? 0) / 100).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>${(totalCents / 100).toFixed(2)}</span>
          </div>

          {/* Size/color from metadata */}
          {(session.metadata?.size || session.metadata?.color) && (
            <Stack size="sm" className="pt-2">
              {session.metadata?.size && (
                <Badge variant="outline">Size: {session.metadata.size}</Badge>
              )}
              {session.metadata?.color && (
                <Badge variant="outline">Color: {session.metadata.color}</Badge>
              )}
            </Stack>
          )}
        </Card>

        {/* Shipping info */}
        {shippingDetails?.address && (
          <Card className="space-y-3 p-6">
            <H3>Shipping To</H3>
            <div className="text-sm text-secondary-foreground">
              {shippingDetails.name && (
                <p className="font-medium text-foreground">{shippingDetails.name}</p>
              )}
              <p>{shippingDetails.address.line1}</p>
              {shippingDetails.address.line2 && <p>{shippingDetails.address.line2}</p>}
              <p>
                {shippingDetails.address.city}, {shippingDetails.address.state}{" "}
                {shippingDetails.address.postal_code}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Estimated delivery: 5–10 business days</p>
          </Card>
        )}

        <Link href="/merch" className="mx-auto">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    </Wrapper>
  )
}
