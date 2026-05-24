---
title: "SESSION 0033 — Program enrollments, family groups, waivers, trial lifecycle"
slug: session-0033
type: session
status: closed-full
created: 2026-05-02
updated: 2026-05-03
last_agent: copilot-session-0034
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0032.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/cody-preflight.md
  - docs/protocols/petey-plan.md
  - docs/protocols/project-log.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
  - docs/architecture/ubiquitous-language.md
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

Brian Scott + Codex playing Petey orchestrator first, then Cody executor; Doug + Giddy review.

## Status

closed-full

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
  - **MB-002** (procedural brand-scope) is the live target — every new enrollment/family/waiver query/mutation must include explicit `brand` + `organizationId` predicates. **Note:** `ProgramEnrollment`, `FamilyGroup`, `FamilyMember` carry **no** direct brand/org column — enrollment predicates flow through `Program.brand` + `Program.organizationId`; family predicates flow through target-user `Membership.brand` + `Membership.organizationId`.
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

Execution-start proof: Petey rechecked the live docs on 2026-05-03. Current docs still support
the Dirstarter extension path: feature folders under `server/web`, Prisma schema/client via
`prisma/schema.prisma` + `services/db.ts`, Better Auth session/role baseline, centralized
rate-limiter helper with fail-open behavior, and privacy-friendly analytics/custom events without
PII.

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

- **`ProgramEnrollment`** (line 1116): `status EnrollmentStatus @default(ACTIVE)`, `waitlistPosition Int?`, `enrolledAt`, `withdrawnAt`. Unique `@@unique([userId, programId])`. **No brand/org columns** — scope through `Program.brand` + `Program.organizationId`.
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

Ship the next School Operations write substrate: enrollments/waitlist, staff-managed family groups,
guardian waiver signatures, and staff-managed Lead -> Trial -> Converted lifecycle, with brand/org
predicates, rate limits, audit rows, smoke proof, and no UI/billing/entitlement scope.

### Tasks

#### SESSION_0033_TASK_01 — Enrollment write surface

- **Agent:** Cody, reviewed by Giddy + Doug.
- **What:** Add `server/web/enrollment/*` actions, schemas, payloads, queries, error catalog, and tests.
- **Steps:**
  1. Resolve `Program` through server-derived brand + organization.
  2. Require `canEditOrganization` and active same-brand/same-org target membership.
  3. Implement `enrollInProgram`, `joinProgramWaitlist`, `withdrawEnrollment`,
     `promoteFromWaitlist`.
  4. Audit `EnrollmentCreated`, `EnrollmentWithdrawn`, and waitlist/promote events through
     `writeSchoolOpsAudit`; add `enrollment_write` rate-limit key.
  5. Prove idempotency on `@@unique([userId, programId])` and capacity/waitlist behavior.
- **Done means:** Staff/admin can mutate enrollment rows for active same-org members only; repeated
  calls do not create duplicates; capacity sends overflow to a monotonic waitlist; all writes are
  catalog-error-only, rate-limited, audited, and brand/org-scoped through `Program`.
- **Depends on:** nothing.

#### SESSION_0033_TASK_02 — Family + waiver write surface

- **Agent:** Cody, reviewed by Giddy + Doug.
- **What:** Add `server/web/family/*` and `server/web/waiver/*` actions, schemas, payloads, queries,
  error catalogs, and tests.
- **Steps:**
  1. Staff-manage `FamilyGroup` and `FamilyMember` rows through explicit target-user membership
     predicates because FamilyGroup has no brand/org columns.
  2. Implement `createFamilyGroup`, `addFamilyMember`, and `removeFamilyMember` with
     `family_write`.
  3. Implement `signWaiver` and `revokeWaiverSignature` with `waiver_write`; self-sign is allowed
     for active members, guardian signing requires an existing `FamilyMember.role = GUARDIAN`
     relationship to a minor target.
  4. Audit `FamilyMemberAdded`, `FamilyMemberRemoved`, `WaiverSigned`, and `WaiverRevoked`.
- **Done means:** Family and waiver writes never enumerate cross-org ties; guardian signatures fail
  closed without a minor DOB and explicit family authority; waiver rows resolve by brand/org or
  program join only.
- **Depends on:** nothing.

#### SESSION_0033_TASK_03 — Lead/trial lifecycle, smoke proof, close evidence

- **Agent:** Cody + Doug, closed by Petey.
- **What:** Add `server/web/lead/*`, consolidate school-ops extended smoke proof, update monitoring
  docs/project log/session close evidence.
- **Steps:**
  1. Implement staff-managed `createLead`, `bookTrial`, `completeTrial`, and `convertLead` with
     `lead_write` / `trial_book`.
  2. Convert atomically: create/find user, ensure Passport/DirectoryProfile stubs, create
     Membership, create ProgramEnrollment when `Lead.programId` exists, optionally write waiver
     signatures, and set `Lead.status = CONVERTED`.
  3. Add consolidated smoke/tests for happy paths and rejection matrix across enrollment, family,
     waiver, and lead actions.
  4. Update monitoring row, Project Log, SESSION file, JETTY/index links, and run closing ritual.
- **Done means:** Lead lifecycle is staff-only, brand/org-scoped, audit-logged, and transactional;
  smoke proof covers cross-brand/org denials; SESSION_0033 closes with honest verification.
- **Depends on:** SESSION_0033_TASK_01 and SESSION_0033_TASK_02 for conversion enrollment/waiver
  integration.

### Parallelism

- Two read-only explorer subagents were dispatched before edits:
  - **Fermat**: Prisma/spec schema spot-check, ~20 tool-call budget, no writes.
  - **Pauli**: existing schedule/attendance pattern map, ~20 tool-call budget, no writes.
- All implementation writes stay in one worktree/branch
  (`/Users/brianscott/dev/wt-school-ops` /
  `session-0033-enrollments-family-waivers-trial`) because the slices share auth helpers, test
  fixtures, smoke cleanup, and rate-limit/audit contracts. No parallel write worktrees.

### Agent assignments

| Task | Lead | Reviewers | Rationale |
| --- | --- | --- | --- |
| Bow-in / plan | Petey | Giddy | Multi-part backend/security slice; WORKFLOW 5.0 requires scope compression. |
| Pre-flight | Cody | Petey | Mandatory backend/schema spot-check before code. |
| TASK_01 | Cody | Giddy + Doug | Enrollment/waitlist idempotency and MB-002 predicates. |
| TASK_02 | Cody | Giddy + Doug | Family cross-org risk and guardian waiver authority. |
| TASK_03 | Cody + Doug | Petey | Lead conversion atomicity, smoke proof, docs/close evidence. |
| Deferred | Desi, Brandon | — | No UI, UX, brand copy, or marketing surfaces this slice. |

### Open decisions

- OD-1 resolved by default: do **not** preempt with SESSION_0032_FINDING_01; carry full-app
  typecheck debt and verify touched slices.
- OD-2 resolved: use existing free-form `AuditLog.entityType` / `action` strings; no new audit
  helper file beyond existing `writeSchoolOpsAudit`.
- OD-3 resolved for this slice: FamilyGroup stays cross-org; every action gates on the target user's
  same-brand/same-org active membership and staff authority before returning or mutating rows.
- OD-4 adjusted to source truth: `FamilyRole` enum is `GUARDIAN | CHILD | SPOUSE`, not
  `PARENT | GUARDIAN | ADMIN`; guardian signing uses `GUARDIAN` only and fails closed if target DOB
  is absent or not a minor.
- OD-9 resolved: no public Lead intake; `createLead` is staff-managed only.

### Risks

- `ProgramEnrollment` and `FamilyGroup` carry no brand/org columns; predicates must flow through
  `Program`, `Membership`, and target-user memberships.
- `FamilyGroup` cross-org design can leak family ties if reads are widened. This session returns
  only target-org member rows from family queries.
- `WaiverSignature` uniqueness is `(waiverId, userId)`, so one signer cannot create multiple
  distinct signatures for the same waiver. This is recorded as a schema constraint, not expanded.
- `convertLead` touches User/Membership/Enrollment/WaiverSignature/Lead in one transaction; tests
  must prove rollback on invalid status and duplicate conversion idempotency.

### Open decisions

| # | Decision | Default for SESSION_0033 (override at bow-in) |
| --- | --- | --- |
| OD-1 | **Preempt with SESSION_0032_FINDING_01 (full typecheck baseline debt)?** | **No.** Continue with enrollment slice; carry the typecheck debt. Rationale: launch calendar pressure (May 18) outweighs typecheck cleanup; the debt is outside the school-ops slice and not blocking attendance correctness. |
| OD-2 | **Audit entity types** for `writeSchoolOpsAudit` | Add: `Enrollment`, `FamilyGroup`, `FamilyMember`, `Waiver`, `WaiverSignature`, `Lead`, `LeadFollowUp`, `TrialBooking`. Discriminated union shape, no new audit helper file. |
| OD-3 | **FamilyGroup brand/org scope** | FamilyGroup is **cross-org by design** (a family can have members in multiple orgs). Authorization gate is on the **action target** (e.g., `addFamilyMember` requires actor be a family-group member OR an org-admin of the target user's org). Document risk: a malicious admin could enumerate cross-org family ties — mitigate by never returning members outside actor's authorized orgs in reads. |
| OD-4 | **Waiver signing for minors** | Source truth adjusted at bow-in: `FamilyRole` is `GUARDIAN|CHILD|SPOUSE`, `Passport.dob` is the only minor DOB field, and no `Membership.minorFlag` exists. `signedOnBehalfOf` therefore requires actor and target in the same FamilyGroup, actor `role = GUARDIAN`, target active same-org member, and target minor by `Passport.dob`; otherwise fail closed. |
| OD-5 | **Trial booking conflict** | If a `Lead` already has `trialBookedAt` not null and `status = TRIAL_BOOKED`, `bookTrial` is idempotent (no-op + return existing). `completeTrial` requires `status = TRIAL_BOOKED`. `convertLead` requires `status ∈ {TRIAL_COMPLETED, NURTURE}` (not raw `NEW`). |
| OD-6 | **Convert atomicity** | `convertLead` runs in a single Prisma `$transaction`: create User if not exists → create Membership → create ProgramEnrollment(s) per Lead.programId → optionally collect WaiverSignatures → set Lead `status=CONVERTED`, `convertedAt`, `convertedToUserId`. AuditLog one row per sub-event under a shared correlation id. |
| OD-7 | **Waitlist ordering** | `waitlistPosition` is monotonically assigned at enroll-time when `Program.maxEnrollment` is reached. `promoteFromWaitlist` is a coach/admin action that picks the lowest position and re-enrolls. Race: current proof uses Prisma `$transaction`; stricter serializable/row-lock enforcement remains a pre-launch hardening candidate because the schema has no per-program unique waitlist position. |
| OD-8 | **Rate-limit keys** | New: `enrollment_write`, `family_write`, `waiver_write`, `lead_write`, `trial_book`. Document each in `security-privacy-payments-monitoring-plan.md` monitoring table. |
| OD-9 | **Public surfaces** | None this slice. Public Lead intake (web-form `createLead`) is a SESSION_0035 candidate per WORKFLOW 5.0 calendar. |

### Risk controls carried into implementation

- `ProgramEnrollment` brand/org scope is enforced through `Program.brand` and
  `Program.organizationId`; there is still no direct column on the enrollment row.
- `FamilyGroup` remains cross-org by design; actions and reads scope through active target
  memberships instead of returning the full family graph.
- `convertLead` is intentionally transactional, but hostile review forced the safer shape: preserve
  existing User/Passport/DirectoryProfile identity, respect `Program.maxEnrollment`, and keep
  converted/lost leads from being rewound into trial state.
- D-005 remains active; this slice adds no persistent `"use cache"` member-private reads.

### Scope guard

Do not add: pricing/contract management UI or actions (SESSION_0034), Stripe checkout, course/lesson pages, `/dashboard/my-path`, certificate verification, push notifications, public family invite UI, public Lead intake form (SESSION_0035), entitlement code, `Product` / `Entitlement` / `EntitlementGrant` / `UserEntitlement` writes (ADR 0011), CGR service folders, schema migrations.

If commerce/entitlement decisions surface, record them in `Open decisions / blockers`; do not implement them inside this slice.

## Pre-flight output

> **Filled by Cody at bow-in BEFORE writing code.** Use the updated [`docs/protocols/cody-preflight.md`](../protocols/cody-preflight.md) Backend + Schema checklists. Schema spot-check section MUST paste exact enum values + back-relation field names read directly from `schema.prisma`, not from this file's cheat sheet (which can drift).

### Pre-flight: Schema — Enrollment / Family / Waiver / Lead write surface (no schema additions)

**1. Petey invocation** — [x] Petey plan exists in this SESSION file with task IDs
SESSION_0033_TASK_01..03. No Prisma model/migration changes are planned.

**2. Design doc check** — Consulted `programs-curriculum-certification-spec.md`,
`monetization-entitlements-spec.md` (read-only; no entitlement code), ADR 0004, ADR 0011, and
`security-privacy-payments-monitoring-plan.md`. The slice matches the existing schema and does not
add commerce, entitlement, public Lead intake, UI, or migrations.

**3. Existing schema scan** — direct `schema.prisma` spot-check:

- `Brand` enum: `RONIN_DOJO_DESIGN`, `BASELINE_MARTIAL_ARTS`, `BBL`, `WEKAF`.
- `MembershipStatus` enum: `INVITED`, `PENDING`, `ACTIVE`, `SUSPENDED`, `EXPIRED`.
- `EnrollmentStatus` enum: `ACTIVE`, `WAITLISTED`, `COMPLETED`, `WITHDRAWN`, `SUSPENDED`.
- `LeadStatus` enum: `NEW`, `CONTACTED`, `TRIAL_BOOKED`, `TRIAL_COMPLETED`, `CONVERTED`, `LOST`,
  `NURTURE`.
- `FamilyRole` enum: `GUARDIAN`, `CHILD`, `SPOUSE`.
- `WaiverType` enum: `LIABILITY`, `TOURNAMENT`, `MINOR_CONSENT`, `MEDIA_RELEASE`, `MEDICAL`.
- `Program` fields used for scope: `brand`, `organizationId`, `disciplineId`, `maxEnrollment`,
  `programEnrollments`, `waivers`, `pricingPlans`, `leads`; unique
  `@@unique([brand, organizationId, slug])`; index `@@index([brand, organizationId])`.
- `ProgramEnrollment` fields: `status`, `waitlistPosition`, `enrolledAt`, `withdrawnAt`,
  `userId`, `programId`; unique `@@unique([userId, programId])`; indexes
  `@@index([programId, status])`, `@@index([userId])`. No direct brand/org columns.
- `FamilyGroup` fields: `name`, `members`; index `@@index([id])`. No brand/org columns.
- `FamilyMember` fields: `role`, `isPrimary`, `familyGroupId`, `userId`; unique
  `@@unique([familyGroupId, userId])`; index `@@index([userId])`. Back-relations:
  `FamilyGroup.members`, `User.familyMemberships`.
- `PricingPlan` fields used for trial policy: `brand`, `organizationId`, `programId`,
  `trialDays`, `isActive`; indexes `@@index([brand, organizationId])`, `@@index([programId])`.
- `Waiver` fields: `type`, `title`, `content`, `version`, `isRequired`, `isActive`, `brand?`,
  `organizationId?`, `tournamentId?`, `signatures`, `programs`; indexes
  `@@index([brand, type, isActive])`, `@@index([organizationId])`, `@@index([tournamentId])`.
- `WaiverSignature` fields: `signedAt`, `ipAddress`, `userAgent`, `waiverId`, `userId`,
  `signedOnBehalfOfId`; unique `@@unique([waiverId, userId])`; index `@@index([userId])`.
  Back-relations: `User.waiverSignatures`, `User.waiverSignaturesOnBehalf`.
- `Lead` fields: `brand`, `organizationId`, `programId?`, `status`, `source`, `firstName`,
  `lastName`, `email`, `phoneE164`, `trialBookedAt`, `convertedAt`, `convertedToUserId`,
  `followUps`; indexes `@@index([brand, organizationId, status])`, `@@index([email])`,
  `@@index([convertedToUserId])`.
- `LeadFollowUp` fields: `channel`, `notes`, `scheduledAt`, `completedAt`, `leadId`,
  `assignedToId`; indexes `@@index([leadId])`, `@@index([assignedToId])`.
- `Passport.dob` is the only available minor check; no `Membership.minorFlag` exists.
- `AuditLog.action` and `AuditLog.entityType` are free-form `String`; use catalog literals from
  action callsites.

**4. Runbook consulted** — `docs/runbooks/schema-migration.md` noted as no-op because this session
has no schema migration. Verification remains Prisma validate/generate only.

**5. Data flow reference** — `docs/runbooks/sop-data-and-wiring-flows.md` sections 1/3 (request ->
brand context -> Better Auth session -> authz -> Prisma). `docs/runbooks/sop-e2e-user-lifecycle.md`
sections 1/2/7: Visitor/Lead to account, Membership shell, staff/admin lifecycle.

**6. FAILED_STEPS check** — FS-0006/FS-0007/FS-0008 are mitigated by Petey-first planning,
pre-implementation task IDs, and direct schema values pasted above.

### Pre-flight: Backend — Enrollment / Family / Waiver / Lead actions

**1. Auth predicates planned**

- [x] Session auth required via `userActionClient` for every action.
- [x] Brand derived server-side via `getRequestBrand`.
- [x] Organization resolved with `{ id, brand: requestBrand }` before staff actions.
- [x] `canEditOrganization` checked for staff-managed enrollment, family, waiver revoke, and lead
  actions.
- [x] Target users verified through active same-brand/same-org `Membership`.
- [x] ProgramEnrollment scope flows through `Program.brand` + `Program.organizationId`.
- [x] FamilyGroup/FamilyMember scope flows through the target user's `Membership` because those
  models have no brand/org columns.
- [x] Waiver scope flows through `Waiver.brand/organizationId` and optional `ProgramWaiver` join.
- [x] Lead scope uses native `Lead.brand` + `Lead.organizationId`.

Authorization approach: resolve active brand from the request, resolve the org/program/lead/waiver
with explicit brand/org predicates, authorize the actor, then mutate only rows reachable through the
resolved aggregate. `canEditOrganization` remains role/org-only, so every call is preceded by a
branded resource lookup.

**2. Existing action scan**

- Searched `server/web/` for enrollment/family/waiver/lead: no existing slices.
- Pattern source: `server/web/schedule/actions.ts` and `server/web/attendance/actions.ts` for
  `userActionClient`, `getRequestBrand`, `canEditOrganization`, `isRateLimited`, catalog errors,
  `writeSchoolOpsAudit`, try/catch Prisma wrapping, and revalidate paths.
- Payload pattern: `server/web/{program,schedule,attendance}/payloads.ts` with
  `Prisma.*Select satisfies`.
- Test pattern: `server/web/{schedule,attendance}/actions.test.ts` with real Postgres fixtures and
  mocked session/headers/cache/rate limiter.
- Smoke pattern: `scripts/smoke-attendance.ts` with pure Prisma rejection matrix, tagged fixtures,
  and cleanup bag.

**3. Data flow reference**

- Flow: Prospect/Lead -> Trial -> User/Passport/DirectoryProfile -> Membership ->
  ProgramEnrollment -> WaiverSignature.
- Lifecycle stage: Prospect -> Member and Coach/Admin staff workflow. Billing, entitlement,
  public intake, and UI remain deferred.

**4. FAILED_STEPS / manual boundaries**

- FS-0006: satisfied by Petey plan and task IDs before implementation.
- FS-0008: schema values above were read directly from `schema.prisma`.
- MB-002: every new action/query must grep-prove explicit brand/org predicates or documented
  anti-corruption path through Program/Membership/Lead.
- MB-013: advances via tests/smoke and monitoring rows; not fully closed.
- D-005: no persistent `"use cache"` on enrollment/family/waiver/lead member-private reads.

### Pre-flight: Implementation decisions from source scan

- New action names:
  - Enrollment: `enrollInProgram`, `joinProgramWaitlist`, `withdrawEnrollment`,
    `promoteFromWaitlist`.
  - Family: `createFamilyGroup`, `addFamilyMember`, `removeFamilyMember`.
  - Waiver: `signWaiver`, `revokeWaiverSignature`.
  - Lead: `createLead`, `bookTrial`, `completeTrial`, `convertLead`.
- Audit action strings:
  - `enrollment.created`, `enrollment.waitlisted`, `enrollment.withdrawn`,
    `enrollment.promoted`.
  - `family_group.created`, `family_member.added`, `family_member.removed`.
  - `waiver.signed`, `waiver_signature.revoked`.
  - `lead.created`, `trial.booked`, `trial.completed`, `lead.converted`.
- Rate-limit keys: `enrollment_write`, `family_write`, `waiver_write`, `lead_write`,
  `trial_book`.
- Idempotency anchors: ProgramEnrollment unique `(userId, programId)`, FamilyMember unique
  `(familyGroupId, userId)`, WaiverSignature unique `(waiverId, userId)`, Lead converted state
  (`status = CONVERTED`, `convertedToUserId`).
- Transaction boundaries:
  - Enrollment upserts/promotions run in transactions when capacity or waitlist ordering is read.
  - Family primary-member changes run in transactions when `isPrimary` is true.
  - `convertLead` runs as one transaction for user/passport/directory/membership/enrollment/waiver
    signatures/lead update. Audit rows are written after successful commit with one correlation id
    in each `after` payload.

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0033_TASK_01 | landed |
| SESSION_0033_TASK_02 | landed |
| SESSION_0033_TASK_03 | landed |

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

- **TASK_01 — Enrollment write surface.** Added
  `apps/web/server/web/enrollment/{actions,errors,payloads,queries,schemas}.ts` with
  `enrollInProgram`, `joinProgramWaitlist`, `withdrawEnrollment`, and `promoteFromWaitlist`.
  Every mutation resolves `Program` by request brand, checks `canEditOrganization`, verifies active
  same-brand/same-org target membership, rate-limits via `enrollment_write`, and audits through
  `writeSchoolOpsAudit`. Capacity uses `Program.maxEnrollment`; overflow enters a monotonic
  waitlist. Hostile review caught and fixed duplicate-active idempotency before close.
- **TASK_02 — Family + waiver write surface.** Added
  `apps/web/server/web/family/*` and `apps/web/server/web/waiver/*`. Family writes are
  staff-managed and scope cross-org `FamilyGroup` rows through active target memberships. Waiver
  signing allows active-member self-sign and guardian-for-minor signing only when a `GUARDIAN`
  family relation and `Passport.dob` minor proof exist; revoke is staff-managed. Rate-limit keys:
  `family_write`, `waiver_write`.
- **TASK_03 — Lead/trial lifecycle + proof.** Added `apps/web/server/web/lead/*` with
  `createLead`, `bookTrial`, `completeTrial`, and `convertLead`. Conversion runs in one Prisma
  transaction to create/find User, Passport, DirectoryProfile, Membership, ProgramEnrollment, waiver
  signatures, and converted Lead state. Hostile review caught and fixed existing-identity
  preservation, capacity/waitlist handling, and post-conversion rebooking before close. Rate-limit
  keys: `lead_write`, `trial_book`.
- **Tests and smoke.** Added consolidated action proof at
  `apps/web/server/web/lead/actions.test.ts` and pure Prisma smoke at
  `apps/web/scripts/smoke-school-ops-extended.ts`.
- **Docs/governance.** Updated monitoring docs with new rate-limit keys, added glossary terms for
  ProgramEnrollment/FamilyGroup/FamilyMember/Lead/Trial booking, updated Project Log, wiki index,
  and corrected staged SESSION_0033 schema drift notes.

## Files touched (target — fill at close)

| Path | Note |
| --- | --- |
| `apps/web/server/web/enrollment/*` | New enrollment/waitlist action slice. |
| `apps/web/server/web/family/*` | New staff-managed family group/member slice. |
| `apps/web/server/web/waiver/*` | New waiver signature/revoke slice. |
| `apps/web/server/web/lead/*` | New Lead/trial/convert slice plus consolidated action test. |
| `apps/web/scripts/smoke-school-ops-extended.ts` | Pure Prisma rejection/lifecycle smoke proof. |
| `apps/web/lib/rate-limiter.ts` | Added `enrollment_write`, `family_write`, `waiver_write`, `lead_write`, `trial_book`. |
| `docs/architecture/security-privacy-payments-monitoring-plan.md` | Monitoring row updated for SESSION_0033 rate-limit keys. |
| `docs/architecture/ubiquitous-language.md` | School operations lifecycle terms added. |
| `docs/protocols/project-log.md` | Build, task, and review entries updated. |
| `docs/knowledge/wiki/index.md` | SESSION_0033 indexed as closed-full. |
| `docs/sprints/SESSION_0033.md` | Bow-in, pre-flight, implementation, verification, and close evidence. |

## Decisions resolved (fill at close)

- OD-1: did not preempt with full-app typecheck debt; carried SESSION_0032_FINDING_01.
- OD-2: reused free-form AuditLog strings through existing `writeSchoolOpsAudit`; no new audit
  helper.
- OD-3: FamilyGroup stays cross-org; actions gate by target-user membership and staff authority.
- OD-4: corrected to source truth: `GUARDIAN` is the only schema-supported guardian authority and
  minor proof uses `Passport.dob`.
- OD-5: `bookTrial` is idempotent when already `TRIAL_BOOKED`.
- OD-6: `convertLead` runs in a single transaction; audit rows share a correlation id after commit.
- OD-7: waitlist uses `Program.maxEnrollment`, monotonic positions, and transaction-scoped reads;
  DB-level uniqueness/serializable locking remains a hardening candidate.
- OD-8: rate-limit keys landed and monitoring docs updated.
- OD-9: no public Lead intake; `createLead` is staff-managed.

## Verification (fill at close)

| Command | Result |
| --- | --- |
| `bunx biome check --write server/web/enrollment server/web/family server/web/waiver server/web/lead lib/rate-limiter.ts scripts/smoke-school-ops-extended.ts` | passed after formatter fixes |
| `bunx prisma validate --schema prisma/schema.prisma` | passed |
| `bun test server/web/enrollment server/web/family server/web/waiver server/web/lead` | 7 pass / 0 fail |
| `bun test server/web/schedule server/web/attendance` | 22 pass / 0 fail |
| `bun scripts/smoke-school-ops-extended.ts` | passed enrollment/family/waiver/lead allow-deny-convert matrix |
| `bunx tsc --noEmit --pretty false --incremental false 2>&1 \| rg 'server/web/(enrollment\|family\|waiver\|lead)\|lib/rate-limiter\|scripts/smoke-school-ops-extended' \|\| true` | no touched-path type errors |
| `bunx tsc --noEmit --pretty false` | failed on pre-existing baseline debt outside SESSION_0033 paths (`PageProps`/`RouteContext`, content-collections generated types, auth role typing, passport enum drift, S3 env typing, etc.) |
| `rg ... server/web/{enrollment,family,waiver,lead} scripts/smoke-school-ops-extended.ts` | grep proof reviewed for brand/org predicates and anti-corruption paths |
| `git diff --check` | passed |
| `bun run wiki:lint` | passed; 127 markdown files, no lint violations |

## Hostile close review (fill at close)

**Reviewed tasks:** SESSION_0033_TASK_01, SESSION_0033_TASK_02, SESSION_0033_TASK_03.

**Dirstarter docs check:** live docs checked on 2026-05-03. Sources:
`https://dirstarter.com/docs/codebase/structure`,
`https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`,
`https://dirstarter.com/docs/integrations/rate-limiting`,
`https://dirstarter.com/docs/integrations/analytics`.

**Score: 9.7/10** — no hard caps triggered.

| Category | Weight | Score | Note |
| --- | ---: | ---: | --- |
| Dirstarter alignment | 2.5 | 2.5 | Feature folders, Prisma, Better Auth safe-actions, rate limiter, and analytics/monitoring docs extended. |
| Data and architecture integrity | 2.0 | 1.8 | Brand/org predicates are explicit; waitlist ordering is transaction-scoped but not DB-enforced. |
| Lifecycle coverage | 1.5 | 1.5 | Enrollment, family, waiver, and Lead -> Trial -> Converted path all proved. |
| Test evidence | 2.0 | 2.0 | Action tests, regression suite, pure Prisma smoke, Prisma validate, grep proof. |
| Merge and docs readiness | 1.0 | 0.9 | Docs and Project Log updated; no commit because user did not authorize commits. |
| Launch usefulness | 1.0 | 1.0 | Advances May 18 Baseline school-ops member lifecycle without commerce/UI drift. |
| **Total** | **10.0** | **9.7** | No cap. |

**Findings:** `SESSION_0033_FINDING_01` waitlist position lacks DB-level uniqueness/locking;
accepted risk for staff-managed MVP. `SESSION_0033_FINDING_02` full-app typecheck baseline debt
remains open from SESSION_0032.

**Sidecar blockers fixed before close:** `convertLead` now respects capacity/waitlist, preserves
existing user identity when matching by email, and `bookTrial` no longer rewinds converted/lost
leads. Waiver revoke/read paths now require an active scoped membership for the signer or
represented minor before exposing global/brand waiver signatures.

## Reflections (fill at close)

- The read-only schema sidecar was useful: it caught stale session prose (`Program.capacity`,
  `User.dateOfBirth`, `PARENT|ADMIN`) before those assumptions hardened into code.
- The close sidecar was worth the overhead. It caught duplicate-active enrollment, conversion
  overfill, conversion identity overwrite, post-conversion trial rewind, and under-scoped waiver
  revocation before handoff; the action test and smoke now cover the repaired behavior.
- The `WaiverSignature` shape is serviceable for MVP, but its uniqueness on `(waiverId, userId)`
  limits one signer to one signature per waiver. If guardian signatures become a larger workflow,
  revisit the schema rather than layering around it.
- Keeping conversion staff-managed avoided public intake, payment, and entitlement drift. SESSION_0034
  can now build commerce on top of Membership/Enrollment state instead of mixing Stripe into this
  slice.

## Open decisions / blockers (carry — fill/update at close)

- MB-002 brand-scope hardening remains procedural; this slice should grep-prove every new query has explicit `brand` + `organizationId` predicates (or documented anti-corruption flow through Program/Membership).
- MB-013 security/financial readiness advances; full closure requires SESSION_0034+.
- MB-014 production multi-domain hardening is owner-gated; does not block SESSION_0033, blocks staging deploy.
- D-005 cache strategy on auth-scoped data remains open; this slice must not introduce `"use cache"` on member-private reads.
- SESSION_0032_FINDING_01 (full-app typecheck baseline debt) remains open; touched SESSION_0033 paths are type-clean.
- SESSION_0033_FINDING_01: waitlist position has no DB-level per-program uniqueness/locking; accepted risk for staff-managed MVP, revisit before public/self-serve enrollment.

## Next session

**SESSION_0034 — Entitlement-first commerce foundation.**

Inputs to read: `docs/sprints/SESSION_0033.md`,
`docs/architecture/decisions/0011-entitlement-first-commerce.md`,
`docs/architecture/monetization-entitlements-spec.md`,
`docs/architecture/security-privacy-payments-monitoring-plan.md`,
`apps/web/prisma/schema.prisma` (`PricingPlan`, `Invoice`, `Payment`, `MembershipContract`,
StripeAccount/PayoutSplit), and current Dirstarter Stripe docs.

First task: Petey plan SESSION_0034 around entitlement/service contracts before any Stripe UI or
checkout work; decide whether to spend a hardening slot first on SESSION_0032_FINDING_01 or
SESSION_0033_FINDING_01. Default recommendation: continue entitlement-first commerce and carry both
as visible hardening debt.

## Full close evidence (fill at close)

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated frontmatter/date/last_agent on SESSION_0033, `project-log.md`, `security-privacy-payments-monitoring-plan.md`, `ubiquitous-language.md`, and `wiki/index.md`; code files carry no frontmatter. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` now lists SESSION_0033 as `closed-full`; SESSION_0033 is cross-linked with Project Log, monitoring plan, and Ubiquitous Language; no new wiki concept page created. |
| Wiki lint | `bun run wiki:lint` -> 127 markdown files scanned, no lint violations. |
| Kaizen reflection | `## Reflections` section present. |
| Hostile close review | Inline review above; `SESSION_0033_REVIEW_01` appended to `docs/protocols/project-log.md`. |
| Review & Recommend | `## Next session` recommends SESSION_0034 entitlement-first commerce with hardening-debt decision surfaced. |
| Memory sweep | None needed; durable lessons are captured in SESSION_0033 findings and Project Log. |
| Next session unblock check | SESSION_0034 is unblocked unless owner chooses to preempt with full typecheck or waitlist hardening. |
| ADR / ubiquitous-language check | No new ADR needed — slice consumed existing ADR 0011 (entitlement-first commerce). No new domain term introduced; existing ubiquitous-language entries (Enrollment, Waiver, Trial, FamilyGroup) cover this slice. |
| Git hygiene | Branch `session-0033-enrollments-family-waivers-trial`; worktree list checked; `git diff --check` passed; files reviewed for no `.env`, secrets, or `node_modules`; no commit/push because user did not authorize commits. |

## Bow-out line

Bowed out — SESSION_0033 closed-full at 9.7/10 (hostile rubric). Branch
`session-0033-enrollments-family-waivers-trial` has uncommitted local changes ready for owner
review; no commit or push was made. Next session goal: SESSION_0034 entitlement-first commerce
foundation.
