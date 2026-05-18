"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { TournamentRole } from "~/.generated/prisma/browser"
import { TournamentRolesDeleteDialog } from "~/app/admin/tournaments/roles/_components/tournament-roles-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Tooltip } from "~/components/common/tooltip"
import { cx } from "~/lib/utils"

type TournamentRoleActionsProps = Omit<ComponentProps<typeof Button>, "role"> & {
  role: TournamentRole
}

export const TournamentRoleActions = ({
  role,
  className,
  ...props
}: TournamentRoleActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const rolePath = `/admin/tournaments/roles/${role.id}`
  const isRolePage = pathname === rolePath

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
          {!isRolePage && (
            <DropdownMenuItem asChild>
              <Link href={rolePath}>Edit</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {role.isSystem ? (
        <Tooltip tooltip="System roles cannot be deleted">
          <Button
            variant="secondary"
            size="sm"
            prefix={<TrashIcon />}
            className="text-red-500"
            disabled
            {...props}
          />
        </Tooltip>
      ) : (
        <TournamentRolesDeleteDialog
          roles={[role]}
          onExecute={() => router.push("/admin/tournaments/roles")}
        >
          <Button
            variant="secondary"
            size="sm"
            prefix={<TrashIcon />}
            className="text-red-500"
            {...props}
          />
        </TournamentRolesDeleteDialog>
      )}
    </Stack>
  )
}
