import "dotenv/config"

import { Button, Section, Text } from "@react-email/components"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type MerchShipmentEmailProps = EmailWrapperProps & {
  customerName?: string | null
  trackingNumber?: string | null
  trackingUrl?: string | null
  carrier?: string | null
}

export const EmailMerchShipmentNotification = ({
  customerName,
  trackingNumber,
  trackingUrl,
  carrier,
  ...props
}: MerchShipmentEmailProps) => {
  const greeting = customerName ? `Hey ${customerName}` : "Hey there"

  return (
    <EmailWrapper preview="Your TuffBuffs order has shipped! 📦" {...props}>
      <Text className="text-xl font-bold">Your order has shipped! 📦</Text>

      <Text>
        {greeting}, great news — your TuffBuffs merch is on its way!
      </Text>

      {(trackingNumber || carrier) && (
        <Section className="rounded-lg border border-solid border-gray-200 p-4 my-4">
          <Text className="text-sm font-bold m-0 mb-2">Shipping Details</Text>

          {carrier && (
            <Text className="text-sm m-0">
              <strong>Carrier:</strong> {carrier}
            </Text>
          )}

          {trackingNumber && (
            <Text className="text-sm m-0">
              <strong>Tracking:</strong> {trackingNumber}
            </Text>
          )}

          {trackingUrl && (
            <Button
              href={trackingUrl}
              className="bg-black text-white text-sm font-medium rounded-md px-4 py-2 mt-3"
            >
              Track Your Package →
            </Button>
          )}
        </Section>
      )}

      <Text className="text-sm text-gray-500">
        Delivery times vary by location. Most orders arrive within 5–12 business days.
      </Text>

      <Text className="text-sm text-gray-500">
        Questions? Reply to this email and we'll help you out.
      </Text>
    </EmailWrapper>
  )
}

export default EmailMerchShipmentNotification
