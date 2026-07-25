"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { DataSelect } from "~/components/common/data-select"
import { client } from "~/lib/orpc-client"
import { INBOX_TRIAGE_STATUSES, type InboxTriageStatus } from "~/server/inbox/schema"

const STATUS_OPTIONS: { value: InboxTriageStatus; label: string }[] = [
  { value: "UNREAD", label: "Unread" },
  { value: "READ", label: "Read" },
  { value: "ARCHIVED", label: "Archived" },
]

// `unknown` because Base UI's Select `onValueChange` is untyped in the generic-less form.
const toTriageStatus = (value: unknown): InboxTriageStatus =>
  typeof value === "string" && (INBOX_TRIAGE_STATUSES as readonly string[]).includes(value)
    ? (value as InboxTriageStatus)
    : "UNREAD"

/**
 * In-row triage control for the `/app/inbox` table (G-033 slice 1, SESSION_0639) — the
 * `PlanningIntakeStatusSelect` idiom (single small write control, optimistic local state with
 * rollback, toast feedback), but writing through the oRPC `inbox.setTriageStatus` procedure
 * (full-oRPC direction — no next-safe-action here).
 */
export function InboxStatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState<InboxTriageStatus>(() => toTriageStatus(status))
  const [isPending, startTransition] = useTransition()

  return (
    <DataSelect
      options={STATUS_OPTIONS}
      value={value}
      disabled={isPending}
      onValueChange={next => {
        const nextStatus = toTriageStatus(next)
        const previous = value
        setValue(nextStatus)
        startTransition(async () => {
          try {
            const updated = await client.inbox.setTriageStatus({ id, triageStatus: nextStatus })
            toast.success(`Marked ${updated.triageStatus.toLowerCase()}.`)
          } catch {
            setValue(previous)
            toast.error("Failed to update status.")
          }
        })
      }}
      aria-label="Triage status"
      size="sm"
      triggerClassName="w-32"
    />
  )
}
