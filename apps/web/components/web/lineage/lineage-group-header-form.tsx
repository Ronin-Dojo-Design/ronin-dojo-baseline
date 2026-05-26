"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { updateLineageVisualGroup } from "~/server/web/lineage/editor-actions"
import type { LineageVisualGroupRow } from "~/server/web/lineage/payloads"

type LineageGroupHeaderFormProps = {
  treeId: string
  group: LineageVisualGroupRow
}

export function LineageGroupHeaderForm({ treeId, group }: LineageGroupHeaderFormProps) {
  const router = useRouter()
  const [label, setLabel] = useState(group.label)
  const [showPublicLabel, setShowPublicLabel] = useState(group.showPublicLabel)
  const [collapseByDefault, setCollapseByDefault] = useState(group.isCollapsedDefault)

  useEffect(() => {
    setLabel(group.label)
    setShowPublicLabel(group.showPublicLabel)
    setCollapseByDefault(group.isCollapsedDefault)
  }, [group.id, group.label, group.showPublicLabel, group.isCollapsedDefault])

  const isDirty =
    label.trim() !== group.label ||
    showPublicLabel !== group.showPublicLabel ||
    collapseByDefault !== group.isCollapsedDefault

  const { execute, isExecuting } = useAction(updateLineageVisualGroup, {
    onSuccess: () => {
      toast.success("Lineage group updated.")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to update lineage group.")
    },
  })

  function submit() {
    execute({
      treeId,
      groupId: group.id,
      label,
      showPublicLabel,
      collapseByDefault,
      auditNote: `Update lineage visual group "${group.label}".`,
    })
  }

  return (
    <Stack
      direction="column"
      size="xs"
      className="mb-2 w-[min(24rem,80vw)] rounded-lg border border-dashed bg-background/95 p-2 text-left shadow-sm"
    >
      <Label htmlFor={`lineage-group-${group.id}`}>Group label</Label>
      <Stack size="xs" className="items-center" wrap={false}>
        <Input
          id={`lineage-group-${group.id}`}
          value={label}
          onChange={event => setLabel(event.target.value)}
          className="h-8 min-w-0 text-sm"
        />
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={submit}
                disabled={!isDirty || label.trim().length === 0}
                isPending={isExecuting}
              >
                Save
              </Button>
            }
          />
          <TooltipContent>Persist this group header.</TooltipContent>
        </Tooltip>
      </Stack>

      <Stack size="md" wrap>
        <Stack size="xs" className="items-center">
          <Switch
            id={`lineage-group-public-${group.id}`}
            checked={showPublicLabel}
            onCheckedChange={checked => setShowPublicLabel(Boolean(checked))}
          />
          <Label htmlFor={`lineage-group-public-${group.id}`} className="text-xs">
            Public label
          </Label>
        </Stack>

        <Stack size="xs" className="items-center">
          <Switch
            id={`lineage-group-collapse-${group.id}`}
            checked={collapseByDefault}
            onCheckedChange={checked => setCollapseByDefault(Boolean(checked))}
          />
          <Label htmlFor={`lineage-group-collapse-${group.id}`} className="text-xs">
            Collapse by default
          </Label>
        </Stack>
      </Stack>
    </Stack>
  )
}
