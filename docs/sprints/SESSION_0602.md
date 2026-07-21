---
title: "SESSION 0602 — PLAN: branded client-onboarding artifacts + interactive forms (G-028) (rdd)"
slug: session-0602
type: session--plan
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
sprint: S12
lane: rdd
recipe: epic-plan
goal_ids: [G-028]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0598.md
  - docs/protocols/recipes/new-brand-interview-client.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0602 — PLAN: branded onboarding artifacts + interactive forms (G-028)

> **Pre-staged plan-me stub (ADR 0049), planned SESSION_0598 (G-028).** Reservation branch
> `session-0602-rdd-onboarding-forms-plan`. `/pp` PLAN session (no build). Adopt: FS-0024, FS-0030,
> ff to main, flip status.

## Goal

`/pp` grill → executable plan to turn RDD's client-onboarding templates (Initial Client Meeting / MSA /
NDA; `docs/product/rdd/assets/`) — and future ones — into **branded artifacts + interactive forms**,
reusable across brands/clients.

## Inherited pinned (SESSION_0598 + Brandon /rr — do NOT re-grill)

- **Home = the client path** (`new-brand-interview-client.md`); signing order **NDA → discovery → MSA + SOW → handoff**.
- **Reuse-first:** admin Client-Onboarding surface (existing `can(...)` authz — **NO 5th authz system**);
  template → typed-form schema (`[fill]` fields are inputs, boilerplate stays static); generate + store the
  branded PDF via the **ONE uploader/R2 seam** attached to the leads/CRM record; **typed-name signature
  first** (defer DocuSign-grade).
- Templates are **BLANK boilerplate**; **de-Tableau re-scope** to RDD's software+design framing needed.
- **Counsel / ESIGN-UETA gate** before any generated MSA/NDA is executable (Brandon flag — recommend, not ratify).
- **Executed (filled) instances must NOT be committed to git** — gated R2 only.

## First task

Adopt; read SESSION_0598 §Spawned-G-028 + the 3 templates + `new-brand-interview-client.md` + the ONE
uploader seam (`components/web/uploader/*`) + existing form primitives + the leads module; grill the
forks (signature approach · form schema per template · entitlement gating · counsel gate · which app hosts
it — RDD admin) → executable plan.

## Status

Single source of truth is the frontmatter `status:` field.

## Next session

### Goal

(set at plan close)
