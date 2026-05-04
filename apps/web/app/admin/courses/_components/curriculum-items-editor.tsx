"use client"

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import type { CurriculumItem } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import {
  deleteCurriculumItem,
  reorderCurriculumItems,
  upsertCurriculumItem,
} from "~/server/admin/courses/actions"

type CurriculumItemsEditorProps = {
  courseId: string
  items: CurriculumItem[]
}

export function CurriculumItemsEditor({ courseId, items }: CurriculumItemsEditorProps) {
  const addAction = useAction(upsertCurriculumItem, {
    onSuccess: () => toast.success("Item added"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to add item"),
  })

  const deleteAction = useAction(deleteCurriculumItem, {
    onSuccess: () => toast.success("Item removed"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to delete item"),
  })

  const reorderAction = useAction(reorderCurriculumItems, {
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to reorder items"),
  })

  const updateAction = useAction(upsertCurriculumItem, {
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to update item"),
  })

  const isPending =
    addAction.isPending || deleteAction.isPending || reorderAction.isPending || updateAction.isPending

  const handleAdd = () => {
    const newOrder = items.length + 1
    addAction.execute({
      courseId,
      order: newOrder,
      title: `Item ${newOrder}`,
    })
  }

  const handleDelete = (id: string) => {
    deleteAction.execute({ id })
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const newItems = [...items]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newItems.length) return

    ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]

    reorderAction.execute({
      courseId,
      itemIds: newItems.map(item => item.id),
    })
  }

  const handleTitleChange = (id: string, title: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    updateAction.execute({
      id,
      courseId,
      order: item.order,
      title,
    })
  }

  return (
    <Stack direction="column" size="md">
      <div className="flex items-center justify-between">
        <H3>Curriculum Items</H3>
        <Button
          variant="secondary"
          size="sm"
          prefix={<PlusIcon />}
          onClick={handleAdd}
          disabled={isPending}
        >
          Add item
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No curriculum items yet. Add one to get started.</p>
      )}

      <Stack direction="column" size="sm">
        {items.map((item, index) => (
          <Card key={item.id} className="p-3">
            <Stack direction="row" size="sm" className="items-center">
              <span className="text-sm font-medium text-muted-foreground w-6 text-center">
                {index + 1}
              </span>

              <Input
                defaultValue={item.title}
                onBlur={e => {
                  if (e.target.value !== item.title) {
                    handleTitleChange(item.id, e.target.value)
                  }
                }}
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="sm"
                prefix={<ArrowUpIcon />}
                onClick={() => handleMove(index, "up")}
                disabled={index === 0 || isPending}
                aria-label="Move up"
              />
              <Button
                variant="ghost"
                size="sm"
                prefix={<ArrowDownIcon />}
                onClick={() => handleMove(index, "down")}
                disabled={index === items.length - 1 || isPending}
                aria-label="Move down"
              />
              <Button
                variant="ghost"
                size="sm"
                prefix={<TrashIcon />}
                onClick={() => handleDelete(item.id)}
                disabled={isPending}
                aria-label="Delete"
              />
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
