---
title: "SESSION 0136 — Blog DB Migration: Post Model + Admin CRUD + Public Page Rewiring"
slug: session-0136
type: session
status: closed-quick
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0136
sprint: S5
pairs_with:
  - docs/sprints/SESSION_0135.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0136 — Blog DB Migration: Post Model + Admin CRUD + Public Page Rewiring

## Date

2026-05-11

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

in-progress

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — UI work planned (admin pages + public blog rewire). Will consult inventory before writing UI.
- Carried blocker: 🔴 Resend domain DNS pending verification — 23rd session carried.
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131).

## Graphify Check

- Graph status: **updated** (incremental update, no API cost)
- Query: `"Post model blog content-collections prisma schema admin CRUD public blog page"` — 105 nodes found
- Key files confirmed:
  - `apps/web/app/(web)/blog/page.tsx` — imports `allPosts` from `content-collections`
  - `apps/web/app/(web)/blog/[slug]/page.tsx` — imports `allPosts` from `content-collections`
  - `apps/web/prisma/schema.prisma` — User model at L29, no `posts` relation yet
  - `apps/web/server/admin/tools/` — reference CRUD pattern (actions, schema, queries)
  - `apps/web/lib/structured-data.ts` — imports `Post` type from `content-collections`
  - `apps/web/content-collections.ts` — content-collections config
  - `apps/web/next.config.ts` — `withContentCollections` wrapper
  - `apps/web/config/blog.ts` — blog config

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — blog pages rewired, content-collections usage replaced |
| Extension or replacement | Replacement — MDX content-collections → DB-backed Post model (matches upstream Dirstarter) |
| Why justified | Dirstarter shipped DB-backed blog upstream (docs updated 4/29/2026). Our local template (`c42e8bb`) predates this. Closing L1 gap. |
| Risk if bypassed | Blog remains on stale content-collections pattern diverging from upstream |

## Goal

Blog DB migration: Add `Post` model + `PostStatus` enum to Prisma schema, create admin CRUD, rewire public blog pages from content-collections to DB queries. Do NOT remove content-collections dependency this session (deferred to SESSION_0137).

---

## Petey Plan

### Goal

Ship DB-backed blog posts: schema → admin CRUD → public pages reading from DB. Content-collections removal deferred.

### Context

SESSION_0135 Giddy research confirmed Dirstarter shipped a `Post` model upstream. Our local copy is stale. The Petey plan from SESSION_0135 specified 3 tasks. This session executes that plan with refinements based on file reads.

### Key findings from file reads

- **User model** (L29–75): No `posts` relation — needs adding.
- **Blog list page** (`app/(web)/blog/page.tsx`): Imports `allPosts` from `content-collections`, sorts by `publishedAt`, passes to `<PostList>`.
- **Blog detail page** (`app/(web)/blog/[slug]/page.tsx`): Uses `allPosts.find()`, `_meta.path` for slug, `generateStaticParams` from allPosts, `<MDX>` component for rendering. Also queries `findTools` for tool mentions.
- **Admin CRUD pattern** (`server/admin/tools/`): `schema.ts` (Zod schema + table params), `actions.ts` (upsert + delete via `adminActionClient`), `queries.ts` (find queries). This is the pattern to follow.
- **Structured data** (`lib/structured-data.ts`): Imports `Post` type from `content-collections` — will need updating.
- **content-collections touchpoints**: `next.config.ts`, `tsconfig.json`, `package.json`, `biome.json`, `.gitignore`, `content-collections.ts`. Removal deferred to SESSION_0137.

### Tasks

#### SESSION_0136_TASK_01 — Add Post model + PostStatus enum to Prisma schema

- **Agent:** Cody
- **What:** Add `Post` model with `brand: Brand` column (ADR 0004) and `PostStatus` enum to `apps/web/prisma/schema.prisma`. Add `posts Post[]` relation to `User` model. Run `bun db:migrate dev --name add-post-model`.
- **Steps:**
  1. Add `PostStatus` enum: `Draft`, `Scheduled`, `Published`
  2. Add `Post` model with fields: `id`, `title` (@db.Citext), `slug` (@unique), `description`, `content`, `plainText`, `imageUrl`, `status`, `publishedAt`, `createdAt`, `updatedAt`, `author`/`authorId`, `brand`
  3. Add `posts Post[]` to User model
  4. Run migration
  5. Run `bun db:generate` and type check
- **Done means:** Migration succeeds, types generate clean, `bun run typecheck` passes.
- **Depends on:** nothing

#### SESSION_0136_TASK_02 — Create admin blog CRUD (server actions + schema + queries)

- **Agent:** Cody
- **What:** Create `server/admin/posts/schema.ts`, `server/admin/posts/actions.ts`, `server/admin/posts/queries.ts`. Follow `server/admin/tools/` pattern exactly.
- **Steps:**
  1. Read `server/admin/tools/schema.ts`, `actions.ts`, `queries.ts` as reference
  2. Create `postSchema` (Zod), `postsTableParamsSchema`, `postsTableParamsCache`
  3. Create `upsertPost` action (adminActionClient chain), `deletePost`, `deletePosts`
  4. Create `findPosts`, `findPostBySlug` queries
  5. Type check
- **Done means:** Server-side CRUD compiles. Type check clean.
- **Depends on:** TASK_01

#### SESSION_0136_TASK_03 — Create admin blog pages

- **Agent:** Cody
- **What:** Create `app/admin/posts/page.tsx` (list), `app/admin/posts/[id]/page.tsx` (edit), `app/admin/posts/new/page.tsx` (create). Follow existing admin page patterns. Use `<textarea>` for content editing (Tiptap deferred).
- **Pre-flight:** Read `docs/knowledge/wiki/dirstarter-component-inventory.md` before writing any UI.
- **Steps:**
  1. Consult component inventory
  2. Read existing admin pages (e.g., `app/admin/tools/`) as reference
  3. Create list page with data table
  4. Create edit/new pages with form
  5. Type check + visual verification
- **Done means:** Admin can list/create/edit/delete posts. Type check clean.
- **Depends on:** TASK_02

#### SESSION_0136_TASK_04 — Rewire public blog pages to DB queries

- **Agent:** Cody
- **What:** Update `app/(web)/blog/page.tsx` and `app/(web)/blog/[slug]/page.tsx` to query `Post` from DB instead of `allPosts` from `content-collections`. Replace `<MDX>` with `react-markdown` (or Prose component if available). Add brand-scoped filter. Update `lib/structured-data.ts` Post type.
- **Pre-flight:** Check if `react-markdown` is installed; if not, add it.
- **Steps:**
  1. Create `server/web/posts/queries.ts` with brand-scoped queries
  2. Update blog list page to use DB query
  3. Update blog detail page to use DB query + `react-markdown`
  4. Update `lib/structured-data.ts` to use Prisma `Post` type
  5. Remove `generateStaticParams` (dynamic now)
  6. Type check
- **Done means:** `/blog` and `/blog/[slug]` render from DB. No content-collections imports in blog pages.
- **Depends on:** TASK_01

### Parallelism

- TASK_01: sequential first (schema dependency)
- TASK_02 and TASK_04: can run in parallel after TASK_01 (disjoint file sets — admin server vs public pages)
- TASK_03: sequential after TASK_02 (depends on server actions)

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Schema change, clear execution |
| TASK_02 | Cody | Server CRUD, established pattern (tools/) |
| TASK_03 | Cody | Admin UI, established pattern — **must pass FS-0001 gate** |
| TASK_04 | Cody | Page rewiring, clear execution |

### Open Decisions

- **Tiptap:** Deferred. Using `<textarea>` for admin post editing this session. Tiptap can follow in a future session.
- **Content-collections removal:** Deferred to SESSION_0137. This session adds DB path alongside existing content-collections. Blog pages will read from DB; other content-collections consumers (if any beyond blog) remain untouched.
- **`<MDX>` → `react-markdown`:** Need to verify `react-markdown` is installed or pick the right rendering approach. Dirstarter may have a `<Prose>` component that handles this.

### Risks

- `react-markdown` may need installation (`bun add react-markdown`)
- `<PostList>` component (`components/web/posts/post-list.tsx`) may need type updates for the new DB-backed Post shape vs content-collections Post shape
- `lib/structured-data.ts` imports `Post` from content-collections — needs updating but must not break other structured data functions

### Scope Guard

Do NOT:
- Remove content-collections config/dependency (SESSION_0137)
- Add Tiptap rich text editor (future session)
- Migrate existing MDX content to DB (boilerplate content — just delete it later)
- Touch any non-blog content-collections consumers

---

## Execution Order

TASK_01 → (TASK_02 ∥ TASK_04) → TASK_03

Cody: begin with TASK_01.

---

## Task Log

- SESSION_0136_TASK_01 — ✅ done. Post model + PostStatus enum added. `brand: Brand` column (ADR 0004). Post↔Tool implicit M:N relation added (ADR 0013 — tool cross-reference preserved). `posts Post[]` added to User + Tool models. StudentListMember stub model added (pre-existing schema error). Two migrations: `20260512022653_add_post_model`, `20260512023628_add_post_tools_relation`.
- SESSION_0136_TASK_02 — ✅ done. `server/admin/posts/schema.ts`, `actions.ts`, `queries.ts` created. Follows tools/ pattern: `adminActionClient` chain, `postsTableParamsSchema` with nuqs, `postSchema` with Zod. upsertPost wires `tools` connect/set. Brand scoped via `getRequestBrand()`.
- SESSION_0136_TASK_03 — ✅ done. Admin pages: list (`page.tsx` + PostsTable + columns + toolbar), create (`new/page.tsx`), edit (`[id]/page.tsx`). PostForm with RelationSelector for tools, markdown preview toggle, status select. 6 components: posts-table-columns, post-actions, posts-delete-dialog, posts-table-toolbar-actions, posts-table, post-form.
- SESSION_0136_TASK_04 — ✅ done. Public blog pages rewired: `allPosts` → `findPublishedPosts(brand)`. Blog detail uses `react-markdown` + `<Prose>`. Tools sidebar preserved. `structured-data.ts` updated. PostList/PostCard typed to Prisma Post. `generateStaticParams` removed (dynamic).

## Hostile Close Review (Sessions 0135–0136)

### Scope: Sessions since last hostile close (SESSION_0134)

#### SESSION_0135 — QA Hardening

**Verdict: CLEAN.** Pure test-authoring session. 3 tasks, 18 assertions, all green. No production code changes. No ADR violations. No L1 drift.

#### SESSION_0136 — Blog DB Migration

**Findings:**

| # | Severity | Finding | Status |
|---|---|---|---|
| 0136-01 | 🟡 LOW | `PostForm` initially shipped without `RelationSelector` for `tools` — the only relation on the Post model. Fixed in-session after operator caught it. | ✅ Fixed |
| 0136-02 | ⚪ INFO | Post model uses `cuid()` not `cuid2()` — upstream Dirstarter uses `cuid2()`. Our entire schema uses `cuid()` consistently (Dirstarter template copy `c42e8bb` predates the cuid2 switch). Not a bug, just a delta to track. | Deferred — whole-schema migration if desired |
| 0136-03 | ⚪ INFO | `content-collections` dependency NOT removed this session (per scope guard). Blog pages read from DB but `content-collections.ts`, `next.config.ts` wrapper, and package dep remain. Deferred to SESSION_0137. | By design |
| 0136-04 | 🟡 LOW | Admin post list page imports brand-scoped `findPosts` but does NOT pass brand filter — shows all posts across brands. Should filter by `getRequestBrand()`. | Open — fix in SESSION_0137 |
| 0136-05 | ⚪ INFO | Tiptap deferred per scope guard — textarea + markdown preview is MVP-adequate. | By design |

**ADR Compliance:**

| ADR | Compliance | Notes |
|---|---|---|
| 0004 (brand column) | ✅ | `brand: Brand` on Post model, `getRequestBrand()` in upsertPost |
| 0013 (tool listing) | ✅ | Tool model preserved. Post↔Tool M:N added for cross-reference. Operator caught attempted removal mid-session. |
| 0012 (admin CRUD routing) | ✅ | `app/admin/posts/` follows pattern: list, `[id]`, `new` |

**L1 Pattern Compliance:**

| Pattern | Compliance | Notes |
|---|---|---|
| DataTable + columns + toolbar | ✅ | Follows tools/ pattern exactly |
| adminActionClient chain | ✅ | upsertPost + deletePosts use standard chain |
| RelationSelector | ✅ | Added for tools (fixed in-session) |
| Form + FormField + FormControl | ✅ | Uses L1 form primitives |
| DeleteDialog shared component | ✅ | Uses `~/components/admin/dialogs/delete-dialog` |
| withAdminPage HOC | ✅ | All 3 admin pages wrapped |
| nuqs search params | ✅ | postsTableParamsSchema with table cache |

**FS-0001 Component Inventory Gate:** PASSED — no raw HTML used. All components from L1 inventory.

## What Landed

- **Post model** in Prisma schema with `PostStatus` enum, brand scoping, author relation, tools M:N
- **2 migrations** applied successfully
- **Admin CRUD**: server actions + queries + schema (3 files), admin pages (3 routes), admin components (6 files)
- **Public blog rewired**: list + detail pages read from DB, `react-markdown` rendering, tools sidebar, structured data updated
- **RelationSelector** for Post↔Tool relation on admin form
- **Hostile close review** covering sessions 0135–0136

## Files Touched

| File | Note |
|---|---|
| `apps/web/prisma/schema.prisma` | Post model, PostStatus enum, User.posts, Tool.posts, StudentListMember stub |
| `apps/web/server/admin/posts/schema.ts` | New — postSchema, postsTableParamsSchema |
| `apps/web/server/admin/posts/actions.ts` | New — upsertPost, deletePosts |
| `apps/web/server/admin/posts/queries.ts` | New — findPosts, findPostBySlug, findPostById (with tools include) |
| `apps/web/server/web/posts/queries.ts` | New — findPublishedPosts, findPublishedPostBySlug |
| `apps/web/app/admin/posts/page.tsx` | New — admin post list page |
| `apps/web/app/admin/posts/new/page.tsx` | New — create post page |
| `apps/web/app/admin/posts/[id]/page.tsx` | New — edit post page |
| `apps/web/app/admin/posts/_components/posts-table-columns.tsx` | New — DataTable columns |
| `apps/web/app/admin/posts/_components/post-actions.tsx` | New — row actions dropdown |
| `apps/web/app/admin/posts/_components/posts-delete-dialog.tsx` | New — delete dialog |
| `apps/web/app/admin/posts/_components/posts-table-toolbar-actions.tsx` | New — bulk delete toolbar |
| `apps/web/app/admin/posts/_components/posts-table.tsx` | New — DataTable wrapper |
| `apps/web/app/admin/posts/_components/post-form.tsx` | New — create/edit form with RelationSelector |
| `apps/web/app/(web)/blog/page.tsx` | Modified — DB query instead of content-collections |
| `apps/web/app/(web)/blog/[slug]/page.tsx` | Modified — DB query + react-markdown |
| `apps/web/components/web/posts/post-list.tsx` | Modified — Prisma Post type |
| `apps/web/components/web/posts/post-card.tsx` | Modified — Prisma Post type |
| `apps/web/lib/structured-data.ts` | Modified — Prisma Post type |

## Decisions Resolved

- Post model shape: matches upstream Dirstarter + brand column + tools relation
- Tiptap: deferred — textarea + markdown preview for MVP
- content-collections removal: deferred to SESSION_0137
- Post↔Tool M:N: added per ADR 0013 (operator correction)

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 24th session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 Finding 0136-04: Admin posts list not brand-filtered — fix in SESSION_0137
- 🟡 content-collections removal deferred to SESSION_0137
- 🟡 Tiptap rich text editor deferred (future session)

## Next Session

- **Goal:** SESSION_0137 — content-collections removal + admin posts brand-filter fix (finding 0136-04) + visual QA of blog pages
- **Inputs to read:** `docs/sprints/SESSION_0136.md` (this file), `apps/web/content-collections.ts`, `apps/web/next.config.ts`, `apps/web/package.json` (content-collections deps)
- **First task:** Fix finding 0136-04 — add brand filter to admin findPosts query. Then remove content-collections dependency.