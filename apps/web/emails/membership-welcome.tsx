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

import { Section, Text } from "@react-email/components"
import {
  BblEmailWrapper as EmailWrapper,
  type BblEmailWrapperProps as EmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

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
    : `You've applied to ${organizationName} — we'll let you know when you're approved`

  return (
    <EmailWrapper {...props} preview={preview}>
      {isActive ? (
        <>
          <Text>Hey {firstName?.trim() || "there"} — you&apos;re in!</Text>

          <Text>
            Your <strong>{disciplineName}</strong> membership in <strong>{organizationName}</strong>{" "}
            is now <strong>active</strong>. Welcome to the team.
          </Text>

          <Section className="my-3 rounded-lg border border-solid border-gray-200 bg-gray-50 px-5 py-4">
            <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
              What to do next
            </Text>
            <Text className="mb-0 mt-3 text-[13px] leading-7 text-gray-800">
              <strong>1.</strong> Head to your dashboard and complete your profile.
              <br />
              <strong>2.</strong> Browse the directory to connect with other members.
              <br />
              <strong>3.</strong> Reply to this email any time if you have questions.
            </Text>
          </Section>
        </>
      ) : (
        <>
          <Text>Hey {firstName?.trim() || "there"},</Text>

          <Text>
            We received your request to join <strong>{organizationName}</strong> for{" "}
            <strong>{disciplineName}</strong>. Your application is <strong>pending approval</strong>{" "}
            from the organization owner.
          </Text>

          <Section className="my-3 rounded-lg border border-solid border-gray-200 bg-gray-50 px-5 py-4">
            <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
              What happens next
            </Text>
            <Text className="mb-0 mt-3 text-[13px] leading-7 text-gray-800">
              <strong>1.</strong> The owner reviews new membership requests — usually within a day
              or two.
              <br />
              <strong>2.</strong> You&apos;ll get an email the moment you&apos;re approved.
              <br />
              <strong>3.</strong> Reply here if you have questions in the meantime.
            </Text>
          </Section>
        </>
      )}
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
