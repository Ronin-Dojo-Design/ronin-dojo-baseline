---
title: "SESSION 0407 — BBL go-live execution: prod pricing seed + Dirty Dozen import + apex DNS flip prep"
slug: session-0407
type: session--implement
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0407
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0406.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
  - docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md
  - docs/runbooks/deploy/vercel-domain-setup-runbook.md
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0407 — BBL go-live execution: prod pricing seed + Dirty Dozen import + apex DNS flip prep

## Date

2026-06-17

## Operator

Brian + claude-session-0407

## Goal

Drive the SESSION_0406 "Next session" block — the BBL go-live execution lane — on the operator's machine.
SESSION_0406 landed the two data scripts (`seed-bbl-lineage-pricing.ts`, `import-bbl-lineage-profiles.ts`)
and their specs on `main`. This session: create the live BBL Stripe products on the operator's **platform**
Stripe account (BBL's own account/webhook secret not yet available from the other dev — `getStripeClient(BBL)`
falls back to the platform client when `STRIPE_SECRET_KEY_BBL` is unset), seed the **prod** BBL pricing plans,
import the Dirty Dozen cohort, verify `/lineage/join` + `/directory` on the BBL deployment, then prepare
the apex DNS cutover (flip executed last, gated on a green prod smoke + operator go).

> **Bow-out note:** this Goal describes the *planned* Stripe-first go-live; the session pivoted to **no Stripe
> + a gated countdown cutover** — see `What landed` and `Decisions resolved` for the actual outcome.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0406.md` (closed). Operator flagged we were behind remote —
  **pulled 36 commits** (fast-forward, clean tree) to `680d415`, landing SESSIONs 0399–0406. Both 0406 scripts
  + specs are merged to `main`; its two draft PRs landed.
- Carryover: 0406's "Next session" is operator-machine execution (Stripe products → seed prod → import →
  verify → rehearsal → DNS flip). This session executes it.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `680d415`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Payments/Stripe (L1)** — create products/prices + seed `PricingPlan` rows the existing `findLineageMembershipPlans` + webhook consume. **Hosting/DNS (L1)** — apex cutover at Bluehost → Vercel. **Identity (Passport/Directory/Lineage)** — import writes placeholder Passports through existing models. |
| Extension or replacement | **Extension** — runs the existing seed/import scripts + the documented Bluehost→Vercel domain procedure; no new primitive, no schema/migration. |
| Why justified | The per-brand Stripe seam (PR #76 / ADR 0030) + the scripts (0406) are live but unexercised; the public domain still serves the old WordPress site. This is the data + cutover the launch needs. |
| Risk if bypassed | `/lineage/join` empty on BBL; Dirty Dozen not claimable; `blackbeltlegacy.com` stays on WordPress. |

Live docs checked during planning: CUTOVER_CHECKLIST, BBL_STRIPE_PRODUCTS_SPEC, BBL_LINEAGE_IMPORT_SPEC,
ADR 0030, `services/stripe.ts`, deploy runbooks (vercel-domain-setup, vercel-deploy, deployment,
bbl-production, white-label), dev-environment + local-dev-auth-storage, database/SOP/integrations/
domain-feature runbooks (Explore digests).

### Graphify check

- Graph status: current; stats at bow-in: **12982 nodes, 24810 edges, 1768 communities, 2022 files**.
- Discovery: per operator instruction ("ground in the runbooks first"), read `docs/runbooks/**` directly —
  the lane is cross-area (payments + hosting + identity), so breadth beat narrow noun queries.
- Files selected: deploy runbooks read directly; database/sops/integrations/domain-features digested via
  parallel Explore agents.
- Verification note: read-only recon (`dig`, `curl` via `/usr/bin/curl`) used to establish actual live state.

### Grill outcome (operator-answered)

1. **Session scope = full go-live sequence** (Stripe products → seed → import → verify → rehearsal → flip).
2. **Stripe posture = live mode, flip after prep.** BBL rides the operator's platform Stripe account for now
   (BBL's own account + `STRIPE_WEBHOOK_SECRET_BBL` pending from the other dev). Interim checkout falls back to
   the platform client and the shared `/api/stripe/webhooks` + `STRIPE_WEBHOOK_SECRET` (already proven on the
   BBL brand, SESSION_0369).
3. **Stripe product creation = "I script it (show first)"** — create the 2 products × monthly+annual via the
   Stripe API using the operator's key, printing the exact create calls for approval before running.
4. **Apex flip timing = prep now, flip after prep** — steps 1–4 first; apex flip is the final gated step once
   prod smoke is green and the operator gives the go.
5. **Seed target = orient first** (operator redirected to read the runbooks before choosing local vs prod).
   Grounding done; prod-DB access method is the remaining open decision (see Open decisions).

### Drift logged

- **D-0407-1 (candidate):** memory note "blackbeltlegacy.com attached to Vercel" vs CUTOVER_CHECKLIST item 4
  "pending". Recon shows `www` → Vercel (308→apex) but **apex still on Fastly/WordPress** (`151.101.66.159`,
  `server: Flywheel/5.1.0`). So the public site is still 100% WordPress; only `www` is partially attached. The
  prior flip was attempted + reverted (apex rolled back, `www` left on Vercel). Reconcile at bow-out.

## Petey plan

### Goal

Take the BBL Next.js brand live on `blackbeltlegacy.com` with sellable lineage-membership plans + a claimable
Dirty Dozen cohort, interim on the operator's Stripe account, by running the 0406 scripts against prod and
executing the documented apex cutover last.

### Tasks

#### SESSION_0407_TASK_01 — Verify BBL renders on the Vercel prod deployment

- **Agent:** Doug
- **What:** Confirm the `bbl` Vercel project has a green **Production** deploy and renders `data-brand=BBL`
  on `/`, `/disciplines/bjj`, `/lineage/...` via the deployment URL (read-only; no DNS touch).
- **Steps:** `vercel whoami` / `vercel ls` (bbl project) → confirm a `Ready` Production deploy → curl the
  deployment URL with `Host: blackbeltlegacy.com` (or the prod alias) for brand markers.
- **Done means:** a green prod deploy serving BBL chrome on a Vercel URL (proves CUTOVER item 1; gates the flip).
- **Depends on:** nothing.

#### SESSION_0407_TASK_02 — Create live BBL Stripe products + prices (operator account)

- **Agent:** Cody (operator-approved, show-first)
- **What:** 2 products ("Black Belt Legacy — Premium", "— Elite (Instructor)") × monthly+annual recurring
  prices, USD, amounts per BBL_STRIPE_PRODUCTS_SPEC ($9.99 / $59.99 / $29.99 / $299.00).
- **Steps:** Print exact `stripe products create` + `stripe prices create` calls (or SDK script) for approval →
  run against the operator's account → capture the 4 `price_…` (+ 2 `prod_…`) ids into env for the seed.
- **Done means:** 4 live price ids captured; operator confirms the account business name on the Stripe-hosted
  checkout is acceptable for interim BBL sales (see Open decisions).
- **Depends on:** nothing (parallel with TASK_01).

#### SESSION_0407_TASK_03 — Seed prod BBL pricing plans

- **Agent:** Cody
- **What:** Run `apps/web/scripts/seed-bbl-lineage-pricing.ts` against the **prod Neon** DB with the live
  price ids.
- **Steps:** Obtain prod `DATABASE_URL` (pooled) — method per Open decisions → `--dry-run` first → real run →
  idempotent re-run is safe. NEVER a schema mutation (`db push`/`migrate` forbidden against prod).
- **Done means:** 4 BBL `PricingPlan` rows (brand BBL, `metadata.surface=lineage_membership`, `stripePriceId`
  set, entitlement grants) — `/lineage/join` lists 4 plans on the BBL deployment.
- **Depends on:** TASK_02 (price ids).

#### SESSION_0407_TASK_04 — Import Dirty Dozen into prod

- **Agent:** Cody
- **What:** Run `apps/web/scripts/import-bbl-lineage-profiles.ts` against prod.
- **Steps:** Same prod `DATABASE_URL`; idempotent; deduped against the baseline lineage seed. Avatar paths are
  BBL.com `/brand/...` — resolve via `NEXT_PUBLIC_MEDIA_BASE_URL` (media migration is separate).
- **Done means:** 7 claimable placeholder Passports + PUBLIC DirectoryProfiles + `bbl-dirty-dozen` tree +
  "Dirty Dozen" visual group; visible/claimable on `/directory` (NOTE: `/members` redirects to `/directory`).
- **Depends on:** nothing (disjoint from TASK_03; sequence after for one prod connection window).

#### SESSION_0407_TASK_05 — Build the 301 redirect map (WP → Vercel)

- **Agent:** Cody/Petey
- **What:** Capture top WordPress permalinks for `blackbeltlegacy.com` and map to Vercel routes (home,
  `/blog/<slug>`, `/lineage/...`), per bbl-production-runbook step 3 + redirect-map table.
- **Done means:** redirect map filled in the runbook; redirects configured (or a documented decision to ship
  without and fix-forward — operator chose "prep now, flip after").
- **Depends on:** nothing.

#### SESSION_0407_TASK_06 — Apex DNS flip + verify (FINAL, gated)

- **Agent:** Operator (Bluehost) + Doug (verify)
- **What:** Flip apex `A @` from `151.101.66.159` → the **BBL-project-dashboard-surfaced** Vercel anycast IP
  (do NOT assume `76.76.21.21`; the CLI value is hardcoded, the dashboard value is authoritative — confirm
  in the bbl project Domains page). `www` already on Vercel.
- **Steps:** Confirm domain attached to bbl project + Valid Configuration → operator edits apex A at Bluehost →
  `dig` verify → SSL + 200 + brand smoke → rollback = revert apex A to `151.101.66.159`.
- **Done means:** `https://blackbeltlegacy.com` serves the BBL Next.js brand, SSL valid, smoke green.
- **Depends on:** TASK_01–05 green + explicit operator go.

### Parallelism

TASK_01 + TASK_02 + TASK_05 are independent (parallel). TASK_03 depends on TASK_02. TASK_04 disjoint but
sequenced after TASK_03 for a single prod-DB window. TASK_06 is last, gated on all prior + operator go.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0407_TASK_01 | Doug | Read-only prod-deploy verification. |
| SESSION_0407_TASK_02 | Cody | Outward Stripe API calls — show-first, operator-approved. |
| SESSION_0407_TASK_03 | Cody | Run existing seed against prod. |
| SESSION_0407_TASK_04 | Cody | Run existing import against prod. |
| SESSION_0407_TASK_05 | Petey/Cody | Capture WP permalinks → redirect map. |
| SESSION_0407_TASK_06 | Operator + Doug | DNS edit is Bluehost-side; Doug verifies. |

### Open decisions

- **Prod DB access method** — Neon `DATABASE_URL` is not on this machine. Options: `vercel env pull` (needs
  project linked + login) | operator pastes the pooled URL | seed local-first and prod at flip time. *Awaiting.*
- **Stripe checkout branding under live mode** — interim BBL checkout runs on the operator's platform Stripe
  account, so the Stripe-hosted Checkout page + receipts show **that account's** public business name, not
  "Black Belt Legacy" (integrations runbook: a test account surfaced "Tuff Buffs"). Confirm acceptable for
  interim sales, or keep payments in test-mode rehearsal (decoupling the DNS flip from live payment capture)
  until the BBL account is ready. *Operator to weigh — surfaced after the "live mode" choice.*
- **301 map completeness** — operator chose "prep now"; decide redirect coverage before the flip.

### Risks

- **`STRIPE_SECRET_KEY` = `sk_live`** (Baseline prod, drift D-018) — creating products + taking checkout under
  live mode is real money. Test cards fail on live keys; rehearsal needs `sk_test` + `stripe listen`.
- **Prod-DB safety** — only row upserts; never run `db push`/`migrate dev`/`reset` against prod Neon. Neon
  advisory-lock recovery is for `migrate deploy` hangs (not these scripts), but keep the runbook handy.
- **Apex flip is the irreversible-ish cutover** — takes the live WordPress site offline; rollback is DNS
  revert + propagation lag. Gate behind a green prod smoke.
- **Vercel build contract** — pnpm monorepo; `pnpm-lock.yaml` must be committed or prod build silently fails.

### Scope guard

- No schema change / migration. No Stripe code change (seam is ADR 0030). No comp-grant auto-wiring (0406
  open decision — reviewer-applied for now).
- No fabricated price ids — real ids from the operator's account at run time.
- Do not flip the apex until TASK_01–05 are green and the operator gives the go.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0407_TASK_01 | landed | BBL brand renders on the green prod deploy (`data-brand=BBL`, forced-resolve to Vercel). Domain (apex+www) already attached to `ronin-dojo-baseline`. |
| SESSION_0407_TASK_02 | **dropped** | **Operator pivot: no Stripe.** Don't attach the platform Stripe account to BBL; BBL's own `STRIPE_SECRET_KEY_BBL` already in prod, waiting on `STRIPE_WEBHOOK_SECRET_BBL` from the other dev. No products created. |
| SESSION_0407_TASK_03 | **dropped** | No prod pricing seed (Stripe out of scope; countdown gate hides the app until reveal). |
| SESSION_0407_TASK_04 | **landed** | **Dirty Dozen imported to PROD.** `import-bbl-lineage-profiles.ts` vs the shared Neon DB (operator-pasted `DATABASE_URL`) — tree `bbl-dirty-dozen` + cohort group created; 6 Passports enriched (deduped against baseline seed) + 1 created (John Lewis); 7 DirectoryProfiles + 7 tree members. Reveal-prep (gated behind countdown). |
| SESSION_0407_TASK_05 | n/a | 301 map not needed for a gated holding-page launch (whole brand → countdown); revisit at reveal. |
| SESSION_0407_TASK_06 | **landed** | **Apex DNS flip COMPLETE.** Bluehost apex A `151.101.66.159`→`216.198.79.1`; cert auto-issued; `https://blackbeltlegacy.com` serves the BBL countdown (200, valid cert). WordPress retired. |
| SESSION_0407_TASK_07 | **landed** | **Countdown restyle + gate activation.** White logo (`bbl-logo-white.png`), Poppins italic 800 heading (font var brought into the countdown subtree), launch `2026-06-17T20:51:00-06:00` (8:51pm MDT). Committed `7d273e4`, prod env set, deployed, gate effective in prod. |
| SESSION_0407_TASK_08 | **landed** | **R2 media upload.** 5 Dirty Dozen avatars `aws s3 cp`'d to `bbl-media/media/bbl/profiles/` **preserving exact names** (the import resolves by case-sensitive basename; the `import-bbl-wp-media.ts` slugify path would 404 — D-0407-4). Public-readable via the r2.dev URL. |
| SESSION_0407_TASK_09 | draft | **Default gi avatar** (`default-black-belt.png`) — custom SVG iterated to v3 (gi wrap, no belt, collars over shoulders, thick flush red ring). Not yet rendered→PNG→uploaded. Next-session finalize. |

## What landed

**Black Belt Legacy went live as a gated countdown.** The session pivoted hard from its planned Stripe-first
go-live (operator: *no Stripe at all*) to a **countdown-gated cutover**:

- **Countdown holding page live on `blackbeltlegacy.com`** — apex DNS flipped at Bluehost
  (`151.101.66.159`→`216.198.79.1`), apex TLS cert auto-issued, the old WordPress/Flywheel site retired.
  Re-styled per operator: **white BBL logo**, **Poppins italic 800** headline (the font var wasn't in the
  countdown's subtree — the layout short-circuits — so it fell back to system sans; fixed), counting down to
  **8:51pm Mountain** (`2026-06-17T20:51:00-06:00`). Code `7d273e4`; prod env `BBL_COUNTDOWN=1` +
  `NEXT_PUBLIC_BBL_LAUNCH_AT` set; verified live (browser screenshot).
- **Dirty Dozen imported to prod** — 7 claimable placeholder Passports + DirectoryProfiles + the
  `bbl-dirty-dozen` tree + cohort group (6 enriched, 1 created), via the operator-pasted Neon `DATABASE_URL`.
- **R2 media wired** — `bbl-media` bucket confirmed (Object R/W token), 5 avatars uploaded preserving exact
  names to `media/bbl/profiles/`, publicly served via the r2.dev URL; the import bakes absolute r2.dev avatar
  URLs so they resolve regardless of prod's (empty) `NEXT_PUBLIC_MEDIA_BASE_URL`.

**Not done (reveal-prep, intentionally gated):** the **reveal** (`BBL_COUNTDOWN` off) waits on the BBL
`STRIPE_WEBHOOK_SECRET_BBL` (from the other dev) **and** the claim-invite emails. The default gi avatar is a
v3 SVG draft (not yet PNG'd/uploaded). `default-black-belt.png` had no source asset.

## Decisions resolved

- **No Stripe for BBL launch.** Don't attach the platform Stripe account; BBL transacts on its own account
  (`STRIPE_SECRET_KEY_BBL` already in prod) once the webhook secret arrives. Launch is a gated holding page,
  payments come at/after reveal. (Supersedes this session's earlier "live mode, flip now" Stripe posture.)
- **Gated cutover over full launch.** Flip DNS to the BBL brand showing the countdown; reveal later by
  flipping `BBL_COUNTDOWN` off. No 301 map needed for a single-page holding gate.
- **One Neon project, brand-scoped** — no second project (the `aws` in the host is just Neon-on-AWS).
- **Apex IP = `216.198.79.1`** (working baseline value), not the CLI's `76.76.21.21`.
- **R2 token stays Object Read+Write** (least privilege; proven via write probe), not Admin.
- **Avatar = custom gi silhouette**, not the logo (logo reads as "missing image").

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/_components/bbl-countdown.tsx` | White logo + Poppins italic 800 heading + font vars in subtree (commit `7d273e4`, already pushed pre-bow-out). |
| `docs/sprints/SESSION_0407.md` | This record. |
| `docs/knowledge/wiki/index.md` | SESSION_0407 row (bow-out). |
| `docs/knowledge/wiki/drift-register.md` | D-0407-1..4 (bow-out). |

**Prod side-effects (not files):** Bluehost apex A record; Vercel prod env (`BBL_COUNTDOWN`,
`NEXT_PUBLIC_BBL_LAUNCH_AT`); Neon prod rows (Dirty Dozen); R2 `bbl-media` objects.

## Verification

| Command / smoke | Result |
| --- | --- |
| `git pull --ff-only` | 36 commits, clean → HEAD `680d415` (SESSION_0406). |
| `dig blackbeltlegacy.com A` | `151.101.66.159` (Fastly/WP — apex NOT flipped). |
| `dig www.blackbeltlegacy.com` | Vercel (`vercel-dns-017`), 308→apex → still WP. |
| `curl https://blackbeltlegacy.com` | 200, `server: Flywheel/5.1.0`, WordPress. |
| TASK_01: forced-resolve apex→Vercel (`216.198.79.1`) | App serves `data-brand="BBL"` (200); `/lineage/join`+`/directory` 200 — BBL renders on prod deploy. |
| TASK_01: `vercel domains inspect blackbeltlegacy.com` | apex+www attached to `ronin-dojo-baseline` (12d). Apex "not configured" = apex A still at Bluehost; apex TLS cert NOT yet issued (only `CN=www.blackbeltlegacy.com`) — auto-issues ~30s after apex A → Vercel. |
| Apex flip target IP | `216.198.79.1` (what live `baselinemartialarts.com` uses on this project). Vercel CLI suggests `76.76.21.21` — both valid anycast; runbook says trust the dashboard value. |
| Countdown gate in prod | NOT effective — forced-resolve apex→Vercel served the FULL app (`/lineage/join`+`/directory` 200), not `<BblCountdown/>`. `BBL_COUNTDOWN` IS in prod env (set 6h ago) but its value isn't effectively `"1"` on the live build (or set post-build, no redeploy). **Must make the gate effective + verify BEFORE the flip** else premature reveal. |
| Prod BBL env (`vercel env ls`) | `BBL_COUNTDOWN`, `NEXT_PUBLIC_BBL_LAUNCH_AT`, `S3_*_BBL`, `STRIPE_SECRET_KEY_BBL` set 6h ago. `STRIPE_WEBHOOK_SECRET_BBL` absent (the pending piece — gates the reveal/payments). |
| **D-0407-2:** prod NOT seeded on deploy | `vercel.json` + `package.json`: `prebuild=prisma migrate deploy` only; no `db:seed` in any lifecycle hook, `prisma.seed=null`. Seeding/import to prod is manual. (Operator believed deploy seeds — it migrates only.) Moot for the gated flip. |
| **D-0407-3:** deploy toolchain is bun, not pnpm | active `apps/web/vercel.json` uses `bun install --frozen-lockfile` + `bun run …` (lockfile = `bun.lock`). Deploy runbooks (vercel-deploy, vercel-domain-setup) still say `pnpm`/`pnpm-lock.yaml` — stale. |
| TASK_07 gates | `oxfmt` clean, `oxlint` advisory-only (none in changed file), `typecheck` ✓. Skipped full `bun test` (presentational change; suite fires live Resend → BBL sender-rep risk). |
| TASK_07 prod deploy | push `680d415..7d273e4` → Vercel prod build Ready; forced-resolve served countdown 200 + white logo + `font-bbl-heading` + gate active. |
| TASK_06 DNS flip | apex via `@1.1.1.1` = `216.198.79.1`; `https://blackbeltlegacy.com` HTTP/2 200, `server: Vercel`, HSTS, valid apex cert (auto-issued ~2min post-flip). |
| TASK_06/07 live visual | Browser screenshot of `https://blackbeltlegacy.com`: white logo, Poppins italic 800 headline, timer `00d 13h 51m` → 20:51 MDT = **8:51pm Mountain** confirmed. |

## Open decisions / blockers

- **`STRIPE_WEBHOOK_SECRET_BBL` pending** (from the other dev) — gates BBL's own-account payments + the reveal.
- **Claim-invite emails not sent** — need `recipients.json` from the WP email export → `send-bbl-claim-emails.ts`
  (#83). Watch sender-rep on the freshly-DKIM'd BBL domain (do not blast carelessly).
- **Default gi avatar** not finalized — v3 SVG draft needs render→PNG→upload to `media/bbl/profiles/default-black-belt.png`.
- **Secrets in transcript** — operator pasted the R2 secret/token + the Neon prod `DATABASE_URL` in chat;
  rotate the R2 API token (and optionally the DB password) when convenient.
- **`NEXT_PUBLIC_MEDIA_BASE_URL` empty in prod** — set it to the r2.dev URL for *new* uploads (the Dirty Dozen
  avatars are absolute, so unaffected).

## Next session

### Goal

Finish BBL reveal-prep so the only remaining step is flipping `BBL_COUNTDOWN` off: finalize + upload the
default gi avatar, build `recipients.json` from the WP export and send the claim-invite emails, and confirm
the Dirty Dozen render correctly once revealed. Flip the reveal only when the BBL webhook secret has arrived.

### First task

Render the v3 gi avatar SVG (`docs/sprints/SESSION_0407.md` Reflections / the chat widget) to a 512×512
`default-black-belt.png` and `aws s3 cp` it to `s3://bbl-media/media/bbl/profiles/default-black-belt.png`
(R2 creds were in `/tmp/r2-bbl.env` — deleted at bow-out, re-pull/paste). Then confirm all 7 Dirty Dozen
avatars 200 on r2.dev. **Do NOT flip `BBL_COUNTDOWN` off** until the operator confirms the webhook secret +
emails are ready.

## Review log

### SESSION_0407_REVIEW_01 — gated BBL launch + Dirty Dozen prod import

- **Reviewed tasks:** TASK_01, TASK_04, TASK_06, TASK_07, TASK_08 (landed); TASK_02/03 dropped; TASK_09 draft.
- **Dirstarter docs check:** not applicable (no new Dirstarter primitive; reused the existing per-brand seam,
  the gate, and the Bluehost→Vercel domain procedure).
- **Verdict:** The launch is real and verified end-to-end on the live domain (DNS, cert, brand, timer, avatars
  publicly readable). The big risk — flipping DNS into a half-built app — was caught and gated: the countdown
  was made effective in prod and proven *before* the apex flip. Prod mutations (Neon import, R2 uploads) were
  dry-run / probe-tested first and used idempotent, non-destructive paths. Honest about what's deferred
  (reveal, emails, avatar, default asset).
- **Score:** 8.5/10.
- **Follow-up:** rotate exposed secrets; finalize the avatar; the `import-bbl-wp-media.ts` slugify drift
  (D-0407-4) should be fixed or the script retired in favor of name-preserving `aws s3 cp`.

## Hostile close review

- **Giddy:** pass — launch verified on the live domain, not just asserted; prod writes were dry-run/probed
  first; the DNS-into-half-built-app risk was gated.
- **Doug:** pass with a caveat — the `bun test` gate was deliberately skipped (presentational change + live-Resend
  sender-rep risk); justified and recorded, but the test-email-seam stub remains an open debt.
- **Desi:** pass — countdown verified clean on desktop + mobile (the prior flip's rollback cause); avatar
  iterated to operator direction (still a draft).
- **Kaizen aggregate:** 8.5/10 — a high-stakes cutover executed safely; points off for the unfinished
  reveal-prep tail (avatar, emails) and the secrets-in-transcript hygiene debt.

### Findings (severity ≥ medium)

#### SESSION_0407_FINDING_01 — media-pull script disagrees with the import on key casing

- **Severity:** medium
- **Task:** SESSION_0407_TASK_08
- **Evidence:** `apps/web/scripts/import-bbl-wp-media.ts:305` (slugifies) vs
  `apps/web/scripts/import-bbl-lineage-profiles.ts:277` (`resolveProfileMedia` = exact basename).
- **Impact:** Using the media-pull script would 404 every imported avatar (case-sensitive R2 keys). Worked
  around this session with name-preserving `aws s3 cp`.
- **Required follow-up:** fix the slugify path (or retire the script). Logged as drift D-0407-4.
- **Status:** open (worked-around).

## ADR / ubiquitous-language check

- No new ADR. Applies ADR 0030 (per-brand Stripe), ADR 0006/0015 (DNS), ADR 0004 (brand-as-column). The
  **gated-cutover via `BBL_COUNTDOWN`** is an operational pattern, not an architectural decision (no ADR).
- No new ubiquitous-language terms ("Dirty Dozen" is an existing cohort label on `LineageVisualGroup`).
- Drift routed to `drift-register.md` (canonical IDs): **D-024** (deploy is bun not pnpm; runbooks stale,
  was D-0407-3) and **D-025** (media-pull slugify vs import exact-basename, was D-0407-4 / FINDING_01).
  Session-scoped, not registered: D-0407-1 (apex WP / www-only-Vercel — resolved by the flip) and D-0407-2
  (prod not seeded on deploy — migrate only; a clarification, not standing drift). Note: Vercel **Sensitive**
  env vars pull empty by design — not a misconfiguration (the "we ran into this last time" behavior).

## Reflections

- **A reframe is not a rewrite — twice over.** The session entered planning a Stripe-first live launch and
  exited with *no Stripe at all* and a countdown gate. The operator paced me hard ("ground yourself first" ×4)
  before any mutation; that grounding is exactly what surfaced that the public site was still 100% WordPress,
  that the gate wasn't effective in prod, and that two SESSION_0403 scripts disagree on key casing. Rushing
  would have flipped DNS into a half-built app.
- **Verify computed values before acting (again).** The avatar URL casing (D-0407-4) and the "empty" env pulls
  (Sensitive vars) both looked like one thing and were another. The `aws s3 ls` truncation (SIGPIPE from
  `| head`) and the `$EP` var word-split also taught: redirect to a file, don't pipe-to-head, when you need a
  complete count.
- **The cheapest verification was the live domain.** I couldn't cleanly browser-render prod pre-flip (apex
  cert was www-only), so the 8:51 time stayed *inferred* until the flip — then a screenshot settled it. Don't
  over-invest in bundle-grepping when the real artifact is one DNS record away.
- **Secrets hygiene.** I offered the inline-paste option, then flagged it as a risk — fair pushback from the
  operator. Pasting is fine; the follow-through is rotation. Logged.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `bbl-countdown.tsx` (code, no frontmatter); SESSION_0407 + wiki/index + drift-register frontmatter `updated`/`last_agent` bumped. |
| Backlinks/index sweep | SESSION_0407 row added to `wiki/index.md`; drift-register cross-linked. No new wiki pages. |
| Wiki lint | `bun run wiki:lint` — result reported at bow-out (see chat). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | SESSION_0407_REVIEW_01 + FINDING_01 above. |
| Review & Recommend | Next session goal + first task written: yes. |
| Memory sweep | Updated: BBL launch-is-live (project), countdown-gate mechanism, no-Stripe pivot, R2/sensitive-env facts. |
| Next session unblock check | First task (avatar render+upload) doable; reveal explicitly BLOCKED ON USER (webhook secret + emails). |
| Git hygiene | main; `bbl-countdown.tsx` already pushed `7d273e4`; docs single-commit — hash reported at bow-out / see git log. |
| Graphify update | 13103 nodes / 25150 edges / 1775 communities / 2043 files (was 12982/24810/1768/2022 at bow-in); run before the close commit. |
</content>
