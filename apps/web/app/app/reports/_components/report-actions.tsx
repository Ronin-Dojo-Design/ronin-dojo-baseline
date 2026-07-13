"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Report } from "~/.generated/prisma/browser"
import { ReportsDeleteDialog } from "~/app/app/reports/_components/reports-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

type ReportActionsProps = ComponentProps<typeof Button> & {
  report: Report
}

export const ReportActions = ({ report, className, ...props }: ReportActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {pathname !== `/app/reports/${report.id}` && (
          <DropdownMenuItem render={<Link href={`/app/reports/${report.id}`} />}>
            Edit
          </DropdownMenuItem>
        )}
      </RowActionsMenu>

      <ReportsDeleteDialog reports={[report]} onExecute={() => router.push("/app/reports")}>
        <RowDeleteButton {...props} />
      </ReportsDeleteDialog>
    </Stack>
  )
}
