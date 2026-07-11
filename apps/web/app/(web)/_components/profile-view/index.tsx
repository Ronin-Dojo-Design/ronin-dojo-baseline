import type { ProfileView } from "~/server/web/directory/profile-view"
import { PublicProfile } from "./public-profile"

/**
 * The ONE profile renderer (WL-P2-37 / TICKET-0502-A → SESSION_0525 C0).
 *
 * `/directory/[slug]` resolves a `ProfileView` (via `loadProfileViewBySlug`) and hands it here.
 * The former owner arm (`/me` own-Passport render + its `me-profile/*` section tree + the inline
 * `ProfileEditDrawer`) was deleted with the `/me` redirect — `/me` now redirects to `/app/profile`
 * (SESSION_0522 TASK_04 → migration step 7), so the only live surface is the public read. The
 * viewer-context `isOwner` discriminant is gone; `ProfileView` is now the single public arm.
 *
 * The tier contract (`canRenderProfile` / `canRenderRichMedia`) is applied entirely in the
 * projection; this arm consumes the already-gated fields, so rendering stays presentation-only and
 * cannot leak a private field. Belt colors stay data-driven (`Rank.colorHex` → `BeltSwatch`).
 */
export function ProfileView({ view }: { view: ProfileView }) {
  return <PublicProfile view={view} />
}
