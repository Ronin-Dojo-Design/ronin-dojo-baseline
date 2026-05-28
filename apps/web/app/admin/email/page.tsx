import { ExternalLinkIcon, MailIcon, ReplyIcon } from "lucide-react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { siteConfig } from "~/config/site"
import { env } from "~/env"

const emailSurfaces = [
  {
    label: "Delivered email activity",
    value: "Resend Dashboard → Emails",
    note: "Use this for delivery status, message ids, bounces, and complaint checks.",
  },
  {
    label: "Operator replies",
    value: siteConfig.email,
    note: "Outgoing app email defaults Reply-To to the site email, so recipient replies land in this mailbox.",
  },
  {
    label: "Template previews",
    value: "pnpm --filter @ronin-dojo/web email",
    note: "Runs the React Email preview server for local template inspection; it is not an inbox.",
  },
] as const

export default withAdminPage(() => {
  const senderConfigured = Boolean(env.RESEND_SENDER_EMAIL)

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
            render={<Link href={`mailto:${siteConfig.email}`} />}
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
                {senderConfigured ? "Sender configured" : "Sender missing"}
              </Badge>
            </Stack>
            <Note className="text-xs">
              Sender: {env.RESEND_SENDER_EMAIL || "RESEND_SENDER_EMAIL not set"}
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
              Reply from the external mailbox for {siteConfig.email}. Use Leads follow-ups for CRM
              notes until an inbound-email store exists.
            </Note>
          </Stack>
        </Card>
      </div>

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
})
