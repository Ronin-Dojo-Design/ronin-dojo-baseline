---
title: "Security Test Plan"
slug: security-test-plan
type: file
status: active
created: 2026-05-31
updated: 2026-05-31
last_agent: codex-session-0313
pairs_with:
  - docs/security/README.md
  - docs/security/brand-scope-hardening-plan.md
  - docs/security/payment-security-checklist.md
  - docs/security/privacy-data-classification.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Security Test Plan

## Summary

This plan turns the SESSION_0313 security review into executable test coverage. It should guide the first brand-scope enforcement PR and follow-on payment/privacy hardening work.

## Cross-brand tests

- Baseline user cannot read BBL membership.
- BBL user cannot read Baseline roster, schedule, invoice, media, or certificate internals.
- WEKAF admin cannot mutate Baseline organization unless using explicit global-admin path.
- Missing brand predicate on an allowlisted brand-scoped model fails in test/dev.
- Unknown production host cannot silently default to a privileged brand context.
- Brand cookie manipulation does not change server authority.
- Public search returns only brand-scoped, publish-safe results.

## Access-control tests

- Anonymous user cannot access `/admin`, `/dashboard`, or `/me`.
- Logged-in non-admin cannot access admin data even if the page shell renders.
- Instructor can view only their own org roster.
- Assistant coach cannot manage billing.
- Guardian can view linked child records only.
- Organization owner cannot edit another organization in the same brand.
- Node editor cannot rewrite canonical lineage truth without required role.
- Admin server actions reject unauthorized users before mutation.

## Payment tests

- Invalid Stripe signature is rejected.
- Duplicate Stripe event does not double-grant entitlement.
- Refund revokes entitlement/access.
- Dispute revokes entitlement/access.
- Failed subscription applies grace only once.
- Paid renewal restores access.
- Checkout creation fails without required auth/org/brand checks.
- No card data is stored in internal records.
- Webhook production response does not expose raw error detail.
- Nightly drift audit identifies mismatched Stripe/internal entitlement state.

## Privacy tests

- Public directory payload never includes email, phone, DOB, guardian details, payment IDs, private notes, or private evidence unless explicitly allowed.
- Public certificate verification never includes payment/order/user internals.
- Claim evidence is never public by default.
- Private media URL requires signed access and expires.
- DSR export contains requester data only.
- DSR export cannot include records from another brand/org/user.
- DSR delete respects legal/audit/payment/certificate retention policy.

## Logging/error tests

- Server-action production errors do not expose stack traces or raw `Error.message` for generic failures.
- Webhook errors do not expose raw payload or detailed handler exceptions to the caller.
- Logs redact emails, phone numbers, addresses, tokens, secrets, and webhook payloads.
- Audit logs redact sensitive before/after JSON fields.
- Sensitive mutations fail test if no audit event is written.

## Environment/deploy tests

- `PAYMENTS_ENABLED=true` in production requires Stripe secret and webhook secret.
- `RATE_LIMITING_REQUIRED=true` in production requires Redis URL/token.
- `MEDIA_UPLOADS_ENABLED=true` in production requires S3 config.
- `PRINTFUL_ENABLED=true` in production requires Printful secret.
- `AI_ENABLED=true` in production requires AI key and privacy-mode configuration.
- Security headers exist in production responses.
- CSP report-only violations are collected before CSP enforcement.

## Suggested automation layers

### Unit / integration

- Prisma brand-scope extension tests.
- Authz helper tests for role/org/brand combinations.
- Safe logger redaction tests.
- Env validation tests by feature flag.

### E2E

- Cross-brand session flows on `baseline.local`, `bbl.local`, and `wekaf.local`.
- Admin page/action denial tests.
- Public certificate verification anti-enumeration checks.
- Private media signed URL checks.

### CI/security automation

- Required typecheck, lint, unit tests, and Playwright smoke tests.
- Secret scanning / push protection.
- Dependency scanning.
- CodeQL or equivalent SAST.
- Semgrep-style rules for missing brand predicates on high-risk query paths.

## Relationships

- [Risk register](ronin-security-risk-register.md)
- [Brand-scope hardening plan](brand-scope-hardening-plan.md)
- [Payment security checklist](payment-security-checklist.md)
- [Privacy data classification](privacy-data-classification.md)

## Open Questions

- Which tests should become required CI gates before the first production payment launch?
- Which brand-scope failures should be warning-only during rollout vs immediate denial?
- What fixtures should represent minors/guardians without storing real personal data?
