---
title: ADR 0031 — Lifecycle email dry-run gate
slug: adr-0031-lifecycle-email-dry-run-gate
type: decision
status: accepted
created: 2026-06-18
updated: 2026-06-18
last_agent: codex-session-0411
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
