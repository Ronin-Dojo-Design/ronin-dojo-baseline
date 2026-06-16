import type { Prisma } from "~/.generated/prisma/client"

export const techniqueMediaPayload = {
  select: {
    id: true,
    media: {
      select: {
        id: true,
        type: true,
        url: true,
        thumbnailUrl: true,
        title: true,
        altText: true,
        mimeType: true,
      },
    },
    purpose: true,
    sortOrder: true,
  },
  orderBy: { sortOrder: "asc" },
} satisfies Prisma.Technique$mediaAttachmentsArgs

export const techniqueDisciplinePayload = {
  select: { id: true, name: true, slug: true },
}

export const techniqueOnePayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  position: true,
  category: true,
  difficultyLevel: true,
  isGi: true,
  isFoundational: true,
  requiresPartner: true,
  requiresEquipment: true,
  movementPattern: true,
  rangeBand: true,
  teachingCues: true,
  commonErrors: true,
  safetyNotes: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  discipline: techniqueDisciplinePayload,
  mediaAttachments: techniqueMediaPayload,
} satisfies Prisma.TechniqueSelect

export const techniqueManyPayload = {
  id: true,
  brand: true,
  name: true,
  slug: true,
  description: true,
  position: true,
  category: true,
  difficultyLevel: true,
  isGi: true,
  isFoundational: true,
  requiresPartner: true,
  sortOrder: true,
  discipline: techniqueDisciplinePayload,
  // @added SESSION_0396 — shared listing taxonomy badges (Tool→Listing parity).
  categories: { select: { name: true, slug: true } },
} satisfies Prisma.TechniqueSelect

export type TechniqueOne = Prisma.TechniqueGetPayload<{ select: typeof techniqueOnePayload }>
export type TechniqueMany = Prisma.TechniqueGetPayload<{ select: typeof techniqueManyPayload }>
