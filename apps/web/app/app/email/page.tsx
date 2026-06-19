import { ExternalLinkIcon, MailIcon, ReplyIcon } from "lucide-react"
import { Brand } from "~/.generated/prisma/client"
import { BblEmailCaptureList } from "~/app/app/email/_components/bbl-email-capture-list"
import { BblEmailCatalogPanel } from "~/app/app/email/_components/bbl-email-catalog-panel"
import { BblInviteComposer } from "~/app/app/email/_components/bbl-invite-composer"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { env } from "~/env"
import {
  getBrandSenderEmail,
  getBrandSenderEnvVar,
  getConfiguredBrandSenderEmail,
  isBrandSenderConfigured,
} from "~/lib/email"
import { getBblEmailTemplatePreviews } from "~/server/admin/email/catalog"
import { findRecentBblJoinLegacyCaptures } from "~/server/admin/email/queries"

const brandSenders = [
  {
    brand: Brand.BASELINE_MARTIAL_ARTS,
    label: "Baseline Martial Arts",
    domain: "baselinemartialarts.com",
  },
  {
    brand: Brand.BBL,
    label: "Black Belt Legacy",
    domain: "blackbeltlegacy.com",
  },
].map(sender => {
  const configuredSender = getConfiguredBrandSenderEmail(sender.brand)

  return {
    ...sender,
    configured: isBrandSenderConfigured(sender.brand),
    configuredSender,
    intendedSender: getBrandSenderEmail(sender.brand),
    envVar: getBrandSenderEnvVar(sender.brand),
  }
})

const operatorReplyMailboxes = brandSenders
  .map(sender => sender.configuredSender ?? `${sender.intendedSender} (${sender.envVar} pending)`)
  .join(" / ")
const defaultReplyMailbox = getBrandSenderEmail(Brand.BASELINE_MARTIAL_ARTS)

const emailSurfaces = [
  {
    label: "Delivered email activity",
    value: "Resend Dashboard → Emails",
    note: "Use this for delivery status, message ids, bounces, and complaint checks.",
  },
  {
    label: "Operator replies",
    value: operatorReplyMailboxes,
    note: "Outgoing brand email defaults Reply-To to the active brand sender unless a helper explicitly overrides it.",
  },
  {
    label: "Template previews",
    value: "pnpm --filter @ronin-dojo/web email",
    note: "Runs the React Email preview server for local template inspection; it is not an inbox.",
  },
] as const

export default async function AppEmailPage() {
  const senderConfigured = Boolean(
    env.RESEND_SENDER_EMAIL || env.RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS,
  )
  const bblSenderConfigured = isBrandSenderConfigured(Brand.BBL)
  const [bblEmailTemplates, bblCaptures] = await Promise.all([
    getBblEmailTemplatePreviews(),
    findRecentBblJoinLegacyCaptures(),
  ])

  return (
    <Wrapper size="lg" gap="md">
      <Stack className="items-start justify-between gap-4" wrap>
        <Stack direction="column" size="xs">
          <H3>Email operations</H3>
          <Note>
            Current transactional email is sent through Resend. This page is an admin runbook
            surface; the app does not yet persist inbound email threads for in-app replies.
          </Note>
        </Stack>
        <Stack size="xs" wrap>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href="https://resend.com/emails" target="_blank" />}
          >
            <ExternalLinkIcon className="size-4" />
            Open Resend emails
          </Button>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href={`mailto:${defaultReplyMailbox}`} />}
          >
            <ReplyIcon className="size-4" />
            Reply mailbox
          </Button>
        </Stack>
      </Stack>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <Stack direction="column" size="xs">
            <span className="font-medium">Provider</span>
            <Stack size="xs" wrap>
              <Badge variant="success" size="sm">
                Resend
              </Badge>
              <Badge variant={senderConfigured ? "success" : "warning"} size="sm">
                {senderConfigured ? "Baseline sender configured" : "Baseline sender missing"}
              </Badge>
              <Badge variant={bblSenderConfigured ? "success" : "warning"} size="sm">
                {bblSenderConfigured ? "BBL sender configured" : "BBL sender pending"}
              </Badge>
            </Stack>
            <Note className="text-xs">
              Default sender: {env.RESEND_SENDER_EMAIL || "RESEND_SENDER_EMAIL not set"}
            </Note>
          </Stack>
        </Card>

        <Card className="p-4">
          <Stack direction="column" size="xs">
            <span className="font-medium">Read delivered emails</span>
            <Note className="text-xs">
              Open Resend Dashboard → Emails for sent-message inspection and delivery status.
              Recipient replies are not pulled back into this app yet.
            </Note>
          </Stack>
        </Card>

        <Card className="p-4">
          <Stack direction="column" size="xs">
            <span className="font-medium">Respond to replies</span>
            <Note className="text-xs">
              Reply from the external mailbox for the active brand sender. Use Leads follow-ups for
              CRM notes until an inbound-email store exists.
            </Note>
          </Stack>
        </Card>
      </div>

      <Card className="p-4">
        <Stack direction="column" className="gap-3">
          <span className="font-medium">Brand sender setup</span>
          <div className="overflow-hidden rounded-md border">
            <div className="grid gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs md:grid-cols-[12rem_1fr_1fr_1fr_7rem]">
              <span>Brand</span>
              <span>Domain</span>
              <span>Sender</span>
              <span>Env var</span>
              <span>Status</span>
            </div>
            <div className="divide-y">
              {brandSenders.map(sender => (
                <div
                  key={sender.label}
                  className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[12rem_1fr_1fr_1fr_7rem]"
                >
                  <span className="font-medium">{sender.label}</span>
                  <span className="font-mono text-xs">{sender.domain}</span>
                  <span className="break-words font-mono text-xs">
                    {sender.configuredSender ?? sender.intendedSender}
                  </span>
                  <span className="break-words font-mono text-xs">{sender.envVar}</span>
                  <Badge variant={sender.configured ? "success" : "warning"} size="sm">
                    {sender.configured ? "Configured" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Stack>
      </Card>

      <BblEmailCatalogPanel
        templates={bblEmailTemplates}
        senderEmail={getBrandSenderEmail(Brand.BBL)}
        isSenderConfigured={bblSenderConfigured}
      />

      <BblInviteComposer isSenderConfigured={bblSenderConfigured} />

      <BblEmailCaptureList captures={bblCaptures} />

      <Card className="p-4">
        <Stack direction="column" className="gap-3">
          <Stack size="xs" className="items-center">
            <MailIcon className="size-4 text-muted-foreground" />
            <span className="font-medium">Where email lives today</span>
          </Stack>
          <div className="overflow-hidden rounded-md border">
            <div className="grid gap-3 border-b bg-muted/30 px-4 py-2 font-medium text-muted-foreground text-xs md:grid-cols-[12rem_1fr_1.5fr]">
              <span>Surface</span>
              <span>Where</span>
              <span>Use</span>
            </div>
            <div className="divide-y">
              {emailSurfaces.map(surface => (
                <div
                  key={surface.label}
                  className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[12rem_1fr_1.5fr]"
                >
                  <span className="font-medium">{surface.label}</span>
                  <span className="break-words font-mono text-xs">{surface.value}</span>
                  <Note className="text-xs">{surface.note}</Note>
                </div>
              ))}
            </div>
          </div>
        </Stack>
      </Card>
    </Wrapper>
  )
}
