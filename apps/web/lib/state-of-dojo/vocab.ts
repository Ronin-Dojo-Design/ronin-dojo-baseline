/**
 * state-of-dojo/vocab.ts — the ONE framework-free projection vocabulary (card/phase/brand/masthead
 * language) every State-of-Dojo renderer speaks. Pure constants + tiny mappers; only `import type`
 * from `./parse` (erased at compile). No JSX, no `~/env`, no `server-only`, no `~/` path alias —
 * so it runs under Bun (the root `scripts/state-of-project.ts` renderer) AND inside a React Server
 * Component, mirroring `parse.ts`'s self-contained contract.
 *
 * This is the single source of truth: `_kernel/phase.ts` re-exports it (adding the two impure
 * members that need `env` / the badge component — `VISIBLE_BRAND_SKINS`, `phaseBadgeVariant`), and
 * `scripts/state-of-project.ts` imports it directly. Every vocabulary fix lands here ONCE
 * (kills drift D-055 — the two renderers that had diverged private copies).
 */
import type { Phase, ProductLane } from "./parse"

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
 * brand tab — only the accompanying WORD swaps per skin, never the hue. **Theme-INVARIANT** too: a
 * belt's color is physical, not themed, so the white stop can't invert to dark (nor the black stop to
 * white) in dark mode. The white stop's `border` keeps it legible against the paper card in either
 * mode (Desi's v3-mock note: 1px edge); the black stop carries a hairline `border-white/15` so its
 * near-black fill reads as an edge on a dark card.
 */
export const PHASE_STOP_CLASS: Record<Phase, string> = {
  planned: "bg-neutral-100 text-neutral-900 border border-border",
  "in-flight": "bg-blue-700 text-white",
  review: "bg-violet-600 text-white",
  held: "bg-[#7a5230] text-white",
  done: "bg-neutral-900 text-white border border-white/15",
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
 * This deploy's own brand key (its `ProductLane`). The BBL flagship = `"bbl"`; a future MMB deploy
 * overrides to `"mmb"`, the RDD umbrella to `"rdd"`. Read by `VISIBLE_BRAND_SKINS` in `_kernel/phase.ts`
 * (the ONE place deploy-scope is decided) — exported here so that env-gated selector can compose it.
 */
export const DEPLOY_BRAND_KEY: ProductLane = "bbl"

/**
 * The word for a phase. OPERATOR CALL 0714 (PL-020): the dojo skins retired belt-COLOR words —
 * every State-of-Dojo surface (dojo RDD/BBL *and* MMB) now speaks ONE vocabulary, `PHASE_LABEL`
 * (Planned / In flight / Review / Held / Done). The `belts` flag is kept in the signature (call
 * sites still thread `skin.belts`, so a future re-divergence is one line here) but no longer selects
 * a vocabulary. `BELT_WORD` above is retained for reference only — it has no live consumer after this
 * change; flag for cleanup, do not delete without operator sign-off.
 */
export function phaseWord(phase: Phase, _belts: boolean): string {
  return PHASE_LABEL[phase]
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
