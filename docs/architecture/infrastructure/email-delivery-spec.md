---
title: Email Delivery Spec
slug: email-delivery-spec
type: spec
status: active
created: 2026-05-09
updated: 2026-05-28
last_agent: codex-session-0278
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
| BASELINE_MARTIAL_ARTS | `baselinemartialarts.com` | `welcome@baselinemartialarts.com` | ✅ verified |
| BBL | `blackbeltlegacy.com` | `welcome@blackbeltlegacy.com` | ⬜ configure/verify |
| RONIN_DOJO_DESIGN | `ronindojodesign.com` | `welcome@ronindojodesign.com` | ⬜ todo |
| WEKAF | `wekafusa.com` | `welcome@wekafusa.com` | ⬜ todo |

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
8. Set `RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS=welcome@baselinemartialarts.com`
   and `RESEND_SENDER_EMAIL_BBL=welcome@blackbeltlegacy.com` once the BBL domain is verified.
```

## Brand-Aware Sender Resolution

The email client should resolve the `from` address based on the active brand:

```typescript
// lib/email.ts (sketch)
const BRAND_SENDER: Record<Brand, string> = {
  BASELINE_MARTIAL_ARTS: "Baseline Martial Arts <welcome@baselinemartialarts.com>",
  BBL: "Black Belt Legacy <welcome@blackbeltlegacy.com>",
  RONIN_DOJO_DESIGN: "Ronin Dojo Design <welcome@ronindojodesign.com>",
  WEKAF: "WEKAF USA <welcome@wekafusa.com>",
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

**Phase 1 (now):** Single Resend API key, `baselinemartialarts.com` verified, Baseline sends from `welcome@baselinemartialarts.com`.

**Phase 2 (SESSION_0278 start):** Verify `blackbeltlegacy.com` in Resend and set `RESEND_SENDER_EMAIL_BBL=welcome@blackbeltlegacy.com`. The app now resolves sender by brand in `apps/web/lib/email.ts`; single API key can send from any verified domain.

## Environment Variables

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_SENDER_EMAIL=welcome@baselinemartialarts.com  # default / fallback sender
RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS=welcome@baselinemartialarts.com
RESEND_SENDER_EMAIL_BBL=welcome@blackbeltlegacy.com

# Optional future senders
RESEND_SENDER_EMAIL_RONIN_DOJO_DESIGN=welcome@ronindojodesign.com
RESEND_SENDER_EMAIL_WEKAF=welcome@wekafusa.com
```

## Monitoring

- Resend dashboard: delivery rates, bounces, complaints
- Webhook (optional): Resend can POST delivery events back to the app
- Alert threshold: bounce rate > 5% → investigate domain reputation
