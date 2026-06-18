"use client"

import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { updateLineageMemberPlacement } from "~/server/web/lineage/editor-actions"
import { isDragMemberData, isDropTargetData } from "./canvas-data"

/**
 * Edit-mode drag/drop wiring: the dnd-kit sensors, the audited
 * `updateLineageMemberPlacement` action, and the drop handler. The handler only
 * permits same-parent visual reorder / group moves; everything else is a no-op.
 */
export function useLineagePlacementEditor({
  treeId,
  editMode,
  canEditPlacement,
}: {
  treeId: string | undefined
  editMode: boolean
  canEditPlacement: boolean
}) {
  const router = useRouter()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const { execute: executePlacementUpdate, isExecuting: isPlacementSaving } = useAction(
    updateLineageMemberPlacement,
    {
      onSuccess: () => {
        toast.success("Lineage placement updated.")
        router.refresh()
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to update lineage placement.")
      },
    },
  )

  function handleDragEnd(event: DragEndEvent) {
    if (!treeId || !editMode || !canEditPlacement) return

    const activeData = event.active.data.current
    const targetData = event.over?.data.current

    if (!isDragMemberData(activeData) || !isDropTargetData(targetData)) return
    if (activeData.memberId === event.over?.id) return
    if (activeData.parentMemberId !== targetData.parentMemberId) return

    const isSamePlacement =
      activeData.parentMemberId === targetData.parentMemberId &&
      activeData.visualGroupId === targetData.visualGroupId &&
      activeData.visualSortOrder === targetData.visualSortOrder

    if (isSamePlacement) return

    executePlacementUpdate({
      treeId,
      memberId: activeData.memberId,
      parentMemberId: activeData.parentMemberId,
      visualGroupId: targetData.visualGroupId,
      visualSortOrder: targetData.visualSortOrder,
      auditNote: "Drag placement update from lineage editor canvas.",
    })
  }

  return { sensors, handleDragEnd, isPlacementSaving }
}
