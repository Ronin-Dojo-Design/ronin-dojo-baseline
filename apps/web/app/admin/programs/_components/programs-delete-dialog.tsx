import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { Program } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deletePrograms } from "~/server/admin/programs/actions"

type ProgramsDeleteDialogProps = PropsWithChildren<{
  programs: Program[]
  onExecute?: () => void
}>

export const ProgramsDeleteDialog = ({
  programs,
  onExecute,
  ...props
}: ProgramsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={programs.map(({ id }) => id)}
      label="program"
      action={deletePrograms}
      callbacks={{
        onExecute: () => {
          toast.success("Programs deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
