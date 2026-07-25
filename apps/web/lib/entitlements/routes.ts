/**
 * WL-P3-39 (SESSION_0535 FI-028) — the paid-tier upgrade/join funnel route, previously duplicated as
 * a local `const UPGRADE_HREF = "/lineage/join"` in 4 files (community post card, community post
 * row, the create-post dialog, and the post detail page). Lives in `lib/` (no `db` import) so it's
 * safe to import from "use client" components.
 */
export const UPGRADE_HREF = "/lineage/join"
