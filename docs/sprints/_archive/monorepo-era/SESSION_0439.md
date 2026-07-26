---
title: "SESSION 0439 — gated PROD cutover for unified Passport claim"
slug: session-0439
type: session--open
status: closed
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0439
sprint: S43
pairs_with:

  - docs/sprints/SESSION_0438.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0439 — gated PROD cutover for unified Passport claim

## Date

2026-06-23

## Operator

Brian + claude-session-0439

## Goal

Execute the gated PROD cutover for the unified claim (ADR 0036), in strict order, each on explicit
operator go: (1) rotate prod Neon password; (2) push P5 paired with the prod backfill so the queue
code + the migrated data land together (no orphaned PENDING claims); (3) send Brian Truelson's real
claim invite. Then, separately and later, drop the legacy `LineageClaimRequest` table once
stragglers clear.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0438.md`
- Carryover: SESSION_0438 landed E0 **P5** (legacy `LineageClaimRequest` writer + admin/manager
  queues retired onto `PassportClaimRequest` / `reviewPassportClaim`), fixed a latent Phase-3c 500
  (D-031), pruned dead types, extracted `dispatchJoinLegacyNotifications`. Committed (`82052d15`)
  but **push HELD**. This session executes the gated prod cutover.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `82052d15` — `main` is **ahead 3** of `origin/main`
  (`82052d15` P5, `9a5843b1` finalize helpers, `1d3a836e` P0–P4)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma, hosting (Vercel env), auth |
| Extension or replacement | Operational — data migration + env rotation over the existing baseline; no capability replaced |
| Why justified | Prod data migration for the bespoke BBL claim domain; Neon rotation is security hygiene |
| Risk if bypassed | Orphaned PENDING claims if code deploys without the backfill; exposed prod creds if rotation skipped |

## Petey plan

### Goal

Run the gated prod cutover in strict order, holding for explicit operator go between each step.

### Tasks

#### SESSION_0439_TASK_01 — Step 1: rotate prod Neon password

- **Agent:** operator (Neon console) + Cody (Vercel env update)
- **What:** Reset the prod Neon role password; update Vercel prod `DATABASE_URL` +
  `DIRECT_DATABASE_URL` (Production, Sensitive). ⚠ D-024: Sensitive vars pull empty — set, don't read.
- **Done means:** new creds set in Vercel prod; a read-only prod query succeeds with the rotated string.

#### SESSION_0439_TASK_02 — Step 2: prod backfill + push P5

- **Agent:** Cody
- **What:** Point `DATABASE_URL` at prod Neon, run `apps/web/scripts/backfill-passport-claims.ts`
  (idempotent, BBL-scoped). Push `main` → `origin` around the same step so the queue code + data land
  together.
- **Done means:** Tony Hua present + APPROVED; counts match `LineageClaimRequest` +
  `ProfileClaimRequest` PERSON rows; re-run = no dupes; P5 deployed.

#### SESSION_0439_TASK_03 — Step 3: send Brian Truelson's real claim invite

- **Agent:** Cody
- **What:** 2nd-touch real claim invite (holding note sent SESSION_0436). Use the appropriate
  `apps/web/scripts/send-bbl-*` script; dry-run first if a flag exists. ⚠ LIVE Resend send.
- **Done means:** magic-link claim email delivered to Brian; Resend id recorded.

### Open decisions

- Step 4 (drop legacy `LineageClaimRequest`) deferred to a later migration once stragglers clear.

### Scope guard

- Strict order. **Hold for explicit operator go between every step.** No prod mutation or LIVE send
  without it.
- Do NOT drop the legacy table this session.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0439_TASK_01 | deferred | Rotate prod Neon password — operator doing EOD (creds still valid); not blocking |
| SESSION_0439_TASK_02 | done | Pushed P5 (+ Save fix) → prod deploy; ran prod backfill (Tony Hua APPROVED migrated; idempotent verified) |
| SESSION_0439_TASK_03 | held | Brian Truelson real send — GATED on Full A (claim-path gating + CI/e2e green) per operator |
| SESSION_0439_TASK_04 | done | Fixed directory-profile Save bug (`optionalUrl` rejected `null`); 12 schema tests green |
| SESSION_0439_TASK_05 | done | Verified Brian's claim path end-to-end (`--verify`, rolled back) + audited the 3 claim paths + grill → scoped Full A |

## What landed

- **P5 + Save fix pushed → prod deploy** (`82052d15`..`fc9dcbd1`, 5 commits): the held P0–P5
  claim-unification work plus a new `optionalUrl` null fix landed on `main` and deployed.
- **Prod backfill run (the REAL migration).** `scripts/backfill-passport-claims.ts` against prod Neon:
  migrated **2** rows (1 BBL lineage = **Tony Hua APPROVED, preserved**; 1 directory-person = Tony Hua
  PENDING) → `PassportClaimRequest` = 2. Re-run = scanned 2 / migrated 0 / skipped 2 → **idempotent, no
  dupes**.
- **Directory-profile Save bug fixed (FI-007 follow-up).** `FormMedia` clears empty cover/video to
  `null`; `optionalUrl` used `.optional()` (rejects `null`) → "Invalid input" blocked Save. Changed to
  `.nullish()`. 12 schema tests green (added `null` cases). **Dogfooded live on prod** via the test send.
- **Brian's claim-flow click chain proven on prod.** Two safe `/me` test sends (`--to`/`--free-signup`
  affordances added) to `weaselsofdestiny@gmail.com` + `ronindojodesign@gmail.com`; operator clicked →
  signed in past the countdown gate → landed in-app. Email→verify→preview-gate→sign-in chain = green.
- **Brian's real claim path verified** (`--send --verify`, rolled-back prod tx): node `cmq60y01l…`
  unclaimed + claimable, **would CLAIM + grant 2 entitlements**, nothing persisted.
- **Audited all 3 claim paths + grilled the scope.** Decided: **Full A** (claimed- *and* pending-aware
  UI gating via a shared `resolveViewerClaimState` helper + CI/e2e green) is the **gate for Brian's real
  email**. See Decisions resolved + Next session.

## Open decisions / blockers

- **⛔ `main` is RED — must green as part of Full A (next session):**
  - **CI**: `oxfmt` format:check fails on an unformatted tracked file (pre-existing CI debt since the
    17:04 holding-note commit).
  - **E2E**: `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts:257` asserts the *old* claim shape
    (`state.claim.status === "PENDING"` + claimantNote + evidence + a claim sheet at `:14`). P5 moved the
    writer to `submitPassportClaim`/`PassportClaimRequest`, so the spec must be **updated to the unified
    truth** (not deleted).
- **Brian's real send is HELD** — gated on Full A deployed + verified (operator decision).
- **Lifetime comp gap:** the auto-claim grants Brian **1 year** (he's not Dirty Dozen; `visualGroup =
  none`), but the email promises **lifetime** Elite. Must run `--grant --grantor-email <admin>` **after
  Brian signs in** (account must exist). This is the post-send tail.
- **Brian-Scott PENDING straggler:** 1 `LineageClaimRequest` (PENDING, operator/admin, node in both BBL +
  Baseline trees) was NOT migrated (BBL-scoped out). **Blocks Step 4 (drop legacy `LineageClaimRequest`)**
  until discarded-if-stale or migrated under its real brand.
- **Disposable prod test users** `weaselsofdestiny` + `ronindojodesign` left in place — clean up after
  gating verification (or keep for re-test).
- **Prod Neon password rotation** — operator doing EOD; the connection string was exposed in chat again.

## Next session

### Goal

Build **Full A**: claimed- *and* pending-aware claim-path UI gating across the 3 entry paths, behind one
shared state resolver, with CI + e2e green on `main`. Then — and only then — send Brian Truelson's real
claim invite and run the lifetime `--grant`.

### Bow-in prompt (paste-ready — files pre-resolved, no Graphify needed)

> Act as Petey. SESSION_0439 pushed P5 + the directory-profile Save fix to prod, ran the **real prod
> backfill** (Tony Hua's APPROVED claim migrated to `PassportClaimRequest`; idempotent), proved Brian's
> claim **click chain** on prod (two `/me` test sends, operator clicked through the gate), and **grilled
> the scope to mutual understanding**. **This session = build Full A, green `main`, THEN send Brian.**
> Strict gate: **Brian's real email is HELD until Full A is deployed + verified.**
>
> **The decided scope (grill, SESSION_0439):**
> - Three claim entry paths, all unified on `PassportClaimRequest` (ADR 0036): (1) emailed magic link →
>   `/lineage/claim/accept` (INSTANT, `claimNodeForUser`), (2) lineage-node drawer "Claim", (3) directory
>   profile "Claim". The server already prevents overlap (dedup `DUPLICATE_CLAIM`, accountless guard
>   `ALREADY_CLAIMED`, non-terminal claim reuse, and `cancelSiblingPassportClaims` auto-cancels other open
>   claims when any path wins). The gap is **UI awareness**.
> - **Build a single shared resolver** `resolveViewerClaimState(passportId, viewerUserId)` (in the
>   passport/claim server layer) returning `UNCLAIMED | PENDING_MINE | CLAIMED_MINE | CLAIMED_OTHER`, used
>   by **both** the lineage-drawer loader AND the directory loader — single source of truth so the surfaces
>   can't drift.
> - **Render this 5-state machine on both surfaces:**
>   | State (for viewer) | CTA behavior |
>   | --- | --- |
>   | Unclaimed, no pending (signed-in or out) | Show "Claim" CTA (logged-out → sign-in funnel) |
>   | Unclaimed, **I** have a PENDING claim | "Claim pending review" — disabled/info |
>   | Unclaimed, **someone else** pending (none mine) | Show "Claim" normally — do NOT expose the other claim |
>   | **Claimed by me** | "This profile is yours →" manage/edit link (no claim button) |
>   | **Claimed by someone else** | No CTA — normal claimed public profile |
> - **The concrete bug this fixes:** `components/web/lineage/lineage-profile-drawer/index.tsx:197` renders
>   the Claim button on `isClaimable && isTreeClaimable` only — it ignores `passport.userId`, so a
>   ghost Claim button shows on already-claimed nodes (errors on click). Directory already gates via
>   `isClaimablePlaceholder` (`app/(web)/directory/[slug]/_components/directory-profile/index.tsx:49`) but
>   has no pending-aware state. Both must consume the shared resolver.
> - **Test strategy (decided):** heavy coverage = **unit tests on `resolveViewerClaimState`** (all 5
>   states, fast/deterministic); **update** the broken claim e2es to the unified shape (don't delete); add
>   **one** e2e asserting claimed-state hides the drawer CTA. e2e proves wiring; the state machine lives in
>   unit tests.
>
> **Green `main` (currently RED):**
> - CI: `oxfmt` format:check fails — run `node_modules/.bin/oxfmt --check` (or the repo `format` script) to
>   find the unformatted tracked file, fix it.
> - E2E: `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts:257` (+ the claim sheet at `:14`) asserts
>   the old `LineageClaimRequest` shape; update its helper/assertions to `PassportClaimRequest`
>   (status/claimantNote/evidence now live there). Confirm the new behavior is correct first, then pin it.
>
> **Key files (pre-resolved):**
> - Paths: `app/(web)/lineage/claim/accept/route.ts`, `server/web/lineage/claim-accept-actions.ts`,
>   `server/web/lineage/claim-node-for-user.ts` (instant core; sibling-cancel call ~`:184`),
>   `server/web/lineage/claim-actions.ts` (node submit), `server/web/claims/claim-actions.ts` (directory
>   submit), `server/web/passport/submit-passport-claim.ts` (unified writer; dedup `:72`, accountless `:67`),
>   `server/admin/lineage/claim-finalize.ts` (`cancelSiblingPassportClaims` ~`:362`; comp term ~`:171`).
> - Surfaces to gate: `components/web/lineage/lineage-profile-drawer/index.tsx:197`,
>   `app/(web)/directory/[slug]/_components/directory-profile/index.tsx:49`,
>   `components/web/claims/profile-claim-teaser.tsx`.
> - Loaders feeding those surfaces (find the directory `[slug]` loader + the lineage tree/drawer loader and
>   thread the resolver's state through to props).
>
> **AFTER Full A is deployed + verified — the gated Brian steps (each on operator go):**
> 1. **Send** Brian's real 2nd-touch invite: `cd apps/web && DATABASE_URL=<prod> SKIP_ENV_VALIDATION=1 bun
>    scripts/send-bbl-truelson-thankyou.ts --send` (recipient hardcoded `btruelson@gmail.com`; magic link
>    7-day expiry CONFIRMED matches the email's "good for 7 days"; sender falls back to
>    `welcome@blackbeltlegacy.com`, DKIM-verified). Mints the email→node binding so Google OR magic link
>    both auto-claim.
> 2. **After Brian signs in** (account then exists): `bun scripts/send-bbl-truelson-thankyou.ts --grant
>    --grantor-email <your admin email>` → upgrades his 1-yr claim comp to **LIFETIME** Elite (the email's
>    headline promise; auto-claim only grants 1 yr since he's not Dirty Dozen).
>
> **Separate, later — Step 4 (drop legacy `LineageClaimRequest`):** still blocked on the **Brian-Scott
> PENDING straggler** (1 unmigrated PENDING row, node in BBL+Baseline trees — discard-if-stale or migrate
> under its real brand first). `applyLineageClaimReview`
> (`apps/web/server/admin/lineage/claim-review-actions.ts:145`) + the `lineageClaimRequest` /
> `lineageClaimEvidence` models drop in the same migration; grep for residual readers first.
>
> **C follow-up (operator flagged "worth doing?"):** should paths 2 & 3 grant INSTANT self-claims (like the
> email) instead of admin-review PENDING, for a member claiming their OWN identity? Moot for Brian (binding
> = instant), relevant for binding-less members. Bring a recommendation; don't build without a go.
>
> **Cleanup:** disposable prod test users `weaselsofdestiny@gmail.com` + `ronindojodesign@gmail.com` —
> delete after gating verification (or keep to re-test). Prod Neon pw rotation pending (operator EOD).
>
> Dev DB = `ronindojo_prodsnap` (real BBL roster). Dev login: `GET /api/auth/dev-login` (admin
> `DEV_LOGIN_USER_ID=KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T`). Dev server: `cd apps/web && npx next dev --turbo`
> (FS-0002). `fallow` at repo-root `node_modules/.bin/fallow`; `psql` at
> `/Applications/Postgres.app/Contents/Versions/14/bin/psql`.

### First task

`SESSION_0440_TASK_01` — Green `main` (oxfmt + claim e2e to unified shape), then build the shared
`resolveViewerClaimState` resolver + the 5-state gating on the lineage drawer & directory surfaces, with
unit tests on the state machine and one gating e2e. Then HOLD for operator go on Brian's send.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/passport/schemas.ts` | `optionalUrl` `.optional()` → `.nullish()` (accept `null` from FormMedia); comment updated |
| `apps/web/server/web/passport/schemas.test.ts` | +3 `null` regression cases (avatar + cover + video) |
| `apps/web/scripts/send-bbl-truelson-thankyou.ts` | `--to` recipient override + `--free-signup` (`/me`) test affordances for safe click-chain dogfooding |
| `docs/sprints/SESSION_0439.md` | this session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test server/web/passport/schemas.test.ts` | **12 pass / 0 fail** |
| `bun run typecheck` | green |
| `oxfmt` (3 touched code files) | clean (note: repo-wide `main` still RED on a different file) |
| `oxlint` (3 touched files) | clean |
| Prod backfill | migrated 2; Tony Hua APPROVED preserved; re-run idempotent (0 migrated / 2 skipped) |
| `--verify` (Brian, rolled back) | would CLAIM + 2 entitlements; nothing persisted |
| Click chain (operator, prod) | `/me` test sends → signed in past gate → landed in-app ✅ |
| CI / Playwright E2E on `main` | **RED** — oxfmt + claim-shape e2e (both scoped to Full A next session) |

## Decisions resolved

- **Full A** (audit-confirm + targeted gap fixes + CI/e2e green) is the deliverable; **C** (instant
  self-claims for paths 2/3) is a flagged follow-up to evaluate, not build yet.
- Gating goes **all the way to B**: claimed- *and* pending-aware UI, the full 5-state machine.
- **One shared `resolveViewerClaimState` resolver** feeds both surfaces (single source of truth).
- Test strategy: state-machine in **unit tests**; **update** (not delete) the broken claim e2es to the
  unified shape; **one** gating e2e.
- **Full A deployed + verified is the GATE for Brian's real email**; `--grant` lifetime is the post-sign-in
  tail.

## Reflections

- **Dogfooding caught what tests didn't.** The operator's real click on a prod test send surfaced the
  `null`-URL Save bug instantly — a bug FI-007's `""` fix and the existing 12-case test had both walked
  right past. The empirical schema probe ("" vs `null` vs undefined) beat re-reading the zod chain.
- **"Invalid input" is a union-failure fingerprint.** Recognizing that `.or(z.literal(""))`'s error message
  meant the value matched *neither* branch (i.e. it was `null`) cut the diagnosis from speculation to a
  one-line fix.
- **The binding collapses the three paths for Brian.** The whole "do the paths overlap?" worry mostly
  dissolves once you see that the email→node binding instant-claims on *any* sign-in, and sibling-cancel +
  dedup mop up the rest. The real residue was a single UI-awareness gap (the ghost drawer button), not a
  systemic overlap problem — the grill found the actual surface area.
- **Green-on-deploy ≠ green-on-CI (again).** P5 deployed fine and works, but it broke the claim e2e (old
  shape) and `main` was already red on format. Shipping the behavior and pinning the tests to the new truth
  are two separate jobs; deferring the second is exactly the "lean close leaves CI debt" pattern — flagged
  loudly here so next session greens it first.

## Review log

### SESSION_0439_REVIEW_01 — prod cutover + Save fix + claim-path audit

- **Reviewed tasks:** TASK_01–05
- **Verdict:** The prod backfill is correct and safe — Tony Hua's APPROVED status was preserved (verified
  by direct query), the run is idempotent, and the migration counts reconcile against both legacy tables
  (the one unmigrated PENDING is a correctly-scoped-out non-BBL straggler, flagged as a Step-4 blocker, not
  a loss). The Save fix is minimal, empirically verified, and regression-tested. Brian's claim path is
  proven both by a rolled-back `--verify` and a real prod click-through. The Full A scope was grilled to
  explicit mutual understanding before any build — no premature code.
- **Score:** 9/10 (−1: `main` left RED — CI debt + e2e shape drift — though explicitly scoped + flagged for
  next session, and partly inherited).
- **Follow-up:** Full A (SESSION_0440) gates Brian's send; Brian-Scott straggler gates Step 4.

## Hostile close review

- **Giddy:** pass — Task log has 5 entries; verification table is real (commands run + pasted); prod
  backfill claims are query-verified, not asserted. RED `main` is disclosed, not hidden.
- **Doug:** pass — no data-integrity regression: backfill is idempotent + status-preserving (Tony Hua
  APPROVED intact), all writes were the intended migration, no straggler silently dropped (Step-4 gated on
  it). The `null`-accepting schema change still rejects bad URLs (tested). Prod creds re-exposed in chat →
  rotation correctly flagged urgent/EOD.
- **Desi:** pass — the Save fix unblocks a real user-facing form; the gating work (next session) is
  scoped to make the claim CTAs consistent across surfaces (a UX-consistency win).
- **Kaizen aggregate:** 9/10 — one honestly-disclosed miss (RED main), everything else verified.

## ADR / ubiquitous-language check

- **No new ADR needed** — Full A executes ADR 0036's unified-claim model (UI-awareness layer over the
  existing server gating); the `resolveViewerClaimState` resolver is an implementation detail, not a new
  decision. If C (instant self-claims) is later approved, *that* warrants an ADR.
- **Ubiquitous language:** consider adding `resolveViewerClaimState` / the claim-state enum
  (`UNCLAIMED | PENDING_MINE | CLAIMED_MINE | CLAIMED_OTHER`) when the helper lands next session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0439 created with full frontmatter; no wiki/arch docs edited this session (code + session-doc only) |
| Backlinks/index sweep | wiki index updated with the SESSION_0439 row (see edit) |
| Wiki lint | reported at bow-out — `bun run wiki:lint` result in chat |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0439_REVIEW_01 + Giddy/Doug/Desi pass |
| Review & Recommend | Next session goal + paste-ready prompt written: yes |
| Memory sweep | updated `claim-unification-adr-0036` memory (cutover done + Full A gate); see bow-out |
| Next session unblock check | First task (green main + build resolver) is doable with no user input; Brian send remains BLOCKED ON USER (operator go) |
| Git hygiene | `main`; single docs-commit; hash reported at bow-out — see git log. ⚠ `main` CI/E2E RED (scoped to Full A) |
| Graphify update | run before close commit — Nodes 27 · Edges 726 · Communities 2020 |
