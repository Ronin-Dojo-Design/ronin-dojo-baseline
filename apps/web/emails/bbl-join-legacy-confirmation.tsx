import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailButton } from "~/emails/components/button"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  membershipPath: "FREE" | "PREMIUM" | "ELITE"
  checkoutUrl?: string | null
  claimCreated?: boolean
}

const membershipLabel: Record<EmailProps["membershipPath"], string> = {
  FREE: "free legacy profile",
  PREMIUM: "premium legacy profile",
  ELITE: "elite legacy profile",
}

export const EmailBblJoinLegacyConfirmation = ({
  firstName,
  membershipPath,
  checkoutUrl,
  claimCreated,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props} preview="We received your Black Belt Legacy lineage information">
      <Text>Hey {firstName?.trim() || "there"}!</Text>

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
        <EmailButton href={checkoutUrl}>Review premium listing options</EmailButton>
      )}
    </EmailWrapper>
  )
}

EmailBblJoinLegacyConfirmation.PreviewProps = {
  to: "member@example.com",
  firstName: "Alex",
  membershipPath: "PREMIUM",
  checkoutUrl: "https://blackbeltlegacy.com/submit/alex-legacy-profile",
  claimCreated: false,
} satisfies EmailProps

export default EmailBblJoinLegacyConfirmation
