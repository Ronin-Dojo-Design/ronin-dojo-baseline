---
title: "SESSION 0224 — ContentAtom relationships, media carousel, and Article schema cleanup"
slug: session-0224
type: session--implement
status: closed-full
created: 2026-05-22
updated: 2026-05-22
last_agent: codex-session-0224
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0223.md
  - docs/architecture/decisions/0018-content-atom-canonical-relations.md
  - docs/knowledge/wiki/custom-component-inventory.md
  - docs/protocols/project-log.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0224 — ContentAtom relationships, media carousel, and Article schema cleanup

## Date

2026-05-22

## Operator

Brian + codex-session-0224

## Goal

Plan and execute the next Content Engine slice: canonical ContentAtom tags/tools, inherited media carousel rendering on `/posts/[slug]`, and typed Article structured data without `as any`.

## Status

### Status: closed-full

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0223.md`
- Carryover: add ContentAtom/ContentVariant tags + tools, add image/video carousel for `/posts/[slug]`, refactor `generateArticle` generic type.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Graphify check

- Graph status: available; `.graphify` stats at bow-in: 6931 nodes, 11188 edges, 942 communities, 1305 files tracked.
- Queries used:
  - `opening.md`, `petey-plan.md`, `graphify-repo-memory.md`, `closing.md`
  - `ContentAtom ContentVariant tags tools PostTag Tool sidebar`
  - `ContentVariant thumbnailUrl videoUrl media gallery carousel posts slug`
  - `generateArticle StructuredData Article as any posts page`
  - `Dirstarter docs inventory alignment URLs Prisma storage media content blog SEO UI primitives`
  - `embla carousel components media gallery`
- Files selected from graph/source verification:
  - `apps/web/prisma/schema.prisma`
  - `apps/web/prisma/seed-content-atom-proof.ts`
  - `apps/web/server/web/content-posts/payloads.ts`
  - `apps/web/server/web/content-posts/queries.ts`
  - `apps/web/app/(web)/posts/[slug]/page.tsx`
  - `apps/web/app/(web)/blog/[slug]/page.tsx`
  - `apps/web/lib/structured-data.ts`
  - `apps/web/components/common/carousel.tsx`
  - `apps/web/components/web/tuffbuffs/merch-image-gallery.tsx`
  - `docs/knowledge/wiki/dirstarter-docs-inventory.md`
  - `docs/knowledge/wiki/content-engine/command-center-and-intake.md`
  - `docs/knowledge/wiki/content-engine/video-shortcuts-and-iggy-flow.md`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database, content, blog, SEO, media/storage, UI primitives |
| Extension or replacement | Extension: keep `/blog` Post flow intact; add Ronin ContentAtom-backed `/posts` flow in parallel |
| Why justified | SESSION_0223 locked `/posts` as the ContentVariant proof route; this session closes the known gaps needed for parity. |
| Risk if bypassed | Schema drift, duplicate media models, SEO type debt, and UI built outside Dirstarter primitive inventory. |

### Dirstarter docs checked live

- `https://dirstarter.com/docs/database/prisma`
- `https://dirstarter.com/docs/content`
- `https://dirstarter.com/docs/blog`
- `https://dirstarter.com/docs/seo`
- `https://dirstarter.com/docs/integrations/media`
- `https://dirstarter.com/docs/integrations/storage`
- `https://dirstarter.com/docs/theming`

## Petey plan

### Goal

Ship the next structured content proof so `/posts/why-the-bell-matters` renders canonical tags, tools mentioned, and multi-media carousel data from ContentAtom/ContentVariant without structured-data casts.

### Tasks

#### TASK_01 — Canonical ContentAtom relations and seed proof

- **Agent:** Cody
- **What:** Add ContentAtom-level `tags` and `tools` relations, connect existing Tag/Tool models, and seed proof data for `why-the-bell-matters`.
- **Steps:** 1. Run Cody schema pre-flight. 2. Add schema relations and migration. 3. Update generated client. 4. Update seed to create/connect tags and published tools. 5. Verify seed idempotency.
- **Done means:** ContentAtom for `why-the-bell-matters` has related tags/tools queryable through Prisma.
- **Depends on:** user sign-off on relation placement and seed semantics.

#### TASK_02 — Content post media carousel and sidebar rendering

- **Agent:** Cody + Desi review
- **What:** Reuse existing media/gallery patterns to render multiple inherited media items plus tools/tags on `/posts/[slug]`.
- **Steps:** 1. Run component pre-flight. 2. Extend content post payloads. 3. Compose existing `Carousel`/media display pattern. 4. Render tags and tools sidebar in parity with `/blog/[slug]`. 5. Verify responsive layout.
- **Done means:** Seeded multiple images render as a carousel on `/posts/why-the-bell-matters`, and seeded tools render in the sidebar.
- **Depends on:** TASK_01.

#### TASK_03 — Structured data typing and verification close

- **Agent:** Cody, then Doug review
- **What:** Replace `Post`-locked `generateArticle` typing with a generic article input and remove `as any` from `/posts/[slug]`.
- **Steps:** 1. Define a narrow `ArticleData` interface in `structured-data.ts`. 2. Preserve `/blog` caller compatibility. 3. Update `/posts/[slug]` caller. 4. Run validation/typecheck/tests/smoke. 5. Complete full-close docs, commit, push, Graphify update.
- **Done means:** No `as any` is needed for ContentVariant article structured data, and verification gates are recorded.
- **Depends on:** can run in parallel with early schema work if it avoids overlapping `/posts/[slug]` edits until integration.

### Parallelism

- Schema/seed work and structured-data type refactor can begin in parallel after sign-off if file ownership stays disjoint.
- `/posts/[slug]` integration is sequential because it depends on the final payload shape and touches the same page as the structured-data cleanup.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Schema/migration/seed execution against an approved Petey plan |
| TASK_02 | Cody + Desi | UI composition from existing media and sidebar patterns |
| TASK_03 | Cody + Doug | Typed SEO cleanup plus close verification |

### Decisions locked

- `ContentAtom.tags` and `ContentAtom.tools` only; variants inherit. No `ContentVariantTag` or `ContentVariantTool` this session.
- Reuse existing `Media` + `MediaAttachment.contentAtomId` as canonical atom media; add missing Prisma relation/backrelation; render variant pages from atom media. No new `ContentVariantMedia` table.
- Seed may create/connect a small set of proof tags and published Tool rows if missing.
- No ContentAtom admin editing UI this session. Seed/query/render proof only.

### Risks

- Prisma migration may expose existing drift around `MediaAttachment.contentAtomId` lacking a declared relation.
- Tool rows are directory/listing entities; using them as article "tools mentioned" is consistent with `/blog`, but seeded proof data may feel semantically thin.
- Dirstarter theming docs still reference Radix while this repo has migrated common primitives to Base UI; local component inventory is the stronger source for implementation.

### Scope guard

Admin ContentAtom CRUD, tag filter pages, sitemap expansion, and ContentVariant-specific media overrides are follow-up candidates unless explicitly pulled into this session.

### Dirstarter implementation template

- **Docs read first:** live Dirstarter Prisma, content, blog, SEO, media, storage, theming docs checked on 2026-05-22.
- **Baseline pattern to extend:** Dirstarter Post model/blog rendering, Post.tools sidebar, Prisma migrations, existing `Carousel`, `FormMedia`, and media storage conventions.
- **Custom delta:** Ronin ContentAtom is the canonical upstream object; ContentVariant remains the channel/brand render surface.
- **No-bypass proof:** `/blog` stays untouched as the Dirstarter baseline; `/posts` extends it with structured ContentAtom data.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0224_TASK_01 | landed | Canonical ContentAtom tags/tools relations, media attachment relation, migration, Prisma client generation, and idempotent proof seed |
| SESSION_0224_TASK_02 | landed | Content post payload/sidebar rendering and `ContentPostMediaCarousel` for atom media |
| SESSION_0224_TASK_03 | landed | Generic `ArticleData` structured-data input, no `/posts/[slug]` `as any`, and close verification |

## Cody pre-flight

### Pre-flight: Schema — ContentAtom relations and media attachments

#### 1. Petey invocation

- [x] Petey plan exists in SESSION file with task IDs.
- [x] User locked Petey grill decisions as recommended.

#### 2. Design doc check

- Design docs consulted: `docs/knowledge/wiki/content-engine/command-center-and-intake.md`, `docs/knowledge/wiki/content-engine/video-shortcuts-and-iggy-flow.md`, `docs/architecture/plan-vs-current.md`.
- Models match design doc: yes, custom delta is adding canonical atom relationships needed for the structured content lane.

#### 3. Existing schema scan

- Current model count: 116.
- Related existing models: `ContentAtom`, `ContentVariant`, `Tag`, `Tool`, `Post`, `Media`, `MediaAttachment`.
- Back-relations needed:
  - `ContentAtom.tags` ↔ `Tag.contentAtoms`
  - `ContentAtom.tools` ↔ `Tool.contentAtoms`
  - `ContentAtom.mediaAttachments` ↔ `MediaAttachment.contentAtom`
- Schema spot-check:
  - `ContentAtomStatus`: `INBOX`, `DRAFT`, `REVIEW`, `APPROVED`, `PUBLISHED`, `ARCHIVED`.
  - `ContentVariantStatus`: `DRAFT`, `READY`, `PUBLISHED`, `ARCHIVED`.
  - `ContentChannel`: `BLOG`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE_SHORT`, `YOUTUBE_LONG`, `REDDIT`, `TIKTOK`, `EMAIL`, `CURRICULUM`.
  - `Brand`: `RONIN_DOJO_DESIGN`, `BASELINE_MARTIAL_ARTS`, `BBL`, `WEKAF`.
  - `MediaType`: `IMAGE`, `VIDEO`, `YOUTUBE`, `DOCUMENT`.
  - `ToolStatus`: `Draft`, `Scheduled`, `Pending`, `Rejected`, `Published`, `Deleted`.
  - Existing `ContentAtom` relations: `createdBy`, `discipline`, `style`, `organization`, `variants`, `tasks`, `publications`.
  - Existing `Tag` relations: `tools` only.
  - Existing `Tool` relations: `categories`, `tags`, `reports`, `bookmarks`, `owner`, `posts`.
  - Existing `MediaAttachment` has scalar `contentAtomId` but no declared relation field.

#### 4. Runbook consulted

- [x] `docs/runbooks/schema-migration.md` read.
- [x] `docs/runbooks/prisma-workflow.md` identified by Graphify; active migration guidance duplicated in schema migration runbook.
- Migration strategy: additive production-shipping change, use `prisma migrate dev` or a manually reviewed migration file, then generate client.

#### 5. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — high-level platform and brand-scoped public query flow.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — publication/state touchpoint, not a member lifecycle write path.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0006, FS-0007, FS-0008.
- Mitigation acknowledged: Petey plan exists before schema work; task rows are in Project Log before implementation; exact enum/model relation spot-check is recorded above.

### Pre-flight: Component — ContentPostMediaCarousel and sidebar additions

#### 1. Existing component scan

- Graphify searched for: `embla carousel components media gallery`, `ContentVariant thumbnailUrl videoUrl media gallery carousel posts slug`.
- Found: `components/common/carousel.tsx`, `components/web/tuffbuffs/merch-image-gallery.tsx`, `components/web/table-of-contents.tsx`, `components/web/ui/favicon.tsx`, `components/web/ui/tag.tsx`, `components/common/badge.tsx`, `components/web/ui/section.tsx`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes.
- Closest L1/local patterns: `/blog/[slug]` tools-mentioned sidebar, existing `Carousel`/`CarouselSlide`, existing `MerchImageGallery` thumbnail-selector pattern.
- Primitive API spot-check:
  - `Carousel`: props `options?: EmblaOptionsType`, `children`, `className`; renders overflow viewport and prev/next icon buttons.
  - `CarouselSlide`: props `children`, `className`; default class `min-w-0 flex-[0_0_280px]`.
  - `TableOfContents`: props from `InlineMenu` except `items`/`renderItem`, plus `headings: { id, text, level }[]`; returns `null` for empty headings.
  - `Badge`: variants `primary`, `soft`, `outline`, `success`, `caution`, `warning`, `info`, `danger`; sizes `sm`, `md`, `lg`; props `prefix`, `suffix`, `render`.
  - `Tag`: props `prefix`, `suffix`, `render`; visual tag text wrapper.

#### 3. Composition decision

- [x] Composing existing components: `Carousel`, `CarouselSlide`, `TableOfContents`, `Favicon`, `Badge`/`Tag`, `Section`.
- [ ] New component, no L1 match exists: only if needed as a thin `ContentPostMediaCarousel` wrapper around existing carousel/media display primitives.

#### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read.
- [x] Wiki entries for target area read: Command Center and Intake; Video Shortcuts and Iggy Flow; Dirstarter Docs Inventory.
- [x] Runbooks consulted: Graphify Repo Memory; Schema Migration; SOP Data Flows; SOP E2E User Lifecycle.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && bun run dev`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: `baseline.local:3000` or request-brand fallback for `/posts/why-the-bell-matters`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008.
- Mitigation acknowledged: component inventory and primitive APIs are read before UI changes; implementation will compose existing components rather than hand-roll controls.

### Pre-flight: Backend — Content post payload/query and structured data

#### 1. Auth predicates planned

- [x] Public read route only.
- [x] Brand column filtered via `getRequestBrand()` and existing `findPublishedContentPostBySlug(slug, brand)`.
- Authorization approach: no new write actions; seed script remains operator-run.

#### 2. Existing action/query scan

- Consulted Dirstarter baseline patterns: Dirstarter blog docs and existing `/blog/[slug]` implementation.
- Related existing queries: `server/web/content-posts/queries.ts`, `server/web/content-posts/payloads.ts`, `server/web/posts/queries.ts`, `server/web/posts/payloads.ts`.
- L1 pattern match: Dirstarter database-backed blog post query/render path.

#### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — request host to brand context to Prisma rowset.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — public publication touchpoint.

#### 4. FAILED_STEPS check

- Prior failures in this area: FS-0007, FS-0008.
- Manual Boundary Registry entries: none checked for this narrow content proof.

## What landed

- Added canonical `ContentAtom.tags`, `ContentAtom.tools`, and `ContentAtom.mediaAttachments` relations with reciprocal `Tag`, `Tool`, and `MediaAttachment.contentAtom` fields.
- Added migration `20260522224500_add_content_atom_relations` for `_ContentAtomToTag`, `_ContentAtomToTool`, and the `MediaAttachment.contentAtomId` foreign key.
- Updated `seed-content-atom-proof.ts` so `why-the-bell-matters` seeds three tags, two published tools, and two media attachments idempotently.
- Extended the ContentVariant detail payload so `/posts/[slug]` can read inherited atom tags, tools, and media attachments.
- Added `ContentPostMediaCarousel`, composing the existing common carousel primitive for image, video, YouTube, and document fallback media.
- Updated `/posts/[slug]` to render tags, tools-mentioned sidebar, inherited media carousel, and Article JSON-LD from the narrow structured-data input.
- Refactored `generateArticle` to accept `ArticleData` instead of Prisma `Post`, preserving `/blog/[slug]` compatibility while removing the `/posts/[slug]` `as any`.
- Swapped `Author` from raw `Image` usage to the existing Avatar primitive so missing author images do not pass `src=""`.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Added canonical ContentAtom tag/tool/media relations and backrelations. |
| `apps/web/prisma/migrations/20260522224500_add_content_atom_relations/migration.sql` | Added relation tables and `MediaAttachment.contentAtomId` FK. |
| `apps/web/prisma/seed-content-atom-proof.ts` | Seeded proof tags, tools, and media attachments for `why-the-bell-matters`. |
| `apps/web/server/web/content-posts/payloads.ts` | Added atom tags/tools/media to the detail payload. |
| `apps/web/app/(web)/posts/[slug]/page.tsx` | Rendered tags, tools sidebar, carousel, and typed Article JSON-LD. |
| `apps/web/components/web/content-posts/content-post-media-carousel.tsx` | New media carousel wrapper around existing carousel primitives. |
| `apps/web/components/web/ui/author.tsx` | Used Avatar primitive and nullable image prop. |
| `apps/web/lib/structured-data.ts` | Added `ArticleData` and removed Prisma `Post` coupling from `generateArticle`. |
| `docs/sprints/SESSION_0224.md` | Bow-in, plan, pre-flight, execution evidence, and full-close record. |
| `docs/protocols/project-log.md` | SESSION_0224 task/review/build entries. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Documented the new ContentPostMediaCarousel component. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0217-0224 rows and ADR 0018. |
| `docs/architecture/decisions/0018-content-atom-canonical-relations.md` | Recorded canonical atom relation decision. |

## Decisions resolved

- Tags/tools are canonical on `ContentAtom`; variants inherit them. No ContentVariant-specific tag/tool join tables this session.
- Existing `Media` + `MediaAttachment.contentAtomId` is the canonical media model for atom-backed posts. No new ContentVariant media model this session.
- Proof seed is allowed to create/connect small published Tool rows and proof tags.
- No ContentAtom admin editing UI this session; seed/query/render proof only.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx prisma format --schema prisma/schema.prisma` | Pass |
| `bunx prisma validate --schema prisma/schema.prisma` | Pass |
| `bunx prisma generate --schema prisma/schema.prisma --no-hints` | Pass |
| `bunx prisma migrate dev --schema prisma/schema.prisma` | Pass; migration applied locally |
| `npx tsx apps/web/prisma/seed-content-atom-proof.ts` | Pass; proof atom seeded |
| SQL proof query | Pass; `atom-2026-why-the-bell-matters` has 3 tags, 2 tools, 2 media attachments |
| `curl -H 'Host: baseline.local:3000' http://localhost:3000/posts/why-the-bell-matters` | Pass; HTTP 200 |
| HTML proof scan | Pass; tags, tools, media URLs, and Article JSON-LD present |
| `curl -H 'Host: baseline.local:3000' http://localhost:3000/blog/boilerplate` | Pass; HTTP 200 |
| `bun --cwd apps/web biome check --write ...` | Pass on touched files |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass |
| `bun --cwd apps/web test -- --concurrency=1` | Pass; 257 tests |
| `pnpm --filter @ronin-dojo/web build` | Pass; existing workspace-root/NFT warnings only |
| `bun run wiki:lint` | Exit 0; 500 warnings, pre-existing doc warnings/orphans |

## Review log

| Review ID | Status | Summary |
| --- | --- | --- |
| SESSION_0224_REVIEW_01 | pass | Hostile close review found no P0/P1 issues. Remaining risk is follow-up UX/admin expansion, not correctness of the shipped proof. |

## Hostile close review

- **Verdict:** Pass.
- **Reviewed tasks:** SESSION_0224_TASK_01, SESSION_0224_TASK_02, SESSION_0224_TASK_03.
- **Dirstarter docs check:** live Prisma/database, content, blog, SEO, media, storage, and theming docs checked at bow-in; implementation extends Dirstarter blog/content/media patterns without replacing `/blog`.
- **Security/data integrity:** Public read path only; existing brand-scoped `findPublishedContentPostBySlug(slug, brand)` remains the gate. Schema change is additive, relation tables use cascade semantics, and media FK uses `ON DELETE SET NULL`.
- **Verification honesty:** Full tests/build/typecheck passed. Wiki lint has known warning debt and did not fail. Build warnings are existing Next workspace-root and storage-monitoring NFT warnings, not introduced by this slice.
- **Open findings:** None opened.

## ADR / ubiquitous-language check

- **ADR:** Added `docs/architecture/decisions/0018-content-atom-canonical-relations.md` because the session locked canonical ownership of tags, tools, and media for ContentAtom-backed posts.
- **Ubiquitous language:** No glossary update needed. Existing terms `ContentAtom`, `ContentVariant`, `Tool`, `Tag`, `Media`, and `MediaAttachment` were reused without redefining their domain meaning.

## Reflections

- The latent `MediaAttachment.contentAtomId` scalar was the right clue: the app already wanted atom media, it just lacked the Prisma relation. Following that avoided an unnecessary ContentVariant media model.
- The old dev server had a stale generated Prisma client and produced a false 500 until it was restarted after `prisma generate`. Future schema sessions should restart Next before trusting browser smoke failures.
- `Author`'s empty image warning was unrelated but surfaced during smoke; fixing it with the local Avatar primitive reduced noise for both `/blog` and `/posts`.
- The build still reports the known Turbopack workspace-root/NFT warnings. They are worth a future cleanup session, but they did not block this content proof.

## Next session

### Goal

Add the first management surface for ContentAtom metadata/media or extend the public ContentVariant proof into navigation/filtering, depending on product priority.

### Inputs to read

- `docs/sprints/SESSION_0224.md`
- `docs/architecture/decisions/0018-content-atom-canonical-relations.md`
- `docs/knowledge/wiki/custom-component-inventory.md`
- `apps/web/prisma/schema.prisma`
- `apps/web/server/web/content-posts/payloads.ts`
- `apps/web/app/(web)/posts/[slug]/page.tsx`

### First task

Decide whether the next slice is admin editing for ContentAtom tags/tools/media or public discovery/filtering for `/posts`; both are unblocked by SESSION_0224.

## Open decisions / blockers

- No blockers for the shipped proof.
- Product decision pending: ContentAtom admin editing vs. public post discovery/filtering should be chosen before the next implementation slice.
- Optional future cleanup: address the existing Next workspace-root/NFT build warnings in a separate platform hygiene session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0224, Project Log, wiki index, custom component inventory, and ADR 0018 frontmatter checked/updated with `updated: 2026-05-22` and `last_agent: codex-session-0224` where touched. |
| Backlinks/index sweep | Wiki index now includes SESSION_0217-0224 and ADR 0018; SESSION_0224 pairs with ADR 0018, custom component inventory, and Project Log. |
| Wiki lint | `bun run wiki:lint` exited 0 with 500 warnings; warnings are pre-existing markdown/orphan debt, not introduced by touched files. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0224_REVIEW_01 recorded in this file and Project Log. |
| Review & Recommend | Next session goal, inputs, and first task recorded; next session is unblocked but needs product priority choice. |
| Memory sweep | Project-scoped decision captured as ADR 0018 and component inventory row; no separate operator memory needed. |
| Next session unblock check | Unblocked; decision is priority selection, not technical readiness. |
| Git hygiene | Final branch/status/commit/push proof will be reported in the bow-out response after the single close commit. |
| Graphify update | Final post-commit graph stats will be reported in the bow-out response to avoid a self-referential commit loop. |
