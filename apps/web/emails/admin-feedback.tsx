import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailButton } from "~/emails/components/button"
import {
  BblEmailWrapper as EmailWrapper,
  type BblEmailWrapperProps as EmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

type EmailProps = EmailWrapperProps & {
  /** The submitter's email (also wired as Reply-To so the operator can respond directly). */
  fromEmail: string
  message: string
  siteName: string
  adminReportsUrl: string
}

export const EmailAdminFeedback = ({
  fromEmail,
  message,
  siteName,
  adminReportsUrl,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props} preview={`New ${siteName} feedback from ${fromEmail}`}>
      <Text>Hi!</Text>

      <Text>
        Someone just left feedback through the {siteName} site widget. Reply to this email to
        respond to them directly.
      </Text>

      <Text>From: {fromEmail}</Text>
      <Text>
        <strong>Message:</strong>
        <br />
        {message}
      </Text>

      <EmailButton href={adminReportsUrl}>View in admin reports</EmailButton>
    </EmailWrapper>
  )
}

EmailAdminFeedback.PreviewProps = {
  to: "welcome@blackbeltlegacy.com",
  fromEmail: "member@example.com",
  message: "Love the new lineage tree — could you add a way to filter by discipline?",
  siteName: "Black Belt Legacy",
  adminReportsUrl: "https://blackbeltlegacy.com/reports",
} satisfies EmailProps

export default EmailAdminFeedback
