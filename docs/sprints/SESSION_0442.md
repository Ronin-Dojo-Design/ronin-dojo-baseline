---
title: "SESSION 0442 — Slice B (free/Tool typed-ref display) + claim wiring sweep"
slug: session-0442
type: session--implement
status: closed
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0442
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0441.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0442 — Slice B (free/Tool typed-ref display) + claim wiring sweep

## Date

2026-06-23

## Operator

Brian + claude-session-0442 (Petey)

## Goal

Ship **Slice B**: render the `lead.meta` lineage refs (`currentRankId` / `schoolOrgId` /
`trainedUnderNodeId` / `representTreeId`) as resolved links on the **free/Tool** review surface —
the non-claim Join-the-Legacy intake creates a `Lead` (+ Pending `Tool`), NOT a
`PassportClaimRequest`, so Slice A's "Lineage selections" card never shows for it (WL-P2-16). Then
sweep the SESSION_0441 left-overs: Slice A actionability at finalize, an action-level persistence
unit test, and the broad `/admin → /app` consolidation. GATE-0 (the held-push migration check) is
resolved first.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0441.md`
- Carryover: 0441 built + committed (`8e56e825`, local `main`, **NOT pushed**) the creatable-combobox
  claim selectors + Slice A (claim-path typed-ref display). This session does GATE-0 (unblock the
  held push), then Slice B (the free/Tool half of the same display feature) + the left-over sweep.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (one unpushed commit `8e56e825`)
- Current HEAD at bow-in: `8e56e825`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma read-only (resolve `lead.meta` JSON refs to entities); no schema change for Slice B |
| Extension or replacement | Extension: mirrors Slice A's "Lineage selections" card + the `ProfileClaimRequest` typed-ref precedent |
| Why justified | The refs already persist to `lead.meta`; Slice B only surfaces them (no new persistence) |
| Risk if bypassed | Registered free-path picks stay dark data — the steward never sees the verified link |

### fallow baseline (operator standing rule — captured BEFORE building)

- Health **maintainability 89.6 (good)** · 636 above threshold / 9766 analyzed.
- Duplication **16.7%** (32,531 lines across 551 files) — matches 0441 bow-out.
- Slice B is display-only (one resolver + one card) → expect flat complexity; re-measure at bow-out.

### Drift logged

- D-032 (admin/app dup trees) is this session's TASK_04 — continues the 0441 partial resolution.

### Grill outcome (GATE-0 — resolved during bow-in)

- **The held push is SAFE; nothing to drop.** A push of `8e56e825` adds only migration `20260624`
  (additive, nullable, `ON DELETE SET NULL` on the already-present `PassportClaimRequest`).
- The bow-out's worry — that the deferred `20260622` ("DO NOT APPLY in cloud sessions") would fire
  on deploy — conflated **prodsnap** state with **prod** state. Migrations `20260622` (PR #160,
  June 22) and `20260623` (ADR 0036, June 23) are **already applied to prod**: the latest prod
  deploy (3h before bow-in) ran `prebuild: prisma migrate deploy` against Neon and logged
  `58 migrations found … No pending migrations to apply … Exited with code 0`. (Cross-checks FS-0186:
  the prebuild hook fires under the current **bun** deploy — verified from the live build log, not
  assumed.)
- prodsnap was realigned to prod: `20260622`'s column physically existed but its `_prisma_migrations`
  row was missing → `migrate resolve --applied 20260622…` → prodsnap now "Database schema is up to
  date!" (all 59 migrations recorded).
- **Push remains HELD on operator go** (explicit-push-authorization standing rule) — but unblocked.

## Petey plan

### Goal

Surface the free/Tool lineage refs (Slice B), then pay down the three SESSION_0441 left-overs.

### Tasks

#### SESSION_0442_TASK_00 — GATE-0: deferred-migration safety check

- **Agent:** Petey
- **What:** Verify whether `20260622` is safe/vestigial; decide apply-or-drop; unblock the held push.
- **Done means:** ✅ Prod confirmed at `No pending migrations` (22+23 applied); push adds only safe
  additive `20260624`; prodsnap realigned. Push held on operator go.
- **Depends on:** nothing.

#### SESSION_0442_TASK_01 — Slice B: free/Tool typed-ref display

- **Agent:** Cody
- **What:** Render `lead.meta` refs as resolved links on `/app/leads/[id]` (the surface that holds
  the refs). Resolve ids server-side; registered = link, custom = text. Mirror Slice A's card.
- **Steps:**
  1. New resolver `server/admin/leads/lineage-selections.ts` — pure `parseLeadLineageMeta(meta)` +
     async `resolveLeadLineageSelections(meta)` (Rank / Organization / LineageNode / LineageTree).
  2. New presentational card `app/app/leads/[id]/_components/lead-lineage-selections.tsx`.
  3. Wire into `app/app/leads/[id]/page.tsx`.
  4. Unit-test the pure parser; browser-verify the card on a real lead.
- **Done means:** lead detail page shows a "Lineage selections" card with registered links + custom
  text; gates green; browser-verified.
- **Depends on:** nothing (data already persists).

#### SESSION_0442_TASK_02 — Slice A actionability at finalize

- **Agent:** Cody
- **What:** Wire `claimedSchool` / `trainedUnderNode` / `representTree` into
  `server/admin/lineage/claim-finalize.ts` so approval creates the real link (Affiliation / lineage
  edge), like `claimedRankId` → RankAward.
- **Done means:** approving a claim with these refs creates the corresponding records.
- **Depends on:** nothing (independent of Slice B).

#### SESSION_0442_TASK_03 — action-level persistence unit test

- **Agent:** Doug
- **What:** Action-level unit test for `createJoinLegacyInterest` ref-or-text persistence
  (registered → ref+text; custom → text only, null ref).
- **Done means:** test passes; covers the `"use server"` + db seam the schema test couldn't.
- **Depends on:** nothing.

#### SESSION_0442_TASK_04 — `/admin → /app` route consolidation

- **Agent:** Cody
- **What:** Consolidate ~7 admin/app dup route pairs (tool-form, pricing-plan-form,
  tool-publish-actions, lineage `[treeId]`, merch orders, subscription-form, category-form) + delete
  the thin `/admin` claim wrapper. Scope = `app/admin/` ROUTES only, NOT `server/admin/*` modules.
- **Done means:** D-032 closed (or further reduced); `/admin` claim wrapper gone.
- **Depends on:** likely its own commit/migration; sequence LAST.

### Parallelism

TASK_01–03 are disjoint file sets (leads vs claim-finalize vs a test) → could parallelize, but run
inline sequentially (single operator, coherent changes). TASK_04 is large → its own pass, last.

### Open decisions

- Whether to ALSO surface refs on `/app/tools` (Pending Tool review). The Tool carries no FK to the
  Lead (refs live only on `lead.meta`), so this needs a lead-by-email lookup. **Recommend: lead
  detail only for Slice B** (clean SoT); revisit /app/tools if the steward needs it. Operator call.

### Risks

- None at plan-lock. Slice B is read-only resolution of existing data.

### Scope guard

- No schema change for Slice B. No `server/admin/*` module moves in TASK_04 (routes only).
- Do not run the operator-only items (Brian `--send`, test-claim email) — agent can't (Sensitive
  Resend key + prod DB absent locally).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0442_TASK_00 | landed | GATE-0: prod has 22+23; push adds only safe 24; prodsnap realigned; push held on go |
| SESSION_0442_TASK_01 | landed | Slice B: resolver + card on `/app/leads/[id]`; 7 parser tests; gates green; browser-verified (registered links + custom text) |
| SESSION_0442_TASK_02 | landed | Finalize actionability: school→Affiliation + trained-under→INSTRUCTOR_STUDENT (VERIFIED) + represent→TreeMember; idempotent; threaded unified + token-accept callers; verified via rolled-back finalize on prodsnap |
| SESSION_0442_TASK_03 | landed | +2 action-level tests in public-actions.safe-action.test.ts (registered=ref+text, custom=text+null); 9 pass |
| SESSION_0442_TASK_04 | in progress | `/admin → /app` route consolidation |

## What landed

- **GATE-0 (TASK_00):** proved the held push is safe. Prod's last deploy (3h pre-bow-in) ran
  `prisma migrate deploy` → `58 migrations found … No pending migrations to apply` → migrations
  `20260622` + `20260623` are already on prod. Pushing `8e56e825` applies only the additive/nullable
  `20260624`. Nothing to drop. Realigned the local prodsnap ledger (`migrate resolve --applied
  20260622` — the column existed but its `_prisma_migrations` row was missing) → "schema up to date".
- **Slice B (TASK_01):** the free/Tool path's `lead.meta` lineage refs now render as resolved links on
  `/app/leads/[id]` — registered picks = link + "registered" badge, custom entries = plain text. New
  server resolver + presentational card mirroring Slice A's "Lineage selections". Closes WL-P2-16.
- **TASK_02 (Slice A actionability):** on claim approval, `finalizePassportClaim` now materializes the
  three asserted refs — `claimedSchoolId` → `TRAINS_AT` Affiliation, `trainedUnderNodeId` →
  `INSTRUCTOR_STUDENT` edge (VERIFIED, operator decision), `representTreeId` → LineageTreeMember — all
  idempotent, mirroring `claimedRankId` → RankAward. Threaded through the unified review + token-accept
  callers (legacy `LineageClaimRequest` path has no such columns → no-op).
- **TASK_03:** +2 action-level tests pinning the creatable "store BOTH" contract at the action+db seam
  (registered = ref+text; custom = text + null ref).
- **TASK_04 (DEFERRED):** discovery only — see Decisions + D-032. Not built (operator chose to defer).

## Decisions resolved

- **GATE-0:** `20260622` is already applied to prod (the `DO NOT APPLY in cloud sessions` comment
  cannot gate the deploy pipeline; #160's June-22 deploy applied it). No apply/drop action needed; the
  push only ships `20260624`.
- **Asserted edges land VERIFIED on approve** (operator) — mirror `claimedRankId` → RankAward exactly,
  not PENDING.
- **Slice B surface = `/app/leads/[id]` only** — the Pending Tool carries no FK to the Lead; the refs
  live only on `lead.meta`, so `/app/tools` is a deliberate non-target.
- **TASK_04 deferred to its own PR** (operator). It is a component-topology migration, not a delete
  (see D-032).
- **Push held on operator go** (explicit-push-authorization standing rule) — unblocked.

## Files touched

| File | Change |
| --- | --- |
| `server/admin/leads/lineage-selections.ts` | NEW — `parseLeadLineageMeta` (pure) + `resolveLeadLineageSelections` (resolve `lead.meta` refs → entities, registered-or-text) |
| `server/admin/leads/lineage-selections.test.ts` | NEW — 7 parser/`hasLeadLineageSelections` unit tests |
| `app/app/leads/[id]/_components/lead-lineage-selections.tsx` | NEW — "Lineage selections" card (registered = link + badge, custom = text) |
| `app/app/leads/[id]/page.tsx` | resolve refs server-side + render the card when present |
| `server/admin/lineage/claim-finalize.ts` | + 3 idempotent materializers (Affiliation / INSTRUCTOR_STUDENT / TreeMember); input + result fields |
| `server/admin/claims/passport-claim-review-actions.ts` | unified review fetches + passes the 3 refs to finalize |
| `server/web/lineage/claim-node-for-user.ts` | token-accept carries the reusable claim's refs into finalize |
| `server/web/lead/public-actions.safe-action.test.ts` | + 2 action-level ref-or-text persistence tests |
| `docs/sprints/SESSION_0442.md` | this session file |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P2-16 → ✅ (Slice B) |
| `docs/knowledge/wiki/drift-register.md` | D-032 updated with the redirect-shadowed-routes / live-_components topology finding |
| `docs/knowledge/wiki/index.md` | SESSION_0442 row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` (full, with typegen) | 0 errors |
| `oxfmt --check` (8 touched code files) | clean |
| `oxlint` (touched files) | no errors |
| `bun test` lineage-selections + public-actions.safe-action | 16 pass / 0 fail (87 expects) |
| Slice B browser (dev-login → `/app/leads/[id]`) | card renders; registered = links + badges, custom = text; console clean (screenshot sent) |
| TASK_02 finalize (rolled-back tx on prodsnap) | Affiliation + INSTRUCTOR_STUDENT(VERIFIED) created, TreeMember idempotent-existing; 2nd run identical ids; rolled back |
| `prisma migrate status` (prodsnap) | "Database schema is up to date!" (59 migrations) |
| prod deploy log (3h pre-bow-in) | `No pending migrations to apply` — 22+23 already on prod |
| fallow health / dupes | maintainability 89.6 → 89.6; dup 16.7% → 16.7% (flat) |
| Full `bun test` | NOT run (real-Resend landmine — ran touched-area suites only) |

## Open decisions / blockers

- **Push HELD on operator go (unblocked).** Two unpushed commits will exist on local `main`:
  `8e56e825` (combobox + Slice A) + this session's close commit (Slice B + TASK_02 + TASK_03 + docs).
  A push deploys and applies only `20260624` (safe).
- **TASK_04 deferred** to its own PR — the `/admin → /app` component-topology migration (D-032).
- **Operator-only (agent cannot run):** Brian Truelson `--send` (unblocked, held on go); the test claim
  (`ronindojodesign@gmail.com → cullet-eric`); re-send the test-claim email (`setup-test-claimant.ts
  --send` — needs `RESEND_API_KEY` + prod Neon `DATABASE_URL`, both absent locally); clean disposable
  test users; **prod Neon pw rotation**.

## Next session

### Goal

TASK_04 — the `/admin → /app` component-topology migration (D-032): move the shared `_components` out
of the redirect-shadowed `/admin` tree into `/app`, repoint the ~20 `/app` importers, then delete the
dead `app/admin/*` page/route files (keep `app/admin/task-board` — live, no redirect). Its own PR.

### First task

`SESSION_0443_TASK_01` — enumerate every `app/admin/*/_components/*` imported by a live `/app` page
(grep `~/app/admin/` across `app/app`), pick the canonical copy per dup pair (tool-form,
pricing-plan-form, tool-publish-actions, lineage `[treeId]`, merch orders, subscription-form,
category-form), and stage the move + repoint as small per-pair commits. Verify each redirect still
lands (`curl /admin/<x>` → 308 → `/app/<x>`) and `next build` stays green before deleting page files.

## Review log

### SESSION_0442_REVIEW_01 — GATE-0 + Slice B + claim-finalize actionability + action tests

- **Reviewed tasks:** TASK_00 (GATE-0), TASK_01 (Slice B), TASK_02 (finalize actionability), TASK_03
  (action tests). TASK_04 deferred (discovery only).
- **Dirstarter docs check:** not applicable — Slice B/TASK_02 extend the existing typed-ref claim
  pattern (ADR 0035/0036); no L1 baseline behavior changed.
- **Verdict:** Clean. GATE-0 was verified against the live prod deploy log (not assumed — cross-checks
  FS-0186). Slice B browser-verified on the real surface; TASK_02 verified via a rolled-back real
  finalize (no prodsnap mutation) and proven idempotent. All local gates green; fallow flat.
- **Score:** 9/10 (−1: full `bun test` not run — Resend landmine; touched-area suites only).
- **Follow-up:** TASK_04 (own PR); operator-only items; push held on go.

### Findings (severity ≥ medium)

- **WL-P2-16 (RESOLVED):** the free/Tool `lead.meta` refs are now surfaced (Slice B). Flipped to ✅ in
  [`wiring-ledger`](../knowledge/wiki/wiring-ledger.md).
- **D-032 (updated):** `/admin` route tree is redirect-shadowed dead code, but `app/admin/*/_components`
  are LIVE (imported by ~20 `/app` pages). Consolidation = topology migration, not a delete. Routed to
  [`drift-register`](../knowledge/wiki/drift-register.md) D-032.

## Hostile close review

- **Giddy:** pass — GATE-0 grounded in the live deploy log + reconciled migration counts; no assumed
  state. Task ledger matches what landed.
- **Doug:** pass — TASK_02 verified by a real (rolled-back) finalize with idempotency re-run; Slice B
  browser-verified + DB-confirmed; tests green. Honesty note recorded (full `bun test` not run).
- **Desi:** pass — Slice B card reuses the exact Slice A "Lineage selections" pattern (registered link +
  badge, custom text); consistent with the claim review surface.
- **Kaizen aggregate:** 9/10 — solid, well-verified slice; only gap is the unavoidable full-suite skip.

## ADR / ubiquitous-language check

- ADR update **not required.** Slice B + TASK_02 extend the existing typed-ref claim pattern (ADR 0035
  `claimedRankId` / ADR 0036 unified `PassportClaimRequest`) to school/instructor/tree materialization —
  a consistent extension, not a new decision. The "edges land VERIFIED on approve" choice is an
  implementation decision recorded here, not an ADR.
- Ubiquitous language update **not required** — reused terms (claim, ref, Affiliation, INSTRUCTOR_STUDENT
  edge, tree member). No new domain term.
- If TASK_04 (the `/admin` retirement) is formalized, it warrants its own ADR.

## Reflections

- **Read the deploy log, don't trust the comment.** The whole GATE-0 scare rested on a migration's
  `DO NOT APPLY in cloud sessions` comment — but a code comment can't gate `migrate deploy`. The prod
  build log (`No pending migrations`) settled it in one read, and FS-0186 is the standing reminder that
  the prebuild hook's behavior must be *observed*, not assumed. The real artifact was prodsnap drift
  (column present, ledger row missing), fixed with `migrate resolve --applied`.
- **Verify a moat-touching change without touching the moat.** TASK_02 mutates the verified lineage
  graph; running the real `finalizePassportClaim` inside a deliberately rolled-back transaction (with a
  self-claim setup so no passport got deleted) proved the behavior + idempotency against prodsnap with
  zero persistence. Worth the setup over a mock.
- **The scoped size was wrong, and saying so was the value.** TASK_04 read as "~7 dup pairs" but is a
  ~20-importer component-topology migration (routes dead, components live). Surfacing that and deferring
  beat grinding a fragile 50-file delete at session end.
- **One question per genuine fork, not per step.** The operator set "checkpoint only on genuine forks";
  the edge-verification-status fork and the TASK_04-scope fork each got one crisp decision, and the rest
  flowed without interruption.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | only `SESSION_0442.md` is a new doc; ledgers (wiring/drift/index) frontmatter `updated` bumped; no other wiki/arch pages touched |
| Backlinks/index sweep | wiki index session row added; `pairs_with` SESSION_0441 ↔ 0442; no other new cross-links |
| Wiki lint | `bun run wiki:lint` → result recorded in chat (pre-existing warnings only; none introduced) |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | REVIEW_01 + Giddy/Doug/Desi above |
| Review & Recommend | yes — TASK_04 staged as next-session goal + first task |
| Memory sweep | corrected the stale prodsnap-`20260622` warning (now applied to prod) + added the `/admin` topology finding to memory |
| Next session unblock check | TASK_04 is self-contained discovery → unblocked; push held on operator go |
| Git hygiene | branch `main`; two commits unpushed (`8e56e825` + `d21966cc`); **push HELD** on operator go (amended to flip status:closed; no second close-evidence commit) |
| Graphify update | run before the close commit — Nodes 91, Edges 779, Communities 2006 |
