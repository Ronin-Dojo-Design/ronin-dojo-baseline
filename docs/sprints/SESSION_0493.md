---
title: "SESSION 0493 — BBLApp community posts feed + member profile ancestry timeline"
slug: session-0493
type: session--open
created: 2026-07-02
updated: 2026-07-02
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
| SESSION_0493_TASK_01 | done | Schema slice: CommunityPost + Bookmark COMMUNITY_POST subject + Rank.degree — migrations `20260702090000_add_community_post` + `20260702091000_add_rank_degree`, shadow-replay "No difference detected", generate/typecheck/lint/tests green |
| SESSION_0493_TASK_02 | pending | Giddy schema audit + ADR 0042 amendment content |
| SESSION_0493_TASK_03 | pending | Write ADR amendment + schema-breakdown-runbook.md |
| SESSION_0493_TASK_04 | done | Community feed vertical slice: /posts feed (flair tabs + style facet + grid/list + hero band) + /posts/[slug] detail (markdown + video embed + hidden-404) + create dialog (member-safe image upload) + save (COMMUNITY_POST) + share menu + admin hide + 301s deleted; `community.*`/`pages.community` i18n; 2 rate-limit buckets; typecheck/lint/format green, 32 scoped tests pass (GAINER authz suite) |
| SESSION_0493_TASK_05 | pending | Ancestry timeline vertical slice (/directory/[slug]) |
| SESSION_0493_TASK_06 | pending | Desi design review |
| SESSION_0493_TASK_07 | pending | Doug verify (gates + live-DOM + migration rehearsal) |
| SESSION_0493_TASK_08 | pending | Tail: /app/posts → /app/blog rename |
| SESSION_0493_TASK_09 | pending | Bow-out + push gate hold |

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.
