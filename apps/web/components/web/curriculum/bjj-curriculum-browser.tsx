"use client"

import { BookOpenIcon, CheckCircle2Icon, LinkIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { H3 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import type { BjjCurriculumItemView, BjjCurriculumLevelView } from "~/server/web/curriculum/queries"

type BjjCurriculumBrowserProps = {
  levels: BjjCurriculumLevelView[]
}

const ALL_TOPICS = "all"

export function BjjCurriculumBrowser({ levels }: BjjCurriculumBrowserProps) {
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0]?.id ?? "")
  const [selectedTopic, setSelectedTopic] = useState(ALL_TOPICS)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const selectedLevel = levels.find(level => level.id === selectedLevelId) ?? levels[0]
  const topics = useMemo(() => {
    const values = new Set<string>()
    for (const level of levels) {
      for (const item of level.items) {
        if (item.category) values.add(item.category)
      }
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [levels])

  const visibleItems = useMemo(() => {
    if (!selectedLevel) return []
    if (selectedTopic === ALL_TOPICS) return selectedLevel.items
    return selectedLevel.items.filter(item => item.category === selectedTopic)
  }, [selectedLevel, selectedTopic])

  const allItems = useMemo(() => levels.flatMap(level => level.items), [levels])
  const selectedItem = selectedItemId
    ? allItems.find(item => item.id === selectedItemId)
    : undefined

  if (!selectedLevel) {
    return (
      <p className="text-sm text-muted-foreground">No BJJ curriculum has been published yet.</p>
    )
  }

  return (
    <>
      <Stack direction="column" size="lg">
        <Stack direction="row" wrap size="xs" className="items-center">
          {levels.map(level => (
            <Button
              key={level.id}
              type="button"
              size="sm"
              variant={selectedLevel.id === level.id ? "primary" : "secondary"}
              aria-pressed={selectedLevel.id === level.id}
              onClick={() => {
                setSelectedLevelId(level.id)
                setSelectedTopic(ALL_TOPICS)
              }}
            >
              <span
                className="mr-1 inline-block size-2 rounded-full border border-foreground/20"
                style={{ backgroundColor: level.rank?.colorHex ?? "hsl(var(--primary))" }}
                aria-hidden="true"
              />
              {level.rank?.shortName ?? level.title.replace(/^BJJ\s+/, "")}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" wrap size="xs" className="items-center">
          <Button
            type="button"
            size="sm"
            variant={selectedTopic === ALL_TOPICS ? "primary" : "secondary"}
            aria-pressed={selectedTopic === ALL_TOPICS}
            onClick={() => setSelectedTopic(ALL_TOPICS)}
          >
            All Topics
          </Button>
          {topics.map(topic => (
            <Button
              key={topic}
              type="button"
              size="sm"
              variant={selectedTopic === topic ? "primary" : "secondary"}
              aria-pressed={selectedTopic === topic}
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </Button>
          ))}
        </Stack>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map(item => (
            <CurriculumItemCard
              key={item.id}
              item={item}
              onSelect={() => setSelectedItemId(item.id)}
            />
          ))}
        </div>
      </Stack>

      <Dialog open={!!selectedItem} onOpenChange={open => !open && setSelectedItemId(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.title}</DialogTitle>
                <DialogDescription>
                  {selectedItem.description || selectedItem.section || selectedItem.category}
                </DialogDescription>
              </DialogHeader>

              <Stack direction="row" wrap size="xs">
                {selectedItem.category && <Badge variant="primary">{selectedItem.category}</Badge>}
                {selectedItem.section && <Badge variant="soft">{selectedItem.section}</Badge>}
                {selectedItem.isRequired && <Badge variant="success">Required</Badge>}
                {selectedItem.access !== "public" && (
                  <Badge variant="warning" prefix={<LockIcon />}>
                    {selectedItem.access}
                  </Badge>
                )}
              </Stack>

              {selectedItem.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key points</p>
                  <ul className="space-y-1 text-sm text-secondary-foreground">
                    {selectedItem.keyPoints.map(point => (
                      <li key={point}>- {point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItem.techniqueLinks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Technique graph links</p>
                  <Stack direction="row" wrap size="xs">
                    {selectedItem.techniqueLinks.map(technique => (
                      <Button
                        key={technique.id}
                        size="sm"
                        variant="secondary"
                        prefix={<LinkIcon />}
                        render={<Link href={`/techniques/${technique.slug}`} />}
                      >
                        {technique.name}
                      </Button>
                    ))}
                  </Stack>
                </div>
              )}

              <DialogFooter>
                <Button variant="secondary" onClick={() => setSelectedItemId(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function CurriculumItemCard({
  item,
  onSelect,
}: {
  item: BjjCurriculumItemView
  onSelect: () => void
}) {
  return (
    <Card
      render={<button type="button" onClick={onSelect} />}
      className="min-h-44 text-left"
      aria-label={item.title}
    >
      <CardHeader size="xs" direction="row" className="items-start justify-between gap-3">
        <Stack direction="column" size="xs" className="min-w-0">
          <H3 size="h5" className="line-clamp-2 text-base">
            {item.title}
          </H3>
          <Stack direction="row" wrap size="xs">
            {item.category && <Badge size="sm">{item.category}</Badge>}
            {item.isRequired && (
              <Badge size="sm" variant="success" prefix={<CheckCircle2Icon />}>
                Required
              </Badge>
            )}
          </Stack>
        </Stack>
        <Badge variant="outline" size="sm" prefix={<BookOpenIcon />}>
          {item.order}
        </Badge>
      </CardHeader>

      <CardDescription className={cx("line-clamp-3", !item.description && "text-muted-foreground")}>
        {item.description || item.section}
      </CardDescription>

      <CardFooter direction="row" wrap size="xs" className="mt-auto">
        {item.techniqueLinks.length > 0 && (
          <Badge variant="info" size="sm">
            {item.techniqueLinks.length} graph links
          </Badge>
        )}
        {item.access !== "public" && (
          <Badge variant="warning" size="sm" prefix={<LockIcon />}>
            {item.access}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
