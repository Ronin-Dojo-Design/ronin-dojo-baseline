---
title: "SESSION 0201 — Neon DIRECT_URL migration routing"
slug: session-0201
type: session--implement
status: closed-full
created: 2026-05-19
updated: 2026-05-19
last_agent: codex-session-0201
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0200.md
  - docs/protocols/petey-plan.md
  - docs/runbooks/neon-advisory-lock-recovery.md
  - docs/runbooks/prisma-workflow.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0201 — Neon DIRECT_URL migration routing

## Date

2026-05-19

## Operator

Brian + codex-session-0201 (Petey/Cody)

## Goal

Fix the recurring Neon/Vercel `pg_advisory_lock(72707369)` deploy failure before resuming lineage v1 by routing Prisma CLI migration commands through Neon's direct non-pooler connection on Vercel while leaving app runtime on pooled `DATABASE_URL`.

## Bow-in notes

- **Latest previous session:** SESSION_0200 — shared `parseSort` helper, `searchTechniques` allowlist, FS-0021 runbook patch, stale PR triage, and the third recorded Neon advisory-lock recurrence.
- **Previous next-session candidate:** Add `DIRECT_URL` env var plus Prisma config wiring as the structural fix for repeated advisory-lock failures; lineage v1 / PR #22 follows once deploys are stable.
- **Owner directive:** Implement the accepted SESSION_0201 plan, full-close, run Graphify update after git hygiene, stage/commit/push to `main`.
- **Branch at bow-in:** `main` at `9272a01`.
- **Working tree at bow-in:** clean.
- **Graphify status:** 6482 nodes / 11586 edges / 786 communities / 1262 tracked files.
- **Graphify query used:** `SESSION_0201 DIRECT_URL Neon advisory lock prisma config project log wiki index`.
- **Vercel env check:** `vercel env ls` shows `DIRECT_URL` encrypted for Preview and Production. No env values were printed.
- **Prisma version correction:** repo uses Prisma `7.8.0`; `@prisma/config` exposes `datasource.url` and `shadowDatabaseUrl`, not `directUrl`. The structural fix must route Prisma CLI config to `DIRECT_URL` on Vercel, not add schema/config `directUrl`.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database + deployment. |
| Extension or replacement | Extension. Dirstarter expects PostgreSQL env vars and Vercel deployment; Ronin adds Neon direct-URL routing for Prisma CLI migrations because production uses Neon pooler for runtime and `prisma migrate deploy` for prebuild. |
| Why justified | SESSION_0189, SESSION_0199, and SESSION_0200 recorded recurring advisory-lock timeouts at Vercel prebuild. Prisma 7 config supports using a separate CLI datasource URL via `prisma.config.ts`; runtime remains on the existing Dirstarter-style pooled DB adapter path. |
| Risk if bypassed | Further Vercel preview/production deploys can fail intermittently on `pg_advisory_lock(72707369)`, especially during parallel PR previews or deploy storms. |

## Petey plan

### Goal

Route Prisma CLI migrations through `DIRECT_URL` on Vercel, update the advisory-lock runbook to match Prisma 7, verify local gates, then push one main commit and confirm deploy readiness.

### Tasks

#### SESSION_0201_TASK_01 — Bow-in ledger + env proof

- **Agent:** Petey
- **What:** Create SESSION_0201 and project-log task entries; confirm `DIRECT_URL` exists without printing values.
- **Done means:** SESSION file and task log exist before code edits; Vercel env name/scope recorded.
- **Depends on:** nothing.

#### SESSION_0201_TASK_02 — Prisma 7 migration-routing fix

- **Agent:** Cody
- **What:** Update `apps/web/prisma.config.ts` so Prisma CLI uses `DIRECT_URL` on Preview/Production and local fallback remains safe.
- **Done means:** `bunx prisma validate` and `VERCEL_ENV=preview DIRECT_URL="$DATABASE_URL" bunx prisma validate` both pass.
- **Depends on:** TASK_01.

#### SESSION_0201_TASK_03 — Runbook + verification + full close

- **Agent:** Petey + Doug
- **What:** Patch Neon/Prisma docs, run static gates, verify deployment, full-close, Graphify update, commit, push.
- **Done means:** docs reflect Prisma 7 behavior; gates and deploy evidence are recorded; main is pushed.
- **Depends on:** TASK_02.

### Scope guard

No lineage v1 / PR #22 work in this session unless the Neon fix is verified clean and the owner explicitly expands scope.

## What landed

- **Prisma 7 migration routing fixed:** `apps/web/prisma.config.ts` now routes Prisma CLI commands to `DIRECT_URL` whenever `VERCEL_ENV` is `preview` or `production`.
- **Runtime DB path unchanged:** `apps/web/services/db.ts` still uses pooled `DATABASE_URL` through `PrismaPg`, so application runtime remains on Neon's pooler while build-time `prisma migrate deploy` uses the direct endpoint.
- **Local fallback preserved:** local Prisma CLI commands use `DIRECT_URL` if set, otherwise `DATABASE_URL`; conditional `SHADOW_DATABASE_URL` behavior remains unchanged for local `migrate dev`.
- **Vercel env proof recorded:** `vercel env ls` shows `DIRECT_URL` encrypted for Preview and Production; no env values printed.
- **Runbook corrected:** `docs/runbooks/neon-advisory-lock-recovery.md` now describes the Prisma 7 `datasource.url` structural fix, parallel-PR deploy trigger, and the zero-row `pg_locks` caveat from SESSION_0200.
- **Wiki/session index repaired:** `docs/knowledge/wiki/index.md` was missing SESSION_0200; SESSION_0200 and SESSION_0201 are now listed.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/prisma.config.ts` | Selects `DIRECT_URL` for Vercel Prisma CLI commands; local fallback stays safe. |
| `docs/runbooks/neon-advisory-lock-recovery.md` | Prisma 7 structural-fix section + updated prevention/diagnostic wording. |
| `docs/sprints/SESSION_0201.md` | Bow-in, plan, evidence, and full-close record. |
| `docs/protocols/project-log.md` | SESSION_0201 task/review/result ledger. |
| `docs/knowledge/wiki/index.md` | Added missing SESSION_0200 row and SESSION_0201 row. |

## Decisions resolved

- **Use Prisma 7 config, not `directUrl`.** `@prisma/config` in `node_modules` exposes `datasource.url` and `shadowDatabaseUrl`; official Prisma docs say connection URLs are configured in Prisma Config for current Prisma. Therefore the Vercel migration URL is selected by assigning `datasource.url` to `DIRECT_URL` in `prisma.config.ts`.
- **Keep runtime and migration URLs separate.** Runtime remains on pooled `DATABASE_URL` in `services/db.ts`; migration/prebuild uses direct `DIRECT_URL`.
- **No schema migration/ADR needed.** No data model or architectural ownership change; this is deployment configuration plus runbook correction.
- **No lineage work this session.** PR #22 remains queued until the deploy-lock fix is verified.

## Open decisions / blockers

- **Post-push Vercel deploy verification:** final response will report the production deploy status after this close commit is pushed. The SESSION file avoids a second self-referential deploy loop.
- **Credential hygiene:** SESSION_0200_FINDING_05 remains an owner-side rotation follow-up for the earlier leaked `DATABASE_URL` value.
- **Lineage v1:** PR #22 remains open/mergeable with Vercel FAILURE from before this session; pick up next once deploys are stable.

## Next session

- **Goal:** Resume lineage v1 / PR #22 once the Neon deploy path is stable.
- **Inputs to read:** `docs/sprints/SESSION_0201.md`, `docs/runbooks/lineage-listing-runbook.md`, PR #22 status, `docs/architecture/lineage/lineage-react-canvas-port-plan.md`.
- **First task:** Re-check PR #22 Vercel failure and decide whether to retarget, retrigger, or fold the branch into a fresh lineage v1 session.

## Task log

- SESSION_0201_TASK_01
- SESSION_0201_TASK_02
- SESSION_0201_TASK_03

## Review log

- SESSION_0201_REVIEW_01

## Hostile close review

- **Giddy/Doug verdict:** Pass. The fix is narrow, matches Prisma 7's config surface, and does not alter runtime DB usage or schema.
- **Dirstarter alignment:** Checked Dirstarter Prisma, Postgres hosting, and deployment docs. This extends Dirstarter's Vercel/Postgres baseline for a Neon pooler/direct-URL production shape; it does not replace a Dirstarter layer.
- **Security:** Passed. Env verification printed names/scopes only; no secret values printed.
- **Data integrity:** Passed. No schema or migration file changed. `prisma validate` passed in normal and simulated Vercel `DIRECT_URL` modes.
- **Score:** 9.6/10. The recurring advisory-lock risk is structurally addressed; residual risk is only post-push deployment observation.

## ADR / ubiquitous-language check

- **ADR:** Not needed. This does not change architectural ownership or data contracts; it implements an operational deployment fix already queued by SESSION_0200 findings.
- **Ubiquitous language:** Not needed. No new domain term introduced.

## Reflections

- The important correction was Prisma-version-specific: SESSION_0200 queued `directUrl`, but Prisma 7 removed that config field. Reading the installed `@prisma/config` types prevented a stale fix.
- `vercel env ls` is a safe proof tool here because it prints only encrypted variable names/scopes, not values.
- Wiki index drift from SESSION_0200 was caught during the close sweep; the current session repaired that gap while touching the index anyway.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs have `updated: 2026-05-19`; `last_agent` set to `codex-session-0201` where this session changed canonical docs. |
| Backlinks/index sweep | `neon-advisory-lock-recovery.md` backlinks now include SESSION_0201; `project-log.md` backlinks now include SESSION_0201; wiki index includes SESSION_0200 and SESSION_0201. |
| Wiki lint | `bun run wiki:lint` exited 0 with 497 warnings: 4 orphan warnings and 493 pre-existing R8 formatting warnings. No errors. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0201_REVIEW_01 in project log; pass at 9.6/10. |
| Review & Recommend | Next session goal written: resume lineage v1 / PR #22 once deploy path is stable. |
| Memory sweep | Runbook updated; no separate operator memory file needed because the durable fact belongs in the Neon runbook and project log. |
| Next session unblock check | Unblocked after post-push deploy status is verified in final response; lineage PR #22 remains the next target. |
| Git hygiene | Final response will report branch/status/commit/push after git hygiene completes. |
| Graphify update | Final response will report post-commit `graphify update .` stats. |

## Status

closed-full
