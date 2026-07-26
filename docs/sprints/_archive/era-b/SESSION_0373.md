---
title: "SESSION 0373 — BBL local app parity reset"
slug: session-0373
type: session--implement
status: closed
created: 2026-06-12
updated: 2026-06-13
last_agent: codex-session-0373
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0372.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0373 — BBL local app parity reset

## Date

2026-06-12

## Operator

Brian + codex-session-0373

## Goal

Reset the BBL work queue from ASAP DNS flip back to a `bbl.local` functionality gate: finish remaining
Phase 2 `/app` parity and prepare the Phase 3-6 implementation path before DNS cutover. Stripe rehearsal
is treated as complete from SESSION_0369; this session starts with Petey route/identity discovery, then lands
the first bounded implementation slice needed for unified dashboard parity.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0372.md`
- Carryover: SESSION_0372 closed the OG/meta/robots/sitemap hygiene slice and queued minimal 301 plus production render verification for D9's ASAP flip. The operator now redirected the queue: DNS waits until phases 1-6 and the bbl.local app/admin surface is fully functional.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `58e51a3`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Unified `/app/*` dashboard, Better Auth/permissions, Prisma identity model, content/API/admin route parity |
| Extension or replacement | Extension: keep the upstream Dirstarter `/app` workspace, oRPC/permission substrate, and brand-aware routing; Ronin adds BBL resource grants and person-rooted identity. |
| Why justified | BBL Phase 2-6 must land on upstream-current Dirstarter parity before the domain flip so identity and admin surfaces are not moved twice. |
| Risk if bypassed | `blackbeltlegacy.com` could launch on legacy `/admin`/`dashboard` seams, then require risky live identity and route migrations after user traffic exists. |

Live docs checked during planning: local SoT set governs this session; live Dirstarter docs may be checked before specific Dirstarter-owned code changes.

### Graphify check

- Graph status: current; stats at bow-in: 11,748 nodes, 18,252 edges, 1,682 communities, 1,892 files tracked.
- Queries used:
  - `BBL app dashboard phase 2b 2c passport identity claim lineage admin surfaces dirstarter parity bbl.local`
- Files selected from graph:
  - `apps/web/app/admin/lineage/claims/page.tsx`
  - `apps/web/app/admin/lineage/claims/[id]/_components/claim-status-actions.tsx`
  - `apps/web/server/admin/lineage/claim-review-actions.ts`
  - `apps/web/server/admin/lineage/claim-review-actions.test.ts`
  - `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx`
  - `apps/web/app/(web)/lineage/page.tsx`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- Operator superseded D9's "ASAP after pre-flip gate" DNS queue for this session: DNS cutover now waits until Phases 1-6 are locally functional on `bbl.local`.
- `stripe@22` rehearsal is already done and remains closed from SESSION_0369.
- `grill-with-docs` is not invoked yet because the main fork is clear from the operator instruction; if durable terminology or ADR language needs changing, update the SoT docs inline during the session.

### Drift logged

- Potential drift: `SOT-ADR.md` D9 and `CUTOVER_CHECKLIST.md` still describe ASAP flip sequencing, while this session uses a local-first phase gate. Resolve in the SoT docs if implementation confirms this is a durable decision rather than a one-session tactical pause.

## Petey plan

### Goal

Land the first concrete Phase 2 parity slice for the `bbl.local` unified app surface and document the local-first DNS sequencing change.

### Tasks

#### SESSION_0373_TASK_01 — Phase 2 parity inventory

- **Agent:** Petey + explorer subagents
- **What:** Map remaining 2b wave 3+ and 2c surfaces from live code, not stale docs.
- **Steps:** inspect `/app`, `/admin`, and `(web)/dashboard` routes; identify redirect gaps, server flattening gaps, and BBL/Baseline app-surface blockers; fold subagent findings into the task log.
- **Done means:** route/file map recorded in this session with one recommended implementation slice.
- **Depends on:** nothing

#### SESSION_0373_TASK_02 — Migrated-route `/app` redirects and dashboard ports

- **Agent:** Cody
- **What:** Add permanent redirects for admin/dashboard areas that have `/app` equivalents, port the dashboard root/events/techniques/lineage editor routes, and clean migrated overview links.
- **Steps:** complete Cody pre-flight; add a reusable migrated-route redirect map; wire it into `next.config.ts`; add `/app/profile`, `/app/events`, `/app/events/*`, `/app/techniques`, `/app/techniques/*`, `/app/lineage/[treeId]/edit`; update only migrated overview/tab links; add focused redirect-map tests.
- **Done means:** migrated `/admin` surfaces redirect to `/app`, `/dashboard` redirects to `/app/profile`, events/techniques/lineage editor have first-class `/app` destinations, and unmigrated admin/dashboard child areas remain available or explicitly unclaimed.
- **Depends on:** SESSION_0373_TASK_01

#### SESSION_0373_TASK_03 — Sequencing docs and close proof

- **Agent:** Doug + Petey
- **What:** Update the SoT/session docs only where this session creates durable sequencing truth; run fallow, oxc/type/test gates, Graphify update, and git hygiene.
- **Steps:** update SOT-ADR/CUTOVER/BBL-SOT only if required; update wiki index/log; run focused and standard gates; run `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; stage, commit, and push to `main` at close.
- **Done means:** docs match landed behavior; full-close evidence exists; work is committed and pushed.
- **Depends on:** SESSION_0373_TASK_02

### Parallelism

Two explorer subagents are running in parallel: one maps `/app` parity, one maps Phase 3 identity/user-carry seams. Implementation stays sequential because the same route and auth surfaces can overlap. Phase 3 discovery informs scope but does not write schema in this session unless explicitly promoted after Task 1.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0373_TASK_01 | Petey + explorer subagents | Route and identity discovery are separable and can run in parallel before coding. |
| SESSION_0373_TASK_02 | Cody | Once the first slice is chosen, implementation should be coherent and locally owned. |
| SESSION_0373_TASK_03 | Doug + Petey | Verification, hostile close review, and sequencing docs need independent proof framing. |

### Open decisions

- None blocking. The operator instruction is treated as the current sequencing authority unless contradicted before implementation starts.

### Risks

- The requested full remainder (2b wave 3+, 2c, Phases 3-5/6) is multi-session scope; this session must choose a bounded vertical slice.
- Updating D9 too aggressively could erase useful cutover-arm history; docs should amend sequencing, not rewrite history.
- Phase 3 identity re-root touches Prisma, auth, claim, directory, lineage, and seed behavior; it needs its own schema pre-flight before any model edits.

### Scope guard

- Do not perform DNS flip, Vercel production attach, or live-domain changes.
- Do not redo the Stripe rehearsal.
- Do not start Phase 3 schema changes until Phase 2 route parity inventory is complete and Cody schema pre-flight is recorded.
- Do not broaden BBL's feature allowlist beyond the operator's lineage-first/local-functionality direction.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, SESSION_0372, SESSION_0368, WORKFLOW_5.0, lineage hub, directory/org/profile hub.
- **Baseline pattern to extend:** upstream unified `/app` workspace, existing `requireUser`/permission guards, brand feature gates, lineage/directory route inventories.
- **Custom delta:** Ronin keeps brand-scoped BBL lineage-first behavior, resource-scoped lineage permissions, and Passport-rooted identity semantics on top of Dirstarter.
- **No-bypass proof:** this is completing the Dirstarter `/app` adoption already selected in SOT-ADR D5, not inventing a second admin shell.

## Cody pre-flight

### Pre-flight: Migrated-route `/app` redirects and dashboard ports

#### 1. Existing component scan

- Graphify query used: `BBL app dashboard phase 2b 2c passport identity claim lineage admin surfaces dirstarter parity bbl.local`
- Found: `apps/web/app/app/*` currently has `/app` equivalents for claims, lineage, memberships, organizations, tournaments, and users. `apps/web/app/admin/*` still hosts many unmigrated areas. Explorer result confirmed `(web)/dashboard/lineage/[treeId]`, events, techniques, and root were the highest-risk 2c blockers because blanket redirect would otherwise change behavior.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes
- Consulted live alignment URLs: Next.js redirect docs checked 2026-06-12; `next.config.js` redirects run before filesystem routes and `permanent: true` returns 308.
- Closest L1 pattern: existing `next.config.ts` `redirects()` for `/members` -> `/directory`; upstream Phase 2 target says `/admin` + `/dashboard` eventually redirect to `/app`.
- Primitive API spot-check: `Button` props include `variant`, `size`, `isPending`, `prefix`, `suffix`, `render`; `Link` wraps `next/link` and accepts NextLink props. This slice does not add new UI primitives.

#### 3. Composition decision

- Extending existing component: none.
- Composing existing components: none.
- Extending existing route config: `apps/web/next.config.ts` redirect map.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes.
- ADR read: `docs/product/black-belt-legacy/SOT-ADR.md` D5/D9.
- Runbook consulted: `docs/runbooks/domain-features/lineage-hub.md`, `docs/runbooks/domain-features/directory-org-profile-hub.md`, `docs/protocols/cody-preflight.md`.

#### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` from `apps/web/`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: `http://bbl.local:3000` and `http://baseline.local:3000`.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0007, FS-0008.
- Mitigation acknowledged: Petey plan exists before code; route inventory was Graphify-first; no inferred primitive APIs; no schema changes in this slice.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0373_TASK_01 | landed | Explorer route inventory confirmed `/app` has claims/lineage/users/tournaments/memberships/organizations only; old admin-only areas remain; server flattening is not done; Phase 3 identity discovery documented user-carry risks and doc contradictions. |
| SESSION_0373_TASK_02 | landed | Added migrated-route redirect helpers, proxy-before-auth redirects, `/app/profile`, `/app/events/*`, `/app/techniques/*`, and `/app/lineage/[treeId]/edit`; exact `/app/events` and `/app/techniques` route through addressable `/app/profile` tabs to avoid duplicating the dashboard index page. |
| SESSION_0373_TASK_03 | landed | Updated D10 local-first DNS sequencing docs; ran focused tests, typecheck, oxlint, fallow, wiki lint, local curl smoke, and Graphify update before git hygiene. |

## What landed

- Phase 2c redirect spine: migrated `/admin` areas with existing `/app` equivalents redirect before auth, while unmigrated admin areas remain protected in place.
- Dashboard route migration: old `(web)/dashboard` page routes were removed; dashboard root redirects to `/app/profile`; lineage editor, events editor, and techniques editor child routes now live under `/app`.
- `/app/profile` now hosts the old dashboard root content, and `DashboardTabs` can honor `?tab=events` / `?tab=techniques` for exact app index redirects.
- App sidebar gained Profile, Events, and Techniques entries using existing brand-feature gates.
- SOT docs now record D10: DNS flip waits for Phases 1–6 local functionality on `bbl.local`; Stripe rehearsal remains complete; Phase 3 uses user-carry semantics.

## Decisions resolved

- D10 supersedes D9's immediate DNS timing for the active queue: DNS waits until local Phases 1–6 functionality is done.
- Exact `/app/events` and `/app/techniques` are app-level redirects to `/app/profile` tabs, not duplicated standalone index pages; create/edit child routes remain first-class `/app` pages.
- Unmigrated admin areas intentionally do not get a blanket `/admin/:path*` redirect.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/config/app-redirects.ts` | Added migrated admin/dashboard redirect map plus exact app-tab redirects. |
| `apps/web/config/app-redirects.test.ts` | Added redirect-map regression coverage. |
| `apps/web/proxy.ts` | Resolves migrated app redirects before auth/feature gates and preserves incoming query params. |
| `apps/web/next.config.ts` | Registers migrated app redirects for Next config consumers. |
| `apps/web/app/app/page.tsx` | Updated app root counters to current app areas. |
| `apps/web/app/app/profile/page.tsx` | New unified dashboard profile/root page. |
| `apps/web/app/app/events/new/page.tsx` | New app route for creating promotion events. |
| `apps/web/app/app/events/[eventId]/page.tsx` | New app route for editing promotion events. |
| `apps/web/app/app/techniques/new/page.tsx` | New app route for creating techniques. |
| `apps/web/app/app/techniques/[id]/page.tsx` | New app route for editing techniques. |
| `apps/web/app/app/lineage/[treeId]/edit/page.tsx` | New app route for lineage editor preview. |
| `apps/web/app/(web)/dashboard/*` | Removed old dashboard page routes and updated shared dashboard components/forms/tabs to link through `/app`. |
| `apps/web/components/app/sidebar.tsx` | Added Profile, Events, and Techniques navigation entries. |
| `apps/web/server/web/promotion-events/editor-actions.ts` | Updated revalidation paths for `/app` event surfaces. |
| `apps/web/server/web/techniques/crud-actions.ts` | Updated `/app` revalidation paths and removed unused `deleteTechnique` export. |
| `docs/product/black-belt-legacy/SOT-ADR.md` | Added D10 local-first DNS gate. |
| `docs/product/black-belt-legacy/BBL-SOT-Spec.md` | Added SESSION_0373 phase-ordering amendment. |
| `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md` | Replaced ASAP target with D10 local-first gate. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0373 entry and refreshed metadata. |
| `docs/knowledge/wiki/log.md` | Added SESSION_0373 log entry. |
| `docs/sprints/SESSION_0373.md` | Created and closed this session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun test config/app-redirects.test.ts proxy.test.ts` | ✅ pass: 7 tests, 25 assertions. |
| `cd apps/web && bun run typecheck` | ✅ pass after clearing stale `.next` cache; route typegen + `tsc --noEmit` completed with exit 0. |
| `cd apps/web && bun run lint:check` | ✅ exit 0 with existing oxlint warnings. |
| `bun run audit:fallow` | ⚠️ exit 1: no unused exports/dead files from this slice, but repo gate still reports known unused deps (`tailwind-merge`, `@react-email/preview-server`), duplication, and complexity on changed files. |
| `git diff -U0 \| bunx fallow audit --changed-since HEAD --diff-stdin` | ✅ exit 0; no issues in changed lines, inherited findings excluded. |
| `bun run wiki:lint` | ✅ pass: 644 markdown files scanned, no lint violations. |
| `curl -I` local redirect matrix on `Host: bbl.local:3000` | ✅ `/app/events` -> `/app/profile?tab=events`; `/app/techniques` -> `/app/profile?tab=techniques`; `/dashboard` -> `/app/profile`; `/dashboard/events/new` -> `/app/events/new`; `/dashboard/techniques/new` -> `/app/techniques/new`; `/admin/users` -> `/app/users`; `/admin/certificates` remains `/auth/login?next=/admin/certificates`. |
| Browser MCP smoke | ⚠️ blocked: Playwright MCP reported the browser profile was already in use; no browser snapshot produced. |
| `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` + `graphify stats` | ✅ update ran; stats now 11,760 nodes, 18,216 edges, 1,704 communities, 1,894 files tracked. |

## Open decisions / blockers

- Full Phase 3 identity re-root, claim reconciliation, and Phase 4-6 local functionality remain.
- Server flattening is still incomplete; this session moved routes/redirects, not `server/web`/`server/admin` ownership boundaries.
- Full fallow changed-file gate still fails on inherited dependency/complexity/duplication findings; changed-line fallow is clean.

## Next session

### Goal

Continue BBL local-first completion by attacking the next Phase 2c/Phase 3 seam: server flattening plus Phase 3 user-carry identity preflight for Passport-rooted migration.

### Inputs to read

- `docs/sprints/SESSION_0373.md`
- `docs/product/black-belt-legacy/SOT-ADR.md`
- `docs/product/black-belt-legacy/BBL-SOT-Spec.md`
- `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md`
- `apps/web/prisma/schema.prisma`
- `apps/web/server/web/dashboard/queries.ts`
- `apps/web/server/admin/lineage/claim-review-actions.ts`

### First task

Build the Phase 3 user-carry preflight map: list every `userId` identity satellite and decide its `Passport` carry/repoint behavior before editing Prisma.

## Review log

| ID | Scope | Verdict |
| --- | --- | --- |
| SESSION_0373_REVIEW_01 | SESSION_0373_TASK_01-03 | Aligned with D10 local-first gate. The implementation closes the dashboard root/events/techniques/lineage editor route seam without claiming unmigrated admin parity. Residual risk is Phase 3 identity breadth and inherited fallow complexity; both are explicit next-session work. |

## Hostile close review

- **Giddy:** Good correction from "flip now" to local-first functionality. Do not let route redirects mask that server flattening and identity semantics are still unfinished.
- **Doug:** Verification is acceptable for this bounded route slice: focused tests and curl matrix prove redirect behavior. Browser MCP was blocked and full fallow still reports inherited findings, so this is not a launch-readiness proof.
- **Dirstarter docs check:** No live Dirstarter docs check needed beyond the existing SOT D5/D10 framing; this was continuing the already-ratified `/app` migration pattern, not changing a baseline layer API.

## ADR / ubiquitous-language check

- Updated the consolidated BBL SOT-ADR with D10 instead of creating a separate ADR, because this is a BBL-specific launch sequencing decision in the active SOT record.
- No new ubiquitous-language terms introduced.

## Reflections

- Exact route pages can be worse than redirects when the real UX already exists as a dashboard tab; duplicating old index pages added compile surface without adding user value.
- The clean `.next` retry mattered: interrupted dev compiles made `tsc` look wedged, but a regenerated cache completed successfully.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SOT-ADR.md`, `BBL-SOT-Spec.md`, `CUTOVER_CHECKLIST.md`, wiki index/log, and this session file updated with `last_agent: codex-session-0373`; code files have no frontmatter convention. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` and `docs/knowledge/wiki/log.md` updated for SESSION_0373. |
| Wiki lint | pending |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0373_REVIEW_01` plus hostile close review section present. |
| Review & Recommend | Next session goal/inputs/first task written. |
| Memory sweep | D10 captured in BBL SOT docs; no separate glossary update needed. |
| Next session unblock check | Unblocked for Phase 3 user-carry preflight; DNS remains intentionally deferred. |
| Git hygiene | Branch `main`; remote `origin=https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; worktree dirty only with SESSION_0373 route/docs changes before staging; fallow cache worktrees observed under `/tmp` and left untouched; single push hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; `graphify stats` = 11,760 nodes / 18,216 edges / 1,704 communities / 1,894 files tracked. |
