import type { Prisma } from "~/.generated/prisma/client"

const promotionEventPersonPayload = {
  id: true,
  name: true,
  image: true,
  lineageNode: {
    select: { slug: true },
  },
} satisfies Prisma.UserSelect

const promotionEventOrganizationPayload = {
  id: true,
  name: true,
  slug: true,
  city: true,
  state: true,
} satisfies Prisma.OrganizationSelect

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
      id: true,
      awardedAt: true,
      location: true,
      notes: true,
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
    },
    orderBy: [{ awardedAt: "asc" as const }],
  },
  mediaAttachments: {
    where: {
      media: { isPublic: true },
    },
    select: {
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
    },
    orderBy: [{ sortOrder: "asc" as const }],
  },
} satisfies Prisma.PromotionEventSelect

export type PromotionEventDetail = Prisma.PromotionEventGetPayload<{
  select: typeof promotionEventDetailPayload
}>
