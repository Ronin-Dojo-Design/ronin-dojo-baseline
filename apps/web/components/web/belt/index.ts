/**
 * Belt-journey UI barrel (Slice 4 — Petey Plan 0477). Slice 5 mounts
 * `BeltJourneyTab` into the profile "Belts" tab with server-loaded data.
 *
 * Trimmed to the single symbol its one consumer (`dashboard/belts-tab.tsx`) imports
 * (SESSION_0492 cleanup) — the sibling components + view-model helpers are imported
 * directly via relative paths within this folder, so re-exporting them here was dead.
 */
export { BeltJourneyTab } from "./belt-journey-tab"
