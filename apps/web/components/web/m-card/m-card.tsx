import type { CSSProperties, ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { MCardBadge, MCardProps, MCardRank, MCardRosterData } from "~/lib/m-card/types"
import { cx } from "~/lib/utils"

/**
 * m-card (PWCC-002) — the ONE content-/brand-agnostic card.
 *
 * Spec: `docs/knowledge/wiki/files/m-card-pattern.md`. Built on the Dirstarter L1 `Card` base
 * (`components/common/card.tsx`) + design tokens only — never references a brand. The same
 * skeleton (accent rail → eyebrow → title → meta → badges → actions) renders every `kind`; only
 * the binding differs. Presentation-only: redaction stays upstream (mappers pass gated DTOs).
 *
 * This slice implements `kind="roster"` (the directory/lineage/passport roster card) fully and a
 * `generic` passthrough; `rank`/`task`/`loop` share a minimal skeleton pending follow-up slices.
 */

/** Validate a `colorHex` for inline tinting; null when missing/malformed. */
function beltTint(hex: string | null | undefined): string | null {
  return hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : null
}

function RankChip({ rank }: { rank: MCardRank }) {
  const tint = beltTint(rank.colorHex)

  // Data-driven `--rank-color` tint (ADR 0022) with the brand `--color-primary` accent fallback.
  if (tint) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-inset"
        style={{ backgroundColor: `${tint}24`, borderColor: `${tint}59` }}
      >
        <span
          className="size-2.5 rounded-full ring-1 ring-white/25"
          style={{ backgroundColor: tint }}
        />
        {rank.name}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
      <span className="size-1.5 rounded-full bg-primary" />
      {rank.name}
    </span>
  )
}

function MetaBadges({ badges }: { badges: MCardBadge[] }) {
  return (
    <>
      {badges.map(badge => (
        <Badge key={badge.label} variant={badge.variant ?? "outline"}>
          {badge.label}
        </Badge>
      ))}
    </>
  )
}

function RosterBody({
  data,
  href,
  actions,
}: {
  data: MCardRosterData
  href?: string
  actions?: ReactNode
}) {
  const rank = data.rank ?? null
  const badges = data.badges ?? []
  const showBadgeRow = Boolean(rank) || badges.length > 0

  const title = href ? (
    <Link href={href} className="outline-none">
      <h3 className="line-clamp-2 text-balance text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
        {data.name}
      </h3>
    </Link>
  ) : (
    <h3 className="line-clamp-2 text-balance text-lg font-bold leading-tight tracking-tight text-foreground">
      {data.name}
    </h3>
  )

  return (
    <>
      <div className="relative flex items-start gap-4">
        <Avatar className="size-16 rounded-2xl ring-2 ring-border shadow-sm transition group-hover:ring-primary/50">
          {data.avatarUrl && <AvatarImage src={data.avatarUrl} alt={data.name} />}
          {data.avatarFallbackUrl ? (
            <AvatarFallback className="p-0">
              <img
                src={data.avatarFallbackUrl}
                alt=""
                className="size-full object-cover"
                aria-hidden
              />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-accent to-muted text-lg font-bold text-foreground">
              {data.initials ?? "?"}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="min-w-0 flex-1 pt-0.5">
          {data.eyebrow && (
            <p className="mb-0.5 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {data.eyebrow}
            </p>
          )}
          {title}

          {(data.trustStatus || data.claimStatus) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {data.trustStatus && <LineageTrustBadge status={data.trustStatus} />}
              {data.claimStatus && <LineageClaimBadge status={data.claimStatus} />}
            </div>
          )}
        </div>
      </div>

      {showBadgeRow && (
        <div className="relative flex flex-wrap items-center gap-1.5">
          {rank && <RankChip rank={rank} />}
          <MetaBadges badges={badges} />
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
              {data.viewLabel ?? "View"}
            </Button>
          ) : (
            <span />
          )}
          {actions}
        </div>
      )}
    </>
  )
}

/**
 * Minimal shared skeleton for kinds not yet fully bound (rank/task/loop). Renders the common
 * eyebrow/title surface so the card never throws; full bindings land in follow-up slices.
 */
function FallbackBody({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="min-w-0 flex-1">
      {eyebrow && (
        <p className="mb-0.5 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h3 className="text-balance text-lg font-bold leading-tight tracking-tight text-foreground">
        {title}
      </h3>
    </div>
  )
}

function MCardBody(props: MCardProps) {
  switch (props.kind) {
    case "roster":
      return <RosterBody data={props.data} href={props.href} actions={props.actions} />
    case "generic":
      return <FallbackBody eyebrow={props.data.tagline ?? undefined} title={props.data.title} />
    case "rank":
      return (
        <FallbackBody eyebrow={props.data.disciplineCode ?? undefined} title={props.data.name} />
      )
    case "task":
      return <FallbackBody eyebrow={props.data.project ?? undefined} title={props.data.title} />
    case "loop":
      return (
        <FallbackBody
          eyebrow={props.data.num != null ? `Step ${props.data.num}` : undefined}
          title={props.data.title}
        />
      )
  }
}

/** Resolve the accent-rail tint: data-driven rank `colorHex`, else the brand accent token. */
function railStyle(props: MCardProps): CSSProperties | undefined {
  const tint =
    (props.kind === "roster" && beltTint(props.data.rank?.colorHex)) ||
    (props.kind === "rank" && beltTint(props.data.colorHex)) ||
    null
  return tint ? { backgroundColor: tint } : undefined
}

export function MCard(props: MCardProps) {
  const { kind, density = "comfortable", selected, className } = props
  const rail = railStyle(props)

  return (
    <Card
      hover={false}
      data-kind={kind}
      data-density={density}
      aria-selected={selected || undefined}
      className={cx(
        "group relative flex flex-col gap-4 overflow-hidden p-5 ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40 hover:shadow-xl hover:shadow-primary/10",
        density === "compact" && "gap-3 p-4",
        selected && "ring-primary/60",
        className,
      )}
    >
      {/* accent tint rail — data-driven rank tint or the brand `--color-primary` accent fallback */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary/70"
        style={rail}
      />
      {/* ambient brand glow on hover */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <MCardBody {...props} />
    </Card>
  )
}
