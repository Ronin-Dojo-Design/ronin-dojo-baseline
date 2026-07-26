---
title: "SESSION 0320 — PromotionEvent org timeline and index"
slug: session-0320
type: session--implement
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: codex-session-0320
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0319.md
  - docs/petey-plan-0319.md
  - docs/architecture/lineage/promotion-event-model.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0320 — PromotionEvent org timeline and index

## Date

2026-06-01

## Operator

Brian + codex-session-0320

## Goal

Implement the SESSION_0320 slice of the locked PromotionEvent display epic: add the read-only org/school promotions timeline using hosted `PromotionEvent`s and `RankAward.organizationId`, add the brand-aware `/events` ceremony index, and complete read-surface cross-links without editor, upload, permissions, or schema scope.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0319.md`
- Carryover: SESSION_0319 shipped the additive `PromotionEvent.slug`, generalized the ceremony seed, seeded CSW + OKC media, added `/events/[slug]`, and linked existing lineage Rank-History/cohort labels into event pages.
- Epic plan read first: `docs/petey-plan-0319.md`. Locked decisions accepted as binding: S0320 is read-only, no schema is expected, `/events` is the index, org/school timelines read hosted events plus awarding-school promotions, and editor/upload/permissions stay deferred to SESSION_0321.

### Branch and worktree

- Branch: `auto/session-0320`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `347f7f9`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database read queries, public App Router page composition, media thumbnails, and shared UI primitives. |
| Extension or replacement | Extension: compose Ronin domain reads through existing Prisma query/payload patterns and existing common/web primitives. |
| Why justified | Promotion ceremonies are a Ronin martial-arts domain layer above Dirstarter's directory baseline; Dirstarter supplies the database, media, server-folder, and page composition patterns but not this model. |
| Risk if bypassed | A parallel query/component/media pattern would make the event surfaces harder to cache, verify, and carry into the later upload/editor slice. |

Live docs checked during planning: Dirstarter Prisma (`https://dirstarter.com/docs/database/prisma`), Dirstarter Media (`https://dirstarter.com/docs/integrations/media`), and Dirstarter Project Structure (`https://dirstarter.com/docs/codebase/structure`) on 2026-06-01.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 8874 nodes, 13448 edges, 1368 communities, 1518 files tracked.
- Queries used:
  - `SESSION_0320 PromotionEvent events index organization school promotions timeline RankAward organizationId hostedPromotionEvents`
- Files selected from graph:
  - `apps/web/app/(web)/organizations/[slug]/page.tsx`
  - `apps/web/app/(web)/events/[slug]/page.tsx`
  - `apps/web/server/web/promotion-events/queries.ts`
  - `apps/web/server/web/promotion-events/payloads.ts`
  - `docs/petey-plan-0319.md`
  - `docs/architecture/lineage/promotion-event-model.md`
- Verification note: Graphify selected the lane files; source files, schema snippets, DB probes, typecheck, Biome, tests, wiki-lint, and close review remain the proof.

### Grill outcome

No grill: the user explicitly directed headless execution and `docs/petey-plan-0319.md` already locks the decisions. Operator-only browser/device smoke is skipped and flagged for Brian; it will not block the close.

## Petey plan

### Goal

Ship SESSION_0320 of the PromotionEvent display epic: org/school promotion timelines, `/events` index, and remaining read-surface links.

### Tasks

#### SESSION_0320_TASK_01 — Org/school promotions timeline

- **Agent:** Cody (build) + Doug (verify)
- **What:** Add a reusable read-only promotions timeline to organization and school detail pages, powered by hosted `PromotionEvent`s and `RankAward.organizationId`.
- **Steps:**
  1. Add a server query that returns an org-scoped timeline combining `PromotionEvent.hostOrganizationId` and `RankAward.organizationId`, ordered by event/award date.
  2. Compose a reusable timeline component with existing primitives; include event links when slugs exist and a clear empty state.
  3. Render the timeline on `/organizations/[slug]` and `/schools/[slug]`.
  4. DB-probe the current seed reality. If local seeded events are global/unattached, record that the empty state is honest and the query is ready for future linked data.
- **Done means:** org/school pages can display hosted and awarding-school promotion entries when data exists, preserve a clean empty state when it does not, and link event-backed entries to `/events/[slug]`.
- **Depends on:** nothing.

#### SESSION_0320_TASK_02 — `/events` index page + cross-link completion

- **Agent:** Cody (build) + Desi/Doug (visual/QA)
- **What:** Add a brand-aware public ceremony index and finish event read-surface cross-links.
- **Steps:**
  1. Add a public promotion-event list query using slugged events, current-brand relevance, thumbnail media, host org, and promotee counts.
  2. Add `app/(web)/events/page.tsx` and `loading.tsx` with breadcrumbs, metadata, cards, thumbnails, counts, and links to `/events/[slug]`.
  3. Widen detail/index rendering where useful so event pages link to host organizations and make promotee discovery possible without inventing a new profile route.
  4. Verify with focused query tests or DB probes, root typecheck, changed-file Biome, and wiki-lint.
- **Done means:** `/events` lists the seeded ceremonies and links through; event detail pages retain host links and expose promotee discovery links where the current routing model supports them; gates are green.
- **Depends on:** SESSION_0320_TASK_01.

### Parallelism

Implementation is sequential because the query shape feeds both the timeline component and `/events` index. Inspection ran in parallel during bow-in; Codex has no subagents, so Cody/Doug work is performed inline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0320_TASK_01 | Cody + Doug | Query composition and page insertion need source-backed data integrity and empty-state proof. |
| SESSION_0320_TASK_02 | Cody + Desi/Doug | Public index UI must compose existing primitives and preserve the read-only scope. |

### Open decisions

None. `docs/petey-plan-0319.md` is binding for this headless session.

### Risks

- Current local seed probe shows S0319 ceremony events have no `hostOrganizationId` and linked ceremony awards have no `organizationId`; the timeline may show empty on seeded orgs until future data connects events/awards to orgs.
- There is no dedicated public lineage profile route today; any promotee discovery link must use existing `/lineage` search/listing routes rather than inventing a profile route.
- Browser/device smoke remains operator-side per directive.

### Scope guard

- No event editor.
- No media upload UI.
- No permission/capability model.
- No schema change.
- No seed data guessing or host-org backfill unless the locked plan explicitly requires it; current seed-data gaps are documented, not silently invented.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Prisma, Media, and Project Structure live docs checked 2026-06-01; `docs/knowledge/wiki/dirstarter-docs-inventory.md`; `docs/knowledge/wiki/dirstarter-component-inventory.md`.
- **Baseline pattern to extend:** Prisma server feature folder under `server/web`, cached public queries, App Router pages under `app/(web)`, and common/web primitives (`Card`, `Badge`, `Stack`, `Grid`, `Intro`, `Section`, `EmptyList`).
- **Custom delta:** Ronin-specific PromotionEvent timeline/index read models and cross-links.
- **No-bypass proof:** The change reuses the existing Prisma client, feature-folder query pattern, committed media rows, and L1 primitives; it does not introduce storage, upload, auth, or a parallel UI kit.

## Cody pre-flight

### Pre-flight: PromotionEvent timeline and `/events` index

#### 1. Existing component scan

- Graphify query used: `SESSION_0320 PromotionEvent events index organization school promotions timeline RankAward organizationId hostedPromotionEvents`
- Found: existing organization detail page, school detail page, S0319 event detail page/loading route, promotion-event payload/query folder, lineage cross-link components from S0319, and existing public listing page patterns.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes
- Consulted live alignment URLs: yes
- Closest L1 pattern: `server/web/<feature>/queries.ts` + `payloads.ts`, App Router public pages, common primitives, and web UI `Grid`/`Intro`/`Section`.
- Primitive API spot-check: `Card` props include `hover`, `focus`, `isRevealed`, `isHighlighted`, `render`; `CardHeader`/`CardFooter` are `Stack` wrappers; `CardDescription` is a `div`. `Badge` variants are `primary`, `soft`, `outline`, `success`, `caution`, `warning`, `info`, `danger`; sizes are `sm`, `md`, `lg`; supports `prefix`, `suffix`, `render`. `Stack` variants are `size: xs|sm|md|lg`, `direction: row|column`, `wrap`, `render`. `Heading`/`H4`/`H5` support `size` and `render`. `Link` wraps Next Link with hover prefetch. `EmptyList` is a styled paragraph. `Grid` is the responsive web grid. `Section` exposes `Content` and `Sidebar`.

#### 3. Composition decision

- Extending existing component: organization detail, school detail, and event detail pages.
- Composing existing components: `Card`, `CardDescription`, `CardHeader`, `Badge`, `Stack`, `H4`, `H5`, `Link`, `EmptyList`, `Grid`, `Intro`, `Section`, `Breadcrumbs`, and Next `Image` for event thumbnails.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`.
- Runbook consulted: `docs/runbooks/domain-features/lineage-hub.md`, `docs/runbooks/dev-environment/autonomous-sessions.md`, `docs/protocols/cody-preflight.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (webpack fallback if DB-backed Turbopack route smoke regresses).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: operator-side browser smoke for `/events`, `/events/<slug>`, `/organizations/<slug>`, and `/schools/<slug>` is skipped in headless close; DB/type/lint/tests are required.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0008, FS-0024, FS-0025.
- Mitigation acknowledged: task IDs and pre-flight exist before edits; primitive APIs and schema fields were read directly; no schema change is planned; Graphify was used before broad lane search; `graphify update` will run before the single close commit after gates pass; FS-0024 pwd/remote guard runs before committing.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0320_TASK_01 | landed | Added org-scoped promotion timeline query + reusable `PromotionTimeline`, wired onto organization and school detail pages with honest empty states for currently unattached seed data. |
| SESSION_0320_TASK_02 | landed | Added `/events` index, brand-aware public event list query, route loading state, detail-page promotee discovery links, and focused query tests. |

## What landed

- Added reusable promotion-event payloads for public cards/timeline rows: host org, public media, rank awards, promotees, awarding school, and counts.
- Added `findPublicPromotionEvents(brand)`, which lists slugged events relevant to the current brand while still including global/unattached seeded ceremony rows, and `getPromotionTimelineForOrganization(organizationId)`, which merges hosted events and awarded-school `RankAward`s into one deduped timeline.
- Added `PromotionTimeline` under `components/web/promotion-events/` and rendered it on `/organizations/[slug]` and `/schools/[slug]`.
- Added the brand-aware `/events` index with thumbnails, date/count/location badges, event cards linking to `/events/[slug]`, metadata, structured data, and a route loading skeleton.
- Linked event detail promotee names to existing `/lineage?q=<name>` discovery when a linked public lineage node exists; no fake dedicated profile route was invented.
- Added focused query tests for brand-aware event index filtering, org timeline query predicates, and hosted/awarded deduping.

## Decisions resolved

- No product decisions were reopened. The locked S0320 scope in `docs/petey-plan-0319.md` stayed binding.
- Current seed reality was documented instead of guessed: local CSW/OKC `PromotionEvent`s are global rows with no `hostOrganizationId`, and their linked ceremony `RankAward`s have no `organizationId`. The timeline implementation supports those fields but correctly renders empty for currently unattached seeded orgs.
- The event index uses `CreativeWork` structured-data helpers because the repo helper does not accept `"Event"` as a supported type; this preserves type safety without expanding structured-data helper scope.
- There is no public lineage profile route today. Promoted-person discovery uses the existing `/lineage` search route when a `lineageNode.slug` exists.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/promotion-events/payloads.ts` | Added reusable card/timeline payloads for event index and org timeline queries. |
| `apps/web/server/web/promotion-events/queries.ts` | Added brand-aware public event index query and org-scoped promotion timeline query/normalizer. |
| `apps/web/server/web/promotion-events/queries.test.ts` | Added focused query tests for brand filtering, timeline predicates, and dedupe behavior. |
| `apps/web/components/web/promotion-events/promotion-timeline.tsx` | New reusable read-only timeline component for org/school profiles. |
| `apps/web/app/(web)/events/page.tsx` | New public `/events` ceremony index page. |
| `apps/web/app/(web)/events/loading.tsx` | New loading skeleton for the events index route. |
| `apps/web/app/(web)/events/[slug]/page.tsx` | Added promotee discovery links to existing lineage search when lineage nodes exist. |
| `apps/web/app/(web)/organizations/[slug]/page.tsx` | Rendered org promotion timeline. |
| `apps/web/app/(web)/schools/[slug]/page.tsx` | Rendered school promotion timeline. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0320 row and bumped `last_agent`. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Added `PromotionTimeline` entry and paired SESSION_0320. |
| `docs/sprints/SESSION_0320.md` | Session ledger, pre-flight, verification, review, and close evidence. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test server/web/promotion-events/queries.test.ts` (`apps/web`) | passed — 3 pass, 0 fail, 9 expect calls |
| Direct Prisma DB probe for S0320 current seed reality | `/events` brand-aware predicate returns CSW (`6` awards / `4` media) and OKC (`2` awards / `4` media); BBL org currently has `0` hosted timeline rows and `0` awarded-school rows, matching the documented seed gap |
| `bunx biome check --write ...` on touched TS/TSX files | passed; fixed formatting in 3 files |
| `bun run typecheck` | initially failed on unsupported structured-data `"Event"` helper type; fixed to supported `"CreativeWork"` and reran passed |
| Operator browser/device smoke | skipped by directive; must be run operator-side if desired |
| Root `bun run lint` | intentionally not run per user directive and CLAUDE.md accepted-risk note (`packages/api-client` Biome PATH gap) |
| Full-close `bun run wiki:lint` | passed — 0 errors, 3 stale-frontmatter warnings (`architecture/data-model.md`, `aliases-and-canonical-ids.md`, `repo-truth-index.md`) |
| Final root `bun run typecheck` | passed |
| Final changed-file Biome (`bunx biome check ...`) | passed on all touched TS/TSX and touched docs paths |
| `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` | passed before commit; post-update stats: 8886 nodes, 13496 edges, 1354 communities, 1522 files tracked |

## Open decisions / blockers

- Operator-side browser/device smoke remains unrun by directive. Suggested smoke targets: `/events`, both seeded `/events/<slug>` pages, a public org detail page, and a school detail page.
- Seed data is not yet connected to org timelines: current seeded `PromotionEvent.hostOrganizationId` and ceremony `RankAward.organizationId` are null. The timeline query/UI is ready; a future data-quality slice can backfill host/awarding orgs if Brian chooses.
- SESSION_0321 should begin the event editor/upload slice only after reading the existing lineage capability and Dirstarter media/storage patterns.

## Next session

### Goal

SESSION_0321 — begin the event editor and media upload slice from `docs/petey-plan-0319.md`, capability-gated and still extending the existing lineage/media/storage patterns.

### First task

Use the SESSION_0321 slice in `docs/petey-plan-0319.md`: define which existing lineage/org roles can create or edit a `PromotionEvent`, then implement the smallest server-enforced create/edit action and dashboard surface. Read the live Dirstarter storage/media docs first if upload work starts; keep unauthorized write rejection server-side and continue to skip operator-only browser smoke in headless runs.

## Review log

### SESSION_0320_REVIEW_01 — Timeline/index close readiness

- **Reviewed tasks:** SESSION_0320_TASK_01, SESSION_0320_TASK_02
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/integrations/media`, `https://dirstarter.com/docs/codebase/structure`, `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/dirstarter-docs-inventory.md`
- **Verdict:** The implementation extends the existing baseline: cached Prisma feature-folder queries, App Router pages, existing media rows, and L1 primitives. Data integrity is acceptable because the timeline reads only explicit `hostOrganizationId` and `RankAward.organizationId` relationships; it does not infer org ownership from event titles or locations. The current seed gap is visible and documented rather than papered over.
- **Score:** 9.5/10
- **Follow-up:** Operator-side browser smoke and optional future data-quality backfill for host/awarding org links.

## Hostile close review

### Giddy + Doug verdict

- **Plan sanity:** Pass. S0320 implemented the locked plan slice only: org/school timeline plus `/events` index. Editor, upload, permissions, schema, and guessed data were kept out.
- **Dirstarter compliance:** Pass. The work uses Dirstarter-shaped public route composition and Prisma query/payload patterns; no replacement baseline was introduced.
- **Security:** Pass. Public read-only surfaces only; no action, upload, auth, or permission expansion.
- **Data integrity:** Pass with an explicit caveat. Timeline rows require real `hostOrganizationId` or `RankAward.organizationId`; the code does not infer from free-text locations. The local seed currently has no such org links, so empty states are expected.
- **Lifecycle proof:** Good. `/events` lists both seeded public ceremonies, detail pages still link to event media/promotions, and org/school pages now have the timeline slot ready for connected data.
- **Verification honesty:** Good. Focused tests cover query predicates and timeline dedupe; typecheck and Biome passed after a real type issue was fixed; browser smoke is explicitly operator-side.
- **Workflow honesty:** Good. Bow-in, Graphify-first discovery, Dirstarter alignment, Cody pre-flight, task IDs, component inventory, and wiki index are recorded. Root lint was not run by directive.
- **Merge readiness:** Ready if final `wiki:lint`, typecheck, changed-file Biome, and Graphify update pass.

### Findings (severity >= medium)

None.

### Kaizen aggregate

9.5/10 — The slice is small, typed, tested, and honest about missing seed relationships. Visual proof remains operator-side by instruction.

## ADR / ubiquitous-language check

- ADR update not required. ADR 0016 already covers `PromotionEvent` as a grouping fact above `RankAward`; SESSION_0320 only adds read surfaces.
- Ubiquitous language update not required. Existing terms remain `PromotionEvent`, `RankAward`, `Organization`, and `DirectoryProfile`; no new domain term was introduced.

## Reflections

- The current data model is ready for org timelines, but the current seed is not. That is a good boundary: the UI/query layer should not guess that "Combat Submission Wrestling Headquarters" maps to a specific org row just because the prose says so.
- The typecheck failure on `"Event"` structured data was useful. The helper's supported type union is narrower than schema.org; using `CreativeWork` keeps this session scoped to event surfaces instead of widening structured-data infrastructure.
- A dedicated public lineage profile URL still does not exist. Linking promotees to `/lineage?q=<name>` is a practical discovery bridge, but SESSION_0321 should not treat that as a finished profile-link model.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0320.md`, `docs/knowledge/wiki/index.md`, and `docs/knowledge/wiki/custom-component-inventory.md` checked; touched docs have current `updated` and `last_agent: codex-session-0320`. |
| Backlinks/index sweep | `wiki/index.md` has SESSION_0320 row; `custom-component-inventory.md` pairs with SESSION_0320 and records `PromotionTimeline`; `wiki/log.md` checked and intentionally not appended because its own frontmatter says routine session changes no longer belong there. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `aliases-and-canonical-ids.md`, `repo-truth-index.md`). |
| Kaizen reflection | Present in `## Reflections` and hostile review aggregate. |
| Hostile close review | `SESSION_0320_REVIEW_01` and Giddy/Doug verdict recorded above. |
| Review & Recommend | Next session goal and first task written from `docs/petey-plan-0319.md` SESSION_0321 slice. |
| Memory sweep | Wiki index and custom component inventory updated; no ADR/runbook/global memory change needed. |
| Next session unblock check | Unblocked: SESSION_0321 can start the capability-gated editor/upload slice; must read Dirstarter media/storage docs if upload work starts. |
| Git hygiene | FS-0024 guard passed (`pwd` = `/Users/brianscott/dev/ronin-dojo-app`, remote = `Ronin-Dojo-Design/ronin-dojo-baseline`); branch `auto/session-0320`; worktree list showed this worktree only; staged review contained 12 intended files and no secrets/env/node_modules; single commit made, hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before commit; post-update `graphify stats`: 8886 nodes, 13496 edges, 1354 communities, 1522 files tracked. |
