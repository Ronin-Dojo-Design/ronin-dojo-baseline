---
title: "Research review — automating the next-session start (dynamic workflow × recipe cards)"
slug: research-review-next-session-automation
type: research
status: complete
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0739
pairs_with:

  - docs/protocols/review-recommend.md
  - docs/protocols/SOT_Cookbook.md
  - docs/protocols/recipes/overnight-orchestrator-waves.md
  - docs/sprints/_template/PROMPT_TEMPLATE.md
backlinks:

  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0739.md
---

# Research review — automating the next-session start

**Commissioned:** SESSION_0739 (operator, 2026-08-03) · **Mode:** `/rr` — research + recommend,
NO build. **Researchers:** Petey (pipeline/options) + Giddy (architecture/overlap), parallel
subagents. **Consumer:** the operator's parallel `/ppp` + wayfinder planning session — §Open
questions and §Overlap map are its intake.

## TL;DR — the ONE recommendation (phased; alternatives named at the end)

**This is mechanizing an existing seam, not building a workflow system.** The orchestrator card
already states the target verbatim — *"the next `/bow-in` IS the dispatch — no pasting"*
(`recipes/orchestrator.md:56`) — and the run-rung prior art exists (`scripts/auto-session.sh`
+ 3 variants). The abstraction ladder (SOT_Cookbook) says harden what that run proves; never
build a second engine beside it.

- **Phase 0 — baton self-containment + hook hydration** (docs + one hook edit, no new mechanism):
  (a) the staged stub becomes self-contained — the filled PROMPT_TEMPLATE kickoff lives IN (or is
  duplicated into) the stub, plus two operator-ratified frontmatter facets set at bow-out:
  `autonomy: attended-only | headless-ok` and optional `model:`; Gate 13c extends to check them.
  (b) extend the live `bow-in-gates.sh` SessionStart hook to also emit stub path + Goal +
  First-task + `recipe:` + `autonomy:` + top-3 board picks (`board-backlog --json`). Every fresh
  session starts pre-hydrated for zero tokens; nothing decides anything.
- **Phase 1 — refit `auto-session.sh` (operator-fired, not scheduled):** fix the stale remote
  guard (`:39-42` still expects `*ronin-dojo-baseline*` → exits 2 in this repo) and replace the
  dead embedded prompt (`:54-89`, hardcodes the retired petey-plan-0305 epic) with "adopt the
  highest staged stub; its fenced kickoff IS your dispatch; refuse unless `autonomy: headless-ok`."
  Keep its proven brakes (clean-tree + exactly-one-commit + ntfy) and stacked-PR shape.
- **Phase 2 — calibrate the autonomy flag:** 3–5 attended closes stage `headless-ok` stubs; the
  operator fires the Phase-1 driver on one; AM review per merge-wave. Calibration before
  automation.
- **Phase 3 (optional; sequenced behind G-014/G-015):** scheduled fire — launchd + ntfy,
  **queue-gated not time-gated** (fires only when a `headless-ok` stub exists), PR-open max,
  explicit standing word per run. Built as the repo-side sibling of Hermes sharing its
  launchd/ntfy plumbing — never a competing third mechanism (`pm-planning-lane.md:43-48`).

**Alternatives named:** *Dynamic Workflow engine* — most expensive, creates a second bow-in
source of truth, and recipe cards lack machine step schemas; revisit only if Phase 0–1 telemetry
shows bow-in mechanics still burning tokens. *Cron-first* — stale-spec hazard + time-vs-queue
doctrine violation; deferred into the Phase-3 queue-gated form. */loop continuation* — rejected
outright by the cold-process doctrine (`autonomous-sessions.md:30-35`: fresh headless process per
session, no shared context to decay).

**What the operator still does by hand:** Phase 0 — elects/ratifies lane + autonomy + model at
close; answers the 6b questions; authorizes every push; merges. Phase 1 — plus fires the driver.
Phase 2 — plus grades each `headless-ok`. Phase 3 — sets schedule + per-run standing word; reads
the AM digest. **Merge stays manual forever** (merge authority IS prod-deploy authority).

## Current pipeline (verified end-to-end)

Bow-out N → operator paste → bow-in N+1: `bow-out-gates.sh` (Gate 13c enforces the baton) →
review-recommend seeds Next-session (board → ledger → boundary check) → mint N+1 + `status:
staged` stub (ADR 0049) → PROMPT_TEMPLATE filled into the closer's `## Next session` fenced block
→ **operator pastes into a fresh chat + picks model** → bow-in: SessionStart hooks fire, stub
adopted (flip to `in-progress`), FS-0024/claim/doctor guards, backlog scan, mandatory 6b
`AskUserQuestion` gate.

**Pure mechanics (automatable):** stub adoption, guards, mint, branch, worktree bootstrap,
backlog aggregation (both aggregators have `--json`), gates, stub creation at close.
**Judgment (operator):** lane election/pivot (6b), bundling coherence, fork pinning, model
choice, push/merge/deploy, SotD publish ask.

## Prior-art inventory (the load-bearing rows)

| Artifact | State |
| --- | --- |
| `scripts/auto-session.sh` (+3 variants) | The 0582 run-rung: cold `claude -p` per session, stacked branches, clean-tree + exactly-one-commit brakes, branch-push + PR-open, ntfy. **Shape reusable; body stale** (dead remote guard `:39-42`; embedded prompt predates PROMPT_TEMPLATE). |
| `.claude/settings.json` SessionStart hooks | `pr-nudge.ts` + `bow-in-gates.sh` already auto-hydrate PR backlog + claim/doctor state — **the zero-token hydration pattern is ratified and running**; Stop hook = bow-out reminder. |
| `recipes/orchestrator.md:56` · `overnight-orchestrator-waves.md` | Staged-stub-as-dispatch stated; HARD-RULES preamble anatomy (`:110-128`) = the de-facto machine contract for unattended dispatch; AM-stub-as-baton; merge-gate-held law (`:216-222`); stale-spec failure mode (`:232-236`). |
| `PROMPT_TEMPLATE.md` (0734) + ADR 0049 stubs + `recipe:` key | The baton pipeline this automation wraps. SESSION_0740 is a live exemplar stub. |
| `ledger-backlog.ts` / `board-backlog.ts` | Machine-readable lane-selection inputs already exist (`--json`). |
| Research precedents | SotD /rr: zero-token deterministic render beats agent-publish. Cowork /rr: notify-only/draft-only, never auto-act. Both generalize here. |

## Recipe-card fit + the smallest schema change

**Card = spec, baton = instance is already the ratified model** (`recipe:` key hydrates from the
card; the PROMPT_TEMPLATE `RECIPE:` line says the card/skill is the spec). Gaps for machine
consumption:

1. **Baton split across two files** — the stub points at the closer's `## Next session` for the
   fenced prompt; not self-contained (Phase 0a fixes).
2. **No headless-safety marker** — nothing distinguishes a fork-free stub from an attended-only
   one; the single most important missing field for ANY auto-fire (Phase 0a's `autonomy:`).
3. **`{MODEL}` is prose** inside the fenced prompt — unreadable by a scheduler, and a scheduler
   must never choose (Phase 0a's optional `model:` facet).
4. **Card steps are prose headings** — fine for an LLM reader; blocking only for a deterministic
   engine (a reason NOT to build option 3 first). If/when needed, Giddy's smallest change: an
   **additive frontmatter contract block** per card (`personas:` · `load_set:` · `inputs:` ·
   `gates:` · `output_contract:`) — bodies stay prose (the why), seq-skills stay the executable
   order, avoiding the two-doc drift ADR 0052 D7 rejected. `lane.md:54-63`'s 6-item min-output
   contract is ready for lifting.
5. `recipe:` value is unvalidated — no lint that the named card exists (cheap Gate add).

## Architecture verdict + law path

Session-OS layer (Pillar 1 ∩ Pillar 3), not a new pillar. Automation **wraps `/bow-in`, never
replaces it** (G-029's invoke-never-replace law generalizes). Ratify-then-conform: **prove the
run here** (BBL is the active lane) → **ratify card/protocol text in rdd-monorepo** (process-OS
upstream-of-record) → cherry-pick down to the 4 siblings (the G-035 up-sync pattern). Sprint-row
fit = a goals-ledger row (child of G-023, sequenced against G-031 S5), not program-plan (no live
sprint row; doc partially superseded). **Conform flag found in passing:** the local
`ronin-project-context.md:72-77` is still monorepo-era — contradicts ADR 0055/0059.

## Binding constraints (never-do)

Per-action word for push/merge/deploy (agent-systems-map §4); overnight standing word = branch
push + PR-open ONLY, explicit in-session, never inferred; merge gate held — server backstop =
PR-only main + required checks; escalation valve mandatory in every autonomous recipe; serial
minting (FS-0038); shared ledgers single-writer (Proposed-ledger-edits discipline); mandatory
steps live in the executed skill body, never ritual prose (FS-0037/FS-0045); manual-boundary
registry: surface operator-manual steps, never absorb them; no MB row forbids bow-in automation.

## Overlap map (for the parallel /ppp + wayfinder session)

| Row | Owns | Verdict |
| --- | --- | --- |
| **G-031 S5** (opening.md rework) | The same bow-in path | **COLLISION — highest risk. One owner; sequence S5 before or inside this epic.** |
| **G-023** (recipe cards, `recipe:` key, router) | Card format + hydration | COMPOSE — this work is a G-023 continuation; card-schema change is a G-023 child. |
| **G-015 Hermes** (launchd `claude -p` + ntfy; never auto-sends) | The scheduling substrate | COMPOSE with boundary — one scheduler pattern, two job families; never a second launchd runner. Phase 3 sequenced behind it (Hermes depends on G-014 phase 1). |
| **G-007** (PR backlog as lane source) | Candidate surfacing | COMPOSE — consume the aggregators, never re-derive. |
| **SSS / overnight-orchestrator** (0582/0635) | Multi-wave autonomous dispatch | COMPOSE — this is the single-next-session sibling; reuse HARD-RULES preamble + stub-as-baton wholesale. |
| **G-029** (brand overlays) | Invoke-never-replace law | COMPOSE — inherit verbatim. |
| **G-014** (vault-kit; vendored wayfinder) | Only touches via wayfinder + MB-016 | Neutral/COMPOSE. |
| **State-of-Dojo** (`/app/state`; WL-P2-71/WL-P3-60) | Read-projection surfaces | COMPOSE — status projects into SotD panels; no new dashboard. |
| **auto-session.sh family** | The existing run-rung engine | COMPOSE/SUPERSEDE-CANDIDATE — cost every design against it; never a second engine. |
| **Sibling repos** | rdd-monorepo = process-OS upstream | COMPOSE — ratify there, cherry-pick down. |

Suggested opener for the planning session: make the three collision items — **G-031 S5
ownership · auto-session.sh engine disposition · card frontmatter schema** — its first
`wayfinder:grilling` tickets (plan-only).

## Top risks (mitigations the OS already provides)

1. Two session-start authorities → WORKFLOW 6.0 rule 1 + invoke-never-replace + single-state-file
   doctrine. 2. Premature abstraction → the ladder litmus; auto-session.sh is the named proving
   run. 3. Stale-spec dispatch → verify-first law (waves failure mode 3); queue-gated firing.
4. Autonomy breaching push/merge law → server-enforced PR-only main + required checks +
   escalation valve. 5. Mandatory steps rotting in prose → skill-body rule + deterministic gate
   runners.

## Open questions (the planning session's intake)

1. Baton home: prompt INTO the stub (self-contained) vs formalized two-file join — tension with
   single-state-file doctrine.
2. `autonomy:` ratification — Petey proposes / operator ratifies? Never `headless-ok` by default
   (recommended).
3. `model:` facet — pin per-stub at staging, or default-with-escalation-valve for headless fires?
4. G-015 sequencing — Phase-3 scheduler: part of Hermes, sibling sharing plumbing, or deferred
   behind G-014 phase 1?
5. Coverage gap — SessionStart hooks fire for laptop/canonical sessions; phone-started
   Dispatch/cloud sessions still need the paste. Accept, or Cowork/connector territory?
6. Cost policy — headless fires pay full CI + tokens; cap N per run? docs-only lanes first?
7. Gate 13c evolution — fail the close when a `headless-ok` stub's kickoff contains an unpinned
   fork marker?

## Routing

Recorded in `SESSION_0739.md` (Graphify/rr record + Proposed ledger edit: a G-023-child goal row
for Phase 0–1, sequenced against G-031 S5 — routed at bow-out, single-writer discipline). No
build performed; ratification and any dispatch belong to the operator's parallel planning
session.
