import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import {
  findPromotionEventSlugs,
  getPromotionEventBySlug,
} from "~/server/web/promotion-events/queries"
import { PromotionEventDetail } from "./_components/promotion-event-detail"
import { formatDate } from "./_components/promotion-event-detail/event-detail-format"

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

export default async function PromotionEventPage({ params }: Props) {
  const { slug } = await params
  const event = await getPromotionEventBySlug(slug)

  if (!event?.slug) notFound()

  return <PromotionEventDetail event={{ ...event, slug: event.slug }} brand={Brand.BBL} />
}
