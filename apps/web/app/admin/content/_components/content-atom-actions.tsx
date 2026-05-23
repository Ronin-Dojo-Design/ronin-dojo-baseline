"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { ContentAtomsDeleteDialog } from "~/app/admin/content/_components/content-atoms-delete-dialog"
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
import type { findContentAtoms } from "~/server/admin/content/queries"

type ContentAtomRow = Awaited<ReturnType<typeof findContentAtoms>>["atoms"][number]

type ContentAtomActionsProps = ComponentProps<typeof Button> & {
  atom: ContentAtomRow
}

export const ContentAtomActions = ({ className, atom, ...props }: ContentAtomActionsProps) => {
  return (
    <Stack size="xs">
      <ContentAtomsDeleteDialog atoms={[atom]}>
        <Button variant="ghost" size="sm" prefix={<TrashIcon />} aria-label="Delete" {...props} />
      </ContentAtomsDeleteDialog>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              prefix={<EllipsisIcon />}
              aria-label="More actions"
              className={cx("text-muted", className)}
              {...props}
            />
          }
        />

        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/admin/content/${atom.id}`} />}>
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Stack>
  )
}
