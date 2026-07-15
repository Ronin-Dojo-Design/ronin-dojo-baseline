"use client"

import { ShieldOffIcon } from "lucide-react"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { relativeLuminance } from "~/lib/lineage/belt-color"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { CardAvatar } from "./card-avatar"
import { promotionYear } from "./promotion-format"

/**
 * Compact leaf row — a child with no students of their own. Click → drawer.
 * Belt color is the data-driven `BeltSwatch` (`colorHex`); never a hardcoded belt.
 */
export function LeafRow({
  node,
  dimmed,
  onOpenProfile,
}: {
  node: LineageVisualNode
  dimmed: boolean
  onOpenProfile: (memberId: string) => void
}) {
  return (
    <button
      type="button"
      id={`lineage-member-${node.id}`}
      onClick={() => onOpenProfile(node.id)}
      data-dimmed={dimmed || undefined}
      className="flex w-full flex-col gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-white/10 hover:bg-white/[0.05] data-[dimmed]:opacity-30"
    >
      {/* Name row — name (and meta) on their own line so the belt below never crowds it. */}
      <span className="flex w-full items-center gap-2">
        <CardAvatar node={node} size={28} bright={relativeLuminance(node.colorHex) > 0.6} />
        <span className="min-w-0 flex-1 truncate text-[0.8rem] font-medium text-white/85">
          {node.displayName}
        </span>
        {promotionYear(node.promotionDate) && (
          <span className="shrink-0 text-[0.6rem] font-semibold tabular-nums text-white/35">
            {promotionYear(node.promotionDate)}
          </span>
        )}
        {node.trustStatus === "unverified" && (
          <ShieldOffIcon aria-label="Unverified" className="size-3 shrink-0 text-white/40" />
        )}
      </span>
      {/* Full-width belt below — degrees stay countable at the roster width. */}
      <BeltSwatch variant="belt" size="full" {...node.belt} />
    </button>
  )
}
