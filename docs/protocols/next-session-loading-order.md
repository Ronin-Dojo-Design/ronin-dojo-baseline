---
title: Next Session Loading Order
slug: next-session-loading-order
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
pairs_with:
  - docs/protocols/chat-handoff.md
  - docs/rituals/opening.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - session
  - loading
  - workflow
---

## Summary

Define the **new baseline repo** loading order. Replaces old heavy context loading habits. Load the active session state first, then the current lane plan, then specific architecture/runbook docs needed for the task — and only then any wider references.

## Status

Active, adopted SESSION_0010.

## Purpose

Stop drowning new sessions in context. Make sure each session opens with the active state, current roadmap, documentation map, and only the lane-specific truth needed for the task. Load the current state. Load the current lane. Load the minimum needed truth. Then work.

## Trigger

Use this protocol at the start of every session, plus whenever a session pivots into a new lane. Pair with `docs/rituals/opening.md` and `docs/protocols/chat-handoff.md`.

## Steps

### 1. First principle

Do not load everything. Load:

1. the active session state
2. the current lane plan
3. the specific architecture/runbook docs needed for the task
4. only then any wider references

### 2. Default loading order

#### Tier 1 — always first
1. latest `docs/sprints/SESSION_NNNN.md`
2. `docs/architecture/program-plan.md`
3. `docs/knowledge/wiki/index.md`

This gives you active state, current roadmap, and the documentation map.

#### Tier 2 — load when architecture matters
4. `docs/architecture/plan-vs-current.md`
5. relevant ADR(s)
6. `apps/web/prisma/schema.prisma` if the task touches durable data
7. `docs/architecture/auth.md` if the task touches auth, brand context, or permissions

#### Tier 3 — control docs when needed
8. `docs/knowledge/wiki/repo-truth-index.md`
9. `docs/knowledge/wiki/aliases-and-canonical-ids.md`
10. `docs/knowledge/wiki/manual-boundary-registry.md`
11. `docs/knowledge/jetty-3-baseline-systems-profile.md`

Use these when canon is fuzzy, names are changing, release gates matter, or documentation is being upgraded.

### 3. Lane-specific loading

#### A. Schema / backend lane

- latest SESSION file
- program plan
- plan-vs-current
- schema.prisma
- auth.md if permissions or brand scoping are relevant
- database / prisma runbooks
- manual boundary registry if proof or migration safety matters

#### B. Auth / brand-context lane

- latest SESSION file
- auth.md
- ADR 0004
- program plan
- manual boundary registry
- alias ledger

#### C. Ritual / protocol / documentation lane

- latest SESSION file
- wiki index
- JETTY 3.0 canonical doc
- JETTY systems profile
- relevant ritual/protocol file
- truth index if the page is doctrinal

#### D. Content-engine lane

- latest SESSION file
- wiki index
- truth index
- content-engine command center doc
- current content lane docs
- Iggy/video intake flow doc
- alias ledger if brand-targeted publishing is involved

#### E. Frontend/UI lane

- latest SESSION file
- program plan
- lane-specific architecture docs
- schema or API contract docs as needed
- brand/alias docs only if presentation or brand switch behavior is touched

### 4. Do not auto-load

- old monorepo dashboard structures
- giant historical planning dumps
- every ADR
- every session file
- every wiki page
- every content draft

Reference is available. Reference is not active context.

### 5. Session-start checklist

Before starting:

1. What is the lane?
2. What is the one task?
3. What durable data does it touch?
4. What docs define that behavior?
5. Are there open manual boundaries?
6. Are naming/migration rules relevant?

If that is clear, the loading order is clear.

### 6. One-minute version

If you are in a hurry, load only:

1. latest SESSION file
2. `program-plan.md`
3. `wiki/index.md`

Then pick the one lane doc that matches the task. That is the best lightweight default.

## Outputs

- Every session opens with Tier 1 already loaded.
- Tier 2 / Tier 3 are pulled in by lane, not by reflex.
- The session avoids loading legacy or out-of-lane context that would dilute focus.

Source: `docs/_imports/baseline-systems-pack/07_NEXT_SESSION_LOADING_ORDER_BASELINE.md`
