"use client"

import { SendIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { sendBblEmailCatalogTest } from "~/server/admin/email/actions"
import type { BblEmailTemplatePreview } from "~/server/admin/email/catalog"
import { cx } from "~/lib/utils"

type BblEmailCatalogPanelProps = {
  templates: BblEmailTemplatePreview[]
  senderEmail: string
  isSenderConfigured: boolean
}

const TYPE_LABELS: Record<BblEmailTemplatePreview["type"], string> = {
  transactional: "Transactional",
  invite: "Invite",
  admin: "Admin",
}

export function BblEmailCatalogPanel({
  templates,
  senderEmail,
  isSenderConfigured,
}: BblEmailCatalogPanelProps) {
  const [selectedKey, setSelectedKey] = useState(templates[0]?.key)
  const [typeFilter, setTypeFilter] = useState<"all" | BblEmailTemplatePreview["type"]>("all")
  const [toEmail, setToEmail] = useState("")
  const [recipientName, setRecipientName] = useState("Tony")
  const [joinUrl, setJoinUrl] = useState("https://blackbeltlegacy.com/lineage/join")
  const [personalMessage, setPersonalMessage] = useState(
    "Thank you for helping us test the live Black Belt Legacy claim flow.",
  )

  // Distinct types present, in first-seen order — drives the filter tabs.
  const types = useMemo(() => {
    const seen = new Set<BblEmailTemplatePreview["type"]>()
    for (const template of templates) {
      seen.add(template.type)
    }
    return [...seen]
  }, [templates])

  const visibleTemplates = useMemo(
    () => (typeFilter === "all" ? templates : templates.filter(t => t.type === typeFilter)),
    [templates, typeFilter],
  )

  // Selection always resolves to something visible so the preview never goes blank
  // when the active filter hides the previously selected template.
  const selectedTemplate = useMemo(
    () =>
      visibleTemplates.find(template => template.key === selectedKey) ??
      visibleTemplates[0] ??
      templates[0],
    [selectedKey, visibleTemplates, templates],
  )

  const sendTest = useAction(sendBblEmailCatalogTest, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success(`Sent ${data.subject} to ${data.to}`)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to send BBL email test.")
    },
  })

  if (!selectedTemplate) return null

  return (
    <Card hover={false} className="p-4">
      <Stack direction="column" className="gap-4">
        <Stack className="items-start justify-between gap-4" wrap>
          <Stack direction="column" size="xs">
            <Badge variant="outline">Black Belt Legacy</Badge>
            <H3>Email catalog and live-test composer</H3>
            <Note className="text-sm">
              Preview BBL templates and send a controlled test from {senderEmail}. Replies still
              land in the external sender mailbox.
            </Note>
          </Stack>
          <Badge variant={isSenderConfigured ? "success" : "warning"} size="sm">
            {isSenderConfigured ? "Sender configured" : "Sender env pending"}
          </Badge>
        </Stack>

        <Stack size="xs" wrap className="border-b pb-3">
          <FilterTab
            label="All"
            count={templates.length}
            isActive={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
          />
          {types.map(type => (
            <FilterTab
              key={type}
              label={TYPE_LABELS[type]}
              count={templates.filter(t => t.type === type).length}
              isActive={typeFilter === type}
              onClick={() => setTypeFilter(type)}
            />
          ))}
        </Stack>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0 space-y-2">
            {visibleTemplates.map(template => (
              <button
                key={template.key}
                type="button"
                onClick={() => setSelectedKey(template.key)}
                aria-pressed={selectedTemplate.key === template.key}
                className={cx(
                  "w-full rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary/50",
                  selectedTemplate.key === template.key && "border-primary bg-primary/10",
                )}
              >
                <Stack className="items-start justify-between gap-3" wrap={false}>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{template.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {template.description}
                    </span>
                  </span>
                  <Badge variant={template.recipient === "admin" ? "warning" : "info"} size="sm">
                    {template.recipient}
                  </Badge>
                </Stack>
              </button>
            ))}
          </div>

          <Stack direction="column" className="min-w-0 gap-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Subject
              </p>
              <p className="mt-1 font-medium">{selectedTemplate.subject}</p>
            </div>

            <div className="max-h-72 overflow-auto rounded-lg border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Plaintext preview
              </p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-secondary-foreground">
                {selectedTemplate.body}
              </pre>
            </div>

            <form
              className="space-y-3 rounded-lg border bg-background p-4"
              onSubmit={event => {
                event.preventDefault()
                sendTest.execute({
                  templateKey: selectedTemplate.key,
                  toEmail,
                  recipientName,
                  personalMessage,
                  joinUrl,
                })
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Send live test
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="email"
                  value={toEmail}
                  onChange={event => setToEmail(event.target.value)}
                  placeholder="tony@example.com"
                  aria-label="Recipient email"
                  required
                />
                <Input
                  value={recipientName}
                  onChange={event => setRecipientName(event.target.value)}
                  placeholder="Tony"
                  aria-label="Recipient name"
                />
              </div>
              <Input
                value={joinUrl}
                onChange={event => setJoinUrl(event.target.value)}
                placeholder="https://blackbeltlegacy.com/lineage/join"
                aria-label="Join or claim URL"
              />
              <TextArea
                value={personalMessage}
                onChange={event => setPersonalMessage(event.target.value)}
                placeholder="Personal note for the recipient..."
                aria-label="Personal message"
              />
              <Button
                type="submit"
                size="sm"
                isPending={sendTest.isPending}
                disabled={!toEmail || sendTest.isPending}
                prefix={<SendIcon />}
              >
                Send test email
              </Button>
            </form>
          </Stack>
        </div>
      </Stack>
    </Card>
  )
}

type FilterTabProps = {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}

function FilterTab({ label, count, isActive, onClick }: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
        isActive
          ? "border-primary bg-primary/10 font-medium text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/50",
      )}
    >
      {label}
      <span className="text-[0.65rem] text-muted-foreground tabular-nums">{count}</span>
    </button>
  )
}
