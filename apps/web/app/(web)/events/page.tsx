import { CalendarDaysIcon, CameraIcon, GraduationCapIcon, MapPinIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4, H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPageWithGenericItems,
  generateSchemaReference,
} from "~/lib/structured-data"
import { findPublicPromotionEvents } from "~/server/web/promotion-events/queries"

const PAGE_URL = "/events"
const PAGE_TITLE = "Promotion Events"
const PAGE_DESCRIPTION = "Browse public promotion ceremonies, rank awards, and shared galleries."

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown date"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "Unknown date"
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

function eventLocation(event: {
  location: string | null
  hostOrganization: { city: string | null; state: string | null } | null
}) {
  return (
    event.location ??
    ([event.hostOrganization?.city, event.hostOrganization?.state].filter(Boolean).join(", ") ||
      null)
  )
}

export default async function PromotionEventsIndexPage() {
  const brand = await getRequestBrand()
  const events = await findPublicPromotionEvents(brand)

  const itemListItems = events
    .filter(event => event.slug)
    .map(event => ({
      name: event.title,
      url: `/events/${event.slug}`,
      description: event.description,
      id: generateSchemaReference("CreativeWork", `/events/${event.slug}`, event.title)["@id"],
      provider: event.hostOrganization
        ? generateSchemaReference(
            "Organization",
            `/organizations/${event.hostOrganization.slug}`,
            event.hostOrganization.name,
          )
        : undefined,
    }))

  return (
    <>
      <StructuredData
        data={createGraph([
          generateBreadcrumbs([{ url: PAGE_URL, title: PAGE_TITLE }]),
          generateCollectionPageWithGenericItems(
            PAGE_URL,
            PAGE_TITLE,
            PAGE_DESCRIPTION,
            itemListItems,
            "CreativeWork",
          ),
        ])}
      />

      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Stack className="mb-4 w-full justify-between">
            <p className="text-sm text-muted-foreground">
              {events.length} event{events.length === 1 ? "" : "s"}
            </p>
            <Badge variant="soft" size="sm">
              Read-only
            </Badge>
          </Stack>

          {events.length === 0 ? (
            <EmptyList>No public promotion events are available yet.</EmptyList>
          ) : (
            <Grid>
              {events.map(event => {
                const href = event.slug ? `/events/${event.slug}` : null
                const thumbnail = event.mediaAttachments[0]?.media
                const location = eventLocation(event)

                return (
                  <Card
                    key={event.id}
                    hover={Boolean(href)}
                    isRevealed={Boolean(href)}
                    className="p-0"
                  >
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
                        className="text-pretty"
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
                          {event.hostOrganization && (
                            <span>Host: {event.hostOrganization.name}</span>
                          )}
                          <span>
                            {event._count.mediaAttachments} photo
                            {event._count.mediaAttachments === 1 ? "" : "s"}
                          </span>
                        </Stack>
                        {event.rankAwards.length > 0 && (
                          <Stack size="xs" wrap>
                            {event.rankAwards.slice(0, 3).map(award => (
                              <Badge key={award.id} variant="outline" size="sm">
                                {award.user.name ?? "Unnamed"} -{" "}
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
              })}
            </Grid>
          )}
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader>
              <H5>Read Surface</H5>
            </CardHeader>
            <CardDescription className="line-clamp-none">
              Ceremony pages group shared event details, linked rank awards, and public gallery
              media.
            </CardDescription>
          </Card>
        </Section.Sidebar>
      </Section>
    </>
  )
}
