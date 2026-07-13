"use client"

import {} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { TournamentRole } from "~/.generated/prisma/browser"
import { TournamentRolesDeleteDialog } from "~/app/app/tournaments/roles/_components/tournament-roles-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"

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

  const rolePath = `/app/tournaments/roles/${role.id}`
  const isRolePage = pathname === rolePath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isRolePage && <DropdownMenuItem render={<Link href={rolePath} />}>Edit</DropdownMenuItem>}
      </RowActionsMenu>

      {role.isSystem ? (
        <Tooltip>
          <TooltipTrigger render={<RowDeleteButton disabled {...props} />} />
          <TooltipContent>System roles cannot be deleted</TooltipContent>
        </Tooltip>
      ) : (
        <TournamentRolesDeleteDialog
          roles={[role]}
          onExecute={() => router.push("/app/tournaments/roles")}
        >
          <RowDeleteButton {...props} />
        </TournamentRolesDeleteDialog>
      )}
    </Stack>
  )
}
