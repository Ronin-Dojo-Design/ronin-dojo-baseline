"use client"

import { useState } from "react"

import { LineageProfileDrawer } from "~/components/web/lineage/lineage-profile-drawer"
import { bblPortalTypographyClass } from "~/lib/fonts"
import type { BblGalaxyData } from "~/server/web/lineage/galaxy-data"
import { BblLineageGalaxy } from "./BblLineageGalaxy"
import { bblGalaxyMockGraph } from "./bbl-galaxy-mock-data"
import type { BblGalaxyNode } from "./bbl-galaxy-types"

export function BblLineageGalaxyDemo({ data }: { data?: BblGalaxyData | null }) {
  // Real public data when a published tree exists; mock graph otherwise (no-DB dev path).
  const graph = data?.graph ?? bblGalaxyMockGraph
  const profilesById = data?.profilesById ?? null

  const [selectedNode, setSelectedNode] = useState<BblGalaxyNode | null>(null)

  // Node ids ARE lineage nodeIds in the public projection, so the drawer profile is a
  // direct lookup — no extra fetch on select (profiles are eager-loaded server-side).
  const selectedProfile =
    selectedNode && profilesById ? (profilesById[selectedNode.id] ?? null) : null

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-200/70">Black Belt Legacy</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            The Living Galaxy of Martial Arts Lineage
          </h1>
          <p className="mt-4 text-base leading-7 text-white/65">
            Explore verified public lineage through a cinematic constellation of legends,
            instructors, and students.
          </p>
        </div>

        <BblLineageGalaxy graph={graph} onSelectNode={node => setSelectedNode(node)} />

        {profilesById ? (
          <LineageProfileDrawer
            open={selectedNode !== null}
            onOpenChange={open => {
              if (!open) setSelectedNode(null)
            }}
            profile={selectedProfile}
            nodeId={selectedNode?.id ?? null}
            treeSlug={data?.treeSlug}
            contentClassName={bblPortalTypographyClass}
          />
        ) : (
          <MockLineageDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </div>
  )
}

/**
 * No-data dev fallback only. When a published public tree exists the route uses the real
 * LineageProfileDrawer above; this lightweight panel keeps the prototype explorable when
 * there's no DB / no published tree.
 */
function MockLineageDrawer({ node, onClose }: { node: BblGalaxyNode | null; onClose: () => void }) {
  if (!node) return null

  return (
    <aside className="fixed right-4 top-4 z-50 w-90 rounded-3xl border border-white/10 bg-zinc-950/95 p-5 text-white shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-200/70">Lineage Profile</p>
          <h2 className="mt-2 text-2xl font-semibold">{node.displayName}</h2>
          <p className="mt-1 text-sm text-white/60">{node.rankLabel}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-yellow-200/30 bg-white/10 text-lg font-semibold">
          {node.photoUrl ? (
            <img src={node.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            node.initials
          )}
        </div>

        <div>
          <p className="text-sm text-white/70">{node.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{node.groupLabel}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm leading-6 text-white/68">
          This panel is the no-data dev fallback. With a published tree the route opens the
          real lineage profile drawer.
        </p>
      </div>
    </aside>
  )
}
