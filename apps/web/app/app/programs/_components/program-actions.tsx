"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Program } from "~/.generated/prisma/browser"
import { ProgramsDeleteDialog } from "~/app/app/programs/_components/programs-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

type ProgramActionsProps = ComponentProps<typeof Button> & {
  program: Program
}

export const ProgramActions = ({ program, className, ...props }: ProgramActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const programPath = `/app/programs/${program.id}`
  const isProgramPage = pathname === programPath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isProgramPage && (
          <DropdownMenuItem render={<Link href={programPath} />}>Edit</DropdownMenuItem>
        )}
      </RowActionsMenu>

      <ProgramsDeleteDialog programs={[program]} onExecute={() => router.push("/app/programs")}>
        <RowDeleteButton {...props} />
      </ProgramsDeleteDialog>
    </Stack>
  )
}
