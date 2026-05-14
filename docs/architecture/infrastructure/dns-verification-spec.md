---
title: DNS Verification Spec
slug: dns-verification-spec
type: spec
status: active
created: 2026-05-09
updated: 2026-05-14
last_agent: codex-session-0163
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
  - docs/sprints/SESSION_0163.md
tags:
  - infrastructure
  - dns
  - verification
---

# DNS Verification Spec

All DNS records needed per domain for the Ronin Dojo platform. Records are managed in **Bluehost cPanel → Zone Editor** for all domains.

## Source-of-Truth Note

Baseline Resend DNS was verified in the Resend dashboard on 2026-05-13 15:04 using DKIM TXT at `resend._domainkey`, outbound MX at `send`, outbound SPF TXT at `send`, and inbound MX at the apex. Live Resend public docs checked on 2026-05-14 can show alternate tokenized examples, including DKIM CNAME examples. For this repo, the per-domain Resend dashboard/API record list is authoritative when examples differ.

See the operator flows in [Vercel Domain Setup Runbook](../../runbooks/vercel-domain-setup-runbook.md) and [Resend Setup Runbook](../../runbooks/resend-setup-runbook.md).

## DNS Records by Service

### 1. Vercel (app hosting)

Each domain pointed to Vercel needs either:

| Record Type | Name | Value | TTL | Notes |
|---|---|---|---|---|
| A | `@` | Dashboard value, currently `216.198.79.1` for Baseline | 300 | Vercel anycast IP; trust the project Domains page |
| CNAME | `www` | `cname.vercel-dns.com` | 300 | www redirect |

Or (if registrar supports CNAME flattening at apex):

| Record Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `@` | `cname.vercel-dns.com` | 300 |

> **Note:** Bluehost supports A records at apex. Use the A record approach.

### 2. Resend (transactional email)

Resend requires domain verification before sending. Per verified domain, copy the exact records shown in Resend for that domain. The verified Baseline pattern is:

| Record Type | Name | Value | Notes |
|---|---|---|---|
| TXT | `resend._domainkey` | Full `p=...` value from Resend | DKIM signing; copy the full per-domain key |
| MX | `send` | `feedback-smtp.<region>.amazonses.com` | Outbound sending feedback path |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF for Resend/SES sending |
| MX | `@` | `inbound-smtp.<region>.amazonaws.com` | Optional inbound mail handling; add only when Resend receiving is enabled/requested |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@{domain}` | DMARC policy |

Legacy ownership-token TXT rows and legacy return-path CNAME rows are not part of the verified Baseline active setup. Remove them if they are still present in Bluehost unless the current Resend dashboard for that domain explicitly requests them.

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
│ A        │ @                        │ 216.198.79.1                            │ ✅ live │
│ CNAME    │ www                      │ cname.vercel-dns.com                   │ ✅ live │
│ TXT      │ resend._domainkey        │ full p=... value from Resend           │ ✅ live │
│ MX       │ send                     │ feedback-smtp.us-east-1.amazonses.com  │ ✅ live │
│ TXT      │ send                     │ v=spf1 include:amazonses.com ~all      │ ✅ live │
│ MX       │ @                        │ inbound-smtp.us-east-1.amazonaws.com   │ ✅ live — receiving enabled │
│ TXT      │ _dmarc                   │ v=DMARC1; p=none; ...                  │ ⬜ todo │
└──────────┴──────────────────────────┴────────────────────────────────────────┴────────┘
```

### `ronindojodesign.com` (Phase 2)

```
┌──────────┬──────────────────────────┬────────────────────────────────────────┬────────┐
│ Type     │ Name                     │ Value                                  │ Status │
├──────────┼──────────────────────────┼────────────────────────────────────────┼────────┤
│ A        │ @                        │ Vercel dashboard value                 │ ⬜ todo │
│ CNAME    │ www                      │ cname.vercel-dns.com                   │ ⬜ todo │
│ TXT      │ resend._domainkey        │ full p=... value from Resend           │ ⬜ todo │
│ MX       │ send                     │ feedback-smtp.<region>.amazonses.com   │ ⬜ todo │
│ TXT      │ send                     │ v=spf1 include:amazonses.com ~all      │ ⬜ todo │
│ MX       │ @                        │ inbound-smtp.<region>.amazonaws.com    │ optional — receiving only │
│ TXT      │ _dmarc                   │ v=DMARC1; p=none; ...                  │ ⬜ todo │
└──────────┴──────────────────────────┴────────────────────────────────────────┴────────┘
```

### `wekafusa.com` / `usastickfighting.com` (Phase 3)

Same pattern. `usastickfighting.com` gets a redirect (301) to `wekafusa.com` — either via Bluehost redirect or Vercel rewrite rule.

### `blackbeltlegacy.com` (Phase 4)

Currently pointed at Flywheel nameservers. DNS migration requires:
1. Move nameservers back to Bluehost (preferred per ADR 0015; Vercel DNS only if ADR 0015 changes)
2. Add Vercel + Resend records
3. Cancel Flywheel hosting

## Verification Commands

```bash
# Check A record
dig +short baselinemartialarts.com A

# Check CNAME
dig +short www.baselinemartialarts.com CNAME

# Check TXT (SPF)
dig +short send.baselinemartialarts.com TXT

# Check DKIM
dig +short resend._domainkey.baselinemartialarts.com TXT

# Check Resend sending MX
dig +short send.baselinemartialarts.com MX

# Check inbound MX only when Resend receiving is enabled for this domain
dig +short baselinemartialarts.com MX

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
│ BMA.com  │     │ 216.198.79.1 │     │ routes  │     │ host→brand   │
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
