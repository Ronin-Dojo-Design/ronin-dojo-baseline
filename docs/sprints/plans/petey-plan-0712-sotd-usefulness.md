---
title: "Petey plan — PL-032 SotD usefulness epic (session A: renderer unification)"
slug: petey-plan-0712-sotd-usefulness
type: plan
status: staged
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0712
pairs_with:
  - docs/sprints/SESSION_0712.md
backlinks:
  - docs/knowledge/wiki/planning-ledger.md
---

# Petey plan — PL-032 SotD usefulness (session A)

Grill outcomes (operator, SESSION_0712 bow-out): **SotD home = RDD-Mono + per-brand routes**
(portfolio SotD lives in rdd-monorepo / the RDD app; each brand repo keeps its
brand-scoped `/app/state`; cross-repo data via the existing GitHub-API fetch pattern) ·
**slice = renderer first** · **build home = BBL, cherry-pick up IMMEDIATELY** (not waiting on
the RDD weekly sync — whose day is still unset; set it at the RDD-Mono bootstrap session).

### Goal

One SotD renderer vocabulary (kill D-055), the operator's belt-word fix landed once (PL-020),
and the Epics + Fan-out panels baked into `scripts/state-of-project.ts` so every future
snapshot carries them deterministically.

#### SESSION_NNNN_TASK_01 — unify the script on the kernel

- **Agent:** Cody
- **What:** `scripts/state-of-project.ts` imports `PHASES` / `BELT_WORD` / `PHASE_STOP_CLASS` /
  `VISIBLE_BRAND_SKINS` / `MASTHEAD_TITLE` from
  `apps/web/components/app/state-of-dojo/_kernel/phase.ts`; delete its private copies
  (`:57-76`, `:329`); wire the deploy-scope gate (no cross-brand leak) + per-skin masthead.
- **Done means:** grep proves zero duplicated vocabulary; rendered HTML diff vs before is
  vocabulary-only; D-055 flips resolved.

#### SESSION_NNNN_TASK_02 — PL-020 once

- **Agent:** Cody
- **What:** belt-ladder action words + order + un-inverted white/black stops, edited ONLY in
  `_kernel/phase.ts` (both surfaces inherit).
- **Done means:** `/app/state` and the script render show the new words; PL-020 flips resolved
  with a before/after artifact.

#### SESSION_NNNN_TASK_03 — Epics + Fan-out panels in the renderer

- **Agent:** Cody (Desi review on the rendered output)
- **What:** two new deterministic sections: **Epics** (parse `docs/epics/*` +
  `docs/product/**/{*epic*,*EPIC*}.md` frontmatter + staged plan stubs + PL/G epic rows) and
  **Fan-out** (per-slot fork steps — source of truth: a small `docs/protocols/fork-fanout.yml`
  or the plan file, decided at build). The SESSION_0712 hand-built artifact tabs are the mock.
- **Done means:** `bun scripts/state-of-project.ts` output contains both sections with live
  statuses; frozen-artifact publish needs no hand-merging.

### Parallelism

Single lane — all three tasks touch the same renderer/kernel family; sequential in one session.

### Agent assignments

Cody builds (pre-flight §0 first) → Doug verifies (render diff + /app/state smoke) → /ggr gate.

### Open decisions

None blocking — all three forks grilled and resolved (above). Deferred: portfolio-SotD
aggregation build in RDD-Mono (session B+ territory, after sibling trims land); WL-P2-76
docs-nav card, WL-P2-75 MBR feed, PL-003 §1 loop-board embed = session B; PL-009 DBS ·
PL-007 Kaizen · WL-P2-71 wayfinder = pull only if cheap.

### Risks

- The `_kernel` contract is frozen (`{compact?: boolean}` only) — TASK_03's panels live in the
  SCRIPT renderer, not as new app panels, so the contract stays untouched; flag any pressure to
  widen it to the operator.
- program-plan.md sprint row not consulted (partially superseded doc) — flagged, not guessed.
- Post-trim, BBL's spine is brand-only: the script's board section shrinks to the S13 era —
  expected (era reset), not a regression.

### Scope guard

No new app routes, no `_kernel/contract.ts` widening, no RDD-Mono aggregation work, no
loop-board embed — session A is renderer-only. Cherry-pick the landed commits up to RDD-Mono
immediately after merge (operator-directed).
