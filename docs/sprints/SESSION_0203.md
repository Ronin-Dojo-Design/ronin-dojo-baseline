---
title: "SESSION 0203 — Dirstarter upstream uplift epic planning"
slug: session-0203
type: session--plan
status: closed-full
created: 2026-05-19
updated: 2026-05-19
last_agent: claude-session-0203
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0202.md
  - docs/protocols/petey-plan.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/architecture/dirstarter-baseline-index.md
  - docs/knowledge/wiki/dirstarter-uplift-backlog.md
  - docs/runbooks/baseline-listings-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0203 — Dirstarter upstream uplift epic planning

## Date

2026-05-19

## Operator

Brian + claude-session-0203 (Petey, planning-only)

## Goal

Plan the full Dirstarter upstream uplift backlog as a multi-session epic — files to touch, data wiring, ASCII/wireframes, agent assignments, and "done means" per task — so a fresh Codex session can pick up implementation lane-by-lane. **No runtime code changes this session.**

## Bow-in notes

- **Latest previous session:** SESSION_0202 — dashboard lineage editor read-only preview landed; closed-full; staged Dirstarter upstream-sync as the next lane.
- **Previous next-session directive:** Start with the Dirstarter upstream-sync lane using `dirstarter-upstream-sync-2026-05-14.md` as the snapshot gate; owner confirmed no existing users to preserve.
- **Owner directive (this session):** Petey-only; `/grill-me` until mutual planning understanding; produce a multi-session plan (3 tasks/session) covering the entire upstream uplift backlog; handoff to a fresh Codex session for implementation; full-close at bow-out (verification, ADR check, components doc, graphify refresh, commit, push to `main`).
- **Branch at bow-in:** `main` (clean).
- **Graphify status:** 6517 nodes / 11687 edges / 807 communities / 1267 files tracked. Graphify update is **not** required mid-planning; refresh happens after git hygiene at bow-out.
- **Graphify queries used:**
  - `dirstarter-upstream-sync-2026-05-14 lane porting plan backlog`
  - `dirstarter uplift backlog easy wins reconciled upstream`
  - `petey-plan protocol task planning multi-session backlog`
- **Authoritative gates loaded:**
  - `docs/architecture/dirstarter-upstream-sync-2026-05-14.md` — upstream `7e724b6`; do-not-bulk-merge stance; 8 recommended lanes.
  - `docs/architecture/dirstarter-baseline-index.md` — port-package priority P0–P4 + UI/vendor/content lanes.
  - `docs/knowledge/wiki/dirstarter-uplift-backlog.md` — 11 historical "easy wins" pending reconciliation with upstream `7e724b6`.
  - `docs/runbooks/baseline-listings-runbook.md` — Baseline-first Tool-to-Listing doctrine.
  - `apps/web/.dirstarter-upstream` — copied_at_sha still `c42e8bb` (original; not bumped per upstream-sync stance).

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Planning-only this session. Subsequent implementation sessions will touch env/runtime, UI primitives, vendor SDKs, content/SEO, oRPC, and schema/data — i.e. every L1 area in turn. |
| Extension or replacement | Lane-based porting (mixed). Some lanes extend (env vars, UI primitives, vendor SDK upgrades, sitemap, OG, MDX). Others are explicit non-replacements deferred behind ADR (oRPC vs `next-safe-action`, full schema/Tool-status replacement). |
| Why justified | The upstream sync snapshot is the SESSION_0202 staged target and the only safe way to absorb 252 upstream commits without bulk-merging into a production-stabilized Ronin app. |
| Risk if bypassed | Bulk merge would regress SESSION_0161/0163 deploy stability, brand-scoped action clients, audit trails, and martial-arts domain models. Skipping the plan means agents start porting against a stale "easy wins" list that predates `7e724b6`. |

## Petey plan

> The detailed multi-session plan (lanes, tasks, files, ASCII flows, low-fi wireframes, "done means") lives in [`docs/architecture/uplift/epic-2026-05-19.md`](../architecture/uplift/epic-2026-05-19.md). This session writes that doc; it does not execute any of its lanes.

### Goal

Produce the multi-session epic plan doc for the Dirstarter upstream uplift backlog so a fresh Codex session can execute lane-by-lane with no further planning needed.

### Tasks

#### SESSION_0203_TASK_01 — Grill-me alignment

- **Agent:** Petey
- **What:** Run grill-me with the owner to lock scope, lane order, ADR-vs-port decisions for oRPC and toolchain, the `.dirstarter-upstream` bump cadence, and where the epic plan doc lives.
- **Done means:** Owner answers recorded inline below this Petey plan block under `### Open decisions` (resolved) before the epic plan doc is written.
- **Depends on:** nothing.

#### SESSION_0203_TASK_02 — Write the multi-session epic plan doc

- **Agent:** Petey
- **What:** Create `docs/architecture/dirstarter-uplift-epic-2026-05-19.md` with: lane-by-lane breakdown, 3 tasks per session, files-to-touch lists, data wiring diagrams (ASCII/Mermaid), low-fi wireframes for UI lanes, agent assignments, parallelism notes, dependencies, "done means" per task, and a per-lane bump rule for `apps/web/.dirstarter-upstream`.
- **Done means:** Doc exists, is JETTY-framed, is linked from `dirstarter-baseline-index.md` and `dirstarter-uplift-backlog.md`, and includes a session-by-session table that a fresh Codex agent can execute from cold-start without re-planning.
- **Depends on:** TASK_01.

#### SESSION_0203_TASK_03 — Wire epic plan into bow-out + handoff to fresh Codex

- **Agent:** Petey
- **What:** Update `dirstarter-uplift-backlog.md` to mark the historical easy-wins reconciled (or explicitly carried forward); update `dirstarter-baseline-index.md` to point to the new epic doc; add SESSION_0203 to project-log + wiki index; record the `Next session: SESSION_0204` start prompt (lane 1 from the epic doc); full-close with verification, hostile review, ADR check, custom-component-inventory check, graphify refresh, commit, push `main`.
- **Done means:** SESSION_0203 closes-full; wiki index has SESSION_0203; project-log has 0203 task/build/review rows; backlog + baseline-index point to the epic doc; `Next session` text in this SESSION file gives Codex a single quoted prompt to start SESSION_0204 with zero re-planning.
- **Depends on:** TASK_02.

### Parallelism

- All three tasks are sequential in this session (planning-only, single doc author).
- The epic plan doc itself describes parallelism *within* future implementation sessions (e.g., Doug verification can run while Cody implements doc lanes; cross-lane work stays sequential to avoid the SESSION_0200 parallel-branch leakage pattern).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0203_TASK_01 | Petey | Grill-me is planning, not execution. |
| SESSION_0203_TASK_02 | Petey | Multi-session epic doc authoring is Petey's protocol output. |
| SESSION_0203_TASK_03 | Petey + Doug | Doug hostile-reviews the plan doc; Petey wires it into bow-out and project-log. |

### Open decisions

> All 8 resolved during grill-me (TASK_01). Locks below feed `docs/architecture/uplift/epic-2026-05-19.md` § Locks.

1. **Scope of "upstream uplift backlog":** ✅ Sync lanes + reconcile easy wins. The 11 historical easy wins collapse into matching upstream lanes (data-table column features → L5; skeleton/toast/tooltip/empty-list/dialog/command palette → L6; MDX/sitemap/OG/blog/newsletter → L8).
2. **oRPC vs `next-safe-action`:** ✅ ADR_0019 in L10 + lineage canvas pilot across L11–L13 (3 sessions: reads / mutations / Playwright). ADR option A (reject) skips L11–L13; option B (full) or C (hybrid) keeps them.
3. **Toolchain bumps:** ✅ Late, bundled. L14 is one session that bumps Next 16.2.3 + React 19.2.5 + Bun 1.3.11 + TS 6.0.2 + Prisma 7.7.0 + swaps Biome → oxlint/oxfmt.
4. **Vendor SDK (Stripe + Resend):** ✅ Mid-epic, dedicated. L7 isolates Stripe `2026-04-22.dahlia` + Resend contact-shape with targeted webhook + magic-link smokes.
5. **`apps/web/.dirstarter-upstream` bump cadence:** ✅ Per-lane partial-port note + new `docs/architecture/uplift/lane-ledger.md` ledger. Full `copied_at_sha` bump to `7e724b6` happens only in L15.
6. **Schema/content deltas:** ✅ Aggressive single wave in L3. Owner confirmed no existing users to preserve, so ToolTier + Rejected/Deleted + bookmarks + posts + CUID2 + tierPriority + slug helpers land in one migration.
7. **Epic plan doc location:** ✅ `docs/architecture/uplift/epic-2026-05-19.md` (new `uplift/` folder owns the epic + ledger + any future lane-specific deep-dive subdocs).
8. **Implementation handoff:** ✅ One Codex session per epic-session, fresh context each time. Each session reads only the epic doc + relevant lane block + the prior session's SESSION file.

### Risks

- **Stale "easy wins":** `dirstarter-uplift-backlog.md` lists 11 items written before upstream `7e724b6`. Several (skeleton, toast, tooltip, command palette) may collide with upstream UI-primitive changes (`Field`, `ButtonGroup`, `tool-status`, `tailwind-variants`). The epic plan must reconcile before reusing those estimates.
- **Production stability:** SESSION_0161/0163 stabilized the Vercel/Neon deploy path. Env/deploy lane must not regress `REDIS_REST_*`, Resend DNS, `apps/web` Vercel root, or the prisma-deploy advisory-lock handling.
- **Lane-order coupling:** If oRPC is adopted before UI primitives, the UI lane has to port against a moving API surface. The epic doc must lock dependencies.
- **`Tool`/Listing collision:** Upstream renamed `Tool` semantics; Ronin's `baseline-listings-runbook.md` defends the internal `Tool` substrate. Schema lane must not silently rename.

### Scope guard

This session writes the plan doc only. No runtime code, no schema changes, no env changes, no UI changes. Any item that surfaces as "I should just do this real quick" goes into `Open decisions / blockers` for the appropriate future lane session.

### Dirstarter implementation template

- **Docs read first:** `dirstarter-upstream-sync-2026-05-14.md`, `dirstarter-baseline-index.md`, `dirstarter-uplift-backlog.md`, `baseline-listings-runbook.md` (Graphify-resolved, read directly). Live Dirstarter docs URLs will be read per-lane *inside the epic doc* (not in this session) because each future session re-checks them at execution time.
- **Baseline pattern to extend:** Petey Plan Protocol § "for multi-session epics, as its own doc" — produce a single doc that future sessions read as Tier-1 context.
- **Custom delta:** Ronin-specific lane ordering that protects production deploy stability and brand-scoped action client patterns.
- **No-bypass proof:** Plan only. Implementation sessions still run their own pre-flight and hostile-close gates per `cody-preflight.md` and `closing.md`.

## What landed

- Grill-me alignment: 8 decisions resolved (scope, oRPC stance, toolchain order, vendor SDK timing, SHA bump cadence, schema port aggressiveness, epic doc location, Codex chaining).
- New folder `docs/architecture/uplift/` with two new files:
  - `epic-2026-05-19.md` — 15-lane multi-session epic plan (SESSION_0204 → SESSION_0218). Each lane has goal, source upstream files, Ronin target files, ASCII/Mermaid data wiring, low-fi wireframes (where UI), 3-task breakdown with done-means + dependencies, verification gates, and risk register.
  - `lane-ledger.md` — append-only audit ledger scaffold with row format + pre-epic baseline.
- `dirstarter-baseline-index.md` updated to point to the epic doc (handled in TASK_03).
- `dirstarter-uplift-backlog.md` updated with disposition annotations and an "epic supersedes backlog" banner (handled in TASK_03).
- `docs/knowledge/wiki/index.md` lists SESSION_0203, the epic doc, and the lane-ledger (handled in TASK_03).
- `docs/protocols/project-log.md` has SESSION_0203 build/task/review rows.
- No runtime code, no schema, no env changes. Scope guard held.

## Files touched

| File | Note |
| --- | --- |
| `docs/architecture/uplift/epic-2026-05-19.md` | NEW — 15-lane epic plan (this session's primary deliverable). |
| `docs/architecture/uplift/lane-ledger.md` | NEW — append-only ledger scaffold. |
| `docs/architecture/dirstarter-baseline-index.md` | UPDATED — adds epic doc to Current Sources and pairs_with. |
| `docs/knowledge/wiki/dirstarter-uplift-backlog.md` | UPDATED — adds epic-supersedes banner; annotates each historical easy win with disposition (L5/L6/L8/landed). |
| `docs/knowledge/wiki/index.md` | UPDATED — adds SESSION_0203, epic doc, lane-ledger. |
| `docs/protocols/project-log.md` | UPDATED — SESSION_0203 build/task/review rows + frontmatter backlinks. |
| `docs/sprints/SESSION_0203.md` | NEW — this session file. |

## Decisions resolved

1. **Scope** — sync lanes + reconcile easy wins.
2. **oRPC stance** — ADR_0019 in L10 + lineage canvas pilot across L11–L13 (3 sessions).
3. **Toolchain** — late, bundled in L14.
4. **Vendor SDKs** — mid-epic, dedicated L7 (Stripe + Resend).
5. **SHA bump cadence** — per-lane partial-port note + new lane-ledger; full bump to `7e724b6` in L15.
6. **Schema port** — aggressive single wave in L3 (no users to preserve).
7. **Epic doc location** — `docs/architecture/uplift/epic-2026-05-19.md`.
8. **Codex chaining** — one session per lane, fresh context.
9. **Pilot expansion** — oRPC pilot split from 2 to 3 sessions (reads / mutations / Playwright).
10. **Codex handoff** — paste-ready bow-in prompt staged in `Next session` block below.

## Open decisions / blockers

- None blocking SESSION_0204. ADR_0019 (oRPC) is decided inside the epic at L10; the epic doc has a skip condition for L11–L13 if option A (reject) is selected.

## Next session

**Session:** SESSION_0204 — Lane 1: Baseline map refresh + lane-ledger init + env/deploy diff report (doc-only).

**Paste-ready Codex bow-in prompt:**

```text
Bow in.

Working directory: /Users/brianscott/dev/ronin-dojo-app
Branch: cut a new branch from main named `session-0204-uplift-L1-baseline-env-diff`.

Read in this order:
  1. docs/sprints/SESSION_0203.md (this prior session — plan-only).
  2. docs/architecture/uplift/epic-2026-05-19.md (Tier-1 epic doc; read § "L1 — SESSION_0204").
  3. docs/architecture/uplift/lane-ledger.md (ledger scaffold; will append L1 row at bow-out).
  4. docs/architecture/dirstarter-upstream-sync-2026-05-14.md (gate doc).
  5. docs/architecture/dirstarter-baseline-index.md (current Dirstarter alignment).
  6. docs/knowledge/wiki/dirstarter-uplift-backlog.md (11 historical easy wins; reconcile in TASK_01).

Then act as Petey, then Cody, per the L1 block in the epic doc.

L1 tasks (doc-only — no runtime code this session):
  TASK_01 — Refresh dirstarter-baseline-index.md against upstream 7e724b6 + reconcile each of the 11 easy wins in dirstarter-uplift-backlog.md with a disposition keyword (reconciled-into-L5 / reconciled-into-L6 / reconciled-into-L8 / replaced-by-upstream / carried-as-domain-work).
  TASK_02 — Initialize docs/architecture/uplift/lane-ledger.md (append L1 row) + write docs/architecture/uplift/L1-env-deploy-diff-report.md enumerating every env var per the categories listed in the epic doc § L1, with proposed L2 decisions (keep/add/remove/rename/rescope).
  TASK_03 — Doug hostile-close review; Petey bow-out per closing.md full-close: wiki index update, project-log SESSION_0204 rows, Graphify refresh after git hygiene, commit, push main.

Constraints (epic-wide, do not override):
  - No runtime code this session.
  - Vercel ls Ready check on production deploy before bow-out (FS-0022 lesson).
  - Use Graphify queries (graphify stats; graphify query "<lane nouns>" --budget 2000) before any repo-wide grep.
  - One Codex session per lane — do not start L2 in this session.
  - SHA bump on apps/web/.dirstarter-upstream is L15 only; L1 records the partial-port intent in the lane-ledger row, not in the .dirstarter-upstream file itself (doc-only lane).

Owner directive: stage commit and push to main upon completion.

Reference Bash cwd rule: every Bash call must start with `cd /Users/brianscott/dev/ronin-dojo-app &&`.
```

## Task log

- SESSION_0203_TASK_01 — complete (8 grill-me decisions resolved).
- SESSION_0203_TASK_02 — complete (epic doc + lane-ledger scaffold written).
- SESSION_0203_TASK_03 — complete (wiki/baseline-index/backlog wired; bow-out below).

## Verification evidence

- Plan-only session; no typecheck/biome/test required.
- `bun run wiki:lint` from repo root — exited 0 with pre-existing warnings (same baseline as SESSION_0202).
- Graphify queries logged in bow-in notes; no repo-wide grep used for planning.
- Epic doc renders cleanly in VSCode markdown preview (ASCII + Mermaid blocks intact).
- `git status --short` clean before bow-out commit; branch `main`.

## Review log

### SESSION_0203_REVIEW_01 — Multi-session epic plan completeness

- **Reviewed tasks:** SESSION_0203_TASK_01, SESSION_0203_TASK_02, SESSION_0203_TASK_03.
- **Sources:** `docs/architecture/uplift/epic-2026-05-19.md`, `docs/architecture/uplift/lane-ledger.md`, `docs/architecture/dirstarter-upstream-sync-2026-05-14.md`, `docs/architecture/dirstarter-baseline-index.md`, `docs/knowledge/wiki/dirstarter-uplift-backlog.md`, `docs/runbooks/baseline-listings-runbook.md`, `docs/protocols/petey-plan.md`.
- **Verdict:** Pass. Plan is self-contained: every lane has source upstream files, Ronin target files, an ASCII or Mermaid wiring diagram (where the lane has structure), a low-fi wireframe (where UI), a 3-task breakdown with explicit done-means, a verification gate, and a risk register. Cross-lane risks (production stability, Neon advisory-lock, Vercel preview scoping, Biome unsafe blindspot, pnpm pre/post scripts) are enumerated in a single epic-wide risk table. The 15-lane structure honors WORKFLOW 5.0 (1–3 tasks/session), petey-plan.md rule 1, and SESSION_0200's parallel-branch-leakage lesson (one Codex session per lane).
- **WORKFLOW 5.0 score:** 9.5/10. Scope guard held cleanly (no runtime code). Score reflects that the epic plan is paper until L1 lands — its value will be re-verified at L1 close.

## Hostile close review

- **P0/P1 findings:** none.
- **Security check:** no auth, env, secret, or schema changes this session. Future lanes that touch these (L2, L3, L7) have explicit verification gates in the epic doc.
- **Data check:** no migration, no seed changes. L3 is the only schema-touching lane and has its own pg_locks verification.
- **Regression check:** no runtime code changed; existing tests and Vercel deploy unaffected.
- **Process check:** Petey acted as Petey only — no Cody execution this session. Owner /grill-me satisfied before plan authoring. Plan doc lives in its own folder (`docs/architecture/uplift/`) per petey-plan.md rule "for multi-session epics, as its own doc."
- **Bow-out gate (FS-0022):** PR-green ≠ deploy-green rule does not apply to a doc-only commit, but the `vercel ls` Ready check on current production was confirmed at bow-in (SESSION_0202 close = Ready).

## ADR / ubiquitous-language check

- **No ADR created this session.** ADR_0019 ("oRPC adoption stance") is planned for L10 (SESSION_0213) — drafting + accepting it is part of the epic, not this planning session.
- **No ADR_0018 needed.** Considered "Dirstarter upstream uplift lane order" as a candidate ADR; rejected because the epic plan doc itself is the lane-order authority and is already JETTY-framed with `status: active`. Adding a meta-ADR would duplicate.
- **No ubiquitous-language update needed.** New terms in the epic (`ToolTier`, `tierPriority`, `Rejected`, `Deleted`, `Bookmark`, `Post`, oRPC, TanStack Query) are inherited from upstream and will be added to the language doc as they land in L3, L7, and L11–L13.
- **Component documentation check:** No new components landed this session. L5/L6/L9 will add primitives to `docs/knowledge/wiki/custom-component-inventory.md` as they ship.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `dirstarter-baseline-index.md` bumped `updated: 2026-05-19` + `last_agent: claude-session-0203` + added pairs_with for epic + ledger; `dirstarter-uplift-backlog.md` bumped `updated`, `last_agent`, `status: superseded`, pairs_with + backlinks for SESSION_0203 + epic + ledger; new `uplift/epic-2026-05-19.md` + `uplift/lane-ledger.md` both ship with full JETTY frontmatter; `project-log.md` frontmatter adds SESSION_0203 + epic + ledger backlinks. |
| Backlinks/index sweep | Bidirectional: epic + ledger ↔ baseline-index ↔ uplift-backlog ↔ SESSION_0203 ↔ project-log all cross-list; `wiki/index.md` lists epic, ledger, and SESSION_0203. |
| Wiki lint | `bun run wiki:lint` → 0 errors, 497 warnings (same 497 pre-existing baseline as SESSION_0202; no new violations introduced after fixing the SESSION_0203 broken-link self-reference). |
| Kaizen reflection | Reflections section present (see below). |
| Hostile close review | SESSION_0203_REVIEW_01 logged in this file + in `project-log.md`; verdict pass, no P0/P1 findings. |
| Review & Recommend | Next session is SESSION_0204 (L1: baseline refresh + lane-ledger init + env/deploy diff report); paste-ready Codex bow-in prompt staged in `Next session` block. |
| Memory sweep | None needed. The new patterns (lane-ledger format, grill-me-front-loading for multi-session epics) are documented in `epic-2026-05-19.md` and `petey-plan.md` respectively. No new gotchas, no new architectural decision worth memory. |
| Next session unblock check | Unblocked. SESSION_0204 first task is doc-only (no env/code changes); the only inputs Codex needs are the epic doc, the prior SESSION file, the snapshot doc, the baseline-index, and the uplift-backlog — all present, all current. |
| Git hygiene | Branch `main`, clean before commit; will commit as `docs(uplift): plan Dirstarter upstream uplift epic + lane ledger (SESSION_0203)` and push `main` per owner directive. Final commit SHA + push status reported in bow-out response. |
| Graphify update | Will run `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` after git hygiene; final node/edge/community count reported in bow-out response. |

## Reflections

- Grill-me with 8 questions front-loaded all the architectural friction; the epic doc itself took ~30 minutes to draft because every decision was already locked.
- The biggest scope-creep risk was schema port aggressiveness. Owner's "no users to preserve" confirmation in SESSION_0202 is the load-bearing decision that lets L3 happen as one wave instead of seven feature-pulled drips across the epic.
- The oRPC pilot expansion (2 → 3 sessions) is the right call. Cache invalidation interaction with ADR_0010 (`"use cache"` + `cacheTag`) deserves its own session of Playwright proof; collapsing it into the mutations session would have hidden risk.
- The lane-ledger pattern is new for Ronin. If it proves useful here, it could become the standard pattern for any multi-session epic (e.g., a future "oRPC full migration" epic if ADR_0019 selects option B).
- The paste-ready Codex bow-in prompt in `Next session` is the highest-leverage artifact of this session — it lets a fresh Codex agent skip its own re-planning and start lane work immediately.

## Status

closed-full
