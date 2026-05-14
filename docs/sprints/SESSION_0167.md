---
title: "SESSION 0167 - Vercel MCP Setup and Env/Deploy Comparison"
slug: session-0167
type: session--implement
status: closed-full
created: 2026-05-14
updated: 2026-05-14
last_agent: codex-session-0167
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0166.md
  - docs/runbooks/mcp-usage-runbook.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/architecture/dirstarter-baseline-index.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/protocols/project-log.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0167 - Vercel MCP Setup and Env/Deploy Comparison

## Date

2026-05-14

## Operator

Brian Scott + Codex (Petey -> Cody -> Doug -> Giddy -> Petey)

## Goal

Resolve the Vercel MCP install scope, configure/verify the safe provider-inspection lane, and run the non-authenticated production/env-deploy proof that is executable without production test-user credentials.

## Bow-in notes

- Latest closed session: `docs/sprints/SESSION_0166.md`.
- Branch: `main`.
- Starting worktree note: `ronin-baseline.code-workspace` is an untracked user-created workspace file and is not part of this session's planned edits.
- Vercel CLI is authenticated as `mrbscott44`.
- Linked Vercel project: `ronin-dojo-baseline`.
- Production smoke credentials/test user were not present in the session context, so authenticated dashboard and magic-link proof remain blocked unless the user supplies credentials mid-session.

## Graphify check

- Graph status at bow-in: usable. `graphify stats --graph .` returned 5,870 nodes, 10,895 edges, 683 communities, and 1,173 tracked files.
- Queries used:
  - `graphify query --graph . --depth 3 --budget 5000 "opening.md ritual bow in required steps"`
  - `graphify query --graph . --depth 3 --budget 5000 "graphify-repo-memory.md instructions use graphify queries CLI"`
  - `graphify query --graph . --depth 3 --budget 6000 "petey-plan.md tasks slated for next session"`
  - `graphify query --graph . --depth 3 --budget 5000 "closing.md ritual full-close optional docs touched quick-close"`
  - `graphify query --graph . --depth 3 --budget 7000 "env deploy comparison Dirstarter upstream Vercel apps web vercel json environment setup deployment"`
- Files selected from graph and verified directly: `docs/rituals/opening.md`, `docs/runbooks/graphify-repo-memory.md`, `docs/protocols/petey-plan.md`, `docs/sprints/SESSION_0166.md`, `docs/protocols/WORKFLOW_5.0.md`, `docs/architecture/program-plan.md`, `docs/protocols/failed-steps-log.md`, `docs/knowledge/wiki/drift-register.md`, `docs/runbooks/mcp-usage-runbook.md`, `docs/runbooks/vercel-domain-setup-runbook.md`, `docs/sprints/SESSION_0162.md`, `docs/sprints/SESSION_0165.md`, `docs/protocols/cody-preflight.md`, `docs/runbooks/deployment.md`, `docs/architecture/dirstarter-baseline-index.md`, and `docs/architecture/dirstarter-upstream-sync-2026-05-14.md`.
- Verification note: no repo-wide grep or rg was used for task planning.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Deployment/env, Vercel project settings, production smoke proof lane, and provider MCP policy |
| Extension or replacement | Extension only; no runtime code or production env mutation planned |
| Why justified | SESSION_0165 staged env/deploy comparison before upstream runtime porting, and SESSION_0166 staged Vercel MCP before provider debug/smoke work |
| Risk if bypassed | Changing the wrong Vercel layer, masking missing authenticated production smoke, or letting MCP setup replace repeatable CLI/runbook proof |

## Petey plan

### Goal

Configure/verify the Vercel provider-inspection lane and capture the production/env-deploy proof that can be run safely without credentials.

### Tasks

#### TASK_01 - Decide and configure Vercel MCP scope

- **Agent:** Cody
- **What:** Verify current Codex MCP state, decide Vercel install scope, add Vercel MCP only if missing, and attempt OAuth only through the official endpoint.
- **Steps:**
  1. Confirm official Vercel MCP endpoint from provider docs.
  2. Inspect `codex mcp list`.
  3. Prefer Codex global MCP config for Codex CLI because `codex mcp add` writes to the Codex config; treat VS Code workspace MCP as a separate future operator choice.
  4. Add `vercel` MCP with `https://mcp.vercel.com` if it is absent.
  5. Attempt `codex mcp login vercel` only if it starts a normal OAuth flow; do not force or script account authorization.
- **Done means:** `codex mcp list` shows the Vercel MCP entry or the blocker is recorded honestly.
- **Depends on:** nothing.

#### TASK_02 - Run non-authenticated production/env-deploy proof

- **Agent:** Cody + Doug
- **What:** Run public production checks and compare current Vercel/project config against active Ronin runbooks and Dirstarter env/deploy assumptions.
- **Steps:**
  1. Run Vercel CLI read-only project inspection.
  2. List production environment variable names without printing values.
  3. Run public smoke checks for apex, `www`, login page, protected dashboard redirect, and one brand-context/public route.
  4. Compare results to `vercel-domain-setup-runbook.md`, `deployment.md`, and `dirstarter-baseline-index.md`.
  5. Record which authenticated checks remain blocked.
- **Done means:** SESSION_0167 records concrete command evidence and separates verified public proof from blocked authenticated smoke.
- **Depends on:** TASK_01.

#### TASK_03 - Review and full close

- **Agent:** Doug + Giddy + Petey
- **What:** Run QA and architecture review, update project-log/wiki/session docs, run full-close checks, commit only session-owned changes, and refresh Graphify after git hygiene.
- **Steps:**
  1. Doug checks smoke evidence and remaining release-readiness gaps.
  2. Giddy checks Dirstarter/project alignment and ADR need.
  3. Petey writes Review & Recommend and closes the session full.
- **Done means:** SESSION_0167 has task/review logs, hostile review, full-close evidence, and a next-session handoff.
- **Depends on:** TASK_02.

### Parallelism

Cody execution is sequential. Doug and Giddy review lanes can run in parallel once initial evidence exists.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Direct provider-tooling setup with no architecture decision beyond scope selection |
| TASK_02 | Cody + Doug | CLI/browser-like proof plus QA classification of blocked versus verified checks |
| TASK_03 | Doug + Giddy + Petey | Release-readiness review, Dirstarter alignment, and ritual close |

### Open decisions

- Whether Brian wants VS Code workspace-level Vercel MCP config in addition to Codex global config.
- Authenticated production smoke still needs a test user or approved safe auth path.

### Risks

- Vercel MCP OAuth may require browser-side user action and may not become callable in the current Codex session.
- Public route checks can prove serve/redirect/protection behavior but cannot prove authenticated dashboard or email delivery.
- The local `.vercel/project.json` settings are stale/null compared with remote Vercel project settings; remote `vercel project inspect` is the better current source.

### Scope guard

No production env mutations, no deploys, no DNS edits, no Dirstarter upstream runtime port, no schema changes, and no secrets in docs. A narrow local source fix is allowed if public smoke exposes a production-routing bug.

### Dirstarter implementation template

- **Docs read first:** Vercel MCP official docs checked 2026-05-14; Dirstarter deployment/environment/project-structure/update assumptions carried from SESSION_0165/0166 and rechecked as needed.
- **Baseline pattern to extend:** Vercel deployment/env runbooks and Dirstarter env/deploy comparison package.
- **Custom delta:** Ronin keeps the `apps/web` Vercel root, app-root `vercel.json`, Better Auth production domain, brand-domain routing, and CLI proof lane.
- **No-bypass proof:** MCP setup is provider inspection only; CLI and session evidence remain the repeatable proof path.

## Files touched

| Path | Note |
| --- | --- |
| `docs/sprints/SESSION_0167.md` | New active session file, plan, evidence, and close artifact. |
| `docs/protocols/project-log.md` | SESSION_0167 task/review ledger entries. |
| `docs/knowledge/wiki/index.md` | SESSION_0167 row at close. |
| `apps/web/lib/brand-context.ts` | Added production host mappings and normalized `www.` hostnames before brand resolution. |
| `apps/web/lib/brand-context.test.ts` | Added focused resolver regression coverage for production host mappings. |

## Cody execution evidence

### Pre-flight

Pre-flight waived by Petey for the source fix because it was a single-file production host-map correction discovered by public smoke, with no new component, schema model, action, or API route.

### Vercel MCP

- Official Vercel MCP docs checked 2026-05-14: `https://vercel.com/docs/agent-resources/vercel-mcp`.
- Official endpoint confirmed: `https://mcp.vercel.com`.
- Installed Codex MCP entry with project-specific URL:
  - Name: `vercel-ronin`
  - URL: `https://mcp.vercel.com/brian-scotts-projects-4841d4d6/ronin-dojo-baseline`
  - Auth: OAuth
- `codex mcp list` showed `vercel-ronin` enabled and authenticated with OAuth.
- Current chat did not receive new callable Vercel MCP tools after runtime startup, so this session used Vercel CLI for repeatable proof. Future Codex sessions should start with the MCP configured.

### Read-only Vercel/env proof

- `vercel whoami`: `mrbscott44`.
- `vercel project inspect ronin-dojo-baseline --non-interactive`:
  - Owner: `brian-scotts-projects-4841d4d6`
  - Root Directory: `apps/web`
  - Node.js Version: `22.x`
  - Framework Preset: `Next.js`
  - Build Command: `cd ../.. && pnpm --filter dirstarter build`
  - Output Directory: Next.js default
  - Install Command: `cd ../.. && corepack enable && corepack pnpm@9.0.0 install --frozen-lockfile`
- `vercel ls ronin-dojo-baseline --non-interactive`: latest production deployment was Ready, 2m duration, username `mrbscott44`.
- Production env names only, no values printed:
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL`
  - `DATABASE_URL`
  - `NEXT_PUBLIC_SITE_EMAIL`
  - `NEXT_PUBLIC_SITE_URL`

### Public production smoke

| Check | Result |
| --- | --- |
| `https://baselinemartialarts.com` | HTTP 200, `Server: Vercel`, body metadata says Baseline Martial Arts |
| `https://www.baselinemartialarts.com` | HTTP 308 redirect to apex, `Server: Vercel` |
| `https://baselinemartialarts.com/auth/login` | HTTP 200, `Server: Vercel` |
| `https://baselinemartialarts.com/dashboard` | HTTP 307 redirect to `/auth/login?next=/dashboard` |
| `https://baselinemartialarts.com/organizations` | HTTP 500 on current production deployment |
| `https://baselinemartialarts.com/programs` | HTTP 500 on current production deployment |
| `https://baselinemartialarts.com/tournaments` | HTTP 500 on current production deployment |

### Source fix

Public smoke exposed that the current production deployment sets `brand=RONIN_DOJO_DESIGN` on Baseline routes. Direct source inspection showed `apps/web/lib/brand-context.ts` still had production domains commented out, causing `resolveBrand()` to fall back to `DEFAULT_BRAND`.

Fix applied locally:

- Added production host mappings for `ronindojodesign.com`, `baselinemartialarts.com`, `blackbeltlegacy.com`, and `wekafusa.com`.
- Normalized leading `www.` before host lookup.

Local proof:

- `bun -e "import { resolveBrand } from './lib/brand-context.ts'; ..."` returned:
  - `baselinemartialarts.com` -> `BASELINE_MARTIAL_ARTS`
  - `www.baselinemartialarts.com` -> `BASELINE_MARTIAL_ARTS`
  - `ronindojodesign.com` -> `RONIN_DOJO_DESIGN`
  - `blackbeltlegacy.com` -> `BBL`
  - `wekafusa.com` -> `WEKAF`
- `bun biome check lib/brand-context.ts` passed.
- `bun test lib/brand-context.test.ts` passed with 2 tests / 0 failures.
- `bun biome check lib/brand-context.ts lib/brand-context.test.ts` passed.
- `pnpm --filter dirstarter typecheck` passed after route type generation.

## What landed

- Added and authenticated the project-scoped Codex Vercel MCP entry `vercel-ronin`.
- Captured current Vercel project truth and production env names without printing values.
- Ran public production smoke and separated verified public checks from blocked authenticated checks.
- Fixed the local host-to-brand map so Baseline, Ronin, BBL, WEKAF, and `www.` domains resolve to the intended `Brand`.
- Added a focused regression test for production host mapping and `www.` normalization.

## Decisions resolved

- Use a Codex global MCP entry with a project-specific Vercel MCP URL for Ronin: `vercel-ronin`.
- Do not add VS Code workspace MCP config in this session; that remains a separate operator choice.
- Do not deploy from this session. Production still reflects the previous build until a deploy is explicitly run.

## Open decisions / blockers

- Authenticated production smoke remains blocked on a test user or approved safe auth path.
- Current production deployment still returns HTTP 500 for `/organizations`, `/programs`, and `/tournaments`.
- Current production deployment still sets `brand=RONIN_DOJO_DESIGN` on Baseline requests until the local host-map fix is deployed.
- Production env list does not show `CRON_SECRET`; Dirstarter environment docs and Ronin deployment runbook list it for cron protection, but `apps/web/env.ts` currently treats it as optional.

## Next session

- **Goal:** Deploy the host-to-brand fix, then rerun production smoke for Baseline public routes and, if credentials are ready, authenticated dashboard plus email/auth proof.
- **Inputs to read:**
  - `docs/sprints/SESSION_0167.md`
  - `docs/runbooks/vercel-domain-setup-runbook.md`
  - `docs/runbooks/deployment.md`
  - `apps/web/lib/brand-context.ts`
  - `docs/sprints/SESSION_0162.md`
- **First task:** Decide whether to deploy the local brand-context fix now. If yes, push/deploy and rerun the public route smoke; if no, leave production smoke marked blocked by undeployed fix.

## Task log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0167_TASK_01 | Decide and configure Vercel MCP scope | done |
| SESSION_0167_TASK_02 | Run non-authenticated production/env-deploy proof | done |
| SESSION_0167_TASK_03 | Review and full close | done |

## Review log

### SESSION_0167_REVIEW_01 - Doug + Giddy Full Close Review

- **Reviewed tasks:** SESSION_0167_TASK_01 through SESSION_0167_TASK_03.
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://vercel.com/docs/agent-resources/vercel-mcp`, `https://dirstarter.com/docs/deployment`, `https://dirstarter.com/docs/environment-setup`, `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/codebase/updates`, local Vercel CLI output, and public production curl checks.
- **Verdict:** Partially aligned and useful. The provider-inspection lane is now configured, CLI proof remains the repeatable evidence path, and a production brand-routing bug was fixed locally with test coverage. Release readiness is not complete because the fix is not deployed, several public routes currently return 500, and authenticated smoke remains blocked.
- **Kaizen aggregate:** 7.0.

### SESSION_0167_FINDING_01 - Production host-map fix is local but not deployed

- **Severity:** high
- **Task:** SESSION_0167_TASK_02
- **Evidence:** Current production responses set `brand=RONIN_DOJO_DESIGN` on Baseline requests. Local `resolveBrand` proof now maps Baseline apex and `www` to `BASELINE_MARTIAL_ARTS`.
- **Impact:** Until deployed, Baseline public requests can route through the wrong brand context.
- **Required follow-up:** Deploy the host-map fix, then rerun public route smoke.
- **Status:** open

### SESSION_0167_FINDING_02 - Production public app routes return 500

- **Severity:** high
- **Task:** SESSION_0167_TASK_02
- **Evidence:** `curl -sI` returned HTTP 500 for `/organizations`, `/programs`, and `/tournaments` on `https://baselinemartialarts.com`.
- **Impact:** Baseline is not launch-ready even though homepage, login, and protected redirect checks work.
- **Required follow-up:** After deploying the host-map fix, rerun these routes and inspect provider logs if any still fail.
- **Status:** open

### SESSION_0167_FINDING_03 - Authenticated production smoke still blocked

- **Severity:** medium
- **Task:** SESSION_0167_TASK_02
- **Evidence:** No production test-user credentials or approved safe auth path were present in the session context.
- **Impact:** Dashboard, session cookie behavior, and magic-link/email delivery remain unproven.
- **Required follow-up:** Provide/approve a production test user or safe auth path, then run authenticated dashboard and email/auth smoke.
- **Status:** open

### SESSION_0167_FINDING_04 - `CRON_SECRET` absent from production env listing

- **Severity:** low
- **Task:** SESSION_0167_TASK_02
- **Evidence:** Vercel production env names listed `DATABASE_URL`, Better Auth vars, site URL/email, and Google OAuth vars, but not `CRON_SECRET`. Dirstarter environment docs and Ronin deployment runbook name `CRON_SECRET`; `apps/web/env.ts` currently treats it as optional.
- **Impact:** Cron endpoint protection posture needs an explicit decision before cron-dependent launch work.
- **Required follow-up:** Decide whether to add `CRON_SECRET` for production now or document why current cron endpoints are not active/required.
- **Status:** open

## Hostile close review

1. **Plan sanity:** Good. The session started as MCP setup plus non-authenticated smoke/env proof, then allowed a narrow source fix when smoke found a direct host-map defect.
2. **Dirstarter compliance:** Aligned. Dirstarter deployment/env docs expect Vercel, production env vars, and clean update discipline; this session preserved CLI proof and did not bulk-merge upstream or mutate production env.
3. **Security:** Good. No secrets were printed; Vercel env output was limited to names and targets. OAuth was user-approved through Vercel.
4. **Data integrity:** No schema, migrations, or production DB state changed.
5. **Lifecycle proof:** Partial. Homepage, login page, and protected redirect work. Public app routes currently fail 500. Authenticated dashboard and email/auth remain unproven.
6. **Verification honesty:** Good. Current production failures are recorded, and the local fix is not claimed as deployed.
7. **Workflow honesty:** Graphify-first discovery was used for repo planning; project-log/wiki/session artifacts were updated.
8. **Merge readiness:** Ready to commit locally after full-close checks. Push/deploy should be an explicit next-session decision because it changes production behavior.

## ADR / ubiquitous-language check

- **No new ADR.** This session restored intended multi-domain host mapping and added MCP provider setup; it did not change the accepted architecture.
- **No ubiquitous-language update.** No new domain term was introduced.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked `docs/sprints/SESSION_0167.md`, `docs/protocols/project-log.md`, and `docs/knowledge/wiki/index.md`; current-session docs carry `updated: 2026-05-14` and `last_agent: codex-session-0167`; code files have no JETTY frontmatter. |
| Backlinks/index sweep | `SESSION_0167` pairs with `project-log.md` and `closing.md`; `project-log.md` backlinks include `SESSION_0167`; `wiki/index.md` includes the session row with `closed-full` status. |
| Wiki lint | `bun run wiki:lint` completed with `0 error(s), 487 warning(s)`; touched-doc filter showed no `SESSION_0167`, `project-log.md`, or `knowledge/wiki/index.md` warnings, so warnings are pre-existing repo-wide R8 formatting debt. |
| Kaizen reflection | Reflections section present with MCP runtime, typecheck, production-routing, and smoke-test lessons. |
| Hostile close review | `SESSION_0167_REVIEW_01` recorded in session file and project log; open findings `SESSION_0167_FINDING_01` through `SESSION_0167_FINDING_04` remain explicit follow-ups. |
| Review & Recommend | Next session goal, inputs, and first task are written; the next session is blocked on deploy approval and authenticated-smoke credentials only if those checks are requested. |
| Memory sweep | Durable memory captured in project docs: project-scoped Vercel MCP entry `vercel-ronin`, undeployed brand host-map fix, production 500 routes, and authenticated-smoke blocker. No operator-side memory file was needed. |
| Next session unblock check | First task is executable: decide whether to deploy the local brand-context fix, then rerun public smoke; authenticated smoke remains blocked without a production test user or approved safe auth path. |
| Git hygiene | Final branch/status/commit/push proof will be reported in the bow-out response after git hygiene. |
| Graphify update | Graphify refresh runs after git hygiene; final node/edge/community counts will be reported in the bow-out response. |

## Reflections

- The most useful smoke result was not the green homepage; it was the wrong `brand` cookie on a green response.
- A project-scoped Vercel MCP URL fits this repo better than a broad all-project default, but the current Codex runtime still needs a restart/new session before those MCP tools are callable.
- The first test used `bun:test`, which passed at runtime but failed TypeScript because the app typecheck does not load Bun test types. Switching to `node:test` kept the test compatible with the current TS setup.
- Do not call Baseline production-ready until the local host-map fix is deployed and the 500 routes are resolved.

## Status

closed-full
