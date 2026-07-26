---
title: "SESSION 0404 — BBL go-live epic reconciliation + merge-to-main strategy"
slug: session-0404
type: session--coordinate
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0404
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0402.md
  - docs/sprints/SESSION_0403.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0404 — BBL go-live epic reconciliation + merge-to-main strategy

> **Coordination/bow-out session.** No new feature code. This record reconciles the BBL go-live epic, which
> fragmented across 13 PRs and two lane-local SESSION records (0402, 0403) that never reached `main`, and fixes
> the **merge-to-main order** so the morning batch is mechanical. Two hot fixes landed directly on `main` this
> session (countdown gate + a BBL-landing 500 fix); they are recorded here because they bypassed the PR lanes.

## Date

2026-06-17

## Operator

Brian + claude-session-0404

## Goal

The operator asked to "bow out and reconcile the SESSION_0403 records across these lanes" and to "get the merge
to main strategy figured out." The BBL go-live epic was built as many parallel branches (Track B) plus a
separate two-repo cloud session (Track A), with the per-lane SESSION records (`SESSION_0402` Stripe,
`SESSION_0403` comp/email/join) living only on their own branches as `in-progress`. This session produces the
**one authoritative cross-lane index + merge order** on `main`, and records the two direct-to-`main` hot fixes.

## Status

Single source of truth is the frontmatter `status:` field.

## Update — merge batch executed (operator go-ahead)

The operator authorised landing the **whole** batch to `main` now ("get everything to main") — safe because DNS
is unflipped and the countdown gate (`BBL_COUNTDOWN=1`) keeps prod BBL on the timer regardless of what's merged;
the missing webhook only gates the *reveal*, not the merge. All 11 feature PRs were merged into `main` with
`--no-ff` in the planned order (#75 → #76 → #87 → #84 → #79 → #78 → #83 → #80 → #81 → #82 → #77).

**Two session-number collisions surfaced during the merge and were resolved by renumbering** (parallel branches
each minted the next number off the same base):

- The explorer-mobile branch's `SESSION_0401` (mobile UX) collided with `main`'s `SESSION_0401` (the fields-fold
  from PR #74). Kept the fields-fold as 0401; **renumbered the explorer record to `SESSION_0405`**.
- The pricing-seed branch's `SESSION_0403` (pricing + profile import) collided with #77's `SESSION_0403`
  (comp/email/join). Kept comp/email/join as the canonical 0403 (as this doc names it); **renumbered the
  pricing/import record to `SESSION_0406`**.

`env.ts` / `.env.example` conflicts were the only code conflicts — all additive unions (countdown + `STRIPE_*_BBL`
+ `S3_*_BBL` coexist). Lane records 0402/0403/0406 flipped `in-progress` → `closed`; index rows added for all.

**Gates on the integrated tree:** `db:generate` OK, `tsc --noEmit` 0, `oxlint` clean, `oxfmt --check` clean,
`wiki:lint` 0 (691 files), pure unit tests 14/0. The Stripe webhook route test fails **only** on `P1001`
(no Postgres in the sandbox) — environmental, CI-gated, not a refactor regression.

**Still pending (operator/CI):** close #85 (countdown already on `main`) + the deduped comp PR #86; CI on the
`main` push; the cutover gating below (env vars → BBL Stripe rehearsal → imports → DNS flip → countdown off).

## What landed directly on `main` this session

Per the operator's standing instruction ("only the countdown to `main` for now, not the feature PRs"), only two
commits hit `main` — both safe under the active countdown gate:

| Commit | What | Why direct-to-main |
| --- | --- | --- |
| `1f3fc3c` | `feat(bbl): env-gated pre-launch countdown holding page` | Operator needs to flip DNS **now** and show a countdown until the webhook arrives tomorrow. Gated by `BBL_COUNTDOWN` so it's inert for Baseline. **Supersedes PR #85** (same change on a branch) → close #85. |
| `4280efe` | `fix(bbl): use Passport relation in promotion marquee query` | Production 500 on the BBL landing: `getPromotionMarqueeRows` selected `RankAward.user`, dropped in SESSION_0392 (Phase 3c) — the earner is now the **Passport**. Re-routed name/photo through `passport` (displayName/avatarUrl) with account fallback (also covers accountless placeholder Passports). |

Both verified: `tsc --noEmit` 0, `oxlint` 0, `oxfmt --check` clean. The countdown being on (`BBL_COUNTDOWN=1`)
means prod BBL renders the timer, not the landing — so the fix sits staged-and-safe for the reveal.

## Epic lane map (the fragmentation being reconciled)

The BBL go-live epic = the operator's "ASAP but fully working" cutover. **Track A** (pricing tiers from the
monorepo + WordPress profile/media import) ran as a separate two-repo cloud session — out of this repo's GitHub
scope. **Track B** (baseline-only) is the PR set below. All are **draft**.

| PR | Title | Head branch | Base | Stacked? | Lane record |
| --- | --- | --- | --- | --- | --- |
| #75 | mobile UX overhaul of cinematic explorer | `claude/cinematic-explorer-mobile-y5kplx` | main | — | SESSION_0401 |
| #76 | per-brand Stripe account seam (ADR 0030) | `claude/bbl-stripe-separate-account` | main | — | SESSION_0402 |
| #87 | per-brand checkout origin via request host | `claude/bbl-request-origin` | **#76** | on #76 | SESSION_0402 |
| #77 | auto-comp Elite on BBL claim (comp gift epic) | `claude/bbl-claim-comp-email-epic` | main | — | SESSION_0403 |
| #86 | auto-comp Dirty Dozen lifetime ELITE on claim | `claude/bbl-dirty-dozen-comp-autowire` | main | — | **dup of #77** |
| #78 | BBL-branded email layout + claim-your-profile | `claude/bbl-branded-emails` | main | — | SESSION_0403 |
| #83 | bulk "claim your profile" email send | `claude/bbl-claim-send` | **#78** | on #78 | SESSION_0403 |
| #80 | rebuild `/lineage/join` as features landing + modal | `claude/bbl-join-landing` | main | — | SESSION_0403 |
| #81 | BBL lineage-membership pricing seed | `claude/bbl-lineage-pricing-seed` | main | — | SESSION_0402 (TASK_05) |
| #82 | import Dirty Dozen profiles as placeholder Passports | `claude/bbl-lineage-profile-import` | main | — | Track A bridge |
| #84 | per-brand media bucket (own R2) | `claude/bbl-per-brand-media` | main | — | SESSION_0403 |
| #79 | bulk WordPress→S3 profile image import | `claude/bbl-wp-media-import` | **#84** | on #84 | SESSION_0403 |
| #85 | launch countdown / coming-soon gate | `claude/bbl-launch-countdown` | main | — | **superseded by `1f3fc3c`** |

## Merge-to-main strategy

> Nothing below is merged yet — this is the **plan** for the morning batch once the webhook arrives and CI is
> green on each PR. The countdown stays **on** (`BBL_COUNTDOWN=1`) through the whole batch; flip it **off** only
> after the batch lands, the BBL Stripe rehearsal passes, and the operator is ready to reveal.

### Step 0 — housekeeping before merging

- **Close #85** — the countdown already lives on `main` (`1f3fc3c`). Merging it would conflict on `env.ts` for
  zero gain.
- **Dedupe the comp lane: #77 vs #86.** Both wire auto-comp on claim approval to `claim-review-actions.ts` and
  will conflict. **Recommend keeping #77** (the fuller SESSION_0403 lane: Dirty Dozen → lifetime *and*
  everyone-else → +365d, shared `DIRTY_DOZEN_LABEL`, unit-tested) and **closing #86** (the narrower
  lifetime-only re-cut). Operator to confirm — this is the one open decision in the merge plan.

### Step 1 — independent PRs (base `main`), merge in this order

CI green is the gate for each. Order chosen so foundational seams land before consumers and to minimise
`env.ts` conflict churn:

1. **#75** mobile explorer — unblocks the DNS re-flip (SESSION_0388 rolled back over mobile UI); no BBL coupling.
2. **#76** Stripe seam — foundational; adds `STRIPE_*_BBL` to `env.ts`. **Hard gate: BBL-account test-mode
   rehearsal** (`stripe listen --forward-to .../api/stripe/webhooks/bbl` → grant+revoke) before merge.
3. **#84** per-brand media (R2) — adds `S3_*_BBL` to `env.ts`; base for #79.
4. **#78** branded emails — base for #83.
5. **#80** join landing — decoupled from empty pricing state, so it can land before #81.
6. **#81** pricing seed — needs operator's BBL price IDs + amounts (Track A handback).
7. **#82** placeholder-Passport import — Track A bridge; run the import script, don't just merge code.
8. **#77** comp lane (after #86 closed).

### Step 2 — stacked PRs, retarget to `main` then merge

After each base merges, retarget the child to `main` (the PR body already flags this), re-run CI, merge:

- **#87** (was on #76) → retarget to `main` after #76. Both touch `billing/actions.ts`; respecting order avoids
  the conflict.
- **#79** (was on #84) → retarget to `main` after #84.
- **#83** (was on #78) → retarget to `main` after #78. This is the *bulk send* — run it only after the import
  (#82) has created the recipient Passports and the recipients manifest is ready.

### Expected conflicts (all additive — resolve by keeping both sides)

- **`apps/web/env.ts`** — touched by #76 (`STRIPE_*_BBL`), #84 (`S3_*_BBL`), and already on `main`
  (`BBL_COUNTDOWN`, `NEXT_PUBLIC_BBL_LAUNCH_AT`). Each adds distinct keys; union them.
- **`apps/web/server/web/billing/actions.ts`** — #76 + #87 (ordered, so clean if #76 first).
- **`apps/web/server/admin/lineage/claim-review-actions.ts`** — #77 + #86 (resolved by closing one).
- **`docs/knowledge/wiki/index.md`** / SESSION files — trivial table-row unions.

### Cutover gating (from CUTOVER_CHECKLIST)

The DNS flip and countdown-off are **downstream of the merge batch**, not part of it:

1. Merge batch green on `main` → Vercel prod build deploys (countdown still on).
2. Operator sets BBL Vercel env: `STRIPE_SECRET_KEY_BBL`, `STRIPE_WEBHOOK_SECRET_BBL`, `RESEND_API_KEY`,
   `RESEND_SENDER_EMAIL_BBL`, `S3_*_BBL` (R2), `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_SITE_EMAIL` (BBL origin).
3. BBL-account Stripe test-mode rehearsal passes (`/api/stripe/webhooks/bbl` grant+revoke).
4. Run #82 import + #79 media import (`--brand BBL` → R2) + #83 bulk claim email.
5. DNS re-flip at Bluehost (apex `A` → `216.150.1.1`, `www` CNAME → Vercel) — **SSL note:** Let's Encrypt issues
   ~30s after Vercel shows "Valid Configuration"; pre-warm by attaching/verifying the domain before the flip.
6. Flip `BBL_COUNTDOWN` off (or unset) + redeploy → the real BBL app reveals.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0404_TASK_01 | landed | BBL-landing 500 fix (`RankAward.user` → `passport`) committed direct to `main` (`4280efe`). |
| SESSION_0404_TASK_02 | landed | Reconciled the epic into one cross-lane index + merge order (this record); recorded the direct-to-main countdown + fix. |

## Decisions resolved

- **Only the countdown + the 500 fix go to `main` now**; the 13 feature PRs are the morning batch (operator).
- **#85 is superseded** by the countdown on `main` → close it.
- **Merge order fixed** (independent → stacked-retargeted), with `env.ts` as the known union-conflict file.

## Open decisions / blockers

- **#77 vs #86 comp dedupe** — recommend keep #77, close #86. **Needs operator confirm** before the comp lane
  merges.
- **#81 pricing seed** blocked on operator's BBL price IDs + amounts (Track A handback).
- **BBL-account Stripe rehearsal** is a hard gate before #76 merges and before the flip.
- **Webhook** from the other developer arrives tomorrow — the reveal (countdown-off) waits on it.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/(home)/bbl/bbl-landing.tsx` | Fix `getPromotionMarqueeRows` to select `passport` (was removed `RankAward.user`). |
| `docs/sprints/SESSION_0404.md` | **New** — this reconciliation + merge-strategy record. |
| `docs/knowledge/wiki/index.md` | Session-table row for 0404. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` (apps/web, dummy DB env) | PASS — 0 errors. |
| `oxlint` / `oxfmt --check` on `bbl-landing.tsx` | PASS — 0 / clean. |
| `bun run wiki:lint` (root) | _reported at bow-out — see chat._ |
| BBL landing renders (countdown off) | Operator to confirm after `git pull` + `.next` cache clear locally. |

## Next session

### Goal

Execute the morning merge batch per the strategy above once the webhook lands and per-PR CI is green: close
#85 + the deduped comp PR, merge the independent lane, retarget+merge the stacked lane, then drive the cutover
gating (env vars → Stripe rehearsal → imports → DNS flip → countdown off).

### First task

Confirm #77-vs-#86 with the operator, close #85 + the losing comp PR, then merge #75.

## Review log

Reconciliation session. The merge plan references the per-lane task IDs in their own records: SESSION_0402
(`TASK_01..05`, Stripe seam + pricing-seed follow-up) and SESSION_0403 (`TASK_01..04`, comp/email/join). Those
records land on `main` with their PRs (#76/#87 carry 0402; #77 carries 0403); this 0404 record is the
integration index over them and must not duplicate their per-task detail.

## Hostile close review

- **Plan sanity:** merge order respects every stack base (#76→#87, #84→#79, #78→#83) and lands seams before
  consumers. ✅
- **Drift caught:** countdown landed on `main` outside its PR (#85) and the comp lane was built twice (#77/#86)
  — both surfaced and routed to close, not left to collide at merge. ✅
- **Data integrity:** the BBL-landing fix is read-path only (a Prisma `select`); no schema/enum/migration. The
  comp + import lanes that *do* touch data stay gated (rehearsal + operator confirm). ✅
- **Verification honesty:** only static gates run in-sandbox (no DB/browser); the DB-backed claim/comp/import
  paths are explicitly deferred to CI + operator, not claimed as proven. ✅
- **Score cap:** coordination session, no production behaviour change beyond the two recorded `main` commits.

## ADR / ubiquitous-language check

- No new ADR (the epic's decision, ADR 0030, was filed in SESSION_0402). No new domain terms — "Track A/B",
  "comp gift epic", "Dirty Dozen", "countdown gate" all already in use.

## Reflections

- **Fragmentation was the real cost, not the code.** Parallel lanes shipped fast, but two lane-local SESSION
  records never reached `main` and two changes (countdown, fix) bypassed PRs entirely — so the *true* state of
  the epic lived nowhere until this pass. Lesson: when fanning out >3 branches for one epic, keep a single
  integration record on `main` from the start, not at bow-out.
- **Direct-to-main is fine when gated.** The countdown made hot-pushing the 500 fix safe (prod shows the timer,
  not the landing). Without the gate I'd have wanted it on a PR with CI.
- **Stacked PRs need the retarget reminder in the body** — they had it, which is why the merge order is
  mechanical rather than archaeological.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0404 created with full frontmatter (`last_agent: claude-session-0404`, dated 2026-06-17); 0402/0403 left untouched on their branches (they close with their PR merges). |
| Backlinks/index sweep | `pairs_with` → 0402/0403/CUTOVER/ADR-0030; `wiki/index.md` row added (both directions). |
| Wiki lint | `bun run wiki:lint` — result reported in bow-out chat. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | Present (plan sanity / drift / data integrity / verification honesty). |
| Review & Recommend | Next session goal written: yes (execute the merge batch). |
| Memory sweep | Project-scoped fact: BBL countdown gate (`BBL_COUNTDOWN`) is the prod safety net during cutover — keep it ON until reveal. Routed below. |
| Next session unblock check | Partially blocked-on-user (#77-vs-#86 confirm; webhook arrival) — flagged explicitly. |
| Git hygiene | On `main`; single close commit; hash reported at bow-out — see git log. |
| Graphify update | Skipped — Graphify unavailable in this remote container. |
</content>
</invoke>
