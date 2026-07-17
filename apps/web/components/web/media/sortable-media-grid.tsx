"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, RotateCcwIcon, SaveIcon } from "lucide-react"
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react"
import { Button } from "~/components/common/button"
import { cx } from "~/lib/utils"

/**
 * ONE shared sortable-media-grid unit (WL-P2-49) — the dnd ordering seam that had drifted into a
 * near-copy pair: `media-attachment-manager.tsx` (technique/passport/event surfaces) and
 * `app/app/content/_components/content-media-panel.tsx` (content atoms). Both now compose these
 * four pieces; the SURFACES keep their own cards, actions, and persistence calls — this module
 * owns only the ordering mechanics (sensors, order diff, arrayMove, reset, Save/Reset controls,
 * the sortable tile wiring). Adoption survey (Giddy 0529): courses `curriculum-items-editor` has
 * no dnd today and event galleries already ride the manager, so those adopt when/if they grow
 * ordering — no speculative API here.
 */

/**
 * Order state mechanics: current ids, whether the on-screen order diverges from the last-persisted
 * one (same length AND some index differs — a mid-flight add/remove hides the controls), the
 * drag-end arrayMove, and reset-to-saved. The ITEMS state stays with the caller (each surface adds/
 * removes/updates items its own way); `savedIds` is the caller's last-persisted order.
 */
export function useSortableMediaOrder<T>({
  items,
  setItems,
  getId,
  savedIds,
}: {
  items: T[]
  setItems: Dispatch<SetStateAction<T[]>>
  getId: (item: T) => string
  savedIds: string[]
}) {
  const currentIds = items.map(getId)

  const hasOrderChanges =
    savedIds.length === currentIds.length && savedIds.some((id, index) => currentIds[index] !== id)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setItems(current => {
      const oldIndex = current.findIndex(item => getId(item) === String(active.id))
      const newIndex = current.findIndex(item => getId(item) === String(over.id))
      if (oldIndex === -1 || newIndex === -1) return current
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  const resetOrder = () => {
    setItems(current =>
      savedIds
        .map(id => current.find(item => getId(item) === id))
        .filter((item): item is T => item != null),
    )
  }

  return { currentIds, hasOrderChanges, handleDragEnd, resetOrder }
}

/**
 * The DndContext + SortableContext + grid container (rect strategy, pointer sensor with the 6px
 * activation distance so taps still hit buttons, keyboard sensor for a11y). `as="ul"` keeps list
 * semantics where the surface renders list-item tiles.
 */
export function SortableMediaGrid({
  ids,
  onDragEnd,
  className,
  as: Component = "div",
  children,
}: {
  ids: string[]
  onDragEnd: (event: DragEndEvent) => void
  className?: string
  as?: "div" | "ul"
  children: ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <Component className={className}>{children}</Component>
      </SortableContext>
    </DndContext>
  )
}

/**
 * One sortable tile: the `useSortable` transform wiring plus the grip Button that carries the drag
 * listeners — so the tile's own buttons (remove, premium, avatar…) stay tappable. The grip's
 * placement/reveal styling is the surface's call (`grip.className`); the drag behavior is not.
 */
export function SortableMediaTile({
  id,
  disabled,
  as: Component = "div",
  className,
  draggingClassName,
  grip,
  children,
  ...rest
}: {
  id: string
  disabled: boolean
  as?: "div" | "li"
  className?: string
  /** Applied while dragging (each surface keeps its shipped treatment, e.g. `z-10 opacity-70`). */
  draggingClassName?: string
  grip: { label: string; size?: "xs" | "sm"; className: string }
  children: ReactNode
  "aria-label"?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Component
      ref={setNodeRef}
      style={style}
      className={cx(className, isDragging && draggingClassName)}
      {...rest}
    >
      {children}
      <Button
        type="button"
        size={grip.size ?? "sm"}
        variant="secondary"
        prefix={<GripVerticalIcon />}
        aria-label={grip.label}
        disabled={disabled}
        className={grip.className}
        {...attributes}
        {...listeners}
      />
    </Component>
  )
}

/**
 * The Reset / Save-order pair, rendered only while `hasOrderChanges` (callers gate it). A fragment
 * so each surface keeps its own layout Stack; toast copy stays with the caller's action handlers.
 */
export function MediaOrderControls({
  isPending,
  onReset,
  onSave,
}: {
  isPending: boolean
  onReset: () => void
  onSave: () => void
}) {
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        prefix={<RotateCcwIcon />}
        disabled={isPending}
        onClick={onReset}
      >
        Reset
      </Button>
      <Button
        type="button"
        size="sm"
        variant="primary"
        prefix={<SaveIcon />}
        isPending={isPending}
        onClick={onSave}
      >
        Save order
      </Button>
    </>
  )
}
