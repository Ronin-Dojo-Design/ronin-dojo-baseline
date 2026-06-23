---
title: "ADR 0036 — Unified Passport-keyed person claim"
slug: adr-0036-unified-passport-claim
type: adr
status: accepted
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0438
pairs_with:
  - apps/web/prisma/schema.prisma
  - docs/architecture/decisions/0023-generic-profile-claim.md
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0032-social-signin-pending-claim.md
  - docs/petey-plan-0436-claim-unification.md
  - docs/sprints/SESSION_0436.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0036 — Unified Passport-keyed person claim

## Status

Accepted (SESSION_0436); **implemented through P5 (SESSION_0438)**. P0–P4 landed SESSION_0437
(schema + `submitPassportClaim` core + `finalizePassportClaim` + email auto-approve + prodsnap
backfill). **P5 (SESSION_0438)** retired the last `LineageClaimRequest` writer (the "Join the Legacy"
lead path → `submitPassportClaim`) and repointed the admin + manager person-claim queues to
`PassportClaimRequest` / `reviewPassportClaim`; `/admin/claims` is now organization-only.
`applyLineageClaimReview` + the `LineageClaimRequest` table are retained for legacy stragglers until a
post-cutover migration drops them. Remaining gated steps: prod backfill + Brian Truelson's real claim
invite. Build phased per [petey-plan-0436-claim-unification](../../petey-plan-0436-claim-unification.md).

## Context

A single human could be claimed through three independent mechanisms that wrote three
different records:

1. **Lineage claim** (`LineageClaimRequest`) — request → admin review →
   `finalizeLineageNodeClaim`, the fully-built path that attaches the claimant account to the
   node's Passport, grants `LineageTreeAccess`, and comps the cohort tier. Real prod history
   exists here (Tony Hua, APPROVED).
2. **Profile claim** (`ProfileClaimRequest`, ADR 0023) — the directory/profile door. The
   ORGANIZATION branch is real (sets `ownerId`); the **PERSON branch is a flagged stub**
   ("manual merge", `personMergePending`) — approval records a decision but performs no
   identity attach.
3. **Email auto-approve** (`claimNodeForUser` + `LineagePendingClaim` + the `lib/auth.ts`
   reconcile hook, ADR 0032) — an emailed magic link binds `email → node`; any successful
   sign-in (magic-link OR Google) auto-approves via the same `finalizeLineageNodeClaim`.

ADR 0025 established the **Passport as the identity source of truth**. Both person doors
already resolve to a Passport: `LineageNode.passportId` and `DirectoryProfile.passportId` are
each `@unique NOT NULL`, and "claimed" means `Passport.userId != null`. Yet the claim *record*
was keyed on the door (node vs directory-profile-or-org), so the same person could carry two
open claims that neither guard nor finalize could see as one, the directory door dead-ended in
a stub, and a SESSION_0436 interim guard had to be hand-patched onto the lineage door to catch
an already-claimed Passport. With the first real founder claim emails about to send, we need
one identity-keyed claim before more history accrues across two tables.

## Decision

1. **Introduce `PassportClaimRequest`, keyed on `passportId`, as the single person-claim
   record.** It carries optional door context (`nodeId`, `treeId`, `directoryProfileId`),
   `relationship`, `bypassReason`, and `claimedRankId`; it reuses the `LineageClaimStatus`
   enum. Both doors resolve their subject to a Passport and write this one record, so the
   duplicate guard, review queue, and finalize all key on **identity, not door**.

2. **Both entry doors become thin adapters over one core** (`submitPassportClaim`).
   `submitLineageClaimRequest` keeps tree/node validation then resolves `node.passportId`;
   `submitProfileClaimRequest`'s PERSON branch resolves `directoryProfile.passportId` (and
   back-fills node/tree context when the Passport owns a lineage node). The single claimable
   check (`passport.userId == null`) subsumes the SESSION_0436 inline guard.

3. **One finalize, one review queue.** `finalizeLineageNodeClaim` generalizes to
   `finalizePassportClaim`: it ALWAYS attaches account → Passport + grants the entitlement, and
   runs the tree-member / NODE_EDITOR / cohort-comp / RankAward branches only when node context
   is present. This **un-stubs the person-profile approval** (a directory-only person now gets a
   real identity attach) and lets one admin queue review every person claim. On finalize it
   auto-cancels every other claimant's open claim on that Passport (Gap 2).

4. **Email auto-approve targets the unified record.** `claimNodeForUser` keeps its node
   re-validation security boundary and `email-token` auto-approve semantics but mints a
   `PassportClaimRequest` and calls `finalizePassportClaim`. The reconcile hook and token route
   are unchanged above the core, preserving social-sign-in parity (ADR 0032).

5. **Organization claims stay a separate sibling.** An owner-less `Organization` is not a
   Passport (no identity shell, no account attach); it remains in `ProfileClaimRequest` with the
   `ownerId`-granting approval. The only shared surface is a read-only admin-queue view model;
   there is no shared write path or FK.

## Consequences

- One identity-keyed table replaces the person split across `LineageClaimRequest` and person
  `ProfileClaimRequest`. Org `ProfileClaimRequest` rows are retained and untouched.
- The directory-door person claim is no longer a stub; approving it performs the real
  account→Passport merge that only the lineage path did before.
- A claimant can no longer hold two open claims on one person via two doors; a won Passport
  auto-cancels all other open claims.
- Migration is additive (CREATE TABLE/INDEX/FK) then an idempotent, brand-scoped backfill
  script from both legacy tables, preserving APPROVED history (Tony Hua). The legacy
  `LineageClaimRequest` table is retired only after read/write surfaces cut over; org
  `ProfileClaimRequest` stays. Additive schema is safe for the `prebuild: db:migrate deploy`
  auto-apply (ADR 0017); the backfill runs in the supervised data lane, not the fleet.
- Rollout is phased and gated: the unify (core + finalize + email path + migration) must land
  and be verified BEFORE the first real founder claim email (Brian Truelson) is sent.

## Alternatives considered

- **Extend `LineageClaimRequest` to be Passport-keyed.** Rejected — it is welded to NOT-NULL
  tree/node FKs, evidence, and cohort-comp semantics; a directory-only person (Passport with no
  LineageNode) cannot pass through its tree-member-required finalize without contortion.
- **Generalize `ProfileClaimRequest`.** Rejected — it is the least-built path (PERSON approval
  is a stub), it is polymorphic over the orgs we are deliberately keeping separate, and it lacks
  the proven finalize machinery the lineage path already runs in prod.
- **Fold organization claims into the unified record.** Rejected — an owner-less Organization is
  not a Passport; its approval sets `ownerId`, a different side-effect with no identity attach.
- **Leave three systems and keep patching guards (status quo).** Rejected — the SESSION_0436
  hand-patch and the cross-table invisibility of double claims show the split is the defect; an
  identity key removes the class of bug.
