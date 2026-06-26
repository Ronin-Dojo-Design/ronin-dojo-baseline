---
title: "SESSION 0449 — land PR #163 + UserRole enum hardening + test-org cleanup + brand destales"
slug: session-0449
type: session--implement
status: in-progress
created: 2026-06-25
updated: 2026-06-25
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

2026-06-25 (pre-staged)

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
| SESSION_0449_TASK_00 | pending | TBD |
| SESSION_0449_TASK_01 | pending | TBD |
| SESSION_0449_TASK_02 | pending | TBD |
| SESSION_0449_TASK_03 | pending | TBD |
| SESSION_0449_TASK_04 | pending | TBD |
| SESSION_0449_TASK_05 | pending | TBD |

## What landed

<!-- filled at bow-out -->

## Decisions resolved

<!-- filled at bow-out -->

## Files touched

| File | Change |
| --- | --- |
| `<path>` | <one-line change> |

## Verification

| Command / smoke | Result |
| --- | --- |
| `<command>` | <result> |

## Open decisions / blockers

<!-- filled at bow-out -->

## Next session

### Goal

TBD at bow-out (candidate: the gated Stage-2 brand schema drop — its own PR).

### First task

TBD at bow-out.

## Review log

<!-- filled at bow-out -->

## Hostile close review

- **Giddy:** <pass/fail>
- **Doug:** <pass/fail>
- **Desi:** <pass/fail — only when UI/UX touched>
- **Kaizen aggregate:** <N/10>

## ADR / ubiquitous-language check

<!-- UserRole enum may warrant a one-line ADR/glossary note (role taxonomy: platform user.role vs org Role). -->

## Reflections

<!-- filled at bow-out -->

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | <evidence> |
| Backlinks/index sweep | <evidence> |
| Wiki lint | <result> |
| Kaizen reflection | <evidence> |
| Hostile close review | <ref> |
| Review & Recommend | <next session goal> |
| Memory sweep | <evidence> |
| Next session unblock check | <evidence> |
| Git hygiene | <commit hash> |
| Graphify update | <stats> |
| Pre-push cost gate | <faithful build result> |
