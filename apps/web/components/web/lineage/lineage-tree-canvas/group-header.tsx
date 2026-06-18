"use client"

import { CalendarDaysIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import type { LineageVisualGroupRow } from "~/server/web/lineage/payloads"
import { LineageGroupHeaderForm } from "../lineage-group-header-form"

function formatPromotionDate(value: Date | string | null) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function GroupHeader({
  group,
  isHighlighted,
  treeId,
  editMode,
  canManageGroups,
}: {
  group: LineageVisualGroupRow | null
  isHighlighted: boolean
  treeId: string | undefined
  editMode: boolean
  canManageGroups: boolean
}) {
  if (group && treeId && editMode && canManageGroups) {
    return <LineageGroupHeaderForm treeId={treeId} group={group} />
  }

  if (!group?.showPublicLabel) return null

  const promotionDate = formatPromotionDate(group.promotionDate)
  const eventHref = group.promotionEvent?.slug ? `/events/${group.promotionEvent.slug}` : null

  return (
    <div
      className={cx(
        "mb-1 rounded-full border bg-background/90 px-3 py-1 shadow-sm transition-all duration-300",
        isHighlighted && "border-primary/50 bg-primary/5 shadow-primary/10",
      )}
    >
      <Stack size="xs" className="items-center" wrap>
        <Badge
          variant={isHighlighted ? "primary" : "soft"}
          size="sm"
          prefix={<CalendarDaysIcon />}
          render={eventHref ? <Link href={eventHref} /> : undefined}
        >
          {group.label}
        </Badge>
        {promotionDate && (
          <span className="text-[0.65rem] text-muted-foreground">{promotionDate}</span>
        )}
      </Stack>
    </div>
  )
}
