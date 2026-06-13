import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteLeads } from "~/server/admin/leads/actions"
import type { LeadRow } from "~/server/admin/leads/queries"

type LeadsDeleteDialogProps = PropsWithChildren<{
  leads: LeadRow[]
  onExecute?: () => void
}>

export const LeadsDeleteDialog = ({ leads, onExecute, ...props }: LeadsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={leads.map(({ id }) => id)}
      label="lead"
      action={deleteLeads}
      callbacks={{
        onExecute: () => {
          toast.success("Lead(s) deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
