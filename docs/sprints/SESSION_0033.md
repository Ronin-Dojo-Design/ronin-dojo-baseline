---
title: "SESSION 0033 — Program enrollments, family groups, waivers, trial lifecycle"
slug: session-0033
type: session
status: planned
created: 2026-05-02
updated: 2026-05-02
last_agent: claude-staging-0033
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0032.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/cody-preflight.md
  - docs/protocols/petey-plan.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/decisions/0004-multi-brand-as-column.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/knowledge/wiki/manual-boundary-registry.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0033 — Program enrollments, family groups, waivers, trial lifecycle

> **Pre-staged skeleton.** This file was scaffolded by `claude-staging-0033` during SESSION_0032 close. The next operator runs `/bow-in`, fills the **Petey plan** + **Pre-flight output** + **Task log** + **What landed** sections, and bumps `last_agent` to their own `<agent>-session-0033` tag. Bow-in audit, Dirstarter alignment, spec lineage, DDD framing, scope guard, and verification commands are pre-filled to minimize bow-in token cost.

## Date

Target 2026-05-03 (per WORKFLOW 5.0 calendar).

## Operator

Brian Scott + (next chat: Petey orchestrates, Cody executes, Doug + Giddy review).

## Status

planned

## Goal

Land the next School Operations slice: a write-surface aggregate covering **ProgramEnrollment** (with optional waitlist), **FamilyGroup / FamilyMember** (parent-for-minor signing chain), **Waiver / WaiverSignature** (per-program required waivers), and **trial lifecycle** (Lead → TrialBooked → TrialCompleted → Converted). Brand/org/role-scoped, rate-limited, audit-logged via `writeSchoolOpsAudit`. No UI, no billing, no entitlement code (deferred to SESSION_0034 per ADR 0011).

## Bow-in audit (carry-forward from SESSION_0032 close-full)

- **Latest prior session:** [`docs/sprints/SESSION_0032.md`](SESSION_0032.md), `closed-full`, WORKFLOW rubric **10.0/10**, hostile review clean. SESSION_0033 is **unblocked** unless owner chooses to spend the slot on SESSION_0032_FINDING_01 first (see Open decisions OD-1).
- **Branch / worktree:** Implementation in `/Users/brianscott/dev/wt-school-ops` on `session-0033-enrollments-family-waivers-trial` (create at session start, off `main` after SESSION_0032 PR merges, OR off `session-0032-attendance` if PR not yet merged). Main worktree `/Users/brianscott/dev/ronin-dojo-app` stays on `main` for orchestration only.
- **Open SESSION_0032 PR:** https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/1 — confirm merged before starting, or branch off `session-0032-attendance` if review is still open.
- **FAILED_STEPS:** FS-0006 (Petey-first for multi-part work), FS-0007 (protocol enforcement), FS-0008 (schema spot-check) all `mitigated`. **Cody pre-flight is mandatory** for backend + schema work — the updated [`docs/protocols/cody-preflight.md`](../protocols/cody-preflight.md) with primitive-API + schema spot-check sub-steps applies.
- **Drift register ([`drift-register.md`](../knowledge/wiki/drift-register.md)):**
  - **D-005** (cache strategy on auth-scoped data) remains open. Enrollment/family/waiver reads are member-private — no `"use cache"` on them. React per-request `cache` only for non-PII reads.
  - **D-014** (Dirstarter `Tool` residue) is orthogonal.
- **Manual boundaries ([`manual-boundary-registry.md`](../knowledge/wiki/manual-boundary-registry.md)):**
  - **MB-002** (procedural brand-scope) is the live target — every new enrollment/family/waiver query/mutation must include explicit `brand` + `organizationId` predicates. **Note:** `ProgramEnrollment`, `FamilyGroup`, `FamilyMember` carry **no** direct brand/org column — predicates flow through `Program → ClassSchedule.organizationId` and `Membership → organizationId` (same anti-corruption pattern as Attendance/CheckIn through ClassSession in SESSION_0032).
  - **MB-013** (security/financial readiness) advances; full closure requires later sessions.
  - **MB-014** (production multi-domain hardening) is owner-gated; does not block SESSION_0033, blocks staging deploy.
- **SESSION_0032_FINDING_01:** full-app `bunx tsc --noEmit` debt (`PageProps`/`RouteContext`, content-collections generated types, auth role typing, passport enum drift, S3 env typing) is **open** and outside the school-ops attendance/schedule slices. Decision required at bow-in: preempt SESSION_0033, or continue and accept the carry.
- **Lane:** School operations.
- **Subagent dispatch budget (per memory):** ~20 tool calls per read-only explorer. Split larger bundles sequentially. No parallel write worktrees.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (Better Auth), Prisma/database, server feature folders (`server/web/*`), `userActionClient` safe-actions, centralized rate limiter, AuditLog surface (via `writeSchoolOpsAudit`) |
| Extension or replacement | **Extension.** Build `server/web/{enrollment,family,waiver,lead}/*` beside `server/web/{schedule,attendance}/*`, reusing `userActionClient`, `canEditOrganization`, `getRequestBrand` from `~/lib/brand-context`, `writeSchoolOpsAudit`, error-catalog pattern, payload `Prisma.*Select` `satisfies`, and zod schemas. |
| Why justified | Enrollment + family + waiver + trial lifecycle is the next launch-critical school-ops slice after attendance — it advances the **Prospect → Member** lifecycle (Lead → TrialBooked → Enrollment → Membership) and the **Coach → Admin** lifecycle (waiver review, family management) without adding billing, entitlements, or UI scope. |
| Risk if bypassed | Cross-brand enrollment leakage, parent-for-minor signing without authority, duplicate enrollment rows past unique constraint, unaudited waiver state changes, lead/trial status transitions without the SESSION_0031/0032 security gates, and silent regression of MB-002 brand-scope. |

Live Dirstarter docs to re-verify at execution start (paste timestamps into close evidence):

- Project structure: https://dirstarter.com/docs/codebase/structure
- Prisma / database: https://dirstarter.com/docs/database/prisma
- Authentication: https://dirstarter.com/docs/authentication
- Rate limiting: https://dirstarter.com/docs/integrations/rate-limiting
- Analytics: https://dirstarter.com/docs/integrations/analytics

## Spec lineage (spec-driven contract)

This slice is bounded by these accepted specs. No requirement may be added that is not in one of them; any new requirement requires a spec amendment first.

- Programs / Curriculum / Certification spec — [`docs/architecture/programs-curriculum-certification-spec.md`](../architecture/programs-curriculum-certification-spec.md)
- Monetization / Entitlements spec — [`docs/architecture/monetization-entitlements-spec.md`](../architecture/monetization-entitlements-spec.md) (read-only — **no** entitlement code lands; ADR 0011 entitlement-first applies in SESSION_0034)
- Security / privacy / payments / monitoring plan — [`docs/architecture/security-privacy-payments-monitoring-plan.md`](../architecture/security-privacy-payments-monitoring-plan.md)
- ADR 0004 (multi-brand as column), ADR 0011 (entitlement-first commerce)

## DDD framing

Use one ubiquitous-language vocabulary across schema, server actions, and tests. Update [`docs/architecture/ubiquitous-language.md`](../architecture/ubiquitous-language.md) if any new term is introduced.

| DDD concept | Ronin term | Implementation surface |
| --- | --- | --- |
| Bounded context | School Operations | `apps/web/server/web/{program,schedule,attendance,enrollment,family,waiver,lead}/*` |
| Aggregate root | `Program` | Owns `ProgramEnrollment[]`, `ProgramWaiver[]`. Existing aggregate (extended). |
| Aggregate root | `FamilyGroup` | Owns `FamilyMember[]`. New aggregate. |
| Aggregate root | `Waiver` | Owns `WaiverSignature[]`. New aggregate. |
| Aggregate root | `Lead` | Owns `LeadFollowUp[]`. New aggregate. Lifecycle events: `TrialBooked`, `TrialCompleted`, `Converted`. |
| Entity (inside aggregate) | `ProgramEnrollment`, `FamilyMember`, `WaiverSignature`, `LeadFollowUp` | Lifecycle bound to parent aggregate. |
| Value object | `TrialPolicy` (in zod, not Prisma) | `{ trialDays, requiresWaiver, allowedPrograms[] }` derived from PricingPlan + ProgramWaiver |
| Domain event (logged) | `EnrollmentCreated`, `EnrollmentWithdrawn`, `WaiverSigned`, `WaiverRevoked`, `FamilyMemberAdded`, `FamilyMemberRemoved`, `TrialBooked`, `TrialCompleted`, `LeadConverted` | Written to `AuditLog` via `writeSchoolOpsAudit`. |
| Application service | `userActionClient` actions in `server/web/{enrollment,family,waiver,lead}/actions.ts` | Authenticate, authorize (brand + org + role), validate (zod), invoke domain logic, persist, audit, revalidate. |
| Anti-corruption layer | `~/lib/brand-context` | Single brand-resolution path. Same as SESSION_0031/0032. |

## Schema cheat sheet (read at pre-flight directly from schema.prisma)

The next operator's Cody pre-flight Schema spot-check **must** read these models from `apps/web/prisma/schema.prisma` directly. Pre-staged here only as orientation:

- **`ProgramEnrollment`** (line 1116): `status EnrollmentStatus @default(ACTIVE)`, `waitlistPosition Int?`, `enrolledAt`, `withdrawnAt`. Unique `@@unique([userId, programId])`. **No brand/org columns** — scope through `Program.organizationId` + brand derived from `ClassSchedule` association.
- **`EnrollmentStatus`** enum (line 495): `ACTIVE`, `WAITLISTED`, `COMPLETED`, `WITHDRAWN`, `SUSPENDED`.
- **`FamilyGroup`** (line 1308): `name String?`. **No brand/org columns** — cross-org families are design-permitted (verify at OD-3).
- **`FamilyMember`** (line 1319): `role FamilyRole`, `isPrimary Boolean`. Unique `@@unique([familyGroupId, userId])`.
- **`Waiver`** (line 2036): `type WaiverType`, `version`, `content`, `isRequired`, `isActive`, `brand Brand?` (nullable), `organizationId String?` (nullable), `tournamentId` (defer — out of slice). Has `ProgramWaiver` join.
- **`WaiverSignature`** (line 2061): `signedAt`, `ipAddress`, `userAgent`, `signedOnBehalfOf User?` (parent-for-minor). Unique `@@unique([waiverId, userId])`.
- **`Lead`** (line 2433): `brand Brand`, `organizationId`, `programId String?`, `status LeadStatus`, `source LeadSource`, `firstName/lastName/email/phoneE164`, `trialBookedAt`, `convertedAt`, `convertedToUserId`. **Already brand+org-scoped natively.**
- **`LeadStatus`** enum (line 660): `NEW`, `CONTACTED`, `TRIAL_BOOKED`, `TRIAL_COMPLETED`, `CONVERTED`, `LOST`, `NURTURE`.
- **`LeadFollowUp`** (line 2463): `channel String`, `notes`, `scheduledAt`, `completedAt`, `assignedTo User?`.
- **`Membership`** (line 991): brand + organizationId + status. Used as the **target eligibility floor** (active same-brand, same-org membership), same pattern as SESSION_0032 attendance.
- **`PricingPlan`** (line 1334): has `trialDays Int?`. **Trial duration lives on PricingPlan** — the trial lifecycle reads it but does not write it (PricingPlan management is SESSION_0034).

## Petey plan

> **Filled by next operator.** Use [`docs/protocols/petey-plan.md`](../protocols/petey-plan.md) format. Suggested decomposition (subject to override):
>
> - **TASK_01** — Enrollment write surface (`enrollment/{actions,errors,payloads,queries,schemas}.ts`): `enroll`, `withdraw`, `joinWaitlist`, `promoteFromWaitlist`. Idempotent on `(userId, programId)` unique. AuditLog + rate-limit (`enrollment_write` key).
> - **TASK_02** — Family + Waiver write surface (`family/*` + `waiver/*`): `createFamilyGroup`, `addFamilyMember`, `removeFamilyMember`, `signWaiver` (with `signedOnBehalfOf` for minors), `revokeWaiverSignature`. AuditLog + rate-limit (`family_write`, `waiver_write`).
> - **TASK_03** — Lead + Trial lifecycle write surface (`lead/*`): `createLead`, `bookTrial`, `completeTrial`, `convertLead` (creates Membership + ProgramEnrollment + WaiverSignatures atomically). AuditLog + rate-limit (`lead_write`, `trial_book`).
> - **TASK_04** — Rejection-matrix smoke + monitoring rows. `scripts/smoke-{enrollment,family,waiver,lead}.ts` OR consolidated `smoke-school-ops-extended.ts`. Doug + Cody.
> - **TASK_05** — Close evidence + handoff to SESSION_0034 (entitlement-first commerce per ADR 0011).
>
> Petey may consolidate to ≤3 tasks if scope tightens (per WORKFLOW 5.0 hard rule "max three deliverables").

### Goal
[ Filled at bow-in. ]

### Tasks
[ SESSION_0033_TASK_01..NN — filled at bow-in. ]

### Parallelism
[ Filled at bow-in. Read-only sidecars (Fermat-style schema/spec audit + Pauli-style file map) before edits, ~20 tool calls each. No parallel write worktrees. ]

### Agent assignments
[ Filled at bow-in. Default lead: Cody for impl, Giddy + Doug review, Petey gate, Desi/Brandon deferred (no UI/marketing). ]

### Open decisions

| # | Decision | Default for SESSION_0033 (override at bow-in) |
| --- | --- | --- |
| OD-1 | **Preempt with SESSION_0032_FINDING_01 (full typecheck baseline debt)?** | **No.** Continue with enrollment slice; carry the typecheck debt. Rationale: launch calendar pressure (May 18) outweighs typecheck cleanup; the debt is outside the school-ops slice and not blocking attendance correctness. |
| OD-2 | **Audit entity types** for `writeSchoolOpsAudit` | Add: `Enrollment`, `FamilyGroup`, `FamilyMember`, `Waiver`, `WaiverSignature`, `Lead`, `LeadFollowUp`, `TrialBooking`. Discriminated union shape, no new audit helper file. |
| OD-3 | **FamilyGroup brand/org scope** | FamilyGroup is **cross-org by design** (a family can have members in multiple orgs). Authorization gate is on the **action target** (e.g., `addFamilyMember` requires actor be a family-group member OR an org-admin of the target user's org). Document risk: a malicious admin could enumerate cross-org family ties — mitigate by never returning members outside actor's authorized orgs in reads. |
| OD-4 | **Waiver signing for minors** | `signedOnBehalfOf` requires actor to be a `FamilyMember` of the target with `role` ∈ `PARENT|GUARDIAN|ADMIN` AND target's `User.dateOfBirth` indicates minor (or `Membership.minorFlag` if added). Verify schema; if no minorFlag exists, default to age computed from DoB or fail-closed for staff-only. |
| OD-5 | **Trial booking conflict** | If a `Lead` already has `trialBookedAt` not null and `status = TRIAL_BOOKED`, `bookTrial` is idempotent (no-op + return existing). `completeTrial` requires `status = TRIAL_BOOKED`. `convertLead` requires `status ∈ {TRIAL_COMPLETED, NURTURE}` (not raw `NEW`). |
| OD-6 | **Convert atomicity** | `convertLead` runs in a single Prisma `$transaction`: create User if not exists → create Membership → create ProgramEnrollment(s) per Lead.programId → optionally collect WaiverSignatures → set Lead `status=CONVERTED`, `convertedAt`, `convertedToUserId`. AuditLog one row per sub-event under a shared correlation id. |
| OD-7 | **Waitlist ordering** | `waitlistPosition` is monotonically assigned at enroll-time when `Program.capacity` reached. `promoteFromWaitlist` is a coach/admin action that picks the lowest position and re-enrolls. Race: use `$transaction` + `SERIALIZABLE` or compute under `SELECT ... FOR UPDATE` equivalent. |
| OD-8 | **Rate-limit keys** | New: `enrollment_write`, `family_write`, `waiver_write`, `lead_write`, `trial_book`. Document each in `security-privacy-payments-monitoring-plan.md` monitoring table. |
| OD-9 | **Public surfaces** | None this slice. Public Lead intake (web-form `createLead`) is a SESSION_0035 candidate per WORKFLOW 5.0 calendar. |

### Risks
[ Filled at bow-in. Pre-staged risks: `ProgramEnrollment` lacks brand/org columns (MB-002 anti-corruption load-bearing); FamilyGroup cross-org design opens enumeration risk (OD-3); `convertLead` atomicity — long transaction holds locks across User/Membership/Enrollment/WaiverSignature; D-005 cache prohibition still applies. ]

### Scope guard

Do not add: pricing/contract management UI or actions (SESSION_0034), Stripe checkout, course/lesson pages, `/dashboard/my-path`, certificate verification, push notifications, public family invite UI, public Lead intake form (SESSION_0035), entitlement code, `Product` / `Entitlement` / `EntitlementGrant` / `UserEntitlement` writes (ADR 0011), CGR service folders, schema migrations.

If commerce/entitlement decisions surface, record them in `Open decisions / blockers`; do not implement them inside this slice.

## Pre-flight output

> **Filled by Cody at bow-in BEFORE writing code.** Use the updated [`docs/protocols/cody-preflight.md`](../protocols/cody-preflight.md) Backend + Schema checklists. Schema spot-check section MUST paste exact enum values + back-relation field names read directly from `schema.prisma`, not from this file's cheat sheet (which can drift).

### Pre-flight: Schema — Enrollment / Family / Waiver / Lead write surface (no schema additions)

[ Fill all 6 fields per `cody-preflight.md` schema checklist. Schema spot-check must list `EnrollmentStatus`, `LeadStatus`, `FamilyRole`, `WaiverType` enum values + each model's exact fields/indexes/uniques verbatim from schema.prisma. ]

### Pre-flight: Backend — Enrollment / Family / Waiver / Lead actions

[ Fill all 4 fields per `cody-preflight.md` backend checklist. Auth predicate notes must call out the `ProgramEnrollment`/`FamilyGroup`/`FamilyMember` no-brand-column anti-corruption flow (predicates derived through `Program.organizationId` + brand from associated `ClassSchedule` or upstream Lead). ]

### Pre-flight: Implementation decisions from source scan

[ Fill: action names, audit action strings, rate-limit keys, idempotency anchors, transaction boundaries for `convertLead`. ]

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0033_TASK_01 | planned |
| SESSION_0033_TASK_02 | planned |
| SESSION_0033_TASK_03 | planned |
| SESSION_0033_TASK_04 | planned |
| SESSION_0033_TASK_05 | planned |

> Petey may collapse to 3 tasks at bow-in if scope tightens. Update this table to match.

## Review pass plan

| Pass | Reviewers | Gate |
| --- | --- | --- |
| Pass 1 | Giddy + Cody | Dirstarter/DRY + brand-scope anti-corruption review (MB-002). Score capped at 8.9 if any enrollment/family/waiver/lead query lacks explicit brand/org predicate. |
| Pass 2 | Doug + Desi | Rejection-matrix smoke + lifecycle coverage (Prospect→Member; Coach→Admin). Score capped at 8.9 if `convertLead` atomicity fails. |
| Pass 3 | Petey + Doug | Scope guard, monitoring update, AuditLog completeness, docs/readiness. |

## Expected verification

- `bunx prisma validate --schema apps/web/prisma/schema.prisma`
- `bun test apps/web/server/web/{enrollment,family,waiver,lead}/`
- `bun test apps/web/server/web/schedule/ apps/web/server/web/attendance/` (regression — must stay green)
- `bun apps/web/scripts/smoke-{enrollment,family,waiver,lead}.ts` (OR consolidated `smoke-school-ops-extended.ts`)
- Permission/brand failure-case review for each new action (MB-002 grep proof: every new query must show explicit `where` brand/org predicate)
- Touched-slice lint/type checks (full-app `tsc --noEmit` still expected to fail per SESSION_0032_FINDING_01 unless OD-1 is overridden)
- `git diff --check`
- `bun run wiki:lint`

## Next sessions queued

| Session | Target |
| --- | --- |
| SESSION_0034 | Entitlement layer, pricing plans, contracts, invoices, Stripe account wiring (entitlement-first per ADR 0011). |
| SESSION_0035 | Public Lead intake form, trial conversion CRM follow-up states, lead source tracking. |
| SESSION_0036 | Tournament operations — event discovery, registration checkout, rosters, check-in (lane shift). |

## What landed (target — fill at close)

[ Filled at bow-out. Mirror SESSION_0032 What landed format: per-task summary + audit shape + tests + smoke + monitoring + docs cleanup. ]

## Files touched (target — fill at close)

[ Filled at bow-out. ]

## Decisions resolved (fill at close)

[ Filled at bow-out — capture the actual disposition of OD-1..OD-9 plus any surfaced mid-session. ]

## Verification (fill at close)

[ Filled at bow-out as a markdown table: command + result. Mirror SESSION_0032 format. ]

## Hostile close review (fill at close)

[ Filled at bow-out. Use WORKFLOW 5.0 10-point rubric. Score must be ≥ 9.5 to close-full; otherwise rolls to SESSION_0034. ]

## Reflections (fill at close)

[ Filled at bow-out — Kaizen reflection on what worked, what surprised, what to carry forward. ]

## Open decisions / blockers (carry — fill/update at close)

- MB-002 brand-scope hardening remains procedural; this slice should grep-prove every new query has explicit `brand` + `organizationId` predicates (or documented anti-corruption flow through Program/Membership).
- MB-013 security/financial readiness advances; full closure requires SESSION_0034+.
- MB-014 production multi-domain hardening is owner-gated; does not block SESSION_0033, blocks staging deploy.
- D-005 cache strategy on auth-scoped data remains open; this slice must not introduce `"use cache"` on member-private reads.
- SESSION_0032_FINDING_01 (full-app typecheck baseline debt) — OD-1 disposition required at bow-in.

## Full close evidence (fill at close)

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | [ Fill ] |
| Backlinks/index sweep | [ Fill ] |
| Wiki lint | [ Fill — `bun run wiki:lint` output ] |
| Kaizen reflection | [ Fill — link to `## Reflections` ] |
| Hostile close review | [ Fill — link to `## Hostile close review` + project-log review entry id ] |
| Review & Recommend | [ Fill — link to `## Next session` recommendation ] |
| Memory sweep | [ Fill — list of memories written, or "none needed" with rationale ] |
| Next session unblock check | [ Fill — confirm SESSION_0034 unblocked or named blocker ] |
| Git hygiene | [ Fill — branch, push state, `git diff --check`, no `--no-verify`, no signing bypass ] |

## Bow-out line for SESSION_0032 (pre-recorded)

Bowed out — SESSION_0032 closed-full at 10.0/10 (hostile rubric). Branch `session-0032-attendance` pushed; PR #1 open. SESSION_0033 skeleton pre-staged. Next chat: `/bow-in`, read this file's bow-in audit + Dirstarter alignment + open decisions, decide OD-1 (preempt with typecheck debt? default no), run Cody pre-flight against Backend + Schema checklists, branch `session-0033-enrollments-family-waivers-trial` off `main` (after PR #1 merge) or off `session-0032-attendance`.
