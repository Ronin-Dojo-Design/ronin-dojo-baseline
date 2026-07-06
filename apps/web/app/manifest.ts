import type { MetadataRoute } from "next"

/**
 * BBL installable-PWA manifest (served at /manifest.webmanifest).
 *
 * Static by design — the manifest is fetched by the browser outside the app
 * session, so it can't consume DB-driven BrandSettings. Values are the static
 * BBL brand constants:
 *  - name/description: config/site.ts `bblConfig`.
 *  - theme/background: the BBL always-dark chrome — app/styles.css
 *    `[data-brand="BBL"] --color-chrome: hsl(0 0% 4%)` = #0a0a0a (the red
 *    #E52421 is the CTA accent, not the shell color).
 *  - icons: purpose-built BBL app icons derived from the official logo lockup
 *    (`images/brands/black-belt-legacy/logo.png`) centered on a soft-white
 *    tile. SVG sources are `pwa-icon.svg` (any) / `pwa-icon-maskable.svg`
 *    (maskable — logo held inside the ~80% safe zone); rasterized to
 *    `icon-192.png` / `icon-512.png` (any) + `icon-maskable-512.png`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Black Belt Legacy",
    short_name: "BBL",
    description:
      "Preserving martial arts heritage through lineage tracking, curriculum, and certifications.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/images/brands/black-belt-legacy/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/brands/black-belt-legacy/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/brands/black-belt-legacy/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
