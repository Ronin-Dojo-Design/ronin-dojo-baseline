---
title: "SESSION 0274 — Production lineage seed and admin smoke"
slug: session-0274
type: session--open
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: codex-session-0274
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0273.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0274 — Production lineage seed and admin smoke

## Date

2026-05-28

## Operator

Brian + codex-session-0274 (Petey orchestrating; Cody execution; Doug/Giddy/Desi review)

## Goal

Finish BBL-LINEAGE-001 in production by running the baseline lineage seed against the production database, then smoke-test authenticated admin lineage claimability as a global admin and as a `TREE_ADMIN`.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database production seed path, Vercel/Neon production env handling, Better Auth admin access, admin route smoke. |
| Extension or replacement | Extension. Use existing Prisma seed/service patterns and existing admin/tree-admin access checks; do not invent a new data-import path unless production env access remains blocked. |
| Why justified | BBL-LINEAGE-001 is locally proven but production-incomplete until `rigan-machado-bjj-lineage` exists in production and renders on the public routes. |
| Risk if bypassed | Public BBL lineage remains absent in production, and the new admin claimability controls remain unproven for real authenticated sessions. |

## Graphify check

- Graph status: current enough for bow-in planning; `graphify stats` returned 7,280 nodes, 11,998 edges, 1,022 communities, 1,405 tracked files at local `HEAD` `7582c8c`.
- Queries used:
  - `graphify query "opening.md ritual bow-in" --depth 2 --budget 3000`
  - `graphify query "closing.md ritual bow out full-close optional steps" --depth 2 --budget 3000`
  - `graphify query "graphify-repo-memory.md graphify queries CLI commands" --depth 2 --budget 3000`
  - `graphify query "petey-plan.md Petey orchestrates handoffs agents personas" --depth 2 --budget 3000`
  - `graphify query "BBL-LINEAGE-001 baseline lineage production admin claimability TREE_ADMIN" --depth 2 --budget 3000`
  - `graphify query "lineage seed baseline admin lineage actions TREE_ADMIN claimability" --depth 2 --budget 3000`
  - `graphify query "production direct database URL seed-baseline-lineage Vercel Neon Prisma" --depth 2 --budget 3000`
- Files selected from graph:
  - `docs/rituals/opening.md`
  - `docs/runbooks/graphify-repo-memory.md`
  - `docs/protocols/petey-plan.md`
  - `docs/agents/petey.md`
  - `docs/rituals/closing.md`
  - `docs/runbooks/database.md`
  - `docs/runbooks/neon-advisory-lock-recovery.md`
  - `apps/web/server/admin/lineage/queries.ts`
  - `apps/web/components/admin/auth-hoc.tsx`
- Verification note: Exact source reads confirmed the seed is idempotent and the admin lineage read/action paths allow global admins or active `LineageTreeAccess.role = TREE_ADMIN`.

## Petey grill

- Are we allowed to mutate production? Yes, the handoff explicitly asks for production seed completion, but only through an idempotent seed and without exposing secrets.
- Is the seed safe to re-run? Mostly yes. It uses `findFirst`/`findUnique` checks before creates, and tree/member uniqueness guards make re-runs no-op for existing rows.
- What is the actual blocker? A usable decrypted production database URL, preferably the Neon direct URL. SESSION_0273 says Vercel env pull/run did not expose one.
- Should we widen scope if production DB access is still blocked? No. Record the blocker, complete any non-mutating production/admin route checks possible, and stop short of fake success.
- What proves BBL-LINEAGE-001 is production-complete? Production `/lineage` returns 200, production `/lineage/rigan-machado-bjj-lineage` returns 200, and the seed output confirms the Rigan tree/member rows exist or were created.
- What proves admin claimability? A real authenticated global admin can reach `/admin/lineage` and lineage detail; a real or seeded `TREE_ADMIN` user can reach only the permitted lineage admin surface and exercise/read claimability controls.

## Petey plan

### Goal

Complete the production lineage data proof, then run the smallest credible authenticated admin lineage smoke.

### Tasks

#### SESSION_0274_TASK_01 — Resolve production DB seed path

- **Agent:** Petey + Giddy
- **What:** Establish a usable production direct database URL without printing secrets.
- **Steps:**
  1. Check Vercel project/env access and relevant CLI syntax.
  2. Prefer `DIRECT_URL`/Neon direct endpoint; only use `DATABASE_URL` if it is confirmed usable and not a migration lock risk.
  3. Validate presence only, never echo secret values.
  4. If Vercel cannot expose a usable URL, keep the session blocked and document the exact failure.
- **Done means:** A command path exists that can run the seed with production DB env, or the blocker is confirmed with evidence.
- **Depends on:** nothing.

#### SESSION_0274_TASK_02 — Run production seed and public route smoke

- **Agent:** Cody + Doug
- **What:** Run `apps/web/prisma/seed-baseline-lineage.ts` against production and verify public lineage routes.
- **Steps:**
  1. Run the seed using the resolved production DB URL/env.
  2. Capture counts only; redact any connection data.
  3. Verify `https://baselinemartialarts.com/lineage`.
  4. Verify `https://baselinemartialarts.com/lineage/rigan-machado-bjj-lineage`.
  5. Update `GAP_MATRIX.md` if production proof succeeds.
- **Done means:** Production index and Rigan detail routes both return 200 after seed.
- **Depends on:** SESSION_0274_TASK_01.

#### SESSION_0274_TASK_03 — Authenticated admin and TREE_ADMIN smoke

- **Agent:** Cody + Desi/Doug
- **What:** Smoke-test `/admin/lineage` as a global admin and as an active lineage `TREE_ADMIN`.
- **Steps:**
  1. Identify available authenticated browser/session path.
  2. Verify admin list/detail render and claimability controls are visible.
  3. Verify `TREE_ADMIN` access path and nav/command filtering using an existing or safely granted test user.
  4. Record evidence and remaining blockers.
- **Done means:** Authenticated admin and `TREE_ADMIN` lineage access are either proven or blocked with the missing credential/user stated.
- **Depends on:** SESSION_0274_TASK_02.

#### SESSION_0274_TASK_04 — Production nav regression and users affordance

- **Agent:** Cody + Doug
- **What:** Fix the logged-in avatar menu crash and add the missing users-page add/invite affordance.
- **Steps:**
  1. Trace the production Base UI error from the avatar dropdown.
  2. Patch the menu composition to satisfy Base UI grouping requirements.
  3. Add a primary `/admin/users` CTA to the existing invite flow.
  4. Run focused formatting/type/build checks.
- **Done means:** The avatar dropdown no longer uses a `Menu.GroupLabel` outside `Menu.Group`, and `/admin/users` exposes a primary `Invite user` action.
- **Depends on:** nothing.

### Parallelism

The main thread owns production DB access and any production mutation. Explorer subagents run read-only sidecars for Vercel/Neon command safety and admin smoke mechanics. The production nav regression is disjoint from the DB blocker and can be fixed immediately.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0274_TASK_01 | Petey + Giddy | Production env/secrets handling and sequencing risk. |
| SESSION_0274_TASK_02 | Cody + Doug | Seed execution plus route proof. |
| SESSION_0274_TASK_03 | Cody + Desi/Doug | Authenticated UI smoke plus QA/UX sanity. |
| SESSION_0274_TASK_04 | Cody + Doug | Production navigation regression plus obvious users admin affordance. |

### Open decisions

- None if a usable production direct DB URL is available through local/Vercel/Neon tooling.
- Blocked on user/operator if no local tool can access a decrypted production direct DB URL or authenticated production admin session.

### Risks

- Vercel CLI may still withhold decrypted production env values locally.
- Production seed could fail if the production schema is behind the new lineage claimability migration.
- Authenticated admin smoke may require browser credentials or a production test user not present in local context.

### Scope guard

Do not add new lineage features. This session is production data proof plus admin smoke only.

### Dirstarter implementation template

- **Docs read first:** Local Dirstarter-derived runbooks for Prisma/database, Vercel/Neon, auth/admin access; live docs re-check if code changes touch Dirstarter-owned layers.
- **Baseline pattern to extend:** `apps/web/prisma/seed-baseline-lineage.ts`, `apps/web/services/db.ts`, `apps/web/server/admin/lineage/*`, `components/admin/auth-hoc.tsx`.
- **Custom delta:** Martial-arts lineage seed data and claimability smoke for BBL.
- **No-bypass proof:** Use existing seed/action/admin route contracts; avoid new production mutation scripts unless the existing route is impossible.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0274_TASK_01 | Petey + Giddy | blocked | Vercel lists production DB env names but injects/pulls no decrypted values locally; use operator-supplied Neon direct URL. |
| SESSION_0274_TASK_02 | Cody + Doug | blocked | Waits for production direct DB URL seed run. |
| SESSION_0274_TASK_03 | Cody + Desi/Doug | blocked | Waits for production seed plus authenticated admin/TREE_ADMIN session path. |
| SESSION_0274_TASK_04 | Cody + Doug | complete | Fixed avatar dropdown Base UI grouping regression and added users-page invite CTA. |

## What landed

- Confirmed production Vercel env access still cannot provide a usable decrypted production DB URL in this agent environment.
- Confirmed production `/lineage` renders while `/lineage/rigan-machado-bjj-lineage` remains 404 because production is still unseeded.
- Fixed logged-in avatar menu crash:
  - Base UI production error code 31 maps to `MenuGroupContext is missing`.
  - `DropdownMenuLabel` renders a Base UI `Menu.GroupLabel`, so the user menu now wraps it in `DropdownMenuGroup`.
- Added `/admin/users` primary `Invite user` CTA linking to `/admin/invites/new`, matching the existing invite-based user-add flow.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0274.md` | Created current session ledger and Petey plan. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0274 row and bumped `last_agent`. |
| `apps/web/components/web/user-menu.tsx` | Wrapped the avatar menu label in `DropdownMenuGroup` to satisfy Base UI menu context requirements. |
| `apps/web/app/admin/users/_components/users-table.tsx` | Added primary `Invite user` CTA to `/admin/users`, linking to `/admin/invites/new`. |

## Decisions resolved

- Vercel CLI can list `DATABASE_URL` and `DIRECT_URL` names in Production, but `vercel env run -e production` does not inject either value.
- `vercel env pull /tmp/ronin-prod.env --environment=production --yes` creates the expected keys, but `DATABASE_URL` and `DIRECT_URL` values are empty. Treat these as sensitive/write-only Vercel env vars for local-agent purposes.
- No local `neon` CLI or `psql` binary is available as an alternate direct production DB path.
- Production seed must be run with the Neon direct Postgres URL supplied out-of-band by the operator, mapped to `DATABASE_URL` for `seed-baseline-lineage.ts`.
- Users are currently added through the invite flow (`/admin/invites/new`), not direct raw user creation on `/admin/users`.

## Open decisions / blockers

- **Production seed remains blocked:** Vercel exposes env names but not decrypted values locally, and no local Neon CLI/`psql` path exists.
- **Authenticated admin smoke remains blocked:** no production browser credentials/session are available in this agent context.
- **TREE_ADMIN smoke remains blocked:** no known production non-admin user with active `LineageTreeAccess.role = TREE_ADMIN`; creating one requires the same production DB access or a production admin UI path.

## Verification

| Command / check | Result |
| --- | --- |
| `graphify stats` | 7,280 nodes, 11,998 edges, 1,022 communities, 1,405 files tracked. |
| `git branch --show-current` | `main`. |
| `git status --short` before session file | Clean. |
| `git pull --ff-only` | Already up to date. |
| `vercel env list production` | Production env names include `DATABASE_URL` and `DIRECT_URL`; values are encrypted and not printed. |
| `vercel env run -e production -- node -e ...` | `VERCEL_ENV=present`, `DATABASE_URL=missing`, `DIRECT_URL=missing`. |
| `vercel env pull /tmp/ronin-prod.env --environment=production --yes` | File created; `DATABASE_URL` and `DIRECT_URL` keys present but values empty. |
| `command -v neon && neon --version` | No local Neon CLI found. |
| `command -v psql && psql --version` | No local `psql` found. |
| `curl -L https://baselinemartialarts.com/lineage` | `200`, 165,442 bytes. |
| `curl -L https://baselinemartialarts.com/lineage/rigan-machado-bjj-lineage` | `404`, 114,861 bytes; Rigan tree still absent in production. |
| `curl -I https://baselinemartialarts.com/admin/lineage` | `307` to `/auth/login?next=/admin/lineage`; route/auth gate registered unauthenticated. |
| `cd apps/web && bunx biome check components/web/user-menu.tsx app/admin/users/_components/users-table.tsx` | Passed; 2 files checked, no fixes applied. |
| `pnpm --filter @ronin-dojo/web typecheck` | Passed after avatar/users changes. |
| `pnpm --filter @ronin-dojo/web build` | Passed. Existing Turbopack/NFT warning remains in storage monitoring import trace. |
| `git diff --check` | Passed. |
| `bun run wiki:lint` | Failed with existing repo-wide debt: 232 broken-link errors and 598 warnings. |
| `git worktree list` | Only active worktree: `/Users/brianscott/dev/ronin-dojo-app [main]`. |

## Subagent notes

- **Giddy/Doug production DB path:** Recommended Neon direct URL supplied by operator, not Vercel CLI. Seed reads `process.env.DATABASE_URL`, so paste Neon `DIRECT_URL` into `DATABASE_URL` for the one command. Vercel CLI env paths are not usable here because values are missing/empty.
- **Doug/Desi admin smoke path:** Manual production browser login is required. Global admin can smoke `/admin/lineage`; `TREE_ADMIN` smoke needs a real non-admin production user with active `LineageTreeAccess.role = TREE_ADMIN` and `revokedAt = null`. Existing local e2e helpers are not production-safe.

## Review log

### SESSION_0274 - Production seed blocker and nav regression

#### Review

**SESSION_0274_REVIEW_01 - close review**

- **Reviewed tasks:** SESSION_0274_TASK_01, SESSION_0274_TASK_02, SESSION_0274_TASK_03, SESSION_0274_TASK_04
- **Dirstarter docs check:** no live Dirstarter docs needed for the code patch; the implementation extended existing Base UI/Dirstarter-derived primitives and admin table patterns.
- **Verdict:** The production seed remains honestly blocked on a usable Neon direct URL. The production avatar menu regression was traced to Base UI menu grouping and fixed. The users page now exposes the existing invite-based user-add flow.

#### Findings

**SESSION_0274_FINDING_01 - production seed remains blocked**

- **Severity:** medium
- **Task:** SESSION_0274_TASK_01, SESSION_0274_TASK_02
- **Evidence:** `vercel env run -e production` injected `VERCEL_ENV` but not `DATABASE_URL` or `DIRECT_URL`; `vercel env pull` produced empty DB values; no local Neon CLI/`psql` exists.
- **Impact:** BBL-LINEAGE-001 remains production-incomplete and `rigan-machado-bjj-lineage` still 404s.
- **Required follow-up:** Operator runs the seed with the Neon direct URL mapped to `DATABASE_URL`, then route smoke can complete.
- **Status:** open

**SESSION_0274_FINDING_02 - authenticated admin/TREE_ADMIN smoke remains blocked**

- **Severity:** low
- **Task:** SESSION_0274_TASK_03
- **Evidence:** Brian manually confirmed direct `/admin/lineage` works as admin, but no agent-available authenticated browser/session or TREE_ADMIN production user exists.
- **Impact:** Admin lineage route reachability is confirmed by operator, but role-specific smoke still needs production credentials/user setup.
- **Required follow-up:** Use a logged-in production admin browser session and a non-admin user with active `TREE_ADMIN` grant.
- **Status:** open

**SESSION_0274_FINDING_03 - admin parity gap remains for lineage/memberships**

- **Severity:** low
- **Task:** SESSION_0274_TASK_04
- **Evidence:** `/admin/users` now has an invite CTA. `/admin/lineage` remains intentionally minimal until seeded data exists; `/admin/memberships` still lacks a create CTA by design gap.
- **Impact:** Admin parity is improved for users but not finished across lineage/memberships.
- **Required follow-up:** Dedicated admin parity polish pass after production lineage data exists.
- **Status:** open

## Hostile close review

### SESSION_0274 - Production seed blocker and nav regression

#### Review

- **Plan sanity:** Correctly kept production mutation gated on a direct DB URL and did not pretend Vercel env access was sufficient. Pivoting to the avatar regression was justified because it blocked normal navigation in production.
- **Dirstarter compliance:** The patch extends current Base UI menu composition and DataTable header CTA patterns. No new primitive or route convention was invented.
- **Security:** No secrets were printed. `/tmp/ronin-prod.env` was removed. The recommended production seed command keeps the URL in a hidden terminal variable and unsets it afterward.
- **Data integrity:** No production mutation was run by the agent. The seed remains idempotent but still requires operator-supplied DB access.
- **Lifecycle proof:** Avatar menu crash should be fixed after deploy; `/admin/users` now points users to the existing invite creation flow. Production lineage data lifecycle remains blocked.
- **Verification honesty:** Focused Biome, typecheck, build, diff check, production unauthenticated route checks, and wiki lint were run. Wiki lint remains globally failing with pre-existing docs debt.
- **Workflow honesty:** SESSION_0274 records task IDs, Graphify-first discovery, subagent handoffs, blockers, and close review.
- **Merge readiness:** Ready to merge/push the UI regression fix and users CTA. Not ready to mark BBL-LINEAGE-001 production-complete.

#### Kaizen

- Vercel env names being visible is not proof of local secret availability. Treat empty pulled values as a blocker, not a parser issue.
- The Base UI menu wrapper should make context-sensitive parts hard to misuse, or call sites need a lintable pattern. A future primitive hardening pass could make `DropdownMenuLabel` render non-contextual markup or provide a separate `DropdownMenuGroupLabel`.

## ADR / ubiquitous-language check

- No ADR required. This session did not change architecture; it fixed a Base UI composition regression and documented a production access blocker.
- No ubiquitous-language update required. No new domain terms were introduced.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated `SESSION_0274.md` frontmatter status/date/last_agent; bumped `docs/knowledge/wiki/index.md` `last_agent` and added the current session row. |
| Backlinks/index sweep | `SESSION_0274.md` pairs with `SESSION_0273.md`; wiki index includes SESSION_0274. No new standalone wiki pages created. |
| Wiki lint | `bun run wiki:lint` failed with existing repo-wide debt: 232 errors / 598 warnings. This session did not introduce the archive/index debt. |
| Kaizen reflection | Hostile close review includes Kaizen notes. |
| Hostile close review | `SESSION_0274_REVIEW_01` and hostile close review recorded. |
| Review & Recommend | Next session goal written below; first task remains blocked until operator supplies/runs Neon direct DB seed. |
| Memory sweep | No cross-session memory update needed beyond SESSION_0274 and final response command. |
| Next session unblock check | Blocked on operator running seed with Neon direct URL; admin parity can proceed separately after deploy. |
| Git hygiene | Branch `main`; only active worktree is repo root; diff check passed; commit/push to run after this session update. |
| Graphify update | To run after git commit/push per closing ritual and user request. |

## Reflections

- The production seed blocker and the avatar menu crash were independent. Keeping them separate let us ship a navigation fix without muddying the production data proof.
- Base UI production error codes are terse, but local package source mapped code 31 directly to `MenuGroupContext is missing`; that made the fix small and defensible.
- `/admin/users` should direct operators to invites because raw user creation is not the active product flow.

## Next session

- **Goal:** SESSION_0275 — Run production lineage seed with the Neon direct URL, verify BBL-LINEAGE-001, then complete authenticated admin/TREE_ADMIN smoke.
- **Inputs to read:** `docs/sprints/SESSION_0274.md`, `docs/product/black-belt-legacy/GAP_MATRIX.md`, `apps/web/prisma/seed-baseline-lineage.ts`, `apps/web/server/admin/lineage/queries.ts`, `apps/web/server/admin/lineage/actions.ts`, `apps/web/app/admin/lineage/page.tsx`, `apps/web/app/admin/lineage/[treeId]/page.tsx`.
- **First task:** BLOCKED ON USER/OPERATOR — in a local terminal, paste the Neon non-pooling/direct production Postgres URL into a hidden prompt and run:

  ```zsh
  cd /Users/brianscott/dev/ronin-dojo-app
  set +x
  read -r -s "DATABASE_URL?Paste Neon production DIRECT_URL: "
  echo
  DATABASE_URL="$DATABASE_URL" bun run apps/web/prisma/seed-baseline-lineage.ts
  unset DATABASE_URL
  ```

  Then verify production `/lineage` and `/lineage/rigan-machado-bjj-lineage`, and smoke `/admin/lineage` as global admin plus a non-admin `TREE_ADMIN`.

## Status

closed
