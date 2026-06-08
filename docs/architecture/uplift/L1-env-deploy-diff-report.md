---
title: "L1 Env/Deploy Diff Report"
slug: l1-env-deploy-diff-report
type: architecture
status: active
created: 2026-05-19
updated: 2026-06-06
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/lane-ledger.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/architecture/dirstarter-baseline-index.md
  - docs/knowledge/wiki/dirstarter-uplift-backlog.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/runbooks/resend-setup-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0204.md
  - docs/protocols/project-log.md
---

# L1 Env/Deploy Diff Report

## Purpose

SESSION_0204 is doc-only. This report compares upstream Dirstarter `7e724b6` with Ronin after SESSION_0203 and gives SESSION_0205 a variable-by-variable decision map. It does not change runtime code, production env vars, Vercel settings, schema, or `apps/web/.dirstarter-upstream`.

## Sources

| Source | Evidence |
| --- | --- |
| Upstream checkout | `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` at `7e724b6`; local branch label `chore/enable-pnpm-pre-post-scripts`. |
| Upstream files read | `.env.example`, `env.ts`, `services/{ai,db,plausible,redis,resend,s3,stripe}.ts`, `next.config.ts`, `vercel.json`; no `middleware.ts` present. |
| Ronin files read | `apps/web/.env.example`, `apps/web/env.ts`, `apps/web/prisma.config.ts`, `apps/web/services/{db,plausible,printful,redis,resend,s3,stripe}.ts`, `apps/web/lib/{ai,auth,email,media,public-media-url}.ts`, `apps/web/next.config.ts`, `apps/web/vercel.json`, root `vercel.json`. |
| Local runbooks | `docs/runbooks/vercel-domain-setup-runbook.md`, `docs/runbooks/resend-setup-runbook.md`, `docs/runbooks/neon-advisory-lock-recovery.md`. |
| Live Dirstarter docs checked | `<https://dirstarter.com/docs/environment-setup`>, `<https://dirstarter.com/docs/deployment`>, `<https://dirstarter.com/docs/authentication`>, `<https://dirstarter.com/docs/integrations/email`>, `<https://dirstarter.com/docs/integrations/storage`>, `<https://dirstarter.com/docs/integrations/payments`>, `<https://dirstarter.com/docs/integrations/rate-limiting`>, `<https://dirstarter.com/docs/integrations/analytics`>, `<https://dirstarter.com/docs/automation`>. |
| Live Vercel docs checked | `<https://vercel.com/docs/environment-variables/system-environment-variables`>, `<https://vercel.com/docs/environment-variables/manage-across-environments`>. |

## Decision Keywords

| Keyword | Meaning for SESSION_0205 |
| --- | --- |
| `keep` | Preserve Ronin's current variable name and behavior. |
| `add` | Add an upstream/system variable to Ronin's env schema/example or Vercel settings. |
| `remove` | Delete a Ronin variable after confirming no runtime path needs it. |
| `rename` | Convert one variable name to another with code/runbook updates. |
| `rescope` | Defer blind adoption and make a narrower Ronin-specific implementation decision in L2. |

## Core / Site / Cron

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Required client var in `.env.example` and `env.ts`. | Required client var; feeds `siteConfig.url`, brand defaults, auth callbacks, and public links. | keep | Bad value breaks auth callbacks, Plausible domain derivation, emails, and public URLs. |
| `NEXT_PUBLIC_SITE_EMAIL` | Required client var. | Required client var; used by `siteConfig.email`. | keep | Bad value changes sender/reply contact surfaces. |
| `CRON_SECRET` | Optional server var for `/api/cron/publish`. | Optional server var for `/api/cron/publish-tools`. | keep | Removing or rotating without Vercel cron update can block scheduled publishing. |
| `PORT` | Server var default `3000`. | Shared var default `8000`. | keep | Changing the Ronin default can break local scripts and existing dev assumptions. |
| `NODE_ENV` | Server var default `development`. | Server var default `development`; `isProd` also accounts for `VERCEL_ENV=production`. | keep | Incorrect production detection can change safety gates and logging behavior. |
| `SKIP_ENV_VALIDATION` | Supported by T3 Env. | Supported by T3 Env. | keep | Removing can break controlled build/dev flows that intentionally skip validation. |

## Database

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Required; runtime DB URL. | Required; runtime DB URL and local Prisma fallback. | keep | Wrong endpoint can break app runtime or point production at the wrong database. |
| `DATABASE_PUBLIC_URL` | Optional; upstream `services/db.ts` uses it during `PHASE_PRODUCTION_BUILD`. | Absent from env schema/example and code. Ronin instead added `DIRECT_URL` for Prisma CLI migrations. | rescope | Blindly adding it may mask the Neon pooler/direct split fixed in SESSION_0201. |
| `DIRECT_URL` | Absent upstream. | Used by `apps/web/prisma.config.ts` on Vercel Preview/Production for Prisma CLI migration commands; not in `apps/web/env.ts`. | keep | Removing regresses the Neon advisory-lock structural fix. |
| `SHADOW_DATABASE_URL` | Absent upstream. | Optional local-only `prisma.config.ts` shadow database URL for `migrate dev`. | keep | Removing complicates local migration validation. |

## Auth

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | Required. | Required. | keep | Rotation without coordinated cookie/session handling invalidates sessions. |
| `BETTER_AUTH_URL` | Required; same as public site URL. | Required; used by Better Auth and dev-login route tests. | keep | Wrong URL breaks auth callbacks and magic-link flows. |
| `AUTH_GOOGLE_ID` | Required in upstream schema; docs only list Google social login. | Optional; Google provider is enabled only when both Google vars exist. | keep | Making it required can break production if OAuth is intentionally disabled. |
| `AUTH_GOOGLE_SECRET` | Required in upstream schema. | Optional; paired with `AUTH_GOOGLE_ID`. | keep | Same as above; partial config can create broken provider state. |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | Not present in upstream files or live docs. | Not present. | keep | Adding without provider code creates dead env surface and operator confusion. |
| `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` | Not present in upstream files or live docs. | Not present. | keep | Adding without provider code creates dead env surface and operator confusion. |
| `DEV_LOGIN_USER_ID` | Absent upstream. | Optional Ronin dev-login helper. | keep | Removing can break local/test auth shortcuts. |

## Email

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `RESEND_API_KEY` | Required in env schema and docs. | Optional in Ronin schema; `services/resend.ts` creates a nullable/fallback client shape. | keep | Making required can break local/dev and non-email preview paths. |
| `RESEND_SENDER_EMAIL` | Required in upstream schema; docs use it as the default sender address. | Optional; used by `lib/email.ts` as the sender email. | keep | Renaming without email code/runbook updates breaks magic-link and transactional sends. |
| `RESEND_AUDIENCE_ID` | Removed from upstream env shape; new upstream contact helper accepts `CreateContactOptions`. | Optional Ronin var; `services/resend.ts` requires it for legacy contact creation. | remove | Removing before contact-shape code is updated breaks newsletter/contact creation. |
| `RESEND_FROM` | Not present upstream; L1 epic shorthand maps to sender-address behavior. | Not present. | rename | Introducing it as an alias duplicates `RESEND_SENDER_EMAIL` unless L2 renames code and runbooks together. |

## Storage

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `S3_BUCKET` | Required in upstream schema/example. | Optional; required at runtime only for upload/delete helpers. | keep | Making required can break builds where storage is intentionally disabled. |
| `S3_REGION` | Required upstream. | Optional; required by upload helpers when storage is used. | keep | Wrong region breaks S3/R2 addressing and image loading. |
| `S3_ACCESS_KEY` | Required upstream. | Optional and only passed when paired with `S3_SECRET_ACCESS_KEY`. | keep | Making required can break public-read or non-upload environments. |
| `S3_SECRET_ACCESS_KEY` | Required upstream. | Optional and paired with `S3_ACCESS_KEY`. | keep | Same as above; partial credentials break client initialization. |
| `S3_ENDPOINT` | Optional upstream for S3-compatible providers. | Optional; supports Cloudflare R2/S3-compatible storage. | keep | Removing blocks R2/non-AWS compatibility. |
| `S3_PUBLIC_URL` | Optional upstream CDN/public URL. | Optional; used by media helpers and storage monitoring. | keep | Removing can break public media URL generation and monitoring. |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Absent upstream. | Optional client/public media base URL used by Ronin public media resolver and admin monitoring. | keep | Removing can regress existing media URL normalization. |

## Payments

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Required upstream; Stripe service uses API `2026-04-22.dahlia`. | Optional Ronin var; Stripe service uses API `2025-08-27.basil` and null fallback. | keep | Making required can break non-payment preview/local paths; API version belongs to L7. |
| `STRIPE_WEBHOOK_SECRET` | Required upstream and documented for local/prod webhooks. | Optional Ronin var; checked by webhook route. | keep | Removing or rotating without Stripe dashboard update breaks webhook verification. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Not present; live Dirstarter docs say the secret key is enough for its current flow. | Not present. | keep | Adding a publishable key implies client-side Stripe surfaces Ronin does not currently use. |

## Caching

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `REDIS_URL` | Optional upstream var; `services/redis.ts` uses `ioredis` and falls back to memory when absent. | Absent; Ronin uses Upstash REST vars. | rescope | Adding without code migration does nothing; replacing REST vars can break existing rate-limit/cache callers. |
| `REDIS_REST_URL` | Removed upstream. | Optional Ronin var used by `@upstash/redis` client. | rescope | Removing before a Redis client migration breaks current Redis integration. |
| `REDIS_REST_TOKEN` | Removed upstream. | Optional Ronin var paired with `REDIS_REST_URL`. | rescope | Partial removal creates a disabled or misconfigured Redis client. |

## Analytics

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_PLAUSIBLE_URL` | Required client var; used by `next-plausible` proxy and Plausible API service. | Optional client var; used by `next-plausible` provider, proxy config, and Plausible API service. | keep | Removing disables or misroutes Plausible tracking/API calls. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Required upstream; live docs say provider reads it. | Absent; Ronin derives `domain` from `NEXT_PUBLIC_SITE_URL` through `siteConfig`, with multi-brand implications. | rescope | Adding a single domain can undermine multi-brand analytics behavior. |
| `PLAUSIBLE_API_KEY` | Required upstream schema for admin analytics. | Optional Ronin var used by `services/plausible.ts`. | keep | Making required can break builds where analytics admin views are disabled. |

## AI / Automation

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `AI_GATEWAY_API_KEY` | Optional; live docs say AI gracefully disables when absent. | Optional; enables Ronin content automation. | keep | Making required blocks non-AI environments. |
| `AI_CHAT_MODEL` | Default `openai/gpt-4o`. | Default `openai/gpt-4o`. | keep | Wrong model ID breaks content generation. |
| `AI_COMPLETION_MODEL` | Default `openai/gpt-4o-mini`. | Default `openai/gpt-4o-mini`. | keep | Wrong model ID breaks completion routes. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Removed upstream. | Legacy optional Ronin var in `.env.example` and `env.ts`; no current runtime use found outside env declarations. | remove | Removing before confirming no hidden operator flow exists could surprise local automation, but keeping it invites stale direct-Google wiring. |
| `JINA_API_KEY` | Optional upstream var for scraping. | Optional Ronin var for scraping. | keep | Removing reduces scraping capacity once free/no-key limits are exhausted. |
| `SCREENSHOTONE_ACCESS_KEY` | Required upstream schema/example. | Optional Ronin var; `lib/media.ts` requires it only for screenshot fetches. | keep | Making required blocks environments that do not use screenshots. |

## Vercel-only / Deploy

| Var | Upstream 7e724b6 | Ronin today | Decision (L2) | Risk if changed |
| --- | --- | --- | --- | --- |
| `VERCEL_ENV` | Not declared upstream. | Declared in Ronin `env.ts`; used to treat `production` as prod in `isProd` and Prisma CLI routing. | keep | Removing regresses production detection and DIRECT_URL migration routing. |
| `VERCEL_URL` | Not declared upstream. | Shared optional var transformed into an `<https://`> URL. | keep | Removing can break preview/deployment URL awareness. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Vercel system var available when system env vars are exposed. | Not declared in Ronin schema. | rescope | Adding without usage is noise; useful later for production OG/link generation if L8 needs it. |
| `VERCEL_BRANCH_URL` | Vercel system var available when system env vars are exposed. | Not declared in Ronin schema. | rescope | Could help preview URL generation, but premature adoption can confuse canonical URLs. |
| `VERCEL_DEPLOYMENT_ID` | Vercel system var available when system env vars are exposed. | Not declared in Ronin schema. | keep | No current Ronin skew-protection behavior depends on it. |
| `NEXT_PHASE` | Upstream schema includes it; upstream DB service uses it to detect `PHASE_PRODUCTION_BUILD`. | Absent from Ronin env schema; Ronin DB service does not branch on production build phase. | rescope | Adding only matters if L2 adopts upstream `DATABASE_PUBLIC_URL` build behavior. |

## Deploy Config Delta

| Surface | Upstream 7e724b6 | Ronin today | Proposed L2 action |
| --- | --- | --- | --- |
| Active Vercel config | Root `vercel.json` with cron path `/api/cron/publish`. | Active app-root config is `apps/web/vercel.json`; root `vercel.json` is historical/root fallback per runbook. | Keep `apps/web` root truth. Do not copy upstream root config blindly. |
| Install command | Upstream docs describe generic `npm install` / `yarn install`; upstream repo config is simple. | `apps/web/vercel.json` runs `cd ../.. && corepack enable && corepack pnpm@9.0.0 install --frozen-lockfile`. | Keep unless L14 toolchain lane changes package manager/runtime. |
| Build command | Upstream docs describe generic Next build. | `apps/web/vercel.json` runs `cd ../.. && pnpm --filter dirstarter build`. | Keep; production stability depends on monorepo root install/build path. |
| Cron route | `/api/cron/publish`. | `/api/cron/publish-tools`, with rewrite in `next.config.ts` from `/api/cron/publish-tools` to `/api/cron/publish` absent. | Rescope route naming in L2; avoid changing Vercel cron until route compatibility is proven. |
| Plausible proxy | Upstream `next.config.ts` uses `withPlausibleProxy({ customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_URL })`. | Ronin matches this proxy shape. | Keep. |
| Image remote patterns | Upstream derives from `S3_PUBLIC_URL` or S3 bucket/region. | Ronin `next.config.ts` currently has no image remote pattern block. | Rescope to storage/media lane unless L2 proves deploy breakage. |

## L2 Decision Summary

- **Keep:** Ronin's `apps/web` Vercel root config, `DIRECT_URL` migration routing, optional integration posture, `RESEND_SENDER_EMAIL`, `REDIS_REST_*` until a code migration proves otherwise, and brand-derived Plausible domain behavior.
- **Remove candidates:** `RESEND_AUDIENCE_ID` after Resend contact-shape code is updated; `GOOGLE_GENERATIVE_AI_API_KEY` after confirming no direct-Google runtime remains.
- **Rescope candidates:** `DATABASE_PUBLIC_URL`, `REDIS_URL`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, Vercel production/branch URL system vars, and `NEXT_PHASE`.
- **Do not do in L2:** Stripe API version bump, Resend SDK contact-shape behavioral migration, sitemap/RSS/OG work, schema changes, or `.dirstarter-upstream` SHA bump. Those belong to L7, L8, L3, and L15 respectively.
