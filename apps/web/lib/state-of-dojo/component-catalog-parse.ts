/**
 * component-catalog-parse.ts — pure parsing/classification for the State-of-Dojo Component + Card
 * catalog panels (SESSION_0606, G-023 WS-B).
 *
 * SELF-CONTAINED, mirroring `./parse.ts` (which this module reuses `frontmatterField` from — ONE
 * flat-scalar-frontmatter reader, no duplication): no `fs`, no network, no `server-only`, no React
 * — the caller supplies raw file contents, so the same core runs under Bun (tests) and in a React
 * Server Component (GitHub-raw fetch via `./fetch-catalog.ts`).
 *
 * Source = the PWCC spec files (`docs/knowledge/wiki/files/*.md` frontmatter: `status` / `lifecycle`
 * / `wiring` + the thin new `brands:` field) — NOT the 450 KB prose component inventory. Cards are a
 * FACET of this SAME source (ADR 0040): `kind` classifies a row as `"card"` when its `tags:` name a
 * card pattern, so `card-catalog-panel.tsx` filters the SAME rows rather than reading a 2nd source.
 */
import { frontmatterField, type Phase, type ProductLane } from "./parse"

export type CatalogKind = "component" | "card"

export type CatalogRow = {
  /** Frontmatter `slug:` (falls back to the filename stem when absent). */
  slug: string
  title: string
  /** Raw frontmatter `status:` (nearly every spec today reads "active" — kept for an honest raw
   * display; `lifecycle` — not `status` — drives the belt-ladder `phase` below). */
  status: string
  /** Raw frontmatter `lifecycle:` when present (PLANNED | WIP | MVP_LIVE | STABLE | DEPRECATED). */
  lifecycle?: string
  phase: Phase
  /** `lifecycle: DEPRECATED` rows still bucket to the `done` phase (off the active ladder) — this
   * flag lets a consumer render the raw "DEPRECATED" status pill distinctly without the kernel's
   * goal-specific `dropped` badge wording (see `card-catalog-panel.tsx`/`component-catalog-panel.tsx`). */
  deprecated: boolean
  /** Raw frontmatter `pwcc:` id(s) when present (e.g. "PWCC-002", or "PWCC-004,PWCC-005"). */
  pwcc?: string
  /** The thin new `brands:` frontmatter (comma/slash-separated `ProductLane` tokens) — which brand
   * tab(s) the component/card belongs under. Defaults to `["rdd"]` (the umbrella tab) when the
   * field is absent, matching `classifySessionProduct`'s no-lane default in `./parse.ts`. */
  brands: ProductLane[]
  /** Count of `wiring:` entries the spec lists — a thin "how wired-in" signal, not the full map. */
  wiringCount: number
  kind: CatalogKind
  /** DBS bug-scan cross-refs (`daily-bug-scan-ledger.md`, SESSION_0596). Stubbed `[]` — SESSION_0596
   * is still `staged` (not landed) as of this lane; wire the real cross-ref once it lands. */
  bugs: string[]
  path: string
}

// --- frontmatter list reader ----------------------------------------------------------------

/** Read a frontmatter list field in either YAML shape this catalog's specs use: inline brackets
 * (`tags: [a, b, c]`) or a block list (`wiring:\n\n  - "a"\n  - "b"`, blank separator line and
 * all — several real specs insert one). Intentionally tiny (mirrors `frontmatterField`'s scope):
 * only the two shapes this doc set uses, no full YAML. Missing key or missing value → `[]`. */
export function frontmatterListField(content: string, key: string): string[] {
  const block = content.match(/^---\n([\s\S]*?)\n---/)
  if (!block) return []
  const lines = block[1].split("\n")
  const keyRe = new RegExp(`^${key}\\s*:`)
  const idx = lines.findIndex(l => keyRe.test(l))
  if (idx === -1) return []

  const inline = lines[idx].match(new RegExp(`^${key}\\s*:\\s*\\[(.*)\\]\\s*$`))
  if (inline) {
    return inline[1]
      .split(",")
      .map(s => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
  }

  const out: string[] = []
  for (let i = idx + 1; i < lines.length; i++) {
    const item = lines[i].match(/^\s*-\s+(.+)$/)
    if (item) {
      out.push(item[1].trim().replace(/^["']|["']$/g, ""))
      continue
    }
    if (lines[i].trim() === "") continue // tolerate the blank separator line some specs insert
    break // next key (or end of block) — stop
  }
  return out
}

// --- lifecycle -> phase (5-belt) -------------------------------------------------------------

/** PLANNED/WIP/MVP_LIVE/STABLE/DEPRECATED map onto the SAME 5-belt ladder sessions/goals use
 * (`./parse.ts`'s `Phase`): PLANNED=white(planned), WIP=blue(in-flight), MVP_LIVE=brown(held —
 * shipped-but-live, the ready-to-ship belt), STABLE=black(done). DEPRECATED has no forward-ladder
 * position — it buckets to `done` (nothing left to build) with `deprecated: true` so the caller can
 * render the raw status distinctly (see `CatalogRow.deprecated`). Missing/unrecognized → `planned`
 * (defensive default, mirrors `bucketSessionPhase`). */
export function bucketComponentPhase(lifecycle: string | undefined): Phase {
  const v = (lifecycle ?? "").trim().toUpperCase()
  if (v === "STABLE") return "done"
  if (v === "DEPRECATED") return "done"
  if (v === "MVP_LIVE") return "held"
  if (v === "WIP") return "in-flight"
  return "planned" // PLANNED | missing | unrecognized
}

// --- brands -----------------------------------------------------------------------------------

const VALID_BRANDS: readonly ProductLane[] = ["rdd", "bbl", "mmb"] as const

/** Parse the thin `brands:` frontmatter (comma/slash-separated tokens, e.g. "rdd, bbl") into
 * `ProductLane[]`. Unrecognized tokens are dropped; an absent/empty field (nearly every spec today
 * — the field is new) defaults to `["rdd"]`, the umbrella tab (matches `classifySessionProduct`). */
export function parseBrands(raw: string | undefined): ProductLane[] {
  if (!raw) return ["rdd"]
  const tokens = raw
    .split(/[,/]/)
    .map(t => t.trim().toLowerCase())
    .filter((t): t is ProductLane => (VALID_BRANDS as readonly string[]).includes(t))
  return tokens.length ? tokens : ["rdd"]
}

// --- kind (component vs card facet) ------------------------------------------------------------

/** A spec is the "card" facet when its `tags:` name a card pattern (`card`, `m-card`, `card-grid`,
 * …) — a keyword heuristic (no formal `kind:` frontmatter field exists yet), matching the same
 * best-effort-bridge posture `classifyGoalProduct` documents for goals' free-text `Lane:` bullet. */
export function classifyCatalogKind(tags: string[]): CatalogKind {
  return tags.some(t => /card/i.test(t)) ? "card" : "component"
}

// --- spec file parsing ---------------------------------------------------------------------------

const SKIP_FILENAMES = new Set(["README.md"])

/** Parse one `docs/knowledge/wiki/files/*.md` spec into a `CatalogRow`. Returns `null` for the
 * catalog index/template files so callers can filter a directory listing without a separate glob
 * (mirrors `parseSessionFile`'s null-for-non-session-filename contract). */
export function parseComponentSpecFile(path: string, content: string): CatalogRow | null {
  const name = path.split("/").pop() ?? ""
  if (
    !name.endsWith(".md") ||
    SKIP_FILENAMES.has(name) ||
    name.startsWith("_") ||
    name.startsWith("SPEC_")
  ) {
    return null
  }

  const slug = frontmatterField(content, "slug") ?? name.replace(/\.md$/, "")
  const title = frontmatterField(content, "title") ?? slug
  const status = frontmatterField(content, "status") ?? "unknown"
  const lifecycle = frontmatterField(content, "lifecycle")
  const deprecated = (lifecycle ?? "").trim().toUpperCase() === "DEPRECATED"
  const pwcc = frontmatterField(content, "pwcc")
  const tags = frontmatterListField(content, "tags")

  return {
    slug,
    title,
    status,
    lifecycle,
    phase: bucketComponentPhase(lifecycle),
    deprecated,
    pwcc,
    brands: parseBrands(frontmatterField(content, "brands")),
    wiringCount: frontmatterListField(content, "wiring").length,
    kind: classifyCatalogKind(tags),
    bugs: [], // stub — DBS ledger cross-ref (SESSION_0596) not yet landed; see the field doc above
    path,
  }
}
