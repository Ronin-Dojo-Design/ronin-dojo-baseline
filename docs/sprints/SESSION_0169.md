---
title: "SESSION 0169 - Production Baseline Smoke and Provider Readiness"
slug: session-0169
type: session--review
status: closed-full
created: 2026-05-14
updated: 2026-05-14
last_agent: codex-session-0169
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0168.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/aws-s3-operator-runbook.md
  - docs/runbooks/product-catalog-seed.md
  - docs/runbooks/database.md
  - docs/runbooks/deployment.md
  - docs/protocols/project-log.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0169 - Production Baseline Smoke and Provider Readiness

## Date

2026-05-14 MDT / 2026-05-15 UTC

## Operator

Brian Scott + Codex (Petey -> Cody -> Doug -> Giddy -> Petey)

## Goal

Verify that the SESSION_0168 production deployment is live, prove the public Baseline route smoke status, and determine whether production Neon/Stripe/S3 setup can proceed from this machine without exposing secrets.

## Bow-in notes

- Latest closed session at start: `docs/sprints/SESSION_0168.md`.
- Branch: `main`.
- Worktree status at bow-in: clean.
- Latest local and Vercel production deployment commit: `6a19060 fix: harden baseline launch setup`.
- Graphify status at bow-in: 5882 nodes, 10931 edges, 673 communities, 1175 files tracked.
- Current local machine date is 2026-05-14 MDT while UTC/system date is 2026-05-15; session date records both.

## Graphify check

- Graph status: current enough for bow-in; report has no commit header, but `graphify stats` returned populated graph data.
- Queries used:
  - `graphify query "Find the files opening.md, graphify-repo-memory.md, petey-plan.md, closing.md, and session planning docs. Return relevant file paths and key nodes."`
  - `graphify query "graphify-repo-memory.md exact file path Graphify repo memory instructions" --depth 3`
  - `graphify query "latest SESSION_0168 SESSION_0167 next session Goal First task Open decisions blockers" --budget 2000`
  - `graphify query "WORKFLOW_5.0 session calendar current session lane worktree map Dirstarter alignment table" --budget 2000`
  - `graphify query "program-plan current sprint deliverable boundary registry next proof target" --budget 2000`
  - `graphify query "failed-steps-log drift-register open mitigated current lane" --budget 2000`
  - `graphify query "production deploy Neon DATABASE_URL Stripe S3 Baseline seed link smoke runbooks" --budget 3000`
- Files selected from graph and verified directly: `docs/rituals/opening.md`, `docs/runbooks/graphify-repo-memory.md`, `docs/rituals/closing.md`, `docs/protocols/petey-plan.md`, `docs/sprints/SESSION_0168.md`, `docs/protocols/WORKFLOW_5.0.md`, `docs/architecture/program-plan.md`, `docs/protocols/failed-steps-log.md`, `docs/knowledge/wiki/drift-register.md`, `docs/knowledge/wiki/manual-boundary-registry.md`, `docs/runbooks/stripe-setup-runbook.md`, `docs/runbooks/aws-s3-operator-runbook.md`, `docs/runbooks/product-catalog-seed.md`, `docs/runbooks/database.md`, and `docs/runbooks/deployment.md`.
- Verification note: repo-wide `grep`/`rg` was not used for task planning.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Deployment/env readiness, Prisma/Neon production database operations, Stripe payments, S3/media delivery, and route protection middleware |
| Extension or replacement | Extension. Ronin keeps Dirstarter's Next/Vercel deployment posture, server-created Stripe Checkout pattern, Prisma migration flow, and S3-compatible media configuration while proving Baseline-specific launch plumbing |
| Why justified | SESSION_0168 local fixes are only launch-useful if production route smoke and provider setup are proven against the real Baseline domain |
| Risk if bypassed | Baseline could appear locally ready while production still redirects public catalog pages, lacks product records, or cannot run payment/media smoke |

## Petey plan

### Goal

Turn SESSION_0168's local launch setup into production evidence or a sharply documented provider blocker.

### Tasks

#### TASK_01 - Verify deployed patch and public Baseline routes

- **Agent:** Cody with Doug review
- **What:** Confirm the production deployment is running commit `6a19060`, then smoke the public Baseline routes affected by the host-map and `/me` route matcher work.
- **Steps:**
  1. Read Vercel deployment metadata for the latest production deployment.
  2. Curl public Baseline routes without credentials and capture HTTP/redirect status.
  3. If 500s or unexpected redirects appear, inspect recent Vercel runtime logs.
- **Done means:** Deployment commit and route status table are recorded in this SESSION file.
- **Depends on:** nothing

#### TASK_02 - Check production provider readiness without exposing secrets

- **Agent:** Cody with Giddy review
- **What:** Check whether production Neon, Stripe, and S3 work can safely run from this machine; do not print secret values.
- **Steps:**
  1. List environment variable names only from Vercel/local safe sources.
  2. Confirm whether a usable production `DATABASE_URL`/`DIRECT_URL` is available locally without redacted placeholders.
  3. If available, run Baseline-safe preflight counts before any seed/link command.
  4. If unavailable, stage the exact owner-run command sequence and keep production DB work blocked.
- **Done means:** Provider readiness decision is recorded, with commands run or a precise blocked-on-user handoff.
- **Depends on:** TASK_01

#### TASK_03 - Review, document, and full-close

- **Agent:** Doug + Giddy + Petey
- **What:** Review production evidence, update session/project/wiki docs, run full-close checks, commit docs, and refresh Graphify after git hygiene.
- **Steps:**
  1. Record verification evidence, open blockers, and next session recommendation.
  2. Update `docs/protocols/project-log.md` and `docs/knowledge/wiki/index.md`.
  3. Run wiki lint and any targeted checks needed by the session.
  4. Commit docs if changes are ready, then refresh Graphify.
- **Done means:** `SESSION_0169` is `closed-full`, project log and wiki index include the session, and final Graphify stats are reported.
- **Depends on:** TASK_01 and TASK_02

### Parallelism

TASK_01 and TASK_02 can be investigated in parallel after the session file and task-log entries exist because they read different external surfaces. TASK_03 is sequential after evidence returns.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody + Doug | Execution is concrete, and Doug checks launch-route failure modes |
| TASK_02 | Cody + Giddy | Provider readiness needs exact commands plus architecture/deploy safety review |
| TASK_03 | Petey + Doug + Giddy | Closing is planning/review heavy and must preserve the launch handoff |

### Open decisions

- Whether Brian will provide production Neon connection strings locally or run the production seed/link commands directly.
- Whether authenticated admin smoke can run this session; no production test-user credential or approved auth path is present at bow-in.

### Risks

- Vercel deployment may be ready while runtime DB/env errors still break public routes.
- Production DB work must not run against a redacted Vercel env pull or local development database.
- Stripe/S3 can be present by env-name but still unproven until checkout/media/admin monitor smoke runs.

### Scope guard

If public route smoke exposes unrelated product UX or listings gaps, record them as follow-up findings. Do not expand this session into Baseline Listings MVP implementation.

### Dirstarter implementation template

- **Docs read first:** local runbooks for deployment, database, Stripe, product catalog, and S3; live Dirstarter docs check to be recorded if implementation touches provider setup.
- **Baseline pattern to extend:** Vercel production deploy from `main`, Prisma migrate deploy via build/prebuild, Stripe-hosted Checkout with server-side secret key, S3-compatible media env variables.
- **Custom delta:** Baseline-only product catalog, entitlement grants, physical merch carve-out, and route smoke for Baseline public pages.
- **No-bypass proof:** This session verifies Dirstarter-style provider plumbing before any custom production seed/link work proceeds.

## Cody execution evidence

### TASK_01 - Production deployment and public route smoke

- Latest production Vercel deployment: `dpl_EbBbEPVEvPSJ4hnmzAVDRuHdGKy6`.
- Deployment state: `READY`.
- Deployment commit: `6a19060` / `6a190605c77ca5db2289d82554bf75d6eedb43bf`.
- Deployment message: `fix: harden baseline launch setup`.
- Production aliases include `baselinemartialarts.com` and `www.baselinemartialarts.com`.

| Route | Apex result | WWW result | Verdict |
| --- | --- | --- | --- |
| `/` | `200` | `308 -> apex`, final `200` | pass |
| `/merch` | `200`, no auth redirect | `308 -> apex`, final `200` | pass |
| `/members` | `200`, no auth redirect | `308 -> apex`, final `200` | pass |
| `/gear` | `200` | `308 -> apex`, final `200` | pass |
| `/schools` | `200` | `308 -> apex`, final `200` | pass |
| `/programs` | `200` | `308 -> apex`, final `200` | pass |
| `/courses` | `200` | `308 -> apex`, final `200` | pass |
| `/auth/login` | `200` | `308 -> apex`, final `200` | pass |
| `/me` | `307 -> /auth/login?next=/me`, final `200` | `308 -> apex`, then login redirect, final `200` | pass |

Doug review: no 500s, no unexpected auth redirects, and the `/me` matcher fix is deployed because `/merch` and `/members` stayed public while `/me` remained protected.

Vercel runtime log spot-check after smoke: no fatal errors in the public smoke path. Two production log entries showed Node warning/deprecation messages on successful `200` responses for `/merch` and `/members`; treat as non-blocking follow-up unless they become noisy.

### TASK_02 - Provider readiness check

- Vercel production env names present: `DATABASE_URL`, Better Auth vars, site URL/email, Google OAuth vars, `CRON_SECRET`, Resend vars, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Vercel production env names missing as of the final re-check before this edit: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, and `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Vercel also has `NEXT_STRIPE_PUBLISHABLE_KEY`, but the app does not currently require it for the server-created Stripe Checkout pattern.
- Local `apps/web/.env` classification only, with no secret values printed: `DATABASE_URL` is local-dev, `STRIPE_SECRET_KEY` is test-mode, and S3 local variables are present but not suitable proof for production.
- `DIRECT_URL` is not present in Vercel. The database runbook recommends direct/pooler separation, but current `apps/web/prisma.config.ts` only consumes `DATABASE_URL`, so this is a migration-hardening follow-up rather than the immediate reason production seed/link work is blocked.

Decision: production seed/link work remains blocked from this machine. Running live DB/Stripe writes needs either a secure production env file created intentionally by Brian or Brian running the owner commands directly.

Safe owner-run sequence once production env access is intentionally available:

```bash
cd /Users/brianscott/dev/ronin-dojo-app
vercel env pull apps/web/.env.production.local --environment production

cd apps/web
bun --env-file=.env.production.local run db:migrate deploy
bun --env-file=.env.production.local run prisma/seed-pricing-plans.ts
bun --env-file=.env.production.local run prisma/seed-tuffbuffs-affiliate.ts
bun --env-file=.env.production.local run prisma/seed-tuffbuffs-merch.ts
bun --env-file=.env.production.local run scripts/setup-ronin-stripe-products.ts --from-db --brand BMA --dry-run
bun --env-file=.env.production.local run scripts/setup-ronin-stripe-products.ts --from-db --brand BMA
bun --env-file=.env.production.local run scripts/setup-merch-stripe-products.ts --dry-run
bun --env-file=.env.production.local run scripts/setup-merch-stripe-products.ts
bun --env-file=.env.production.local run scripts/audit-payment-entitlements.ts
```

Guardrails for the owner-run sequence:

- Do not commit `apps/web/.env.production.local`; it is ignored by git.
- Confirm the pulled `DATABASE_URL` is Neon production, not local dev, before running writes.
- Confirm the pulled `STRIPE_SECRET_KEY` points at the intended Stripe mode before creating/linking products.
- Add the S3/media env names in Vercel before expecting `/admin/storage/monitoring` or CloudFront media smoke to pass.

## Verification

| Check | Result |
| --- | --- |
| Graphify bow-in stats | 5882 nodes, 10931 edges, 673 communities, 1175 files tracked |
| Latest Vercel production deployment | `READY`, commit `6a19060` |
| Public route smoke | passed for `/`, `/merch`, `/members`, `/gear`, `/schools`, `/programs`, `/courses`, `/auth/login`, and `/me` |
| Vercel production env names | DB/Auth/Site/Google/CRON/Resend/Stripe present; S3/media env names missing |
| Local env classification | local DB and test Stripe only; no production writes run |
| Live Dirstarter docs check | checked 2026-05-15 UTC: deployment, environment setup, payments, storage |
| Stripe best-practices check | checked local Stripe skill + official go-live/webhook docs; no live Stripe writes run |

## What landed

- Confirmed the SESSION_0168 patch is deployed to production on Vercel at `6a19060`.
- Proved public production route smoke for Baseline apex and `www`: `/`, `/merch`, `/members`, `/gear`, `/schools`, `/programs`, `/courses`, `/auth/login`, and `/me`.
- Confirmed the previous `/me` matcher bug is fixed in production: `/merch` and `/members` stay public, while `/me` still redirects to login.
- Confirmed production Vercel has DB/Auth/Site/Google/CRON/Resend/Stripe env names, but not S3/media env names.
- Produced the safe owner-run command sequence for production DB/Stripe seed-link work without printing secrets or running live writes.
- Answered the Vercel S3 env-name question: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, `NEXT_PUBLIC_MEDIA_BASE_URL`, and optional `S3_ENDPOINT`.

## Decisions resolved

- Do not run production DB/Stripe writes from the current local `.env`; it points at local dev/test-mode surfaces.
- Treat SESSION_0168 deployment and public route smoke as verified.
- Treat production S3/media setup as still incomplete until Vercel has the S3/media env names and storage monitor smoke passes.
- Treat `DIRECT_URL` as a runbook hardening follow-up, not an immediate deploy blocker, because current `apps/web/prisma.config.ts` consumes only `DATABASE_URL`.

## Open decisions / blockers

- Production seed/link work remains blocked from Codex until Brian intentionally provides a secure production env file or runs the owner command sequence directly.
- Vercel production is still missing S3/media env names: `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, and `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Production S3/CloudFront asset sync and `/admin/storage/monitoring` smoke remain blocked until S3/media env setup is complete.
- Authenticated admin smoke remains blocked until Brian provides/approves a production test user or safe auth path.
- Vercel runtime logs showed non-blocking Node warning/deprecation entries on successful `/merch` and `/members` responses; monitor if they become noisy.

## Next session

- **Goal:** Finish production provider proof: add S3/media env names, sync media assets, then run owner-approved production DB/Stripe seed-link and authenticated admin smoke.
- **Inputs to read:**
  - `docs/sprints/SESSION_0169.md`
  - `docs/runbooks/aws-s3-operator-runbook.md`
  - `docs/runbooks/stripe-setup-runbook.md`
  - `docs/runbooks/product-catalog-seed.md`
  - `docs/runbooks/database.md`
  - `docs/runbooks/deployment.md`
  - `apps/web/scripts/setup-ronin-stripe-products.ts`
  - `apps/web/scripts/setup-merch-stripe-products.ts`
  - `apps/web/scripts/audit-payment-entitlements.ts`
- **First task:** Re-run `vercel env ls production`; if S3/media names are present, redeploy if needed, sync `apps/web/public/images/merch` to the production bucket/CloudFront path, then run `/gear`, `/merch`, `/admin/storage/monitoring`, and `/admin/billing/monitoring` smoke.
- **Blocked on user:** production DB/Stripe writes require Brian to provide an intentional secure production env path or run the owner command sequence directly; authenticated admin smoke requires a safe production auth path.

## Task log

- `SESSION_0169_TASK_01` - landed
- `SESSION_0169_TASK_02` - landed as provider-readiness decision; production writes blocked
- `SESSION_0169_TASK_03` - landed

## Review log

- `SESSION_0169_REVIEW_01` - Full close review in `docs/protocols/project-log.md`.

## Hostile close review

- **Doug verdict:** Amber-green. Public production route smoke is clean and directly resolves the SESSION_0168 deploy-route concern. Provider readiness is still amber because S3/media and authenticated admin smoke are not proven.
- **Giddy verdict:** Amber. Dirstarter alignment is preserved: Vercel deploy, env variables, Stripe secret/webhook model, and S3-compatible env setup are being extended rather than replaced. No live DB/Stripe writes were run from unsafe local env.
- **Dirstarter docs check:** live docs checked 2026-05-15 UTC for deployment, environment setup, payments, and storage.
- **Stripe docs check:** official go-live and webhook docs checked 2026-05-15 UTC; live Stripe writes were not run.
- **Score:** 8.8/10. Public deploy proof is strong; score is capped by missing S3/media env proof and blocked production seed/link/admin smoke.

## ADR / ubiquitous-language check

- No ADR required. This session verified deployment/provider readiness against existing Stripe/S3/deployment architecture.
- No ubiquitous-language update required. No new domain term or changed business definition was introduced.

## Reflections

- The most useful outcome was that the supposed deploy blocker had already cleared: Vercel production is on `6a19060`, and the public route failures from SESSION_0167/0168 are gone.
- The main risk shifted from code to provider control. We can prove public pages, but production DB/Stripe writes still need an intentional secret-handling step.
- S3 setup needs exact Vercel env names, not a generic "S3 configured" checkbox. The user question surfaced the right operational gap at the right time.
- The `DIRECT_URL` runbook guidance is worth revisiting later. Current Prisma 7 config works with `DATABASE_URL`, but direct-vs-pooled migration separation is still a production-hardening concern.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0169.md` created with JETTY frontmatter; `docs/protocols/project-log.md` and `docs/knowledge/wiki/index.md` updated with current session references and `last_agent` |
| Backlinks/index sweep | `SESSION_0169` pairs with prior session/runbooks/project-log/closing; project-log frontmatter backlinks include `docs/sprints/SESSION_0169.md`; wiki index includes `SESSION_0169` row |
| Wiki lint | `bun run wiki:lint` exited 0 with 0 errors and 487 repo-wide R8 warnings; no warnings were reported for `SESSION_0169`, `project-log.md`, or `index.md` |
| Kaizen reflection | Reflections section present |
| Hostile close review | `SESSION_0169_REVIEW_01` appended in `docs/protocols/project-log.md`; Doug/Giddy verdict recorded above |
| Review & Recommend | Next session goal, inputs, first task, and blockers recorded |
| Memory sweep | No operator memory write needed beyond session/project log. Carry-forward fact: production public routes are green; provider proof remains blocked on S3/media env and intentional production DB/Stripe access |
| Next session unblock check | Partially blocked on user for production env/auth access; S3 env setup can proceed in Vercel with the variable names recorded |
| Git hygiene | Final branch/status/commit plan reported in bow-out response after commit step |
| Graphify update | Final node/edge/community stats reported in bow-out response after git hygiene |

## Status

closed-full
