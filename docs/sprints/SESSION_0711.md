---
title: "SESSION 0711 — Lineage-explorer quality epic: plan + dispatch (PL-030)"
slug: session-0711
type: session--staged
status: staged
created: 2026-07-25
updated: 2026-07-25
last_agent: claude-session-0709
sprint: S12
lane: bbl
recipe: "epic-plan"
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0709.md
  - docs/knowledge/wiki/planning-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0711 — Lineage-explorer quality epic (PL-030)

> **Staged by SESSION_0709 (six-pack fan-out close; operator-elected mid-session).** Adopt: flip
> `status:` → `in-progress` and treat SESSION_0709 as the previous session. SESSION_0710 is a
> parallel sibling lane (email DRY_RUN + vault) — disjoint, possibly already run.

## Goal

**PART 1 — FIRST, before any epic work (operator directive at 0709 bow-out, near-verbatim):**
run the **immediate [`hostile-repo-review`](../protocols/hostile-repo-review.md)** — architecture,
systems design, agent workflows, and **PREVENTIVE measures** — plus **`fallow health` + `fallow
audit` as diagnosis (explicitly NOT the fix-loop)**, the already-planned
`/improve-codebase-architecture`, and **a hard long look at security, stability, and scalability**.
The operator's charge to answer, not to score around: *"most of our time is spent shipping fast,
scoring ourselves well, then a review finds a huge CRAP score, we refactor, and score ourselves
9.5 again — that's not right. I'm tired of review-and-refactor and chasing ghosts. I don't want
good enough, I want perfect."* Concretely: (a) why do reds keep appearing in a repo scoring 9+
(0709 exhibit: the WL-P2-82 flake was OBSERVED at 0692, written off as one-off, never routed — 3
CI cycles paid); (b) what **pre-code gates** exist vs needed — Cody preflight is reuse-focused,
nothing checks CI health / known-flake state / architecture conformance BEFORE code is written;
(c) does the scoring system measure systemic health or just process execution — propose matrix
changes so a 9+ is impossible while known-unrouted debt or red CI exists.

**PART 2 — then the lineage-explorer quality epic** (PL-030) — operator framing: "professionally
developing this with discipline and clean, understandable code that Apple would ship." Five public
surfaces: cohort timeline (default) · board view · mobile list · honor strip · galaxy.

1. **Sort filter (product):** user-facing sort on the cohort-timeline explorer offering BOTH
   chronological and belt order (PL-026 "both as a filter" call; belt-order read model landed
   SESSION_0704, PR #336). Grill fork: timeline-only or all five surfaces? Placement? Persisted?
2. **Explorer filter review:** the cinematic explorer's filter system generally.
3. **Per-surface quality:** hostile code review + `/code-quality` score per surface.
4. **`/fallow-fix-loop` + `/improve-codebase-architecture`** over the explorer family
   (behavior-preserving; WL-P2-3 ListRow fold-in when its surfaces are touched).
5. **Expo/iOS readiness research-recommend** — feeds on PL-031 gap 2 (API-contract extraction);
   assess Next-coupling, `next/cache` in read paths, auth/media flows.

Reference (operator-provided): monorepo-template article + 0709 gap assessment — see
SESSION_0709 `## Next session → Reference` and PL-031.

## First task

Open `docs/protocols/hostile-repo-review.md` and run Part 1 (the repo-wide hostile review +
preventive-measures audit + fallow health/audit diagnosis + security/stability/scalability pass).
Its findings then reshape Part 2's plan — /pp the explorer epic AFTER, informed by what the review
surfaces (inventory the five surfaces via `/ge`, grill sort-filter forks, dispatch per epic-plan).
Standing riders: WL-P2-82 flake spec fix (4 sightings — a prime "preventive measures" exhibit;
fix early, it taxes every apps/web PR) · WL-P3-69 tooling trio · TFF-010 recurrence code fix
(`tag(...).slice(0,16)` sweep).

## Next session

### Goal

### First task
