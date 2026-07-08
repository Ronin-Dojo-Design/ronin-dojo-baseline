---
title: "SESSION 0509 - RBAC capability grants"
slug: session-0509
type: session--implement
status: closed
created: 2026-07-07
updated: 2026-07-07
last_agent: codex-session-0509
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0508.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0509 - RBAC capability grants

## Date

2026-07-07

## Operator

Brian + codex-session-0509

## Goal

Resolve the RBAC role/capability confusion and ship FI-019: a narrow admin grant surface that lets platform admins add `can()` capabilities to account-holding People without promoting them to the platform `admin` role. Preserve the original AdminCollection + Passport consolidation plan as deferred follow-up work.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0508.md`.
- Carryover: 0508 shipped the P0 signup leak, FI-003 instructor-anchor placement, D-034 founder migration, clone-tree retirement, favicon fix, and captured the AdminCollection one-surface law. This session continues the explicit next-session lane: admin collection conformance plus Passport/profile consolidation.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `a1410ac8`
- FS-0024 guard: `pwd` confirmed `/Users/brianscott/dev/ronin-dojo-app`; remote confirmed `Ronin-Dojo-Design/ronin-dojo-baseline`.
- Fresh-worktree bootstrap: not needed; `apps/web/node_modules` is present.

### Inbound scan

- `bun scripts/ledger-backlog.ts` - 54 open items; top rows remain FI-001/G-001, G-002, G-005, G-007, FI-002/003/004, and RISK #13.
- `(cd apps/web && bun scripts/board-backlog.ts --top=10)` - 48 open cards; board order starts FI-001/G-001/G-002, then TFF-006, MB-010, MB-012, MB-013, G-007, MB-014, FI-002.
- Open PR rows: 0.
- Precedence: prior `SESSION_0508` explicitly pins the AdminCollection + profile-editor lane, so it wins over the board's general P0 ordering unless the operator overrides it.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth, Prisma, data-table/components, app route structure |
| Extension or replacement | Extension: reuse `/app/tools` + `components/data-table` as the admin collection frame; keep `/app` layout/procedure authorization as the boundary. |
| Why justified | The session consolidates admin surfaces onto the Dirstarter-derived dashboard/table substrate instead of adding bespoke list pages. |
| Risk if bypassed | Reintroduces FS-0001/FS-0014 style hand-rolled UI, stale `/admin` route wiring, or parallel person/profile read models. |

Live docs checked during planning on 2026-07-07:

- `https://dirstarter.com/docs/codebase/structure` - modular App Router structure; `components/data-table`; server entity folders with `queries.ts`, `mutations.ts`, `schema.ts`, `router.ts`.
- `https://dirstarter.com/docs/authentication` - `/app` is the signed-in workspace; middleware is optimistic only; route layouts and procedures enforce auth/roles.
- `https://dirstarter.com/docs/database/prisma` - Prisma schema/client/migrations remain the DB substrate; reads use `~/services/db`.

### Graphify check

- Graph status: current; stats at bow-in: 16562 nodes, 32947 edges, 2240 communities, 2530 files tracked.
- Queries used:
  - `AdminCollection PassportEditor LineageNode bio app users tools brand settings member table listed under promoted by`
- Files selected from graph:
  - `apps/web/app/app/tools/_components/tools-table.tsx`
  - `apps/web/app/app/tools/_components/tools-table-columns.tsx`
  - `apps/web/app/app/memberships/_components/memberships-table.tsx`
  - `apps/web/hooks/use-data-table.ts`
  - `apps/web/server/admin/tools/queries.ts`
  - `apps/web/server/admin/memberships/queries.ts`
- Verification note: exact table-pattern files opened after Graphify; Graphify used as navigation, not proof. One graph path was stale (`apps/web/app/admin/memberships/_components/memberships-table.tsx` no longer exists), confirming `/app` is the active surface.

### Router classification

- `agent-systems-map.md` task->workflow router read: this is multi-part with open scope forks, so the route is Petey plan/grill first, then Cody implementation, then Doug verification.
- Allowed-vs-never table read: build/stage/commit are allowed at close, but push/merge/deploy/prod data changes require the operator's explicit word.
- Codex note: no implementation sub-agent dispatch was started during bow-in; dispatch/pre-flight happens before code writes.

### Canon and drift loaded

- Domain hub: `docs/runbooks/domain-features/directory-org-profile-hub.md`.
- Identity canon: `docs/knowledge/wiki/concepts/passport-and-shells.md`, `docs/knowledge/wiki/ronin-project-context.md`, `docs/runbooks/sops/lineage-data-wiring-flow.md`, `docs/knowledge/wiki/repo-truth-index.md`.
- ADRs/LRs: ADR 0025, ADR 0035, ADR 0040, ADR 0041, ADR 0043; LR 0006 and LR 0008.
- Relevant drift: D-023 remains the identity consolidation drift; D-040 warns that `passport-and-shells.md` still says Passport -> User 1:1 even though ADR 0025/schema have nullable `Passport.userId`.
- FAILED_STEPS warnings: FS-0001/FS-0014 require L1 primitive/data-table reuse; FS-0024 requires cwd/remote guard before git mutations; FS-0026 requires old route prefixes to be swept across `revalidatePath`, redirects, links, and router pushes when deleting `/app/brand-settings` or retired `/admin` paths.
- AdminCollection memory note: no local markdown memory file named `admin-collection-one-surface-law` was found; `SESSION_0508` is the local carryover source until the memory surface is exposed.
- Role-axis finding during grill: `/app/roles` manages org-scoped membership `Role` rows; People detail writes platform `User.role`; lineage roles live in `LineageTreeAccess`. The UI label "Roles" is overloaded.
- `/app/roles/new` finding: it creates a `Role` row (`name`, `code`, `description`, `displayTitle`, `brand`, `isSystem=false` by default). It does not create permissions. Platform membership detail can assign any role; org settings only assign `isSystem` roles and reject custom roles. Existing app capabilities are hard-coded against role codes like `OWNER`, `ORG_ADMIN`, `INSTRUCTOR`, `COACH`.
- Authz consolidation finding: SESSION_0498 researched "consolidate the 4 authz systems" and rejected it. The four axes remain layered: global capability via `can()`, lineage resource grants, org standing, and commerce entitlements. FI-019 is the approved way to add per-user capability grants inside the existing `can()` axis, not a fifth resolver.

## Petey plan

### Goal

Land a reviewable AdminCollection lane that starts from `/app/tools`, conforms `/app/users` into a real member table, retires dead brand-settings/admin sprawl, and begins Passport profile consolidation without adding a parallel editor or second person source.

### Tasks

#### SESSION_0509_TASK_01 - Plan-lock AdminCollection scope and route inventory

- **Agent:** Petey
- **What:** Convert the prior-session "AdminCollection law" into a tight implementation plan with exact route/file inventory and forks resolved before Cody writes code.
- **Steps:**
  - Read active `/app/tools`, `/app/users`, memberships, brand-settings, and profile editor files.
  - Decide the first deliverable set: reusable frame vs direct conformance, `/app/users` member-table shape, and brand-settings deletion blast radius.
  - Record any old-route sweep targets for FS-0026.
- **Done means:** this SESSION file contains the finalized fork list and Cody task boundaries.
- **Depends on:** nothing.

#### SESSION_0509_TASK_02 - Build AdminCollection frame and conform `/app/users`

- **Agent:** Cody
- **What:** Reuse the `/app/tools` data-table pattern to make `/app/users` a useful member/person table instead of a thin account list.
- **Steps:**
  - Complete Cody pre-flight: source-read `ToolsTable`, current users page/query/schema, data-table primitives, auth layout, and relevant Prisma models/enums.
  - Add the smallest shared frame/helper only if it removes real duplication after the second surface is mapped.
  - Shape `/app/users` columns around Passport/member facts: name/avatar, belt/current rank, listed-under, verification, school/affiliation, account state.
  - Keep person facts sourced from Passport/RankAward/Affiliation/LineageTreeMember per repo-truth-index.
- **Done means:** `/app/users` renders the member table with server-backed filters/sort/pagination and no parallel person source.
- **Depends on:** SESSION_0509_TASK_01.

#### SESSION_0509_TASK_03 - Retire `/app/brand-settings` and collapse enforcement docs into one read-path law

- **Agent:** Cody
- **What:** Remove the dead brand-settings admin surface if the plan-lock confirms it is obsolete, and de-sprawl enforcement docs into the one canonical read path.
- **Steps:**
  - Map `/app/brand-settings`, server actions/queries, sidebar/nav, e2e tests, redirects, and `revalidatePath` strings before deleting.
  - Preserve live token/runtime behavior if the DB `BrandSettings` row remains authoritative, or explicitly document the new static-token decision before removing DB writes.
  - Update the canonical admin-surface/read-path doc only; avoid another parallel law.
- **Done means:** no reachable dead brand-settings admin UI remains, old route references are swept, and docs point to one admin-collection law.
- **Depends on:** SESSION_0509_TASK_01.

#### SESSION_0509_TASK_04 - Profile-editor Slice A: fold `LineageNode.bio` toward `Passport.bio`

- **Agent:** Cody
- **What:** Start the Passport consolidation by moving remaining bio display/write seams toward `Passport.bio` without parsing prose or weakening lineage truth.
- **Steps:**
  - Map every `LineageNode.bio` reader/writer and classify narrative-only vs identity-profile display.
  - Design the backfill/update path first; rehearse locally if data mutation is required.
  - Keep `PassportEditor` as the single owner edit surface; do not add another profile form.
- **Done means:** Slice A lands or is converted into a precise follow-up if its blast radius exceeds this session.
- **Depends on:** SESSION_0509_TASK_01.

#### SESSION_0509_TASK_05 - Doug verification and close evidence

- **Agent:** Doug
- **What:** Verify admin route behavior, data-source invariants, no route-prefix residue, gates, and documentation state.
- **Steps:**
  - Run relevant unit/type/lint gates.
  - Browser-smoke `/app/users`, `/app/tools`, and any changed profile/admin route.
  - Check source invariants: Passport identity, RankAward rank, Affiliation school, `/app` auth boundary.
  - Record evidence and update any ledgers/cards touched.
- **Done means:** Verification table has concrete command/browser evidence and unresolved risk is explicit.
- **Depends on:** SESSION_0509_TASK_02, SESSION_0509_TASK_03, SESSION_0509_TASK_04.

#### SESSION_0509_TASK_06 - FI-019 RBAC capability grants

- **Agent:** Cody
- **What:** Add grantable per-user `can()` capabilities for account-holding People, starting with `beta.view` and narrow `media.upload`.
- **Steps:**
  - Add a soft-revokable `UserPermissionGrant` table with audit-backed grant/revoke actions.
  - Load active grants into the session once per request so `can()` remains synchronous.
  - Keep `S3_UPLOAD` honored as a legacy bridge, but move the admin UI to the RBAC permission-grant panel.
  - Browser-smoke `/app/users/[id]` and run fallow-fix-loop on the diff.
- **Done means:** Admins can toggle `beta.view` and `media.upload` on a User detail page without granting platform `admin`; existing S3 entitlement grants still work during migration.
- **Depends on:** SESSION_0509_TASK_01 and the operator's RBAC pivot during grill.

### Parallelism

TASK_02 and TASK_03 can run in parallel only after TASK_01 if they touch disjoint route trees. TASK_04 should stay sequential after TASK_01 because it touches the identity model and may overlap `/app/users` read-model decisions. TASK_05 waits for implementation.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0509_TASK_01 | Petey | Multi-part lane; fork resolution before code. |
| SESSION_0509_TASK_02 | Cody | App/UI/server implementation. |
| SESSION_0509_TASK_03 | Cody | Route/doc cleanup with write access. |
| SESSION_0509_TASK_04 | Cody | Identity/profile implementation, guarded by pre-flight. |
| SESSION_0509_TASK_05 | Doug | Independent verification and close evidence. |
| SESSION_0509_TASK_06 | Cody | Operator-pivoted RBAC capability implementation. |

### Open decisions

- Whether `/app/brand-settings` deletion also removes `BrandSettings` DB writes, or only retires the admin UI while preserving runtime CSS injection.
- How to align role IA: `/app/roles` label/surface for membership roles vs platform account role editor on People rows.
- Whether `AdminCollection` becomes a named component/helper in this session or remains a conformance pattern until a second surface proves the abstraction.
- Whether profile Slice A should include a data backfill in this session or stop at mapped code consolidation plus a gated script plan.

### Risks

- D-040 can mislead implementation if `passport-and-shells.md` is read without ADR 0025; treat ADR/schema as the winner.
- `/app/users` can accidentally read `Membership.rankId` or `Membership` school; current rank must derive from `RankAward`, school from `Affiliation`.
- Brand-settings removal can trip FS-0026 if old routes survive in `revalidatePath`, redirects, links, tests, or nav.
- A premature `AdminCollection` abstraction could become a god-component; ADR 0040/LR 0006 require a narrow surface/helper, not a `kind` union.
- RBAC grant toggles can accidentally widen authority if `media.manage`, `users.manage`, or `roles.manage` are exposed as casual user toggles. Start with narrow keys and keep admin-level area keys out of the default picker unless the operator explicitly asks for them.

### Scope guard

- No FI-001 send.
- No prod data mutation without a rehearsal and explicit operator gate.
- No schema migration unless TASK_01 proves it is necessary and the plan is updated first. **Exception:** TASK_06 added the FI-019 `UserPermissionGrant` migration after the operator pivoted to RBAC grants.
- No new parallel profile editor.
- No broad admin-surface rewrite beyond the planned lane.
- No push, merge, or deploy without explicit per-push authorization.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Project Structure, Authentication, Prisma Setup checked live on 2026-07-07.
- **Baseline pattern to extend:** `/app/tools` data-table, `components/data-table`, `useDataTable`, `/app` permission layouts, Prisma query modules under `server/admin/*`.
- **Custom delta:** Ronin-specific member/person columns and Passport/RankAward/Affiliation lineage facts.
- **No-bypass proof:** planned work extends the existing data-table and route guard substrate; Cody pre-flight must list exact primitive APIs before code writes.

## Cody pre-flight

TASK_06 pre-flight completed inline from existing authz canon and source reads; the original AdminCollection Cody pre-flight remains pending because TASK_02 did not start.

### Pre-flight seed context

- Graphify query used: `AdminCollection PassportEditor LineageNode bio app users tools brand settings member table listed under promoted by`
- Found: `/app/tools` table/columns, `/app/memberships` table, `useDataTable`, Dirstarter data-table components, and server admin query/schema modules.
- Prior failures in this area: FS-0001, FS-0014, FS-0026.
- Mitigation acknowledged: extend L1/data-table patterns and sweep old route strings in the same change.
- Dev server command: `cd apps/web && npx next dev --turbo`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0509_TASK_01 | closed-by-pivot | Plan-lock AdminCollection scope and route inventory; source scan/grill resolved the RBAC fork and the operator pivoted TASK_06 ahead of the original lane. |
| SESSION_0509_TASK_02 | deferred | Build AdminCollection frame and conform `/app/users`. |
| SESSION_0509_TASK_03 | deferred | Retire `/app/brand-settings` and collapse enforcement docs. |
| SESSION_0509_TASK_04 | deferred | Profile-editor Slice A: fold `LineageNode.bio` toward `Passport.bio`. |
| SESSION_0509_TASK_05 | landed | Verification and close evidence for the RBAC pivot. |
| SESSION_0509_TASK_06 | landed | FI-019 RBAC capability grants: schema, session load, `can()` integration, People detail toggles, media-upload bridge, tests, fallow loop, browser smoke. |

## What landed

- **FI-019 RBAC capability grants:** added `UserPermissionGrant` with audit-backed grant/revoke, active-grant session loading, and `can()` integration via `extraGrants`.
- **Grantable keys:** initial allowlist is `beta.view` and `media.upload`. `media.upload` is intentionally narrower than `media.manage`.
- **People detail UI:** replaced the old `S3_UPLOAD` one-off entitlement toggle with a `PermissionGrantsPanel` on `/app/users/[id]`; legacy `S3_UPLOAD` still shows as a bridge badge and still authorizes upload.
- **Upload gate composition:** added `canUploadMediaForUser()` so upload checks now compose `media.upload`, `media.manage`, and the existing entitlement/org signals in one helper.
- **Docs:** recorded WL-P2-32 and glossary terms for `Permission` / `PermissionGrant`; clarified that authz consolidation was rejected in favor of layered axes plus conformance.

## Decisions resolved

- `/app/users` should become the admin **People** collection keyed by `Passport`; `User` remains auth-account state only. Accountless admin-created people must appear in the collection. Captured in `docs/architecture/ubiquitous-language.md` as `Person`.
- KISS route decision: keep the existing `/app/users` mount; do not create `/app/people`. Treat `User` as "a Person with an account" and model accountless People as `Passport.userId = null`.
- Default `/app/users` list should show **all People** (`Passport` rows), including accountless people. Account state is a column/filter; account-only actions render only when `Passport.userId` exists.
- Authz consolidation is **not** the task. Keep the four authz axes layered and conform them. The grant-toggle lane is FI-019: additive per-user grants inside the existing global `can()` capability axis, using the same `Grant` strings and audit/soft-revoke hygiene.
- Initial grantable RBAC allowlist is `beta.view` and `media.upload`. Do not use broad `media.manage` for ordinary upload capability.
- `S3_UPLOAD` remains honored as a legacy bridge during migration, but new admin grants should use `media.upload`.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0509.md` | Bow-in session file created from template. |
| `docs/knowledge/wiki/wiring-ledger.md` | Added WL-P2-32 for FI-019 per-user RBAC capability grants and the `S3_UPLOAD`/`media.upload` cleanup path. |
| `docs/architecture/ubiquitous-language.md` | Added `Person`, `Permission`, and `PermissionGrant`; clarified Entitlement vs platform authority. |
| `apps/web/prisma/schema.prisma` + `apps/web/prisma/migrations/20260707000000_add_user_permission_grant/migration.sql` | Added `UserPermissionGrant` with soft revoke, grantor, and partial unique active-grant index. |
| `apps/web/lib/auth.ts`, `apps/web/server/orpc/permissions.ts`, `apps/web/server/orpc/roles.ts`, `apps/web/server/orpc/context.ts` | Loaded active permission grants into session users and included them in synchronous `can()` checks; added `media.upload`. |
| `apps/web/server/admin/permissions/*` | Added grantable permission metadata, read model, audited grant/revoke safe actions, and action tests. |
| `apps/web/app/app/users/[id]/page.tsx`, `apps/web/app/app/users/_components/permission-grants-panel.tsx` | Added the People detail permission toggle panel and removed the old one-off `upload-grant-toggle.tsx`. |
| `apps/web/server/web/media/permissions.ts`, `apps/web/lib/safe-actions.ts`, `apps/web/app/(web)/dashboard/profile-tab.tsx` | Centralized upload authorization composition and wired dashboard upload checks through it. |
| `apps/web/server/orpc/permissions.test.ts` | Added FI-019 `extraGrants` coverage and `media.upload` assertion. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `git branch --show-current` | `main` |
| `git status --short` | clean before SESSION_0509 creation |
| `git rev-parse --short HEAD` | `a1410ac8` |
| `graphify stats` | 16562 nodes, 32947 edges, 2240 communities, 2530 files tracked |
| `bun scripts/ledger-backlog.ts` | 54 open items, 0 PR rows |
| `(cd apps/web && bun scripts/board-backlog.ts --top=10)` | 48 open cards, top board rows FI-001/G-001/G-002 |
| `bun run wiki:lint` | 0 errors; 44 pre-existing markdown warnings, none from `SESSION_0509.md` |
| `(cd apps/web && bun run db:generate)` | Prisma Client generated after adding `UserPermissionGrant`. |
| `(cd apps/web && bun run db:migrate deploy)` | Applied local migration `20260707000000_add_user_permission_grant` to `ronindojo_prodsnap`. |
| `(cd apps/web && bun test server/orpc/permissions.test.ts)` | 20 pass / 0 fail. |
| `(cd apps/web && bun test server/admin/permissions/actions.safe-action.test.ts)` | 4 pass / 0 fail. |
| `(cd apps/web && bun test server/admin/users/role-change.safe-action.test.ts)` | 6 pass / 0 fail. |
| `(cd apps/web && bun run typecheck)` | Pass; route types generated and `tsc --noEmit` clean. |
| `(cd apps/web && bun run lint:check)` | Exit 0; only pre-existing warnings outside the new permission files. |
| `(cd apps/web && npx fallow audit --changed-since HEAD --gate new-only --max-crap 30)` | Exit 0; `No issues in 19 changed files`; inherited dependency/dup/complexity warnings excluded. |
| `(cd apps/web && npx fallow audit --changed-since HEAD --gate new-only)` | Exit 0; same final fallow verdict. Before fallow fixes: 1 unused type, 7 clone groups, 5 large functions, 3 complexity findings. After: introduced findings clean; only inherited warnings remain. |
| Playwright smoke on `http://localhost:3000/app/users/<adminUserId>` after `/api/auth/dev-login` | Pass: permission panel present, `beta.view` present, `media.upload` present, user form present, 2 switches, 0 console errors. Required restarting the stale dev server after Prisma generate. |
| `bash scripts/bow-out-gates.sh` | Exit 0: format fix/check, `wiki:lint`, build, Graphify refresh, fallow new-only gate all passed; close runner reported 19 dirty files and no introduced fallow findings. |

## Full close evidence

- `npx fallow audit` and the fallow-fix loop were run on the changed set; final gate is clean for newly introduced issues. Remaining fallow warnings are inherited false-positive or pre-existing complexity/duplication rows.
- Bow-out gates passed after code formatting: `wiki:lint` 0 errors / 44 pre-existing warnings, `next build` pass, Graphify refreshed to 16592 nodes / 32928 edges / 2241 communities.
- Local DB state includes the applied `20260707000000_add_user_permission_grant` migration against `ronindojo_prodsnap`. Production was not mutated.
- No push, merge, deploy, or commit was performed because no explicit per-push authorization was given.

## Hostile close review

- **Security/authz:** additive user grants stay inside the existing global `can()` axis. Self grant/revoke is blocked, writes are audited before mutation, and the grantable UI allowlist is limited to `beta.view` and `media.upload`.
- **Model boundary:** `/app/roles/new` remains membership-role CRUD and does not mint permissions. Commerce entitlements still authorize legacy `S3_UPLOAD`, but the new admin control grants `media.upload` through RBAC.
- **Migration risk:** the new partial unique active-grant index prevents duplicate live grants while preserving soft-revoke history. Rollback would need to drop `UserPermissionGrant`; no destructive data migration was run outside local dev.
- **Residual risk:** `/app/users` still lists account Users, not all Passport-backed People. That is intentionally deferred to TASK_02; accountless People cannot receive RBAC account grants until they have a `User`.

## Open decisions / blockers

TASK_06 landed. TASK_02 through TASK_04 remain pending because the operator pivoted from AdminCollection/profile consolidation into RBAC capability grants.

## Next session

### Goal

Continue or complete the AdminCollection + Passport profile consolidation lane from this session plan.

### First task

Start with SESSION_0509_TASK_02 if continuing the original lane: conform `/app/users` into the Passport-backed People collection. The RBAC grant toggle now exists for account-holding People; accountless People must hide account-only actions.

## Review log

- 2026-07-07 bow-out: hostile close review completed inline. No blocking findings; residual risk is the deferred People collection conformance, not the shipped RBAC grant slice.

## Reflections

- The useful simplification was separating "Person" from "User" without renaming the route today: a User is just a Person with an account.
- The role confusion was real: platform role, membership role, lineage access, and commerce entitlement share admin vocabulary but not authority semantics. The shipped fix adds one narrow per-user capability grant path without collapsing those axes.
