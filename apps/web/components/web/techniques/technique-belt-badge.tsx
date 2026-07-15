import { cx } from "~/lib/utils"

/**
 * Belt presentation primitives for the technique surfaces (Stream D1). A technique is
 * tagged with a single belt via its `beltLevelMin` FK; both the on-card chip and the
 * belt-filter dropdown row render its `Rank.colorHex` (ADR 0026 — the belt color is the
 * data, never a hardcoded hex). Mirrors the belt-tinted rank chip in the directory's
 * `facet-result-card.tsx` (kept inside the technique file set per the lane boundary).
 */

/** The presentation slice of the tagged belt (`beltLevelMin`). */
export type TechniqueBelt = {
  name: string
  shortName?: string | null
  colorHex?: string | null
}

/** Validate a `Rank.colorHex` for inline styling; null when missing/malformed. Internal-only (SESSION_0526 D3). */
function beltHexTint(hex: string | null | undefined): string | null {
  return hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : null
}

/** A small round belt-color dot; falls back to the brand primary when the hex is absent. */
export function BeltSwatch({
  colorHex,
  className,
}: {
  colorHex?: string | null
  className?: string
}) {
  const tint = beltHexTint(colorHex)
  return (
    <span
      className={cx(
        "size-2.5 shrink-0 rounded-full ring-1 ring-white/25",
        !tint && "bg-primary",
        className,
      )}
      style={tint ? { backgroundColor: tint } : undefined}
      aria-hidden
    />
  )
}

/**
 * On-card belt chip: a belt-tinted pill (swatch + belt name). Renders nothing when the
 * technique has no tagged belt — the current state of every seeded BBL technique, so the
 * chip is dark until belts are tagged (do not fabricate belt data in the shared DB).
 */
export function TechniqueBeltBadge({ belt }: { belt: TechniqueBelt | null | undefined }) {
  if (!belt) return null

  const tint = beltHexTint(belt.colorHex)
  const label = belt.shortName || belt.name

  if (!tint) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
        <BeltSwatch colorHex={null} />
        {label}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-inset"
      style={{ backgroundColor: `${tint}24`, borderColor: `${tint}59` }}
    >
      <BeltSwatch colorHex={tint} />
      {label}
    </span>
  )
}
