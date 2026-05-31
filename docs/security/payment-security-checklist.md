---
title: "Payment Security Checklist"
slug: payment-security-checklist
type: file
status: active
created: 2026-05-31
updated: 2026-05-31
last_agent: codex-session-0313
pairs_with:
  - docs/security/README.md
  - docs/security/ronin-security-risk-register.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Payment Security Checklist

## Summary

Ronin should treat payments as a Stripe-mediated entitlement system: do not handle raw card data, do not trust client-side payment state, and never let Stripe metadata alone become authorization.

The repo already has a stronger-than-average webhook route. This checklist records what must be true before launch-hardening claims.

## Baseline rules

- Use Stripe-hosted or Stripe-mediated payment flows.
- Store Stripe IDs and internal ledger projections only.
- Never store card numbers, CVC, raw payment method details, or webhook secrets.
- Verify webhook signatures using the raw request body and `stripe-signature` header.
- Persist Stripe event IDs and skip duplicates.
- Fulfill access through Ronin entitlement/registration services, not directly from client state.
- Revoke or suspend access on refunds, disputes, cancellations, and failed payment states according to product policy.

## Current strengths to preserve

- The Stripe webhook route reads raw request text and validates the signature.
- Webhook event IDs are persisted to avoid duplicate processing.
- Tournament registration fulfillment uses serializable transaction behavior.
- Refund/dispute flows revoke access.
- Internal invoices/payments are separate from raw card data.

## Launch checklist

### Webhook ingress

- [ ] `STRIPE_WEBHOOK_SECRET` required when payments are enabled in production.
- [ ] Invalid signatures return generic responses in production.
- [ ] Signature failures emit structured alerts without raw payload logging.
- [ ] Optional Stripe IP allowlisting or network-level monitoring is documented.
- [ ] Webhook handler avoids logging names, addresses, full order data, or raw payloads.

### Fulfillment and entitlement

- [ ] Duplicate Stripe event does not double-grant access.
- [ ] Refund revokes entitlement/access.
- [ ] Dispute revokes entitlement/access.
- [ ] Failed subscription applies grace only once.
- [ ] Paid renewal restores access.
- [ ] Nightly drift audit compares Stripe state to `UserEntitlement`, invoices, payments, registrations, and program access.
- [ ] Admin replay tooling exists for failed internal processing.

### Checkout creation

- [ ] Checkout creation requires server-side auth/org/brand checks where applicable.
- [ ] Checkout metadata is treated as a hint, not authorization truth.
- [ ] Checkout action is rate-limited and fails closed if payment risk controls are unavailable.
- [ ] User-facing errors are generic in production.

### Accounting/admin access

- [ ] Payment records are visible only to owner/admin/accounting roles.
- [ ] Accounting roles are separate from school content/admin roles where needed.
- [ ] Audit logs capture grant/revoke/refund/dispute/admin adjustment events.
- [ ] Export/report payloads redact unnecessary user/payment details.

### Merchandise / Printful

- [ ] Printful webhook secret is required when Printful is enabled in production.
- [ ] Shipping addresses and order metadata are never logged raw.
- [ ] Fulfillment status changes do not modify entitlements unless explicitly designed.
- [ ] Merchandise orders are brand/org-scoped in admin queries.

## Failure modes

| Scenario | Required defense |
| --- | --- |
| Spoofed payment event | Stripe signature verification and generic rejection |
| Replayed webhook | Event ID idempotency |
| Refund but access remains active | Refund handler plus nightly drift audit |
| Checkout metadata tampering | Server-side lookup and authorization before fulfillment |
| Redis/rate-limit outage during checkout abuse | Fail closed for checkout creation |
| Webhook error logs leak PII | Safe logger/redaction and no raw payload logging |

## Relationships

- [Risk register](ronin-security-risk-register.md)
- [Security test plan](security-test-plan.md)
- [ADR 0014 — Stripe product policy](../architecture/decisions/0014-stripe-product-policy.md)
- [Stripe setup runbook](../runbooks/integrations/stripe-setup-runbook.md)

## Open Questions

- What is the exact grace policy for failed recurring payments by product line?
- Which admin role owns payment reconciliation and replay?
- Should payment drift audit be cron-only first, or also available as an admin report?
