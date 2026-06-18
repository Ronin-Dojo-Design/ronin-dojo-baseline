import {
  CalendarDaysIcon,
  CameraIcon,
  GraduationCapIcon,
  MapPinIcon,
  TrophyIcon,
} from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4, H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import type { PromotionTimelineEntry } from "~/server/web/promotion-events/queries"

type PromotionTimelineProps = {
  entries: PromotionTimelineEntry[]
  title?: string
  emptyMessage?: string
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown date"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "Unknown date"
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

function sourceLabel(entry: PromotionTimelineEntry): string {
  if (entry.source === "hosted-and-awarded") return "Hosted + awarded"
  if (entry.source === "hosted") return "Hosted"
  if (entry.source === "awarded") return "Awarded here"
  return "Award"
}

export function PromotionTimeline({
  entries,
  title = "Promotions Timeline",
  emptyMessage = "No hosted promotion events or awarded ranks are linked to this organization yet.",
}: PromotionTimelineProps) {
  return (
    <div className="space-y-3">
      <Stack className="w-full justify-between">
        <H4 className={bblHeadingFontClass}>{title}</H4>
        {entries.length > 0 && (
          <Badge variant="soft" size="sm" prefix={<TrophyIcon />}>
            {entries.length}
          </Badge>
        )}
      </Stack>

      {entries.length === 0 ? (
        <EmptyList>{emptyMessage}</EmptyList>
      ) : (
        <Stack direction="column" size="sm" className="w-full">
          {entries.map(entry => (
            <Card key={entry.id} hover={Boolean(entry.href)} isRevealed={Boolean(entry.href)}>
              <CardHeader>
                <Stack direction="column" size="xs" className="min-w-0 flex-1">
                  <Stack size="sm" wrap className="w-full">
                    <Badge variant="outline" size="sm" prefix={<CalendarDaysIcon />}>
                      {formatDate(entry.date)}
                    </Badge>
                    <Badge variant="soft" size="sm">
                      {sourceLabel(entry)}
                    </Badge>
                    {entry.photoCount > 0 && (
                      <Badge variant="info" size="sm" prefix={<CameraIcon />}>
                        {entry.photoCount}
                      </Badge>
                    )}
                  </Stack>

                  <H5 className="text-pretty">
                    {entry.href ? (
                      <Link href={entry.href}>
                        <span className="absolute inset-0 z-10" />
                        {entry.title}
                      </Link>
                    ) : (
                      entry.title
                    )}
                  </H5>
                </Stack>
              </CardHeader>

              <CardDescription className="line-clamp-none">
                <Stack direction="column" size="xs" className="items-start">
                  {entry.description && <span>{entry.description}</span>}
                  <Stack size="sm" wrap className="text-muted-foreground">
                    {entry.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="size-3.5" />
                        {entry.location}
                      </span>
                    )}
                    {entry.hostOrganizationName && <span>Host: {entry.hostOrganizationName}</span>}
                    {entry.totalAwardCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <GraduationCapIcon className="size-3.5" />
                        {entry.totalAwardCount} linked award
                        {entry.totalAwardCount === 1 ? "" : "s"}
                      </span>
                    )}
                    {entry.awardedHereCount > 0 && entry.source !== "award" && (
                      <span>
                        {entry.awardedHereCount} award
                        {entry.awardedHereCount === 1 ? "" : "s"} recorded here
                      </span>
                    )}
                  </Stack>

                  {entry.awards.length > 0 && (
                    <Stack size="xs" wrap>
                      {entry.awards.slice(0, 4).map(award => (
                        <Badge key={award.id} variant="outline" size="sm">
                          {award.personName} - {award.rankShortName ?? award.rankName}
                        </Badge>
                      ))}
                      {entry.awards.length > 4 && (
                        <Badge variant="soft" size="sm">
                          +{entry.awards.length - 4} more
                        </Badge>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardDescription>
            </Card>
          ))}
        </Stack>
      )}
    </div>
  )
}
