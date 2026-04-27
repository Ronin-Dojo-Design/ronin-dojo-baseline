---
title: Architecture README
slug: architecture-readme
type: file
status: active
created: 2026-04-25
updated: 2026-04-25
last_agent: copilot-session-0002
health: 5
backlinks:
  - docs/knowledge/wiki/index.md
---

# Architecture docs

- [plan-vs-current.md](plan-vs-current.md) — **start here** — behavioral roadmap; ChatGPT plan's spec vs current schema; phased build order
- [data-model.md](data-model.md) — Prisma schema rationale; Brand → School → Style → Membership → Course → Progress → Gamification → Tournament
- [auth.md](auth.md) — Better-Auth flow for web + mobile; authz helpers; brand context; cross-brand isolation
- [legacy-conversion.md](legacy-conversion.md) — what to port from the legacy monorepo, what to throw out
- [decisions/](decisions/) — ADRs (one decision per file)
- [source/chatgpt-original-plan.md](source/chatgpt-original-plan.md) — historical: the GPT-authored proposal that seeded this rebuild

## Decision log

- [0001 — Dirstarter (Next.js + Prisma) over WPGraphQL + JWT](decisions/0001-dirstarter-vs-wpgraphql.md)
- [0002 — Expo for mobile](decisions/0002-expo-for-mobile.md)
- [0003 — No WordPress](decisions/0003-no-wordpress.md)
- [0004 — Multi-brand as `brandId` column](decisions/0004-multi-brand-as-column.md)
- [0005 — Legacy stack stays at tuffbuffs.com](decisions/0005-legacy-coexistence.md)
- [0006 — Multi-domain hosting on one Vercel deployment](decisions/0006-multi-domain-hosting.md)
- [0007 — BBL one-time migration](decisions/0007-bbl-migration.md)
- [0008 — Brand switcher (admins + multi-brand only)](decisions/0008-brand-switcher.md)
