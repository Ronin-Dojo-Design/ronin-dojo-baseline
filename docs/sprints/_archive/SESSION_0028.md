---
title: "SESSION 0028 — Calendar re-sequence + Program CRUD"
slug: session-0028
type: session
status: closed-full
created: 2026-04-29
updated: 2026-04-29
last_agent: codex-session-0028
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0027.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0028 — Calendar re-sequence + Program CRUD

## Date

2026-04-29

## Operator

Brian Scott + Codex

## Status

closed-full

## Goal

Re-sequence WORKFLOW_5.0 to match actual sessions, then start the School Operations lane with Program CRUD.

## Bow-in audit

- Opening ritual read: `docs/rituals/opening.md`
- Previous session read: `docs/sprints/SESSION_0027.md` (closed-full, score 9.5/10)
- Previous goal achieved: yes — governance audit landed, FS-0006 and FS-0007 mitigated
- Carryover blockers:
  - `WORKFLOW_5.0` session calendar is stale and must be fixed before feature lane work
  - 15 wiki `files/*.md` pages are stale, but only update if touched by Program CRUD
- Failed steps checked: `docs/protocols/failed-steps-log.md`
  - FS-0006 mitigated: Petey plan required before multi-part work
  - FS-0007 mitigated: protocol surface reduced; must enforce project log + pre-flight during this session
- Drift register checked: `docs/knowledge/wiki/drift-register.md`
  - D-010 and D-011 appear stale after SESSION_0020/0026 but do not block Program CRUD
  - D-005 cache strategy remains open; avoid introducing new cache policy in this session
- Branch/worktree:
  - Source branch: `main`
  - Session branch: `session-0028-school-ops`
  - Session worktree: `/Users/brianscott/dev/wt-school-ops`
- Primary lane: School operations, with a required governance planning pre-step

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth, DB, routing, server actions, forms/components |
| Extension or replacement | Extension — Program CRUD should compose existing Dirstarter/Ronin app patterns |
| Why justified | Programs are the first School Ops building block and unlock schedules, attendance, and enrollments |
| Risk if bypassed | Feature code could bypass auth/brand scoping, duplicate UI/action patterns, or create an unreviewable route hack |

## Petey plan

### Goal

Repair the launch operating calendar, then implement the smallest useful School Ops feature: Program list/create/detail.

### Tasks

#### SESSION_0028_TASK_01 — Re-sequence WORKFLOW_5.0 calendar

- **Agent:** Petey + Giddy
- **What:** Update `docs/protocols/WORKFLOW_5.0.md` so SESSION_0021–0027 reflect reality and SESSION_0028–0040 reflect current state after schema Waves A-D.
- **Steps:**
  1. Compare actual SESSION_0021–0027 files to the current calendar.
  2. Rewrite calendar rows 0021–0040.
  3. Update schema-wave targets and launch board NOW/NEXT/READY sections.
  4. Keep program-plan supersession notes aligned if needed.
- **Done means:** No phantom session rows remain; launch board starts with School Ops Program CRUD.
- **Depends on:** nothing

#### SESSION_0028_TASK_02 — Cody pre-flight + Program CRUD

- **Agent:** Cody + Desi
- **What:** Run required component/backend pre-flight, then implement `/programs` list/create/detail using existing app patterns.
- **Steps:**
  1. Inspect Program-related Prisma models and existing Organization CRUD patterns.
  2. Record backend/component pre-flight in this SESSION file before code.
  3. Add queries/actions/pages/components for Program list, create, and detail.
  4. Enforce session auth, org membership, and brand scoping per ADR 0004.
  5. Smoke test locally.
- **Done means:** `/programs` renders; creating a Program works; detail page renders for the created Program.
- **Depends on:** SESSION_0028_TASK_01

#### SESSION_0028_TASK_03 — Verification + close evidence

- **Agent:** Doug + Giddy
- **What:** Run targeted verification and record evidence in this SESSION file and project log.
- **Steps:**
  1. Run static checks appropriate to touched files.
  2. Run dev server/browser smoke if environment cooperates.
  3. Record findings, residual risk, files touched, and next-session recommendation.
- **Done means:** Verification commands and any smoke result are recorded with a review verdict.
- **Depends on:** SESSION_0028_TASK_02

### Parallelism

- Parallel sidecar explorers:
  - **Russell:** actual SESSION_0021–0027 mapping and WORKFLOW calendar proposal.
  - **Pauli:** Program CRUD implementation surface, existing patterns, and smoke commands.
- Main execution remains sequential: TASK_01 gates TASK_02 because feature work depends on accurate lane sequencing.
- Worktree: all SESSION_0028 edits happen in `wt-school-ops` on branch `session-0028-school-ops`.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0028_TASK_01 | Petey + Giddy | Planning/calendar + worktree/lane integrity |
| SESSION_0028_TASK_02 | Cody + Desi | Implementation plus UI pattern consistency |
| SESSION_0028_TASK_03 | Doug + Giddy | QA evidence, release risk, git hygiene |

### Open decisions

- None blocking. Program CRUD is accepted as the first School Ops feature from SESSION_0027's recommendation.

### Risks

- First feature lane since S4; dev server/browser path may need environment cleanup.
- Program-related seed data may not exist yet; create flow may require using existing org data from S3/S4 seed.
- D-005 cache policy remains unresolved; use established local query patterns only.

### Scope guard

Program CRUD only. Do not expand into schedules, attendance, enrollment management, pricing, or billing in this session.

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0028_TASK_01 | landed |
| SESSION_0028_TASK_02 | landed |
| SESSION_0028_TASK_03 | landed |

## Pre-flight: Backend — Program CRUD

### 1. Auth predicates planned

- [x] Session auth required for create action.
- [x] Org membership verified before create: user must be admin or have OWNER/INSTRUCTOR role at the selected organization.
- [x] Brand column filtered per ADR 0004 on all Program reads/writes.
- Authorization approach: public list/detail reads only expose `ACTIVE` programs in the current host brand; create validates `organization.brand === input.brand` and calls `canEditOrganization(user, organizationId)` before writing.

### 2. Existing action scan

- Searched `server/` for: `organization/actions`, `organization/queries`, `payloads`, `safe-actions`, `authz`.
- Related existing actions: `server/web/organization/actions.ts` uses `userActionClient`, zod schemas, transactional writes, and revalidation.
- L1 pattern match: Dirstarter safe-action client chain via `~/lib/safe-actions`; local vertical slice pattern is `server/web/organization/{actions,queries,payloads,schemas}.ts`.

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: host brand → Better-Auth session → `authz.ts` checks → Prisma query.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage: Course / curriculum lifecycle, with Program as the student-facing offering that precedes schedules and enrollments.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0006, FS-0007.
- Manual Boundary Registry entries: MB-002 brand scope hardening remains open. Mitigation: Program queries/actions explicitly filter by `brand` and use `canEditOrganization` before mutation.

## Pre-flight: Program components

### 1. Existing component scan

- Searched `components/web/` for: `organizations`, `directory`, `tool`, `form`, `listing`.
- Searched `components/common/` for: `form`, `input`, `textarea`, `select`, `checkbox`, `button`, `card`, `badge`, `stack`.
- Found: `components/web/organizations/create-organization-form.tsx`, `components/common/form.tsx`, `components/common/input.tsx`, `components/common/textarea.tsx`, `components/common/select.tsx`, `components/common/button.tsx`, `components/web/ui/grid.tsx`, `components/web/ui/intro.tsx`, `components/web/ui/section.tsx`.

### 2. L1 template scan

- Searched `dirstarter_template/components/` for: unavailable — no local `dirstarter_template/` directory exists in this worktree.
- Closest L1 pattern: existing Dirstarter-derived Ronin pages/components in `app/(web)/organizations/*`, `components/web/organizations/*`, and admin safe-action forms.

### 3. Composition decision

- [ ] Extending existing component: N/A.
- [x] Composing existing components: common form primitives, `Button`, `Card`, `Badge`, `Stack`, `Grid`, `Intro`, `Section`.
- [x] New component, no L1 match exists: `CreateProgramForm` is new because Program fields and org/discipline dependent selects differ from Organization create, but it composes the same form/action pattern.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read: `docs/sprints/SESSION_0027.md`.
- [x] Wiki entries for target area read: `docs/knowledge/wiki/manual-boundary-registry.md`, `docs/knowledge/wiki/drift-register.md`.
- [x] Runbook consulted: `docs/runbooks/dev-environment.md`, `docs/runbooks/sop-data-and-wiring-flows.md`, `docs/runbooks/sop-e2e-user-lifecycle.md`.

### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/wt-school-ops/apps/web`.
- Brand/host for testing: `localhost:3000` maps to `BASELINE_MARTIAL_ARTS`; `baseline.local:3000` available if hosts file is configured.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (scratch components), FS-0002 (dev server command), FS-0006/FS-0007 (workflow/pre-flight enforcement).
- Mitigation acknowledged: yes — pre-flight artifact is recorded before code; implementation composes existing primitives and vertical-slice patterns; dev server command is taken from the runbook.

## What landed

- Re-sequenced `docs/protocols/WORKFLOW_5.0.md` so SESSION_0021-0027 reflect actual work and SESSION_0028-0040 reflect the current launch sequence.
- Added Program feature slice:
  - `server/web/program/{actions,queries,payloads,schemas}.ts`
  - `/programs` list page
  - `/programs/new` create page
  - `/programs/[id]` detail page
  - `/programs/[id]/edit` edit/archive page
  - `components/web/programs/create-program-form.tsx`
- Hardened Program auth and brand behavior:
  - Public reads filter by active brand and `ACTIVE` status.
  - Mutations require Better-Auth session through `userActionClient`.
  - Mutations verify request brand, organization brand, editable-org permission, and organization-discipline linkage.
  - Program detail uses `/programs/[id]`, not bare slug, because Program slug is only unique by `[brand, organizationId, slug]`.
- Updated `canEditOrganization()` to allow admin, direct org owner, or ACTIVE member with OWNER/ORG_ADMIN/INSTRUCTOR.
- Added Program seed data and owner role assignment to `apps/web/prisma/seed.ts`.
- Added `apps/web/scripts/smoke-program.ts` proving create, cross-brand rejection, unauthorized rejection, invalid-discipline rejection, and cleanup.
- Updated feature-data prerequisites and wiki notes for Program CRUD.

## Files touched

- `docs/sprints/SESSION_0028.md` — session plan and evidence artifact
- `docs/protocols/project-log.md` — task plan entries
- `docs/protocols/WORKFLOW_5.0.md` — session calendar, schema wave status, launch board
- `apps/web/server/web/program/payloads.ts` — Program Prisma payloads
- `apps/web/server/web/program/queries.ts` — brand-scoped Program reads and editable organization options
- `apps/web/server/web/program/schemas.ts` — Program form/action schemas
- `apps/web/server/web/program/actions.ts` — save/archive Program actions with brand/auth checks
- `apps/web/app/(web)/programs/page.tsx` — Program list page
- `apps/web/app/(web)/programs/new/page.tsx` — Program create page
- `apps/web/app/(web)/programs/[id]/page.tsx` — Program detail page
- `apps/web/app/(web)/programs/[id]/edit/page.tsx` — Program edit/archive page
- `apps/web/components/web/programs/create-program-form.tsx` — composed Program create/edit form
- `apps/web/lib/authz.ts` — editable organization predicate expanded
- `apps/web/prisma/seed.ts` — Baseline Program seed data and Sensei OWNER role assignment
- `apps/web/scripts/smoke-program.ts` — Program CRUD smoke proof
- `docs/architecture/feature-data-prerequisites.md` — Program CRUD data graph
- `docs/knowledge/wiki/files/seed-ts.md` — seed wiki update for Programs
- `docs/knowledge/wiki/index.md` — SESSION_0026-0028 and SESSION_0021 status
- `docs/knowledge/wiki/log.md` — SESSION_0028 wiki change log

## Decisions resolved

- SESSION_0028 remains a combined calendar-repair + first feature session. The work stayed inside the School Ops lane after the required governance pre-step.
- Program detail/edit routes use `id` (`/programs/[id]`) because `Program.slug` is not globally unique.
- Program mutations do not trust client-provided brand. The server verifies current request brand against the selected organization.
- Program seed data belongs in baseline seed now because `/programs` should render meaningful dev data after the next DB reset.

## Open decisions / blockers

- Full app typecheck still fails on pre-existing baseline issues (`PageProps`/`LayoutProps` generated globals, content-collections modules, Better-Auth role typing, existing enum mismatches, S3 env typing, Prisma stack-depth query). Filtered typecheck shows no Program-slice errors.
- `apps/web` package `bun run lint` currently fails because the script invokes `bun biome check --write .`; direct `bunx biome check --write <touched files>` passed. This should be cleaned up in a future tooling pass.
- MB-002 remains open at the platform level: Program CRUD enforces brand scope procedurally, but the Prisma brand-scope extension is still not implemented.

## Verification

- `DATABASE_URL=... SHADOW_DATABASE_URL=... bunx prisma validate --schema apps/web/prisma/schema.prisma` — passed.
- `DATABASE_URL=... SHADOW_DATABASE_URL=... bun run db:generate` — passed.
- `bunx biome check --write app/(web)/programs components/web/programs server/web/program lib/authz.ts prisma/seed.ts scripts/smoke-program.ts` — passed; no fixes needed after final patch.
- `DATABASE_URL=... bun scripts/smoke-program.ts` — passed; created Program, rejected cross-brand organization, rejected unauthorized user, rejected unlinked discipline, cleaned up.
- `git diff --check` — passed.
- `bun run wiki:lint` — passed; 115 markdown files, no lint violations.
- `curl -H "Host: baseline.local" http://localhost:3000/programs` — 200.
- `curl -H "Host: baseline.local" http://localhost:3000/programs/new` — 307 to `/auth/login?next=/programs/new` when unauthenticated; `curl -L` resolves to login 200.
- Temporary Program detail HTTP smoke: `/programs/cmokdr93000006uds7wm27c3r` — 200; edit route — 307 to login; temporary row deleted.
- Full `bunx tsc --noEmit --pretty false` — failed on pre-existing baseline issues; filtered output for `programs|server/web/program|components/web/programs|lib/authz|smoke-program|prisma/seed` returned no errors after fixes.
- Dev server command used: `npx next dev --turbo` with local env; server is running at `http://localhost:3000`.

## Review log

- `SESSION_0028_REVIEW_01` — added to `docs/protocols/project-log.md`.

## Hostile close review

### SESSION_0028_REVIEW_01 — Calendar repair + Program CRUD hostile review

**Reviewed tasks:** SESSION_0028_TASK_01, SESSION_0028_TASK_02, SESSION_0028_TASK_03

**Dirstarter docs check:** live docs checked.

**Sources:** `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/codebase/structure`

**Verdict:** Sound and merge-ready for a feature branch. Program code follows Dirstarter's feature-folder shape, Prisma client/seed flow, and action protection expectations. The implementation does not trust hidden brand input: writes derive the brand from the current request and selected organization, then enforce editable-org permission and discipline linkage. Verification is credible for this slice: Prisma validates, touched files pass Biome, the Program smoke script proves create/reject cases, and HTTP smoke proves list/detail and auth redirects. Full-app typecheck remains red on pre-existing baseline issues, but filtered typecheck shows no Program-slice errors.

**Score: 9.5/10** — No hard caps triggered. Minor deduction for unresolved project-wide typecheck/lint-script debt outside this slice.

## Reflections

- The Program slug uniqueness issue was the most important design catch. Using `/programs/[id]` avoids a route bug that would appear as soon as two organizations use the same program slug.
- The old Organization create pattern passes `brand` through a hidden input. For Program, that would have repeated MB-002. The better pattern is server-side request brand + organization brand verification.
- The worktree did not have dependencies installed; that made early verification noisy. Future worktree creation should include dependency readiness as part of Giddy's setup check.
- The repo still needs a tooling cleanup session eventually: the app lint script fails under the current Bun invocation, even though direct Biome works.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated frontmatter on `SESSION_0028.md`, `WORKFLOW_5.0.md`, `feature-data-prerequisites.md`, `seed-ts.md`, `wiki/index.md`, and `wiki/log.md` where touched. Code files do not use JETTY frontmatter. |
| Backlinks/index sweep | `wiki/index.md` updated for SESSION_0026-0028 and SESSION_0021 superseded status. No new wiki pages created. |
| Wiki lint | `bun run wiki:lint` — passed, 115 markdown files, no violations. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | `SESSION_0028_REVIEW_01` recorded in this SESSION and `project-log.md`. |
| Review & Recommend | Next session goal written below: Class schedules vertical slice. |
| Memory sweep | Durable project facts captured in docs: Program route uses id; Program mutations verify server-side brand/org/discipline; Program seed data exists. No external memory update needed. |
| Next session unblock check | Unblocked. Class schedules can build on Program CRUD; no user decision required. |
| Git hygiene | Branch `session-0028-school-ops`; worktree has uncommitted changes by design. No commit/push requested. `git diff --check` passed; `git status --short` reviewed. |

## Next session

- **Goal:** Implement the next School Ops vertical slice: Class schedules, class sessions, and instructor assignment basics.
- **Inputs to read:**
  1. `docs/sprints/SESSION_0028.md`
  2. `docs/protocols/cody-preflight.md`
  3. `docs/protocols/WORKFLOW_5.0.md`
  4. `apps/web/server/web/program/`
  5. `apps/web/prisma/schema.prisma` (`Program`, `ClassSchedule`, `ClassSession`, `ClassInstructorAssignment`)
- **First task:** Run Cody backend/component pre-flight for ClassSchedule CRUD, using Program CRUD as the vertical-slice pattern and preserving brand/org auth predicates.
- **Candidates:**
  1. Class schedules vertical slice — recommended; unlocks attendance/check-in next.
  2. Tooling cleanup (`bun run lint`, full typecheck baseline) — useful but less launch-useful than schedules unless it blocks close evidence.

Bowed out — SESSION_0028 closed. Next session goal: Class schedules vertical slice.
