/**
 * @added   SESSION_0258 (2026-05-25)
 * @why     Email sent when a member successfully registers for a tournament via the public
 *          registration flow. `paymentStatus` is a placeholder field populated by Session C
 *          Stripe wiring; defaults to "PENDING" until then.
 * @wired   server/web/tournaments/register.ts (public registration action — wired this session)
 *          server/admin/tournaments/actions.ts (admin walk-in path — deferred to SESSION_0259)
 */
import "dotenv/config"

import { Text } from "@react-email/components"
import {
  BblEmailWrapper as EmailWrapper,
  type BblEmailWrapperProps as EmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

export type TournamentRegistrationPaymentStatus = "PENDING" | "PAID" | "WAIVED"

const PAYMENT_LABEL: Record<TournamentRegistrationPaymentStatus, string> = {
  PENDING: "Payment pending",
  PAID: "Paid",
  WAIVED: "Waived",
}

type EmailProps = EmailWrapperProps & {
  firstName?: string | null
  tournamentName: string
  divisionName: string
  rank?: string | null
  orgName?: string | null
  paymentStatus?: TournamentRegistrationPaymentStatus
}

export const EmailTournamentRegistrationConfirmation = ({
  firstName,
  tournamentName,
  divisionName,
  rank,
  orgName,
  paymentStatus = "PENDING",
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props} preview={`You're registered for ${tournamentName}`}>
      <Text>Hey {firstName?.trim() || "there"}!</Text>

      <Text>
        You're registered for <strong>{tournamentName}</strong>. We'll send another email when
        seeding and bracket details are published.
      </Text>

      <Text>
        <strong>Division:</strong> {divisionName}
        {rank ? (
          <>
            <br />
            <strong>Rank snapshot:</strong> {rank}
          </>
        ) : null}
        {orgName ? (
          <>
            <br />
            <strong>Representing:</strong> {orgName}
          </>
        ) : null}
        <br />
        <strong>Payment:</strong> {PAYMENT_LABEL[paymentStatus]}
      </Text>

      <Text>Reply to this email if you need to update or withdraw your registration.</Text>
    </EmailWrapper>
  )
}

EmailTournamentRegistrationConfirmation.PreviewProps = {
  to: "competitor@example.com",
  firstName: "Alex",
  tournamentName: "Spring Open 2026",
  divisionName: "Blue Belt — Adult Male — 170lb",
  rank: "Blue Belt",
  orgName: "Baseline Martial Arts",
  paymentStatus: "PENDING",
} satisfies EmailProps

export default EmailTournamentRegistrationConfirmation
