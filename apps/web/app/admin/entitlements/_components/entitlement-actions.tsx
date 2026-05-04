"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Entitlement } from "~/.generated/prisma/browser"
import { EntitlementsDeleteDialog } from "~/app/admin/entitlements/_components/entitlements-delete-dialog"
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

type EntitlementActionsProps = ComponentProps<typeof Button> & {
  entitlement: Entitlement
}

export const EntitlementActions = ({
  entitlement,
  className,
  ...props
}: EntitlementActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const entitlementPath = `/admin/entitlements/${entitlement.id}`
  const isEntitlementPage = pathname === entitlementPath

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
          {!isEntitlementPage && (
            <DropdownMenuItem asChild>
              <Link href={entitlementPath}>Edit</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EntitlementsDeleteDialog
        entitlements={[entitlement]}
        onExecute={() => router.push("/admin/entitlements")}
      >
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          className="text-red-500"
          {...props}
        />
      </EntitlementsDeleteDialog>
    </Stack>
  )
}
