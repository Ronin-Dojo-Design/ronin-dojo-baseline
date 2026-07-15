import type { CSSProperties, ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { LineageClaimBadgeStatus, LineageTrustStatus } from "~/lib/lineage/trust-status"
import { cx } from "~/lib/utils"

/**
 * m-card — the app RECORD/PERSON card (doctrine §5; ADR 0040; PWCC-002).
 *
 * A single, content- and brand-agnostic card template for an IDENTITY record: glyph/avatar +
 * title + meta + one focal value + badges. `kind` is `roster` (person) | `rank` (belt group /
 * curriculum); brand skinning is **token-only** (`--color-primary`, with a data-driven belt tint
 * via `--rank-color` from `Rank.colorHex`, ADR 0026). It is built ON TOP of the Dirstarter L1 base
 * primitive `components/common/card.tsx` — never a rebuilt primitive — and is **presentation-only**:
 * all redaction stays upstream in the projection (see `docs/knowledge/wiki/files/public-passport-
 * dto.md`). Mappers feed it already-projected, already-gated DTOs.
 *
 * NOT a god-union (doctrine §5): the demoted `task` / `loop` / `generic` kinds were never wired and
 * belong to *different* information architectures — `generic` (catalog) → `ListingCard`; `task` /
 * `loop` (board) → the kernel `BoardCard` (`@ronin-dojo/ui-kit` m-card). Dropped SESSION_0470 so this
 * stays the ONE record/person card, not five cards in a `switch`.
 *
 * Spec: `docs/knowledge/wiki/files/m-card-pattern.md`.
 */

export type MCardKind = "roster" | "rank"

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
  // Belt group / curriculum (PWCC-002 slice 2). See m-card-pattern.md kind=rank.
  rank: {
    id: string
    name: string
    colorHex?: string | null
    disciplineCode?: string | null
    count?: number
    items?: { id: string; label: string; done?: boolean }[]
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

function RankCard({
  data,
  href,
  density = "comfortable",
  selected,
  actions,
}: {
  data: MCardData["rank"]
  href?: string
  density?: "comfortable" | "compact"
  selected?: boolean
  actions?: ReactNode
}) {
  const colorHex = data.colorHex ?? null
  const hasRankTint = colorHex != null
  const isCompact = density === "compact"
  const items = data.items ?? []
  const eyebrow = data.disciplineCode ?? "Rank"

  return (
    <Card
      hover={false}
      isHighlighted={selected}
      data-testid="m-card"
      data-kind="rank"
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
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        {/* belt swatch — data-driven tint; brand accent fallback (never hardcoded) */}
        <span
          aria-hidden
          data-testid="m-card-rank-swatch"
          className={cx(
            "mt-0.5 size-12 shrink-0 rounded-2xl shadow-sm ring-2",
            hasRankTint
              ? "bg-(--rank-color)/15 ring-(--rank-color)"
              : "bg-primary/10 ring-border group-hover:ring-primary/50",
          )}
        >
          <span
            className={cx(
              "block size-full rounded-2xl",
              hasRankTint ? "bg-(--rank-color)" : "bg-primary",
              "opacity-80",
            )}
          />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <span className="font-medium text-2xs text-muted-foreground uppercase tracking-wide">
            {eyebrow}
          </span>

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

          {data.count != null && (
            <p className="mt-1 text-sm text-muted-foreground">
              {data.count} {data.count === 1 ? "member" : "members"}
            </p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <ul className="relative flex w-full flex-col gap-1.5" data-testid="m-card-rank-checklist">
          {items.map(item => (
            <li key={item.id} className="flex items-center gap-2 text-sm text-foreground">
              <span
                aria-hidden
                className={cx(
                  "flex size-4 shrink-0 items-center justify-center rounded border",
                  item.done
                    ? hasRankTint
                      ? "border-(--rank-color) bg-(--rank-color)/20 text-(--rank-color)"
                      : "border-primary bg-primary/15 text-primary"
                    : "border-border bg-transparent text-transparent",
                )}
              >
                {item.done ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : null}
              </span>
              <span className={cx("truncate", item.done && "text-muted-foreground line-through")}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      {(href || actions) && (
        <div className="relative mt-auto flex items-center justify-between border-t border-border/60 pt-3.5">
          {href ? (
            <Button size="sm" variant="secondary" render={<Link href={href} />}>
              View rank
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
 * The record/person card (doctrine §5). Renders one identity skeleton per kind; only the binding
 * differs — `roster` (person) and `rank` (belt group / curriculum) are the two record shapes.
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

  const data = props.data as MCardData["rank"]
  return (
    <RankCard
      data={data}
      href={props.href}
      density={props.density}
      selected={props.selected}
      actions={props.actions}
    />
  )
}
