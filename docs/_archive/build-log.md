---
title: "Build Log"
slug: build-log
type: log
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0015
---

# Build log

Append-only execution log. One entry per completed task. Unlike SESSION files (which track planning + discussion), this tracks **what actually shipped and whether it works.**

**Rules:**

- Every Cody task that touches code gets an entry here.
- Entries are never edited after creation (append-only).
- Status is one of: `✅ verified`, `⚠️ needs-verification`, `❌ broken`, `🔄 superseded`.
- If a smoke test fails, the entry gets a `Fix:` line appended (not edited).

---

## Format

```
### TASK_ID — Short description
- **Session:** SESSION_NNNN
- **Sprint:** SX
- **Status:** ✅ verified | ⚠️ needs-verification | ❌ broken | 🔄 superseded
- **Files:** path/to/file.ts, path/to/other.ts
- **Seed data:** yes/no (does prisma/seed.ts cover this feature?)
- **Smoke test:** description of what was tested, or "pending"
- **Fix:** (only if status changed after initial entry)
```

---

## Log

### S1_SCHEMA — Phase 1 schema rev (31 models, all enums)

- **Session:** SESSION_0003–0005
- **Sprint:** S1
- **Status:** ✅ verified
- **Files:** prisma/schema.prisma, prisma/seed.ts, migrations/
- **Seed data:** yes (12 disciplines, 13 rank systems, 194 ranks, roles, event types)
- **Smoke test:** migration applied, seed ran, Prisma Studio verified

### S2_AUTH — Better-Auth + Passport bootstrap

- **Session:** SESSION_0007
- **Sprint:** S2
- **Status:** ✅ verified
- **Files:** auth config, passport routes, middleware
- **Seed data:** yes (2 template users)
- **Smoke test:** sign-up creates User + Passport + DirectoryProfile stubs

### S3_ORG — Organization create + join flow

- **Session:** SESSION_0008–0013
- **Sprint:** S3
- **Status:** ✅ verified
- **Files:** org actions, org pages, membership logic
- **Seed data:** partial (no test orgs in seed at the time)
- **Smoke test:** create org + join flow tested in browser

### S4_DIRECTORY — Directory search with privacy

- **Session:** SESSION_0014
- **Sprint:** S4
- **Status:** ⚠️ needs-verification
- **Files:** server/web/directory/queries.ts, components/web/directory/*, app/(web)/directory/page.tsx
- **Seed data:** no → **fixed in SESSION_0015** (5 test users with full identity graph)
- **Smoke test:** pending — directory showed empty because no seed data existed
- **Fix (SESSION_0015):** Added 5 test users to seed.ts with Passport + DirectoryProfile + Organization + Membership + RankAward. Reseeded. Awaiting browser verification.

### S15_SEED_FIX — Seed script: full identity graph

- **Session:** SESSION_0015
- **Sprint:** S4 (fix)
- **Status:** ✅ verified
- **Files:** prisma/seed.ts
- **Seed data:** yes — 5 users: sensei (PUBLIC/ACTIVE/Blue), alpha (PUBLIC/ACTIVE/White), beta (MEMBERS_ONLY/ACTIVE/L3), ghost (HIDDEN/ACTIVE), pending (PUBLIC/PENDING)
- **Smoke test:** `prisma db seed` ran successfully, all 5 users created with full graph

### S15_DOC_ADOPTION — SOP adoption + feature prerequisites + Cody pre-flight

- **Session:** SESSION_0015
- **Sprint:** S4 (housekeeping)
- **Status:** ✅ verified
- **Files:** docs/runbooks/sop-data-and-wiring-flows.md, docs/runbooks/sop-e2e-user-lifecycle.md, docs/architecture/feature-data-prerequisites.md, docs/agents/cody.md
- **Seed data:** n/a (docs only)
- **Smoke test:** n/a

### S15_CLOSE_FIX — Full close steps remediation (FS-0004)

- **Session:** SESSION_0015
- **Sprint:** S4 (process fix)
- **Status:** ✅ verified
- **Files:** docs/protocols/failed-steps-log.md, docs/agents/cody.md, docs/knowledge/wiki/index.md, docs/knowledge/wiki/files/seed-ts.md, docs/architecture/feature-data-prerequisites.md, docs/sprints/SESSION_0015.md
- **Seed data:** n/a
- **Smoke test:** JETTY sweep completed, wiki index updated, close checklist artifact added to SESSION file
