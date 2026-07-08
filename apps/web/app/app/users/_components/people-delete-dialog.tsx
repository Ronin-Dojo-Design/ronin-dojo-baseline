import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteUsers } from "~/server/admin/users/actions"

/**
 * Delete confirmation for the Passport-keyed People list. Delete is an ACCOUNT-only
 * action — it deletes the linked `User` via the unchanged `deleteUsers` action, so it
 * takes account ids directly (`userIds`) rather than the People rows. Accountless
 * placeholders never reach this (the row-action gate hides delete for them). Thin
 * `userIds` wrapper over `UsersDeleteDialog` so we don't fabricate full `User` objects
 * from the narrowed People-row account select.
 */
type PeopleDeleteDialogProps = PropsWithChildren<{
  userIds: string[]
  onExecute?: () => void
}>

export const PeopleDeleteDialog = ({ userIds, onExecute, ...props }: PeopleDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={userIds}
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
