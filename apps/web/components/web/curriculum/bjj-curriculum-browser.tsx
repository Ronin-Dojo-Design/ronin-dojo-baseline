"use client"

import { BookOpenIcon, CheckCircle2Icon, LinkIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
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
import { EmptyList } from "~/components/common/empty-list"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import type { BjjCurriculumItemView, BjjCurriculumLevelView } from "~/server/web/curriculum/queries"

type BjjCurriculumBrowserProps = {
  levels: BjjCurriculumLevelView[]
}

const ALL_TOPICS = "all"

const ACCESS_LABELS: Record<string, string> = {
  public: "Public",
  student: "Student access",
  member: "Member access",
}

const accessKey = (access: string) => access.trim().toLowerCase()

const accessLabel = (access: string) => {
  const key = accessKey(access)
  const knownLabel = ACCESS_LABELS[key]
  if (knownLabel) return knownLabel

  return key
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const accessUpgradeLine = (access: string): string | null => {
  const key = accessKey(access)
  if (key === "public") return null
  if (key === "student") return "Enroll as a student to unlock the guided lesson."
  if (key === "member") return "Upgrade your membership to unlock the guided lesson."
  return "Upgrade your access to unlock the guided lesson."
}

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
          {levels.map(level => {
            // ONE derivation for the visible label AND the aria-label so they can never drift.
            const levelLabel = level.title.replace(/^BJJ\s+/, "")

            return (
              <Button
                key={level.id}
                type="button"
                size="sm"
                variant={selectedLevel.id === level.id ? "primary" : "secondary"}
                aria-pressed={selectedLevel.id === level.id}
                // Visible label is the level title; rank.shortName stays as compact aria support
                // only (appended so the accessible name still contains the visible text).
                aria-label={
                  level.rank?.shortName ? `${levelLabel} (${level.rank.shortName})` : undefined
                }
                onClick={() => {
                  setSelectedLevelId(level.id)
                  setSelectedTopic(ALL_TOPICS)
                }}
              >
                <BeltSwatch colorHex={level.rank?.colorHex} className="size-2.5" />
                {levelLabel}
              </Button>
            )
          })}
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

        {/* AUD2-7: a topic filter with zero matches used to strand users on a silent, blank
            grid — same "reset" idiom as `community-feed.tsx`'s EmptyList (inline text-link
            button, not a full CTA — there is nothing to create here, just a filter to clear). */}
        {visibleItems.length === 0 ? (
          <EmptyList>
            {selectedTopic === ALL_TOPICS
              ? `No items in ${selectedLevel.title.replace(/^BJJ\s+/, "")} yet.`
              : `No ${selectedTopic} items in ${selectedLevel.title.replace(/^BJJ\s+/, "")}.`}
            {selectedTopic !== ALL_TOPICS && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setSelectedTopic(ALL_TOPICS)}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Show all topics
                </button>
              </>
            )}
          </EmptyList>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map(item => (
              <CurriculumItemCard
                key={item.id}
                item={item}
                beltColorHex={selectedLevel.rank?.colorHex}
                onSelect={() => setSelectedItemId(item.id)}
              />
            ))}
          </div>
        )}
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
                {accessKey(selectedItem.access) !== "public" && (
                  <Badge variant="warning" prefix={<LockIcon />}>
                    {accessLabel(selectedItem.access)}
                  </Badge>
                )}
              </Stack>

              {accessUpgradeLine(selectedItem.access) && (
                <Note>{accessUpgradeLine(selectedItem.access)}</Note>
              )}

              {selectedItem.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key points</p>
                  <Prose className="prose-sm max-w-none">
                    <ul>
                      {selectedItem.keyPoints.map(point => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </Prose>
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
  beltColorHex,
  onSelect,
}: {
  item: BjjCurriculumItemView
  beltColorHex?: string | null
  onSelect: () => void
}) {
  return (
    <Card
      render={<button type="button" onClick={onSelect} />}
      className="min-h-44 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:shadow-lg active:translate-y-0 active:shadow-sm motion-reduce:transform-none motion-reduce:transition-none"
      style={beltColorHex ? { borderLeftColor: beltColorHex, borderLeftWidth: 3 } : undefined}
      aria-label={item.title}
    >
      {beltColorHex && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border"
        />
      )}
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
        {accessKey(item.access) !== "public" && (
          <Badge variant="warning" size="sm" prefix={<LockIcon />}>
            {accessLabel(item.access)}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
