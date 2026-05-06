"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EyeIcon, GripVerticalIcon, RotateCcwIcon, SwordsIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type CSSProperties, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { H3 } from "~/components/common/heading"
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
import {
  deleteDivision,
  deleteTournamentDiscipline,
  generateBracket,
  listDivisionSeedEntries,
} from "~/server/admin/tournaments/actions"
import type { SeedingMethod } from "~/server/admin/tournaments/bracket-seeding"
import type { findTournamentById } from "~/server/admin/tournaments/queries"

type Tournament = NonNullable<Awaited<ReturnType<typeof findTournamentById>>>
type TournamentDivision = Tournament["disciplines"][number]["divisions"][number] & {
  brackets?: { id: string }[]
  ruleSet?: { id: string; name: string; scoringMethod: string } | null
}

type DivisionsEditorProps = {
  tournament: Tournament
}

type SeedEntry = {
  entryId: string
  competitorName: string
}

type SortableSeedRowProps = SeedEntry & {
  seedNumber: number
  isDragDisabled: boolean
}

function SortableSeedRow({
  entryId,
  competitorName,
  seedNumber,
  isDragDisabled,
}: SortableSeedRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entryId,
    disabled: isDragDisabled,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: dnd-kit requires div wrapper for drag functionality
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-70" : undefined}
      role="listitem"
      aria-label={`Seed ${seedNumber}: ${competitorName}`}
    >
      <Card className="px-3 py-2">
        <Stack direction="row" size="sm" className="w-full items-center justify-between">
          <Stack direction="row" size="sm" className="items-center">
            <Button
              variant="ghost"
              size="sm"
              prefix={<GripVerticalIcon className="size-4" />}
              aria-label="Drag to reorder"
              disabled={isDragDisabled}
              {...attributes}
              {...listeners}
            />
            <Badge variant="primary" size="sm">
              Seed {seedNumber}
            </Badge>
            <span className="text-sm font-medium">{competitorName}</span>
          </Stack>
        </Stack>
      </Card>
    </div>
  )
}

export function DivisionsEditor({ tournament }: DivisionsEditorProps) {
  const router = useRouter()
  const [seedingDialogDivisionId, setSeedingDialogDivisionId] = useState<string | null>(null)
  const [selectedSeedingMethod, setSelectedSeedingMethod] =
    useState<SeedingMethod>("REGISTRATION_ORDER")
  const [seedEntries, setSeedEntries] = useState<SeedEntry[] | null>(null)
  const [seedOrder, setSeedOrder] = useState<string[]>([])
  const [seedEntriesDivisionId, setSeedEntriesDivisionId] = useState<string | null>(null)
  const [seedEntriesError, setSeedEntriesError] = useState<string | null>(null)

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
        setSeedEntries(null)
        setSeedOrder([])
        setSeedEntriesDivisionId(null)
        setSeedEntriesError(null)
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

  const listSeedEntriesAction = useAction(listDivisionSeedEntries, {
    onSuccess: ({ data }) => {
      if (!data) return
      setSeedEntries(data)
      setSeedOrder(data.map(e => e.entryId))
      setSeedEntriesError(null)
    },
    onError: ({ error }) => {
      setSeedEntriesError(error.serverError ?? "Failed to load division entries")
      setSeedEntries(null)
      setSeedOrder([])
    },
  })

  const isPending =
    deleteDivisionAction.isPending ||
    deleteDisciplineAction.isPending ||
    generateBracketAction.isPending ||
    listSeedEntriesAction.isPending

  const seedEntryMap = useMemo(() => {
    return new Map((seedEntries ?? []).map(e => [e.entryId, e] as const))
  }, [seedEntries])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    if (!seedingDialogDivisionId) return
    if (selectedSeedingMethod !== "MANUAL") return

    if (seedEntriesDivisionId === seedingDialogDivisionId && seedEntries) return

    setSeedEntries(null)
    setSeedOrder([])
    setSeedEntriesError(null)
    setSeedEntriesDivisionId(seedingDialogDivisionId)
    listSeedEntriesAction.execute({ id: seedingDialogDivisionId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedingDialogDivisionId, seedEntries, seedEntriesDivisionId, selectedSeedingMethod])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    if (active.id === over.id) return

    setSeedOrder(items => {
      const oldIndex = items.indexOf(String(active.id))
      const newIndex = items.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return items
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const isManualSeeding = selectedSeedingMethod === "MANUAL"
  const canGenerate =
    !!seedingDialogDivisionId &&
    !generateBracketAction.isPending &&
    (!isManualSeeding || (seedEntries != null && seedOrder.length >= 2))

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
                          <Badge variant="soft">
                            Ages {div.ageMin}–{div.ageMax}
                          </Badge>
                        )}
                        {div.capacity != null && <Badge variant="soft">Cap: {div.capacity}</Badge>}
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
        onOpenChange={open => {
          if (!open) {
            setSeedingDialogDivisionId(null)
            setSeedEntries(null)
            setSeedOrder([])
            setSeedEntriesDivisionId(null)
            setSeedEntriesError(null)
          }
        }}
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
                onValueChange={v => setSelectedSeedingMethod(v as SeedingMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGISTRATION_ORDER">Registration Order</SelectItem>
                  <SelectItem value="TOURNAMENT_RANKING">
                    Tournament Ranking (W/L record)
                  </SelectItem>
                  <SelectItem value="MARTIAL_ARTS_RANK">Martial Arts Rank</SelectItem>
                  <SelectItem value="MANUAL">Manual (custom seeding)</SelectItem>
                </SelectContent>
              </Select>
            </Stack>

            {isManualSeeding && (
              <Stack direction="column" size="sm" className="w-full">
                <Note>Drag competitors to set seed order. Top = Seed 1.</Note>

                {seedEntriesError && <Note className="text-destructive">{seedEntriesError}</Note>}

                <Stack direction="row" size="sm" className="w-full items-center justify-between">
                  <Badge variant="soft" size="sm">
                    {seedEntries ? `${seedEntries.length} competitors` : "Loading competitors…"}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    prefix={<RotateCcwIcon className="size-4" />}
                    onClick={() => {
                      if (seedEntries) {
                        setSeedOrder(seedEntries.map(e => e.entryId))
                      }
                    }}
                    disabled={!seedEntries || listSeedEntriesAction.isPending}
                  >
                    Reset
                  </Button>
                </Stack>

                {seedEntries && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext items={seedOrder} strategy={verticalListSortingStrategy}>
                      <Stack direction="column" size="xs" className="w-full">
                        {seedOrder.map((entryId, index) => {
                          const entry = seedEntryMap.get(entryId)
                          if (!entry) return null
                          return (
                            <SortableSeedRow
                              key={entryId}
                              entryId={entryId}
                              competitorName={entry.competitorName}
                              seedNumber={index + 1}
                              isDragDisabled={
                                listSeedEntriesAction.isPending || generateBracketAction.isPending
                              }
                            />
                          )
                        })}
                      </Stack>
                    </SortableContext>
                  </DndContext>
                )}
              </Stack>
            )}
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
                    manualSeeds: isManualSeeding
                      ? seedOrder.map((entryId, i) => ({ entryId, seed: i + 1 }))
                      : undefined,
                  })
                }
              }}
              isPending={generateBracketAction.isPending}
              disabled={!canGenerate}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Stack>
  )
}
