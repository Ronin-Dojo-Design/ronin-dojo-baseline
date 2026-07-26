---
title: "SESSION 0241 — Repo cleanup, workflow refinement, velobase-harness parity review"
slug: session-0241
type: session--open
status: closed
created: 2026-05-24
updated: 2026-05-24
last_agent: copilot-session-0241
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0240.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0241 — Repo cleanup, workflow refinement, velobase-harness parity review

## Date

2026-05-24

## Operator

Brian + copilot-session-0241 (Petey orchestrating)

## Goal

Repo cleanup, workflow refinement, and evaluate velobase/velobase-harness for patterns worth adopting (billing, workers, anti-abuse, affiliate, ad attribution).

## Bow-in

### Previous session

- SESSION_0240 (`in-progress` on Codex) — lineage public parity chrome plan, pivoted to BBL product foundation slice. Still replanning; no code landed yet.
- SESSION_0239 (`closed-full`) landed dashboard private chrome. Next session note pointed to lineage `[treeSlug]` public parity.

### Branch and worktree

- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Branch: `main`
- Status: clean (only untracked `docs/sprints/SESSION_0240.md` from parallel Codex session)
- HEAD: `2de5aa3`

### Graphify check

- Graph current: 6881 nodes, 11010 edges, 999 communities, 1336 files
- No `graphify update` needed (done at end of last session, HEAD matches)

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Workflow/protocol docs, repo hygiene — no L1 code changes expected |
| Extension or replacement | N/A — this is a cleanup/review session |
| Why justified | Repo needs housekeeping between implementation sprints; velobase-harness review informs future billing/worker architecture |
| Risk if bypassed | Accumulated repo debt slows future sessions; missed patterns from velobase-harness may lead to reinventing infrastructure |

### FAILED_STEPS check

- No open/mitigated entries relevant to cleanup or review work.

### Drift register check

- D-001 through D-016 resolved/closed. No open drift blocks this session.

### Velobase Harness assessment

Velobase Harness (`github.com/velobase/velobase-harness`) is an **open-source AI SaaS boilerplate** (GitHub template, MIT license). NOT an MCP server.

**Stack:** Next.js App Router + Prisma + Stripe/LemonSqueezy + BullMQ workers + Redis + PostHog + Hono optional API.

**Interesting patterns for Ronin Dojo:**
1. **Usage-based billing / credits lifecycle** — could inform S10 Stripe integration
2. **BullMQ background workers** (11 queues) — relevant for tournament bracket scoring, email campaigns, data imports
3. **Anti-abuse guardrails** — rate limits, disposable email checks, signup device signals
4. **Affiliate/referral engine** — double-entry ledger, refund clawback (future school referral programs)
5. **Ad attribution** — server-side conversion tracking (future marketing)
6. **Multi-service architecture** — web/worker/API split with `SERVICE_MODE` env var

**Recommendation:** Do NOT install or fork. Cherry-pick patterns into ADR notes for future sprints (S10 billing, post-launch growth). The monolithic `src/` structure conflicts with our L1 Dirstarter `apps/web/` monorepo conventions.

## Petey plan

### Tasks

| ID | Task | Done criteria | Assignee |
| --- | --- | --- | --- |
| SESSION_0241_TASK_01 | Repo cleanup — identify and clean stale/orphaned files, fix broken backlinks, tidy sprint docs | `git status` clean, no orphaned references | Cody |
| SESSION_0241_TASK_02 | Workflow refinement — review and update WORKFLOW_5.0.md session calendar, lane definitions, any stale protocol references | Protocol docs are current and accurate | Cody |
| SESSION_0241_TASK_03 | Velobase-harness parity notes — document cherry-pickable patterns as ADR candidates or backlog items for future sprints | Notes captured in this SESSION file and/or a new ADR draft | Petey |

### Task priority

Start with TASK_01 (cleanup), then TASK_02 (workflow refinement). TASK_03 is already substantially complete from bow-in assessment above.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0241_TASK_01 | done | Repo cleanup — archived 230 sprint docs (0001–0220 + oddly-named + closed petey-plans) to `docs/sprints/_archive/`, keeping only SESSION_0221+ active |
| SESSION_0241_TASK_02 | done | Workflow refinement — updated WORKFLOW_5.0.md launch board (NOW/NEXT/READY/POST-LAUNCH reflect reality at day +6), updated launch strategy status, updated program-plan.md superseded note |
| SESSION_0241_TASK_03 | done | Velobase-harness parity review — created `docs/architecture/velobase-harness-patterns.md` with 5 cherry-pickable patterns and implementation priority |
| SESSION_0241_TASK_04 | done | Lineage BBL foundation slice: `findPublishedLineageTreeSlugs()` + `findPublishedLineageTrees()` queries, `/lineage/[treeSlug]` public parity uplift (getPageMetadata, Breadcrumbs, Intro, Section, StructuredData, generateStaticParams), `/lineage` index page with card grid + cross-links |
| SESSION_0241_TASK_05 | done | Close status consolidation: merged `closed-quick`/`closed-full`/`closed-unclean` into single `closed` status. Updated `closing.md`, `opening.md`, `.github/copilot-instructions.md`, WORKFLOW_5.0.md. Removed 110-line stale session calendar from WORKFLOW_5.0. |

## What landed

1. **Sprint docs archived:** 230 files moved from `docs/sprints/` to `docs/sprints/_archive/` (SESSION_0001–0220, oddly-named half-sessions, closed petey-plans 0082/0083/0084). Active directory now contains only SESSION_0221–0241 + petey-plan-0229 + lanes + template.
2. **WORKFLOW_5.0.md updated:** Launch board reflects reality (6 days past May 18 target), NOW/NEXT sections current, READY FOR LAUNCH includes recent parity uplift work, POST-LAUNCH includes velobase-harness patterns.
3. **program-plan.md updated:** Superseded note now includes SESSION_0241 date and "6 days past target" reality check.
4. **Velobase-harness patterns doc:** `docs/architecture/velobase-harness-patterns.md` documents 5 patterns (billing credits, BullMQ workers, anti-abuse, affiliate, ad attribution) with implementation priority and sprint targets. Decision: do NOT install/fork, cherry-pick only.
5. **Lineage BBL foundation slice (SESSION_0240 continuation):**
   - `findPublishedLineageTreeSlugs()` — cached SSG slug query for `generateStaticParams`
   - `findPublishedLineageTrees({ brand, take })` — lightweight card/listing query with member count, discipline, organization
   - `/lineage/[treeSlug]` uplifted — `getPageMetadata`, `Breadcrumbs`, `Intro`, `Section`, `StructuredData` (CollectionPage JSON-LD), `generateStaticParams`, removed ad-hoc `H4`/`Note`/`<section>` wrappers
   - `/lineage` index page created — card grid with discipline/org badges + member count, cross-links to disciplines/schools/courses, CollectionPage JSON-LD
   - TypeScript typecheck: zero errors

## Files touched

- `docs/sprints/_archive/` — 230 files moved in
- `docs/sprints/SESSION_0241.md` — created + updated
- `docs/protocols/WORKFLOW_5.0.md` — launch board + launch strategy status updated
- `docs/architecture/program-plan.md` — superseded note updated
- `docs/architecture/velobase-harness-patterns.md` — created
- `apps/web/server/web/lineage/queries.ts` — added `findPublishedLineageTreeSlugs` + `findPublishedLineageTrees`
- `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` — uplifted to public parity chrome
- `apps/web/app/(web)/lineage/page.tsx` — created (index/listing page)

## Decisions resolved

- Velobase Harness is a GitHub template boilerplate, NOT an MCP. Do not install or fork. Cherry-pick patterns only.
- Sprint docs 0001–0220 archived to reduce noise. Active window is SESSION_0221+.
- Launch target reality acknowledged: 6 days past May 18.

## Open decisions / blockers

- SESSION_0240 is in-progress on Codex — runs independently, no conflict risk.
- Which velobase-harness patterns to formally ADR? Rate limiting is highest priority.
- What's the revised launch date? Need Brian to set a new target.

## Next session

### Goal
Ship the next product-facing work (lineage public parity or Baseline content fill — whichever unblocks launch fastest).

### Inputs to read

- SESSION_0240 close notes (when Codex finishes)
- `docs/architecture/velobase-harness-patterns.md` for any Brian-approved items

### First task
Read SESSION_0240 outcome and continue lineage public chrome if it didn't land, or move to next launch-critical surface.
