---
title: Architecture README
slug: architecture-readme
type: file
status: active
created: 2026-04-25
updated: 2026-06-06
last_agent: codex-session-0351
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0029.md
  - docs/sprints/SESSION_0030.md
---

# Architecture docs

- [plan-vs-current.md](plan-vs-current.md) — **start here** — behavioral roadmap; ChatGPT plan's spec vs current schema; phased build order
- [data-model.md](data-model.md) — Prisma schema rationale; Brand → Organization → Discipline → Membership → Course → RankAward → Gamification → Tournament
- [repo-alignment-report.md](repo-alignment-report.md) — on-demand / weekly repo truth sweep across schema, ADRs, admin surfaces, generated docs, monitoring, and ledgers
- [auth.md](auth.md) — Better-Auth flow for web + mobile; authz helpers; brand context; cross-brand isolation
- [programs-curriculum-certification-spec.md](programs-curriculum-certification-spec.md) — Program/Course/Certification learning path contract
- [monetization-entitlements-spec.md](monetization-entitlements-spec.md) — Product/PricingPlan/Entitlement commercial access contract
- [dirstarter-commerce-alignment.md](dirstarter-commerce-alignment.md) — Dirstarter baseline map for commerce/curriculum/certification work
- [security-privacy-payments-monitoring-plan.md](security-privacy-payments-monitoring-plan.md) — security, privacy, payment, wireframe, and monitoring gates for School Ops/CGR work
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
- [0009 — Mobile Auth Strategy: Better-Auth Mobile SDK](decisions/0009-mobile-auth-strategy.md)
- [0010 — Cache strategy for auth-scoped queries](decisions/0010-cache-strategy.md)
- [0011 — Entitlement-first commerce](decisions/0011-entitlement-first-commerce.md)
