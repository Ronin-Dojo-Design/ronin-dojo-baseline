---
title: "SESSION 0592 — L3: feature-widget (admins-only idea-dump → DB inbox → PL promotion)"
slug: session-0592
type: session--implement
status: staged
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
sprint: S12
lane: bbl
recipe: lane
goal_ids: [G-024]
tickets: []
pairs_with:
  - docs/knowledge/wiki/goals-ledger.md
  - docs/sprints/SESSION_0589.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0592 — L3 feature-widget (BBL admin, reference impl)

> **Pre-staged stub (ADR 0049), planned SESSION_0589.** Reservation branch
> `session-0592-feature-widget`. Adopt: FS-0030, ff to main, flip status. **App-code (`apps/web`) →
> DEPLOYS on push** — full gate set (typecheck / oxlint / oxfmt / affected e2e / `next build` off
> `git diff origin/main..HEAD`). Prisma migration = committed FILE + `migrate deploy` (NEVER
> `migrate dev`). Cody pre-flight before any new component.

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0592

## Goal

Build the **admins-only feature-widget** — the in-app front door to the planning-ledger — on the
**BBL `/app` admin surface** as the reference impl, structured for later `packages/ui-kit` extraction.

**Pinned decisions (SESSION_0589 grill — do NOT re-open):**
1. **NEW sibling component** `apps/web/components/web/feature-widget.tsx` — NOT an overload of
   `feedback-widget.tsx` (different audience/trigger/payload). Admins-only, always-available,
   idea-dump: text + images + category (feature | bug | design | note).
2. **Reuse seams, don't fork them:** the shared R2 **uploader** (`components/web/uploader/*`, the ONE
   R2 seam), the rate-limit, and a `Report`-like persistence pattern.
3. **Intake path = DB inbox → admin triage → session-time promotion to PL rows.** The widget writes
   to a **new DB intake table** (per-deploy; e.g. `PlanningIntake` / reuse `Report` with a new type —
   Cody decides at pre-flight). An **admin triage view** lists raw ideas; promotion into
   `planning-ledger.md` PL rows stays a **session step** (replaces today's operator relay). The
   markdown ledger stays SoT of *planned* work; the DB is the raw inbox.
4. **Mount = BBL `/app` admin only** this lane. Gate admins-only via the existing authz
   (`can(...)` / role audit — repo has 4 authz systems, build no 5th). Structure the component +
   action so extraction to `packages/ui-kit` (for the MMB mount) is clean. **MMB mount = separate
   fast-follow goal, out of scope here.**

**Non-goals:** MMB mount; the phase-2 changelog-page/all-logged-in-users widget; the ledger-code
wiring (that's L2 `session-0591`).

## First task

Adopt per ADR 0049; Cody pre-flight (`cody-preflight.md`) — check the Dirstarter L1 uploader +
AdminCollection one-surface law for the triage view BEFORE creating anything. Read
`feedback-widget.tsx` + `server/web/actions/report.ts` as the persistence precedent (imitate, don't
overload). Confirm the admin surface route + gate.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0592_TASK_01 | pending | feature-widget.tsx (admins-only idea-dump; reuse uploader/rate-limit) |
| SESSION_0592_TASK_02 | pending | DB intake table + submit action (rate-limited, audited) |
| SESSION_0592_TASK_03 | pending | Admin triage view (AdminCollection-conformed) + mount on BBL /app admin |

## Next session

### Goal

### First task
