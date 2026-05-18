"use client"

import { EllipsisIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { SubscriptionsDeleteDialog } from "~/app/admin/subscriptions/_components/subscriptions-delete-dialog"
import type { SubscriptionRow } from "~/app/admin/subscriptions/_components/subscriptions-table-columns"
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

  const subPath = `/admin/subscriptions/${subscription.id}`
  const isSubPage = pathname === subPath

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
          {!isSubPage && (
            <DropdownMenuItem asChild>
              <Link href={subPath}>Edit</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SubscriptionsDeleteDialog
        subscriptions={[subscription]}
        onExecute={() => router.push("/admin/subscriptions")}
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
