---
title: "Privacy Data Classification"
slug: privacy-data-classification
type: file
status: active
created: 2026-05-31
updated: 2026-05-31
last_agent: codex-session-0313
pairs_with:
  - docs/security/README.md
  - docs/security/security-test-plan.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Privacy Data Classification

## Summary

Ronin handles sensitive identity, school, membership, payment, certificate, media, and admin records. Default exposure must be private unless a data class is explicitly public or verification-safe.

This page extends the existing security/privacy/payment plan into a practical launch-hardening classification.

## Classes

| Class | Examples | Default exposure | Required controls |
| --- | --- | --- | --- |
| Public marketing | Published brand pages, public program summaries, SEO metadata | Public | Brand filter, publish/status filter, no private student/payment data |
| Verification-safe | Certificate number/code, public credential status, issuer, expiry, limited recipient display name | Public only through valid verification code | Rate limit, constant-shape response, no user/payment/order internals |
| Identity | User, Passport, DirectoryProfile, DOB, legal name, email, phone | Owner/self, authorized staff/admin | Auth session, active membership/org role, brand/org predicates, redacted logs |
| Student/member records | Membership, attendance, check-ins, rank progress, curriculum progress, guardian/household relationships | Authorized user, guardian, org staff/admin | Brand/org/user scoping, active status checks, minor-aware public payload allowlists |
| Operational school data | Rosters, instructor assignments, schedules, guardians, waivers, notes | Org staff/admin only | Org role checks, audit logs for sensitive mutation, no public indexing |
| Financial | Stripe IDs, invoices, payments, refunds, disputes, entitlements, accounting notes | Owner/admin/accounting only | Server-only secrets, webhook signature verification, idempotency, no raw card data |
| Credentials | Certifications, certificates, QR verification, rank awards | Mixed: private by default; verification-safe subset can be public | Public allowlist, anti-enumeration rate limits, audit for issuance/revoke |
| Media | Private certificates, claim evidence, photos/videos, curriculum assets | Private unless `isPublic` and approved | Separate public/private storage, signed URLs, short TTLs, authorization checks |
| Admin/audit | Audit logs, before/after JSON, review queues, internal comments | Restricted admin/security/accounting | Append-only behavior, redaction, export controls, retention policy |
| AI/content automation | Content atoms, prompts, generation outputs, MCP/tool calls | Private/internal by default | Prompt redaction, human approval for publish/send/write, no secrets, tool audit |
| Secrets | Env vars, tokens, API keys, webhook secrets, S3 credentials | Never public | Env validation, secret scanning, rotation, least privilege |

## Enforcement principles

- Public payloads are allowlists, not filtered private objects.
- Brand and organization are authorization inputs, not display-only metadata.
- Client cookies can improve UX but cannot authorize access.
- Private media requires signed access; obscurity is not a control.
- Logs should contain event types and correlation IDs, not raw PII/payment payloads.
- DSR exports must include requester data only and must not cross brand/org/user boundaries.

## DSR and retention notes

The Prisma schema already includes a `DataSubjectRequest` workflow. Launch-hardening requires a runbook that answers:

- How is export generated and reviewed?
- Which records are excluded for legal, fraud, accounting, certificate, or audit-retention reasons?
- How are minors/guardian relationships handled?
- What happens to audit logs on deletion requests?
- How is rectification tracked?
- How is cross-brand leakage prevented in exports?

## Media boundary

Storage should separate public assets and private records by bucket or prefix:

- `public-assets/` — marketing images, published brand assets.
- `private-media/` — authenticated media.
- `certificate-pdfs/` — private generated PDFs unless explicitly public.
- `claim-evidence/` — lineage/credential evidence; private by default.
- `student-media/` — photos/videos; private by default.

Every private URL should be generated through a server authorization check and short-lived signed URL.

## AI/MCP privacy policy seed

Until a dedicated AI policy lands:

- Do not send raw rosters, waivers, payment records, guardianship details, or private evidence to AI tools by default.
- Redact emails, phone numbers, addresses, dates of birth, payment IDs, and secrets before prompts.
- Require human approval before AI publishes content, sends messages, changes permissions, or mutates payment/identity tables.
- Log AI tool calls without raw private payloads.

## Relationships

- [Security review hub](README.md)
- [Security test plan](security-test-plan.md)
- [Security, Privacy, Payments, and Monitoring Plan](../architecture/security-privacy-payments-monitoring-plan.md)

## Open Questions

- Which certificate fields are allowed in public QR verification responses?
- What is the data retention schedule for minors, audit logs, payment ledgers, and expired memberships?
- Which AI workflows, if any, are allowed to process private school records after redaction?
