---
title: "SESSION 0696 — WL-P2-13 org-claim CTA gap: verify-first close + the org-claim-loop e2e smoke (auto lane)"
slug: session-0696
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-25
last_agent: claude-session-0696
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0696 — WL-P2-13 org-claim CTA gap (auto lane, overnight-orchestrator run)

> Overnight lane. Worktree `/Users/brianscott/dev/ronin-0696`, branch
> `auto/session-0696-wl13-org-claim-cta`. Target: WL-P2-13 — the org-claim CTA gap
> (BBL claim loop = the north star).

## Date

2026-07-24 → 2026-07-25 (overnight)

## Goal

Close WL-P2-13: (a) "Claim this organization" CTA for owner-less orgs on the public org/school
lenses wired into the ONE claim system (ADR 0036), (b) the Playwright smoke proving the full loop
(teaser → claim → admin approve → org `ownerId` set), (c) person placeholder→account merge
(optional).

## Verify-first findings (the row is stale)

The WL-P2-13 row dates from SESSION_0354; **part (a) was already built by SESSION_0355**
(commit `0cae6acf`) and verified present in this lane:

- `components/web/claims/org-claim-cta.tsx` — the CTA card. Renders ONLY when
  `Organization.ownerId` is null; funnel-first for signed-out visitors
  (`Sign in to claim` → `/auth/login?next=<returnPath>`); signed-in renders
  `ProfileClaimForm`.
- Wired on BOTH public lenses: `app/(web)/organizations/[slug]/_components/organization-detail/index.tsx`
  (`{!org.ownerId && <OrgClaimCta …/>}`) and
  `app/(web)/schools/[slug]/_components/school-detail/index.tsx` (`{isUnclaimed && …}`).
- The claim path is the existing generic system, no parallel path: `ProfileClaimForm` →
  `submitProfileClaimRequest` (`server/web/claims/claim-actions.ts`). Org claims stay in
  `ProfileClaimRequest` per ADR 0036 §5 (an org is not a Passport; the PERSON branch delegates to
  the unified `submitPassportClaim` core). Server guards: owner-less precondition, brand scope,
  per-claimant dedup.
- Admin approve: `/app/claims` (AdminCollection queue) → `/app/claims/[id]` →
  `reviewProfileClaim` (`server/admin/claims/claim-review-actions.ts`) sets
  `organization.ownerId = claimantUserId` when still owner-less (`ownershipGranted`).
- Directory surface: not applicable for the org CTA — `/directory` is the person lens
  (placeholder persons already get the person teaser); orgs get the CTA on both org lenses.

**The actual remaining gap was part (b): zero e2e coverage of the loop**
(`grep -rln "OrgClaim\|submitProfileClaimRequest" apps/web/e2e` → no matches). That is what this
lane built.

## What landed

1. `apps/web/e2e/claims/org-claim-loop.spec.ts` — the WL-P2-13 smoke, driving the REAL surfaces:
   1. Signed-out teaser on `/organizations/[slug]` AND `/schools/[slug]` (one DOJO org serves
      both lenses) + the funnel-first `Sign in to claim` door (`href` → `/auth/login?next=`).
   2. Claimant signs in (session-cookie helper) → submits the claim form (relationship
      "I own / run this") → success toast; DB probe: claim `PENDING`, `ownerId` still null.
   3. Admin drives the real `/app/claims` queue → row link → `[id]` detail → Approve →
      "Approved — ownership granted to the claimant."
   4. DB truth: claim `APPROVED`, `Organization.ownerId` = claimant.
   5. Fresh signed-out visitor: CTA no longer renders.
2. `apps/web/e2e/helpers/org-claim.ts` + `org-claim-db.ts` — read-only DB state probe
   (claim status + org ownerId) on the established Bun CLI-bridge pattern (auth-db /
   seed-belt-review-db). Seeding reuses the existing shared fixtures (`createTestUser`,
   `createTestOrg` — FS-0031 seed-independent, test-unique slugs, org-first teardown because
   `ProfileClaimRequest` cascades from org AND claimant).

Auth note: the ledger's fix line said "dev-login Playwright smoke". The repo's canonical
Playwright auth is the session-cookie helper (`e2e/helpers/auth.ts`) — every existing spec uses
it; `GET /api/auth/dev-login` + `DEV_LOGIN_USER_ID` pins ONE user per server boot, while this
loop needs TWO actors (claimant + admin). The smoke uses the canonical helper; the dev-login
route remains the hand-driven-browser tool.

## Files touched

- `apps/web/e2e/claims/org-claim-loop.spec.ts` (new)
- `apps/web/e2e/helpers/org-claim.ts` (new)
- `apps/web/e2e/helpers/org-claim-db.ts` (new)
- `docs/sprints/SESSION_0696.md` (this file)

## Verification

All gates run in the lane worktree with REAL exit codes (no piping):

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `bun run typecheck` (apps/web) | exit 0 |
| Lint | `bun run lint:check` (oxlint, read-only) | exit 0 — no findings in the new files |
| Unit (scoped) | `bun test --parallel=1 server/web/claims server/admin/claims` | exit 0 — 48 pass / 0 fail (7.4s) |
| e2e DB | `bun run e2e:db:setup` (hermetic `ronindojo_e2e`, FS-0031) | exit 0 — 3 new migrations applied |
| e2e | `PW_BASE_URL=http://localhost:3196 bun run test:e2e:local -- claims/org-claim-loop --project=chromium` | exit 0 — **1 passed (3.0m)**, first run |

- The e2e dev server ran in THIS worktree on port 3196 (`npx next dev --turbo -p 3196`, FS-0002)
  with `.env.e2e` sourced as real env (canonical's :3000 server reads prodsnap — wrong DB).
- Flake note: an initial scoped unit run during the cold Turbopack compile + tsc showed 7
  P2028 transaction-timeout fails, a second showed 1 hook timeout — different failures each
  run, zero app-code in this diff; the quiet-machine run is clean (48/0). Pure DB/CPU
  contention, not a regression.

## Proposed ledger edits

**wiring-ledger.md — WL-P2-13 update row (draft; merge owner applies):**

> WL-P2-13 | status → **Wired (a, b) / remaining (c)** | (a) the owner-less-org claim CTA shipped
> SESSION_0355 (`org-claim-cta.tsx`, both org+school lenses, funnel-first sign-in, ADR 0036 ONE
> claim system — verified SESSION_0696); (b) e2e smoke landed SESSION_0696
> (`e2e/claims/org-claim-loop.spec.ts`: teaser → claim → admin approve → `ownerId` set → CTA
> gone, + DB probes via `e2e/helpers/org-claim*`), run green locally against the hermetic
> `ronindojo_e2e` DB (1 passed, chromium); (c) person placeholder→account merge remains a
> deliberate manual admin step (`reviewProfileClaim` flags `personMergePending`) — automation
> still open, reuse the lineage placeholder-transfer logic when picked up.

## Open decisions / blockers

- Person placeholder→account merge (part c) intentionally skipped — not trivial (identity
  operation; the review action deliberately flags rather than fakes it). Remaining scope.
- None blocking.

## Residual for AM merge

- Apply the WL-P2-13 ledger update row above (shared ledgers are lane-forbidden).
- e2e ran green in-lane (see Verification); CI runs the suite authoritatively on the PR.
