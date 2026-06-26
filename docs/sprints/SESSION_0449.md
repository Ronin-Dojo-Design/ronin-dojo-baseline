---
title: "SESSION 0449 — land PR #163 + UserRole enum hardening + test-org cleanup + brand destales"
slug: session-0449
type: session--implement
status: closed
created: 2026-06-25
updated: 2026-06-26
last_agent: claude-session-0449
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0448.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0449 — land PR #163 + UserRole enum hardening + test-org cleanup + brand destales

> **PRE-STAGED at SESSION_0448 close (2026-06-25).** Bow-in: confirm the git/PR state below (PR #163 may
> already be merged), then execute the Petey plan. The plan is orchestration-ready — Petey grills the open
> decisions first, hands the gated investigation to parallel subagents, then Cody builds and Doug verifies,
> with Giddy on the hostile close. Update `created`/`last_agent` if the session runs later / a different agent.

## Date

2026-06-26 (ran; pre-staged 2026-06-25)

## Operator

Brian + claude-session-0449 (Petey)

## Goal

Land the held SESSION_0448 stack (PR #163), then harden `user.role` from a free-text `String` to a typed
`UserRole` enum (the authz-safety follow-up the 0448 org-settings fix exposed), clean up the 3 junk test
orgs in prod (script already staged), and clear the small brand-vestige destales. The gated Stage-2 brand
schema drop stays its own future PR. Schema-touching work goes via PR, not push-to-main.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0448.md` (read its **Hostile close review → TASK_09 flags** +
  **Next session** block).
- Carryover: 0448 shipped a 23-commit stack as **PR #163** (branch `session-0448-admin-app-migration`):
  `/admin→/app` topology migration + lineage avatar-uploader restore + quality sweep (`cache()` on
  `findBrandSettings`, 3 dead modules deleted, `<ThemeFieldset>` dedup) + an org-settings access fix
  (platform admins manage all orgs; `getOrganizationBySlug` de-branded). Held as a PR for a CI+preview gate
  before the prod deploy, because the authz + public-resolution changes warrant an independent review.

### Branch and worktree

- Branch: `main` (the PR is on `session-0448-admin-app-migration`)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: confirm clean
- **Git/PR state (confirm before assuming):** `origin/main` = `768d464e`. The 23-commit stack lives on
  **PR #163**, NOT on `origin/main`. Local `main` is ahead 23 mirroring the branch. **If PR #163 is already
  merged**, skip TASK_00's merge step → just `git checkout main && git pull` to resync, then start TASK_01.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Auth** (Better Auth) — TASK_01 converts the `user.role` column to an enum; the Better Auth `admin()` plugin owns this field. |
| Extension or replacement | Hardening — type-tighten an existing field; no capability replaced. |
| Why justified | A free-text `role String` silently fails authz gates on a typo (`"Admin"`); the 0448 fix made `role==="admin"` a real authorization boundary, so it should be typed. |
| Risk if bypassed | Auth-gate bypass from an unchecked role string; this is the safety net for the widened authz. |

Live docs to check during TASK_01 planning: **Better Auth — admin plugin / role management** (the #1 risk gate).

### Grill outcome

Pre-resolved at 0448 close (Petey re-confirm at bow-in, re-grill only if state changed):

- **Merge vehicle:** PR (#163), not push-to-main — the authz + public-resolution changes get CI + a Vercel
  preview + an independent review before the prod deploy.
- **`UserRole` is the first NEW task** (operator directive) — higher value than a super-admin tier; keep
  `"admin"` as the single platform superuser (don't add super-admin — premature/YAGNI).
- **Test-org cleanup = delete** (no `published` field exists to "unpublish"); prod op, dry-run first.

## Petey plan

### Goal

Land PR #163, type-harden `user.role`, delete the test orgs, clear the brand destales — schema work via PR,
prod data ops dry-run-gated.

### Tasks

#### SESSION_0449_TASK_00 — Land PR #163

- **Agent:** Petey (orchestrate) + Doug (verify) + `/code-review ultra` or `/pr-fix-loop` (independent pass)
- **What:** get the 25-commit 0448 stack reviewed + merged → prod. **As of pre-stage (2026-06-25) CI is
  GREEN / mergeState CLEAN** — the only e2e failure (chromium `brand-settings.spec.ts` asserted 4 brands,
  stale after the 0447 single-brand collapse) was fixed in `b132f08c`. So TASK_00 = re-confirm green + the
  review pass + merge (no fix step expected).
- **Steps:** `gh pr checks 163` — if red, fix on the branch (push updates the PR; no prod deploy until merge);
  run `/code-review ultra` (or `/pr-fix-loop`) focused on the **two security-sensitive changes**:
  `server/web/organization/org-admin-access.ts` (authz widening — `role==="admin"` ⇒ all-org *write* via
  `assertOrgAdminAccess`) and `server/web/organization/queries.ts` (`getOrganizationBySlug` now resolves
  non-BBL orgs on **public** `/organizations/[slug]`). Confirm the **2nd `role:admin` user** is intended to
  hold all-org write (operator). Merge → prod deploy → `git checkout main && git pull` to resync local main.
- **Done means:** PR #163 merged to `origin/main`; local `main` resynced; prod deploy green (`vercel`/CI).
- **Depends on:** nothing — **do first** (clean base before new schema work).

#### SESSION_0449_TASK_01 — `user.role` String → `UserRole` enum hardening

- **Agent:** **Doug + 2 parallel subagents (the GATE)** → **Cody (build)** → **Doug (verify)**
- **What:** convert `role String @default("user")` (`prisma/schema.prisma`) to a typed `UserRole` enum so a
  typo can't silently bypass the 0448 authz gates.
- **Steps:**
  1. **Phase A — investigate (2 parallel subagents on disjoint surfaces; this is the go/no-go gate):**
     - *Subagent 1 (data + code value-set):* enumerate **every** distinct `user.role` value in the data
       (`db.user.groupBy({by:["role"]})`) AND every role string literal in code
       (`grep -rho '"\(admin\|user\|tournament_director\|lineage_tree_admin\|...\)"'`) → the complete,
       exhaustive enum value list (a missing value makes the migration fail on existing rows).
     - *Subagent 2 (Better Auth compat — #1 RISK):* does the Better Auth `admin()` plugin (`lib/auth.ts:215`)
       tolerate an **enum** `role` column? Check how it writes role on user-create / `setRole`, its
       `adminRole`/`defaultRole` config, and its TS types. Verdict: **COMPATIBLE / needs-adapter / BLOCKER**.
  2. **Decision gate (Petey + operator):** if Better Auth can't write an enum column, fall back (a checked
     TS union + a Postgres `CHECK` constraint, not a Prisma enum) — surface before Cody builds.
  3. **Phase B — Cody build:** add `enum UserRole {...}` (lowercase values to match the data), change the
     column to `role UserRole @default(user)`, `prisma migrate dev` (confirm the migration maps existing
     rows — clean any stray value first), repoint the ~30 call sites (`lib/authz.ts`, `lib/auth-hoc.ts`,
     `lib/safe-actions.ts`, `components/admin/*`, `app/app/users/_components/user-form.tsx`, etc.).
  4. **Phase C — Doug verify:** tsc + oxlint; **faithful clonefile `next build`**; **browser auth check**
     (dev-login still works, the `role==="admin"` gates still gate, the `/app/users` role editor still
     assigns a role through Better Auth). Re-run `prisma migrate status` on prodsnap.
- **Done means:** `role` is a typed `UserRole` enum; migration applied + mapped on prodsnap; tsc + faithful
  build green; auth + role-assignment browser-verified; Better Auth compat confirmed. **→ its own PR.**
- **Depends on:** SESSION_0449_TASK_00 (land #163 so `main` is clean before the migration branch).

#### SESSION_0449_TASK_02 — Test-org cleanup (prod)

- **Agent:** Petey (operator-gated) — script already staged
- **What:** delete the 3 junk 0-member test orgs (`session-0033-…`, `session-0179-…`, `test-ce-sa-…`).
- **Steps:** `cd apps/web && bun --env-file=.env.prod scripts/delete-test-orgs.ts` (**dry-run** — review the
  list; ⚠ `session-0179-…` has a `lineageTree`, `test-ce-sa-…` a `course` — confirm both are junk), then
  `--apply` **on operator go**. Re-run dry-run → expect 0 candidates.
- **Done means:** test orgs gone from prod; dry-run shows 0; `/organizations/<those-slugs>` 404 publicly.
- **Depends on:** nothing — independent + operator-gated; can run in parallel with TASK_01's investigation.

#### SESSION_0449_TASK_03 — Brand-vestige destales (parallel subagents)

- **Agent:** **3 disjoint subagents in parallel** (Cody-style; no worktree needed — non-overlapping files)
- **What:** the small deferred destales.
- **Steps:** *Subagent A:* `config/site.ts` `siteConfig.name` "Baseline Martial Arts" → BBL metadata
  destale (verify `next build` metadata). *Subagent B:* `repo-truth-index.md` §D 4-brand-enum destale
  (docs — wiki-lint). *Subagent C:* trim the 2 dead exports (`TKO_THRESHOLD`, `ESKRIMA_DEFAULT_ROUNDS`) in
  `app/app/tournaments/_components/score-forms.tsx` (tsc + fallow delta).
- **Done means:** 3 destales landed; tsc + wiki-lint green; fallow shows the dead exports gone.
- **Depends on:** nothing — disjoint from TASK_01/02. Can run on `main` after #163 lands.

#### SESSION_0449_TASK_04 — `/fallow-fix-loop` + `/code-review`

- **Agent:** Petey/Doug (parallel finder subagents)
- **Done means:** diff clean (0 introduced findings); fallow before→after delta proven; review clean.

#### SESSION_0449_TASK_05 — `/bow-out` (full close)

- **Agent:** Petey + **Giddy/Doug/Desi hostile review**
- **Done means:** SESSION closed; docs/JETTY/wiki-lint/graphify/memory swept; PR(s) for schema work; push
  per explicit-push rule.

### Parallelism

- **TASK_00 first** (land #163 → clean base). **TASK_02** (prod delete) is independent + operator-gated —
  can run alongside TASK_01's investigation. **TASK_01 Phase A = 2 parallel subagents** (data/code value-set
  ∥ Better Auth compat — the gate). **TASK_03 = 3 parallel disjoint subagents.** **TASK_01 Phase B
  (call-site repoint) stays inline/sequential** — all sites reference the one enum; parallel edits would
  collide (don't split). Review (TASK_04) = parallel finders. **Faithful build = clonefile worktree** (always).
- **Worktree isolation:** only needed if two code-mutating Cody/subagent passes run *simultaneously on
  overlapping files* — here TASK_01 (schema+authz) and TASK_03 (config/docs/score-forms) are disjoint, so
  parallel-on-`main` is fine; reach for `isolation: "worktree"` only if you choose to run TASK_01 Phase B
  and TASK_03 concurrently.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_00 | Petey + Doug + `/code-review ultra` | land the held PR with an independent review of the authz/public-page changes |
| TASK_01 | Doug + 2 subagents (gate) → Cody → Doug | schema + auth = highest blast radius → investigate-gate, build, verify |
| TASK_02 | Petey (operator-gated) | prod data delete; dry-run → operator "go" |
| TASK_03 | 3 parallel subagents | disjoint destale tasks (config / docs / score-forms) |
| TASK_04 | Petey/Doug (parallel finders) | quality loop + review over the diff |
| TASK_05 | Petey + Giddy/Doug/Desi | hostile close |

### Open decisions

- **2nd `role:admin` user:** confirm they should keep all-org *write* access (the 0448 widening). Resolve in TASK_00.
- **Better Auth enum tolerance (TASK_01 gate):** if the `admin()` plugin can't write an enum column → fall
  back to a checked union + Postgres `CHECK` constraint instead of a Prisma enum. Decide at the Phase-A gate.
- **Test-org children (TASK_02):** confirm the `session-0179-…` lineageTree + `test-ce-sa-…` course are junk
  before `--apply`.

### Risks

- **Better Auth ⊥ enum** — the `admin()` plugin may write `role` as an arbitrary string; an enum column would
  reject an out-of-set value (the gate; could force the union/CHECK fallback).
- **Migration on existing data** — `String→enum` fails if any row holds a value absent from the enum set
  (mitigate: Subagent 1 enumerates exhaustively first; clean strays before migrating).
- **Prod delete cascade** — 2 of the 3 test orgs have child rows (lineageTree, course) that cascade.

### Scope guard

- **DON'T** do the gated **Stage-2 brand schema drop** (drop `brand` from 44 models + the `Brand` enum + 452
  literals) this session — that's its own future PR with its own decision gates. TASK_03 is only the small
  doc/config brand *destales*.
- **KEEP-FOREVER:** `BRAND_TRUSTED_ORIGINS` / `resolveBrand` / `HOST_TO_BRAND` (`lib/brand-context.ts`) — the
  host→origin security gate (MB-002), used by `stripe-webhook.ts` + `lib/auth.ts`.
- **Schema migrations (TASK_01) → PR path**, never push-to-main. Prod data ops (TASK_02) → dry-run + operator go.

### Faithful build recipe (banked — the dev server confounds builds)

See `[[next-build-catches-use-server]]`. DON'T build in-place with a custom distDir while `next dev --turbo`
runs on :3000 (incomplete route-manifest → phantom typedRoutes + dev-login errors); DON'T use a worktree with
SYMLINKED node_modules (Turbopack rejects out-of-tree symlinks). DO: `git worktree add --detach /tmp/wt <SHA>`
→ `cp -Rc node_modules` (root + apps/web) + `cp -Rc apps/web/.generated` + `cp apps/web/.env*` →
`cd /tmp/wt/apps/web && npx next build` (default `.next`, real deps, no dev interference); remove the worktree
after. Use `npx next build` NOT `bun run build` (prebuild runs `db:migrate deploy` against prodsnap).

## Cody pre-flight

### Pre-flight: TASK_01 — UserRole enum

#### 1. Existing component scan

- The authz surface is `lib/authz.ts` / `lib/auth-hoc.ts` / `lib/safe-actions.ts` + `server/web/organization/
  org-admin-access.ts` (the 0448 fix). Role values are read as string literals in ~30 sites.

#### 2. L1 template scan

- Auth = Better Auth (Dirstarter L1). The `role` field is owned by the `admin()` plugin (`lib/auth.ts:215`).
  **Check Better Auth admin-plugin docs for role-column type expectations before the migration.**

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (this file). ADR: brand/auth ADRs if the enum touches them — confirm.
- Memory: `explicit-push-authorization`, `next-build-catches-use-server`, `env-prod-overlay-and-prodsnap`.

#### 5. Dev environment confirmed

- Dev server: `cd apps/web && npx next dev --turbo` (FS-0002). DB: `ronindojo_prodsnap`. Dev-login user = Brian.

#### 6. FAILED_STEPS check

- Run a local **faithful `next build`** on the schema change before pushing (next-build catches what
  tsc/test miss). Prisma migrations: verify `migrate status` against prodsnap; realign drift with
  `migrate resolve --applied` if needed.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0449_TASK_00 | landed | PR #163 reviewed (SAFE-WITH-NOTES) → added `orderBy:{createdAt:asc}` determinism fix to `getOrganizationBySlug` (`921d88f8`, review note #1 closed) → CI green → **merged `1f0640b8`** → prod deploy SUCCESS → local `main` resynced 0/0. 2nd `role:admin` = stale test seed acct (`session-0207-…@test.local`), NOT Tony Hua (he's a User-less Passport) → folded into TASK_02. |
| SESSION_0449_TASK_01 | **LANDED + prod-verified** | Built `6219b687` → **PR #164** → CI all green (Vercel build PASSED) → **merged `ecf98ebc`** → **prod migration applied data-preserving** (column→`UserRole`, 4 user + 2 admin intact, both admins, not rolled back, `blackbeltlegacy.com` 200). `enum UserRole {user,admin,tournament_director}`, hand-authored migration `20260626000000` (in-place `USING` cast — Prisma's auto-diff would DROP+recreate→data loss), 12 test/seed/script/e2e-helper call-sites typed to `UserRole` (0 production app code). Better Auth COMPATIBLE. **DB REJECTS `'Admin'` typo** (the hardening, proven). |
| SESSION_0449_TASK_02 | resolved — no-op on prod | PROD dry-run (`SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod`) → **0 test-org candidates**; PROD has **0 `@test.local`/`session-` users**. The junk test orgs + test-admin exist ONLY in stale **prodsnap**, not real prod → nothing to delete. **PROD 2 admins = Brian + Tony Hua** (`tonyhua08@gmail.com`) — both legit (resolves the "2nd admin" 0448-authz concern; the prodsnap test-admin was a snapshot artifact). Bonus: prod role values = only `user`+`admin` → TASK_01 migration `USING` cast is safe on the prod merge. ⚠ prod Neon pw surfaced in a psql error → rotate at bow-out. (prodsnap is stale — refresh is a separate maintenance item.) |
| SESSION_0449_TASK_03 | **LANDED — merged #165 → prod** | `config/site.ts` `siteConfig.name`/`slug`→BBL; `repo-truth-index.md` §D destaled to single-brand collapse (ADR 0034); `score-forms.tsx` dropped `export` from `TKO_THRESHOLD`/`ESKRIMA_DEFAULT_ROUNDS` (0 external importers, used in-file). Reviewed SAFE-TO-MERGE; merged `2c2c677a`. |
| SESSION_0449_TASK_04 | landed | Independent review: #163 SAFE-WITH-NOTES; TASK_01 + TASK_03 both SAFE-TO-MERGE (0 BLOCKER/HIGH). One LOW (migration prod-drift fallback) mitigated by direct prod verification. |
| SESSION_0449_TASK_05 | landed | Full bow-out: SESSION doc filled, JETTY sweep, wiki:lint, graphify, memory sweep, Giddy/Doug/Desi hostile review (9.5/10). |
| SESSION_0449_TASK_06 | landed (post-close) | **Doc-coverage sweep** (operator-requested) — 4 Giddy doc-review + 3 Cody code-review subagents over the touched surfaces. Code: all 3 reviews CLEAN (1 MEDIUM = owner-email PII → TASK_07; 0 BLOCKER/HIGH). Docs (13 files, `c0aded09`, pushed to main): `auth.md` REWRITE + 2 mermaid diagrams (authz decision path + role write path); `schema-migration.md` String→enum `USING`-cast pattern banked; NEW `wiki/files/org-admin-access.md` (+ index registry); `organization-detail-page.md` brand-agnostic; `schema-prisma.md` enum 86→87; `repo-truth-index §E`; `custom-component-inventory`; 2 wiring SOPs (platform-admin gate); `security/{risk-register #11/#12, security-test-plan, README}`. wiki:lint 0 errors. |
| SESSION_0449_TASK_07 | LANDED (PR #166, awaiting merge go) | **Owner-email PII fix** (the TASK_06 MEDIUM, widened by #163's brand-agnostic resolution): dropped `owner.email` from the public `organizationDetailPayload` + render the Owner row only when `name` exists. tsc 0, oxlint 0; PR #166 (clean 2-file diff), CI running. |

## What landed

- **TASK_00 — PR #163 LANDED to prod.** Independent security review of the 0448 authz/public changes
  (`SAFE-WITH-NOTES`) → added a determinism fix (`orderBy:{createdAt:asc}` on `getOrganizationBySlug`,
  `921d88f8`, closing review note #1) → re-confirmed CI green → **merged `1f0640b8`** → prod deploy SUCCESS →
  resynced local `main`. Resolved the open decision: the prodsnap "2nd admin" looked like a test account,
  but **on prod the 2nd `role:admin` is Tony Hua** (legit) — the authz widening is fine.
- **TASK_01 — `User.role` String → `UserRole` enum, LANDED + PROD-VERIFIED (PR #164, `ecf98ebc`).** Typed the
  platform role so a `"Admin"`-style typo can't silently bypass an authz gate. `enum UserRole {user, admin,
  tournament_director}`; **hand-authored migration `20260626000000`** (Prisma's auto-diff DROPs+recreates the
  column → data loss; mine does an in-place `USING` cast). Prod migration applied cleanly: column now
  `UserRole`, **roles preserved (4 user + 2 admin), both admins intact, migration not rolled back, prod 200.**
  Better Auth `admin()` confirmed COMPATIBLE (typed-Prisma writes; the role editor bypasses BA via a
  zod-`enum`-guarded `db.user.update`). 12 test/seed/script/e2e-helper call-sites typed to `UserRole`; **zero
  production app code changed.** The DB now rejects an out-of-enum value (proven: `role='Admin'` → error).
- **TASK_02 — resolved as a NO-OP on prod.** The 3 junk test orgs + the test-admin the plan targeted exist
  **only in the stale prodsnap** (44/48 prodsnap users are `@test.local`); real prod has **0 test orgs, 0
  test users, 6 real users.** Nothing to delete. (prodsnap is stale — refresh is a separate maintenance item.)
- **TASK_03 — brand destales (PR #165, awaiting merge go).** `config/site.ts` `siteConfig.name`/`slug` →
  BBL; `repo-truth-index.md` §D destaled to the single-brand collapse (ADR 0034); `score-forms.tsx` 2
  unused *exports* un-exported (used in-file, not dead).
- **TASK_04 — independent review:** PR #163 (`SAFE-WITH-NOTES`), TASK_01 + TASK_03 (both `SAFE-TO-MERGE`,
  0 BLOCKER/HIGH). The one LOW (migration has no fallback if prod drifted from prodsnap) was mitigated by
  directly verifying prod's role values (only `user`+`admin`) before the merge.

### Post-close extension (TASK_06–07 — operator-requested doc + code coverage sweep)

- **TASK_06 — doc-coverage sweep (7 subagents: 4 Giddy doc-review + 3 Cody code-review).** Code came back
  CLEAN (the 3 reviews independently re-confirmed the enum + authz + brand changes; 0 BLOCKER/HIGH). The doc
  surfaces were materially stale — `auth.md` was ~14 months out of date and the **platform-admin-manages-all-orgs
  widening + the brand-agnostic public org resolution were documented nowhere outside code comments.** Landed a
  13-file doc batch (`c0aded09`, pushed to `main`): `auth.md` rewrite (4-axis role taxonomy + the 2 undocumented
  authz changes + single-brand banners + 2 mermaid diagrams), the String→enum migration pattern banked in
  `schema-migration.md`, a NEW `org-admin-access.md` file-page, + 9 others (incl. `security/*` risk rows #11/#12).
- **TASK_07 — owner-email PII fix (the one real code finding from TASK_06, MEDIUM).** The public
  `/organizations/[slug]` page could render an owner's email (`organizationDetailPayload` added `owner.email`;
  the Owner row rendered `name ?? email`) — widened by #163's brand-agnostic resolution (3 BASELINE orgs now
  resolve publicly). Dropped `owner.email` from the public payload + hide the Owner row when name is null.
  **PR #166** (clean 2-file diff, tsc/oxlint 0, CI running) — awaiting merge go.

## Decisions resolved

- **Land #163 via PR + add the orderBy fix first** (operator) — done, merged `1f0640b8`.
- **2nd prod admin = Tony Hua, intended** (operator confirmed via the data) — the 0448 `role==="admin"`
  all-org-write widening is correct; the prodsnap "test admin" was a stale-snapshot artifact, not prod.
- **`UserRole` enum, NOT a union+CHECK fallback** (Phase-A gate GREEN — Better Auth COMPATIBLE).
- **`lineage_tree_admin` stays OUT of the enum** (synthetic UI label, never stored); `tournament_director`
  stays IN (role editor can write it).
- **TASK_03 lands via its own PR (#165) after #164** (operator).
- **TASK_02 = no-op** — prod is already clean; no delete needed.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/organization/queries.ts` | TASK_00 — `getOrganizationBySlug` `orderBy:{createdAt:asc}` determinism fix (on #163 branch) |
| `apps/web/prisma/schema.prisma` | TASK_01 — `enum UserRole {user,admin,tournament_director}`; `role` → `UserRole @default(user)` |
| `apps/web/prisma/migrations/20260626000000_user_role_enum/migration.sql` | TASK_01 — hand-authored in-place `USING` cast (data-preserving) |
| `apps/web/e2e/helpers/{auth-db,seed-lineage-comp-fixture-db,seed-lineage-lifecycle-db}.ts` | TASK_01 — `role` param → `UserRole` |
| `apps/web/prisma/seed.ts`, `scripts/{smoke-attendance,send-bbl-truelson-thankyou}.ts` | TASK_01 — `role` typed `UserRole`; one `role:{contains}` → `role:"admin"` |
| `apps/web/server/{admin/entitlements,admin/lineage,entitlements,invites}/*.test.ts` (4) | TASK_01 — test `createUser` `role` param → `UserRole` |
| `apps/web/config/site.ts` | TASK_03 — `siteConfig.name`/`slug` → Black Belt Legacy |
| `apps/web/app/app/tournaments/_components/score-forms.tsx` | TASK_03 — drop `export` from `TKO_THRESHOLD`/`ESKRIMA_DEFAULT_ROUNDS` |
| `docs/knowledge/wiki/repo-truth-index.md` | TASK_03 — §D Brand truth destaled to single-brand collapse |
| `docs/sprints/SESSION_0449.md` | this session record |

## Verification

| Command / smoke | Result |
| --- | --- |
| Independent security review (subagent) of #163 `258debba` | SAFE-WITH-NOTES — no escalation; 2 tracked notes (orderBy added; visibility gate = Stage-2) |
| PR #163 CI + merge | all green; merged `1f0640b8`; prod deploy SUCCESS |
| TASK_01 `prisma migrate deploy` (prodsnap) | applied; data preserved (46 user + 2 admin); `pg_typeof(role)`=`UserRole` |
| TASK_01 `tsc --noEmit` / `oxlint` / `oxfmt` | 0 errors / 0 / clean (after 12 call-site repoints) |
| TASK_01 runtime auth (dev-login + curl) | `/app`, `/app/users` 200 (Better Auth reads enum, `isAdmin` gates); rolled-back write of `tournament_director` OK; **`role='Admin'` REJECTED** by the enum |
| **PR #164 CI** (tsc/unit/oxc/playwright ×3/Vercel) | **all green**; Vercel build PASSED (faithful-build proof) |
| **PROD migration (post-merge `ecf98ebc`)** | `_prisma_migrations` = **applied**, not rolled back; column → `UserRole`; **roles preserved (4 user + 2 admin)**; both admins intact; `blackbeltlegacy.com` → 200 |
| TASK_02 prod dry-run + queries | 0 test-org candidates; 0 `@test.local` prod users; prod 6 users all real |
| TASK_03 `tsc` / `oxlint` / `wiki:lint` | 0 / 0 / 0 errors (16 wiki warns all pre-existing, untouched files) |
| TASK_04 review of TASK_01 + TASK_03 | both SAFE-TO-MERGE, 0 BLOCKER/HIGH |

## Open decisions / blockers

- **PR #165 (TASK_03)** — ✅ merged → prod (`2c2c677a`).
- **PR #166 (TASK_07 owner-email PII fix)** — open, CI running; awaiting operator merge go (deploys the public org-page change).
- **🔐 Rotate the prod Neon password** — it surfaced in a psql connection error in this session's transcript.
  (Consistent with prior R2/Neon rotations.) Not blocking; do at convenience.
- **prodsnap is stale** — 44/48 users are test data; it lacks Tony Hua's admin account + has test orgs prod
  doesn't. A prodsnap refresh would realign local dev with prod (separate maintenance item, not urgent).

## Next session

### Goal

Candidate: the **gated Stage-2 brand schema drop** — its own PR, prod migration. Drop the `brand` column
(~42 models) + the `Brand` enum + ~484 `Brand.BBL` literals. Decision gates first (per
`[[brand-vestige-trim-inventory]]`): BASELINE comp-fixture fate (a blind `BASELINE→BBL` grep-replace breaks
it), confirm no live non-BBL prod rows. **KEEP-FOREVER:** `resolveBrand`/`BRAND_TRUSTED_ORIGINS` (the
host→brand security gate, MB-002). The `UserRole` migration is now a banked template for the in-place
`USING`-cast pattern.

### First task

Confirm PR #165 merged + resync `main`; then gate-review the Stage-2 brand drop (comp-fixture + prod-row
audit) before writing the migration. Optionally first: refresh prodsnap from prod so local dev matches.

### Inputs to read

- `[[brand-vestige-trim-inventory]]` (Stage-2 gates + KEEP-FOREVER), this file, `lib/brand-context.ts`
  (the security gate to keep), `prisma/schema.prisma` (the ~42 `brand` columns + `Brand` enum).

## Review log

### SESSION_0449_REVIEW_01 — UserRole enum (TASK_01) + brand destales (TASK_03)

- **Reviewed:** TASK_01 (`6219b687`) + TASK_03 (`9aaa1a02`/`42908bd1`) via an independent subagent.
- **Verdict:** both **SAFE-TO-MERGE**, 0 BLOCKER/HIGH. TASK_01: migration ordering/data-preservation
  correct, enum value-set matches the zod `z.enum`, no missed call-sites, no production path changed,
  `lineage_tree_admin`/`guest` correctly excluded. TASK_03: `siteConfig` consumers are cosmetic/static
  fallbacks (improvement, not regression), score-forms exports have 0 importers, ADR-0034 link valid.
- **One LOW (TASK_01):** the migration `USING` cast has no fallback if prod drifted from prodsnap →
  **mitigated** by directly querying prod (only `user`+`admin`) before the merge; prod migration then
  applied cleanly with data preserved.
- **PR #163 (TASK_00)** was separately reviewed SAFE-WITH-NOTES (authz widening consistent with the
  established platform-admin contract; note #1 closed with the orderBy fix; note #2 = Stage-2 visibility gate).

## Hostile close review

- **Giddy:** **pass** — operator-gated at every prod-affecting step (each merge + the TASK_03 vehicle chosen
  via AskUserQuestion; explicit-push rule honored). The schema migration went via PR with full CI + a Vercel
  preview before the prod merge. The prodsnap-vs-prod discrepancy was surfaced and corrected (Tony Hua), not
  hidden. The credential exposure is flagged for rotation, not buried.
- **Doug:** **pass** — TASK_01 proven on five legs: migration is data-preserving (in-place `USING` cast,
  verified 46+2 on prodsnap AND 4+2 on prod, both admins intact, migration not rolled back); tsc/oxlint/oxfmt
  0; PR #164 full CI green incl. the Vercel faithful build; runtime auth verified (read gate + write +
  **negative test**: `role='Admin'` rejected by the DB); prod post-deploy column type + data re-confirmed.
  No production app code changed (claim verified by the reviewer). TASK_03 tsc/oxlint/wiki-lint clean.
- **Desi:** **pass (light — minimal UI surface)** — TASK_03 `siteConfig.name`→BBL only changes the RSS-feed
  title + static metadata fallback toward the correct brand (improvement); slug consumers are cosmetic; no
  visual regression. No new UI built.
- **Kaizen aggregate:** 9.5/10 (½ off: the initial prodsnap-based "2nd admin is a test account" claim was
  corrected only after querying prod — verify against prod, not the snapshot, for prod-affecting authz claims).

## ADR / ubiquitous-language check

- **No new ADR required.** TASK_01 is a type-hardening of an existing field, not a new architectural decision;
  it implements the authz-safety the SESSION_0448 org-settings fix exposed. The role taxonomy
  (`User.role` platform enum `{user, admin, tournament_director}` vs org-scoped `Role`/`ORG_ADMIN` membership
  vs the synthetic `lineage_tree_admin`/`guest` UI labels) is documented in the migration comment + the
  schema enum comment. TASK_03 §D destale brings `repo-truth-index` in line with the already-ratified ADR 0034.
- **Ubiquitous language:** no new domain terms (reused: platform role, authz gate, single-brand collapse,
  vestige, host→brand security gate).

## Reflections

- **Verify prod-affecting claims against PROD, not prodsnap.** The whole "2nd admin is a stale test account"
  scare was a prodsnap artifact — the snapshot is 44/48 test data and predates Tony Hua's admin account. One
  read-only prod query turned a flagged security concern into "it's Tony Hua, intended." For anything that
  ships to prod (authz, migrations, data claims), the snapshot is a convenience, not the truth. (Same root
  cause as TASK_02 being a no-op.)
- **Prisma's String→enum auto-diff is a data-loss trap.** `prisma migrate dev` wanted to DROP+recreate the
  `role` column (resetting every admin to `user`). The fix — hand-author the migration with an in-place
  `ALTER COLUMN ... TYPE ... USING (col::"Enum")` cast — is the banked pattern for every future enum
  hardening (the Stage-2 brand drop will want it too). `--create-only` is blocked non-interactively when a
  data-loss warning fires, so create the migration dir + SQL by hand and `migrate deploy`.
- **The DB enum is the actual hardening; the call sites barely move.** Because `isAdmin` already compared
  against valid literals, zero production code changed — the value of the change is entirely at the column:
  `role='Admin'` is now rejected by Postgres. tsc only flagged loosely-typed `string` role params in
  test/seed/script files. The hardening's worth is the negative test, not the diff size.
- **One shared working tree + one DB across two branches is the friction.** TASK_01's `prisma generate` +
  prodsnap migration left the generated client out of sync with the TASK_03 branch's (pre-enum) schema,
  producing phantom tsc errors. Regenerating from the branch's own schema (gitignored `.generated`) gave a
  clean local check; CI regenerates per-branch so it was never a real issue. Lesson: when isolating an
  unrelated change on a sibling branch mid-schema-work, regenerate the client to match that branch before
  trusting local tsc.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | touched code = inline-commented; `repo-truth-index.md` §D updated + frontmatter `updated`/`last_agent` bumped; SESSION_0449 frontmatter `status: closed`, `last_agent: claude-session-0449` |
| Backlinks/index sweep | wiki `index.md` SESSION_0449 row added; SESSION pairs_with → SESSION_0448; repo-truth-index links to ADR 0034 (exists) |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 16 warnings (all pre-existing R8 in untouched `SESSION_VIDEO_R001`/`petey-plan-0436`) |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | SESSION_0449_REVIEW_01 + Giddy/Doug/Desi above (9.5/10) |
| Review & Recommend | yes — Next session = gated Stage-2 brand schema drop |
| Memory sweep | updated `[[brand-vestige-trim-inventory]]` (destales done; Stage-2 next) + `[[admin-retiring-only-app-remains]]`; new `[[userrole-enum-and-prodsnap-stale]]` (enum migration template + prodsnap-vs-prod lesson + Tony Hua) |
| Next session unblock check | unblocked — Stage-2 gates are doable; PR #165 merge is operator-gated |
| Git hygiene | branch `main`; PRs #163/#164 merged; #165 open; docs commit reported at bow-out — see git log |
| Graphify update | `graphify update .` before the close commit — Nodes 80 · Edges 1370 · Communities 2078 |
| Pre-push cost gate | TASK_01 = PR #164 Vercel build PASSED (faithful build via CI); prod deploy SUCCESS + migration verified; docs push = free (paths-ignored, no deploy) |
