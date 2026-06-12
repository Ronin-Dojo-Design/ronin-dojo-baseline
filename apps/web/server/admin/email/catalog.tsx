import { render } from "@react-email/components"
import type { ReactElement } from "react"
import { Brand } from "~/.generated/prisma/client"
import { EmailAdminBblJoinLegacy } from "~/emails/admin-bbl-join-legacy"
import { EmailBblJoinLegacyConfirmation } from "~/emails/bbl-join-legacy-confirmation"
import { EmailBblLiveTestInvite } from "~/emails/bbl-live-test-invite"
import { EmailInviteNotification } from "~/emails/invite-notification"

export const BBL_EMAIL_TEMPLATE_KEYS = [
  "bbl-live-test-invite",
  "bbl-join-legacy-confirmation",
  "admin-bbl-join-legacy",
  "bbl-organization-invite",
] as const

export type BblEmailTemplateKey = (typeof BBL_EMAIL_TEMPLATE_KEYS)[number]

type ResolvedBblEmailTemplateContext = {
  to: string
  recipientName: string
  personalMessage: string
  joinUrl: string
}

type BblEmailTemplate = {
  key: BblEmailTemplateKey
  title: string
  type: "transactional" | "admin" | "invite"
  recipient: "member" | "admin"
  description: string
  subject: string
  create: (context: ResolvedBblEmailTemplateContext) => ReactElement
}

const defaultContext: ResolvedBblEmailTemplateContext = {
  to: "tony@example.com",
  recipientName: "Tony",
  personalMessage: "Thank you for helping us test the live Black Belt Legacy claim flow.",
  joinUrl: "https://blackbeltlegacy.com/lineage/join",
}

const templates: BblEmailTemplate[] = [
  {
    key: "bbl-live-test-invite",
    title: "Live claim test invite",
    type: "invite",
    recipient: "member",
    description:
      "Manual operator invite for Tony Hua or another first live tester to run the Join Legacy claim flow.",
    subject: "You're invited to test Black Belt Legacy",
    create: context => (
      <EmailBblLiveTestInvite
        to={context.to}
        recipientName={context.recipientName}
        personalMessage={context.personalMessage}
        joinUrl={context.joinUrl}
      />
    ),
  },
  {
    key: "bbl-join-legacy-confirmation",
    title: "Join Legacy confirmation",
    type: "transactional",
    recipient: "member",
    description:
      "Sent after the Join Legacy intake is saved; points paid paths at lineage membership instead of listings checkout.",
    subject: "We received your Black Belt Legacy lineage information",
    create: context => (
      <EmailBblJoinLegacyConfirmation
        to={context.to}
        firstName={context.recipientName}
        membershipPath="PREMIUM"
        checkoutUrl={`${context.joinUrl}?submitted=true#lineage-membership`}
        claimCreated={false}
      />
    ),
  },
  {
    key: "admin-bbl-join-legacy",
    title: "Admin intake alert",
    type: "admin",
    recipient: "admin",
    description: "Internal alert sent to the BBL sender mailbox when a Join Legacy intake lands.",
    subject: "New Black Belt Legacy intake: Preview User",
    create: context => (
      <EmailAdminBblJoinLegacy
        to={context.to}
        fullName={context.recipientName || "Preview User"}
        email={context.to}
        membershipPath="ELITE"
        rankSummary="BJJ black belt"
        trainedUnder="Rigan Machado"
        represent="Rigan Machado lineage"
        adminLeadUrl="https://blackbeltlegacy.com/admin/leads/example"
        checkoutUrl={`${context.joinUrl}?submitted=true#lineage-membership`}
        claimCreated={true}
      />
    ),
  },
  {
    key: "bbl-organization-invite",
    title: "Organization invite",
    type: "invite",
    recipient: "member",
    description: "Existing invite-notification template rendered with BBL sender context.",
    subject: "You're invited to join Black Belt Legacy",
    create: context => (
      <EmailInviteNotification
        to={context.to}
        organizationName="Black Belt Legacy"
        inviteCode="preview-code"
        expiresAt={new Date("2026-07-01T00:00:00.000Z")}
      />
    ),
  },
]

export type BblEmailTemplatePreview = Omit<BblEmailTemplate, "create"> & {
  body: string
}

export const getBblEmailTemplate = (key: BblEmailTemplateKey) => {
  const template = templates.find(item => item.key === key)
  if (!template) {
    throw new Error(`Unknown BBL email template: ${key}`)
  }
  return template
}

export const getBblEmailTemplatePreviews = async (): Promise<BblEmailTemplatePreview[]> => {
  return await Promise.all(
    templates.map(async ({ create, ...template }) => ({
      ...template,
      body: await render(create(defaultContext), { plainText: true }),
    })),
  )
}

export const createBblEmailPayload = ({
  templateKey,
  to,
  recipientName,
  personalMessage,
  joinUrl,
}: {
  templateKey: BblEmailTemplateKey
  to: string
  recipientName?: string | null
  personalMessage?: string | null
  joinUrl?: string | null
}) => {
  const template = getBblEmailTemplate(templateKey)
  const context: ResolvedBblEmailTemplateContext = {
    to,
    recipientName: recipientName?.trim() || "there",
    personalMessage: personalMessage?.trim() || "",
    joinUrl: joinUrl?.trim() || "https://blackbeltlegacy.com/lineage/join",
  }

  return {
    brand: Brand.BBL,
    subject: template.subject,
    react: template.create(context),
  }
}
