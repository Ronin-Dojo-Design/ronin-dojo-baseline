import "dotenv/config"

import { Text } from "@react-email/components"
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
  return (
    <BblEmailWrapper {...props} preview="We received your Black Belt Legacy lineage information">
      <BblEmailHeading>Welcome to the legacy</BblEmailHeading>

      <Text className="mt-0">Hey {firstName?.trim() || "there"}!</Text>

      <Text>
        Thanks for joining Black Belt Legacy. We received your lineage information and created a{" "}
        <strong>{membershipLabel[membershipPath]}</strong> intake record for review.
      </Text>

      {claimCreated ? (
        <Text>
          Your profile claim was also submitted for admin review. A steward will check the details
          before any public profile ownership or lineage edit rights are granted.
        </Text>
      ) : (
        <Text>
          If you are claiming an existing profile, sign in and submit a profile claim so we can
          connect your account to the right lineage node.
        </Text>
      )}

      <Text>
        You can reply to this email with rank certificates, training photos, instructor references,
        or any context that helps verify your lineage.
      </Text>

      {checkoutUrl && membershipPath !== "FREE" && (
        <BblEmailButton href={checkoutUrl}>Review lineage membership options</BblEmailButton>
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
