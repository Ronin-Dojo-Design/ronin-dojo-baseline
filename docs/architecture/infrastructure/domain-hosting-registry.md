---
title: Domain & Hosting Registry
slug: domain-hosting-registry
type: spec
status: active
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0114
pairs_with:
  - docs/architecture/decisions/0006-multi-domain-hosting.md
  - docs/architecture/decisions/0015-domain-hosting-infrastructure.md
  - docs/architecture/infrastructure/dns-verification-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/infrastructure/README.md
tags:
  - infrastructure
  - domains
  - hosting
---

# Domain & Hosting Registry

Master registry of all Ronin Dojo brand domains, their registrars, hosting providers, and migration status.

## Domain Inventory

| Domain | Brand | Registrar | Current Hosting | Target Hosting | Status | Notes |
|---|---|---|---|---|---|---|
| `baselinemartialarts.com` | BASELINE_MARTIAL_ARTS | Bluehost | Bluehost | Vercel (custom domain) | 🟡 migration planned | First brand to go live on new stack |
| `tuffbuffs.com` | BASELINE_MARTIAL_ARTS | Bluehost | Bluehost | Vercel (alias or redirect) | 🔴 legacy | Legacy WordPress; redirects to BMA post-launch |
| `ronindojodesign.com` | RONIN_DOJO_DESIGN | Bluehost | Bluehost | Vercel (custom domain) | 🔴 legacy | Admin/umbrella brand; second priority |
| `wekafusa.com` | WEKAF | Bluehost | Bluehost | Vercel (custom domain) | 🔴 legacy | Greenfield rebuild; last priority |
| `usastickfighting.com` | WEKAF | Bluehost | Bluehost | Vercel (redirect to wekafusa.com) | 🔴 legacy | Alias/redirect domain for WEKAF |
| `blackbeltlegacy.com` | BBL | Bluehost (registrar) | Flywheel (managed WP) | Vercel (custom domain) | 🔴 legacy | Separate Flywheel hosting; migration per ADR 0007 |

## Hosting Provider Details

### Bluehost (current — all domains except BBL hosting)

```
┌─────────────────────────────────────────────────────────┐
│ BLUEHOST SHARED HOSTING                                 │
├─────────────────────────────────────────────────────────┤
│ Account holder: Brian Scott                             │
│ Plan: shared hosting (details TBD)                      │
│ cPanel access: yes                                      │
│ DNS management: Bluehost cPanel → Zone Editor           │
│ SSH access: available but NO LONGER NEEDED              │
│                                                         │
│ Domains on this account:                                │
│   • baselinemartialarts.com                             │
│   • tuffbuffs.com                                       │
│   • ronindojodesign.com                                 │
│   • wekafusa.com                                        │
│   • usastickfighting.com                                │
│   • blackbeltlegacy.com (registrar only — hosted on     │
│     Flywheel)                                           │
│                                                         │
│ Legacy use: WordPress themes/plugins deployed via       │
│ rsync over SSH. NO LONGER ACTIVE — new stack is Vercel. │
│ Bluehost remains as DNS registrar until migration.      │
└─────────────────────────────────────────────────────────┘
```

### Flywheel (BBL only)

```
┌─────────────────────────────────────────────────────────┐
│ FLYWHEEL MANAGED WORDPRESS                              │
├─────────────────────────────────────────────────────────┤
│ Domain: blackbeltlegacy.com                             │
│ Registrar: Bluehost (DNS managed at Bluehost,           │
│   nameservers pointed to Flywheel)                      │
│ Plan: managed WordPress hosting                         │
│ Local dev: Local by Flywheel (macOS app)                │
│                                                         │
│ Status: active legacy site, will migrate to Vercel      │
│ per ADR 0007 (BBL data migration)                       │
└─────────────────────────────────────────────────────────┘
```

### Vercel (target — new stack)

```
┌─────────────────────────────────────────────────────────┐
│ VERCEL                                                  │
├─────────────────────────────────────────────────────────┤
│ Project: ronin-dojo-baseline (linked to GitHub repo)    │
│ Auto-deploy: push to main → production                  │
│ Database: Neon (Postgres 16)                            │
│ SSL: auto-provisioned per custom domain                 │
│                                                         │
│ Custom domains to configure:                            │
│   • baselinemartialarts.com (first)                     │
│   • ronindojodesign.com (second)                        │
│   • wekafusa.com (third)                                │
│   • blackbeltlegacy.com (fourth, post-migration)        │
│                                                         │
│ All domains → single Vercel deployment                  │
│ Host→Brand middleware resolves brand (ADR 0006)         │
└─────────────────────────────────────────────────────────┘
```

## Brand Build Order & Domain Migration Sequence

```
Phase 1: baselinemartialarts.com → Vercel custom domain
         tuffbuffs.com → redirect to baselinemartialarts.com
         (Bluehost DNS: update A/CNAME to Vercel)

Phase 2: ronindojodesign.com → Vercel custom domain
         (Bluehost DNS: update A/CNAME to Vercel)

Phase 3: wekafusa.com → Vercel custom domain
         usastickfighting.com → redirect to wekafusa.com
         (Bluehost DNS: update A/CNAME to Vercel)

Phase 4: blackbeltlegacy.com → Vercel custom domain
         (Bluehost DNS: update A/CNAME to Vercel,
          cancel Flywheel hosting after migration)
```

## Migration Checklist Template (per domain)

```
[ ] Vercel: add custom domain in project settings
[ ] Vercel: note required DNS records (A / CNAME)
[ ] Bluehost: update DNS records in cPanel Zone Editor
[ ] Wait for DNS propagation (check with dig/nslookup)
[ ] Vercel: confirm SSL certificate provisioned
[ ] Verify: site loads at https://<domain>
[ ] Verify: host→brand middleware resolves correct brand
[ ] Verify: Google OAuth redirect URIs updated
[ ] Verify: Resend verified for sending domain
[ ] Verify: Stripe webhook endpoint updated if needed
[ ] Old hosting: disable/remove WordPress site
```
