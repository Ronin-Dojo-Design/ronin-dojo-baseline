---
title: "SESSION 0371 — BBL landing polish + registration form"
slug: session-0371
type: session--implement
status: closed
created: 2026-06-12
updated: 2026-06-12
last_agent: codex-session-0371
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0368.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0371 — BBL landing polish + registration form

## Date

2026-06-12

## Operator

Brian + codex-session-0371

## Goal

Improve `bbl.local` landing spacing/typography/rhythm/design tokens toward BlackBeltLegacy parity, sweep broken links, and wire Register CTAs to a premium registration form collecting lineage-ready information.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0368.md` (BBL brand feature gate closed).
- Carryover: BBL is lineage-first with static feature gates; this session must preserve allowlisted launch scope and route behavior.

### Branch and worktree

- Branch: `work`
- Worktree: `/workspace/ronin-dojo-baseline` (requested `/Users/brianscott/dev/ronin-dojo-app` is not mounted in this container).
- Status at bow-in: clean except this new session file after creation.
- Current HEAD at bow-in: `1879dc5`.

### Graphify check

- Graph status: rebuilt because `graphify` was not on PATH and `npx @nodesify/graphify stats` initially reported 0 nodes. Rebuild result: 7,527 nodes / 19,785 edges; subsequent stats: 9,535 nodes / 19,785 edges / 1,778 files tracked.
- Queries used: `registration lineage lineage-listings-runbook`; `BBL landing register form BlackBeltLegacyLanding BBLRegisterForm lineage join`; `autonomous auto codex session setup`; `graphify explain "Black Belt Legacy"`.
- Files selected from graph: `apps/web/app/(web)/lineage/join/page.tsx`, `apps/web/components/web/lineage/join-legacy-form.tsx`, `apps/web/server/web/lineage/join-legacy-actions.ts`, `apps/web/emails/bbl-join-legacy-confirmation.tsx`, BBL landing/header/footer surfaces.
- Verification note: `lineage-listings-runbook` node was not found; Graphify did identify `docs/runbooks/dev-environment/autonomous-sessions.md` and `scripts/auto-session-codex.sh`. Recommendation: keep this task inline with subagents, not autonomous 3-session run, because visual parity + form data + route wiring are tightly coupled.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Marketing landing route, web form/action path, email confirmation, route links |
| Extension or replacement | Extension: brand-specific BBL landing polish and registration data collection on existing lineage join seam |
| Why justified | BBL launch SoT requires lineage-first public experience and claim/registration funnel |
| Risk if bypassed | Premium landing CTAs dead-end or collect insufficient information for lineage onboarding |

## Petey plan

### Goal

BBL landing feels premium and launch-ready, all Register CTAs land on a functional lineage registration form, and link/form behavior is verified.

### Tasks

#### SESSION_0371_TASK_01 — BBL landing polish + CTA wiring

- **Agent:** Cody + Desi
- **What:** Improve spacing/typography/rhythm/design tokens and premium micro-interactions on the BBL landing; wire Register CTAs to the registration route.
- **Done means:** landing renders without broken internal CTAs; tokens are centralized enough for follow-up reuse; visual proof captured if runnable.
- **Depends on:** nothing

#### SESSION_0371_TASK_02 — Registration form parity + backend

- **Agent:** Cody
- **What:** Bring `/lineage/join` form closer to BBLRegisterForm feature/visual parity while collecting lineage-ready data and preserving backend submission/email path.
- **Done means:** form validates required fields, submits to existing action, persists all newly collected information in available model fields or a safe schema addition if required.
- **Depends on:** TASK_01 route decision

#### SESSION_0371_TASK_03 — Link sweep + verification

- **Agent:** Doug
- **What:** Check BBL landing/register links and run type/lint/test/build-appropriate gates.
- **Done means:** verification commands recorded with pass/fail/warning and blockers documented.
- **Depends on:** TASK_01, TASK_02

### Parallelism

- Explorer subagents run in parallel for legacy parity discovery and current route/backend seam discovery.
- Implementation stays inline to avoid overlapping edits in landing/form/action files.

### Open decisions

- None blocking. Schema changes are greenlit by operator if needed, but prefer existing `RegistrationEntry`/lineage join storage when sufficient.

### Risks

- Legacy monorepo may not be mounted in this container; use available local references and current live code if source files are unavailable.
- Local dev server/database may limit end-to-end submission proof.

### Scope guard

- Do not expand beyond BBL landing/register funnel and broken link sweep. No push; operator will push to main after review.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0371_TASK_01 | landed | BBL landing register route now targets `/lineage/join`; landing rhythm/tokens got stronger primary-tint sections, larger hero typography, ambient glows, upgraded hover/translate card motion, and wider section spacing. |
| SESSION_0371_TASK_02 | landed | `/lineage/join` rebuilt as a premium step-grouped registration intake; captures role, school/academy, location, evidence URL, existing lineage claim intent, rank/instructor/tree/bio details; backend stores the added fields in lead notes/meta and attaches evidence URL to signed-in lineage claims. |
| SESSION_0371_TASK_03 | landed | Source-level BBL link sweep verified route constants point to existing route files; added regression test locking Register/Join to `/lineage/join`; typecheck/lint/tests run. Browser screenshot blocked by local Next/Turbopack Google font resolution before app code. |

## What landed

- BBL landing Register CTAs now route to the real Join Legacy intake at `/lineage/join` instead of `/auth/login`.
- BBL landing visual polish improved spacing/rhythm and premium feel with semantic primary-token gradients, larger hero type, soft ambient glows, rounded section shells, and hover/translate micro-interactions.
- Join Legacy became a BBL registration-style intake with path cards, step headers, role, current school/academy, location, evidence URL, existing claim selector, rank/promotion, instructor, tree-connection, and bio/achievement fields.
- Backend intake now accepts the new registration fields, stores them in `Lead.meta` and steward-facing notes, and attaches reference/evidence URL to signed-in `LineageClaimRequest` evidence.
- Added a non-DB regression test so the BBL landing Register route cannot drift back to auth login.

## Files touched

- `apps/web/app/(web)/(home)/bbl/bbl-landing-content.ts` — route mapping changed so `register` and `join` both target `/lineage/join`.
- `apps/web/app/(web)/(home)/bbl/bbl-landing-content.test.ts` — new regression test for the BBL Register route.
- `apps/web/app/(web)/(home)/bbl/bbl-landing.tsx` — visual spacing/token/micro-interaction polish for hero, media/card sections, CTA sections, and overall section rhythm.
- `apps/web/app/(web)/lineage/join/join-legacy-form.tsx` — premium multi-step BBL registration intake UI and expanded lineage-ready fields.
- `apps/web/server/web/lead/public-actions.ts` — server schema and persistence for role/school/location/evidence URL fields, plus claim evidence URL wiring.
- `docs/sprints/SESSION_0371.md` — session record.
- `docs/knowledge/wiki/index.md` — session index entry.
- `docs/knowledge/wiki/log.md` — wiki/session log entry.

## Decisions resolved

- No schema addition was needed for this slice. Existing `Lead.notes`/`Lead.meta` plus optional `LineageClaimRequest.evidence` safely capture the additional registration context without prematurely minting Passport/DirectoryProfile facts.
- `RegistrationEntry` was not used because Graphify/current schema review showed it is tournament-registration-specific, not BBL lineage onboarding.
- Kept this inline with Petey orchestration instead of an autonomous 3-session run because visual parity, route wiring, and form/backend semantics were tightly coupled.

## Open decisions / blockers

- Local browser screenshot/render proof is blocked in this container by Next/Turbopack failing to resolve Google font internals (`@vercel/turbopack-next/internal/font/google/font`) before app code. Re-test visually in Brian's normal dev environment.
- DB-backed lineage claim tests require a reachable Postgres; dummy `DATABASE_URL` is enough for typecheck/generation but not DB tests.
- Future product decision: if BBL registration should create Passport/DirectoryProfile drafts immediately, design that as a separate reviewed identity slice. This session intentionally kept registration as intake + claim evidence.

## Review log

- **Doug verification:** source-level BBL route sweep passed; route constants now map to existing route files (`/lineage/join`, `/about`, `/lineage`, `/directory`, `/posts`, `/schools`, `/organizations/new`, `/techniques`).
- **Desi review:** visual polish uses semantic tokens and current primitives rather than arbitrary legacy hex classes; motion is CSS-only and motion-reduce safe.
- **Cody review:** backend form schema mirrors client schema; added evidence URL to both lead metadata and lineage claim evidence.

## Hostile close review

- **Giddy verdict:** Pass with environment caveat. No schema churn, no deleted features, no bypass of SOT-ADR D9 feature gates, no raw-source edits.
- **Doug verdict:** Pass with proof caveat. Typecheck and BBL route tests pass. Local render proof blocked by Turbopack/font environment; this must be visually checked before production flip.
- **Dirstarter check:** This extends existing marketing/form/action seams and keeps Dirstarter listing checkout behavior intact for Premium/Elite paths.
- **Score cap:** 8/10 until visual screenshot is captured in a fully configured dev environment.

## ADR / ubiquitous-language check

- No new ADR needed: this is implementation within SOT-ADR D9 and existing identity/claim decisions.
- Ubiquitous language preserved: Passport/DirectoryProfile are not minted implicitly; Membership/RegistrationEntry were not overloaded.

## Findings (severity ≥ medium)

- None added to cross-session ledgers. Environment-only limitations are recorded in this SESSION file.

## Reflections

- Graphify was useful after rebuild for identifying the correct `/lineage/join` seam and autonomous-session runbook. Exact legacy monorepo source files were not mounted; current repo docs/import notes served as the parity source.
- The highest-value guard was the new route regression test: it prevents the main landing CTA from drifting back to `/auth/login`.

## Next session

### Goal

Capture real browser proof on `bbl.local` in the fully configured local environment, then continue the cutover-arm sequence (Stripe@22 rehearsal or OG/meta/sitemap hygiene per SESSION_0368).

### Inputs to read

- `docs/sprints/SESSION_0371.md`
- `docs/product/black-belt-legacy/BBL-SOT-Spec.md`
- `docs/product/black-belt-legacy/SOT-ADR.md`
- `docs/sprints/SESSION_0368.md`

### First task

Start the normal `apps/web` dev server in Brian's configured environment, visit `http://bbl.local:3000/` and `/lineage/join`, capture screenshots, click every landing CTA, and confirm Register lands on `/lineage/join` with no console errors.
