import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"

/** BBL faceless gi default — shown when a person has no usable photo (null or broken URL). */
const PERSON_FALLBACK_AVATAR = "/brand/bbl/default-black-belt.png"

/** Validate a `Rank.colorHex` for inline styling; null when missing/malformed. */
function beltTint(hex: string | null) {
  return hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : null
}

/**
 * Premium faceted-directory card (SESSION_0414). Renders the normalized
 * `DirectoryFacetResult` (people / organizations / lineage trees) tuned for the BBL
 * roster: large avatar with the gi-default fallback (no bare initials for people), a
 * full (wrapping) name, a belt-tinted rank chip (`Rank.colorHex`), trust/claim badges, a
 * location line, and a View + Save footer. Theme-token only for brand surfaces; the belt
 * tint is per-rank data (ADR 0022), readable on the dark card via a light label + swatch.
 */
export function FacetResultCard({
  result,
  style,
}: {
  result: DirectoryFacetResult
  /** Optional inline style (e.g. CSS `order`) forwarded by grid consumers like `SchoolList`. */
  style?: CSSProperties
}) {
  const rank = result.tags[0]
  const isPerson = result.type === "person"
  const viewLabel = isPerson ? "View profile" : "View"
  const tint = beltTint(result.rankColorHex)

  return (
    <Card
      hover={false}
      style={style}
      className="group relative flex flex-col gap-4 overflow-hidden p-5 ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* ambient brand glow on hover */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        <Avatar className="size-16 rounded-2xl ring-2 ring-border shadow-sm transition group-hover:ring-primary/50">
          {result.imageUrl && <AvatarImage src={result.imageUrl} alt={result.title} />}
          {/* People always fall back to the gi silhouette (covers null + broken photo URLs);
              orgs/trees keep initials. */}
          {isPerson ? (
            <AvatarFallback className="p-0">
              <img
                src={PERSON_FALLBACK_AVATAR}
                alt=""
                className="size-full object-cover"
                aria-hidden
              />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-accent to-muted text-lg font-bold text-foreground">
              {result.initials}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="min-w-0 flex-1 pt-0.5">
          <Link href={result.href} className="outline-none">
            <h3 className="line-clamp-2 text-balance text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
              {result.title}
            </h3>
          </Link>

          {(result.trustStatus || result.claimStatus) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {result.trustStatus && <LineageTrustBadge status={result.trustStatus} />}
              {result.claimStatus && <LineageClaimBadge status={result.claimStatus} />}
            </div>
          )}
        </div>
      </div>

      {(rank || result.badges.length > 0) && (
        <div className="relative flex flex-wrap items-center gap-1.5">
          {rank &&
            (tint ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-inset"
                style={{ backgroundColor: `${tint}24`, borderColor: `${tint}59` }}
              >
                <span
                  className="size-2.5 rounded-full ring-1 ring-white/25"
                  style={{ backgroundColor: tint }}
                />
                {rank}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                <span className="size-1.5 rounded-full bg-primary" />
                {rank}
              </span>
            ))}
          {result.badges.map(badge => (
            <Badge key={badge.label} variant={badge.variant}>
              {badge.label}
            </Badge>
          ))}
        </div>
      )}

      {result.subtitle && (
        <p className="relative flex items-center gap-1.5 text-sm text-muted-foreground">
          {result.type !== "lineageTree" && (
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
          )}
          <span className="truncate">{result.subtitle}</span>
        </p>
      )}

      <div className="relative mt-auto flex items-center justify-between border-t border-border/60 pt-3.5">
        <Button size="sm" variant="secondary" render={<Link href={result.href} />}>
          {viewLabel}
        </Button>

        <ListingSaveButton subjectType={result.save.subjectType} subjectId={result.save.subjectId} />
      </div>
    </Card>
  )
}
