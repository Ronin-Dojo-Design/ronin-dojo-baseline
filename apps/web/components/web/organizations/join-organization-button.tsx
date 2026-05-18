"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import type { Brand } from "~/.generated/prisma/client"
import { Button } from "~/components/common/button"
import { joinOrganization } from "~/server/web/organization/actions"

interface JoinOrganizationButtonProps {
  organizationId: string
  disciplineId: string
  brand: Brand
}

export const JoinOrganizationButton = ({
  organizationId,
  disciplineId,
  brand,
}: JoinOrganizationButtonProps) => {
  const router = useRouter()

  const { execute, isPending } = useAction(joinOrganization, {
    onSuccess: () => {
      toast.success("Join request submitted!")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong")
    },
  })

  return (
    <Button
      size="sm"
      variant="secondary"
      isPending={isPending}
      onClick={() => execute({ organizationId, disciplineId, brand })}
    >
      Join
    </Button>
  )
}
