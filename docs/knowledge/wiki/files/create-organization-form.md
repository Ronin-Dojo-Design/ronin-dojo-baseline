---
title: "create-organization-form.tsx"
slug: create-organization-form
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + Copilot
last_agent: copilot-session-0012
pairs_with:
  - knowledge/wiki/files/organization-new-page
  - knowledge/wiki/files/discipline-queries
  - knowledge/wiki/files/organization-actions
parent: architecture/program-plan
backlinks:
  - sprints/SESSION_0012
health: 7
wiring:
  - "apps/web/server/web/organization/actions.ts — createOrganization server action"
  - "apps/web/server/web/organization/schemas.ts — createOrganizationSchema (Zod)"
  - "apps/web/components/common/form.tsx — Form/FormField/FormItem/FormLabel/FormControl/FormMessage"
  - "apps/web/components/common/input.tsx — Input"
  - "apps/web/components/common/textarea.tsx — TextArea"
  - "apps/web/components/common/select.tsx — Select/SelectTrigger/SelectContent/SelectItem/SelectValue"
  - "apps/web/components/common/checkbox.tsx — Checkbox (discipline multi-select)"
  - "apps/web/components/common/button.tsx — Button with isPending"
  - "@next-safe-action/adapter-react-hook-form — useHookFormAction (Dirstarter pattern)"
tags: [organization, form, rhf, s3, ui]
---

# create-organization-form.tsx

**Path:** `apps/web/components/web/organizations/create-organization-form.tsx`

Client component form for creating a new Organization. Uses React Hook Form + Zod wired to the `createOrganization` server action via `useHookFormAction` (Dirstarter pattern).

## Props

| Prop | Type | Source |
|---|---|---|
| `brand` | `Brand` | Resolved in server component page from `x-brand` header |
| `disciplines` | `{ id: string; name: string }[]` | Fetched by `getDisciplinesByBrand()` in page |

## Fields

- **Name** (required) — auto-generates slug
- **Slug** (required) — URL-safe, auto-filled from name
- **Type** — Radix Select: DOJO / SCHOOL / CLUB / LEAGUE
- **Address** — optional textarea
- **Website URL** — optional URL input
- **Disciplines** — checkbox grid, multi-select from DB

## Pattern

Follows the `SubmitForm` / `CTAForm` pattern from Dirstarter:
- `useHookFormAction(serverAction, zodResolver, { formProps, actionProps })`
- On success: toast + redirect to `/organizations/[slug]`
- No new UI components — all from `components/common/`
