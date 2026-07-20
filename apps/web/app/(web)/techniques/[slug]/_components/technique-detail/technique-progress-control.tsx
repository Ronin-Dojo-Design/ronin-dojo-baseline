"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { TechniqueProgressStatus } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import {
  TechniqueProgressGlyph,
  techniqueProgressLabel,
} from "~/components/common/technique-progress-status"
import { client } from "~/lib/orpc-client"

/** Progression order for the status Select — matches the glyph's shape progression. */
const STATUS_OPTIONS = [
  TechniqueProgressStatus.NOT_STARTED,
  TechniqueProgressStatus.LEARNING,
  TechniqueProgressStatus.DRILLING,
  TechniqueProgressStatus.SPARRING,
  TechniqueProgressStatus.MASTERED,
] as const

const STATUS_ITEMS = Object.fromEntries(
  STATUS_OPTIONS.map(value => [value, techniqueProgressLabel[value]]),
)

type TechniqueProgressControlProps = {
  techniqueId: string
  /** The caller's current status — `NOT_STARTED` when never tracked. */
  initialStatus: TechniqueProgressStatus
  /** Whether a `TechniqueProgress` row exists at all (drives the "Clear" affordance). */
  initialIsTracked: boolean
}

/**
 * Own-user progress control (G-022 Lane B) — mounted near the Save row in
 * `technique-detail/index.tsx`. Renders the AUD2-5-ratified leading glyph plus a status `Select`
 * that upserts on change via `client.techniques.setProgress`; "Clear" calls
 * `client.techniques.clearProgress` and reverts the row to untracked. Optimistic with rollback on
 * error — only ever mounted for a signed-in viewer (the page omits it entirely for anonymous
 * visitors, since there is no "own progress" to show them).
 */
export function TechniqueProgressControl({
  techniqueId,
  initialStatus,
  initialIsTracked,
}: TechniqueProgressControlProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isTracked, setIsTracked] = useState(initialIsTracked)
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: unknown) => {
    const next = value as TechniqueProgressStatus
    const previousStatus = status
    const previousTracked = isTracked

    setStatus(next)
    setIsTracked(true)

    startTransition(async () => {
      try {
        await client.techniques.setProgress({ techniqueId, status: next })
        toast.success(`Marked ${techniqueProgressLabel[next].toLowerCase()}`)
      } catch (error) {
        setStatus(previousStatus)
        setIsTracked(previousTracked)
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Could not update your progress."
        toast.error(message)
      }
    })
  }

  const handleClear = () => {
    const previousStatus = status
    const previousTracked = isTracked

    setStatus(TechniqueProgressStatus.NOT_STARTED)
    setIsTracked(false)

    startTransition(async () => {
      try {
        await client.techniques.clearProgress({ techniqueId })
        toast.success("Progress cleared")
      } catch {
        setStatus(previousStatus)
        setIsTracked(previousTracked)
        toast.error("Could not clear your progress.")
      }
    })
  }

  return (
    <Stack size="xs" direction="row" className="items-center">
      <TechniqueProgressGlyph status={status} />
      <Select value={status} onValueChange={handleChange} items={STATUS_ITEMS} disabled={isPending}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(value => (
            <SelectItem key={value} value={value}>
              {techniqueProgressLabel[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isTracked && (
        <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleClear}>
          Clear
        </Button>
      )}
    </Stack>
  )
}
