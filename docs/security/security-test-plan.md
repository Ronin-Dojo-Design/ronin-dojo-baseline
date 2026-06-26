---
title: "Security Test Plan"
slug: security-test-plan
type: file
status: active
created: 2026-05-31
updated: 2026-06-26
last_agent: claude-session-0449
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

## Cross-brand tests (SUPERSEDED — single-brand collapse, ADR 0034)

> **2026-06-24, SESSION_0447.** The cross-brand *data-isolation* cases below are
> **moot**: there is one brand (BBL), so there is no second tenant to read across
> or to mutate without authorization. They are retained as the re-activation
> spec for a future second product tenant.
>
> **Still required (folds into the KEEP-FOREVER host→brand origin gate, MB-002):**
> the host/origin trust cases below stay live regardless of brand count — they
> guard `BRAND_TRUSTED_ORIGINS` / `resolveBrand` in `apps/web/lib/brand-context.ts`,
> not DB-row scoping.

- ~~Baseline user cannot read BBL membership.~~ *(moot — single brand)*
- ~~BBL user cannot read Baseline roster, schedule, invoice, media, or certificate internals.~~ *(moot — single brand)*
- ~~WEKAF admin cannot mutate Baseline organization unless using explicit global-admin path.~~ *(moot — single brand)*
- ~~Missing brand predicate on an allowlisted brand-scoped model fails in test/dev.~~ *(moot — single brand)*
- **(KEEP)** Unknown production host cannot silently default to a privileged/trusted origin — request from an untrusted host is rejected by the origin gate.
- **(KEEP)** Brand cookie / forwarded-host manipulation does not change server authority or bypass the trusted-origin check.
- Public search returns only publish-safe results. *(2026-06-24: the brand-scoping clause is now implicit — everything is BBL.)*

## Access-control tests

- Anonymous user cannot access `/admin`, `/dashboard`, or `/me`.
- Logged-in non-admin cannot access admin data even if the page shell renders.
- Instructor can view only their own org roster.
- Assistant coach cannot manage billing.
- Guardian can view linked child records only.
- Organization owner cannot edit another organization. *(2026-06-24: "same brand" qualifier dropped — single brand.)*
- Node editor cannot rewrite canonical lineage truth without required role.
- Admin server actions reject unauthorized users before mutation.

### Org-admin access helper (`org-admin-access.ts`, SESSION_0448)

These cover `hasOrgAdminAccess` / `assertOrgAdminAccess` in `apps/web/server/web/organization/org-admin-access.ts`, now live on prod (PR #163).

- `hasOrgAdminAccess` returns `true` for a platform admin (`User.role === "admin"`) against **any** org.
- `hasOrgAdminAccess` returns `true` for the org owner.
- `hasOrgAdminAccess` returns `true` for an `ORG_ADMIN` member of that org.
- `hasOrgAdminAccess` returns `false` for an unrelated signed-in user (no ownership, no `ORG_ADMIN`, not a platform admin).
- `hasOrgAdminAccess` returns `false` for an anonymous (unauthenticated) request.
- `assertOrgAdminAccess` throws `ACCESS_DENIED` for both false cases (unrelated signed-in user and anonymous).
- Cross-org platform-admin writes (settings/members/invites/theme) write an `AuditLog` event; a mutation with no audit event fails the test.

### Public org resolution (`/organizations/[slug]`, SESSION_0448)

- `/organizations/[slug]` resolves any org by slug (brand-agnostic, no positive visibility gate) — assert this is the intended behavior, not a leak.
- The public `organizationDetailPayload` does NOT leak owner PII: a null-name owner's `owner.email` must not render on the public page (the `owner.name ?? owner.email` fallback should expose no email).

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
- DSR export cannot include records from another org/user. *(2026-06-24: cross-brand clause dropped — single brand.)*
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

- ~~Prisma brand-scope extension tests.~~ *(2026-06-24: superseded — no brand-scope extension under single brand.)*
- **(KEEP)** Host→brand origin-gate tests — `resolveBrand` / `BRAND_TRUSTED_ORIGINS` trusted-vs-untrusted origin coverage (`apps/web/lib/brand-context.test.ts`).
- Authz helper tests for role/org combinations. *(2026-06-24: brand dimension is constant BBL.)*
- Org-admin access-helper tests — `hasOrgAdminAccess` / `assertOrgAdminAccess` over platform-admin / owner / `ORG_ADMIN` / unrelated / anonymous combinations (`apps/web/server/web/organization/org-admin-access.ts`, SESSION_0448).
- Safe logger redaction tests.
- Env validation tests by feature flag.

### E2E

- Session flows on `bbl.local`. *(2026-06-24: the `baseline.local` / `wekaf.local` cross-brand hosts are retired with the single-brand collapse; keep the untrusted-host rejection check against the origin gate.)*
- Admin page/action denial tests.
- Public certificate verification anti-enumeration checks.
- Private media signed URL checks.

### CI/security automation

- Required typecheck, lint, unit tests, and Playwright smoke tests.
- Secret scanning / push protection.
- Dependency scanning.
- CodeQL or equivalent SAST.
- ~~Semgrep-style rules for missing brand predicates on high-risk query paths.~~ *(2026-06-24: superseded — no brand predicate to enforce under single brand.)*

## Relationships

- [Risk register](ronin-security-risk-register.md)
- [Brand-scope hardening plan](brand-scope-hardening-plan.md)
- [Payment security checklist](payment-security-checklist.md)
- [Privacy data classification](privacy-data-classification.md)

## Open Questions

- Which tests should become required CI gates before the first production payment launch?
- ~~Which brand-scope failures should be warning-only during rollout vs immediate denial?~~ *(2026-06-24: moot — no brand-scope rollout under single brand.)*
- What fixtures should represent minors/guardians without storing real personal data?
