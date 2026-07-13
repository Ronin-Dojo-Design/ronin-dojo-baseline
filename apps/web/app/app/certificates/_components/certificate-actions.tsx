"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { CertificateTemplate } from "~/.generated/prisma/browser"
import { CertificatesDeleteDialog } from "~/app/app/certificates/_components/certificates-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

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
      <RowActionsMenu className={className} {...props}>
        {!isTemplatePage && (
          <DropdownMenuItem render={<Link href={templatePath} />}>Edit</DropdownMenuItem>
        )}
      </RowActionsMenu>

      <CertificatesDeleteDialog
        templates={[template]}
        onExecute={() => router.push("/app/certificates")}
      >
        <RowDeleteButton {...props} />
      </CertificatesDeleteDialog>
    </Stack>
  )
}
