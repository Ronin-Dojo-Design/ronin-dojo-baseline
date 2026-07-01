"use client"

import { PencilIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { cx } from "~/lib/utils"
import {
  BELT_LOCKED_TOOLTIP,
  BELT_STATUS_LABEL,
  type BeltCardStatus,
  type BeltRankViewModel,
  deriveBeltStatus,
} from "./belt-view-model"

/**
 * `BeltEditCard` — one belt-journey card (Slice 4 — Petey Plan 0477 Locked #6).
 *
 * A DEDICATED card wrapping the Dirstarter L1 `Card` (`components/common/card.tsx`)
 * — NOT a new `m-card` kind (ADR 0040 forbids growing the record-card union). The
 * belt colour comes from `Rank.colorHex` via the `--rank-color` custom property
 * (the established lineage idiom, ADR 0022) — never a hardcoded hex.
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

const STATUS_BADGE_VARIANT: Record<BeltCardStatus, "soft" | "success" | "outline"> = {
  add: "outline",
  locked: "soft",
  completed: "success",
}

/** Inline `--rank-color` — set only when a belt colour is present (never hardcoded). */
function rankColorStyle(colorHex: string | null): CSSProperties | undefined {
  return colorHex ? ({ "--rank-color": colorHex } as CSSProperties) : undefined
}

export function BeltEditCard({
  vm,
  ceiling,
  onOpen,
}: {
  vm: BeltRankViewModel
  /** The member's awarded ceiling `sortOrder`; `null` = no discipline award. */
  ceiling: number | null
  /** Fired when an UNLOCKED card is activated (open the edit surface). */
  onOpen: (rankId: string) => void
}) {
  const status = deriveBeltStatus(vm, ceiling)
  const locked = status === "locked"
  const colorHex = vm.rank.colorHex
  const hasTint = colorHex != null
  const story = vm.card?.milestone?.story ?? null
  const mediaCount = vm.card?.milestone?.media.length ?? 0

  const actionLabel = status === "completed" ? "Edit" : "Add your story"

  const action = (
    <Button
      type="button"
      size="sm"
      variant={status === "completed" ? "secondary" : "primary"}
      disabled={locked}
      prefix={<PencilIcon />}
      onClick={() => onOpen(vm.rank.id)}
    >
      {locked ? "Locked" : actionLabel}
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

      <div className="relative flex w-full items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BeltSwatch colorHex={colorHex} variant="bar" className="h-4 w-12" />
          <h3 className="truncate text-base font-bold leading-tight tracking-tight text-foreground">
            {vm.rank.name}
          </h3>
        </div>
        <Badge size="sm" variant={STATUS_BADGE_VARIANT[status]}>
          {BELT_STATUS_LABEL[status]}
        </Badge>
      </div>

      {story ? (
        <p className="relative line-clamp-2 w-full text-sm text-muted-foreground text-pretty">
          {story}
        </p>
      ) : (
        <p className="relative w-full text-sm text-muted-foreground">
          {locked
            ? "Awarded belts unlock as your instructor promotes you."
            : "Share the story of this belt — dates, your promoter, and photos."}
        </p>
      )}

      {mediaCount > 0 && (
        <span className="relative text-xs text-muted-foreground">
          {mediaCount} {mediaCount === 1 ? "photo" : "photos"}
        </span>
      )}

      <div className="relative mt-auto flex w-full items-center justify-end border-t border-border/60 pt-3">
        {locked ? (
          <Tooltip>
            <TooltipTrigger
              render={
                // A disabled <button> swallows hover, so wrap in a span for the tip.
                <span tabIndex={0} className="inline-flex">
                  {action}
                </span>
              }
            />
            <TooltipContent>{BELT_LOCKED_TOOLTIP}</TooltipContent>
          </Tooltip>
        ) : (
          action
        )}
      </div>
    </Card>
  )
}
