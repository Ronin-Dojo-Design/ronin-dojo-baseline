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
 *  - icons: closest existing square assets. Purpose-built 192/512 (+maskable)
 *    BBL app icons are a known follow-up — do NOT treat these as final.
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
        src: "/images/brands/black-belt-legacy/favicon.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/brand/bbl/default-black-belt.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
