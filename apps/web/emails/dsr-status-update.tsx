import "dotenv/config"

import { Text } from "@react-email/components"
import type { DataSubjectRequestStatus, DataSubjectRequestType } from "~/.generated/prisma/client"
import {
  BblEmailWrapper as EmailWrapper,
  type BblEmailWrapperProps as EmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

const STATUS_LABEL: Record<DataSubjectRequestStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  FULFILLED: "Fulfilled",
  REJECTED: "Rejected",
}

const TYPE_LABEL: Record<DataSubjectRequestType, string> = {
  EXPORT: "data export",
  DELETE: "account deletion",
  RECTIFY: "data rectification",
}

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  requestId: string
  type: DataSubjectRequestType
  previousStatus: DataSubjectRequestStatus
  newStatus: DataSubjectRequestStatus
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
