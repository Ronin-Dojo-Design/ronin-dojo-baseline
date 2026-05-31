"use client"

import { useReducedMotion } from "@mantine/hooks"
import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { type CanvasMember, memberInitials, nodeDisplayName } from "~/lib/lineage/canvas-model"
import { cx } from "~/lib/utils"

const HONOR_STRIP_LIMIT = 6

function rankScore(member: CanvasMember) {
  return member.selectedRank?.sortOrder ?? 0
}

function honorMembers(members: CanvasMember[]) {
  return members
    .filter(member => member.selectedRank)
    .sort((a, b) => {
      const scoreDelta = rankScore(b) - rankScore(a)
      if (scoreDelta !== 0) return scoreDelta
      if (a.visualSortOrder !== b.visualSortOrder) return a.visualSortOrder - b.visualSortOrder
      return nodeDisplayName(a.node).localeCompare(nodeDisplayName(b.node))
    })
    .slice(0, HONOR_STRIP_LIMIT)
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

export function LineageHonorStrip({
  members,
  selectedMemberId,
  onSelect,
}: {
  members: CanvasMember[]
  selectedMemberId: string | null
  onSelect: (nodeId: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const featuredMembers = honorMembers(members)

  if (featuredMembers.length === 0) return null

  return (
    <section className="mb-4 rounded-xl border bg-background/80 p-3 shadow-sm">
      <Stack size="sm" direction="column" wrap={false} className="w-full">
        <Stack size="xs" wrap className="w-full items-center justify-between">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Honor strip
          </span>
          <Badge variant="soft" size="sm">
            Top ranked
          </Badge>
        </Stack>

        <ol className="flex w-full gap-2 overflow-x-auto pb-1">
          {featuredMembers.map((member, index) => {
            const displayName = nodeDisplayName(member.node)
            const isSelected = member.id === selectedMemberId
            const beltColor = member.selectedRank?.colorHex ?? null
            const rankLabel = member.selectedRank?.shortName ?? member.selectedRank?.name ?? null

            return (
              <motion.li
                key={member.id}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.2, delay: index * 0.04, ease: "easeOut" }
                }
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(member.nodeId)
                    scrollMemberIntoView(member.id, reduceMotion)
                  }}
                  className={cx(
                    "flex min-w-48 max-w-60 items-center gap-2 rounded-lg border bg-card/80 p-2 text-left transition-colors duration-150 hover:bg-accent",
                    isSelected && "border-primary bg-primary/10 ring-1 ring-primary/40",
                  )}
                >
                  <span
                    aria-hidden
                    className={cx(
                      "h-9 w-1 shrink-0 rounded-full",
                      beltColor ? "" : "bg-muted-foreground/30",
                    )}
                    style={beltColor ? { backgroundColor: beltColor } : undefined}
                  />
                  <Avatar className="size-8">
                    {member.node.user.image && (
                      <AvatarImage src={member.node.user.image} alt={displayName} />
                    )}
                    <AvatarFallback>{memberInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <Stack size="xs" direction="column" wrap={false} className="min-w-0">
                    <span className="truncate font-medium text-sm">{displayName}</span>
                    {rankLabel && (
                      <span className="truncate text-muted-foreground text-xs">{rankLabel}</span>
                    )}
                  </Stack>
                </button>
              </motion.li>
            )
          })}
        </ol>
      </Stack>
    </section>
  )
}
