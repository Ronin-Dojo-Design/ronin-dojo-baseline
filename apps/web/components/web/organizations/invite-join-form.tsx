"use client"

import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { joinByInviteCode } from "~/server/web/organization/actions"

interface Discipline {
  id: string
  name: string
}

interface InviteJoinFormProps {
  inviteCode: string
  orgName: string
  disciplines: Discipline[]
}

export const InviteJoinForm = ({
  inviteCode,
  orgName,
  disciplines,
}: InviteJoinFormProps) => {
  const router = useRouter()
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(
    disciplines.length === 1 ? disciplines[0].id : null,
  )

  const { execute, isPending } = useAction(joinByInviteCode, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success(`Welcome to ${orgName}!`)
      router.push(`/organizations/${data.org.slug}`)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong")
    },
  })

  return (
    <div className="max-w-md space-y-4">
      <p className="text-sm">Select a discipline to join:</p>

      <Stack size="sm" className="flex-wrap">
        {disciplines.map((d) => (
          <Badge
            key={d.id}
            size="lg"
            variant={selectedDisciplineId === d.id ? "primary" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedDisciplineId(d.id)}
          >
            {d.name}
          </Badge>
        ))}
      </Stack>

      <Button
        isPending={isPending}
        disabled={!selectedDisciplineId}
        onClick={() => {
          if (selectedDisciplineId) {
            execute({ inviteCode, disciplineId: selectedDisciplineId })
          }
        }}
      >
        Join {orgName}
      </Button>
    </div>
  )
}
