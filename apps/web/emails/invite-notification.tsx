/**
 * @added   SESSION_0148 (2026-05-12)
 * @why     Email sent when an admin creates an invite with a target email in meta
 * @wired   server/admin/invites/actions.ts (createInvite)
 */
import "dotenv/config"

import { formatDate } from "@dirstack/utils"
import { Section, Text } from "@react-email/components"
import { siteConfig } from "~/config/site"
import { EmailButton } from "~/emails/components/button"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  organizationName: string
  inviteCode: string
  expiresAt?: Date | null
}

export const EmailInviteNotification = ({
  firstName,
  organizationName,
  inviteCode,
  expiresAt,
  ...props
}: EmailProps) => {
  const inviteUrl = `${siteConfig.url}/invite/${inviteCode}`

  return (
    <EmailWrapper
      {...props}
      preview={`You've been personally invited to join ${organizationName}`}
    >
      <Text>Hey {firstName?.trim() || "there"},</Text>

      <Text>
        You&apos;ve been personally invited to join <strong>{organizationName}</strong> on{" "}
        {siteConfig.name}. Accepting takes about a minute — here&apos;s all you need to do:
      </Text>

      <Section className="my-3 rounded-lg border border-solid border-gray-200 bg-gray-50 px-5 py-4">
        <Text className="my-0 text-[13px] leading-7 text-gray-800">
          <strong>1.</strong> Click the button below to open your invitation.
          <br />
          <strong>2.</strong> Create an account — or sign in if you already have one.
          <br />
          <strong>3.</strong> You&apos;re in. Your membership and the team will be right there.
        </Text>
      </Section>

      <EmailButton href={inviteUrl}>Accept invitation</EmailButton>

      <Text className="text-sm text-gray-600">
        If the button doesn&apos;t open, paste this link into your browser:
      </Text>

      <Text className="max-w-sm flex-wrap wrap-break-word font-mono text-sm leading-snug text-gray-700">
        {inviteUrl}
      </Text>

      {expiresAt && (
        <Text className="text-sm text-gray-500">
          This invitation expires on {formatDate(expiresAt)}. Reply to this email if you need more
          time.
        </Text>
      )}
    </EmailWrapper>
  )
}

EmailInviteNotification.PreviewProps = {
  to: "member@example.com",
  firstName: "Tony",
  organizationName: "Baseline Martial Arts",
  inviteCode: "abc123xyz",
  expiresAt: new Date("2026-06-01"),
} satisfies EmailProps

export default EmailInviteNotification
