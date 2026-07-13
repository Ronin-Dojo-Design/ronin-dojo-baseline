"use client"

import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import type { RegistrationRow } from "~/components/admin/tournaments/registrations-table-columns"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem, DropdownMenuSeparator } from "~/components/common/dropdown-menu"
import { Stack } from "~/components/common/stack"
import { updateRegistrationStatus } from "~/server/admin/tournaments/actions"
import { REGISTRATION_STATUS_TRANSITIONS } from "~/server/admin/tournaments/schema"

type RegistrationActionsProps = ComponentProps<typeof Button> & {
  registration: RegistrationRow
}

export const RegistrationActions = ({
  registration,
  className,
  ...props
}: RegistrationActionsProps) => {
  const router = useRouter()
  const allowed = REGISTRATION_STATUS_TRANSITIONS[registration.status] ?? []

  const { executeAsync, isPending } = useAction(updateRegistrationStatus, {
    onSuccess: () => {
      router.refresh()
    },
  })

  const handleStatusChange = (status: string) => {
    toast.promise(
      async () => {
        const { serverError } = await executeAsync({
          registrationId: registration.id,
          status: status as any,
        })
        if (serverError) throw new Error(serverError)
      },
      {
        loading: `Updating to ${status.toLowerCase()}...`,
        success: `Registration ${status.toLowerCase()} successfully`,
        error: err => `Failed: ${err.message}`,
      },
    )
  }

  if (allowed.length === 0) return null

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} disabled={isPending} {...props}>
        {allowed.includes("APPROVED") && (
          <DropdownMenuItem onClick={() => handleStatusChange("APPROVED")}>
            <CheckCircleIcon className="size-4 text-green-600" />
            Approve
          </DropdownMenuItem>
        )}

        {allowed.includes("WAITLISTED") && (
          <DropdownMenuItem onClick={() => handleStatusChange("WAITLISTED")}>
            <ClockIcon className="size-4 text-yellow-600" />
            Waitlist
          </DropdownMenuItem>
        )}

        {allowed.includes("CANCELLED") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleStatusChange("CANCELLED")}
              className="text-red-600"
            >
              <XCircleIcon className="size-4" />
              Cancel
            </DropdownMenuItem>
          </>
        )}
      </RowActionsMenu>
    </Stack>
  )
}
