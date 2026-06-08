---
title: "BBL — Gift/Comp Membership, RBAC Granting, and Tier-Gated Tree Visibility (Epic Spec)"
slug: bbl-gift-membership-and-tier-gating-epic
type: spec
status: draft
created: 2026-06-04
updated: 2026-06-04
last_agent: claude-session-0345
pairs_with:
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/architecture/decisions/0012-tier-auto-grant.md
  - docs/architecture/decisions/0019-membership-lifecycle-ownership.md
  - docs/sprints/SESSION_0345.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0345.md
tags:
  - bbl
  - blackbeltlegacy
  - entitlements
  - membership
  - rbac
  - tier-gating
  - epic
---

# BBL — Gift/Comp Membership, RBAC Granting, and Tier-Gated Tree Visibility (Epic Spec)

> **Status: draft spec, staged at SESSION_0345 bow-out for a future session.** No code in this epic was
> written in SESSION_0345 (which proved the paid checkout gate and fixed a returning-customer bug). This is
> the detailed plan the operator asked to stage as next-session work.

## Summary

Three coupled capabilities, all riding the **existing entitlement spine** (`Entitlement` ->
`EntitlementGrant`/grant -> `UserEntitlement`), not a new payment or membership model:

1. **Gift / comp memberships** — grant a `UserEntitlement` (premium/elite) to a real or placeholder user
   **without payment**, for a fixed term (e.g. free year) or lifetime (e.g. Dirty Dozen, invited black belts).
2. **RBAC granting** — who may comp whom: platform admin globally; school owners / instructors / tree editors
   within their own org/branch, within limits and with audit.
3. **Tier-gated tree visibility** — the BBL monetization rule carried over from the legacy site: **every
   student of any rank is listed free under their instructor; only premium black belts / instructors /
   school owners render the full "card" (photo, bio, links, attachments); premium + elite unlock more app
   features.**

These tie into **invites and claims** (operator note): a comp can be the carrot attached to an invite, and a
successfully approved claim can trigger a comp grant.

## Origin concept (legacy monorepo)

From `ronin-dojo-monorepo` `src/brands/blackbeltlegacy/BlackBeltLegacyLanding.jsx` (graphify, SESSION_0345):
`CelebrationInstructorCard`, `__data_featuredblackbelts`, `__components_lineagetreemvp`. The legacy BBL
landing already framed the tree as **featured black belts + rich instructor cards on top of a lineage-tree
MVP**. The product intent: the *full card* is a premium/instructor surface; the *listing under an instructor*
is free for every student. This epic ports that intent onto the Baseline entitlement spine instead of the
legacy hand-rolled data.

## What already exists (reuse, do not rebuild)

| Capability | Where | Note |
| --- | --- | --- |
| Entitlement definitions CRUD | `app/admin/entitlements/*`, `server/admin/entitlements/*` | Admin manages `Entitlement` rows (key/name/description). |
| Entitlement spine | `Entitlement`, `EntitlementGrant`, `UserEntitlement` | `UserEntitlement.sourceType` enum **already includes `MANUAL_GRANT`, `PROMO`, `MEMBERSHIP`** — no migration needed to comp access. |
| Paid grant path | `app/api/stripe/webhooks/route.ts::grantEntitlementsFromCheckout` | Upsert-by `(userId, entitlementId, sourceType, sourceId)`; the comp action should mirror this idempotency. |
| Subscription tiers admin | `app/admin/subscription-tiers/*` | Tier definitions live here; gift tiers should reuse the same tier vocabulary. |
| Memberships admin | `app/admin/memberships/*` | Community/admin membership state (NOT access — see ADR 0019). |
| Claim flow | `app/(web)/lineage/[treeSlug]/claim/*`, `server/web/lineage/claim-actions.ts` | Approved claim is the natural trigger point for a claim->comp grant. |
| Invite surface | `app/admin/invites/*` | Invite is the natural carrier for an invite->comp grant. |
| Lineage tree + cards | `lineage-node-card.tsx`, lineage tree canvas | The render surface that tier-gating will switch between "free listing" and "full card". |

## Domain model

No new aggregate. Comp/gift access is a `UserEntitlement` with:

- `sourceType = MANUAL_GRANT` (operator/RBAC comp) or `PROMO` (campaign/invite-code comp).
- `sourceId` = an audit pointer (e.g. `grant:<grantorUserId>:<reason-slug>` or an invite/claim id).
- `status = ACTIVE`; `endsAt = null` for lifetime, or `now + 1y` for a free-year term.
- The **tier** is expressed by *which* entitlement keys are granted (e.g. `lineage.premium`, `lineage.elite`),
  reusing the same entitlement keys the paid plans grant — so tier-gating reads one consistent signal
  regardless of whether access was paid or comped.

**Audit before mutation** (operator-memory rule, cf. membership reject hard-delete): every comp grant /
revoke writes an audit record first (grantor, grantee, entitlement, term, reason), then mutates
`UserEntitlement`. Lifetime grants and bulk grants (Dirty Dozen) must be auditable and reversible.

## RBAC matrix (proposed — confirm at epic bow-in)

| Grantor | May comp | Scope | Term cap |
| --- | --- | --- | --- |
| Platform admin | anyone | global | lifetime allowed |
| School owner | their org's members/students | own org | term-limited by default; lifetime needs admin co-sign |
| Instructor / tree editor (`TREE_ADMIN`/`BRANCH_EDITOR`) | members on their branch | own branch | term-limited; cannot self-grant elite |
| Node editor | none | — | — |

Reuse `LineageTreeAccess` roles (`TREE_ADMIN`, `BRANCH_EDITOR`, `NODE_EDITOR`) for tree-scoped grant
authority; reuse org membership/role for org-scoped grant authority. No self-elevation: a grantor cannot comp
themselves a higher tier than they hold (except platform admin).

## Tier-gating rules (the monetization carryover)

Read access tier from the user's active `UserEntitlement` keys (paid or comped — same signal):

| Tier | Listing under instructor | Full card (photo/bio/links/attachments) | Extra app features |
| --- | --- | --- | --- |
| Free (any rank student) | ✅ name + rank, free | ❌ minimal | ❌ |
| Premium (black belt / instructor / school owner) | ✅ | ✅ full card | ✅ subset |
| Elite | ✅ | ✅ full card | ✅ full |

Consumed at: lineage tree node card render (`lineage-node-card.tsx`), directory/member listings, and the
public profile page (BBL-PROFILE-001, still a gap). Gating must be a **read-model concern** (one helper that
maps user -> tier -> render policy), not scattered conditionals — mirror the avatar read-model pattern
([[passport-avatar-consumption-surfaces]]).

## Invite + claim tie-ins (operator note)

- **Invite -> comp:** an invite can carry a pending comp (tier + term). Accepting the invite + creating the
  Better Auth user materializes the `UserEntitlement`. Secure: the comp is server-derived from the invite
  record, never client-supplied (mirror the checkout action's no-trust-client posture proven in SESSION_0345).
- **Claim -> comp:** when an admin approves a `LineageClaimRequest` (claim-review-actions), optionally attach a
  comp grant (e.g. "approved black belts get a free year"). The claim approval is the trusted trigger.
- **Scalable claimant flow:** placeholder BBL-imported users become claimable; the claim links the real Better
  Auth user to the placeholder node and (optionally) fires the comp. This is the secure/scalable
  claim+invite+gift loop the operator asked for.

## BBL.com data import lane

Extends `prisma/seed-baseline-lineage.ts` (already imports BBL pod people as `isPlaceholder` users). For the
real cohort: import existing blackbeltlegacy.com members as placeholder users + lineage nodes, tag the comp
cohort (Dirty Dozen = lifetime elite; named black belts/students = free-year premium), and create the
**pending** comp grants that materialize on claim/invite acceptance. Dedup (BBL-MIGRATE-002) is a prerequisite
to avoid double-granting.

## Multi-rank / multi-student seed plan (folded from SESSION_0345 TASK_02)

The "a few students of each rank under each existing instructor" seed the operator asked for. Build as a
deterministic, self-cleaning helper modeled on `e2e/helpers/seed-tournament.ts` (multi-actor pattern),
extending the existing lineage seed helpers (`e2e/helpers/seed-lineage*.ts`):

- For each existing instructor node in a tree, attach **N students across the rank spectrum** (white ->
  black), with `RankAward`s and `LineageTreeMember`s, deterministic ids, brand-scoped, self-cleaning.
- Mark a subset premium/elite (comped) and the rest free, so tier-gating render policy has both branches to
  exercise and edge/race cases (concurrent claim of the same node, instructor with mixed-tier students) are
  reproducible.
- This is the fixture that makes the tier-gating UI and the comp/claim flows provable end-to-end.

> Note: the money-path race concern (duplicate/parallel webhook delivery) is **already covered** — the webhook
> is idempotent and `app/api/stripe/webhooks/route.test.ts` proves grant-once on replay + parallel-capacity
> races (verified SESSION_0345). This seed targets the *lineage/tier* edge cases, not the payment race.

## Phasing (multi-session)

1. **Comp grant primitive + RBAC + audit** — server action creates `UserEntitlement(MANUAL_GRANT)` with
   audit; RBAC matrix enforced; unit + integration tests. (Highest value, lowest risk — schema is ready.)
2. **Tier-gating read model + card render** — one tier-policy helper; switch lineage card between free listing
   and full card; directory/profile consumption.
3. **Multi-rank seed helper** — the fixture above; proves phases 1-2 end-to-end.
4. **Invite -> comp and claim -> comp tie-ins** — server-derived comp on invite accept / claim approve.
5. **BBL.com import cohort** — placeholder import + pending comp cohort + dedup.

## Risks / open decisions

- **Lifetime liability:** lifetime elite grants are a standing cost/again-revocable decision; require audit +
  admin co-sign for non-platform grantors.
- **Abuse:** an instructor comping elite broadly. Mitigate with term caps + self-elevation block + audit.
- **ADR 0019 boundary:** comp grants affect `UserEntitlement` (access), **not** `Membership.status`. Keep the
  same separation the SESSION_0344/0345 checkout work proved.
- **Tier source of truth:** confirm tier = set of entitlement keys (recommended) vs a `tier` field; the
  former keeps paid and comped access on one read signal.
- **Open:** exact RBAC caps, dedup strategy for import, and whether "elite" is a superset of "premium" keys.

## Next-session first task

Petey-plan Phase 1 only: the RBAC-gated comp-grant server action (`UserEntitlement(MANUAL_GRANT)` + audit),
grounded in the existing `app/admin/entitlements` surface and the SESSION_0345 no-trust-client checkout
posture. Confirm the RBAC matrix and the entitlement-keys-as-tier decision at bow-in before code.

## Cross-references

- [GAP_MATRIX](GAP_MATRIX.md) — BBL-PROFILE-001 (public profile page), BBL-MIGRATE-002 (dedup) are
  prerequisites/neighbors.
- [ADR 0012 — tier auto-grant](../../architecture/decisions/0012-tier-auto-grant.md) — paid grant authority.
- [ADR 0019 — membership lifecycle ownership](../../architecture/decisions/0019-membership-lifecycle-ownership.md)
  — access vs membership boundary this epic must honor.
- [SESSION_0345](../../sprints/SESSION_0345.md) — checkout gate proof + returning-customer fix that precede
  this epic.
