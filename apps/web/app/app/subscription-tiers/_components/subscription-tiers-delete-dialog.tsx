import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { SubscriptionTier } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteSubscriptionTiers } from "~/server/admin/subscription-tiers/actions"

type SubscriptionTiersDeleteDialogProps = PropsWithChildren<{
  tiers: SubscriptionTier[]
  onExecute?: () => void
}>

export const SubscriptionTiersDeleteDialog = ({
  tiers,
  onExecute,
  ...props
}: SubscriptionTiersDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={tiers.map(({ id }) => id)}
      label="subscription tier"
      action={deleteSubscriptionTiers}
      callbacks={{
        onExecute: () => {
          toast.success("Subscription tiers deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
