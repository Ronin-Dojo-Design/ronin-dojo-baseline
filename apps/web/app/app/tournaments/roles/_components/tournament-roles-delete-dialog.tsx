import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { TournamentRole } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteTournamentRoles } from "~/server/admin/tournaments/actions"

type TournamentRolesDeleteDialogProps = PropsWithChildren<{
  roles: TournamentRole[]
  onExecute?: () => void
}>

export const TournamentRolesDeleteDialog = ({
  roles,
  onExecute,
  ...props
}: TournamentRolesDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={roles.map(({ id }) => id)}
      label="tournament role"
      action={deleteTournamentRoles}
      callbacks={{
        onExecute: () => {
          toast.success("Tournament roles deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
