"use client"

import type { ComponentProps } from "react"
import { ContentAtomsDeleteDialog } from "~/app/app/content/_components/content-atoms-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import type { findContentAtoms } from "~/server/admin/content/queries"

type ContentAtomRow = Awaited<ReturnType<typeof findContentAtoms>>["atoms"][number]

type ContentAtomActionsProps = ComponentProps<typeof Button> & {
  atom: ContentAtomRow
}

export const ContentAtomActions = ({ className, atom, ...props }: ContentAtomActionsProps) => {
  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        <DropdownMenuItem render={<Link href={`/app/content/${atom.id}`} />}>Edit</DropdownMenuItem>
      </RowActionsMenu>

      <ContentAtomsDeleteDialog atoms={[atom]}>
        <RowDeleteButton {...props} />
      </ContentAtomsDeleteDialog>
    </Stack>
  )
}
