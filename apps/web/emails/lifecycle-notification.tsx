import "dotenv/config"

import { Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

export type LifecycleLineItem = { label: string; value: string }

export type LifecycleNotificationProps = BblEmailWrapperProps & {
  firstName?: string | null
  eyebrow?: string
  heading: string
  intro: string
  details?: LifecycleLineItem[]
  features?: string[]
  ctaLabel?: string
  ctaUrl?: string
  secondaryNote?: string
}

export const EmailLifecycleNotification = ({
  firstName,
  eyebrow,
  heading,
  intro,
  details = [],
  features = [],
  ctaLabel,
  ctaUrl,
  secondaryNote,
  ...props
}: LifecycleNotificationProps) => {
  return (
    <BblEmailWrapper {...props} preview={heading}>
      {eyebrow && (
        <Text className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
          {eyebrow}
        </Text>
      )}
      <BblEmailHeading>{heading}</BblEmailHeading>
      <Text className="mt-0">Hey {firstName?.trim() || "there"},</Text>
      <Text>{intro}</Text>

      {details.length > 0 && (
        <Section className="my-2 rounded-lg border border-solid border-neutral-200 bg-neutral-50 px-5 py-4">
          {details.map(detail => (
            <Text key={detail.label} className="my-1 text-[14px] text-neutral-800">
              <strong>{detail.label}:</strong> {detail.value}
            </Text>
          ))}
        </Section>
      )}

      {features.length > 0 && (
        <Section className="my-2 rounded-lg border border-solid border-red-100 bg-red-50 px-5 py-4">
          <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
            What this tier includes
          </Text>
          {features.map(feature => (
            <Text key={feature} className="mb-0 mt-2 text-[14px] text-neutral-800">
              • {feature}
            </Text>
          ))}
        </Section>
      )}

      {ctaLabel && ctaUrl && <BblEmailButton href={ctaUrl}>{ctaLabel}</BblEmailButton>}

      {secondaryNote && <Text className="text-[13px] text-neutral-500">{secondaryNote}</Text>}
    </BblEmailWrapper>
  )
}

EmailLifecycleNotification.PreviewProps = {
  to: "member@example.com",
  firstName: "Chris",
  eyebrow: "Membership update",
  heading: "Your Premium membership is active",
  intro: "Thanks for supporting Black Belt Legacy. Your lineage profile has been upgraded.",
  details: [
    { label: "Tier", value: "Premium" },
    { label: "Amount", value: "$99.00 USD" },
  ],
  features: [
    "A full profile: your photo, school, bio, rank history, and social links.",
    "Your place on the lineage tree, connected to your students and instructors.",
    "A shareable profile link and QR code.",
  ],
  ctaLabel: "View your profile",
  ctaUrl: "https://blackbeltlegacy.com/me",
} satisfies LifecycleNotificationProps

export default EmailLifecycleNotification
