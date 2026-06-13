"use client"

import { CalendarIcon, EllipsisIcon, EyeIcon, TrashIcon, XCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { LeadsDeleteDialog } from "~/app/app/leads/_components/leads-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import { markLeadLost, markLeadNurture } from "~/server/admin/leads/actions"
import type { LeadRow } from "~/server/admin/leads/queries"

type LeadActionsProps = ComponentProps<typeof Button> & {
  lead: LeadRow
}

export const LeadActions = ({ className, lead, ...props }: LeadActionsProps) => {
  const _router = useRouter()

  const { executeAsync: executeLost } = useAction(markLeadLost, {
    onSuccess: () => toast.success("Lead marked as lost"),
    onError: ({ error }) => toast.error(error.serverError),
  })

  const { executeAsync: executeNurture } = useAction(markLeadNurture, {
    onSuccess: () => toast.success("Lead moved to nurture"),
    onError: ({ error }) => toast.error(error.serverError),
  })

  const canMarkLost = !["CONVERTED", "LOST"].includes(lead.status)
  const canNurture = !["CONVERTED", "NURTURE"].includes(lead.status)

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
              className={cx("data-open:bg-accent", className)}
              {...props}
            />
          }
        />

        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuItem render={<Link href={`/app/leads/${lead.id}`} />}>
            <EyeIcon className="size-4 mr-2" /> View
          </DropdownMenuItem>

          {canNurture && (
            <DropdownMenuItem onClick={() => executeNurture({ id: lead.id })}>
              <CalendarIcon className="size-4 mr-2" /> Move to Nurture
            </DropdownMenuItem>
          )}

          {canMarkLost && (
            <DropdownMenuItem onClick={() => executeLost({ id: lead.id })}>
              <XCircleIcon className="size-4 mr-2" /> Mark Lost
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* The DropdownMenuItem is the DeleteDialog's trigger (DialogTrigger render);
              clicking opens the dialog — no menu handler needed (Base UI ignores onSelect). */}
          <LeadsDeleteDialog leads={[lead]}>
            <DropdownMenuItem>
              <TrashIcon className="size-4 mr-2" /> Delete
            </DropdownMenuItem>
          </LeadsDeleteDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </Stack>
  )
}
