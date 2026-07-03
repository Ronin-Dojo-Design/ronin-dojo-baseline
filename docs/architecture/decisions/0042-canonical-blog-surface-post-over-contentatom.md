---
title: "ADR 0042 — Canonical public blog = Post/blog; ContentAtom stays the content-ops engine"
slug: adr-0042-canonical-blog-surface-post-over-contentatom
type: decision
status: accepted
created: 2026-07-01
updated: 2026-07-03
last_agent: claude-session-0493
deciders: Brian Scott
pairs_with:
  - docs/sprints/SESSION_0485.md
  - docs/sprints/SESSION_0493.md
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

---

## Amendment 1 — `CommunityPost` is a sibling surface; `/posts` revives as the member feed (ACCEPTED — SESSION_0493)

> **Status of this amendment:** *accepted* (SESSION_0493). Operator-ratified in the SESSION_0493
> grill. The accepted core (§§1–4 above) is **unchanged** — `Post`/`/blog` remains the canonical
> editorial blog and `ContentAtom` remains the content-ops engine. This amendment *executes* the
> Consequences follow-up above ("build the member feed later and repoint") and *narrows* decision
> §3: the `/posts` **route** returns with a new owner; the retired `ContentVariant` BLOG reader
> stays retired.

### Context for the amendment

The original decision noted a *third* content concept distinct from both the editorial blog and
the repurposing engine: the landing page's promised **"BBL Posts Feed"** — a member community feed
("members share techniques, tips, seminars, Q&A"). SESSION_0485 shipped the 301s over an empty
`/posts` surface and flagged the promo/CTA mismatch as a follow-up rather than rewriting the
operator's marketing copy. SESSION_0493 builds that feed. The open design questions — one model or
a `Post` discriminator; one feed or per-school namespaces; how much moderation/visibility schema
ships in v1 — were grilled and operator-locked as follows.

### Amendment decision

1. **NEW `CommunityPost` model = the member community surface — a sibling to editorial `Post`,
   NOT a type discriminator on it.** A `Post.kind = EDITORIAL | COMMUNITY` union was rejected as
   the kind-union god-model ADR 0040 already killed at the component layer: the two surfaces
   diverge in author model (staff vs member), lifecycle (editorial workflow vs post-moderation),
   ranking (curated vs feed), and admin surface — near-total divergence, so a shared table would
   force every reader to filter on `kind` forever (the same "remember to filter or it leaks" bug
   class ADR 0035 closed for ranks). Editorial `/blog` (staff writes) and community `/posts`
   (members post) are **permanently distinct surfaces**.

2. **`/posts` REVIVES as the community feed.** The two 301 redirect blocks in
   `apps/web/next.config.ts` (`/posts` and `/posts/:slug*` → `/blog`, added at SESSION_0485) are
   **deleted** — they lived one day over an empty surface, existed to close a namespace collision
   that no longer exists, and there are no live external `/posts` URLs to preserve. Post detail
   lives at `/posts/[slug]`. This fulfills this ADR's own follow-up note verbatim: the landing
   "BBL Posts Feed" promo now points at the thing it describes.

3. **ONE global feed topology.** BBL is one community — one lineage family — so the feed is
   global. School-scoping = a **filter facet** on the feed, plus (later) a posts section on the
   school's existing `/directory/[slug]` profile. Reddit-style per-school `r/` namespaces are
   **REJECTED**: they fragment a small community, duplicate the directory's school surface, and
   solve a scale problem BBL does not have.

4. **MVP phase cut — no dormant schema.**
   - **Phase 1 (now):** feed + detail + create + save + share + post-moderation. Save = the
     polymorphic `Bookmark` with a new `COMMUNITY_POST` subject type (the ADR 0029 closed
     contract: discriminator value + real FK + `@@unique([userId, communityPostId])`). Share =
     client-only (no schema). Moderation = `PUBLISHED | HIDDEN` status with admin hide.
   - **Phase 2:** votes (score).
   - **Phase 3:** comments + report/block/hide moderation queue.
   - **No visibility tiers in the schema** — no dormant columns or enum values shipped ahead of
     the phase that reads them. Each phase adds its own columns when it lands (the
     `PostStatus.Scheduled` lesson: a value the system can enter but never honor is drift with a
     type signature).

5. **RSS deferred entirely.** No community RSS. `/blog/rss.xml` is logged as a cheap *editorial*
   follow-up, owned by the blog surface — not part of this lane.

6. **Follow-up ratified — admin route rename.** The editorial `Post` CRUD at `/app/posts` renames
   to **`/app/blog`**, so the mental model stays clean on both sides of the fence: `/blog` +
   `/app/blog` = editorial `Post`; `/posts` = community `CommunityPost`. (Route-move hygiene per
   the SESSION_0451 lesson: sweep stale `revalidatePath`/`redirect`/`Link` references to the old
   prefix.)

### Amendment consequences

- The landing "BBL Posts Feed" promo and its CTA finally agree — the copy mismatch flagged in the
  Consequences above resolves without rewriting marketing copy.
- `pages.blog` i18n namespace stays solely owned by the editorial blog; the community feed gets
  its own namespace — the original collision cannot recur.
- Deleting a 1-day-old 301 is SEO-safe (no indexed `/posts` URLs existed while it pointed at
  `/blog`).
- The materialization rule above is unchanged and now bidirectionally clean: the content engine
  publishes public articles by materializing a `Post`; community posts are member-authored
  `CommunityPost` rows. Neither writes into the other's table.
- `BookmarkSubjectType` gains `COMMUNITY_POST` — an explicit, additive extension of the platform
  Save seam (backfill-free; mirrors the SESSION_0397 discriminator migration pattern).

### Alternatives rejected (amendment)

- **`Post.kind` discriminator (one table, two surfaces).** Rejected — the kind-union god-model
  (ADR 0040); every query, index, admin view, and authz check forks on `kind` forever, and a
  missed filter leaks member posts into the editorial blog (or vice versa).
- **Reuse `ContentAtom` for community posts.** Rejected — the atom is a staff content-ops engine
  with an editorial workflow (§2 above); member posts have neither variants nor channels.
- **Per-school `r/` namespaces.** Rejected — one community/one lineage family; school scoping is
  a facet, not a topology.
- **Keep `/posts` → `/blog` and mount the feed elsewhere (e.g. `/community`).** Rejected — the
  landing page has marketed `/posts` as the member feed since SESSION_0416; the redirect was a
  1-day placeholder over an empty surface, not an established URL contract.

### Ubiquitous language (amendment)

- **Community post** — a member-authored `CommunityPost` on the `/posts` feed. Post-moderated
  (`PUBLISHED | HIDDEN`), saveable (`Bookmark` `COMMUNITY_POST`), never editorial.
- **Editorial post** — a staff-authored `Post` on `/blog`, managed at `/app/blog`. The two never
  share a table.
- **Post-moderation** — publish-first, hide-on-review (`HIDDEN` by admin action) — as opposed to
  pre-moderated editorial workflow.
