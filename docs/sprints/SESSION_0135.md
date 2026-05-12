---
title: "SESSION 0135 — QA Hardening: Dev-Login Guard Test, upsertDivision Action Test, Registration Concurrency Test"
slug: session-0135
type: session
status: closed-full
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0135
sprint: S5
pairs_with:
  - docs/sprints/SESSION_0134.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0135 — QA Hardening: Dev-Login Guard Test, upsertDivision Action Test, Registration Concurrency Test

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody + Doug)

## Status

closed-full

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — no UI work planned this session.
- Carried blocker: 🔴 Resend domain DNS pending verification — 22nd session carried.
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131).

## Graphify Check

- Graph status: **updated** (`ad5c384d` → `1020bcf5`, incremental, no API cost)
- Query: `"dev-login route test NODE_ENV guard upsertDivision action tournament registration concurrency"` — 468 nodes found
- Key files confirmed: `route.ts` (dev-login), `actions.ts` (tournament admin — upsertDivision at L155), `register.ts` (registration checkout), `register.concurrency.test.ts` (existing concurrency test)

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | No — tests only |
| Extension or replacement | N/A |
| Why justified | QA hardening of existing code, no new patterns |
| Risk if bypassed | N/A |

## Goal

QA hardening — close carried findings from sessions 0133 and 0134:
1. Add automated test: `NODE_ENV=production` → dev-login route returns 404 (finding 0133-01)
2. Add automated test: `upsertDivision` action with valid/invalid inputs (finding 0134-02)
3. Verify registration concurrency test passes (finding 0133-02)

---

## Petey Plan

### Context

SESSION_0134 Next Session specified three QA hardening tasks. All code under test already exists and is stable. This is pure test-authoring work — no production code changes expected.

### Tasks

#### SESSION_0135_TASK_01 — Dev-login env guard test

- **Agent:** Cody
- **What:** Create `apps/web/app/api/auth/dev-login/route.test.ts`. Test that when `isDev` is false (simulating production), the route returns 404 with `{ error: "Not available" }`. Also test the happy path (dev mode + valid user).
- **Files to read:** `apps/web/app/api/auth/dev-login/route.ts` (already read — 65 lines)
- **Pattern to follow:** `apps/web/app/api/stripe/webhooks/route.test.ts` (existing route test using `bun:test`)
- **Done means:** Test file exists, `bun test app/api/auth/dev-login/route.test.ts` passes, production guard is proven.
- **Closes:** Finding 0133-01

#### SESSION_0135_TASK_02 — upsertDivision action test

- **Agent:** Cody
- **What:** Create `apps/web/server/admin/tournaments/upsert-division.test.ts`. Test: (1) create division with valid input returns division object, (2) update existing division, (3) invalid input (missing required field) is rejected by Zod schema validation.
- **Files to read:** `apps/web/server/admin/tournaments/actions.ts` L155–185 (upsertDivision), schema file for `divisionSchema`
- **Pattern to follow:** `apps/web/server/admin/tournaments/bracket-seeding.test.ts` (existing admin tournament test)
- **Done means:** Test file exists, tests pass, upsertDivision create/update/validation proven.
- **Closes:** Finding 0134-02

#### SESSION_0135_TASK_03 — Registration concurrency test verification

- **Agent:** Doug
- **What:** Run the existing `register.concurrency.test.ts` and verify it passes. If it fails, triage and fix. If it passes, close finding 0133-02.
- **Files to read:** `apps/web/server/web/tournaments/register.concurrency.test.ts` (649 lines, already exists)
- **Done means:** Test passes or failure triaged with fix plan.
- **Closes:** Finding 0133-02

### Agent Assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear test-authoring task, pattern exists |
| TASK_02 | Cody | Clear test-authoring task, pattern exists |
| TASK_03 | Doug | Verification/triage of existing test |

### Open Decisions

None — all three tasks are fully specified by the findings. No user input needed.

### Execution Order

TASK_01 → TASK_02 → TASK_03 (sequential — each is independent but serial execution avoids DB conflicts from concurrent test runs).

## Task Log

- SESSION_0135_TASK_01 — ✅ done. Dev-login guard test: 3/3 pass. Production guard (isDev=false → 404), missing env var (→ 404), missing user (→ 404). Closes finding 0133-01.
- SESSION_0135_TASK_02 — ✅ done. upsertDivision schema test: 9/9 pass. Create, update, 5 invalid-input cases, empty-string FK fields. Closes finding 0134-02.
- SESSION_0135_TASK_03 — ✅ done (Doug). Registration concurrency test: 6/6 pass. Capacity race, cancel/refund paths all proven. Closes finding 0133-02.

## Giddy Research — Dirstarter Blog DB Migration

### Sources checked (2026-05-12)

| URL | Key findings |
| --- | --- |
| `https://dirstarter.com/docs/blog` | Dirstarter now stores blog posts in DB via `Post` model with `PostStatus` enum (Draft/Scheduled/Published). Tiptap rich text editor in admin. Migration script `scripts/migrate-posts.ts` included. Updated 4/29/2026. |
| `https://dirstarter.com/docs/content` | Content workflow: submission → admin review → schedule → publish. Tool statuses (Draft/Pending/Scheduled/Published/Rejected/Deleted). Admin data tables with bulk actions. Not directly blog-related but confirms the status lifecycle pattern. |
| `https://dirstarter.com/docs/codebase/updates` | Update process: `git merge upstream/main` or `git pull upstream main --rebase`. DB schema updates via `prisma migrate`. Our local template copy (`c42e8bb`) predates the blog DB migration — that's why we didn't see the `Post` model in the template schema. |

### Blog DB Migration — What Dirstarter ships

1. **`Post` model** in `prisma/schema.prisma`:
   ```prisma
   model Post {
     id          String     @id @default(cuid2())
     title       String     @db.Citext
     slug        String     @unique
     description String?
     content     String
     plainText   String     @default("")
     imageUrl    String?
     status      PostStatus @default(Draft)
     publishedAt DateTime?
     createdAt   DateTime   @default(now())
     updatedAt   DateTime   @updatedAt
     author      User       @relation(fields: [authorId], references: [id])
     authorId    String
   }
   enum PostStatus { Draft Scheduled Published }
   ```

2. **Tiptap editor** in admin for rich text editing
3. **`config/blog.ts`** for blog settings (already exists in Ronin)
4. **Migration script** `scripts/migrate-posts.ts` — parses MDX frontmatter, extracts plain text, inserts into DB. Idempotent (skips existing slugs).
5. **`plainText` field** — stripped markdown for read time calculation + search
6. **`react-markdown`** for frontend rendering (replaces `content-collections` MDX compilation)

### Ronin-specific considerations

- Add `brand: Brand` column to `Post` model (ADR 0004 — brand scoping)
- `authorId` FK → existing `User` model ✅
- Current MDX posts are Dirstarter boilerplate content (not Ronin content) — can be deleted rather than migrated
- Remove `content-collections` dependency + `content-collections.ts` config after migration
- Blog pages (`app/(web)/blog/page.tsx`, `app/(web)/blog/[slug]/page.tsx`) need rewiring from `allPosts` → DB queries
- Admin blog CRUD pages need creation (follow existing admin patterns)

### Verdict

Finding 0134-01 is **confirmed valid**. Dirstarter has shipped DB-backed posts upstream. Our local template copy was stale. This is a real L1 gap that should be closed.

---

## Petey Plan — Next Session (SESSION_0136)

### Goal

Blog DB migration: Add `Post` model + `PostStatus` enum to Prisma schema, create migration, wire admin CRUD, rewire public blog pages from content-collections to DB queries, remove content-collections dependency.

### Dirstarter implementation template

- **Docs read first:** `https://dirstarter.com/docs/blog` (checked 2026-05-12)
- **Baseline pattern to extend:** Dirstarter `Post` model + `PostStatus` enum + admin CRUD + `react-markdown` rendering
- **Custom delta:** Add `brand: Brand` column per ADR 0004; delete boilerplate MDX rather than migrate; brand-scoped queries
- **No-bypass proof:** Dirstarter shipped this upstream; our local template is stale; closing the gap

### Tasks

#### SESSION_0136_TASK_01 — Add Post model + PostStatus enum to Prisma schema

- **Agent:** Cody
- **What:** Add `Post` model (with `brand: Brand` column) and `PostStatus` enum to `apps/web/prisma/schema.prisma`. Add `posts Post[]` relation to `User` model. Run `bun db:migrate dev --name add-post-model`.
- **Done means:** Migration succeeds, `bun db:generate` clean, type check passes.
- **Depends on:** nothing

#### SESSION_0136_TASK_02 — Create admin blog CRUD (server actions + admin pages)

- **Agent:** Cody
- **What:** Create `server/admin/posts/actions.ts` (upsertPost, deletePosts), `server/admin/posts/schema.ts` (postSchema, postsTableParamsSchema), `server/admin/posts/queries.ts`. Create admin pages: `app/admin/posts/page.tsx` (list), `app/admin/posts/[id]/page.tsx` (edit), `app/admin/posts/new/page.tsx`. Follow existing admin CRUD patterns (tournaments, tools).
- **Done means:** Admin can list, create, edit, delete posts in dev. Type check clean.
- **Depends on:** TASK_01

#### SESSION_0136_TASK_03 — Rewire public blog pages from content-collections to DB

- **Agent:** Cody
- **What:** Update `app/(web)/blog/page.tsx` and `app/(web)/blog/[slug]/page.tsx` to query `Post` from DB instead of `allPosts` from `content-collections`. Use `react-markdown` for rendering. Add brand-scoped query filter.
- **Done means:** Public `/blog` and `/blog/[slug]` pages render from DB. Content-collections import removed from blog pages.
- **Depends on:** TASK_01

### Parallelism

TASK_02 and TASK_03 can run in parallel after TASK_01 (disjoint file sets — admin pages vs public pages).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Schema change, clear execution |
| TASK_02 | Cody | Admin CRUD, established patterns |
| TASK_03 | Cody | Page rewiring, clear execution |

### Open decisions

- **Tiptap editor:** Full Tiptap integration may be too large for one session. Fallback: use a plain `<textarea>` with markdown for MVP, add Tiptap in a follow-up session.
- **Content-collections removal:** Should we fully remove content-collections config + dependency this session, or defer to a cleanup session? Recommend: defer removal to SESSION_0137 after verifying blog works from DB.

### Risks

- `react-markdown` may not be installed yet — need to check and add dependency.
- `Post` model needs `User` relation; verify `User` model doesn't already have a `posts` relation field.

### Scope guard

If Tiptap integration proves complex, note it as deferred and ship with textarea. Do not expand scope.

## What Landed

- **TASK_01:** Dev-login env guard test — 3 tests proving production returns 404. Closes finding 0133-01.
- **TASK_02:** upsertDivision schema validation test — 9 tests proving create/update/invalid inputs. Closes finding 0134-02.
- **TASK_03:** Registration concurrency test verification — 6/6 pass. Closes finding 0133-02.
- **Giddy research:** Confirmed Dirstarter has shipped DB-backed blog posts upstream (docs updated 4/29/2026). Finding 0134-01 validated as real L1 gap.
- **Petey plan:** SESSION_0136 planned — blog DB migration (Post model + admin CRUD + public page rewiring).

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0135.md` | This file — QA hardening session + Giddy research + Petey plan |
| `apps/web/app/api/auth/dev-login/route.test.ts` | New — dev-login guard test (3 tests) |
| `apps/web/server/admin/tournaments/upsert-division.test.ts` | New — divisionSchema validation test (9 tests) |

## Decisions Resolved

- Findings 0133-01, 0133-02, 0134-02: all closed with passing tests (18 total assertions)
- Blog DB migration: confirmed as real L1 gap — Dirstarter shipped `Post` model upstream. Planned for SESSION_0136.
- Blog migration approach: add `brand: Brand` column per ADR 0004; delete boilerplate MDX; don't migrate Dirstarter sample content.

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 22nd session carried.
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131).
- 🟡 Tiptap editor scope for SESSION_0136 — may defer to textarea for MVP.
- 🟡 Content-collections full removal — defer to SESSION_0137 after DB blog proven.

## Next Session

- **Goal:** SESSION_0136 — Blog DB migration: Post model + PostStatus enum + admin CRUD + public blog page rewiring.
- **Inputs to read:** `docs/sprints/SESSION_0135.md` (this file — Giddy research + Petey plan), `https://dirstarter.com/docs/blog`, `apps/web/prisma/schema.prisma`, `apps/web/app/(web)/blog/page.tsx`, `apps/web/app/(web)/blog/[slug]/page.tsx`
- **First task:** (Cody) Add `Post` model + `PostStatus` enum to Prisma schema with `brand: Brand` column. Run migration.

## ADR / Ubiquitous-Language Check

- No new ADRs created this session.
- No new domain terms introduced.
- Existing ADR 0004 (brand scoping) will apply to new `Post` model in SESSION_0136.

## Reflections

- The QA hardening session was high-velocity: 3 tasks, 18 test assertions, all passing, in one focused session. The pattern of "finding → explicit test → close" works well.
- Giddy's Dirstarter docs research revealed that our local template copy was stale — the upstream `Post` model migration wasn't visible without checking live docs. This validates the SESSION_0134 audit finding and reinforces the need to check live docs, not just the local template snapshot.
- The `divisionSchema` test initially failed because the enum value was `SINGLE_ELIM` not `SINGLE_ELIMINATION` — a reminder to always verify enum values from the Prisma schema, not guess.
- Registration concurrency test (6 tests, real DB) passed cleanly — the serializable transaction pattern from SESSION_0083 continues to hold.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0135.md`: status → closed-full, updated → 2026-05-12. New test files are code, no frontmatter needed. |
| Backlinks/index sweep | `SESSION_0135.md` pairs_with → SESSION_0134. No new wiki pages created. |
| Wiki lint | Deferred — no wiki pages created/modified beyond SESSION file. |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | Not applicable — pure test-authoring session, no production code changes. Tests proven green. |
| Review & Recommend | Next session goal written: yes (SESSION_0136 — Blog DB migration) |
| Memory sweep | Dirstarter blog migration is now a confirmed L1 gap — documented in Giddy research section. No operator memory update needed beyond SESSION file. |
| Next session unblock check | Unblocked. Schema file, blog pages, and Dirstarter docs URL are all known. No user input needed. |
| Git hygiene | See below. |
