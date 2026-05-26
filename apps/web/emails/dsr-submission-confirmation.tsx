import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

const TYPE_LABEL: Record<DsrType, string> = {
  EXPORT: "data export",
  DELETE: "account deletion",
  RECTIFY: "data rectification",
}

type DsrType = "EXPORT" | "DELETE" | "RECTIFY"

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  requestId: string
  type: DsrType
  submittedAt: Date
}

export const EmailDsrSubmissionConfirmation = ({
  firstName,
  requestId,
  type,
  submittedAt,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props}>
      <Text>Hey {firstName?.trim() || "there"}!</Text>

      <Text>
        We've received your {TYPE_LABEL[type]} request and our team will review it shortly. You'll
        get another email when the status changes.
      </Text>

      <Text>
        <strong>Request ID:</strong> {requestId}
        <br />
        <strong>Type:</strong> {TYPE_LABEL[type]}
        <br />
        <strong>Submitted:</strong> {submittedAt.toUTCString()}
      </Text>

      <Text>
        Reply to this email if you need to add context or withdraw the request. Per GDPR, we aim to
        respond within 30 days.
      </Text>
    </EmailWrapper>
  )
}

EmailDsrSubmissionConfirmation.PreviewProps = {
  to: "user@example.com",
  firstName: "Alex",
  requestId: "clu123abc456",
  type: "EXPORT",
  submittedAt: new Date(),
} satisfies EmailProps

export default EmailDsrSubmissionConfirmation
