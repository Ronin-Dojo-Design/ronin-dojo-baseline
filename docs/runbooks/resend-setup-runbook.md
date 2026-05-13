---
title: Resend Setup Runbook
slug: resend-setup-runbook
type: runbook
status: active
created: 2026-05-09
updated: 2026-05-13
last_agent: claude-session-0160
pairs_with:
  - docs/architecture/infrastructure/email-delivery-spec.md
  - docs/architecture/infrastructure/dns-verification-spec.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/vercel-domain-setup-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/infrastructure/README.md
  - docs/sprints/SESSION_0159.md
  - docs/sprints/SESSION_0160.md
tags:
  - resend
  - email
  - runbook
  - infrastructure
---

# Resend Setup Runbook

Step-by-step operator guide for configuring Resend transactional email for the Ronin Dojo platform.

## Prerequisites

- Bluehost cPanel access (DNS management)
- Credit card for Resend account (free tier: 3,000 emails/month)
- Access to `.env` in `apps/web/`

## Architecture Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RESEND INTEGRATION POINTS                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  apps/web/                                                          │
│  ├── env.ts ─────────────── RESEND_API_KEY, RESEND_SENDER_EMAIL    │
│  ├── lib/                                                           │
│  │   ├── email.ts ───────── Resend client (sends via API)          │
│  │   └── notifications.ts ─ notifyCustomerOfMerchOrder()           │
│  │                           notifyAdminOfPremiumTool()             │
│  │                           notifySubmitterOfPremiumTool()         │
│  ├── emails/ ────────────── React Email templates                   │
│  │   ├── magic-link.tsx                                             │
│  │   ├── merch-order-confirmation.tsx                               │
│  │   ├── admin-submission-premium.tsx                               │
│  │   └── submission-premium.tsx                                     │
│  └── app/api/stripe/webhooks/route.ts                               │
│       └── merch_purchase handler → after() → notifyCustomer()      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step

### 1. Create Resend account

```
1. Go to https://resend.com/signup
2. Sign up with Brian's email
3. Verify email address
4. Land on Resend dashboard
```

### 2. Add sending domain

```
Resend Dashboard → Domains → Add Domain

Domain: baselinemartialarts.com
Region: US (default)

Resend will display required DNS records:
┌──────────┬──────────────────────────┬────────────────────────────────┐
│ Type     │ Name                     │ Value                          │
├──────────┼──────────────────────────┼────────────────────────────────┤
│ TXT      │ @ or _resend             │ resend-verification=rv_xxxx    │
│ CNAME    │ resend._domainkey        │ resend._domainkey.resend.dev   │
│ CNAME    │ em.baselinemartialarts   │ (provided by Resend)           │
│ TXT      │ @                        │ v=spf1 include:amazonses...    │
│ TXT      │ _dmarc                   │ v=DMARC1; p=none; ...          │
└──────────┴──────────────────────────┴────────────────────────────────┘

⚠️ Copy these values EXACTLY — don't close this page until DNS is added.
```

### 3. Add DNS records in Bluehost

```
1. Log in to Bluehost → cPanel
2. Go to Zone Editor (under Domains)
3. Select baselinemartialarts.com
4. Add each record from Resend:

   For TXT records:
   ┌─────────────────────────────────────────┐
   │ Type: TXT                               │
   │ Name: baselinemartialarts.com            │
   │ TTL: 14400                              │
   │ TXT Data: (paste from Resend)           │
   └─────────────────────────────────────────┘

   For CNAME records:
   ┌─────────────────────────────────────────┐
   │ Type: CNAME                             │
   │ Name: resend._domainkey                 │
   │ TTL: 14400                              │
   │ CNAME: resend._domainkey.resend.dev     │
   └─────────────────────────────────────────┘

5. Save all records
```

### 4. Verify domain in Resend

```
1. Back in Resend Dashboard → Domains
2. Click "Verify" next to baselinemartialarts.com
3. Wait for green checkmark (usually < 5 min, can take up to 48h)

Verify from terminal:
  dig +short resend._domainkey.baselinemartialarts.com CNAME
  dig +short baselinemartialarts.com TXT | grep resend
```

### 5. Generate API key

```
Resend Dashboard → API Keys → Create API Key

Name: ronin-dojo-production
Permission: Full access (or Sending access only)

Copy the key — it's shown only once.
```

### 6. Update environment variables

```bash
# apps/web/.env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_SENDER_EMAIL=hello@baselinemartialarts.com
```

### 7. Test email delivery

```
End-to-end test flow:

1. Start dev server:  cd apps/web && bun dev
2. Start Stripe listener:  stripe listen --forward-to localhost:3001/api/stripe/webhooks
3. Place a merch order through checkout
4. Stripe webhook fires → merch_purchase handler → notifyCustomerOfMerchOrder()
5. Check inbox for order confirmation email

Expected result:
┌─────────────────────────────────────────────┐
│ From: Baseline Martial Arts                  │
│       <hello@baselinemartialarts.com>        │
│ Subject: Order Confirmation — TuffBuffs ...  │
│ Body: React Email rendered template          │
└─────────────────────────────────────────────┘
```

### 8. Verify in Resend dashboard

```
Resend Dashboard → Emails
- Should show the sent email with delivery status
- Check: Delivered (not bounced/complained)
```

## Troubleshooting

```
┌─────────────────────────────────┬─────────────────────────────────────────┐
│ Symptom                         │ Fix                                     │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ "Domain not verified" error     │ Check DNS records in Bluehost cPanel    │
│                                 │ Wait for propagation (up to 48h)        │
│                                 │ Run: dig +short TXT baselinemart...     │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Email sent but not received     │ Check spam/junk folder                  │
│                                 │ Check Resend dashboard for bounces      │
│                                 │ Verify SPF + DKIM records               │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ "Invalid API key" error         │ Re-copy from Resend dashboard           │
│                                 │ Check .env is loaded (restart dev)      │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Email arrives but "from" wrong  │ Check RESEND_SENDER_EMAIL matches       │
│                                 │ verified domain                         │
└─────────────────────────────────┴─────────────────────────────────────────┘
```

## Vercel Production

After local testing works:

```
1. Vercel Dashboard → Settings → Environment Variables
2. Add:
   RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxx
   RESEND_SENDER_EMAIL = hello@baselinemartialarts.com
3. Redeploy (or push to main)
4. Test: place a real order on production
```

## Phase 2: Additional brand domains

Repeat steps 2–4 for each brand domain as it goes live:

- `ronindojodesign.com`
- `wekafusa.com`
- `blackbeltlegacy.com`

Single API key works for all verified domains. Update `BRAND_SENDER` map in `lib/email.ts`.
