import { cacheLife, cacheTag } from "next/cache"
import { db } from "~/services/db"
import { type PromotionEventDetail, promotionEventDetailPayload } from "./payloads"

export const findPromotionEventSlugs = async (): Promise<Array<{ slug: string }>> => {
  "use cache"

  cacheTag("promotion-events")
  cacheLife("hours")

  const events = await db.promotionEvent.findMany({
    where: { slug: { not: null } },
    select: { slug: true },
    orderBy: { eventDate: "desc" },
  })

  return events
    .map(event => event.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map(slug => ({ slug }))
}

export const getPromotionEventBySlug = async (
  slug: string,
): Promise<PromotionEventDetail | null> => {
  "use cache"

  cacheTag("promotion-events", `promotion-event-${slug}`)
  cacheLife("minutes")

  return await db.promotionEvent.findUnique({
    where: { slug },
    select: promotionEventDetailPayload,
  })
}
