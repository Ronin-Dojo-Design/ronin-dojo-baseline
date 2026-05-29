---
title: Baseline Repo Docs Adoption Checklist
slug: baseline-docs-adoption-checklist
type: protocol
status: deprecated
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
pairs_with:
  - repo-truth-index
  - aliases-and-canonical-ids
  - manual-boundary-registry
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0010.md
tags:
  - adoption
  - governance
  - onboarding
---

# Baseline Repo Docs Adoption Checklist

## Summary

Operational checklist used during SESSION_0010 to adopt the imported `ronin_dojo_baseline_systems_pack` docs into baseline repo canon. Captures the order of operations: preserve → canonicalize → wire → sessionize → choose next proof target.

## Status

Active. Phase 1–4 executed during SESSION_0010 (2026-04-27). Phase 5 next-target selection is recorded in the session file.

## Purpose

Provide a repeatable adoption flow for any future ChatGPT-or-other-source doc pack so we never:

- leave imports flat in `docs/`
- end up with two differently-named files saying nearly the same thing
- lose traceability between raw import → canonical version

## Trigger

A new doc pack lands in the repo from an external authoring session (ChatGPT, design partner, audit, etc.) and needs to be adopted into canon.

## Steps

### Phase 1 — preserve

- create `docs/_imports/<pack-name>/`
- copy raw imported docs there unchanged

### Phase 2 — create canon files

- write canonical versions at their final repo paths
- add JETTY 3.0 frontmatter
- add required section stubs (per type — see `docs/protocols/wiki-lint.md`)
- port useful content from the imported versions

### Phase 3 — wire repo memory

- update `docs/knowledge/wiki/index.md` with new entries
- add `backlinks` and `pairs_with` to related docs
- inject links from program-plan, plan-vs-current, opening, closing, chat-handoff where relevant

### Phase 4 — sessionize the adoption

- create the next `SESSION_NNNN.md`
- record adoption as the goal
- list files touched
- set the next session target at bow-out

### Phase 5 — choose the next real execution step

- consult `manual-boundary-registry.md` to choose the next actual proof target
- escape "planned" or "code-complete / smoke-pending" by promoting one item to "verified"

## Outputs

- canonical docs at their final paths with frontmatter and section stubs
- raw imports preserved under `docs/_imports/<pack-name>/`
- updated wiki index
- cross-links from existing canonical docs
- a closed-out SESSION file with a chosen next proof target

## Anti-patterns

- replacing imports immediately (loses comparison ability)
- leaving raw imports flat in `docs/`
- letting two near-duplicate files stay active forever
- skipping the sessionize step (no audit trail of what was adopted when)

## Cross-references

- [Repo Truth Index](repo-truth-index.md)
- [Aliases and Canonical IDs](aliases-and-canonical-ids.md)
- [Manual Boundary Registry](manual-boundary-registry.md)
- [Next Session Loading Order](../../protocols/next-session-loading-order.md)
- [SESSION_0010](../../sprints/_archive/SESSION_0010.md) — the session that executed this checklist for the baseline systems pack
