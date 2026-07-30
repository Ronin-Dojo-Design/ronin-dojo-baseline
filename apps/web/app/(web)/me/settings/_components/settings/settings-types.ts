import type { Brand } from "~/.generated/prisma/browser"
import type { MemberSettings } from "~/server/web/settings/member-settings"

/**
 * Props for the `/me/settings` orchestrator. The page resolves identity + the persisted settings
 * blob on the wire and hands the already-normalized values down — the module owns presentation only.
 */
export type MemberSettingsViewProps = {
  /** Resolved request brand — drives the BBL typography scope (ADR 0022). */
  brand: Brand
  /** The owner's settings, with defaults already layered in by the server query. */
  settings: MemberSettings
}
