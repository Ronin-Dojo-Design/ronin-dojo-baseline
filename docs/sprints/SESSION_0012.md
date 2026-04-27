---
title: "SESSION 0012 — Org UI + protocol codification"
slug: session-0012
type: session
status: closed-full
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0012
health: 5
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0011.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0012

**Date:** 2026-04-27
**Operator:** Brian + Copilot
**Goal:** Wire Organization UI (create + list pages) and verify the new Petey Plan + Review & Recommend protocols in practice
**Status:** closed-full

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

- **TASK_01 — `/organizations/new` create form** ✅
  - `CreateOrganizationForm` client component: RHF + Zod → `createOrganization` server action via `useHookFormAction`
  - Fields: name (auto-slug), slug, type (Radix Select), address (TextArea), websiteUrl, disciplines (Checkbox grid)
  - All UI from existing Dirstarter `components/common/` — no new components created
  - `getDisciplinesByBrand()` query: filters `isSystem=true` OR matching brand
  - Server component page reads brand from `x-brand` header (proxy.ts, not middleware)
- **TASK_02 — `/organizations` list + `/organizations/[slug]` detail** ✅
  - List page: card grid of orgs by brand with type/member/discipline badges, "Create Organization" button
  - Detail page: org info (owner, address, website), discipline badges, member list with status, join buttons per discipline
  - `JoinOrganizationButton` client component: `useAction` → `joinOrganization`, instant PENDING, toast + refresh
  - `getOrganizationBySlug(brand, slug)` query: uses composite `brand_slug` unique key
- **JETTY 3.0 wiki annotations** for all 6 new source files, registered in wiki index
- **Wiki index**: added full L1 component inventory (39 common + 7 web UI), "Custom components" section
- **Dirstarter L1 Baseline umbrella doc** — `docs/knowledge/wiki/files/dirstarter-l1-baseline.md`: upstream provenance, modify-then-JETTY rule, modified files tracker
- **Cody operating rule 7** added: "Reuse existing components before creating new ones" with link to wiki inventory

## Files touched

- `apps/web/app/(web)/organizations/new/page.tsx` — new server component page
- `apps/web/components/web/organizations/create-organization-form.tsx` — new client component form
- `apps/web/server/web/organization/discipline-queries.ts` — new discipline query
- `apps/web/app/(web)/organizations/page.tsx` — new list page
- `apps/web/app/(web)/organizations/[slug]/page.tsx` — new detail page
- `apps/web/components/web/organizations/join-organization-button.tsx` — new join button
- `apps/web/server/web/organization/queries.ts` — added `getOrganizationBySlug(brand, slug)`
- `docs/knowledge/wiki/files/create-organization-form.md` — new JETTY 3.0 annotation
- `docs/knowledge/wiki/files/organization-new-page.md` — new JETTY 3.0 annotation
- `docs/knowledge/wiki/files/discipline-queries.md` — new JETTY 3.0 annotation
- `docs/knowledge/wiki/files/organizations-list-page.md` — new JETTY 3.0 annotation
- `docs/knowledge/wiki/files/organization-detail-page.md` — new JETTY 3.0 annotation
- `docs/knowledge/wiki/files/join-organization-button.md` — new JETTY 3.0 annotation
- `docs/knowledge/wiki/files/dirstarter-l1-baseline.md` — new L1 umbrella doc
- `docs/knowledge/wiki/index.md` — registered 7 file annotations, added full UI Components + Custom components sections
- `docs/agents/cody.md` — added operating rule 7 (reuse existing components)

## Decisions resolved

- **Discipline picker source**: filter by brand + `isSystem=true` (system disciplines visible to all brands)
- **Discipline picker UI**: Checkbox grid (multi-select), not Radix Select (single-value only)
- **Brand source**: `x-brand` header from `proxy.ts` (middleware deleted in SESSION_0008)

- **Join flow UX**: Instant PENDING, no confirmation modal (iterate later)
- **Org slug lookup**: Composite `brand_slug` unique key required (not slug alone)

## Open decisions / blockers

- **Smoke test** of TASK_01 + TASK_02 not yet done (need dev server running + seeded DB)
- **TASK_03** (protocol dry-run) — partially done: Petey plan was pre-staged, Cody executed tasks. Review & Recommend not formally run.

## Next session

**Goal:** Smoke-test organization UI end-to-end in browser. Fix runtime issues. If clean, begin S3 wrap-up and S4 prep (Directory search).

**Inputs to read:**

- This session file (SESSION_0012)
- `apps/web/server/web/organization/` — all action/query/schema files
- `apps/web/components/web/organizations/` — form + button components
- `docs/knowledge/wiki/files/dirstarter-l1-baseline.md` — L1 baseline reference

**First task:** Start dev server (`bun dev`), navigate to `/organizations/new`, create an org, verify list + detail pages render and join flow works.

## Reflections

- **Zero new UI components needed.** The Dirstarter common library (Form, Input, Select, Checkbox, Card, Badge, Grid, Button, Stack) covered every UI need. This validates the L1 architecture decision.
- **`useHookFormAction` pattern is clean.** The Dirstarter bridge between RHF and next-safe-action works well. The `SubmitForm` was a good reference for the org create form.
- **Brand resolution via `proxy.ts` is simple and correct.** No middleware — `x-brand` header in server components, brand cookie for client. The proxy.ts consolidation from SESSION_0008 was the right call.
- **Composite unique key surprise.** `Organization.slug` is not unique alone — it's `brand_slug`. This caught a type error early. Good that Prisma's types enforced it.
- **JETTY 3.0 annotations add value during build.** Writing them while the code is fresh is efficient. The wiki index now has a component inventory that will help future sessions.
- **Protocol dry-run (TASK_03) was implicit, not formal.** We used the Petey plan structure but didn't formally invoke Review & Recommend. Next session should do that explicitly.
