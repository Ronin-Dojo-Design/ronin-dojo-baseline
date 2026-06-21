/**
 * Shared BBL doc-generator theme — the ONE token + step-chip source for the HTML doc generators
 * (build-orchestration-hub.ts, build-loop-posters.ts) and the component-design-system reference.
 *
 * Canonical values traced to source (Desi brand pass, SESSION_0428):
 *   - accent red  #E52421  ← apps/web/app/styles.css `--color-primary` (NEVER gold — styles.css:210
 *     flags #FFD700/gold as a corrected wrong-import; do not reintroduce it)
 *   - fonts Poppins (heading, 800 uppercase italic) + Inter (body) ← apps/web/lib/fonts.ts
 *   - the 1-2-3 step chip = filled red disc + white number ← emails/bbl-the-long-road.tsx LoginStep
 */

export const BBL_FONTS_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:ital,wght@1,800&display=swap" rel="stylesheet">'

/**
 * `:root` custom properties — the canonical BBL doc palette + type + radius.
 *
 * Light is the default; dark is a true inversion that keeps the brand accent and
 * matches the OS via `prefers-color-scheme`. Either mode can be forced with
 * `<html data-theme="light|dark">` (the design-system reference toggles it; posters
 * pin `light` so they print as paper). Dark surfaces mirror the iOS/Todoist chrome
 * the AdminTaskBoard is modelled on.
 */
const LIGHT_VARS = `
  --accent:#E52421;       /* BBL brand red (styles.css --color-primary). NEVER gold. */
  --accent-dark:#B91C1C;  /* red-700 — eyebrows / links */
  --on-accent:#FFFFFF;    /* text/number on a red disc */
  --bg:#FFFFFF; --page:#F5F5F5; --surface:#FAFAFA;
  --fg:#1F1F1F; --muted:#737373; --line:#E0E0E0;
  --chrome:#0A0A0A; --chrome-fg:#FFFFFF;`

const DARK_VARS = `
  --accent:#FF4D49;       /* brand red lifted for AA contrast on dark — same hue, +legibility */
  --accent-dark:#FF7A75;  /* eyebrows / links on dark */
  --on-accent:#FFFFFF;
  --bg:#0A0A0A; --page:#000000; --surface:#1C1C1E;
  --fg:#F5F5F5; --muted:#9A9AA0; --line:#2C2C2E;
  --chrome:#000000; --chrome-fg:#FFFFFF;`

const TYPE_VARS = `
  --font-head:"Poppins","Segoe UI",Tahoma,sans-serif;
  --font-body:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --font-mono:ui-monospace,SFMono-Regular,Menlo,monospace;
  --r-card:8px; --r-container:16px;`

export const BBL_TOKENS = `
:root{${LIGHT_VARS}${TYPE_VARS}}
@media (prefers-color-scheme: dark){:root{${DARK_VARS}}}
[data-theme="light"]{${LIGHT_VARS}}
[data-theme="dark"]{${DARK_VARS}}`

/** BBL heading treatment: Poppins extrabold uppercase italic. */
export const BBL_HEADING_CSS = `
.bbl-h{font-family:var(--font-head);font-weight:800;text-transform:uppercase;font-style:italic;letter-spacing:-.01em}`

/** The canonical "1-2-3" step chip — filled red disc, white number (email LoginStep). */
export const STEP_CHIP_CSS = `
.step{display:flex;align-items:flex-start;gap:12px;margin:8px 0}
.step-num{flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:var(--accent);color:var(--on-accent);font-family:var(--font-body);font-size:13px;font-weight:700;line-height:28px;text-align:center;display:grid;place-items:center}
.step-label{font-size:14px;line-height:1.6;color:var(--fg)}
.step-blurb{font-size:13px;line-height:1.5;color:var(--muted);margin:2px 0 0}`
