import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { CertificateTemplate } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteCertificateTemplates } from "~/server/admin/certificates/actions"

type CertificatesDeleteDialogProps = PropsWithChildren<{
  templates: CertificateTemplate[]
  onExecute?: () => void
}>

export const CertificatesDeleteDialog = ({
  templates,
  onExecute,
  ...props
}: CertificatesDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={templates.map(({ id }) => id)}
      label="certificate template"
      action={deleteCertificateTemplates}
      callbacks={{
        onExecute: () => {
          toast.success("Certificate templates deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
