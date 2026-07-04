---
title: "SESSION 0498 — Epic A opener: the Lineage Journey scrollytelling (A0 → A2-v1 → A1)"
slug: session-0498
type: session--open
status: in-progress
created: 2026-07-04
updated: 2026-07-04
last_agent: claude-session-0498
sprint: S49
pairs_with:

  - docs/sprints/SESSION_0497.md
  - docs/petey-plan-0498-epic-a-lineage-journey.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0498 — Epic A opener: the Lineage Journey scrollytelling (A0 → A2-v1 → A1)

## Date

2026-07-04

## Operator

Brian + claude-session-0498

## Goal

Land the smallest-shippable spine of **Epic A — the Lineage Journey** per
`docs/petey-plan-0498-epic-a-lineage-journey.md`: **A0** a hand-authored `LineageStoryScene` migration +
read-model projection onto `LineageAncestryEntry`, **A2-v1** a `motion/react` `useScroll` scene scaffold
layered onto the already-live `/directory/[slug]` ancestry timeline (reduced-motion falls back to today's
stagger), and **A1** a lean `can()`-gated storyboard card-board in `/app`. Grill the 6 open forks to shared
understanding BEFORE any build. Everything above A2-v1 in the A0–A9 ladder (red-wipe, finale, self-hosted
video, conditional bridge, Lenis/GSAP) is fast-follow.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0497.md`
- Carryover: 0497 was a fix+discoverability lane (belt-save P2003 root-caused at the id-space level +
  LineageProfileDrawer "View full profile" link; Doug 9.6 SHIP, merged #189/#190) and it **pre-staged
  `petey-plan-0498`** (grill-ready) at close. 0497 confirmed the ancestry timeline is already LIVE on
  `/directory/[slug]`; Epic A scrollytelling (A0/A2/A1) is genuinely unstarted. This session opens it.

### Reconciliation (bow-in args were stale)

- The `/bow-in` args referenced creating `SESSION_0497`, reconciling with `SESSION_0496`, and planning from
  `petey-plan-0494`. **All stale:** 0497 already ran + closed; the 0496→0497 reconciliation is already
  encoded in `petey-plan-0498` (0496 landed **only A0.5** StudentsCarousel V2; A0/A2/A1 exist nowhere).
  This session is **0498**, plan = **petey-plan-0498**, worktree = **../ronin-0498**.
- Verified `LineageStoryScene` absent from `schema.prisma` + all of `apps/web/{server,app,lib}` → A0 is a
  true new migration, no 0496 collision.

### Branch and worktree

- Branch: `session-0498-epic-a`
- Worktree: `/Users/brianscott/dev/ronin-0498` (created off `origin/main`)
- Status at bow-in: clean (2 untracked prod-reference JPEGs in canonical root — `prod-live-dirty-dozen.jpeg`,
  `tony-hua-lineage-timeline-prod.jpeg` — Epic A follow-up assets, not this worktree)
- Current HEAD at bow-in: `33738d70`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (new model + hand-authored migration); Theming/Media only via existing motion + image idioms |
| Extension or replacement | Extension: adds `LineageStoryScene` 1:1 alongside `Passport`/`LineageNode`; layers a scroll mode onto the existing `LineageAncestryTimeline` (enhance-not-replace) |
| Why justified | The ancestry walk + timeline component already exist and stay authoritative; scenes are additive story data, no baseline capability replaced |
| Risk if bypassed | Re-authoring a timeline from scratch would duplicate the live `/directory/[slug]` surface (the [[epic-a-timeline-live-and-unstarted]] trap) |

Live docs checked during planning: Prisma migration precedent (`20260703000000_add_rank_secondary_color`), Media/motion idioms in `lineage-ancestry-timeline.tsx`.

### Grill outcome

**All 6 forks resolved at bow-in (operator-ratified).** Build proceeds on these.

1. **Story-table key → `passportId`** (ratified). A scene is story data about a *person* (identity, ADR 0025); survives node re-parenting / tree consolidation (ADR 0037 has orphaned nodes before). Join cost ~nil — `LineageNode.passportId` is already `@unique NOT NULL` and the ancestry walk loads it. **Deeper question raised & resolved** — should `Passport.id` and `LineageNode.id` collapse to one id (DRY/KISS)? **Giddy research-review verdict: KEEP SEPARATE — not a DRY violation** (a 1:1 FK is a relationship stored once, not a fact stored twice; the mapping is 1:0..1 — most Passports have no node; unifying = couple two aggregates + delete the WL-P1-8 id-space tripwire, risk-high/payoff-zero). Full analysis: [`research-review-passport-node-id.md`](../architecture/research/research-review-passport-node-id.md). A0 keys scenes by `passportId`, confirmed correct.
2. **CRUD depth → MVP** — card-board + plus-button + duplicate this session; drag-reorder + media-drop fast-follow (`sceneOrder` is `Int`, reorder is UI-only later).
3. **Order → A0 → A2-v1 → A1** — prove the scroll spine on seeded data first; A1 may slip.
4. **Founder quotes → ship sourced quotes now** (table below), editable via A1. No longer blocked — legit quotes found for all four (incl. Rorion).
5. **Bake-off → hard gate** — v1 (`motion/react useScroll`, no new dep) evaluated on all 4 criteria before any Lenis/GSAP dep.
6. **Bridge (A6) → OUT of 0498** — end at the universal prologue scaffold.

#### Founder seed copy (sourced; seed `enabled`-flagged; editable via A1)

| Founder | Quote | Attribution note |
| --- | --- | --- |
| Carlos Gracie Sr | "Brute physical force is worth nothing against the science of the samurais." | Widely attributed (fightersmarket / sensobjj) |
| Carlos Gracie Jr | "There is no losing in Jiu-Jitsu. You either win or you learn." | His signature line (azquotes / quotefancy) |
| Rorion Gracie | "You have to do what you can with what you've got." | Aikido Journal interview — mark for source-verify before un-flagging |
| Rigan Machado | "Jiu-Jitsu is not about fighting; it's about solving problems." | Interview-sourced (bjjee / maiahub) |

#### Design / motion direction (operator Brian-notes → A2-v1 craft targets)

- **Section palette = a THREE-variant cycle (operator clarification, mid-A0):** three section *types* that alternate/cycle — **black** bg (white text, red underlines), **red** bg (white text, black underlines), and **white** bg (black text, red underlines — accent inferred, operator-editable). The scaffold's section primitive should take a palette variant (`black | red | white`) and the sequence cycles through the three — not a binary black↔red toggle.
- **Full-width sections, Poppins 800** display type (landing-page parity).
- **Horizontal text flips to vertical** on scroll; clean full-bleed images with a section overlay.
- **Quality bars (where "high-level" is judged): scroll smoothness, mobile-first, timing** — maps directly to the v1 bake-off criteria (60fps mobile Safari, deterministic scroll map, zero layout shift).

#### Video-component finding (Graphify — the "Iggy" ChatGPT component)

- Query run: `graphify query "video upload component uploader dropzone media player chunked" --budget 2000`.
- **Verdict: the detailed video-UPLOAD component did NOT land in this repo.** What exists: robust **image** upload (`apps/web/components/web/uploader/*` — cropper + `use-photo-upload` + `apps/web/app/app/media/_components/media-uploader.tsx`, `AvatarUploader`), and **video = embed-only** (`apps/web/lib/video-embed.ts` `toVideoEmbedUrl` YouTube/Vimeo → iframe via `VideoIntroSection`). No self-hosted video upload path.
- **Impact:** A5/A6 self-hosted `heroVideoUrl`/`posterUrl` (the Rorion/Rigan clips) need an upload path that doesn't exist → **flagged for A5 fast-follow** (build it, or extend `media-uploader`). Not a 0498 blocker — A0 schema just carries the nullable fields.

#### Operator asset provision

- **Rorion + Rigan videos** — operator supplies on request; needed at **A5** (self-hosted clips + ffmpeg poster-frame). Ask when A5 opens.

### Drift logged

- Giddy (research-review) flagged `docs/knowledge/wiki/concepts/passport-and-shells.md` carries a stale "Passport → User (1:1)" line + an unresolved 2026-04 RankAward open question — predates ADR 0025/0032/0037 + nullable `userId`. One-line wiki-sweep fix; not this session (candidate drift row at close).

## Petey plan

### Goal

Land A0 → A2-v1 → A1 (smallest-shippable spine) of Epic A, gated by the operating loop (Desi→Cody→Giddy ≥9.5) + Playwright E2E on the shared-primitive change, held at the operator's push gate.

### Tasks

#### SESSION_0498_TASK_01 — A0 data model + read-model projection

- **Agent:** Cody (build) ← Desi/Giddy review; migration lane is hand-authored
- **What:** `LineageStoryScene` model (fork #1 key) + hand-authored migration (`migrate diff` shadow-replay, NEVER `migrate dev`) + `LineageAncestryEntry.story` projection batch-fetched within the `L+3` budget (no new N+1) + founder seed (Carlos Sr/Jr/Rorion/Rigan placeholders).
- **Done means:** model in `schema.prisma` + committed migration SQL + clean `prisma generate`; projection carries `story` with the `queries.visibility.test.ts` allowlist family still green; founders seeded.
- **Depends on:** grill forks #1, #4 resolved.

#### SESSION_0498_TASK_02 — A2-v1 scroll scaffold

- **Agent:** Cody (build) ← Desi (live SSR)/Giddy review
- **What:** `motion/react` `useScroll` scene mode layered onto `LineageAncestryTimeline`; per-scene image large→shrink-to-node driven by scroll progress; reduced-motion / no-JS / pre-hydration falls back to today's stagger (SSR-visible, zero layout shift).
- **Done means:** `/directory/[slug]` renders a scroll-driven scene sequence (v1) with clean reduced-motion fallback; Playwright E2E on the timeline surface green; the v1 bake-off gate (a–d in plan) evaluated before any Lenis/GSAP dep.
- **Depends on:** TASK_01 (scaffold reads seeded scenes); fork #3, #5 resolved.

#### SESSION_0498_TASK_03 — A1 storyboard MVP (may slip to fast-follow)

- **Agent:** Cody (build) ← Desi review
- **What:** compact `can()`-gated scene-card board in `/app` — per-scene field set (image/video URL, quote, bio, order), plus-button add, duplicate-card. Reuse the existing `/app` lineage-editor permission seam (no 5th authz system). Drag-reorder + media-drop = fast-follow. **REQUIRED (Giddy A0 P3-4):** every scene mutation MUST revalidate the ancestry cache (`ancestry.ts` is `"use cache"` + `cacheLife("minutes")` — the save path must `revalidateTag` the `lineage-ancestry-*` tag or we get the known "saves but reverts on nav" failure).
- **Done means:** a working scene-card board authoring `LineageStoryScene` rows via `can()`; or explicitly slipped to fast-follow if session budget is tight (spine proves on seeded data without it).
- **Depends on:** TASK_01; fork #2 resolved.

#### SESSION_0498_TASK_04 — `/app/beta` gated preview area + Lineage Journey preview (operator, mid-session)

- **Agent:** Cody (build) ← same review loop
- **What:** an admin-gated beta/preview area so the operator + Tony can see in-flight features LIVE (prod) before public GA. New `beta.view` permission key in the EXISTING `can()` flat-roles system (admin `"*"` wildcard covers it — no grant plumbing needed; repo has 4 authz systems, this extends #1, never a 5th). `/app/beta` index (lists beta features) + first tenant `/app/beta/lineage-journey`: renders the full scroll-story sequence for a chosen scened chain **including `enabled: false` scenes** (admin-side query — NOT the public view). GA model: public surface stays data-gated on `enabled`; prod scenes get authored/seeded disabled-first, previewed in beta, flipped live per-scene via the A1 storyboard. Seed gains a `--disabled` flag for prod bring-up.
- **Done means:** `/app/beta/lineage-journey` renders the journey for a non-admin-invisible chain; non-admin gets redirected; public `/directory/[slug]` unaffected by disabled scenes; gates green.
- **Depends on:** TASK_02 (scene components), TASK_03 (board = the GA flip surface). RBAC grant/toggle surface for named non-admin testers = **FI-019** (`POST_LAUNCH_SOT.md`), future lane.

### Parallelism

Sequential — A0 (schema/read-model) is the foundation both A2-v1 and A1 consume. A2-v1 and A1 both read seeded scenes; A1 can slip without blocking A2-v1. Single coherent lane, one worktree, inline Cody (no fan-out — not disjoint).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0498_TASK_01 | Cody | schema + read-model; hand-authored migration lane |
| SESSION_0498_TASK_02 | Cody | motion slice on shared timeline primitive; Desi on live SSR |
| SESSION_0498_TASK_03 | Cody | `/app` CRUD on existing permission seam |

### Open decisions

The 6 forks from `petey-plan-0498` — resolve BEFORE Cody builds A0:

1. **Story-table key** — `passportId` (rec, identity-SoT ADR 0025, survives re-parenting) vs `nodeId` (walk-native, cheaper join). *Permanent FK.*
2. **Storyboard CRUD depth (0498)** — MVP card-board + plus + duplicate now, drag-reorder + media-drop fast-follow (rec)? Or full board this session?
3. **A1 vs A2 order** — rec **A0 → A2-v1 → A1** (prove the spine on seeded data first).
4. **Founder quotes source** — curated placeholders unverified-flagged, or hold scenes until source-verified? Rorion + bridge quotes genuinely TBD (operator-supplied).
5. **Bake-off gate** — hard-gate v1 evaluated before any Lenis/GSAP dep (rec: yes).
6. **Bridge scope** — dirty-dozen / Bob bridge (A6) explicitly OUT of 0498 (rec: yes; end at the universal prologue scaffold).

### Risks

- Shared local DB is shared across worktrees → `migrate dev` is banned (auto-reset landmine). A0 migration is hand-authored + shadow-replayed + applied via `migrate deploy` (additive, no divergent lane live).
- Motion slice must stay SSR-safe + reduced-motion-first on every keyframe (mandatory).

### Scope guard

- NOT building A3–A9 (red-wipe, finale, self-hosted video, conditional bridge, Lenis, GSAP) this session — fast-follow.
- NOT re-authoring the ancestry timeline — layering onto the live one.
- NOT touching `../ronin-0496`/`0491`/`0492`/`0493`/`0485`/`0477` or any live worktree/branch.
- Standing alternative if operator repoints: **FI-001** Brian Truelson first-tester onboarding (P0, disjoint scripts lane).

## Pre-flight: Schema — LineageStoryScene (A0)

### 1. Petey invocation

- [x] Petey plan exists: `petey-plan-0498` §A0 + SESSION_0498_TASK_01 (this file). 1 new model (≤3 → no extra Petey pass needed).

### 2. Design doc check

- Design doc consulted: `petey-plan-0498` §A0 schema sketch (ratified grill fork #1 → key = `passportId`).
- Models match design doc: yes — field-for-field; relation block placed last per neighboring-model convention.

### 3. Existing schema scan

- Current model count: 128.
- Related existing models: `Passport` (identity SoT, ADR 0025), `LineageNode` (walk source).
- Back-relations needed: `Passport.storyScene LineageStoryScene?` (1:0..1 satellite).
- **Schema spot-check (from `schema.prisma` directly):** `Passport.id String @id @default(cuid(2))`; satellite precedent `LineageNode.passportId String @unique` + `@relation(..., onDelete: Cascade)` (same shape on `DirectoryProfile.passportId`). `LineageNode.slug String? @unique` — founder lookup key for the seed. No enum touched.

### 4. Runbook consulted

- [x] `docs/runbooks/database/schema-migration.md` read
- [x] `docs/runbooks/database/prisma-workflow.md` (CLI URL comes from `prisma.config.ts`, not a schema `url` line)
- Migration strategy: **hand-authored** SQL via `migrate diff` + shadow-replay validation + `migrate deploy` (additive). `migrate dev` BANNED — worktrees share one local DB ([[parallel-session-shared-db-migrate-dev-reset-trap]]); the runbook's Option B guidance is superseded for parallel-worktree work.

### 5. Data flow reference

- Flow: lineage public read-model (`getLineageAncestryForPassport` PUBLIC-only up-walk) — scenes are an additive batch projection; visibility gates untouched.
- Lifecycle stage: public `/directory/[slug]` profile view (logged-out must render).

### 6. FAILED_STEPS check

- Prior failures: FS-0006/FS-0021 (schema work without plan / runbook steps skipped), FS-0008 (spot-check skipped).
- Mitigation acknowledged: yes — plan ratified pre-build; spot-check pasted above; hand-author lane followed step-for-step with shadow-replay proof.
- DB verification: founders located in local `ronindojo_prodsnap` before seeding — nodes `carlos-gracie-sr`, `carlos-gracie-jr`, `rorion-gracie`, `rigan-machado`, all PUBLIC with Passports.

## Pre-flight: LineageStoryScene / LineageStorySequence (A2-v1)

### 1. Existing component scan

- Searched `components/web/` for: scene, scrollytell, story, useScroll, useTransform, full-bleed hero
- Searched `components/common/` for: section, card, avatar, badge, belt-swatch, stack, heading
- Found: `LineageAncestryTimeline` (the surface being layered onto — reused as the reduced-motion
  fallback), `Avatar`/`AvatarImage`/`AvatarFallback`, `Badge`, `BeltSwatch`, `Stack`, `H4`,
  `Section` (web/ui). No existing scrollytelling/scene component anywhere (grep across
  `components/`, `custom-component-inventory.md`); the only `useScroll` usage in the repo is
  `inline-menu.tsx` (TOC scroll-spy — different purpose).

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes
- Consulted `docs/knowledge/wiki/custom-component-inventory.md`: yes (no scene/story component)
- Closest L1 pattern: none for scroll-driven scenes; section chrome follows `Section` (web/ui) +
  the BBL landing section idiom (`bbl-hero.tsx` full-bleed image + overlay; `bbl-landing/index.tsx`
  Poppins-800 display-type wrapper).
- **Primitive API spot-check:** `Avatar` (children `AvatarImage(src, alt)` / `AvatarFallback`,
  className); `Badge` (variant: primary|soft|outline|success|warning|info|danger, size: sm|md|lg);
  `Stack` (size: xs|sm|md|lg, direction: row|column, wrap: bool, render); `BeltSwatch`
  (variant: dot|bar|flat-bar, colorHex, secondaryColorHex, degree, shimmer, className);
  `H4` (render, size — Base UI `useRender`); `Section`/`Section.Content`/`Section.Sidebar`
  (Wrapper-based, `md:grid md:grid-cols-3`). Fonts: shared `bblHeadingFont` from `lib/fonts.ts`
  (`--font-bbl-heading`, Poppins 600/700/800 italic — NEVER a per-component `Poppins()` call).

### 3. Composition decision

- [x] Composing existing components: `LineageAncestryTimeline` (fallback), `Avatar`, `Badge`,
  `BeltSwatch`, `Stack`, `H4`, `Section`, shared `bblHeadingFont`.
- [x] New component, no L1 match exists (justify): scroll-driven cinematic scene sections are a
  genuinely new surface (Epic A2-v1, operator-ratified petey-plan-0498). ONE section primitive
  (`SceneShell`, palette variant `black|red|white` token sets) × two content layouts (full story
  scene / minimal node scene) + a sequence orchestrator; pure palette-cycle + gating logic in a
  testable `scene-model.ts`. Walk order stays the ordering authority (`sceneOrder` NOT consumed —
  aligns with Giddy A0 P3-2).

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" + petey-plan-0498 §A2 read (grill outcome incl. the
  three-variant palette clarification + `quoteAttribution` display semantics)
- [x] Wiki entries: dirstarter-component-inventory, custom-component-inventory
- [x] Runbook consulted: N/A (no schema/backend change; A0 landed the data lane)

### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo -p 3498` (from `apps/web/` — port 3498, NOT :3000;
  other sessions may own :3000)
- Working directory: `/Users/brianscott/dev/ronin-0498/apps/web`
- Brand/host for testing: `localhost:3498` (`/directory/cub-swanson` — chain Carlos Sr → Carlos
  Jr → Rigan → Cub, 3 seeded scenes in-walk; Rorion is in no tree locally so his scene never
  enters a walk)
- Verification commands confirmed: `bun run typecheck`, `bun run lint` (fixer — accept writes),
  `bun run test` (never bare `bun test`)
- Tests: pure-function tests only (palette cycle + gating) — no DB, no mock.module

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (raw HTML when an inventory component exists), FS-0008
  (primitive props inferred not read — spot-check pasted above), 0495 lesson (shared-primitive
  changes need e2e/live verification — `LineageAncestryTimeline` is NOT modified, only composed;
  live SSR verify on :3498 planned)
- Mitigation acknowledged: yes

## Pre-flight: SceneStoryboard / storyboard oRPC router (A1)

### 1. Existing component scan

- Searched `components/web/` for: storyboard, scene card, admin board, person picker, combobox
- Searched `components/common/` for: card, avatar, badge, switch, dialog, input, textarea, combobox
- Found: `Card`, `Avatar`/`AvatarImage`/`AvatarFallback`, `Badge`, `Button`, `Switch`, `Dialog`
  family, `Input`, `TextArea`, `Label`, `Note`, `Stack`, `Heading`, `ComboboxSelector` (the
  searchable id-keyed picker), `CreatableCombobox` (NOT used — scenes attach only to existing
  Passports, freetext person makes no sense). Nearest oRPC-wired admin form precedent:
  `components/web/belt/belt-edit-form.tsx` (useState + Label/Input/TextArea + `client.belt.*` +
  real-error toast). Nearest `/app` card-list precedent: `app/app/lineage/page.tsx` (Card rows in
  `divide-y` list + inline sm action buttons).

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes
- Consulted `docs/knowledge/wiki/custom-component-inventory.md`: yes (ComboboxSelector/DataSelect
  decision rule — searchable person picker → `ComboboxSelector`)
- Closest L1 pattern: §9 admin CRUD is next-safe-action-keyed; the repo's live oRPC admin-form
  idiom is `belt-edit-form.tsx` — followed instead (ADR 0024 full-oRPC).
- **Primitive API spot-check:** `ComboboxSelector` (options:{id,name}[], value, onValueChange,
  placeholder, searchPlaceholder, emptyMessage, clearable, size, id/aria props);
  `Switch` (Base UI `SwitchPrimitive.Root.Props` — checked, onCheckedChange, disabled, className);
  `Avatar` (children `AvatarImage(src,alt)`/`AvatarFallback`, className); `Badge`
  (variant: primary|soft|outline|success|warning|info|danger, size: sm|md|lg); `Button`
  (variant: primary|secondary|destructive|ghost, size, prefix, suffix, isPending); `Dialog*`
  (DialogContent/Header/Title/Footer per belt-edit-form); `Heading` (render, size).

### 3. Composition decision

- [x] Composing existing components: Card, Avatar, Badge, Switch, Dialog, Input, TextArea, Label,
  Note, Stack, Button, Heading, ComboboxSelector — no new primitive; scene cards are the
  `/app/lineage` Card-row idiom, no god-card.

### 4. Lane docs loaded

- [x] petey-plan-0498 §A1 + SESSION_0498_TASK_03 spec (cache-revalidation requirement, Giddy A0
  P3-4) + grill fork #2 (MVP depth) read
- [x] Wiki entries: dirstarter-component-inventory, custom-component-inventory
- [x] Runbook consulted: sop-test-writing.md (§2 --parallel=1; oRPC precedent
  `server/belt/router.integration.test.ts` — createRouterClient + injected context)

### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo -p 3497` (port 3497 — :3499 is Desi's, :3000 not ours)
- Working directory: `/Users/brianscott/dev/ronin-0498/apps/web`
- Brand/host for testing: `localhost:3497/app/lineage/storyboard` (founders seeded locally)
- Verification commands confirmed: `bun run typecheck`, `bun run lint` (fixer — accept writes),
  `bun run test` (never bare multi-file `bun test`)

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (raw HTML), FS-0008 (props inferred not read — spot-check
  above), WL-P1-8 / SESSION_0497 P2003 (node-id vs passport-id picker id-space)
- Mitigation acknowledged: yes — the person picker is PASSPORT-keyed (a NEW `getScenePersonOptions`
  mirroring `getBeltPromoterOptions`, the passport-keyed precedent; `getInstructorOptions` is the
  node-keyed do-not-merge twin and is NOT reused); the handler verifies the Passport exists before
  any FK write (BAD_REQUEST, never a raw P2003); no bare `catch {}` — the client surfaces the real
  oRPC message (belt-edit-form idiom).

## Pre-flight: Backend — storyboard scene mutations (A1)

### 1. Auth predicates planned

- [x] Session auth required (`authedProcedure` — deny-by-default backstop)
- [x] Permission: `meta.permission = "lineage.manage"` (the existing `APP_AREA_PERMISSIONS.lineage`
  key through the ONE `can()` gate — no 5th authz system). Scenes are cross-tree global curation
  keyed by Passport, so tree-scoped `LineageTreeAccess` grants don't map; the page gate is
  `requirePermission(APP_AREA_PERMISSIONS.lineage)` so page and procedures agree.
- [x] Brand: `LineageStoryScene` carries no brand column (passport-keyed); the option source is
  BBL-pinned like its `getBeltPromoterOptions` precedent.

### 2. Existing action scan

- Searched `server/` for: lineage router, storyboard, story scene, oRPC mutation precedents
- Related existing: `server/lineage/router.ts` (flat entity router, joins `appRouter.lineage`),
  `server/belt/router.ts` (the authed-mutation precedent: ORPCError codes, FK-verify-before-write,
  `context.revalidate`), `server/orpc/revalidate.ts` (paths + tags → `updateTag`)
- L1 pattern match: oRPC flat router (SOT-ADR D5), not the safe-action chain

### 3. Data flow reference

- Flow: admin curation write path → public ancestry read path. Every mutation revalidates
  `"lineage"` + `lineage-ancestry-${passportId}` (the `ancestry.ts` `cacheTag` pair) — the
  SESSION spec requirement (Giddy A0 P3-4; the "saves but reverts on nav" class).
- Lifecycle stage: operator curation (`/app`), feeding the public `/directory/[slug]` scene walk.

### 4. FAILED_STEPS check

- Prior failures in this area: SESSION_0497 P2003 (WL-P1-8); 0486–0492 lesson — authz widening →
  the GAINER's adversarial test FIRST (unauthorized member attempting each mutation → denied).
- Manual Boundary Registry entries: none for this surface.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0498_TASK_01 | landed | A0 shipped @ `ede05efe` — model + hand-authored migration (shadow-replay empty-diff/exit-0, `migrate deploy` clean) + ancestry `story` projection (honest L+3→L+4) + 4 founders seeded idempotently. Gates: typecheck 0 err, lint/oxfmt clean, tests 1065/0 (ancestry 12/12, visibility 9/9). Giddy pass-1: 9.4 FIX-THEN-SHIP → P1 (seed clobber/re-arm) fixed create-only + rerun-proven (0 created / 4 skipped) → 9.6 SHIP. |
| SESSION_0498_TASK_02 | built — in fix-pass | A2-v1 shipped @ `286c56cb` (+view-trim `b2673097`): three-palette `SceneShell` cycle over the ancestry walk, data-gated (`chainHasStoryScenes`), SSR-visible + reduced-motion fallback, bake-off (a)(b)(d) PASS / (c) pass-leaning pending device UAT. Gates 1074/0. Desi REVIEW_02 = **8.4** → Cody fix-pass (3×P1 shrink-timing / void-reclaim / avatar-fallback + 4×P2) dispatched with TASK_04. |
| SESSION_0498_TASK_03 | built — awaiting review | A1 storyboard MVP — `/app/lineage/storyboard` scene-card board (`requirePermission("lineage.manage")`) + oRPC `lineage.storyboard.{create,update,setEnabled,duplicate,remove}` (`meta.permission = "lineage.manage"`), passport-keyed picker (`getScenePersonOptions`, WL-P1-8 guard: node-id → BAD_REQUEST), every mutation revalidates `"lineage"` + `lineage-ancestry-${passportId}` + the board path. **Latent-bug fix en route:** `server/orpc/revalidate.ts` used `updateTag` — Next 16 hard-throws it in Route Handlers (E872; `/api/rpc` is one) → switched to `revalidateTag(tag, { expire: 0 })` (read-your-writes verified live; `"max"` = one-request-stale SWR, rejected). Tests 13/13 (adversarial authz first); gates typecheck 0 / lint 0 / oxfmt clean / suite 1087/0; live round-trip on :3497 (anon 401 + page 307, create→public page fresh next request, CONFLICT on dupe, disable/delete propagate; founders untouched). |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

All 6 grill forks resolved at bow-in (see Grill outcome). Mid-build orchestrator decisions + adjacent debt:

- **`quoteAttribution` display semantics (decided, orchestrator):** the seeded `quoteAttribution` strings are *sourcing/provenance notes* ("Widely attributed (fightersmarket / sensobjj)"), not display copy. **A2 renders attribution = the founder's `displayName`** (the plan's "default = displayName at render"); stored `quoteAttribution` stays provenance until A1 lets the operator edit it into real display copy.
- **Adjacent debt — stray `playing_with_neon` table** in the local prodsnap DB (Neon-starter artifact, outside the datamodel): excluded from the A0 migration, but it will pollute every future `migrate diff` until dropped deliberately. Candidate close-out chore (check whether prod Neon has it too before any drop).
- **Local tree-slug drift note:** founders live in tree `rigan-machado-bjj-lineage` locally (not the memory's `rigan-machado-lineage`; Rorion is in no tree). Irrelevant to A0 (scenes key by `passportId`) — noted for A2 walk expectations + memory correction at close.
- **Prisma 7.8 CLI drift (candidate memory at close):** `migrate diff --from-url` / `--shadow-database-url` removed; use `--from-config-datasource` / config-file `shadowDatabaseUrl` (URL resolves via `prisma.config.ts`).

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.

## Review log

### SESSION_0498_REVIEW_01 — Giddy pass-1 on A0 (`ede05efe`)

- **Reviewed tasks:** SESSION_0498_TASK_01
- **Dirstarter docs check:** not applicable — lineage is an ahead-of-baseline capability; A0 extends the repo's own module, replaces no baseline.
- **Verdict:** 9.4 FIX-THEN-SHIP → **9.6 SHIP after P1 fix.** Dimension scores: schema 9.7, migration 9.7 (prod-safe additive; stray `playing_with_neon` correctly excluded), read-model 9.5 (right seam — `ancestry.ts` not `payloads.ts`; honest L+4), seed 8.7 (the P1), tests 9.4, ADR coherence 9.8 (no new ADR — Epic A ADR waits for the full spine).
- **P1 (FIXED inline, rerun-proven):** seed upsert `update` block clobbered curated copy + re-armed `enabled` on reseed → create-only semantics (`findUnique` → skip-with-log); reseed now 0 created / 4 skipped.
- **P3 follow-ups (routed, non-gating):** P3-1 dormant fields (`isBridge`/video/poster) projected in the view with no consumer — trim from `LineageStorySceneView` until A5/A6, define `bridgeCondition` grammar before A6; P3-2 `sceneOrder` in the public view risks a second ordering authority — remove or docblock "walk order is authoritative"; P3-3 sharpest missing test — scene on a PUBLIC node *above* the truncation gap must vanish with the truncated entry; P3-4 → folded into TASK_03 spec (cache revalidation on scene mutation). P3-1/2/3 deferred until A2 lands (same files Cody is building against), then batch with the A2 review round.
- **Score:** 9.6/10
- **Follow-up:** P3 batch post-A2 (**DONE** @ `b2673097` — view trimmed to consumed fields, provenance no longer in the RSC flight payload, above-gap truncation test pinned, 1074/0); `playing_with_neon` deliberate-drop chore at close.

### SESSION_0498_REVIEW_02 — Desi pass-1 on A2-v1 (`286c56cb` + `b2673097`)

- **Reviewed tasks:** SESSION_0498_TASK_02
- **Dirstarter docs check:** not applicable — custom lineage module; token discipline verified (red = `bg-primary`/`decoration-primary`, fixed mono poles documented).
- **Verdict:** **8.4 — below the 9.5 bar; one Cody fix-pass prescribed.** Architecture right (one `SceneShell` × three token sets, pure scroll map, clean gate); Poppins 800 exact landing parity; palette cycle SSR-verified. Three craft P1s keep it out of "cinematic": (1) shrink mistimed — hero never witnessed large (scale 0.71 at viewport-center); retime `[0.45,1]→[1,0.42]`, chip fade `[0.85,1]`; (2) transform-shrink leaves a ~200–300px dead void mid-scene — transform-only `y` chase on the content stack; (3) `?? entry.avatarUrl` hero fallback renders Rigan's placeholder clip-art full-bleed — drop to `heroImageUrl ?? monogram`. P2: per-palette `badge` token (red-on-red owner chip vanishes), red `muted` → `text-white/90` (AA), scene names as `H5` (document outline), `md:ring-1` strip boundary on dark desktop chrome. Build-flags adjudicated: RM full-width = accept (P3 cosmetic); mini scenes = keep (hold the narrative well).
- **Score:** 8.4/10
- **Follow-up:** Cody A2 fix-pass (3×P1 + 4×P2) → Giddy pass-2 → re-score. Routed to A3/Petey: true full-width breakout (collides with sticky sidebar — layout decision), vertical-name-rail flip experiment (explicit deferral — the marker-rotate is a thin token of the operator's H→V note), quote soft length cap in A1 admin. Screenshots in session scratchpad (`desk-*/mob-*/rm-timeline.png`).
