import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { BBL, rgba } from "~/lib/lineage/belt-color"
import { memberInitials } from "~/lib/lineage/canvas-model"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

/**
 * The cinematic timeline's avatar: the ONE shared `Avatar` primitive (SSR image +
 * initials fallback, SESSION_0475) wrapped in a belt-colored ring + glow. The belt color
 * is `node.colorHex` DATA (ADR 0022); `BBL.slate` is the sanctioned neutral fallback when a
 * member has no belt color. The ring gradient + glow are computed from the hex in JS (an
 * rgba interpolation a static CSS class can't express) — the established lineage idiom, not
 * a hardcoded belt palette. The image/initials rendering itself is no longer bespoke here:
 * it shares the design-system `Avatar` so every surface renders the avatar identically.
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
      <Avatar className="size-full rounded-full bg-[#0a0a0a] font-extrabold text-white">
        {node.avatar && <AvatarImage src={node.avatar} alt={node.displayName} />}
        <AvatarFallback style={{ fontSize: Math.round(size / 3.2) }}>
          {memberInitials(node.displayName)}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
