---
title: "ADR 0042 — Canonical public blog = Post/blog; ContentAtom stays the content-ops engine"
slug: adr-0042-canonical-blog-surface-post-over-contentatom
type: decision
status: accepted
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0485
deciders: Brian Scott
pairs_with:
  - docs/sprints/SESSION_0485.md
  - docs/architecture/decisions/0028-shared-listing-card-and-taxonomy.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - content
  - blog
  - source-of-truth
  - dirstarter
---

# ADR 0042 — Canonical public blog = `Post`/`/blog`; `ContentAtom` stays the content-ops engine

## Status

**Accepted** — 2026-07-01 (SESSION_0485). Operator-ratified.

## Context

BBL carried **two DB-backed public content surfaces**, both `Brand.BBL`, both under the `pages.blog`
i18n namespace (a real collision):

| Surface | Route | Model / read path | Shape |
| --- | --- | --- | --- |
| **Blog** (Dirstarter-native) | `/blog` → `findPublishedPosts` | **`Post`** | One row per article; `status`/`publishedAt`; wired into the shared listing taxonomy (`categories`/`tags`/`tools`), polymorphic `Bookmark` (Save), `author`. Full admin CRUD at `/app/posts` (`post-form.tsx`, markdown `content`). |
| **Posts** (BBLApp-parity) | `/posts` → `findPublishedContentPosts` | **`ContentAtom` + `ContentVariant`** | Headless content-ops model: an atom → multi-channel variants (`channel = BLOG/INSTAGRAM/YOUTUBE_*/…`), editorial workflow (`INBOX → APPROVED/PUBLISHED`), `ContentTask`, `ContentPublication`, `mediaAttachments`. Admin at `/app/content`. |

The `ContentAtom` model originates in the legacy monorepo's **content engine**
(`ronin-dojo-monorepo/RoninDashboard/content-engine/CONTENT_ATOM_CANON.md`, the JETTY/Obsidian content
pack): *"an atom is the smallest reusable unit of martial-arts knowledge that can be expanded into many
outputs; atoms are canonical, variants are derived, publications are operational proof."* It was built as
a **content-repurposing / distribution engine**, never as a company blog.

**Live state (prodsnap, SESSION_0485):** `Post` = **0 rows**; `ContentVariant` = **5 published, all
YouTube** (1 short + 4 long) across **4 atoms**, **zero** `BLOG`-channel variants; **0** media attached to
atoms. So `/posts` displayed nothing, and the atom engine was live purely for **video/social** — exactly
its designed purpose.

`nav-sheet.tsx` recorded that the operator had kept both routes "to compare" (SESSION_0416); the BBL
landing further markets `/posts` as a future **"BBL Posts Feed"** (member community feed) — a *third*
concept distinct from both an editorial blog and the repurposing engine.

## Decision

1. **`Post` / `/blog` is BBL's canonical public blog** (editorial articles). It is Dirstarter-native,
   WWAD-lean, already wired into the listing taxonomy + Save + author + admin CRUD. The first published
   post — *"The Dirty Dozen"* — lands here.
2. **`ContentAtom` / `ContentVariant` is retained as the internal content-ops engine** (multi-channel
   repurposing, editorial workflow, `ContentTask`, `ContentPublication`, `mediaAttachments`). It is **not**
   a blog and is **not retired** — it is live for YouTube/social and other surfaces hang off it. The
   `/app/content` admin stays.
3. **The public `/posts` BLOG-channel reader is retired** — `301` to `/blog` (`next.config.ts`), and its
   route + orphaned public read/render code (`app/(web)/posts/*`, `server/web/content-posts/*`,
   `components/web/content-posts/*`) are deleted. This resolves the `pages.blog` namespace collision and
   the two-sources-of-truth split. Because the BLOG channel had **zero** published content, this is a clean
   redirect — **no migration**.
4. Nav (`nav-sheet.tsx`) and the landing CTA (`bbl-landing-content.ts`) repoint to `/blog`.

If the content engine ever needs to publish an article publicly, it should **materialize a `Post`** (the
public read-model) rather than re-expose a public `ContentVariant` reader — mirroring the claim-refs
materialization pattern.

## Consequences

- **One public blog URL** (`/blog`), one i18n namespace owner, one Save/taxonomy integration. Old `/posts`
  links 301 cleanly (no live URLs to break — SEO-safe).
- **The engine keeps working.** Deleting only the *public reader* (not the model/admin) means YouTube/social
  variant workflows are untouched.
- **Follow-up (operator copy call, non-blocking):** the landing "BBL Posts Feed" promo still describes a
  *member community feed* ("members share techniques, tips, seminars, Q&A") while its CTA now points at the
  editorial blog. Either re-copy the promo to describe the blog, or build the member feed later and repoint.
  Flagged in SESSION_0485; not rewritten unilaterally (marketing copy is the operator's).
- Supersedes the "keep both to compare" holding pattern (SESSION_0416).
