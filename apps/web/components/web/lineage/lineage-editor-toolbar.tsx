"use client"

import { ExternalLinkIcon, MousePointer2Icon, Move3dIcon, RadioIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"

type LineageEditorToolbarProps = {
  editMode: boolean
  onEditModeChange: (enabled: boolean) => void
  canEditPlacement: boolean
  canManageGroups: boolean
  canPublish: boolean
  publicHref?: string | null
}

export function LineageEditorToolbar({
  editMode,
  onEditModeChange,
  canEditPlacement,
  canManageGroups,
  canPublish,
  publicHref,
}: LineageEditorToolbarProps) {
  return (
    <Stack
      direction="row"
      size="sm"
      wrap
      className="mb-3 items-center justify-between rounded-lg border bg-background p-2"
    >
      <Stack size="xs" wrap>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="sm"
                variant={editMode ? "primary" : "secondary"}
                prefix={editMode ? <Move3dIcon /> : <MousePointer2Icon />}
                disabled={!canEditPlacement}
                aria-pressed={editMode}
                onClick={() => onEditModeChange(!editMode)}
              >
                {editMode ? "Editing" : "Edit"}
              </Button>
            }
          />
          <TooltipContent>
            {canEditPlacement
              ? "Toggle drag editing for reorder and group moves."
              : "This lineage grant cannot edit placement."}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Badge variant={canManageGroups ? "success" : "outline"} size="sm">
                Groups
              </Badge>
            }
          />
          <TooltipContent>
            {canManageGroups
              ? "TREE_ADMIN can rename visual groups and change public label settings."
              : "Group management requires TREE_ADMIN."}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Badge variant={canPublish ? "success" : "outline"} size="sm" prefix={<RadioIcon />}>
                Publish
              </Badge>
            }
          />
          <TooltipContent>
            {canPublish
              ? "TREE_ADMIN may publish tree changes in a later editor slice."
              : "Publish controls require TREE_ADMIN."}
          </TooltipContent>
        </Tooltip>
      </Stack>

      {publicHref && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                prefix={<ExternalLinkIcon />}
                render={<Link href={publicHref} />}
              >
                Public
              </Button>
            }
          />
          <TooltipContent>Open the public lineage view.</TooltipContent>
        </Tooltip>
      )}
    </Stack>
  )
}
