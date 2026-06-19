import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export type BjjCurriculumItemView = {
  id: string
  order: number
  title: string
  description: string
  section: string
  category: string
  access: string
  isRequired: boolean
  keyPoints: string[]
  techniqueLinks: {
    id: string
    name: string
    slug: string
  }[]
}

export type BjjCurriculumLevelView = {
  id: string
  title: string
  slug: string
  description: string | null
  rank: {
    name: string
    shortName: string | null
    colorHex: string | null
  } | null
  items: BjjCurriculumItemView[]
}

const sourceField = (notes: string | null, label: string) => {
  if (!notes) return ""
  const line = notes
    .split("\n")
    .find(candidate => candidate.toLowerCase().startsWith(`${label.toLowerCase()}:`))
  return line?.slice(label.length + 1).trim() ?? ""
}

const keyPointsFromNotes = (notes: string | null) => {
  if (!notes) return []
  const lines = notes.split("\n")
  const start = lines.findIndex(line => line.trim() === "Key points:")
  if (start === -1) return []

  const points: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("- ")) break
    points.push(line.slice(2))
  }
  return points
}

const bodyDescription = (notes: string | null) => {
  if (!notes) return ""
  const lines = notes.split("\n")
  const blankAfterMeta = lines.findIndex((line, index) => index > 3 && line.trim() === "")
  const next = blankAfterMeta === -1 ? "" : (lines[blankAfterMeta + 1] ?? "")
  return next.startsWith("Key points:") ? "" : next
}

const levelNumberFromSlug = (slug: string) => {
  const match = /^bjj-level-(\d+)/.exec(slug)
  return match?.[1] ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

export const getBjjCurriculumLibrary = async (brand: Brand): Promise<BjjCurriculumLevelView[]> => {
  "use cache"

  cacheTag("bjj-curriculum")
  cacheLife("minutes")

  const courses = await db.course.findMany({
    where: {
      brand,
      isPublished: true,
      slug: { startsWith: "bjj-level-" },
      discipline: { slug: "bjj" },
      organization: { slug: "black-belt-legacy" },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      rank: { select: { name: true, shortName: true, colorHex: true } },
      curriculumItems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          notes: true,
          techniqueLinks: {
            orderBy: { sortOrder: "asc" },
            select: {
              technique: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  })

  return courses
    .sort((a, b) => levelNumberFromSlug(a.slug) - levelNumberFromSlug(b.slug))
    .map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      rank: course.rank,
      items: course.curriculumItems.map(item => ({
        id: item.id,
        order: item.order,
        title: item.title,
        description: bodyDescription(item.notes),
        section: sourceField(item.notes, "Section"),
        category: sourceField(item.notes, "Category"),
        access: sourceField(item.notes, "Access") || "public",
        isRequired: sourceField(item.notes, "Required") === "yes",
        keyPoints: keyPointsFromNotes(item.notes),
        techniqueLinks: item.techniqueLinks.map(link => ({
          id: link.technique.id,
          name: link.technique.name,
          slug: link.technique.slug,
        })),
      })),
    }))
}
