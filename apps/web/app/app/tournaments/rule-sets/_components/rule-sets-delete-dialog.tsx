import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { RuleSet } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteRuleSets } from "~/server/admin/tournaments/actions"

type RuleSetsDeleteDialogProps = PropsWithChildren<{
  ruleSets: RuleSet[]
  onExecute?: () => void
}>

export const RuleSetsDeleteDialog = ({
  ruleSets,
  onExecute,
  ...props
}: RuleSetsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={ruleSets.map(({ id }) => id)}
      label="rule set"
      action={deleteRuleSets}
      callbacks={{
        onExecute: () => {
          toast.success("Rule sets deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
