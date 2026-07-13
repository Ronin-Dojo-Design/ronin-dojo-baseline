"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { AccountActionItems } from "~/app/app/users/_components/account-action-items"
import { PeopleDeleteDialog } from "~/app/app/users/_components/people-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { useSession } from "~/lib/auth-client"
import { isAdmin } from "~/lib/authz-predicates"
import type { PersonRow } from "~/server/admin/people/queries"

type PersonActionsProps = ComponentProps<typeof Button> & {
  person: PersonRow
}

/**
 * Row actions for the Passport-keyed People list. Account-only actions (edit,
 * role change, ban/unban, revoke sessions, delete-account) are gated behind a linked
 * account (`person.user`) — an accountless roster placeholder (userId == null) has no
 * account to act on, so this renders nothing for it (ADR 0045 D3: account-only actions
 * hide when `passport.userId == null`). The identity edit itself is reachable for EVERY
 * Person via the Passport-keyed detail route (WL-P2-35) — the name cell links there; this
 * menu's "Edit" is just the account-holder shortcut to that same page. Adapted from
 * `user-actions.tsx`; the account-side behavior is byte-identical (same `updateUserRole` /
 * Better Auth `admin` calls, same guards).
 */
export const PersonActions = ({ person, className, ...props }: PersonActionsProps) => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const { user } = person

  // Accountless placeholder → no account-level actions exist yet.
  if (!user) {
    return null
  }

  if (user.id === session?.user.id) {
    return null
  }

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {/* WL-P2-35: the detail route is Passport-keyed — link the passport id (person.id),
              not the account id. */}
        {pathname !== `/app/users/${person.id}` && (
          <DropdownMenuItem render={<Link href={`/app/users/${person.id}`} />}>
            Edit
          </DropdownMenuItem>
        )}

        <AccountActionItems user={user} />
      </RowActionsMenu>

      {!isAdmin(user) && (
        <PeopleDeleteDialog userIds={[user.id]} onExecute={() => router.push("/app/users")}>
          <RowDeleteButton {...props} />
        </PeopleDeleteDialog>
      )}
    </Stack>
  )
}
