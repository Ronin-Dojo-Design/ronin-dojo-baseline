import type { Metadata } from "next"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { findPublicPromotionEvents } from "~/server/web/promotion-events/queries"
import { PromotionEventsIndex } from "./_components/promotion-events-index"

const PAGE_URL = "/events"
const PAGE_TITLE = "Promotion Events"
const PAGE_DESCRIPTION = "Browse public promotion ceremonies, rank awards, and shared galleries."

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function PromotionEventsIndexPage() {
  const events = await findPublicPromotionEvents(Brand.BBL)

  return (
    <PromotionEventsIndex
      brand={Brand.BBL}
      events={events}
      pageUrl={PAGE_URL}
      pageTitle={PAGE_TITLE}
      pageDescription={PAGE_DESCRIPTION}
    />
  )
}
