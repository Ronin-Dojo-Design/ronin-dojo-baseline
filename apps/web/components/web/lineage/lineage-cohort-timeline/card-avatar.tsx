"use client"

import { BBL, rgba } from "~/lib/lineage/belt-color"
import { memberInitials } from "~/lib/lineage/canvas-model"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

/**
 * Avatar (image or initials ring), belt-colored. The belt color is `node.colorHex`
 * DATA (ADR 0022); `BBL.slate` is the sanctioned neutral fallback when a member has
 * no belt color. The ring gradient + glow are computed from the hex in JS (an rgba
 * interpolation a static CSS class can't express) — the established lineage idiom,
 * not a hardcoded belt palette.
 */
export function CardAvatar({
  node,
  size,
  bright,
}: {
  node: LineageVisualNode
  size: number
  bright: boolean
}) {
  const colorHex = node.colorHex ?? BBL.slate
  const inner = size - 4
  return (
    <div
      className="shrink-0 rounded-full p-0.5"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colorHex}, rgba(255,255,255,0.22))`,
        boxShadow: `0 0 18px ${rgba(colorHex, bright ? 0.18 : 0.26)}`,
      }}
    >
      <div
        className="flex items-center justify-center overflow-hidden rounded-full bg-[#0a0a0a] font-extrabold text-white"
        style={{
          width: inner,
          height: inner,
          fontSize: Math.round(size / 3.2),
        }}
      >
        {node.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- public avatar URL, no Next loader on the cinematic canvas
          <img
            src={node.avatar}
            alt={node.displayName}
            className="size-full object-cover"
            style={{ borderRadius: 999 }}
          />
        ) : (
          memberInitials(node.displayName)
        )}
      </div>
    </div>
  )
}
