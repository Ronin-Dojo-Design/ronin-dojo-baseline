import "dotenv/config"

import { Text } from "@react-email/components"
import { EmailButton } from "~/emails/components/button"
import { EmailWrapper, type EmailWrapperProps } from "~/emails/components/wrapper"

type EmailProps = EmailWrapperProps & {
  fullName: string
  email: string
  membershipPath: "FREE" | "PREMIUM" | "ELITE"
  rankSummary?: string | null
  trainedUnder?: string | null
  represent?: string | null
  adminLeadUrl: string
  checkoutUrl?: string | null
  claimCreated?: boolean
}

export const EmailAdminBblJoinLegacy = ({
  fullName,
  email,
  membershipPath,
  rankSummary,
  trainedUnder,
  represent,
  adminLeadUrl,
  checkoutUrl,
  claimCreated,
  ...props
}: EmailProps) => {
  return (
    <EmailWrapper {...props} preview={`New Black Belt Legacy intake from ${fullName}`}>
      <Text>Hi!</Text>

      <Text>
        <strong>{fullName}</strong> submitted a Black Belt Legacy intake as a{" "}
        <strong>{membershipPath.toLowerCase()}</strong> lead.
      </Text>

      <Text>Email: {email}</Text>
      {rankSummary && <Text>Rank/history: {rankSummary}</Text>}
      {trainedUnder && <Text>Trained under: {trainedUnder}</Text>}
      {represent && <Text>Wants to represent or connect to: {represent}</Text>}
      <Text>Lineage claim created: {claimCreated ? "yes" : "not yet"}</Text>
      {checkoutUrl && <Text>Premium listing path: {checkoutUrl}</Text>}

      <EmailButton href={adminLeadUrl}>Review lead</EmailButton>
    </EmailWrapper>
  )
}

EmailAdminBblJoinLegacy.PreviewProps = {
  to: "welcome@blackbeltlegacy.com",
  fullName: "Alex Legacy",
  email: "alex@example.com",
  membershipPath: "ELITE",
  rankSummary: "BJJ black belt",
  trainedUnder: "Rigan Machado",
  represent: "Rigan Machado lineage",
  adminLeadUrl: "https://blackbeltlegacy.com/admin/leads/example",
  checkoutUrl: "https://blackbeltlegacy.com/submit/alex-legacy-profile",
  claimCreated: true,
} satisfies EmailProps

export default EmailAdminBblJoinLegacy
