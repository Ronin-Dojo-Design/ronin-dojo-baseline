import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailButton } from "~/emails/components/button"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  recipientName?: string | null
  personalMessage?: string | null
  joinUrl: string
}

export const EmailBblLiveTestInvite = ({
  recipientName,
  personalMessage,
  joinUrl,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props} preview="You're invited to run the first Black Belt Legacy claim test">
      <Text>Osss {recipientName?.trim() || "there"},</Text>

      <Text>
        You are invited to help with the first live Black Belt Legacy test run: receive the email,
        open the Join Legacy intake, and submit the claim/profile details a steward should review.
      </Text>

      {personalMessage ? <Text>{personalMessage}</Text> : null}

      <Text>
        The intake creates a private lead for review. If you select an existing lineage profile
        while signed in, it also creates a claim request. Nothing becomes verified or publicly owned
        until a steward approves it.
      </Text>

      <EmailButton href={joinUrl}>Start the live claim test</EmailButton>

      <Text>
        Reply to this email with any certificates, school references, or context that should be
        considered during review.
      </Text>
    </EmailWrapper>
  )
}

EmailBblLiveTestInvite.PreviewProps = {
  to: "tony@example.com",
  recipientName: "Tony",
  personalMessage: "Thank you for helping us test the live claim flow.",
  joinUrl: "https://blackbeltlegacy.com/lineage/join",
} satisfies EmailProps

export default EmailBblLiveTestInvite
