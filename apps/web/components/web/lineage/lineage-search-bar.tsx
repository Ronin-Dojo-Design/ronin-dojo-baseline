"use client"

import { useReducedMotion } from "@mantine/hooks"
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, XIcon } from "lucide-react"
import { type ChangeEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import type { CanvasMember } from "~/lib/lineage/canvas-model"
import { findLineageMatches, MIN_QUERY_LENGTH } from "~/lib/lineage/search"

type LineageSearchBarProps = {
  members: CanvasMember[]
  selectedMemberId: string | null
  onSelect: (nodeId: string) => void
}

function scrollMemberIntoView(memberId: string, reduceMotion: boolean | null) {
  window.setTimeout(() => {
    document.getElementById(`lineage-member-${memberId}`)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
      inline: "center",
    })
  }, 0)
}

export function LineageSearchBar({ members, selectedMemberId, onSelect }: LineageSearchBarProps) {
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState("")
  const [cursorIndex, setCursorIndex] = useState(0)
  const lastSelectedRef = useRef<string | null>(null)

  const matches = useMemo(() => findLineageMatches(members, query), [members, query])
  const hasQuery = query.trim().length >= MIN_QUERY_LENGTH
  const matchCount = matches.length
  const safeCursor = matchCount === 0 ? 0 : Math.min(cursorIndex, matchCount - 1)
  const currentMatch = matches[safeCursor]

  // When the matches list changes (new query), reset to the first match and
  // drive selection toward it. We track the last node we drove so a parent
  // re-render or an unrelated `selectedMemberId` change doesn't re-trigger
  // a redundant `onSelect`.
  useEffect(() => {
    if (!currentMatch) {
      lastSelectedRef.current = null
      return
    }
    if (lastSelectedRef.current === currentMatch.member.nodeId) return
    lastSelectedRef.current = currentMatch.member.nodeId
    onSelect(currentMatch.member.nodeId)
    scrollMemberIntoView(currentMatch.member.id, reduceMotion)
  }, [currentMatch, onSelect, reduceMotion])

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
    setCursorIndex(0)
  }

  function stepCursor(direction: 1 | -1) {
    if (matchCount === 0) return
    setCursorIndex(prev => {
      const next = (prev + direction + matchCount) % matchCount
      const nextMatch = matches[next]
      if (nextMatch) {
        lastSelectedRef.current = nextMatch.member.nodeId
        onSelect(nextMatch.member.nodeId)
        scrollMemberIntoView(nextMatch.member.id, reduceMotion)
      }
      return next
    })
  }

  function clearQuery() {
    setQuery("")
    setCursorIndex(0)
    lastSelectedRef.current = null
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      clearQuery()
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      stepCursor(event.shiftKey ? -1 : 1)
    }
  }

  return (
    <section
      aria-label="Search lineage members"
      className="mb-4 rounded-xl border bg-background/80 p-2 shadow-sm"
    >
      <Stack size="xs" wrap className="items-center">
        <Stack size="xs" wrap={false} className="min-w-0 flex-1 items-center">
          <SearchIcon aria-hidden className="ml-2 size-4 shrink-0 text-muted-foreground" />
          <Input
            type="search"
            size="sm"
            placeholder="Search practitioners…"
            aria-label="Search lineage members by name"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            className="border-0 bg-transparent shadow-none focus:ring-0"
          />
        </Stack>

        {hasQuery && (
          <Stack size="xs" wrap={false} className="items-center">
            {matchCount > 0 ? (
              <Badge variant="primary" size="sm">
                {safeCursor + 1} / {matchCount}
              </Badge>
            ) : (
              <Badge variant="soft" size="sm">
                No matches
              </Badge>
            )}

            <Button
              type="button"
              variant="secondary"
              size="xs"
              aria-label="Previous match"
              prefix={<ChevronUpIcon />}
              disabled={matchCount === 0}
              onClick={() => stepCursor(-1)}
            />

            <Button
              type="button"
              variant="secondary"
              size="xs"
              aria-label="Next match"
              prefix={<ChevronDownIcon />}
              disabled={matchCount === 0}
              onClick={() => stepCursor(1)}
            />

            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Clear lineage search"
              prefix={<XIcon />}
              onClick={clearQuery}
            />
          </Stack>
        )}
      </Stack>

      {hasQuery && currentMatch && (
        <p className="mt-1 px-2 text-muted-foreground text-xs">
          Selected: {currentMatch.displayName}
          {selectedMemberId === currentMatch.member.id ? "" : " (highlighting…)"}
        </p>
      )}
    </section>
  )
}
