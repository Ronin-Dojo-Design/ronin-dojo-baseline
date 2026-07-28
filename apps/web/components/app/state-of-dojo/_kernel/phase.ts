/**
 * Projection vocabulary kernel — the app-facing surface every State-of-Dojo panel imports
 * (SESSION_0603 WS-A kernel). The PURE vocabulary (phases, belt words, stop colors, brand skins,
 * masthead titles) now lives in the framework-free `~/lib/state-of-dojo/vocab` so the root
 * `scripts/state-of-project.ts` renderer shares the ONE source of truth (kills drift D-055 — the two
 * renderers no longer keep private copies). This module re-exports all of it so existing panel
 * imports (`_kernel/phase`) are unchanged, and adds the two members that need framework deps and so
 * CAN'T live in the pure substrate: `phaseBadgeVariant` (badge component types) and
 * `VISIBLE_BRAND_SKINS` (server `env`).
 *
 * Phase types (`Phase`, `ProductLane`) come from the shared parse core so the UI never re-derives the
 * classification the feed already ran (`~/lib/state-of-dojo/parse`).
 */
import type { badgeVariants } from "~/components/common/badge"
import { env } from "~/env"
import type { Phase } from "~/lib/state-of-dojo/parse"
import { BRAND_SKINS, type BrandSkin, DEPLOY_BRAND_KEY } from "~/lib/state-of-dojo/vocab"
import type { VariantProps } from "~/lib/utils"

export {
  BRAND_SKINS,
  type BrandSkin,
  CURRENT_DEPLOY_SKIN,
  type DeploySkin,
  MASTHEAD_TITLE,
  MASTHEAD_TITLE_HERE,
  PHASE_LABEL,
  PHASE_STOP_CLASS,
  PHASES,
  phaseWord,
} from "~/lib/state-of-dojo/vocab"

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

/**
 * The brand skins the State-of-Dojo tabs actually render on THIS deploy — the ONE place deploy-scope is
 * decided (every panel maps this, not raw `BRAND_SKINS`). A single-brand deploy (BBL) shows ONLY its own
 * brand, so cross-brand dev work never leaks onto a customer deploy (operator, SESSION_0619). The RDD
 * umbrella deploy (`ronindojodesign.com`) sets `NEXT_PUBLIC_SOTD_ALL_BRANDS=true` to show the full set —
 * the reusable deploy-scope switch for any cross-brand surface under the RDD-vs-BBL split (G-027). Lives
 * here (not in the pure `vocab`) because it reads server `env`.
 */
export const VISIBLE_BRAND_SKINS: readonly BrandSkin[] =
  env.NEXT_PUBLIC_SOTD_ALL_BRANDS === "true"
    ? BRAND_SKINS
    : BRAND_SKINS.filter(skin => skin.key === DEPLOY_BRAND_KEY)
