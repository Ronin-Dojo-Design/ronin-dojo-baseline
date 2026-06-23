---
title: "SESSION 0438 — E0 P5: retire legacy LineageClaimRequest surfaces"
slug: session-0438
type: session--implement
status: closed
created: 2026-06-23
updated: 2026-06-23
last_agent: claude-session-0438
sprint: S43
pairs_with:

  - docs/sprints/SESSION_0437.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0438 — E0 P5: retire legacy LineageClaimRequest surfaces

## Date

2026-06-23

## Operator

Brian + claude-session-0438

## Goal

Land ADR 0036 E0 **P5** as one coupled, browser-verified change: convert the last
`LineageClaimRequest` writer (the "Join the Legacy" lead-claim path) to `submitPassportClaim`,
and in the SAME change repoint the admin review queue + the manager claim list to
`PassportClaimRequest` / `reviewPassportClaim` — so no PENDING claim ever goes invisible. Then the
gated prod steps (Neon rotation, prod backfill, Brian's real send) on explicit operator go.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0437.md`
- Carryover: SESSION_0437 landed E0 P0–P4 (unified `PassportClaimRequest`, `finalizePassportClaim`,
  email auto-approve, prodsnap backfill no-op) + admin set-placeholder-avatar (TASK_0A), committed
  (`1d3a836e`, `9a5843b1`) but NOT pushed. This session executes P5 then the gated prod steps.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (one staged-doc edit on SESSION_0437.md — the +22-line "Next session" block)
- Current HEAD at bow-in: `9a5843b1`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma, auth |
| Extension or replacement | Extension: claim is BBL-custom domain logic over the Better-Auth/Prisma baseline |
| Why justified | No Dirstarter capability replaced — the repoint retires a bespoke legacy table's writer/readers |
| Risk if bypassed | The coupling trap: converting the writer without the queue makes PENDING claims invisible to admins |

### Grill outcome

2 forks resolved (Petey grill, this session):

- **`/admin/claims` PERSON rows:** **(A) org-only** — `findPendingProfileClaims` filters to
  `subjectType=ORGANIZATION`; the unified lineage queue (`findPendingClaims` → `reviewPassportClaim`)
  is the sole person-review surface (ADR 0036 "one queue"). `findProfileClaimById` left
  subject-agnostic so a straggler PERSON row can still be opened directly.
- **Build scope:** build P5 now, keep tests green + add coverage, browser-verify both queues, then
  HOLD push (operator's "show before push" rule). Prod steps stay gated.

### Drift logged

- **D-031 (this session, fixed):** `server/admin/claims/claim-queries.ts` `profileClaimSelect`
  selected `directoryProfile.user.*`, but Phase 3c (SESSION_0392) dropped `DirectoryProfile.user`
  (Passport is the identity root). `findPendingProfileClaims` had been 500ing on every render since
  then — latent because the page wasn't exercised. Surfaced when P5's org-only filter exercised it;
  fixed in-place (`user.passport` → `passport`) since the file was already being edited.

## Petey plan

### Goal

Retire the legacy person-claim writer + readers onto `PassportClaimRequest` in one coupled change.

### Tasks

#### SESSION_0438_TASK_01 — P5 writer + queue + UI repoint

- **Agent:** Cody (inline)
- **What:** Convert lead-claim writer → `submitPassportClaim`; repoint admin + manager queues and
  detail pages to `PassportClaimRequest` / `reviewPassportClaim`; org-only `/admin/claims`.
- **Done means:** both CTAs' person path writes `PassportClaimRequest`; both queues read it; tests
  green + new coverage; both queues browser-verified; HOLD push.
- **Depends on:** SESSION_0437 P0–P4 (landed)

### Open decisions

- Prod backfill run + Neon rotation + Brian's real send: gated on explicit operator go.

### Scope guard

- Do NOT drop the legacy `LineageClaimRequest` table this session (`applyLineageClaimReview` stays for
  stragglers until a later migration).
- Do NOT run the prod backfill or send Brian's invite without explicit operator go.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0438_TASK_01 | landed | P5 writer→`submitPassportClaim` + admin/manager queues+detail→`PassportClaimRequest`/`reviewPassportClaim` + org-only `/admin/claims` + D-031 fix; 169 tests pass; typecheck+oxfmt clean; both queues browser-verified (0 console errors) |

## What landed

- **Writer:** `server/web/lead/public-actions.ts` "Join the Legacy" signed-in claim path now resolves
  the node's `passportId` and calls `submitPassportClaim` (the last `LineageClaimRequest.create` is
  gone). Its identity guards throw on already-claimed / duplicate — caught and treated as the prior
  benign silent-skip (`claimCreated=false`).
- **Admin query:** `server/admin/lineage/claim-queries.ts` `findPendingClaims`/`findClaimById` read
  `PassportClaimRequest`, brand-scoped directly off the claim, `passport.displayName`, node/tree
  **optional** — directory-only person claims now surface (the un-stub win).
- **UI:** admin + manager claim list + detail pages (`app/admin/lineage/claims/*`,
  `app/app/lineage/claims/*`) show the Passport name + a "Directory profile (no tree)" affordance;
  `claim-status-actions.tsx` review buttons wired to `reviewPassportClaim`.
- **Org-only:** `server/admin/claims/claim-queries.ts` `findPendingProfileClaims` filters to
  `ORGANIZATION`; **+ D-031 fix** (`directoryProfile.user` → `passport`, latent Phase-3c 500).
- **Tests:** updated `public-actions.safe-action.test.ts` (signed-in claim → `PassportClaimRequest`
  + cleanup); new `server/admin/lineage/claim-queries.test.ts` (node-less directory claim surfaces).
- **`applyLineageClaimReview`** retained for legacy stragglers (table drop deferred).

## Fallow health (SESSION_0438)

Repo-wide: **health 62 C** · maintainability 89.6 (good) · duplication 17.0% · dead files 7.0% ·
dead exports 9.8% · avg cyclomatic 2.2. (The low grade is dominated by pre-existing mass, not P5.)

**P5 diff is clean.** Audit `--changed-since HEAD` findings traced to inherited code, not the repoint:

- **Fixed (introduced/in-file):** pruned 3 unused type exports (`PendingClaim`, `PendingProfileClaim`,
  `ProfileClaimDetail`) → dead-code findings on changed files **3 → 0**. + the D-031 stale-select 500 fix.
- **Inherited — flagged, NOT touched in P5:**
  - **Dead `app/admin/*` route forest (dominant duplication source):** `config/app-redirects.ts`
    308-redirects every `/admin/<seg>(/*)` → `/app/<seg>`, so ~13 admin route segments are unreachable
    duplicates of the live `app/app/*` pages (fallow's 60–69-line claim clone groups are these). NOT
    safely deletable piecemeal: 10+ live `/app` pages import shared `_components` cross-tree from
    `~/app/admin/`, and typedRoutes ties dead `<Link href="/admin/...">` refs to route existence →
    **wholesale relocate-then-delete job, spawned as its own task** (`task_a58dbd3f`).
  - `createJoinLegacyInterest` CRITICAL (75 cyclomatic / 350 LOC / CRAP 94) — pre-existing monster
    action; P5 added ~15 lines (the claim try/catch). Optional follow-up: extract the `after()`
    email-dispatch block into a helper (test-covered by the 7-case writer suite) to clear the flag.

## Open decisions / blockers

- **Gated prod steps (operator go required):** (1) rotate prod Neon password; (2) run
  `scripts/backfill-passport-claims.ts` against **prod** Neon (Tony Hua's APPROVED + Brian's state
  live only in prod); (3) send Brian Truelson's real claim invite (2nd touch — holding note sent
  SESSION_0436).
- **Legacy `LineageClaimRequest` table drop:** deferred to a later migration once stragglers clear.
- **Kanban `BoardStore`** + **TASK_0B broad-authz cloud spec:** still deferred.
- **TASK_0A avatar surface** (`/admin/lineage/[treeId]`) browser-verify: still pending.

## Next session

### Goal

Execute the gated prod cutover for the unified claim: rotate prod Neon → run the prod backfill →
send Brian Truelson's real claim invite. Then (separately) drop the legacy `LineageClaimRequest`
table once stragglers clear, and optionally take the queued health lanes.

### Bow-in prompt (paste-ready — files pre-resolved, no Graphify needed)

> Act as Petey. SESSION_0438 landed E0 **P5** (the legacy `LineageClaimRequest` writer + admin/manager
> queues retired onto `PassportClaimRequest` / `reviewPassportClaim`), fixed a latent Phase-3c 500
> (D-031), pruned dead types, and extracted `dispatchJoinLegacyNotifications`. Committed (`10be5cdc`)
> but **push HELD** — push it FIRST this session, ideally paired with Step 2 (prod backfill) so the prod
> deploy + data migration land together (no orphaned PENDING claims). 169 claim/script tests green;
> typecheck + oxfmt clean; both queues browser-verified. **This session = the gated PROD cutover, in
> strict order, each on explicit operator go.**
>
> **Step 1 — Rotate prod Neon password (carryover since SESSION_0436).**
> Neon console → reset role password; update Vercel prod env `DATABASE_URL` + `DIRECT_DATABASE_URL`
> (Project Settings → Environment Variables, **Production**, mark Sensitive). Verify with a
> `vercel env pull` round-trip or a read-only prod query. Ref: `docs/runbooks/database/`,
> `docs/runbooks/dev-environment/dev-environment.md`. ⚠ Vercel **Sensitive** vars pull empty (D-024
> gotcha — set, don't read).
>
> **Step 2 — Run the prod backfill (the REAL migration; prodsnap was a 0-row no-op).**
> Script: `apps/web/scripts/backfill-passport-claims.ts` (idempotent, BBL-scoped; idempotency test
> `apps/web/scripts/backfill-passport-claims.test.ts`). Point `DATABASE_URL` at **prod Neon** and run
> via `bun run apps/web/scripts/backfill-passport-claims.ts`. **Tony Hua's APPROVED `LineageClaimRequest`
> + Brian's pending state live ONLY in prod** — confirm post-run: Tony Hua present + APPROVED, counts
> match both legacy tables, re-run = no dupes. Legacy table to drain from: `LineageClaimRequest`
> (schema.prisma:2816) + `ProfileClaimRequest` PERSON rows.
>
> **Step 3 — Send Brian Truelson's real claim invite (2nd touch; holding note already sent
> SESSION_0436 via Resend `681a8d65…`).** Send scripts live in `apps/web/scripts/`:
> `send-bbl-truelson-holding.ts` (already run), `send-bbl-truelson-thankyou.ts`,
> `send-bbl-claim-emails.ts` (batch), `send-founder-long-road-real.ts`. The claim-invite primitive is
> `apps/web/server/web/lineage/mint-claim-magic-link.ts` + `notifyMemberOfBblClaimYourProfile` in
> `apps/web/lib/notifications.ts`. ⚠ `bun test`/scripts fire LIVE Resend sends (project gotcha) — run
> the real send deliberately, dry-run first if a flag exists.
>
> **Step 4 (separate, after cutover settles) — drop legacy `LineageClaimRequest`.** Only after Step 2
> confirms migration + no straggler PENDING rows. `applyLineageClaimReview`
> (`apps/web/server/admin/lineage/claim-review-actions.ts:145`, the retained legacy `.update`) and the
> `lineageClaimRequest`/`lineageClaimEvidence` models go in the SAME migration. Grep
> `lineageClaimRequest` / `lineageClaimEvidence` for residual readers before dropping.
>
> **Queued health/cleanup lanes (operator-gated, NOT auto):**
> - **Dead `app/admin/*` route forest** — spawned task `task_a58dbd3f` (see SESSION_0438 Fallow
>   health). Wholesale relocate-shared-`_components`-then-delete; own worktree.
> - **Rip out residual `BrandSettings` + brand machinery** — spawned task `task_eea99601` (single-brand
>   simplification per ADR 0034). Remove the DB-driven `BrandSettings` model + admin CRUD
>   (`server/admin/brand-settings/*`, `/app/brand-settings`) + the `lib/brand-theme.ts` runtime CSS
>   injection + `scripts/seed-brand-settings.ts`; fold BBL colors into static `app/styles.css` (already
>   the de-facto source — prod's `BrandSettings` table is EMPTY). Found via the "yellow came back" report
>   (it was a stale LOCAL `accentColor` row, fixed locally; prod has 0 rows). KEEP per-Organization
>   theming (different feature). Pairs with the dead-admin-forest task (the brand-settings admin page is
>   in that tree). Own worktree.
> - **`createJoinLegacyInterest` still CRITICAL** (cyclomatic 75, `apps/web/server/web/lead/public-actions.ts:264`)
>   — the SESSION_0438 email-dispatch extraction cut LOC/cognitive but not cyclomatic (dominated by the
>   inline `notes`/`meta` optional-field assembly, ~29 `??`/ternary branches). To clear: extract
>   `buildJoinLegacyLeadData(parsedInput)` (notes + claimEvidence + lead `meta`). Test-covered by the
>   7-case `public-actions.safe-action.test.ts`.
> - **TASK_0A avatar surface** browser-verify at `/app/lineage/[treeId]` (redirected from
>   `/admin/lineage/[treeId]`) — `setPassportAvatarAsAdmin` + cropper.
> - **Kanban `BoardStore`** (E0 visual hub) — still deferred.
>
> Dev DB = `ronindojo_prodsnap` (real BBL roster). Dev login: `GET /api/auth/dev-login` (admin
> `DEV_LOGIN_USER_ID=KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T` = mrbscott@gmail.com). Dev server:
> `cd apps/web && npx next dev --turbo` (FS-0002). `fallow` at repo-root `node_modules/.bin/fallow`;
> `psql` at `/Applications/Postgres.app/Contents/Versions/14/bin/psql`.

### First task

`SESSION_0439_TASK_01` — on operator go: Step 1 (rotate prod Neon) → Step 2 (prod backfill, verify
Tony Hua APPROVED survives + idempotent) → Step 3 (Brian's claim invite). Hold between each step.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/lead/public-actions.ts` | Lead-claim writer → `submitPassportClaim` (resolve `node.passportId`, catch benign guard errors); extracted `dispatchJoinLegacyNotifications` helper |
| `apps/web/server/admin/lineage/claim-queries.ts` | `findPendingClaims`/`findClaimById` → `passportClaimRequest`; `passport.displayName`; node/tree optional; pruned unused `PendingClaim` type |
| `apps/web/app/admin/lineage/claims/page.tsx` · `[id]/page.tsx` | `passport.displayName` + optional-tree guard |
| `apps/web/app/admin/lineage/claims/[id]/_components/claim-status-actions.tsx` | `reviewLineageClaim` → `reviewPassportClaim` |
| `apps/web/app/app/lineage/claims/page.tsx` · `[id]/page.tsx` | same repoint (manager view) |
| `apps/web/server/admin/claims/claim-queries.ts` | `findPendingProfileClaims` → ORGANIZATION-only; **D-031 fix** (`directoryProfile.user` → `passport`); pruned 2 unused types |
| `apps/web/server/web/lead/public-actions.safe-action.test.ts` | signed-in claim asserts `passportClaimRequest` + cleanup |
| `apps/web/server/admin/lineage/claim-queries.test.ts` | **new** — node-less directory claim surfaces in the queue |
| docs (9) | claim wiring SOP, lineage + directory hubs, ADR 0036 (P5 landed) + 0023 (superseded note), ubiquitous-language, repo-truth-index, drift-register (D-031), claim-workflow spec, wiki index |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | green |
| `bun test` (claims + admin + lineage + lead + scripts) | **169 pass / 0 fail** |
| `oxfmt --check` (touched) | clean |
| `bun run wiki:lint` | 0 errors, 15 warnings (all pre-existing, untouched files) |
| Browser — `/app/lineage/claims` list + `/app/lineage/claims/[id]` detail | both seeded claims (node-backed + directory-only) render; review buttons wired to `reviewPassportClaim`; 0 console errors |
| Browser — `/app/claims` (org-only) | renders clean after D-031 fix (was 500ing) |
| `fallow audit --changed-since HEAD` | dead-code 3 → 0; remaining findings inherited (dead admin forest + pre-existing `createJoinLegacyInterest`) |

## Decisions resolved

- `/admin/claims` is **organization-only** post-P5; the unified `PassportClaimRequest` queue is the sole person-review surface (operator pick A).
- Build P5 now, browser-verify, **hold push** for operator go (operator pick).
- Email-dispatch extraction done (option A); did not clear the `createJoinLegacyInterest` CRITICAL (inherited field-mapping complexity) → deferred to the refactor lane.

## Reflections

- The coupling trap was the whole risk surface, and reading **writer + both queues together before editing** is what made it a safe single change. Tooling the `submitPassportClaim`/`reviewPassportClaim` shapes first meant the repoint was mechanical.
- The biggest finding was incidental: org-only filtering *exercised* `/app/claims` and exposed a **Phase-3c latent 500 (D-031)** that had been dormant since SESSION_0392. Lesson — a query that's never rendered is never validated; selecting a removed relation passes typecheck (Prisma select is `any`-ish at the call site) and only fails at runtime.
- fallow "findings on changed files" needed triage, not reflexive fixing: the clones were a **dead `app/admin/*` route forest** (308-redirected), not a missing shared component — and the typedRoutes + cross-tree `_components` entanglement made it wholesale-only. Deleting dead routes ≠ a P5 add-on.
- The email-dispatch extraction taught a complexity-metric lesson: moving branches out of a **nested `after()` arrow** doesn't lower the *parent's* cyclomatic (the arrow was scored separately). The parent's 75 is the inline `notes`/`meta` optional-field soup.

## Review log

### SESSION_0438_REVIEW_01 — P5 coupled repoint

- **Reviewed tasks:** SESSION_0438_TASK_01
- **Dirstarter docs check:** not applicable — claim is bespoke BBL domain logic over the Prisma/auth baseline (no baseline capability replaced).
- **Verdict:** The coupled writer+queue migration is correct and complete; the identity-keyed guards subsume the door-keyed ones, directory-only claims now surface + finalize for real, and both live queues are browser-verified with zero console errors. Test coverage added for the new-surface case. The one residual (`createJoinLegacyInterest` CRITICAL) is pre-existing and explicitly deferred with a concrete extraction recipe.
- **Score:** 9/10 (−1: the email-dispatch extraction didn't clear the CRITICAL it targeted; honestly reported).
- **Follow-up:** gated prod cutover (SESSION_0439); dead-admin-forest task `task_a58dbd3f`.

## Hostile close review

- **Giddy:** pass — SESSION file has Task log + verification table; 169 tests green is real (ran + pasted); D-031 fix browser-verified, not asserted.
- **Doug:** pass — no security/data-integrity regression: identity guards strengthened (refuse claim on already-attached Passport); `applyLineageClaimReview` retained for legacy stragglers; no prod mutation (all prod steps gated); seed cleaned up (prodsnap back to 0 claims).
- **Desi:** pass — claim queue + detail render correctly with the optional-tree affordance; no UI regression (browser-verified).
- **Kaizen aggregate:** 9/10 — one honestly-reported miss (extraction didn't clear the flag); everything else green and verified.

## ADR / ubiquitous-language check

- ADR update **done** — ADR 0036 status marked implemented-through-P5; ADR 0023 marked superseded-for-person-claims. No new ADR needed (P5 executes ADR 0036's ratified decision).
- Ubiquitous language **updated** — added `PassportClaimRequest` term; marked `LineageClaimRequest` retired; narrowed `ProfileClaimRequest` to org-only.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | 9 touched docs bumped `updated: 2026-06-23` + `last_agent: claude-session-0438`; wiki index `updated` bumped |
| Backlinks/index sweep | wiki index gained SESSION_0437 + 0438 rows (were missing); ADR 0036↔0023 already cross-linked |
| Wiki lint | `bun run wiki:lint` → 0 errors, 15 warnings — all in untouched files (SESSION_VIDEO_R001, petey-plan-0436), pre-existing |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0438_REVIEW_01 + Giddy/Doug/Desi pass |
| Review & Recommend | Next session goal written (gated prod cutover) with file-resolved bow-in prompt |
| Memory sweep | updated `claim-unification-adr-0036` memory (P5 done); see bow-out response |
| Next session unblock check | BLOCKED ON USER — every SESSION_0439 step is operator-gated (Neon rotation / prod backfill / Brian send) |
| Git hygiene | `main`; single commit `10be5cdc`; **push HELD on operator go** — deploy P5 paired with the SESSION_0439 prod backfill (no orphaned prod PENDING claims) |
| Graphify update | reported at bow-out (run before the close commit) |
