import type { ProfileView } from "~/server/web/directory/profile-view"
import { OwnerProfile } from "./owner-profile"
import { PublicProfile } from "./public-profile"

/**
 * ONE profile renderer for BOTH surfaces (WL-P2-37 / TICKET-0502-A).
 *
 * `/me` and `/directory/[slug]` both resolve a `ProfileView` (via `loadProfileViewForOwner`
 * / `loadProfileViewBySlug`) and hand it here. This single entry branches on the viewer
 * context's `isOwner` discriminant — the ONE place the two surfaces diverge — into the owner
 * arm (own Passport: edit affordances, gallery, identity/affiliations cards, full render) or
 * the public arm (tier-gated rich media, claim/upgrade CTAs, trust badges).
 *
 * Both arms share the reused `ListingDetail` chrome + `BjjPassportCard` credential; the loader
 * (`loadProfileViewForOwner`/`loadProfileViewBySlug`) and this orchestrator are now unified on the
 * ONE `ProfileView` read model + entry. The per-section leaves (hero badges/actions, about, sidebar,
 * ranks/belt-history) STILL have parallel owner/public implementations — reconciling those two
 * section-leaf trees into one is a ledgered follow-up (TICKET-0502-A / TASK_03). The tier contract
 * (`canRenderProfile` / `canRenderRichMedia`) is applied entirely in the projection; the public arm
 * consumes the already-gated fields, so rendering stays presentation-only.
 */
export function ProfileView({ view }: { view: ProfileView }) {
  if (view.isOwner) {
    return <OwnerProfile view={view} />
  }
  return <PublicProfile view={view} />
}
