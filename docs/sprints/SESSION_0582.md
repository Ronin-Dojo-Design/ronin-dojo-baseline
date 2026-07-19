---
title: "SESSION 0582 — CRM tracer loop 2/3: import commit behind explicit confirm (slice a)"
slug: session-0582
type: session--open
status: in-progress
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0574
sprint: S12
lane: mmb
vault_session: "MMB_SESSION_0006"
goal_ids: [MMB-G-004]
tickets: []
pairs_with:

  - docs/sprints/SESSION_0574.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0582 — CRM tracer loop 2/3: import commit behind explicit confirm (slice a)

> **Pre-staged stub (ADR 0049).** Created at SESSION_0574 bow-out; the next bow-in ADOPTS this
> file: flip `status: staged` → `in-progress`, fill Date/Operator, and go — no `cp`. Number 0582
> was minted via `bun scripts/ledger-id-next.ts --prefix=SESSION` (0579–0581 are reserved
> branches for the G-022 fan-out). If the operator re-elects the lane at bow-in, retitle this
> stub — the number claim stands either way.

## Date

2026-07-19

## Operator

Brian + claude-session-0582

## Goal

CRM tracer loop 2/3, slice **(a)** — elected by the operator at SESSION_0574: build the import
COMMIT path behind an explicit confirm on `/app/leads` (`clients/mammoth-build-crm`), including
the pinned preview/write-path dedupe reconciliation (`findOrCreateContact` must match the
preview's case-insensitive email + last-10-digit phone semantics — divergence note at
`lib/lead-ingest.ts:11–16`). Quote the retention law in the opening card: real lead-sheet bodies
go to Mammoth's CRM DB only — never fixtures, repo, tickets, or vault (gated-lane law,
human-code-runbook). Attempt-outcome vocabulary (G-021) is still provisional — ratify it with
the operator if this slice touches it.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

- Stub adopted per ADR 0049 (staged → in-progress; no `cp`). Mint verified:
  `ledger-id-next --prefix=SESSION` → highest claimed 0582, next free 0583. Branch
  `session-0582-mmb-import` created in the canonical checkout (main was clean; 0577
  worktree removed post-merge — loop-1 code lives on `main` at `4b8f3121` lineage).
- Previous MMB session: SESSION_0577 (G-021 loop 1/3, closed, merged). Its Next-session
  candidates (a)/(b)/(c) — operator elected **(a) import commit behind explicit confirm**
  at SESSION_0574 (this stub). Open decisions carried in: dedupe reconciliation
  (`lead-ingest.ts:11–16` divergence note — preview is case-insensitive email +
  last-10-digit phone; `findOrCreateContact` in `lib/actions.ts:250` is case-sensitive
  exact email only), attempt-outcome vocabulary still provisional (likely untouched by
  this slice).
- Ledger scan: G-021 in-progress P1 (this lane); 0 open PRs (no pr-fix-loop default);
  board top = BBL items — operator-pinned stub wins precedence.
- Env: `clients/mammoth-build-crm/.env` → `mammoth_dev` (0577 scratch DB retired).
  `Contact.phone` exists in schema — write-path widening needs NO migration.
- Retention law (quoted, gated-lane law / human-code-runbook): **real lead-sheet bodies
  go to Mammoth's CRM DB only — never fixtures, repo, tickets, or vault.**

## Petey plan

### Goal

Build the lead-sheet import COMMIT path behind an explicit confirm on `/app/leads`
(`clients/mammoth-build-crm`), reconciled to ONE dedupe semantic. All writes to the
Mammoth CRM DB only (retention law). No schema migration needed.

### Grill outcome (operator, 2026-07-19)

1. **Dedupe reconciliation: WIDEN the write path** — `findOrCreateContact` adopts the
   preview's semantics (case-insensitive email + last-10-digit phone), consuming the
   same matcher implementation as `lib/lead-ingest.ts` (one semantic, one module).
2. **On match at commit: SKIP + REPORT** — matched rows are never written; confirm
   screen + post-import report count them as skipped duplicates. **Enrich-blanks
   becomes a ledgered loop candidate under G-021** (beside 0577's (b) Lead Source
   facet and (c) attempt-cadence candidates).
3. **Committed row creates Contact + lead Project** — stage `lead`, standard
   first-touch nextTask, so imported leads land on the pipeline/Today queue.
4. Attempt-outcome vocabulary: untouched by this slice — stays provisional under G-021.

### Tasks

- **TASK_01 (Cody):** extract/share the dedupe matcher; widen `findOrCreateContact`
  to case-insensitive email + normalized-phone match; unit tests.
- **TASK_02 (Cody):** `commitLeadSheet` server action — owner-gated, creates
  Contact + lead Project per non-duplicate row, skip+report duplicates; re-running
  the same sheet is a no-op (all rows skip).
- **TASK_03 (Cody):** explicit confirm step on the `/app/leads` ingest preview
  (counts: N new / M skipped) + post-commit report.
- **TASK_04 (Doug):** gates inside `clients/mammoth-build-crm` (root gates never
  cover standalone clients) + live UAT per the 0577 recipe (fixture login,
  in-page fetch); dedupe-parity proof preview↔write.
- **TASK_05 (Petey):** G-021 child rows (loop-2 slice + enrichment candidate),
  full bow-out; HOLD at push gate.

### Scope guard

No live integrations · no real lead data in fixtures/repo/tickets/vault (retention
law) · no schema change; `migrate dev` banned regardless · no apps/web or ui-kit
changes · no push/PR/deploy without the operator's explicit go.

## Pre-flight: Backend — shared dedupe matcher + commitLeadSheet (TASK_01/02)

### 1. Auth predicates planned
- [x] Session auth required — `commitLeadSheet` gated via `requireOwner()` (same as every action in `lib/actions.ts`)
- Org membership / brand column: N/A (standalone client app, per-product DB — ADR 0038; ownership key is `Project.ownerId` = caller's TeamMember)
- Authorization approach: owner-gated action; created Projects stamped `ownerId = caller`; Contacts are CRM-global (matches `listLeadDedupeIndex` + `findOrCreateContact` semantics)

### 2. Existing action scan
- Searched `clients/mammoth-build-crm/lib/` — read in full: `actions.ts` (`requireOwner`, `findOrCreateContact` L250, `createProject`, `createProjectFromCard`, `recordContactAttempt` `$transaction` idiom, `listLeadDedupeIndex`), `lead-ingest.ts` (emailKey/phoneKey L270–284 = the normalization helpers to extract), `lead-source.ts`, `db.ts`
- L1 pattern match: repo-local server-action idiom (`"use server"` module, async exports only, interactive `$transaction` per `recordContactAttempt`)
- Plan: NEW pure `lib/contact-match.ts` (emailKey/phoneKey extracted from lead-ingest — ONE matcher), NEW pure `lib/lead-commit.ts` (planLeadCommit: parse+dedupe+plan, keyless rows refused for idempotency), `commitLeadSheet` action executes the plan in one transaction reading the contact index inside the tx

### 3. Data flow reference
- Flow: SESSION_0577 tracer shape (pure lib → server action → client page); prerequisites: none beyond existing schema (`Contact.phone` exists — verified in `prisma/schema.prisma` L246; NO migration)
- Schema spot-check: `Contact { email String; phone String?; source LeadSource @default(web_form) }`; `Project { stage StageId @default(lead); contactId String (Restrict); ownerId String?; buildingType/use/region String required }`

### 4. FAILED_STEPS check
- Prior failures: FS-0027 (bare multi-file `bun test`) — mitigated: app-local `bun run test` (= `bun test --parallel=1`); new tests are pure (no Prisma mocks, no `mock.module`), matching the 0577 idiom in `lead-ingest.test.ts`/`sales-cockpit.test.ts`
- Boundary: mammoth `next build` may fail on missing env (0577 precedent MB — record if hit)

## Pre-flight: LeadCommitPanel (confirm UI, TASK_03)

### 1. Existing component scan
- Searched `clients/mammoth-build-crm/components/` + `app/app/leads/page.tsx`: page-local idiom is in-file components (PreviewReport, PreviewRow, CountChip, Missing) with the app's field/button classes — no component family to import
- Found: primary button class (Preview + dedupe button), alert list class (parse errors), CountChip — all reused

### 2. L1 template scan
- Dirstarter inventory: not applicable (per-product client app — 0577 Doug precedent: "per-product client app; ui-kit MCard reused as-is"); no ui-kit primitive for a confirm block
- Closest pattern: `PreviewReport` footer + the page's primary action button

### 3. Composition decision
- [x] Composing existing page-local idioms: confirm panel added inside the existing preview section, styled with the page's established button/alert/chip classes; no new component family

### 4. Lane docs loaded
- [x] SESSION_0577 §Task log/Verification/Review log read; SESSION_0582 Petey plan + grill outcome read
- Runbook: RETENTION LAW quoted in Goal (real lead-sheet bodies → CRM DB only)

### 5. Dev environment confirmed
- Working dir: `clients/mammoth-build-crm/` (standalone; root gates never cover it)
- Verification: `bun run typecheck`, `bun run test` (app-local), `bun run build` attempt, root `bun run format:check` (adding files)

### 6. FAILED_STEPS check
- FS-0027 acknowledged (see backend pre-flight); no UI-area FS entries for this app

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0582_TASK_01 | built | Shared dedupe matcher (`lib/contact-match.ts`) + widened findOrCreateContact (insensitive email, phone fallback, phone stored on create); board-card path passes phone; matcher unit tests |
| SESSION_0582_TASK_02 | built | `commitLeadSheet` action (owner-gated, raw-text re-parse in-tx, skip+report, Contact+lead Project per new row) over pure `lib/lead-commit.ts` planner; idempotency + keyless-row-refusal tests |
| SESSION_0582_TASK_03 | built | Explicit confirm panel (N new / M skipped, click-to-import) + post-commit report + index refresh on /app/leads |
| SESSION_0582_TASK_04 | in-progress | Doug dispatched: independent gates + scratch-DB live UAT (0577 recipe) + parity/idempotency proof |
| SESSION_0582_TASK_05 | pending | Ledger rows + full close (push gate HELD) |

## Next session

### Goal

### First task
