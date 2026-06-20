"use client"

import { LayersIcon, SendIcon } from "lucide-react"
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
import { cx } from "~/lib/utils"
import { sendBblLifecycleTest } from "~/server/admin/email/lifecycle-actions"
import type {
  LifecycleCatalogCategory,
  LifecycleCatalogPreview,
} from "~/server/admin/email/lifecycle-catalog"

type BblLifecycleCatalogPanelProps = {
  previews: LifecycleCatalogPreview[]
  senderEmail: string
  isSenderConfigured: boolean
}

export function BblLifecycleCatalogPanel({
  previews,
  senderEmail,
  isSenderConfigured,
}: BblLifecycleCatalogPanelProps) {
  const [selectedKind, setSelectedKind] = useState(previews[0]?.kind)
  const [categoryFilter, setCategoryFilter] = useState<"all" | LifecycleCatalogCategory>("all")
  const [toEmail, setToEmail] = useState("")
  const [recipientName, setRecipientName] = useState("Tony")

  const categories = useMemo(() => {
    const seen = new Set<LifecycleCatalogCategory>()
    for (const preview of previews) {
      seen.add(preview.category)
    }
    return [...seen]
  }, [previews])

  const visible = useMemo(
    () =>
      categoryFilter === "all"
        ? previews
        : previews.filter(preview => preview.category === categoryFilter),
    [previews, categoryFilter],
  )

  const selected = useMemo(
    () => visible.find(preview => preview.kind === selectedKind) ?? visible[0] ?? previews[0],
    [visible, selectedKind, previews],
  )

  const sendTest = useAction(sendBblLifecycleTest, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success(`Sent "${data.subject}" to ${data.to}`)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to send lifecycle test.")
    },
  })

  if (!selected) return null

  return (
    <Card hover={false} className="p-4">
      <Stack direction="column" className="w-full gap-4">
        <Stack className="items-start justify-between gap-4" wrap>
          <Stack direction="column" size="xs" className="min-w-0">
            <Stack size="xs" className="items-center">
              <LayersIcon className="size-4 text-muted-foreground" />
              <Badge variant="outline">Lifecycle library</Badge>
            </Stack>
            <H3>Lifecycle email catalog</H3>
            <Note className="text-sm">
              Browse every membership, billing, and lineage email the platform can send — each goes
              out from {senderEmail} on the BBL domain. Preview a template and fire an explicit
              one-off test.
            </Note>
          </Stack>
          <Badge variant={isSenderConfigured ? "success" : "warning"} size="sm">
            {isSenderConfigured ? "Sender configured" : "Sender env pending"}
          </Badge>
        </Stack>

        <Stack size="xs" wrap className="border-b pb-3">
          <CategoryTab
            label="All"
            count={previews.length}
            isActive={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          />
          {categories.map(category => (
            <CategoryTab
              key={category}
              label={category}
              count={previews.filter(preview => preview.category === category).length}
              isActive={categoryFilter === category}
              onClick={() => setCategoryFilter(category)}
            />
          ))}
        </Stack>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0 space-y-2">
            {visible.map(preview => (
              <button
                key={preview.kind}
                type="button"
                onClick={() => setSelectedKind(preview.kind)}
                aria-pressed={selected.kind === preview.kind}
                className={cx(
                  "w-full rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary/50",
                  selected.kind === preview.kind && "border-primary bg-primary/10",
                )}
              >
                <Stack className="items-start justify-between gap-3" wrap={false}>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{preview.title}</span>
                    <span className="mt-1 block text-muted-foreground text-xs">
                      {preview.description}
                    </span>
                  </span>
                  <Badge variant={preview.recipient === "admin" ? "warning" : "info"} size="sm">
                    {preview.recipient}
                  </Badge>
                </Stack>
              </button>
            ))}
          </div>

          <Stack direction="column" className="min-w-0 gap-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.18em]">
                Subject
              </p>
              <p className="mt-1 break-words font-medium">{selected.subject}</p>
            </div>

            <div className="max-h-72 overflow-auto rounded-lg border bg-background p-4">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.18em]">
                Plaintext preview
              </p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-secondary-foreground text-sm leading-6">
                {selected.body}
              </pre>
            </div>

            <form
              className="space-y-3 rounded-lg border bg-background p-4"
              onSubmit={event => {
                event.preventDefault()
                sendTest.execute({ kind: selected.kind, toEmail, recipientName })
              }}
            >
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.18em]">
                Send explicit test
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
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
              <Button
                type="submit"
                size="sm"
                isPending={sendTest.isPending}
                disabled={!toEmail || sendTest.isPending}
                prefix={<SendIcon />}
              >
                Send test email
              </Button>
              <Note className="text-xs">
                This sends one explicit test. Automatic lifecycle emails still honor the{" "}
                <code>EMAIL_LIFECYCLE_DRYRUN</code> gate.
              </Note>
            </form>
          </Stack>
        </div>
      </Stack>
    </Card>
  )
}

type CategoryTabProps = {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}

function CategoryTab({ label, count, isActive, onClick }: CategoryTabProps) {
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
