# Ronin Dojo

Martial arts member directory, course creation for belt-rank certification, gamified progress, curriculum library — web + iOS + Android, single Postgres backend.

**Repo:** [Ronin-Dojo-Design/ronin-dojo-baseline](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline) (private)

## Stack

- **Web** — Dirstarter (Next.js 16 + Prisma 7 + Better-Auth + Stripe + Resend + S3) at `apps/web/`
- **Mobile** — Expo (iOS + Android) at `apps/mobile/`
- **Database** — Postgres (one DB serves web + mobile)
- **Content** — MDX in `apps/web/content/blog/` (no separate CMS)

## Layout

```
apps/web        Next.js + Prisma — apex web app + admin + /api/v1 for mobile
apps/mobile     Expo — iOS/Android consuming /api/v1
packages/       shared zod schemas, typed API client, design tokens
docs/           architecture, ADRs, runbooks, source ChatGPT plan
infra/          deployment configs
```

## Architecture decisions

See [docs/architecture/decisions/](docs/architecture/decisions/) for ADRs:

- 0001 — Dirstarter (Next.js + Prisma) chosen over WPGraphQL + JWT
- 0002 — Expo for mobile (not Capacitor / RN-CLI / RN-Web)
- 0003 — No WordPress (MDX-in-git for blog; Keystatic/TinaCMS deferred)
- 0004 — Multi-brand encoded as `brandId` column (not separate apps/themes)

## Status

Greenfield — see [docs/architecture/source/chatgpt-original-plan.md](docs/architecture/source/chatgpt-original-plan.md) for the original GPT-authored plan and the approved revision.
