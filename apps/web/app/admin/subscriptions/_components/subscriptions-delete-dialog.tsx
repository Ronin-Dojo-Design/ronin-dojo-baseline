import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { UserBrandSubscription } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteSubscriptions } from "~/server/admin/subscriptions/actions"

type SubscriptionsDeleteDialogProps = PropsWithChildren<{
  subscriptions: UserBrandSubscription[]
  onExecute?: () => void
}>

export const SubscriptionsDeleteDialog = ({
  subscriptions,
  onExecute,
  ...props
}: SubscriptionsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={subscriptions.map(({ id }) => id)}
      label="subscription"
      action={deleteSubscriptions}
      callbacks={{
        onExecute: () => {
          toast.success("Subscriptions deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
