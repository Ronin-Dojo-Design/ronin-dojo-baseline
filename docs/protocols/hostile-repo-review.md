---
title: Hostile Repo Review
slug: hostile-repo-review
type: protocol
status: active
created: 2026-05-06
updated: 2026-06-28
author: Brian + ChatGPT
last_agent: claude-session-0467
pairs_with:
  - docs/protocols/hostile-close-review.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md
  - docs/runbooks/dev-environment/graphify-repo-memory.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - hostile-review
  - repo-health
  - component-porting
  - graphify
  - drift
  - leaning
---

# Hostile Repo Review

> **Refreshed SESSION_0467** — added the Graphify-first method (§Method), the six hunt-lenses
> (§Lenses), the finding-router output, and the *what-would-Apple-do* mantra. **Governs the S48
> repo-health sprint.** (Meta-note: this protocol already existed but had drifted out of memory — almost
> re-authored from scratch this session, which is itself the cross-cutting drift it hunts. Predicted by
> [Learning Record 0005](../learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md).)

## Summary

This protocol is a repo-wide hostile review, not a session-close review (its per-diff sibling is
[`hostile-close-review.md`](hostile-close-review.md)). Run it when the repo has accumulated enough work
that the team needs to interrogate **structure, searchability, component reuse, token burn, duplication,
dead/orphaned work, and workflow honesty** before the next large lane — the cross-cutting drift a
per-session close structurally cannot see.

> **Mantra: what would Apple / Facebook do?** They do not keep three "one card" docs, a 3M imported vault
> nobody reads, or a god-component with a five-way `kind` union. One foundation, a few single-purpose
> pieces, delete the rest. This review hunts the gap between that bar and reality.

## Status

Active. Use before large porting lanes, legacy component conversions, launch hardening, or agent workflow redesign.

## Purpose

Stop the repo from becoming slow, expensive, and hard to navigate just because it is large and well-documented.

The hostile stance is:

> If Claude or any agent has to grep the world every time it needs a component, the repo memory system is failing.

## Trigger

Run this when any of these are true:

- a new large lane begins
- old monorepo React components are being ported into Next
- agents are burning tokens rediscovering files
- component reuse is inconsistent
- Dirstarter/L1 inventory compliance is at risk
- the wiki index exists but does not answer the agent’s next question fast enough
- component drift or duplicate UI is suspected

## Steps

## Method — Graphify-first, then verify by inspection

Discovery is [Graphify](../runbooks/dev-environment/graphify-repo-memory.md)-first — the graph *is* the
"what's wired" oracle. **Quantify every finding** (size, file count, connectivity); never assert from a vibe.

```bash
graphify stats                                   # baseline: nodes / edges / communities / files
graphify query "<system / loop / protocol nouns>" --budget 2000   # what relates to X
graphify explain "<node>"                         # is this node wired (edges) or orphaned (isolated)?
graphify path "<A>" "<B>"                          # is the claimed wiring actually there?
```

Then open the exact files and confirm by direct source/doc inspection. Graphify is navigation, not proof.

## The six hunt-lenses (what to look for)

1. **Duplication & forks** — N copies of one file; multiple "the one X" claims (cards, configs, helpers);
   parallel reimplementations. *Is there exactly one of this thing?*
2. **Dead / orphaned** — low graph connectivity; retired-but-present docs (`archived-frozen` still in an
   active dir); unreferenced protocols / skills / scripts. *Does anything point at this?*
3. **Wired vs lost-in-the-wind** — for each system/loop/protocol built in recent sprints, is it referenced
   *and* active today (a real call site / ritual hook), or built-then-abandoned? `graphify explain` each.
4. **Confidently-wrong docs** — imported/remembered values that contradict the live code (the deleted
   `_imports/monorepo-design-system` gold-BBL corpus is the canonical example). Worse than no docs.
5. **Token-weight / sprawl** — biggest files + dirs; SESSION sprawl (archive/compact candidates); anything a
   fresh agent must wade through that it shouldn't.
6. **Boundary integrity** — kernel purity (no app coupling in `packages/ui-kit`), ADR adherence, design-system
   doctrine conformance (no `kind` god-unions; tokens-as-contract).

### 1. Confirm active repo spine

Check:

- `README.md`
- `docs/knowledge/wiki/index.md`
- `docs/knowledge/JETTY_3.0.md`
- `docs/protocols/WORKFLOW_5.0.md`
- `docs/protocols/hostile-close-review.md`
- `docs/knowledge/wiki/dirstarter-component-inventory.md`

### 2. Ask the hostile questions

#### Repo memory

- Can an agent find the right component in under 60 seconds?
- Does the wiki index point to the right inventory?
- Are file pages and component pages discoverable without brute-force grep?
- Are stale docs clearly marked?

#### Component reuse

- Is the L1 Dirstarter component inventory consulted before building?
- Are custom components justified, or are they hand-rolled duplicates?
- Are forms using the repo form stack?
- Are tables using the DataTable system?
- Are listings following Query -> Listing -> List -> Card?

#### Component porting

- Does each legacy component have a mapping record?
- Is the port target a Dirstarter primitive, a Ronin custom component, or a new component?
- Are props, state, auth, data, styling, and mobile behavior accounted for?
- Is the old component being ported or rewritten blindly?

#### Token efficiency

- Does the agent need raw grep, or can it use an index/graph?
- Is there a graph/report/cache layer?
- Are repeated discovery questions compiled into a persistent wiki page?
- Are port discoveries being saved back into the repo?

#### Verification honesty

- Did tests prove the port works, or only that TypeScript compiles?
- Did the port preserve behavior?
- Did the port improve Dirstarter compliance?
- Did the runbook record open risks?

### 3. Score the repo slice

Use this rubric:

| Category | Weight | Failure cap |
| --- | ---: | --- |
| Repo memory / discoverability | 2.0 | cap 8.9 if agents must repeatedly grep raw files |
| Dirstarter/L1 component compliance | 2.0 | cap 8.9 if baseline components were bypassed |
| Component port safety | 2.0 | cap 8.9 if behavior parity is unproven |
| Token efficiency / graph readiness | 1.5 | cap 9.2 if no persistent map exists |
| Workflow 5.0 alignment | 1.5 | cap 9.4 if session/runbook/review logs are missing |
| Test/proof readiness | 1.0 | cap 9.4 if credible QA plan is missing |

### 4. Required output

Append a hostile repo review section to the next SESSION file or create a dedicated review note.

Use this shape:

```md
## Hostile Repo Review — SESSION_NNNN

**Lane:** component-porting | repo-memory | launch-hardening | other
**Scope reviewed:**
**Dirstarter/L1 component inventory checked:** yes | no
**Graph/wiki/index checked:** yes | no
**Token-risk verdict:** low | medium | high
**Score:** x / 10
**Verdict:** blunt paragraph

### Findings

#### HRR-001 — Finding title
- Severity:
- Evidence:
- Impact:
- Required follow-up:
- Status:
```

## Outputs

- repo score + token-efficiency verdict + component-port readiness verdict
- **HRR findings routed to the canonical ledgers** via the finding router (closing.md §6.7): drift →
  [`drift-register`](../knowledge/wiki/drift-register.md) (D); wiring → `wiring-ledger` (WL); dead/duplicated
  → a repo-health (RH) batch in the drift register; decision → ADR.
- **A lean-out action list** — each item: target · **quantified weight** (size / file count / connectivity) ·
  classification (delete / archive / dedup / document / keep) · one-line rationale.
- **An archive/delete plan — operator-gated.** Stage deletes, show the manifest + total reclaimed, delete on
  the word ([[explicit-push-authorization]]). Never delete SESSION history (append-only); never overwrite/
  delete anything that contradicts how it was described without surfacing it first.
- **A wired-vs-dead table** — every recent system/loop/protocol with its live status (active / orphaned /
  retire) so "what did we actually keep" is answerable in one read.
- go/no-go recommendation + bundled lanes for subsequent sessions (the loop-of-loops backlog).

## Cadence + relationship to the per-session close

| | per-session | repo-wide |
| --- | --- | --- |
| Protocol | [`hostile-close-review`](hostile-close-review.md) | this |
| Scope | the session's diff | the whole repo |
| Catches | bugs/regressions in new work | duplication, dead code/docs, forks, sprawl, lost-in-the-wind |
| Cadence | every bow-out | every sprint / on signal |

The two compose: the close keeps each diff honest; the repo review keeps the *whole* honest.

## Petey close

Hostile review is not negativity.

It is how the repo protects speed, safety, and truth.

**Planned Passion Produces Purpose.**
**OSSS.**
