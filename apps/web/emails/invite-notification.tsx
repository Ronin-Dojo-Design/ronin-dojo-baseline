/**
 * @added   SESSION_0148 (2026-05-12)
 * @why     Email sent when an admin creates an invite with a target email in meta
 * @wired   server/admin/invites/actions.ts (createInvite)
 */
import "dotenv/config"

import { formatDate } from "@dirstack/utils"
import { Text } from "@react-email/components"
import { siteConfig } from "~/config/site"
import { EmailButton } from "~/emails/components/button"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  organizationName: string
  inviteCode: string
  expiresAt?: Date | null
}

export const EmailInviteNotification = ({
  organizationName,
  inviteCode,
  expiresAt,
  ...props
}: EmailProps) => {
  const inviteUrl = `${siteConfig.url}/invite/${inviteCode}`

  return (
    <EmailWrapper {...props} preview={`You've been invited to join ${organizationName}`}>
      <Text>
        You've been invited to join <strong>{organizationName}</strong> on {siteConfig.name}!
      </Text>

      <Text>Click the button below to accept your invitation and become a member.</Text>

      <EmailButton href={inviteUrl}>Accept Invitation</EmailButton>

      <Text>or copy and paste this URL into your browser:</Text>

      <Text className="max-w-sm flex-wrap wrap-break-word font-medium leading-snug">
        {inviteUrl}
      </Text>

      {expiresAt && (
        <Text className="text-sm text-muted-foreground">
          This invitation expires on {formatDate(expiresAt)}.
        </Text>
      )}
    </EmailWrapper>
  )
}

EmailInviteNotification.PreviewProps = {
  to: "member@example.com",
  organizationName: "Baseline Martial Arts",
  inviteCode: "abc123xyz",
  expiresAt: new Date("2026-06-01"),
} satisfies EmailProps

export default EmailInviteNotification
