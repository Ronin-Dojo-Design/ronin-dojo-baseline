---
title: "SESSION 0441 — Creatable-combobox claim selectors + claim-path typed-ref display (Slice A)"
slug: session-0441
type: session--implement
status: closed
created: 2026-06-24
updated: 2026-06-24
last_agent: claude-session-0441
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0440.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0441 — Creatable-combobox claim selectors + claim-path typed-ref display (Slice A)

## Date

2026-06-24

## Operator

Brian + claude-session-0441 (Petey)

## Goal

Replace the Join-the-Legacy wizard's free-text `currentRank` / `schoolName` / `trainedUnder` /
`represent` inputs with **creatable comboboxes** — pick a *registered* option (persist its id) or
type a *custom* value (persist text). Rank feeds `claimedRankId` (ADR 0035). Then (added mid-session,
operator-directed) **Slice A**: make the steward review surface actually *display* the registered
refs as resolved links — the "is it wired up correctly?" gap.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0440.md`
- Carryover: 0440 shipped Full A (claim-CTA state machine) + fixed two live prod claim blockers
  (directory dead-end, magic-link `INVALID_CALLBACK_URL`). This session = the combobox feature from
  0440's `Next session` block. Brian's `--send` stays HELD (now unblocked — flow proven this session).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (clean at bow-in; two fallow-audit temp worktrees
  are tooling caches, left in place)
- Current HEAD at bow-in: `1718c849`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (3 additive nullable FK columns on `PassportClaimRequest`) |
| Extension or replacement | Extension: mirrors the existing `claimedRankId` typed-ref pattern; new UI primitive sits beside `ComboboxSelector` |
| Why justified | Claims already link entities via typed FKs (`organizationId`/`nodeId`/`claimedRankId`); this extends that to school/instructor/tree |
| Risk if bypassed | Registered picks would be dark data (no steward link); free-text loses the verifiable reference |

### fallow baseline (operator standing rule — captured BEFORE building)

- Health **62 C** · duplication **16.9%** (691 clone groups) · dead files 7.0% · dead exports 9.7%.
- Bow-out delta: **62 C** (flat) · duplication **16.7%** (↓ — the claim-page consolidation removed a
  near-duplicate). Complexity not worsened.

## What landed

### The combobox feature (planned)

- **New primitive `components/common/creatable-combobox.tsx`** (+ `.test.tsx`): dual value model
  `{ id: string | null, label: string }` (the settled "store BOTH" shape). Own filtering
  (`shouldFilter={false}`) so the "Use «…»" create row is never filtered away; pure decision helpers
  (`selectRegisteredOption`/`commitCustomText`/`shouldOfferCreate`/`filterOptions`/
  `optionMatchesText`/`creatableTriggerLabel`) extracted + unit-tested (the cmdk popover is portaled
  out of SSR — mirrors the `dataSelectRowContent` idiom). Optional rich row `content` for belt
  swatches. `ComboboxSelector` untouched — this is its creatable sibling (decision rule:
  long/searchable → ComboboxSelector family, not DataSelect).
- **4 wizard fields → creatable comboboxes** via a `CreatableField` bridge that writes BOTH form
  fields (text + ref id) at once: `currentRank`→`currentRankId` (31 ranks, belt swatch from
  `colorHex`), `schoolName`→`schoolOrgId` (14 BBL orgs), `trainedUnder`→`trainedUnderNodeId` (84 BBL
  lineage people), `represent`→`representTreeId` (3 BBL trees, trees-only per operator).
- **Server option loaders**: one `getJoinWizardOptions()` aggregator (`server/web/lineage/
  join-options.ts`), threaded `page.tsx`/`bbl-join-landing.tsx → landing → form → wizard → step` as
  **type-only** client imports (Prisma stays server-side; `server-only` backstop). Instructor list
  capped at 300 (bounded roster → client-side filter).
- **Persistence**: refs land in `lead.meta` alongside the text; `currentRankId` flows to the claim as
  `claimedRankId` (ADR 0035). Registered → ref + text; custom → text only.

### Slice A — claim-path typed-ref display (added mid-session, operator-directed)

- **Decision (operator asked "what's best long-term / what does Dirstarter do for tool claim?"):** the
  repo's claim model links entities via **typed nullable FK columns** (`ProfileClaimRequest.
  organizationId`/`directoryProfileId`; `PassportClaimRequest.nodeId`/`treeId`/`claimedRankId`). So
  followed that exactly — NOT evidence-text.
- **Migration `20260624000000_add_claim_lineage_refs`**: 3 additive nullable FK columns on
  `PassportClaimRequest` — `claimedSchoolId`(Org) / `trainedUnderNodeId`(Node) / `representTreeId`
  (Tree), `ON DELETE SET NULL`. Applied to prodsnap + `migrate resolve --applied`; file ready for the
  prod deploy pipeline.
- Threaded through `submitPassportClaim` (input + create) and `createJoinLegacyInterest`.
- Claim query joins the 3 refs; a **"Lineage selections"** card renders resolved links + a
  "registered" badge (custom entries stay text in the claimant note).
- **`/admin/leads` → `/app/leads` revalidate fixed** (both lead actions pointed at a non-existent
  route).
- **Consolidation (driven by operator's "/admin is going away — only /app remains"):** signed in as
  Brian, `/admin/lineage/claims/[id]` redirects to `/app/lineage/claims/[id]` — a near-duplicate page
  that had DRIFTED (missing even the Claimed Rank card). Extracted ONE shared `ClaimReviewDetail`
  component, **relocated it + `claim-status-actions` under `/app`** (the survivor), so `/app` is
  self-contained and the `/admin` page is a thin wrapper that deletes cleanly at the `/admin` purge.
  Backports the Claimed Rank card to `/app`.

### Verified end-to-end (browser, dev DB `ronindojo_prodsnap`)

- Combobox: registered pick (Black Belt → belt swatches, trigger updates, Clear button) AND custom
  ("Use «Atlantis Jiu-Jitsu Reykjavik»") → submit → `lead.meta` proved dual shape (`currentRankId`
  resolves to Black Belt/#000000; `schoolName` custom text with null `schoolOrgId`).
- Slice A: built a real claim (Black Belt + Combat Base + Alexander Martinez + Rigan Machado Lineage)
  → the `/app` review page shows the Claimed Rank card AND the Lineage selections card with all refs
  resolved. Test claim/lead/tool cleaned up.

## Decisions resolved

- **Long-term claim-ref model = typed FK columns** (mirrors `claimedRankId` / the Dirstarter
  `ProfileClaimRequest` pattern), not evidence-text. Operator-confirmed via "what does Dirstarter do."
- `represent` → trees-only creatable (`representTreeId`); instructor list → full list, client-filtered
  (84 < 300 cap), no async server-search.
- New creatable primitive = its own file (`creatable-combobox.tsx`), not an overload of
  `ComboboxSelector` (different value contract).
- `/admin` is being retired; **only `/app` remains** → shared claim component lives under `/app`.
- Brian Truelson `--send`: flow is now proven → **unblocked**, awaiting operator go (still HELD).

## Files touched

| File | Change |
| --- | --- |
| `components/common/creatable-combobox.tsx` | NEW — creatable combobox primitive (dual `{id,label}`) + pure helpers |
| `components/common/creatable-combobox.test.tsx` | NEW — 15 tests (pick vs custom, offer-create, SSR trigger) |
| `server/web/lineage/join-options.ts` | NEW — `getJoinWizardOptions()` aggregator (ranks/schools/instructors/trees, BBL-scoped) |
| `app/(web)/lineage/join/join-legacy-wizard/schema.ts` | + `currentRankId`/`schoolOrgId`/`trainedUnderNodeId`/`representTreeId` |
| `app/(web)/lineage/join/join-legacy-wizard/schema.test.ts` | + ref-id + custom-entry validation tests |
| `app/(web)/lineage/join/join-legacy-wizard/use-join-wizard.ts` | + new field defaults |
| `app/(web)/lineage/join/join-legacy-wizard/lineage-step.tsx` | 4 TextAreas → `CreatableField` comboboxes (belt swatches via `Rank.colorHex`) |
| `app/(web)/lineage/join/join-legacy-wizard/index.tsx` | thread `joinOptions` to LineageStep |
| `app/(web)/lineage/join/join-legacy-form.tsx` | + `joinOptions` prop |
| `app/(web)/lineage/join/join-legacy-landing.tsx` | + `joinOptions` prop |
| `app/(web)/lineage/join/page.tsx` | server-load `getJoinWizardOptions()` + thread |
| `app/(web)/(home)/bbl-join-landing.tsx` | server-load `getJoinWizardOptions()` (second consumer) |
| `server/web/lead/public-actions.ts` | persist refs to `lead.meta`; pass to claim; `/admin/leads`→`/app/leads` |
| `prisma/schema.prisma` | + 3 FK columns/relations on `PassportClaimRequest` (named node/tree relations) |
| `prisma/migrations/20260624000000_add_claim_lineage_refs/migration.sql` | NEW — additive FK columns |
| `server/web/claims/submit-passport-claim.ts` | + `claimedSchoolId`/`trainedUnderNodeId`/`representTreeId` (input + create) |
| `server/admin/lineage/claim-queries.ts` | `findClaimById` joins the 3 new refs |
| `app/app/lineage/claims/[id]/_components/claim-review-detail.tsx` | NEW — shared review body (relocated under /app) + Lineage selections card |
| `app/app/lineage/claims/[id]/_components/claim-status-actions.tsx` | MOVED from `/admin/.../_components` (only consumer is the shared component) |
| `app/app/lineage/claims/[id]/page.tsx` | thin wrapper → shared component (sibling import) |
| `app/admin/lineage/claims/[id]/page.tsx` | thin wrapper → shared component (imports from /app) |
| `docs/sprints/SESSION_0441.md` | this session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` | 0 errors |
| `oxfmt --check .` (CI gate) | clean (1755 files) |
| `oxlint` (touched files) | no errors |
| `bun test creatable-combobox.test.tsx` | 15 pass / 0 fail |
| `bun test schema.test.ts` (wizard) | 5 pass / 0 fail |
| `prisma validate` | valid |
| Migration applied to prodsnap | 3 columns present; `migrate resolve --applied` recorded |
| Combobox browser flow | registered pick + custom create both work; `lead.meta` dual shape proven via DB read |
| Claim-path browser flow | claim row got all 4 typed refs; `/app` review page renders Claimed Rank + Lineage selections cards (screenshots sent) |
| Option loaders (live) | 31 ranks / 14 schools / 84 instructors / 3 trees from prodsnap |
| `bun run wiki:lint` | 0 errors, 15 warnings (all pre-existing; none introduced) |
| fallow health | 62 C → 62 C; duplication 16.9% → 16.7% (consolidation) |
| Full `bun test` | NOT run (real-Resend landmine — ran touched-area suites only) |

## Open decisions / blockers

- **Push HELD (operator decided SESSION_0441) — handle next session.** The close commit (latest `git log` on local) is on
  `main` but NOT pushed. A push triggers a Vercel prod deploy whose `prisma migrate deploy` applies
  ALL pending migrations — firing BOTH `20260624…_add_claim_lineage_refs` (mine, additive/safe) AND
  the **still-pending `20260622…_add_claimed_rank_to_lineage_claim_request`**, which is explicitly
  marked *"DO NOT APPLY in cloud sessions — defer to local review/apply pass."* (`20260622` adds
  `claimedRankId` to the LEGACY `LineageClaimRequest` table — likely vestigial post-ADR-0036 P5.)
  **Next session's gate-0:** verify whether `20260622` is safe/vestigial, decide apply-or-drop, THEN
  push the close commit (`git log` top) (ships the already-done combobox + Slice A work).
- **Brian's `--send`** unblocked (flow proven) but still HELD on operator go. Agent can't run it —
  `RESEND_API_KEY` is a Vercel Sensitive var (pulls empty) + needs prod Neon `DATABASE_URL`.
- Dev server (`npx next dev --turbo`) left running on :3000 — kill at will.

## Next session

### Goal

**Slice B — the tool/free-path display.** The combobox refs persist to `lead.meta` for the
free/guest/non-claim intake (Lead + Pending Tool), but no review surface renders them. Surface the
resolved refs on the Pending Tool review (`/app/tools`) and/or the lead detail (`/app/leads/[id]`),
mirroring Slice A's Lineage selections card. Then sweep the remaining left-over work below.

### First task

`SESSION_0442_TASK_01` — Slice B: render the `lead.meta` refs (`currentRankId`/`schoolOrgId`/
`trainedUnderNodeId`/`representTreeId`) as resolved links on the free/Tool review surface
(`/app/tools` + `/app/leads/[id]`). Resolve names server-side; registered = link, custom = text.

### Additional left-over work (capture, sequence after Slice B)

1. **Slice A actionability (the deferred "act on approve" half):** wire `claimedSchool` /
   `trainedUnderNode` / `representTree` into `server/admin/lineage/claim-finalize.ts` so approval
   creates the real link (Affiliation / lineage edge), the same way approval mints the RankAward from
   `claimedRankId`.
2. **Action-level unit test** for `createJoinLegacyInterest` ref-or-text persistence (the original
   task asked for it; this session covered schema-level + browser-verified the action, but no
   action-unit-test — it's a `"use server"` + db seam).
3. **Broad `/admin → /app` consolidation** (the operator's "only /app remains"): fallow flags ~7
   admin/app dup pairs (`tool-form`, `pricing-plan-form`, `tool-publish-actions`, lineage `[treeId]`,
   merch orders, `subscription-form`, `category-form`) + delete the thin `/admin` claim wrapper. **Open
   scope question:** "/admin" = the `app/admin/` route tree only, or also `server/admin/*` modules?
   (This session kept `server/admin/*` imports — those are server modules, not routes.)
4. **Open from 0440 (operator-driven):** run the test claim (`ronindojodesign@gmail.com →
   cullet-eric`); give go on Brian's `--send` (now unblocked); re-send the test-claim email
   (`setup-test-claimant.ts --send` — operator runs, agent can't: Sensitive Resend key + prod DB);
   clean disposable test users; **prod Neon pw rotation (EOD)**.

### Bow-in prompt (paste-ready)

> Act as Petey. SESSION_0441 built + committed (latest on local `main`, **NOT pushed**) the creatable-combobox
> claim selectors (the 4 Join-the-Legacy lineage fields → pick-registered-or-type-custom, storing a
> ref id + text) + **Slice A** (claim-path typed-ref display: migration `20260624000000` adds
> `claimedSchoolId`/`trainedUnderNodeId`/`representTreeId` to `PassportClaimRequest`; a shared
> `ClaimReviewDetail` relocated under `/app` renders a "Lineage selections" card; `/admin/leads`→
> `/app/leads` fix). All gate-green (tsc 0, oxfmt/oxlint clean, 20 unit tests, fallow 62 C / dup ↓)
> + browser-verified both flows.
>
> **GATE-0 (do FIRST — unblocks the held push):** a push to `main` deploys and runs
> `prisma migrate deploy`, which applies ALL pending migrations — including the deferred
> `20260622000000_add_claimed_rank_to_lineage_claim_request` (its SQL says *"DO NOT APPLY in cloud
> sessions"*; it adds `claimedRankId` to the LEGACY `LineageClaimRequest` table, likely vestigial
> post-ADR-0036 P5). Verify whether `20260622` is safe/vestigial → decide apply-or-drop → then push
> the close commit to ship the done work. Check `prisma migrate status` first.
>
> **FIRST BUILD TASK = Slice B:** render the `lead.meta` refs
> (`currentRankId`/`schoolOrgId`/`trainedUnderNodeId`/`representTreeId`) as resolved links on the
> **free/Tool** review surface (the non-claim intake creates a Lead + Pending Tool, NOT a
> `PassportClaimRequest`, so Slice A's card never shows them). Surfaces: `/app/tools` (Pending Tool
> review) + `/app/leads/[id]` (`server/admin/leads/queries.ts` `findLeadById` already selects `meta`;
> the page renders none of it). Resolve names server-side; registered = link, custom = text. Mirror
> the `app/app/lineage/claims/[id]/_components/claim-review-detail.tsx` "Lineage selections" card.
>
> **Then sweep the left-overs:** (1) Slice A actionability at finalize — wire
> `claimedSchool`/`trainedUnderNode`/`representTree` into `server/admin/lineage/claim-finalize.ts`
> (create Affiliation/lineage edge on approve, like `claimedRankId`→RankAward); (2) action-level unit
> test for `createJoinLegacyInterest` ref-or-text persistence; (3) the broad `/admin → /app`
> consolidation (~7 dup pairs: tool-form, pricing-plan-form, tool-publish-actions, lineage `[treeId]`,
> merch orders, subscription-form, category-form) + delete the thin `/admin` claim wrapper — its own
> migration; scope = `app/admin/` ROUTES only, NOT `server/admin/*` modules.
>
> **Operator-driven (still pending, agent can't do):** Brian Truelson `--send` is **unblocked** (flow
> proven) but HELD on go (`scripts/send-bbl-truelson-thankyou.ts --send` then `--grant`); run the test
> claim (`ronindojodesign@gmail.com → cullet-eric`); re-send the test-claim email
> (`setup-test-claimant.ts --send` — needs `RESEND_API_KEY` + prod Neon `DATABASE_URL`, both absent
> locally → operator pastes or runs); clean disposable test users; **prod Neon pw rotation**. Dev
> server may still be on :3000.
>
> Dev DB = `ronindojo_prodsnap`. Run `fallow health`/`dupes` baseline BEFORE building (operator
> standing rule). `/lineage/join` = the combobox; `/app/lineage/claims/[id]` = the claim review
> (`/admin/*` redirects there).

## Task log

| ID | Status | Notes |
| --- | --- | --- |
| SESSION_0441_TASK_01 | ✅ done | fallow baseline + creatable-combobox primitive + 15 unit tests |
| SESSION_0441_TASK_02 | ✅ done | schema + defaults (4 `*Id` ref fields) |
| SESSION_0441_TASK_03 | ✅ done | `getJoinWizardOptions()` loader + thread to wizard (type-only client imports) |
| SESSION_0441_TASK_04 | ✅ done | 4 lineage-step fields → creatable comboboxes (belt swatches) |
| SESSION_0441_TASK_05 | ✅ done | persist refs in `createJoinLegacyInterest` + `claimedRankId` |
| SESSION_0441_TASK_06 | ✅ done | Slice A: migration (3 FK columns) applied to prodsnap |
| SESSION_0441_TASK_07 | ✅ done | Slice A: thread refs through submit + action; `/admin/leads`→`/app/leads` |
| SESSION_0441_TASK_08 | ✅ done | Slice A: claim query joins + shared `ClaimReviewDetail` (relocated to /app) + browser-verified |

## Review log

### SESSION_0441_REVIEW_01 — Combobox selectors + Slice A claim-ref display

- Covers TASK_01–08. All local gates green (tsc 0, oxfmt clean, oxlint clean, 20 unit tests, wiki-lint
  0-error). Browser-verified BOTH the combobox dual-shape (DB-confirmed `lead.meta`) and the Slice A
  claim review cards (real claim with 4 resolved refs). fallow flat (62 C) with duplication ↓ (the
  claim-page consolidation). Migration additive/nullable.
- **Honesty notes:** full `bun test` NOT run (Resend landmine — touched-area suites only). Slice A
  verified on the `/app` surface the operator actually lands on (the `/admin` variant redirects).
  Migration applied to prodsnap only; prod applies on deploy (held — see below).
- **Open follow-ups:** Slice B (free/Tool display) = next first task; Slice A actionability-at-finalize
  deferred; action-level persistence unit test deferred; `/admin→/app` consolidation is its own
  migration; Brian send unblocked-but-held; **push held on the deferred-`20260622`-migration decision.**

### Findings (severity ≥ medium)

- **WL-P2-16 (wiring):** `lead.meta` refs for the free/Tool path are persisted but unsurfaced (no
  review screen renders them) — the Slice B gap. Routed to [`wiring-ledger`](../knowledge/wiki/wiring-ledger.md)
  WL-P2-16; next-session First build task.
- **D-032 (drift):** `/admin` + `/app` admin route trees are duplicated and drifting (the `/app`
  claim review lacked the Claimed Rank card). Routed to
  [`drift-register`](../knowledge/wiki/drift-register.md) D-032 — claim review consolidated this
  session (relocated under `/app`); ~7 dup pairs + full `/admin` removal open.
- **Pre-existing:** `createPublicLead` + `createJoinLegacyInterest` revalidated `/admin/leads` (dead
  route) — fixed this session to `/app/leads`.

## ADR / ubiquitous-language check

- No new ADR. Slice A extends the **existing** typed-ref claim pattern (ADR 0035 `claimedRankId` /
  ADR 0036 unified `PassportClaimRequest`) to school/instructor/tree — a consistent extension, not a
  new decision. The "store BOTH (ref + text)" rule and "typed FK columns over evidence-text" were
  operator-confirmed against the Dirstarter `ProfileClaimRequest` precedent. No new domain term
  (reused: claim, ref, claimedRank). The `/admin→/app` retirement is a direction the operator stated;
  if formalized it warrants its own migration ADR.

## Reflections

- **"Is it wired up correctly?" was the highest-value question of the session.** I'd written a code
  comment claiming "the steward reads the ref when present" — but only the rank-on-claim path actually
  surfaced anything. The operator's probe forced the honest trace: three refs were dark data. Don't
  let a comment assert behavior the code doesn't have.
- **Two admin surfaces, one drifted.** The `/admin` claim page had a Claimed Rank card; the `/app`
  one (the surface the operator actually lands on) didn't. Verifying on the REAL surface (not the one
  I edited) caught it — and the redirect was invisible until the browser showed `/admin → /app`.
- **Grounding the design in the repo's own pattern beat inventing one.** "What does Dirstarter do for
  tool claim?" → `ProfileClaimRequest` uses typed FK columns → that's the answer. The evidence-text
  shortcut I'd offered would have been a one-off to rip out later.
- **prodsnap migration drift is a live hazard.** A deferred migration (`20260622`, "do not apply in
  cloud") sits pending on prod; a naive deploy would fire it. Hand-authoring my migration + applying
  only it via psql (not `migrate dev`/`deploy`) avoided collateral — and surfaced the push risk.
- **Type-only imports are the Prisma-in-browser seatbelt.** Every client import of the server option
  module is `import type` (erased at build) + `server-only` backstop on the loader → page stayed 200,
  not a 500.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | only `SESSION_0441.md` is a doc (all else code); no wiki/arch pages touched → no other frontmatter changes |
| Backlinks/index sweep | wiki index session row added; `pairs_with` SESSION_0440 ↔ 0441; no other new cross-links |
| Wiki lint | `bun run wiki:lint` → 0 errors, 15 warnings — all pre-existing (SESSION_VIDEO_R001, petey-plan-0436); none introduced |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | REVIEW_01 above; WL gap → Slice B next-task; pre-existing dead-route fixed |
| Review & Recommend | yes — Slice B First task + left-over sweep written |
| Memory sweep | combobox+typed-ref claim wiring + `/admin→/app` direction + prodsnap-migration-drift hazard → memory (see bow-out) |
| Next session unblock check | Slice B is self-contained (data already persisted) — unblocked; push held on operator's prod-migration call |
| Git hygiene | branch `main`; single commit; **push HELD** (deferred-`20260622`-migration would fire on deploy — operator decision) |
| Graphify update | `graphify update .` re-run after each doc/ledger pass (final run after the hub + schema-doc refresh); `.graphify/` is git-ignored, viz counts vary per run (~80 nodes) |
