import type { Prisma } from "~/.generated/prisma/client"

const promotionEventPersonPayload = {
  id: true,
  name: true,
  image: true,
  // Promotee avatar prefers the promoted Passport avatar (SESSION_0326); awarder renders name-only.
  passport: { select: { avatarUrl: true } },
  lineageNode: {
    select: { slug: true },
  },
} satisfies Prisma.UserSelect

const promotionEventOrganizationPayload = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  city: true,
  state: true,
} satisfies Prisma.OrganizationSelect

const promotionEventRankAwardPayload = {
  id: true,
  awardedAt: true,
  location: true,
  user: {
    select: promotionEventPersonPayload,
  },
  rank: {
    select: {
      id: true,
      name: true,
      shortName: true,
      colorHex: true,
      sortOrder: true,
      rankSystem: {
        select: {
          id: true,
          name: true,
          discipline: {
            select: { id: true, name: true, slug: true, code: true },
          },
        },
      },
    },
  },
  awardedBy: {
    select: promotionEventPersonPayload,
  },
  organization: {
    select: promotionEventOrganizationPayload,
  },
} satisfies Prisma.RankAwardSelect

const promotionEventMediaAttachmentPayload = {
  id: true,
  purpose: true,
  sortOrder: true,
  media: {
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
      altText: true,
      thumbnailUrl: true,
      widthPx: true,
      heightPx: true,
    },
  },
} satisfies Prisma.MediaAttachmentSelect

export const promotionEventDetailPayload = {
  id: true,
  title: true,
  slug: true,
  eventDate: true,
  location: true,
  description: true,
  hostOrganization: {
    select: promotionEventOrganizationPayload,
  },
  rankAwards: {
    select: {
      ...promotionEventRankAwardPayload,
      notes: true,
    },
    orderBy: [{ awardedAt: "asc" as const }],
  },
  mediaAttachments: {
    where: {
      media: { isPublic: true },
    },
    select: promotionEventMediaAttachmentPayload,
    orderBy: [{ sortOrder: "asc" as const }],
  },
} satisfies Prisma.PromotionEventSelect

export type PromotionEventDetail = Prisma.PromotionEventGetPayload<{
  select: typeof promotionEventDetailPayload
}>

export const promotionEventCardPayload = {
  id: true,
  title: true,
  slug: true,
  eventDate: true,
  location: true,
  description: true,
  hostOrganization: {
    select: promotionEventOrganizationPayload,
  },
  rankAwards: {
    select: promotionEventRankAwardPayload,
    orderBy: [{ awardedAt: "asc" as const }, { createdAt: "asc" as const }],
  },
  mediaAttachments: {
    where: {
      media: { isPublic: true },
    },
    select: promotionEventMediaAttachmentPayload,
    orderBy: [{ sortOrder: "asc" as const }],
  },
  _count: {
    select: {
      rankAwards: true,
      mediaAttachments: true,
    },
  },
} satisfies Prisma.PromotionEventSelect

export const promotionTimelineAwardPayload = {
  ...promotionEventRankAwardPayload,
  promotionEvent: {
    select: promotionEventCardPayload,
  },
} satisfies Prisma.RankAwardSelect

export type PromotionEventCard = Prisma.PromotionEventGetPayload<{
  select: typeof promotionEventCardPayload
}>

export type PromotionTimelineAwardRow = Prisma.RankAwardGetPayload<{
  select: typeof promotionTimelineAwardPayload
}>
