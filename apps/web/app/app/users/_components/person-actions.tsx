"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { type ComponentProps, useTransition } from "react"
import { toast } from "sonner"
import { PeopleDeleteDialog } from "~/app/app/users/_components/people-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { admin, useSession } from "~/lib/auth-client"
import { isAdmin } from "~/lib/authz-predicates"
import { cx } from "~/lib/utils"
import type { PersonRow } from "~/server/admin/people/queries"
import { updateUserRole } from "~/server/admin/users/actions"

type PersonActionsProps = ComponentProps<typeof Button> & {
  person: PersonRow
}

/**
 * Row actions for the Passport-keyed People list. Account-only actions (edit,
 * role change, ban/unban, revoke sessions, delete-account) are gated behind a linked
 * account (`person.user`) — an accountless roster placeholder (userId == null) has no
 * account to act on, so this renders nothing for it until the identity-level editor
 * lands (deferred TASK_02b). Adapted from `user-actions.tsx`; the account-side behavior
 * is byte-identical (same `updateUserRole` / Better Auth `admin` calls, same guards).
 */
export const PersonActions = ({ person, className, ...props }: PersonActionsProps) => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isUpdatePending, startUpdateTransition] = useTransition()
  const roles = ["admin", "user", "tournament_director"] as const

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
          {pathname !== `/app/users/${user.id}` && (
            <DropdownMenuItem render={<Link href={`/app/users/${user.id}`} />}>
              Edit
            </DropdownMenuItem>
          )}

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Role</DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={user.role}
                onValueChange={value => {
                  startUpdateTransition(() => {
                    toast.promise(
                      async () => {
                        await updateUserRole({
                          id: user.id,
                          role: value as (typeof roles)[number],
                        })

                        router.refresh()
                      },
                      { loading: "Updating...", success: "Role successfully updated" },
                    )
                  })
                }}
              >
                {roles.map(role => (
                  <DropdownMenuRadioItem
                    key={role}
                    value={role}
                    className="capitalize"
                    disabled={isUpdatePending}
                  >
                    {role.replace(/_/g, " ")}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Identity-only row chrome (authz-conformance sweep item 3): shared `isAdmin`
              predicate on the TARGET account, not a forked `role === "admin"`. */}
          {!isAdmin(user) &&
            (user.banned ? (
              <DropdownMenuItem
                onClick={() => {
                  toast.promise(
                    async () => {
                      await admin.unbanUser({ userId: user.id })
                      router.refresh()
                    },
                    { loading: "Unbanning...", success: "User successfully unbanned" },
                  )
                }}
              >
                Unban
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  toast.promise(
                    async () => {
                      await admin.banUser({ userId: user.id })
                      router.refresh()
                    },
                    { loading: "Banning...", success: "User successfully banned" },
                  )
                }}
              >
                Ban
              </DropdownMenuItem>
            ))}

          <DropdownMenuItem
            onClick={() => {
              toast.promise(admin.revokeUserSessions({ userId: user.id }), {
                loading: "Revoking sessions...",
                success: "Sessions successfully revoked",
              })
            }}
          >
            Revoke Sessions
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!isAdmin(user) && (
        <PeopleDeleteDialog userIds={[user.id]} onExecute={() => router.push("/app/users")}>
          <Button
            variant="secondary"
            size="sm"
            prefix={<TrashIcon />}
            className="text-red-500"
            {...props}
          />
        </PeopleDeleteDialog>
      )}
    </Stack>
  )
}
