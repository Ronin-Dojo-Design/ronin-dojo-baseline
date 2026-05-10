---
title: Email Delivery Spec
slug: email-delivery-spec
type: spec
status: active
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0114
pairs_with:
  - docs/architecture/infrastructure/dns-verification-spec.md
  - docs/architecture/infrastructure/domain-hosting-registry.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/infrastructure/README.md
tags:
  - infrastructure
  - email
  - resend
---

# Email Delivery Spec

Transactional email configuration for all Ronin Dojo brands via [Resend](https://resend.com).

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        EMAIL DELIVERY FLOW                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Next.js App                                                       │
│  ┌──────────────────┐                                              │
│  │ Server Action /   │                                              │
│  │ Webhook handler   │                                              │
│  │                   │                                              │
│  │ notifyCustomer()  │──────┐                                       │
│  │ sendMagicLink()   │      │                                       │
│  └──────────────────┘      │                                       │
│                             ▼                                       │
│                    ┌──────────────────┐                              │
│                    │ lib/email.ts     │                              │
│                    │ (Resend client)  │                              │
│                    │                  │                              │
│                    │ from: resolved   │                              │
│                    │ per brand via    │                              │
│                    │ SENDER_MAP       │                              │
│                    └────────┬─────────┘                              │
│                             │                                       │
│                             ▼                                       │
│                    ┌──────────────────┐     ┌──────────────────┐    │
│                    │ Resend API       │────▶│ Amazon SES       │    │
│                    │ (api key auth)   │     │ (delivery layer) │    │
│                    └──────────────────┘     └────────┬─────────┘    │
│                                                      │              │
│                                                      ▼              │
│                                              ┌──────────────┐       │
│                                              │ Recipient    │       │
│                                              │ inbox        │       │
│                                              └──────────────┘       │
└────────────────────────────────────────────────────────────────────┘
```

## Per-Brand Sender Configuration

| Brand | Sending domain | From address | Verified? |
|---|---|---|---|
| BASELINE_MARTIAL_ARTS | `baselinemartialarts.com` | `hello@baselinemartialarts.com` | ⬜ todo |
| RONIN_DOJO_DESIGN | `ronindojodesign.com` | `hello@ronindojodesign.com` | ⬜ todo |
| WEKAF | `wekafusa.com` | `hello@wekafusa.com` | ⬜ todo |
| BBL | `blackbeltlegacy.com` | `hello@blackbeltlegacy.com` | ⬜ todo |

## Resend Account Setup Steps

```
1. Create account at https://resend.com
2. Dashboard → Domains → Add Domain
3. Enter domain (e.g., baselinemartialarts.com)
4. Resend shows required DNS records:
   - TXT (verification)
   - CNAME (DKIM)
   - CNAME (return-path)
5. Add records in Bluehost cPanel → Zone Editor
6. Click "Verify" in Resend dashboard
7. Copy API key → add to .env as RESEND_API_KEY
8. Set RESEND_SENDER_EMAIL=hello@baselinemartialarts.com
```

## Brand-Aware Sender Resolution

The email client should resolve the `from` address based on the active brand:

```typescript
// lib/email.ts (sketch)
const BRAND_SENDER: Record<Brand, string> = {
  BASELINE_MARTIAL_ARTS: "Baseline Martial Arts <hello@baselinemartialarts.com>",
  RONIN_DOJO_DESIGN: "Ronin Dojo Design <hello@ronindojodesign.com>",
  WEKAF: "WEKAF USA <hello@wekafusa.com>",
  BBL: "Black Belt Legacy <hello@blackbeltlegacy.com>",
};
```

## Email Templates (existing)

| Template | File | Used by |
|---|---|---|
| Magic link login | `emails/magic-link.tsx` | Better-Auth sign-in |
| Merch order confirmation | `emails/merch-order-confirmation.tsx` | Stripe webhook (SESSION_0113) |
| Admin submission premium | `emails/admin-submission-premium.tsx` | Admin notifications |
| Submission premium | `emails/submission-premium.tsx` | User notifications |

## Multi-Domain Strategy

**Phase 1 (now):** Single Resend API key, verify `baselinemartialarts.com` only. All emails send from BMA domain regardless of brand.

**Phase 2 (post-launch):** Verify all brand domains in Resend. Update `BRAND_SENDER` map. Single API key can send from any verified domain.

## Environment Variables

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_SENDER_EMAIL=hello@baselinemartialarts.com  # default sender

# Future: per-brand senders resolved in code, not env vars
```

## Monitoring

- Resend dashboard: delivery rates, bounces, complaints
- Webhook (optional): Resend can POST delivery events back to the app
- Alert threshold: bounce rate > 5% → investigate domain reputation
