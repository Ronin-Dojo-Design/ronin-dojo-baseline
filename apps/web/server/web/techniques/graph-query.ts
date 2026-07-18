import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import graphData from "~/prisma/data/bbl-bjj-graph.json"
import { deriveGraphBeltLevel } from "~/server/web/techniques/graph-belt-level"
import { db } from "~/services/db"

const GRAPH_TAG_SLUG = "bjj-technique-graph"

type SourceGraphNode = {
  id: string
  type: BjjTechniqueGraphNode["type"]
  x: number
  y: number
}

type SourceGraphEdge = {
  id: string
  from: string
  to: string
}

const sourceGraph = graphData as {
  nodes: SourceGraphNode[]
  edges: SourceGraphEdge[]
}

const sourceNodeBySlug = new Map(sourceGraph.nodes.map(node => [node.id, node]))
const sourceEdgeByPair = new Map(sourceGraph.edges.map(edge => [`${edge.from}->${edge.to}`, edge]))

export type BjjTechniqueGraphNode = {
  id: string
  techniqueId: string
  slug: string
  label: string
  description: string | null
  type: "position" | "submission" | "transition" | "counter"
  x: number
  y: number
  href: string
  isFoundational: boolean
  difficultyLevel: string | null
  position: string | null
  category: string | null
  beltLevelMin: {
    colorHex: string | null
    name: string | null
  } | null
  teachingCues: string[]
  curriculumItems: {
    id: string
    title: string
    courseTitle: string
    courseSlug: string
  }[]
}

export type BjjTechniqueGraphEdge = {
  id: string
  from: string
  to: string
  type: BjjTechniqueGraphNode["type"]
}

export type BjjTechniqueGraph = {
  nodes: BjjTechniqueGraphNode[]
  edges: BjjTechniqueGraphEdge[]
}

export const getBjjTechniqueGraph = async (brand: Brand): Promise<BjjTechniqueGraph> => {
  "use cache"

  cacheTag("bjj-technique-graph")
  cacheLife("minutes")

  const techniques = await db.technique.findMany({
    where: {
      brand,
      isPublished: true,
      tags: { some: { slug: GRAPH_TAG_SLUG } },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      position: true,
      difficultyLevel: true,
      isFoundational: true,
      teachingCues: true,
      beltLevelMin: { select: { colorHex: true, name: true } },
      curriculumLinks: {
        orderBy: { sortOrder: "asc" },
        select: {
          curriculumItem: {
            select: {
              id: true,
              title: true,
              course: {
                select: {
                  title: true,
                  slug: true,
                  rank: { select: { colorHex: true, name: true, sortOrder: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  })

  const nodeTypeBySlug = new Map<string, BjjTechniqueGraphNode["type"]>()
  const nodes: BjjTechniqueGraphNode[] = []

  for (const technique of techniques) {
    const sourceNode = sourceNodeBySlug.get(technique.slug)
    if (!sourceNode) continue

    nodeTypeBySlug.set(technique.slug, sourceNode.type)
    nodes.push({
      id: technique.slug,
      techniqueId: technique.id,
      slug: technique.slug,
      label: technique.name,
      description: technique.description,
      type: sourceNode.type,
      x: sourceNode.x,
      y: sourceNode.y,
      href: `/techniques/${technique.slug}`,
      isFoundational: technique.isFoundational,
      difficultyLevel: technique.difficultyLevel,
      position: technique.position,
      category: technique.category,
      beltLevelMin: deriveGraphBeltLevel(
        technique.beltLevelMin,
        technique.curriculumLinks.map(link => link.curriculumItem.course.rank),
      ),
      teachingCues: technique.teachingCues,
      curriculumItems: technique.curriculumLinks.map(link => ({
        id: link.curriculumItem.id,
        title: link.curriculumItem.title,
        courseTitle: link.curriculumItem.course.title,
        courseSlug: link.curriculumItem.course.slug,
      })),
    })
  }

  const nodeIds = new Set(nodes.map(node => node.techniqueId))
  const prerequisites = await db.techniquePrerequisite.findMany({
    where: {
      techniqueId: { in: Array.from(nodeIds) },
      prerequisiteId: { in: Array.from(nodeIds) },
    },
    select: {
      technique: { select: { slug: true } },
      prerequisite: { select: { slug: true } },
      description: true,
    },
  })

  const edges = prerequisites.flatMap(edge => {
    const from = edge.prerequisite.slug
    const to = edge.technique.slug
    const sourceEdge = sourceEdgeByPair.get(`${from}->${to}`)
    const targetType = nodeTypeBySlug.get(to) ?? "transition"

    if (!sourceEdge) return []

    return [
      {
        id: sourceEdge.id,
        from,
        to,
        type: targetType,
      },
    ]
  })

  return { nodes, edges }
}
