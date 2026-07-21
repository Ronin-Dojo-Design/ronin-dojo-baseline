"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import type { PlanningIntakeStatus } from "~/.generated/prisma/browser"
import { DataSelect } from "~/components/common/data-select"
import { updatePlanningIntakeStatus } from "~/server/web/actions/planning-intake"

const STATUS_OPTIONS: { value: PlanningIntakeStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "TRIAGED", label: "Triaged" },
  { value: "PROMOTED", label: "Promoted" },
  { value: "DISMISSED", label: "Dismissed" },
]

/**
 * In-row triage control for the PlanningIntake table (SESSION_0592) — mirrors the
 * `TechniqueFeatureToggle` idiom (a single small write control, optimistic local state, toast
 * feedback) rather than a `[id]` detail route: triage is a one-field status flip, no editor needed.
 */
export function PlanningIntakeStatusSelect({
  id,
  status,
}: {
  id: string
  status: PlanningIntakeStatus
}) {
  const [value, setValue] = useState<PlanningIntakeStatus>(status)

  const { execute, isPending } = useAction(updatePlanningIntakeStatus, {
    onSuccess: ({ data }) => {
      if (!data) return
      setValue(data.status)
      toast.success(`Marked ${data.status.toLowerCase()}.`)
    },
    onError: ({ error: { serverError } }) => {
      toast.error(serverError ?? "Failed to update status.")
    },
  })

  return (
    <DataSelect
      options={STATUS_OPTIONS}
      value={value}
      disabled={isPending}
      onValueChange={next => {
        const nextStatus = next as PlanningIntakeStatus
        setValue(nextStatus)
        execute({ id, status: nextStatus })
      }}
      aria-label="Triage status"
      size="sm"
      triggerClassName="w-32"
    />
  )
}
