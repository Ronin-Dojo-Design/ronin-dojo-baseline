---
title: "SESSION 0592 — L3: feature-widget (admins-only idea-dump → DB inbox → PL promotion)"
slug: session-0592
type: session--implement
status: closed
created: 2026-07-20
updated: 2026-07-21
last_agent: claude-session-0592
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
| SESSION_0592_TASK_01 | done | `feature-widget.tsx` — admins-only idea-dump dialog (category + body + up to 4 images via the shared `ImageFieldUploader`); mounted admins-only in `app/app/layout.tsx` |
| SESSION_0592_TASK_02 | done | `PlanningIntake` model + enums (schema + `prisma generate`, migration NOT authored — orchestrator's job); `createPlanningIntake` / `updatePlanningIntakeStatus` actions (`adminActionClient`, IP rate-limited, `Report.ts`-shaped) |
| SESSION_0592_TASK_03 | done | `/app/planning-intake` triage view — AdminCollection-conformed (table + columns + in-row status `DataSelect`), gated on new `planningIntake.manage` permission key |

## What landed

- **`PlanningIntake` DB model** (`prisma/schema.prisma`): `category` (`PlanningIntakeCategory`:
  FEATURE/BUG/DESIGN/NOTE), `body`, `imageUrls` (String[] — see naming note below), `status`
  (`PlanningIntakeStatus`: NEW/TRIAGED/PROMOTED/DISMISSED, default NEW), `createdById` (nullable
  `User` relation). Indexed on `status`, `category`, `createdById`. **Migration not authored or
  applied** (out of Cody's lane per the dispatch brief) — `bunx prisma generate --no-hints` only
  (DB-free), so `tsc` sees the model but no schema change has touched the shared local DB.
- **Naming deviation from the literal brief text, confirmed via precedent**: the brief named the
  field `imageKeys` ("R2 keys") and asked to confirm the storage convention against an existing
  model. `ContentAtom.sourceAssets` (`String[] /// URLs/paths to source media`) and the `uploadMedia`
  action (`uploadToS3Storage` returns a full public URL, not a raw object key) are the confirmed
  convention — so the field is `imageUrls: String[]` storing full uploaded URLs, matching
  `sourceAssets` exactly. Flagging this explicitly since it differs from the brief's literal field
  name.
- **`FeatureWidget`** (`components/web/feature-widget.tsx`): a persistent fixed-position trigger
  (bottom-left, clear of the member-facing MAB which owns bottom-right) opening a `Dialog` form —
  category `DataSelect`, `body` `TextArea`, up to 4 image slots (each a real `ImageFieldUploader`
  instance — the existing R2 seam reused as-is, not forked; `presets: ["free"]` so no forced
  aspect ratio). Prop-free, no internal admin check (mirrors `FeedbackWidget`'s self-contained
  shape) — the mount site gates it, keeping it a clean `ui-kit` extraction candidate.
- **Actions** (`server/web/actions/planning-intake.ts`): `createPlanningIntake` (IP rate-limited,
  new `planning_intake` bucket in `lib/rate-limiter.ts`, fail-open — authenticated admin actor, not
  a public abuse surface) and `updatePlanningIntakeStatus` (the triage flip). Both run through
  `adminActionClient` — admin-gated end-to-end, no separate action-layer permission needed.
- **`/app/planning-intake`** triage index: AdminCollection-conformed (`page.tsx` +
  `_components/planning-intake-table.tsx` + `-table-columns.tsx` +
  `-status-select.tsx`), gated by a new `planningIntake: "planning-intake.manage"` key in
  `APP_AREA_PERMISSIONS` (mirrors every other `/app/*` area's own key — not a 5th authz system).
  Status defaults to the `NEW` queue; a header `DataSelect` switches to Triaged/Promoted/
  Dismissed/All. Body search wired into the query (`contains`, case-insensitive). No `[id]` detail
  route — triage is a single status flip, done in-row (mirrors `TechniqueFeatureToggle`, not
  `Report`'s `[id]` editor).
- `PROMOTED` is set by hand once an admin has actually authored the corresponding
  `planning-ledger.md` PL row — nothing here auto-writes to the markdown ledger.

## Files touched

- `apps/web/prisma/schema.prisma` — `PlanningIntakeCategory`, `PlanningIntakeStatus`, `PlanningIntake`
  model, `User.createdPlanningIntakes` back-relation.
- `apps/web/server/web/shared/schema.ts` — `createPlanningIntakeSchema` + `PLANNING_INTAKE_MAX_IMAGES`.
- `apps/web/server/web/actions/planning-intake.ts` (new) — `createPlanningIntake`,
  `updatePlanningIntakeStatus`.
- `apps/web/lib/rate-limiter.ts` — `planning_intake` bucket.
- `apps/web/server/orpc/roles.ts` — `APP_AREA_PERMISSIONS.planningIntake`.
- `apps/web/server/admin/planning-intake/queries.ts` (new), `schema.ts` (new).
- `apps/web/app/app/planning-intake/page.tsx` (new),
  `_components/planning-intake-table.tsx` (new), `-table-columns.tsx` (new),
  `-status-select.tsx` (new).
- `apps/web/components/web/feature-widget.tsx` (new).
- `apps/web/app/app/layout.tsx` — mounts `<FeatureWidget />` admins-only.

## Self-checks (Cody, no DB/build access in this worktree)

- `bunx prisma generate --no-hints` — succeeds, `PlanningIntake` in the generated client.
- `bunx tsc --noEmit` — delta-diffed against a pre-edit baseline (127 pre-existing
  `Cannot find name 'PageProps'/'LayoutProps'` errors from this fresh worktree never having run
  `next build`/`.next/types` generated). Delta = exactly one new same-class error
  (`app/app/planning-intake/page.tsx` `PageProps`) + a line-number shift on the pre-existing
  `app/app/layout.tsx` error. Zero new *type* errors.
- `bunx oxlint` on every new/changed `.ts`/`.tsx` file — clean (exit 0).
- **Outstanding, by design (out of Cody's lane):** no migration authored/applied for
  `PlanningIntake` — the orchestrator authors + applies it, then `next build` / affected e2e / the
  full gate set run for real.

## Next session

### Goal

**Desi Design Review of the `/app/planning-intake` triage surface + the feature-widget** (queued by
operator, SESSION_0592 close). L3 landed functionally green (live smoke passed), but the AdminCollection
triage table has UX polish gaps to review — behavior-preserving, no schema/logic change.

### First task

Dispatch **Desi** on the `/app/planning-intake` surface (drive it via `/api/auth/dev-login` against
prodsnap — the migration is applied there). Concrete findings to review:

- **Body column truncates** — long idea text is clipped with no wrap / tooltip / row-expand (operator
  flagged from the smoke screenshot). Decide: wrap, line-clamp+tooltip, or a detail-expand.
- **"Submitted by" wraps** the long user identifier awkwardly — consider a shorter identity
  (name/avatar over raw id/email) and column-width balance.
- General AdminCollection column-sizing + responsive/mobile pass for this surface (parity with
  `/app/tools` · `/app/techniques`).
- Confirm the widget trigger placement (bottom-left) reads well in prod (no Next.js dev-overlay there).

Desi returns a prioritized fix list for a Cody follow-up; no behavior/logic changes in her pass.
