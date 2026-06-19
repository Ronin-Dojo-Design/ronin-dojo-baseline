import { PrismaPg } from "@prisma/adapter-pg"
import {
  Brand,
  CertificationType,
  DifficultyLevel,
  OrganizationType,
  PrismaClient,
  TechniqueCategory,
  TechniquePosition,
} from "~/.generated/prisma/client"
import curriculumData from "./data/bbl-bjj-curriculum.json"
import graphData from "./data/bbl-bjj-graph.json"

/**
 * Import the BJJ-only TechniqueGraph + curriculum data from the old Vite monorepo.
 *
 * Source snapshots:
 * - /Users/brianscott/dev/ronin-dojo-monorepo/src/brands/tuffbuffs/components/canvas/bjjCanvasData.js
 * - /Users/brianscott/dev/ronin-dojo-monorepo/src/brands/tuffbuffs/data/curriculum/bjj.js
 *
 * BBL source history did not contain a TechniqueGraph canvas variant, so the tuffbuffs
 * BJJ canvas is the selected graph source. Non-BJJ slices are intentionally excluded.
 *
 * Usage:
 *   cd apps/web && bun run prisma/import-bbl-bjj-curriculum.ts
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = Brand.BBL
const ORG_SLUG = "black-belt-legacy"
const GRAPH_TAG_SLUG = "bjj-technique-graph"
const CURRICULUM_TAG_SLUG = "bjj-curriculum"
const PUBLISHED_AT = new Date("2026-06-19T00:00:00.000Z")

type BjjGraphNode = {
  id: string
  type: "position" | "submission" | "transition" | "counter"
  label: string
  description: string
  x: number
  y: number
  curriculumIds?: string[]
}

type BjjGraphEdge = {
  id: string
  from: string
  to: string
  color?: string
}

type BjjCurriculumTechnique = {
  id: string
  name: string
  category: string
  description?: string
  accessLevel?: string
  isRequired?: boolean
  keyPoints?: string[]
  tags?: string[]
}

type BjjCurriculumSection = {
  id: string
  name: string
  category: string
  techniques: BjjCurriculumTechnique[]
}

type BjjCurriculumLevel = {
  level: {
    id: number
    name: string
    belt: string
    stripes: number
    color: string
    estimatedMonths: number
  }
  sections: BjjCurriculumSection[]
}

const graph = graphData as { nodes: BjjGraphNode[]; edges: BjjGraphEdge[] }
const curriculum = curriculumData as { levels: BjjCurriculumLevel[] }

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

const humanize = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

const rankShortNameForLevel = (levelId: number) => {
  if (levelId === 1) return "W0"
  if (levelId === 2) return "W1"
  if (levelId === 3) return "W2"
  if (levelId === 4) return "W3"
  if (levelId >= 5 && levelId < 9) return "BL0"
  if (levelId >= 9 && levelId < 13) return "P0"
  if (levelId >= 13 && levelId < 15) return "BR0"
  return "BK0"
}

const difficultyForLevel = (levelId: number): DifficultyLevel => {
  if (levelId <= 3) return DifficultyLevel.BEGINNER
  if (levelId <= 5) return DifficultyLevel.INTERMEDIATE
  if (levelId <= 9) return DifficultyLevel.ADVANCED
  return DifficultyLevel.EXPERT
}

const categoryForNode = (type: BjjGraphNode["type"]): TechniqueCategory | null => {
  if (type === "submission") return TechniqueCategory.SUBMISSION
  if (type === "transition") return TechniqueCategory.TRANSITION
  if (type === "counter") return TechniqueCategory.ESCAPE
  return null
}

const positionForNode = (node: BjjGraphNode): TechniquePosition | null => {
  const id = node.id
  if (id === "standing" || id === "sprawl") return TechniquePosition.STANDING
  if (id.includes("half-guard") || id === "z-guard") return TechniquePosition.HALF_GUARD
  if (id.includes("guard")) {
    if (id === "open-guard" || id === "spider-guard" || id === "de-la-riva" || id === "x-guard") {
      return TechniquePosition.OPEN
    }
    return TechniquePosition.GUARD
  }
  if (id === "mount") return TechniquePosition.MOUNT
  if (id === "side-control" || id === "knee-on-belly") return TechniquePosition.SIDE_CONTROL
  if (id === "back-mount") return TechniquePosition.BACK
  if (id === "turtle") return TechniquePosition.TURTLE
  return null
}

const notesForTechnique = ({
  technique,
  level,
  section,
}: {
  technique: BjjCurriculumTechnique
  level: BjjCurriculumLevel["level"]
  section: BjjCurriculumSection
}) => {
  const lines = [
    `Level: ${level.name}`,
    `Section: ${section.name}`,
    `Category: ${humanize(technique.category)}`,
    `Access: ${technique.accessLevel ?? "public"}`,
    `Required: ${technique.isRequired ? "yes" : "no"}`,
    "",
    technique.description ?? "",
  ]

  if (technique.keyPoints?.length) {
    lines.push("", "Key points:", ...technique.keyPoints.map(point => `- ${point}`))
  }

  if (technique.tags?.length) {
    lines.push("", `Tags: ${technique.tags.join(", ")}`)
  }

  lines.push("", `Source ID: ${technique.id}`)

  return lines.filter((line, index, all) => line || all[index - 1]).join("\n")
}

async function ensureBblOrg() {
  return await db.organization.upsert({
    where: { brand_slug: { brand: BRAND, slug: ORG_SLUG } },
    update: {
      name: "Black Belt Legacy",
      type: OrganizationType.DOJO,
    },
    create: {
      brand: BRAND,
      name: "Black Belt Legacy",
      slug: ORG_SLUG,
      type: OrganizationType.DOJO,
      description: "Black Belt Legacy BJJ curriculum and technique graph source.",
    },
  })
}

async function ensureBjjDiscipline() {
  const existing = await db.discipline.findFirst({
    where: { OR: [{ slug: "bjj" }, { code: "bjj" }, { name: "Brazilian Jiu-Jitsu" }] },
    orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
  })

  if (existing) return existing

  return await db.discipline.create({
    data: {
      name: "Brazilian Jiu-Jitsu",
      slug: "bjj",
      code: "bjj",
      isSystem: true,
      foundedBy: "Hélio Gracie, Carlos Gracie",
      yearEstablished: 1925,
      history:
        "Developed in Brazil from Kodokan judo ground fighting by the Gracie family. Emphasizes leverage-based submissions and positional control.",
    },
  })
}

async function ensureRankId(disciplineId: string, levelId: number) {
  const shortName = rankShortNameForLevel(levelId)
  const rank = await db.rank.findFirst({
    where: {
      shortName,
      rankSystem: { disciplineId },
    },
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  })

  return rank?.id ?? null
}

function flattenCurriculum() {
  const bySourceId = new Map<
    string,
    {
      technique: BjjCurriculumTechnique
      level: BjjCurriculumLevel["level"]
      section: BjjCurriculumSection
      order: number
    }
  >()

  let order = 1
  for (const level of curriculum.levels) {
    for (const section of level.sections) {
      for (const technique of section.techniques) {
        bySourceId.set(technique.id, {
          technique,
          level: level.level,
          section,
          order: order++,
        })
      }
    }
  }

  return bySourceId
}

async function ensureCategory(slug: string, name: string, description: string) {
  await db.category.upsert({
    where: { slug },
    update: { name, description },
    create: { slug, name, description },
  })
}

async function ensureTag(slug: string, name: string) {
  await db.tag.upsert({
    where: { slug },
    update: { name },
    create: { slug, name },
  })
}

async function main() {
  console.log("[bbl-bjj] Importing BJJ graph and curriculum...")
  const organization = await ensureBblOrg()
  const discipline = await ensureBjjDiscipline()

  await db.organizationDiscipline.upsert({
    where: {
      organizationId_disciplineId: {
        organizationId: organization.id,
        disciplineId: discipline.id,
      },
    },
    update: {},
    create: {
      organizationId: organization.id,
      disciplineId: discipline.id,
    },
  })

  await ensureCategory("bjj-curriculum", "BJJ Curriculum", "Brazilian Jiu-Jitsu curriculum items.")
  await ensureCategory("bjj-technique-graph", "BJJ Technique Graph", "BJJ graph techniques.")
  await ensureTag(GRAPH_TAG_SLUG, "BJJ Technique Graph")
  await ensureTag(CURRICULUM_TAG_SLUG, "BJJ Curriculum")

  const curriculumBySourceId = flattenCurriculum()
  const curriculumItemIdBySourceId = new Map<string, string>()
  const courseIdByLevel = new Map<number, string>()

  for (const level of curriculum.levels) {
    const rankId = await ensureRankId(discipline.id, level.level.id)
    const course = await db.course.upsert({
      where: {
        brand_organizationId_slug: {
          brand: BRAND,
          organizationId: organization.id,
          slug: `bjj-level-${level.level.id}-${slugify(level.level.name)}`,
        },
      },
      update: {
        title: `BJJ ${level.level.name}`,
        description: `Brazilian Jiu-Jitsu curriculum for ${level.level.name}.`,
        certificationType: CertificationType.BELT_RANK,
        isPublished: true,
        publishedAt: PUBLISHED_AT,
        disciplineId: discipline.id,
        rankId,
      },
      create: {
        brand: BRAND,
        organizationId: organization.id,
        disciplineId: discipline.id,
        rankId,
        title: `BJJ ${level.level.name}`,
        slug: `bjj-level-${level.level.id}-${slugify(level.level.name)}`,
        description: `Brazilian Jiu-Jitsu curriculum for ${level.level.name}.`,
        certificationType: CertificationType.BELT_RANK,
        isPublished: true,
        publishedAt: PUBLISHED_AT,
      },
    })
    courseIdByLevel.set(level.level.id, course.id)
  }

  let curriculumItemsUpserted = 0
  for (const entry of curriculumBySourceId.values()) {
    const courseId = courseIdByLevel.get(entry.level.id)
    if (!courseId) continue

    const item = await db.curriculumItem.upsert({
      where: { id: `bbl-bjj-curriculum-${entry.technique.id}` },
      update: {
        courseId,
        order: entry.order,
        title: entry.technique.name,
        notes: notesForTechnique(entry),
        mediaUrl: null,
        mediaType: null,
      },
      create: {
        id: `bbl-bjj-curriculum-${entry.technique.id}`,
        courseId,
        order: entry.order,
        title: entry.technique.name,
        notes: notesForTechnique(entry),
        mediaUrl: null,
        mediaType: null,
      },
    })

    curriculumItemIdBySourceId.set(entry.technique.id, item.id)
    curriculumItemsUpserted++
  }

  const techniqueIdByNodeId = new Map<string, string>()
  let techniquesUpserted = 0

  for (const [index, node] of graph.nodes.entries()) {
    const linkedCurriculum = (node.curriculumIds ?? [])
      .map(id => curriculumBySourceId.get(id))
      .filter(Boolean)

    const minLevel = linkedCurriculum.reduce<number | null>((current, item) => {
      if (!item) return current
      return current === null ? item.level.id : Math.min(current, item.level.id)
    }, null)

    const teachingCues = Array.from(
      new Set(linkedCurriculum.flatMap(item => item?.technique.keyPoints ?? [])),
    ).slice(0, 8)

    const tagSlugs = [
      GRAPH_TAG_SLUG,
      `graph-${node.type}`,
      ...linkedCurriculum.flatMap(item => item?.technique.tags ?? []),
    ]

    const technique = await db.technique.upsert({
      where: {
        brand_organizationId_slug: {
          brand: BRAND,
          organizationId: organization.id,
          slug: node.id,
        },
      },
      update: {
        name: node.label,
        description: node.description,
        disciplineId: discipline.id,
        category: categoryForNode(node.type),
        position: positionForNode(node),
        difficultyLevel: minLevel ? difficultyForLevel(minLevel) : null,
        isFoundational: node.type === "position" || (minLevel !== null && minLevel <= 3),
        requiresPartner: true,
        requiresEquipment: false,
        movementPattern: humanize(node.type),
        rangeBand: "BJJ graph",
        teachingCues,
        commonErrors: [],
        safetyNotes:
          node.type === "submission" ? "Practice submissions with controlled pressure." : null,
        isPublished: true,
        sortOrder: index + 1,
        categories: {
          connect: [{ slug: "bjj-technique-graph" }],
        },
        tags: {
          connectOrCreate: Array.from(new Set(tagSlugs)).map(slug => ({
            where: { slug },
            create: { slug, name: humanize(slug) },
          })),
        },
      },
      create: {
        brand: BRAND,
        organizationId: organization.id,
        disciplineId: discipline.id,
        name: node.label,
        slug: node.id,
        description: node.description,
        category: categoryForNode(node.type),
        position: positionForNode(node),
        difficultyLevel: minLevel ? difficultyForLevel(minLevel) : null,
        isFoundational: node.type === "position" || (minLevel !== null && minLevel <= 3),
        requiresPartner: true,
        requiresEquipment: false,
        movementPattern: humanize(node.type),
        rangeBand: "BJJ graph",
        teachingCues,
        commonErrors: [],
        safetyNotes:
          node.type === "submission" ? "Practice submissions with controlled pressure." : null,
        isPublished: true,
        sortOrder: index + 1,
        categories: {
          connect: [{ slug: "bjj-technique-graph" }],
        },
        tags: {
          connectOrCreate: Array.from(new Set(tagSlugs)).map(slug => ({
            where: { slug },
            create: { slug, name: humanize(slug) },
          })),
        },
      },
    })

    techniqueIdByNodeId.set(node.id, technique.id)
    techniquesUpserted++

    for (const [linkIndex, sourceId] of (node.curriculumIds ?? []).entries()) {
      const curriculumItemId = curriculumItemIdBySourceId.get(sourceId)
      if (!curriculumItemId) continue
      await db.techniqueCurriculumLink.upsert({
        where: {
          techniqueId_curriculumItemId: {
            techniqueId: technique.id,
            curriculumItemId,
          },
        },
        update: { sortOrder: linkIndex + 1 },
        create: {
          techniqueId: technique.id,
          curriculumItemId,
          sortOrder: linkIndex + 1,
        },
      })
    }
  }

  let prerequisitesUpserted = 0
  for (const edge of graph.edges) {
    const prerequisiteId = techniqueIdByNodeId.get(edge.from)
    const techniqueId = techniqueIdByNodeId.get(edge.to)
    if (!techniqueId || !prerequisiteId || techniqueId === prerequisiteId) continue

    await db.techniquePrerequisite.upsert({
      where: {
        techniqueId_prerequisiteId: {
          techniqueId,
          prerequisiteId,
        },
      },
      update: { description: `Graph edge ${edge.id}`, isStrict: false },
      create: {
        techniqueId,
        prerequisiteId,
        description: `Graph edge ${edge.id}`,
        isStrict: false,
      },
    })
    prerequisitesUpserted++
  }

  console.log(
    `[bbl-bjj] courses=${courseIdByLevel.size}, curriculumItems=${curriculumItemsUpserted}, techniques=${techniquesUpserted}, prerequisites=${prerequisitesUpserted}`,
  )
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
