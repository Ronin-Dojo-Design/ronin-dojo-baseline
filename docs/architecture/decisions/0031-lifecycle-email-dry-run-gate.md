---
title: ADR 0031 — Lifecycle email dry-run gate
slug: adr-0031-lifecycle-email-dry-run-gate
type: decision
status: accepted
created: 2026-06-18
updated: 2026-06-19
last_agent: claude-session-0419
pairs_with:
  - docs/runbooks/sops/sop-email-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - email
  - stripe
  - lifecycle
---

# ADR 0031 — Lifecycle email dry-run gate

## Decision

Membership lifecycle email notifications are routed through `notifyUserOfLifecycleEvent` and are dry-run
by default with `EMAIL_LIFECYCLE_DRYRUN=1`.

## Context

The BBL sender domain is DKIM verified, and webhook retries can invoke notification paths repeatedly.
The launch surface needs real templates and real trigger wiring without allowing accidental live sends
from local, CI, or rehearsal environments.

## Consequences

- `EMAIL_LIFECYCLE_DRYRUN=1` logs lifecycle email intent and returns before `sendEmail`.
- Explicit live sends require `EMAIL_LIFECYCLE_DRYRUN=0`/`false` and the existing Resend sender setup.
- Stripe handlers schedule notifications with `after(...)` and keep all outbound egress in
  `apps/web/lib/notifications.ts` → `apps/web/lib/email.ts`.
- Receipt and renewal-confirmation events share the invoice-paid lifecycle template until product copy
  requires separate presentation.

## Update — SESSION_0419 (2026-06-19): flipped to live in prod

`EMAIL_LIFECYCLE_DRYRUN=0` was set in Vercel **production** and deployed, so lifecycle emails now
actually send in prod. This was triggered by wiring the new `profile-claim-approved` claim-success
email into the library (ADR 0032), which surfaced that the gate was still unset (defaulting to
dry-run) — meaning **no** lifecycle email, including Stripe membership receipts/renewals, had ever
sent in prod. The env var remains the safety mechanism for local / CI / rehearsal (still defaults to
`1`); only production is flipped to `0`. Follow-up: copy-audit the now-live non-claim lifecycle
emails (SESSION_0419 next-session task).
