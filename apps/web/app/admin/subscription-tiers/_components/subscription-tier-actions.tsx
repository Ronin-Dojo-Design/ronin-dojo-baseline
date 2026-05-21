"use client"

import { EllipsisIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { SubscriptionTier } from "~/.generated/prisma/browser"
import { SubscriptionTiersDeleteDialog } from "~/app/admin/subscription-tiers/_components/subscription-tiers-delete-dialog"
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

  const tierPath = `/admin/subscription-tiers/${tier.id}`
  const isTierPage = pathname === tierPath

  return (
    <Stack size="sm" wrap={false}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open menu"
              variant="secondary"
              size="sm"
              prefix={<EllipsisIcon />}
              className={cx("data-open:bg-accent", className)}
              {...props}
            />
          }
        />

        <DropdownMenuContent align="end" sideOffset={8}>
          {!isTierPage && (
            <DropdownMenuItem render={<Link href={tierPath} />}>Edit</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SubscriptionTiersDeleteDialog
        tiers={[tier]}
        onExecute={() => router.push("/admin/subscription-tiers")}
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
