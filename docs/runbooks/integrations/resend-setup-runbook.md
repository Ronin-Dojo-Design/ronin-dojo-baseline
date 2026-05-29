---
title: Resend Setup Runbook
slug: resend-setup-runbook
type: runbook
status: active
created: 2026-05-09
updated: 2026-05-28
last_agent: codex-session-0278
pairs_with:
  - docs/architecture/infrastructure/email-delivery-spec.md
  - docs/architecture/infrastructure/dns-verification-spec.md
  - docs/runbooks/sop-e2e-user-lifecycle.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/knowledge/wiki/manual-boundary-registry.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/infrastructure/README.md
  - docs/sprints/SESSION_0159.md
  - docs/sprints/SESSION_0160.md
  - docs/sprints/SESSION_0163.md
  - docs/sprints/SESSION_0257.md
  - docs/sprints/SESSION_0258.md
  - docs/sprints/SESSION_0259.md
  - docs/sprints/SESSION_0260.md
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

> Updated SESSION_0260 — Resend now backs the full transactional surface added across
> SESSION_0257 (DSR), SESSION_0258 (admin membership + invite + Stripe tournament),
> SESSION_0259 (self-service membership welcome + owner transitions), and
> SESSION_0260 (admin walk-in tournament registration). All helpers route through
> `lib/notifications.ts` and gate on `shouldSkipForRateLimit`. The canonical
> lifecycle-event → template → trigger-location table lives in
> [SOP §16](../sops/sop-e2e-user-lifecycle.md#16-transactional-email-touchpoints) — keep that
> table authoritative, this runbook only lists the integration points.

```text
apps/web/
├── env.ts ─────────────── RESEND_API_KEY, RESEND_SENDER_EMAIL, per-brand sender vars
├── lib/
│   ├── email.ts ───────── Resend client (brand-aware sender + plain-text render)
│   ├── notifications.ts ─ 14+ notify helpers, rate-limit-gated boundary
│   └── rate-limiter.ts ── email_notify limiter (3/5min per template+recipient)
├── emails/ ────────────── React Email templates
│   ├── dsr-submission-confirmation.tsx
│   ├── dsr-status-update.tsx
│   ├── bbl-join-legacy-confirmation.tsx / admin-bbl-join-legacy.tsx
│   ├── invite-notification.tsx
│   ├── magic-link.tsx
│   ├── membership-status-change.tsx
│   ├── membership-welcome.tsx
│   ├── merch-order-confirmation.tsx
│   ├── merch-shipment-notification.tsx
│   ├── submission.tsx / submission-scheduled.tsx / submission-published.tsx
│   ├── submission-premium.tsx / admin-submission-premium.tsx
│   └── tournament-registration-confirmation.tsx
├── scripts/
│   └── send-resend-production-test.tsx ── MB-015 proof script (SESSION_0260)
└── app/api/
    ├── stripe/webhooks/route.ts ── fulfillMerchOrder + fulfillTournamentRegistration
    └── printful/webhooks/route.ts ── package_shipped / order_failed handlers
```

## Current DNS Source Note

Baseline Resend DNS was verified in the Resend dashboard on 2026-05-13 15:04. The live Baseline shape is DKIM TXT at `resend._domainkey`, outbound MX at `send`, outbound SPF TXT at `send`, and inbound MX at the apex. Live Resend public docs checked on 2026-05-14 can show alternate tokenized examples, including DKIM CNAME examples; copy the exact per-domain records from the Resend dashboard/API when they differ from examples.

Cross-check the shared record reference in [DNS Verification Spec](../../architecture/infrastructure/dns-verification-spec.md) and the Bluehost/Vercel application flow in [Vercel Domain Setup Runbook](../deploy/vercel-domain-setup-runbook.md).

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
│ TXT      │ resend._domainkey        │ full p=... DKIM value          │
│ MX       │ send                     │ feedback-smtp.<region>...      │
│ TXT      │ send                     │ v=spf1 include:amazonses...    │
│ TXT      │ _dmarc                   │ v=DMARC1; p=none; ...          │
└──────────┴──────────────────────────┴────────────────────────────────┘

Copy these values exactly. The dashboard/API record list for this domain is the authority, not generic examples in public docs or older runbooks.
If Resend receiving is enabled for the domain, the dashboard may also request an apex inbound MX record. Add that only when requested.

For Black Belt Legacy, repeat the same flow with:

```text
Domain: blackbeltlegacy.com
Sender: welcome@blackbeltlegacy.com
```
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
   │ Name: resend._domainkey or send          │
   │ TTL: 14400                              │
   │ TXT Data: (paste from Resend)           │
   └─────────────────────────────────────────┘

   For MX records:
   ┌─────────────────────────────────────────┐
   │ Type: MX                                │
   │ Name: send                              │
   │ TTL: 14400                              │
   │ Priority: 10                            │
   │ Mail server: (paste from Resend)        │
   └─────────────────────────────────────────┘

   Add an apex inbound MX record only when Resend receiving is enabled and
   the dashboard explicitly requests it.

   Remove older ownership-token TXT rows or legacy return-path CNAME rows
   unless the current Resend dashboard for this domain explicitly requests
   them.

5. Save all records
```

### 4. Verify domain in Resend

```
1. Back in Resend Dashboard → Domains
2. Click "Verify" next to baselinemartialarts.com
3. Wait for green checkmark (usually < 5 min, can take up to 48h)

Verify from terminal:
  dig +short resend._domainkey.baselinemartialarts.com TXT
  dig +short send.baselinemartialarts.com MX
  dig +short send.baselinemartialarts.com TXT
  dig +short baselinemartialarts.com MX  # receiving only
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
RESEND_SENDER_EMAIL=welcome@baselinemartialarts.com
RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS=welcome@baselinemartialarts.com
RESEND_SENDER_EMAIL_BBL=welcome@blackbeltlegacy.com
```

### 7. Test email delivery

Two paths — pick the lighter one (7a) for a key/domain smoke test; use 7b when
you need end-to-end Stripe + webhook coverage.

#### 7a. Quick smoke (MB-015 proof script, SESSION_0260)

```bash
cd apps/web
bun run scripts/send-resend-production-test.tsx your-real-inbox@example.com

# BBL sender proof after blackbeltlegacy.com is verified:
bun run scripts/send-resend-production-test.tsx your-real-inbox@example.com --brand BBL
```

Confirms: live `RESEND_API_KEY` accepted, verified domain renders correct
From/Reply-To headers, plain-text fallback present, no DKIM/SPF rejection.
Leaves a Resend message id in stdout for the MB-015 closure proof.

#### 7b. Full end-to-end (Stripe + merch handler)

```text
1. Start dev server:  cd apps/web && bun dev
2. Start Stripe listener:  stripe listen --forward-to localhost:3001/api/stripe/webhooks
3. Place a merch order through checkout
4. Stripe webhook fires → fulfillMerchOrder → notifyCustomerOfMerchOrder()
5. Check inbox for order confirmation email

Expected result:
┌─────────────────────────────────────────────┐
│ From: Baseline Martial Arts                 │
│       <welcome@baselinemartialarts.com>     │
│ Subject: Order Confirmation — TuffBuffs ... │
│ Body: React Email rendered template         │
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
   RESEND_SENDER_EMAIL = welcome@baselinemartialarts.com
   RESEND_SENDER_EMAIL_BASELINE_MARTIAL_ARTS = welcome@baselinemartialarts.com
   RESEND_SENDER_EMAIL_BBL = welcome@blackbeltlegacy.com
3. Redeploy (or push to main)
4. Test: place a real order on production
```

## Phase 2: Additional brand domains

Repeat steps 2–4 for each brand domain as it goes live:

- `ronindojodesign.com`
- `wekafusa.com`
- `blackbeltlegacy.com`

Single API key works for all verified domains. `apps/web/lib/email.ts` resolves the sender by brand and falls back to the Baseline sender only for Baseline/default contexts. Before sending BBL production email, verify `blackbeltlegacy.com` in Resend and set `RESEND_SENDER_EMAIL_BBL`.
