---
title: "SESSION 0157 — Public Course Pages + Enrollment UI"
slug: session-0157
type: session--implement
status: closed-full
created: 2026-05-13
updated: 2026-05-13
last_agent: codex-session-0157
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0156.md
  - docs/runbooks/course-curriculum-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0157 — Public Course Pages + Enrollment UI

## Date

2026-05-13

## Operator

Brian Scott + Codex (Petey -> Cody -> Doug)

## Goal

Implement the next S6 course/curriculum surface from SESSION_0156: public course pages with enrollment and curriculum completion UI wired to the existing CourseEnrollment server layer.

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — Next.js App Router public pages, Dirstarter UI primitives, Better Auth session-aware user actions |
| Extension or replacement | Extension — course pages compose existing `components/common`, `components/web/ui`, and `server/web` patterns |
| Why justified | SESSION_0156 landed the course enrollment server layer; public course pages are the next S6 launch surface |
| Risk if bypassed | Raw HTML and disconnected server actions would repeat FS-0001-class UI drift and leave curriculum enrollment unusable |

## Graphify Check

- Graph status: usable; `.graphify/graph_report.md` has 5,725 nodes, 10,701 edges, 661 communities. Report has no commit line, and SESSION_0156 says the graph was refreshed at close.
- Query used: `graphify query "public course page course enrollment curriculum items course-enrollment actions" --budget 3000`
- Files selected from graph: `apps/web/app/(web)/courses/page.tsx`, `apps/web/app/(web)/courses/[slug]/page.tsx`, `apps/web/server/web/courses/queries.ts`, `apps/web/server/web/course-enrollment/actions.ts`, `apps/web/server/web/course-enrollment/queries.ts`, `apps/web/components/common/*`, `apps/web/components/web/ui/*`.
- Verification note: Graphify selected the course enrollment server layer, existing public page shells, and L1 primitives; direct source review confirmed those are the working files for this session.

## Petey plan

### Goal

Ship public course list/detail pages that let a signed-in active member enroll, unenroll, and mark curriculum items complete.

### Tasks

#### TASK_01 — Course page L1 polish

- **Agent:** Cody
- **What:** Replace rough public course list/detail markup with existing L1/common primitives and add dynamic metadata.
- **Steps:**
  1. Read current course pages and comparable public listing/detail pages.
  2. Compose `Card`, `Stack`, `Badge`, `H*`, `Note`, `Grid`, `Section`, and `Intro` instead of raw wrappers/headings/buttons.
  3. Keep brand-scoped course queries unchanged unless the UI needs a typed field added.
- **Done means:** `/courses` and `/courses/[slug]` render course cards, badges, curriculum, and organization context through existing primitives.
- **Depends on:** nothing

#### TASK_02 — Enrollment CTA and state

- **Agent:** Cody
- **What:** Add current-user enrollment lookup and a client CTA for enroll/unenroll.
- **Steps:**
  1. Add a member-private query for the current user's CourseEnrollment state.
  2. Add a client component that calls `enrollInCourse` and `unenrollFromCourse` through `useAction`.
  3. Show signed-out, not-enrolled, enrolled, and completed states without exposing cross-brand data.
- **Done means:** A signed-in user can enroll/unenroll from the public course detail page and the page refreshes to reflect state.
- **Depends on:** TASK_01

#### TASK_03 — Curriculum completion controls

- **Agent:** Cody, reviewed by Doug
- **What:** Add enrolled-user completion controls per curriculum item.
- **Steps:**
  1. Pass completion state to the course detail UI.
  2. Add a client component that calls `markItemComplete` and `markItemIncomplete`.
  3. Show progress count and completed status using badges/notes.
- **Done means:** An enrolled user can mark items complete/incomplete; completion status and progress update after refresh.
- **Depends on:** TASK_02

### Parallelism

Implementation is sequential because the public detail page, enrollment state, and completion controls all converge on the same route and query payloads. Doug review can run after Cody implementation.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear UI execution against L1 inventory |
| TASK_02 | Cody | Server-action wiring with existing `userActionClient` actions |
| TASK_03 | Cody + Doug | UI/action wiring plus QA review for auth, brand scope, and state refresh |

### Open decisions

- Tiered public-paid course access remains deferred per SESSION_0156. This session uses the current active-membership enrollment gate.
- Brian flagged recent reusable admin components to keep in view: `ComboboxSelector`, `RelationSelector`, and `AnimatedContainer`. These are relevant if course/product inclusion becomes an admin relation-management task, but they are not required for the public course detail CTA unless the UI state benefits from `AnimatedContainer`.
- Brian also flagged `invites.md` and product inclusion. `invites.md` is relevant because invite claim creates the active Membership that unlocks course enrollment. Course-to-product attachment is a future design question: current schema has `PricingPlan.programId` but no direct `Course` product/pricing relation.

### Risks

- Current course pages already exist but include raw HTML; Cody must replace rather than entrench that pattern.
- User-specific enrollment reads must not use persistent `"use cache"`.
- Completion controls depend on current-user enrollment state; signed-out users must see a safe non-action state.

### Scope guard

Do not add paid-course access, checkout, certification issuance, direct course-product schema, or admin enrollment/product pages in this session. Log those as next-session work if they surface.

### Dirstarter implementation template

- **Docs read first:** `https://dirstarter.com/docs/introduction`, `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/seo` checked 2026-05-13.
- **Baseline pattern to extend:** App Router public pages under `app/(web)`, feature-scoped `server/web/*`, `components/common` primitives, `components/web/ui` page shell, `useAction` client action buttons.
- **Custom delta:** Ronin course/curriculum enrollment and completion controls on top of the Dirstarter directory/public page shell.
- **No-bypass proof:** Uses existing primitives and safe-action server layer; does not replace Dirstarter auth, routing, or UI systems.

## Task Log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0157_TASK_01 | Course page L1 polish and metadata | done |
| SESSION_0157_TASK_02 | Enrollment CTA and state lookup | done |
| SESSION_0157_TASK_03 | Curriculum completion controls | done |

## Pre-flight: Course Public UI

### 1. Existing component scan

- Searched `components/web/` for: courses, tools, techniques, tournaments, organizations, auth buttons, empty list, page shell primitives.
- Searched `components/common/` for: card, badge, button, checkbox, heading, note, link, stack, skeleton.
- Found: `components/web/tools/tool-card.tsx`, `components/web/tools/tool-list.tsx`, `components/web/tools/tool-entry.tsx`, `components/web/techniques/technique-card.tsx`, `components/web/tournaments/register-button.tsx`, `components/web/organizations/join-organization-button.tsx`, `components/web/ui/intro.tsx`, `components/web/ui/section.tsx`, `components/web/ui/grid.tsx`, `components/web/empty-list.tsx`.

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes.
- Searched `dirstarter_template/components/` for: public listing/detail pattern by using the local Dirstarter-derived `tools/*` components already copied into this repo.
- Closest L1 pattern: `components/web/tools/tool-card.tsx` + `components/web/tools/tool-list.tsx` for listing cards; `components/web/tools/tool-entry.tsx` and existing public detail pages for detail composition; `components/web/tournaments/register-button.tsx` for client action CTA state.
- **Primitive API spot-check:**
  - `Button`: `variant: fancy|primary|secondary|soft|ghost|destructive`; `size: sm|md|lg`; props include `asChild`, `isPending`, `prefix`, `suffix`.
  - `Badge`: `variant: primary|soft|outline|success|warning|info|danger`; `size: sm|md|lg`; props include `asChild`, `prefix`, `suffix`.
  - `Card`: props include `hover`, `focus`, `isRevealed`, `isHighlighted`, `asChild`; companion `CardHeader`, `CardFooter`, `CardDescription`.
  - `Heading`/`H*`: `size: h1|h2|h3|h4|h5|h6`; props include `as`, `asChild`.
  - `Stack`: `size: xs|sm|md|lg`; `direction: row|column`; `wrap: boolean`; `asChild`.
  - `Checkbox`: Radix checkbox root props; use `checked`, `disabled`, `onCheckedChange`.
  - `Note`: `as` polymorphic prop; muted text styling.
  - `Link`: Next Link wrapper with hover prefetch.

### 3. Composition decision

- [x] Extending existing component: existing `app/(web)/courses/page.tsx` and `app/(web)/courses/[slug]/page.tsx`.
- [x] Composing existing components: `Card`, `CardHeader`, `CardDescription`, `Badge`, `Button`, `Checkbox`, `H4/H5`, `Link`, `Note`, `Stack`, `Grid`, `Intro`, `Section`, `EmptyList`.
- [ ] New component, no L1 match exists: not selected. New course-specific client controls may be created only as thin compositions around existing primitives and server actions.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read: SESSION_0156.
- [x] Wiki entries for target area read: `dirstarter-component-inventory.md`, `dirstarter-docs-inventory.md`, `manual-boundary-registry.md`, `drift-register.md`.
- [x] Runbook consulted: `course-curriculum-runbook.md`, `sop-data-and-wiring-flows.md` §12, `sop-e2e-user-lifecycle.md` §4, `dev-environment.md`.
- [x] Additional owner context consulted: `docs/runbooks/invites.md`, `components/admin/combobox-selector.tsx`, `components/admin/relation-selector.tsx`, `components/common/animated-container.tsx`, `components/web/products/product.tsx`, `server/web/products/queries.ts`.

### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo`
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: `localhost:3000` default Ronin brand; `baseline.local:3000` for Baseline brand if `/etc/hosts` is configured.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001 (scratch components/raw HTML instead of L1), FS-0008 (primitive API and enum lookups skipped), FS-0007 (protocols not enforced), FS-0149 finding pattern (project-log gate).
- Mitigation acknowledged: yes — inventory and primitive files were read before code; task IDs were added before implementation; course UI will compose existing primitives.

## Pre-flight: Backend — Course Enrollment UI Reads

### 1. Auth predicates planned

- [x] Session auth required for enrollment and completion actions via existing `userActionClient`.
- [x] Org membership verified by existing `enrollInCourse` active membership gate.
- [x] Brand column filtered (ADR 0004) through `Course.brand` on public course reads and current-user enrollment lookup.
- Authorization approach: public course reads stay brand-scoped and published-only; current-user enrollment lookup requires a server session user id; mutations keep existing `userActionClient` ownership checks.

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes.
- Searched `server/` for: course enrollment, public enrollment, dashboard auth-scoped reads, tournament registration actions.
- Related existing actions: `enrollInCourse`, `unenrollFromCourse`, `markItemComplete`, `markItemIncomplete`.
- L1 pattern match: Dirstarter action client chain adapted in this repo as `next-safe-action` `userActionClient`; auth-scoped reads use React `cache()` or plain server reads, not persistent `"use cache"`.

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: §12 Program -> Course -> Enrollment.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage: §4 Course / curriculum lifecycle.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0006/FS-0007 for skipped planning/pre-flight; FS-0008 for source lookup.
- Manual Boundary Registry entries: MB-013 remains open for protected paid learning/payment readiness; not changed by this membership-gated course UI.

## Data Pre-flight

- `docs/architecture/feature-data-prerequisites.md` was read. Its S6 Course + Curriculum row is stale because it still says seed coverage is missing.
- SESSION_0156 and `docs/runbooks/course-curriculum-runbook.md` verify the seed now creates 218 Courses, 654 CurriculumItems, 1 CourseEnrollment, and 1 CurriculumItemCompletion.
- No seed change is needed before this UI session.

## What Landed

- Replaced rough `/courses` markup with `CourseList` and `CourseCard` components composed from Dirstarter common/web primitives.
- Reworked `/courses/[slug]` into a split detail layout with metadata, course badges, organization context, enrollment sidebar, and curriculum section.
- Added current-user course enrollment state lookup with brand + organization scoping and no persistent cache.
- Added public enrollment CTA states: signed out, membership required, available to enroll, enrolled, and completed.
- Added enrolled-user curriculum completion controls using `Checkbox`, `Badge`, `Card`, `Stack`, and `AnimatedContainer`.
- Tightened existing course-enrollment mutations so unenroll/complete/incomplete now scope through the active request brand.
- Added revalidation for `/courses`, `/courses/[slug]`, `courses`, and `course-{slug}` cache tags after enrollment/completion mutations.
- Updated `feature-data-prerequisites.md` to reflect SESSION_0156 seed coverage for course/curriculum.

## Files Touched

| Path | Note |
| --- | --- |
| `apps/web/app/(web)/courses/page.tsx` | Replaced raw listing markup with `CourseList`. |
| `apps/web/app/(web)/courses/[slug]/page.tsx` | Added metadata, enrollment state, detail layout, and curriculum completion wiring. |
| `apps/web/components/web/courses/course-card.tsx` | New course card using `Card`, `H4`, `Badge`, `Link`, `Stack`. |
| `apps/web/components/web/courses/course-list.tsx` | New course grid/list wrapper with empty state. |
| `apps/web/components/web/courses/course-enrollment-panel.tsx` | New client enrollment CTA for sign-in, membership required, enroll, enrolled, completed, and unenroll states. |
| `apps/web/components/web/courses/curriculum-completion-list.tsx` | New client curriculum checklist with completion/incompletion actions and animated completion note. |
| `apps/web/server/web/courses/payloads.ts` | Added public course payload types for component props. |
| `apps/web/server/web/course-enrollment/queries.ts` | Added current-user enrollment state query scoped by brand/course/org/user. |
| `apps/web/server/web/course-enrollment/actions.ts` | Added active-brand scoping and course cache/path revalidation to mutation actions. |
| `docs/sprints/SESSION_0157.md` | Session record, Petey plan, pre-flight, review, close evidence. |
| `docs/protocols/project-log.md` | Added SESSION_0157 task/review entries. |
| `docs/architecture/feature-data-prerequisites.md` | Updated stale S6 seed prerequisite entry. |
| `docs/runbooks/course-curriculum-runbook.md` | Added SESSION_0157 backlink and feature-data pair. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0157 row and bumped frontmatter. |

## Decisions Resolved

- Course enrollment remains active-membership gated; paid/tiered course access remains deferred.
- Course-to-product inclusion is not implemented this session because there is no direct Course product/pricing relation in the current schema. Current commerce linkage is `PricingPlan.programId`; direct course pricing needs a Petey design pass.
- `ComboboxSelector`, `RelationSelector`, and `AnimatedContainer` were loaded as recent reusable patterns. `AnimatedContainer` was used for completion-state UI; selector components are staged for future admin course/product relation work.

## Open Decisions / Blockers

- Tiered course access remains deferred to Stripe wiring; active membership remains the enrollment gate.
- Direct Course-to-product/PricingPlan inclusion needs design: likely options are a `CoursePricingPlan` join, Course-level access metadata, or a ProgramCourse/Product bundle model.
- Browser E2E for signed-in course enrollment/completion is still needed; this session verified typecheck and route render, not an authenticated click path.
- Resend domain DNS pending verification — carried from SESSION_0156.
- Docker Desktop not running — MinIO untested — carried from SESSION_0156.

## Review Log

### SESSION_0157_REVIEW_01 — Giddy + Doug Hostile Close Review

- **Reviewed tasks:** SESSION_0157_TASK_01, SESSION_0157_TASK_02, SESSION_0157_TASK_03
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://dirstarter.com/docs/introduction`, `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/seo`, `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/architecture/dirstarter-baseline-index.md`.
- **Plan sanity:** Good. Petey kept the session to public course pages + existing course enrollment actions and did not absorb direct product inclusion into this implementation.
- **Dirstarter compliance:** Aligned. The public pages extend App Router + `server/web` feature folders and compose `components/common` / `components/web/ui` primitives.
- **Security:** Improved. Existing course enrollment mutation paths now scope unenroll/complete/incomplete through active request brand in addition to user ownership.
- **Data integrity:** No schema changes. Existing uniqueness constraints remain the guard for one enrollment per user/course and one completion per item/enrollment.
- **Lifecycle proof:** The public browse -> enroll -> complete curriculum path now has UI wiring. Invite flow remains the membership creation path that unlocks enrollment.
- **Verification honesty:** `bun run typecheck` passed; `git diff --check` passed; `/courses` and `/courses/bjj-safety-school` returned HTTP 200 locally. Authenticated click-path E2E remains open.
- **Workflow honesty:** Opening ritual, Graphify query, Petey plan, Cody pre-flight, project-log task IDs, hostile review, and full-close evidence were recorded.
- **Merge readiness:** Ready to commit as an implementation slice with one follow-up QA finding.
- **WORKFLOW 5.0 score:** 9.4/10. Cap applied for missing authenticated browser click-path proof.
- **Kaizen confidence:** 100 users: 9/10; 1,000 users: 8.5/10; 10,000 users: 8/10. Aggregate: 8.5/10. The code path is scoped and brand-safe, but signed-in E2E is the next proof gate.

### SESSION_0157_FINDING_01 — Course enrollment/completion E2E missing

- **Severity:** medium
- **Task:** SESSION_0157_TASK_02, SESSION_0157_TASK_03
- **Evidence:** Verification covered typecheck and local HTTP 200 route render only.
- **Impact:** The authenticated browser flow for enroll, unenroll, mark complete, and mark incomplete is not behaviorally proven.
- **Required follow-up:** Add a signed-in Playwright or dev-login course lifecycle smoke covering `/courses/bjj-safety-school`.
- **Status:** open

## ADR / Ubiquitous-Language Check

- No ADR created. Course enrollment UI extends the existing membership-gated server layer. Direct course-product inclusion may require an ADR/design note if it introduces a new commerce relation.
- No ubiquitous-language update needed. CourseEnrollment, CurriculumItemCompletion, Invite, Membership, PricingPlan, and Product are existing terms.

## Reflections

- The SESSION_0156 course pages existed, but they were still rough and partly raw HTML. Reading the inventory first made the right move obvious: create thin course-specific compositions around L1 primitives instead of styling the route directly.
- Brian's reminder about `ComboboxSelector`, `RelationSelector`, and product inclusion was useful, but it would have been scope drift to attach products to courses without a schema/design decision. That belongs in the next Petey pass.
- The security tightening in existing completion actions was worth doing while wiring the UI. User ownership alone was not as strong as ownership plus active request brand.

## Full Close Evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked touched docs: `SESSION_0157.md`, `project-log.md`, `feature-data-prerequisites.md`, `course-curriculum-runbook.md`, `wiki/index.md`. Updated dates/last_agent/backlinks where needed. |
| Backlinks/index sweep | Added `SESSION_0157` to `course-curriculum-runbook.md` backlinks and `wiki/index.md` session table. Added feature-data/course-runbook pair both directions. |
| Wiki lint | `bun run wiki:lint` returned 0 errors, 509 warnings. Warnings are pre-existing markdown-format warnings across older docs. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | SESSION_0157_REVIEW_01 recorded; finding SESSION_0157_FINDING_01 open. |
| Review & Recommend | Next session goal written: yes. |
| Memory sweep | Project-scoped memory captured in `feature-data-prerequisites.md` and this SESSION file; no operator memory update needed. |
| Next session unblock check | Unblocked for QA smoke; product inclusion design is blocked on Petey decision, not implementation. |
| Git hygiene | Branch `main`; single worktree; implementation committed locally; no push requested. |
| Graphify update | Ran `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` after git hygiene. Final `graphify stats`: 5,743 nodes, 10,732 edges, 671 communities, 1,169 files tracked. |

## Next Session

- **Goal:** SESSION_0158 — Course enrollment lifecycle QA + course product inclusion Petey design.
- **Inputs to read:** `docs/sprints/SESSION_0157.md`, `docs/runbooks/course-curriculum-runbook.md`, `docs/runbooks/invites.md`, `docs/runbooks/stripe-setup-runbook.md`, `apps/web/components/admin/combobox-selector.tsx`, `apps/web/components/admin/relation-selector.tsx`, `apps/web/components/web/products/product.tsx`.
- **First task:** Add a signed-in course lifecycle smoke for `/courses/bjj-safety-school`: enroll if needed, mark one curriculum item complete, mark it incomplete, and verify UI state refresh.
- **Candidates:**
  1. QA first — closes SESSION_0157_FINDING_01 before further course work.
  2. Petey design — define whether direct Course product inclusion uses a new course-pricing join, ProgramCourse bundle, or existing PricingPlan metadata.

### Status

closed-full
