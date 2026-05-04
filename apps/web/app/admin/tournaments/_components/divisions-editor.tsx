"use client"

import { PlusIcon, TrashIcon } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import { DivisionFormat, DivisionGender } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
import { H3 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Badge } from "~/components/common/badge"
import {
  deleteDivision,
  deleteTournamentDiscipline,
} from "~/server/admin/tournaments/actions"
import type { findTournamentById } from "~/server/admin/tournaments/queries"

type Tournament = NonNullable<Awaited<ReturnType<typeof findTournamentById>>>

type DivisionsEditorProps = {
  tournament: Tournament
}

export function DivisionsEditor({ tournament }: DivisionsEditorProps) {
  const [isPending, startTransition] = useTransition()

  const handleDeleteDivision = (id: string) => {
    startTransition(async () => {
      const result = await deleteDivision({ id })
      if (result?.data) {
        toast.success("Division removed")
      }
    })
  }

  const handleDeleteDiscipline = (id: string) => {
    startTransition(async () => {
      const result = await deleteTournamentDiscipline({ id })
      if (result?.data) {
        toast.success("Discipline removed")
      }
    })
  }

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
        <div key={td.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{td.discipline.name}</div>
            <Button
              variant="ghost"
              size="sm"
              prefix={<TrashIcon className="size-4" />}
              onClick={() => handleDeleteDiscipline(td.id)}
              disabled={isPending}
              aria-label="Remove discipline"
            />
          </div>

          {td.divisions.length === 0 && (
            <p className="text-sm text-muted-foreground pl-2">No divisions yet.</p>
          )}

          <div className="space-y-2 pl-2">
            {td.divisions.map(div => (
              <div key={div.id} className="flex items-center gap-3 rounded border px-3 py-2">
                <div className="flex-1">
                  <span className="font-medium text-sm">{div.name}</span>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="soft">{div.format}</Badge>
                    <Badge variant="soft">{div.gender}</Badge>
                    {div.ageMin != null && div.ageMax != null && (
                      <Badge variant="soft">Ages {div.ageMin}–{div.ageMax}</Badge>
                    )}
                    {div.capacity != null && (
                      <Badge variant="soft">Cap: {div.capacity}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  prefix={<TrashIcon className="size-4" />}
                  onClick={() => handleDeleteDivision(div.id)}
                  disabled={isPending}
                  aria-label="Remove division"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Stack>
  )
}
