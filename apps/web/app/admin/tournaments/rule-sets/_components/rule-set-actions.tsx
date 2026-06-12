"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { RuleSet } from "~/.generated/prisma/browser"
import { RuleSetsDeleteDialog } from "~/app/admin/tournaments/rule-sets/_components/rule-sets-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { cx } from "~/lib/utils"

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
          {!isRuleSetPage && (
            <DropdownMenuItem render={<Link href={ruleSetPath} />}>Edit</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {ruleSet.isSystem ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                size="sm"
                prefix={<TrashIcon />}
                className="text-red-500"
                disabled
                {...props}
              />
            }
          />
          <TooltipContent>System rule sets cannot be deleted</TooltipContent>
        </Tooltip>
      ) : (
        <RuleSetsDeleteDialog
          ruleSets={[ruleSet]}
          onExecute={() => router.push("/app/tournaments/rule-sets")}
        >
          <Button
            variant="secondary"
            size="sm"
            prefix={<TrashIcon />}
            className="text-red-500"
            {...props}
          />
        </RuleSetsDeleteDialog>
      )}
    </Stack>
  )
}
