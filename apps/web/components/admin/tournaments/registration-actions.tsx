"use client"

import { CheckCircleIcon, ClockIcon, EllipsisIcon, XCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import type { RegistrationRow } from "~/components/admin/tournaments/registrations-table-columns"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open menu"
              variant="secondary"
              size="sm"
              prefix={<EllipsisIcon />}
              disabled={isPending}
              className={cx("data-open:bg-accent", className)}
              {...props}
            />
          }
        />

        <DropdownMenuContent align="end" sideOffset={8}>
          {allowed.includes("APPROVED") && (
            <DropdownMenuItem onSelect={() => handleStatusChange("APPROVED")}>
              <CheckCircleIcon className="size-4 text-green-600" />
              Approve
            </DropdownMenuItem>
          )}

          {allowed.includes("WAITLISTED") && (
            <DropdownMenuItem onSelect={() => handleStatusChange("WAITLISTED")}>
              <ClockIcon className="size-4 text-yellow-600" />
              Waitlist
            </DropdownMenuItem>
          )}

          {allowed.includes("CANCELLED") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => handleStatusChange("CANCELLED")}
                className="text-red-600"
              >
                <XCircleIcon className="size-4" />
                Cancel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Stack>
  )
}
