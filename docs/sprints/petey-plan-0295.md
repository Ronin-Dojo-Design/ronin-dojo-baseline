---
title: "Petey Plan 0295 — ORG_ADMIN seed verification + org settings index"
slug: petey-plan-0295
type: plan
status: in-progress
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0295
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0295.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0295

## Goal

Seed ORG_ADMIN system role + add org settings index page + settings link on org detail page for authorized users.

## Tasks

| ID | Description | Agent |
|---|---|---|
| SESSION_0295_TASK_01 | Verify ORG_ADMIN role exists in DB (run seed-baseline-platform if needed) | Cody |
| SESSION_0295_TASK_02 | Extract `hasOrgAdminAccess` shared helper from theme-actions.ts | Cody |
| SESSION_0295_TASK_03 | Create `/organizations/[slug]/settings/page.tsx` — settings index with auth gate | Cody |
| SESSION_0295_TASK_04 | Add "Settings" card/link to org detail sidebar for authorized users | Cody |
| SESSION_0295_TASK_05 | Typecheck + biome verification | Doug |
