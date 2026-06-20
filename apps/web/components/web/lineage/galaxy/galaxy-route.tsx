"use client"

import dynamic from "next/dynamic"

// The galaxy viewer pulls in three.js / R3F / drei / gsap — heavy, browser-only deps.
// Load it client-side only (ssr:false) and lazily, so the bundle is fetched only on this
// route and never evaluated during SSR. ssr:false dynamic imports must live in a client
// component (Next 15), which is why this thin wrapper exists between the server page and
// the demo.
const BblLineageGalaxyDemo = dynamic(
  () =>
    import("~/components/web/lineage/galaxy/BblLineageGalaxyDemo").then(
      mod => mod.BblLineageGalaxyDemo,
    ),
  { ssr: false },
)

export function GalaxyRoute() {
  return <BblLineageGalaxyDemo />
}
