"use client"

import {} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { RuleSet } from "~/.generated/prisma/browser"
import { RuleSetsDeleteDialog } from "~/app/app/tournaments/rule-sets/_components/rule-sets-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"

type RuleSetActionsProps = Omit<ComponentProps<typeof Button>, "ruleSet"> & {
  ruleSet: RuleSet
}

export const RuleSetActions = ({ ruleSet, className, ...props }: RuleSetActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const ruleSetPath = `/app/tournaments/rule-sets/${ruleSet.id}`
  const isRuleSetPage = pathname === ruleSetPath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isRuleSetPage && (
          <DropdownMenuItem render={<Link href={ruleSetPath} />}>Edit</DropdownMenuItem>
        )}
      </RowActionsMenu>

      {ruleSet.isSystem ? (
        <Tooltip>
          <TooltipTrigger render={<RowDeleteButton disabled {...props} />} />
          <TooltipContent>System rule sets cannot be deleted</TooltipContent>
        </Tooltip>
      ) : (
        <RuleSetsDeleteDialog
          ruleSets={[ruleSet]}
          onExecute={() => router.push("/app/tournaments/rule-sets")}
        >
          <RowDeleteButton {...props} />
        </RuleSetsDeleteDialog>
      )}
    </Stack>
  )
}
