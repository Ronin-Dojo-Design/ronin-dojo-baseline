---
title: "SOT Cookbook — the one-screen task→workflow router"
slug: sot-cookbook
type: protocol
status: active
created: 2026-07-20
updated: 2026-07-21
last_agent: claude-session-0588
pairs_with:
  - docs/protocols/WORKFLOW_6.0.md
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/protocols/fan-out-session-recipe.md
  - docs/rituals/opening.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - orchestration
  - discoverability
---

# SOT Cookbook — "what do I run for this?"

One screen, read on demand (opening.md step 4 points here). Classify the task, run the matched
row. This table **moved from [`agent-systems-map.md`](../knowledge/wiki/agent-systems-map.md) §1**
at G-023 (SESSION_0584) — the map keeps the *concept* (why routing matters) and cross-refs back
here for the live table.

## The router

| When the task is… | Run | Why |
| --- | --- | --- |
| Unclear / multi-part / has open decisions | **Petey** + [`petey-plan`](petey-plan.md) + `/grill-me` | resolve the decision tree before building |
| Build a feature against a clear plan | **Cody** + [`cody-preflight`](cody-preflight.md) | reuse-first; no blind new components |
| A worktree build lane inside a fan-out | **Cody** + [`seq-lane-build`](../../.claude/skills/seq-lane-build/SKILL.md) or [`recipes/lane.md`](recipes/lane.md) | the invariant lane sequence, lane specifics only |
| Something is broken / a hard bug | `/diagnose` | reproduce → minimise → fix → regression-test |
| "Is this code gold-standard?" | `/code-quality` ([matrix](code-quality-matrix.md)) | graded /10 vs the code-gold-standard |
| Clean up a diff (CRAP / dupes / dead code) | `/fallow-fix-loop` | measured complexity/dup deltas + re-verify |
| Review a branch / diff for bugs | `/code-review` or `/review` | correctness + standards/spec |
| Verify a landed build (Doug+Desi+Giddy) | [`seq-review-wave`](../../.claude/skills/seq-review-wave/SKILL.md) or [`recipes/review-wave.md`](recipes/review-wave.md) | parallel distinct-lens review on one commit |
| Design consistency / mobile / UI-UX review of a surface | Desi + [`recipes/desi-design-review.md`](recipes/desi-design-review.md) · [`mobile`](recipes/mobile-optimization-pass.md) · [`ui-ux`](recipes/ui-ux-pass.md) | the **design** sibling of the code passes → findings to [`desi-design-ledger`](../knowledge/wiki/desi-design-ledger.md) (`DES-NNN`) |
| Keep open PRs merge-ready | `/pr-fix-loop` ([loop](pr-review-score-fix-loop.md)) | review → score → fix, pause-on-merge |
| Prove a change actually works | `/verify` + [`qa-runtime-verification`](qa-runtime-verification.md) | runtime evidence, not "it compiles" |
| Emergency user-blocking prod bug | [`hot-fix-protocol`](hot-fix-protocol.md) | fast within the push gate, not past it |
| A multi-slice epic that decomposes into disjoint lanes | [`recipes/epic-plan.md`](recipes/epic-plan.md) → [`recipes/orchestrator.md`](recipes/orchestrator.md) → N × [`recipes/lane.md`](recipes/lane.md) | plan once, prove disjointness, fan out |
| Staging an unattended overnight fan-out | [`recipes/PM_Planning_Lane.md`](recipes/PM_Planning_Lane.md) (evening) → [`recipes/AM_Coffee_Merge_Review.md`](recipes/AM_Coffee_Merge_Review.md) (morning) | pin every fork before launch; sweep + push-gate at coffee |
| Merging/pushing a branch, gate ladder G0→G4 | [`recipes/merge-wave.md`](recipes/merge-wave.md) | absorbs `giddy-merge-strategy.md`'s gates |
| Research first, recommend, don't build | [`seq-research-recommend`](../../.claude/skills/seq-research-recommend/SKILL.md) + [`review-recommend`](review-recommend.md) | graphify prior-art before proposing anything new |
| Stand up a new client product | `/new-client-recipe` | own DB + brand, monorepo (ADR 0034/0038) |
| Stand up a new brand/client app deploy (plan-first) | [`recipes/new-brand-setup.md`](recipes/new-brand-setup.md) → [intake](recipes/new-brand-intake.md) · [onboarding](recipes/new-brand-onboarding.md) · interviews: [design](recipes/new-brand-interview-design.md)/[business](recipes/new-brand-interview-business.md)/[client](recipes/new-brand-interview-client.md) | own DB+deploy+brand; first-party `apps/*` or client `clients/*` (ADR 0034/0038/0051); RDD = exerciser #1 |
| Turn interviews into mission/motto/brand canon | **Brandon** ([role](../agents/brandon.md)) | separate confirmed truth from recommendations |
| Repo feels heavy / duplicated / drifting | [`hostile-repo-review`](hostile-repo-review.md) | the repo-wide lean-out |

## Recipe cards vs sequence skills — which to read

- **Sequence skills** (`.claude/skills/seq-*`) are thin, invariant step lists — read them when
  you're *executing* a lane/wave; they carry no judgment calls, only the order.
- **Recipe cards** (`docs/protocols/recipes/*.md`) are the fuller **source docs** the sequence
  skills point at — persona pack (who runs it) + load-set (what to read first) + overlays
  (variant/extension points) + minimum-output contract (what must come back). Read a recipe card
  when *planning* a lane/wave, or when a sequence skill's step needs the "why" behind it.
- A staged `SESSION_NNNN.md` stub may carry an additive `recipe:` frontmatter key (e.g.
  `recipe: lane`) naming which card under `recipes/` it hydrates from at adopt — so the stub
  doesn't need the card's content re-pasted inline. See [`_template/SESSION_TEMPLATE.md`](../sprints/_template/SESSION_TEMPLATE.md).

## The abstraction ladder — run → card → skill (climb in order, prove each rung first)

New work does **not** start as a card or a skill. There are three rungs, and pre-building an upper
one is the premature-abstraction trap the whole recipe system exists to avoid (`page-code-review.md`
defers its `/page-review` skill "until the recipe runs clean on 2–3 pages" for exactly this reason):

1. **Run it** — inline, or through the generic `epic-plan → orchestrator → lane → review-wave →
   merge-wave` cards. First time / one-off. Most feature and migration lanes never leave this rung.
2. **Card it** (`docs/protocols/recipes/*.md`) — *once the pattern proves reusable on a real run.*
   The card is the source doc (persona pack + load-set + overlays + minimum-output contract).
3. **Skill-ify it** (`.claude/skills/seq-*` pointing at the card) — **last**, only after the card
   has run clean **2–3 times** and cheap dispatch is worth the maintenance.

**The one exception — "recipe-is-the-deliverable":** when the reusable artifact *is* the point of the
lane (not a byproduct), card it *as* you build it, on a concrete test case — e.g. `quality-suite.md`
(SESSION_0588) was authored during its first run because the recipe was the deliverable. The skill
(rung 3) still waits for 2–3 proven runs. **Litmus test:** if you can't name the concrete run that
proved a card, you're on the wrong rung — run it first. Don't write `seq-<x>` before `<x>` has ever run.

## Escalation valve (every autonomous/overnight recipe carries this)

On merge conflict, a NO-GO review verdict, a gate failure, or genuine ambiguity: **STOP**, hold all
state, keep the push gate shut, and note it for the operator (optionally: "rerun under a stronger
model/persona"). Never force through on a cheaper model or under uncertainty.

## Cross-references

- [WORKFLOW 6.0](WORKFLOW_6.0.md) — the governing OS this router serves.
- [Agent Systems Map](../knowledge/wiki/agent-systems-map.md) — the 5-pillar concept behind routing.
- [Fan-out session recipe](fan-out-session-recipe.md) — the cross-session parallel-lane mechanics.
- [Session command log](../runbooks/dev-environment/session-command-log.md) — real commands run per session (renamed from `session-ops-cookbook.md`).
