---
title: "SESSION 0485 — Blog vs posts surface consolidation + footer changelog link + first post (Dirty Dozen)"
slug: session-0485
type: session--implement
status: pending
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0484
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
| SESSION_0485_TASK_01 | pending | Footer → link the existing `/changelog` route (independent, ship first) |
| SESSION_0485_TASK_02 | pending | Review `Post`/`/blog` vs `ContentAtom+Variant`/`/posts`; decide BBL's canonical surface + consolidation plan |
| SESSION_0485_TASK_03 | pending | Publish "The Dirty Dozen" as the first post on the canonical surface (2026-05-30) |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- Surface fork (TASK_02) to resolve at bow-in.

## Next session

### Goal

TBD at bow-out.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence
