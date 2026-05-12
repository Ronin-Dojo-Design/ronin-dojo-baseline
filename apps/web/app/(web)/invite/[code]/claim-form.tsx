"use client"

import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { ComboboxSelector } from "~/components/admin/combobox-selector"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { claimInvite } from "~/server/invites/actions"

type ClaimFormProps = {
  code: string
  organizationName: string
  disciplines: { id: string; name: string }[]
  userName: string
}

export function ClaimForm({ code, organizationName, disciplines, userName }: ClaimFormProps) {
  const router = useRouter()
  const [disciplineId, setDisciplineId] = useState<string>(
    disciplines.length === 1 ? disciplines[0].id : "",
  )

  const { execute, isPending } = useAction(claimInvite, {
    onSuccess: ({ data }) => {
      toast.success(`Welcome to ${data?.organizationName}!`)
      router.push("/me")
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to claim invite")
    },
  })

  const handleClaim = () => {
    if (!disciplineId) {
      toast.error("Please select a discipline")
      return
    }
    execute({ code, disciplineId })
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <H3>You&apos;re invited!</H3>
          <CardDescription>
            You&apos;ve been invited to join <strong>{organizationName}</strong>.
          </CardDescription>
        </CardHeader>

        <div className="p-6 pt-0 space-y-4">
          <div>
            <Note className="text-muted-foreground text-xs">Joining as</Note>
            <p>{userName}</p>
          </div>

          <div>
            <Note className="text-muted-foreground text-xs mb-1">Select your discipline</Note>
            {disciplines.length === 1 ? (
              <p>{disciplines[0].name}</p>
            ) : (
              <ComboboxSelector
                options={disciplines}
                value={disciplineId || null}
                onValueChange={setDisciplineId}
                placeholder="Select discipline"
                searchPlaceholder="Search disciplines..."
                emptyMessage="No disciplines available."
              />
            )}
          </div>

          <Stack className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isPending={isPending}
              onClick={handleClaim}
              disabled={!disciplineId}
            >
              Accept Invite &amp; Join
            </Button>
          </Stack>
        </div>
      </Card>
    </div>
  )
}
