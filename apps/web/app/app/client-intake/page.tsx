import type { Metadata } from "next"
import { ClientIntakeForm } from "~/components/app/client-intake/client-intake-form"
import { Wrapper } from "~/components/common/wrapper"
import { requirePermission } from "~/lib/auth-guard"
import { getPageMetadata } from "~/lib/pages"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/**
 * `/app/client-intake` — the live discovery-call capture surface (SESSION_0625, G-021 lane).
 *
 * Gated INLINE (the `/app` layout only requires a signed-in user), matching the
 * `/app/planning-intake` precedent: no subordinate non-staff routes here, so a `layout.tsx` gate
 * would add nothing. `noindex` — this is an internal staff surface, and a filled draft carries a
 * real client's business terms.
 *
 * The route owns placement (`Wrapper`); the form is placement-agnostic so it can be mounted into a
 * dialog or a landing slot later unchanged.
 */
export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/app/client-intake",
    metadata: {
      title: "Client Intake",
      description: "Capture a discovery call live, then export it for the intake grill.",
      robots: { index: false, follow: false },
    },
  })
}

export default async function Page() {
  await requirePermission(APP_AREA_PERMISSIONS.clientIntake)

  return (
    <Wrapper size="lg" gap="sm">
      <ClientIntakeForm />
    </Wrapper>
  )
}
