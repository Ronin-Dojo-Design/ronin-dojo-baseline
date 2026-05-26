import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

const STATUS_LABEL: Record<DsrStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  FULFILLED: "Fulfilled",
  REJECTED: "Rejected",
}

const TYPE_LABEL: Record<DsrType, string> = {
  EXPORT: "data export",
  DELETE: "account deletion",
  RECTIFY: "data rectification",
}

type DsrStatus = "PENDING" | "IN_PROGRESS" | "FULFILLED" | "REJECTED"
type DsrType = "EXPORT" | "DELETE" | "RECTIFY"

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  requestId: string
  type: DsrType
  previousStatus: DsrStatus
  newStatus: DsrStatus
  notes?: string | null
}

export const EmailDsrStatusUpdate = ({
  firstName,
  requestId,
  type,
  previousStatus,
  newStatus,
  notes,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props}>
      <Text>Hey {firstName?.trim() || "there"}!</Text>

      <Text>
        Your {TYPE_LABEL[type]} request (<strong>{requestId}</strong>) has been updated.
      </Text>

      <Text>
        <strong>Status:</strong> {STATUS_LABEL[previousStatus]} → {STATUS_LABEL[newStatus]}
      </Text>

      {notes ? (
        <Text>
          <strong>Notes from our team:</strong>
          <br />
          {notes}
        </Text>
      ) : null}

      <Text>Reply to this email if you have any questions about this update.</Text>
    </EmailWrapper>
  )
}

EmailDsrStatusUpdate.PreviewProps = {
  to: "user@example.com",
  firstName: "Alex",
  requestId: "clu123abc456",
  type: "EXPORT",
  previousStatus: "PENDING",
  newStatus: "IN_PROGRESS",
  notes: "We're working on this and will get back to you soon.",
} satisfies EmailProps

export default EmailDsrStatusUpdate
