"use client"

import { useRouter } from "next/navigation"
import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { User } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { client } from "~/lib/orpc-client"

/**
 * Safe-action-SHAPED adapter over the oRPC `users.remove` procedure (WL-P2-43): the shared
 * `DeleteDialog` speaks the next-safe-action hook contract (`{ data } | { serverError }`),
 * so the migrated transport plugs in behind the same UI shell — the server surface is
 * oRPC (the procedure owns its revalidation), while the dialog stays the ONE admin
 * delete-confirm component. Exported for `PeopleDeleteDialog` (same account-delete action).
 */
export const deleteUsersViaOrpc = async ({ ids }: { ids: string[] }) => {
  try {
    await client.users.remove({ ids })
    return { data: true }
  } catch (error) {
    return {
      serverError:
        error instanceof Error && error.message ? error.message : "Failed to delete user(s)",
    }
  }
}

type UsersDeleteDialogProps = PropsWithChildren<{
  users: User[]
  onExecute?: () => void
}>

export const UsersDeleteDialog = ({ users, onExecute, ...props }: UsersDeleteDialogProps) => {
  const router = useRouter()

  return (
    <DeleteDialog
      ids={users.map(({ id }) => id)}
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
