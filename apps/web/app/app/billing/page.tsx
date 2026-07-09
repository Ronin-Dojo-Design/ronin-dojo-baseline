import { redirect } from "next/navigation"

/**
 * `/app/billing` has no landing surface of its own — the section's only page is the
 * Stripe webhook monitor at `/app/billing/monitoring`. Without this index the route
 * 404s (the layout guards the area but renders no page), and the command-palette
 * "Settings" entry (`/admin/billing` → `/app/billing`) dead-ends. Redirect to the
 * monitor so every billing entry point resolves. The `layout.tsx` permission guard
 * (`APP_AREA_PERMISSIONS.billing`) still runs before this.
 */
export default function Page() {
  redirect("/app/billing/monitoring")
}
