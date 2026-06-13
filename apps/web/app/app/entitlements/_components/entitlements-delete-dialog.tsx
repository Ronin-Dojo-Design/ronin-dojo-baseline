import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { Entitlement } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteEntitlements } from "~/server/admin/entitlements/actions"

type EntitlementsDeleteDialogProps = PropsWithChildren<{
  entitlements: Entitlement[]
  onExecute?: () => void
}>

export const EntitlementsDeleteDialog = ({
  entitlements,
  onExecute,
  ...props
}: EntitlementsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={entitlements.map(({ id }) => id)}
      label="entitlement"
      action={deleteEntitlements}
      callbacks={{
        onExecute: () => {
          toast.success("Entitlements deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
