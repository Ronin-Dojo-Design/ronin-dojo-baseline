---
title: "Petey Plan 0493 — BBLApp community posts feed + member profile ancestry timeline"
slug: petey-plan-0493
type: petey-plan
status: staged
created: 2026-07-02
updated: 2026-07-02
last_agent: claude-session-0492
pairs_with:
  - docs/sprints/SESSION_0492.md
  - docs/architecture/decisions/0042-canonical-blog-surface-post-over-contentatom.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0493 — community posts feed + profile ancestry timeline

Prestaged at SESSION_0492 (operator). Two operator lanes. **Operator wants Fable 5** for the community
feed (Item B). Both are real features (schema-touching) → each its own build; likely multi-session.
Sequence at operator discretion — likely B on Fable 5 first (explicit ask), A as its own lane.

Approved mockups already built + shown (widgets `bbl_blog_bblapp_posts_feed_faithful`,
`bbl_member_lineage_ancestry_timeline`).

═══════════════════════════════════════════════════════════════════════════════════
## ITEM B — FULL BBLApp COMMUNITY POSTS FEED (operator priority, Fable 5)
═══════════════════════════════════════════════════════════════════════════════════

Bring the legacy BBLApp posts feed forward as a real community product in `apps/web`. **Distinct from the
editorial `/blog`** (shipped 0492 — staff articles). This is member-generated content with engagement.
Reference impl (READ-ONLY, faithful): `ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/posts/`
— `BBLPostsFeed.jsx`, `TechniquePostCard`, `TechniquePostCreator`, `data/postOptions.js`,
`hooks/useEngagementStore`, `shared/ShareDrawer`. Header comment states inspiration: YouTube / Reddit / X.

### Feature set (from the real component)
- **Post types** (flair, each w/ icon): Technique · Tip · Seminar · Q&A.
- **Filters:** type tabs + style/discipline filter + grid/list view toggle + mobile filter drawer.
- **Engagement (Reddit-style):** upvote/downvote → score, like, save/bookmark, comment, share.
- **Create post:** creator modal (desktop button + mobile FAB) — member authorship.
- **Moderation / social:** action sheet = Follow post, Save, Copy text, Report, Block, Hide. Share drawer.
- Sort by hot / new / top. Sticky filter bar. Hero-image header band.

### Data-model work (the real cost; schema-touching → hand-author migration + `migrate diff` shadow-replay)
- **Post types:** add a `type`/`kind` discriminator to the post model OR a sibling `CommunityPost` model.
- **Engagement:** votes (up/down → score), saves (reuse polymorphic `Bookmark` per
  [[listing-card-is-the-one-card]]), comments (NEW model), shares. Server-side engagement store.
- **Moderation:** member authorship → report/hide/block + a mod queue + spam/abuse authz.
- **Auth:** create-post = signed-in member; moderation = a role/grant.

### Open forks to grill FIRST (Giddy/ADR)
1. **ADR 0042 reconciliation** — 0042 made editorial `Post`/`/blog` canonical + RETIRED `/posts` (301→/blog)
   + kept `ContentAtom`/`Variant` as the content-ops engine. The community feed is NOT the editorial `Post`.
   Decide: extend `Post` with a type discriminator + member author, vs a new `CommunityPost` model. Likely
   needs an **ADR 0042 amendment**.
2. **Route/surface** — retired `/posts` vs `/community` vs `/feed` (+ the ADR amendment).
3. **MVP cut** — types + feed + create + save FIRST; then voting → comments → moderation. (Multi-session.)
4. **Editorial `/blog` vs community feed stay DISTINCT** (operator confirmed "both") — confirm no merge into
   one "Article-typed" feed.

### Approach (Fable 5)
Petey plan → grill the forks above → MVP first. Consider a Workflow for the fan-out. Explicit push auth.

═══════════════════════════════════════════════════════════════════════════════════
## ITEM A — Member profile ancestry timeline (Tony Hua ×2 request)
═══════════════════════════════════════════════════════════════════════════════════

The vertical lineage timeline (member → instructor → … → founder) — the hand-coded/BeaverBuilder design
Tony + the black belts loved (ref screenshots: Carlos Sr → Carlos Jr → Rigan → Bob Bass → Tony; circular
headshots on a connecting vertical line; brand-red italic name; flat belt-rank bar w/ degree stripes;
discipline subtitle; optional narrative event caption between nodes).

### Decisions locked (operator, 0492)
- Belt rendering = **data-driven SVG BeltSwatch** (NOT the PNG set — only `Coral-Belt.png` is in git; the
  full per-rank PNGs live in WP media / operator's local, not repo).
- Public / no-account (funnel-first: logged-out sees lineage → claim/join CTA).
- Profile page ALREADY EXISTS at `app/(web)/directory/[slug]` (hero/about/ranks/orgs/social) — this ADDS an
  ancestry-timeline section; it does not create the page.

### Build spec
1. **Recursive ancestry-walk query** (NEW — none exists; profile loads ONE level up via
   `relationshipsTo[0].fromNode`). Walk up to the root/founder; cap depth (~12) + cycle guard; filter
   `fromNode.visibility === PUBLIC`. Model: `LineageNode.relationshipsTo` (INSTRUCTOR_STUDENT edges),
   payload `server/web/lineage/payloads.ts` (`lineageNodeProfilePayload`). Return ordered [founder … member]
   with per-node: displayName, avatarUrl (`passport.avatarUrl ?? user.image`), top rank (`memberTopRank`),
   discipline, + optional edge narrative.
2. **BeltSwatch — new flat rank-bar variant** (current `bar` = folded belt + knot, wrong shape). Data-driven
   from `Rank.colorHex`. **SCHEMA DECISION (grill):** `Rank` has NO `degree`/`stripes` field → to render
   "8th degree" stripes data-driven, RECOMMEND adding an additive nullable `degree Int?` to `Rank`
   (hand-author migration + shadow-replay; shared DB, NEVER `migrate dev`). Alt: parse degree from name
   (fragile) or color-only (no stripes).
3. **`LineageAncestryTimeline` component** — vertical timeline: connecting line + circular avatar nodes +
   red-italic name + rank-bar BeltSwatch + discipline subtitle + owner highlight ("this member") + optional
   edge-narrative caption. Reuse L1 primitives; `motion/react` + reduced-motion fallback.
4. **Integrate** into `app/(web)/directory/[slug]` (public). Also candidate for the lineage profile drawer.

### Verify
Headless/live-DOM render of `/directory/[slug]` for a member with a real up-chain (Tony Hua → Bob Bass →
Rigan → Carlos Jr → Carlos Sr). Data-driven belt colors correct; no N+1 on the walk; public render works.

## Boundaries (both)
Each its own focused lane/session. Shared DB: hand-author migration + `migrate diff` shadow-replay only.
Explicit push authorization. `../ronin-dojo-monorepo` READ-ONLY.
