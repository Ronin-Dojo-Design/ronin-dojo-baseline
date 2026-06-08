---
title: "ADR 0001 — Dirstarter over WPGraphQL and JWT"
slug: adr-0001-dirstarter-vs-wpgraphql
type: decision
status: accepted
created: 2026-04-25
updated: 2026-06-06
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/program-plan.md
  - docs/architecture/decisions/0003-no-wordpress.md
  - docs/knowledge/wiki/concepts/enter-the-dojo-schema-intake.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0001 — Dirstarter (Next.js + Prisma) chosen over WPGraphQL + JWT

**Status:** Accepted
**Date:** 2026-04-25

## Context

Initial architectural plan (drafted in a ChatGPT session — see [../source/chatgpt-original-plan.md](../source/chatgpt-original-plan.md)) proposed WPGraphQL + JWT atop a WordPress + Pods backend, mirroring the legacy stack at [Ronin-Dojo-Design/ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo). That legacy stack had grown to **281 REST routes across four near-identical brand-multiplexed PHP plugins**, with business logic, validation, and authorization scattered across handler closures. The intent was to start fresh with a better backend.

## Decision

Adopt **Dirstarter (Next.js 15 + Prisma + Postgres + Better-Auth)** as the apex web app and the API surface for mobile. Drop WordPress entirely. Drop WPGraphQL entirely.

## Consequences

### Positive

- Schema is the spec: `prisma/schema.prisma` drives generated types, migrations, and queries. PHP/JS shape drift is impossible.
- Authorization lives in `lib/authz.ts` pure helpers, unit-testable in isolation.
- One Postgres DB serves web (Prisma) + mobile (typed API client over `app/api/v1/*`).
- Already-paid Dirstarter ships auth, payments, email, S3, Redis, MDX, admin scaffolding — eliminates the "less custom work" argument WordPress used to win.

### Negative

- Lose WPGraphQL/Faust ecosystem and Pods admin UI.
- Lose built-in real-time / offline-sync (would need Pusher / Ably / Liveblocks bolt-on for live tournament features).
- Better-Auth is newer than NextAuth/Clerk; mobile flow needs verification.

## Alternatives considered

- **A. WP REST done right** — single namespace, schema-first, codegen'd clients. Rejected: doesn't escape WP/MySQL ceiling for app workloads.
- **B. Postgres-first via Supabase** — RLS instead of TypeScript authz, real-time + offline built-in. Rejected: Dirstarter (already owned) covers most of the same ground without learning Supabase RLS.
- **C. Hybrid (WP for content, separate Node/Laravel app server)** — two services to operate. Rejected for solo build.

See [program-plan.md](../program-plan.md) for full rationale; the original plan-mode artifact lived in operator-side scratch space and is not part of the repo.
