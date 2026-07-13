"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { PricingPlan } from "~/.generated/prisma/browser"
import { PricingPlansDeleteDialog } from "~/app/app/pricing-plans/_components/pricing-plans-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

type PricingPlanActionsProps = ComponentProps<typeof Button> & {
  pricingPlan: PricingPlan
}

export const PricingPlanActions = ({
  pricingPlan,
  className,
  ...props
}: PricingPlanActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const planPath = `/app/pricing-plans/${pricingPlan.id}`
  const isPlanPage = pathname === planPath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isPlanPage && <DropdownMenuItem render={<Link href={planPath} />}>Edit</DropdownMenuItem>}
      </RowActionsMenu>

      <PricingPlansDeleteDialog
        pricingPlans={[pricingPlan]}
        onExecute={() => router.push("/app/pricing-plans")}
      >
        <RowDeleteButton {...props} />
      </PricingPlansDeleteDialog>
    </Stack>
  )
}
