"use client"

import { useCallback } from "react"
import type { CreatableOption } from "~/components/common/creatable-combobox"
import { uploadWebMedia } from "~/server/web/media/actions"
import { BeltJourneyGrid } from "./belt-journey-grid"
import type { BeltRankViewModel } from "./belt-view-model"

/**
 * `BeltJourneyTab` — the client bridge for the profile "Belts" tab (Slice 5 —
 * Petey Plan 0477). The server loader (`server/web/belt/belt-tab-loader.ts`) does
 * all the reads; this component only supplies the ONE thing that must run in the
 * browser: `onUpload`, which pushes a file through the `uploadWebMedia` server
 * action against the NEW `rankMilestone` media target (seam #1) to mint a `mediaId`.
 * The gallery then links it via the belt oRPC `attachMilestoneMedia` (idempotent —
 * the upload already created the attachment on the milestone FK, so the oRPC call
 * just confirms the purpose). No Prisma, no data fetching here.
 */
export function BeltJourneyTab({
  ranks,
  ceiling,
  passportId,
  promoterOptions,
  schoolOptions,
}: {
  ranks: BeltRankViewModel[]
  ceiling: number | null
  passportId: string
  promoterOptions: CreatableOption[]
  schoolOptions: CreatableOption[]
}) {
  const onUpload = useCallback(async (file: File, rankMilestoneId: string) => {
    const result = await uploadWebMedia({
      target: { kind: "rankMilestone", id: rankMilestoneId },
      file,
      isPublic: true,
    })
    const mediaId = result?.data?.mediaId
    return mediaId ? { mediaId } : null
  }, [])

  // The promotion-request soft-gate photo has no milestone yet → upload against the
  // member's own `passport` (seam #2), which mints a mediaId we pass as claim evidence.
  const onUploadPassport = useCallback(async (file: File, pid: string) => {
    const result = await uploadWebMedia({
      target: { kind: "passport", id: pid },
      file,
      isPublic: true,
    })
    const mediaId = result?.data?.mediaId
    return mediaId ? { mediaId } : null
  }, [])

  return (
    <BeltJourneyGrid
      ranks={ranks}
      ceiling={ceiling}
      passportId={passportId}
      promoterOptions={promoterOptions}
      schoolOptions={schoolOptions}
      onUpload={onUpload}
      onUploadPassport={onUploadPassport}
    />
  )
}
