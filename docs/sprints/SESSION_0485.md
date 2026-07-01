---
title: "SESSION 0485 — Blog vs posts surface consolidation + footer changelog link + first post (Dirty Dozen)"
slug: session-0485
type: session--implement
status: in-progress
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0485
sprint: S49
pairs_with:
  - docs/product/black-belt-legacy/posts/dirty-dozen-first-post.md
  - docs/knowledge/wiki/dirstarter-docs-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0485 — Blog/posts consolidation + footer changelog link + first post

> **PRE-STAGED (parallel-safe).** Disjoint from the flywheel/belt/CRM work (this touches `(web)/blog`,
> `(web)/posts`, `(web)/changelog`, the footer, and the `Post` / `ContentAtom`+`ContentVariant` content
> systems — **no overlap** with leads/belts/lineage). Safe to run alongside. **Reads the legacy monorepo**
> (`../ronin-dojo-monorepo`, READ-ONLY) for the BBLApp posts-parity origin — a **fresh local session** can do
> this (it has Graphify + the local DB + monorepo read access) and is preferred over cloud; cloud is fine if
> you want more direct monorepo access but loses Graphify + local DB.

## Date

2026-07-01 (pre-staged; executes when launched)

## Operator

Brian + claude-session-0485

## Goal

Resolve the two-sources-of-truth blog/posts split (pick BBL's canonical surface + a consolidation plan), add
the **changelog link to the footer**, and publish the **first blog post** ("The Dirty Dozen").

## Status

Single source of truth is the frontmatter `status:` field.

## Embedded discovery (the "why two" — read once)

There are **two DB-backed content systems**, both `Brand.BBL`, both under the `pages.blog` i18n namespace
(the confusing overlap):

| Surface | Route | Model / source | Shape |
| --- | --- | --- | --- |
| **Blog** (Dirstarter boilerplate) | `apps/web/app/(web)/blog/page.tsx` → `findPublishedPosts` | **`Post`** (`schema.prisma:4048`) | Simple: one row per post; status/publishedAt; the shared **listing taxonomy** — `categories`, `tags`, `tools`, polymorphic `Bookmark` (Save), `author`. Renders `components/web/posts/post-list`. Fully Dirstarter-integrated (SESSION_0396/0397). |
| **Posts** (BBLApp-parity / advanced) | `apps/web/app/(web)/posts/page.tsx` → `findPublishedContentPosts` | **`ContentAtom` + `ContentVariant`** (`server/web/content-posts/*`) | Elaborate headless-content model: an **atom** with multi-channel **variants** (`channel = BLOG`, approval workflow `status APPROVED/PUBLISHED`, `publicSlug`, tags on the atom). Renders `components/web/content-posts/*` + a `ContentTagFilter`. More capable, more complex. |

- **`/changelog` already exists** (`apps/web/app/(web)/changelog/page.tsx`) — the footer task is just to **link
  to it**, not build it. (Dirstarter's changelog is the reference pattern — `dirstarter.com/changelog` — for
  the DB-backed posts-style feed.)
- **Footer:** `apps/web/app/(web)/_components/bbl-footer.tsx` (`BblFooter`, wired in `(web)/layout.tsx:63`) —
  the changelog link goes here. (Generic `components/web/footer.tsx` also exists but BBL uses `BblFooter`.)
- **Known prior context:** the Dirstarter changelog-gaps audit (SESSION_0446, `[[dirstarter-changelog-gaps]]`)
  flagged the **blog Tiptap editor** as the real remaining gap. Confirm the admin authoring surface for
  whichever model wins.

## Petey plan

### Goal

One canonical BBL content surface (retire/absorb the other), the footer linking to `/changelog`, and the Dirty
Dozen live as the first post.

### Tasks

#### SESSION_0485_TASK_01 — Footer changelog link (independent, do first)

- **What:** add a "Changelog" link to `BblFooter` (`(web)/_components/bbl-footer.tsx`) pointing at the existing
  `/changelog` route. Match the footer's existing link style/section (legal/nav column).
- **Done means:** `/changelog` is reachable from the footer on every `(web)` page; `next build` green.
- **Depends on:** nothing. **Cheap, safe, ship it first.**

#### SESSION_0485_TASK_02 — Review + decide the canonical content surface (the core review)

- **What:** review both systems against the platform doctrine (Dirstarter-first, reuse-first, one-foundation)
  + the **BBLApp posts-parity origin in `../ronin-dojo-monorepo`** (why the `ContentAtom/ContentVariant` system
  was attempted — what it does that `Post` doesn't) + `dirstarter.com/changelog`. **Decide BBL's canonical blog
  surface** and a consolidation plan.
- **The fork (resolve, don't guess):**
  - **`Post`/`/blog`** — simpler, Dirstarter-native, already wired into the listing taxonomy + Save + author +
    the L1 patterns. WWAD-lean. If chosen → retire/redirect `/posts` + the `ContentAtom/ContentVariant` blog
    channel (or keep atoms for non-blog uses only).
  - **`ContentAtom/ContentVariant`/`/posts`** — more capable (multi-channel, approval workflow, atoms reused by
    media/other surfaces). If chosen → migrate `Post` content in + redirect `/blog`, and it becomes the CMS.
  - Consider: does anything ELSE depend on `ContentAtom` (e.g. `MediaAttachment.contentAtomId`)? Don't retire a
    system another surface needs. Check the full `ContentAtom`/`ContentVariant` consumer graph (Graphify).
- **Done means:** a ratified decision (which surface, what to retire/redirect/migrate) written into this
  SESSION + an ADR if it changes the content SoT; the loser's route 301s to the winner.
- **Depends on:** nothing (but gates TASK_03's target).

#### SESSION_0485_TASK_03 — Publish the first post: "The Dirty Dozen"

- **What:** publish the article in
  [`docs/product/black-belt-legacy/posts/dirty-dozen-first-post.md`](../product/black-belt-legacy/posts/dirty-dozen-first-post.md)
  as the first **published** post on the canonical surface (TASK_02's winner), `Brand.BBL`, publishDate
  **2026-05-30**, slug `the-dirty-dozen-pioneers-bjj`, authored by the BBL admin (Brian). Preserve the body
  verbatim (H2 subheads as given). Use the real authoring path (admin editor / a seed action) — not a raw SQL
  insert; confirm the Tiptap/editor path works (SESSION_0446 gap).
- **Done means:** the post renders live on the canonical blog surface + is the first/only published post; image
  optional (add a hero if easy).
- **Depends on:** TASK_02 (which surface).

### Parallelism

- TASK_01 (footer) is fully independent → do first. TASK_02 (review) gates TASK_03 (post target). Mostly a
  single coherent lane; no sub-agent fan-out needed unless the `ContentAtom` consumer audit is large.

### Open decisions

- **Which surface is BBL's canonical blog** (`Post`/`/blog` vs `ContentAtom+ContentVariant`/`/posts`) — the
  central call; resolve in TASK_02 with the monorepo origin + the consumer graph. Lean Dirstarter-`Post` unless
  the atom/variant system earns its complexity for BBL.
- **Changelog vs blog** — are they distinct surfaces (changelog = product updates, blog = articles) or should
  the changelog feed off the same model? The Dirty Dozen is an **article** → the blog, not the changelog.
- **Admin authoring** — confirm/repair the Tiptap editor for the winning model before declaring TASK_03 done.

### Risks

- **Don't retire a shared system:** `ContentAtom` may back non-blog surfaces (media, other channels) — audit
  before deprecating. Redirect the ROUTE, don't necessarily drop the MODEL.
- **Migration:** if consolidating, existing published content on the losing surface must migrate or 301 — no
  broken/duplicate public URLs (SEO). Both currently claim `pages.blog` — fix the namespace collision.
- **Reads `../ronin-dojo-monorepo`** (READ-ONLY harvest) — never commit there (FS-0024 guard).

## Cody pre-flight

<!-- cody-preflight.md before code. Prior art: (web)/blog + (web)/posts + (web)/changelog pages;
server/web/posts/queries.ts (Post) vs server/web/content-posts/queries.ts (ContentVariant); bbl-footer.tsx;
admin authoring surface + the Tiptap gap (SESSION_0446). Article: docs/product/black-belt-legacy/posts/dirty-dozen-first-post.md. -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0485_TASK_01 | done | Footer → "Changelog" link added to `BblFooter` Explore column → existing `/changelog` route |
| SESSION_0485_TASK_02 | done | Ratified `Post`/`/blog` as canonical blog; kept `ContentAtom` engine; retired `/posts` (301 → `/blog`) + deleted orphaned public reader. ADR 0042 |
| SESSION_0485_TASK_03 | done | "The Dirty Dozen" published as the first `Post` on `/blog` (2026-05-30, author Brian, renders live) |

## What landed

- **TASK_01 — Footer changelog link.** Added `{ label: "Changelog", href: "/changelog" }` to the
  `BblFooter` **Explore** column (the browse/content column, alongside Lineage). Reachable on every `(web)`
  page. Points at the existing feature-log `/changelog` ("What's New") route — no route built.
- **TASK_02 — Canonical blog decision (ADR 0042).** Reviewed both DB-backed surfaces against the
  Dirstarter-first doctrine + the `ContentAtom` origin in the legacy monorepo
  (`RoninDashboard/content-engine/CONTENT_ATOM_CANON.md` — a content-**repurposing engine**, "atoms are
  canonical, variants are derived," never a blog) + live DB state (Post = 0 rows; ContentVariant = 5
  published, **all YouTube**, zero BLOG-channel; 4 atoms). **Ratified: `Post`/`/blog` = canonical editorial
  blog; `ContentAtom`/`ContentVariant` retained as the internal content-ops engine (live for YouTube — not
  retired; `/app/content` admin stays).** Retired the empty public `/posts` BLOG reader: `301 → /blog`,
  deleted the route + orphaned public read/render code, repointed nav + landing CTA, resolved the
  `pages.blog` i18n namespace collision. Zero content on the losing route → clean redirect, no migration.
- **TASK_03 — First post published.** "The Dirty Dozen" (slug `the-dirty-dozen-pioneers-bjj`, `Brand.BBL`,
  `publishedAt 2026-05-30`, author Brian) seeded via `scripts/seed-dirty-dozen-post.ts` through the app's
  own extended Prisma client (same path as `upsertPost`; not raw SQL). The article doc is the single source
  of truth; the seed strips the duplicate H1 + date line (rendered from `title`/`publishedAt`) and preserves
  the prose verbatim (7 H2 subheads). Renders live on `/blog` and `/blog/the-dirty-dozen-pioneers-bjj`.

## Decisions resolved

- **Surface fork → `Post`/`/blog`.** The atom/variant system did **not** earn its complexity *as a blog*
  (it earns it as a content-ops/repurposing engine, which it already serves). Not competing tools —
  different tools. See ADR 0042.
- **`/posts` disposition → 301-retire now** (operator-ratified: full consolidation). The prestage leaned
  this way ("loser 301s to winner"); I surfaced the new nuance (the landing markets `/posts` as a future
  "BBL Posts Feed" member community feed; operator had kept both "to compare") and the operator confirmed
  consolidation.
- **Authoring path.** No Tiptap anywhere in the repo (SESSION_0446 "gap" was mis-stated for this repo); the
  real `Post` editor is the markdown `content` textarea in `app/app/posts/_components/post-form.tsx`. The
  seed uses the identical create path. Editor/read path confirmed working via live render.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/_components/bbl-footer.tsx` | + Changelog link in the Explore column (TASK_01) |
| `apps/web/next.config.ts` | + permanent `301` redirects `/posts` and `/posts/:slug*` → `/blog` |
| `apps/web/components/web/nav/nav-sheet.tsx` | Primary nav `/posts` (key `posts`) → `/blog` (key `blog`) |
| `apps/web/app/(web)/(home)/bbl/bbl-landing-content.ts` | `BBL_ROUTES.posts` → `/blog`; CTA label "Browse Posts" → "Read the Blog"; header comment |
| `apps/web/app/(web)/posts/**` | **Deleted** — public `/posts` route retired |
| `apps/web/server/web/content-posts/**` | **Deleted** — orphaned public read path (queries/payloads/test) |
| `apps/web/components/web/content-posts/**` | **Deleted** — orphaned public render components |
| `apps/web/scripts/seed-dirty-dozen-post.ts` | **New** — repeatable, idempotent first-post seed (reads the article doc) |
| `docs/architecture/decisions/0042-canonical-blog-surface-post-over-contentatom.md` | **New** — ADR 0042 |

_Kept (not touched): `ContentAtom`/`ContentVariant` models, `server/admin/content/*`, `/app/content` admin
— the content-ops engine (live for YouTube/social)._

## Verification

| Command / smoke | Result |
| --- | --- |
| Seed → DB | `Post` created: slug `the-dirty-dozen-pioneers-bjj`, status `Published`, `publishedAt 2026-05-30`, author Brian Scott, content 6184 chars, 7 H2s, no leaked H1/date |
| `GET /blog` (dev :3006) | `200` — lists the post, author "Brian Scott" |
| `GET /blog/the-dirty-dozen-pioneers-bjj` | `200` — full article, title + "Bob Bass" + 8 `<h2>` (7 subheads + author) |
| `grep web/content-posts` (post-delete) | 0 remaining references (cleanly orphaned before delete) |
| `bun run build` | **exit 0** — compiled + TypeScript clean + 182 static pages. Route table: `/blog` + `/blog/[slug]` present, public `/posts` gone, `/app/posts/*` admin kept |
| `GET /posts` + `/posts/anything-old` (prod `next start`) | **308** permanent redirect → `/blog` (both) |
| `GET /blog/the-dirty-dozen-pioneers-bjj` (prod) | `200` — full render; screenshot captured |
| Footer changelog link (prod `/blog`) | `href="/changelog"` present |

_Note: Next emits **308** (Permanent Redirect) for `permanent: true` — the modern equivalent of a 301
(method-preserving, SEO-equivalent)._

## Open decisions / blockers

- **⚠ BLOCKER — the post is seeded to LOCAL prodsnap only, not prod.** `Post` is DB data, not code. The
  push deploys the *surface* (footer link, `/posts`→`/blog` redirect, consolidation) — but **prod `/blog`
  will render empty** until the seed runs against the prod (Neon) DB. Two ways to make the Dirty Dozen live
  on `blackbeltlegacy.com`: (a) run `scripts/seed-dirty-dozen-post.ts` against prod via the gitignored
  `.env.prod` overlay (`bun --env-file` — see [[env-prod-overlay-and-prodsnap]]; **prod write → needs
  explicit operator authorization**), or (b) author it in the prod `/app/posts/new` admin editor (paste the
  doc body). Recommend (a) — idempotent, already verified. **This is separate from the code push.**
- **Landing copy follow-up (operator, non-blocking).** The "BBL Posts Feed" promo still describes a
  *member community feed* ("members share techniques, tips, seminars, Q&A") while its CTA now points at the
  editorial `/blog`. Either re-copy the promo to describe the blog, or build the member feed later and
  repoint. Not rewritten unilaterally (marketing copy is the operator's). Logged in ADR 0042 §Consequences.
- Minor: the now-unused `navigation.posts` i18n key and the generic (non-BBL) `footer.tsx` `has("posts")`
  gate were left in place (harmless; BBL renders `BblFooter`/`nav-sheet`, not those).

## Next session

### Goal

1. **First** — make the Dirty Dozen live on prod (run the seed against the prod DB; see the ⚠ blocker) +
   confirm `blackbeltlegacy.com/blog` renders it and `/posts` 301s. 2. Operator's landing-copy call on the
   "BBL Posts Feed" promo (re-copy for the editorial blog **or** greenlight the member community feed as a
   distinct surface) + optional hero/OG image for the post. 3. Then rejoin the operator's board top —
   **FI-001 / G-001 (Brian Truelson first-tester onboarding, P0)** is the prioritized next lane.

## Phase 2 — Images + render parity + cross-agent review (operator follow-up)

Operator asked: images in the article; see how Dirstarter does it; Desi design review + Dirstarter surfaces to
repurpose; `/fallow-fix-loop`; WWAD / would-FB-YouTube-ship-it; Doug verification; Giddy hard scrutiny; and
"what admin posts add-surfaces do we have/need?" Dispatched **Desi + Giddy + Doug** as parallel read-only
sub-agents; all three converged.

### The load-bearing finding (Desi P0 + Giddy R1) — render parity

BBL's `app/(web)/blog/[slug]/page.tsx` rendered content through **raw `react-markdown`** (no components),
while the app's own styled `~/components/web/markdown` wrapper was a **stripped fork** of the Dirstarter
template (dropped `remark-gfm`, heading-id injection, `extractHeadingsFromMarkdown`, real TOC) and was used
**only in the admin preview** — so authors previewed one renderer and readers saw a worse one, and GFM
(tables/strikethrough) silently rendered as literal text. **Fixed:** re-aligned `markdown.tsx` to the template
baseline (restored `remark-gfm` + slug-anchored heading ids + `extractHeadingsFromMarkdown`, composed with
BBL's `MDXComponents`), repointed `[slug]` at the wrapper (`<Markdown code={…} />`, dropped the redundant
`<Prose>`), fed the sidebar TOC from headings (kept tools as a secondary block), and set the hero to
`priority` + `sizes` for LCP.

### Images (the ask)

Hero via `Post.imageUrl` (`next/image`, auto webp/avif) + inline `![alt](…)` images rendered by the wrapper.
Used **local BBL brand assets** (no R2 upload): hero + a photo per pioneer (Rigan, Bob Bass, Haueter, Williams,
Meyer, Will), authored into the article doc (SoT) and re-seeded. Fixed `MDXComponents.img` to drop the
hard-coded `1280×720` (portraits were squashed) and to `mx-auto max-w-full` so low-res source photos render
crisp at natural size instead of upscaling to a blur.

### Operator corrections (in-session)

- **MDX→DB:** confirmed DB-based (`Post.content` markdown, server-rendered — not MDX files), per
  `database-post-format.md` (SESSION_0211). That doc proposed `ContentVariant` as the blog model; **ADR 0042
  chose `Post`** → added a **superseded banner** to the doc so a future session doesn't follow the stale proposal.
- **webp:** `next/image` already serves the hero as webp/avif; the upload cropper does canvas work but outputs
  **jpeg** (`cropper.tsx:39`, one-line flip to webp = deferred uploads win); inline raw-`<img>` jpgs are small
  (7–122KB), modest webp upside → flagged, not done.
- **Hero crop:** `bob-and-rigan.jpg` was **239×330** (tiny portrait) → 16:9 `object-cover` cropped their heads.
  Swapped to **`coral-belt-celebration.jpg` (1920×968 landscape)** — no crop, high-res, thematically the
  lineage's masters together.

### Doug's missed-ref (P2) + fallow

- **`components/common/search.tsx:136`** — the app-wide Cmd+K command palette still linked `/posts` (my
  hostile-close pass missed it; the 308 caught it but it's an incomplete consolidation). **Repointed → `/blog`
  / `navigation.blog`.**
- **`fallow audit`:** clean for this diff — no new complexity/dup/dead-code. (Flagged items are pre-existing:
  `search.tsx`/`nav-sheet.tsx` large components I barely touched; the page-data boilerplate dup shared across
  `advertise`/`programs`/`submit`/`blog`; the seed script's "unreachable file" is the standard false-positive
  for standalone `scripts/*.ts`.)

### "Admin posts add-surfaces we have / need" (the operator's question)

- **Have:** `/app/posts` (list) · `/app/posts/new` · `/app/posts/[id]` (title, auto-slug, description,
  **markdown `content` with live Preview**, `imageUrl` as a URL field, status Draft/Scheduled/Published,
  tools). Separate `/app/media` R2 uploader (`media-uploader.tsx` → `uploadMediaToLibrary`). Scheduling works.
- **Need (deferred, ranked — see below):** a **media picker/upload in the post editor** (today `imageUrl` is
  paste-a-URL; `/app/media` isn't wired in); **categories/tags** in the form + read payload (schema has them,
  neither authors nor renders them today — Giddy R3); routing `Post` images through the **`MediaAttachment`/R2
  pipeline** (alt text, dimensions/CLS, reuse — Giddy R2, 1 migration). Markdown-textarea editor is a
  **defensible WWAD-lean choice** for a low-volume editorial blog (no rich-WYSIWYG needed; SESSION_0446
  "Tiptap gap" was mis-stated for this repo).

### Deferred (with recommendations — NOT in this diff)

| Item | Source | Why deferred |
| --- | --- | --- |
| `MediaAttachment.postId` + `attachableEntityType` `post` + media picker in post-form | Giddy R2 (Slice B) | 1 migration — **schema-merge risk with the parallel belt lane**; separable |
| Wire (or delete) `Post.categories`/`tags` in form + `postOnePayload` | Giddy R3 | operator decision (wire vs drop); no post needs it yet |
| End-of-article claim CTA (reuse `lineage/join`) | Desi P1 | high-value funnel add; own slice |
| Uploads → webp (`cropper.tsx` → `image/webp`) | operator/webp | one-line, but an uploads concern, not this article |
| Related posts / author-bio card / share button | Desi P2 | YAGNI at N=1 |
| Landing "BBL Posts Feed" promo copy | ADR 0042 | operator marketing call |
| Higher-res `david-meyer` / `john-will` photos (157×200) | this session | content sourcing |

## Review log

- Self-review (Cody-style) + a hostile close pass (below). Gates: `bun run build` exit 0, oxlint/oxfmt clean,
  touched tests 6/6 pass, wiki:lint 0 err. Live-render + prod-`next start` redirect verification + screenshot.

## Hostile close review

| Adversarial question | Verdict |
| --- | --- |
| Did retiring `/posts` break a live URL / SEO? | **No.** DB proof: 0 published `BLOG`-channel variants → `/posts` was empty. `301 → /blog`, `/posts/:slug*` covered, `/posts` dropped from the sitemap. No live URL lost. |
| Did I retire a system another surface needs? | **No.** `ContentAtom`/`ContentVariant` model + `/app/content` admin + the 4 atoms / 5 live YouTube variants are untouched. Only the public reader (imported **solely** by the 2 deleted `/posts` route files) was removed — 0 remaining importers. |
| Is the post correct + singular? | **Yes.** Exactly 1 `Post` at the canonical slug, `Published`, `2026-05-30`, author Brian, verbatim prose (7 H2s, no leaked H1/date). The early slug-clobber (extension re-slugged from title on update) was caught + fixed; no duplicate. |
| Prod-deploy safety? | **Surface safe; data gap flagged.** Code deploys cleanly; the *post row* is local-only → ⚠ blocker above. Not a silent gap. |
| Concurrency (parallel belt lane)? | **Disjoint.** Nothing in `server/belt`, `components/web/belt`, onboarding, or lineage. Worktree-isolated. |

## ADR / ubiquitous-language check

- **ADR 0042** written (`Post`/`/blog` = canonical editorial blog; `ContentAtom` = content-ops engine;
  `/posts` retired). Added to the wiki-index ADR table. Supersedes the SESSION_0416 "keep both to compare"
  holding pattern.
- **Ubiquitous language sharpened:** "blog" (editorial articles, `Post`) is now distinct from the
  content-ops "**engine**" (`ContentAtom` → channel **variants**) and from the aspirational "member community
  feed" (unbuilt). These were conflated under one `pages.blog` namespace; now separated.

## Reflections

- **The prestage's "301 the loser" was directionally right but under-scoped the fork.** Reading the actual
  surfaces revealed the landing markets `/posts` as a *member community feed* — a third concept. Surfacing
  that to the operator (rather than blind-executing the 301) was the right call; they still chose
  consolidation, but now with eyes open + a copy follow-up logged.
- **Data vs code is the trap.** The whole lane felt "done" at green build + live local render — but a Post is
  DB data. The push ships the surface; the *post* needs a prod seed. Hostile review caught it; a lean close
  would have shipped an empty prod blog.
- **Two seed gotchas worth remembering:** the `uniqueSlugsExtension` re-slugs from `title` on update unless
  `slug` is passed (clobbered my canonical slug once); and `import.meta.dir` is Bun-only → fails Next's tsc
  (use `fileURLToPath(new URL(…, import.meta.url))` in scripts the build type-checks).

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | PASS — 3 tasks, all done |
| `bun run build` | **exit 0** — compiled, TypeScript clean, 182 static pages (run twice; final after all edits) |
| oxlint / oxfmt --check | clean (5 changed files) |
| Touched tests (`--parallel=1`) | 6 pass / 0 fail (`config/seo.test.ts`, `server/web/posts/queries.test.ts`) |
| wiki:lint | 0 err / 16 warn (all pre-existing; none in touched docs) |
| Fallow delta | 0 introduced findings |
| Graphify | nodes=12060 · edges=26198 |
| Git | branch `session-0485-blog` · committed `34b0bf7f` · **held at push gate** |
| Diff | 27 files · +305 / −1251 (net −946; mostly the content-posts deletion) |
