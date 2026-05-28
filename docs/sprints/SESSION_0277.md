---
title: "SESSION 0277 — admin email ops and selected-rank controls"
slug: session-0277
type: session--implement
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: codex-session-0277
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0276.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0277 — admin email ops and selected-rank controls

## Date

2026-05-28

## Operator

Brian + codex-session-0277 (Petey orchestrating; Cody/Doug support)

## Goal

Clarify and improve admin-operable email handling while advancing the SESSION_0276 selected-rank admin handoff where feasible.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin dashboard, Resend/email configuration docs, lineage admin server actions, existing common UI primitives. |
| Extension or replacement | Extension of existing admin and lineage management surfaces; documentation/runbook for existing email setup. |
| Why justified | SESSION_0276 left selected-rank admin UI pending, and the operator asked where emails can be read/responded to from admin. |
| Risk if bypassed | Operators may rely on ad hoc inbox knowledge, claim/admin actions remain seed-only, and email replies can happen outside the app with no documented path. |

## Petey plan

### Goal

Ship a small admin-ops increment: document current email flow/where to read/respond, add an SOP runbook, and implement selected-rank admin control if the existing lineage admin path supports it cleanly.

### Tasks

#### SESSION_0277_TASK_01 — Bow-in and graphify discovery

- **Agent:** Petey
- **What:** Run opening ritual, rebuild/use Graphify if needed, identify current email and selected-rank admin files.
- **Done means:** Session file records graph commands, selected files, branch status, and task ownership.
- **Depends on:** nothing

#### SESSION_0277_TASK_02 — Email operations runbook and admin inbox plan

- **Agent:** Brandon/Doug explorer, Cody for edits
- **What:** Discover existing email setup/docs and create or update `docs/runbooks/sop-email-runbook.md` with where emails are sent, where to read them, reply options, ASCII wireframes, and Mermaid data flows.
- **Done means:** Runbook exists and is linked from wiki/index/log with explicit current-vs-future admin inbox notes.
- **Depends on:** TASK_01

#### SESSION_0277_TASK_03 — Selected-rank admin UI/control

- **Agent:** Cody
- **What:** Add the smallest coherent admin UI path for changing `LineageTreeMember.rankAwardId` using existing lineage admin patterns.
- **Done means:** Admin can select/clear a member selected rank award where data allows; typecheck/formatting pass or blockers are documented.
- **Depends on:** TASK_01

### Parallelism

TASK_02 discovery and TASK_03 discovery can run in parallel because they touch different docs/admin areas. Implementation edits are coordinated by Petey to avoid overlap.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey | Orchestration, protocol, graph, git state. |
| TASK_02 | Brandon/Doug + Cody | Email runbook needs operator-friendly SOP plus QA data-flow clarity. |
| TASK_03 | Cody | Clear implementation against existing admin/action patterns. |

### Open decisions

- Whether a true in-app email inbox/reply feature should be implemented now or recorded as future work depends on whether inbound email/webhook storage already exists.
- Authenticated Bob Bass claim smoke may remain blocked without an authenticated browser/app/database in this environment.

### Risks

- Target path `/Users/brianscott/dev/ronin-dojo-app` is unavailable in this container; current checkout is `/workspace/ronin-dojo-baseline` on branch `work` with no remote.
- Graphify was initially empty/uninstalled; it was installed and rebuilt locally for this session.
- Admin email reply may require provider/domain/inbound webhook capabilities not present in code today.

### Scope guard

Do not create a broad support-ticket product. If inbound email storage does not exist, document current external inbox/Resend workflow and add a narrow future admin inbox plan instead of inventing schema/API scope.

### Dirstarter implementation template

- **Docs read first:** Local workflow/program/session docs. Live Dirstarter docs not required unless replacing Dirstarter email/auth/admin patterns; current plan extends existing repo patterns.
- **Baseline pattern to extend:** Existing admin lineage pages/actions; existing Resend/email docs and templates; common UI primitives.
- **Custom delta:** Ronin-specific selected rank controls and email SOP/admin inbox notes.
- **No-bypass proof:** No alternate auth, email provider, or admin framework should be introduced.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0277_TASK_01 | Petey | complete | Graphify installed/rebuilt after initial zero-node stats; update ran at close. |
| SESSION_0277_TASK_02 | Brandon/Doug/Cody | complete | Email discovery completed; SOP runbook and `/admin/email` ops page added. |
| SESSION_0277_TASK_03 | Cody | complete | Admin selected-rank action, query payload, and dropdown control added. |

## Graphify discovery

- `graphify stats` initially returned 0 nodes / 0 files tracked after installation.
- `graphify run .` rebuilt the graph: 7,215 nodes, 14,899 edges, 1,405 files tracked.
- `graphify query "email admin dashboard selected rank LineageTreeMember claim Bob Bass" --budget 2000` selected admin lineage, claim review, and admin page clusters for initial inspection.

## Branch and worktree status

- Current checkout: `/workspace/ronin-dojo-baseline` (requested `/Users/brianscott/dev/ronin-dojo-app` is not mounted in this environment).
- Branch at bow-in: `work`.
- Remote at bow-in: none configured.
- Working tree at bow-in: clean before SESSION_0277 file creation.

## What landed

- **Admin email operations surface:** Added `/admin/email` so admins can see the current Resend sender state, open Resend Emails, open the reply mailbox, and understand where email activity lives today.
- **Email SOP runbook:** Added `docs/runbooks/sop-email-runbook.md` with current read/respond instructions, ASCII wireframes, Mermaid data flows, and future in-app inbox notes.
- **Admin navigation:** Linked Email Ops from the admin sidebar and command palette.
- **Lineage selected-rank admin control:** Added a member-level selected display-rank dropdown on `/admin/lineage/[treeId]` backed by a safe action that validates rank ownership, writes `LineageTreeMember.rankAwardId`, audits the change, and revalidates lineage paths/tags.
- **Graphify availability restored:** Installed Graphify, rebuilt an empty graph, used targeted graph queries for discovery, and ran `graphify update .` at close.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/admin/email/page.tsx` | New admin Email Ops page documenting current Resend/read/reply surfaces. |
| `apps/web/components/admin/sidebar.tsx` | Added Email Ops admin navigation entry. |
| `apps/web/components/admin/command-palette.tsx` | Added Email Ops command palette entry. |
| `apps/web/app/admin/lineage/[treeId]/page.tsx` | Added Selected rank column/control to the lineage member table. |
| `apps/web/app/admin/lineage/_components/lineage-selected-rank-select.tsx` | New client dropdown component for selecting/clearing a member display rank. |
| `apps/web/server/admin/lineage/actions.ts` | Added selected-rank safe action with admin/tree-admin authorization, rank ownership guard, audit log, and revalidation. |
| `apps/web/server/admin/lineage/queries.ts` | Extended admin lineage detail payload with `rankAwardId`, current selected rank, and candidate rank awards. |
| `apps/web/server/admin/lineage/schema.ts` | Added selected-rank action schema/type. |
| `docs/runbooks/sop-email-runbook.md` | New email operations SOP with current and future data flows. |
| `docs/knowledge/wiki/index.md` | Linked SESSION_0277 and SOP Email Operations Runbook; bumped last_agent. |
| `docs/knowledge/wiki/log.md` | Appended SESSION_0277 wiki maintenance entry and bumped frontmatter. |
| `docs/sprints/SESSION_0277.md` | Created and closed session record. |

## Decisions resolved

- Treat `/admin/email` as an **operations/readiness surface**, not a full in-app mailbox, because inbound email storage/threading does not exist yet.
- Selected-rank admin control is explicitly a **selected display rank** switch for `LineageTreeMember.rankAwardId`; it does not imply a promotion-relationship edit or visual-group sync.
- Use existing admin lineage authorization (`admin` or active `TREE_ADMIN` grant) and validate candidate rank awards against the member user before updating `rankAwardId`.

## Open decisions / blockers

- **Authenticated Bob Bass claim smoke remains pending:** This environment still lacks an authenticated browser session and live app/database for `/lineage/rigan-machado-bjj-lineage/claim`.
- **True in-app email inbox remains future scope:** Requires a persisted inbound email/message/thread model, webhook/mailbox integration, retention policy, and reply action design.
- **Push to `main` likely blocked:** Current checkout is branch `work` with no configured git remote; commit can be local, but push cannot succeed unless a remote is added outside this container.
- **Production screenshot not captured:** No runnable authenticated admin browser/database was available for visual verification.

## Verification

| Command / check | Result |
| --- | --- |
| `graphify stats` | Passed after install/rebuild; close stats: 7,244 nodes, 14,871 edges, 1,408 files tracked. |
| `graphify query "email admin dashboard selected rank LineageTreeMember claim Bob Bass" --budget 2000` | Passed; selected admin lineage/claim/admin clusters for inspection. |
| `graphify query "Resend email templates transactional DSR magic link contact admin inbox reply" --budget 4000` | Passed; selected Resend/email docs and implementation files. |
| `graphify update .` | Passed at close; graph report updated. |
| `bun node_modules/@biomejs/biome/bin/biome check --write ...` | Passed from `apps/web`; fixed 4 files. |
| `DATABASE_URL=postgresql://user:pass@localhost:5432/db pnpm --filter @ronin-dojo/web db:generate` | Passed; Prisma client generated. |
| `pnpm --filter @ronin-dojo/web typecheck` | Passed; Node warning because package wants Node 22.x and container has Node v20.20.2. |
| `pnpm --filter @ronin-dojo/web build` | Failed at prebuild because `DATABASE_URL` is missing for `prisma migrate deploy`. |
| `bun run scripts/wiki-lint.ts` | Failed on pre-existing repository-wide broken links/warnings; not caused by SESSION_0277 changes. |
| `git diff --check` | Passed. |

## Review log

### SESSION_0277_REVIEW_01 — close review

- **Reviewed tasks:** SESSION_0277_TASK_01 through TASK_03.
- **Dirstarter docs check:** No Dirstarter baseline email/auth framework was replaced. The session reused Resend, React Email, existing admin shell/navigation, common UI primitives, and admin lineage safe-action patterns.
- **Verdict:** Work is coherent and scoped. The admin email page gives the operator a practical answer today while the SOP prevents scope creep into a support-ticket product. Selected-rank update is guarded by tree management authorization, rank ownership validation, audit logging, and lineage cache revalidation.

## Hostile close review

### SESSION_0277 — Giddy + Doug review

- **Plan sanity:** The session followed the user-requested Petey orchestration and used two explorers for parallel discovery.
- **Architecture:** No schema/API expansion was introduced for email inbox scope; future inbox is documented as a decision point. Selected-rank action updates only `LineageTreeMember.rankAwardId`, matching the narrow admin display-rank requirement.
- **Security/data integrity:** The selected-rank action uses existing lineage tree admin authorization and rejects rank awards not owned by the target member user. Email page does not expose the Resend API key.
- **QA honesty:** Typecheck passed. Build is blocked by missing `DATABASE_URL`; wiki lint fails on existing repo-wide doc debt. No authenticated browser smoke or screenshot was possible.
- **Score:** 9.6/10 for this session scope; remaining debt is environment/manual smoke and future inbox architecture, not hidden implementation debt.

## ADR / ubiquitous-language check

- **ADR:** Not needed. This session did not choose a new email provider, mailbox architecture, schema model, or promotion-sync policy.
- **Ubiquitous language:** No new domain terms introduced. Existing `LineageTreeMember`, `RankAward`, admin, and Resend/email terminology retained.

## Next session

- **Goal:** SESSION_0278 — authenticated lineage claim smoke and optional admin selected-rank browser QA.
- **Inputs to read:** `docs/sprints/SESSION_0277.md`, `docs/runbooks/sop-email-runbook.md`, `apps/web/app/admin/email/page.tsx`, `apps/web/app/admin/lineage/[treeId]/page.tsx`, `apps/web/app/admin/lineage/_components/lineage-selected-rank-select.tsx`, `apps/web/server/admin/lineage/actions.ts`, `apps/web/app/(web)/lineage/[treeSlug]/claim/page.tsx`, `apps/web/app/(web)/lineage/[treeSlug]/claim/claim-form.tsx`, `apps/web/server/web/lineage/claim-actions.ts`.
- **First task:** With a real authenticated app/database session, submit Bob Bass claim smoke on `/lineage/rigan-machado-bjj-lineage/claim`; then verify `/admin/lineage/[treeId]` selected-rank dropdown and `/admin/email` page in browser.

## Status

closed
