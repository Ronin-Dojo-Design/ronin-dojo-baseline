import "dotenv/config"

import { Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

type EmailProps = BblEmailWrapperProps & {
  firstName?: string | null
  membershipPath: "FREE" | "PREMIUM" | "ELITE"
  checkoutUrl?: string | null
  claimCreated?: boolean
}

const membershipLabel: Record<EmailProps["membershipPath"], string> = {
  FREE: "free legacy profile",
  PREMIUM: "premium lineage membership",
  ELITE: "elite lineage membership",
}

export const EmailBblJoinLegacyConfirmation = ({
  firstName,
  membershipPath,
  checkoutUrl,
  claimCreated,
  ...props
}: EmailProps) => {
  const isPaid = membershipPath !== "FREE"

  return (
    <BblEmailWrapper {...props} preview="We got it — your lineage information is safe with us">
      <BblEmailHeading>We&apos;ve got your lineage information</BblEmailHeading>

      <Text className="mt-0">Hey {firstName?.trim() || "there"}!</Text>

      <Text>
        Your intake is confirmed. The lineage details you shared — your rank history, your
        instructor, and everything else you submitted — are <strong>safe with us</strong> and have
        been recorded as a <strong>{membershipLabel[membershipPath]}</strong> application.
      </Text>

      <Section className="my-4 rounded-lg border border-solid border-neutral-200 bg-neutral-50 px-5 py-4">
        <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
          What happens next
        </Text>
        {claimCreated ? (
          <Text className="mb-0 mt-3 text-[13px] leading-7 text-neutral-800">
            <strong>1.</strong> A steward reviews your profile claim and lineage details — usually
            within a few days.
            <br />
            <strong>2.</strong> Once approved, your profile will be publicly linked to your lineage
            node and you&apos;ll be notified.
            {isPaid && (
              <>
                <br />
                <strong>3.</strong> Complete your membership below to unlock your full profile and
                all lineage features.
              </>
            )}
          </Text>
        ) : (
          <Text className="mb-0 mt-3 text-[13px] leading-7 text-neutral-800">
            <strong>1.</strong> A steward reviews your lineage information — usually within a few
            days.
            <br />
            <strong>2.</strong> If you want to claim an existing profile, sign in and submit a
            profile claim so we can connect your account to the right lineage node.
            {isPaid && (
              <>
                <br />
                <strong>3.</strong> Complete your membership below to unlock your full profile and
                all lineage features.
              </>
            )}
          </Text>
        )}
      </Section>

      <Text>
        You can reply to this email with rank certificates, training photos, instructor references,
        or any context that helps verify your lineage. We read every one.
      </Text>

      {checkoutUrl && isPaid && (
        <BblEmailButton href={checkoutUrl}>Complete your lineage membership</BblEmailButton>
      )}
    </BblEmailWrapper>
  )
}

EmailBblJoinLegacyConfirmation.PreviewProps = {
  to: "member@example.com",
  firstName: "Alex",
  membershipPath: "PREMIUM",
  checkoutUrl: "https://blackbeltlegacy.com/lineage/join?submitted=true#lineage-membership",
  claimCreated: false,
} satisfies EmailProps

export default EmailBblJoinLegacyConfirmation
