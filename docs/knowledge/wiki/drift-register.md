---
title: Drift Register
slug: drift-register
type: protocol
status: active
created: 2026-04-27
updated: 2026-05-08
source_pages:
  - docs/knowledge/wiki/concepts/open-brain-repo-memory.md
  - docs/sprints/SESSION_0017.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Drift Register

Track contradictions, stale claims, and unresolved tensions between sources. Each entry stays open until resolved by a session or ADR.

## Entries

### D-001 — Wiki log stale after SESSION_0007

- **Source A:** `wiki/log.md`
- **Source B:** SESSION files 0008–0016
- **Decision needed:** Backfill log
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-002 — S2–S4 entities missing `payloads.ts`

- **Source A:** `s2-s4-pattern-audit.md`
- **Source B:** Dirstarter `tools/payloads.ts` pattern
- **Decision needed:** Create payload files
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-003 — Org queries use `include` not `select`

- **Source A:** `organization/queries.ts`
- **Source B:** Dirstarter pattern, payload-based `select`
- **Decision needed:** Refactor queries
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-004 — `/me` page uses raw headings, not `<Intro>`

- **Source A:** `app/(web)/me/page.tsx`
- **Source B:** Dirstarter page shell pattern
- **Decision needed:** Update page
- **Status:** resolved
- **Resolved in:** SESSION_0017

### D-005 — Cache pattern not applied to read queries

- **Source A:** Ronin queries using React `cache` only
- **Source B:** Dirstarter `"use cache"` + `cacheTag` + `cacheLife`
- **Decision needed:** Needs research; auth-scoped data risk
- **Status:** resolved
- **Resolved in:** SESSION_0059; public queries upgraded to `"use cache"` + `cacheTag` + `cacheLife`, auth-scoped queries intentionally kept with React `cache()`.

### D-006 — `packages/api-client` not installed in workspace

- **Source A:** SESSION_0016
- **Source B:** `pnpm-workspace.yaml`
- **Decision needed:** Run `pnpm install`
- **Status:** deferred
- **Resolved in:** SESSION_0060; no consumers, keep for future use.

### D-007 — Dirstarter package identity vs Ronin identity

- **Source A:** `package.json` name field
- **Source B:** Project identity
- **Decision needed:** Rename later as transitional cleanup
- **Status:** deferred
- **Resolved in:** not resolved

### D-008 — Local `dirstarter_template/` inaccessible to remote agents

- **Source A:** SESSION_0016 L1 constraint
- **Source B:** GitHub/Codex context
- **Decision needed:** Document expected reference; consider committing key patterns as wiki pages
- **Status:** resolved
- **Resolved in:** SESSION_0039; `dirstarter-baseline-index.md` created.

### D-009 — ADR 0010 status conflict

- **Source A:** `0010-cache-strategy.md` said accepted
- **Source B:** SESSION_0018 said draft/proposed
- **Decision needed:** Revert to `proposed`; create cache risk register
- **Status:** resolved
- **Resolved in:** SESSION_0019

### D-010 — Program plan superseded by May 18 all-brand launch

- **Source A:** `program-plan.md`, 12-sprint MVP
- **Source B:** Brian directive SESSION_0019
- **Decision needed:** Lock launch strategy in SESSION_0020
- **Status:** resolved
- **Resolved in:** SESSION_0060; WORKFLOW_5.0 governs session calendar, program-plan layered architecture sections remain valid, frontmatter updated.

### D-011 — 13+ schema entities missing for full launch

- **Source A:** `SCHEMA_NEEDS_MANIFEST.md`
- **Source B:** `schema.prisma`, 31 models at the time
- **Decision needed:** Schema reconciliation in SESSION_0020
- **Status:** resolved
- **Resolved in:** SESSION_0059; manifest deprecated, all gaps addressed in `s2-schema-additions.md`.

### D-012 — Dirstarter source audit not completed

- **Source A:** SESSION_0019 plan
- **Source B:** none
- **Decision needed:** Carry to future session
- **Status:** resolved
- **Resolved in:** SESSION_0039; `dirstarter-baseline-index.md` inventoried 300+ files.

### D-013 — Admin auth behavior: 404 vs redirect

- **Source A:** `auth-hoc.tsx`, redirects to `/`
- **Source B:** `auth.md`, says 404
- **Decision needed:** Pick one and align both
- **Status:** resolved
- **Resolved in:** SESSION_0058; aligned to 404 via `notFound`.

### D-014 — Dirstarter `Tool` residue conflicts with monetization reuse

- **Source A:** `schema.prisma` TODO(remove-before-prod), MB-005
- **Source B:** `directory-monetization-roadmap.md`, active `/submit` and `/advertise` flows
- **Decision needed:** Decide quarantine, promotion, or replacement before production
- **Status:** resolved
- **Resolved in:** SESSION_0039; Option B, repurpose Tool to Directory Listing. See `dirstarter-baseline-index.md` section 14.

### D-015 — `wiki/log.md` claimed active append-only status but was stale since SESSION_0031

- **Source A:** `docs/knowledge/wiki/log.md` frontmatter/status
- **Source B:** Current closing/project practice uses SESSION files, Project Log, wiki index, and MB registry
- **Decision needed:** Mark old wiki log as superseded historical context
- **Status:** resolved
- **Resolved in:** 2026-05-08; `wiki/log.md` marked superseded. Routine docs/runbook changes should not be appended there.
