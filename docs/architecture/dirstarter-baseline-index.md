---
title: Dirstarter Baseline Index
slug: dirstarter-baseline-index
type: architecture
status: active
created: 2026-05-03
updated: 2026-05-19
last_agent: codex-session-0204
pairs_with:
  - docs/architecture/program-plan.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/lane-ledger.md
  - docs/architecture/uplift/L1-env-deploy-diff-report.md
  - docs/runbooks/baseline-listings-runbook.md
  - docs/knowledge/wiki/dirstarter-uplift-backlog.md
  - docs/sprints/SESSION_0165.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0039.md
  - docs/sprints/SESSION_0137.md
  - docs/sprints/SESSION_0164.md
  - docs/sprints/SESSION_0165.md
  - docs/sprints/SESSION_0203.md
  - docs/sprints/SESSION_0204.md
---

# Dirstarter Baseline Index

> **Execution authority for Dirstarter upstream uplift:** see [`docs/architecture/uplift/epic-2026-05-19.md`](uplift/epic-2026-05-19.md). The P-priority port packages below are the same ones broken into 15 lane-based Codex sessions in the epic doc. Per-lane audit ledger: [`docs/architecture/uplift/lane-ledger.md`](uplift/lane-ledger.md). SESSION_0203 wrote the epic; SESSION_0204 starts at L1.

## Purpose

This is Ronin's current Dirstarter L1 reference map. It records which upstream Dirstarter patterns are active references, which Ronin divergences are intentional, and which upstream changes are candidates for lane-based porting.

## Current Sources

| Source | Status | Use |
| --- | --- | --- |
| Local Dirstarter checkout | HEAD `7e724b6` (`chore/enable-pnpm-pre-post-scripts` locally; snapshot branch label remains `upstream/dirstarter-main-20260514`) | Source for upstream file comparisons. |
| Ronin app | `main` after `7b9e02c` (SESSION_0203 close) | Source for current implementation and new listings runbook. |
| Upstream sync snapshot | `docs/architecture/dirstarter-upstream-sync-2026-05-14.md` | Gate document; do not bypass it. |
| Listings runbook | `docs/runbooks/baseline-listings-runbook.md` | Baseline-first Tool-to-Listing doctrine. |
| L1 env/deploy diff report | `docs/architecture/uplift/L1-env-deploy-diff-report.md` | SESSION_0205 decision input for env/runtime changes. |
| Live Dirstarter docs | Checked 2026-05-19 (`/docs/environment-setup`, `/docs/deployment`, `/docs/authentication`, `/docs/integrations/{email,storage,payments,rate-limiting,analytics}`, `/docs/automation`) | External alignment check for deployment and env assumptions. |

## Dirstarter Alignment Snapshot

| Layer | Dirstarter `7e724b6` | Ronin current | SESSION_0204 disposition |
| --- | --- | --- | --- |
| Update strategy | Dirstarter docs allow merge/rebase/manual updates from upstream, with a clean working tree first. | Ronin has a divergent martial-arts app and a separate Dirstarter reference checkout at the target SHA. | Still lane-based manual porting. No bulk upstream merge. |
| Project structure | App Router, `components/{admin,common,data-table,web}`, feature-scoped `server/`, `services/`, `config/`, `prisma/`. | Ronin keeps the same broad structure plus brand, school-ops, tournament, curriculum, merch, lineage, and infra docs. | Preserve Dirstarter folder conventions for new work; map domain additions explicitly. |
| Deploy/env | Upstream uses `DATABASE_PUBLIC_URL`, `REDIS_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, Vercel AI Gateway vars, and Resend's new contact shape. | Ronin production deploy was stabilized with `apps/web` Vercel root settings, `DIRECT_URL` migration routing, optional integrations, Resend DNS runbooks, and `REDIS_REST_*`. | L1 report written; L2 must choose variable-by-variable without disturbing production deploy truth. |
| API/actions | Upstream has moved to `oRPC` + TanStack Query routers. | Ronin uses `next-safe-action` clients with brand context, audit/rate-limit conventions, and many domain actions. | Unchanged: oRPC remains ADR-level at L10. Do not mass-replace actions. |
| UI primitives | Upstream added Base UI render-prop primitives, `Field`, `ButtonGroup`, `tool-status`, data-table helpers, and `tailwind-variants`. | Ronin uses existing common/data-table/admin primitives and many domain screens. | L5/L6 own UI primitive adoption; no UI work in L1. |
| Listings substrate | Upstream `Tool` now has `ToolTier`, `Rejected`, `Deleted`, `tierPriority`, bookmarks, generated IDs/slugs, and expanded content workflow. | Ronin `Tool` still has `isFeatured`, `Draft/Scheduled/Pending/Published`, owner, categories/tags/reports, post linkage, and martial-arts domain adjacency. | L3/L4 own schema and public listing relabel work; L1 only records current divergence. |
| Vendor SDKs | Upstream Stripe API is `2026-04-22.dahlia`; Resend contact shape no longer takes `RESEND_AUDIENCE_ID`; Redis moved to URL-based `ioredis`. | Ronin has membership billing, merch/Stripe webhooks, Resend magic-link/docs, Printful, and production risk from recent deploy work. | L7 remains separate; L2 may only stage env names needed for future vendor work. |
| Content/SEO | Upstream moved toward database blog and native sitemap/RSS route behavior, with Plausible domain env. | Ronin still has brand-domain behavior, `NEXT_PUBLIC_SITE_URL`-derived Plausible domain, launch content requirements, and multi-brand SEO needs. | L8 owns content/SEO; L2 should avoid single-domain env changes that break multi-brand behavior. |

## Port Packages

| Priority | Package | Cody work | Doug/Giddy gate |
| --- | --- | --- | --- |
| P0 | Baseline map and listings doctrine | Keep this index, the upstream sync snapshot, and the listings runbook linked and current. | No runtime code touched; Graphify query recorded; project-log/wiki updated. |
| P1 | Env/deploy comparison | Compare upstream `.env.example`, `env.ts`, `services/db.ts`, `next.config.ts`, `vercel.json`, sitemap/RSS behavior, and Ronin Vercel runbooks. | Runbook updates before env/runtime changes; protect SESSION_0161 production deploy truth. |
| P2 | Baseline listings relabel plan | Turn `Tool` public copy into `Listing/School Listing` without renaming Prisma/routes; map `ToolTier` and claim/lead needs. | Must preserve Organization, Program, DirectoryProfile, and Membership boundaries; no claimant auto-admin rights. |
| P3 | UI primitive sampling | Evaluate `Field`, `ButtonGroup`, `tool-status`, data-table helpers, and `data-required` labels on one small surface. | Playwright CLI or equivalent visual/interaction proof required. |
| P4 | Vendor SDK review | Review Stripe and Resend API/SDK deltas against membership checkout, merch webhooks, magic links, and emails. | No SDK upgrade without targeted tests and production-risk note. |
| P5 | Content/SEO comparison | Compare upstream native sitemap/RSS/database-blog changes with Ronin brand-domain SEO needs. | Do not disturb production domain behavior; route proof required. |
| P6 | oRPC/API architecture | Decide whether oRPC belongs in Ronin after brand-scope/audit impact review. | ADR required before implementation. |
| P7 | Schema/content deltas | Review bookmarks, posts, `ToolTier`, `ToolStatus`, CUID2, and tier priority only when a feature needs them. | Migration plan, rollback note, typecheck/build proof. |

## Listing Doctrine Lock

The Baseline Listings Runbook is now the controlling document for Tool-to-Listing planning:

```text
Baseline proves the engine.
BBL inherits the engine and adds history, lineage, verification, and prestige.
Do not overbuild the lineage museum before the school listing can generate one clean lead.
```

Immediate implication: the first listings implementation should be Baseline school-listing MVP work, not BBL lineage complexity, and not a second directory stack.

## Gates Before Porting

- Use the clean Dirstarter checkout branch, not the old local `main`.
- Keep one lane per session unless explicitly split.
- Do not mix toolchain, schema, API, and UI migration.
- Check live Dirstarter docs for every touched baseline layer.
- Any env-variable change must update production runbooks and Vercel notes.
- Any API architecture change requires ADR-level review.
- Any browser-facing lane requires Playwright or equivalent proof.
- Close docs/planning sessions full-close when docs are touched.

## SESSION_0204 Refresh Notes

- **Last refreshed:** 2026-05-19 (SESSION_0204, L1 doc-only lane).
- **Upstream verification:** local Dirstarter checkout `HEAD` is `7e724b6`; branch label drifted to `chore/enable-pnpm-pre-post-scripts`, but the target SHA matches the SESSION_0165 snapshot.
- **Runtime scope:** no code, schema, env, Vercel settings, or `.dirstarter-upstream` marker changed in L1.
- **Env/deploy handoff:** see [`docs/architecture/uplift/L1-env-deploy-diff-report.md`](uplift/L1-env-deploy-diff-report.md) for the complete variable-by-variable L2 decision table.
