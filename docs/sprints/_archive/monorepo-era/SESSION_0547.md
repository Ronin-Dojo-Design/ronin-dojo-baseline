---
title: "SESSION 0547 — Board sweep + clear-by-Saturday parallel-lane plan (fan-out paused, persisted)"
slug: session-0547
type: session--plan
status: closed
created: 2026-07-16
updated: 2026-07-16
last_agent: claude-session-0547
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0544.md
  - docs/knowledge/wiki/goals-ledger.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0547 — Board sweep + clear-by-Saturday parallel-lane plan (fan-out paused, persisted)

## Date

2026-07-16

## Operator

Brian + claude-session-0547

## Goal

SWEEP + PLAN lane (no building): aggregate every open, non-parked, non-in-flight item across the
ledgers + the loop-of-loops board, exclude the live lanes and parked FI-001, and deliver a
prioritized "clear the board by Saturday" plan of DISJOINT parallel worktree lanes for operator
fan-out. **Operator decision at close: fan-out PAUSED — no lanes spawned; plan persisted here
(see `## Next session`) for pick-up tomorrow.**

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0544.md` (in-progress — PR #210 squash-merged
  `0da7e7f6`, watching main CI; that watch is a live lane, not this session's).
- Carryover: no `Next session` block yet (0544 not bowed out); this session's task came as an
  explicit operator directive (sweep + plan).

### Branch and worktree

- Branch: `main` (canonical checkout)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean; 2 commits ahead of origin/main (SESSION_0544 docs commits, unpushed)
- Current HEAD at bow-in: `997e37cb`
- Session number note: 0545/0546/0550 are claimed by live worktree branches
  (`ronin-0545`/`ronin-0546`/`ronin-0550`); 0547 verified free in branches + sprint files (FS-0030 check).

### Graphify check

Skipped — read-only ledger/board sweep off the aggregators + canonical ledger docs; no code
discovery needed.

### Grill outcome

Operator pre-resolved the forks in the directive: plan-first, no builds, no lane spawning;
live lanes excluded; FI-001 parked; explicit per-push authorization stands.

## Petey plan

### Goal

Produce the ranked remaining backlog + a disjoint parallel-lane map (4–6 dispatchable lanes) so
the operator can fan out toward a clear board by Saturday (2026-07-18).

### Tasks

#### SESSION_0547_TASK_01 — Sweep ledgers + board

- **Agent:** Petey (inline, read-only)
- **What:** `ledger-backlog.ts` (100 open items) + `board-backlog.ts --top=100` (89 cards) +
  goals-ledger + POST_LAUNCH_SOT + live-worktree map + open-PR check (0 open).
- **Done means:** aggregate captured in this file.
- **Depends on:** nothing.

#### SESSION_0547_TASK_02 — Rank + dedupe vs live lanes; build the parallel-lane plan

- **Agent:** Petey (inline)
- **What:** exclude live/parked coverage, bucket stale rows (board hygiene), group remaining work
  into disjoint worktree lanes with collision callouts; flag plan-first vs directly-buildable.
- **Done means:** ranked backlog + lane map persisted in `## Next session`.
- **Depends on:** TASK_01.

### Parallelism

None — single inline read-only lane.

### Open decisions

- Operator picks which lanes to fire and assigns session numbers/worktrees (deferred to tomorrow).

### Risks

- Board contains stale cards (resolved rows still projecting) — plan flags them; Lane A fixes at
  the source.

### Scope guard

- No builds, no build-lane spawning, no card mutations this session. Push limited to this docs file.
- ../ronin-dojo-monorepo READ-ONLY. FI-001 stays parked.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0547_TASK_01 | landed | Sweep complete: 100 ledger items · 89 board cards · 4 live worktrees · 0 open PRs |
| SESSION_0547_TASK_02 | landed | Ranked backlog + 6-lane disjoint fan-out plan persisted in `## Next session` |

## What landed

- Full backlog sweep (ledger aggregator + operator board + goals-ledger + POST_LAUNCH_SOT).
- Key findings: (1) FOUR live worktrees — `ronin-0550`/`session-0550-csp-enforce` was undeclared
  and covers RISK #2 entirely; (2) 0 open PRs; (3) ~25% of the board is stale (resolved rows still
  projecting + 11 MB rows that are manual-boundary-registry operator-manual items, not agent lanes);
  (4) local main 2 docs commits ahead of origin at bow-in.
- The persisted clear-by-Saturday plan (see `## Next session`). No lanes launched (operator pause).

## Decisions resolved

- **Operator: PAUSE the fan-out** — no lanes A–F spawned this session; plan persisted for tomorrow.
- **Operator: push authorized** for this SESSION file only (targeted add, docs-only), after
  `git pull --rebase origin main` (PR #210 session pushes docs to origin/main from this same
  canonical checkout concurrently).

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0547.md` | This session file (plan lane; carries the persisted fan-out plan) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun scripts/ledger-backlog.ts` | 100 open items (GL 8 · FS 2 · D 1 · WL 60 · FI 4 · MB 11 · TFF 4 · RISK 10 · PR 0) |
| `cd apps/web && bun scripts/board-backlog.ts --top=100` | 89 open cards (in-progress 3 · backlog 86) |
| `gh pr list --state open` | 0 open PRs |
| `git worktree list` | Live lanes: ronin-0541 · ronin-0545 (billing) · ronin-0546 (technique graph) · ronin-0550 (CSP enforce) |

## Open decisions / blockers

- Fan-out PAUSED by operator (2026-07-16). Lanes not spawned; fire from the map below tomorrow.
- Operator-action queue (no agent lane): RISK #13 Neon credential rotation (agent can prep the
  runbook in Lane A) · G-002 cloud half (Neon provision + Vercel wiring) · FI-018 bake-off pick at
  `/lineage/rigan-machado-lineage?cards=v2` · MB-* manual items · parked "send Brian now".

## Next session

### Goal

Fire the operator-selected lanes from the persisted fan-out map below (each in its own worktree
off a pushed main); target a clear board by Saturday 2026-07-18.

### First task

Re-verify the live-lane set (`git worktree list` + open PRs — the four 0541/0545/0546/0550 lanes
may have landed by then, which unfreezes their collision holds), confirm the base is pushed, then
dispatch the lanes the operator picks from the map.

### Persisted fan-out map (SESSION_0547 sweep — exclusions: live lanes 0541 belt-followups ·
0545 billing-tab · 0546 technique-graph · 0550 csp-enforce (covers RISK #2) · PR #210 CI watch ·
parked FI-001/G-001 · blocked G-011 · operator-gated G-002 cloud half · parked G-008)

#### Ranked remaining backlog (board order, after exclusions)

| Rank | Item | Pri | What | Disposition |
| --- | --- | --- | --- | --- |
| 1 | FI-002 | P1 | Lifecycle-email copy audit (all `LifecycleEmailKind`, DRYRUN=0) | Buildable → Lane D |
| 2 | FI-003 | P1 | Student sign-up under instructor/school + claim-approval flow | Plan-first → Lane F |
| 3 | FI-004 | P1 | Admin email-composer parity + BBLEmail port + mobile admin | Plan-first (after Lane D) |
| 4 | RISK #5 | P1 | Rate limiter fail-open on sensitive actions | Buildable, scoped (optional 7th lane) |
| 5 | RISK #13 | P1 | Prod Neon credential rotation (overdue since 0449) | Operator-action; runbook via Lane A |
| 6 | G-005 | P1 | m-card consolidation (ADR 0040 ratified, code pending) | Buildable → Lane E (merge LAST) |
| 7 | WL-P2-40 · WL-P3-34 · FS-0026 · RISK #3 | P2 | Admin-route retirement cluster | Buildable → Lane B |
| 8 | G-012 + TFF-008/010/011 | P2 | Test fixture-ownership module + flake fixes | Buildable → Lane C |
| 9 | WL-P2-34, 55–57 | P2 | AdminCollection conformance wave + badge/status unification | Buildable (next wave after B) |
| 10 | FI-017 · WL-P2-13 · WL-P2-39 | P2 | Claim-gap cluster | Fold into Lane F plan |
| 11 | FI-016 · WL-P3-25/26 · WL-P2-52 | P2 | UI polish batch | Buildable, Desi-flavored (Saturday) |
| 12 | FI-018 | P2 | StudentsCarousel V1-vs-V2 bake-off | Operator decision, then trivial delete lane |
| — | RISK #4/#6/#7/#8 | P1 | Triaged + deliberately deferred at 0465 | Keep deferred through Saturday |

#### The six lanes

| Lane | Scope | Suggested worktree/owner | Mode | Collision callouts |
| --- | --- | --- | --- | --- |
| A — Board & ledger hygiene | Cross off resolved rows (WL-P2-54..57/59/60/62, FI-005, FI-006, G-004), `markCardDone` their cards, fix the WL-P2-46 duplicate card, verify G-007 residual scope (only half (c), the worktree fan-out subagents, looks unshipped) + narrow the row, reclassify MB-* as operator-manual, RISK #13 rotation runbook | `ronin-0548` · Cody (docs+DB) | Buildable now | Ledger .md appends from live-lane bow-outs = trivial conflicts; needs canonical `.env` for `markCardDone` |
| B — Admin-route retirement | WL-P2-40 (sidebar/command-palette → `/app` routes), WL-P3-34 (old `/admin` shell raw role check), FS-0026 residue grep, close RISK #3 | `ronin-0549` · Cody→Doug | Buildable now | `config/admin-sections.ts` is admin-side; billing lane 0545 is member-side — verify at merge |
| C — Test infrastructure | G-012 fixture-ownership module (6 copied `inRolledBackTx` → one adapter) + TFF-008/010/011. EXCLUDE TFF-006 (collides with 0545 billing) | `ronin-0551` · Cody→Doug | Buildable now | Test files only; zero app-code overlap |
| D — Lifecycle-email copy audit | FI-002 across all `LifecycleEmailKind` (FI-012 was the worst instance, already fixed — audit the rest) | `ronin-0552` · Cody + Desi review | Buildable now | `emails/` + `lib/email` only — disjoint |
| E — G-005 m-card consolidation | Extract Dirstarter L1 `Card` down into `packages/ui-kit`, rebase kernel m-card, fold 5 bespoke cards onto `ListingCard` per ADR 0040 §5–§6 checklist | `ronin-0553` · Cody→Giddy+Desi | Buildable (doctrine ratified) — merge LAST | HIGHEST collision surface: `components/common/card.tsx` imported repo-wide; rebase over 0545/0546/0541 merges, never the reverse |
| F — Claim-funnel feature plan | FI-003 bundling FI-017 + WL-P2-13 + WL-P2-39 (coherent claim-domain slice) | Petey plan doc first, no worktree | PLAN-FIRST — needs operator grill (registration vs claim semantics, approval authority, Affiliation wiring) | Claim core = the moat; build only after grill; sequence after 0541 belt lane lands (shared trust-model files) |

#### Sequencing + honesty note

- Merge order Friday: A first, then B/C/D as green, E last. Saturday = Lane F build (if grilled)
  + UI polish batch.
- Honest math: after hygiene + exclusions ~55 real items remain; the WL P3 long tail (~15 rows)
  will NOT clear by Saturday — batch re-park decision at Saturday's close.

## Review log

Plan-only session; review = operator accepted the lane map and chose to pause fan-out.

## Hostile close review

Not applicable — plan-only, docs-only session (one SESSION file); lean close at explicit operator
direction ("bow out cleanly, commit only SESSION_0547.md, push docs-only").

## ADR / ubiquitous-language check

- ADR update not required — planning lane, no decisions ratified (lane selections deferred to operator).
- Ubiquitous language update not required.

## Reflections

The sweep's highest-value output wasn't the ranking — it was the exclusion map: an undeclared
fourth live worktree (0550 CSP-enforce) and the MB-ledger's true identity (manual-boundary-registry
= operator-manual, not agent work) together removed ~15 items that would otherwise have been
double-planned. Board hygiene (stale resolved rows) is the cheapest card-count win and should stay
a standing first lane in any clear-the-board push.

## Full close evidence

| Step | Proof |
| --- | --- |
| Session file | This file, filled at close (plan persisted in `## Next session`) |
| Git hygiene | `git pull --rebase origin main` then targeted `git add docs/sprints/SESSION_0547.md`, docs-only commit + authorized push |
| Graphify refresh | Skipped — docs-only lean close at operator direction |
| Ledger routing | No new findings routed — sweep only; stale-row cross-offs deferred to Lane A by design |
| Memory sweep | No durable memory changes needed (session facts live in this file) |
