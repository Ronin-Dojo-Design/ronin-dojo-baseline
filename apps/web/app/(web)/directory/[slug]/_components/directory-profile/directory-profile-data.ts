import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import { findProfileBySlug } from "~/server/web/directory/queries"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"

/**
 * `/directory/[slug]` view TYPES (component-launch-sweep step 1 — data-heavy route).
 *
 * @changed WL-P2-37 (SESSION_0515 TASK_03) — the loader assembly moved to the unified
 * `server/web/directory/profile-view.ts` (`loadProfileViewBySlug`), which both `/me` and
 * `/directory/[slug]` share via the ONE `ProfileView` renderer. This file now owns only the
 * two view TYPES the directory section components + the unified loader consume; the fetching
 * + derivation live in `profile-view.ts`.
 *
 * On-the-wire only (Hard boundary): every field comes from the existing `findProfileBySlug`
 * projection — no new Prisma fields, no schema-requiring selects.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */

/** The projected profile returned by `findProfileBySlug` (the privacy-gated union). */
export type DirectoryProfile = NonNullable<Awaited<ReturnType<typeof findProfileBySlug>>>

/** Everything the `/directory/[slug]` view renders. `null` → the page 404s. */
export type DirectoryProfileView = {
  /** The projected, privacy-gated profile (full or listing-preview branch). */
  profile: DirectoryProfile
  /** Route slug, threaded for the QR file name + (re-)derived URLs. */
  slug: string
  /** Absolute URL for the QR share button. */
  profileUrl: string
  /** Pre-joined "City, Region, Country" intro line, or null when no city. */
  locationLine: string | null
  /**
   * The viewer's claim state for this person's Passport (ADR 0036, SESSION_0440).
   * The shared resolver both claim surfaces consume — drives the claim/pending/yours
   * CTA without the surface re-deriving it.
   */
  viewerClaimState: ClaimViewerState
  /**
   * Account-optional claim funnel for a placeholder person (SESSION_0440 follow-up).
   * The directory "Claim" CTA routes here — the SAME `/lineage/join` wizard the lineage
   * drawer uses (guest enters an email → magic link), NOT the login-gated inline form.
   * Carries the person's claimable node so the wizard preselects it; `/lineage/join` with
   * no node is still a valid entry. Null when the profile is already claimed (no CTA).
   */
  claimFunnelHref: string | null
  /**
   * The member's PUBLIC promotion up-chain, ordered [founder … member] (SESSION_0493
   * TASK_05). Empty when the person has no PUBLIC lineage node / no public up-chain — the
   * ancestry section renders nothing. Skipped (empty) for claimable placeholders: the
   * renderer early-returns to the claim teaser before any section renders.
   */
  ancestry: LineageAncestryEntry[]
}
