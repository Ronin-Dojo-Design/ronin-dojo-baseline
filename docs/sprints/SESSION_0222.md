---
title: "SESSION 0222 — L2 Content Engine: DB Posts from ContentAtom pipeline (Stage 1–2)"
slug: session-0222
type: session--implement
status: closed-full
created: 2026-05-22
updated: 2026-05-22
last_agent: copilot-session-0222
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0221.md
  - docs/sprints/SESSION_0196_content_atoms_db_posts.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0222 — L2 Content Engine: DB Posts from ContentAtom pipeline (Stage 1–2)

## Date

2026-05-22

## Operator

Brian + copilot-session-0222 (Petey orchestration, Cody execution)

## Goal

Execute SESSION_0196 plan Stages 1–2: build the parallel content-post read path and seed one proof atom. Prove one database post from one ContentAtom for one brand.

## Bow-in notes

- **Previous session:** SESSION_0221 closed D-006 + D-007 drift entries. L1 upstream alignment lane fully closed.
- **Branch:** `main` (clean).
- **Plan source:** `docs/sprints/SESSION_0196_content_atoms_db_posts.md`.

## What landed

### Deliverable 1 — Server query slice (TASK_01)

Created `server/web/content-posts/`:
- `payloads.ts` — `ContentPostOne`, `ContentPostMany` DTOs with Prisma select payloads. Atom data included (author, discipline, longFormCopy fallback). No task data exposed.
- `queries.ts` — `findPublishedContentPosts(brand)`, `findPublishedContentPostBySlug(slug, brand)`. Visibility contract enforced:
  - Variant status = PUBLISHED
  - Channel = BLOG
  - Brand = request brand
  - Parent atom status IN (APPROVED, PUBLISHED)
  - publishDate <= now or null

### Deliverable 2 — Public routes (TASK_02)

Created parallel `/posts` routes (existing `/blog` routes remain untouched per Stage 1 contract):
- `app/(web)/posts/page.tsx` — list page sourced from `findPublishedContentPosts`
- `app/(web)/posts/[slug]/page.tsx` — detail page sourced from `findPublishedContentPostBySlug`

### Deliverable 3 — Renderer components (TASK_02)

- `components/web/content-posts/content-post-card.tsx` — card component using ContentVariant fields, falls back to atom title
- `components/web/content-posts/content-post-list.tsx` — grid list component

### Deliverable 4 — Seed script (TASK_03)

- `prisma/seed-content-atom-proof.ts` — idempotent seed for `atom-2026-why-the-bell-matters` ContentAtom + BASELINE_MARTIAL_ARTS BLOG variant

### Deliverable 5 — Visibility tests (TASK_03)

- `server/web/content-posts/queries.test.ts` — 13 tests covering all 8 acceptance criteria from SESSION_0196 plan

### Verification gates

| Gate | Result |
| --- | --- |
| Typecheck (`pnpm --filter @ronin-dojo/web typecheck`) | ✅ pass |
| Lint (`bun biome check .`) | ✅ pass (987 files, 0 errors) |
| Tests (257 tests / 52 files) | ✅ 257/257 pass, 0 fail (13 new) |
| Build (`pnpm --filter @ronin-dojo/web build`) | ✅ pass |

## Files touched

- `server/web/content-posts/payloads.ts` — new: ContentVariant select payloads + DTO types
- `server/web/content-posts/queries.ts` — new: brand-scoped published ContentVariant queries
- `server/web/content-posts/queries.test.ts` — new: 13 visibility contract tests
- `app/(web)/posts/page.tsx` — new: content-post list route
- `app/(web)/posts/[slug]/page.tsx` — new: content-post detail route
- `components/web/content-posts/content-post-card.tsx` — new: card component
- `components/web/content-posts/content-post-list.tsx` — new: list component
- `prisma/seed-content-atom-proof.ts` — new: proof atom seed script

## Decisions resolved

- **Parallel routes (Stage 1):** `/posts` routes run alongside existing `/blog` routes. No disruption to existing post system.
- **Renderer fallback:** Detail page renders `renderedCopy` if present, falls back to `atom.longFormCopy`. This allows variants without custom copy to inherit the atom's canonical content.
- **No structured data yet:** `/posts` routes omit `StructuredData` for now — will add in Stage 3 parity checks.

## Open decisions / blockers

- **Stage 3–5:** Route switch from `/blog` to `/posts` (or merge) pending parity proof with live seeded data.
- **Admin UI:** No admin CRUD for ContentAtom/ContentVariant yet. Seed script is the only write path.

## Reflections

Clean execution. The existing query/payload pattern from `server/web/posts/` transferred directly. The visibility contract is stricter than the legacy Post queries (parent atom status gating adds a second layer). Biome auto-fixed 3 import-order issues across the session.

## Hostile close review (Doug)

- **Scope creep check:** No unrelated changes. All files are new content-post infrastructure.
- **Regression risk:** All 4 gates green. Existing `/blog` routes untouched — zero regression surface.
- **Test coverage:** 13 tests cover all 8 acceptance criteria from the plan. Brand scoping, status gating, channel filtering, atom status gating, date filtering, payload exclusion all verified.

## Full close evidence

| Evidence | Proof |
| --- | --- |
| Query slice created | `server/web/content-posts/{payloads,queries}.ts` |
| Routes created | `app/(web)/posts/page.tsx`, `app/(web)/posts/[slug]/page.tsx` |
| Components created | `components/web/content-posts/{content-post-card,content-post-list}.tsx` |
| Seed script created | `prisma/seed-content-atom-proof.ts` |
| Visibility tests pass | 13/13 pass — brand scoping, status gating, channel filter, atom gating, date filter, payload exclusion |
| Typecheck green | `pnpm --filter @ronin-dojo/web typecheck` → pass |
| Lint green | `bun biome check .` → 987 files, 0 errors |
| Tests green | 257/257 pass, 13 new |
| Build green | `pnpm --filter @ronin-dojo/web build` → pass |

## ADR / ubiquitous-language check

- No new ADR needed — this implements the existing content engine architecture from SESSION_0196 plan.
- Ubiquitous language: `ContentPost` (the public-facing projection of a ContentVariant) is now a first-class concept in the codebase.

## Next session

### Priority 1 — Stage 2: Run seed, prove live render

- **Goal:** Run `seed-content-atom-proof.ts` against dev DB, visit `/posts` and `/posts/why-the-bell-matters` in browser, confirm live render.
- **Done means:** Screenshot or curl proof of rendered content-post from database.

### Priority 2 — Stage 3: Parity checks

- **Goal:** Compare `/blog` MDX output vs `/posts` database output for the proof atom. Identify gaps (structured data, tools mentioned, nav, etc).

### Priority 3 — Stage 4: Route switch

- **Goal:** Make `/blog` source from ContentVariant instead of Post model, or redirect `/blog` → `/posts`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0222_TASK_01 | done | Server query slice: payloads.ts + queries.ts |
| SESSION_0222_TASK_02 | done | Public routes + renderer components |
| SESSION_0222_TASK_03 | done | Seed script + 13 visibility tests |
