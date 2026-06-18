import { Fragment, type CSSProperties, type ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

/**
 * BjjPassportCard — the public, shareable "Passport" credential card.
 *
 * The signature missing surface in the BBL dashboard/profile parity epic
 * (see `docs/product/black-belt-legacy/BBL_PARITY_SPEC.md`): a single
 * credential that pairs a practitioner's belt rank with their lineage chain,
 * school, and avatar — the thing a member screenshots and shares.
 *
 * PRESENTATION-ONLY and UNWIRED on purpose (mirrors `ProfileHero`,
 * SESSION_0354): it holds NO data-fetching, NO route, and NO private fields —
 * callers pass only already-public display values, so it can never leak a
 * HIDDEN profile. A later session wires it to the directory/lineage read model.
 *
 * Brand-neutral (ADR 0022 / SOT-ADR §2.4): the belt color is the passed
 * `rank.colorHex` data, applied via `BeltSwatch` (SVG `fill`) and a data-driven
 * `--rank-color` CSS variable (the established lineage idiom) — never a
 * hardcoded belt palette. The gradient/glow falls back to the brand `primary`
 * token (red on BBL, theme-driven elsewhere) when a rank has no color.
 *
 * Type seam (brand-token sweep, recipe step 2): the credential INHERITS the BBL
 * type tokens — the name renders `--font-bbl-heading` (Poppins), body text
 * `--font-bbl-body` (Inter) — each degrading to the app `--font-display` /
 * `--font-sans` when no BBL-font ancestor defines them. The card consumes the
 * vars but never applies the font `.variable` itself: the brand-aware *consumer*
 * provides the tokens, so the card stays brand-neutral (recipe gotcha). Sizes
 * stay on the scale — micro-labels use the `--text-2xs` token, not a raw px.
 *
 * Composition note: kept as small, file-local presentational pieces so each
 * stays well under the complexity threshold (the `DrawerBody` split pattern,
 * custom-component-inventory §1).
 */

export type PassportBeltRank = {
  name: string
  /** `Rank.colorHex` — drives the belt graphic + credential accent. */
  colorHex?: string | null
}

export type BjjPassportCardProps = {
  name: string
  /** Current belt rank; omitted/null for a rankless (e.g. unranked placeholder) member. */
  rank?: PassportBeltRank | null
  /** Belt lineage, founder first → current practitioner last. */
  lineageChain?: string[]
  /** Owning school / academy display name. */
  school?: string | null
  avatarUrl?: string | null
  /** Discipline eyebrow (e.g. "BJJ"); the brand-neutral default omits it. */
  disciplineLabel?: string
  className?: string
}

/** First+last initial fallback for the avatar (presentation only). */
function passportInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return "?"
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/** Belt-color class with the brand `primary` token as the rankless fallback. */
function beltAccentClass(colorHex: string | null): string {
  return colorHex ? "bg-(--rank-color)" : "bg-primary"
}

function PassportEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-medium text-2xs text-muted-foreground uppercase tracking-wide">
      {children}
    </span>
  )
}

/** Top credential band + ambient corner glow, tinted by the belt color. */
function PassportBeltAccents({ colorHex }: { colorHex: string | null }) {
  return (
    <>
      <span
        aria-hidden
        className={cx("absolute inset-x-0 top-0 h-1.5", beltAccentClass(colorHex))}
      />
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute -top-10 -right-10 -z-10 size-32 rounded-full opacity-20 blur-2xl",
          beltAccentClass(colorHex),
        )}
      />
    </>
  )
}

function PassportHeader({
  disciplineLabel,
  rankName,
}: {
  disciplineLabel?: string
  rankName?: string
}) {
  return (
    <Stack direction="row" className="w-full items-center justify-between gap-2">
      <PassportEyebrow>
        {disciplineLabel ? `${disciplineLabel} Passport` : "Passport"}
      </PassportEyebrow>
      {rankName && (
        <Badge variant="primary" size="sm">
          {rankName}
        </Badge>
      )}
    </Stack>
  )
}

function PassportIdentity({
  name,
  avatarUrl,
  colorHex,
  rankName,
}: {
  name: string
  avatarUrl?: string | null
  colorHex: string | null
  rankName?: string
}) {
  return (
    <Stack direction="row" className="w-full items-center gap-4">
      <Avatar
        className={cx(
          "size-16 shrink-0 ring-2 ring-offset-2 ring-offset-card",
          colorHex ? "ring-(--rank-color)" : "ring-primary/40",
        )}
      >
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="text-lg">{passportInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <H4 className="truncate text-nowrap [font-family:var(--font-bbl-heading,var(--font-display))]!">
          {name}
        </H4>
        <Stack direction="row" className="mt-1 items-center gap-2">
          <BeltSwatch variant="bar" colorHex={colorHex} shimmer />
          {rankName && (
            <span className="truncate font-medium text-muted-foreground text-sm">{rankName}</span>
          )}
        </Stack>
      </div>
    </Stack>
  )
}

function PassportSchool({ school }: { school?: string | null }) {
  if (!school) {
    return null
  }
  return (
    <Stack direction="column" size="xs" className="w-full">
      <PassportEyebrow>School</PassportEyebrow>
      <span className="truncate font-medium text-foreground text-sm">{school}</span>
    </Stack>
  )
}

/** Founder → current belt chain; the current (last) practitioner is emphasized. */
function PassportLineageChain({ lineageChain }: { lineageChain: string[] }) {
  if (lineageChain.length === 0) {
    return null
  }
  const lastIndex = lineageChain.length - 1
  return (
    <Stack direction="column" size="xs" className="w-full">
      <PassportEyebrow>Lineage</PassportEyebrow>
      <Stack direction="row" wrap className="items-center gap-x-1.5 gap-y-1">
        {lineageChain.map((person, index) => (
          <Fragment key={`${index}-${person}`}>
            {index > 0 && (
              <span aria-hidden className="text-muted-foreground/60 text-xs">
                &rarr;
              </span>
            )}
            <span
              className={cx(
                "text-sm",
                index === lastIndex ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {person}
            </span>
          </Fragment>
        ))}
      </Stack>
    </Stack>
  )
}

export function BjjPassportCard({
  name,
  rank,
  lineageChain = [],
  school,
  avatarUrl,
  disciplineLabel,
  className,
}: BjjPassportCardProps) {
  const colorHex = rank?.colorHex ?? null
  const rankName = rank?.name
  // Data-driven belt tint — the established lineage `--rank-color` idiom
  // (lineage-rank-history-tab / lineage-node-card). Absent → brand `primary`.
  const rankStyle = colorHex ? ({ "--rank-color": colorHex } as CSSProperties) : undefined

  return (
    <Card
      hover={false}
      style={rankStyle}
      className={cx(
        "relative isolate max-w-sm gap-5 overflow-clip border-border/60 bg-linear-to-br from-primary/10 via-card to-card shadow-sm [font-family:var(--font-bbl-body,var(--font-sans))]",
        className,
      )}
    >
      <PassportBeltAccents colorHex={colorHex} />
      <PassportHeader disciplineLabel={disciplineLabel} rankName={rankName} />
      <PassportIdentity name={name} avatarUrl={avatarUrl} colorHex={colorHex} rankName={rankName} />
      <PassportSchool school={school} />
      <PassportLineageChain lineageChain={lineageChain} />
    </Card>
  )
}
