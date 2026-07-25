"use client"

import { useRouter } from "next/navigation"
import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import { deleteUsersViaOrpc } from "~/app/app/users/_components/users-delete-dialog"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"

/**
 * Delete confirmation for the Passport-keyed People list. Delete is an ACCOUNT-only
 * action — it deletes the linked `User` via the oRPC `users.remove` procedure (WL-P2-43,
 * shared `deleteUsersViaOrpc` adapter), so it takes account ids directly (`userIds`)
 * rather than the People rows. Accountless placeholders never reach this (the row-action
 * gate hides delete for them). Thin `userIds` wrapper over `UsersDeleteDialog` so we don't
 * fabricate full `User` objects from the narrowed People-row account select.
 */
type PeopleDeleteDialogProps = PropsWithChildren<{
  userIds: string[]
  onExecute?: () => void
}>

export const PeopleDeleteDialog = ({ userIds, onExecute, ...props }: PeopleDeleteDialogProps) => {
  const router = useRouter()

  return (
    <DeleteDialog
      ids={userIds}
      label="user"
      action={deleteUsersViaOrpc}
      callbacks={{
        onExecute: () => {
          toast.success("User(s) deleted successfully")
          onExecute?.()
        },
        // The procedure revalidated /app/users server-side; the refresh re-renders the
        // list (a Server Action used to carry that re-render in-band — an RPC doesn't).
        onSuccess: () => router.refresh(),
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
