"use client"

import { CheckIcon, ClockIcon, LockIcon, PencilIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { cx } from "~/lib/utils"
import { BELT_TRUST_BADGE, type BeltRankViewModel, deriveBeltStatus } from "./belt-view-model"

/**
 * `BeltEditCard` — one belt-journey card (Slice 4 — Petey Plan 0477 Locked #6).
 *
 * A DEDICATED card wrapping the Dirstarter L1 `Card` (`components/common/card.tsx`)
 * — NOT a new `m-card` kind (ADR 0040 forbids growing the record-card union). The
 * belt colour comes from `Rank.colorHex` via the `--rank-color` custom property
 * (the established lineage idiom, ADR 0026) — never a hardcoded hex.
 *
 * State (derived by `deriveBeltStatus`):
 * - `locked`    — above the member's awarded ceiling; the action is DISABLED, the
 *                 card is `opacity-70`, and a tooltip explains why.
 * - `completed` — the member has enriched this belt (story or media).
 * - `add`       — unlocked but empty; the action invites enrichment.
 *
 * Presentation-only: `onOpen` is fired for an UNLOCKED card so the parent grid can
 * open the edit surface. No mutation happens here.
 */

/** Trust-badge icon keys (kept icon-free in `belt-view-model`) → their Lucide components. */
const TRUST_ICON = { check: CheckIcon, clock: ClockIcon } as const

/** Inline `--rank-color` — set only when a belt colour is present (never hardcoded). */
function rankColorStyle(colorHex: string | null): CSSProperties | undefined {
  return colorHex ? ({ "--rank-color": colorHex } as CSSProperties) : undefined
}

export function BeltEditCard({
  vm,
  ceiling,
  onOpen,
  onRequestPromotion,
}: {
  vm: BeltRankViewModel
  /** The member's awarded ceiling `sortOrder`; `null` = no discipline award. */
  ceiling: number | null
  /** Fired when an UNLOCKED card is activated (open the edit surface). */
  onOpen: (rankId: string) => void
  /**
   * Fired when a LOCKED (above-ceiling) card's "Request promotion" CTA is activated
   * (B1 — opens the `promotion.submit` flow). Omit → the locked card has no CTA (a
   * read-only ladder view); with it, a locked belt becomes actionable, not a dead end.
   */
  onRequestPromotion?: (rankId: string) => void
}) {
  const status = deriveBeltStatus(vm, ceiling)
  const locked = status === "locked"
  const colorHex = vm.rank.colorHex
  const hasTint = colorHex != null
  const story = vm.card?.milestone?.story ?? null
  const mediaCount = vm.card?.milestone?.media.length ?? 0

  const actionLabel = status === "completed" ? "Edit" : "Add your story"

  // Trust badge — shown ONLY for an OWNED entry (`trustState` non-null); an above-ceiling
  // (locked) card is not owned yet, so it carries no trust badge (SESSION_0540). Reuses the
  // existing `Badge` variants — no new component. The badge lives in the FOOTER row so the
  // belt name gets the full top line and never wraps against it (operator flag).
  const trustMeta = !locked && vm.trustState ? BELT_TRUST_BADGE[vm.trustState] : null
  const TrustIcon = trustMeta?.icon ? TRUST_ICON[trustMeta.icon] : null
  const trustBadge = trustMeta ? (
    <Badge size="sm" variant={trustMeta.variant} prefix={TrustIcon ? <TrustIcon /> : undefined}>
      {trustMeta.label}
    </Badge>
  ) : null

  // Above-ceiling → an actionable "Request promotion" CTA (B1), not a disabled button.
  // Enrichable belts → the edit surface.
  const action = locked ? (
    onRequestPromotion ? (
      <Button
        type="button"
        size="sm"
        variant="secondary"
        prefix={<LockIcon />}
        onClick={() => onRequestPromotion(vm.rank.id)}
      >
        Request promotion
      </Button>
    ) : null
  ) : (
    <Button
      type="button"
      size="sm"
      variant={status === "completed" ? "secondary" : "primary"}
      prefix={<PencilIcon />}
      onClick={() => onOpen(vm.rank.id)}
    >
      {actionLabel}
    </Button>
  )

  return (
    <Card
      hover={false}
      data-testid="belt-edit-card"
      data-status={status}
      data-rank-id={vm.rank.id}
      style={rankColorStyle(colorHex)}
      className={cx(
        "overflow-hidden gap-3 transition",
        locked && "opacity-70",
        !locked && "hover:border-(--rank-color)/60",
      )}
    >
      {/* belt-colour rail — data-driven tint, brand accent fallback (token-only) */}
      <span
        aria-hidden
        className={cx(
          "absolute inset-x-0 top-0 h-1.5",
          hasTint ? "bg-(--rank-color)" : "bg-primary",
        )}
      />

      {/* Top row — belt + name at FULL width (no badge here); the trust badge lives in
          the footer so a long belt name never wraps against it (SESSION_0540). */}
      <div className="relative flex w-full min-w-0 items-center gap-2.5">
        <BeltSwatch
          variant="belt"
          size="sm"
          colorHex={colorHex}
          secondaryColorHex={vm.rank.secondaryColorHex}
          degree={vm.rank.degree}
          beltFamily={vm.rank.beltFamily}
        />
        <h3 className="min-w-0 truncate text-base font-bold leading-tight tracking-tight text-foreground">
          {vm.rank.name}
        </h3>
      </div>

      {story ? (
        <p className="relative line-clamp-2 w-full text-sm text-muted-foreground text-pretty">
          {story}
        </p>
      ) : (
        <p className="relative w-full text-sm text-muted-foreground">
          {locked
            ? "Above your verified rank — request a promotion for your instructor to review."
            : "Share the story of this belt — dates, your promoter, and photos."}
        </p>
      )}

      {mediaCount > 0 && (
        <span className="relative text-xs text-muted-foreground">
          {mediaCount} {mediaCount === 1 ? "photo" : "photos"}
        </span>
      )}

      {/* Footer action row — trust badge (left) · action (right), on ONE line. When there is
          no trust badge (below-ceiling not-yet-started, or a locked/above-ceiling card) an
          empty left slot keeps the action right-aligned. */}
      {(trustBadge || action) && (
        <div className="relative mt-auto flex w-full items-center justify-between gap-3 border-t border-border/60 pt-3">
          {trustBadge ?? <span aria-hidden />}
          {action}
        </div>
      )}
    </Card>
  )
}
