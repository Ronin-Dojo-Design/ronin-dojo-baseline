import { ShieldCheckIcon, UserRoundIcon } from "lucide-react"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { rgba } from "~/lib/lineage/belt-color"
import { memberInitials } from "~/lib/lineage/canvas-model"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { PremiumPanel } from "./chrome"

/**
 * The desktop-only "Current focus" side panel (`xl:flex`): the centered
 * practitioner's avatar / name / belt / school / trust badge, plus a "View
 * profile" action. Hidden below `xl` — the mobile flow uses the card menu.
 */
export function FocusPanel({
  focusNode,
  focusTrustLabel,
  focusMemberId,
  onViewProfile,
}: {
  focusNode: LineageVisualNode | null
  focusTrustLabel: string | null
  focusMemberId: string | null
  onViewProfile: (memberId: string) => void
}) {
  return (
    <PremiumPanel className="hidden flex-col justify-between gap-4 xl:flex">
      <div>
        <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/42">
          Current focus
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-black text-white shadow-lg"
            style={{
              boxShadow: focusNode?.colorHex
                ? `0 0 22px ${rgba(focusNode.colorHex, 0.24)}`
                : undefined,
            }}
          >
            {memberInitials(focusNode?.displayName ?? "Lineage")}
          </div>

          <div className="min-w-0">
            <div className="truncate text-lg italic text-white [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
              {focusNode?.displayName ?? "Select a practitioner"}
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <BeltSwatch variant="bar" shimmer colorHex={focusNode?.colorHex} />
              <span className="min-w-0 truncate text-xs text-white/55">
                {focusNode?.rankLabel ?? "Unranked"}
              </span>
            </div>

            {focusNode?.schoolLabel && (
              <div className="mt-1 truncate text-xs text-white/42">{focusNode.schoolLabel}</div>
            )}

            {focusTrustLabel && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-[#101011] px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/62">
                <ShieldCheckIcon className="size-3" />
                {focusTrustLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!focusMemberId}
        onClick={() => {
          if (focusMemberId) onViewProfile(focusMemberId)
        }}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 text-xs font-bold text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <UserRoundIcon className="size-4" />
        View profile
      </button>
    </PremiumPanel>
  )
}
