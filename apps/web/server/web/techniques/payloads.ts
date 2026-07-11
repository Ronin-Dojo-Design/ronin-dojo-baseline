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

// @added SESSION_0525 (Stream D1) — the tagged belt (`beltLevelMin` FK). `colorHex`
// drives the on-card belt chip (ADR 0022 — never a hardcoded hex); `name`/`shortName`
// label it. Single-belt model: `beltLevelMax` is intentionally not selected this lane.
export const techniqueBeltPayload = {
  select: { id: true, name: true, shortName: true, colorHex: true, sortOrder: true },
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
  beltLevelMin: techniqueBeltPayload,
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
  // @added SESSION_0525 (Stream D1) — tagged belt for the on-card belt chip.
  beltLevelMin: techniqueBeltPayload,
  // @added SESSION_0396 — shared listing taxonomy badges (Tool→Listing parity).
  categories: { select: { name: true, slug: true } },
} satisfies Prisma.TechniqueSelect

// @added SESSION_0525 (Stream D2) — the video-rail row: the standard many-card payload
// PLUS a lightweight "has a video?" probe (one filtered `MediaAttachment`, so the rail
// card can show a play indicator without pulling the full media list). Kept OFF the main
// grid's `techniqueManyPayload` so the faceted grid pays no per-card subquery.
export const techniqueRailPayload = {
  ...techniqueManyPayload,
  mediaAttachments: {
    where: { media: { type: "VIDEO" } },
    select: { id: true },
    take: 1,
  },
} satisfies Prisma.TechniqueSelect

export type TechniqueOne = Prisma.TechniqueGetPayload<{ select: typeof techniqueOnePayload }>
export type TechniqueMany = Prisma.TechniqueGetPayload<{ select: typeof techniqueManyPayload }>
export type TechniqueRail = Prisma.TechniqueGetPayload<{ select: typeof techniqueRailPayload }>
