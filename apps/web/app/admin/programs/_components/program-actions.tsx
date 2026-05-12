"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Program } from "~/.generated/prisma/browser"
import { ProgramsDeleteDialog } from "~/app/admin/programs/_components/programs-delete-dialog"
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

type ProgramActionsProps = ComponentProps<typeof Button> & {
  program: Program
}

export const ProgramActions = ({ program, className, ...props }: ProgramActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const programPath = `/admin/programs/${program.id}`
  const isProgramPage = pathname === programPath

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
          {!isProgramPage && (
            <DropdownMenuItem asChild>
              <Link href={programPath}>Edit</Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ProgramsDeleteDialog
        programs={[program]}
        onExecute={() => router.push("/admin/programs")}
      >
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          className="text-red-500"
          {...props}
        />
      </ProgramsDeleteDialog>
    </Stack>
  )
}
