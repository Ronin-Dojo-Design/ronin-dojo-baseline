---
title: Infrastructure Documentation
slug: infrastructure
type: index
status: active
created: 2026-05-09
updated: 2026-06-06
last_agent: codex-session-0351
pairs_with:
  - docs/runbooks/deployment.md
  - docs/architecture/decisions/0006-multi-domain-hosting.md
  - docs/architecture/decisions/0015-domain-hosting-infrastructure.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Infrastructure Documentation

This folder contains the source-of-truth docs for domain management, hosting providers, DNS configuration, and email delivery infrastructure across all Ronin Dojo brands.

## Contents

| File | Purpose |
| --- | --- |
| [domain-hosting-registry.md](domain-hosting-registry.md) | Master registry of all domains, registrars, hosting providers, and current state |
| [dns-verification-spec.md](dns-verification-spec.md) | DNS records needed for Vercel, Resend, Google OAuth, and Stripe per domain |
| [email-delivery-spec.md](email-delivery-spec.md) | Resend setup, domain verification, sender addresses per brand |
| [hosting-data-flow.md](hosting-data-flow.md) | Request flow diagrams: user → DNS → hosting → app |

## Related

- [ADR 0006 — Multi-domain hosting](../decisions/0006-multi-domain-hosting.md) — single Vercel deploy, host→brand middleware
- [ADR 0015 — Domain hosting infrastructure](../decisions/0015-domain-hosting-infrastructure.md) — Bluehost legacy, Vercel new stack, Flywheel BBL
- [Deployment runbook](../../runbooks/deploy/deployment.md) — Vercel deploy flow + checklist
- [Resend Setup Runbook](../../runbooks/integrations/resend-setup-runbook.md) — step-by-step Resend account + DNS verification
- [Printful POD Integration Spec](../printful-pod-spec.md) — merch fulfillment via Printful API
- [Stripe Setup Runbook](../../runbooks/integrations/stripe-setup-runbook.md) — Stripe dashboard + webhook config
