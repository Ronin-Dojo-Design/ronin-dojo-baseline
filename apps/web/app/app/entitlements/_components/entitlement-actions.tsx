"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Entitlement } from "~/.generated/prisma/browser"
import { EntitlementsDeleteDialog } from "~/app/app/entitlements/_components/entitlements-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

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

  const entitlementPath = `/app/entitlements/${entitlement.id}`
  const isEntitlementPage = pathname === entitlementPath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isEntitlementPage && (
          <DropdownMenuItem render={<Link href={entitlementPath} />}>Edit</DropdownMenuItem>
        )}
      </RowActionsMenu>

      <EntitlementsDeleteDialog
        entitlements={[entitlement]}
        onExecute={() => router.push("/app/entitlements")}
      >
        <RowDeleteButton {...props} />
      </EntitlementsDeleteDialog>
    </Stack>
  )
}
