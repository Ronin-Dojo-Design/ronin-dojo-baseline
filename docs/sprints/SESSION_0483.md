---
title: "SESSION 0483 — Slice 6: BBL Lead Pipeline board (Mammoth pattern over BBL's own data) — epic complete"
slug: session-0483
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0483
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0482.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0483 — Slice 6: BBL Lead Pipeline board — epic complete

> **Autonomous epic, Slice 6 (final) of [`petey-plan-0477`](../petey-plan-0477-belt-journey-crm-epic.md)** —
> driven by `claude-session-0483` (Petey→Cody); Codex paused on out-of-credits. Stacked on Slice 5
> (`auto/session-0482`). **This closes the epic** (Slices 1–6 = PRs #177–#182). Slice 7 (agent-driven lead
> automation) remains HELD for operator design.

## Goal

Run "the Mammoth CRM for BBL" the doctrine-correct way (ADR 0034/0038 — share the kernel, not the data): a BBL
Lead Pipeline board mounting the `AdminKanban` kernel over BBL's own `Lead`/`Organization` data, where the
Slice-1 school-outreach leads become a workable, demand-ranked outreach queue.

## Status

Closed. Slice 6 complete + gates green (incl. `next build`); committed to `auto/session-0483` for PR (stacked
on `auto/session-0482`). **Epic complete.**

## What landed

- **`apps/web/lib/leads-pipeline/`** — `board-config.ts` (stages **NEW → TRIAL_BOOKED → CONTACTED → CONVERTED →
  LOST**; stage id === `LeadStatus` for 1:1 drag→status; off-board statuses read-only-collapse so no lead is
  invisible), `project.ts` (pure DB-row→DTO, unit-testable), `queries.ts` (`loadPipelineLeads`, BBL-scoped,
  `leads.manage`-gated), `actions.ts` (`updateLeadStatus` / `createLeadFollowUp` / `prepareSchoolInvite`),
  `board-store-db.ts` (the `BoardStore` adapter), `types.ts`.
- **Route `app/app/leads-pipeline/`** — `layout.tsx` (`requirePermission(leads)`), `page.tsx` (SSR-load once +
  derive the school queue + mount the client board), `_components/leads-pipeline.tsx` (mounts `AdminKanban` +
  the demand-ranked **"Schools to invite"** rail + the invite button).
- **Invite = two operator clicks, never auto-send** — `prepareSchoolInvite` reuses `createOrgInvite`; the email
  (`notifyUserOfInvite`) fires **only** on an explicit `recipientEmail`. A no-recipient call prepares the link
  and returns `{ sent: false }`, never touching the email seam (asserted by a test).
- **Doctrine-clean:** zero imports from `clients/mammoth-build-crm`, no cross-product FKs, BBL DB only — the
  same config-driven `AdminKanban`-over-own-data pattern BBL's loop-board already uses.
- **School-outreach tag:** Slice 1 was schema-free — `SCHOOL_OUTREACH` is a `Lead.meta.kind === "school_outreach"`
  tag (`source = OTHER`), demand at `Lead.meta.demandCount`. The board filters on the canonical Slice-1 constant.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/leads-pipeline/*` (6 files + 3 tests) | **NEW** — BBL leads `BoardConfig` + store adapter + queries/actions + pure projection |
| `apps/web/app/app/leads-pipeline/*` (layout, page, `_components/leads-pipeline.tsx`) | **NEW** — the gated route mounting `AdminKanban` + school-invite rail |

## Verification

| Gate | Result |
| --- | --- |
| `tsc --noEmit` | ✅ 0 errors |
| `oxlint` / `oxfmt --check` (touched) | ✅ clean |
| `bun run test lib/leads-pipeline/` | ✅ 23 pass / 0 fail |
| `bun run build` (app-code gate) | ✅ PASS |
| Isolation (no `clients/mammoth-build-crm` import; no cross-product FK) | ✅ confirmed |

## Open decisions / blockers

- **No nav link** — `/app/leads-pipeline` is reachable by URL but not yet in the `/app` sidebar (wire it beside
  `/app/leads` + `/app/loop-board` — a small UI decision left for review).
- **Whole-doc save → audit-per-card-per-save** — matches Mammoth's `reconcileBoard` + loop-board's `saveBoard`
  (benign, idempotent); short-circuit `updateLeadStatus` on unchanged status if audit noise matters.
- **Codex out of credits** (external) — the whole epic (Slices 3–6) was driven in Claude after Codex halted at
  Slice 3. Top up Codex credits to use the cheaper autonomous driver for future runs.

## Next session

### Goal

**Slice 7 — HELD for operator design** (agent-driven lead automation: auto-triage/assign, draft outreach,
escalate stale leads via Petey/Cody handoffs — net-new, out-of-scope for the autonomous build). First, **review
+ merge the 6-PR stack bottom-up** (#177 → #182). Then design Slice 7 or ship the belt-journey + CRM as-is.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0483_TASK_01 | ✅ done | BBL Lead Pipeline board (`AdminKanban` over BBL `Lead` data) + demand-ranked school-invite rail + no-auto-send invite; 23 tests. Epic complete. |
