---
title: "Petey Plan 0357 — BBL Galaxy v1 (three.js) — staging note"
slug: petey-plan-0357-bbl-galaxy
type: plan
status: active
created: 2026-06-07
updated: 2026-06-07
last_agent: claude-session-0355
pairs_with:
  - docs/sprints/SESSION_0355.md
  - docs/product/black-belt-legacy/STORIES.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - galaxy
  - three-js
  - staging
  - deferred
---

# Petey Plan 0357 — BBL Galaxy v1 (three.js) — staging note

> **⏸ STAGED — dedicated session (SESSION_0355).** Operator surfaced a **Black Belt Legacy Galaxy v1**
> three.js feature with spec plans + code authored in ChatGPT (on an external/ChatGPT feature branch,
> **not yet in this repo's remotes** — `git branch -a` shows none galaxy-related as of SESSION_0355).
> At bow-in the operator chose a **dedicated future session** (not a "pull in now"), so nothing was
> pulled this session. This note exists only so the team is aware and the work isn't lost.

## What it is (as described by the operator)

A "Black Belt Legacy Galaxy v1" three.js visualization — a galaxy/constellation-style rendering of the
BBL lineage/black-belt legacy. Spec plans + code exist from a ChatGPT session/branch.

## When it gets pulled in (dedicated session checklist)

1. **Operator provides the source** — the ChatGPT feature-branch name / repo / export (the artifacts are
   external; identify and fetch them with `gh` / `git fetch` or import the files).
2. **Quarantine first** — land the spec docs under `docs/product/black-belt-legacy/` and any code in a
   clearly-isolated dir; do not wire into the app on pull-in.
3. **Dependency review** — `three` (+ react-three-fiber?) is a heavy client dependency; assess bundle
   impact, SSR boundaries, and reduced-motion before any integration (per the repo motion idiom).
4. **Adapt-not-port** — like the carousel epic (petey-plan-0337), take the *feature behavior* and adapt
   onto our primitives + `Rank.colorHex` data (never hardcoded belt colours); no verbatim copy.
5. **Plan as its own epic** — write the real petey-plan for the build once the artifacts are in hand.

## Cross-references

- [SESSION_0355](sprints/SESSION_0355.md) — where this was surfaced + staged.
- [petey-plan-0337](petey-plan-0337-lineage-responsive-carousel.md) — the adapt-not-port precedent.
- [BBL STORIES](product/black-belt-legacy/STORIES.md).
