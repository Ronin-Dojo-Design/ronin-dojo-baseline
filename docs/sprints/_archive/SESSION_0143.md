---
title: "SESSION 0143 — ComboboxSelector Upgrade for Admin FK Fields + TS Error Fixes"
slug: session-0143
type: session--implement
status: closed-quick
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0143
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0142.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0143 — ComboboxSelector Upgrade for Admin FK Fields + TS Error Fixes

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

Upgrade FK-based Select fields to ComboboxSelector across 6 admin forms (certificate-template, course, pricing-plan, divisions-editor, staff-assignment, rule-set). Fix pre-existing TS errors (dev-login route.test.ts, tournament register role null check).

## Status

in-progress

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): acknowledged — mandatory pre-flight required before UI work.
- Carried blockers:
  - 🔴 Resend domain DNS pending verification — 31st session carried
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — admin form components use L1 Select; upgrading FK fields to ComboboxSelector |
| Extension or replacement | Extension — ComboboxSelector is our admin extension of L1 Popover + Command |
| Why justified | FK fields with many options (users, orgs, programs, disciplines, divisions) need search/filter; L1 Select is only appropriate for small enums |
| Risk if bypassed | Poor admin UX for FK fields with 10+ options; no search capability |

---

## Petey Plan

### Field evaluation across 6 forms

| Form | Field | Source | Verdict |
| --- | --- | --- | --- |
| certificate-template-form | brand | Brand enum (4 values) | **Keep L1 Select** |
| certificate-template-form | certificateType | CertificateType enum | **Keep L1 Select** |
| certificate-template-form | deliveryMethod | CertificateDeliveryMethod enum | **Keep L1 Select** |
| course-form | brand | Brand enum (4 values) | **Keep L1 Select** |
| course-form | courseType | CourseType enum | **Keep L1 Select** |
| pricing-plan-form | billingInterval | enum-like options | **Keep L1 Select** |
| pricing-plan-form | organizationId | FK → Organization (many) | **→ ComboboxSelector** |
| pricing-plan-form | programId | FK → Program (many) | **→ ComboboxSelector** |
| divisions-editor | disciplineId | FK → Discipline (many) | **→ ComboboxSelector** |
| divisions-editor | seedingMethod | SeedingMethod enum (4 values) | **Keep L1 Select** |
| divisions-editor | genderFilter / formatFilter | Enums | **Keep L1 Select** |
| staff-assignment-form | userId | FK → User (many) | **→ ComboboxSelector** |
| staff-assignment-form | roleId | FK → TournamentRole (moderate) | **→ ComboboxSelector** |
| staff-assignment-form | divisionId | FK → Division (many, optional) | **→ ComboboxSelector** |
| rule-set-form | disciplineId | FK → Discipline (many, optional) | **→ ComboboxSelector** |
| rule-set-form | scoringMethod | ScoringMethod enum | **Keep L1 Select** |

**Summary:** 7 FK fields across 4 forms (pricing-plan, divisions-editor, staff-assignment, rule-set) are ComboboxSelector candidates. certificate-template-form and course-form are all-enum → no changes needed.

### Task plan

| Task ID | Description | Agent | Done criteria |
| --- | --- | --- | --- |
| SESSION_0143_TASK_01 | Evaluate rule-set-form fields; finalize upgrade list | Petey | Field-by-field verdict documented |
| SESSION_0143_TASK_02 | Upgrade pricing-plan-form: organizationId + programId → ComboboxSelector | Cody | Compiles, fields searchable |
| SESSION_0143_TASK_03 | Upgrade divisions-editor: disciplineId → ComboboxSelector | Cody | Compiles, discipline field searchable |
| SESSION_0143_TASK_04 | Upgrade staff-assignment-form: userId, roleId, divisionId → ComboboxSelector | Cody | Compiles, all 3 fields searchable |
| SESSION_0143_TASK_05 | Upgrade rule-set-form: disciplineId → ComboboxSelector | Cody | Compiles, discipline field searchable |
| SESSION_0143_TASK_06 | Fix pre-existing TS errors: dev-login route.test.ts + tournament register role null | Cody | `bun tsc --noEmit` passes for those files |

## Task Log

- SESSION_0143_TASK_01 — ✅ done. Evaluated all 6 forms: certificate-template-form (all enums, no change), course-form (all enums, no change), pricing-plan-form (2 FK fields: organizationId, programId), divisions-editor (1 FK: disciplineId), staff-assignment-form (3 FK: userId, roleId, divisionId), rule-set-form (1 FK: disciplineId). Total: 7 FK fields across 4 forms → ComboboxSelector.
- SESSION_0143_TASK_02 — ✅ done. Upgraded pricing-plan-form: organizationId + programId → ComboboxSelector with search/clear.
- SESSION_0143_TASK_03 — ✅ done. Upgraded divisions-editor: discipline add dialog → ComboboxSelector with search.
- SESSION_0143_TASK_04 — ✅ done. Upgraded staff-assignment-form: userId, roleId, divisionId → ComboboxSelector. Removed unused Select imports.
- SESSION_0143_TASK_05 — ✅ done. Upgraded rule-set-form: disciplineId → ComboboxSelector with clearable.
- SESSION_0143_TASK_06 — ✅ done. Fixed dev-login route.test.ts (added `as Response` cast for union type), fixed tournament register.ts (`role` → `validatedRole` for closure narrowing). Zero TS errors across entire codebase.
- SESSION_0143_TASK_07 — ✅ done. Added Graphify repo graph card to admin dashboard. Copied `graph.html` to `public/graphify.html` (gitignored — 5MB build artifact). Link card on dashboard opens in new tab.

## What Landed

- **ComboboxSelector upgrades** — 7 FK fields across 4 admin forms now use searchable ComboboxSelector instead of L1 Select.
- **Zero TS errors** — fixed 2 pre-existing issues: dev-login test union type narrowing, tournament register closure narrowing.

- **Graphify dashboard card** — admin dashboard links to `/graphify.html` interactive repo visualization. File gitignored (5MB build artifact, regenerated via `graphify update .`).

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0143.md` | New — this session file |
| `apps/web/app/admin/pricing-plans/_components/pricing-plan-form.tsx` | Modified — organizationId + programId → ComboboxSelector |
| `apps/web/app/admin/tournaments/_components/divisions-editor.tsx` | Modified — discipline add dialog → ComboboxSelector |
| `apps/web/app/admin/tournaments/_components/staff-assignment-form.tsx` | Modified — userId, roleId, divisionId → ComboboxSelector; removed unused Select imports |
| `apps/web/app/admin/tournaments/rule-sets/_components/rule-set-form.tsx` | Modified — disciplineId → ComboboxSelector |
| `apps/web/app/api/auth/dev-login/route.test.ts` | Modified — added `as Response` cast for union type |
| `apps/web/server/web/tournaments/register.ts` | Modified — `role` → `validatedRole` for closure narrowing |
| `apps/web/app/admin/page.tsx` | Modified — added Graphify repo graph card |
| `apps/web/public/graphify.html` | New (gitignored) — copied from graphify-out/graph.html |
| `apps/web/.gitignore` | Modified — added public/graphify.html |

## Decisions Resolved

- certificate-template-form and course-form: all enum fields → no ComboboxSelector needed.
- ComboboxSelector stays in `components/admin/` — all 10 usages are admin-only (3 prior + 7 new = 10 total).
- TS error fixes: cast approach for test file, variable capture for closure narrowing.

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 31st session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Next Session

- **Goal:** SESSION_0144 — TBD. ComboboxSelector audit complete (10 usages, all admin). Consider: admin dashboard polish, Resend DNS resolution, or next program-plan milestone.
- **Inputs to read:** SESSION_0143
- **First task:** Review program-plan for next priority lane.
