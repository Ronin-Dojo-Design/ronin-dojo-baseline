---
title: "SESSION 0493 — BBLApp community posts feed + member profile ancestry timeline"
slug: session-0493
type: session--implement
status: closed
created: 2026-07-02
updated: 2026-07-03
last_agent: claude-session-0493
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0492.md
  - docs/petey-plan-0493-community-feed-and-profile-timeline.md
  - docs/architecture/decisions/0042-canonical-blog-surface-post-over-contentatom.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0493 — community posts feed + profile ancestry timeline

## Date

2026-07-02

## Operator

Brian + claude-session-0493

## Goal

Execute `docs/petey-plan-0493-community-feed-and-profile-timeline.md` — two operator-staged, genuinely
disjoint lanes: **Item B** (full BBLApp community posts feed as a real member-generated product in
`apps/web`, distinct from editorial `/blog`; operator priority, Fable 5) and **Item A** (member profile
ancestry timeline on `/directory/[slug]`). Petey grills the genuinely-open forks (Item B: ADR 0042
reconciliation — extend `Post` vs new `CommunityPost` + route + MVP cut; Item A: `Rank.degree` schema
decision + sequencing) BEFORE any build, then dispatches Cody build / Desi design / Doug verify / Giddy
git-arch, parallelizing the two disjoint lanes where safe. Hold at the push gate for the operator's go.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0492.md` (belt-rebase FIX session — all 6 quality-loop
  findings closed + V6 GREEN + ADR 0035 Amendment 1 accepted; prod-QA FI-010–015 + blog re-skin + dark
  theme shipped; three branches squash-merged #185/#186/#187, prod smoke green).
- Carryover: SESSION_0492's `Next session` block = this session's two lanes, prestaged into
  `docs/petey-plan-0493-community-feed-and-profile-timeline.md` (mockups already built + approved).

### Branch and worktree

- Branch: `session-0493-community-feed` (created off `origin/main` @ `0f4d9af5`).
- Worktree: `/Users/brianscott/dev/ronin-0493` (fresh — bootstrapped: `bun install` + canonical `.env`
  copy + `prisma generate`).
- Status at bow-in: clean.
- Current HEAD at bow-in: `0f4d9af5` (docs: prestage petey-plan-0493).
- **DO NOT TOUCH:** `../ronin-0491` (frozen belt-rebase), `../ronin-0492`, `../ronin-0485-blog`,
  `../ronin-0477`; `../ronin-dojo-monorepo` READ-ONLY (harvest source only). Shared local DB
  (`localhost:5432`) across all worktrees → NEVER `migrate dev`; hand-author migrations + `migrate diff`
  shadow-replay only.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content/Blog (community feed relative to editorial `Post`/`/blog`), Prisma (schema-touching both lanes), Auth/RBAC (create-post + moderation authz), Media (post images) |
| Extension or replacement | Extension — Item B adds a community surface distinct from editorial `/blog`; Item A adds a section to the existing `/directory/[slug]` page + a new `BeltSwatch` variant |
| Why justified | Both are net-new member features on top of the shipped blog/lineage spines; reuse-first (polymorphic `Bookmark`, `memberTopRank`, L1 primitives) per the design-system doctrine |
| Risk if bypassed | Item B mis-merged into editorial `Post` would collapse two distinct surfaces (ADR 0042); Item A rebuilding a lineage walk that could reuse existing payloads |

Live docs checked during planning: Content/Blog (ADR 0042 reconciliation), Prisma (both migrations),
Auth/RBAC (create-post + moderation), Media (post images).

### Graphify check

- Graph status: **not built in this worktree** (fresh worktree — graphify returns 0 nodes; the graph
  lives in the canonical checkout). Discovery is direct-inspection via two parallel Explore agents (Item A
  + Item B landscape maps). Canonical graph refreshed at bow-out.

### Grill outcome

All 6 forks resolved with the operator (AskUserQuestion + /grill-me, one-at-a-time):

1. **Data model: NEW `CommunityPost` model** (sibling to editorial `Post`; avoids the kind-union
   god-model; engagement FKs onto it cleanly). ADR 0042 Amendment 1 documents it.
2. **Topology: ONE global feed** — BBL is one community (one lineage family). School-scoping = a
   `?school=` facet now + a posts section on the school's existing `/directory/[slug]` profile later.
   Reddit `r/` namespace model REJECTED (solves a many-unrelated-communities problem BBL doesn't have).
3. **Route: revive `/posts`** (legacy "BBL Posts Feed" name; ADR 0042's own follow-up anticipated the
   repoint; the 301 was 1 day old over an empty surface — delete the two redirect blocks). Detail at
   `/posts/[slug]`. Mental model: `/blog` = staff writes, `/posts` = members post. Tail fix: rename admin
   `/app/posts` → `/app/blog` at end of goal (with 0451 revalidatePath sweep).
4. **RSS: deferred entirely** — orthogonal to route; `/blog/rss.xml` logged as a cheap blog follow-up.
5. **`Rank.degree Int?` — ADD** (additive nullable; data-driven degree stripes). PLUS new deliverable:
   `docs/runbooks/schema-breakdown-runbook.md` — professional schema-design teaching doc (enums, FKs,
   relations, what we do well/poorly, vertical slices + DDD per
   https://tkdodo.eu/blog/the-vertical-codebase — "code that changes together should live together").
6. **Sequencing: both lanes in parallel** in this worktree; schema.prisma edits SERIALIZED in one task
   (T01) since it's the only shared file. **MVP cut locked:** feed + detail + create + save (polymorphic
   `Bookmark` — POST-subject pattern proven in 0492) + share (client-only, free) + post-moderation
   (`PUBLISHED|HIDDEN`, publish immediately, admin hide); votes = phase 2; comments + report/block/hide
   mod queue = phase 3; visibility tiers OMITTED from schema (no dormant columns); vote UI absent (not
   grayed) from MVP card.

## Petey plan

### Goal

Grill the open forks, then build Item B (community feed MVP) + Item A (ancestry timeline) as two disjoint
lanes, verify each on the live DOM + SoT, hold at the push gate.

### Tasks

#### SESSION_0493_TASK_01 — Schema slice (T01)

- **Agent:** Cody
- **What:** `CommunityPost` model (+ `CommunityPostType` TECHNIQUE/TIP/SEMINAR/QA, status
  `PUBLISHED|HIDDEN`, User author, brand, unique slug) + `BookmarkSubjectType.COMMUNITY_POST` (+ FK +
  `@@unique` + relation) + `Rank.degree Int?`. Two hand-authored migrations + `migrate diff`
  shadow-replay. NEVER `migrate dev`. Serializes ALL `schema.prisma` edits for both lanes.
- **Done means:** shadow-replay clean; `prisma generate` green; typecheck green.
- **Depends on:** nothing.

#### SESSION_0493_TASK_02 — Giddy schema audit + ADR amendment content (T02)

- **Agent:** Giddy (read-only)
- **What:** Schema audit (well/poorly: enums, FKs, relations, polymorphic contracts, vertical-slice fit)
  for the runbook + ADR 0042 Amendment 1 content.
- **Done means:** structured findings + amendment draft returned for T03.
- **Depends on:** nothing (parallel with T01).

#### SESSION_0493_TASK_03 — Write ADR 0042 Amendment 1 + schema-breakdown-runbook.md (T03)

- **Agent:** Cody (docs)
- **What:** ADR amendment into `docs/architecture/decisions/0042-*.md`; new
  `docs/runbooks/schema-breakdown-runbook.md` teaching doc (grounded in T02 audit + tkdodo article).
- **Done means:** both docs written, wiki-lint compliant.
- **Depends on:** SESSION_0493_TASK_02.

#### SESSION_0493_TASK_04 — Community feed vertical slice (T04)

- **Agent:** Cody
- **What:** `/posts` feed (flair tabs, style filter, grid/list, new sort, hero band) + `/posts/[slug]`
  detail + create modal (signed-in, desktop button + mobile FAB) + save (`ListingSaveButton` /
  `Bookmark` COMMUNITY_POST) + client-only ShareDrawer + lean admin hide + delete the two 301 blocks in
  `next.config.ts`. Vertical layout: `server/web/community` + `components/web/community` +
  `app/(web)/posts`.
- **Done means:** end-to-end member flow works on live DOM; gates green.
- **Depends on:** SESSION_0493_TASK_01.

#### SESSION_0493_TASK_05 — Ancestry timeline vertical slice (T05)

- **Agent:** Cody (parallel lane, disjoint files)
- **What:** Recursive ancestry walk UP (`relationshipsTo`, INSTRUCTOR_STUDENT, PUBLIC-only, depth cap
  ~12 + cycle guard) → ordered [founder…member]; `BeltSwatch` new `flat-bar` variant (flat bar + degree
  stripes); `LineageAncestryTimeline` section; integrate after Ranks on `/directory/[slug]`. Degree
  wiring lands after T01.
- **Done means:** public live-DOM render of a real up-chain; no N+1.
- **Depends on:** nothing to start; T01 for degree wiring.

#### SESSION_0493_TASK_06 — Desi design review (T06)

- **Agent:** Desi
- **What:** Both surfaces vs approved mockups; L1 reuse audit; empty states; mobile.
- **Done means:** prioritized fix list; fixes applied by Cody.
- **Depends on:** SESSION_0493_TASK_04, SESSION_0493_TASK_05.

#### SESSION_0493_TASK_07 — Doug verify (T07)

- **Agent:** Doug
- **What:** Full gates, migration shadow-replay re-verify, live-DOM headless verify (feed + create +
  save + share; ancestry chain Tony Hua → Bob Bass → Rigan → Carlos Jr → Carlos Sr), authz checks.
- **Done means:** launch-safe verdict with evidence.
- **Depends on:** SESSION_0493_TASK_04, SESSION_0493_TASK_05.

#### SESSION_0493_TASK_08 — Tail: `/app/posts` → `/app/blog` rename (T08)

- **Agent:** Cody
- **What:** Move editorial-Post admin CRUD; grep old prefix in revalidatePath/redirect/Link (0451).
- **Done means:** admin surface at `/app/blog`; no stale revalidate paths.
- **Depends on:** SESSION_0493_TASK_04.

#### SESSION_0493_TASK_09 — Bow-out + push gate (T09)

- **Agent:** Petey (lead)
- **What:** Full close, graphify update in canonical checkout, stage+commit, HOLD for operator go.
- **Depends on:** SESSION_0493_TASK_03, 07, 08.

### Parallelism

- **Wave 1 (parallel, disjoint):** T01 (prisma only) ∥ T02 (read-only) ∥ T05 (lineage/BeltSwatch files).
- **Wave 2:** T04 (needs generated client) ∥ T03 (needs T02).
- **Wave 3:** T06 ∥ T07 → T08 → T09. All in THIS worktree; `schema.prisma` serialized in T01.

### Open decisions

- **Local-DB apply for live verify: RESOLVED (operator-ratified).** Apply the two additive migrations
  locally via `bunx prisma migrate deploy` for live-DOM verification. The operator challenged the 0487
  blanket "never apply to the shared DB" rule as unexplained; root cause traced (the real landmine =
  `migrate dev`'s auto-RESET on drift across divergent parallel worktrees — a 0487 incident), rule
  narrowed + rationale encoded in the `parallel-session-shared-db-migrate-dev-reset-trap` memory:
  `migrate dev` banned always; `migrate deploy` fine when additive / no schema-divergent lane live.
  New standing feedback memory: `rules-must-carry-their-why`.

### Risks

- Shared local DB — no `migrate dev`; both lanes are schema-touching → hand-author + shadow-replay.
- Item B moderation/authz is a public-write surface (member-generated content) → spam/abuse + authz care.

### Scope guard

- ❌ No push / merge / deploy / PR without the operator's explicit "go".
- ❌ No `migrate dev`; no shared-DB or prod/Neon/Vercel/Stripe/DNS mutation.
- ❌ No touching `../ronin-0491` / `../ronin-0492` / `../ronin-0485-blog` / `../ronin-0477`;
  `../ronin-dojo-monorepo` READ-ONLY.
- ❌ No merging editorial `/blog` and the community feed into one surface (operator confirmed distinct).

## Pre-flight: Schema — CommunityPost + Bookmark COMMUNITY_POST subject + Rank.degree (TASK_01)

### 1. Petey invocation

- [x] Petey plan exists in SESSION file with task IDs (SESSION_0493_TASK_01; design operator-locked
  in the grill outcome §1/§5/§6)

### 2. Design doc check

- Design doc consulted: `docs/petey-plan-0493-community-feed-and-profile-timeline.md` (via SESSION
  file Petey plan) + operator-locked spec in the T01 dispatch
- Models match design doc: yes — new sibling `CommunityPost` (NOT a `Post` kind-union), post-moderation
  `PUBLISHED|HIDDEN`, no dormant columns (no publishedAt/tags/votes/comments/visibility)

### 3. Existing schema scan

- Current model count: 127
- Related existing models: `Post` (schema.prisma:4083 — cuid2 + `title String @db.Citext` +
  `slug String @unique` + `brand Brand` idioms), `Bookmark` (:353), `Rank` (:1302), `Style` (:2574),
  `User` (:68)
- Back-relations needed: `User.communityPosts CommunityPost[]` (author), `Style.communityPosts
  CommunityPost[]` (optional style), `CommunityPost.bookmarks Bookmark[]`
- **Schema spot-check** (read from `schema.prisma` directly):
  - `BookmarkSubjectType` enum: `TOOL, PERSON, ORGANIZATION, TECHNIQUE, POST, TREE` (:344)
  - `Brand` enum: `RONIN_DOJO_DESIGN, BASELINE_MARTIAL_ARTS, BBL, WEKAF` (:414)
  - `Style` EXISTS as a standalone model (:2574, `StyleStatus APPROVED|PENDING|REJECTED`,
    FK `disciplineId`; back-relation list: `memberships, contentAtoms, techniques, lineageTrees`)
    → `styleId` FK target confirmed (same target ContentAtom uses, :3208)
  - `Rank` (:1302): `sortOrder Int`, `colorHex String?`, NO `degree` field — additive `degree Int?` safe
  - `Bookmark` POST wiring to mirror: `post Post? @relation(... onDelete: Cascade)` + `postId String?`
    + `@@unique([userId, postId])` + `@@index([postId])`
  - `User` back-relation anchor: `posts Post[]` (:164, `// Blog` block)

### 4. Runbook consulted

- [x] `docs/runbooks/database/schema-migration.md` read
- [x] `docs/runbooks/database/prisma-workflow.md` (shadow-DB notes) read
- Migration strategy: **hand-authored migration files + `migrate diff` shadow-replay** (NEVER
  `migrate dev` — shared local DB across worktrees, 0487 memory). Timestamps bumped
  (`20260702090000`, `20260702091000`) to dodge same-date collisions from other lanes.

### 5. Data flow reference

- [x] `sop-data-and-wiring-flows.md` — flow: listing/save (polymorphic Bookmark, ADR 0028/0029)
- [x] `sop-e2e-user-lifecycle.md` — lifecycle stage: signed-in member engagement (post + save)

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0021 (migration-file-must-ship path) + SESSION_0487
  migrate-dev-reset-trap memory
- Mitigation acknowledged: yes — migration FILES committed on this branch; no `migrate dev`; no
  writes to the shared `localhost:5432` prodsnap DB; shadow-replay against a throwaway
  `ronindojo_shadow_0493` DB, dropped after

## Pre-flight: LineageAncestryTimeline + BeltSwatch flat-bar (SESSION_0493_TASK_05)

### 1. Existing component scan

- Searched `components/web/lineage/` for: timeline, ancestor, spine, avatar, motion
- Searched `components/common/` for: belt-swatch, avatar, heading, stack, badge
- Found: `lineage-cohort-timeline/ancestor-spine.tsx` (closest visual precedent — vertical
  ancestor column w/ CardAvatar + italic BBL-heading name + BeltSwatch, but bound to the
  VISUAL-tree `LineageVisualNode` model, client-walked — different data structure, reference
  only); `card-avatar.tsx` (belt-ringed Avatar idiom); `lineage-honor-strip.tsx` (motion +
  reduced-motion idiom); `belt-swatch.tsx` (dot/bar variants — `bar` is the folded-belt +
  knot cinematic shape, WRONG for the flat rank-bar → additive `flat-bar` variant).

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes (no L1
  timeline primitive exists)
- Searched `dirstarter_template/components/`: no vertical-timeline pattern; closest is
  card/list composition
- Closest L1 pattern: section composition per `ranks-section.tsx` (`Section` + `H4` + `Stack`)
- **Primitive API spot-check:**
  - `Avatar` (`components/common/avatar.tsx`): compound `Avatar` (span, default
    `size-10 rounded-md bg-accent` — needs `rounded-full` override for circular),
    `AvatarImage (src, alt)` — SSR `<img>` (0475), `AvatarFallback (children)`.
  - `BeltSwatch` (`components/common/belt-swatch.tsx`): `colorHex?: string|null`,
    `className?`, `variant?: "dot"|"bar"`, `shimmer?: boolean`; currentColor +
    `text-muted` fallback idiom when colorHex null.
  - `Badge` (`badge.tsx`): `variant: primary|soft|outline|success|warning|info|danger`,
    `size: sm|md|lg`, `prefix`, `suffix`.
  - `Stack` (`stack.tsx`): `size: xs|sm|md|lg`, `direction: row|column`, `wrap`, `render`.
  - `H4` (`heading.tsx`): `size`, Base UI `render`.
  - `Section` (`components/web/ui/section.tsx`): `Wrapper` grid compound
    (`Section`/`Section.Content`/`Section.Sidebar`) — used bare by the profile sections.
  - Motion idiom: `useReducedMotion` from `@mantine/hooks` + `motion` from `motion/react`,
    `initial={reduceMotion ? false : {...}}` + `duration: 0` fallback (honor-strip).
  - Brand red = `text-primary` token (BBL `--color-primary: hsl(1 79% 51%)` from the
    BrandSettings injection) — never a hardcoded red literal.

### 3. Composition decision

- [x] Extending existing component: `BeltSwatch` (additive `flat-bar` variant + `degree` prop)
- [x] Composing existing components: `Avatar`/`AvatarImage`/`AvatarFallback`, `Stack`,
  `Badge`, `Section`, `H4`, canvas-model helpers (`memberTopRankAward`, `memberInitials`),
  `projectPublicPassport` (the ONE public redaction audit point)
- [x] New component, no L1 match exists (justify): `LineageAncestryTimeline` — no vertical
  person-chain timeline exists; `ancestor-spine.tsx` is bound to the visual-tree client
  model, not a server ancestry walk

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" → petey-plan-0493 Item A read
- [x] Wiki entries: dirstarter-component-inventory; ADR 0035 (awarded-truth rank display)
- [x] Runbook consulted: `sop-test-writing.md` (§1 taxonomy, §2 runner — pure-projection
  test, no DB fixtures)

### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` (from `apps/web/`) — NOT started this task (T05
  gates = typecheck + scoped tests only; live-DOM verify is Doug's T07)
- Working directory: `/Users/brianscott/dev/ronin-0493/apps/web`
- Brand/host for testing: BBL (localhost:3000) — deferred to T07
- Verification commands confirmed: `bun run typecheck`, `bun run lint`,
  `bun run test <path>` (never bare multi-file `bun test`, FS-0027)

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (raw HTML over inventory components), FS-0008
  (primitive props not spot-checked), FS-0027 (bare parallel `bun test`)
- Mitigation acknowledged: yes — props recorded above; inventory consulted; single-file
  `bun run test` only

## Pre-flight: Backend — recursive ancestry walk (SESSION_0493_TASK_05)

### 1. Auth predicates planned

- [x] Session auth required: NO — public funnel-first read (logged-out must render)
- [x] Org membership verified: N/A (read-only public lineage data)
- [x] Brand column filtered: N/A — `LineageNode` has no brand column; scope = PUBLIC
  visibility only, same as every cached public lineage read
- Authorization approach: viewer-agnostic `"use cache"` read, hard-coded
  `visibility: PUBLIC` on the base node, every traversed edge's `fromNode`, and the final
  batch fetch (the `getLineageTreeForUser` precedent); per-node rank redaction through
  `projectPublicPassport` (`showRanks === false` → rank withheld, SESSION_0266 idiom)

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes (via inventory §9b —
  `server/web/{entity}` vertical-slice file layout)
- Searched `server/web/lineage/` for: ancestry, walk, BFS, recursive
- Related existing actions: `queries.ts:getLineageTreeForUser` (iterative level-batched BFS,
  depth cap, visibility filter — THE reference), `payloads.ts:lineageNodeProfilePayload`
  (one-level `relationshipsTo` only — no recursive walk exists)
- L1 pattern match: public cached query (`"use cache"` + `cacheTag("lineage", …)` +
  `cacheLife("minutes")`), own vertical-slice file `ancestry.ts`

### 3. Data flow reference

- [x] `sop-data-and-wiring-flows.md` — flow: public read-model query → server loader →
  section component (same as `loadDirectoryProfile` → sections)
- [x] `sop-e2e-user-lifecycle.md` — lifecycle stage: public directory browsing /
  claim-funnel entry (pre-registration)

### 4. FAILED_STEPS check

- Prior failures in this area: none specific to lineage queries
- Manual Boundary Registry entries: none

## Pre-flight: Community feed vertical slice (SESSION_0493_TASK_04)

### 1. Existing component scan

- Searched `components/web/` for: post-feed, post-card, post-row, share, dialog, save button, listing card
- Searched `components/common/` for: dialog, dropdown-menu, select, data-select, badge, form, textarea, qr-share-button
- Found: `components/web/posts/{post-feed,post-card,post-row}.tsx` (SESSION_0492 BBLApp feed layout —
  the direct model for the community feed/card/row), `ListingCard` + `ListingSaveButton` (the ONE
  catalog card + Save button; COMMUNITY_POST already accepted), `Author`, `EmptyList`, `Sticky`, `Grid`,
  `Intro`, `Markdown` (blog detail renderer), `tool-report-dialog.tsx` (the dialog-form +
  LoginDialog-gate idiom), `qr-share-button.tsx` (copy-link only — QR-specific, not a general share
  menu), `DataSelect` (id-valued Select), `DropdownMenu` (Base UI, `render` triggers).

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes (via inventory §§8–9b patterns)
- Searched `dirstarter_template/components/` equivalents via the inventory: posts (PostCard/PostList),
  dialogs (ToolReportDialog), safe-action chain §8
- Closest L1 pattern: blog feed re-skin (`post-feed.tsx` → community-feed), `ListingCard` adapter
  (`post-card.tsx` → community-post-card), `PostRow` (→ community-post-row), `ToolReportDialog`
  (→ create-post dialog), gold-standard form = `useHookFormAction` + `Form`/`FormField`
- **Primitive API spot-check:**
  `Badge (variant: primary|soft|outline|success|caution|warning|info|danger, size: sm|md|lg, prefix, suffix)`;
  `Button (variant: primary|secondary|destructive|ghost, size: sm|md|lg, prefix, suffix, isPending)`;
  `ListingCard (href, name, mediaTop, media, headerBadges, tagline, categories, statusBadges, description, viewLabel, save, footer)`;
  `ListingSaveButton (subjectType: BookmarkSubjectTypeInput, subjectId, label?, showLabel?)`;
  `Author (name, image?, url?, note?, prefix?)`;
  `DataSelect (options: {value,label,content?,disabled?}[], placeholder, size, id, disabled, + Select root props value/onValueChange)`;
  `Dialog/DialogContent/DialogTrigger(render)/DialogHeader/DialogTitle/DialogDescription/DialogFooter`;
  `DropdownMenu/DropdownMenuTrigger(render)/DropdownMenuContent/DropdownMenuItem` (Base UI Menu);
  `Sticky (isOverlay, className)`; `Grid (div grid 1/2/3 cols)`; `EmptyList (children)`;
  `TextArea`, `Input`, `Form/FormField/FormItem/FormLabel/FormControl/FormMessage`.

### 3. Composition decision

- [x] Composing existing components: `ListingCard` + `ListingSaveButton` + `Author` + `Badge` +
  `Card` (row density) + `Dialog` + `Form*` + `DataSelect` + `DropdownMenu` + `Sticky` + `Grid` +
  `EmptyList` + `Markdown` + `Intro`/`Section`/`Breadcrumbs`
- New files are thin adapters/compositions in `components/web/community/` (mirrors the sanctioned
  `components/web/posts/` SESSION_0492 lane): community-feed, community-post-card, community-post-row,
  create dialog, share menu (harvested from legacy `ShareDrawer` logic → token-based `DropdownMenu`;
  no share primitive exists in-repo — `qr-share-button` is QR-specific), admin hide menu.
- Flair color adaptation (tokens-are-the-contract): legacy technique=blue → `info`, tip=amber →
  `caution`, seminar=purple → `warning` (no purple token variant exists; warning is the nearest
  distinct token), qa=green → `success`. Icons: Swords/Lightbulb/GraduationCap/HelpCircle (lucide).

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" block read (petey-plan-0493 prestage + this file's Petey plan T04)
- [x] Wiki entries read: dirstarter-component-inventory.md; ADR 0042 Amendment 1 (accepted)
- [x] Runbook consulted: N/A (no schema/migration work in this lane — schema landed in TASK_01)
- Legacy reference read (READ-ONLY): `ronin-dojo-monorepo` BBLPostsFeed.jsx + postOptions.js +
  ShareDrawer.jsx

### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` (from `apps/web/`) — NOT started in this lane (Doug owns live verify)
- Working directory: `/Users/brianscott/dev/ronin-0493/apps/web`
- Brand/host for testing: bbl.local:3000 (Doug's live-DOM pass)
- Verification commands confirmed: `bun run typecheck`, `bun run lint`, `bun run test <files>` (= `--parallel=1`)
- Tests: read `sop-test-writing.md` §3/§5 — safe-action harness = `installSafeActionMocks` +
  `setTestSession` (`lib/test/safe-action-env.ts`), db stubbed per `media.safe-action.test.ts` /
  `passport-avatar.safe-action.test.ts` precedent

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (raw HTML when a common component exists — mitigated by §2/§3
  above), FS-0002 (dev server cmd — not starting one), FS-0008 (primitive/schema inference — mitigated:
  enums + props read from source, pasted above), FS-0027 (bare multi-file `bun test` — will use
  `bun run test`), post-seed slug gotcha (uniqueSlugsExtension covers Tool/Category/Tag/Post ONLY —
  CommunityPost is NOT slugged by the extension, so the create action generates its slug explicitly
  via `generateUniqueSlug` and is immune to the UPDATE re-slug trap)
- Mitigation acknowledged: yes

## Pre-flight: Backend — community post create/hide/upload actions (SESSION_0493_TASK_04)

### 1. Auth predicates planned

- [x] Session auth required: `createCommunityPost` + `uploadCommunityPostImage` = `userActionClient`
  (signed-in members); `setCommunityPostStatus` (hide/unhide) = `adminActionClient` (role === "admin")
- [x] Org membership verified: N/A — the feed is ONE global community (ADR 0042 Amendment 1 §3)
- [x] Brand column filtered: yes — `brand: resolveBrand()` (= BBL) on create; every public query
  filters `brand + status: PUBLISHED`
- Authorization approach: safe-action client chain (the repo's established server-action authz idiom —
  NOT a 5th system). `authorId` derived from `ctx.user.id`, never client input. Hidden posts: excluded
  from all public queries; detail 404s unless `isAdmin`. Image upload: session-gated sibling of the
  join-funnel guest upload guardrails (rate-limit + hard byte ceiling + magic-byte sniff via
  `sniffUploadBuffer`, isolated `community-posts/` R2 prefix). `imageUrl`/`videoUrl` are https-URL
  validated; imageUrl host-restricted to the R2 patterns `next/image` allows (prevents hotlink +
  render crash).

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes (inventory §9b vertical-slice layout)
- Searched `server/` for: bookmarks subject/schema/saved (COMMUNITY_POST pre-wired in TASK_01 commit),
  posts queries/payloads, actions/media (mediaUploadActionClient = entitlement-gated, NOT member-safe),
  lead/public-actions (uploadJoinLegacyEvidence/Avatar = the member/guest-safe upload guardrails),
  admin/content `findStyleOptions`
- Related existing actions: `setBookmarkSubject` (Save — zero changes needed), `uploadMedia`
  (entitlement-gated — wrong gate for member posts), `uploadJoinLegacyEvidence` (the guardrail model)
- L1 pattern match: dirstarter action client chain (`userActionClient`/`adminActionClient` +
  `.inputSchema().action()`)

### 3. Data flow reference

- [x] `sop-data-and-wiring-flows.md` — flow: public read-model query → server page loader → client
  feed props (strings only, no Prisma in client); write = safe-action → revalidate paths
- [x] `sop-e2e-user-lifecycle.md` — lifecycle stage: signed-in member engagement (post-claim/join);
  guests read the feed, members create

### 4. FAILED_STEPS check

- Prior failures in this area: authz-widening lesson (0492) — write the GAINER's adversarial test
  first: member creating a post cannot spoof `authorId`; member (incl. the author) CANNOT hide/unhide;
  hidden posts stay out of public reads
- Manual Boundary Registry entries: none

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0493_TASK_01 | landed | Schema slice: CommunityPost + Bookmark COMMUNITY_POST subject + Rank.degree — migrations `20260702090000_add_community_post` + `20260702091000_add_rank_degree`, shadow-replay "No difference detected" (daf3f413) |
| SESSION_0493_TASK_02 | landed | Giddy schema audit (11 strengths / 9 weaknesses, all file:line-evidenced) + ADR 0042 Amendment 1 draft; found 3 live bugs in passing (2 frozen `updatedAt`, `PostStatus.Scheduled` never publishes) — chipped for spin-off |
| SESSION_0493_TASK_03 | landed | ADR 0042 Amendment 1 written (accepted) + `docs/runbooks/schema-breakdown-runbook.md` (the operator-requested schema teaching doc, tkdodo vertical-codebase grounded) |
| SESSION_0493_TASK_04 | landed | Community feed vertical slice (4dfb4e5d): /posts feed + detail + create (member-safe image upload) + save + share + admin hide + 301s deleted; GAINER authz suite |
| SESSION_0493_TASK_05 | landed | Ancestry timeline slice (4f08a0c0 + 41ba62d6): recursive PUBLIC-only walk (L+3 queries, cap 12, cycle guard, truncate-not-splice), BeltSwatch flat-bar + degree stripes, integrated after Ranks |
| SESSION_0493_TASK_06 | landed | Desi review: 1 P0 + 8 P1 (all FIXED, c2ce12db) + P2 backlog routed; parity verdicts 7/10 → ~9 post-fix both surfaces |
| SESSION_0493_TASK_07 | landed | Doug verify (re-run after rate-limit casualty): **SHIP 9.6** — 1033/0 full suite, build green, zero migration drift, hidden-post leak proven closed, adversarial source review clean |
| SESSION_0493_TASK_08 | landed | /app/posts → /app/blog rename (410d6dd1) — git mv + 0-residual reference sweep (0451 lesson) |
| SESSION_0493_TASK_09 | landed | Full bow-out; HELD at push gate for operator go |
| SESSION_0493_TASK_10 | landed | Data backfill (operator-ratified): 64 INSTRUCTOR_STUDENT edges from visual parents + 89 Rank.degree + 5 secondaryColorHex; 3 idempotent scripts banked for prod |

## What landed

- **Item B — community posts feed LIVE-local at `/posts`** (revived route; ADR 0042 Amendment 1 →
  accepted). New sibling `CommunityPost` model (NOT a Post kind-union), typed flair
  (Technique/Tip/Seminar/Q&A), style facet, grid/list, create dialog (desktop + 56px FAB) with
  member-safe image upload (magic-byte sniff, 8MB cap, own-bucket origin guard, fail-closed rate
  limit), save via polymorphic `Bookmark` COMMUNITY_POST, client-only share menu, post-moderation
  (`PUBLISHED|HIDDEN` + admin hide), `/posts` in primary nav as "Community". Editorial `/blog` and
  community `/posts` permanently distinct.
- **Item A — ancestry timeline on `/directory/[slug]`** (Tony Hua ×2 request). Recursive server walk
  UP the INSTRUCTOR_STUDENT provenance edges (PUBLIC-only, depth 12, cycle guard, truncate-not-splice,
  L+3 query budget); `BeltSwatch` `flat-bar` variant — data-driven belt color + degree stripes (1–6)
  + **true coral alternating panels** (red/black 7th · red/white 8th via new `Rank.secondaryColorHex`);
  brand-red italic names, narrative edge captions, owner highlight, `whileInView` + reduced-motion.
  **Live-DOM verified: Tony → Bob Bass → Rigan → Carlos Jr → Carlos Sr renders with correct belts**
  (screenshots delivered to operator).
- **Schema:** 3 additive hand-authored migrations (community_post · rank_degree · rank_secondary_color),
  each shadow-replay "No difference detected"; local DB applied via `migrate deploy` under the
  operator-narrowed shared-DB rule.
- **Data truth restored:** 64 PUBLIC members (incl. Tony) had visual-tree parents but ZERO provenance
  edges — backfilled from `primaryVisualParentMemberId` (operator-ratified); 89 `Rank.degree` values
  seeded from canonical names (Gup correctly excluded); 5 alternating-belt secondary colors (2 BJJ
  coral + 3 Kodokan red-white Dans). All 3 scripts idempotent (re-run = 0 writes) and **banked for prod**.
- **Docs:** ADR 0042 Amendment 1 (sibling model, /posts revival, one-feed topology, phase cut, RSS
  deferral, admin rename) + `docs/runbooks/schema-breakdown-runbook.md` — the operator-requested
  professional schema-design teaching doc (what we do well/poorly with file:line evidence, enums/FKs/
  polymorphism/uniques-as-invariants, vertical slices + DDD, 10-point schema-PR checklist).
- **Process:** the 0487 blanket "never apply to the shared DB" rule challenged by the operator →
  root-caused, narrowed (migrate dev banned always; migrate deploy fine when additive/single-lane),
  encoded with rationale + new standing memory `rules-must-carry-their-why`.

## Decisions resolved

1. NEW `CommunityPost` sibling model (kind-union rejected) — ADR 0042 Amendment 1.
2. ONE global feed; school = facet + future profile section; Reddit `r/` namespaces rejected.
3. `/posts` revived (301s deleted); `/blog`=staff, `/posts`=members; admin `/app/posts`→`/app/blog`.
4. RSS deferred entirely (`/blog/rss.xml` = cheap editorial follow-up).
5. `Rank.degree Int?` added + operator-grilled IBJJF explanation; `Rank.secondaryColorHex` added
   (coral truthfulness, Desi P1 → operator approved).
6. Both lanes parallel in one worktree; schema serialized in T01.
7. MVP cut: feed+detail+create+save+share+post-moderation; votes=phase 2; comments+mod-queue=phase 3;
   no dormant columns.
8. Edge backfill from visual parents ratified; local-DB `migrate deploy` apply ratified (rule narrowed).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` + 3 migrations | CommunityPost + enums, Bookmark COMMUNITY_POST, Rank.degree, Rank.secondaryColorHex |
| `apps/web/server/web/community/*` (new vertical) | schema/payloads/queries/actions/media-url + 3 test files (GAINER suite) |
| `apps/web/components/web/community/*` (new, 8 files) | feed/card/row/flair/share/admin-menu/create-dialog/post-type |
| `apps/web/app/(web)/posts/*` (new) | feed + [slug] detail pages; 301s deleted from `next.config.ts` (+ img.youtube.com remotePattern) |
| `apps/web/server/web/lineage/ancestry.ts` (+test) | recursive PUBLIC-only ancestry walk (new vertical file) |
| `apps/web/components/web/lineage/lineage-ancestry-timeline.tsx` (new) + `ancestry-section.tsx` (new) | the timeline + profile section (after Ranks, md:col-span-2) |
| `apps/web/components/common/belt-swatch.tsx` | flat-bar variant + degree stripes + coral panels + unconditional stroke-border (P0) |
| `apps/web/server/web/bookmarks/{subject,schema,saved}.ts` | COMMUNITY_POST in the closed polymorphic contract |
| `apps/web/app/app/blog/*` (renamed from posts) + `sidebar.tsx` + `server/admin/posts/actions.ts` | admin rename + 0-residual sweep |
| `apps/web/scripts/{backfill-lineage-instructor-edges,seed-rank-degrees,seed-rank-secondary-colors}.ts` (new) | the 3 banked idempotent data scripts |
| `apps/web/prisma/seed.ts` | coral rows carry secondaryColorHex |
| `apps/web/components/web/nav/nav-sheet.tsx` + `messages/en/{navigation,community,pages}.json` | Community nav + new i18n namespace |
| `apps/web/lib/{video-embed.ts,rate-limiter.ts}` (+tests) | toVideoThumbnailUrl helper; 2 rate buckets |
| `docs/architecture/decisions/0042-*.md` | Amendment 1 (accepted) |
| `docs/runbooks/schema-breakdown-runbook.md` (new) | schema teaching doc |
| `docs/sprints/SESSION_0493.md` | this file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` / `lint` / `format:check` | ✅ clean (lint warnings pre-existing, none in 0493 files) |
| `bun run test` (full, --parallel=1) | ✅ **1033 pass / 0 fail** (2936 expects, 158 files) |
| `bun run build` (`next build`) | ✅ green (fresh BUILD_ID timestamp-verified by Doug) |
| `migrate diff --from-migrations → --to-schema --exit-code` | ✅ "No difference detected." ×3 migrations |
| Live-DOM (lead, chrome-devtools + fetch) | ✅ tony-hua 5-name chain + coral panels + degree stripes; /posts 200 + FAB + empty-state CTA; /app/blog 307→login; /app/posts 404 |
| Doug live-DOM + leak probe | ✅ hidden post: 0 feed hits + detail 404; probe row cleaned up; bob-bass claim teaser intact |
| Doug adversarial source review | ✅ session-derived authorId, admin-gated hide, real-chain tests, walk PUBLIC-pinned |
| Data scripts idempotency | ✅ all 3 dry-runs report 0 to write post-apply |
| Desi mockup parity | ✅ 7/10 → ~9 both surfaces after P0+P1 fixes |
| **Doug verdict** | **SHIP 9.6/10 — no P1/P2 findings** |

## Open decisions / blockers

- **PUSH GATE (operator go required).** One branch `session-0493-community-feed`, 9 commits, push →
  squash-merge PR → Vercel prod deploy auto-applies the 3 migrations (prebuild migrate deploy). **Deploy
  order:** merge + verify build green + migrations applied on Neon → then run the 3 data scripts against
  prod (`bun --env-file=.env.prod scripts/<script>.ts` dry-run first, then `--apply`) → prod smoke
  (/posts + /directory/tony-hua).
- P2/P3 polish routed to ledgers (see finding router below): WL row (unconsumed ancestor deep-link
  seam), D row (pill-tab + post-row duplication with `components/web/posts/*`), POST_LAUNCH_SOT P2
  bundle (mobile filter/sticky, hero count, form hints, native-share hide, red-name contrast,
  media-url prefix scope, YouTube id charset, walk-loop DB test, bjj-passport-card ring,
  bbl-reveal SSR-hidden).
- Spawned task chips pending operator: frozen `updatedAt` fix (ContentTask/Media) ·
  `PostStatus.Scheduled` publish path.
- Board cross-off: none — no board-tracked card resolved by this session (FI-006 claim→award lifecycle
  is adjacent but its rank-picker scope remains open).

## Next session

### Goal

Post-gate: verify the prod deploy end-to-end (migrations on Neon, 3 data scripts vs prod, prod smoke of
`/posts` + the tony-hua timeline), then open **community feed phase 2 — votes** (per ADR 0042 Amendment 1
phase cut) bundled with the P2 polish batch. Operator board top picks (FI-001/G-001 Brian Truelson P0
onboarding; FI-006 rank-picker lifecycle) remain the standing alternatives if the operator repoints.

### First task

On the operator's "go": push + PR + squash-merge; watch the Vercel build (migrations auto-apply); verify
`add_community_post` / `add_rank_degree` / `add_rank_secondary_color` applied on Neon; dry-run then
`--apply` the 3 data scripts with `--env-file=.env.prod`; prod smoke `/posts` (empty-state + create) and
`/directory/tony-hua` (5-gen chain, coral panels). Then bow-in 0494 on the phase-2 votes lane.

## Review log

### SESSION_0493_REVIEW_01 — dual-lane build + verify

- **Reviewed tasks:** SESSION_0493_TASK_01–10.
- **Method:** operator grill (6 forks + 2 data rulings) → parallel Cody builds with serialized schema →
  independent Desi design review (live SSR) + Doug adversarial verify (re-run on final tree after a
  rate-limit casualty) + lead live-DOM (chrome-devtools, screenshots delivered).
- **Dirstarter docs check:** live alignment consulted in pre-flights (content/blog, Prisma, auth chain,
  media); no baseline replaced — extensions only.
- **Verdict:** both operator lanes shipped and verified on real data; the data-gap discovery (64
  edge-less members incl. the feature's requester) was caught by live-data smoke, not tests — and fixed
  as ratified data backfill. Desi's P0 (invisible black belts on dark) and belt-truthfulness batch
  (barcode stripes, coral-as-red) landed same-session.
- **Score:** 9.5/10 aggregate (Doug 9.6 · Desi post-fix ~9).
- **Follow-up:** phase 2 votes; P2 ledger batch.

## Hostile close review

- **Giddy (architecture):** pass — sibling `CommunityPost` honors the anti-kind-union doctrine (ADR 0040
  precedent chain now codified in the runbook §3.6); save reused the closed polymorphic contract
  unchanged; both features are true vertical slices (`server/web/community`, `ancestry.ts`); 3 additive
  migrations, zero destructive DDL; ADR 0042 Amendment 1 ratified with alternatives-rejected.
- **Doug (verification):** pass — SHIP 9.6; every gate green on the final tree; leak probe proven with
  cleanup; scripts idempotent; the one prior verify casualty (rate limit) was re-run clean, not assumed.
- **Desi (UX/brand):** pass — P0 + all 8 P1s fixed and re-verified; belt bars now tell the truth on the
  surface built for people who read belts.
- **Kaizen aggregate:** 9.5/10 — grill-first prevented an ADR collision; live-data smoke caught the
  empty-timeline-for-the-requester trap that green tests hid.

## ADR / ubiquitous-language check

- **ADR 0042 Amendment 1 → accepted** this session (sibling CommunityPost, /posts revival, one-feed
  topology, phase cut, RSS deferral, admin rename). Dirstarter proof: content/blog layer builds on the
  existing `Post`-adjacent idioms; no baseline replaced.
- **Ubiquitous language:** new terms **community post**, **editorial post**, **post-moderation** defined
  in the amendment's UL section and mirrored to `ubiquitous-language.md`.
- No further ADR required (Rank.degree / secondaryColorHex are render-layer additive columns documented
  in schema comments + the runbook).

## Reflections

- **Green tests can't see empty data.** The ancestry walk was correct, unit-tested, and would have shipped
  rendering NOTHING for the man who asked for it — Tony (and 63 others) had visual-tree placement but zero
  provenance edges. The live-data smoke against the prodsnap caught it; the fix was a ratified data
  backfill, not code. Verify-against-real-data is a different gate than verify-the-code, and both are
  mandatory for data-driven features.
- **Rules must carry their why.** The operator hit the blanket "never apply to the shared DB" rule and
  pushed back hard — correctly. Root-causing it (the real landmine = `migrate dev`'s auto-reset across
  divergent worktrees) let us keep the invariant and drop the over-reach. Encoded as a standing memory:
  surface + narrow inherited rules, never silently obey or ignore.
- **Ops gotchas that masquerade as agent misbehavior:** `bun run lint` is the FIXING variant — it silently
  re-edits files (the "phantom" regex diff appeared twice before we accepted it with an amended comment);
  and a background dev server piped through `head` dies of SIGPIPE minutes later (looked like build
  contention). Both now understood; the lint one is in memory.
- **Belt truthfulness is product truth.** Coral-as-red wasn't a cosmetic nit — on a lineage-verification
  platform it overstated Bob Bass's rank to the exact audience that reads belts fluently. Desi's framing
  ("the belt bar lies") earned the schema column same-session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0493 (status closed, updated 2026-07-03), ADR 0042 (updated 2026-07-03, last_agent 0493), runbook new with full frontmatter |
| Backlinks/index sweep | ADR 0042 pairs_with += SESSION_0493; runbook pairs_with 8 ADRs/runbooks; wiki index += SESSION_0493 row |
| Wiki lint | `bun run wiki:lint` — 0 errors / 21 warnings (pre-existing; none introduced — gate-runner verified) |
| Kaizen reflection | yes — `## Reflections` (4) |
| Hostile close review | SESSION_0493_REVIEW_01 + Giddy/Doug/Desi pass, Kaizen 9.5 |
| Code-quality gate (Class-A) | Community-feed slice + ancestry walk are Class-A: covered by Doug's adversarial source review (SHIP 9.6, no hard-cap) + Desi L1-reuse audit in lieu of a separate /code-quality pass |
| Runtime verification (Doug) | live-DOM matrix + leak probe + gates on final tree (see Verification) |
| Review & Recommend | Next session goal written (prod-verify → phase-2 votes); board top picks surfaced |
| Memory sweep | blog-surface + belt memories updated; new `rules-must-carry-their-why` + lint-autofix gotcha; 0487 memory narrowed |
| Next session unblock check | BLOCKED ON OPERATOR at the push gate only; everything else staged |
| Git hygiene | branch session-0493-community-feed, 9 code commits + 1 docs close commit (hash in bow-out chat); worktree kept (unmerged); NOT pushed — explicit-push-authorization |
| Graphify update | worktree: nodes=12326 edges=26856 communities=1369 (gate runner); canonical checkout refreshed at close |

