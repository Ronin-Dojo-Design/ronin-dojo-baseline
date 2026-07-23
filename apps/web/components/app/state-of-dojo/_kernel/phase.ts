/**
 * Projection vocabulary — the ONE shared card/phase/brand language every State-of-Dojo panel speaks
 * (SESSION_0603 WS-A kernel). Pure constants + tiny mappers; no JSX, no `server-only` — safe to import
 * from any panel (server or, if ever needed, client).
 *
 * Phase types (`Phase`, `ProductLane`) come from the shared parse core so the UI never re-derives the
 * classification the feed already ran (`~/lib/state-of-dojo/parse`).
 */
import type { badgeVariants } from "~/components/common/badge"
import { env } from "~/env"
import type { Phase, ProductLane } from "~/lib/state-of-dojo/parse"
import type { VariantProps } from "~/lib/utils"

/** The full 5-belt BJJ ladder, in order: planned → in-flight → review → held → done. */
export const PHASES: readonly Phase[] = ["planned", "in-flight", "review", "held", "done"] as const

/** Neutral work-board words (MMB skin + any non-belt context). */
export const PHASE_LABEL: Record<Phase, string> = {
  planned: "Planned",
  "in-flight": "In flight",
  review: "Review",
  held: "Held",
  done: "Done",
}

/** Belt-ladder words (dojo skins — RDD/BBL). The 5 BJJ belts; `held` = brown (ready-to-ship). */
export const BELT_WORD: Record<Phase, string> = {
  planned: "White",
  "in-flight": "Blue",
  review: "Purple",
  held: "Brown",
  done: "Black",
}

/**
 * Belt-ladder stop color per phase. **Brand-INVARIANT** (projection protocol): identical across every
 * brand tab — only the accompanying WORD swaps per skin, never the hue. Theme-aware so the white-belt
 * stop never disappears against the paper background in either mode (Desi's v3-mock note: 1px edge).
 */
export const PHASE_STOP_CLASS: Record<Phase, string> = {
  planned: "bg-background text-foreground border border-border",
  "in-flight": "bg-blue-700 text-white",
  review: "bg-violet-600 text-white",
  held: "bg-[#7a5230] text-white dark:bg-[#a9784f]",
  done: "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

/** Status-pill variant for a session/goal card, from its bucketed phase. Semantic severity is
 * brand-invariant (protocol) — done=success, review=info, in-flight=soft-primary, planned=outline. */
export function phaseBadgeVariant(phase: Phase): BadgeVariant {
  switch (phase) {
    case "done":
      return "success"
    case "held":
      return "warning"
    case "review":
      return "info"
    case "in-flight":
      return "primary"
    default:
      return "outline"
  }
}

// ── Brand skins (PL-005 fixed-hue-brand-tint) ────────────────────────────────────────────────────

/**
 * A brand tab = skin × lane filter. The tint (`accent`) is applied as `--sotd-accent` on each panel
 * wrapper (fixed-hue, contrast-floored) — NOT a re-skin of the semantic phase colors (those stay
 * brand-invariant, see `PHASE_STOP_CLASS`). `belts` picks the word vocabulary: dojo skins show belt
 * words, MMB shows neutral labels.
 */
export type BrandSkin = {
  key: ProductLane
  label: string
  /** CSS color for the per-brand accent tint, surfaced via `--sotd-accent`. */
  accent: string
  /** true = belt words (dojo skins); false = neutral work-board labels (MMB / "State of the Building"). */
  belts: boolean
}

/**
 * The in-app `/app/state` surface classifies rows into exactly these three lanes today
 * (`classifySessionProduct`/`classifyGoalProduct` in the parse core). This registry is the extension
 * point for the full 7-brand umbrella (ADR 0051) — that lands behind the RDD deploy (SESSION_0598),
 * not here; adding a skin is one row + a matching `ProductLane` classification. No empty tabs until then.
 */
export const BRAND_SKINS: readonly BrandSkin[] = [
  { key: "rdd", label: "RDD", accent: "var(--color-primary, #3f3f46)", belts: true },
  { key: "bbl", label: "BBL", accent: "hsl(1 79% 51%)", belts: true },
  { key: "mmb", label: "MMB", accent: "#ff6a1a", belts: false },
] as const

/**
 * This deploy's own brand key (its `ProductLane`). The BBL flagship = `"bbl"`; a future MMB deploy overrides
 * to `"mmb"`, the RDD umbrella to `"rdd"`. Module-local — only `VISIBLE_BRAND_SKINS` reads it; export it if a
 * second consumer ever needs the "which brand is this deploy" knob.
 */
const DEPLOY_BRAND_KEY: ProductLane = "bbl"

/**
 * The brand skins the State-of-Dojo tabs actually render on THIS deploy — the ONE place deploy-scope is
 * decided (every panel maps this, not raw `BRAND_SKINS`). A single-brand deploy (BBL) shows ONLY its own
 * brand, so cross-brand dev work never leaks onto a customer deploy (operator, SESSION_0619). The RDD
 * umbrella deploy (`ronindojodesign.com`) sets `NEXT_PUBLIC_SOTD_ALL_BRANDS=true` to show the full set —
 * the reusable deploy-scope switch for any cross-brand surface under the RDD-vs-BBL split (G-027).
 */
export const VISIBLE_BRAND_SKINS: readonly BrandSkin[] =
  env.NEXT_PUBLIC_SOTD_ALL_BRANDS === "true"
    ? BRAND_SKINS
    : BRAND_SKINS.filter(skin => skin.key === DEPLOY_BRAND_KEY)

/** The word for a phase under a given skin (belt vs neutral). */
export function phaseWord(phase: Phase, belts: boolean): string {
  return belts ? BELT_WORD[phase] : PHASE_LABEL[phase]
}

// ── Per-deploy masthead title (SESSION_0593 pinned input) ────────────────────────────────────────

/** A deploy's skin family. `apps/web` (BBL flagship) is a dojo skin; the MMB deploy is a building skin. */
export type DeploySkin = "dojo" | "building"

export const MASTHEAD_TITLE: Record<DeploySkin, string> = {
  dojo: "State of the Dojo",
  building: "State of the Building",
}

/** This deploy (`apps/web`) is a dojo skin → "State of the Dojo". The MMB deploy overrides to "building". */
export const CURRENT_DEPLOY_SKIN: DeploySkin = "dojo"

export const MASTHEAD_TITLE_HERE = MASTHEAD_TITLE[CURRENT_DEPLOY_SKIN]
