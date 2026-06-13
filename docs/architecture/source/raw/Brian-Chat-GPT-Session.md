---
title: "Lineage Raw Source — Brian ChatGPT Session (Balkan visual-parity spike, candidate-B)"
slug: brian-chat-gpt-session
type: source
status: active
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0379
pairs_with:
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/petey-plan-0379.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Brian-ChatGPT-Session

_Verbatim ChatGPT session pasted by Brian during SESSION_0379, captured as **candidate-B** for the lineage-tree path comparison — a Balkan `balkan-orgchart-js-community` visual-parity spike. This is source material, not accepted spec/schema/file layout. The canonical design is the runbook §0/§0a + `petey-plan-0379` (candidate-A, donatso fork). Some repo claims in the text below (package manager, session history, package names) are ChatGPT's and are **unverified** by this repo._

---

I’ll treat this as a buildable visual-parity spike, borrowing Balkan TSX behaviors without making it the final engine. The prototype will keep Ronin lineage truth separate while modeling partners, assistants, and grouped student subtrees.
The repo already has a React-first lineage canvas with drawers, paths, forest support, node cards, and editor drag/drop, so this should be an adapter/visual-language layer. Useful Balkan ideas map to pid, ppid, stpid, tags, slinks, and clinks without changing schema.
Looking for available tools

Thought for 8m 10s
According to a document from 2026-06-10, SESSION_0360 already normalized Ronin to Bun as the only package manager, removed the pnpm/npm drift, moved lint/format to Oxc, and left SESSION_0361 as the next oRPC scaffold session. So for this Balkan visual-parity spike, use bun add, keep this isolated, and do not let it mutate the canonical lineage data model yet.
The right move is:

Build Balkan-style lineage visual parity as an isolated renderer spike.

Do not replace canonical lineage truth.
Do not add free x/y editing.
Do not let Balkan's org/family semantics become the database model.
Use it to prove:
  - partners / co-promoters
  - assistants
  - grouped student cohorts under instructors
  - secondary lineage overlays
  - BBL card styling

That aligns with BBL’s active stories: public lineage trees need public members, profile drawer behavior, root-path clarity, grouped promotion rows, unknown-date handling, and trust badges. The PRD says BBL’s lineage view should answer who promoted whom, who belongs to which branch, and where a person sits in the larger tree.
One important caution: Balkan OrgChart is a product with Community and Commercial licensing paths, so treat this as a spike unless you confirm the license/package choice is acceptable for production. Their docs explicitly distinguish Community and Commercial licenses.

What to build first
Create this as a Balkan parity route:

apps/web/
  app/(web)/lineage/balkan-demo/page.tsx

  components/web/lineage/balkan/
    balkan-lineage-org-chart.tsx
    balkan-lineage-demo-data.ts
    balkan-lineage-types.ts
    to-balkan-orgchart.ts

This should not replace:

apps/web/components/web/lineage/lineage-org-chart.tsx
apps/web/components/web/lineage/lineage-tree-board.tsx

For now, it is a visual/UX proving ground.

Install
Because SESSION_0360 made Bun canonical, use:

cd /Users/brianscott/dev/ronin-dojo-app

bun add balkan-orgchart-js-community

If you decide to use the commercial/full package instead:

bun add balkan-orgchart-js

The official docs show npm package installs for balkan-orgchart-js and balkan-orgchart-js-community, and import examples for both.

Why Balkan maps well to your lineage problem
Balkan’s key data fields line up cleanly with the visual language you want:
Balkan field / feature	Lineage meaning
id	visual node ID
pid	primary visual parent / primary promoter
tags: ["assistant"]	assistant instructor / steward / non-promoting coach
tags: ["partner"] / left-partner / right-partner	co-promoter, co-founder, school partner, association peer
ppid	child belongs under a specific partner/co-promoter lane
stpid	subtree group under an instructor
slinks	secondary lineage links, cross-training, alternate promoter
clinks	curved/context links for special relationships
tags + subTreeConfig	group-specific layout, template, spacing
Balkan’s docs say assistant nodes are declared with tags: ["assistant"]. Partner nodes can use partner, left-partner, or right-partner, and partner children can use pid plus ppid. Subtrees use stpid instead of pid, and subTreeConfig can control orientation, layout, columns, and spacing. Balkan also supports slinks for second links and clinks for curved links, which is exactly the right visual mechanism for secondary promoters/cross-training without corrupting the main tree.

Design decision for your lineage semantics
Use this mapping:

Primary lineage:
  pid = primaryVisualParentId

Assistant instructor:
  tags: ["assistant"]
  pid = instructorId

Co-promoter / co-founder / actual peer partner:
  tags: ["partner"]
  pid = primary instructor / shared anchor

Child promoted by a partner lane:
  pid = main instructor
  ppid = partnerId

Grouped student cohort:
  group node:
    stpid = instructorId
    tags = ["student-group"]
  students:
    pid = groupNodeId

Secondary promoter / cross-training / association:
  slinks or clinks

Do not use partner for every secondary promoter. It visually implies a peer/couple/partnership relationship. For martial arts, most secondary relationships should be overlays, not parent/partner structure.

File 1 — balkan-lineage-types.ts

// apps/web/components/web/lineage/balkan/balkan-lineage-types.ts

export type LineageVisualRole =
  | "ROOT"
  | "INSTRUCTOR"
  | "STUDENT"
  | "ASSISTANT"
  | "PARTNER"
  | "GROUP"

export type LineageTrustStatus = "VERIFIED" | "PENDING" | "DISPUTED" | "IMPORTED"

export type LineageSecondaryLinkKind =
  | "PROMOTED_BY"
  | "TRAINED_WITH"
  | "AFFILIATED_UNDER"
  | "CO_PROMOTER"
  | "ASSISTED_BY"
  | "HONORARY"

export type LineageVisualNode = {
  id: string
  passportId?: string
  slug: string
  displayName: string
  initials: string
  role: LineageVisualRole

  /**
   * The main visual lineage parent.
   * This is the clean readable line.
   */
  primaryParentId?: string

  /**
   * For partner/co-promoter lanes.
   * Balkan uses ppid to place a child under a specific partner.
   */
  partnerParentId?: string

  /**
   * For grouped cohorts.
   * Balkan uses stpid to make a node the root of a subtree under another node.
   */
  subtreeParentId?: string

  rankLabel?: string
  rankColorHex?: string
  organizationName?: string
  disciplineLabel?: string
  avatarUrl?: string | null

  trustStatus: LineageTrustStatus

  groupLabel?: string
  groupKind?: "PROMOTION_DATE" | "RANK" | "GENERATION" | "TEAM" | "CUSTOM"
  promotionDateLabel?: string
  showPublicLabel?: boolean

  sortOrder?: number
}

export type LineageSecondaryLink = {
  id: string
  fromId: string
  toId: string
  kind: LineageSecondaryLinkKind
  label?: string
  verified?: boolean
}

export type LineageBalkanGraph = {
  nodes: LineageVisualNode[]
  secondaryLinks: LineageSecondaryLink[]
  rootIds?: string[]
}

export type BalkanNode = {
  id: string
  pid?: string
  ppid?: string
  stpid?: string
  tags?: string[]

  name: string
  initials: string
  title?: string
  rankLabel?: string
  rankColorHex?: string
  organizationName?: string
  disciplineLabel?: string
  avatarUrl?: string
  trustStatus: LineageTrustStatus
  groupLabel?: string
  promotionDateLabel?: string
  sortOrder?: number
}

export type BalkanLink = {
  from: string
  to: string
  label?: string
  template?: string
}

export type BalkanProjection = {
  nodes: BalkanNode[]
  slinks: BalkanLink[]
  clinks: BalkanLink[]
  roots?: string[]
}


File 2 — balkan-lineage-demo-data.ts
This gives you the visual parity proof: instructor, assistant, partner/co-promoter, grouped student cohorts, and secondary overlays.

// apps/web/components/web/lineage/balkan/balkan-lineage-demo-data.ts

import type { LineageBalkanGraph } from "./balkan-lineage-types"

export const balkanLineageDemoGraph: LineageBalkanGraph = {
  rootIds: ["rigan-machado"],

  nodes: [
    {
      id: "rigan-machado",
      slug: "rigan-machado",
      displayName: "Rigan Machado",
      initials: "RM",
      role: "ROOT",
      rankLabel: "Red Belt",
      rankColorHex: "#dc2626",
      organizationName: "Machado Jiu-Jitsu",
      disciplineLabel: "Brazilian Jiu-Jitsu",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 0,
    },

    /**
     * Partner/co-promoter lane.
     * Use this for true co-promoter/co-founder/peer lineage roles.
     */
    {
      id: "co-promoter-anchor",
      slug: "co-promoter-anchor",
      displayName: "Co-Promoter",
      initials: "CP",
      role: "PARTNER",
      primaryParentId: "rigan-machado",
      rankLabel: "Senior Black Belt",
      rankColorHex: "#111827",
      organizationName: "Promotion Panel",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 1,
    },

    /**
     * Assistant node.
     * Good for non-primary instructor, steward, historian, program assistant.
     */
    {
      id: "lineage-steward",
      slug: "lineage-steward",
      displayName: "Lineage Steward",
      initials: "LS",
      role: "ASSISTANT",
      primaryParentId: "rigan-machado",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Black Belt Legacy",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 2,
    },

    {
      id: "bob-bass",
      slug: "bob-bass",
      displayName: "Bob Bass",
      initials: "BB",
      role: "INSTRUCTOR",
      primaryParentId: "rigan-machado",
      rankLabel: "Coral Belt",
      rankColorHex: "#991b1b",
      organizationName: "Machado Lineage",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 10,
    },
    {
      id: "chris-haueter",
      slug: "chris-haueter",
      displayName: "Chris Haueter",
      initials: "CH",
      role: "INSTRUCTOR",
      primaryParentId: "rigan-machado",
      rankLabel: "Coral Belt",
      rankColorHex: "#991b1b",
      organizationName: "Combat Base",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 20,
    },
    {
      id: "erik-paulson",
      slug: "erik-paulson",
      displayName: "Erik Paulson",
      initials: "EP",
      role: "INSTRUCTOR",
      primaryParentId: "rigan-machado",
      rankLabel: "Coral Belt",
      rankColorHex: "#991b1b",
      organizationName: "CSW",
      disciplineLabel: "BJJ / CSW",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 30,
    },

    /**
     * Subtree group under Bob Bass.
     * This is the important grouped-students visual.
     */
    {
      id: "bob-bass-students-black-belts",
      slug: "bob-bass-students-black-belts",
      displayName: "Bob Bass Black Belt Students",
      initials: "BB",
      role: "GROUP",
      subtreeParentId: "bob-bass",
      groupLabel: "Black Belt Students",
      groupKind: "RANK",
      showPublicLabel: true,
      promotionDateLabel: "Grouped by rank",
      rankLabel: "Student Cohort",
      rankColorHex: "#111827",
      organizationName: "Bob Bass Branch",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 100,
    },
    {
      id: "legacy-student-1",
      slug: "legacy-student-1",
      displayName: "Legacy Student 1",
      initials: "L1",
      role: "STUDENT",
      primaryParentId: "bob-bass-students-black-belts",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Bob Bass Branch",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 101,
    },
    {
      id: "legacy-student-2",
      slug: "legacy-student-2",
      displayName: "Legacy Student 2",
      initials: "L2",
      role: "STUDENT",
      primaryParentId: "bob-bass-students-black-belts",
      rankLabel: "Brown Belt",
      rankColorHex: "#7c2d12",
      organizationName: "Bob Bass Branch",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "PENDING",
      sortOrder: 102,
    },

    /**
     * A student placed under a specific partner/co-promoter lane.
     */
    {
      id: "co-promoted-student",
      slug: "co-promoted-student",
      displayName: "Co-Promoted Student",
      initials: "CS",
      role: "STUDENT",
      primaryParentId: "rigan-machado",
      partnerParentId: "co-promoter-anchor",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Promotion Panel",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 200,
    },

    /**
     * Subtree group under Chris Haueter.
     */
    {
      id: "haueter-combat-base-group",
      slug: "haueter-combat-base-group",
      displayName: "Combat Base Branch",
      initials: "CB",
      role: "GROUP",
      subtreeParentId: "chris-haueter",
      groupLabel: "Combat Base Branch",
      groupKind: "TEAM",
      showPublicLabel: true,
      rankLabel: "Branch",
      rankColorHex: "#1f2937",
      organizationName: "Combat Base",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 300,
    },
    {
      id: "combat-base-student-1",
      slug: "combat-base-student-1",
      displayName: "Combat Base Student",
      initials: "CB",
      role: "STUDENT",
      primaryParentId: "haueter-combat-base-group",
      rankLabel: "Black Belt",
      rankColorHex: "#111827",
      organizationName: "Combat Base",
      disciplineLabel: "BJJ",
      avatarUrl: null,
      trustStatus: "VERIFIED",
      sortOrder: 301,
    },
  ],

  secondaryLinks: [
    {
      id: "legacy-student-2-secondary-promoter",
      fromId: "lineage-steward",
      toId: "legacy-student-2",
      kind: "ASSISTED_BY",
      label: "assisted / reviewed",
      verified: true,
    },
    {
      id: "erik-to-combat-base-student-cross-training",
      fromId: "erik-paulson",
      toId: "combat-base-student-1",
      kind: "TRAINED_WITH",
      label: "cross-training",
      verified: true,
    },
  ],
}


File 3 — to-balkan-orgchart.ts
This is the most important file. It keeps your Ronin lineage truth separate from the Balkan rendering shape.

// apps/web/components/web/lineage/balkan/to-balkan-orgchart.ts

import type {
  BalkanLink,
  BalkanNode,
  BalkanProjection,
  LineageBalkanGraph,
  LineageSecondaryLink,
  LineageVisualNode,
} from "./balkan-lineage-types"

const roleToTags = (node: LineageVisualNode): string[] => {
  const tags: string[] = []

  if (node.role === "ROOT") tags.push("lineage-root")
  if (node.role === "INSTRUCTOR") tags.push("lineage-instructor")
  if (node.role === "STUDENT") tags.push("lineage-student")
  if (node.role === "ASSISTANT") tags.push("assistant", "lineage-assistant")
  if (node.role === "PARTNER") tags.push("partner", "lineage-partner")

  if (node.role === "GROUP") {
    tags.push("node-with-subtrees", "lineage-group")
  }

  if (node.trustStatus === "VERIFIED") tags.push("verified")
  if (node.trustStatus === "PENDING") tags.push("pending")
  if (node.trustStatus === "DISPUTED") tags.push("disputed")
  if (node.trustStatus === "IMPORTED") tags.push("imported")

  return tags
}

const toTitle = (node: LineageVisualNode) => {
  if (node.role === "GROUP") {
    return node.showPublicLabel
      ? (node.groupLabel ?? node.displayName)
      : "Student Group"
  }

  return [node.rankLabel, node.organizationName].filter(Boolean).join(" · ")
}

const toBalkanNode = (node: LineageVisualNode): BalkanNode => ({
  id: node.id,

  /**
   * Primary readable tree line.
   */
  pid: node.primaryParentId,

  /**
   * Partner/co-promoter lane.
   */
  ppid: node.partnerParentId,

  /**
   * Grouped subtree lane.
   */
  stpid: node.subtreeParentId,

  tags: roleToTags(node),

  name: node.displayName,
  initials: node.initials,
  title: toTitle(node),
  rankLabel: node.rankLabel,
  rankColorHex: node.rankColorHex,
  organizationName: node.organizationName,
  disciplineLabel: node.disciplineLabel,
  avatarUrl: node.avatarUrl ?? undefined,
  trustStatus: node.trustStatus,
  groupLabel: node.groupLabel,
  promotionDateLabel: node.promotionDateLabel,
  sortOrder: node.sortOrder,
})

const toBalkanSecondaryLink = (link: LineageSecondaryLink): BalkanLink => ({
  from: link.fromId,
  to: link.toId,
  label: link.label ?? link.kind.replaceAll("_", " ").toLowerCase(),
  template: link.verified ? "secondaryVerified" : "secondaryPending",
})

export const toBalkanProjection = (graph: LineageBalkanGraph): BalkanProjection => {
  const nodes = graph.nodes
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(toBalkanNode)

  return {
    nodes,
    roots: graph.rootIds,
    slinks: graph.secondaryLinks
      .filter(link => link.kind !== "CO_PROMOTER")
      .map(toBalkanSecondaryLink),
    clinks: graph.secondaryLinks
      .filter(link => link.kind === "CO_PROMOTER")
      .map(toBalkanSecondaryLink),
  }
}


File 4 — balkan-lineage-org-chart.tsx
This is a Next-safe client component. It dynamically imports Balkan only in the browser.

// apps/web/components/web/lineage/balkan/balkan-lineage-org-chart.tsx

"use client"

import type { ComponentType } from "react"
import { useEffect, useMemo, useRef } from "react"
import type { BalkanNode, LineageBalkanGraph } from "./balkan-lineage-types"
import { toBalkanProjection } from "./to-balkan-orgchart"

type OrgChartLike = {
  load: (nodes: BalkanNode[]) => void
  on?: (eventName: string, callback: (...args: unknown[]) => void) => void
  destroy?: () => void
  fit?: () => void
  center?: (nodeId: string) => void
}

type BalkanLineageOrgChartProps = {
  graph: LineageBalkanGraph
  className?: string
  onSelectNode?: (nodeId: string) => void
}

/**
 * Keep Balkan types loose in this spike.
 * If this becomes production, add a tiny local wrapper type for only the API we use.
 */
type OrgChartConstructor = new (
  element: HTMLElement,
  options: Record<string, unknown>,
) => OrgChartLike

export function BalkanLineageOrgChart({
  graph,
  className,
  onSelectNode,
}: BalkanLineageOrgChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<OrgChartLike | null>(null)

  const projection = useMemo(() => toBalkanProjection(graph), [graph])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!containerRef.current) return

      const module = await import("balkan-orgchart-js-community")
      if (!mounted || !containerRef.current) return

      const OrgChart = module.default as OrgChartConstructor & Record<string, any>

      defineBblTemplates(OrgChart)

      chartRef.current?.destroy?.()

      const chart = new OrgChart(containerRef.current, {
        nodes: projection.nodes,
        roots: projection.roots,

        template: "bblLineage",
        mode: "dark",

        /**
         * Useful immediately for large BBL lineages.
         */
        enableSearch: true,
        searchDisplayField: "name",
        searchFields: ["name", "rankLabel", "organizationName", "disciplineLabel"],

        /**
         * Balkan visual controls.
         */
        mouseScroll: OrgChart.action?.ctrlZoom,
        scaleInitial: OrgChart.match?.boundaryIfOutside,
        scaleMin: 0.2,
        scaleMax: 3,

        showXScroll: true,
        showYScroll: true,
        miniMap: true,

        siblingSeparation: 34,
        subtreeSeparation: 54,
        assistantSeparation: 120,
        partnerNodeSeparation: 34,
        partnerChildrenSplitSeparation: 50,
        levelSeparation: 110,

        nodeBinding: {
          field_0: "name",
          field_1: "title",
          field_2: "trustStatus",
          img_0: "avatarUrl",
        },

        /**
         * Secondary/cross-training overlays.
         */
        slinks: projection.slinks,
        clinks: projection.clinks,

        tags: {
          "lineage-root": {
            template: "bblRoot",
          },
          "lineage-instructor": {
            template: "bblLineage",
          },
          "lineage-student": {
            template: "bblStudent",
          },
          "lineage-assistant": {
            template: "bblAssistant",
          },
          assistant: {
            template: "bblAssistant",
          },
          partner: {
            template: "bblPartner",
          },
          "lineage-partner": {
            template: "bblPartner",
          },
          "lineage-group": {
            template: "bblGroup",
          },
          "node-with-subtrees": {
            template: "bblGroup",
            subTreeConfig: {
              orientation: OrgChart.orientation?.left,
              layout: OrgChart.mixed,
              columns: 2,
              levelSeparation: 84,
              siblingSeparation: 18,
              subtreeSeparation: 38,
              collapse: {
                level: 2,
              },
            },
          },
          verified: {
            template: "bblLineage",
          },
          pending: {
            template: "bblPending",
          },
          disputed: {
            template: "bblDisputed",
          },
        },

        toolbar: {
          fit: true,
          zoom: true,
          layout: true,
          expandAll: false,
          fullScreen: true,
        },

        nodeMenu: {
          details: { text: "View profile" },
          focus: {
            text: "Center here",
            onClick: (nodeId: string) => {
              chart.center?.(nodeId)
            },
          },
        },
      })

      chart.on?.("click", (_sender: unknown, args: any) => {
        const nodeId = String(args?.node?.id ?? "")
        if (nodeId) onSelectNode?.(nodeId)
        return false
      })

      chartRef.current = chart
      chart.load(projection.nodes)

      window.setTimeout(() => chart.fit?.(), 60)
    }

    init()

    return () => {
      mounted = false
      chartRef.current?.destroy?.()
      chartRef.current = null
    }
  }, [projection, onSelectNode])

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="h-[78vh] min-h-[720px] w-full overflow-hidden rounded-2xl border border-border bg-background"
      />
    </div>
  )
}

function defineBblTemplates(OrgChart: Record<string, any>) {
  const base = OrgChart.templates?.ana ?? OrgChart.templates?.base
  if (!base || OrgChart.templates?.bblLineage) return

  OrgChart.templates.bblLineage = {
    ...base,
    size: [250, 126],
    node: `
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="#070707" stroke="#2f2f2f" stroke-width="1"></rect>
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="none" stroke="#dc2626" stroke-opacity="0.35" stroke-width="1"></rect>
      <rect x="0" y="0" width="250" height="8" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
    img_0: `
      <clipPath id="{randId}">
        <circle cx="38" cy="46" r="24"></circle>
      </clipPath>
      <image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})"
        x="14" y="22" width="48" height="48" href="{val}"></image>
      <circle cx="38" cy="46" r="25" fill="none" stroke="#ffffff" stroke-opacity="0.24"></circle>
    `,
    field_0: `
      <text data-width="160" style="font-size: 18px; font-weight: 700;"
        fill="#ffffff" x="76" y="40" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="160" style="font-size: 12px;"
        fill="#b8b8b8" x="76" y="62" text-anchor="start">{val}</text>
    `,
    field_2: `
      <text data-width="210" style="font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;"
        fill="#f4c96b" x="20" y="104" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblRoot = {
    ...OrgChart.templates.bblLineage,
    size: [285, 140],
    node: `
      <rect x="0" y="0" width="285" height="140" rx="22" ry="22"
        fill="#070707" stroke="#f4c96b" stroke-opacity="0.62" stroke-width="1.5"></rect>
      <rect x="0" y="0" width="285" height="10" rx="5" ry="5"
        fill="{val:rankColorHex}"></rect>
    `,
    field_0: `
      <text data-width="185" style="font-size: 21px; font-weight: 800;"
        fill="#ffffff" x="82" y="44" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="185" style="font-size: 12px;"
        fill="#e7cf8a" x="82" y="68" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblStudent = {
    ...OrgChart.templates.bblLineage,
    size: [220, 112],
    node: `
      <rect x="0" y="0" width="220" height="112" rx="16" ry="16"
        fill="#0b0b0b" stroke="#2f2f2f" stroke-width="1"></rect>
      <rect x="0" y="0" width="220" height="7" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
    field_0: `
      <text data-width="138" style="font-size: 16px; font-weight: 700;"
        fill="#ffffff" x="72" y="38" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="138" style="font-size: 11px;"
        fill="#b8b8b8" x="72" y="58" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblAssistant = {
    ...OrgChart.templates.bblLineage,
    size: [220, 104],
    node: `
      <rect x="0" y="0" width="220" height="104" rx="16" ry="16"
        fill="#111111" stroke="#f4c96b" stroke-opacity="0.38" stroke-dasharray="4 4" stroke-width="1.25"></rect>
      <rect x="14" y="12" width="72" height="20" rx="10" fill="#f4c96b" fill-opacity="0.14"></rect>
      <text x="50" y="26" text-anchor="middle" fill="#f4c96b" style="font-size: 9px; font-weight: 700;">ASSIST</text>
    `,
    field_0: `
      <text data-width="130" style="font-size: 15px; font-weight: 700;"
        fill="#ffffff" x="74" y="52" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="130" style="font-size: 11px;"
        fill="#b8b8b8" x="74" y="72" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblPartner = {
    ...OrgChart.templates.bblLineage,
    size: [230, 112],
    node: `
      <rect x="0" y="0" width="230" height="112" rx="18" ry="18"
        fill="#090909" stroke="#7dd3fc" stroke-opacity="0.45" stroke-width="1.25"></rect>
      <rect x="14" y="12" width="86" height="20" rx="10" fill="#7dd3fc" fill-opacity="0.14"></rect>
      <text x="57" y="26" text-anchor="middle" fill="#7dd3fc" style="font-size: 9px; font-weight: 700;">CO-LINE</text>
    `,
    field_0: `
      <text data-width="140" style="font-size: 15px; font-weight: 700;"
        fill="#ffffff" x="74" y="52" text-anchor="start">{val}</text>
    `,
    field_1: `
      <text data-width="140" style="font-size: 11px;"
        fill="#b8b8b8" x="74" y="72" text-anchor="start">{val}</text>
    `,
  }

  OrgChart.templates.bblGroup = {
    ...OrgChart.templates.bblLineage,
    size: [260, 72],
    node: `
      <rect x="0" y="0" width="260" height="72" rx="18" ry="18"
        fill="#160707" stroke="#dc2626" stroke-opacity="0.5" stroke-width="1.25"></rect>
      <rect x="14" y="14" width="92" height="20" rx="10" fill="#dc2626" fill-opacity="0.16"></rect>
      <text x="60" y="28" text-anchor="middle" fill="#ffb4b4" style="font-size: 9px; font-weight: 700;">GROUP</text>
    `,
    img_0: "",
    field_0: `
      <text data-width="220" style="font-size: 16px; font-weight: 800;"
        fill="#ffffff" x="20" y="52" text-anchor="start">{val}</text>
    `,
    field_1: "",
    field_2: "",
  }

  OrgChart.templates.bblPending = {
    ...OrgChart.templates.bblLineage,
    node: `
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="#090909" stroke="#eab308" stroke-opacity="0.45" stroke-dasharray="5 5" stroke-width="1.25"></rect>
      <rect x="0" y="0" width="250" height="8" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
  }

  OrgChart.templates.bblDisputed = {
    ...OrgChart.templates.bblLineage,
    node: `
      <rect x="0" y="0" width="250" height="126" rx="18" ry="18"
        fill="#090909" stroke="#ef4444" stroke-opacity="0.7" stroke-dasharray="7 4" stroke-width="1.5"></rect>
      <rect x="0" y="0" width="250" height="8" rx="4" ry="4"
        fill="{val:rankColorHex}"></rect>
    `,
  }

  OrgChart.templates.secondaryVerified = {
    ...OrgChart.templates.ana?.link,
    stroke: "#f4c96b",
  }

  OrgChart.templates.secondaryPending = {
    ...OrgChart.templates.ana?.link,
    stroke: "#eab308",
  }
}


File 5 — page.tsx

// apps/web/app/(web)/lineage/balkan-demo/page.tsx

import dynamic from "next/dynamic"
import { balkanLineageDemoGraph } from "~/components/web/lineage/balkan/balkan-lineage-demo-data"

const BalkanLineageOrgChart = dynamic(
  () =>
    import("~/components/web/lineage/balkan/balkan-lineage-org-chart").then(
      mod => mod.BalkanLineageOrgChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[78vh] min-h-[720px] items-center justify-center rounded-2xl border border-border bg-background">
        <p className="text-sm text-muted-fg">Loading lineage chart…</p>
      </div>
    ),
  },
)

export default function BalkanLineageDemoPage() {
  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-6">
      <div className="mb-5 max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Black Belt Legacy · Balkan visual parity spike
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Lineage Tree: grouped students, assistants, partners, and overlays
        </h1>
        <p className="mt-3 text-muted-fg">
          This page is a renderer spike only. It proves Balkan-style visual behavior
          without changing canonical lineage data or editor semantics.
        </p>
      </div>

      <BalkanLineageOrgChart
        graph={balkanLineageDemoGraph}
        onSelectNode={nodeId => {
          console.log("selected lineage node", nodeId)
        }}
      />
    </main>
  )
}


Optional type shim
Only add this if TypeScript complains about the package import:

// apps/web/types/balkan-orgchart-js-community.d.ts

declare module "balkan-orgchart-js-community" {
  const OrgChart: unknown
  export default OrgChart
}

If you use the commercial package instead:

// apps/web/types/balkan-orgchart-js.d.ts

declare module "balkan-orgchart-js" {
  const OrgChart: unknown
  export default OrgChart
}


How this should look conceptually

                       Rigan Machado
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
   Bob Bass            Chris Haueter        Erik Paulson
        │                   │                    │
        │              [Combat Base]             │
        │                   │                    │
 [Black Belt Students]      └─ Combat Base Student
        │
   ┌────┴────┐
 Student 1  Student 2

Assistant:
  Lineage Steward sits near Rigan as assistant/steward.

Partner:
  Co-Promoter sits beside Rigan as partner/co-lineage node.

Secondary overlays:
  Lineage Steward -> Student 2
  Erik Paulson -> Combat Base Student

That is exactly the kind of visual language you were asking for: one clean primary tree, grouped subtrees under instructors, and extra relationship truth as secondary overlays instead of corrupting the main parent chain.

Data wiring later
When you wire this to real data, keep this flow:

Prisma lineage models
  ↓
server-side public lineage payload
  ↓
Ronin lineage visual DTO
  ↓
toBalkanProjection()
  ↓
Balkan renderer

Do not let the Balkan component consume Prisma rows directly.
Ronin’s current SoT is explicit that public payloads and brand-scope/audit/rate-limit guarantees matter, and oRPC must preserve brand scope before later surfaces migrate. SESSION_0361 is also already defined as the oRPC scaffold + brand-aware context session, with no entity routers yet. So this Balkan page should stay mock/local until either the existing lineage read payload or the oRPC read pilot is ready.

What to verify
Run:

cd /Users/brianscott/dev/ronin-dojo-app

bun run --filter @ronin-dojo/web typecheck
bun run --filter @ronin-dojo/web lint:check
bun run --filter @ronin-dojo/web format:check
bun test
bun run wiki:lint

Then:

cd apps/web
bun run dev

Open:

http://bbl.local:3000/lineage/balkan-demo

Check:

[ ] Rigan/root card is visually dominant.
[ ] Assistant card appears beside/under root as assistant, not as child lineage.
[ ] Partner/co-promoter card appears as partner/co-lineage, not ordinary student.
[ ] Bob Bass has a grouped student subtree.
[ ] Chris Haueter has a grouped branch subtree.
[ ] Secondary overlay links render without changing the primary tree.
[ ] Search works for names/ranks/orgs.
[ ] Scrollbars/minimap/fit are usable.
[ ] No server-render crash.
[ ] No global lineage route was replaced.


My read on whether this is smart
Yes — as a visual parity spike.
No — as the canonical lineage engine yet.
Balkan is excellent for proving the visual behaviors you want: assistants, partners, subtrees, minimap, toolbar, search, and secondary links. The docs show those capabilities are first-class: assistant tags, partner tags/ppid, subtree stpid, subTreeConfig, scrollbars, minimap, and toolbar.
But the product truth still has to remain Ronin’s:

Passport/person identity
RankAward / promotion facts
LineageNode / LineageTreeMember
primary visual parent
secondary relationship overlays
trust status
claim/review/audit
brand-scoped public payloads

That matters because BBL’s active mission is not just “draw a pretty tree.” It is a verified martial-arts legacy platform with claim/review, identity, lineage, rank history, and trust workflows.
So build this spike. Use it to learn which Balkan behaviors deserve to survive. Then later either:

A. keep Balkan as the public whole-tree renderer,
B. port the useful behavior back into your owned D3/donatso path,
C. or run Balkan overview + donatso focal explorer as complementary views.

For this week, the goal is simpler:
Prove the visual language for grouped instructor subtrees without touching canonical lineage truth.
