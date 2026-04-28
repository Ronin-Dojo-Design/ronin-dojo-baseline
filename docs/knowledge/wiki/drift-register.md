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
