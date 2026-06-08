---
title: "Velobase Harness — Pattern Backlog for Future Sprints"
slug: velobase-harness-patterns
type: backlog-note
status: active
created: 2026-05-24
updated: 2026-06-06
last_agent: codex-session-0351
backlinks:
  - docs/sprints/SESSION_0241.md
  - docs/architecture/program-plan.md
---

# Velobase Harness — Pattern Backlog

Evaluated `github.com/velobase/velobase-harness` (MIT, Next.js 15 + Prisma + Stripe/LemonSqueezy + BullMQ + Redis + PostHog). **Not an MCP server.** It's a GitHub template/boilerplate for AI SaaS monetization.

**Decision: do NOT install or fork.** Monolithic `src/` structure conflicts with our L1 Dirstarter `apps/web/` monorepo conventions. Cherry-pick patterns only.

## Patterns worth adopting

### 1. Usage-based billing / credits lifecycle (→ S10 Stripe)

- Full credits lifecycle: purchase, consume, refund, expire
- Multi-currency support
- Metering dashboard for usage visibility
- `@velobaseai/billing` SDK pattern — consider similar abstraction for our Stripe integration

**When:** S10 Stripe wiring sprint. ADR candidate for billing architecture.

### 2. BullMQ background workers (→ post-S10)

- 11 BullMQ queues covering: email send, affiliate payout, ad conversion upload, data sync, scheduled campaigns
- `SERVICE_MODE` env var to run web/worker/API as one process or separate services
- Worker health checks and graceful shutdown

**Applicable to:** Tournament bracket scoring, bulk email campaigns, BBL data import/migration, scheduled membership renewals, attendance report generation.

**When:** When we need async processing. Could start small with email queue.

### 3. Anti-abuse guardrails (→ S10 or pre-launch)

- Redis rate limits per endpoint
- Turnstile CAPTCHA integration
- Disposable email domain blocklist
- Gmail trick detection (dot/plus aliasing)
- Signup IP/device fingerprint signals
- Guest chat quotas with credit clawback

**Applicable to:** Tournament registration abuse, membership signup fraud, trial exploitation across brands.

**When:** Pre-launch hardening or S10. Rate limiting is the highest-value item.

### 4. Affiliate/referral engine (→ post-launch)

- Double-entry ledger for referral credits
- Refund clawback (reverses affiliate credit when customer refunds)
- USDT/crypto cashout option
- Referral link tracking with attribution

**Applicable to:** School-to-school referral programs, instructor referral bonuses, tournament promotion incentives.

**When:** Post-launch growth phase. Not MVP.

### 5. Ad attribution / server-side tracking (→ post-launch)

- Google Ads offline conversion upload
- X (Twitter) pixel integration
- PropellerAds support
- Server-side event tracking (not client-side pixels)

**When:** When marketing budget exists. Not MVP.

## Implementation priority

1. **Rate limiting** (anti-abuse) — highest ROI, smallest effort
1. **Email queue** (BullMQ pattern) — decouple email from request cycle
1. **Billing credits** — when S10 Stripe work begins
1. **Referral engine** — post-launch
1. **Ad attribution** — post-launch with marketing budget
