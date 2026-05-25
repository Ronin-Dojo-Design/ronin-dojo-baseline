"use client"

/**
 * DSR status-transition actions — mirrors membership-status-actions.tsx pattern.
 *
 * @added SESSION_0255
 */
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import {
  DSR_VALID_TRANSITIONS,
  transitionDataSubjectRequestStatus,
} from "~/server/admin/privacy/actions"

type DsrForActions = {
  id: string
  status: string
}

const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "outline"> = {
  PENDING: "warning",
  IN_PROGRESS: "primary",
  FULFILLED: "success",
  REJECTED: "danger",
}

const TRANSITION_VARIANT: Record<string, "primary" | "secondary" | "destructive" | "ghost"> = {
  IN_PROGRESS: "primary",
  FULFILLED: "primary",
  REJECTED: "destructive",
}

export function DsrStatusActions({ request }: { request: DsrForActions }) {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const validTransitions = DSR_VALID_TRANSITIONS[request.status] ?? []

  const { executeAsync, isPending } = useAction(transitionDataSubjectRequestStatus, {
    onSuccess: () => {
      toast.success("Status updated")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update status"),
  })

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-muted-foreground">
          Status:{" "}
          <Badge variant={STATUS_VARIANT[request.status] ?? "outline"}>{request.status}</Badge>
        </div>
      </div>

      {validTransitions.length > 0 && (
        <>
          <div className="mb-3">
            <TextArea
              rows={2}
              maxLength={2000}
              placeholder="Admin notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <Stack direction="row" className="gap-2 flex-wrap">
            {validTransitions.map(target => (
              <Button
                key={target}
                size="sm"
                variant={TRANSITION_VARIANT[target] ?? "default"}
                disabled={isPending}
                isPending={isPending}
                onClick={() =>
                  executeAsync({
                    id: request.id,
                    toStatus: target as "PENDING" | "IN_PROGRESS" | "FULFILLED" | "REJECTED",
                    notes: notes || undefined,
                  })
                }
              >
                → {target.replace("_", " ")}
              </Button>
            ))}
          </Stack>
        </>
      )}

      {validTransitions.length === 0 && (
        <p className="text-xs text-muted-foreground">Terminal state — no transitions available.</p>
      )}
    </div>
  )
}
