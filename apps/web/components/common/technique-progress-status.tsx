import { Circle, CircleCheck, CircleDashed, CircleDot, CircleDotDashed } from "lucide-react"
import type { ReactNode } from "react"
import { TechniqueProgressStatus } from "~/.generated/prisma/browser"
import { cx } from "~/lib/utils"

/**
 * The ONE progress-display channel for `TechniqueProgressStatus` (AUD2-5, ratified at the
 * SESSION_0578/0580 grill — pinned by the operator, not re-opened). The badge/tint budget on
 * every technique surface is already spent (graph node fill=type, bottom bar=belt, ring=focus;
 * cards carry Premium/Video/Foundational + belt), so member progress reads as a LEADING GLYPH in
 * the technique's identity cluster — NEVER a third color channel, and it never touches the
 * trailing attribute badge row (`technique-badges.tsx`) or `Foundational`.
 *
 * One neutral tone throughout (`text-muted-foreground`); the SHAPE carries the five-state signal
 * (empty ring → dashed ring → dotted-dashed ring → filled dot → check). Shared verbatim between
 * the technique-detail control (`technique-progress-control.tsx`) and the dashboard progress
 * table (both Lane B, G-022); Lane A applies the same channel to cards/graph nodes post-GA.
 * Mirrors the `tool-status.tsx` shared icon-map pattern (`toolStatusIcon`/`toolStatusBadgeProps`).
 */
export const techniqueProgressLabel: Record<TechniqueProgressStatus, string> = {
  [TechniqueProgressStatus.NOT_STARTED]: "Not started",
  [TechniqueProgressStatus.LEARNING]: "Learning",
  [TechniqueProgressStatus.DRILLING]: "Drilling",
  [TechniqueProgressStatus.SPARRING]: "Sparring",
  [TechniqueProgressStatus.MASTERED]: "Mastered",
}

const GLYPH_CLASS_NAME = "size-4 shrink-0 text-muted-foreground"

export const techniqueProgressIcon: Record<TechniqueProgressStatus, ReactNode> = {
  [TechniqueProgressStatus.NOT_STARTED]: <Circle className={GLYPH_CLASS_NAME} aria-hidden="true" />,
  [TechniqueProgressStatus.LEARNING]: (
    <CircleDashed className={GLYPH_CLASS_NAME} aria-hidden="true" />
  ),
  [TechniqueProgressStatus.DRILLING]: (
    <CircleDotDashed className={GLYPH_CLASS_NAME} aria-hidden="true" />
  ),
  [TechniqueProgressStatus.SPARRING]: <CircleDot className={GLYPH_CLASS_NAME} aria-hidden="true" />,
  [TechniqueProgressStatus.MASTERED]: (
    <CircleCheck className={GLYPH_CLASS_NAME} aria-hidden="true" />
  ),
}

/**
 * Accessible icon-only glyph for one status — `role="img"` + `aria-label` carries the state name
 * to assistive tech; the icon itself stays `aria-hidden`. Use wherever the leading identity-cluster
 * glyph is needed; `techniqueProgressIcon`/`techniqueProgressLabel` are exported separately for
 * callers that also render the label as text alongside (e.g. a table cell).
 */
export function TechniqueProgressGlyph({
  status,
  className,
}: {
  status: TechniqueProgressStatus
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label={techniqueProgressLabel[status]}
      className={cx("inline-flex items-center", className)}
    >
      {techniqueProgressIcon[status]}
    </span>
  )
}
