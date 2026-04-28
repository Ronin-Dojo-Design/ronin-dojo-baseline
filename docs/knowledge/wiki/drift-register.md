---
title: Drift Register
slug: drift-register
type: protocol
status: active
created: 2026-04-27
updated: 2026-04-27
health: 7
source_pages:
  - docs/knowledge/wiki/concepts/open-brain-repo-memory.md
  - docs/sprints/SESSION_0017.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Drift Register

Track contradictions, stale claims, and unresolved tensions between sources. Each row stays open until resolved by a session or ADR.

| # | Drift | Source A | Source B | Decision needed | Status | Resolved in |
| --- | --- | --- | --- | --- | --- | --- |
| D-001 | Wiki log stale after SESSION_0007 | `wiki/log.md` | SESSION files 0008–0016 | Backfill log | ✅ resolved | SESSION_0017 |
| D-002 | S2–S4 entities missing `payloads.ts` | `s2-s4-pattern-audit.md` | Dirstarter `tools/payloads.ts` pattern | Create payload files | ✅ resolved | SESSION_0017 |
| D-003 | Org queries use `include` not `select` | `organization/queries.ts` | Dirstarter pattern (payload-based `select`) | Refactor queries | ✅ resolved | SESSION_0017 |
| D-004 | `/me` page uses raw headings, not `<Intro>` | `app/(web)/me/page.tsx` | Dirstarter page shell pattern | Update page | ✅ resolved | SESSION_0017 |
| D-005 | Cache pattern not applied to read queries | Ronin queries (React `cache` only) | Dirstarter `"use cache"` + `cacheTag` + `cacheLife` | Needs research — auth-scoped data risk | 🔴 open | — |
| D-006 | `packages/api-client` not installed in workspace | SESSION_0016 | `pnpm-workspace.yaml` | Run `pnpm install` | 🟡 open | — |
| D-007 | Dirstarter package identity vs Ronin identity | `package.json` name field | Project identity | Rename later (transitional) | 🟡 deferred | — |
| D-008 | Local `dirstarter_template/` inaccessible to remote agents | SESSION_0016 L1 constraint | GitHub/Codex context | Document expected reference; consider committing key patterns as wiki pages | 🟡 open | — |
| D-009 | ADR 0010 status conflict (said accepted, was draft) | `0010-cache-strategy.md` | SESSION_0018 | Reverted to `proposed`; cache risk register created | ✅ resolved | SESSION_0019 |
| D-010 | Program plan superseded by May 18 all-brand launch | `program-plan.md` (12-sprint MVP) | Brian directive SESSION_0019 | Lock launch strategy in SESSION_0020 | 🔴 open | — |
| D-011 | 13+ schema entities missing for full launch | `SCHEMA_NEEDS_MANIFEST.md` | `schema.prisma` (31 models) | Schema reconciliation in SESSION_0020 | 🔴 open | — |
| D-012 | Dirstarter source audit (TASK_02) not completed | SESSION_0019 plan | — | Carry to future session | 🟡 open | — |
| D-013 | Admin auth behavior: 404 vs redirect | `auth-hoc.tsx` (redirects to `/`) | `auth.md` (says 404) | Pick one and align both | 🟡 open | — |
