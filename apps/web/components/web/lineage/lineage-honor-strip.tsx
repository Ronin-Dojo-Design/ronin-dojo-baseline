"use client"

import { useReducedMotion } from "@mantine/hooks"
import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { Stack } from "~/components/common/stack"
import {
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  type LineageListingRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  type CanvasMember,
  memberAvatarSrc,
  memberInitials,
  nodeDisplayName,
} from "~/lib/lineage/canvas-model"
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
  renderPolicy = FREE_LINEAGE_LISTING_RENDER_POLICY,
}: {
  members: CanvasMember[]
  selectedMemberId: string | null
  onSelect: (nodeId: string) => void
  renderPolicy?: LineageListingRenderPolicy
}) {
  const reduceMotion = useReducedMotion()
  const featuredMembers = honorMembers(members)

  if (featuredMembers.length === 0) return null

  return (
    <section
      data-lineage-honor-rail
      className="mb-4 rounded-xl border bg-background/80 p-3 shadow-sm"
    >
      <Stack size="sm" direction="column" wrap={false} className="w-full">
        <Stack size="xs" wrap className="w-full items-center justify-between">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Honor strip
          </span>
          <Badge variant="soft" size="sm">
            Top ranked
          </Badge>
        </Stack>

        <Carousel ariaLabel="Honor strip" controls="desktop" edgeFades options={{ align: "start" }}>
          {featuredMembers.map((member, index) => {
            const displayName = nodeDisplayName(member.node)
            const avatarSrc = memberAvatarSrc(member.node)
            const isSelected = member.id === selectedMemberId
            const beltColor = member.selectedRank?.colorHex ?? null
            const rankLabel = member.selectedRank?.name ?? null

            return (
              <CarouselSlide key={member.id} width={248}>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, delay: index * 0.04, ease: "easeOut" }
                  }
                  className="h-full"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(member.nodeId)
                      scrollMemberIntoView(member.id, reduceMotion)
                    }}
                    className={cx(
                      "flex h-full w-full items-center gap-2 rounded-lg border bg-card/80 p-2 text-left transition-colors duration-150 hover:bg-accent",
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
                    {renderPolicy.features.honorStripAvatar && (
                      <Avatar className="size-8">
                        {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                        <AvatarFallback>{memberInitials(displayName)}</AvatarFallback>
                      </Avatar>
                    )}
                    <Stack size="xs" direction="column" wrap={false} className="min-w-0 flex-1">
                      <span className="max-w-full truncate font-medium text-sm">{displayName}</span>
                      {rankLabel && (
                        <span className="max-w-full truncate text-muted-foreground text-xs">
                          {rankLabel}
                        </span>
                      )}
                    </Stack>
                  </button>
                </motion.div>
              </CarouselSlide>
            )
          })}
        </Carousel>
      </Stack>
    </section>
  )
}
