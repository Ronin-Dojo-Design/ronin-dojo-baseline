---
title: "Ronin Security Review"
slug: ronin-security-review
type: index
status: active
created: 2026-05-31
updated: 2026-05-31
last_agent: codex-session-0313
pairs_with:
  - docs/knowledge/wiki/manual-boundary-registry.md
  - docs/security/ronin-security-risk-register.md
  - docs/security/brand-scope-hardening-plan.md
  - docs/security/payment-security-checklist.md
  - docs/security/privacy-data-classification.md
  - docs/security/security-test-plan.md
  - docs/architecture/security-privacy-payments-monitoring-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0313.md
---

# Ronin Security Review

## Summary

Ronin Dojo Baseline is no longer a casual marketing-site codebase. It is a multi-brand SaaS-style platform with identity, memberships, lineage, curriculum, media, payments, certificates, merchandise, tournaments, school administration, and privacy workflows.

This security pack translates the SESSION_0313 review into a hardening roadmap. It does not change runtime behavior. It records where the repo already has strong controls and where the next implementation PRs should focus.

Security maturity snapshot: **7.8 / 10**. The repo has meaningful security design already, but it is not yet launch-hardened for payments, minors-adjacent records, private member records, or multi-tenant white-label school data.

## Current security model

Use six security functions as the organizing model:

1. **Govern** — ownership, risk register, security gates, incident roles.
2. **Identify** — know data types, tenant boundaries, integrations, and secrets.
3. **Protect** — access control, encryption, rate limits, secure sessions, safe payments.
4. **Detect** — logs, anomaly alerts, webhook failure alerts, brand-scope rejection monitoring.
5. **Respond** — incident runbooks for Stripe, database, account, media, and brand-scope compromise.
6. **Recover** — backups, restore drills, rollback, account recovery, export/delete workflows.

## What is already good

- Centralized env validation exists in `apps/web/env.ts` and separates server-only secrets from `NEXT_PUBLIC_*` variables.
- Centralized host-to-brand resolution exists in `apps/web/lib/brand-context.ts`, and `apps/web/proxy.ts` overwrites `x-brand` before forwarding requests.
- Better Auth is centralized in `apps/web/lib/auth.ts`; the auth architecture also documents the relationship between Passport, DirectoryProfile, Membership, and brand/org-scoped authorization.
- Safe-action clients exist for public, user, admin, tournament-admin, and media-upload actions.
- `apps/web/lib/authz.ts` centralizes role/org authorization helpers and explicitly describes a brand-scope extension as defense-in-depth.
- Central rate-limit buckets exist in `apps/web/lib/rate-limiter.ts`.
- The Stripe webhook route verifies signatures, persists event IDs, and handles fulfillment idempotently.
- `AuditLog` and `DataSubjectRequest` models already exist in Prisma.
- The existing architecture plan already says private media/certificates require private objects or signed access, and financial data must not store raw card data.

## Highest-priority gaps

The near-term risk is not lack of security intent. The risk is that some controls are documented better than they are enforced globally.

1. **Runtime brand-scope DB enforcement is the central risk.** `apps/web/services/db.ts` currently wires `uniqueSlugsExtension`, but not a brand-scope Prisma/client extension.
2. **Security headers / CSP are not evident as a global launch gate.** Add CSP, HSTS, frame controls, referrer policy, permissions policy, and content-type protection.
3. **Admin route protection must not depend on cookie presence.** Middleware UX gating is useful, but pages/actions/queries need server-side authorization.
4. **Production secrets are optional.** Feature-gated env validation should require Stripe, Redis, S3, Printful, Resend, Plausible, and AI secrets when those features are enabled.
5. **Rate limiting currently fails open.** That is acceptable for low-risk marketing UX, not for login, OTP/magic links, invite creation, claims, payments, scraping-prone verification, or admin destructive actions.
6. **Private media boundaries need proof.** Public storage is only acceptable for public marketing assets.
7. **Logs and production errors need redaction.** Logs must not become a shadow database of PII, addresses, order payloads, tokens, or webhook payloads.

## Documentation map

- [Risk register](ronin-security-risk-register.md) — priority risks, severity, current state, and target fix.
- [Brand-scope hardening plan](brand-scope-hardening-plan.md) — follow-up implementation plan for runtime brand isolation.
- [Payment security checklist](payment-security-checklist.md) — Stripe/payment controls and reconciliation checklist.
- [Privacy data classification](privacy-data-classification.md) — enforceable data classes, boundaries, and retention notes.
- [Security test plan](security-test-plan.md) — cross-brand, access-control, payment, privacy, logging, and environment tests.

## Graphify/Codex environment note

SESSION_0313 attempted the required Graphify-first discovery flow, but this Codex cloud workspace did not have `graphify` installed and did not include `.graphify/` or `graphify-out/` artifacts. Before future search-heavy security implementation work, set up Codex cloud images with:

```bash
sudo npm install -g @nodesify/graphify
sudo ln -sf /usr/local/lib/node_modules/@nodesify/graphify/dist/index.js /usr/local/bin/graphify
graphify --version
graphify run .
```

If global installs are not allowed, add a repo-local script that wraps `npx @nodesify/graphify` and writes `.graphify/graph_report.md` / `.graphify/graph.json` before the session starts. Do not commit generated graph output unless the team explicitly decides to version it.

## Relationships

- Parent architecture plan: [Security, Privacy, Payments, and Monitoring Plan](../architecture/security-privacy-payments-monitoring-plan.md)
- Auth architecture: [Auth Architecture](../architecture/auth.md)
- Multi-brand decision: [ADR 0004 — Multi-brand as column](../architecture/decisions/0004-multi-brand-as-column.md)
- Brand magic links: [ADR 0021 — Brand-aware magic links](../architecture/decisions/0021-brand-aware-magic-links.md)
- Brand chrome resolution: [ADR 0022 — Brand Chrome Resolution](../architecture/decisions/0022-brand-chrome-resolution.md)
- Session ledger: [SESSION 0313](../sprints/SESSION_0313.md)
- Manual launch boundaries: [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md)

## Open Questions

- Should the first implementation PR use a Prisma `$extends` model query extension, a `brandScopedDb(brand, user)` wrapper, or both?
- Which endpoints should fail closed immediately when Redis is unavailable?
- Which private media paths already exist in production storage and need migration to signed access?
- What retention policy applies to audit logs, payment ledgers, student records, DSRs, certificates, and webhook events?
