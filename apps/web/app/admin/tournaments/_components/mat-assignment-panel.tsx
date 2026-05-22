"use client"

import { formatDate } from "@dirstack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { PlusIcon, TrashIcon } from "lucide-react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
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
import { deleteMatAssignment, upsertMatAssignment } from "~/server/admin/tournaments/actions"
import type { findMatAssignmentsByTournament } from "~/server/admin/tournaments/queries"
import { matAssignmentSchema } from "~/server/admin/tournaments/schema"

const STATUS_VARIANT: Record<string, "success" | "warning" | "soft"> = {
  PENDING: "soft",
  ACTIVE: "warning",
  COMPLETED: "success",
}

type Match = {
  id: string
  roundNumber: number
  matchNumber: number
  status: string
  divisionName: string
  competitorNames: string[]
}

type MatAssignmentPanelProps = {
  tournamentId: string
  assignmentsPromise: ReturnType<typeof findMatAssignmentsByTournament>
  unassignedMatches: Match[]
}

export function MatAssignmentPanel({
  tournamentId,
  assignmentsPromise,
  unassignedMatches,
}: MatAssignmentPanelProps) {
  const assignments = use(assignmentsPromise)
  const [open, setOpen] = useState(false)

  const { executeAsync: handleDelete } = useAction(deleteMatAssignment)

  const onDelete = async (id: string) => {
    const result = await handleDelete({ id })
    if (result?.data) {
      toast.success("Mat assignment removed")
    }
  }

  const { form, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(
    upsertMatAssignment,
    zodResolver(matAssignmentSchema),
    {
      formProps: {
        defaultValues: {
          tournamentId,
          matchId: "",
          matName: "",
          startTime: null,
          endTime: null,
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success("Mat assignment saved")
          setOpen(false)
          resetFormAndAction()
        },
        onError: ({ error }) => {
          toast.error(error?.serverError ?? "Failed to save mat assignment")
        },
      },
    },
  )

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" className="items-center justify-between">
          <H3>Mat Assignments ({assignments.length})</H3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="secondary" size="sm" disabled={unassignedMatches.length === 0} />
              }
            >
              <PlusIcon className="mr-1 size-4" />
              Assign Match
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Match to Mat</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={handleSubmitWithAction} className="space-y-4">
                  <input type="hidden" {...form.register("tournamentId")} />

                  <FormField
                    control={form.control}
                    name="matchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a match" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unassignedMatches.map(m => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.divisionName} — R{m.roundNumber} M{m.matchNumber}
                                {m.competitorNames.length > 0 &&
                                  ` (${m.competitorNames.join(" vs ")})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="matName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mat / Ring Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mat 1, Ring A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().slice(0, 16)
                                : typeof field.value === "string"
                                  ? field.value.slice(0, 16)
                                  : ""
                            }
                            onChange={e =>
                              field.onChange(e.target.value ? new Date(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">Assign</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </Stack>
      </CardHeader>
      <div className="p-4 pt-0">
        {assignments.length === 0 ? (
          <Note>No mat assignments yet. Assign matches to mats/rings for day-of scheduling.</Note>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mat</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Competitors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(a => {
                const competitors = a.match.competitors
                  .map(c => c.registrationEntry.registration.user.name ?? "TBD")
                  .join(" vs ")
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.matName}</TableCell>
                    <TableCell>{a.match.bracket.division.name}</TableCell>
                    <TableCell>
                      <Note>
                        R{a.match.roundNumber} M{a.match.matchNumber}
                      </Note>
                    </TableCell>
                    <TableCell>{competitors || "TBD"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[a.status] ?? "soft"} size="sm">
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Note>{a.startTime ? formatDate(a.startTime) : "—"}</Note>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(a.id)}>
                        <TrashIcon className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
