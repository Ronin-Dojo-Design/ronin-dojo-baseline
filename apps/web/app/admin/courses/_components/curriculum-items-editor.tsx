"use client"

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useOptimistic, useTransition } from "react"
import { toast } from "sonner"
import type { CurriculumItem } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
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
  const [isPending, startTransition] = useTransition()
  const [optimisticItems, setOptimisticItems] = useOptimistic(items)

  const handleAdd = () => {
    startTransition(async () => {
      const newOrder = optimisticItems.length + 1
      const result = await upsertCurriculumItem({
        courseId,
        order: newOrder,
        title: `Item ${newOrder}`,
      })

      if (result?.data) {
        toast.success("Item added")
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      setOptimisticItems(prev => prev.filter(item => item.id !== id))
      const result = await deleteCurriculumItem({ id })
      if (result?.data) {
        toast.success("Item removed")
      }
    })
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const newItems = [...optimisticItems]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newItems.length) return

    ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]

    startTransition(async () => {
      setOptimisticItems(newItems)
      await reorderCurriculumItems({
        courseId,
        itemIds: newItems.map(item => item.id),
      })
    })
  }

  const handleTitleChange = (id: string, title: string) => {
    startTransition(async () => {
      const item = optimisticItems.find(i => i.id === id)
      if (!item) return

      await upsertCurriculumItem({
        id,
        courseId,
        order: item.order,
        title,
      })
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

      {optimisticItems.length === 0 && (
        <p className="text-sm text-muted-foreground">No curriculum items yet. Add one to get started.</p>
      )}

      <div className="space-y-2">
        {optimisticItems.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 rounded-md border p-3">
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
              disabled={index === optimisticItems.length - 1 || isPending}
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
          </div>
        ))}
      </div>
    </Stack>
  )
}
