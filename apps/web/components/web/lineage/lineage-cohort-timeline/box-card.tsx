"use client"

import { useCallback, type CSSProperties } from "react"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { BBL, relativeLuminance, rgba } from "~/lib/lineage/belt-color"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { CardAvatar } from "./card-avatar"
import { LeafRow } from "./leaf-row"
import { formatPromotionDate } from "./promotion-format"

/**
 * The cinematic list-box card: belt-colored header (avatar / BBL-Poppins name /
 * belt-graphic) + inline leaf-child list. Belt color is `node.colorHex` DATA — the
 * `BeltSwatch` bar + the computed gradient/glow/border (ADR 0022, never a hardcoded
 * belt hex); the heading inherits `--font-bbl-heading` (the explorer's non-portaled
 * BBL font wrapper).
 */
export function LineageBoxCard({
  node,
  promoterName,
  leafChildren,
  branchCount,
  isFocal,
  dimmed,
  onFocus,
  onOpenMenu,
  onOpenProfile,
}: {
  node: LineageVisualNode
  /** Who promoted this member (their visual parent) — the provenance claim. */
  promoterName: string | null
  leafChildren: LineageVisualNode[]
  branchCount: number
  isFocal: boolean
  dimmed: boolean
  onFocus: (memberId: string) => void
  onOpenMenu: (memberId: string, anchorEl: HTMLElement) => void
  onOpenProfile: (memberId: string) => void
}) {
  const colorHex = node.colorHex ?? BBL.slate
  const bright = relativeLuminance(colorHex) > 0.6
  const glow = rgba(colorHex, isFocal ? (bright ? 0.26 : 0.42) : bright ? 0.12 : 0.2)
  const cardBorder = isFocal ? rgba(colorHex, 0.7) : "rgba(255,255,255,0.1)"
  const promotionLabel = formatPromotionDate(node.promotionDate)

  const handleMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onOpenMenu(node.id, event.currentTarget)
    },
    [node.id, onOpenMenu],
  )

  return (
    <div
      id={`lineage-member-${node.id}`}
      data-bbl-card
      data-dimmed={dimmed || undefined}
      {...(isFocal ? { "data-bbl-focal": "" } : { "data-bbl-recede": "" })}
      className="relative w-[min(18rem,calc(100vw_-_4.5rem))] overflow-hidden rounded-3xl text-white transition data-[dimmed]:opacity-30 sm:w-72"
      style={
        {
          background: `radial-gradient(circle at 16% 8%, ${rgba(colorHex, 0.16)} 0, transparent 36%),linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012) 42%, #060606)`,
          boxShadow: isFocal
            ? `0 0 0 1px ${cardBorder}, 0 22px 60px -24px ${glow}`
            : `0 0 0 1px ${cardBorder}, 0 14px 34px -20px rgba(0,0,0,0.7)`,
        } as CSSProperties
      }
    >
      {/* Header — click recenters this node (the focal-zoom feel). */}
      <button
        type="button"
        onClick={() => onFocus(node.id)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <CardAvatar node={node} size={isFocal ? 56 : 48} bright={bright} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[0.95rem] font-extrabold italic leading-tight text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
            {node.displayName}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <BeltSwatch variant="belt" size="lg" {...node.belt} />
            {node.schoolLabel && (
              <span className="min-w-0 truncate text-[0.7rem] font-medium text-white/50">
                {node.schoolLabel}
              </span>
            )}
          </div>
          {/* Promotion provenance — the lineage USP: by whom, and when. */}
          {(promoterName || promotionLabel) && (
            <div className="mt-1 truncate text-[0.65rem] text-white/40">
              {promoterName ? `Promoted by ${promoterName}` : "Promoted"}
              {promotionLabel ? ` · ${promotionLabel}` : ""}
            </div>
          )}
        </div>
      </button>

      {/* ⋮ actions — never recenters (own click handler, stopPropagation). */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-label="Actions"
        onClick={handleMenu}
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
      >
        <span className="text-base leading-none">⋮</span>
      </button>

      {node.trustStatus === "unverified" && (
        <span className="absolute right-12 top-4 rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-white/70">
          Unverified
        </span>
      )}

      {/* Inline leaf-child list — students with no students of their own. */}
      {leafChildren.length > 0 && (
        <div className="border-t border-white/5 px-2 pb-2 pt-1.5">
          <div className="px-2 pb-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/35">
            Students · {leafChildren.length}
          </div>
          <div className="flex flex-col gap-0.5">
            {leafChildren.map(child => (
              <LeafRow key={child.id} node={child} dimmed={false} onOpenProfile={onOpenProfile} />
            ))}
          </div>
        </div>
      )}

      {branchCount > 0 && (
        <div className="px-4 pb-3 text-[0.6rem] font-semibold text-white/35">
          {branchCount} instructor {branchCount === 1 ? "branch" : "branches"} below
        </div>
      )}
    </div>
  )
}
