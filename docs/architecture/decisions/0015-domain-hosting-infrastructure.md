---
title: "ADR 0015 — Domain Hosting Infrastructure"
slug: adr-0015
type: adr
status: accepted
created: 2026-05-09
updated: 2026-06-04
last_agent: codex-session-0343
pairs_with:
  - docs/architecture/decisions/0006-multi-domain-hosting.md
  - docs/architecture/infrastructure/domain-hosting-registry.md
  - docs/runbooks/deploy/vercel-domain-setup-runbook.md
  - docs/runbooks/deploy/bbl-production-runbook.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0159.md
  - docs/sprints/SESSION_0160.md
  - docs/sprints/SESSION_0343.md
---

# ADR 0015 — Domain Hosting Infrastructure

**Status:** Accepted
**Date:** 2026-05-09

## Context

The Ronin Dojo platform serves four brands across six domains. Legacy infrastructure uses Bluehost shared hosting (WordPress) for five domains and Flywheel managed WordPress for BBL. The legacy deploy process used SSH + rsync to push WordPress themes/plugins to Bluehost.

With the migration to Next.js on Vercel (ADR 0006), the legacy deploy scripts are obsolete. We need to document:
1. The current state of all domains and hosting providers
2. The migration path from legacy hosting to Vercel
3. DNS records required for Vercel, Resend, and other services
4. What happens to Bluehost and Flywheel after migration

## Decision

### 1. No SSH deploy scripts in the new stack

The legacy `rsync`-over-SSH deployment pattern is dead. The new stack deploys automatically via Vercel on push to `main`. No SSH keys, no rsync scripts, no cPanel deployments.

### 2. Bluehost retained as DNS registrar

All domains remain registered at Bluehost. DNS records are managed via Bluehost cPanel Zone Editor. We update A/CNAME records to point to Vercel when each brand migrates. Bluehost hosting (shared WordPress) is decommissioned per-domain as each brand goes live on Vercel.

### 3. Flywheel decommissioned after BBL migration

`blackbeltlegacy.com` stays on Flywheel until BBL data migration (ADR 0007) is complete. After migration,
DNS points to Vercel and Flywheel hosting is cancelled.

**SESSION_0343 clarification:** read-only DNS recon and operator confirmation showed `blackbeltlegacy.com`
already delegates to `ns1.bluehost.com` / `ns2.bluehost.com`. Flywheel is the WordPress origin behind
Fastly (`151.101.66.159`), not the DNS authority. Therefore BBL cutover does **not** require a nameserver
reversion; it requires record edits at Bluehost, with rollback to the prior Flywheel/Fastly apex value.

### 4. Domain migration follows brand build order

Per program plan: Baseline Martial Arts → Ronin Dojo Design → WEKAF → BBL. Each domain cuts over to Vercel independently. Redirect domains (`tuffbuffs.com` → BMA, `usastickfighting.com` → WEKAF) are configured as 301 redirects.

### 5. Single Resend account, multi-domain

One Resend API key serves all brands. Each brand's sending domain is verified independently in Resend. Phase 1: verify `baselinemartialarts.com` only. Phase 2+: verify remaining domains as brands go live.

## Consequences

**Positive**

- Clean break from legacy WordPress deploy tooling
- Domain migration is incremental and reversible (just change DNS back)
- Single API key for email across all brands reduces credential management

**Negative**

- Bluehost cPanel is the DNS management UI — not ideal but functional
- During transition, some domains serve legacy WordPress while others serve Vercel — users could see inconsistent experiences across brands
- Flywheel cancellation is blocked on BBL data migration (potentially months out)

## Supersedes

- All legacy SSH/rsync deploy scripts from `ronin-dojo-monorepo`
- Any WordPress deployment automation
