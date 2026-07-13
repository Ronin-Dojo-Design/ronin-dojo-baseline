"use client"

import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { User } from "~/.generated/prisma/browser"
import { AccountActionItems } from "~/app/app/users/_components/account-action-items"
import { UsersDeleteDialog } from "~/app/app/users/_components/users-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { useSession } from "~/lib/auth-client"
import { isAdmin } from "~/lib/authz-predicates"

type UserActionsProps = ComponentProps<typeof Button> & {
  user: User
}

export const UserActions = ({ user, className, ...props }: UserActionsProps) => {
  const { data: session } = useSession()
  const router = useRouter()

  if (user.id === session?.user.id) {
    return null
  }

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {/* WL-P2-35: `UserActions` now renders only inside the account detail page's
              `AccountSection`, so a self "Edit" link back to this page is dead — dropped.
              The detail route is Passport-keyed and no longer addressable by account id. */}
        <AccountActionItems user={user} />
      </RowActionsMenu>

      {!isAdmin(user) && (
        <UsersDeleteDialog users={[user]} onExecute={() => router.push("/app/users")}>
          <RowDeleteButton {...props} />
        </UsersDeleteDialog>
      )}
    </Stack>
  )
}
