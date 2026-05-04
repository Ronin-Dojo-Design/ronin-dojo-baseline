"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { PricingPlansDeleteDialog } from "~/app/admin/pricing-plans/_components/pricing-plans-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import type { PricingPlan } from "~/.generated/prisma/browser"

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

  const planPath = `/admin/pricing-plans/${pricingPlan.id}`
  const isPlanPage = pathname === planPath

  return (
    <Stack size="sm" wrap={false}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="secondary"
            size="sm"
            prefix={<EllipsisIcon />}
            className={cx("data-[state=open]:bg-accent", className)}
            {...props}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8}>
          {!isPlanPage && (
            <DropdownMenuItem asChild>
              <Link href={planPath}>Edit</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PricingPlansDeleteDialog
        pricingPlans={[pricingPlan]}
        onExecute={() => router.push("/admin/pricing-plans")}
      >
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          className="text-red-500"
          {...props}
        />
      </PricingPlansDeleteDialog>
    </Stack>
  )
}
