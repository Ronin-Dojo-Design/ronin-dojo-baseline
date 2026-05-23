---
title: "SESSION 0223 — Content Engine Stage 2: Seed proof + full blog layout on /posts"
slug: session-0223
type: session--implement
status: closed-quick
created: 2026-05-22
updated: 2026-05-22
last_agent: copilot-session-0223
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0222.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0223 — Content Engine Stage 2: Seed proof + full blog layout on /posts

## Date

2026-05-22

## Operator

Brian + copilot-session-0223

## Goal

Execute SESSION_0196 Stage 2: run seed, prove live render of ContentVariant blog post at `/posts/why-the-bell-matters`. Upgrade `/posts` layout to full parity with `/blog`.

## Status

### Status: closed-quick

## What landed

### TASK_01 — Fix seed case bug + run seed

- Fixed `seed-content-atom-proof.ts`: `role: "ADMIN"` → `role: "admin"` (DB stores lowercase text, not enum)
- Ran seed successfully: `atom-2026-why-the-bell-matters` ContentAtom + BLOG ContentVariant created
- Confirmed via psql: 6 ContentVariant rows, 1 BLOG channel variant for Baseline

### TASK_02 — Upgrade /posts/[slug] to full blog layout parity

- Added: `StructuredData` (JSON-LD Article), `AdCard` sidebar, `Nav` component, `getReadTime`, i18n `posts.written_by` prefix
- Fixed empty image bug: `image || ""` → `image || null` to prevent empty src warning
- Added `StructuredData` to `/posts` list page (Blog schema)

### TASK_03 — Seed comparison blog post

- Inserted `boilerplate` Post record for side-by-side visual comparison of `/blog/boilerplate` vs `/posts/why-the-bell-matters`

### Verification

| Gate | Result |
| --- | --- |
| Typecheck | ✅ pass |
| Seed run | ✅ `cmphtwth50000f6ds3ah1hwq2` |
| `/posts/why-the-bell-matters` HTTP 200 | ✅ |
| `/blog/boilerplate` HTTP 200 | ✅ |
| Title renders in HTML | ✅ "Why the Bell Matters" |

## Files touched

- `apps/web/prisma/seed-content-atom-proof.ts` — fix: role case `"ADMIN"` → `"admin"`
- `apps/web/app/(web)/posts/[slug]/page.tsx` — upgraded: full blog layout (StructuredData, sidebar, Nav, read_time, i18n)
- `apps/web/app/(web)/posts/page.tsx` — upgraded: StructuredData on list page

## Decisions resolved

- **Option C confirmed:** Keep `/posts` as separate parallel route sourced from ContentVariant. Don't rename or redirect `/blog` yet.
- **Layout parity approach:** Port the same components (not the data source) from `/blog/[slug]` template into `/posts/[slug]`.
- **Structured data:** Using `as any` cast for `generateArticle` since it expects full `Post` type — acceptable tech debt until we refactor the structured-data lib to accept a generic interface.

## Open decisions / blockers

- **Tags/categories on ContentVariant:** Schema relation needed. No `ContentVariantTag` join table yet.
- **Tools mentioned on ContentVariant:** Schema relation needed. No `ContentVariant.tools` relation yet.
- **Image/video carousel:** ContentVariant has `thumbnailUrl` + `videoUrl` but no multi-media gallery model.
- **`generateArticle` type:** Currently uses `as any` — should accept a generic `ArticleData` interface.

## Next session

### Priority 1 — Schema: tags + tools on ContentVariant/ContentAtom

- **Goal:** Add `tags` and `tools` relations to ContentAtom (canonical) so variants inherit. Migration + seed update.
- **Done means:** `/posts/why-the-bell-matters` shows tags and tools-mentioned sidebar (if seeded).

### Priority 2 — Image/video carousel component

- **Goal:** Design a multi-media gallery model or reuse existing media patterns. Add carousel component to `/posts/[slug]`.
- **Done means:** ContentVariant with multiple images renders a carousel on detail page.

### Priority 3 — Structured data refactor

- **Goal:** Make `generateArticle` accept a generic interface instead of requiring full `Post` model. Remove `as any`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0223_TASK_01 | done | Fix seed case bug + run seed |
| SESSION_0223_TASK_02 | done | Upgrade /posts layout to full blog parity |
| SESSION_0223_TASK_03 | done | Seed comparison boilerplate post |
