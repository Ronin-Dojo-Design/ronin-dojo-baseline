---
title: DNS Verification Spec
slug: dns-verification-spec
type: spec
status: active
created: 2026-05-09
updated: 2026-05-13
last_agent: claude-session-0160
pairs_with:
  - docs/architecture/infrastructure/domain-hosting-registry.md
  - docs/architecture/infrastructure/email-delivery-spec.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/runbooks/resend-setup-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/infrastructure/README.md
  - docs/sprints/SESSION_0159.md
  - docs/sprints/SESSION_0160.md
tags:
  - infrastructure
  - dns
  - verification
---

# DNS Verification Spec

All DNS records needed per domain for the Ronin Dojo platform. Records are managed in **Bluehost cPanel → Zone Editor** for all domains.

## DNS Records by Service

### 1. Vercel (app hosting)

Each domain pointed to Vercel needs either:

| Record Type | Name | Value | TTL | Notes |
|---|---|---|---|---|
| A | `@` | `76.76.21.21` | 300 | Vercel's anycast IP |
| CNAME | `www` | `cname.vercel-dns.com` | 300 | www redirect |

Or (if registrar supports CNAME flattening at apex):

| Record Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `@` | `cname.vercel-dns.com` | 300 |

> **Note:** Bluehost supports A records at apex. Use the A record approach.

### 2. Resend (transactional email)

Resend requires domain verification before sending. Per verified domain:

| Record Type | Name | Value | Notes |
|---|---|---|---|
| TXT | `@` or subdomain | `resend-verification=rv_xxxx` | Domain ownership proof |
| CNAME | `resend._domainkey` | `resend._domainkey.resend.dev` | DKIM signing |
| CNAME | `em.{domain}` | Provided by Resend | Return-path for SPF alignment |
| TXT | `@` | `v=spf1 include:amazonses.com ~all` | SPF (Resend uses SES) |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@{domain}` | DMARC policy |

### 3. Google OAuth (no DNS needed)

Google OAuth uses redirect URIs, not DNS records. Configure in Google Cloud Console:

```
Authorized redirect URI per domain:
  https://baselinemartialarts.com/api/auth/callback/google
  https://ronindojodesign.com/api/auth/callback/google
  https://wekafusa.com/api/auth/callback/google
  https://blackbeltlegacy.com/api/auth/callback/google
```

### 4. Stripe (no DNS needed)

Stripe uses API keys and webhook endpoints, not DNS. Webhook endpoint configured in Stripe Dashboard.

## Per-Domain DNS Record Matrix

### `baselinemartialarts.com` (Phase 1 — first)

```
┌──────────┬──────────────────────────┬────────────────────────────────────────┬────────┐
│ Type     │ Name                     │ Value                                  │ Status │
├──────────┼──────────────────────────┼────────────────────────────────────────┼────────┤
│ A        │ @                        │ 76.76.21.21                            │ ⬜ todo │
│ CNAME    │ www                      │ cname.vercel-dns.com                   │ ⬜ todo │
│ TXT      │ @                        │ resend-verification=rv_xxxx            │ ⬜ todo │
│ CNAME    │ resend._domainkey        │ resend._domainkey.resend.dev           │ ⬜ todo │
│ CNAME    │ em.baselinemartialarts   │ (from Resend dashboard)                │ ⬜ todo │
│ TXT      │ @                        │ v=spf1 include:amazonses.com ~all      │ ⬜ todo │
│ TXT      │ _dmarc                   │ v=DMARC1; p=none; ...                  │ ⬜ todo │
└──────────┴──────────────────────────┴────────────────────────────────────────┴────────┘
```

### `ronindojodesign.com` (Phase 2)

```
┌──────────┬──────────────────────────┬────────────────────────────────────────┬────────┐
│ Type     │ Name                     │ Value                                  │ Status │
├──────────┼──────────────────────────┼────────────────────────────────────────┼────────┤
│ A        │ @                        │ 76.76.21.21                            │ ⬜ todo │
│ CNAME    │ www                      │ cname.vercel-dns.com                   │ ⬜ todo │
│ TXT      │ @                        │ resend-verification=rv_xxxx            │ ⬜ todo │
│ CNAME    │ resend._domainkey        │ resend._domainkey.resend.dev           │ ⬜ todo │
│ TXT      │ @                        │ v=spf1 include:amazonses.com ~all      │ ⬜ todo │
│ TXT      │ _dmarc                   │ v=DMARC1; p=none; ...                  │ ⬜ todo │
└──────────┴──────────────────────────┴────────────────────────────────────────┴────────┘
```

### `wekafusa.com` / `usastickfighting.com` (Phase 3)

Same pattern. `usastickfighting.com` gets a redirect (301) to `wekafusa.com` — either via Bluehost redirect or Vercel rewrite rule.

### `blackbeltlegacy.com` (Phase 4)

Currently pointed at Flywheel nameservers. DNS migration requires:
1. Move nameservers back to Bluehost (or to Vercel DNS)
2. Add Vercel + Resend records
3. Cancel Flywheel hosting

## Verification Commands

```bash
# Check A record
dig +short baselinemartialarts.com A

# Check CNAME
dig +short www.baselinemartialarts.com CNAME

# Check TXT (SPF)
dig +short baselinemartialarts.com TXT

# Check DKIM
dig +short resend._domainkey.baselinemartialarts.com CNAME

# Check DMARC
dig +short _dmarc.baselinemartialarts.com TXT

# Check propagation (external)
# https://www.whatsmydns.net/#A/baselinemartialarts.com
```

## Data Flow: DNS Resolution → App

```
┌──────────┐     ┌──────────────┐     ┌─────────┐     ┌──────────────┐
│  Browser │────▶│ DNS Resolver  │────▶│ Vercel  │────▶│ Next.js App  │
│          │     │              │     │ Edge    │     │              │
│ user hits│     │ A record →   │     │         │     │ middleware   │
│ BMA.com  │     │ 76.76.21.21  │     │ routes  │     │ host→brand   │
│          │     │              │     │ to app  │     │ resolution   │
└──────────┘     └──────────────┘     └─────────┘     └──────────────┘
                                                            │
                                                            ▼
                                                      ┌──────────┐
                                                      │ Brand =  │
                                                      │ BASELINE │
                                                      │_MARTIAL_ │
                                                      │  ARTS    │
                                                      └──────────┘
```
