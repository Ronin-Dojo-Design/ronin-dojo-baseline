---
title: "SESSION 0440 — Full A: pending- + claimed-aware claim-path UI gating (shared resolver)"
slug: session-0440
type: session--implement
status: closed
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0440
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0439.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0440 — Full A: pending- + claimed-aware claim-path UI gating (shared resolver)

## Date

2026-06-23

## Operator

Brian + claude-session-0440 (Petey)

## Goal

Build **Full A**: a single shared `resolveViewerClaimState` resolver in the passport/claim server
layer, consumed by BOTH the lineage-drawer loader and the directory loader, rendering a 5-state CTA
machine (`UNCLAIMED | PENDING_MINE | CLAIMED_MINE | CLAIMED_OTHER`) on both surfaces. Fixes the ghost
"Claim" button on already-claimed lineage nodes. Green `main` first (oxfmt + claim e2e to the unified
`PassportClaimRequest` shape). Then HOLD — Brian Truelson's real claim invite is gated until Full A is
deployed + verified.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0439.md`
- Carryover: 0439 pushed P5 + the directory-profile Save fix to prod, ran the real prod backfill
  (Tony Hua's APPROVED claim migrated to `PassportClaimRequest`, idempotent), proved Brian's claim
  click chain on prod, and grilled Full A to mutual understanding. This session executes that grilled
  plan and greens `main` (left RED by 0439: oxfmt + the claim e2e shape).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `74743b56`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth (claim identity surfaces) — read-only state derivation, no auth-flow change |
| Extension or replacement | Extension: adds a viewer-aware read model on top of the existing claim server layer; no new schema |
| Why justified | The 3 claim doors already converge on `PassportClaimRequest`; only the UI lacked awareness |
| Risk if bypassed | Ghost "Claim" button on claimed nodes errors on click; duplicate-claim friction for pending claimants |

Live docs checked during planning: not applicable (on-the-wire-only; no Prisma/schema change).

### Graphify check

- Skipped — files pre-resolved in the 0439 grill; no repo-wide search needed. Verified each path by
  direct source inspection (see Petey plan).

### Grill outcome

- Scope was grilled to mutual understanding in SESSION_0439. Carried forward verbatim as the Petey
  plan below. One open recommendation surfaced this session: the **C follow-up** (instant self-claims
  for the non-email doors) — recommend DEFER (see Open decisions).

### Drift logged

- D-029 (candidate): the lineage drawer-profile payload (`lineageNodeProfilePayload.claimRequests`)
  still selects the LEGACY `LineageClaimRequest[]` node relation, which is no longer written
  post-P5 — effectively dead select. Not gating any UI. Note for the Step-4 legacy drop.

## Petey plan

### Goal

Single shared claim-state resolver + 5-state CTA gating on both claim surfaces, green `main`, HELD on
Brian's send until deployed + verified.

### Tasks

| ID | Title | Owner | Done means |
| --- | --- | --- | --- |
| SESSION_0440_TASK_01 | Green `main`: oxfmt + claim e2e shape | Cody | oxfmt clean repo-wide; e2e helper reads `PassportClaimRequest`; auth-lifecycle assertions pass |
| SESSION_0440_TASK_02 | `resolveViewerClaimState` + batch sibling, unit-tested | Cody | Pure resolver returns the 4-state enum for all paths; unit tests cover all 5 rows; batch variant shares the core |
| SESSION_0440_TASK_03 | Thread state + render 5-state machine on lineage drawer | Cody | Drawer consumes `viewerClaimState`; ghost-claim bug fixed; logged-out → funnel |
| SESSION_0440_TASK_04 | Thread state + render 5-state machine on directory profile | Cody | Directory teaser/hero consume state; pending-aware + "yours" CTA |
| SESSION_0440_TASK_05 | One gating e2e: claimed-state hides drawer CTA | Doug | e2e asserts no Claim CTA on a claimed node |
| SESSION_0440_TASK_06 | Verify (typecheck/oxlint/oxfmt/unit/e2e) + fallow delta | Doug | All gates green; CRAP not worse on touched files |
| SESSION_0440_TASK_07 | HOLD → on operator go: Brian `--send`, then `--grant` | Petey | Deferred; gated on Full A deployed + verified |

### Parallelism

Mostly sequential (shared resolver underpins both surfaces). TASK_03 and TASK_04 are disjoint once
TASK_02 lands and could parallelize, but they are small — done inline.

### Agent assignments

Petey (orchestrate) → Cody (TASK_01–04 build) → Doug (TASK_05–06 verify). Inline; no sub-agents.

### Open decisions

- **C follow-up (operator-flagged):** should the lineage-drawer + directory doors grant INSTANT
  self-claims (like the emailed magic link) instead of admin-review PENDING?
  **Recommendation: DEFER / NO for Full A.** The email path is instant because possession of the
  invited email is identity proof (the email→node binding). Paths 2 & 3 carry NO proof — a stranger
  could seize any unclaimed founder identity. Keep them admin-review PENDING. A future instant path
  should be gated on a real proof (verified-email match to a recorded node/passport email), not on
  "the claimant asserts it's them." Moot for Brian (binding = instant).
- **CLAIMED_MINE manage destination:** link to `/app/profile` (canonical edit-my-profile route).

### Risks

- Complexity creep on `DrawerBody` / `DirectoryProfile` (both CRAP=72, high at baseline) — mitigate by
  keeping the resolver pure + rendering via a tiny presentational helper, not inline conditionals.
- Per-tree N-passport resolution — use a single batched query (well-indexed `[passportId, status]` +
  `[claimantUserId, status]`), not N calls.

### Scope guard

In: the resolver, the two loaders threading it, the two surfaces' CTA rendering, unit + e2e tests, and
greening `main`. Out: the Step-4 legacy `LineageClaimRequest` drop, the C instant-self-claim build,
prod creds rotation, and Brian's actual send (HELD).

## Task log

| ID | Status | Notes |
| --- | --- | --- |
| SESSION_0440_TASK_01 | ✅ done | green main — oxfmt (2 files) + e2e helper → PassportClaimRequest |
| SESSION_0440_TASK_02 | ✅ done | `resolveViewerClaimState` resolver + 13 tests |
| SESSION_0440_TASK_03 | ✅ done | lineage drawer 5-state gating (+ board + card-menu + header badge) |
| SESSION_0440_TASK_04 | ✅ done | directory profile 5-state gating |
| SESSION_0440_TASK_05 | ✅ done | gating e2e (claimed node hides Claim CTA) — 5/5 green |
| SESSION_0440_TASK_06 | ✅ done | verify gates + fallow delta; deployed (4 pushes, CI+E2E green) |
| SESSION_0440_TASK_07 | HELD | Brian `--send`/`--grant` staged + pre-verified; gated on operator go |
| SESSION_0440_TASK_08 | ✅ done | directory claim dead-end → account-optional funnel (`5cb77e0e`) |
| SESSION_0440_TASK_09 | ✅ done | magic-link `INVALID_CALLBACK_URL` fix (`c62577a6`) — P0 |
| SESSION_0440_TASK_10 | ✅ done | `setup-test-claimant.ts` harness + prod bind for dogfood |

## What landed

Full A built + locally verified (HELD at push/deploy per operator's explicit-push rule):

- New shared resolver `server/web/claims/resolve-viewer-claim-state.ts` — pure
  `deriveClaimViewerState` (the 5-row machine) + `resolveViewerClaimStates` (batch, 2 indexed
  queries) + `resolveViewerClaimState` (single wrapper). Both claim surfaces consume it.
- Lineage drawer: CTA extracted to a `ClaimCta` helper driven by the state machine; ghost
  Claim button on claimed nodes fixed (threaded via page loader → island/board → drawer; the
  card-menu Claim item is gated too). Fallback off `profile.passport.user` kills the ghost
  button even for un-threaded callers (editor/galaxy).
- Directory profile: teaser is pending-aware (PENDING_MINE → "Claim pending review"); HeroActions
  shows "This profile is yours →" (→ /app/profile) for CLAIMED_MINE.
- Green main: oxfmt fixed (2 files); e2e helper repointed to `PassportClaimRequest` + a new
  gating assertion (claimed node hides the Claim CTA).
- **Shipped + deployed to prod** (4 pushes, all CI + E2E green): Full A (`5598f45d`), the
  test-claimant harness (`13153425`), and two follow-up bug fixes found during the operator's
  live prod dogfood (below).
- **Directory claim dead-end fix (`5cb77e0e`):** the directory placeholder teaser showed an
  inline `ProfileClaimForm` whose submit is `userActionClient`-gated → a logged-out visitor
  dead-ended with "User not authenticated". Routed the directory person-claim CTA to the SAME
  account-optional `/lineage/join` wizard the lineage drawer uses (loader resolves the
  claimable node → `claimFunnelHref`). Both doors now guest-friendly + consistent.
- **Magic-link `INVALID_CALLBACK_URL` fix (`c62577a6`) — P0, would have broken Brian:** every
  node-claim magic link 403'd on click. Better Auth's verify `originCheck` double-decodes the
  `callbackURL` and its trusted-relative regex allows ONE query string; the `/preview?token=…&
  next=/lineage/claim/accept?node=<id>` wrapper decoded to a NESTED `?` → rejected. (`/me`
  survived — no nested query — which is why the 0439 `/me` click-test passed but claims never
  did.) The `/preview` gate-bypass hop is vestigial (countdown hard-off), so the callbackURL
  now points straight at `nextPath`. Proven live on prod (OLD → 403, NEW → 302).
- **Prod test infra:** `setup-test-claimant.ts` (`--status/--verify/--bind/--reset/--send`)
  + bound `ronindojodesign@gmail.com → cullet-eric` on prod for the operator's hands-on dogfood.
- **Countdown confirmed fully off** (Vercel env absent + code `isBblCountdownActive() => false`).

## Decisions resolved

- C follow-up (instant self-claims for the non-email doors): **DEFER** — no identity proof on
  doors 2 & 3, so instant would let a stranger seize an unclaimed identity. Keep admin-review.
- CLAIMED_MINE manage link → `/app/profile`.
- Directory claim funnel = account-optional `/lineage/join` (operator: don't force sign-in first).
- The combobox feature (rank/school/instructor selectors w/ free-text) is the NEXT session.

## Files touched

| File | Change |
| --- | --- |
| `server/web/claims/resolve-viewer-claim-state.ts` | NEW — shared resolver (pure + batch + single) |
| `server/web/claims/resolve-viewer-claim-state.test.ts` | NEW — 13 tests (8 pure machine + 5 integration) |
| `app/(web)/lineage/[treeSlug]/page.tsx` | batch-resolve claim state per visible node; thread to island + board |
| `components/web/lineage/lineage-view-a-island.tsx` | `claimStateByNodeId` prop → drawer; gate card-menu Claim item |
| `components/web/lineage/lineage-tree-board.tsx` | `claimStateByNodeId` prop → drawer |
| `components/web/lineage/lineage-profile-drawer/index.tsx` | `ClaimCta` helper + `effectiveClaimState` fallback; `viewerClaimState` prop |
| `components/web/lineage/lineage-profile-drawer/drawer-types.ts` | `viewerClaimState?` on props |
| `components/web/lineage/lineage-profile-drawer/drawer-header.tsx` | suppress the "Claimable" header badge on a claimed node (browser-review finding; D-029 root cause) |
| `app/(web)/directory/[slug]/_components/directory-profile/directory-profile-data.ts` | resolve viewer claim state in loader |
| `app/(web)/directory/[slug]/_components/directory-profile/index.tsx` | thread state to teaser + HeroActions |
| `app/(web)/directory/[slug]/_components/directory-profile/hero-actions.tsx` | CLAIMED_MINE "This profile is yours" CTA |
| `components/web/claims/profile-claim-teaser.tsx` | pending-aware (PENDING_MINE) |
| `e2e/helpers/seed-lineage-lifecycle-db.ts` | read/clean `PassportClaimRequest` (was `lineageClaimRequest`) |
| `e2e/lineage/authenticated-lifecycle.spec.ts` | +gating assertion (claimed node hides Claim CTA) |
| `app/admin/lineage/_components/lineage-avatar-action.tsx`, `emails/bbl-truelson-holding-note.tsx` | oxfmt (green main) |
| `app/(web)/directory/[slug]/_components/directory-profile/directory-profile-data.ts` | +`claimFunnelHref` (resolve claimable node → account-optional funnel) |
| `components/web/claims/profile-claim-teaser.tsx` | +funnel button (account-optional) replacing the auth-gated inline form |
| `server/web/lineage/mint-claim-magic-link.ts` | callbackURL → bare `nextPath` (drop vestigial `/preview` hop) — fixes `INVALID_CALLBACK_URL` |
| `server/web/lineage/claim-callback-url.test.ts` | NEW — replicates Better Auth's regex; pins old-rejected / new-accepted |
| `scripts/setup-test-claimant.ts` | NEW — reusable prod claim-test harness (status/verify/bind/reset/send) |
| `docs/sprints/SESSION_0440.md` | this session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | green |
| `oxfmt --check .` (repo-wide CI gate) | clean (greens the RED main) |
| `oxlint server components app` | no errors (pre-existing warnings only; none in touched files) |
| `bun test server/web/claims/resolve-viewer-claim-state.test.ts` | 13 pass / 0 fail |
| `bun test server/web/claims/` | 23 pass / 0 fail |
| `playwright authenticated-lifecycle.spec.ts --project=chromium` | 5 pass (3.6m) — greens RED e2e + proves claimed-state gating |
| fallow health | 62.4 C → 62.4 C (unchanged); DrawerBody improved, DirectoryProfile flat |
| `bun test claim-callback-url.test.ts` | 4 pass — old callbackURL rejected, new accepted |
| Directory funnel (browser) | `/directory/cullet-eric` signed-out → funnel button → `/lineage/join` wizard (screenshots) |
| Callback fix (live prod curl) | OLD callbackURL → 403 `INVALID_CALLBACK_URL`; NEW → 302 (originCheck passes) |
| All 4 pushes | CI ✅ + Playwright E2E ✅ (all engines) + Vercel prod deploy ✅ Ready |
| Full `bun test` | NOT run (fires real Resend emails — known landmine; ran touched-area suites only) |

## Open decisions / blockers

- **Brian's real `--send` is staged + pre-verified (`--dry-run` + `--verify` green; Resend keys
  present in Vercel) but HELD** for operator go after the test-claim dogfood. The callback fix
  means his link will no longer 403.
- **`--send` from the harness can't be run by the agent** — `RESEND_API_KEY` is a Vercel
  *Sensitive* var (pulls empty). Operator must paste the key OR re-submit the wizard (prod sends).
- C follow-up: recommend DEFER (no agent action).

## Next session

### Goal

Replace the Join-the-Legacy wizard's free-text **rank / school / instructor / branch** inputs with
**creatable combobox selectors** — pick a *registered* rank/school/instructor (store its ID for a
real steward-verifiable link) OR type a *custom* value for one that isn't registered yet (store as
text, flagged for review). The rank selection should feed the claim's `claimedRankId` (the asserted
RankAward, FI-006 / ADR 0035 §4).

### Bow-in prompt (paste-ready — files pre-resolved)

> Act as Petey. SESSION_0440 shipped Full A (the claim-CTA state machine) + fixed two prod claim
> blockers found live: the directory claim dead-end (now routes to the account-optional
> `/lineage/join` wizard) and the magic-link `INVALID_CALLBACK_URL` (callbackURL was a double-`?`
> after Better Auth's double-decode; dropped the vestigial `/preview` hop). Brian's `--send` is
> staged + held. **This session = the combobox feature.**
>
> **The build:** the wizard's lineage step (`join-legacy-wizard`) currently has FREE-TEXT
> `currentRank` / `schoolName` / `trainedUnder` / `represent` (schema + `lineage-step.tsx`). Make
> each a **creatable combobox**: searchable list of registered options + an "enter custom" path.
> When a registered option is chosen, persist its **id**; when custom, persist the **text**.
>
> **The 4 fields → sources:**
> | Field | Registered source | Custom (free-text) | Wiring bonus |
> | --- | --- | --- | --- |
> | `currentRank` | BBL rank ladder (`server/web/lineage/rank-queries.ts`) | "not listed" | feeds `claimedRankId` → asserted RankAward (ADR 0035) |
> | `schoolName` | BBL orgs (`server/web/organization/queries.ts` / `search-organizations.ts`) | unregistered school | links org on match |
> | `trainedUnder` | BBL lineage people (new loader: nodes/passports in the BBL tree) | unregistered instructor | links node on match |
> | `represent` | lineage trees / orgs | custom | optional |
>
> **Key decision (settled):** store BOTH shapes — a nullable `*Id` (ref) AND the existing text
> field (label / custom). The steward review surface reads the ref when present, else the text.
>
> **Files to touch (pre-resolved):**
> - Component: extend `components/common/combobox-selector.tsx` with a **creatable** mode (allow a
>   value not in `items`), OR add `components/common/creatable-combobox.tsx`. (No creatable combobox
>   exists today — this is the one new primitive. Check `DataSelect` vs `ComboboxSelector` decision
>   rule first: long/searchable → ComboboxSelector.)
> - `app/(web)/lineage/join/join-legacy-wizard/schema.ts` — add `currentRankId?`, `schoolOrgId?`,
>   `trainedUnderNodeId?` (+ keep the text fields as the custom/label fallback).
> - `app/(web)/lineage/join/join-legacy-wizard/lineage-step.tsx` — swap the 4 `TextField`s for the
>   creatable comboboxes (lines ~39/57/75/93).
> - `app/(web)/lineage/join/join-legacy-wizard/use-join-wizard.ts` — add the new defaults.
> - `app/(web)/lineage/join/page.tsx` — server-load the option lists (ranks/schools/instructors,
>   BBL-scoped) and pass them to the wizard (the wizard is account-optional; options are public).
> - `server/web/lead/public-actions.ts` (`createJoinLegacyInterest`) — persist the refs; pass the
>   chosen rank to the claim path as `claimedRankId` where applicable.
> - New loader for instructors (BBL lineage people) — likely `server/web/lineage/*` reusing the
>   tree-member projection; cap + searchable.
> - Tests: unit on the creatable-combobox (pick vs custom), schema validation, and the
>   ref-or-text persistence in `createJoinLegacyInterest`.
>
> **Watch-outs:** keep the wizard account-optional (no Prisma-in-client — load options server-side,
> pass as props; the combobox is `"use client"`). The instructor list could be large (BBL roster) —
> make it searchable/paged, not a full dump. Belt colors stay data-driven (`Rank.colorHex`).
>
> **Verify:** `npx next dev --turbo` → `/lineage/join` → exercise pick-registered vs type-custom on
> each field; confirm a registered rank flows to `claimedRankId`. Dev DB = `ronindojo_prodsnap`.
> Run `fallow health`/`dupes` baseline BEFORE building (operator standing rule).
>
> **Still open from 0440 (do first if not yet done):** operator to run the test claim
> (`ronindojodesign@gmail.com → cullet-eric`, binding live) and give go on Brian's `--send`
> (`scripts/send-bbl-truelson-thankyou.ts --send` + then `--grant`). Disposable test users to
> clean post-verification. Prod Neon pw rotation (operator EOD).

### First task

`SESSION_0441_TASK_01` — fallow baseline, then build the creatable-combobox primitive
(`combobox-selector` creatable mode or `creatable-combobox.tsx`) with unit tests, before wiring the
4 wizard fields + their server-side option loaders.

## Review log

### SESSION_0440_REVIEW_01 — Full A + two prod claim-blocker fixes

- Covers TASK_01–06, 08–10. All gates green on `main` (CI + Playwright E2E all-engines + Vercel
  prod deploy ✅, 4 pushes). Live prod proof captured for the callback fix (OLD 403 / NEW 302) and
  the directory funnel (browser screenshots). State machine has heavy unit coverage; e2e proves wiring.
- **Honesty note:** full `bun test` was NOT run (real-Resend landmine) — only touched-area suites.
  fallow health flat (62.4 C); +5/+2/+2 cyclomatic on three pre-existing critical hotspots (island,
  board, page loader) from threading one prop — no new hotspot introduced.
- **Open follow-ups:** TASK_07 (Brian send) HELD on operator go; combobox feature → SESSION_0441;
  agent can't run `--send` (Sensitive Resend key).

### Findings (severity ≥ medium)

- **D-029 (drift):** the lineage drawer payload (`lineageNodeProfilePayload.claimRequests`) still
  selects the LEGACY `LineageClaimRequest[]` node relation (unwritten post-P5) — surfaced as the
  stale "Claimable" header badge on claimed nodes (fixed at the surface via the resolver). Root
  relation drop belongs with the Step-4 legacy-table removal. → `drift-register`.

## ADR / ubiquitous-language check

- ADR 0036 (unified Passport-keyed claim) governs; this session adds a viewer-aware READ model
  (`resolveViewerClaimState`) consistent with it — no new ADR. The callback + funnel fixes are bug
  fixes, not decisions. No new domain term. C follow-up (instant self-claims) recorded as DEFER —
  if ever approved it warrants an ADR (identity-proof model for non-email claim doors).

## Reflections

- **The `/me` test that "passed" hid the real bug.** SESSION_0439's `/me` click-test gave false
  confidence — the claim path (nested `?node=`) was never exercised, and it was the one that 403'd.
  Lesson: dogfood the EXACT path the real user takes (claim-accept), not a proxy (`/me`).
- **Reading the dependency's source paid off.** The callback root cause only became unambiguous by
  reading Better Auth's `originCheck` + `matchesOriginPattern` regex in `node_modules`. The live
  prod curl (OLD 403 / NEW 302) then proved it without guessing.
- **Browser review caught what the e2e couldn't:** the stale "Claimable" badge + the logged-out
  dead-end were both invisible to tests but obvious on screen. Show-rendered-before-push earns its keep.
- **Vercel Sensitive vars pull empty** (known gotcha, hit again) — can't agent-send prod email.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | only `SESSION_0440.md` is a doc; no wiki/arch pages touched → no frontmatter changes needed |
| Backlinks/index sweep | wiki index session row added (see step 3c); no new cross-page links |
| Wiki lint | `bun run wiki:lint` → 0 errors, 15 warnings — all pre-existing (SESSION_VIDEO_R001, petey-plan-0436); none introduced |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | REVIEW_01 above; D-029 routed to drift-register |
| Review & Recommend | yes — detailed SESSION_0441 combobox prompt written |
| Memory sweep | callback-bug class + Sensitive-key gotcha → memory (see bow-out) |
| Next session unblock check | unblocked — combobox plan is self-contained; Brian send held on operator |
| Git hygiene | branch `main`; single push — hash reported at bow-out / see git log |
| Graphify update | run before close commit — Nodes 78 · Edges 1150 · Communities 2041 |
