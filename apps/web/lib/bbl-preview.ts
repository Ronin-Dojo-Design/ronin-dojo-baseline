import { env } from "~/env"

/** Cookie set by `/preview?token=…` that unlocks the BBL pre-launch holding page. */
export const BBL_PREVIEW_COOKIE = "bbl_preview"

/**
 * Shared secret that unlocks the BBL pre-launch holding page for previewers
 * (admins / stakeholders). Override via the `BBL_PREVIEW_TOKEN` env var on the
 * BBL prod deploy to rotate it; the default keeps the shared preview link
 * working without an env change while the repo stays private. The bypass only
 * reveals the not-yet-public marketing surface — app data behind it still
 * requires auth.
 */
export const getBblPreviewToken = () => env.BBL_PREVIEW_TOKEN ?? "bob-tony-BBL-preview"
