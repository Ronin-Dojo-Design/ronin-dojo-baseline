import { cache } from "react"
import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"
import type { StaticBblRankColorMap } from "../bbl-landing-content"

type RankColorRow = {
  name: string
  shortName: string | null
  colorHex: string | null
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replaceAll(/[—–]/g, "-")
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim()

const degreeNumber = (value: string) => normalize(value).match(/\b(\d+)(?:st|nd|rd|th)?\b/)?.[1]

const beltFamily = (value: string) => {
  const normalized = normalize(value)
  if (normalized.includes("coral")) return "coral"
  if (normalized.includes("red")) return "red"
  if (normalized.includes("black")) return "black"
  if (normalized.includes("white")) return "white"
  return null
}

const rankMatchesLabel = (rank: RankColorRow, label: string) => {
  const normalizedLabel = normalize(label)
  const normalizedRank = normalize(rank.name)

  if (normalizedRank === normalizedLabel) return true
  if (rank.shortName && normalize(rank.shortName) === normalizedLabel) return true

  const labelFamily = beltFamily(label)
  if (!labelFamily || beltFamily(rank.name) !== labelFamily) return false

  const labelDegree = degreeNumber(label)
  if (!labelDegree) return true

  return degreeNumber(rank.name) === labelDegree
}

const colorForLabel = (ranks: RankColorRow[], label: string) =>
  ranks.find(rank => rankMatchesLabel(rank, label))?.colorHex ?? null

/**
 * Resolves the static legacy-copy rank chips from the BJJ rank-system rows. The
 * UI receives only `Rank.colorHex` values; if seeded rank data is absent or a
 * label does not match, `null` lets `<BeltSwatch>` render its neutral fallback.
 */
export const getStaticBblRankColors = cache(async (labels: readonly string[]) => {
  const ranks = await db.rank.findMany({
    where: {
      rankSystem: {
        name: "IBJJF Belt System",
        discipline: {
          OR: [{ slug: "bjj" }, { code: "BJJ" }, { name: "Brazilian Jiu-Jitsu" }],
        },
      },
      OR: [{ brand: Brand.BBL }, { brand: null }],
    },
    select: { name: true, shortName: true, colorHex: true },
    orderBy: { sortOrder: "asc" },
  })

  return labels.reduce<StaticBblRankColorMap>((colors, label) => {
    colors[label] = colorForLabel(ranks, label)
    return colors
  }, {})
})
