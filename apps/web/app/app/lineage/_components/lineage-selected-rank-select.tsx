"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { DataSelect, type DataSelectOption } from "~/components/common/data-select"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { updateLineageTreeMemberSelectedRank } from "~/server/admin/lineage/actions"
import type { AdminLineageTreeMember } from "~/server/admin/lineage/queries"

const CLEAR_SELECTED_RANK = "__clear__"

function formatDate(date: Date | null) {
  if (!date) return "No award date"
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function rankAwardLabel(
  award: NonNullable<AdminLineageTreeMember["node"]["passport"]>["rankAwardsEarned"][number],
) {
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
  const rankAwards = member.node.passport?.rankAwardsEarned ?? []

  if (rankAwards.length === 0) {
    return <Note className="text-xs">No rank awards on this profile yet.</Note>
  }

  // DataSelect forwards a value→label `items` map to Base UI so a DB-preset
  // value renders its label (not the raw rankAward cuid). The optional `content`
  // adds a belt-color swatch (Rank.colorHex) to each dropdown row while the
  // collapsed trigger stays the plain string label.
  const rankOptions: DataSelectOption[] = [
    { value: CLEAR_SELECTED_RANK, label: "No selected rank" },
    ...rankAwards.map(award => {
      const optionLabel = rankAwardLabel(award)
      return {
        value: award.id,
        label: optionLabel,
        content: (
          <span className="flex min-w-0 items-center gap-2">
            <BeltSwatch colorHex={award.rank.colorHex} />
            <span className="truncate">{optionLabel}</span>
          </span>
        ),
      }
    }),
  ]

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
      <DataSelect
        id={`selected-rank-${member.id}`}
        size="sm"
        value={value}
        onValueChange={next => handleValueChange(String(next))}
        options={rankOptions}
        placeholder="Select display rank"
        disabled={action.isExecuting}
        align="end"
        contentClassName="max-w-80"
      />
      {member.selectedRankAward && (
        <Note className="truncate text-xs">
          Current: {member.selectedRankAward.rank.shortName ?? member.selectedRankAward.rank.name}
        </Note>
      )}
    </Stack>
  )
}
