"use client"

import { ArrowDownIcon, ArrowUpIcon, LinkIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import {
  deleteCurriculumItem,
  linkTechniqueToCurriculum,
  reorderCurriculumItems,
  unlinkTechniqueFromCurriculum,
  upsertCurriculumItem,
} from "~/server/admin/courses/actions"
import { searchTechniquesForPickerAction } from "~/server/admin/courses/technique-search-action"

type TechniqueLink = {
  techniqueId: string
  curriculumItemId: string
  technique: { id: string; name: string; slug: string; category: string | null }
}

type CurriculumItemWithLinks = {
  id: string
  order: number
  title: string
  notes: string | null
  mediaUrl: string | null
  mediaType: string | null
  courseId: string
  createdAt: Date
  updatedAt: Date
  techniqueLinks: TechniqueLink[]
}

type CurriculumItemsEditorProps = {
  courseId: string
  items: CurriculumItemWithLinks[]
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

  const linkAction = useAction(linkTechniqueToCurriculum, {
    onSuccess: () => toast.success("Technique linked"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to link technique"),
  })

  const unlinkAction = useAction(unlinkTechniqueFromCurriculum, {
    onSuccess: () => toast.success("Technique unlinked"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to unlink technique"),
  })

  const isPending =
    addAction.isPending ||
    deleteAction.isPending ||
    reorderAction.isPending ||
    updateAction.isPending ||
    linkAction.isPending ||
    unlinkAction.isPending

  const handleAdd = () => {
    const newOrder = items.length + 1
    addAction.execute({ courseId, order: newOrder, title: `Item ${newOrder}` })
  }

  const handleDelete = (id: string) => {
    deleteAction.execute({ id })
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const newItems = [...items]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newItems.length) return
    ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]
    reorderAction.execute({ courseId, itemIds: newItems.map(item => item.id) })
  }

  const handleTitleChange = (id: string, title: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    updateAction.execute({ id, courseId, order: item.order, title })
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
        <p className="text-sm text-muted-foreground">
          No curriculum items yet. Add one to get started.
        </p>
      )}

      <Stack direction="column" size="sm">
        {items.map((item, index) => (
          <Card key={item.id} className="p-3 space-y-2">
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

            {/* Technique links */}
            <div className="pl-8 space-y-1">
              {item.techniqueLinks.map(link => (
                <div key={link.techniqueId} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {link.technique.name}
                    {link.technique.category && ` (${link.technique.category.replace(/_/g, " ")})`}
                  </Badge>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      unlinkAction.execute({
                        techniqueId: link.techniqueId,
                        curriculumItemId: item.id,
                        courseId,
                      })
                    }
                    disabled={isPending}
                    aria-label={`Unlink ${link.technique.name}`}
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ))}
              <TechniqueSearchPicker
                courseId={courseId}
                curriculumItemId={item.id}
                onLink={techniqueId =>
                  linkAction.execute({ techniqueId, curriculumItemId: item.id, courseId })
                }
                disabled={isPending}
              />
            </div>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}

function TechniqueSearchPicker({
  courseId: _courseId,
  curriculumItemId: _curriculumItemId,
  onLink,
  disabled,
}: {
  courseId: string
  curriculumItemId: string
  onLink: (techniqueId: string) => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<
    { id: string; name: string; slug: string; category: string | null }[]
  >([])
  const [searching, startSearch] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      return
    }
    startSearch(async () => {
      const techniques = await searchTechniquesForPickerAction(value)
      setResults(techniques)
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <LinkIcon className="size-3" />
        Link technique
      </button>
    )
  }

  return (
    <div className="space-y-1">
      <Input
        placeholder="Search techniques..."
        value={query}
        onChange={e => handleSearch(e.target.value)}
        className="h-7 text-xs"
        autoFocus
        onBlur={() => {
          // Delay close so click on result fires first
          setTimeout(() => {
            setOpen(false)
            setQuery("")
            setResults([])
          }, 200)
        }}
      />
      {results.length > 0 && (
        <div className="rounded border bg-background shadow-sm max-h-32 overflow-y-auto">
          {results.map(t => (
            <button
              key={t.id}
              type="button"
              className="w-full text-left px-2 py-1 text-xs hover:bg-muted/50 transition-colors"
              onMouseDown={e => {
                e.preventDefault()
                onLink(t.id)
                setOpen(false)
                setQuery("")
                setResults([])
              }}
            >
              {t.name}
              {t.category && (
                <span className="text-muted-foreground ml-1">
                  ({t.category.replace(/_/g, " ")})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {searching && <p className="text-xs text-muted-foreground">Searching...</p>}
    </div>
  )
}
