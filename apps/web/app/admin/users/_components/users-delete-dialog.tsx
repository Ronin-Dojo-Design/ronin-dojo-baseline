import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { User } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteUsers } from "~/server/admin/users/actions"

type UsersDeleteDialogProps = PropsWithChildren<{
  users: User[]
  onExecute?: () => void
}>

export const UsersDeleteDialog = ({ users, onExecute, ...props }: UsersDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={users.map(({ id }) => id)}
      label="user"
      action={deleteUsers}
      callbacks={{
        onExecute: () => {
          toast.success("User(s) deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
