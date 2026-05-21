"use client"

import { StarIcon, UserMinusIcon, UserPlusIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
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
  assignInstructor,
  setPrimaryInstructor,
  unassignInstructor,
} from "~/server/web/schedule/actions"

type InstructorOption = {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

type Assignment = {
  id: string
  isPrimary: boolean
  displayTitle: string | null
  user: InstructorOption
}

interface ScheduleInstructorListProps {
  classScheduleId: string
  assignments: Assignment[]
  eligibleInstructors: InstructorOption[]
}

export const ScheduleInstructorList = ({
  classScheduleId,
  assignments,
  eligibleInstructors,
}: ScheduleInstructorListProps) => {
  const [pendingUserId, setPendingUserId] = useState<string>("")

  const assignedIds = new Set(assignments.map(a => a.user.id))
  const remainingInstructors = eligibleInstructors.filter(i => !assignedIds.has(i.id))

  const assign = useAction(assignInstructor, {
    onSuccess: () => {
      toast.success("Instructor assigned")
      setPendingUserId("")
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to assign instructor"),
  })

  const unassign = useAction(unassignInstructor, {
    onSuccess: () => toast.success("Instructor removed"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to remove instructor"),
  })

  const setPrimary = useAction(setPrimaryInstructor, {
    onSuccess: () => toast.success("Primary instructor updated"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update primary"),
  })

  return (
    <Stack direction="column" className="gap-4">
      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No instructors assigned yet.</p>
      ) : (
        <ul className="space-y-2">
          {assignments.map(a => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-md border p-3"
            >
              <Stack size="sm" className="items-center">
                <Avatar>
                  {a.user.image && <AvatarImage src={a.user.image} alt={a.user.name ?? ""} />}
                  <AvatarFallback>
                    {(a.user.name ?? a.user.email ?? "?").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{a.user.name ?? a.user.email ?? "Unknown"}</p>
                  {a.displayTitle && (
                    <p className="text-xs text-muted-foreground">{a.displayTitle}</p>
                  )}
                </div>
                {a.isPrimary && <Badge variant="success">Primary</Badge>}
              </Stack>
              <Stack size="sm">
                {!a.isPrimary && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    prefix={<StarIcon />}
                    isPending={setPrimary.isPending && setPrimary.input?.assignmentId === a.id}
                    onClick={() => setPrimary.execute({ assignmentId: a.id })}
                  >
                    Make primary
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  prefix={<UserMinusIcon />}
                  isPending={unassign.isPending && unassign.input?.assignmentId === a.id}
                  onClick={() => unassign.execute({ assignmentId: a.id })}
                >
                  Remove
                </Button>
              </Stack>
            </li>
          ))}
        </ul>
      )}

      {remainingInstructors.length > 0 && (
        <Stack size="sm" className="flex-wrap">
          <Select value={pendingUserId} onValueChange={v => setPendingUserId(v as string)}>
            <SelectTrigger size="md" className="min-w-[16rem]">
              <SelectValue placeholder="Assign an instructor" />
            </SelectTrigger>
            <SelectContent>
              {remainingInstructors.map(i => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name ?? i.email ?? i.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="md"
            prefix={<UserPlusIcon />}
            disabled={!pendingUserId}
            isPending={assign.isPending}
            onClick={() =>
              assign.execute({
                classScheduleId,
                userId: pendingUserId,
                isPrimary: assignments.length === 0,
              })
            }
          >
            Assign
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
