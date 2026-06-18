import { CalendarDaysIcon, MapPinIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { formatDate } from "./event-detail-format"

/**
 * The ceremony page header: the event title (BBL heading font via the `var()`
 * fallback idiom) plus the date / location / linked-award-count badges.
 */
export function EventDetailHeader({
  title,
  eventDate,
  location,
  awardCount,
}: {
  title: string
  eventDate: Date | null
  location: string | null
  awardCount: number
}) {
  return (
    <Intro>
      <IntroTitle className={bblHeadingFontClass}>{title}</IntroTitle>
      <IntroDescription>
        <Stack size="sm" wrap>
          <Badge variant="outline" size="lg" prefix={<CalendarDaysIcon />}>
            {formatDate(eventDate)}
          </Badge>
          {location && (
            <Badge variant="soft" size="lg" prefix={<MapPinIcon />}>
              {location}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {awardCount} linked award{awardCount === 1 ? "" : "s"}
          </span>
        </Stack>
      </IntroDescription>
    </Intro>
  )
}
