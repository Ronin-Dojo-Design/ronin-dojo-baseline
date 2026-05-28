"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { updateLineageTreeMemberSelectedRank } from "~/server/admin/lineage/actions"
import type { AdminLineageTreeMember } from "~/server/admin/lineage/queries"

const CLEAR_SELECTED_RANK = "__clear__"

function formatDate(date: Date | null) {
  if (!date) return "No award date"
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function rankAwardLabel(award: AdminLineageTreeMember["node"]["user"]["rankAwards"][number]) {
  const disciplineName = award.rank.rankSystem.discipline?.name ?? award.rank.rankSystem.name
  const rankName = award.rank.shortName
    ? `${award.rank.name} (${award.rank.shortName})`
    : award.rank.name

  return `${disciplineName} — ${rankName} · ${formatDate(award.awardedAt)}`
}

type LineageSelectedRankSelectProps = {
  treeId: string
  member: AdminLineageTreeMember
  label: string
}

export function LineageSelectedRankSelect({
  treeId,
  member,
  label,
}: LineageSelectedRankSelectProps) {
  const [value, setValue] = useState(member.rankAwardId ?? CLEAR_SELECTED_RANK)
  const action = useAction(updateLineageTreeMemberSelectedRank)
  const rankAwards = member.node.user.rankAwards

  if (rankAwards.length === 0) {
    return <Note className="text-xs">No rank awards on this profile yet.</Note>
  }

  function handleValueChange(nextValue: string) {
    const previousValue = value
    setValue(nextValue)

    toast.promise(
      async () => {
        const result = await action.executeAsync({
          treeId,
          memberId: member.id,
          rankAwardId: nextValue,
        })

        if (result?.serverError) {
          setValue(previousValue)
          throw new Error(result.serverError)
        }
      },
      {
        loading: "Updating selected rank...",
        success:
          nextValue === CLEAR_SELECTED_RANK ? "Selected rank cleared." : "Selected rank updated.",
        error: error => `Could not update selected rank: ${error.message}`,
      },
    )
  }

  return (
    <Stack direction="column" size="xs" className="min-w-0">
      <Label className="sr-only" htmlFor={`selected-rank-${member.id}`}>
        {label}
      </Label>
      <Select value={value} onValueChange={next => handleValueChange(String(next))}>
        <SelectTrigger id={`selected-rank-${member.id}`} size="sm" disabled={action.isExecuting}>
          <SelectValue placeholder="Select display rank" />
        </SelectTrigger>
        <SelectContent align="end" className="max-w-80">
          <SelectItem value={CLEAR_SELECTED_RANK}>No selected rank</SelectItem>
          {rankAwards.map(award => (
            <SelectItem key={award.id} value={award.id}>
              {rankAwardLabel(award)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {member.selectedRankAward && (
        <Note className="truncate text-xs">
          Current: {member.selectedRankAward.rank.shortName ?? member.selectedRankAward.rank.name}
        </Note>
      )}
    </Stack>
  )
}
