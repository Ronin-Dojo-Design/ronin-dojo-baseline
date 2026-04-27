---
title: "SESSION 0013 — Org UI smoke test + S3 wrap-up"
slug: session-0013
type: session
status: pending
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0012-prestage
health: 5
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0012.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0013

**Date:** _(set at bow-in)_
**Operator:** Brian + Copilot
**Goal:** Smoke-test organization UI end-to-end. Fix runtime issues. If clean, wrap S3 and begin S4 prep (Directory search with privacy).
**Status:** pending

---

## Petey plan (pre-staged at SESSION_0012 bow-out)

### Goal

Prove the S3 org UI works in the browser. Every page from SESSION_0012 needs to render, submit, and produce correct DB state. Then assess S3 completion and scope S4.

### Tasks

#### TASK_01 — Smoke test: create → list → detail → join
- **Agent:** Cody
- **What:** Start dev server, exercise the full org flow manually. Fix any runtime errors.
- **Steps:**
  1. `bun dev` — verify app starts without build errors
  2. Navigate to `/organizations/new` — verify form renders with discipline checkboxes
  3. Submit form — verify org created in DB, redirects to `/organizations/[slug]`
  4. Navigate to `/organizations` — verify list shows the new org with badges
  5. Navigate to `/organizations/[slug]` — verify detail page, member list, join buttons
  6. Click join — verify PENDING membership created, page refreshes
- **Done means:** All 6 steps pass without errors. Screenshots or terminal output as evidence.
- **Depends on:** DB seeded with disciplines (S1 seed data)

#### TASK_02 — Fix any runtime issues from TASK_01
- **Agent:** Cody
- **What:** If smoke test surfaces type errors, missing imports, auth guards, or DB issues — fix them.
- **Done means:** All pages render and actions execute cleanly
- **Depends on:** TASK_01 (only if issues found)

#### TASK_03 — S3 completion assessment + S4 scope
- **Agent:** Petey
- **What:** Review program-plan S3 deliverable ("Organization create + join flow") against what's built. Determine if S3 is complete or has gaps. If complete, scope S4 ("Directory search with privacy").
- **Steps:**
  1. Re-read `program-plan.md` S3 row
  2. Compare against SESSION_0008–0012 deliverables
  3. List any S3 gaps
  4. If S3 complete: draft S4 task breakdown
- **Done means:** S3 status updated in program-plan. S4 plan drafted or deferred to SESSION_0014.
- **Depends on:** TASK_01 passing

#### TASK_04 — Formal Review & Recommend protocol run (stretch)
- **Agent:** Petey
- **What:** Run the Review & Recommend protocol explicitly (SESSION_0012 noted this was skipped). Evaluate the org UI code surface for quality, patterns, missing edge cases.
- **Done means:** Review notes in SESSION file. Any action items logged as open decisions.
- **Depends on:** TASK_01, TASK_02

### Parallelism

- TASK_01 → TASK_02 sequential (fix depends on finding issues)
- TASK_03 can start after TASK_01 passes
- TASK_04 runs at bow-out or after TASK_03

### Risks

- Dev server may not start if there are unresolved dependency or env issues from previous sessions
- Auth guards on org pages may require login — may need to seed a test user or bypass for dev
- If S3 has gaps, TASK_03 may produce more work instead of S4 scoping

### Scope guard

Do NOT expand into: membership approval flow, org settings/edit, role assignment, admin UI, or brand switcher. Those are S4+ unless S3 assessment surfaces them as blockers.
