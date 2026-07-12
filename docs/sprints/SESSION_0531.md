---
title: "SESSION 0531 — Posts AdminCollection conformance"
slug: session-0531
type: session--open
status: in-progress
created: 2026-07-12
updated: 2026-07-12
last_agent: codex-session-0531
sprint: S53
pairs_with:
  - docs/sprints/SESSION_0529.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0531 — Posts AdminCollection conformance

## Date

2026-07-12

## Operator

Brian + codex-session-0531 (Petey orchestrating)

## Goal

Conform the staff Posts surface at `/app/blog` to the ratified three-file `AdminCollection` pattern:
one permission-gated collection with a useful Drafts-first queue, appropriate editorial columns, and
row navigation to the existing `/app/blog/[id]` editor. Build and verify locally, then hold at the
explicit push gate. FI-001 / Brian Truelson stays parked.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest closed session read: `docs/sprints/SESSION_0529.md`; its next-session candidate FI-027 is
  already claimed by the live `session-0530-fi027` worktree.
- Carryover: SESSION 0529 ratified the AdminCollection sibling-route wording and queued Techniques.
  SESSION 0531 continues the same law on the next unclaimed content surface.
- Recent Next-session blocks read: SESSION 0525–0529. `POST_LAUNCH_SOT.md`, WL-P2-34, ADR 0045,
  ADR 0046, and the named AdminCollection memory were verified against the live tree.

### Branch and worktree

- Freshness guard: `git fetch origin` completed first; `HEAD == origin/main == 59a9d47c` at bow-in.
- Session number guard: docs high = 0529; branch/worktree high = 0530; next free = 0531.
- Branch: `session-0531-admincollection`, created directly from fetched `origin/main`.
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`.
- Status at bow-in: clean before this SESSION file was added.
- Concurrency guard: `/Users/brianscott/dev/ronin-0530` owns FI-027 Techniques; this lane will not
  touch its `app/app/techniques/*`, `server/admin/techniques/*`, or `config/admin-sections*` files.

### Surface selection

- **Selected:** Posts at `/app/blog`.
- **Why now:** Posts are a live BBL content surface and have the canonical staff editor
  `/app/blog/[id]`, but the index still hand-assembles the TanStack table instead of composing
  `AdminCollection`.
- **Alternatives rejected by source verification:** `/app/media` and `/app/organizations` conformed in
  SESSION 0515; Schools use the Organization model and have no separate staff `[id]` editor; Podcasts
  remain profile `MediaAttachment.purpose` content with no canonical staff `[id]` editor; FI-027
  Techniques is claimed by SESSION 0530.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content management + database-backed Blog admin tables |
| Extension or replacement | Extension — compose the existing `AdminCollection` wrapper over Dirstarter's data-table kit; retain the existing Post model/editor/actions |
| Why justified | ADR 0045 requires one collection frame, and the live Dirstarter docs describe the database-backed Posts admin workflow and sortable/filterable tables |
| Risk if bypassed | The hand-assembled Posts wrapper remains a drift fork and misses shared pager/input hardening |

Live docs checked 2026-07-12: `https://dirstarter.com/docs/content` and
`https://dirstarter.com/docs/blog`.

### Graphify check

- Graph status: refreshed at bow-in; 17,052 nodes, 33,232 edges, 2,306 communities, 2,604 files.
- Queries used:
  - `AdminCollection content media editor index surface list-query`
  - `podcast posts organizations schools app id editor admin collection`
  - `AdminCollection blog posts staff editor list query`
- Files selected from graph and verified directly:
  - `apps/web/app/app/blog/{page.tsx,_components/posts-table.tsx,_components/posts-table-columns.tsx}`
  - `apps/web/server/admin/posts/{queries.ts,schema.ts,queries.test.ts}`
  - `apps/web/components/admin/admin-collection.tsx`
  - `apps/web/server/admin/list-query.ts`
  - `apps/web/e2e/admin/admin-collection-conformance.spec.ts`
- Verification note: Graphify was navigation only; the current files and the SESSION 0530 commit were
  read directly before selection.

## Petey plan

### Goal

Ship one reviewable Posts AdminCollection conformance slice with no behavior regression, then stop at
the explicit push gate.

### Tasks

#### SESSION_0531_TASK_01 — Build the Posts AdminCollection

- **Agent:** Cody.
- **What:** Replace the hand-assembled `/app/blog` list wrapper with `AdminCollection`, preserving the
  existing Post editor/actions while adding a Drafts-first editorial view.
- **Steps:**
  1. Keep `/app/blog/[id]` as the one editor and retain the existing `posts.manage` layout guard.
  2. Compose `AdminCollection` in `posts-table.tsx`; keep New Post, bulk actions, date range, and view
     options.
  3. Add Title, Author, Status, Published, and Updated columns; Title links to `/app/blog/[id]`.
  4. Default the existing faceted Status filter to `Draft`, so the shared toolbar opens with a visible
     Draft filter chip while preserving its multi-status choices.
  5. Route the query through `clampListPageParams` + `runAdminListTransaction`, thread only allowlisted
     sort keys, preserve BBL brand scope, and return the shared `{rows,total,pageCount}` shape.
  6. Update the focused query test and the affected AdminCollection Playwright smoke.
- **Done means:** `/app/blog` renders the shared AdminCollection, opens Drafts by default, sorts and
  filters server-side, and links rows to the existing editor; focused tests and build gates pass.
- **Depends on:** nothing.

#### SESSION_0531_TASK_02 — Parallel review wave

- **Agent:** Giddy + Doug + Desi in parallel on the same Cody commit.
- **What:** Review architecture/conformance, runtime/security/release behavior, and UI consistency.
- **Steps:** inspect the same commit, return P-classified findings with file:line evidence, and identify
  only fix-now items within this lane.
- **Done means:** all three reviewers return structured verdicts; Petey batches any fix-now findings.
- **Depends on:** SESSION_0531_TASK_01.

#### SESSION_0531_TASK_03 — Batched fixes + delta verify + close

- **Agent:** Cody resume → Doug delta verify → Petey bow-out.
- **What:** Apply one batched fix package, if needed, then independently verify only the delta plus final
  full gates and close the session without pushing.
- **Steps:** one Cody resume, one fix commit, Doug re-check, final build/test/e2e/format evidence, ledger
  cross-off sweep, commit the close, show the result, and hold.
- **Done means:** final branch is committed and push-safe; no push/merge/deploy has occurred.
- **Depends on:** SESSION_0531_TASK_02.

### Parallelism

TASK_01 is one coherent build. TASK_02 fans Giddy, Doug, and Desi out in parallel on the same immutable
commit. TASK_03 is a single Cody resume followed by Doug delta verification. No reviewer edits production
code; no concurrent agent touches overlapping files.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0531_TASK_01 | Cody | Clear conformance build against ratified patterns |
| SESSION_0531_TASK_02 | Giddy + Doug + Desi | Required §5b architecture, release, and UI lenses on one commit |
| SESSION_0531_TASK_03 | Cody → Doug → Petey | One batched fix pass, independent delta proof, then governed close |

### Open decisions

None. The operator supplied the selection rule and pattern; Petey selected Posts from verified current
state and stated the choice before implementation.

### Risks

- The existing mocked Post query test must remain isolated; use the canonical Bun test commands from
  `sop-test-writing.md` (FS-0027).
- Final format evidence must be rerun after every late edit and attached to the final commit SHA
  (FS-0028).
- The SESSION 0530 Techniques lane is live in a sibling worktree; avoid all overlapping files.

### Scope guard

- No schema or migration; never run `migrate-dev`.
- No Podcast/member authoring, media payload, or premium/no-leak gate changes.
- No edits in `../ronin-dojo-monorepo` (read-only reference, not needed for this conformance slice).
- No FI-001 email/send/grant action.
- No push, merge, deploy, or PR action without the operator's explicit per-action authorization.

### Dirstarter implementation template

- **Docs read first:** live Content + Blog docs on 2026-07-12; ADR 0045; current list-query helper.
- **Baseline pattern to extend:** `/app/tools` data-table behavior, the shared `AdminCollection` frame,
  SESSION 0515 Organizations conformance, and SESSION 0530 Techniques three-file implementation.
- **Custom delta:** BBL brand scope plus a Posts-specific Drafts editorial queue.
- **No-bypass proof:** the change removes one wrapper fork and composes the existing L1 table kit; no
  new list frame, editor, action system, or authz system is introduced.

## Cody pre-flight

### Pre-flight: Posts AdminCollection

#### 1. Existing component scan

- Graphify query used: `AdminCollection blog posts staff editor list query`.
- Found: `AdminCollection`, existing Posts page/table/columns/editor/actions/query/schema/test, `/app/tools`
  reference behavior, SESSION 0515 Organizations conformance, SESSION 0530 Techniques conformance, and
  the shared AdminCollection e2e smoke.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes, via the ADR/memory's canonical
  `components/data-table/*` pointer and direct primitive reads.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes.
- Consulted live alignment URLs: yes — Content and Blog.
- Closest L1 pattern: `/app/tools`; closest conformed implementations: `/app/organizations` and
  `session-0530-fi027:/app/techniques`.
- Primitive API spot-check:
  - `AdminCollection`: `title`, `total`, `callToAction`, `data`, `columns`, `pageCount`, `filterFields`,
    `sorting`, `pageSize`, `initialState`, `getRowId`, `children(table)`, `emptyState`.
  - `Button`: variants `fancy|primary|secondary|soft|ghost|destructive`; sizes
    `xs|sm|md|lg|icon`; `prefix`, `suffix`, `render`.
  - `Link`: Next Link props with hover-prefetch behavior.
  - `DateRangePicker`: `align`, `defaultDateRange`, `placeholder`, trigger variant/size, `shallow`.
  - `DataTableViewOptions`: `table`.

#### 3. Composition decision

- Extending existing component: `PostsTable` and its existing column/query contracts.
- Composing existing components: `AdminCollection`, `Button`, `Link`,
  `DateRangePicker`, `DataTableViewOptions`; no new generic UI primitive.

#### 4. Lane docs loaded

- Prior SESSION Next-session sections read: yes, SESSION 0525–0529.
- ADRs read: ADR 0045 and ADR 0046.
- Memories read: `admin-collection-one-surface-law`, `epic-lane-recipe-quality-is-protocol`,
  `explicit-push-authorization`, `technique-authoring-ownership-adr-0046`.
- Runbooks consulted: opening ritual, Graphify repo memory, test-writing SOP, agent-systems-map §1/§4/§5b.

#### 5. Backend and dev environment confirmed

- Authorization: existing `/app/blog/layout.tsx` calls
  `requirePermission(APP_AREA_PERMISSIONS.posts)` (`posts.manage`) for index/new/detail.
- Query: preserve `Brand.BBL`; use `clampListPageParams` + `runAdminListTransaction`; allowlist sortable
  Post scalars; select only row fields plus author display name.
- Dev server command: `npx next dev --turbo` from `apps/web/`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app/apps/web` for app gates.
- Brand/host for testing: `bbl.local:3000` / local Playwright web server.
- Gates: focused Post query test; affected AdminCollection e2e; apps/web typecheck, lint, format, full
  test, and production build; root `format:check` because SESSION 0531 is a newly added file.

#### 6. FAILED_STEPS check

- Prior failures: FS-0027 (multi-file Bun tests without `--parallel=1`); FS-0028 (late-added files not
  covered by final repo-wide format gate); D-042 (kanban is not an AdminCollection candidate).
- Mitigation acknowledged: use focused single-file tests or `bun run test`; rerun final root format after
  all edits; this slice is a true record collection and does not touch `/app/leads-pipeline`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0531_TASK_01 | pending | Posts AdminCollection build |
| SESSION_0531_TASK_02 | pending | Parallel Giddy + Doug + Desi review wave |
| SESSION_0531_TASK_03 | pending | Batched fixes, delta verify, and bow-out |

## What landed

Pending implementation.

## Decisions resolved

- Posts is the next eligible content AdminCollection surface; Podcasts/media and Organizations/Schools
  fail the current-state eligibility test described in Surface selection.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0531.md` | Bow-in, plan, pre-flight, task audit, and eventual close evidence |

## Verification

| Command / smoke | Result |
| --- | --- |
| Bow-in freshness + source verification | PASS — fetched origin; HEAD matches origin/main; selection verified directly |

## Open decisions / blockers

None at plan lock.

## Next session

### Goal

Pending bow-out Review & Recommend.

### First task

Pending bow-out Review & Recommend.

## Review log

Pending the parallel review wave.

## Hostile close review

Pending bow-out.

## ADR / ubiquitous-language check

- ADR update not expected; ADR 0045 already governs the change.
- Ubiquitous-language update not expected; no new domain term is introduced.

## Reflections

Pending bow-out.

## Full close evidence

Pending bow-out.
