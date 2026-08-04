---
title: "Petey plan 0741 — next-session automation epic (bow-in as dispatch)"
slug: petey-plan-0741-next-session-automation
type: plan
status: ratified
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0741
pairs_with:

  - docs/architecture/research/research-review-next-session-automation.md
  - docs/sprints/SESSION_0741.md
  - docs/sprints/_template/PROMPT_TEMPLATE.md
  - docs/protocols/recipes/orchestrator.md
backlinks:

  - docs/sprints/SESSION_0741.md
---

# Petey plan 0741 — next-session automation epic

**Ratified:** SESSION_0741 (operator fork picks, 2026-08-03, mobile grill — 7 forks + 3
unvetoed defaults). **Input:** the SESSION_0739 `/rr` report
([research-review-next-session-automation](../../architecture/research/research-review-next-session-automation.md))
— its phase model, overlap map, and open questions are adopted as-is except where a pinned
decision below overrides. **Mode:** plan + staged stub; NO product code this session.
**Wayfinder map:** the epic's decision index is the `wayfinder:map` issue charted by
SESSION_0741 (see the SESSION file `## Artifacts`).

## The one sentence

Mechanize the existing bow-out→bow-in seam — *"the next `/bow-in` IS the dispatch — no
pasting"* (`recipes/orchestrator.md:56`) — by making the staged stub self-contained and
machine-markable, extending the live hooks/gates, refitting `auto-session.sh` as the one
run-rung engine, and absorbing the G-031 S5 `opening.md` rework so the bow-in path has ONE
owner.

## Pinned decisions (do NOT re-litigate)

| # | Fork | Pick | Consequence |
| --- | --- | --- | --- |
| D1 | G-031 S5 ownership | **Inside** | This epic absorbs S5-remainder; ONE `opening.md` rework (slice B4); S4 facet migration slots in as prereq slice B3. G-031 and this epic share one owner on the bow-in path. |
| D2 | `auto-session.sh` | **Refit** | Phase 1 = slice B5: fix the stale remote guard (`scripts/auto-session.sh:39-42` still expects `*ronin-dojo-baseline*`), replace the dead embedded prompt (`:54-89`, retired petey-plan-0305 epic) with "adopt the highest `status: staged` stub; its fenced kickoff IS the dispatch; refuse unless `autonomy: headless-ok`." Keep the proven brakes (clean-tree, exactly-one-commit, ntfy) + stacked-PR shape. Operator-fired only. Never a second engine. |
| D3 | Card frontmatter schema | **NOW** (operator override of the research rec to defer) | Slice B2 adds the additive per-card contract block — `personas:` · `load_set:` · `inputs:` · `gates:` · `output_contract:` — to every `docs/protocols/recipes/*.md` card. Bodies stay prose (the why); seq-skills stay the executable order (ADR 0052 D7 anti-drift). Plus the cheap `recipe:`-value validation lint (research gap 5). |
| D4 | Baton home | **In-stub** | The filled PROMPT_TEMPLATE kickoff lives IN the staged stub (self-contained, one file to adopt). The closer's `## Next session` section keeps Goal + First-task lines and POINTS at the stub — Gate 13c's detection moves with it. Single-state-file doctrine holds: the stub is the one state file for session N+1. |
| D5 | `model:` facet | **Pin at close** | Operator pins the model per-stub at staging; a scheduler/driver never chooses. Empty facet = attended paste decides. |
| D6 | Phase-3 scheduled fire | **Sibling, deferred** | Designed as Hermes' repo-side sibling sharing launchd/ntfy plumbing; build DEFERRED behind G-014 phase 1. This plan names it; no slice builds it. |
| D7 | Headless cost policy | **Docs-only + cap 1** | Calibration fires: docs-only lanes, max 1 headless run per fire, AM review per merge-wave. |
| D8 | `autonomy:` ratification (default, unvetoed) | Operator ratifies at close; **never `headless-ok` by default**; Petey may propose. |
| D9 | Phone-session coverage (default, unvetoed) | **Accept the gap** — Dispatch/cloud sessions keep the paste; hooks only hydrate laptop/canonical sessions. |
| D10 | Gate 13c evolution (default, unvetoed) | 13c **fails the close** when a `headless-ok` stub's kickoff contains an unpinned fork marker; stays detect-only for attended stubs. |

## Slices

Epic = one goals-ledger row (G-023 child, cross-ref G-031 — proposed edit routed via
SESSION_0741, single-writer discipline). Each slice is one session-lane, one PR, ratified
here so the build sessions grill nothing.

### B1 — Phase 0: self-contained stub + facets + hook/gate extension (SESSION_0742, staged)

- **What:** (a) SESSION_TEMPLATE + PROMPT_TEMPLATE convention flip per D4 — kickoff into the
  stub, `## Next session` becomes pointer + Goal/First-task; (b) add `autonomy:
  attended-only | headless-ok` (required) + `model:` (optional) stub facets per D5/D8;
  (c) extend Gate 13c: follow the pointer, verify the stub carries the fenced kickoff +
  facets; implement D10's headless fail mode; (d) extend `.claude/hooks/bow-in-gates.sh` to
  emit stub path + Goal + First-task + `recipe:` + `autonomy:` + top-3 board picks
  (`board-backlog --json`) at SessionStart.
- **Files:** `docs/sprints/_template/SESSION_TEMPLATE.md` · `_template/PROMPT_TEMPLATE.md` ·
  `scripts/bow-out-gates.sh` (13c block) · `.claude/hooks/bow-in-gates.sh` ·
  `docs/rituals/closing.md` (baton wording).
- **Done means:** a staged stub validates through the extended 13c; a fresh session's
  SessionStart output shows the hydration block; `docs/sprints/SESSION_0742.md` itself is the
  first conforming exemplar.
- **Depends on:** nothing. **Staged as SESSION_0742** (number reserved via branch
  `session-0742-automation-phase0`).

### B2 — Recipe-card contract block + `recipe:` lint (D3)

- **What:** additive frontmatter block (`personas/load_set/inputs/gates/output_contract`) on
  every `docs/protocols/recipes/*.md` card, lifting `lane.md`'s 6-item minimum-output
  contract as the first `output_contract`; a wiki-lint (or gate) check that any SESSION
  `recipe:` value names an existing card.
- **Done means:** all cards carry the block; lint fails on a bogus `recipe:` value.
- **Depends on:** nothing (disjoint from B1 — fan-out candidate).

### B3 — G-031 S4: facet migration (`lane:` → `brand:` + `stage:`)

- **What:** the already-locked G-031 decision ② — rename the brand axis, add `stage:`,
  migrate SESSION frontmatter + `--lane=` filters + ledger/board parsers.
- **Done means:** aggregators + gate runners read the new facets; old key tolerated
  read-only during transition.
- **Depends on:** nothing structurally, but merge-order-sensitive (wide frontmatter touch —
  schedule when no parallel session is mid-flight).

### B4 — G-031 S5: `opening.md` lean rework (absorbs automation wording)

- **What:** the S5 lean single-lane rework per the locked G-031 decisions ①–⑧, now ALSO
  carrying the automation seam language (stub-as-dispatch, hydration expectations). ONE
  rewrite, one owner (D1).
- **Done means:** opening.md matches the G-031 discover-then-load model + B1's conventions;
  `/bow-in` skill body updated in the same PR (FS-0037 skill-body rule).
- **Depends on:** B1 + B2 + B3.

### B5 — Phase 1: `auto-session.sh` refit (D2)

- **What:** the D2 refit. Driver refuses stubs lacking `autonomy: headless-ok` (D8), obeys
  D7 (docs-only lanes, N=1 default), keeps brakes + ntfy + stacked-PR shape.
- **Done means:** dry-run against an attended-only stub refuses; against a synthetic
  `headless-ok` stub it dispatches, brakes hold, PR opens on the stacked branch.
- **Depends on:** B1 (facets exist). B4 not required.

### Phase 2 — calibration (operator process, not a build slice)

3–5 attended closes stage `headless-ok` stubs; operator fires B5's driver on one (D7 caps);
grade each fire; AM review per merge-wave. Exit = telemetry showing clean closes without
intervention.

### Phase 3 — scheduled fire (named only, D6)

Queue-gated (fires only when a `headless-ok` stub exists), PR-open max, explicit standing
word per run, launchd + ntfy shared with Hermes. **Deferred behind G-014 phase 1.** No slice.

## Parallelism

B1 ∥ B2 are genuinely disjoint (distinct file sets, independently reviewable) — fan-out
candidates. B3 is wide-touch → run solo. B4 is the convergence slice. B5 can run any time
after B1. Recommended order: **B1 → B2 (∥ ok) → B3 → B4 → B5** — one slice per session,
sequential by default (the epic touches the session-OS itself; churn discipline beats speed).

## Risks

1. **Two session-start authorities** — mitigated: everything wraps `/bow-in`
   (invoke-never-replace, G-029); the stub stays the ONE state file (D4).
2. **Mint race with parallel sessions** — 0742 reserved via branch (ADR 0049 reservation);
   B3's wide frontmatter touch scheduled solo.
3. **Gate 13c false-fails during the D4 convention flip** — B1 ships template + gate in one
   PR; 13c accepts both homes for one transition session, then tightens.
4. **Stale-spec dispatch** (waves failure mode 3) — driver re-verifies the stub is still the
   highest + still `staged` at fire time.
5. **Headless breach of push/merge law** — unchanged backstops: server-enforced PR-only
   main + required checks + escalation valve; merge stays manual forever.

## Scope guard

No Dynamic-Workflow engine; no second driver beside `auto-session.sh`; no scheduler build
(Phase 3 named only); no phone-session coverage work (D9); merge automation never. Law path:
prove the run HERE → ratify card/protocol text in rdd-monorepo (process-OS
upstream-of-record) → cherry-pick down (G-035 pattern).
