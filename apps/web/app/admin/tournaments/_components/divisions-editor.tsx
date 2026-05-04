"use client"

import { PlusIcon, TrashIcon, SwordsIcon, EyeIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Badge } from "~/components/common/badge"
import {
  deleteDivision,
  deleteTournamentDiscipline,
  generateBracket,
} from "~/server/admin/tournaments/actions"
import type { findTournamentById } from "~/server/admin/tournaments/queries"

type Tournament = NonNullable<Awaited<ReturnType<typeof findTournamentById>>>
type TournamentDivision = Tournament["disciplines"][number]["divisions"][number] & {
  brackets?: { id: string }[]
}

type DivisionsEditorProps = {
  tournament: Tournament
}

export function DivisionsEditor({ tournament }: DivisionsEditorProps) {
  const router = useRouter()

  const deleteDivisionAction = useAction(deleteDivision, {
    onSuccess: () => toast.success("Division removed"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to delete division"),
  })

  const deleteDisciplineAction = useAction(deleteTournamentDiscipline, {
    onSuccess: () => toast.success("Discipline removed"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to delete discipline"),
  })

  const generateBracketAction = useAction(generateBracket, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(
          `Bracket generated: ${data.competitorCount} competitors, ${data.totalRounds} rounds${data.byeCount > 0 ? `, ${data.byeCount} byes` : ""}`,
        )
        router.push(`/admin/tournaments/${tournament.id}/brackets/${data.bracketId}`)
      }
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to generate bracket"),
  })

  const isPending =
    deleteDivisionAction.isPending ||
    deleteDisciplineAction.isPending ||
    generateBracketAction.isPending

  return (
    <Stack direction="column" size="md">
      <div className="flex items-center justify-between">
        <H3>Disciplines & Divisions</H3>
      </div>

      {tournament.disciplines.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No disciplines added yet. Add a discipline to start creating divisions.
        </p>
      )}

      {tournament.disciplines.map(td => (
        <Card key={td.id} className="p-4 space-y-3">
          <Stack direction="row" size="sm" className="justify-between items-center">
            <span className="font-medium">{td.discipline.name}</span>
            <Button
              variant="ghost"
              size="sm"
              prefix={<TrashIcon className="size-4" />}
              onClick={() => deleteDisciplineAction.execute({ id: td.id })}
              disabled={isPending}
              aria-label="Remove discipline"
            />
          </Stack>

          {td.divisions.length === 0 && (
            <p className="text-sm text-muted-foreground pl-2">No divisions yet.</p>
          )}

          <Stack direction="column" size="sm" className="pl-2">
            {td.divisions.map(div => {
              const division = div as TournamentDivision
              return (
                <Card key={div.id} className="px-3 py-2">
                  <Stack direction="row" size="sm" className="items-center">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{div.name}</span>
                      <Stack direction="row" size="sm" className="mt-1">
                        <Badge variant="soft">{div.format}</Badge>
                        <Badge variant="soft">{div.gender}</Badge>
                        {div.ageMin != null && div.ageMax != null && (
                          <Badge variant="soft">Ages {div.ageMin}–{div.ageMax}</Badge>
                        )}
                        {div.capacity != null && (
                          <Badge variant="soft">Cap: {div.capacity}</Badge>
                        )}
                      </Stack>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      prefix={<SwordsIcon className="size-4" />}
                      onClick={() => generateBracketAction.execute({ divisionId: div.id })}
                      disabled={isPending}
                      aria-label="Generate bracket"
                    >
                      Bracket
                    </Button>
                    {division.brackets?.[0] && (
                      <Button
                        variant="secondary"
                        size="sm"
                        prefix={<EyeIcon className="size-4" />}
                        onClick={() =>
                          router.push(
                            `/admin/tournaments/${tournament.id}/brackets/${division.brackets![0].id}`,
                          )
                        }
                        disabled={isPending}
                        aria-label="View bracket"
                      >
                        View
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      prefix={<TrashIcon className="size-4" />}
                      onClick={() => deleteDivisionAction.execute({ id: div.id })}
                      disabled={isPending}
                      aria-label="Remove division"
                    />
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
