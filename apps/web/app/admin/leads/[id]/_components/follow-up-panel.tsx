"use client"

import { formatDate } from "@primoui/utils"
import { CheckCircleIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import { TextArea } from "~/components/common/textarea"
import { completeFollowUp, createFollowUp } from "~/server/admin/leads/actions"
import type { LeadDetail } from "~/server/admin/leads/queries"

type FollowUpPanelProps = {
  lead: LeadDetail
}

const CHANNELS = ["PHONE", "EMAIL", "SMS", "IN_PERSON", "SOCIAL_MEDIA", "OTHER"]

export function FollowUpPanel({ lead }: FollowUpPanelProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [channel, setChannel] = useState("PHONE")
  const [notes, setNotes] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")

  const { executeAsync: execCreate, isPending: creating } = useAction(createFollowUp, {
    onSuccess: () => {
      toast.success("Follow-up created")
      setShowForm(false)
      setNotes("")
      setScheduledAt("")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError),
  })

  const { executeAsync: execComplete } = useAction(completeFollowUp, {
    onSuccess: () => {
      toast.success("Follow-up completed")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError),
  })

  return (
    <div className="rounded-lg border bg-card p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <H3>Follow-ups</H3>
        <Button
          size="sm"
          variant="secondary"
          prefix={<PlusIcon className="size-4" />}
          onClick={() => setShowForm(!showForm)}
        >
          Add Follow-up
        </Button>
      </div>

      {showForm && (
        <div className="grid gap-3 mb-6 p-4 rounded border bg-muted/50">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="followup-channel" className="text-sm font-medium">
                Channel *
              </label>
              <select
                id="followup-channel"
                title="Follow-up channel"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm mt-1"
                value={channel}
                onChange={e => setChannel(e.target.value)}
              >
                {CHANNELS.map(c => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* biome-ignore lint/a11y/noLabelWithoutControl: label wraps custom Input form control */}
            <label className="block">
              <span className="text-sm font-medium">Scheduled</span>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                className="mt-1"
              />
            </label>
          </div>

          {/* biome-ignore lint/a11y/noLabelWithoutControl: label wraps custom TextArea form control */}
          <label className="block">
            <span className="text-sm font-medium">Notes</span>
            <TextArea
              placeholder="Follow-up notes..."
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mt-1"
            />
          </label>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              isPending={creating}
              onClick={() =>
                execCreate({
                  leadId: lead.id,
                  channel,
                  notes: notes || undefined,
                  scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                })
              }
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {lead.followUps.length === 0 && !showForm && <Note>No follow-ups yet.</Note>}

      <div className="space-y-3">
        {lead.followUps.map(fu => (
          <div key={fu.id} className="flex items-start justify-between rounded border p-3 text-sm">
            <div>
              <div className="font-medium">
                {fu.channel.replace(/_/g, " ")}
                {fu.completedAt && <span className="ml-2 text-green-600 text-xs">✓ Completed</span>}
              </div>
              {fu.notes && <Note className="mt-1">{fu.notes}</Note>}
              <Note className="mt-1">
                Created {formatDate(fu.createdAt)}
                {fu.scheduledAt && <> · Scheduled {formatDate(fu.scheduledAt)}</>}
                {fu.assignedTo && <> · {fu.assignedTo.name ?? fu.assignedTo.email}</>}
              </Note>
            </div>

            {!fu.completedAt && (
              <Button
                size="sm"
                variant="secondary"
                prefix={<CheckCircleIcon className="size-4" />}
                onClick={() => execComplete({ id: fu.id })}
              >
                Complete
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
