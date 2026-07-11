import { redirect } from "next/navigation"
import { getServerSession } from "~/lib/auth"

/**
 * `/me` is retired (SESSION_0522 — rank-entry unified data flow, §Surfaces + migration step 5).
 * The canonical authenticated member workspace is `/app/profile`; the public read is
 * `/directory/[slug]`. This route is now a thin redirect:
 *   - signed-in  → `/app/profile`
 *   - signed-out → `/auth/login?next=/app/profile` (land back on the workspace after auth)
 *
 * The login page resolves its post-auth target from the `?next` query param
 * (`useAuthCallbackUrl` → `searchParams.get("next")`), which MUST stay a single same-origin
 * relative path — a nested `?` re-triggers the Better-Auth double-decode trap.
 *
 * The former owner-arm renderer (`OwnerProfile` / `loadProfileViewForOwner` /
 * `me/_components/me-profile/*` / the inline `ProfileEditDrawer`) was deleted in migration step 7
 * (SESSION_0525 C0) now that this redirect makes it unreachable; the public read
 * (`/directory/[slug]` → `PublicProfile`) and the `/app/profile` dashboard editor are the only
 * live profile surfaces.
 */
export default async function MePage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login?next=/app/profile")
  }

  redirect("/app/profile")
}
