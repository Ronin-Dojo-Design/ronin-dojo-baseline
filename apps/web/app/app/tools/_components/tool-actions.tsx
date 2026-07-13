"use client"

import { isValidUrl } from "@dirstack/utils"
import { CopyIcon, GlobeIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import type { Tool } from "~/.generated/prisma/browser"
import { ToolsDeleteDialog } from "~/app/app/tools/_components/tools-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem, DropdownMenuSeparator } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { ExternalLink } from "~/components/web/external-link"
import { duplicateTool } from "~/server/admin/tools/actions"

type ToolActionsProps = ComponentProps<typeof Button> & {
  tool: Tool
}

export const ToolActions = ({ className, tool, ...props }: ToolActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const toolPath = `/app/tools/${tool.slug}`
  const isToolPage = pathname === toolPath

  const { executeAsync } = useAction(duplicateTool, {
    onSuccess: ({ data }) => {
      if (isToolPage) {
        router.push(`/app/tools/${data.slug}`)
      }
    },
  })

  // TODO: Think about how to handle unique website URLs or remove this feature
  const handleDuplicate = () => {
    toast.promise(
      async () => {
        const { serverError } = await executeAsync({ id: tool.id })

        if (serverError) {
          throw new Error(serverError)
        }
      },
      {
        loading: "Duplicating listing...",
        success: "Listing duplicated successfully",
        error: err => `Failed to duplicate listing: ${err.message}`,
      },
    )
  }

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isToolPage && <DropdownMenuItem render={<Link href={toolPath} />}>Edit</DropdownMenuItem>}

        <DropdownMenuItem render={<Link href={`/${tool.slug}`} target="_blank" />}>
          View
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDuplicate}>
          <CopyIcon />
          Duplicate
        </DropdownMenuItem>

        {isValidUrl(tool.websiteUrl) && (
          <DropdownMenuItem render={<ExternalLink href={tool.websiteUrl} doTrack />}>
            <GlobeIcon />
            Visit website
          </DropdownMenuItem>
        )}
      </RowActionsMenu>

      <ToolsDeleteDialog tools={[tool]} onExecute={() => router.push("/app/tools")}>
        <RowDeleteButton {...props} />
      </ToolsDeleteDialog>
    </Stack>
  )
}
