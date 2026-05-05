"use client"

import { PlusIcon, TrashIcon } from "lucide-react"
import { use, useState } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardHeader } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Tooltip } from "~/components/common/tooltip"
import { StaffAssignmentForm } from "~/app/admin/tournaments/_components/staff-assignment-form"
import { deleteTournamentStaffAssignments } from "~/server/admin/tournaments/actions"
import type { findTournamentStaff, findTournamentRoles } from "~/server/admin/tournaments/queries"

type StaffPanelProps = {
  tournamentId: string
  staffPromise: ReturnType<typeof findTournamentStaff>
  rolesPromise: ReturnType<typeof findTournamentRoles>
  divisions: { id: string; name: string }[]
  users: { id: string; name: string | null; email: string }[]
}

export function StaffPanel({
  tournamentId,
  staffPromise,
  rolesPromise,
  divisions,
  users,
}: StaffPanelProps) {
  const staff = use(staffPromise)
  const roles = use(rolesPromise)
  const [open, setOpen] = useState(false)

  const { executeAsync: deleteStaff } = useAction(deleteTournamentStaffAssignments)

  const handleDelete = (id: string) => {
    toast.promise(
      async () => {
        const { serverError } = await deleteStaff({ ids: [id] })
        if (serverError) throw new Error(serverError)
      },
      {
        loading: "Removing staff...",
        success: "Staff removed successfully",
        error: (err) => `Failed: ${err.message}`,
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <Stack className="justify-between">
          <H3>Staff Assignments</H3>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="sm" prefix={<PlusIcon />}>
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Staff Assignment</DialogTitle>
              </DialogHeader>
              <StaffAssignmentForm
                tournamentId={tournamentId}
                roles={roles}
                divisions={divisions}
                users={users}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </Stack>
      </CardHeader>

      <div className="p-4 pt-0">
        {staff.length === 0 ? (
          <Note>No staff assigned yet.</Note>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Note>{s.user.name ?? s.user.email}</Note>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.tournamentRole.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.division ? (
                      <Tooltip tooltip="This staff member is scoped to this division only">
                        <Badge variant="outline">{s.division.name}</Badge>
                      </Tooltip>
                    ) : (
                      <Note>All</Note>
                    )}
                  </TableCell>
                  <TableCell>
                    <Note className="max-w-48 truncate">{s.notes ?? "—"}</Note>
                  </TableCell>
                  <TableCell>
                    <Tooltip tooltip="Remove staff assignment">
                      <Button
                        variant="secondary"
                        size="sm"
                        prefix={<TrashIcon />}
                        className="text-red-500"
                        onClick={() => handleDelete(s.id)}
                      />
                    </Tooltip>
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
