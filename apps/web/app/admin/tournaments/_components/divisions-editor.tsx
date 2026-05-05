"use client"

import { useState } from "react"
import { PlusIcon, TrashIcon, SwordsIcon, EyeIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/common/dialog"
import { H3 } from "~/components/common/heading"
import { Label } from "~/components/common/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { Badge } from "~/components/common/badge"
import {
  deleteDivision,
  deleteTournamentDiscipline,
  generateBracket,
} from "~/server/admin/tournaments/actions"
import type { findTournamentById } from "~/server/admin/tournaments/queries"
import type { SeedingMethod } from "~/server/admin/tournaments/bracket-seeding"

type Tournament = NonNullable<Awaited<ReturnType<typeof findTournamentById>>>
type TournamentDivision = Tournament["disciplines"][number]["divisions"][number] & {
  brackets?: { id: string }[]
  ruleSet?: { id: string; name: string; scoringMethod: string } | null
}

type DivisionsEditorProps = {
  tournament: Tournament
}

export function DivisionsEditor({ tournament }: DivisionsEditorProps) {
  const router = useRouter()
  const [seedingDialogDivisionId, setSeedingDialogDivisionId] = useState<string | null>(null)
  const [selectedSeedingMethod, setSelectedSeedingMethod] = useState<SeedingMethod>("REGISTRATION_ORDER")

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
        setSeedingDialogDivisionId(null)
        toast.success(
          `Bracket generated: ${data.competitorCount} competitors, ${data.totalRounds} rounds${data.byeCount > 0 ? `, ${data.byeCount} byes` : ""}`,
        )
        router.push(`/admin/tournaments/${tournament.id}/brackets/${data.bracketId}`)
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to generate bracket")
    },
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
                        {(div as TournamentDivision).ruleSet && (
                          <Badge variant="info">{(div as TournamentDivision).ruleSet!.name}</Badge>
                        )}
                      </Stack>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      prefix={<SwordsIcon className="size-4" />}
                      onClick={() => {
                        setSelectedSeedingMethod("REGISTRATION_ORDER")
                        setSeedingDialogDivisionId(div.id)
                      }}
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

      <Dialog
        open={seedingDialogDivisionId != null}
        onOpenChange={(open) => { if (!open) setSeedingDialogDivisionId(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Bracket</DialogTitle>
          </DialogHeader>

          <Stack direction="column" size="md">
            <Stack direction="column" size="xs">
              <Label>Seeding Method</Label>
              <Select
                value={selectedSeedingMethod}
                onValueChange={(v) => setSelectedSeedingMethod(v as SeedingMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGISTRATION_ORDER">Registration Order</SelectItem>
                  <SelectItem value="TOURNAMENT_RANKING">Tournament Ranking (W/L record)</SelectItem>
                  <SelectItem value="MARTIAL_ARTS_RANK">Martial Arts Rank</SelectItem>
                  <SelectItem value="MANUAL">Manual (custom seeding)</SelectItem>
                </SelectContent>
              </Select>
            </Stack>
          </Stack>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSeedingDialogDivisionId(null)}
              disabled={generateBracketAction.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (seedingDialogDivisionId) {
                  generateBracketAction.execute({
                    divisionId: seedingDialogDivisionId,
                    seedingMethod: selectedSeedingMethod,
                  })
                }
              }}
              isPending={generateBracketAction.isPending}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  )
}
