"use client"

import { EllipsisIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { SubscriptionTier } from "~/.generated/prisma/browser"
import { SubscriptionTiersDeleteDialog } from "~/app/app/subscription-tiers/_components/subscription-tiers-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

type SubscriptionTierActionsProps = ComponentProps<typeof Button> & {
  tier: SubscriptionTier
}

export const SubscriptionTierActions = ({
  tier,
  className,
  ...props
}: SubscriptionTierActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const tierPath = `/app/subscription-tiers/${tier.id}`
  const isTierPage = pathname === tierPath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isTierPage && <DropdownMenuItem render={<Link href={tierPath} />}>Edit</DropdownMenuItem>}
      </RowActionsMenu>

      <SubscriptionTiersDeleteDialog
        tiers={[tier]}
        onExecute={() => router.push("/app/subscription-tiers")}
      >
        <Button
          aria-label="Delete tier"
          variant="secondary"
          size="sm"
          prefix={<EllipsisIcon />}
          className="text-destructive"
        />
      </SubscriptionTiersDeleteDialog>
    </Stack>
  )
}
