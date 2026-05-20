---
title: Dirstarter Baseline Index
slug: dirstarter-baseline-index
type: architecture
status: active
created: 2026-05-03
updated: 2026-05-19
last_agent: claude-session-0203
pairs_with:
  - docs/architecture/program-plan.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/lane-ledger.md
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
---

# Dirstarter Baseline Index

> **Execution authority for Dirstarter upstream uplift:** see [`docs/architecture/uplift/epic-2026-05-19.md`](uplift/epic-2026-05-19.md). The P-priority port packages below are the same ones broken into 15 lane-based Codex sessions in the epic doc. Per-lane audit ledger: [`docs/architecture/uplift/lane-ledger.md`](uplift/lane-ledger.md). SESSION_0203 wrote the epic; SESSION_0204 starts at L1.

## Purpose

This is Ronin's current Dirstarter L1 reference map. It records which upstream Dirstarter patterns are active references, which Ronin divergences are intentional, and which upstream changes are candidates for lane-based porting.

## Current Sources

| Source | Status | Use |
| --- | --- | --- |
| Local Dirstarter checkout | `upstream/dirstarter-main-20260514` at `7e724b6` | Source for upstream file comparisons. |
| Ronin app | `main` after `a2f5f87` | Source for current implementation and new listings runbook. |
| Upstream sync snapshot | `docs/architecture/dirstarter-upstream-sync-2026-05-14.md` | Gate document; do not bypass it. |
| Listings runbook | `docs/runbooks/baseline-listings-runbook.md` | Baseline-first Tool-to-Listing doctrine. |
| Live Dirstarter docs | Checked 2026-05-14 | External alignment check for update, structure, deployment, and env assumptions. |

## Dirstarter Alignment Snapshot

| Layer | Dirstarter `7e724b6` | Ronin current | SESSION_0165 decision |
| --- | --- | --- | --- |
| Update strategy | Dirstarter docs allow merge/rebase/manual updates from upstream, with a clean working tree first. | Ronin has a divergent martial-arts app and a separate clean Dirstarter reference checkout. | Use lane-based manual porting. No bulk upstream merge. |
| Project structure | App Router, `components/{admin,common,data-table,web}`, feature-scoped `server/`, `services/`, `config/`, `prisma/`. | Ronin keeps the same broad structure plus brand, school-ops, tournament, curriculum, merch, and infra docs. | Preserve Dirstarter folder conventions for new work. |
| Deploy/env | Dirstarter docs expect Vercel, Next.js preset, `.next`, and production env vars. Upstream uses `DATABASE_PUBLIC_URL`, `REDIS_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, and newer Resend/AI env shape. | Ronin production deploy was stabilized in SESSION_0161/0163 with `apps/web` Vercel root settings, optional integrations, Resend DNS runbooks, and `REDIS_REST_*`. | First implementation lane should be env/deploy comparison before changing runtime env. |
| API/actions | Upstream has moved to `oRPC` + TanStack Query routers. | Ronin uses `next-safe-action` clients with brand context, audit/rate-limit conventions, and many domain actions. | oRPC is ADR-level only. Do not mass-replace actions. |
| UI primitives | Upstream added Base UI render-prop primitives, `Field`, `ButtonGroup`, `tool-status`, data-table helpers, and `tailwind-variants`. | Ronin uses existing common/data-table/admin primitives and many domain screens. | Good low-risk lane after source inventory; UI changes require Playwright proof. |
| Listings substrate | Upstream `Tool` now has `ToolTier`, `Rejected`, `Deleted`, `tierPriority`, bookmarks, generated IDs/slugs, and expanded content workflow. | Ronin `Tool` still has `isFeatured`, `Draft/Scheduled/Pending/Published`, owner, categories/tags/reports, and post linkage. | Revalidate Tool-to-Listing using the Baseline Listings Runbook before schema or route changes. |
| Vendor SDKs | Upstream Stripe, Resend, Prisma, AI, and Redis libraries moved forward. | Ronin has membership billing, merch/Stripe webhooks, Resend magic-link/docs, and production risk from recent deploy work. | Vendor SDK lane must be separate from env/deploy and schema lanes. |
| Content/SEO | Upstream moved toward database blog and native sitemap/RSS route behavior. | Ronin still has `next-sitemap`, brand-domain behavior, and launch content requirements. | Content/SEO can follow production smoke or run as doc-only comparison. |

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
