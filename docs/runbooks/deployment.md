---
title: Production Deployment
slug: deployment
type: runbook
status: active
created: 2026-05-05
updated: 2026-05-08
last_agent: codex-session-0099
pairs_with:
  - docs/runbooks/dev-environment.md
  - docs/runbooks/schema-migration.md
  - docs/runbooks/aws-s3-operator-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Production Deployment Runbook

## Architecture

| Component | Provider | Dashboard |
|---|---|---|
| App hosting | Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Database | Neon (Postgres 16) | [console.neon.tech](https://console.neon.tech) |
| Auth | Better-Auth (self-hosted in app) | — |
| DNS / Domain | Your registrar | — |
| Domain | `baselinemartialarts.com` | — |

## Prerequisites

Before first deploy:

1. **Vercel project** linked to `Ronin-Dojo-Design/ronin-dojo-baseline` repo
2. **Neon project** with a Postgres 16 database
3. **Google OAuth** production client (see below)
4. **Custom domain** configured in Vercel

## Required Vercel Environment Variables

Set these in **Vercel → Settings → Environment Variables** for Production (and optionally Preview):

| Variable | Example value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` | From Neon dashboard |
| `BETTER_AUTH_SECRET` | _(generate with `openssl rand -base64 32`)_ | Unique per environment |
| `BETTER_AUTH_URL` | `https://baselinemartialarts.com` | Must match your production domain |
| `NEXT_PUBLIC_SITE_URL` | `https://baselinemartialarts.com` | Public-facing URL |
| `NEXT_PUBLIC_SITE_EMAIL` | `hello@baselinemartialarts.com` | Contact email |
| `AUTH_GOOGLE_ID` | `571...apps.googleusercontent.com` | Production Google OAuth client |
| `AUTH_GOOGLE_SECRET` | `GOCSPX-...` | Production Google OAuth secret |
| `CRON_SECRET` | _(generate a random string)_ | Protects cron endpoints |

### Optional (configure when ready)

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Transactional email |
| `RESEND_SENDER_EMAIL` | Email from address |
| `STRIPE_SECRET_KEY` | Payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, `NEXT_PUBLIC_MEDIA_BASE_URL` | Media uploads and public media delivery; see [AWS S3 Operator Runbook](aws-s3-operator-runbook.md) |

## Google OAuth — Production Client

1. Google Cloud Console → APIs & Services → Credentials
2. Create OAuth client ID (Web application)
   - **Authorized JavaScript origins**: `https://baselinemartialarts.com`
   - **Authorized redirect URIs**: `https://baselinemartialarts.com/api/auth/callback/google`
3. Copy Client ID + Secret → add to Vercel env vars

## Custom Domain Setup

1. Vercel → Settings → Domains → Add `baselinemartialarts.com`
2. Vercel provides DNS records (A record or CNAME)
3. Add those records at your domain registrar
4. Wait for DNS propagation (usually < 10 min, can take up to 48h)
5. Vercel auto-provisions SSL certificate

## Deploy Flow

Vercel deploys automatically on push to `main`. The build process:

```
push to main
  → Vercel triggers build
    → bun install (postinstall → prisma generate)
    → prebuild → prisma migrate deploy (runs migrations against Neon)
    → next build
    → postbuild → next-sitemap
  → Deploy to production
```

### Manual Deploy

If you need to trigger a deploy without pushing code:

```bash
# From the Vercel dashboard: Deployments → Redeploy
# Or via CLI:
bunx vercel --prod
```

## First Deploy Checklist

```
[ ] Neon project created, connection string copied
[ ] Vercel project linked to GitHub repo
[ ] All required env vars set in Vercel
[ ] Production Google OAuth client created
[ ] Custom domain added in Vercel + DNS configured
[ ] Push to main (or trigger manual deploy)
[ ] Verify: site loads at https://baselinemartialarts.com
[ ] Verify: Google sign-in works
[ ] Verify: database seeded (check admin panel)
```

## Env Parity Guard (FS-0023)

Before deploying, verify required env vars exist in both Production and Preview:

```bash
bun scripts/check-vercel-env-parity.ts
```

- Reports variable **names and scopes only** — never prints secret values.
- Use `--dry-run` to list required vars from `env.ts` without calling Vercel.
- Exit code 0 = all clear, exit code 1 = missing scopes detected.

## Subsequent Deploys

Just push to `main`. Vercel handles everything:
- Schema changes: `prebuild` runs `prisma migrate deploy` automatically
- No manual migration step needed

## Rollback

1. Vercel dashboard → Deployments
2. Find the last working deployment
3. Click ⋯ → Promote to Production

## Database Operations

```bash
# Run migrations manually (if needed outside of deploy)
DATABASE_URL="<neon-connection-string>" bunx prisma migrate deploy

# Open Prisma Studio against production (read-only recommended)
DATABASE_URL="<neon-connection-string>" bunx prisma studio

# Seed production (first time only — be careful)
DATABASE_URL="<neon-connection-string>" bunx prisma db seed
```

> ⚠️ **Never** run `prisma migrate dev`, `db push`, or `migrate reset` against production.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails at `prisma migrate deploy` | Missing `DATABASE_URL` env var | Add Neon connection string to Vercel |
| Google sign-in redirects to error | Wrong redirect URI in Google Console | Must be `https://baselinemartialarts.com/api/auth/callback/google` |
| `BETTER_AUTH_URL` mismatch | Auth callbacks point to wrong domain | Ensure `BETTER_AUTH_URL` matches production domain exactly |
| 500 on all pages | DB connection failed | Check Neon dashboard — is the project awake? Check connection string |
