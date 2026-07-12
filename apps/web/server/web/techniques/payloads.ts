import type { Prisma } from "~/.generated/prisma/client"

// Internal-only (SESSION_0526 D3) — composed into the technique payloads below, not imported elsewhere.
const techniqueMediaPayload = {
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
    // @added SESSION_0525 — the authoring Passport, so the freemium watch-page gate can
    // treat the technique's own author (owner) as entitled even without a paid tier.
    passportId: true,
    // @added SESSION_0527 Slice 0 — per-video freemium: the gate unit is the attachment, so the
    // watch page gates + strips EACH tile individually (`gateTechniqueMedia`), not the whole technique.
    isPremium: true,
  },
  orderBy: { sortOrder: "asc" },
} satisfies Prisma.Technique$mediaAttachmentsArgs

const techniqueDisciplinePayload = {
  select: { id: true, name: true, slug: true },
}

// @added SESSION_0525 (Stream D1) — the tagged belt (`beltLevelMin` FK). `colorHex`
// drives the on-card belt chip (ADR 0022 — never a hardcoded hex); `name`/`shortName`
// label it. Single-belt model: `beltLevelMax` is intentionally not selected this lane.
const techniqueBeltPayload = {
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
  // @added SESSION_0525 — freemium gate flag for the watch page.
  isPremium: true,
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
  // @added SESSION_0525 — freemium flag drives the browse-card "Premium" lock badge.
  isPremium: true,
  sortOrder: true,
  discipline: techniqueDisciplinePayload,
  // @added SESSION_0525 (Stream D1) — tagged belt for the on-card belt chip.
  beltLevelMin: techniqueBeltPayload,
  // @added SESSION_0396 — shared listing taxonomy badges (Tool→Listing parity).
  categories: { select: { name: true, slug: true } },
  // @added SESSION_0525 — media presence (any attachment) so the browse card only shows the
  // "Premium" lock badge when there is actually a video/image to unlock. A count (not rows) keeps
  // the faceted grid cheap; mirrors the watch page's `mediaAttachments.length === 0` no-media path.
  _count: { select: { mediaAttachments: true } },
} satisfies Prisma.TechniqueSelect

// @added SESSION_0525 (Stream D2), hardened SESSION_0526 (A1) — the video-rail SELECT: the standard
// many-card payload PLUS the leading attached videos (`VIDEO` upload or `YOUTUBE` embed). The raw
// media `url` is fetched here ONLY so the poster can be derived SERVER-SIDE (`getTechniqueRails`);
// it is stripped from the shipped `TechniqueRail` DTO, so a premium reel's playable url never
// reaches the client rail (freemium leak fix). Kept OFF `techniqueManyPayload` so the faceted grid
// pays no per-card subquery.
// @changed SESSION_0529 review pass — `isPremium` selected + `take: 10` (was 1): the rail poster
// now derives from the first FREE clip (`toRailRow`), never a premium one whose YouTube thumbnail
// would embed the video id (= the watch URL). Bounded take keeps the join cheap.
export const techniqueRailSelect = {
  ...techniqueManyPayload,
  mediaAttachments: {
    where: { media: { type: { in: ["VIDEO", "YOUTUBE"] } } },
    select: { isPremium: true, media: { select: { type: true, url: true, thumbnailUrl: true } } },
    orderBy: { sortOrder: "asc" },
    take: 10,
  },
} satisfies Prisma.TechniqueSelect

export type TechniqueOne = Prisma.TechniqueGetPayload<{ select: typeof techniqueOnePayload }>
export type TechniqueMany = Prisma.TechniqueGetPayload<{ select: typeof techniqueManyPayload }>

/** The raw row the rail SELECT returns — includes the server-only media `url`. Never shipped as-is. */
export type TechniqueRailRow = Prisma.TechniqueGetPayload<{ select: typeof techniqueRailSelect }>

/**
 * The rail row SHIPPED to the client: the browse-card fields PLUS a derived video poster. The raw
 * media `url` is intentionally ABSENT (SESSION_0526 A1) — only `{ type, posterUrl }` crosses the
 * wire, derived server-side in `getTechniqueRails`. `video` is null when the technique has no
 * rail-eligible video attachment; `posterUrl` is null when it has no FREE clip (SESSION_0529 —
 * premium posters never reach the rail: a YouTube thumbnail embeds the video id).
 */
export type TechniqueRail = TechniqueMany & {
  video: {
    type: TechniqueRailRow["mediaAttachments"][number]["media"]["type"]
    posterUrl: string | null
  } | null
}
