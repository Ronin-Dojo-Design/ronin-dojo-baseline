---
title: "SESSION 0205 — Dirstarter uplift L2 env/deploy implementation"
slug: session-0205
type: session--implement
status: closed-full
created: 2026-05-20
updated: 2026-05-20
last_agent: codex-session-0205
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0204.md
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/lane-ledger.md
  - docs/architecture/uplift/L1-env-deploy-diff-report.md
  - docs/runbooks/vercel-deploy.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/runbooks/neon-advisory-lock-recovery.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0205 — Dirstarter uplift L2 env/deploy implementation

## Date

2026-05-20

## Operator

Brian + codex-session-0205 (Cody implementation, Doug verification)

## Goal

Apply the L1 env/deploy report safely: port only upstream-compatible env/deploy behavior that does not destabilize Ronin production deploys, preserve `DIRECT_URL` migration routing, and prove local plus Vercel readiness without printing secret values.

## Bow-in notes

- **Branch:** `session-0205-uplift-L2-env-deploy-implementation`, cut from `main` at `c93a979`.
- **Graphify first:** satisfied before repo-wide grep.
- **Graphify stats before work:** 6665 nodes / 11855 edges / 865 communities / 1270 files tracked.
- **Graphify queries used:**
  - `L2 env deploy DATABASE_PUBLIC_URL DIRECT_URL REDIS Resend Plausible AI Gateway`
  - `env ts services db redis resend plausible vercel next config DIRECT_URL`
- **Vercel pre-task check:** latest Production was Ready; latest Preview was Error.
- **Preview Error inspection:** latest Preview `ronin-dojo-baseline-ahpamyagn...` was from branch `docs-baseline-product-pack` at commit `0a35b98` and failed with Prisma P1002 advisory-lock timeout while using the pooled Neon endpoint. Current Vercel env-name check confirmed `DIRECT_URL` is encrypted for Preview and Production.
- **Production post-push finding:** first main production deploy for `122c7b5` still hit the pooler during `prisma migrate deploy`, proving the Vercel `DIRECT_URL` value/name state was not sufficient on its own. L2 added a defensive Prisma config normalization to strip Neon's `-pooler` host suffix for Vercel Prisma CLI migrations.
- **Secret safety:** no env values printed; Vercel checks were name/scope only.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Env schema/example, DB service build-time connection fallback, Plausible domain override, Next deploy settings, Vercel deploy docs. |
| Extension or replacement | Extension. Ronin keeps production-stable differences where upstream assumptions would regress runtime behavior. |
| Why justified | Upstream `7e724b6` added useful env surfaces, but Ronin's Neon pooler/direct split, Upstash REST setup, Resend audience callers, and app-root Vercel config are current production truth. |
| Risk if bypassed | Blind upstream copy could remove `DIRECT_URL`, force unused required env vars, break newsletter/contact code, or change active Vercel root/build behavior. |

## Tasks

### SESSION_0205_TASK_01 — Apply safe env var additions + removals

- **Agent:** Cody
- **Status:** complete.
- **Result:** Added optional `DATABASE_PUBLIC_URL`, `NEXT_PHASE`, and `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`; kept AI Gateway vars already present; removed the dead `GOOGLE_GENERATIVE_AI_API_KEY` env declaration after confirming no runtime use.

### SESSION_0205_TASK_02 — Update DB/deploy config surfaces

- **Agent:** Cody
- **Status:** complete.
- **Result:** `services/db.ts` now uses `DATABASE_PUBLIC_URL` only during `PHASE_PRODUCTION_BUILD` when set, otherwise `DATABASE_URL`. `prisma.config.ts` keeps `DIRECT_URL`/direct Neon routing for migrations and now defensively normalizes accidental pooler URLs during Vercel deploys. `next.config.ts` picked up upstream-safe Turbopack build cache/prefetch flags, while image patterns, rewrites, cron path, and app-root Vercel config stayed stable.

### SESSION_0205_TASK_03 — Verification + ledger + close

- **Agent:** Doug + Cody
- **Status:** complete.
- **Result:** Local validation passed with one raw-command caveat recorded below. Lane ledger, wiki, runbooks, project-log, and `.dirstarter-upstream` partial-port note were updated without changing `copied_at_sha`.

## Decisions resolved

1. `DIRECT_URL` remains the Vercel Prisma CLI migration route. `DATABASE_PUBLIC_URL` is runtime/build-only and optional.
2. `REDIS_REST_URL` and `REDIS_REST_TOKEN` stay because `services/redis.ts` still uses Upstash REST.
3. `RESEND_AUDIENCE_ID` stays because newsletter/admin subscriber code still depends on it; Resend contact-shape migration remains L7.
4. `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is an optional override only; absent values preserve the existing `NEXT_PUBLIC_SITE_URL`-derived domain behavior.
5. `GOOGLE_GENERATIVE_AI_API_KEY` was removed from env declarations because no runtime code still reads it.
6. `apps/web/vercel.json` remains the active deploy config; root `vercel.json` remains historical fallback.
7. `.dirstarter-upstream` received an L2 partial-port note only; `copied_at_sha` stays `c42e8bbc9a093daa8bb70faebfc552399134ee13`.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/env.ts` | Adds optional L2 env names; removes legacy Google env declaration. |
| `apps/web/.env.example` | Documents optional DB/public/Plausible names plus local Prisma CLI envs. |
| `apps/web/services/db.ts` | Adds build-phase `DATABASE_PUBLIC_URL` fallback without touching migration routing. |
| `apps/web/prisma.config.ts` | Defensively normalizes Vercel Prisma CLI URLs to the Neon direct host when a pooler URL is supplied. |
| `apps/web/app/(web)/layout.tsx` | Uses optional Plausible domain override with existing site-domain fallback. |
| `apps/web/next.config.ts` | Adds upstream-safe Turbopack build cache and prefetch flags. |
| `apps/web/.dirstarter-upstream` | Adds L2 partial-port note; no SHA bump. |
| `scripts/check-vercel-env-parity.ts` | Includes Vercel-only required `DIRECT_URL` in name/scope parity checks. |
| `apps/web/server/web/lead/actions.test.ts` | Adds `next/server.after` test harness mock so isolated app tests pass. |
| `docs/runbooks/vercel-deploy.md` | New active deploy/env readiness runbook. |
| `docs/runbooks/dev-environment.md` | Updates env variable guidance. |
| `docs/runbooks/database.md` | Corrects Prisma 7 direct URL guidance. |
| `docs/runbooks/neon-advisory-lock-recovery.md` | Links env parity guard and Vercel deploy runbook. |
| `docs/architecture/uplift/lane-ledger.md` | Appends L2 row. |
| `docs/architecture/uplift/epic-2026-05-19.md` | Marks L2 complete. |
| `docs/knowledge/wiki/index.md` | Adds SESSION_0205 and Vercel deploy runbook. |
| `docs/protocols/project-log.md` | Adds SESSION_0205 entry. |
| `docs/sprints/SESSION_0205.md` | New close artifact. |

## Verification evidence

- `vercel inspect <latest-preview> --logs` — inspected latest Error Preview before runtime env/deploy changes; failure was advisory-lock P1002 on older preview branch.
- `vercel env ls` — `DIRECT_URL` encrypted in Preview and Production; no values printed.
- `bun scripts/check-vercel-env-parity.ts --dry-run` — 6 required deploy env names listed.
- `bun scripts/check-vercel-env-parity.ts` — all 6 required vars present in both Production and Preview.
- `pnpm --filter dirstarter typecheck` — passed.
- `bunx prisma validate` from `apps/web` — schema valid.
- `cd apps/web && bun biome check .` — passed; 962 files checked.
- Raw `bun test` from repo root — failed because it loads Playwright E2E specs under Bun and initially lacked app-dir env loading. This is not the app test command recorded in `docs/runbooks/sop-test-writing.md`.
- `cd apps/web && bun test --isolate --path-ignore-patterns='e2e/**'` — passed; 236 tests / 855 assertions.
- `bun run wiki:lint` — 0 errors / 497 warnings across 392 markdown files (pre-existing warning debt).
- Graphify refresh — 6678 nodes / 11851 edges / 817 communities / 1271 files tracked.
- Vercel Preview/Production Ready proof — recorded in bow-out response after branch/main pushes.
- Initial post-push Production deploy `ronin-dojo-baseline-nicu4tye4...` — failed with P1002 and datasource host containing `-pooler`; fixed by the follow-up Prisma config normalization commit.

## Review log

### SESSION_0205_REVIEW_01 — L2 env/deploy implementation

- **Reviewed tasks:** SESSION_0205_TASK_01, SESSION_0205_TASK_02, SESSION_0205_TASK_03.
- **Sources:** L1 env/deploy report, upstream `7e724b6` env/deploy files, Ronin env/db/redis/resend/plausible/Vercel files, Neon advisory-lock runbook, Vercel deploy/domain runbooks, Vercel CLI name/scope checks and deployment logs.
- **Verdict:** Pass. The implementation preserves Ronin's production deploy invariants while adding the safe upstream env surface needed for future lanes. The production P1002 recurrence was caught after `main` push and addressed in-session with a defensive Prisma CLI URL normalization; no schema or migration files changed, and no secret values were printed.
- **Residual risk:** Optional `DATABASE_PUBLIC_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, and `AI_GATEWAY_API_KEY` are not required in Vercel. Operators should add real values to both Preview and Production only when those integrations are intentionally enabled.

## Next session

SESSION_0206 is L3 — Schema port wave. Do not start it in SESSION_0205. Begin from `docs/architecture/uplift/epic-2026-05-19.md` § "L3 — SESSION_0206" and the updated lane ledger.

## Status

closed-full
