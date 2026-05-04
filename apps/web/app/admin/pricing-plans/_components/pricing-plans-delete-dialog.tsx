import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { PricingPlan } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deletePricingPlans } from "~/server/admin/pricing-plans/actions"

type PricingPlansDeleteDialogProps = PropsWithChildren<{
  pricingPlans: Pick<PricingPlan, "id">[]
  onExecute?: () => void
}>

export const PricingPlansDeleteDialog = ({
  pricingPlans,
  onExecute,
  ...props
}: PricingPlansDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={pricingPlans.map(({ id }) => id)}
      label="pricing plan"
      action={deletePricingPlans}
      callbacks={{
        onExecute: () => {
          toast.success("Pricing plans deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
