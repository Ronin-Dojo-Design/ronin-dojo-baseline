import type { ReactNode } from "react"
import type { LineageClaimBadgeStatus, LineageTrustStatus } from "~/lib/lineage/trust-status"

/**
 * m-card contract (PWCC-002) — `docs/knowledge/wiki/files/m-card-pattern.md`.
 *
 * One card, two axes of agnosticism:
 *  - **content-agnostic**: a `kind` discriminator selects which DTO slice the card binds to.
 *  - **brand-agnostic**: rendered on the Dirstarter L1 `components/common/card.tsx` base and
 *    skinned ONLY through design tokens (`--color-primary`/accent, data-driven `--rank-color`
 *    via `colorHex`, dark/light). Nothing brand- or content-specific lives in the card.
 *
 * Presentation-only: every `MCardData[kind]` is an ALREADY-projected, ALREADY-gated DTO. The
 * card never fetches and never receives a non-public field for a public surface — all redaction
 * stays upstream in the projection (`public-passport-dto.md`).
 */

export type MCardKind = "roster" | "rank" | "task" | "loop" | "generic"

/** Shared with the AdminTaskBoard lifecycle taxonomy. */
export type LifecycleStatus = "active" | "inactive" | "deprecated" | "broken"

/** Neutral chip rendered in the badge row. `variant` maps to the L1 `Badge` variants. */
export type MCardBadge = {
  label: string
  variant?: "primary" | "soft" | "outline"
}

/** Data-driven rank tint (ADR 0022) — `colorHex` from `Rank.colorHex`, never hardcoded. */
export type MCardRank = {
  name: string
  /** `#rrggbb` belt tint. Falls back to `--accent`/`--color-primary` when absent. */
  colorHex?: string | null
  disciplineCode?: string | null
}

export type MCardRosterData = {
  id: string
  name: string
  /** Optional eyebrow (kind label · discipline · project). Hidden when absent. */
  eyebrow?: string | null
  /** Primary photo URL; null → fallback image → initials. */
  avatarUrl?: string | null
  /**
   * Surface-supplied default avatar (e.g. a brand silhouette) shown when `avatarUrl` is
   * null or broken. Injected by the (brand-aware) surface so the card stays brand-agnostic.
   */
  avatarFallbackUrl?: string | null
  /** Final text fallback when no image resolves. */
  initials?: string
  rank?: MCardRank | null
  schoolLabel?: string | null
  locationLine?: string | null
  trustStatus?: LineageTrustStatus | null
  claimStatus?: LineageClaimBadgeStatus | null
  tier?: string | null
  badges?: MCardBadge[]
  /** Footer deep-link label (e.g. "View profile" vs "View"). Defaults to "View". */
  viewLabel?: string
}

export type MCardRankData = {
  id: string
  name: string
  colorHex?: string | null
  disciplineCode?: string | null
  count?: number
  items?: { id: string; label: string; done?: boolean }[]
}

export type MCardTaskData = {
  id: string
  title: string
  due?: string | null
  lane?: "QF" | "HF"
  status: LifecycleStatus
  priority?: string | null
  project?: string | null
}

export type MCardLoopData = {
  id: string
  num?: number
  title: string
  blurb?: string | null
  status?: LifecycleStatus
}

export type MCardGenericData = {
  id: string
  title: string
  media?: string | null
  tagline?: string | null
  categories?: string[]
  badges?: MCardBadge[]
}

/** content-agnostic presentation DTO — surfaces map native query output to ONE of these. */
export type MCardData = {
  roster: MCardRosterData
  rank: MCardRankData
  task: MCardTaskData
  loop: MCardLoopData
  generic: MCardGenericData
}

type MCardCommonProps = {
  href?: string
  density?: "comfortable" | "compact"
  selected?: boolean
  onSelect?: (id: string) => void
  /** Surface-supplied overflow menu / save slot. */
  actions?: ReactNode
  className?: string
}

/**
 * Discriminated union so `kind` narrows `data` inside the component. One skeleton per kind —
 * eyebrow → title → accent tint → meta → badges → actions — only the binding differs.
 */
export type MCardProps = {
  [K in MCardKind]: { kind: K; data: MCardData[K] } & MCardCommonProps
}[MCardKind]
