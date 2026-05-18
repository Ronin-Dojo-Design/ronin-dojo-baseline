import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  firstName: string
  organizationName: string
}

export const EmailLeadCaptureConfirmation = ({
  firstName,
  organizationName,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props}>
      <Text>Hey {firstName}!</Text>

      <Text>
        Thanks for your interest in <strong>{organizationName}</strong>. We've received your
        information and a member of our team will reach out shortly to help get you started.
      </Text>

      <Text>In the meantime, if you have any questions, feel free to reply to this email.</Text>

      <Text>See you on the mat! 🥋</Text>
    </EmailWrapper>
  )
}

EmailLeadCaptureConfirmation.PreviewProps = {
  to: "prospect@example.com",
  firstName: "Alex",
  organizationName: "Baseline Martial Arts",
} satisfies EmailProps

export default EmailLeadCaptureConfirmation
