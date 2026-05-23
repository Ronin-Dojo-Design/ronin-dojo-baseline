import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteContentAtoms } from "~/server/admin/content/actions"
import type { findContentAtoms } from "~/server/admin/content/queries"

type ContentAtomRow = Awaited<ReturnType<typeof findContentAtoms>>["atoms"][number]

type ContentAtomsDeleteDialogProps = PropsWithChildren<{
  atoms: ContentAtomRow[]
  onExecute?: () => void
}>

export const ContentAtomsDeleteDialog = ({
  atoms,
  onExecute,
  ...props
}: ContentAtomsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={atoms.map(({ id }) => id)}
      label="content atom"
      action={deleteContentAtoms}
      callbacks={{
        onExecute: () => {
          toast.success("Content atom(s) deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
