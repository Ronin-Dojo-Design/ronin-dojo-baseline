import { CalendarDaysIcon, CameraIcon, GraduationCapIcon, MapPinIcon } from "lucide-react"
import Image from "next/image"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { cx } from "~/lib/utils"
import type { PromotionEventCard } from "~/server/web/promotion-events/payloads"
import { eventLocation, formatDate } from "./event-format"

/**
 * One ceremony tile in the public events grid. Thumbnail (or a camera-icon
 * placeholder), the date + award-count badges, a title that links to the
 * `/events/[slug]` provenance drill-down, and a metadata footer (location, host,
 * photo count, the first few promotees). The title inherits the BBL heading font
 * via the nested `var()` fallback idiom — brand-correct, zero regression off-BBL.
 */
export function EventCard({ event }: { event: PromotionEventCard }) {
  const href = event.slug ? `/events/${event.slug}` : null
  const thumbnail = event.mediaAttachments[0]?.media
  const location = eventLocation(event)

  return (
    <Card hover={Boolean(href)} isRevealed={Boolean(href)} className="p-0">
      {thumbnail ? (
        <Image
          src={thumbnail.thumbnailUrl ?? thumbnail.url}
          alt={thumbnail.altText ?? thumbnail.title ?? event.title}
          width={720}
          height={480}
          className="aspect-[4/3] w-full rounded-t-lg object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-lg bg-muted text-muted-foreground">
          <CameraIcon className="size-8" />
        </div>
      )}

      <CardHeader className="px-5">
        <Stack size="sm" wrap>
          <Badge variant="outline" size="sm" prefix={<CalendarDaysIcon />}>
            {formatDate(event.eventDate)}
          </Badge>
          <Badge variant="soft" size="sm" prefix={<GraduationCapIcon />}>
            {event._count.rankAwards}
          </Badge>
        </Stack>

        <H4
          render={props => <h2 {...props}>{props.children}</h2>}
          className={cx("text-pretty", bblHeadingFontClass)}
        >
          {href ? (
            <Link href={href}>
              <span className="absolute inset-0 z-10" />
              {event.title}
            </Link>
          ) : (
            event.title
          )}
        </H4>
      </CardHeader>

      <CardDescription className="line-clamp-none px-5 pb-5">
        <Stack direction="column" size="xs" className="items-start">
          {event.description && <span>{event.description}</span>}
          <Stack size="sm" wrap className="text-muted-foreground">
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {location}
              </span>
            )}
            {event.hostOrganization && <span>Host: {event.hostOrganization.name}</span>}
            <span>
              {event._count.mediaAttachments} photo
              {event._count.mediaAttachments === 1 ? "" : "s"}
            </span>
          </Stack>
          {event.rankAwards.length > 0 && (
            <Stack size="xs" wrap>
              {event.rankAwards.slice(0, 3).map(award => (
                <Badge key={award.id} variant="outline" size="sm">
                  {award.passport.displayName ?? award.passport.user?.name ?? "Unnamed"} -{" "}
                  {award.rank.shortName ?? award.rank.name}
                </Badge>
              ))}
              {event.rankAwards.length > 3 && (
                <Badge variant="soft" size="sm">
                  +{event.rankAwards.length - 3} more
                </Badge>
              )}
            </Stack>
          )}
        </Stack>
      </CardDescription>
    </Card>
  )
}
