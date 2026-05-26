/**
 * @added   SESSION_0258 (2026-05-25)
 * @why     Email sent when an admin transitions a member's status (PENDING→ACTIVE,
 *          ACTIVE→SUSPENDED, etc.) via the admin memberships UI.
 * @wired   server/admin/memberships/actions.ts (transitionMembershipStatus)
 */
import "dotenv/config"

import { Text } from "@react-email/components"
import type { MembershipStatus } from "~/.generated/prisma/client"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

const STATUS_LABEL: Record<MembershipStatus, string> = {
  INVITED: "Invited",
  PENDING: "Pending",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
}

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  organizationName: string
  disciplineName: string
  previousStatus: MembershipStatus
  newStatus: MembershipStatus
}

export const EmailMembershipStatusChange = ({
  firstName,
  organizationName,
  disciplineName,
  previousStatus,
  newStatus,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper
      {...props}
      preview={`Your membership at ${organizationName} is now ${STATUS_LABEL[newStatus]}`}
    >
      <Text>Hey {firstName?.trim() || "there"}!</Text>

      <Text>
        Your <strong>{disciplineName}</strong> membership at <strong>{organizationName}</strong> has
        been updated.
      </Text>

      <Text>
        <strong>Status:</strong> {STATUS_LABEL[previousStatus]} → {STATUS_LABEL[newStatus]}
      </Text>

      <Text>Reply to this email if you have any questions about this update.</Text>
    </EmailWrapper>
  )
}

EmailMembershipStatusChange.PreviewProps = {
  to: "member@example.com",
  firstName: "Alex",
  organizationName: "Baseline Martial Arts",
  disciplineName: "Brazilian Jiu-Jitsu",
  previousStatus: "PENDING",
  newStatus: "ACTIVE",
} satisfies EmailProps

export default EmailMembershipStatusChange
