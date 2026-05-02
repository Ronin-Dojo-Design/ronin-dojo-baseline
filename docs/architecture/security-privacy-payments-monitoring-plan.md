---
title: "Security, Privacy, Payments, and Monitoring Plan"
slug: security-privacy-payments-monitoring-plan
type: file
status: active
created: 2026-04-30
updated: 2026-05-02
last_agent: codex-session-0032
pairs_with:
  - docs/sprints/SESSION_0030.md
  - docs/architecture/auth.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/README.md
---

# Security, Privacy, Payments, and Monitoring Plan

## Purpose

Define the minimum security envelope for SESSION_0030 class scheduling and the future CGR commerce path before implementation starts.

This is a plan and gate document. It does not claim the system is impossible to compromise. It defines the controls required before code can be considered launch-safe.

## Dirstarter Docs Proof

Live Dirstarter docs checked on 2026-04-30:

| Baseline area | Source | Ronin security implication |
| --- | --- | --- |
| Project structure | https://dirstarter.com/docs/codebase/structure | Keep server code in feature folders under `server/web` and `server/admin`; do not add parallel CGR auth/db stacks. |
| Prisma/database | https://dirstarter.com/docs/database/prisma | Use `schema.prisma`, generated Prisma client, `prisma/seed.ts`, and `services/db.ts`; validate schema and seed paths. |
| Authentication | https://dirstarter.com/docs/authentication | Better Auth session and role checks are baseline; route protection is not enough without server-side authorization. |
| Environment secrets | https://dirstarter.com/docs/environment-setup | Never commit `.env`; production must validate Better Auth, database, Stripe, Redis, S3, analytics, and cron secrets. |
| Payments/Stripe | https://dirstarter.com/docs/integrations/payments | Use Stripe checkout/webhooks; verify webhook signatures and map payment events into Ronin ledgers/entitlements. |
| Monetization | https://dirstarter.com/docs/monetization | Paid features must flow through a plan/product access model; Ronin translates this into entitlements before paid UI. |
| Rate limiting | https://dirstarter.com/docs/integrations/rate-limiting | Use centralized rate limits for auth-adjacent actions, submissions, payments, and certificate verification abuse. |
| Analytics | https://dirstarter.com/docs/integrations/analytics | Track operational events without collecting private student, roster, payment, or certificate secrets. |
| Storage/media | https://dirstarter.com/docs/integrations/storage | Dirstarter's public media pattern is acceptable for public assets only; private certificates/media require private objects or signed access. |
| Deployment | https://dirstarter.com/docs/deployment | Production env, preview deploys, and domain config must be verified before launch. |
| Cron jobs | https://dirstarter.com/docs/cron-jobs | Scheduled publishing/sync work belongs in explicit cron routes guarded by secrets and logs. |
| Content workflow | https://dirstarter.com/docs/content | Draft/review/publish rules apply to public curriculum and marketing content; credentials remain approval-gated. |

## Data Classification

| Class | Examples | Default exposure | Required controls |
| --- | --- | --- | --- |
| Public marketing | Program title, public description, published schedule summary | Public | Brand filter, publish/status filter, SEO no private data |
| Member-private | Student identity, enrollment, attendance, class roster, rank progress, certification progress | Authenticated and authorized only | Better Auth session, active membership/role, brand and org predicates, no client-trusted brand |
| Staff-private | Instructor assignments, class session notes, review queue, admin comments | Staff/admin only | Role checks, org ownership, audit log where available |
| Financial | Invoices, payments, Stripe ids, entitlement source ids, refund state | Owner/admin/accounting only | Server-only Stripe secrets, webhook signature verification, idempotency, no card data storage |
| Verification-safe | Certificate number, recipient display name, issuer, status, expiry | Public only for valid verify code | Constant-shape public response, no payment/order/user internals |
| Secrets | Env vars, webhook secrets, API keys, S3 credentials, cron secret | Never public | Env validation, no logs, rotation plan, least privilege |

## Hostile Review Findings

| Finding | Severity | Impact | Required gate |
| --- | --- | --- | --- |
| Schedule routes could expose member-private data if they rely only on route protection. | High | Cross-brand roster/session leakage. | Every query/action must prove `brand`, `organizationId`, and editable-org or staff role predicates server-side. |
| Instructor selectors can become user enumeration if they query all users. | High | Private user discovery across orgs or brands. | Instructor queries must join through ACTIVE same-org memberships with allowed role codes. |
| ClassSession generation can create durable cross-brand rows if program/org is client-trusted. | High | Corrupt operational data and privacy leak. | Server derives org/program/brand and rejects mismatches before writes. |
| Future Stripe UI can leak financial state if payments write access directly. | High | Access remains active after refund/cancel or unlocks wrong program. | Payment events grant/revoke entitlements through an idempotent service; UI never checks Stripe metadata directly. |
| Certificate verification can leak private credential/payment data. | Medium | Public endpoint becomes profile/order lookup. | Verify endpoint returns only verification-safe fields and rate-limits lookup attempts. |
| Public storage defaults can leak private certificates/media. | Medium | Private PDFs/media become scrapeable. | Public buckets only for public assets; private artifacts use signed URLs or private object policy. |
| Logs and analytics can leak PII/payment ids. | Medium | Permanent leakage into analytics/logging vendors. | Redact secrets, emails, raw Stripe payloads, addresses, roster data, and payment method details. |

## Wireframes

These are low-fidelity control wireframes. They define what data is allowed on each surface before design polish.

### Public Program Page

```txt
+------------------------------------------------------+
| Brand header                                          |
+------------------------------------------------------+
| Program name, public description, public image        |
| Discipline badges, age range, public location summary |
| Price summary: "plans available" or public range      |
| CTA: sign in / enroll / contact school                |
+------------------------------------------------------+
| Public schedule summary                               |
| - Day/time blocks only                                |
| - No roster, no instructor private contact            |
| - No enrollment counts unless intentionally public     |
+------------------------------------------------------+
```

### Staff Schedule Manager

```txt
+--------------------------------------------------------------+
| Org + brand context banner                                   |
| Program filter | Status filter | New schedule                |
+--------------------------------------------------------------+
| Schedule table                                               |
| Program | Days | Time | Capacity | Instructors | Status | ...|
| Row actions visible only to editable-org users               |
+--------------------------------------------------------------+
```

### Schedule Edit Form

```txt
+--------------------------------------------------------------+
| Locked server context: Brand / Organization / Program        |
+--------------------------------------------------------------+
| Name | Description | Days | Start | End | Timezone           |
| Capacity | Location | Effective date range                   |
+--------------------------------------------------------------+
| Instructor selector                                          |
| - Only ACTIVE same-org instructor/admin/owner memberships     |
| - Primary toggle                                             |
| - Display title                                              |
+--------------------------------------------------------------+
| Save | Archive                                               |
+--------------------------------------------------------------+
```

### Payment / Entitlement Admin Surface

```txt
+--------------------------------------------------------------+
| User + org + brand context                                   |
+--------------------------------------------------------------+
| Entitlements                                                 |
| Key | Source | Starts | Ends | Status | Revoke/extend        |
+--------------------------------------------------------------+
| Ledger                                                       |
| Invoice | Payment status | Stripe event id | Refund state    |
| No card numbers, no raw Stripe payload, no webhook secret    |
+--------------------------------------------------------------+
```

### Security Monitor

```txt
+--------------------------------------------------------------+
| Security and ops monitor                                     |
+--------------------------------------------------------------+
| Auth failures | Brand-scope rejects | Rate-limit hits        |
| Stripe webhook failures | Duplicate event ids | Refund drift |
| Certificate verify abuse | Cron failures | Env validation    |
+--------------------------------------------------------------+
```

## Decision Plan

| Decision | Default | Revisit condition |
| --- | --- | --- |
| Route placement for schedules | Program-adjacent under existing `apps/web/app/(web)` routes. | Move to dashboard only after staff workflows require a separate operational shell. |
| Brand context | Server-derived from request/proxy and org/program rows. | Revisit only if a centralized request-brand helper is added. |
| Authorization | Server actions and queries enforce auth, brand, org, and role. | No route is accepted with middleware-only protection. |
| Instructor eligibility | ACTIVE same-org memberships with owner/admin/instructor role codes. | Add coach/staff roles only after roles are defined in seed and authz docs. |
| ClassSession materialization | Bounded generation from `daysOfWeek`, `startTime`, `endTime`, effective dates, and timezone. | Add `rrule` engine only when recurring edge cases exceed the MVP shape. |
| Paid access | Entitlement-first, per ADR 0011. | Do not build Stripe UI before entitlement schema/service exists. |
| Stripe webhook handling | Signature verification, idempotent event processing, no raw secrets/log payloads. | Revisit when adding Connect or multi-org payouts. |
| Public certificate verification | Lookup by `qrVerificationCode`; return verification-safe fields only. | Revisit if certificate fraud/abuse requires stronger proof or captcha/rate limits. |
| Storage | Public assets may use public URLs; private certificates/media require signed/private access. | Revisit when certificate PDFs are implemented. |
| Monitoring | Start with structured logs and threshold alerts; graduate to dashboards before staging. | Revisit at staging deploy and launch-readiness sessions. |

## Required Security Gates

### SESSION_0030 class schedules

- Queries filter by `brand` and `organizationId`.
- Mutations derive `brand` from server-side context and verified org/program rows.
- Program ownership is checked before schedule writes.
- Discipline linkage is checked against the organization.
- Instructor selector cannot list users outside the org/brand.
- Class session generation is bounded and idempotent.
- No roster, attendance, payment, or certificate data appears on public pages.
- Smoke tests include unauthorized, cross-brand, and cross-org rejection cases.

### Future CGR commerce

- Entitlement schema/service lands before Stripe UI.
- Stripe webhook route verifies signature and stores processed event ids.
- Payment success grants entitlement inside a DB transaction or explicit idempotent sequence.
- Refund/cancel/dispute revokes or expires entitlement.
- Invoices/payments never store card numbers or secrets.
- Logs redact emails, addresses, webhook payloads, access tokens, and payment method details.
- Public certificate verification returns only safe fields and is rate-limited.

## Monitoring Plan

| Signal | Why it matters | Owner | Alert threshold |
| --- | --- | --- | --- |
| Failed auth and role checks by route | Detect probing and broken auth flows. | Doug + Cody | Spike above normal baseline or repeated single-user failures. |
| Brand-scope rejects | Detect attempted cross-brand access and coding bugs. | Giddy + Cody | Any production spike; any admin bypass attempt. |
| Rate-limit hits | Detect abuse on auth, forms, payments, verification, and admin actions. | Doug | Repeated IP/user hits in one hour. |
| Stripe webhook signature failures | Detect spoofed or misconfigured payment events. | Doug + Cody | Any production failure after setup. |
| Duplicate Stripe event ids | Detect replay or idempotency bugs. | Cody | Any duplicate that changes state. |
| Invoice/payment/entitlement drift | Detect access not matching money movement. | Cody + Doug | Any mismatch in nightly audit. |
| Certificate verify misses by IP | Detect enumeration attempts. | Doug | Burst of invalid codes. |
| Cron failures | Detect missed publish/sync/revoke/expiry jobs. | Cody | Any failed scheduled run. |
| Env validation failures | Detect missing production secrets or wrong URLs. | Cody | Any deploy with missing required secret. |
| Private storage access failures | Detect bad signed URL or object policy. | Cody | Any private artifact served publicly or blocked incorrectly. |
| Rate limiter unavailable (fail-open) | Detect when Upstash Redis is unreachable and `isRateLimited` falls back to allowing all calls. Important for `schedule_write` / `instructor_search` keys added in SESSION_0031, `attendance_write` added in SESSION_0032, and any future auth-adjacent limiter. | Doug + Cody | Any sustained `Rate limiter error:` log span > 5 min in production, or any consecutive failure during a deploy window. |

## Test Plan

| Test type | Required examples |
| --- | --- |
| Unit | Permission truth tables for schedule edit, instructor eligibility, entitlement access, certificate verification response shaping. |
| Integration | Program -> schedule create/edit/archive; instructor assignment; bounded session generation; cross-brand rejection. |
| Payment simulation | Stripe CLI webhook signature success/failure; duplicate event id; refund/cancel entitlement revoke. |
| Security smoke | Anonymous cannot access staff pages; wrong-brand user cannot mutate; member cannot enumerate instructors; public verify endpoint hides private fields. |
| Monitoring smoke | Synthetic log event for brand-scope reject, webhook failure, rate-limit hit, cron failure. |

## Launch Blockers

- MB-002 brand-scope enforcement remains open.
- Entitlement implementation must exist before Stripe UI.
- Payment/entitlement drift audit must exist before paid curriculum launch.
- Private certificate/media storage policy must be decided before certificate PDFs launch.
- Production env/secret verification must pass before staging or launch.
