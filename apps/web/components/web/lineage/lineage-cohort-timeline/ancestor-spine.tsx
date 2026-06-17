"use client"

import { BeltSwatch } from "~/components/common/belt-swatch"
import { relativeLuminance } from "~/lib/lineage/belt-color"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { cx } from "~/lib/utils"
import { CardAvatar } from "./card-avatar"
import type { LineageTimelineHandlers } from "./cohort-timeline-types"
import { promotionYear } from "./promotion-format"

// Editorial canvas chrome — NOT brand identity (see belt-color.ts). Solid
// "legacy/authoritative" surface (no glassmorphism / backdrop-blur); scoped to the
// spine, its only consumer in this module.
const SOLID_PANEL =
  "border border-white/8 bg-[#0c0c0d] shadow-[0_20px_60px_-26px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.045)]"

/**
 * Ancestor spine above the focal node (single column up to the root). Off the
 * default first paint — the root focal has no ancestors — and unmounts (returns
 * null) when the focal has none. Belt color is the data-driven `BeltSwatch`; the
 * name inherits `--font-bbl-heading`.
 */
export function AncestorSpine({
  ancestors,
  matchedMemberIds,
  handlers,
}: {
  ancestors: LineageVisualNode[]
  matchedMemberIds: Set<string> | null
  handlers: LineageTimelineHandlers
}) {
  if (ancestors.length === 0) return null
  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      {ancestors.map(ancestor => {
        const dimmed = matchedMemberIds !== null && !matchedMemberIds.has(ancestor.id)
        return (
          <div key={ancestor.id} className="flex flex-col items-center gap-3">
            <button
              type="button"
              id={`lineage-member-${ancestor.id}`}
              onClick={() => handlers.onFocus(ancestor.id)}
              data-dimmed={dimmed || undefined}
              className={cx(
                "flex items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-white transition hover:bg-white/[0.04] data-[dimmed]:opacity-30",
                SOLID_PANEL,
              )}
            >
              <CardAvatar
                node={ancestor}
                size={36}
                bright={relativeLuminance(ancestor.colorHex) > 0.6}
              />
              <span className="max-w-44 truncate text-sm font-bold italic text-white/90 [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
                {ancestor.displayName}
              </span>
              <BeltSwatch variant="bar" colorHex={ancestor.colorHex} />
              {promotionYear(ancestor.promotionDate) && (
                <span className="shrink-0 text-[0.6rem] font-semibold tabular-nums text-white/35">
                  {promotionYear(ancestor.promotionDate)}
                </span>
              )}
            </button>
            <span aria-hidden className="h-6 w-px bg-border" />
          </div>
        )
      })}
    </div>
  )
}
