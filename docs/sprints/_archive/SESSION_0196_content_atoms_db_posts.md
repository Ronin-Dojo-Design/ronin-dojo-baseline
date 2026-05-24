# SESSION_0196 — Content Atom Database Posts Migration

Status: plan-ready
Branch: `session-content-atoms-db-posts`
Lane: Content Engine / AtomCenter / Database Posts

## Bow-in intent

Consolidate AtomCenter content into the database-backed post system and demote MDX from public editorial truth.

The goal is not to delete MDX immediately. The goal is to make `ContentAtom -> ContentVariant(channel=BLOG) -> ContentPublication` the public post pipeline, then migrate legacy MDX only after parity proof exists.

## Current truth

The schema already includes a Ronin content engine:

- `ContentAtom`
- `ContentVariant`
- `ContentTask`
- `ContentPublication`

The same schema still carries Dirstarter template blog/post remnants:

- `PostStatus`
- `Post`
- `User.posts`
- `Tool.posts`

The platform should now promote ContentAtom/ContentVariant into the Dirstarter-style database post path instead of building a second content model.

## Canonical migration contract

```txt
AtomCenter / Obsidian note
  -> ContentAtom
  -> ContentVariant(channel=BLOG, brand=<target brand>)
  -> public database post route
  -> ContentPublication proof record
```

## Deliverables

### Deliverable 1 — Architecture contract

Created:

```txt
docs/architecture/content-engine/database-post-format.md
```

This doc defines:

- database post DTO
- field mapping
- public visibility rules
- route plan
- migration rules
- non-goals
- done criteria

### Deliverable 2 — Server query slice

Create:

```txt
apps/web/server/web/content-posts/payloads.ts
apps/web/server/web/content-posts/queries.ts
apps/web/server/web/content-posts/schema.ts
```

Responsibilities:

- read only `ContentVariant(channel=BLOG)` records
- join parent `ContentAtom`
- require request brand match
- require variant status `PUBLISHED`
- require parent atom status `APPROVED` or `PUBLISHED`
- never expose tasks, unpublished source fields, or unrelated brand variants

### Deliverable 3 — Public routes

Create:

```txt
apps/web/app/(web)/posts/page.tsx
apps/web/app/(web)/posts/[slug]/page.tsx
```

Route rules:

- list page shows published variants for active request brand
- detail page resolves by `publicSlug`
- cross-brand or draft content returns not found
- metadata should come from publicTitle/excerpt/thumbnail

### Deliverable 4 — Renderer components

Create:

```txt
apps/web/components/web/content-post-card.tsx
apps/web/components/web/content-post-renderer.tsx
```

Renderer rules:

- render safe markdown from `ContentVariant.renderedCopy` or `ContentAtom.longFormCopy`
- do not render internal meta/task/source fields by default
- support image/video lead media from variant fields
- include canonical ID only in admin/debug contexts, not public UI by default

### Deliverable 5 — Seed/migration sample

Create one sample AtomCenter article as database content:

```txt
ContentAtom.canonicalId = atom-2026-why-the-bell-matters
ContentVariant.channel = BLOG
ContentVariant.brand = BASELINE_MARTIAL_ARTS
ContentVariant.publicSlug = why-the-bell-matters
```

Use existing article content from the Baseline/Tuff Buffs SEO article pack as the first proof atom.

### Deliverable 6 — Tests

Add tests for:

```txt
- published blog variant renders for matching brand
- draft/review/archived variants do not render
- parent atom INBOX/DRAFT/REVIEW does not render
- cross-brand variant does not render
- query result excludes ContentTask data
- query result excludes unpublished sibling variants
- missing publicSlug does not render
- publication proof can be looked up by atom/variant after publish
```

Suggested test files:

```txt
apps/web/server/web/content-posts/queries.test.ts
apps/web/server/web/content-posts/visibility.test.ts
```

## MDX policy

MDX remains allowed for:

- static docs
- legal/static pages
- historical references
- imported material awaiting migration
- long-lived docs not meant to be editorial posts

MDX should not remain the canonical source for:

- brand blog posts
- campaign articles
- curriculum-derived articles
- AtomCenter outputs
- reusable social/blog/video publication families

## Migration staging

### Stage 1 — Parallel read

Add database post routes while leaving MDX routes alone.

### Stage 2 — Single proof atom

Seed/import `why-the-bell-matters` as a ContentAtom + BLOG ContentVariant.

### Stage 3 — Parity checks

Compare MDX page content against database post output.

### Stage 4 — Route switch

Make public post navigation point to database posts.

### Stage 5 — Archive/deprecate MDX

After at least one brand has parity, move old MDX into reference/archive or preserve it as source snapshots.

## Acceptance criteria

- Public posts render from `ContentVariant`, not MDX.
- Brand scoping is enforced in query layer.
- Draft and review variants are invisible publicly.
- Parent atom status gates publication.
- Source path/canonical ID is preserved.
- Publication proof records are supported.
- Docs/wiki reflect database posts as the public editorial path.

## Risks

| Risk | Mitigation |
|---|---|
| Accidentally exposing draft atom data | Public DTO allowlist only |
| Breaking existing MDX routes | Parallel routes first |
| Duplicating content truth | ContentVariant is public post body; ContentAtom is canonical teaching/source truth |
| Cross-brand leakage | Request-brand scoped queries + tests |
| Too much schema churn | Use existing schema before adding new models |

## Next build PR

Suggested PR title:

```txt
feat(content): render public posts from content variants
```

Suggested local verification:

```bash
cd apps/web
bun test server/web/content-posts
bun run typecheck
bun run lint
```

## Bow-out note

This session should not merge a full runtime migration without tests. The right next step is a narrow code PR that proves one database post from one atom for one brand, then expands.
