/**
 * WL-P2-23 (SESSION_0698) — the ancestry timeline's deep-links.
 *
 * The payload has always shipped a per-ancestor `slug` (ancestry.ts) the timeline
 * never consumed — Bob Bass, Rigan, the Gracies inert on the surface built to
 * celebrate them. These pin the deep-link contract: a non-owner ancestor WITH a
 * slug renders an `/directory/[slug]` link (drawer opens for everyone → claim CTA,
 * the claim-loop feeder); a slug-less placeholder and the profile owner do NOT
 * (no dead hrefs, no self-link).
 *
 * SSR render assertion via `renderToStaticMarkup` — the `lineage-node-card.policy`
 * idiom. This is a public SEO surface, so the chain must ship in the static markup.
 *
 * Run: cd apps/web && bun run test components/web/lineage/lineage-ancestry-timeline.test.tsx
 *
 * Author: Cody / SESSION_0698.
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { LineageAncestryTimeline } from "~/components/web/lineage/lineage-ancestry-timeline"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"

const makeEntry = (
  nodeId: string,
  displayName: string,
  slug: string | null,
): LineageAncestryEntry => ({
  nodeId,
  slug,
  displayName,
  avatarUrl: null,
  rank: null,
  disciplineLabel: null,
  narrative: null,
})

// Chain is [founder … member], the owner LAST by contract (assembleAncestryEntries).
const founder = makeEntry("founder", "Rigan Machado", "rigan-machado")
const placeholder = makeEntry("placeholder", "Bob Bass", null) // imported, no slug
const owner = makeEntry("owner", "Tony Hua", "tony-hua") // last entry = the profile owner

// Every `/directory/[slug]` anchor the render emits.
const directoryLinks = (html: string) =>
  html.match(/<a [^>]*href="\/directory\/[^"]*"[^>]*>/g) ?? []

describe("LineageAncestryTimeline — WL-P2-23 ancestor deep-links", () => {
  it("links a non-owner ancestor WITH a slug to /directory/[slug], wrapping the name", () => {
    const html = renderToStaticMarkup(
      <LineageAncestryTimeline entries={[founder, placeholder, owner]} />,
    )

    expect(html).toContain('href="/directory/rigan-machado"')

    // SSR-visibility pin (the component header's contract): the hidden entrance state
    // lives in whileInView keyframes, so the server must NEVER ship `opacity:0` inline.
    expect(html).not.toContain("opacity:0")

    // The link wraps the row content — the founder's name lives inside the anchor,
    // so a click on the name/avatar navigates (not just some empty affordance).
    const anchor = html.match(/<a [^>]*href="\/directory\/rigan-machado"[^>]*>([\s\S]*?)<\/a>/)
    expect(anchor?.[1]).toContain("Rigan Machado")
  })

  it("does NOT link a non-owner ancestor WITHOUT a slug — placeholders stay inert (no dead href)", () => {
    const html = renderToStaticMarkup(
      <LineageAncestryTimeline entries={[founder, placeholder, owner]} />,
    )

    // The placeholder renders (identity is never withheld) …
    expect(html).toContain("Bob Bass")
    // … and the ONLY directory link is the slugged founder's — the slug-less
    // placeholder and the owner both stay non-link.
    expect(directoryLinks(html)).toHaveLength(1)
  })

  it("does NOT self-link the profile owner even when the owner carries a slug", () => {
    const html = renderToStaticMarkup(
      <LineageAncestryTimeline entries={[founder, placeholder, owner]} />,
    )

    // The owner is the profile you're already on — no self-navigation.
    expect(html).not.toContain('href="/directory/tony-hua"')
    expect(html).toContain("Tony Hua")
  })
})
