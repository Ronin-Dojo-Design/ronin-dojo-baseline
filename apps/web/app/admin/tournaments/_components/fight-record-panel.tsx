"use client"

import { AwardIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { use, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardHeader } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import { H3 } from "~/components/common/heading"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"
import { publishFightRecord } from "~/server/admin/tournaments/actions"
import type { findFightRecordsByTournament } from "~/server/admin/tournaments/queries"

type CompletedMatch = {
  id: string
  roundNumber: number
  matchNumber: number
  divisionName: string
  competitorNames: string[]
}

type FightRecordPanelProps = {
  fightRecordsPromise: ReturnType<typeof findFightRecordsByTournament>
  completedMatches: CompletedMatch[]
}

export function FightRecordPanel({ fightRecordsPromise, completedMatches }: FightRecordPanelProps) {
  const fightRecords = use(fightRecordsPromise)
  const [open, setOpen] = useState(false)
  const [selectedMatchId, setSelectedMatchId] = useState("")

  const { executeAsync: publish, isPending } = useAction(publishFightRecord)

  const handlePublish = async () => {
    if (!selectedMatchId) return
    const result = await publish({ matchId: selectedMatchId })
    if (result?.data) {
      toast.success(`Fight records published for ${result.data.published} competitors`)
      setOpen(false)
      setSelectedMatchId("")
    } else {
      toast.error("Failed to publish fight records")
    }
  }

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" className="items-center justify-between">
          <H3>Fight Records ({fightRecords.length})</H3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="secondary" size="sm" disabled={completedMatches.length === 0} />
              }
            >
              <AwardIcon className="mr-1 size-4" />
              Publish from Match
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish Fight Records</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Note>
                  Select a completed match to publish official fight records. This updates each
                  competitor's win/loss/draw record for their discipline.
                </Note>
                <Select
                  onValueChange={v => setSelectedMatchId(v as string)}
                  value={selectedMatchId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a completed match" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedMatches.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.divisionName} — R{m.roundNumber} M{m.matchNumber}
                        {m.competitorNames.length > 0 && ` (${m.competitorNames.join(" vs ")})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handlePublish} disabled={!selectedMatchId || isPending}>
                  {isPending ? "Publishing..." : "Publish Records"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Stack>
      </CardHeader>
      <div className="p-4 pt-0">
        {fightRecords.length === 0 ? (
          <Note>
            No fight records published yet. Complete matches and publish records to track competitor
            W/L/D.
          </Note>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competitor</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Wins</TableHead>
                <TableHead>Losses</TableHead>
                <TableHead>Draws</TableHead>
                <TableHead>No Contest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fightRecords.map(fr => (
                <TableRow key={fr.id}>
                  <TableCell className="font-medium">{fr.user.name ?? fr.user.email}</TableCell>
                  <TableCell>{fr.discipline.name}</TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">
                      {fr.wins}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="danger" size="sm">
                      {fr.losses}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="soft" size="sm">
                      {fr.draws}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="soft" size="sm">
                      {fr.noContests}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
