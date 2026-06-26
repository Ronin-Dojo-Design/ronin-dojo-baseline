import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { Tournament } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteTournaments } from "~/server/admin/tournaments/actions"

type TournamentsDeleteDialogProps = PropsWithChildren<{
  tournaments: Tournament[]
  onExecute?: () => void
}>

export const TournamentsDeleteDialog = ({
  tournaments,
  onExecute,
  ...props
}: TournamentsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={tournaments.map(({ id }) => id)}
      label="tournament"
      action={deleteTournaments}
      callbacks={{
        onExecute: () => {
          toast.success("Tournaments deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
