import type { Prisma } from "~/.generated/prisma/client"
import { publicPassportPayload } from "~/server/web/passport/public-payloads"

// Phase 3c (SOT-ADR D1): the promotee (earner) is Passport-rooted. Identity is on the Passport;
// the attached account (nullable `user`) is the link to a lineage node slug + account avatar fallback.
// issue #134 surface-D: consume the canonical publicPassportPayload base; add lineageNode as a
// surface-local add-on because award-card links to the lineage node page (a different URL from the
// directoryProfile slug that publicPassportPayload routes through).
const promotionEventPassportPayload = {
  ...publicPassportPayload,
  lineageNode: {
    select: { slug: true },
  },
} satisfies Prisma.PassportSelect

// The promoter actor is still a real account (`awardedBy`); historical/imported promoters carry
// identity on `awardedByPassport`.
const promotionEventPromoterAccountPayload = {
  id: true,
  name: true,
  image: true,
} satisfies Prisma.UserSelect

const promotionEventPromoterPassportPayload = {
  id: true,
  displayName: true,
  avatarUrl: true,
} satisfies Prisma.PassportSelect

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
  passport: {
    select: promotionEventPassportPayload,
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
    select: promotionEventPromoterAccountPayload,
  },
  awardedByPassport: {
    select: promotionEventPromoterPassportPayload,
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
