import { CalendarDaysIcon, ImageIcon, MapPinIcon, UserRoundIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4, H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getPageMetadata } from "~/lib/pages"
import {
  findPromotionEventSlugs,
  getPromotionEventBySlug,
} from "~/server/web/promotion-events/queries"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return await findPromotionEventSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await getPromotionEventBySlug(slug)

  if (!event) return { title: "Event Not Found" }

  return await getPageMetadata({
    url: `/events/${event.slug}`,
    metadata: {
      title: event.title,
      description:
        event.description ??
        `${formatDate(event.eventDate)} promotion ceremony with ${event.rankAwards.length} linked awards.`,
    },
  })
}

function initials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
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

function organizationLocation(
  org: { city: string | null; state: string | null } | null,
): string | null {
  if (!org) return null
  return [org.city, org.state].filter(Boolean).join(", ") || null
}

export default async function PromotionEventPage({ params }: Props) {
  const { slug } = await params
  const event = await getPromotionEventBySlug(slug)

  if (!event?.slug) notFound()

  const breadcrumbItems = [
    { url: "/events", title: "Events" },
    { url: `/events/${event.slug}`, title: event.title },
  ]
  const eventLocation = event.location ?? organizationLocation(event.hostOrganization)

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <Intro>
        <IntroTitle>{event.title}</IntroTitle>
        <IntroDescription>
          <Stack size="sm" wrap>
            <Badge variant="outline" size="lg" prefix={<CalendarDaysIcon />}>
              {formatDate(event.eventDate)}
            </Badge>
            {eventLocation && (
              <Badge variant="soft" size="lg" prefix={<MapPinIcon />}>
                {eventLocation}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {event.rankAwards.length} linked award{event.rankAwards.length === 1 ? "" : "s"}
            </span>
          </Stack>
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Stack direction="column" size="lg" className="w-full">
            <Card hover={false}>
              <CardHeader>
                <H4>Event Details</H4>
              </CardHeader>
              <CardDescription className="line-clamp-none">
                {event.description ?? "This ceremony does not have a public description yet."}
              </CardDescription>
              <dl className="grid w-full gap-2 text-sm @sm:grid-cols-[9rem_minmax(0,1fr)]">
                {event.hostOrganization && (
                  <>
                    <dt className="text-muted-foreground">Host</dt>
                    <dd>
                      <Link href={`/organizations/${event.hostOrganization.slug}`}>
                        {event.hostOrganization.name}
                      </Link>
                    </dd>
                  </>
                )}
                <dt className="text-muted-foreground">Date</dt>
                <dd>{formatDate(event.eventDate)}</dd>
                {eventLocation && (
                  <>
                    <dt className="text-muted-foreground">Location</dt>
                    <dd>{eventLocation}</dd>
                  </>
                )}
              </dl>
            </Card>

            <Stack direction="column" size="md" className="w-full">
              <Stack className="justify-between w-full">
                <H4>Promotions</H4>
                <Badge variant="soft" size="sm">
                  {event.rankAwards.length}
                </Badge>
              </Stack>

              {event.rankAwards.length === 0 ? (
                <EmptyList>No rank awards are linked to this ceremony yet.</EmptyList>
              ) : (
                <Stack direction="column" size="sm" className="w-full">
                  {event.rankAwards.map(award => {
                    const rankColor = award.rank.colorHex
                    const rankStyle = rankColor
                      ? ({ "--rank-color": rankColor } as CSSProperties)
                      : undefined
                    const promoteeName = award.user.name ?? "Unnamed promotee"

                    return (
                      <Card key={award.id} hover={false} className="p-4" style={rankStyle}>
                        <Stack size="md" className="w-full items-start">
                          <Avatar className="size-11">
                            {award.user.image && (
                              <AvatarImage
                                src={award.user.image}
                                alt={award.user.name ?? "Promotee"}
                              />
                            )}
                            <AvatarFallback>{initials(award.user.name)}</AvatarFallback>
                          </Avatar>

                          <Stack direction="column" size="xs" className="min-w-0 flex-1">
                            <Stack size="sm" wrap>
                              <H5>
                                {award.user.lineageNode?.slug ? (
                                  <Link href={`/lineage?q=${encodeURIComponent(promoteeName)}`}>
                                    {promoteeName}
                                  </Link>
                                ) : (
                                  promoteeName
                                )}
                              </H5>
                              {award.rank.rankSystem.discipline?.name && (
                                <Badge variant="outline" size="sm">
                                  {award.rank.rankSystem.discipline.name}
                                </Badge>
                              )}
                            </Stack>

                            <Stack size="sm" wrap>
                              {rankColor && (
                                <span
                                  aria-hidden
                                  className="inline-block h-3 w-8 rounded-sm border bg-(--rank-color)"
                                />
                              )}
                              <span className="font-medium text-sm">{award.rank.name}</span>
                              {award.rank.shortName && (
                                <Badge variant="soft" size="sm">
                                  {award.rank.shortName}
                                </Badge>
                              )}
                            </Stack>

                            <Stack size="xs" wrap className="text-sm text-muted-foreground">
                              <span>{formatDate(award.awardedAt)}</span>
                              {award.awardedBy && (
                                <>
                                  <span aria-hidden>&middot;</span>
                                  <span>Promoted by {award.awardedBy.name ?? "unknown"}</span>
                                </>
                              )}
                              {award.organization && (
                                <>
                                  <span aria-hidden>&middot;</span>
                                  <Link href={`/organizations/${award.organization.slug}`}>
                                    {award.organization.name}
                                  </Link>
                                </>
                              )}
                              {!award.organization && award.location && (
                                <>
                                  <span aria-hidden>&middot;</span>
                                  <span>{award.location}</span>
                                </>
                              )}
                            </Stack>
                          </Stack>
                        </Stack>
                      </Card>
                    )
                  })}
                </Stack>
              )}
            </Stack>
          </Stack>
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader>
              <H4>Gallery</H4>
            </CardHeader>
            <CardDescription className="line-clamp-none">
              Shared ceremony media is attached to the event, not duplicated on every award.
            </CardDescription>
            <Badge variant="info" size="sm" prefix={<ImageIcon />}>
              {event.mediaAttachments.length} photo{event.mediaAttachments.length === 1 ? "" : "s"}
            </Badge>
          </Card>
        </Section.Sidebar>
      </Section>

      <Section>
        <Section.Content className="md:col-span-3">
          <Stack direction="column" size="md" className="w-full">
            <Stack className="justify-between w-full">
              <H4>Ceremony Photos</H4>
              <Badge variant="soft" size="sm" prefix={<UserRoundIcon />}>
                Read-only
              </Badge>
            </Stack>

            {event.mediaAttachments.length === 0 ? (
              <Card hover={false}>
                <CardHeader>
                  <H5>No ceremony photos yet</H5>
                </CardHeader>
                <Note>
                  Photos can be added once the event editor and upload flow ship in a later slice.
                </Note>
              </Card>
            ) : (
              <Grid>
                {event.mediaAttachments.map(attachment => {
                  const media = attachment.media
                  return (
                    <Card key={attachment.id} hover={false} className="overflow-hidden p-0">
                      <Image
                        src={media.thumbnailUrl ?? media.url}
                        alt={media.altText ?? media.title ?? event.title}
                        width={720}
                        height={480}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <Stack direction="column" size="xs" className="w-full p-4">
                        <H5>{media.title ?? "Ceremony photo"}</H5>
                        {media.altText && <Note className="text-xs">{media.altText}</Note>}
                      </Stack>
                    </Card>
                  )
                })}
              </Grid>
            )}
          </Stack>
        </Section.Content>
      </Section>
    </>
  )
}
