import "dotenv/config"

import { Column, Row, Section, Text } from "@react-email/components"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type MerchOrderEmailProps = EmailWrapperProps & {
  productName: string
  amountCents: number
  shippingCents: number
  totalCents: number
  size?: string | null
  color?: string | null
  shippingName?: string | null
  shippingLine1?: string | null
  shippingLine2?: string | null
  shippingCity?: string | null
  shippingState?: string | null
  shippingPostalCode?: string | null
}

export const EmailMerchOrderConfirmation = ({
  productName,
  amountCents,
  shippingCents,
  totalCents,
  size,
  color,
  shippingName,
  shippingLine1,
  shippingCity,
  shippingState,
  shippingPostalCode,
  shippingLine2,
  ...props
}: MerchOrderEmailProps) => {
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

  return (
    <EmailWrapper preview={`Your TuffBuffs order for ${productName} is confirmed!`} {...props}>
      <Text className="text-xl font-bold">Order Confirmed! 🎉</Text>

      <Text>
        Thank you for your purchase! Your TuffBuffs merch order has been received and is being
        prepared for shipping.
      </Text>

      <Section className="rounded-lg border border-solid border-gray-200 p-4 my-4">
        <Text className="text-sm font-bold m-0 mb-2">Order Summary</Text>

        <Row>
          <Column>
            <Text className="text-sm m-0">{productName}</Text>
          </Column>
          <Column align="right">
            <Text className="text-sm m-0 font-medium">{formatPrice(amountCents)}</Text>
          </Column>
        </Row>

        {(size || color) && (
          <Text className="text-xs text-gray-500 m-0 mt-1">
            {[size && `Size: ${size}`, color && `Color: ${color}`].filter(Boolean).join(" · ")}
          </Text>
        )}

        <Row className="mt-2">
          <Column>
            <Text className="text-sm m-0 text-gray-500">Shipping</Text>
          </Column>
          <Column align="right">
            <Text className="text-sm m-0 text-gray-500">{formatPrice(shippingCents)}</Text>
          </Column>
        </Row>

        <Row className="mt-2 border-t border-solid border-gray-200 pt-2">
          <Column>
            <Text className="text-sm font-bold m-0">Total</Text>
          </Column>
          <Column align="right">
            <Text className="text-sm font-bold m-0">{formatPrice(totalCents)}</Text>
          </Column>
        </Row>
      </Section>

      {shippingLine1 && (
        <Section className="rounded-lg border border-solid border-gray-200 p-4 my-4">
          <Text className="text-sm font-bold m-0 mb-2">Shipping To</Text>
          {shippingName && <Text className="text-sm m-0">{shippingName}</Text>}
          <Text className="text-sm m-0 text-gray-500">
            {shippingLine1}
            {shippingLine2 && <br />}
            {shippingLine2}
            <br />
            {shippingCity}, {shippingState} {shippingPostalCode}
          </Text>
          <Text className="text-xs m-0 mt-2 text-gray-400">
            Estimated delivery: 5–10 business days
          </Text>
        </Section>
      )}

      <Text className="text-sm text-gray-500">
        You can view your order details in your Stripe receipt. If you have any questions about your
        order, please reply to this email.
      </Text>
    </EmailWrapper>
  )
}

export default EmailMerchOrderConfirmation
