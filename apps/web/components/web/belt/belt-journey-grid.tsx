"use client"

import { useMemo, useState } from "react"
import type { CreatableOption } from "~/components/common/creatable-combobox"
import { Dialog, DialogContent } from "~/components/common/dialog"
import { TooltipProvider } from "~/components/common/tooltip"
import type { BeltCardOutput } from "~/server/belt/schemas"
import { BeltEditCard } from "./belt-edit-card"
import { BeltEditForm } from "./belt-edit-form"
import type { BeltMediaItem, BeltRankViewModel } from "./belt-view-model"

/**
 * `BeltJourneyGrid` — the member's belt-by-belt journey (Slice 4 — Petey Plan 0477
 * §Slice 4). Renders one {@link BeltEditCard} per discipline rank in ascending
 * `sortOrder` (responsive 1 → 2 → 3 columns). A card is `locked` when its
 * `sortOrder` exceeds the member's awarded `ceiling`; clicking an UNLOCKED card
 * opens the edit surface in a `Dialog`.
 *
 * Presentation-only container: Slice 5 loads the ranks + cards + ceiling on the
 * server (`memberTopRank`, BJJ-scoped) and hands them down. Local state only
 * mirrors the freshly-returned `BeltCardOutput` after a save so the grid updates
 * without a full reload — no data is fetched here.
 */
export function BeltJourneyGrid({
  ranks,
  ceiling,
  promoterOptions,
  schoolOptions,
  onUpload,
}: {
  /** One view-model per discipline rank (any order — sorted here by `sortOrder`). */
  ranks: BeltRankViewModel[]
  /** The member's awarded ceiling `sortOrder`; `null` = no discipline award. */
  ceiling: number | null
  promoterOptions: CreatableOption[]
  schoolOptions: CreatableOption[]
  /** Per-file R2 upload against the `rankMilestone` target (mints a mediaId); omit → read-only galleries. */
  onUpload?: (file: File, rankMilestoneId: string) => Promise<{ mediaId: string } | null>
}) {
  const sorted = useMemo(
    () => [...ranks].sort((a, b) => a.rank.sortOrder - b.rank.sortOrder),
    [ranks],
  )
  const minSortOrder = sorted[0]?.rank.sortOrder ?? 0

  // Local overlay of saved cards so a mutation refreshes the affected belt in place.
  const [saved, setSaved] = useState<
    Record<string, { card: BeltCardOutput; media: BeltMediaItem[] }>
  >({})
  const [openRankId, setOpenRankId] = useState<string | null>(null)

  const resolved = useMemo(
    () =>
      sorted.map(vm => {
        const override = saved[vm.rank.id]
        return override ? { ...vm, card: override.card, media: override.media } : vm
      }),
    [sorted, saved],
  )

  const openVm = openRankId ? (resolved.find(vm => vm.rank.id === openRankId) ?? null) : null

  const handleSaved = (rankId: string, card: BeltCardOutput) => {
    setSaved(current => ({
      ...current,
      [rankId]: {
        card,
        // Re-derive resolved media from the fresh card ids, keeping any URLs we
        // already know (the card output carries ids only). Unknown ids drop out
        // until Slice 5's next server load resolves their URLs.
        media: (card.milestone?.media ?? []).flatMap(m => {
          const existing = (saved[rankId]?.media ?? openVm?.media ?? []).find(
            x => x.mediaId === m.mediaId,
          )
          return existing ? [{ ...existing, purpose: m.purpose }] : []
        }),
      },
    }))
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resolved.map(vm => (
          <BeltEditCard key={vm.rank.id} vm={vm} ceiling={ceiling} onOpen={setOpenRankId} />
        ))}
      </div>

      <Dialog open={openRankId !== null} onOpenChange={open => !open && setOpenRankId(null)}>
        <DialogContent className="max-w-xl">
          {openVm && (
            <BeltEditForm
              key={openVm.rank.id}
              vm={openVm}
              minSortOrder={minSortOrder}
              promoterOptions={promoterOptions}
              schoolOptions={schoolOptions}
              onUpload={onUpload}
              onSaved={card => handleSaved(openVm.rank.id, card)}
              onClose={() => setOpenRankId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
