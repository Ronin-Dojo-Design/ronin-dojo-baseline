---
title: "ADR 0021 — Brand-aware magic links and request-origin email links"
slug: adr-0021-brand-aware-magic-links
type: adr
status: accepted
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0280
pairs_with:
  - docs/architecture/decisions/0004-multi-brand-architecture.md
  - docs/architecture/decisions/0006-brand-host-mapping.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0279.md
  - docs/sprints/SESSION_0280.md
---

# ADR 0021 — Brand-aware magic links and request-origin email links

## Status

Accepted

## Context

The platform serves four brands from a single Next.js deployment (ADR 0004, ADR 0006). Each brand resolves from `request.host` via `proxy.ts`. Before this decision, Better-Auth magic-link emails and server-action-generated links (e.g., `/lineage/join` confirmation emails, admin lead notification links) used a single hardcoded origin (`NEXT_PUBLIC_SITE_URL`), which meant:

1. Magic-link login emails always linked back to the Baseline domain regardless of which brand the user signed in from.
2. `/lineage/join` confirmation and admin emails contained Baseline URLs even when submitted through `bbl.local` / `blackbeltlegacy.com`.

This was exposed during SESSION_0278–0280 browser smoke testing of the BBL Join the Legacy flow.

## Decision

1. **Magic-link sender is brand-aware.** `lib/auth.ts` resolves the brand from the auth request host and selects the corresponding sender email (`RESEND_SENDER_EMAIL` for Baseline, `RESEND_SENDER_EMAIL_BBL` for BBL, etc.). The magic-link callback URL origin is rewritten to the requesting host.

2. **Server actions resolve request origin.** `lib/brand-context.ts` exports `getRequestOrigin()` which reads `x-forwarded-host` / `host` headers to derive the origin URL. Server actions (e.g., `createJoinLegacyInterest`) use this for checkout links and admin notification links instead of `NEXT_PUBLIC_SITE_URL`.

3. **Production guard for missing senders.** If a brand-specific sender env var is not configured in production, the email helper throws a clear error rather than silently falling back to the Baseline sender (which would fail Resend domain verification).

4. **Dev origins.** `next.config.ts` includes `allowedDevOrigins` for `bbl.local`, `baseline.local`, `wekaf.local` so HMR works across brand hosts.

## Consequences

- Each brand's transactional emails link back to the correct domain.
- New brands require a `RESEND_SENDER_EMAIL_<BRAND>` env var in Vercel production and a verified sender domain in Resend.
- The Baseline sender remains the default fallback in development only.
- `/admin/email` shows configured vs. pending status for each brand's sender.
