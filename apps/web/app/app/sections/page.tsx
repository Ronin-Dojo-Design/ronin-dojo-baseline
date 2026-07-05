import type { Metadata } from "next"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { filterAdminSectionGroups } from "~/config/admin-sections"
import { hasAnyLineageGrant, requireUser } from "~/lib/auth-guard"
import { SectionsGrid } from "./_components/sections-grid"

export const metadata: Metadata = {
  title: "Sections",
}

/**
 * Grouped console index (SESSION_0501, FI-021) — the mobile entry into the
 * `/app` areas (the desktop icon rail is `max-md:hidden`) and the desktop
 * overview. Renders the shared `ADMIN_SECTION_GROUPS` model, permission-
 * filtered server-side with the SAME rules as the sidebar (`can()` +
 * lineage-grant admits); the client island only handles the title filter.
 */
export default async function () {
  const user = await requireUser()
  const hasLineageGrant = await hasAnyLineageGrant(user.id)

  // Permission truth stays server-side: the island receives only the reachable
  // hrefs and re-derives display data (icons aren't serializable) from the
  // shared config on the client.
  const allowedHrefs = filterAdminSectionGroups(user, hasLineageGrant).flatMap(group =>
    group.items.map(item => item.href),
  )

  return (
    <Wrapper size="lg" gap="xs">
      <Stack direction="column" size="xs">
        <H3>Sections</H3>
        <Note>Every console area you can reach, grouped. Filter by name to jump faster.</Note>
      </Stack>

      <SectionsGrid allowedHrefs={allowedHrefs} />
    </Wrapper>
  )
}
