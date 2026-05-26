/**
 * @added   SESSION_0259 (2026-05-25)
 * @why     Email sent when a member joins an organization via a self-service path
 *          (invite link claim, org invite-code join, direct join). Distinct from
 *          membership-status-change.tsx which renders a Previous → New arrow for
 *          true transitions — this template carries welcome semantics for a
 *          freshly-created membership where no prior status exists.
 * @wired   server/invites/actions.ts (claimInvite, status: ACTIVE)
 *          server/web/organization/actions.ts (joinByInviteCode, status: ACTIVE)
 *          server/web/organization/actions.ts (joinOrganization, status: PENDING)
 */
import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

export type MembershipWelcomeStatus = "ACTIVE" | "PENDING"

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  organizationName: string
  disciplineName: string
  status: MembershipWelcomeStatus
}

export const EmailMembershipWelcome = ({
  firstName,
  organizationName,
  disciplineName,
  status,
  ...props
}: EmailProps) => {
  const isActive = status === "ACTIVE"
  const preview = isActive
    ? `Welcome to ${organizationName} — your ${disciplineName} membership is active`
    : `Welcome to ${organizationName} — your ${disciplineName} membership is pending approval`

  return (
    <EmailWrapper {...props} preview={preview}>
      <Text>Hey {firstName?.trim() || "there"}!</Text>

      <Text>
        Welcome to <strong>{organizationName}</strong>.
      </Text>

      {isActive ? (
        <Text>
          Your <strong>{disciplineName}</strong> membership is now <strong>active</strong>. You can
          jump straight into the dashboard.
        </Text>
      ) : (
        <Text>
          Your <strong>{disciplineName}</strong> membership is{" "}
          <strong>pending owner approval</strong>. You'll receive a follow-up email once the
          organization owner approves your request.
        </Text>
      )}

      <Text>Reply to this email if you have any questions.</Text>
    </EmailWrapper>
  )
}

EmailMembershipWelcome.PreviewProps = {
  to: "member@example.com",
  firstName: "Alex",
  organizationName: "Baseline Martial Arts",
  disciplineName: "Brazilian Jiu-Jitsu",
  status: "ACTIVE",
} satisfies EmailProps

export default EmailMembershipWelcome
