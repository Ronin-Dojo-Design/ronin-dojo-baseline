"use client"

import { EllipsisIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { SubscriptionsDeleteDialog } from "~/app/app/subscriptions/_components/subscriptions-delete-dialog"
import type { SubscriptionRow } from "~/app/app/subscriptions/_components/subscriptions-table-columns"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

type SubscriptionActionsProps = ComponentProps<typeof Button> & {
  subscription: SubscriptionRow
}

export const SubscriptionActions = ({
  subscription,
  className,
  ...props
}: SubscriptionActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const subPath = `/app/subscriptions/${subscription.id}`
  const isSubPage = pathname === subPath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isSubPage && <DropdownMenuItem render={<Link href={subPath} />}>Edit</DropdownMenuItem>}
      </RowActionsMenu>

      <SubscriptionsDeleteDialog
        subscriptions={[subscription]}
        onExecute={() => router.push("/app/subscriptions")}
      >
        <Button
          aria-label="Delete subscription"
          variant="secondary"
          size="sm"
          prefix={<EllipsisIcon />}
          className="text-destructive"
        />
      </SubscriptionsDeleteDialog>
    </Stack>
  )
}
