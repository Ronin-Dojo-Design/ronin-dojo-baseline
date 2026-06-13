"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Report } from "~/.generated/prisma/browser"
import { ReportsDeleteDialog } from "~/app/app/reports/_components/reports-delete-dialog"
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

type ReportActionsProps = ComponentProps<typeof Button> & {
  report: Report
}

export const ReportActions = ({ report, className, ...props }: ReportActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

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
          {pathname !== `/app/reports/${report.id}` && (
            <DropdownMenuItem render={<Link href={`/app/reports/${report.id}`} />}>
              Edit
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportsDeleteDialog reports={[report]} onExecute={() => router.push("/app/reports")}>
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          className="text-red-500"
          {...props}
        />
      </ReportsDeleteDialog>
    </Stack>
  )
}
