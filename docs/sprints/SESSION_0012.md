---
title: "SESSION 0012 — Org UI + protocol codification"
slug: session-0012
type: session
status: pending
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0012-prestage
health: 5
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0011.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0012

**Date:** _(set at bow-in)_
**Operator:** Brian + Claude
**Goal:** Wire Organization UI (create + list pages) and verify the new Petey Plan + Review & Recommend protocols in practice
**Status:** pending

---

## Petey plan (pre-staged at SESSION_0011 bow-out)

### Goal

Ship the minimum org UI that exercises the S3 server actions (`createOrganization`, `joinOrganization`) and proves the create+list+view pipeline end-to-end in the browser. Secondary: validate the new planning/review protocols by using them.

### Tasks

#### TASK_01 — `/organizations/new` create form
- **Agent:** Cody
- **What:** React Hook Form + Zod wired to `createOrganization` server action. Brand comes from middleware/cookie. Discipline picker from DB.
- **Steps:**
  1. Create `app/(web)/organizations/new/page.tsx` with form
  2. Create form component using RHF + `createOrganizationSchema`
  3. Add discipline loader query (fetch disciplines by brand)
  4. Wire form submit to `createOrganization` action
  5. Redirect to `/organizations/[slug]` on success
- **Done means:** Form renders, submits, creates org + owner membership, redirects
- **Depends on:** nothing

#### TASK_02 — `/organizations` list page + `/organizations/[slug]` detail
- **Agent:** Cody
- **What:** List orgs by brand, show member count. Detail page shows org info + member list.
- **Steps:**
  1. Create `app/(web)/organizations/page.tsx` — list view using `getOrganizationsByBrand`
  2. Create `app/(web)/organizations/[slug]/page.tsx` — detail view with join button
  3. Wire join button to `joinOrganization` action
- **Done means:** List page shows orgs, detail page shows org info, join creates PENDING membership
- **Depends on:** TASK_01 (need at least one org to view)

#### TASK_03 — Protocol dry-run + docs sweep (stretch)
- **Agent:** Petey + Doug
- **What:** Use this session as the first live test of the Petey Plan and Review & Recommend protocols. At bow-out, explicitly run Review & Recommend and note any friction or missing steps.
- **Done means:** Protocols used, any gaps noted in SESSION file reflections
- **Depends on:** TASK_01, TASK_02

### Parallelism

- TASK_01 and TASK_02 are **sequential** (TASK_02 needs an org to exist).
- TASK_03 runs at bow-out, no parallel concern.
- No worktrees needed — single file tree, one agent at a time.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear form-building execution |
| TASK_02 | Cody | Follows TASK_01, same code surface |
| TASK_03 | Petey | Protocol validation is a planning concern |

### Open decisions

- **Discipline picker source:** Use `getOrganizationsByBrand` pattern to query disciplines by brand? Or allow cross-brand system disciplines? → Default: filter by brand + `isSystem=true`.
- **Join flow UX:** Instant PENDING or show confirmation modal? → Default: instant PENDING, iterate later.

### Risks

- If the form needs UI components not yet built (Select, MultiSelect for disciplines), TASK_01 may take longer. Fallback: use native `<select>` and iterate in a later session.

### Scope guard

Do NOT expand into: membership approval flow, org settings/edit, role assignment, or brand switcher. Those are SESSION_0013+.

---

## What landed

_(filled during session)_

## Files touched

_(filled during session)_

## Decisions resolved

_(filled during session)_

## Open decisions / blockers

_(filled during session)_

## Next session

_(filled at bow-out via Review & Recommend protocol)_
