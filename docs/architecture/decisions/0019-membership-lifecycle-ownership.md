---
title: "ADR 0019 - Membership is community/admin state; UserEntitlement owns subscription access"
slug: adr-0019
type: adr
status: accepted
created: 2026-05-25
updated: 2026-05-25
last_agent: codex-session-0351
pairs_with:
  - docs/sprints/SESSION_0258.md
  - docs/sprints/SESSION_0259.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/decisions/0012-tier-auto-grant.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0259.md
---

# ADR 0019 - Membership is community/admin state; UserEntitlement owns subscription access

**Status:** Accepted
**Date:** 2026-05-25

## Context

SESSION_0258 TASK_07 ran a focused spike on the Stripe webhook and membership write-sites to resolve a hanging question raised during MB-015 Session B email wiring: *should subscription lifecycle events drive `Membership.status`?* The spike returned two facts read directly from `app/api/stripe/webhooks/route.ts` and the surrounding schema:

1. **The webhook never touches `Membership.status` today.** It manages `UserEntitlement` (`grantEntitlementsFromCheckout`, `syncSubscriptionEntitlements`, `revokeEntitlementsFromSubscription`), `ProgramEnrollment` (`fulfillProgramEnrollment`, `suspendProgramEnrollmentsForEntitlementSource`), `Registration` (`fulfillTournamentRegistration`), and `Tool` (`isFeatured` + `tier` for the premium-tool flow). Membership remains a community/admin concept driven by `server/admin/memberships/actions.ts::transitionMembershipStatus` and four self-service paths.
1. **`invoice.payment_failed` does not suspend anything.** It calls `applySubscriptionPaymentGrace` which only sets `UserEntitlement.endsAt = now + 7 days`. There is no expiry cron — entitlements lapse implicitly via the read-site time checks. The only cron in `apps/web/app/api/cron/` is `publish-tools`.

SESSION_0259 grill-me then surfaced a third, schema-shaped fact:

1. **There is no `PricingPlan → Discipline` link.** A subscription resolves to a `PricingPlan` which carries `organizationId` and optional `programId`. A `Membership` is keyed by `(userId, organizationId, disciplineId)`, and a user can hold N memberships in the same org (one per discipline). Without a `PricingPlanDiscipline` join (or `Membership.pricingPlanId` foreign key), there is no deterministic rule for *which* of a user's memberships a `customer.subscription.deleted` event should suspend.

The pressure that prompted the question — "membership status should reflect whether the user is paying" — was real, but applying it would have required (1) a schema delta, (2) admin UI to maintain the new link, (3) webhook mapping logic, (4) a decision on `invoice.payment_failed` semantics (immediate suspend vs grace-then-cron), and (5) the membership-expiry cron we declined building separately. Realistically two to three sessions of work for a behavior that `UserEntitlement` already provides.

## Decision

### `Membership.status` is community/admin state. `UserEntitlement` is subscription-driven access

- `Membership.status` (`INVITED`/`PENDING`/`ACTIVE`/`SUSPENDED`/`CANCELLED`/`EXPIRED`) is owned by:
  - Admins, via `server/admin/memberships/actions.ts::transitionMembershipStatus`.
  - Org owners, via `server/web/organization/actions.ts::updateMembershipStatus`.
  - Self-service joins, via `server/invites/actions.ts::claimInvite`, `joinByInviteCode`, and `joinOrganization`.
- `UserEntitlement` (`ACTIVE`/`REVOKED`/`EXPIRED`) is owned by the Stripe webhook on `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`, `charge.refunded`, and `charge.dispute.created`.
- Authorization at read sites should consult `UserEntitlement` (or its derived helpers in `server/web/entitlements/`) for paid features, **not** `Membership.status`. Membership remains the right gate for community features (org roster, discipline progression, owner-only actions).

The webhook is intentionally left untouched.

## Alternatives considered

### Option A - Entitlements-as-truth (chosen)

- **Pros:** No schema delta. Webhook stays small. Email lifecycle work can ship in one session (SESSION_0259). The split matches what the code already does, so the ADR is descriptive, not aspirational. Reversible — the door isn't welded shut, just closed.
- **Cons:** Two stores to read for an "is this user a paying active member?" surface (Membership + Entitlement). A reporting query that wants "active members whose subscription is current" has to join. Accepted; reporting is not yet a feature with concrete requirements.

### Option B - Extend webhook to drive `Membership.status`

- **Pros:** Single read surface for "active paid member." Stripe events flow into the same column admins write to.
- **Cons:** Requires `PricingPlanDiscipline` join (or `Membership.pricingPlanId` FK), admin UI to maintain the link, webhook mapping logic with edge cases (multi-discipline subscriptions, partial cancellations), and a decision on `invoice.payment_failed` UX that diverges from entitlements unless we also build the missing expiry cron. Multiple-session effort. Creates a second source of truth without a clean mapping.

### Option C - Minimal webhook touch: `subscription.deleted` → suspend all memberships in org

- **Pros:** Ships in one session with no schema change. Closes the loop on the worst-case "I cancelled and still appear as an active member."
- **Cons:** Coarse — a yoga subscription cancellation suspends the karate membership. Cannot represent partial cancellations. Would still need the cron decision for `payment_failed`. Defers but does not eliminate the architectural debt; future "real" mapping would have to undo this.

## Consequences

- **SESSION_0259** wires self-service membership emails (`claimInvite`, `joinByInviteCode`, `joinOrganization`, `updateMembershipStatus`) without webhook changes, fitting under the WORKFLOW 5.0 ≤3-deliverables cap.
- The **membership-expiry cron remains unbuilt** unless a concrete business requirement surfaces. If it does, this ADR is amended — a cron implementing entitlement-driven membership reconciliation is consistent with the boundary set here (membership *reflects* entitlement, not the other way around).
- **Authorization audits** should look for paid-feature gates that read `Membership.status` rather than `UserEntitlement`. Any such gate is a bug under this ADR.
- The TASK_07 spike findings recorded in `SESSION_0258.md` `## Hostile close review` (`SESSION_0258_FINDING_03`) are formally resolved by this ADR.
- Future Stripe webhook extension is constrained: subscription state must not write to `Membership.status` directly. If "subscription lapsed → community SUSPENDED" is ever required, do it via a reconciliation job that reads entitlements and applies the boundary, rather than coupling the webhook to two write surfaces.

## Dirstarter docs proof

Not applicable — this ADR codifies an internal Ronin Dojo schema boundary between two app-specific models (`Membership`, `UserEntitlement`) that have no Dirstarter baseline counterpart. The Dirstarter baseline ships `UserEntitlement` only; `Membership` is Ronin-specific.

## Related decisions

- [ADR 0011 — Entitlement-first commerce](0011-entitlement-first-commerce.md) — established `UserEntitlement` as the authorization primitive for paid features.
- [ADR 0012 — Tier-based entitlement auto-grant via Stripe webhook](0012-tier-auto-grant.md) — defined the Stripe-driven granting flow this ADR explicitly preserves.
