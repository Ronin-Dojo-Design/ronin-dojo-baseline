import type { CSSProperties, ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { LineageClaimBadgeStatus, LineageTrustStatus } from "~/lib/lineage/trust-status"
import { cx } from "~/lib/utils"

/**
 * m-card — the one card contract (PWCC-002).
 *
 * A single, content- and brand-agnostic card template. `kind` selects the DTO slice
 * the card binds to; brand skinning is **token-only** (`--color-primary` / `--accent`,
 * with a data-driven belt tint via `--rank-color` from `Rank.colorHex`, ADR 0022). It is
 * built ON TOP of the Dirstarter L1 base primitive `components/common/card.tsx` — never
 * a rebuilt primitive — and is **presentation-only**: all redaction stays upstream in the
 * projection (see `docs/knowledge/wiki/files/public-passport-dto.md`). Mappers feed it
 * already-projected, already-gated DTOs.
 *
 * Spec: `docs/knowledge/wiki/files/m-card-pattern.md`.
 *
 * Slice 1 (this file) implements `kind="roster"` fully. The other kinds
 * (`rank` / `task` / `loop` / `generic`) are minimal placeholders so the union type
 * compiles — see the per-kind TODOs referencing the spec.
 */

export type MCardKind = "roster" | "rank" | "task" | "loop" | "generic"

/** Shared lifecycle status — aligned with the AdminTaskBoard (spec §contract). */
export type LifecycleStatus = "active" | "inactive" | "deprecated" | "broken"

/** A presentation badge the surface wants painted into the card's badge row. */
export type MCardBadge = {
  label: string
  variant?: "primary" | "soft" | "outline" | "success" | "caution" | "warning" | "info" | "danger"
}

/** A rank reference reduced to its presentation fields (no DB types in the card). */
export type MCardRankRef = {
  name: string
  colorHex?: string | null
  disciplineCode?: string | null
}

/**
 * Content-agnostic presentation DTOs — surfaces map their native query output to ONE of
 * these via the per-kind mappers (`lib/m-card/map-*.ts`).
 */
export type MCardData = {
  roster: {
    id: string
    name: string
    avatarUrl?: string | null
    /** Initials fallback when there is no usable avatar image. */
    initials?: string
    rank?: MCardRankRef | null
    /** Eyebrow line — discipline / kind label / school context. */
    eyebrow?: string | null
    schoolLabel?: string | null
    locationLine?: string | null
    trustStatus?: LineageTrustStatus | null
    claimStatus?: LineageClaimBadgeStatus | null
    /** Extra presentation badges (e.g. paid tier). */
    badges?: MCardBadge[]
  }
  // TODO(PWCC-002 slice ≥4): belt group / curriculum. See m-card-pattern.md kind=rank.
  rank: {
    id: string
    name: string
    colorHex?: string | null
    disciplineCode?: string | null
    count?: number
    items?: { id: string; label: string; done?: boolean }[]
  }
  // TODO(PWCC-002 slice ≥5): AdminTaskBoard rows. See m-card-pattern.md kind=task.
  task: {
    id: string
    title: string
    due?: string | null
    lane?: "QF" | "HF"
    status: LifecycleStatus
    priority?: string | null
    project?: string | null
  }
  // TODO(PWCC-002 slice ≥5): orchestration loop step poster. See m-card-pattern.md kind=loop.
  loop: {
    id: string
    num?: number
    title: string
    blurb?: string | null
    status?: LifecycleStatus
  }
  // TODO(PWCC-002 slice ≥4): listings / catalog fallback. See m-card-pattern.md kind=generic.
  generic: {
    id: string
    title: string
    media?: string | null
    tagline?: string | null
    categories?: string[]
    badges?: MCardBadge[]
  }
}

export type MCardProps<K extends MCardKind> = {
  kind: K
  data: MCardData[K]
  /** Deep-link target (roster / generic) — omit for inline task / loop. */
  href?: string
  density?: "comfortable" | "compact"
  selected?: boolean
  onSelect?: (id: string) => void
  /** Overflow menu / save slot — surface-supplied (e.g. `<ListingSaveButton />`). */
  actions?: ReactNode
}

/** First+last initial fallback (presentation only). */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return "?"
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Inline `--rank-color` custom property (the established lineage idiom) — set only when a
 * belt color is present so the Tailwind `*-(--rank-color)` utilities resolve; otherwise the
 * card falls back to the brand accent (`--color-primary`). Never a hardcoded hex.
 */
function rankColorStyle(colorHex?: string | null): CSSProperties | undefined {
  return colorHex ? ({ "--rank-color": colorHex } as CSSProperties) : undefined
}

function RosterCard({
  data,
  href,
  density = "comfortable",
  selected,
  actions,
}: {
  data: MCardData["roster"]
  href?: string
  density?: "comfortable" | "compact"
  selected?: boolean
  actions?: ReactNode
}) {
  const colorHex = data.rank?.colorHex ?? null
  const hasRankTint = colorHex != null
  const fallbackInitials = data.initials ?? initialsOf(data.name)
  const isCompact = density === "compact"

  return (
    <Card
      hover={false}
      isHighlighted={selected}
      data-testid="m-card"
      data-kind="roster"
      style={rankColorStyle(colorHex)}
      className={cx(
        "group overflow-hidden ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:ring-primary/40",
        isCompact && "gap-3 p-4",
      )}
    >
      {/* accent tint rail — belt color when present, brand accent otherwise (token-only) */}
      <span
        aria-hidden
        className={cx(
          "absolute inset-x-0 top-0 h-1.5",
          hasRankTint ? "bg-(--rank-color)" : "bg-primary",
        )}
      />
      {/* ambient brand glow on hover */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        <Avatar
          className={cx(
            "size-16 shrink-0 rounded-2xl shadow-sm ring-2 transition",
            hasRankTint ? "ring-(--rank-color)" : "ring-border group-hover:ring-primary/50",
          )}
        >
          {data.avatarUrl && <AvatarImage src={data.avatarUrl} alt={data.name} />}
          <AvatarFallback className="bg-gradient-to-br from-accent to-muted text-lg font-bold text-foreground">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 pt-0.5">
          {data.eyebrow && (
            <span className="font-medium text-2xs text-muted-foreground uppercase tracking-wide">
              {data.eyebrow}
            </span>
          )}

          {href ? (
            <Link href={href} className="outline-none">
              <h3 className="line-clamp-2 text-balance text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                {data.name}
              </h3>
            </Link>
          ) : (
            <h3 className="line-clamp-2 text-balance text-lg font-bold leading-tight tracking-tight text-foreground">
              {data.name}
            </h3>
          )}

          {(data.trustStatus || data.claimStatus) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {data.trustStatus && <LineageTrustBadge status={data.trustStatus} />}
              {data.claimStatus && <LineageClaimBadge status={data.claimStatus} />}
            </div>
          )}
        </div>
      </div>

      {(data.rank || (data.badges?.length ?? 0) > 0) && (
        <div className="relative flex flex-wrap items-center gap-1.5">
          {data.rank &&
            (hasRankTint ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--rank-color)/15 px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-inset ring-(--rank-color)/40">
                <span className="size-2.5 rounded-full bg-(--rank-color) ring-1 ring-white/25" />
                {data.rank.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                <span className="size-1.5 rounded-full bg-primary" />
                {data.rank.name}
              </span>
            ))}
          {data.badges?.map(badge => (
            <Badge key={badge.label} variant={badge.variant ?? "outline"}>
              {badge.label}
            </Badge>
          ))}
        </div>
      )}

      {(data.schoolLabel || data.locationLine) && (
        <p className="relative flex items-center gap-1.5 text-sm text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            className="size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10Z" />
            <circle cx="12" cy="11" r="2" />
          </svg>
          <span className="truncate">{data.schoolLabel ?? data.locationLine}</span>
        </p>
      )}

      {(href || actions) && (
        <div className="relative mt-auto flex items-center justify-between border-t border-border/60 pt-3.5">
          {href ? (
            <Button size="sm" variant="secondary" render={<Link href={href} />}>
              View profile
            </Button>
          ) : (
            <span />
          )}
          {actions}
        </div>
      )}
    </Card>
  )
}

/**
 * Placeholder for `kind` paths not yet built this slice. Renders a minimal Dirstarter card
 * so the union type compiles and a surface that wires an un-built kind fails visibly, not silently.
 */
function PlaceholderCard({ kind, title }: { kind: MCardKind; title: string }) {
  return (
    <Card hover={false}>
      <Stack size="sm">
        <span className="font-medium text-2xs text-muted-foreground uppercase tracking-wide">
          m-card · {kind}
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {/* TODO(PWCC-002): build this kind's render path — see m-card-pattern.md. */}
        <p className="text-xs text-muted-foreground">Not implemented in slice 1.</p>
      </Stack>
    </Card>
  )
}

/**
 * The one card. Renders a single skeleton per kind; only the binding differs.
 * Slice 1: `roster` is fully implemented; the rest are placeholders (see TODOs above).
 */
export function MCard<K extends MCardKind>(props: MCardProps<K>) {
  if (props.kind === "roster") {
    const data = props.data as MCardData["roster"]
    return (
      <RosterCard
        data={data}
        href={props.href}
        density={props.density}
        selected={props.selected}
        actions={props.actions}
      />
    )
  }

  // TODO(PWCC-002 slices ≥4/5): rank / task / loop / generic. See m-card-pattern.md.
  const data = props.data as { title?: string; name?: string }
  return <PlaceholderCard kind={props.kind} title={data.title ?? data.name ?? "Untitled"} />
}
