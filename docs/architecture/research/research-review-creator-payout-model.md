---
title: "Research-Review — G-009 creator payout model for premium community content (Stripe Connect)"
slug: research-review-creator-payout-model
type: research-review
status: research-review
created: 2026-07-24
created_at: 2026-07-24T07:09Z
updated: 2026-07-24
author: "Claude (Fable 5) — autonomous /rr lane, wave 3"
last_agent: claude-session-0651
session: SESSION_0651
operator: Brian
decision: "OPEN — every fork below is presented undecided for the operator's morning review"
pairs_with:
  - docs/sprints/SESSION_0651.md
  - docs/sprints/SESSION_0537.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review — G-009 creator payout model (Stripe Connect)

> **What this document is.** A read-only research review (no code was changed) for goal **G-009**:
> design the creator-payout model that closes the FI-028b asymmetry. It grounds the question in the
> *actual* state of the repo, surveys the Stripe Connect design space and three comparables against
> primary sources, prices the options, sketches a staged build lane — and then **stops**. Unlike
> most research-reviews, **nothing here is decided**: this was produced by an overnight autonomous
> lane, so every fork is presented OPEN for the operator. The "Recommendation" section is a
> *recommended default*, not a ratified position.

---

## TL;DR (read this first)

1. **The asymmetry is real and ledgered.** FI-028b (SESSION_0537) let any create-capable author
   mark their own community post premium-to-read — but 100% of the revenue that gate drives goes to
   the platform. "Mark premium" is currently a platform merchandising lever wearing a creator-
   monetization costume. G-009 exists because the operator named that gap during the FI-028b grill.

2. **Half the plumbing already exists in the schema — unwired.** `StripeAccount` (with a
   `StripeConnectMode EXPRESS|STANDARD` enum and a 5% `applicationFeeBps` default) and
   `PayoutSplit` have sat in `prisma/schema.prisma` since ~SESSION_0107 with **zero application-code
   references** — classic built-but-not-pointed-to. They are **organization-scoped** (school
   payouts), not creator-scoped, so G-009 must decide: extend them or add a creator-keyed model.

3. **The money mechanics point one way.** BBL premium revenue is **pooled annual subscriptions**
   (Premium $35 / Elite $65-$45), not per-post purchases. A subscription charge cannot name a
   creator at charge time, which rules out destination charges as the *primary* rail — the natural
   fit is **charges stay exactly as they are today** + **separate transfers** from the platform
   balance to creators' Connect accounts on a payout cycle, driven by an internal earnings ledger.

4. **The real design question is the ledger, not the rails.** "Earn on what?" has three honest
   shapes — view-weighted pooling (Medium/YouTube-Shorts style), per-unlock conversion attribution,
   flat bounty — and BBL currently has **no post view-tracking at all**, so every attribution model
   needs an instrumentation phase first. That phase is cheap, safe, and useful regardless of which
   fork wins — it is the obvious Phase 0.

5. **Scale honesty: the pool is currently tiny.** At ratification (SOT-ADR D13) BBL had ~0 paid
   subscribers; a rev-share percentage of a near-zero pool pays out cents. The *incentive story*
   ("your premium post earns you money") may matter before the *dollars* do — which is itself an
   open fork (build now for the story, or defer behind a subscriber threshold).

**Recommended default in one line (open, not decided):** Express accounts + keep charges as-is +
separate transfers on a monthly cycle, fed by a view-weighted pooled ledger with a platform-
controlled split, payouts held below a threshold — with instrumentation built first so the
attribution fork can be decided on real data.

---

## Plain-English primer (skip if this is old hat)

- **Stripe Connect** is Stripe's multi-party-payments product: the platform keeps its normal Stripe
  account, each creator gets a **connected account**, and money can move platform → creator as
  **transfers**. Stripe handles bank details, identity verification (KYC), and payouts to the
  creator's bank.
- **Account types.** *Standard* = the creator gets a full, free Stripe account (most friction, least
  platform liability). *Express* = Stripe-hosted 5-minute onboarding + a lightweight dashboard; the
  platform controls payout timing and pricing, and pays per-account fees. *Custom* = the platform
  builds everything including onboarding UI (max control, max burden). Stripe now frames these as
  "controller properties" on newer APIs, but the trade-off triangle is unchanged.
- **Charge types.** *Destination charge* = one payment that names one connected account at charge
  time (`transfer_data`). *Separate charges & transfers* = the platform charges normally, then moves
  money later, in any split, to any number of accounts. Rev-share on pooled subscription revenue is
  the textbook separate-transfers case.
- **1099s.** US tax forms a payer files about payees. **1099-K** covers payment-card/third-party
  network transactions; **1099-NEC/MISC** cover service payments. Who files depends on who "handles
  pricing" for the connected account — for Express-style setups **the platform files**, and Stripe
  sells an e-file service ($2.99/form) that automates it.

---

## The question this resolves

> A member authors a premium post; a viewer pays BBL for a subscription partly because of that
> post; the author earns nothing. **What payout architecture — Stripe account type, money-movement
> mechanic, and earn-on-what ledger — should close that loop, and in what build order?**

---

## Grounded current state (what's actually true in the repo today)

### The revenue side (all live)

| Fact | Source |
|---|---|
| Premium gate SHIPPED: `CommunityPost.isPremium` + type-encoded no-leak read gate (`post-gate.ts`, `post-access.ts`), author self-serve toggle at create | SESSION_0537 (Doug GO 9.7) |
| Tier model D13: 4 tiers = 4 entitlement keys — Free · Premium `LINEAGE_PREMIUM` $35/yr · Elite `LINEAGE_ELITE` $65/$45 · Legend comp-only; **annual-only**; `UserEntitlement` is the single gate | SOT-ADR D13 / SESSION_0472 |
| Entitled-read resolver: `isCommunityPostViewerEntitled` = admin ∨ author ∨ paid `canRenderRichMedia` | `apps/web/server/web/community/post-access.ts` |
| Billing stack: `server/web/billing/*` (checkout actions, `stripe-webhook.ts`, `StripeCustomer`, `StripeWebhookEvent`, drift-audit) — subscription revenue lands on the **platform** (BBL) Stripe account | `apps/web/server/web/billing/` |
| **No view/read tracking on `CommunityPost`** — no viewCount, no read events; feed queries are viewer-agnostic | `prisma/schema.prisma` (model CommunityPost) |
| ~0 paid subscribers at D13 ratification (prodsnap) — the premium pool is currently near-zero | `bbl-membership-tier-model-0472` memory |

### The payout side (schema-only, never wired)

`prisma/schema.prisma` already contains:

- **`StripeAccount`** — `mode StripeConnectMode @default(EXPRESS)` (enum: `EXPRESS | STANDARD`),
  `chargesEnabled` / `payoutsEnabled` / `onboardingComplete` flags, `applicationFeeBps @default(500)`,
  **`organizationId @unique`** (one per school).
- **`PayoutSplit`** — `splitBps` per `recipientUser` under a `StripeAccount`.

A repo-wide search finds **zero references** to either model in `server/`, `app/`, or `lib/` — they
are scaffolding from the school-ops side (~SESSION_0107), shaped for *organization* payouts, not
*creator* payouts. G-009 is creator-keyed (the FI-028b author is a `User`/Passport, and BBL members
mostly aren't org members — `bbl-school-source-not-membership`). **Fork F6 below: extend these or
add a creator-scoped model.**

### The operational constraints (must shape the lane, non-negotiable)

- **BBL prod Stripe is LIVE-MODE** (`stripe-baseline-prod-live-mode` + BBL runbook): never rehearse
  with test cards on prod; all Connect rehearsal happens **test-mode, off-prod** (Stripe CLI +
  test-mode keys). Connect onboarding/transfers have full test-mode support, so every phase below
  can be rehearsed without touching live money.
- **The local Stripe CLI is authed to "Tuff Buffs"** (`acct_1T065a…`), not BBL
  (`bbl-stripe-cli-account-trap`): every BBL Connect CLI op needs the `[bbl]` profile established
  first (`stripe config --list` → confirm account id) or objects land in the wrong portfolio account.
- **Per-brand Stripe accounts (ADR 0030):** BBL transacts on its own account via
  `STRIPE_SECRET_KEY_BBL` — Connect accounts must be created under the **BBL** platform account,
  and the env fallback (unset → platform key) is a live foot-gun for a payout lane.

---

## Research 1 — Stripe Connect account type (Express vs Standard vs Custom)

Primary sources: [Connect account types](https://docs.stripe.com/connect/accounts) ·
[Connect pricing](https://stripe.com/connect/pricing) ·
[Tax reporting](https://docs.stripe.com/connect/tax-reporting) ·
[Payouts](https://docs.stripe.com/payouts).

| Dimension | **Standard** | **Express** | **Custom** |
|---|---|---|---|
| Onboarding friction | Creator opens a full Stripe account (Stripe-hosted, heaviest — full business profile) | Stripe-hosted flow, minutes; platform triggers via account link | Platform builds the entire onboarding UI + KYC collection |
| KYC / identity | Stripe collects | Stripe collects | Platform (or Stripe) collects; platform owns compliance updates |
| Dashboard for creator | Full Stripe Dashboard | Lightweight Express dashboard (balance + payouts) | None — platform must build an earnings surface |
| Fraud/dispute liability | Connected account (direct charges) | **Platform** | **Platform** |
| Payout timing control | Creator controls own schedule | **Platform controls** (`delay_days`, schedule) | Platform controls |
| 1099 responsibility | Stripe files 1099-K (account pays own Stripe fees) | **Platform files** (Stripe e-file: $2.99/form federal, $1.49 state) | Platform files |
| Per-account cost | **Free** | **$2 per monthly-active account + 0.25% + $0.25 per payout sent** | Same as Express + far more build |
| Fit for "member earns a rev-share" | Poor — full-account friction kills opt-in for hobbyist black belts | **Designed for exactly this** (marketplace/creator payout is the canonical Express case) | Overkill — only if we need fully white-label onboarding |

Notes that matter for BBL:

- **Payout timing:** US default settlement is T+2; with Express/Custom the platform sets the
  connected accounts' schedule (daily/weekly/monthly/manual + `delay_days`). Stripe's own minimum
  payout amount is effectively nil (**$0.01 USD**) — so any "minimum payout threshold" (Fork F2) is
  **product policy in our ledger**, not a rail constraint. We hold accruals in our ledger until the
  threshold, then transfer; Stripe pays out whatever we transfer.
- **Tax burden ownership:** with Express-style "platform handles pricing," **the platform is the
  filer**. Stripe automates generation/e-delivery/filing for a per-form fee. Federal 1099-K
  thresholds reverted to **>$20,000 AND >200 transactions** under the One Big Beautiful Bill Act
  (July 2025) — IRS FAQs confirm ([irs.gov](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000)) —
  and OBBBA also raises the 1099-NEC/MISC threshold from $600 to **$2,000 for payments made in
  2026+** ([Avalara](https://www.avalara.com/blog/en/north-america/2025/07/one-big-beautiful-bill-act-1099-reporting-threshold.html)).
  Practical read: at BBL's scale, almost no creator will cross either threshold for years — the tax
  *filing* burden is near-zero, but the *classification* question (K vs NEC vs MISC-royalty
  characterization of a rev-share) is real → Fork F5, flagged for a tax advisor, per Stripe's own
  recommendation.
- **Cost realism:** Express fees ($2/active-month + 0.25%+$0.25/payout) only bite on accounts that
  actually receive payouts — an account is "monthly active" when paid. A threshold-gated monthly
  cycle keeps this trivial (a creator earning $20/mo costs ~$2.35 to pay).

---

## Research 2 — Money-movement mechanic (how the share physically moves)

Primary source: [Connect charge types](https://docs.stripe.com/connect/charges).

| Option | Mechanic | Fits BBL because / breaks because |
|---|---|---|
| **M1 — Destination charges** (`transfer_data[destination]` + `application_fee_amount` on the charge) | Each charge names ONE connected account; funds route at charge time; platform keeps the fee | Fits a **per-unlock purchase** product (buyer pays for one creator's thing). **Breaks for BBL today:** the charge is an annual *subscription to the platform* — no single creator can be named at charge time, and the subscription checkout (live, tested, D13-priced) would need to be re-plumbed. Only becomes relevant if a per-post-purchase product is ever added. |
| **M2 — Separate charges & transfers** (charges unchanged; `transfers` API moves platform balance → N accounts later) | Platform charges exactly as today; an internal ledger accrues earnings; a payout job transfers each creator's accrued balance on a cycle | **The natural fit:** zero change to the live checkout/webhook path; one-to-many splits are the stated use-case; transfer timing decoupled from charge timing (required for monthly attribution math). Cost: platform is merchant of record (already true), must track its own ledger honestly (that's Research 3), same-region constraint (BBL + US creators — fine; international creators are a cross-border payout fee, "starting at 0.25%"). |
| **M3 — `PayoutSplit`-style static splits** (the dormant schema: fixed bps per recipient) | Every dollar splits by a fixed table | Built for a school splitting dues with staff. **Breaks for creators:** the split set changes per-period based on who authored/earned what — a static bps table can't express "this month's pool shares." |

**Evidence-led read (open):** M2 is the only mechanic that matches pooled subscription revenue
without touching the live billing path. M1 is not wrong — it is the *right* rail for a different
product (à-la-carte unlocks) and pairs with attribution Fork F4-B if the operator ever wants
per-post purchases; it is not a competitor for the subscription pool.

---

## Research 3 — The earnings ledger ("earn on what?")

The gate ships premium *reads*; the revenue is *subscriptions*. Attribution bridges them. Three
honest shapes (+ hybrid):

| Option | How a creator earns | Pros | Cons |
|---|---|---|---|
| **A — View-weighted pooling** (Medium / YouTube-Shorts shape) | X% of the period's premium-attributable subscription revenue forms a pool; each creator's share = their share of **entitled member reads** (or read-time) of premium posts that period | Matches the pooled-subscription reality; rewards ongoing value, not just launch spikes; scales to N creators automatically; industry-proven shape | Needs read instrumentation that does not exist today (Phase 0); gameable (view fraud → needs a "counted read" definition + dedup); a tiny pool pays cents until subscribers grow; pool-sizing itself is a sub-fork (what % of which revenue is "premium-attributable"?) |
| **B — Per-unlock conversion attribution** | When a viewer upgrades, the locked post(s) that drove the conversion get credited (e.g., last locked-teaser CTA clicked before checkout) — creator earns a % of *that subscriber's* revenue | Rewards what the platform actually wants (conversion); no ongoing view-metering; the teaser CTA → `/lineage/join` funnel already exists as the natural attribution hook | Attribution plumbing through checkout is fragile (multi-touch, cross-device, "browsed 5 locked posts then upgraded"); winner-take-all favors clickbait teasers over durable content; annual-only billing means one attribution event per subscriber-year — high variance, low signal |
| **C — Flat bounty** | Fixed $ per qualifying premium post (or per post crossing an engagement bar) | Trivial ledger (no revenue math); predictable cost; works at zero subscribers (incentive story without a pool) | Decoupled from revenue → platform bears open-ended cost risk; pay-per-post invites volume spam → needs an editorial/quality gate (new moderation surface); "qualifying" is a policy argument forever |
| **A+C hybrid** | Small bounty floor + pooled share on top | Bootstrap story now, revenue alignment later | Two systems' complexity; still needs Phase 0 for the A half |

**Cross-cutting fact:** every model except C requires knowing which premium posts entitled members
actually read — and **no such signal exists today**. A minimal earning-event instrumentation
(server-side, on the already-resolved entitled read path in `post-gate`/detail page) is a
prerequisite to *deciding* Fork F4 on data rather than taste, which is why it is Phase 0 below.

---

## Research 4 — Comparables (one sourced paragraph each)

**Patreon.** Creators who joined after August 4, 2025 pay a **flat 10% platform fee**; legacy
creators keep grandfathered 5%/8%/12%-era rates while their page stays unchanged. Payment
processing (~3%), currency conversion, and payout fees stack on top, so effective take is commonly
12–15% of gross. Patreon is the pure "platform takes a cut of *direct* creator subscriptions"
shape — each patron pays a specific creator, so attribution is trivial (destination-charge-shaped)
and irrelevant to BBL's pooled problem, but its 90/10 headline is the creator-expectation anchor.
([Patreon Help Center](https://support.patreon.com/hc/en-us/articles/36426991446797) ·
[Creator fees overview](https://support.patreon.com/hc/en-us/articles/11111747095181))

**Substack.** Substack takes **10% of paid-subscription revenue**, with Stripe processing
(~2.9% + $0.30 + a recurring-billing component) on top — writers net roughly 86–87%. Like Patreon,
the reader subscribes to *one writer*, so the split is a fee, not an attribution model. Substack's
relevant lesson for BBL is the psychology: creators tolerate a 10-ish% platform take when the
subscription is *theirs*; BBL inverts this (the subscription is the platform's, the creator gets
the minority share), which is the Fork F1 framing question — "platform pays creators a share" vs
"creators pay the platform a fee." ([Substack pricing overviews:
Ruzuku](https://www.ruzuku.com/learn/articles/substack-pricing) ·
[SchoolMaker](https://www.schoolmaker.com/blog/substack-pricing))

**YouTube.** The Partner Program pays **55% of watch-page ad revenue** to the creator, **70% of
channel-membership** revenue, and for Shorts allocates a **Creator Pool by each channel's share of
Shorts views, then pays creators 45%** of their allocation. YouTube Premium subscription revenue is
likewise distributed by members' watch-time share. The Shorts/Premium mechanics are the direct
precedent for Option A: pooled revenue → engagement-share allocation → percentage split, at
platform-defined payout thresholds. ([YouTube partner earnings
overview](https://support.google.com/youtube/answer/72902) · [Shorts monetization
policies](https://support.google.com/youtube/answer/12504220))

**Medium (bonus — the closest structural analogue).** Medium distributes a share of *member
subscription revenue* to writers by **member reading time** plus engagement signals, with a
read-ratio adjustment (a counted read = 30+ seconds), i.e., view-weighted pooling with anti-gaming
dampers on a subscription pool — exactly BBL's shape (readers subscribe to the platform, not the
writer). ([Medium Help Center — Partner Program earnings
calculation](https://help.medium.com/hc/en-us/articles/360036691193))

---

## Recommendation (a recommended DEFAULT — every element re-opened as a fork below)

The evidence points at one coherent stack, consistent with the expected shape in the lane brief:

1. **Express** connected accounts (F3) — onboarding friction is the adoption killer for hobbyist
   martial-arts authors; Express is the only type that is both low-friction and platform-controlled
   (payout schedule, thresholds), and its per-account cost only accrues when we actually pay someone.
2. **Separate charges & transfers** (Research 2, M2) — the live D13 subscription checkout stays
   byte-identical; payouts are a downstream job reading an internal ledger. Destination charges are
   shelved unless/until a per-post-purchase product exists.
3. **View-weighted pooling** as the attribution default (F4-A), Medium/YouTube-shaped, with a
   30-second-class "counted read" definition and per-member dedup — but **decided only after
   Phase 0 data exists**; per-unlock (B) remains live as a challenger because the teaser-CTA funnel
   gives it a cheap first implementation, and a small bounty floor (C) remains live as the
   zero-subscriber bootstrap story.
4. **Monthly cycle + platform-policy payout threshold** (F2) — Stripe's floor is $0.01, so the
   threshold is ours to choose; holding sub-threshold accruals in the ledger (not in Stripe
   balances) keeps Express per-payout fees negligible.
5. **Platform files 1099s via Stripe e-file** (F5) — mechanically cheap at our scale ($2.99/form,
   and almost nobody crosses the OBBBA-restored thresholds soon); the open question is
   characterization (K vs NEC), which needs a tax advisor's sign-off, not an engineer's.
6. **New creator-scoped payout models** (F6) — leave the dormant org-scoped
   `StripeAccount`/`PayoutSplit` untouched (they belong to the school-ops future); a creator payout
   account hangs off `User` (or Passport), and `PayoutSplit`'s static-bps shape cannot express
   per-period pool shares anyway.

**Why not just copy Patreon/Substack's 90/10?** Because the subscription belongs to the platform,
not the creator — BBL's honest comparables are YouTube memberships (70% to creators) at one
extreme and Medium (~50% pool) in the middle, *of the premium-attributable slice*, not of gross.
The split number is genuinely open (F1) and is a product-economics call, not a technical one.

---

## Staged build-lane spec (PROPOSAL — no code or migrations in this lane)

Phases are sized to be individually shippable, individually gated, and abortable between phases.
Nothing below starts until the operator resolves at least F3 (account type) and F4 (attribution);
F1/F2 can be deferred to Phase 2 (they are ledger parameters, not schema).

### Phase 0 — Earning-event instrumentation (zero payment risk; decision-enabling)

- **Build:** a server-side `PremiumReadEvent` capture on the entitled premium-post read path (the
  detail page already resolves `isCommunityPostViewerEntitled`; record `{postId, viewerId, day}`
  deduped per viewer/post/day — additive table, no UI). A tiny admin/report query: reads per
  premium post per period.
- **Explicitly not:** client-side analytics, view counters on free posts, any UI.
- **Gate:** unit tests on dedup + no-write-for-unentitled/anon; negative test that the event write
  cannot alter the read path's no-leak result; fallow 0-introduced.
- **Why first:** every attribution fork except flat-bounty needs this signal; two weeks of real
  data turns F4 from taste into evidence. Reversible and useful even if G-009 stalls.

### Phase 1 — Connect onboarding (test-mode only; no money moves)

- **Build:** creator-scoped model (PROPOSAL sketch — names illustrative):

  ```
  CreatorPayoutAccount: id · userId @unique · stripeAccountId @unique ·
    mode (EXPRESS default) · onboardingComplete · payoutsEnabled · country ·
    createdAt/updatedAt        // deliberately NOT reusing org-scoped StripeAccount (F6)
  ```

  plus an opt-in surface on the author's own settings ("Get paid for premium posts" → Stripe
  account-link redirect → return/refresh handlers → webhook-driven `payoutsEnabled` sync).
- **Ops preconditions:** `[bbl]` Stripe CLI profile proven (`stripe config --list` shows the BBL
  account id — the Tuff Buffs trap); `STRIPE_SECRET_KEY_BBL` set explicitly in the lane env (never
  the platform-key fallback); Connect enabled on the BBL Stripe account (a dashboard step, live +
  test mode).
- **Gate:** full onboarding round-trip in **test mode off-prod**; webhook events
  (`account.updated`) processed idempotently through the existing `StripeWebhookEvent` dedup;
  negative test: an un-onboarded creator can toggle `isPremium` exactly as today (payout is
  opt-in, never a posting gate).

### Phase 2 — Earnings ledger (accrual only; still no money moves)

- **Build (PROPOSAL sketch):**

  ```
  CreatorEarningPeriod: id · periodStart/End · poolCents · splitBps · status (OPEN→CLOSED→PAID)
  CreatorEarning:       id · periodId · userId · amountCents · basis (readShare snapshot) ·
                        status (ACCRUED→PAID→FORFEITED)
  ```

  a period-close job computing the pool (per F1/F4 parameters) and each creator's accrual from
  Phase-0 events; parameters (`splitBps`, pool definition, threshold) live in config/DB — **not**
  hard-coded — so F1/F2 stay operator-tunable.
- **Gate:** property-style unit tests (shares sum to pool, rounding residue accounted, zero-read
  period → zero accruals); replay determinism (re-closing a period is idempotent); drift-audit-style
  reconciliation query (sum of accruals ≤ pool).

### Phase 3 — Payout execution (money moves; the live-mode fence applies)

- **Build:** a payout job per closed period: for each creator with `ACCRUED ≥ threshold` and
  `payoutsEnabled`, create a Stripe **transfer** (idempotency key = `periodId:userId`), mark
  `PAID`, roll sub-threshold accruals forward; an admin review surface (AdminCollection-conformed)
  showing the period, pool, per-creator lines, and a manual approve step — **human-in-the-loop for
  at least the first cycles**.
- **Ops:** full rehearsal in test mode off-prod (test-mode transfers to test connected accounts);
  first live run with the operator watching; live keys only via `.env.prod` discipline.
- **Gate:** idempotent re-run proof (double-execute → single transfer); insufficient-balance
  behavior handled (transfers draw on platform balance); reconciliation: Stripe transfer list ==
  `PAID` earnings for the period, exit-code-checked.

### Phase 4 — Creator surface + tax season

- **Build:** an author earnings panel (accrued/paid history, onboarding status) on the author's own
  surface; Express dashboard link for bank/payout details (build nothing Stripe already hosts);
  enable Stripe 1099 e-file settings before the first January with nonzero payouts.
- **Gate:** entitled-only visibility (an author sees only their own earnings); Desi UX pass;
  boundary: 1099 characterization signed off per F5 before the first filing season, not before the
  first payout.

**Dependency notes:** Phase 0 has no dependencies and could ship this week. Phases 1–2 are
parallel-safe after F3/F4 resolve (disjoint files). Phase 3 hard-depends on 1+2 and on the
live-mode rehearsal constraint. FI-001 send-parking is untouched — nothing here touches lineage or
email surfaces.

---

## OPEN FORKS — for the operator's morning review (argued, NOT decided)

- **F1 — Split percentage (and of what).** Candidates: 70% of a *premium-attributable pool* (the
  YouTube-memberships anchor, most creator-generous), ~50% (the Medium anchor), or a modest fixed
  slice of gross premium revenue (e.g., 10–20%) framed as a bonus program. The prior sub-fork is
  the pool definition itself: what fraction of a $35 Premium sub is "premium-post-attributable" vs
  paying for techniques/lineage/directory? An honest first answer may be a deliberately small,
  clearly-labeled pool that can only grow. *Recommendation deferred to the operator — this is
  brand economics.*
- **F2 — Payout threshold + cadence.** Stripe's own minimum is $0.01, so this is pure product
  policy. Candidates: $25 monthly roll-forward (fee-efficient, YouTube-ish feel at BBL scale) ·
  $10 (creator-friendly, more $2-active-months) · no threshold (max goodwill, max fee drag).
  Cadence: monthly (recommended default) vs quarterly (fewer active-account fees at tiny scale).
- **F3 — Express vs Standard.** Express costs $2/active-month + 0.25%+$0.25/payout and makes BBL
  the 1099 filer; Standard is free and pushes tax filing to Stripe, but onboarding friction is a
  full Stripe account per hobbyist creator, creators control their own payout timing, and the
  platform loses schedule/threshold control. Evidence favors Express for this audience; Standard is
  the fork to pick only if minimizing platform tax/fee obligations outweighs adoption. (Custom is
  not seriously arguable at this scale — max build, same fees as Express.)
- **F4 — Attribution model.** A (view-weighted pool) vs B (per-unlock conversion credit) vs C
  (flat bounty) vs A+C hybrid — argued in Research 3. The genuinely open question a fortnight of
  Phase-0 data answers: do premium reads concentrate in a few posts (A ≈ B anyway) or spread
  (A materially fairer)? B's annual-only-billing variance and C's spam surface are the standing
  arguments against deciding either today.
- **F5 — Tax posture.** Platform-files-via-Stripe-e-file (Express default) vs Standard's
  Stripe-files-1099-K; and the characterization question (1099-K vs 1099-NEC for a rev-share; OBBBA
  thresholds now $20k/200 and $2,000 respectively) — flagged for a tax professional before the
  first filing season; NOT an engineering decision.
- **F6 — Schema seam.** New creator-scoped `CreatorPayoutAccount`/`CreatorEarning*` models
  (recommended default: the dormant `StripeAccount`/`PayoutSplit` stay reserved for school-ops) vs
  extending `StripeAccount` with a nullable `userId` axis (one Connect table for the whole
  portfolio, but a polymorphic owner + a static-bps model that doesn't fit per-period pools).
  Related honesty item: those dormant models are unwired since ~0107 — whatever this fork decides
  should also decide whether they stay, gain a `@wired`-pending annotation, or get a drift entry.
- **F7 — Timing.** Build now (Phases 0–1 are cheap; the incentive *story* may recruit premium
  authors while the pool is near-zero — with a clearly-labeled "earnings accrue, payouts start at
  launch" stance) vs defer Phases 1–4 behind a paid-subscriber threshold (e.g., N ≥ 50) and ship
  only Phase 0 now. Phase 0 is the no-regret move under every branch.

---

## Sources

- Stripe — [Connect account types](https://docs.stripe.com/connect/accounts) ·
  [Charge types](https://docs.stripe.com/connect/charges) ·
  [Connect pricing](https://stripe.com/connect/pricing) ·
  [Tax reporting for Connect](https://docs.stripe.com/connect/tax-reporting) ·
  [Payout schedules & minimums](https://docs.stripe.com/payouts)
- IRS — [FAQs: Form 1099-K threshold reverts to $20,000/200 under OBBBA](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000) ·
  Avalara — [OBBBA 1099 threshold changes ($2,000 NEC/MISC from 2026)](https://www.avalara.com/blog/en/north-america/2025/07/one-big-beautiful-bill-act-1099-reporting-threshold.html)
- Patreon — [Standard platform fee for new creators (post-Aug 4 2025)](https://support.patreon.com/hc/en-us/articles/36426991446797) ·
  [Creator fees overview](https://support.patreon.com/hc/en-us/articles/11111747095181)
- Substack pricing analyses — [Ruzuku](https://www.ruzuku.com/learn/articles/substack-pricing) ·
  [SchoolMaker](https://www.schoolmaker.com/blog/substack-pricing)
- YouTube — [Partner earnings overview](https://support.google.com/youtube/answer/72902) ·
  [Shorts monetization policies](https://support.google.com/youtube/answer/12504220)
- Medium — [Partner Program earnings calculation](https://help.medium.com/hc/en-us/articles/360036691193)
- Repo — `docs/sprints/SESSION_0537.md` (FI-028b) · `docs/knowledge/wiki/goals-ledger.md` (G-009) ·
  `apps/web/prisma/schema.prisma` (`StripeAccount`/`PayoutSplit`/`CommunityPost`) ·
  `apps/web/server/web/billing/*` · memories `bbl-membership-tier-model-0472`,
  `bbl-stripe-cli-account-trap`, `stripe-baseline-prod-live-mode`
