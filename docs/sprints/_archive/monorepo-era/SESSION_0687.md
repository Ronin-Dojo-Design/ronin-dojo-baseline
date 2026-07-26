---
title: "SESSION 0687 — Mammoth drafts→approval posting pipeline (templates → PostingDraft, approve-never-posts) (overnight auto lane)"
slug: session-0687
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0687
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
  - docs/product/mammoth-build/templates/posting-templates.md
  - docs/product/mammoth-build/social-automation-playbook-draft.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0687 — Mammoth drafts→approval posting pipeline

> Overnight-orchestrator lane. Worktree `/Users/brianscott/dev/ronin-0687`, branch
> `auto/session-0687-mmb-posting-pipeline` (base: main). CODE lane in the Mammoth CRM
> (`clients/mammoth-build-crm`) — mirrors the BBL approval-queue posture. Drafts-only; the
> pipeline STOPS at `approved`, no auto-post.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by the overnight run.

## Goal

Build a posting pipeline that renders social posts from `docs/product/mammoth-build/templates/posting-templates.md`
into a DRAFT/APPROVAL queue: a `PostingDraft` Prisma model + migration, a generator that renders
templates into drafts, a server action transitioning draft→approved (never further), and hermetic
unit tests.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0687_TASK_01 | done | Bootstrap: `bun install` + `bunx prisma generate` in `clients/mammoth-build-crm` (own DB, ADR 0038); no reachable local Postgres in this sandbox — schema validated + client generated without a live DB connection |
| SESSION_0687_TASK_02 | done | Read the two source docs; transcribed the 7 templates × 3 platforms into `lib/posting/templates.ts` (content-as-code, matching `lib/content.ts`'s existing convention) |
| SESSION_0687_TASK_03 | done | Pure generator (`lib/posting/generator.ts`) + pure status-transition rules (`lib/posting/status.ts`), both hermetically unit-tested — same fat-pure/thin-DB split as `lib/lead-commit.ts` / `lib/actions.ts` |
| SESSION_0687_TASK_04 | done | Prisma model `PostingDraft` + `PostingPlatform`/`PostingStatus` enums + back-relations on `Project`/`TeamMember`; hand-authored migration (this app's `migrate dev`-banned convention, precedented by `20260628130000_mammoth_better_auth`) |
| SESSION_0687_TASK_05 | done | `lib/posting/actions.ts` ("use server"): `listPostingDrafts`, `generatePostingDraft`, `approvePostingDraft` — owner-gated, approve-never-posts enforced by construction (no `posted`-setting export anywhere) |
| SESSION_0687_TASK_06 | done | `app/posting/page.tsx` — draft/approval queue UI (generate form + `MCard` list + Approve button), standalone top-level route so the owned subtree never touches the shared `/app` shell |
| SESSION_0687_TASK_07 | done | Gates: `bun run typecheck` (exit 0), `bun run test` (exit 0, 63 pass / 0 fail incl. 2 new hermetic files) |

## What landed

- **`clients/mammoth-build-crm/lib/posting/templates.ts`** — the 7 posting templates × 3 platforms
  (Facebook / Instagram / Google Business Profile) transcribed verbatim from the doc, as typed
  data (`POSTING_TEMPLATES`, `getPostingTemplate`).
- **`clients/mammoth-build-crm/lib/posting/generator.ts`** — pure `renderPostingTemplate` (fills
  `[PLACEHOLDER]` tokens from a context map, leaves unfilled ones literal + reports them —
  "never turn a placeholder into a guess") + `extractPlaceholders`/`hasUnresolvedPlaceholders`.
  Uses two separate regex instances deliberately (one global for `matchAll`/`replace`, one
  non-global for the `.test()` existence check) to avoid a `lastIndex`-state bug across repeated
  calls on a shared global-flagged `RegExp`.
- **`clients/mammoth-build-crm/lib/posting/status.ts`** — pure `planApprovePostingDraft`: refuses
  to approve anything that isn't currently `draft`, and refuses a draft with unresolved
  placeholders. No function anywhere in `lib/posting/**` sets status `posted`.
- **`clients/mammoth-build-crm/lib/posting/types.ts`** — the flat `PostingDraftRecord` read-model
  + `GeneratePostingDraftInput`.
- **`clients/mammoth-build-crm/lib/posting/actions.ts`** ("use server") — `listPostingDrafts`,
  `generatePostingDraft`, `approvePostingDraft`. Owner-gated via a duplicated `requireOwner()` (see
  "Proposed ledger edits" below for why it's a duplicate, not an import).
- **`clients/mammoth-build-crm/app/posting/page.tsx`** — the draft/approval queue: a generate form
  (template + platform + optional CRM project id + one input per remaining placeholder) and an
  `MCard`-based drafts list with an Approve button (disabled while placeholders remain).
- **Prisma schema** (`clients/mammoth-build-crm/prisma/schema.prisma`) — `PostingPlatform`,
  `PostingStatus` enums; `PostingDraft` model (optional `Project` FK, optional `approvedBy`
  `TeamMember` FK, `body`, `status` default `draft`, `scheduledFor`/`approvedAt`/`postedAt`);
  back-relation array fields added to `Project` (`postingDrafts`) and `TeamMember`
  (`approvedPostingDrafts`).
- **Migration** — `prisma/migrations/20260724193000_mammoth_posting_pipeline/migration.sql`,
  hand-authored (this app's established convention — `prisma migrate dev` is banned against the
  shared local DB, and this sandbox had no reachable Postgres). Purely additive: 2 enums + 1 table
  + 2 indexes + 2 FKs; no existing columns touched.
- **Tests** — `lib/posting/generator.test.ts` (11 cases: fill/leave-unfilled/blank-treated-as-missing/
  unknown-key-throws/every-template-renders-on-every-platform, plus a regression case pinning the
  regex-statefulness fix) and `lib/posting/status.test.ts` (5 cases incl. the explicit
  "approving a draft never yields status 'posted'" proof). Both hermetic — pure functions, no DB,
  no mocks, matching the `lib/lead-commit.test.ts` / `lib/board-config.test.ts` pattern already in
  this app.

## Files touched

| File | Change |
| --- | --- |
| `clients/mammoth-build-crm/lib/posting/templates.ts` | NEW |
| `clients/mammoth-build-crm/lib/posting/generator.ts` | NEW |
| `clients/mammoth-build-crm/lib/posting/generator.test.ts` | NEW |
| `clients/mammoth-build-crm/lib/posting/status.ts` | NEW |
| `clients/mammoth-build-crm/lib/posting/status.test.ts` | NEW |
| `clients/mammoth-build-crm/lib/posting/types.ts` | NEW |
| `clients/mammoth-build-crm/lib/posting/actions.ts` | NEW |
| `clients/mammoth-build-crm/app/posting/page.tsx` | NEW |
| `clients/mammoth-build-crm/prisma/schema.prisma` | Modified — posting enums/model + 2 back-relation fields (see below) |
| `clients/mammoth-build-crm/prisma/migrations/20260724193000_mammoth_posting_pipeline/migration.sql` | NEW |
| `docs/sprints/SESSION_0687.md` | NEW (this file) |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd && git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0687` · `auto/session-0687-mmb-posting-pipeline` — exit 0 |
| `bun install` (clients/mammoth-build-crm) | exit 0 (236 packages) |
| `bunx prisma validate` (after schema edits) | exit 0 — schema valid |
| `bunx prisma generate` | exit 0 — client generated to `.generated/prisma` (no DB connection required) |
| `bun run typecheck` (= `tsc --noEmit`) | exit 0 |
| `bun run test` (= `bun test --parallel=1`) | exit 0 — **63 pass / 0 fail, 221 expect() calls, 9 files** (7 pre-existing + 2 new: `generator.test.ts`, `status.test.ts`) |
| `git status --short` | only the owned posting subtree + `prisma/schema.prisma` + this session file |

No reachable local Postgres in this sandbox (`psql`/`pg_isready` not on `PATH`) — the migration was
**hand-authored, not applied or `migrate status`-verified against a live DB.** `prisma generate`
does not require a DB connection and succeeded; `prisma validate` confirmed the schema parses.
**Migration apply is a merge-owner step**: run `bunx prisma migrate deploy` (or `migrate status` to
confirm the file registers) against `mammoth_dev` / the Neon target before/at merge. Also note:
unlike `apps/web`, this package's `package.json` has **no `prebuild` hook** running
`prisma migrate deploy` — Vercel builds for `clients/mammoth-build-crm` will not auto-apply this
migration on deploy; the merge owner needs to apply it manually (or a future lane should add a
`prebuild` script to match the `apps/web` convention — flagged, not fixed, here to avoid scope
creep).

## Proposed ledger edits

> Proposed only — this lane does not write `docs/knowledge/wiki/**` (forbidden path).

- **Migration note (for the merge owner):** apply
  `clients/mammoth-build-crm/prisma/migrations/20260724193000_mammoth_posting_pipeline/` via
  `bunx prisma migrate deploy` against `mammoth_dev` (local) and the Neon target before/at merge —
  this lane could not reach a live Postgres to apply/verify it directly.
- **Shared-file touch, minimized:** `prisma/schema.prisma` gained two back-relation array fields on
  existing models (`Project.postingDrafts`, `TeamMember.approvedPostingDrafts`) — required for the
  new `PostingDraft` relations to compile; no existing fields changed. Flagging per the "must touch
  a shared file → minimize + record" rule even though the posting additions are explicitly in this
  lane's owned scope.
- **Duplicated `requireOwner()`:** `lib/posting/actions.ts` duplicates (does not import)
  `lib/actions.ts`'s `requireOwner` helper verbatim, because `lib/actions.ts` is a shared file a
  sibling lane may be touching concurrently and this lane's owned paths exclude it. Suggest a
  follow-up (once both posting + reviews lanes land) to extract ONE shared
  `lib/owner-guard.ts#requireOwner` and have both `lib/actions.ts` and `lib/posting/actions.ts`
  import it.
- **No `prebuild` migrate-deploy hook on `clients/mammoth-build-crm`:** unlike `apps/web`, this
  package's `package.json` has no `prebuild: "prisma migrate deploy"` step, so committed migrations
  don't auto-apply on Vercel deploy for this app. Worth a small infra follow-up to bring it in line
  with the `apps/web` convention (out of scope for this posting-only lane).
- **Nav wiring deferred:** `/posting` has no link from the `/app` shell (`app/app/layout.tsx`) —
  deliberately not touched (shared file, sibling-lane risk). A follow-up should add a "Posting"
  nav item once this + the sibling reviews lane (0685) both land, to avoid two lanes racing an edit
  to the same header.

## Open decisions / blockers

None — lane completed clean. No auto-post capability exists anywhere in the new code (verified by
construction: `approvePostingDraft` is the only status-advancing export, and
`planApprovePostingDraft`'s return type only ever produces `"approved"`).

## Residual for AM merge

- Apply the migration (see "Proposed ledger edits" above) against `mammoth_dev` / Neon before or
  at merge, then re-run `bun run test` + a manual smoke of `/posting` (generate → approve) against
  a live DB.
- Consider the `requireOwner()` de-dup and the `/app` nav-link follow-ups once the sibling reviews
  lane (0685, `app/reviews` / `lib/reviews`) also lands.
