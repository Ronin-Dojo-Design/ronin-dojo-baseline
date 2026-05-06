---
title: Hostile Repo Review
slug: hostile-repo-review
type: protocol
status: active
created: 2026-05-06
updated: 2026-05-06
author: Brian + ChatGPT
last_agent: chatgpt-hostile-review-pack
pairs_with:
  - docs/protocols/hostile-close-review.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/knowledge/wiki/dirstarter-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - hostile-review
  - repo-health
  - component-porting
  - graphify
---

# Hostile Repo Review

## Summary

This protocol is a repo-wide hostile review, not a session-close review. It is used when the repo has accumulated enough work that the team needs to interrogate structure, searchability, component reuse, token burn, and workflow honesty before the next large implementation lane.

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

- repo score
- token-efficiency verdict
- component-port readiness verdict
- findings with required follow-up
- go/no-go recommendation for next session

## Petey close

Hostile review is not negativity.

It is how the repo protects speed, safety, and truth.

**Planned Passion Produces Purpose.**
**OSSS.**
