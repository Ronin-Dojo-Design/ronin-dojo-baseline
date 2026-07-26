---
title: "Petey Plan 0554 — FI-003 student signup + claim-approval funnel"
slug: petey-plan-0554-claim-funnel
type: petey-plan
status: active
created: 2026-07-17
updated: 2026-07-17
last_agent: codex-session-0554
pairs_with:
  - docs/sprints/SESSION_0554.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/runbooks/domain-features/directory-org-profile-hub.md
  - docs/runbooks/domain-features/lineage-hub.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - petey-plan
  - claim
  - signup
  - lineage
  - bbl
---

# Petey Plan 0554 — FI-003 student signup + claim-approval funnel

## Plan Lock

This is a **plan-first** lane. It deliberately writes no production code, schema, migrations, or
app tests. The future build must start only after the operator answers the grill forks below.

The coherent claim-domain slice bundles:

- **FI-003:** student sign-up under an instructor/school + claim-approval flow.
- **FI-017:** claim-finalize surviving-profile normalization on cross-passport approve.
- **WL-P2-13:** "Claim this org/school" CTA coverage on `/directory`, `/organizations`, `/schools`.
- **WL-P2-39:** consolidate the claimable-BBL-node predicate into one named predicate.

Sequence after the active **SESSION_0541 belt lane** merges. It shares trust-model files and claim-review
authority surfaces; rebase this build over 0541, not the reverse.

## Source Truth

Read path used for this plan:

- BBL SoT set: `BBL-SOT-Spec.md`, `SOT-ADR.md`, `PRD.md`, `STORIES.md`.
- Claim canon: ADR 0036, ADR 0025, directory-org-profile hub, lineage hub, `petey-plan-0419`.
- Current-code spot checks: `lib/auth.ts`, `submit-passport-claim.ts`, `passport-claim-review-actions.ts`,
  `claim-finalize.ts`, `place-lead-core.ts`, `public-actions.ts`, `mint-claim-magic-link.ts`,
  `claimable-nodes.ts`, `OrgClaimCta`.

Graphify returned zero nodes in this fresh worktree, so it was treated as unavailable navigation, not
negative evidence.

## Current State Map

### Registration Path Exists

The current FI-003-adjacent path from SESSION_0508 already does the first half:

1. `/lineage/join` captures `trainedUnderNodeId`, `schoolOrgId`, `currentRankId`, country, evidence,
   and membership path.
2. `createJoinLegacyInterest` writes a `Lead`.
3. `autoPlaceSignupOnLineage` / `placeLeadIntoLineage` places the signup under the registered instructor
   on the canonical `rigan-machado-lineage` tree when possible.
4. That placement creates or reuses the student's own Passport, creates a LineageNode and tree member,
   writes an `INSTRUCTOR_STUDENT` edge, mints the declared rank as `UNVERIFIED`, and forces
   `LineageTreeMember.isClaimable = false`.

This is correct and must not be redefined as claim. **Register ≠ Claim**. A signup creates the student's
own account-bound identity when the account exists, or a temporary accountless signup Passport that
attaches on sign-in. It does not claim the instructor, and it does not claim a roster placeholder unless
the user explicitly selected an existing claimable node.

### Claim Path Exists

Person claims are ADR-0036 unified `PassportClaimRequest` rows. Both lineage and directory doors resolve
to a Passport and submit through `submitPassportClaim`. Review flows through `reviewPassportClaim` /
`applyPassportClaimReview`; identity claims currently remain admin-only, while `RANK_PROMOTION` claims
can use resource-scoped `claim.review`.

Email claim CTAs use durable `/auth/login` links. The identity binding is server-side:
`bindPendingClaim(email, nodeId)` writes `LineagePendingClaim`, and `lib/auth.ts` reconciles on every
successful sign-in through `reconcilePendingLineageClaims` -> `claimNodeForUser`. Do not reintroduce
one-shot magic-token claim CTAs.

### Approval Already Writes Some FI-003 Data

`finalizePassportClaim` already materializes:

- `claimedSchoolId` -> Passport-keyed `Affiliation(role=TRAINS_AT)`.
- `trainedUnderNodeId` -> verified `INSTRUCTOR_STUDENT` edge.
- `representTreeId` -> tree membership.
- visual placement under the instructor member.
- `claimedRankId` -> verified `RankAward`.

This matches the constraint that a BBL member's school comes from **Affiliation, NOT Membership**.
Membership is still Baseline enrollment and has an `@@unique([userId, organizationId, disciplineId])`
re-join gotcha; it should not be used as the BBL school source.

### Open Gap

FI-017 is real: on cross-passport approval, `finalizePassportClaim` deletes the claimant's signup
Passport before attaching the account to the claimed Passport. The deleted signup Passport's
DirectoryProfile cascades, so profile fields such as `locationCountry` can be lost. The surviving
placeholder profile may remain `HIDDEN` and slug-less. The future build must normalize the survivor:
visibility -> `MEMBERS_ONLY`, mint a slug when absent, and carry profile fields from the deleted signup
profile when the survivor lacks them.

### Stale Ledger Risk

WL-P2-13 is partially stale against code: `OrgClaimCta` is already mounted on organization and school
detail pages. The future build should verify the three named surfaces, add only missing coverage, then
update the ledger. Do not rebuild already-shipped CTAs by assumption.

## Operator Grill

### 1. Registration vs. Claim Semantics

Fork A: A student joining under an instructor always creates or reuses the student's own Passport and
LineageNode, is placed under the instructor, starts unverified, and is **not claimable**.

Fork B: If the student selects an existing roster placeholder that appears to be them, the flow creates a
`PassportClaimRequest` against that placeholder instead of creating a new node.

Fork C: The UI offers both choices only after a dedup/search step: "I am this existing profile" vs.
"Create my new profile under this instructor."

Operator decision needed: when a student joins under an instructor, what exact signal distinguishes "new
Passport" from "claim of a roster placeholder"?

### 2. Approval Authority

Fork A: Identity claims stay platform-admin only. Instructors can verify rank later, but cannot approve
identity attach.

Fork B: A branch instructor can approve identity claims for students under their branch via existing
resource-scoped `canForResource(..., "claim.review", resource)`.

Fork C: School owners can approve claims for people claiming an affiliation to their school, but only for
school/Affiliation materialization; identity attach remains admin-only.

Operator decision needed: who approves student identity claims: instructor, school owner, platform admin,
or a staged combination? If non-admins approve, is it `can()`/resource-grant keyed or raw role gated?
Default recommendation: extend existing `can()` + resource grants; never add a 5th authz system.

### 3. What Approve Writes

Fork A: Approval writes identity attach, `Affiliation(TRAINS_AT)`, `INSTRUCTOR_STUDENT`, tree membership,
visual parent, and claimed rank award exactly as today's `finalizePassportClaim` materializers do.

Fork B: Approval writes only identity attach + Affiliation; lineage placement remains steward/manual.

Fork C: Approval writes identity attach + lineage placement, but rank remains a separate
`RANK_PROMOTION` claim when above verified ceiling.

Operator decision needed: should identity-claim approval also verify the asserted rank, or should rank
verification always remain the rank-promotion queue?

### 4. Reject / Duplicate Claim Behavior

Fork A: Rejection keeps the denied `PassportClaimRequest` row as audit history and allows a new request
only after a fresh submit path handles duplicate policy.

Fork B: Rejection hard-deletes PENDING rows to avoid `@@unique`-style re-request collisions, matching the
org-reject pattern called out in the SOP.

Fork C: Rejection marks DENIED but a new submit supersedes the old claim through a dedicated status-aware
duplicate guard.

Operator decision needed: do person/student rejects preserve claim history, hard-delete, or supersede?
Also decide whether org-claim hard-delete remains org-only or becomes a shared claim policy.

### 5. Minor Students / Guardianship

Fork A: No minors in this slice; UI copy states adult/self-claim only.

Fork B: Minor signup allowed, but guardian email/account owns the claim and profile editing until handoff.

Fork C: Minor appears only as a roster placeholder under an instructor; guardian/parent claim is a later
household/guardian slice.

Operator decision needed: what age/guardian rule blocks or shapes student claims now?

### 6. Tier / Comp Implications

Fork A: Free signup remains free listing; no comp. Existing claim of a WP-import placeholder grants the
current claim comp rules.

Fork B: Instructor-approved students get a limited Premium trial.

Fork C: School/instructor approval grants no tier; paid upgrade remains Stripe only.

Operator decision needed: does student approval grant Premium/Elite, or only identity/placement?
Default recommendation: do not expand comp grants in the identity slice unless the operator explicitly
wants the funnel economics changed.

### 7. Notification Set

Fork A: Use only current lifecycle emails: signup/free, claim-approved, claim-rejected, admin notification.

Fork B: Add instructor/school-owner notification on student signup and claim decision.

Fork C: Add a new student-specific approval email, but only after FI-002 lifecycle-copy audit lands.

Operator decision needed: which lifecycle emails fire at submit, approve, reject, and auto-placement?
All copy must respect the FI-002 audit and use BBL sender/chrome. CTAs must link to durable `/auth/login`
or stable app routes, not one-shot magic-token URLs.

## Future Build Slice List

### Slice 1 — Claimability Predicate Consolidation (WL-P2-39)

**Goal:** one named source for "claimable BBL node" so picker, send guard, and pending-claim bind cannot
drift.

**Files likely touched:**

- `apps/web/server/admin/email/claimable-nodes.ts`
- `apps/web/server/admin/email/invite-actions.ts`
- `apps/web/server/web/lineage/mint-claim-magic-link.ts`
- new small predicate module near the claim/invite domain

**Build notes:**

- Extract the shared `LineageTreeMemberWhereInput` predicate:
  `isClaimable`, `node.passport.userId: null`, `tree.isPublished`, `tree.isClaimable`, and BBL brand
  where the caller specifically needs BBL.
- Keep brand derivation in `bindPendingClaim` when the primitive is intentionally brand-agnostic, but use
  the same base predicate.
- Add a unit/DB test that the three callers reject/accept the same node shapes.

**Done means:** all three current callers consume the named predicate; no behavior drift; tests prove claimed,
unpublished, non-claimable, and valid nodes.

### Slice 2 — CTA Coverage Verification + Minimal Fill (WL-P2-13)

**Goal:** verify claim CTAs on `/directory`, `/organizations`, and `/schools`; add only missing surfaces.

**Files likely touched:**

- `apps/web/app/(web)/directory/page.tsx`
- directory list/card components under `components/web/directory/*`
- existing `OrgClaimCta`
- organization/school detail files only if verification shows gaps
- `docs/knowledge/wiki/wiring-ledger.md` / `POST_LAUNCH_SOT.md` cross-off if resolved

**Build notes:**

- Start with browser verification because organization and school detail CTAs already exist.
- For directory list results, decide whether owner-less org cards need inline "Claim" buttons or a
  detail-page CTA is sufficient.
- Keep organization claims in `ProfileClaimRequest`; do not route orgs through `PassportClaimRequest`.

**Done means:** owner-less org/school has a visible claim path from each named public surface; signed-out CTA
returns via `/auth/login?next=...`; signed-in submit creates the correct org claim; ledger text updated to
match reality.

### Slice 3 — Registration / Claim Fork UX

**Goal:** make the join flow explicit about the difference between "create my student profile under this
instructor" and "claim this existing placeholder."

**Files likely touched:**

- `/lineage/join` wizard files
- `server/web/lead/public-actions.ts`
- `server/admin/lineage/place-lead-core.ts`
- claim-state helpers if existing placeholder search is promoted in the wizard

**Build notes:**

- Preserve current auto-placement for new signups.
- If an existing placeholder is selected, create/bind a `PassportClaimRequest` or durable pending claim
  depending on signed-in state; do not create a duplicate student node.
- If no placeholder is selected, registration creates the student's own identity and forces
  `isClaimable = false`.
- Image inputs stay uploaders; no new URL fields.

**Done means:** tests and browser proof show both paths produce distinct durable state: new signup
placement vs existing-placeholder claim.

### Slice 4 — Approval Authority + Decision Surface

**Goal:** implement the operator-approved authority model for student/person claim review.

**Files likely touched:**

- `passport-claim-review-actions.ts`
- resource permission helpers under `server/orpc/*`
- `/app/claims` and `/app/lineage/claims` review queries/surfaces as needed

**Build notes:**

- Extend one of the existing four authz systems. Preferred: `can()` + `canForResource()` with
  `claim.review`, matching rank-promotion review.
- Do not add role checks outside the existing gates.
- Keep self-review blocked.
- Identity attach has a larger blast radius than rank promotion; if non-admin approval is allowed, scope it
  tightly to the claimed node/tree/school and test negative cases.

**Done means:** selected reviewer class can approve/deny only claims in scope; out-of-scope instructor,
school owner, claimant self-review, and anonymous paths fail closed.

### Slice 5 — FI-017 Finalize Survivor Normalization

**Goal:** fix the cross-passport approval gap without bundling unrelated claim work.

**Files likely touched:**

- `server/admin/lineage/claim-finalize.ts`
- `claim-finalize.test.ts`
- slug helper if current generator needs extraction/reuse

**Build notes:**

- Before deleting the claimant signup Passport, read its DirectoryProfile carry fields.
- After attach, normalize the surviving claimed Passport's DirectoryProfile:
  `visibility = MEMBERS_ONLY` when currently `HIDDEN`, slug minted when absent, and `locationCountry`
  copied when survivor lacks it.
- Design helper as a small finalize subroutine with narrow tests. Claim core is the moat; this must be its
  own reviewed slice, not a rider inside another PR.

**Done means:** rolled-back transaction tests prove hidden/slugless survivor becomes directory-visible to
members, slug is minted, country is carried, existing survivor fields are not clobbered, and claimant with
existing node still fails as today.

### Slice 6 — Notifications + Lifecycle Copy

**Goal:** wire only the notification set ratified by the grill, after or alongside FI-002 audit results.

**Files likely touched:**

- `lib/notifications.ts`
- `emails/*`
- `claim-approved-email.ts` / `claim-rejected-email.ts`
- join flow notification dispatch

**Build notes:**

- CTAs use durable `/auth/login` or stable app URLs.
- No internal tier jargon.
- Preserve BBL brand sender and wrapper.
- If adding instructor/school-owner notifications, use recipient selection rules from the approved
  authority model; do not infer owners from Membership for BBL school identity.

**Done means:** email catalog snapshot/tests cover submit/approve/reject branches; rendered copy reviewed
against FI-002 constraints.

### Slice 7 — End-to-End Claim Funnel Verification

**Goal:** prove the full signed-out and signed-in funnel works in a prod-shaped local/e2e DB.

**Files likely touched:**

- Playwright spec(s) under `apps/web/e2e`
- test fixture factories only as needed

**Build notes:**

- Cover registration under instructor -> auto-place -> profile/school roster visibility.
- Cover placeholder claim submit -> approve -> account attach -> Affiliation -> node access -> email.
- Cover deny -> no attach/no access/no comp.
- Cover duplicate claim and reject/re-request behavior per grill decision.

**Done means:** local e2e evidence exists; FS-0031 evidence guard passes for any touched Playwright specs.

## Test Strategy

- **Unit/DB transaction tests:** preferred for claim-finalize, predicate parity, Affiliation materialization,
  duplicate/reject behavior, and authz resource gates. Use the existing rolled-back transaction pattern in
  `claim-finalize.test.ts`.
- **Action tests:** review gate negative cases, submit duplicate guards, org-claim submit.
- **Browser/e2e:** one registration path and one claim approval path through real UI. If e2e files are touched,
  run the affected Chromium spec with fresh evidence and `bun run e2e:evidence:check`.
- **Email verification:** render snapshots or dry-run output for every lifecycle email changed; no live send
  without operator go.
- **Regression gates:** typecheck, targeted tests, wiki-lint, and `next build` for app-code slices.

## Scope Guards

- **Register ≠ Claim.**
- Claims are email-bound and reconciled on every sign-in via `lib/auth.ts` -> `claimNodeForUser`.
- A BBL member's school comes from **Affiliation, NOT Membership**.
- Email CTAs are durable links (`/auth/login`), never one-shot magic tokens.
- The repo has four authz systems; extend the existing ones, never add a fifth.
- Image inputs are uploaders, never URL fields.
- FI-017-adjacent finalize changes get their own reviewed slice.
- FI-001 / Brian Truelson send remains parked and untouched.
- `../ronin-dojo-monorepo` remains read-only.

## Open Forks Not Resolved From The SoT Set

- Whether student identity claims can be approved by instructors/school owners or remain platform-admin only.
- Whether identity approval should verify the asserted rank or split above-ceiling rank into
  `RANK_PROMOTION`.
- Whether org-claim reject hard-delete semantics should apply to person/student claims.
- Whether minor students are blocked, guardian-owned, or deferred.
- Whether student approval grants any tier/comp or remains identity-only.
- Whether directory-list `/directory` needs inline org/school claim CTAs or detail-page CTAs satisfy the product.

## Recommended Next Session

After the operator answers the grill and SESSION_0541 is merged, start with **Slice 1** and **Slice 2** if
the operator wants a low-risk warm-up, or **Slice 5** if FI-017 is the priority. Do not combine Slice 5
with any other claim-core behavior change.
