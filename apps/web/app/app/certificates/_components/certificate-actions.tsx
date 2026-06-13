"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { CertificateTemplate } from "~/.generated/prisma/browser"
import { CertificatesDeleteDialog } from "~/app/app/certificates/_components/certificates-delete-dialog"
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

type CertificateActionsProps = ComponentProps<typeof Button> & {
  template: CertificateTemplate
}

export const CertificateActions = ({ template, className, ...props }: CertificateActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const templatePath = `/app/certificates/${template.id}`
  const isTemplatePage = pathname === templatePath

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
          {!isTemplatePage && (
            <DropdownMenuItem render={<Link href={templatePath} />}>Edit</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CertificatesDeleteDialog
        templates={[template]}
        onExecute={() => router.push("/app/certificates")}
      >
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          className="text-red-500"
          {...props}
        />
      </CertificatesDeleteDialog>
    </Stack>
  )
}
