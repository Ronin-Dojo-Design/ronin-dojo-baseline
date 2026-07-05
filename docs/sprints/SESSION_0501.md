---
title: "SESSION 0501 — ADR 0002 native-API reconciliation grill + queued chips (vercel ignoreCommand, FI-021, PWA)"
slug: session-0501
type: session--open
status: in-progress
created: 2026-07-05
updated: 2026-07-05
last_agent: claude-session-0501
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0500.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0501 — ADR 0002 native-API reconciliation grill + queued chips

## Date

2026-07-05

## Operator

Brian + claude-session-0501

## Goal

Resolve the native-API contract fork surfaced by SESSION_0500's `native-api-contract-research-review.md`:
grill Option C (hybrid: oRPC internal + generated `/api/v1` OpenAPI facade) vs Options A/B against ADR 0002
+ ADR 0009 with the operator, then produce a drafted ADR 0002 reconciliation/amendment for ratification.
**No native-API code until ratified.** On operator go, then sequence the cheap independent chips
(vercel.json `ignoreCommand` fix first, then FI-021 mobile-admin entry, then PWA layer).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0500.md`
- Carryover: 0500 shipped G-004 N1+N2, WL-P2-22 (LineageTreeBoard CRAP −80%), and Epic B mobile shell
  (bottom nav + admin MAB), and produced the `native-api-contract-research-review.md` that this session
  reconciles. FI-001 (Truelson real send) gate is cleared — only the operator's "send Brian" remains.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (own `session-0501-native-api` worktree to be created
  only if/when a code chip is greenlit)
- Status at bow-in: clean except two untracked prod screenshots (`prod-live-dirty-dozen.jpeg`,
  `tony-hua-lineage-timeline-prod.jpeg`) — pre-existing, not mine; leave/ignore.
- Current HEAD at bow-in: `37063be0`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (docs/decision reconciliation; chips are net-new chrome + CI config) |
| Extension or replacement | Extension — reconciles a stale ADR to match the ratified oRPC direction (ADR 0024/SOT-ADR D3) |
| Why justified | ADR 0002's `api/v1` premise is dead (never built); the decision record must not lie to future sessions |
| Risk if bypassed | Next native lane re-derives the whole fork or builds a duplicate REST surface (YAGNI trap) |

Live docs checked during planning: not applicable (decision reconciliation, not an L1 build).

### Grill outcome

<!-- Filled once the operator ratifies the native-API fork. -->

Pending operator ratification — see `## Petey plan → Open decisions`.

## Petey plan

### Goal

Reconcile ADR 0002 to the ratified oRPC reality and queue the cheap chips in risk-ascending order.

### Tasks

#### SESSION_0501_TASK_01 — Grill the native-API fork + draft the ADR 0002 amendment

- **Agent:** Petey (grill) → docs amendment inline
- **What:** Present Option C hybrid vs A/B; resolve the §8 forks (timing / 3rd-party ambition / coverage);
  draft an ADR 0002 amendment recording that `api/v1` was never built and the native contract is the
  hybrid seam already modeled in `context.ts`, with ADR 0009 (Better-Auth SDK) confirmed still standing.
- **Steps:** (1) lay out the fork + tradeoffs; (2) get operator ratification on the 3 forks; (3) draft the
  amendment block appended to ADR 0002 (+ fix stale pointers in `packages/api-client/README.md` and ADR 0009
  sketch to "planned, see this review"); (4) operator ratifies before any file write lands.
- **Done means:** ADR 0002 carries a ratified reconciliation amendment; stale pointers corrected.
- **Depends on:** operator ratification.

#### SESSION_0501_TASK_02 — vercel.json `ignoreCommand` verification + fix

- **Agent:** Cody (build) → Doug (verify)
- **What:** Verify the `ignoreCommand` in BOTH directions (docs-only push → no deploy; app-code push → deploy)
  and fix if it mis-fires. Known suspect: the `packages` path filter is directory-level, so a docs-only edit
  to `packages/*/README.md` wrongly triggers a BBL rebuild.
- **Done means:** documented proof of both directions; ignoreCommand corrected if it over/under-triggers.
- **Depends on:** operator go (cheap, low-risk — recommended first).

#### SESSION_0501_TASK_03 — FI-021 mobile entry point for `/app` admin CRUD

- **Agent:** Petey scope → Cody
- **What:** Mobile entry point for the ~30 `/app` admin CRUD sections the Epic-B sidebar demote hid.
- **Done means:** admin CRUD reachable on mobile; dead `BblMemberRail isMobile` branch pruned (WL-P3-29).
- **Depends on:** operator go.

#### SESSION_0501_TASK_04 — PWA layer (installable / offline)

- **Agent:** Petey scope → Cody
- **What:** Installable PWA shell (manifest + service worker); the queued next mobile step after Epic B.
- **Done means:** app installable; offline shell for the logged-in surfaces.
- **Depends on:** operator go (largest of the chips; sequence last).

### Parallelism

TASK_01 is plan-first and blocks nothing else. The three chips are independent; sequence by ascending
risk/effort (02 → 03 → 04), each in its own `session-0501-*` worktree if greenlit. Do not fan out until
the operator picks which chips run this session.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0501_TASK_01 | Petey | open decision — grill + draft amendment, no build |
| SESSION_0501_TASK_02 | Cody→Doug | small CI-config change needing both-directions verification |
| SESSION_0501_TASK_03 | Cody | scoped mobile chrome build |
| SESSION_0501_TASK_04 | Cody | net-new PWA layer |

### Open decisions

- **Native-API contract (blocking TASK_01):** ratify Option C hybrid (recommended) vs A (scoped bridge)
  vs B (dedicated REST). Resolve via the 3 §8 forks: native timing, 3rd-party ambition, coverage breadth.
- **Chip selection:** which of TASK_02/03/04 run this session, and in what order (recommend 02 first).
- **FI-001 (out of scope unless operator says go):** Truelson real send — surface only.

### Risks

- Ratifying C without the `packages/shared` extraction prereq leaves schemas trapped in `apps/web` — note
  it as the "do regardless" first slice, don't big-bang.
- Concurrency: Epic A (0496/0497), Epic C (0494), feed (0493), fix+QA (0492) may be live in their worktrees —
  do NOT touch them; shared index docs are append-only, rebase-on-reject.

### Scope guard

- No Expo scaffolding, no `apps/mobile/`, no `api/v1` surface built this session (YAGNI — keep the seam).
- No FI-001 real send without explicit operator "send Brian now."
- `../ronin-dojo-monorepo` is READ-ONLY.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0501_TASK_01 | pending | Native-API fork grill + ADR 0002 amendment draft |
| SESSION_0501_TASK_02 | pending | vercel.json ignoreCommand both-directions verify + fix |
| SESSION_0501_TASK_03 | pending | FI-021 mobile admin entry point |
| SESSION_0501_TASK_04 | pending | PWA layer |

## Open decisions / blockers

Native-API fork awaiting operator ratification; chip selection awaiting operator go. Held at push gate.

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.
