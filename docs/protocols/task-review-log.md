---
title: "TASK_REVIEW_LOG"
slug: task-review-log
type: protocol
status: active
created: 2026-04-29
updated: 2026-04-29
last_agent: codex-session-0025
health: 8
pairs_with:
  - docs/protocols/task-plan-log.md
  - docs/rituals/closing.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/hostile-close-review.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0023.md
  - docs/sprints/SESSION_0024.md
  - docs/sprints/SESSION_0025.md
---

# TASK_REVIEW_LOG

Append-only review ledger for session tasks from SESSION_0023 forward.

Use this log for hard review findings that should survive beyond a single chat
response. Keep it concise, cite local file/line evidence, and connect findings
to a task ID from `TASK_PLAN_LOG`.

## Rules

1. Every review entry gets a stable ID:
   `SESSION_NNNN_REVIEW_XX`.
2. Every finding gets a stable ID:
   `SESSION_NNNN_FINDING_XX`.
3. Findings must name severity, affected task, evidence, impact, and required
   follow-up.
4. Do not hide uncomfortable findings in prose. If it can hurt launch, make it
   a finding.
5. Closing ritual must append or update the current session's review entry
   before status changes to `closed-full`.

## SESSION_0023_REVIEW_01 - Schema Wave A hostile review

**Reviewed tasks:** SESSION_0023_TASK_01, SESSION_0023_TASK_02, SESSION_0023_TASK_03

**Verdict:** Mostly sound for local schema substrate. Not clean enough to call
production-ready. The implementation follows Dirstarter's extension posture for
Prisma, but the plan underestimates database uniqueness edge cases and security
proof.

### SESSION_0023_FINDING_01 - Nullable unique constraints do not enforce the plan

- **Severity:** high
- **Task:** SESSION_0023_TASK_02
- **Evidence:** `BeltTestPrerequisiteConfig` has nullable `rankId` inside `@@unique([rankSystemId, rankId, organizationId])` at `apps/web/prisma/schema.prisma:1056` and `apps/web/prisma/schema.prisma:1061`; `NotificationPreference` has nullable `programId` inside `@@unique([userId, category, channel, programId])` at `apps/web/prisma/schema.prisma:1273` and `apps/web/prisma/schema.prisma:1275`.
- **Impact:** PostgreSQL allows multiple `NULL` values in unique indexes. The schema therefore does not actually prevent duplicate default prerequisite configs or duplicate global notification preferences.
- **Required follow-up:** Before production migration, use explicit scope keys, split global/program rows, or add raw SQL partial unique indexes in a real migration. Do not pretend Prisma validation proves this business rule.
- **Status:** open

### SESSION_0023_FINDING_02 - WORKFLOW 5.0 was followed operationally but not calendrically

- **Severity:** medium
- **Task:** SESSION_0023_TASK_01
- **Evidence:** WORKFLOW 5.0 assigns Apr 29 to `SESSION_0021` and Wave A at `docs/protocols/WORKFLOW_5.0.md:150`; the planned `SESSION_0021` file is still `status: planned` at `docs/sprints/SESSION_0021.md:5`; this work landed in `SESSION_0023`.
- **Impact:** The lane, worktree, Dirstarter table, and review loop were used, but the session calendar now has traceability drift. Future agents may load stale `SESSION_0021` and misread what is done.
- **Required follow-up:** Mark `SESSION_0021` as superseded or recovered in a dedicated cleanup, and keep the wiki session index current.
- **Status:** open

### SESSION_0023_FINDING_03 - Schema is not an authorization system

- **Severity:** medium
- **Task:** SESSION_0023_TASK_02
- **Evidence:** New billing and operational models are attached to `User`, `Organization`, and `Program`, but no service/action authorization was added in this session. Dirstarter's baseline auth is app-layer role/session based, so schema relations alone do not enforce brand/org access.
- **Impact:** No endpoint is exposed yet, so this is not an active exploit. It becomes a security bug the moment a server action or route reads invoices, contracts, attendance, payouts, or check-ins without brand/org membership checks.
- **Required follow-up:** For every Wave A server action/query, require brand scope plus organization membership/role predicates before returning or mutating tenant data. Tracked in Manual Boundary Registry MB-002.
- **Status:** open

### SESSION_0023_FINDING_04 - Dirstarter dev flow aligned; production migration is still missing

- **Severity:** medium
- **Task:** SESSION_0023_TASK_03
- **Evidence:** Local verification used `prisma db push`, `prisma generate`, and seed successfully, matching the Dirstarter dev commands. No migration files were created, and `docs/runbooks/schema-migration.md` explicitly says production migration is not covered.
- **Impact:** Local development is unblocked. Production deploy is not, because deploy needs durable migration artifacts and rollback planning.
- **Required follow-up:** Create a production migration runbook and real migration files before Neon/Vercel deployment gates.
- **Status:** open

## SESSION_0023_REVIEW_02 - Accountability log review

**Reviewed task:** SESSION_0023_TASK_04

**Verdict:** Log placement is logically sound. The logs belong in `docs/protocols/`
with references from opening, closing, and the wiki index. Embedding append-only
history directly inside rituals would make the rituals harder to execute.

### SESSION_0023_FINDING_05 - Accountability must be enforced at ritual boundaries

- **Severity:** low
- **Task:** SESSION_0023_TASK_04
- **Evidence:** `TASK_PLAN_LOG` and `TASK_REVIEW_LOG` are new. Their value depends on opening and closing rituals forcing updates.
- **Impact:** If the rituals only mention the logs as optional reading, the logs will decay.
- **Required follow-up:** Opening must require a plan-log entry when tasks are identified. Closing must require a review-log entry before `closed-full`.
- **Status:** addressed

## SESSION_0024_REVIEW_01 - Hostile close review protocol review

**Reviewed tasks:** SESSION_0024_TASK_01

**Dirstarter docs check:** live docs checked

**Sources:** `https://dirstarter.com/docs/introduction`, `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/codebase/structure`

**Verdict:** This is the right protocol shape. The hostile review belongs in its own protocol and gets invoked by closing; embedding the full checklist inside `closing.md` would make close slower and harder to maintain. The Dirstarter gate is explicit enough to force live docs for baseline-touching sessions without wasting time on live browsing for irrelevant typo-only sessions.

### SESSION_0024_FINDING_01 - Hostile review must stay mandatory for meaningful work

- **Severity:** low
- **Task:** SESSION_0024_TASK_01
- **Evidence:** `docs/rituals/closing.md` now requires `Hostile close review` in SESSION output and invokes `docs/protocols/hostile-close-review.md`.
- **Impact:** If future agents treat hostile review as optional, the same false-confidence pattern returns.
- **Required follow-up:** During full close, reject `closed-full` status unless `TASK_REVIEW_LOG` has the current session review entry or an explicit not-applicable line.
- **Status:** addressed

## SESSION_0025_REVIEW_01 - Full-close proof contract review

**Reviewed tasks:** SESSION_0025_TASK_01, SESSION_0025_TASK_02, SESSION_0025_TASK_03

**Dirstarter docs check:** not applicable

**Sources:** local close protocols only; no Dirstarter-owned code layer changed in SESSION_0025.

**Verdict:** The correction is sound. Full close now has a proof artifact instead of generic checkmarks, wiki-lint has an executable command, the domain language names these concepts, and SESSION_0025 proves the command with a clean run. The remaining risk is operational discipline: a future agent can still fail by claiming `closed-full` without the evidence table.

**Verification:** `bun run wiki:lint` passed with no violations across 111 markdown files; Prisma schema validate passed; `git diff --check` passed.

### SESSION_0025_FINDING_01 - Full close must prove wiki-lint, not name it

- **Severity:** low
- **Task:** SESSION_0025_TASK_02
- **Evidence:** `docs/rituals/closing.md` now requires `bun run wiki:lint` and the `## Full close evidence` table records command result.
- **Impact:** The protocol now blocks vague claims, but only if future agents respect the table.
- **Required follow-up:** Treat a missing wiki-lint row in `## Full close evidence` as a failed close.
- **Status:** addressed
