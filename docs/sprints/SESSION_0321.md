---
title: "SESSION 0321 — PromotionEvent editor action slice"
slug: session-0321
type: session--implement
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: codex-session-0321
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0320.md
  - docs/petey-plan-0319.md
  - docs/architecture/lineage/promotion-event-model.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0321 — PromotionEvent editor action slice

## Date

2026-06-01

## Operator

Brian + codex-session-0321

## Goal

Begin the SESSION_0321 write-side slice from the locked PromotionEvent epic by defining and enforcing the existing lineage capability model for `PromotionEvent` authoring, then landing the smallest dashboard-backed create/edit/link action surface. Media upload remains deferred unless the existing storage path proves trivial and safe inside this slice.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0320.md`
- Carryover: SESSION_0320 shipped the read-only org/school promotion timeline, `/events` ceremony index, and read-surface cross-links. SESSION_0321 continues `docs/petey-plan-0319.md` by beginning the capability-gated write side.
- Epic plan read first: `docs/petey-plan-0319.md`. Locked decisions accepted as binding: `/events/[slug]` remains the route shape; read surfaces are proven; S0321 begins but does not need to complete every editor/upload affordance; storage/media must extend the Dirstarter pipeline if upload work starts; browser/device smoke is operator-side.

### Branch and worktree

- Branch: `auto/session-0321`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `046f396`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Better Auth/action protection, Prisma/database writes, dashboard App Router composition, media/storage planning. |
| Extension or replacement | Extension: reuse the existing Dirstarter auth/action/server patterns and Prisma client while adding Ronin lineage capability checks above them. |
| Why justified | Promotion ceremony authoring is Ronin domain behavior layered onto Dirstarter's protected dashboard and database baseline. |
| Risk if bypassed | A parallel permission or upload stack would weaken server authorization and make the later shared-gallery upload path harder to verify. |

Live docs checked during planning on 2026-06-01: Dirstarter Storage (`https://dirstarter.com/docs/integrations/storage`), Media (`https://dirstarter.com/docs/integrations/media`), Authentication (`https://dirstarter.com/docs/authentication`), and Prisma (`https://dirstarter.com/docs/database/prisma`).

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 8886 nodes, 13496 edges, 1354 communities, 1522 files tracked.
- Queries used:
  - `SESSION_0321 PromotionEvent editor media upload capability lineage RankAward create update action dashboard MediaAttachment`
- Files selected from graph:
  - `apps/web/server/web/lineage/editor-actions.ts`
  - `apps/web/server/web/promotion-events/queries.ts`
  - `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx`
  - `apps/web/app/(web)/dashboard/page.tsx`
  - `docs/petey-plan-0319.md`
  - `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`
  - `docs/architecture/lineage/promotion-event-model.md`
- Verification note: Graphify selected the lane files; exact source reads, focused tests, typecheck, Biome, wiki-lint, and close review remain the proof.

### Grill outcome

No grill: the user explicitly directed headless execution and `docs/petey-plan-0319.md` already locks the decisions. The refined automatable slice is `SESSION_0321_TASK_01` only: capability model plus create/edit/link action and minimal dashboard entry point. Operator-only browser/device smoke is skipped and flagged for Brian.

## Petey plan

### Goal

Land the first S0321 write-side increment: server-enforced `PromotionEvent` authoring capability and a minimal dashboard surface that uses it.

### Tasks

#### SESSION_0321_TASK_01 — Capability-gated PromotionEvent editor action

- **Agent:** Cody (build) + Doug (verify)
- **What:** Reuse the existing lineage capability model to authorize `PromotionEvent` create/update and linked-award edits, then expose the smallest dashboard-only form entry point.
- **Steps:**
  1. Inspect existing lineage editor capability helpers, safe-action patterns, dashboard pages, and `PromotionEvent` query/payload code.
  2. Define the event-authoring rule from locked docs: global admin, org owner/admin for the host org, lineage tree admin/editor, branch/node editor only when linked awards are in scope, and existing rank-award capability where already present.
  3. Add server-enforced create/update/link action(s) for title, date, location, description, host org, and linked `RankAward`s; reject unauthorized users server-side and write audit where the existing audit model is available.
  4. Add a minimal dashboard editor entry point that uses existing primitives and server actions; keep public event pages read-only.
  5. Add focused tests for authorized and unauthorized action paths.
- **Done means:** a capability-holding user can create/update a `PromotionEvent` and link/unlink awards from the dashboard surface; unauthorized users are rejected by server logic; typecheck, focused tests, changed-file Biome, and `wiki:lint` pass.
- **Depends on:** nothing.

### Parallelism

Implementation is sequential because the same capability helper feeds the server actions, tests, and dashboard surface. Codex has no subagents, so Cody and Doug work is performed inline.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0321_TASK_01 | Cody + Doug | Server writes and capability checks need source-backed implementation plus focused authorization tests. |

### Open decisions

None. Upload polish and full editor affordances stay deferred by the locked plan's "begin, keep small" constraint.

### Risks

- Existing lineage ACL may be tree-scoped while events are global; capability resolution must avoid broad writes from a narrow branch/node grant.
- Existing seed events have null host-org links; the action must support hostless historical events without granting org-owner rights by accident.
- Media upload may require S3 environment/provider assumptions; this session will not fork the storage pipeline.
- Browser/device smoke remains operator-side per directive.

### Scope guard

- No public write surface.
- No new permission system.
- No schema change unless an existing code path proves impossible without it.
- No media upload implementation unless it reuses the existing pipeline without extra product decisions.
- No event attendance/attestor model.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Storage, Media, Authentication, and Prisma live docs checked 2026-06-01.
- **Baseline pattern to extend:** Better Auth server-side route/action protection, Prisma feature-folder query/write code, dashboard App Router forms, and existing media/storage helper path.
- **Custom delta:** Ronin lineage capability rules for promotion ceremony authoring and shared `RankAward` event linkage.
- **No-bypass proof:** The slice layers capability checks on the existing authenticated server action and Prisma write paths; it does not add a second auth system, upload provider, or ORM path.

## Cody pre-flight

### Pre-flight: capability-gated PromotionEvent editor action

#### 1. Existing component scan

- Graphify query used: `SESSION_0321 PromotionEvent editor media upload capability lineage RankAward create update action dashboard MediaAttachment`
- Found: existing lineage capability/action spine in `server/web/lineage/editor-actions.ts` and `editor-queries.ts`; existing public `PromotionEvent` read queries/payloads in `server/web/promotion-events/`; existing dashboard tab/page patterns under `app/(web)/dashboard`; existing media upload/attachment actions in `server/web/actions/media.ts` and `server/admin/media/actions.ts`.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes
- Consulted live alignment URLs: yes — Storage, Media, Authentication, Prisma.
- Closest L1 pattern: `userActionClient` / authenticated server action protection plus Prisma write/query modules; dashboard client forms using `react-hook-form` + `next-safe-action`.
- Primitive API spot-check:
  - `Button`: `variant: "fancy" | "primary" | "secondary" | "soft" | "ghost" | "destructive"`, `size: "xs" | "sm" | "md" | "lg"`, `isPending`, `prefix`, `suffix`, `render`.
  - `Card`: `hover`, `focus`, `isRevealed`, `isHighlighted`, `render`; `CardHeader`/`CardFooter` are `Stack` wrappers; `CardDescription` is a `div`.
  - `Badge`: `variant: "primary" | "soft" | "outline" | "success" | "caution" | "warning" | "info" | "danger"`, `size: "sm" | "md" | "lg"`, `prefix`, `suffix`, `render`.
  - `Stack`: `size: "xs" | "sm" | "md" | "lg"`, `direction: "row" | "column"`, `wrap`, `render`.
  - `Form`: React Hook Form provider with `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`.
  - `Input`: `size: "sm" | "md" | "lg"` plus `boxVariants` hover/focus props.
  - `TextArea`: `size: "sm" | "md" | "lg"`.
  - `Select`: Base UI `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` with `value`/`onValueChange`.
  - `Checkbox`: Base UI checkbox root props with checked/onCheckedChange.

#### 3. Composition decision

- Extending existing component: dashboard tabs/page composition and lineage editor capability/action patterns.
- Composing existing components: `Button`, `Card`, `Badge`, `Stack`, `Form`, `Input`, `TextArea`, `Select`, `Checkbox`, `Link`, `Intro`, `Section`, `Breadcrumbs`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`.
- Runbook consulted: `docs/runbooks/domain-features/lineage-hub.md`; live Dirstarter Storage, Media, Authentication, and Prisma docs.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (webpack fallback if local DB-backed route smoke regresses).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: operator-side browser smoke is skipped by directive; server/action tests, typecheck, changed-file Biome, and wiki-lint are required.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0008, FS-0024, FS-0025.
- Mitigation acknowledged: task ID and pre-flight exist before code; exact primitive APIs and Prisma model fields were read from source; Graphify was used before broad search; no schema change is planned; `graphify update` will run before the single close commit; FS-0024 guard runs before commit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0321_TASK_01 | landed | Added server-enforced `PromotionEvent` create/update/link action, scoped capability resolution, dashboard Events tab, new/edit form routes, and focused authorization tests. |

## What landed

- Added `PromotionEvent` editor schemas, errors, authorization helpers, queries, and audited upsert action under `server/web/promotion-events/`.
- The authoring scope reuses existing grants: global admin, active host/award organization roles (`OWNER`, `ORG_ADMIN`, `INSTRUCTOR`, `COACH`), promoting instructor via `RankAward.awardedById`, and lineage `TREE_ADMIN` / `TREE_EDITOR` / scoped `BRANCH_EDITOR` / `NODE_EDITOR` grants.
- The action enforces current-brand event/award relevance, prevents stealing a `RankAward` from another event, writes `AuditLog`, regenerates a unique slug from title + year, and revalidates dashboard/public event paths.
- Added the dashboard Events tab plus `/dashboard/events/new` and `/dashboard/events/[eventId]` routes with a reusable client form for event details, host organization, linked rank awards, and mandatory audit note.
- Left public `/events` routes read-only and deferred media upload to the next slice; no schema or storage-provider changes were made.
- Added focused tests for authorized create, no-grant rejection, and out-of-scope rank-award link rejection.

## Decisions resolved

- Refined the broad S0321 epic outline to the first automatable code slice: capability model + create/edit/link action + minimal dashboard surface. Media upload remains next-session work.
- Hostless historical events are allowed only for global admins or users with full-tree lineage authoring scope; host organization grants do not create broad hostless-event rights.
- Linking `RankAward`s is stricter than editing event metadata: every selected award must be in the user's award-authoring scope even when the user can edit the host event.
- Branch/node lineage grants are scoped through `LineageTreeMember` ancestry or node targeting; they do not become global event-editor grants.
- No ADR or ubiquitous-language update was required: `PromotionEvent`, `RankAward`, `Organization`, and existing lineage capability roles remain the governing terms.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/promotion-events/editor-errors.ts` | Added canonical editor error strings for event write authorization and validation failures. |
| `apps/web/server/web/promotion-events/editor-schemas.ts` | Added the `upsertPromotionEventSchema` with date normalization, optional host/text fields, linked-award IDs, and audit-note validation. |
| `apps/web/server/web/promotion-events/editor-authorization.ts` | Added scoped authoring resolution for org roles, lineage grants, promoting instructor checks, and rank-award/event authorization helpers. |
| `apps/web/server/web/promotion-events/editor-actions.ts` | Added audited `applyPromotionEventEditorUpsert` and safe action wrapper for create/update/link/unlink behavior. |
| `apps/web/server/web/promotion-events/editor-queries.ts` | Added dashboard editor list/options queries for editable events, host organizations, and linkable rank awards. |
| `apps/web/server/web/promotion-events/editor-actions.test.ts` | Added focused server-side authorization tests. |
| `apps/web/app/(web)/dashboard/page.tsx` | Added the Events dashboard tab. |
| `apps/web/app/(web)/dashboard/events-tab.tsx` | Added the dashboard list of editable promotion events and links to new/edit/gallery surfaces. |
| `apps/web/app/(web)/dashboard/events/promotion-event-editor-form.tsx` | Added the client form for event metadata, host organization, linked rank awards, and audit note. |
| `apps/web/app/(web)/dashboard/events/new/page.tsx` | Added the dashboard create route with server-side capability gating. |
| `apps/web/app/(web)/dashboard/events/[eventId]/page.tsx` | Added the dashboard edit route with server-side capability gating. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0321 row and bumped `last_agent`. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Added dashboard PromotionEvent surfaces and paired SESSION_0321. |
| `docs/sprints/SESSION_0321.md` | Session ledger, pre-flight, verification, review, and close evidence. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test server/web/promotion-events/editor-actions.test.ts` (`apps/web`) | passed — 3 pass, 0 fail, 7 expect calls |
| `bun run typecheck` | initially failed on client form schema optionality; fixed `rankAwardIds` to a required array and reran passed |
| `bunx biome check --write ...` on touched TS/TSX/docs | passed; formatting applied where needed |
| Final `bun run wiki:lint` | passed — 0 errors, 3 stale-frontmatter warnings (`architecture/data-model.md`, `aliases-and-canonical-ids.md`, `repo-truth-index.md`) |
| Final `bun run typecheck` | passed |
| Final `bun test server/web/promotion-events/editor-actions.test.ts` (`apps/web`) | passed — 3 pass, 0 fail, 7 expect calls |
| Final changed-file Biome (`bunx biome check ...`) | passed on all touched TS/TSX and touched docs paths |
| `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` | passed before commit; `graphify stats`: 8928 nodes, 13675 edges, 1349 communities, 1532 files tracked |
| Operator browser/device smoke | skipped by directive; suggested targets are `/dashboard` Events tab, `/dashboard/events/new`, and `/dashboard/events/<eventId>` with an authorized test user |
| Root `bun run lint` | intentionally not run per user directive and CLAUDE.md accepted-risk note (`packages/api-client` Biome PATH gap) |

## Open decisions / blockers

- Media upload to the shared `PromotionEvent` gallery remains deferred. The next slice should reuse `uploadToS3Storage`, `Media`, and `MediaAttachment.promotionEventId` rather than adding a second upload path.
- Operator-side browser/device smoke remains unrun by directive.
- The dashboard event form depends on existing editable rank-award data. Seeded CSW/OKC ceremony awards are still largely global/unattached, so non-admin visibility depends on lineage grants or promoter/award-school scope.

## Next session

### Goal

Continue the S0321 write side by wiring media upload to the shared `PromotionEvent` gallery through the existing Dirstarter storage/media pipeline.

### First task

Read the final SESSION_0321 close notes, then implement the smallest authorized upload action that creates a `Media` row and `MediaAttachment.promotionEventId` using the existing storage helper. Keep upload rejection server-side and do not widen the event-authoring role model without a plan update.

## Review log

### SESSION_0321_REVIEW_01 — Editor action close readiness

- **Reviewed tasks:** SESSION_0321_TASK_01
- **Dirstarter docs check:** live docs checked
- **Sources:** `https://dirstarter.com/docs/integrations/storage`, `https://dirstarter.com/docs/integrations/media`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/database/prisma`, `docs/petey-plan-0319.md`, `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`
- **Verdict:** The implementation extends the existing authenticated action and Prisma write patterns, and it keeps the event write side scoped to server-enforced lineage/org capability. Data integrity is acceptable for this slice because event writes never verify ranks, do not create awards, reject out-of-scope award links, and audit every create/update. Media upload is correctly deferred rather than half-wired.
- **Score:** 9.5/10
- **Follow-up:** Implement authorized gallery upload and operator-side browser smoke.

## Hostile close review

### Giddy + Doug verdict

- **Plan sanity:** Pass. The session implemented the first automatable S0321 slice only; upload and fuller editor polish stayed deferred.
- **Dirstarter compliance:** Pass. It reuses Better Auth-backed `userActionClient`, Prisma feature-folder code, dashboard App Router composition, and existing L1 primitives.
- **Security:** Pass. Authorization is server-side, current-brand scoped, and tested for both no-grant rejection and out-of-scope award link rejection.
- **Data integrity:** Pass. `RankAward` remains canonical; `PromotionEvent` is only a grouping fact. The action prevents selected awards already linked to another event from being silently stolen.
- **Lifecycle proof:** Good for the slice. Dashboard users with scope can create/edit ceremony metadata and award links; public event pages remain read-only.
- **Verification honesty:** Good. Focused action tests and typecheck passed; browser/device smoke is explicitly operator-side.
- **Workflow honesty:** Good. Bow-in, Graphify-first discovery, locked plan read, Cody pre-flight, task ID, component inventory, wiki index, and root-lint skip rationale are recorded.
- **Merge readiness:** Ready if final `wiki:lint`, typecheck, changed-file Biome, and Graphify update pass.

### Findings (severity >= medium)

None.

### Kaizen aggregate

9.5/10 — The slice is deliberately narrow and enforces the risky boundary server-side. The next session needs to avoid duplicating media upload machinery.

## ADR / ubiquitous-language check

- ADR update not required. ADR 0016 already states `RankAward` is canonical and `PromotionEvent` is an optional grouping fact; this session implements the deferred write surface without changing that decision.
- Ubiquitous language update not required. Existing terms remain `PromotionEvent`, `RankAward`, `Organization`, and lineage editor roles; no new domain term was introduced.

## Reflections

- The important boundary was not "can this user edit an event?" but "can this user link these exact awards?" Keeping those as two separate checks prevents host-org access from becoming broad rank-history write access.
- The current media pipeline already has the right ingredients (`uploadToS3Storage`, `Media`, `MediaAttachment`), but it is admin/web split today. Deferring upload kept this session from inventing storage policy under time pressure.
- Hostless historical events are useful, but they need a narrow grant path. Tying hostless creation to global admin or full-tree lineage scope keeps branch/node grants from becoming global ceremony editors.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0321.md`, `docs/knowledge/wiki/index.md`, and `docs/knowledge/wiki/custom-component-inventory.md` checked; touched docs have current `updated` and `last_agent: codex-session-0321`. |
| Backlinks/index sweep | `wiki/index.md` has SESSION_0321 row; `custom-component-inventory.md` pairs with SESSION_0321 and records `DashboardEventsTab` + `PromotionEventEditorForm`; `wiki/log.md` checked and intentionally not appended because its own frontmatter says routine session changes no longer belong there. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `aliases-and-canonical-ids.md`, `repo-truth-index.md`). |
| Kaizen reflection | Present in `## Reflections` and hostile review aggregate. |
| Hostile close review | `SESSION_0321_REVIEW_01` and Giddy/Doug verdict recorded above. |
| Review & Recommend | Next session goal and first task written for authorized media upload. |
| Memory sweep | Wiki index and custom component inventory updated; no ADR/runbook/global memory change needed. |
| Next session unblock check | Unblocked: next session can wire upload through the existing media/storage pipeline; no user decision is required before coding the first upload action. |
| Git hygiene | FS-0024 guard passed (`pwd` = `/Users/brianscott/dev/ronin-dojo-app`, remote = `Ronin-Dojo-Design/ronin-dojo-baseline`); branch `auto/session-0321`; worktree list showed this worktree only; pre-stage status contained 14 intended files and no secrets/env/node_modules; single commit planned, hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before commit; post-update `graphify stats`: 8928 nodes, 13675 edges, 1349 communities, 1532 files tracked. |
