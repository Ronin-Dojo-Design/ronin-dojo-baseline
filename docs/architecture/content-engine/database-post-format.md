# Database Post Format for Content Atoms

Status: Proposed
Owner lane: Content Engine / AtomCenter
Primary brands: RONIN_DOJO_DESIGN, BASELINE_MARTIAL_ARTS, BBL, WEKAF

## Intent

Move public editorial publishing away from MDX-as-source-of-truth and onto the existing database-backed ContentAtom system.

The target model is:

```txt
ContentAtom = canonical reusable teaching / marketing truth
ContentVariant = database-backed post/variant for one brand and channel
ContentPublication = published artifact proof record
ContentTask = operational work item for review, media, publish, and QA
```

## Decision

Use `ContentAtom` as the upstream source of truth for reusable content ideas.

Use `ContentVariant` with `channel = BLOG` as the Dirstarter-compatible database post record for public blog/article pages.

Use `ContentPublication` as the proof ledger when a database post goes live.

MDX should be demoted to reference/static documentation only. It may remain for long-lived docs, changelog-style content, and imported reference material, but it should not be the canonical source for mutable brand posts, curriculum-derived articles, campaign content, or AtomCenter outputs.

## Why

The schema already contains the Ronin content engine nouns:

- `ContentAtom`
- `ContentVariant`
- `ContentTask`
- `ContentPublication`

That means the next move is not to invent a second post system. The next move is to treat `ContentVariant(channel=BLOG)` as the database-post surface that Dirstarter-style blog routes render.

## Canonical flow

```txt
AtomCenter / Obsidian note
  -> ContentAtom
  -> ContentVariant(channel=BLOG, brand=<target brand>)
  -> database post route
  -> ContentPublication proof
```

## Database post DTO

A database post shown on the public site should be shaped from `ContentVariant` plus its parent `ContentAtom`.

```ts
type DatabasePost = {
  id: string
  canonicalId: string
  atomId: string
  brand: Brand
  channel: "BLOG"
  status: "READY" | "PUBLISHED"
  title: string
  slug: string
  excerpt: string | null
  body: string
  cta: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  publishedAt: Date | null
  updatedAt: Date
  atom: {
    title: string
    hook: string | null
    promise: string | null
    proof: string | null
    teachingTruth: string | null
    curriculumExtract: unknown | null
    sourceAssets: string[]
    qualityScore: number | null
  }
}
```

## Field mapping

| Public post field | Source |
| --- | --- |
| title | `ContentVariant.publicTitle ?? ContentAtom.title` |
| slug | `ContentVariant.publicSlug` |
| excerpt | `ContentVariant.excerpt` |
| body | `ContentVariant.renderedCopy ?? ContentAtom.longFormCopy` |
| CTA | `ContentVariant.cta ?? ContentAtom.cta` |
| thumbnail | `ContentVariant.thumbnailUrl` |
| video | `ContentVariant.videoUrl` |
| brand | `ContentVariant.brand` |
| publish status | `ContentVariant.status` |
| canonical ID | `ContentAtom.canonicalId` |
| proof ledger | `ContentPublication` |

## Visibility rules

A database post is public only when all of these are true:

1. `ContentVariant.channel = BLOG`
1. `ContentVariant.brand` matches request brand
1. `ContentVariant.status = PUBLISHED`
1. `ContentVariant.publicSlug` is present
1. Parent `ContentAtom.status` is `APPROVED` or `PUBLISHED`

Draft, review, archived, or cross-brand variants must not render publicly.

## Routes

Preferred route shape:

```txt
/(web)/posts/page.tsx
/(web)/posts/[slug]/page.tsx
```

Optional brand vocabulary aliases can be added later:

```txt
/baseline/articles/[slug]
/black-belt-legacy/legacy/[slug]
/wekaf/news/[slug]
```

Aliases must resolve to the same `ContentVariant` database record rather than duplicate content.

## Required server slice

```txt
apps/web/server/web/content-posts/payloads.ts
apps/web/server/web/content-posts/queries.ts
apps/web/server/web/content-posts/schema.ts
apps/web/components/web/content-post-card.tsx
apps/web/components/web/content-post-renderer.tsx
apps/web/app/(web)/posts/page.tsx
apps/web/app/(web)/posts/[slug]/page.tsx
```

## Migration rules

1. Existing MDX posts should be imported into `ContentAtom` records.
1. Each imported MDX article gets at least one `ContentVariant(channel=BLOG)`.
1. Source file path should be preserved in `ContentAtom.sourceAssets` or `ContentAtom.meta.sourcePath`.
1. MDX body becomes `ContentAtom.longFormCopy` initially.
1. Brand-specific rendering/copy goes in `ContentVariant.renderedCopy`.
1. Public routes must read from database posts only after migration switch-over.
1. MDX routes should be redirected, archived, or marked reference-only once database parity is proven.

## Non-goals

- Do not delete MDX content before import proof exists.
- Do not expose ContentAtom draft/review fields publicly.
- Do not duplicate one article into four separate database posts unless the copy truly differs by brand.
- Do not make social captions the canonical source of truth.
- Do not use ContentPublication as the editable post body.

## First implementation slice

1. Add `content-posts` server query slice.
1. Add public post list/detail routes backed by `ContentVariant`.
1. Seed or migrate one known article from AtomCenter into `ContentAtom + ContentVariant`.
1. Add tests for brand scoping, status gating, and draft leakage prevention.
1. Keep legacy MDX available until parity is proven.

## Done when

- A public post page renders from `ContentVariant`, not MDX.
- Cross-brand post access returns not found.
- Draft/review/archived variants are hidden.
- Imported atom preserves source path/canonical ID.
- ContentPublication records are created for published artifacts.
- The docs/wiki say database posts are the public editorial path.
