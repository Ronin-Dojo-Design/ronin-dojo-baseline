"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import type { User } from "~/.generated/prisma/browser"
import {
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/components/common/dropdown-menu"
import { admin } from "~/lib/auth-client"
import { isAdmin } from "~/lib/authz-predicates"
import { updateUserRole } from "~/server/admin/users/actions"

const roles = ["admin", "user", "tournament_director"] as const

type AccountActionItemsProps = {
  /** The linked account to act on. Both call sites already select `id`/`role`/`banned`. */
  user: Pick<User, "id" | "role" | "banned">
}

/**
 * The shared account-action menu items — Role submenu, ban/unban, and revoke-sessions —
 * for the `/app/users` surfaces (AC-ECOSYSTEM-2). Extracted verbatim from the byte-identical
 * bodies that `person-actions.tsx` (list row kebab) and `user-actions.tsx` (detail account
 * panel) each carried; the menu items, server-action wiring (`updateUserRole` + Better Auth
 * `admin.*`), toasts, and the `isAdmin`-gated ban predicate are UNCHANGED — this is a pure
 * view-layer dedup, no authz change.
 *
 * Rendered as `DropdownMenuItem`/submenu CHILDREN inside each caller's own `RowActionsMenu`
 * shell. Everything else stays at the CALLER: the linked-account gate (list hides these for
 * accountless placeholders; detail's `AccountSection` is already `passport.userId != null`-
 * gated), the self-action guard, the leading detail-link "Edit" item (list only), and the
 * divergent delete dialog (`PeopleDeleteDialog`/`userIds` vs `UsersDeleteDialog`/`users`,
 * which lives OUTSIDE the menu as a `Stack` sibling). Only the identical item body is shared.
 */
export const AccountActionItems = ({ user }: AccountActionItemsProps) => {
  const router = useRouter()
  const [isUpdatePending, startUpdateTransition] = useTransition()

  return (
    <>
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
            predicate on the TARGET account, not a forked `role === "admin"`. Admin rows
            are never bannable. */}
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
    </>
  )
}
