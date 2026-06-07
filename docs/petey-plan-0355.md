---
title: "Petey Plan 0355 — Claim teaser, generic claim model, owner live-preview, reason-differentiated gating"
slug: petey-plan-0355
type: plan
status: active
created: 2026-06-06
updated: 2026-06-06
last_agent: claude-session-0354
pairs_with:
  - docs/sprints/SESSION_0354.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0355 — Claim teaser, generic claim model, owner live-preview, reason-differentiated gating

## Summary

The directory "card 404 / won't link through" reports are, on inspection, the **gate family** (the
same family as SESSION_0353 Bug B/C): a clicked card whose target is gated renders a raw `notFound()`
instead of something graceful. The fix the operator wants is a Facebook-group-creation-style **mock
profile teaser** for un-ownable/unclaimed targets, a **tier upsell preview** for tier-gated ones, and
a **live preview** inside the create/edit forms — backed by a **generic member/org claim model + admin
queue** mirroring the existing `LineageClaimRequest` flow.

This was split out of SESSION_0354 (which landed WL-P1-7 + WL-P2-10 + the org link-through fix) because
it (a) needs one product decision that must be grilled, not invented, and (b) ships a **Prisma migration
that auto-deploys to live prod** (`prebuild: db:migrate deploy`) — which warrants browser verification,
ideally an attended session.

## Locked decisions (operator grill, SESSION_0354 bow-in)

1. **Scope** — build all of it: claim model + admin queue + public teaser + owner live-preview.
2. **Gate behavior** — differentiate by reason: unclaimed/un-ownable → claim teaser; tier-gated (FREE)
   → upgrade/upsell preview; **HIDDEN/private → keep `notFound()`** (never reveal a private profile exists).
3. **Preview** — build BOTH the public claim teaser AND the owner live-preview in the create/edit form.
4. **Claim CTA** — mirror the existing `/lineage/[treeSlug]/claim` lineage-claim pattern (a claim request
   an admin approves), not just routing to existing create flows.
5. **Migration** — operator-approved; additive/backward-compatible only.
6. **Push** — to main on green gates (prod deploy proceeds); flag operator browser smoke as pending.

## OPEN DECISION — grill before building TASK_01 (do not invent)

**What is the "subject" of a member/person claim?** Every `DirectoryProfile` already has a `User` owner,
so a person profile is not "unclaimed" the way an org or a lineage node is. Options to grill:

- (a) **Orgs + legacy-only:** claims apply to Organizations with no owner/admin and to legacy-imported
  person placeholders (a User with no credential/login). Person teaser only shows for those placeholders;
  normal people never show a claim teaser (their card always resolves).
- (b) **Orgs only:** drop person claims entirely; people get tier-upsell or resolve normally; only orgs
  are claimable. Smallest, cleanest.
- (c) **Polymorphic person+org:** a person can be "claimed" from another account (e.g., a coach claims a
  student-created placeholder) — needs an ownership-transfer policy and abuse controls.

Recommendation: **(a)** — matches the real data shape (placeholders/legacy + owner-less orgs) without
inventing an ownership-transfer flow. Confirm before schema.

## Tasks

### SESSION_0355_TASK_01 — Generic claim model + migration

- Mirror `LineageClaimRequest`/`LineageClaimEvidence`. Reuse `LineageClaimStatus`. Add
  `ProfileClaimRequest { subjectType, relationship, brand, directoryProfileId?/organizationId?,
  claimantUserId, reviewedById?, claimantNote?, reviewerNote?, reviewedAt?, timestamps }` + indexes.
  Additive migration only; app logic enforces exactly-one subject per `subjectType`.
- Done: `prisma migrate` applies locally; typecheck green.

### SESSION_0355_TASK_02 — Claim submit action + schema

- `submitProfileClaimRequest` next-safe-action + zod schema (subjectType, subjectId, relationship,
  claimantNote). Mirror `server/web/lineage/claim-actions.ts`. Reject if a PENDING claim already exists.

### SESSION_0355_TASK_03 — Admin claims queue

- `/admin/claims` list + `/admin/claims/[id]` review (approve/deny/needs-info), mirroring
  `app/admin/lineage/claims/**` and `server/admin/lineage/claim-review-actions.ts`. Approval grants
  ownership/admin per the locked subject semantics.

### SESSION_0355_TASK_04 — Shared profile hero + public claim teaser

- Extract a `ProfileHero` presentation component (avatar/name/belt/discipline/location skeleton) from
  already-public/projected fields ONLY (no new data fetch → no HIDDEN leak). Build `/directory/[slug]`
  (and org/school) teaser state: hero + skeleton sections + "Claim this profile" CTA → TASK_02.

### SESSION_0355_TASK_05 — Reason-differentiated gating wiring

- In `findProfileBySlug` + the detail pages, return a discriminated gate reason
  (`{ gate: "ok" | "teaser" | "upsell" | "hidden" }`): un-ownable/unclaimed → teaser (TASK_04);
  tier-gated → enhance the existing `canRenderFullProfile=false` preview into an upsell; HIDDEN → 404.
  Also gate the lineage node **Edit** link so it only renders for users `getEditableLineageNodeProfile`
  would accept (avoids the edit-link → 404 the operator hit).

### SESSION_0355_TASK_06 — Owner live-preview in forms

- Reuse `ProfileHero` inside `dashboard/profile-form` (people) and `dashboard/school-form` (orgs):
  the hero mirrors form state live as the owner types (reduced-motion safe).

### SESSION_0355_TASK_07 — Tests + verify + close

- Pure tests: claim schema/dedup; gate-reason resolver (teaser/upsell/hidden); `ProfileHero` SSR shows
  given fields, leaks none. Operator browser smoke flagged (unattended can't run it). Doug verify; close.

## Risks / guards

- Teaser must read only already-public/projected fields (HIDDEN leak). HIDDEN always 404s.
- Migration auto-applies on prod build — additive only; review the diff before merge (repo norm: schema = human review).
- Claim approval changes ownership — needs the locked subject semantics + abuse guard (one PENDING per subject/claimant).

## Cross-references

- [SESSION_0354](sprints/SESSION_0354.md) — landed WL-P1-7 + WL-P2-10 + org link-through fix.
- [Wiring ledger](knowledge/wiki/wiring-ledger.md) — WL-P1-7, WL-P2-10.
- Existing pattern: `server/web/lineage/claim-actions.ts`, `app/admin/lineage/claims/**`.
