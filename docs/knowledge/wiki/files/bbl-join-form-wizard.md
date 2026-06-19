---
title: "lineage/join/join-legacy-form.tsx"
slug: bbl-join-form-wizard
type: file
status: active
created: 2026-06-19
updated: 2026-06-19
author: Brian + Claude
last_agent: claude-session-0416
pairs_with:
  - knowledge/wiki/files/bbl-join-landing-composition
backlinks:
  - sprints/SESSION_0416
wiring:
  - "apps/web/server/web/lead/public-actions.ts — createJoinLegacyInterest (the wired submit action)"
  - "react-hook-form — useForm + form.trigger(stepFields) for per-step validation"
  - "apps/web/components/common/form — Form/FormField primitives"
tags: [bbl, claim, wizard, form, multi-step, client, s6]
---

# lineage/join/join-legacy-form.tsx

**Path:** `apps/web/app/(web)/lineage/join/join-legacy-form.tsx`

The lineage **claim intake as a step-by-step wizard** (SESSION_0416) — the monorepo
`BBLRegisterForm` stepper UX adopted onto our existing claim fields + Better Auth (NOT the
WP account-creation form, which doesn't apply here).

## Wizard mechanics

- `StepProgress` indicator (3 circles: **Your Path → Identity → Lineage**).
- One step card visible at a time (`hidden` toggling keeps all fields mounted/registered).
- `goNext` validates only the current step's fields via `form.trigger(STEP_FIELDS[step])`;
  `goBack`; final `Submit` on the last step.
- Fields, zod schema, and the `createJoinLegacyInterest` action are unchanged — only the
  layout went from 3 stacked cards to a true wizard.
