---
title: "Ronin Security Risk Register"
slug: ronin-security-risk-register
type: file
status: active
created: 2026-05-31
updated: 2026-06-26
last_agent: claude-session-0449
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

> **Single-brand update (2026-06-24, SESSION_0447).** ADR 0034 collapsed the
> 4-brand model to a single brand (BBL). Risk **#1 (runtime brand-scope DB
> enforcement)** below is now **superseded** — cross-brand data isolation is moot
> with one tenant. It is kept visible (not deleted) so the history and any future
> second-tenant re-activation stay traceable. The host→brand **origin** trust
> gate (`HOST_TO_BRAND` / `BRAND_TRUSTED_ORIGINS` / `resolveBrand` in
> `apps/web/lib/brand-context.ts`) is **KEEP-FOREVER** and is *not* part of risk
> #1's supersession — it survives even the eventual `brand` column drop. All
> other rows (#2–#10) are brand-agnostic web/payment/auth hardening and remain in
> force.

## Priority Register

| Priority | Risk | Severity | Current state | Target fix | Owner lane |
| --- | --- | --- | --- | --- | --- |
| 1 | ~~Missing runtime brand-scope DB enforcement~~ — **superseded (single-brand collapse, ADR 0034)** | ~~Critical~~ → N/A | Single brand (BBL); no second tenant for rows to leak into, so the multi-tenant data-isolation gap is moot. `db.ts` still wires only `uniqueSlugsExtension` (correct for single-brand). The host→brand **origin** gate in `brand-context.ts` stays KEEP-FOREVER. | None — shelved. Re-activate the brand-scope extension only if a second product tenant is introduced. | Security/platform |
| 2 | No global security headers / CSP gate | Critical | No obvious launch-enforced CSP/security header policy recorded in config docs | Add report-only CSP, then enforced CSP; add HSTS, frame, referrer, permissions, content-type headers | Web/platform |
| 3 | Admin route reliance risk | High | `proxy.ts` checks session cookie for `/admin`, `/dashboard`, `/me` UX redirects; server-side admin/org checks still must be proven per route/action | Add mandatory admin layout checks and audit route/action/query coverage | Admin/auth |
| 4 | Optional production secrets | High | Stripe, Redis, S3, Printful, Resend, Plausible, AI keys are optional in env schema | Add feature-gated production env requirements | Platform/devops |
| 5 | Rate limiter fail-open for sensitive actions | High | `isRateLimited()` returns false when Redis is unavailable or limiter errors | Classify buckets by fail-open vs fail-closed; fail closed for auth/OTP/invite/claims/payment/admin | Auth/platform |
| 6 | Private media boundary | High | Schema has `Media.isPublic`; plan says private media needs private storage/signed URLs | Separate prefixes/buckets and add signed URL authorization tests | Media/storage |
| 7 | PII/payment log leakage | High | Existing plan recognizes log risk; webhook/admin flows touch sensitive data | Add `safeLog()`/redaction helpers; ban raw request body logging | Observability |
| 8 | Payment/access drift | Medium-high | Stripe webhook idempotency and refund/dispute logic exist; reconciliation must be operationalized | Nightly Stripe/internal entitlement drift audit + alerts/admin replay | Payments |
| 9 | Dirstarter template model debt | Medium | Template/reference models still exist during learning phase | Delete or quarantine unused template models/routes before production cutover | Product/platform |
| 10 | AI/MCP data leakage | Medium | AI/content tooling exists or is emerging | Add AI data safety policy, prompt redaction, tool audit, human approval gates | AI/content |
| 11 | Platform-admin org super-user scope (SESSION_0448) | Medium | `hasOrgAdminAccess` (`apps/web/server/web/organization/org-admin-access.ts`) now grants any `User.role === "admin"` READ + (via `assertOrgAdminAccess`) WRITE to **every** org's settings/members/invites/theme — not just owned/ORG_ADMIN orgs. Live on prod (PR #163); 2 platform admins today (Brian, Tony Hua). | Confirm `AuditLog` records cross-org admin writes; keep the platform-admin set minimal (review periodically); alert on unexpected `role:admin` grants | Admin/auth |
| 12 | Public org-resolution owner-email PII exposure (SESSION_0448) | Medium | `getOrganizationBySlug` is now brand-agnostic (any org resolves by slug on public `/organizations/[slug]`, no positive visibility gate). `organizationDetailPayload` selects `owner.email`; the public page renders `owner.name ?? owner.email`, so a null-name owner's email can appear publicly. The brand-scoping drop widened which orgs resolve publicly (incl. 3 BASELINE orgs). | Drop `owner.email` from the public payload or gate the email fallback; backfill `owner.name`; reconsider a visibility gate for non-public orgs | Web/privacy |

## Risk Detail

### 1. Runtime brand-scope DB enforcement — SUPERSEDED (single-brand collapse, ADR 0034)

> **2026-06-24, SESSION_0447.** This risk assumed a one-app, one-database,
> **multi-brand** platform where a missed predicate could leak rows across
> brands. ADR 0034 collapsed the platform to a **single brand (BBL)**, so there
> is no second tenant and the cross-brand data-leak risk no longer exists. The
> proposed brand-scope Prisma extension is **shelved, not implemented** (see
> [brand-scope hardening plan](brand-scope-hardening-plan.md)). Org/role/owner
> scoping is still enforced at the app layer and remains live — it was never the
> brand axis.
>
> **Not superseded:** the host→brand **origin trust** gate
> (`apps/web/lib/brand-context.ts`) stays load-bearing forever. It is a request
> origin/host boundary (Better Auth `trustedOrigins`, OAuth/magic-link callback
> validation), not a DB-row data-isolation control, and survives the eventual
> schema-level `brand` column drop.
>
> *Original text (retained for history):* Ronin is a one-app, one-database,
> multi-brand platform. Every business-data query must be scoped by brand, org,
> role, and sometimes owner. One missed predicate in an admin query, profile
> drawer, certificate path, media query, or payment ledger can leak cross-brand
> data. The first implementation PR should enforce brand predicates at the
> database client boundary and test that missing predicates fail.

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

### 11. Platform-admin org super-user scope (SESSION_0448)

> **2026-06-26, SESSION_0448 (live on prod via PR #163).** `hasOrgAdminAccess`
> in `apps/web/server/web/organization/org-admin-access.ts` now grants
> org-settings READ — and, through `assertOrgAdminAccess`, WRITE — to any
> `User.role === "admin"` account. Platform admins are therefore super-users over
> **every** org's settings, members, invites, and theme, not just orgs they own
> or hold `ORG_ADMIN` on. This is intended (2 trusted platform admins today:
> Brian and Tony Hua), but it concentrates cross-org authority and must be
> monitored.

Controls and mitigations:

- Confirm `AuditLog` records every cross-org admin write (settings/members/invites/theme) with the acting admin id; a mutation with no audit event should fail the test gate (see security test plan).
- Keep the platform-admin set minimal — review the `role:admin` roster periodically and alert on any unexpected grant.
- Treat `assertOrgAdminAccess` as the single write boundary; new org-mutating actions must call it rather than re-deriving access.

### 12. Public org-resolution owner-email PII exposure (SESSION_0448)

> **2026-06-26, SESSION_0448 (live on prod via PR #163).** `getOrganizationBySlug`
> is now brand-agnostic: it resolves any org by slug on the public
> `/organizations/[slug]` route with no positive visibility gate. The brand-scoping
> drop widened which orgs resolve publicly (including 3 BASELINE orgs).

The related PII concern: `organizationDetailPayload` selects `owner.email`, and the public page renders `owner.name ?? owner.email`. For an owner whose `name` is null, the email falls through and can appear publicly.

Controls and mitigations:

- Drop `owner.email` from the public org payload, or gate the `owner.name ?? owner.email` fallback so a null name renders a non-PII placeholder instead of the email.
- Backfill `owner.name` for null-name owners on now-public orgs.
- Reconsider whether non-public orgs should resolve at all on the public route (a visibility gate), now that resolution is brand-agnostic.

## Relationships

- [Security review hub](README.md)
- [Brand-scope hardening plan](brand-scope-hardening-plan.md)
- [Security test plan](security-test-plan.md)
- [Privacy data classification](privacy-data-classification.md)
- [Payment security checklist](payment-security-checklist.md)

## Open Questions

> **2026-06-24, SESSION_0447.** The first two questions are **moot under the
> single-brand collapse** (no brand-scope allowlist / cross-brand admin bypass to
> design). The security-headers question (#3) is still open.

- ~~Which models are definitely brand-scoped and should be in the first allowlist?~~ *(moot — single brand)*
- ~~Should global admins bypass brand-scope enforcement by explicit helper only, or via a separate unscoped client?~~ *(moot — single brand)*
- Which security headers break current Stripe/analytics/media integrations in report-only mode?
