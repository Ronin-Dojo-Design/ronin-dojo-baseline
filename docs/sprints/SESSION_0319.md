---
title: "SESSION 0319 — PromotionEvent read surfaces"
slug: session-0319
type: session--implement
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: codex-session-0319
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0318.md
  - docs/petey-plan-0319.md
  - docs/architecture/lineage/promotion-event-model.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0319 — PromotionEvent read surfaces

## Date

2026-06-01

## Operator

Brian + codex-session-0319

## Goal

Implement the SESSION_0319 slice of the locked PromotionEvent display epic: add the additive `PromotionEvent.slug` migration, generalize the lineage seed into a data-driven promotion-event list, seed the June 8, 2024 Oklahoma City ceremony, seed read-only event gallery media, and build the brand-neutral `/events/[slug]` ceremony/gallery page with cross-links from existing lineage surfaces.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0318.md`
- Carryover: SESSION_0318 shipped the first-class `PromotionEvent` model, April 10 CSW ceremony seed, cohort visual groups, and a read-only Rank History badge. Its Next session block points to the locked 0319 epic plan and names this session's first automatable slice.
- Epic plan read first: `docs/petey-plan-0319.md`. Locked decisions accepted as binding: global `/events/[slug]`, additive nullable `slug`, real seeded BBL photos from `apps/web/public/seed/events/`, read-only S0319 surface only, and no upload/editor/permission model this session.

### Branch and worktree

- Branch: `auto/session-0319`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `ad9f890`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database, Media, and public App Router page composition. |
| Extension or replacement | Extension: adds one nullable field to an existing Ronin domain model, uses Prisma migrations, extends the existing `Media`/`MediaAttachment` polymorphic pattern, and composes existing common/web primitives. |
| Why justified | Promotion ceremonies are a Ronin martial-arts domain read surface above Dirstarter's directory boilerplate; Dirstarter supplies the database/media/page patterns but not this domain model. |
| Risk if bypassed | Skipping the Prisma/media patterns would leave production migrations, seeded galleries, or upload/read separation inconsistent with the baseline. |

Live docs checked during planning: Dirstarter Prisma (`https://dirstarter.com/docs/database/prisma`, 2026-06-01) and Dirstarter Media (`https://dirstarter.com/docs/integrations/media`, 2026-06-01).

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 8829 nodes, 13342 edges, 1310 communities, 1504 files tracked. `.graphify/graph_report.md` did not record a HEAD SHA, so source files were opened directly for proof.
- Queries used:
  - `PromotionEvent event gallery MediaAttachment lineage rank history ceremony seed slug`
  - `Next events slug page App Router Card Avatar Badge Stack lineage payloads media gallery`
  - `PromotionEvent PromotionEvent.slug RankAward MediaAttachment LineageVisualGroup`
  - `schema migration prisma workflow migrate dev runbook`
- Files selected from graph + read directly:
  - `apps/web/prisma/schema.prisma`
  - `apps/web/prisma/seed-baseline-lineage.ts`
  - `apps/web/server/web/lineage/payloads.ts`
  - `apps/web/components/web/lineage/lineage-rank-history-tab.tsx`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
  - `docs/runbooks/database/schema-migration.md`
  - `docs/runbooks/database/prisma-workflow.md`
  - `docs/runbooks/domain-features/lineage-hub.md`
- Verification note: Graphify selected the lane files; all implementation claims must be verified from source, migrations, DB probes, typecheck, lint, and tests.

### Grill outcome

No grill: the user explicitly directed headless execution and `docs/petey-plan-0319.md` already locks the decisions. Operator-only browser/device smoke is skipped and flagged for Brian; it will not block the close.

## Petey plan

### Goal

Ship SESSION_0319 of the PromotionEvent display epic: two seeded promotion events with slugs and media, a read-only event page, and lineage cross-links.

### Tasks

#### SESSION_0319_TASK_01 — Generalize PromotionEvent seed + OKC + slug

- **Agent:** Cody (build) + Doug (verify)
- **What:** Add `PromotionEvent.slug`, generate an additive migration, replace the hardcoded April-only seed helper with a small data-driven event list, seed OKC, link awards, and backfill slugs.
- **Steps:**
  1. Add nullable unique `PromotionEvent.slug String?` to `schema.prisma` and generate a migration with `bunx prisma migrate dev --name add_promotion_event_slug`.
  2. Define a `PromotionEventSeed` list for April 10, 2026 CSW and June 8, 2024 OKC.
  3. Match awards per event by explicit user keys plus date/location, replacing the brittle April-only `awardedAt === "2026-04-10"` collector.
  4. Generalize cohort-group wiring per event. For OKC, document the read-sensible choice: do not double-assign Bob Bass out of Dirty Dozen; the awards link regardless.
  5. Seed and re-run seed for idempotency; DB-probe both events and linked awards.
- **Done means:** slug migration is additive; two events are seeded idempotently; OKC links Bob Bass + Renato Magno; CSW behavior remains intact; schema validate, typecheck, seed/rerun, and DB probes pass.
- **Depends on:** nothing.

#### SESSION_0319_TASK_02 — `/events/[slug]` read-only ceremony/gallery page + sample media

- **Agent:** Cody (build) + Desi/Doug (visual/QA)
- **What:** Build the brand-neutral read-only event page using existing payload and primitive patterns, seed gallery media attachments, and link existing lineage surfaces to it.
- **Steps:**
  1. Add an event detail payload/query resolving `PromotionEvent` by `slug` with host org, rank awards, and media attachments.
  2. Add `app/(web)/events/[slug]/page.tsx` and `loading.tsx`; render title/date/location/description, promotee list, gallery grid, and a polished no-photo empty state.
  3. Seed `Media` + `MediaAttachment` rows from the committed `apps/web/public/seed/events/` assets for both events.
  4. Widen lineage `promotionEvent` selectors to include `slug`; link the Rank-History badge and cohort labels to `/events/[slug]`.
  5. Verify with typecheck, changed-file Biome, focused tests, seed probes, wiki-lint, and operator-side browser smoke flag.
- **Done means:** both seeded ceremony pages render from DB data; galleries are populated from seed media; the empty state exists for events without photos; existing lineage badges/cohort labels link to event pages; gates are green.
- **Depends on:** SESSION_0319_TASK_01.

### Parallelism

Code work is sequential: schema/client generation gates seed and page work; seed payload shape gates the page. Read-only inspection ran in parallel during bow-in, but implementation stays inline because Codex has no subagents and the same files are coupled.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0319_TASK_01 | Cody + Doug | Schema and seed changes require FS-0006/FS-0008 pre-flight and migration/data verification. |
| SESSION_0319_TASK_02 | Cody + Desi/Doug | Public UI must compose existing primitives and prove a read-only lifecycle without adding authoring scope. |

### Open decisions

None. `docs/petey-plan-0319.md` is binding for this headless session.

### Risks

- Local DB/dev-server instability recurred in prior sessions; DB/typecheck gates remain required, while browser smoke is operator-side.
- Root `bun run lint` may still hit the accepted `packages/api-client` Biome PATH issue from SESSION_0317; if root lint fails for that known blocker, stop uncommitted per user instruction rather than downgrading the gate.
- OKC cohort visual grouping can conflict with Bob Bass's Dirty Dozen assignment; do not double-assign.

### Scope guard

- No event editor.
- No media upload UI.
- No permission/capability model.
- No org promotions timeline.
- No `/events` index page.
- No roster reconciliation or guessed April-10 additions.
- Slug is the only schema change.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Prisma + Media docs, `docs/knowledge/wiki/dirstarter-docs-inventory.md`, `docs/knowledge/wiki/dirstarter-component-inventory.md`.
- **Baseline pattern to extend:** Prisma migration workflow, `Media`/`MediaAttachment` polymorphic owner fields, payload allowlist pattern in `server/web/lineage/payloads.ts`, and common/web UI primitives.
- **Custom delta:** Ronin-specific PromotionEvent read model, seeded ceremony gallery, and lineage cross-links.
- **No-bypass proof:** The change uses a versioned migration, existing media tables, and existing primitives; it does not fork storage/upload or build a new permission path.

## Cody pre-flight

### Pre-flight: Schema — PromotionEvent slug

#### 1. Petey invocation

- Petey plan exists in SESSION file with task IDs: yes.
- Petey waived: not applicable.

#### 2. Design doc check

- Design doc consulted: `docs/petey-plan-0319.md`, `docs/architecture/lineage/promotion-event-model.md`, `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`.
- Models match design doc: yes; `slug String? @unique` is the single additive exception locked by the epic.

#### 3. Existing schema scan

- Current model count: not recomputed at bow-in; related model lines read directly.
- Related existing models: `PromotionEvent`, `RankAward`, `Media`, `MediaAttachment`, `LineageVisualGroup`, `Organization`, `User`.
- Back-relations needed: no new relation back-relations for `slug`; existing relations are `PromotionEvent.rankAwards`, `PromotionEvent.mediaAttachments`, `PromotionEvent.visualGroups`, and `Organization.hostedPromotionEvents`.
- Schema spot-check: `PromotionEvent` currently has `id`, `title`, `eventDate`, `location`, `description`, timestamps, `hostOrganizationId`, `rankAwards`, `mediaAttachments`, `visualGroups`, `@@index([eventDate])`, `@@index([hostOrganizationId])`. `RankAward.promotionEventId` is nullable with `onDelete: SetNull`. `MediaAttachment.promotionEventId` is nullable and indexed. `LineageVisualGroup.promotionEventId` is nullable with `onDelete: SetNull`. `MediaType` will be read again before media seed edit; no enum spelling will be inferred from prose.

#### 4. Runbook consulted

- `docs/runbooks/database/schema-migration.md` read: yes.
- `docs/runbooks/database/prisma-workflow.md` read: yes.
- Migration strategy: `migrate dev` because the additive nullable field must ship as a production migration file.

#### 5. Data flow reference

- `docs/runbooks/sops/sop-data-and-wiring-flows.md` relevant flow: Browser → Next.js route → Prisma → Postgres rowset.
- `docs/runbooks/sops/sop-e2e-user-lifecycle.md` relevant stage: public directory/profile publication read surface; no auth mutation path.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0006 (schema work without Petey/pre-flight), FS-0008 (schema spot-check skipped).
- Mitigation acknowledged: Petey plan + task IDs exist before code; schema fields and enum values are read from `schema.prisma` before editing.

### Pre-flight: PromotionEvent seed, query, and event page

#### 1. Existing component scan

- Graphify query used: `Next events slug page App Router Card Avatar Badge Stack lineage payloads media gallery`.
- Found: existing lineage payload allowlist (`server/web/lineage/payloads.ts`), Rank-History component (`lineage-rank-history-tab.tsx`), lineage canvas cohort labels (`lineage-tree-canvas.tsx`), public route patterns under `app/(web)/organizations/[slug]/page.tsx` and `app/(web)/programs/page.tsx`, and committed assets under `apps/web/public/seed/events/`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes.
- Closest L1 pattern: common primitives (`Card`, `Badge`, `Avatar`, `Stack`, `Heading`, `Note`) plus web UI layout primitives (`Container`, `Intro`, `Section`); public App Router pages fetch server-side data and render composed primitive layouts.
- Primitive API spot-check: `Badge` supports `variant: primary|soft|outline|success|caution|warning|info|danger`, `size: sm|md|lg`, `prefix`, `suffix`, `render`; `Card` supports `hover`, `focus`, `isRevealed`, `isHighlighted`, `render`; `Stack` supports `size: xs|sm|md|lg`, `direction: row|column`, `wrap`, `render`; `Avatar`/`AvatarImage`/`AvatarFallback` use Base UI props; `Heading`/`H1`-`H6` use `size` + `render`; `Link` wraps Next Link; `Container`, `Intro`, and `Section` are existing page layout primitives.

#### 3. Composition decision

- Extending existing component: `LineageRankHistoryTab` and `LineageTreeCanvas` for cross-links.
- Composing existing components: `Card`, `Badge`, `Avatar`, `Stack`, `H*`, `Note`, `Container`, `Intro`, `Section`, Next `Image`/`Link`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`.
- Runbook consulted: `docs/runbooks/domain-features/lineage-hub.md`, `docs/runbooks/database/schema-migration.md`, `docs/runbooks/database/prisma-workflow.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (webpack fallback only if DB-backed route regresses).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: operator-side browser smoke for `http://bbl.local:3000/events/<slug>` and `http://localhost:3000/events/<slug>` is skipped in headless close; DB/type/lint gates are required.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (raw/scratch components), FS-0008 (primitive API spot-check skipped), FS-0006 (schema pre-flight skipped).
- Mitigation acknowledged: compose inventory primitives, record prop APIs, keep schema/page changes under the locked plan, and verify with gates before commit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0319_TASK_01 | landed | Additive `PromotionEvent.slug` migration applied via `migrate deploy` after non-interactive `migrate dev` refusal; CSW + OKC seeded idempotently with slugs, awards, media, and cohort links. |
| SESSION_0319_TASK_02 | landed | Read-only `/events/[slug]` page, event detail query/payload, seeded gallery media, Rank-History badge link, and lineage cohort label links implemented; browser smoke remains operator-side per directive. |

## What landed

- Added nullable unique `PromotionEvent.slug` and the additive migration `20260601091036_add_promotion_event_slug`. Prisma 7 refused `migrate dev` in this non-interactive headless shell after previewing the warning, so the migration SQL was generated with `migrate diff`, checked for destructive operations, and applied with `migrate deploy`.
- Generalized the lineage seed from a single April-only ceremony into a data-driven `PROMOTION_EVENTS` list. The April 10, 2026 CSW event keeps its existing behavior; the June 8, 2024 Oklahoma City event now exists with slug `coral-belt-ceremony-oklahoma-city-2024`, Bob Bass + Renato Magno award links, seeded media, and per-tree OKC cohort groups where the data model can represent them.
- Seeded real BBL ceremony photos from `apps/web/public/seed/events/` through the existing `Media` + `MediaAttachment` pattern. Each seeded ceremony has four public gallery images and the seed is idempotent on rerun.
- Added the brand-neutral read-only `/events/[slug]` surface with static params, metadata, event detail query/payload, promotee list, event details, gallery grid, and the no-photo empty state required by the epic.
- Widened lineage payloads so existing public surfaces know `PromotionEvent.slug`, then linked the Rank History ceremony badge and cohort group labels to `/events/[slug]` when a linked event has a slug.
- Hardened the lineage public-rank visibility helper to tolerate minimal test fixtures (`node.user?.directoryProfile?.showRanks !== false`) after the focused lineage tests exposed the assumption.

## Decisions resolved

- No new product decisions were made in the headless run. The locked decisions in `docs/petey-plan-0319.md` stayed binding: `/events/[slug]`, nullable additive slug, seeded gallery proof, S0319 read-only only, and editor/upload/permission work deferred.
- OKC cohort visual grouping uses Renato Magno only. Bob Bass remains in the historical Dirty Dozen visual group because `LineageTreeMember.visualGroupId` allows one group; both OKC awards still link to the OKC `PromotionEvent`.
- Operator-only browser/device smoke was explicitly skipped per the user directive and recorded as an operator-side follow-up, not a close blocker.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Added nullable unique `PromotionEvent.slug`. |
| `apps/web/prisma/migrations/20260601091036_add_promotion_event_slug/migration.sql` | New additive migration: nullable `slug` column + unique index. |
| `apps/web/prisma/seed-baseline-lineage.ts` | Replaced April-only event seed with a data-driven event list; seeded OKC event, slugs, media attachments, award links, and per-tree cohort groups. |
| `apps/web/server/web/promotion-events/payloads.ts` | Added public event detail payload selecting host organization, awards, ranks, promoters, organizations, and media. |
| `apps/web/server/web/promotion-events/queries.ts` | Added cached slug list + slug detail queries for `/events/[slug]`. |
| `apps/web/app/(web)/events/[slug]/page.tsx` | Added read-only ceremony/gallery page with metadata, promotee list, details, and gallery. |
| `apps/web/app/(web)/events/[slug]/loading.tsx` | Added route loading skeleton. |
| `apps/web/server/web/lineage/payloads.ts` | Added `slug` to linked promotion events and exposed `promotionEvent` on visual groups. |
| `apps/web/server/web/lineage/queries.ts` | Hardened public-rank visibility against missing `directoryProfile` in minimal fixtures. |
| `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` | Linked ceremony badges to `/events/[slug]` when a slug exists. |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Linked tree cohort group labels to `/events/[slug]` when a slug exists. |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | Linked board-mode compact group labels to `/events/[slug]` when a slug exists. |
| `docs/sprints/SESSION_0319.md` | Session ledger, task log, verification, hostile review, and close evidence. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0319 row and bumped metadata. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Recorded SESSION_0319 lineage link behavior on `LineageRankHistoryTab` and `LineageCompactChildList`. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx prisma validate` | passed after schema edit |
| `bunx prisma migrate dev --name add_promotion_event_slug` | blocked by Prisma 7 non-interactive refusal; no migration applied by this command |
| `bunx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` | generated additive SQL for nullable `slug` + unique index |
| `bunx prisma migrate deploy` | applied `20260601091036_add_promotion_event_slug` |
| Migration SQL destructive-op scan | no output; no `DROP`, `TRUNCATE`, `ALTER TABLE ... DROP`, or `SET NOT NULL` |
| `bunx prisma generate` | passed |
| Seed run 1 (`bun run prisma/seed-baseline-lineage.ts`) | passed; created/refreshed CSW + OKC events, linked awards, seeded media, created OKC cohort groups |
| Seed run 2 (`bun run prisma/seed-baseline-lineage.ts`) | passed; idempotent refresh |
| DB probe — events | CSW slug: 6 awards / 4 media; OKC slug: 2 awards / 4 media |
| DB probe — OKC awards | Bob Bass `CB7` and Renato Magno `CB7`, both `2024-06-08`, `Oklahoma City, OK` |
| DB probe — visual groups | CSW: BASELINE + BBL groups with 4 members each; OKC: BASELINE + BBL groups with 1 member each |
| Changed-file Biome (`bunx biome check --write ...`) | passed after formatting the touched TS/TSX files |
| `bun run typecheck` (`apps/web`) | passed |
| Focused lineage tests (`bun test server/web/lineage/queries.test.ts server/web/lineage/queries.visibility.test.ts`) | 42 pass, 0 fail |
| `bun run test` (`apps/web`) | 370 pass, 0 fail, 1152 expect calls, 66 files |
| Operator browser/device smoke | skipped by directive; must be run operator-side against `bbl.local` / localhost if desired |
| Full-close `bun run wiki:lint` | pending final close gate |
| Full-close root `bun run typecheck` | pending final close gate |
| Full-close root `bun run lint` | pending final close gate |
| Full-close root tests | pending final close gate |

## Open decisions / blockers

- Operator-side browser/device smoke remains the only unrun UX proof. It was explicitly skipped for headless execution and is not a code blocker.
- SESSION_0320 should continue the locked epic: org/school promotions timeline and `/events` index, still read-only.
- Editor, media upload UI, and permission/capability modeling remain deferred to SESSION_0321.
- `migrate dev` is not usable in this non-interactive Prisma 7 shell. The migration was still generated from Prisma diff SQL, destructive-scan checked, applied with `migrate deploy`, and verified with Prisma generate/typecheck/tests.

## Next session

### Goal

SESSION_0320 — implement the org/school promotions timeline and `/events` index from `docs/petey-plan-0319.md`, then complete read-surface cross-links.

### First task

Use the SESSION_0320 slice in `docs/petey-plan-0319.md`: add a read-only promotions timeline to the relevant organization/school profile surface using hosted `PromotionEvent`s and `RankAward.organizationId`, then scaffold `/events` as the brand-aware list of public ceremonies. Continue to skip operator-only browser smoke in headless runs and keep editor/upload/permissions deferred to SESSION_0321.

## Review log

### SESSION_0319 — PromotionEvent read surfaces

#### Review

**SESSION_0319_REVIEW_01 — Read-surface close readiness**

- **Reviewed tasks:** SESSION_0319_TASK_01, SESSION_0319_TASK_02
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/integrations/media`, `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/dirstarter-docs-inventory.md`
- **Verdict:** The slice extends the baseline instead of bypassing it: Prisma schema changes are versioned, gallery data uses existing `Media`/`MediaAttachment`, and the UI composes existing primitives. The weakest proof is visual/browser behavior, but the user explicitly moved that to operator-side. Data integrity is acceptable for the current read-only scope because slugs are unique, event award links are explicit by person/date/location, and seed reruns proved idempotency.

#### Findings

**SESSION_0319_FINDING_01 — Operator browser smoke still manual**

- **Severity:** low
- **Task:** SESSION_0319_TASK_02
- **Evidence:** User directive for this run: "SKIP any operator-only browser/device smoke"; Verification table records the skip.
- **Impact:** Layout and hostname-specific behavior were not visually proven in this headless close, even though typecheck/tests/DB probes passed.
- **Required follow-up:** Operator can smoke `/events/coral-belt-ceremony-csw-world-conference-2026`, `/events/coral-belt-ceremony-oklahoma-city-2024`, and the linked lineage surfaces on the desired hostnames.
- **Status:** accepted-risk

**SESSION_0319_FINDING_02 — Prisma `migrate dev` non-interactive refusal required manual SQL path**

- **Severity:** low
- **Task:** SESSION_0319_TASK_01
- **Evidence:** `bunx prisma migrate dev --name add_promotion_event_slug` refused non-interactive execution; migration SQL was generated via `migrate diff` and applied via `migrate deploy`.
- **Impact:** The migration was not produced by the preferred interactive command, but the final SQL is minimal and was validated/applied against the local database.
- **Required follow-up:** None for this slice; continue documenting non-interactive migration handling in future headless sessions.
- **Status:** accepted-risk

## Hostile close review

### Giddy + Doug verdict

- **Plan sanity:** Good. The epic pre-locked the route, slug, media proof, session split, and deferrals, so the headless run did not re-decide product scope.
- **Dirstarter compliance:** Aligned. The work uses Prisma migrations, the existing media tables, and the existing common/web component layer instead of introducing parallel storage or UI systems.
- **Security:** No write surface or permission expansion shipped. Seeded media are public read-only rows, and the event page reads public ceremony data.
- **Data integrity:** Strong enough for this slice: `slug` has a unique index, award linking is explicit by event seed criteria, seed rerun was idempotent, and DB probes confirmed counts.
- **Lifecycle proof:** The read path is proven from seed -> DB -> cached query -> page and from existing lineage surfaces -> event slug links. Browser smoke is the remaining operator-side proof.
- **Verification honesty:** Tests and DB probes prove more than compilation: event counts, award links, media counts, visual-group links, lineage selectors, and redaction behavior were exercised. The verification table calls out the unrun browser smoke.
- **Workflow honesty:** Bow-in, task IDs, Dirstarter check, Graphify-first discovery, schema pre-flight, wiki/component inventory sweep, and close review are recorded. Push/PR are intentionally suppressed by the user's override.
- **Merge readiness:** Ready to commit if final wiki/typecheck/lint/test gates pass. If any final gate fails, this must remain uncommitted per user instruction.

### Kaizen answers

1. **Is this safe and secure? What tests would prove me right?** It is safe for read-only public ceremony data: no mutation route, no upload UI, no permissions change. The strongest missing proof is browser/device visual smoke on the actual operator hostnames; Playwright/browser screenshots would close that gap, but the user explicitly excluded it for this run.
2. **How many failed steps could we have prevented?** One process wrinkle: assuming `migrate dev` might work headlessly cost a retry. Future headless schema sessions should start with the runbook-preferred command but be ready to document the `migrate diff` + `migrate deploy` fallback immediately when Prisma refuses non-interactive shells.
3. **Confidence at scale:** 100 events/users: 9.5/10. 1,000: 9/10. 10,000: 8.5/10 because `/events/[slug]` currently renders all awards/media for one ceremony without pagination, which is correct for ceremonies but should be revisited if non-ceremony events become large.

**Kaizen aggregate:** 8.5/10. Proceed with SESSION_0320 as planned; no remediation session required, but carry browser smoke as operator-side evidence.

## ADR / ubiquitous-language check

- No new ADR needed. SESSION_0318 already ratified `PromotionEvent`; SESSION_0319 only added the locked route key (`slug`) and read surfaces from `docs/petey-plan-0319.md`.
- No ubiquitous-language change needed. Existing domain terms remain `PromotionEvent`, `RankAward`, `LineageVisualGroup`, `Media`, and `MediaAttachment`; no alias term was introduced.

## Reflections

- Prisma 7's non-interactive `migrate dev` refusal is now the main headless schema friction. The diff/deploy fallback worked cleanly here because the change was nullable + unique-index only; a riskier migration would need extra review before applying.
- The focused lineage tests were useful: they exposed that the public-rank redaction helper assumed fully populated `directoryProfile` fixtures. The optional-chain hardening is safer and more honest than inflating every test fixture.
- The OKC cohort wrinkle is a good reminder that the visual group is not the event truth. Bob Bass can stay Dirty Dozen visually while his `RankAward` still links to the OKC event.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0319.md`, `docs/knowledge/wiki/index.md`, and `docs/knowledge/wiki/custom-component-inventory.md` checked; touched docs have current `updated` and `last_agent: codex-session-0319`. |
| Backlinks/index sweep | `wiki/index.md` has the SESSION_0319 row; `custom-component-inventory.md` records SESSION_0319 lineage component behavior; this SESSION pairs back to the component inventory. |
| Wiki lint | pending final close gate |
| Kaizen reflection | Present in `## Hostile close review` and `## Reflections`. |
| Hostile close review | `SESSION_0319_REVIEW_01`, `SESSION_0319_FINDING_01`, and `SESSION_0319_FINDING_02` recorded above. |
| Review & Recommend | Next session goal and first task written from `docs/petey-plan-0319.md` SESSION_0320 slice. |
| Memory sweep | Wiki index and custom component inventory updated; no new runbook or ADR created. |
| Next session unblock check | Unblocked: SESSION_0320 should add org/school promotions timeline and `/events` index; editor/upload/permissions remain out of scope. |
| Git hygiene | pending final close gate and FS-0024 guard; hash reported at bow-out — see git log. |
| Graphify update | pending final close gate |
