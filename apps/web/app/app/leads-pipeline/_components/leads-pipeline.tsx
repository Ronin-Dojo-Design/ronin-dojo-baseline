"use client"

// The board renders kernel m-cards, so it loads the ui-kit token + card CSS once here (same
// pattern + order as the loop-board): tokens.css defines the --mk-* vars, card.css the L1
// `.mk-surface` shell, m-card.css the board `.mk-card` anatomy. All ship from @ronin-dojo/ui-kit.
import "@ronin-dojo/ui-kit/tokens.css"
import "@ronin-dojo/ui-kit/card.css"
import "@ronin-dojo/ui-kit/m-card.css"

import { AdminKanban } from "@ronin-dojo/ui-kit/kanban"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H2, H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { prepareSchoolInvite } from "~/lib/leads-pipeline/actions"
import { LEADS_PIPELINE_BOARD } from "~/lib/leads-pipeline/board-config"
import { createLeadsPipelineBoardStore } from "~/lib/leads-pipeline/board-store-db"
import type { PipelineLead } from "~/lib/leads-pipeline/types"

type LeadsPipelineProps = {
  /** School-outreach demand rows, pre-ranked by demand-count (the "Schools to invite" queue). */
  schoolQueue: PipelineLead[]
}

/**
 * One row in the "Schools to invite" rail. The invite is a TWO-STEP operator action
 * (HARD BOUNDARY: no autonomous email sends):
 *   1. "Prepare invite" → creates the org invite link (NO email).
 *   2. type a recipient + "Send" → the ONLY path that fires `notifyUserOfInvite`.
 * A prepared-but-unsent invite still returns its code so the operator can share it manually.
 */
function SchoolInviteRow({ lead }: { lead: PipelineLead }) {
  const [recipient, setRecipient] = useState("")
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function run(send: boolean) {
    startTransition(async () => {
      const result = await prepareSchoolInvite({
        organizationId: lead.organizationId,
        recipientEmail: send ? recipient : null,
      })
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      setInviteCode(result.inviteCode)
      toast.success(result.sent ? `Invite sent to ${recipient}` : "Invite link prepared")
    })
  }

  return (
    <Card className="p-4">
      <CardHeader className="flex-row items-center justify-between gap-2 p-0">
        <H3 size="h5">{lead.title}</H3>
        <Badge variant="soft" size="sm">
          {lead.demandCount}× demand
        </Badge>
      </CardHeader>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input
          type="email"
          value={recipient}
          onChange={event => setRecipient(event.target.value)}
          placeholder="school@email.com (optional)"
          className="w-56"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isPending={isPending}
          onClick={() => run(false)}
        >
          Prepare invite
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          isPending={isPending}
          disabled={!recipient.trim()}
          onClick={() => run(true)}
        >
          Send invite
        </Button>
      </div>
      {inviteCode ? (
        <CardDescription className="mt-2 font-mono text-xs">
          Invite code: {inviteCode}
        </CardDescription>
      ) : null}
    </Card>
  )
}

/**
 * LeadsPipeline — the BBL Lead Pipeline board (Slice 6). Pure wiring: the shared
 * AdminKanban kernel mounted EDITABLE over BBL's OWN leads (via the DB `BoardStore`
 * adapter), plus the "Schools to invite" rail that surfaces Slice 1's school-outreach
 * demand ranked by demand-count. Doctrine: share the kernel, not the data (ADR 0034/0038).
 */
export function LeadsPipeline({ schoolQueue }: LeadsPipelineProps) {
  const store = useMemo(() => createLeadsPipelineBoardStore(), [])

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <H2 size="h3">BBL Lead Pipeline</H2>
        <p className="text-sm text-muted-foreground">
          Work every BBL lead through the stages · drag / status persists · the flywheel&apos;s
          school-outreach demand queues to the right.
        </p>
      </header>

      <AdminKanban config={LEADS_PIPELINE_BOARD} store={store} />

      {schoolQueue.length > 0 ? (
        <section className="space-y-3">
          <div className="space-y-1">
            <H3 size="h4">Schools to invite</H3>
            <p className="text-sm text-muted-foreground">
              Schools members named that aren&apos;t on BBL yet, ranked by how many asked. Preparing
              an invite creates the link; sending an email is a separate, explicit click.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {schoolQueue.map(lead => (
              <SchoolInviteRow key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
