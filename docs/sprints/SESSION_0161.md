---
title: "SESSION 0161 — Production Deploy Verification + Optional Env Var Hygiene"
slug: session-0161
type: session--open
status: in-progress
created: 2026-05-13
updated: 2026-05-13
last_agent: codex-session-0161
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0160.md
  - docs/sprints/SESSION_0159.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/architecture/infrastructure/dns-verification-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0161 — Production Deploy Verification + Optional Env Var Hygiene

## Date

2026-05-13

## Operator

Brian Scott + Claude/Codex (Cody)

## Goal

Land the `baselinemartialarts.com` production deploy end-to-end: peel remaining build-pipeline failure layers, verify Let's Encrypt cert issues, confirm `curl -I https://baselinemartialarts.com` returns HTTP 200 + `Server: Vercel`, add `www.baselinemartialarts.com` to the Vercel project Domains, and refresh stale `docs/architecture/infrastructure/dns-verification-spec.md` (per SESSION_0159_FINDING_01).

## Graphify Check

- Graph status: usable. Post-SESSION_0160 graphify stats: 5,786 nodes / 10,800 edges / 659 communities / 1,170 files tracked.
- No cross-domain discovery needed for TASK_01 — known file path (`apps/web/prisma.config.ts`).

## Petey Plan

### Tasks

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0161_TASK_01 | Path B fix for SHADOW_DATABASE_URL strict-validation failure: conditional-spread the `shadowDatabaseUrl` field in `apps/web/prisma.config.ts` so it's only set when `SHADOW_DATABASE_URL` env var exists. Unblocks Vercel postinstall after SESSION_0160's deploy attempt failed on this var. | in progress |
| SESSION_0161_TASK_02 | After TASK_01 push triggers redeploy, watch build log for next failure layer (likely env var validation in `next build` via `apps/web/env.ts` schema). Surface and resolve. | ✅ done — actual next failure was not env validation but **phantom dependencies**: `@radix-ui/react-accordion`, `debounce`, `embla-carousel` were imported in `apps/web/` source but not declared in `apps/web/package.json`. They resolved locally via pnpm symlinks from transitive deps, but Vercel's `--frozen-lockfile` install with strict isolation couldn't follow that. Added all three with `pnpm add --filter dirstarter`. Full repo audit confirms zero remaining phantom deps. |
| SESSION_0161_TASK_03 | On successful deploy: `curl -sI https://baselinemartialarts.com` → expect HTTP 200 + valid TLS cert + `Server: Vercel`. Confirm Vercel issued Let's Encrypt cert. | queued |
| SESSION_0161_TASK_04 | Add `www.baselinemartialarts.com` to Vercel project Domains (redirect to apex). Carried over from SESSION_0160. | queued |
| SESSION_0161_TASK_05 | Refresh stale `docs/architecture/infrastructure/dns-verification-spec.md` content body to match current Resend dashboard pattern (per SESSION_0159_FINDING_01). | queued |
| SESSION_0161_TASK_06 | Fix the next `fdf9b2f` Vercel `next build` layer: `"use server"` sync export in Printful actions + `better-auth@1.6.11` `createAuthMiddleware` import path; local TypeScript then exposed and resolved a Resend SDK contact overload mismatch. | ✅ done — local `pnpm --filter dirstarter exec next build` passes |
| SESSION_0161_TASK_07 | Fix Vercel production environment/config layer: add required Production env vars and prepare Next.js monorepo Root Directory config for `apps/web`. | in progress |

### Pre-flight context (from SESSION_0160 close)

- Branch: `main`, clean tree at `323646b`.
- Last build attempt (Vercel deploy `2TKXoUrVP`, commit `323646b`) failed at `27s` during `apps/web` postinstall with `PrismaConfigEnvError: Cannot resolve environment variable: SHADOW_DATABASE_URL`.
- Install pipeline now confirmed working: Part A (pnpm-lock.yaml committed `cd6c12c`) + Part B (vercel.json Corepack `881b664`) + DATABASE_URL env var (set in Vercel UI by Brian).
- 739 packages installed cleanly, native modules (`@prisma/engines`, `sharp`, `esbuild`, `@swc/core`, `@parcel/watcher`) all built. The failure is specifically Prisma 7+'s strict `env()` helper rejecting a missing optional var.

## Bow-in Resume Audit — Codex

- Repo: `/Users/brianscott/dev/ronin-dojo-app`
- Branch/worktree: `main`, clean at `fdf9b2f`
- Vercel/GitHub status check: `fdf9b2f` did run in Vercel as deployment `dpl_J7rccBg5HE2rZyyrqbu3nYETX8PS`.
- Build evidence: Vercel now gets through `pnpm install --frozen-lockfile`, `prisma generate`, and `prisma migrate deploy`; current failure is in `next build`.
- Screenshot correction: the visible browser screenshot source hash is `e967051`, which predates the phantom-deps fix. The actual latest failed status for `fdf9b2f` was pulled from GitHub commit status + `vercel inspect --logs`.

## Graphify Check — Codex Resume

- Graph status: usable, 5,786 nodes / 10,800 edges / 659 communities / 1,170 files tracked.
- Query used: `graphify query "better-auth createAuthMiddleware auth middleware removed middleware Next build Vercel" --budget 2000`
- Follow-up queries:
  - `graphify query "Printful server action merch webhook getPrintfulVariantId use server" --budget 2000`
  - `graphify query "middleware proxy auth lib auth Next route Better Auth" --budget 2000`
  - `graphify query "Resend contacts create audienceId CreateContactOptions services resend" --budget 2000`
- Files selected from graph / Vercel evidence:
  - `apps/web/lib/auth.ts`
  - `apps/web/app/api/auth/[...all]/route.ts`
  - `apps/web/proxy.ts`
  - `apps/web/server/web/merch/printful-actions.ts`
  - `apps/web/services/resend.ts`
  - `docs/architecture/dirstarter-baseline-index.md`
  - `docs/runbooks/local-dev-auth-storage.md`
- Verification note: `middleware.ts` was deleted in `0b289d5`, but its routing/brand behavior was moved into `proxy.ts`; the current Vercel error is the Better-Auth hook helper import path, not missing Next middleware.

## Petey Re-plan — Vercel Build Layer

### Goal
Unblock the `fdf9b2f` production build layer exposed by Vercel after install, Prisma generate, and migration deploy now pass.

### Tasks

#### TASK_06 — Build Compatibility Patch

- **Agent:** Cody
- **What:** Fix the two `next build` errors reported by Vercel.
- **Steps:**
  1. Move `createAuthMiddleware` import to the package export that exists in `better-auth@1.6.11`.
  2. Stop exporting the sync Printful variant helper from a `"use server"` file.
  3. Resolve the Resend SDK `contacts.create` overload mismatch exposed by local TypeScript.
  4. Run local build verification without broad repo search.
- **Done means:** Local `next build` passes or surfaces the next layer.
- **Depends on:** nothing.

#### TASK_07 — Build Verification / Next Layer

- **Agent:** Doug
- **What:** Review local build output and Vercel log parity.
- **Steps:**
  1. Run the narrow app build command.
  2. If clean, trigger or advise redeploy.
  3. If a new layer appears, record it as the next blocker.
- **Done means:** SESSION file has exact verification evidence.
- **Depends on:** TASK_06.

#### TASK_08 — Petey Bow-out Staging

- **Agent:** Petey
- **What:** Close or stage the next session after verification.
- **Steps:**
  1. Update SESSION_0161, project log, and Graphify after git hygiene if docs/code changed.
  2. Use `closing.md`; full-close if docs touched, quick-close only if scope qualifies.
- **Done means:** clean handoff with next goal.
- **Depends on:** TASK_07.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_06 | Cody | Clear code execution against exact Vercel errors |
| TASK_07 | Doug | Verification and regression check |
| TASK_08 | Petey | Handoff, docs, and close discipline |

### Open decisions
- None before TASK_06; the patch is build-error-driven and scoped.

### Risks
- Local build may expose additional Next 16 / dependency-version errors after these two.
- Running the full root build invokes `prebuild` migration deploy; prefer a narrow `next build` verification first.

### Scope guard
- Do not expand into domain setup or DNS until production build succeeds.

### Dirstarter implementation template
- **Docs read first:** Local Dirstarter baseline index auth/proxy sections; live Dirstarter docs not fetched because this is a patch against exact local/Vercel package behavior.
- **Baseline pattern to extend:** Existing Better-Auth config in `lib/auth.ts`; existing Next proxy in `proxy.ts`.
- **Custom delta:** Ronin Passport/DirectoryProfile creation hook and brand-aware proxy stay intact.
- **No-bypass proof:** Keeps Dirstarter/Better-Auth architecture; updates only import/export compatibility.

## Dirstarter Alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Deployment, auth, server actions |
| Extension or replacement | Extends existing Dirstarter/Better-Auth + Next server-action patterns; no replacement |
| Why justified | Production deploy is blocked after prior pipeline fixes exposed framework/API compatibility errors in app code |
| Risk if bypassed | Custom domain remains `No Deployment`; Vercel cannot issue/serve a production build for Baseline Martial Arts |

## Pre-flight: Backend — Production Build Break

### 1. Auth predicates planned
- Session auth required: unchanged.
- Org membership verified: unchanged.
- Brand column filtered: unchanged.
- Authorization approach: no auth behavior change intended; only fix import path for Better-Auth middleware helper.

### 2. Existing action scan
- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes — exact auth/proxy sections selected by Graphify and verified directly.
- Graphify queried for: Better-Auth middleware/import path, Printful server action, Resend contact service.
- Related existing actions/services: `apps/web/server/web/merch/printful-actions.ts`, `apps/web/lib/auth.ts`, `apps/web/services/resend.ts`.
- L1 pattern match: existing Dirstarter Better-Auth config + Next `"use server"` action file.

### 3. Data flow reference
- `docs/runbooks/vercel-domain-setup-runbook.md` consulted for production build readiness.
- Lifecycle stage: release ops / production deployment.

### 4. FAILED_STEPS check
- Prior failures in this area: FS-0021 is open but schema/migration-specific; no schema change in this task.
- Manual Boundary Registry entries: none checked; this is a build compatibility patch scoped to known Vercel errors.

## Files Touched

| Path | Note |
| --- | --- |
| `apps/web/prisma.config.ts` | TASK_01 Path B fix: `shadowDatabaseUrl` conditional-spread so it's only set when env var exists. |
| `apps/web/package.json` | TASK_02: added `@radix-ui/react-accordion`, `debounce`, `embla-carousel` as explicit deps. |
| `pnpm-lock.yaml` | Updated by `pnpm add --filter dirstarter`. |
| `apps/web/lib/auth.ts` | TASK_06: import `createAuthMiddleware` from `better-auth/api` for `better-auth@1.6.11`. |
| `apps/web/server/web/merch/printful-actions.ts` | TASK_06: make `getPrintfulVariantId` internal so the `"use server"` file only exports async actions. |
| `apps/web/services/resend.ts` | TASK_06: use Resend's legacy contact overload explicitly and guard missing `RESEND_AUDIENCE_ID`. |
| `vercel.json` | TASK_07: set `framework: "nextjs"` and scope the build command to `dirstarter`. |
| `apps/web/vercel.json` | TASK_07: prepare app-root Vercel config for Root Directory `apps/web` with monorepo install/build commands. |
| `.gitignore` | TASK_07: ignore local `.vercel/` project settings generated by Vercel CLI link/pull. |
| `docs/protocols/project-log.md` | Added SESSION_0161 task plan rows. |
| `docs/sprints/SESSION_0161.md` | This session record. |

## What Landed

- **TASK_01** — Prisma config now lets `prisma generate` proceed on Vercel without `SHADOW_DATABASE_URL` set. Commit `cc5cd59`.
- **TASK_02** — Three phantom dependencies declared in `apps/web/package.json`. Full repo audit confirms zero remaining phantoms. Commit `291d8dd`.
- **TASK_06** — Vercel `fdf9b2f` logs showed the phantom-deps layer was resolved; build failed at `next build` on Better-Auth import path + Printful `"use server"` export. Local verification also surfaced a Resend SDK `contacts.create` overload mismatch. All three are patched.
- **TASK_07** — Added missing Vercel Production env vars via CLI: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL`. Vercel project settings are now corrected for the monorepo app root: Root Directory `apps/web`, Framework Preset `Next.js`, Output Directory `Next.js default`, and monorepo install/build commands. The install command now pins `pnpm@9.0.0` through Corepack so Vercel accepts the checked-in lockfile.

## Verification Evidence

- `gh api repos/Ronin-Dojo-Design/ronin-dojo-baseline/commits/fdf9b2f/status` showed Vercel deployment `dpl_J7rccBg5HE2rZyyrqbu3nYETX8PS` failed.
- `npx vercel inspect dpl_J7rccBg5HE2rZyyrqbu3nYETX8PS --logs` confirmed install, Prisma generate, and migration deploy passed before `next build` failed.
- `pnpm --filter dirstarter exec next build` passed after TASK_06 patches:
  - compiled successfully
  - TypeScript finished
  - generated 146 static pages
  - exited `0`
  - remaining output: non-fatal Turbopack NFT tracing warning already present in Vercel logs.
- First `b047f81` remote build reached page-data collection, then failed on missing Production env vars: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL`.
- After adding env vars, redeploy `dpl_Dyh1MjzpkgjPgbFuDSkaYekJWrZu` reached post-build output resolution and failed because the Vercel project was still configured as Framework Preset `Other` with Output Directory `public`.
- `vercel project inspect ronin-dojo-baseline --scope brian-scotts-projects-4841d4d6` confirmed before the Root Directory correction:
  - Root Directory `.`
  - Framework Preset `Other`
  - Output Directory `public` if it exists, or `.`
- Push `1277b41` with root-level `framework: nextjs` proved the mismatch: Vercel tried to detect `next` in the repo-root package and failed because the real Next app is `apps/web/package.json`.
- Vercel project API patch plus follow-up inspect confirmed:
  - Root Directory `apps/web`
  - Framework Preset `Next.js`
  - Output Directory `Next.js default`
  - Install Command `cd ../.. && corepack enable && corepack prepare pnpm@9.0.0 --activate && pnpm install --frozen-lockfile`
  - Build Command `cd ../.. && pnpm --filter dirstarter build`
- First post-root deploy for `ce69779` proved the Root Directory fix took effect, then failed at install because Vercel used an incompatible pnpm for the root lockfile. The install command now explicitly activates `pnpm@9.0.0`.

## Open Decisions / Blockers

- Awaiting redeploy after Vercel project Root Directory correction to `apps/web`.

## Next Session

Filled at bow-out.
