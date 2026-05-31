---
title: "Ronin Security Risk Register"
slug: ronin-security-risk-register
type: file
status: active
created: 2026-05-31
updated: 2026-05-31
last_agent: codex-session-0313
pairs_with:
  - docs/security/README.md
  - docs/security/brand-scope-hardening-plan.md
  - docs/security/security-test-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Ronin Security Risk Register

## Summary

This register captures the highest-priority security risks from the SESSION_0313 review. It is a roadmap and audit ledger, not proof that the system is secure.

The most important theme is **documented controls must become enforced, tested, and monitored controls**.

## Priority Register

| Priority | Risk | Severity | Current state | Target fix | Owner lane |
| --- | --- | --- | --- | --- | --- |
| 1 | Missing runtime brand-scope DB enforcement | Critical | Auth docs describe brand-scope defense-in-depth, but `db.ts` only wires `uniqueSlugsExtension` | Add `brandScopeExtension` / `brandScopedDb`, model allowlist, tests that omitted brand predicates fail | Security/platform |
| 2 | No global security headers / CSP gate | Critical | No obvious launch-enforced CSP/security header policy recorded in config docs | Add report-only CSP, then enforced CSP; add HSTS, frame, referrer, permissions, content-type headers | Web/platform |
| 3 | Admin route reliance risk | High | `proxy.ts` checks session cookie for `/admin`, `/dashboard`, `/me` UX redirects; server-side admin/org checks still must be proven per route/action | Add mandatory admin layout checks and audit route/action/query coverage | Admin/auth |
| 4 | Optional production secrets | High | Stripe, Redis, S3, Printful, Resend, Plausible, AI keys are optional in env schema | Add feature-gated production env requirements | Platform/devops |
| 5 | Rate limiter fail-open for sensitive actions | High | `isRateLimited()` returns false when Redis is unavailable or limiter errors | Classify buckets by fail-open vs fail-closed; fail closed for auth/OTP/invite/claims/payment/admin | Auth/platform |
| 6 | Private media boundary | High | Schema has `Media.isPublic`; plan says private media needs private storage/signed URLs | Separate prefixes/buckets and add signed URL authorization tests | Media/storage |
| 7 | PII/payment log leakage | High | Existing plan recognizes log risk; webhook/admin flows touch sensitive data | Add `safeLog()`/redaction helpers; ban raw request body logging | Observability |
| 8 | Payment/access drift | Medium-high | Stripe webhook idempotency and refund/dispute logic exist; reconciliation must be operationalized | Nightly Stripe/internal entitlement drift audit + alerts/admin replay | Payments |
| 9 | Dirstarter template model debt | Medium | Template/reference models still exist during learning phase | Delete or quarantine unused template models/routes before production cutover | Product/platform |
| 10 | AI/MCP data leakage | Medium | AI/content tooling exists or is emerging | Add AI data safety policy, prompt redaction, tool audit, human approval gates | AI/content |

## Risk Detail

### 1. Runtime brand-scope DB enforcement

Ronin is a one-app, one-database, multi-brand platform. Every business-data query must be scoped by brand, org, role, and sometimes owner. One missed predicate in an admin query, profile drawer, certificate path, media query, or payment ledger can leak cross-brand data.

The first implementation PR should enforce brand predicates at the database client boundary and test that missing predicates fail.

### 2. Security headers and CSP

A production security header baseline should include:

- `Content-Security-Policy` with Stripe-compatible directives.
- `Strict-Transport-Security` for production HTTPS.
- `X-Frame-Options` or CSP `frame-ancestors`.
- `Referrer-Policy`.
- `Permissions-Policy`.
- `X-Content-Type-Options`.
- COOP/CORP where compatible.

Start report-only, observe, then enforce.

### 3. Admin authorization

Middleware can redirect anonymous users for UX, but it must not be the authorization boundary. Admin pages, queries, and actions must deny unauthorized users server-side.

### 4. Feature-gated secrets

Optional env vars are useful during buildout. Before production launch, enabled features must fail build/deploy when required secrets are missing.

Suggested flags:

- `PAYMENTS_ENABLED=true` requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- `RATE_LIMITING_REQUIRED=true` requires Redis secrets.
- `MEDIA_UPLOADS_ENABLED=true` requires S3 secrets.
- `PRINTFUL_ENABLED=true` requires Printful secrets.
- `AI_ENABLED=true` requires AI gateway key and a privacy-mode flag.

### 5. Rate-limit failure modes

Low-risk marketing forms may fail open with an alert. Sensitive surfaces should fail closed or degrade safely when Redis is unavailable:

- magic links / OTP / auth abuse controls,
- invite generation,
- claim/evidence submission,
- certificate verification,
- checkout/payment creation,
- admin destructive actions.

### 6. Private media

Private certificate PDFs, claim evidence, waiver-adjacent uploads, student videos, private curriculum, and review media must not be public URLs by default.

Use separate prefixes or buckets:

- `public-assets/`
- `private-media/`
- `certificate-pdfs/`
- `claim-evidence/`
- `student-media/`

### 7. Safe logging and errors

Production responses should be generic. Detailed errors belong in structured logs with redaction, not in user-facing responses. Logs should redact or hash emails, phone numbers, addresses, access tokens, webhook secrets, and unnecessary Stripe identifiers.

### 8. Payment/access drift

Refunds, disputes, subscription churn, failed renewals, and replayed webhooks can create access drift. Nightly reconciliation should compare Stripe state to Ronin invoices, payments, entitlements, registrations, and program access.

### 9. Template debt

Unused template models/routes/admin screens add attack surface and permission ambiguity. Before production cutover, decide which template areas are retained, removed, or quarantined.

### 10. AI/MCP safety

AI tooling should not access raw PII, rosters, payment state, waivers, or private evidence by default. Mutating AI tools require human approval, tool-call logs, and explicit scopes.

## Relationships

- [Security review hub](README.md)
- [Brand-scope hardening plan](brand-scope-hardening-plan.md)
- [Security test plan](security-test-plan.md)
- [Privacy data classification](privacy-data-classification.md)
- [Payment security checklist](payment-security-checklist.md)

## Open Questions

- Which models are definitely brand-scoped and should be in the first allowlist?
- Should global admins bypass brand-scope enforcement by explicit helper only, or via a separate unscoped client?
- Which security headers break current Stripe/analytics/media integrations in report-only mode?
