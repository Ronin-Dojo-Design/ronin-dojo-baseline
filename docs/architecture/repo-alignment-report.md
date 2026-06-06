---
title: "Repo Alignment Report"
slug: repo-alignment-report
type: report
status: active
created: 2026-06-06
updated: 2026-06-06
last_agent: codex-session-0351
pairs_with:
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/knowledge/wiki/drift-register.md
  - docs/architecture/data-model.md
  - docs/sprints/SESSION_0351.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Repo Alignment Report

## Purpose

Reusable on-demand or weekly sweep for repo truth alignment. Use it when the repo feels out of step across schema, ADRs, architecture docs, admin surfaces, generated docs, monitoring, and session ledgers.

## How To Run The Sweep

1. Run `graphify stats`.
1. Query the lane before broad search, for example:
   - `graphify query "schema enum boolean relationship Passport Organization Membership" --budget 2500`
   - `graphify query "admin dashboard docs navigator graphify monitoring cron storage security" --budget 2500`
1. Open exact files Graphify selects.
1. Compare current code/session truth against architecture docs and ADRs.
1. Patch clear stale text directly.
1. Route unbuilt or bigger work to:
   - `docs/knowledge/wiki/wiring-ledger.md` for wiring/code gaps.
   - `docs/knowledge/wiki/drift-register.md` for contradictions.
   - `docs/knowledge/wiki/manual-boundary-registry.md` for owner/env/manual proof.
   - A new ADR only when a decision is actually made.

## SESSION_0351 Sweep

### Current facts

- `apps/web/prisma/schema.prisma` now has 119 models and 80 enums.
- `ENTER_THE_DOJO.md` legacy doctrine remains useful, but WordPress/Pods language maps to Prisma/server actions/query payloads/ContentAtom in this repo.
- Admin monitors exist for Stripe webhook health and storage readiness:
  - `/admin/billing/monitoring`
  - `/admin/storage/monitoring`
- Generated repo navigation artifacts exist:
  - `docs/index.html` from `bun run docs:nav`
  - `apps/web/public/graphify.html` from `bun run graphify:viz`
- The admin dashboard now has an owner/admin Repo Docs entry that links the generated docs navigator and
  static Graphify HTML.
- No durable app pulse/cron layer is currently implemented in `vercel.json`; cron/pulse work is a follow-up design.

### Clear doc patches made

- `data-model.md`: updated model/enum counts and status language from old 97/65 wording.
- `feature-data-prerequisites.md`: tournament seed status is no longer "not seeded"; current seed and smoke proof exist.
- `security-privacy-payments-monitoring-plan.md`: monitoring status now names the existing billing/storage monitor surfaces and records pulse/cron as future work.
- `dirstarter-architecture-map.md`: current-state audit now points to active source maps instead of old S6/S8 missing-slice claims.
- `ADR 0008`: records that `lastActiveBrandId` exists in schema, while the full switcher UI/session proof remains open.
- `docs/architecture/**/*.md`: maintained architecture docs now pass DavidAnson `markdownlint-cli2`; source snapshots under
  `docs/architecture/source/**` are ignored instead of rewritten.

### Status cleanup handled

- `docs/sprints/_archive/SESSION_0039.md` frontmatter now matches the body: `closed-full`.
- `docs/sprints/_archive/SESSION_0123.md` frontmatter now matches the body: `closed-quick`.
- `docs/knowledge/wiki/index.md` rows now match both archived session files.

## Pulse / Automation Candidates

Until the YouTube summary is added, define a "pulse" as a scheduled or on-demand digest that runs existing checks and reports a small owner-readable status.

| Pulse | Current substrate | Candidate output | Ledger |
| --- | --- | --- | --- |
| Billing pulse | `getStripeWebhookOperationsMonitor()` | READY/BLOCKED, failed webhook count, stale processing count | WL-P2-8 |
| Storage pulse | `getStorageOperationsMonitor()` | CONFIGURED/NEEDS_SETUP, missing assets, projected cost | WL-P2-8 |
| Security pulse | security risk/checklist docs + future tests/logs | auth rejects, brand-scope rejects, rate-limit failures | WL-P2-8 |
| Docs pulse | `bun run wiki:lint`, `bun run docs:nav`, Graphify stats/export | lint result, stale generated artifacts, graph stats | WL-P2-8 |
| Site health pulse | future route smoke / Playwright summary | public/admin route pass/fail, console errors | WL-P2-8 |

Do not wire Vercel Cron until the exact route, secret, recipients, and failure policy are decided.

## Fallow Notes

`npx fallow audit --changed-since HEAD --format human` is useful as a changed-file quality pulse, but
SESSION_0351 intentionally did not auto-fix its findings:

- Potential unused deps require import/runtime verification before removal.
- Complexity findings point at an existing admin sidebar and the one-off markdownlint fixer.
- Follow-up is tracked as WL-P2-10.

## Next Sweep Inputs

- YouTube/pulse summary from Brian.
- Latest `SESSION_NNNN.md`.
- Current `git log --oneline -12 -- docs/architecture docs/knowledge/wiki apps/web/app/admin apps/web/server/admin`.
- Graphify queries listed above.

## Relationships

- [Wiring Ledger](../knowledge/wiki/wiring-ledger.md)
- [Drift Register](../knowledge/wiki/drift-register.md)
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md)
- [Data Model](data-model.md)
- [SESSION_0351](../sprints/SESSION_0351.md)
