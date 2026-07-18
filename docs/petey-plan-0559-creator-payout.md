---
title: "Petey Plan 0559 — G-009 creator-payout model for premium community content"
slug: petey-plan-0559-creator-payout
type: petey-plan
status: active
created: 2026-07-17
updated: 2026-07-18
last_agent: codex-session-0567
pairs_with:
  - docs/sprints/SESSION_0559.md
  - docs/knowledge/wiki/goals-ledger.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
  - docs/architecture/decisions/0045-admin-collection-one-surface-law.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - payments
  - monetization
  - creator-payout
  - petey-plan
---

# Petey Plan 0559 — G-009 creator-payout model for premium community content

> **Purpose:** the build-ready plan for **G-009** (`docs/knowledge/wiki/goals-ledger.md` §G-009):
> a creator-payout model so a member who authors premium content earns a share of the revenue their
> gated content drives — rev-share model, Stripe Connect rails, an author-earnings surface, and the
> tax/KYC plumbing a real payout needs. **Nothing here builds before the grill list (final section)
> is resolved by the operator** (petey-plan protocol: grill open forks first,
> `docs/protocols/petey-plan.md`).

## 0. What exists today (the grounding)

Every claim below cites its repo source.

- **The gate shipped without the incentive.** FI-028 (SESSION_0535) shipped the CREATE gate —
  posting is Premium/Elite-tier-gated via `canCreateCommunityPostForUser`
  (`apps/web/server/web/community/permissions.ts`). FI-028b (SESSION_0537) shipped per-post READ
  freemium — `CommunityPost.isPremium` (default false; `apps/web/prisma/schema.prisma` ~line 4371),
  the viewer-keyed `isCommunityPostViewerEntitled` (`apps/web/server/web/community/post-access.ts`),
  the type-encoded no-leak `gateCommunityPost` (`apps/web/server/web/community/post-gate.ts`), and
  the **author self-serve premium toggle at create**. Both rows:
  `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` (FI-028 row). G-009 exists because the toggle
  currently benefits only the platform (drives upgrades), not the author
  (`docs/knowledge/wiki/goals-ledger.md` §G-009 "Why").
- **The revenue is memberships, not per-post purchases.** BBL sells 2 Stripe products / 3 prices,
  **annual-only**: Premium $35/yr (`LINEAGE_PREMIUM`), Elite $65/yr with a $45 verified-black-belt
  rate (`LINEAGE_ELITE`, cumulative), `LINEAGE_LEGEND` comp-only
  (`docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md`;
  `docs/product/black-belt-legacy/SOT-ADR.md` §D13). The single access gate is `UserEntitlement`
  (D13; models at `apps/web/prisma/schema.prisma` ~lines 4159–4210: `Entitlement`,
  `EntitlementGrant`, `UserEntitlement` with `sourceType`/`sourceId`).
- **BBL transacts on its own Stripe account** — never Baseline/Tuff Buffs
  (`docs/architecture/decisions/0030-per-brand-stripe-account.md`;
  `docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md` header). Any live-mode change is
  rehearsed **off-prod in test mode first** (SOT-ADR §D13 "rehearsed off-prod (test-mode) before any
  live edit"); the local Stripe CLI is authed to the wrong account — every BBL CLI op needs a
  `[bbl]` profile (`docs/product/black-belt-legacy/BBL_STRIPE_PRICING_RUNBOOK.md`).
- **The Connect seam was pre-reserved.** `StripeCustomer.accountScope` defaults `"platform"` and its
  schema comment says "platform vs connect" (`apps/web/prisma/schema.prisma` ~line 1938,
  SESSION_0107). `StripeWebhookEvent` (same file, below `StripeCustomer`) already gives webhook
  idempotency. Webhook + billing seams: `apps/web/app/api/stripe/webhooks/` +
  `apps/web/server/web/billing/`.
- **A Connect payout pipeline was already sketched** — archived
  `docs/sprints/_archive/SESSION_0098.md` §"BBL Connect lineage payout pipeline": separate webhook
  destination (likely `/api/stripe/connect/webhooks`, `STRIPE_CONNECT_WEBHOOK_SECRET`), candidate
  events (`account.updated`, `payout.*`, `transfer.*`), and the exact **manual decisions** this
  plan's grill list now formalizes (org-payout-vs-connected-accounts, split %, timing, clawback,
  KYC responsibility).
- **Authorship has two keys.** `CommunityPost.authorId` → `User`
  (`apps/web/prisma/schema.prisma`, `CommunityPost` model); authored techniques key
  `authorPassportId` → `Passport` (ADR 0046,
  `docs/architecture/decisions/0046-technique-ownership-org-nullable-and-authored-by.md`;
  `Technique.isPremium` at schema ~line 3910). Identity SoT is the Passport (ADR 0025,
  `docs/architecture/decisions/0025-passport-identity-source-of-truth.md`).
- **Dirstarter has no payout layer.** The live payments doc
  (<https://dirstarter.com/docs/integrations/payments>, checked 2026-07-17 per
  `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs) covers Stripe checkout +
  subscriptions only — no Connect, no marketplace, no transfers. Creator payouts are a **custom
  delta beside** the Dirstarter Stripe seam, not a replacement of it.

## 1. The core design problem — attribution, not plumbing

G-009's objective says the author "earns a share of the revenue their gated content drives"
(`docs/knowledge/wiki/goals-ledger.md` §G-009). But BBL revenue is **annual membership
subscriptions** (§0) — no money edge touches an individual post. Every payout model is therefore a
way of **imputing** membership revenue to authors. That imputation choice is the real fork; Stripe
Connect is just rails. Three candidate models:

### Model A — Conversion bounty (fixed split on attributed upgrades)

A locked premium post's "Unlock with Premium" CTA (`gateCommunityPost` teaser, FI-028b row in
`POST_LAUNCH_SOT.md`) carries the `postId` into checkout metadata; if that session converts, the
post's author earns a fixed % of that subscription's first year.

- **Pros:** money maps to a real causal event; zero read-tracking infra; pays only on new revenue.
- **Cons:** last-touch attribution is a lie at portfolio scale (members upgrade for the library, not
  one post); pays nothing for retention value; **highly gameable** (author shills their own locked
  link); with BBL's small funnel most authors would earn literally $0, killing the incentive story.

### Model B — Engagement-weighted monthly pool (recommended)

Each month, a **creator pool** = (operator-set %) × (net recognized premium-tier revenue for that
month, i.e. 1/12 of each active annual subscription, net of Stripe fees). The pool divides among
authors by **engagement weight** = distinct entitled-reader-days on their premium content that month
(one credit per viewer·post·day, author-self excluded).

- **Pros:** matches the actual revenue shape (pooled memberships → pooled imputation — the
  YouTube-Premium/Medium-partner shape); rewards both acquisition *and* retention content; degrades
  gracefully at BBL's current scale (tiny revenue → tiny pool → cost-capped by construction, D13
  notes prodsnap had 0 paid subscribers at ratification); extends unchanged to premium techniques
  later (polymorphic subject).
- **Cons:** needs a new attribution event (a read ledger — schema §4); "reads" are softer than
  "conversions" and need anti-gaming caps (§5).

### Model C — Tiered rates (Model B with per-author multipliers)

Same pool, but an author's credits are multiplied by a tier factor (e.g. Elite authors or
verified-black-belt authors earn a higher rate — rhyming with D13's "belt rank is a **price** axis"
supply-side subsidy, `SOT-ADR.md` §D13).

- **Pros:** lets the operator steer supply (reward the lineage-anchoring instructors).
- **Cons:** premature — adds a policy knob before there's any payout data; the same steering already
  exists on the price side ($45 black-belt Elite rate, `BBL_STRIPE_PRODUCTS_SPEC.md`).

**Recommendation: Model B for v1, schema-shaped so C is a config change** (a `weightMultiplier` on
the payee row, default 1.0) **and A can be added later as a bonus line-type, not a rewrite** (the
earning-line table carries a `kind` discriminator — see §4). → **Grill fork #1.**

## 2. Stripe Connect architecture

External-facts note: Stripe capabilities below are current Stripe-platform knowledge, not repo
claims; verify against Stripe docs at build time (and the Dirstarter payments doc stays
subscriptions-only, §0).

### 2.1 Account type — Express (recommended) vs Standard

- **Express** (recommended): Stripe-hosted onboarding + identity/KYC collection, Stripe-managed tax
  form collection (W-9/W-8 at onboarding) and 1099 filing support, platform-controlled payout
  schedule, a lightweight Stripe dashboard for the payee. Right shape for hobbyist martial-arts
  authors who have never run a Stripe account.
- **Standard:** payee owns a full Stripe account — least platform liability, but requires each
  author to create and operate their own Stripe account; wrong burden for this audience, and the
  platform loses payout-schedule control (which §5's hold-window abuse defense needs).
- **Custom:** full white-label, full compliance burden on BBL — rejected outright; nothing in the
  SoT set justifies it.

→ **Grill fork #3.**

### 2.2 Money flow — separate charges & transfers

Membership revenue already lands on the BBL platform account (ADR 0030; checkout + entitlement
webhooks at `apps/web/app/api/stripe/webhooks/` → `apps/web/server/web/billing/`). Payouts are
therefore **separate transfers**: the monthly pool close (§4, PR-4/PR-5) creates Stripe **Transfers**
from the BBL platform balance to each payee's connected account; Stripe then pays out on the
account's schedule. Destination charges are the wrong tool — there is no per-item charge to
destination (§1).

**Cross-border caveat:** separate transfers are broadly limited to connected accounts in the
platform's region; a US platform account cannot freely transfer to arbitrary-country accounts. This
is why geography is a grill fork (#7), not a footnote.

### 2.3 Onboarding flow (author-side)

1. Author (already premium-create-capable per FI-028's `canCreateCommunityPostForUser`) opens the
   **Earnings tab** (§3) → "Set up payouts" CTA.
2. Server creates the Express account + an **Account Link**, stores the account id on
   `CreatorPayoutAccount` (§4), redirects to Stripe-hosted onboarding (KYC, bank, tax info).
3. Return/refresh URLs land back on the Earnings tab; **status is never trusted from the
   redirect** — the `account.updated` webhook (new Connect webhook destination, prior art
   `docs/sprints/_archive/SESSION_0098.md`: `/api/stripe/connect/webhooks` +
   `STRIPE_CONNECT_WEBHOOK_SECRET`) updates `payoutsEnabled` / `requirementsDue` on the row.
4. Accrual (§4) is independent of onboarding — an author can earn before onboarding; balances just
   can't pay out until `payoutsEnabled` (and are forfeited/expired per grill fork #4's hold policy
   if never claimed — OPEN FORK on expiry horizon).

### 2.4 KYC / tax

Express pushes KYC and tax-identity collection into Stripe's hosted flow; US payees ≥ the IRS
reporting threshold get 1099s via Stripe's tax-forms product (enable at build time). BBL's plumbing
obligation shrinks to: store the account id, surface `requirementsDue`, and never move money to an
account that isn't `payoutsEnabled`. **The SoT set is silent on any creator legal agreement
(rev-share ToS, content licensing, payout terms) — OPEN FORK (operator/legal), tracked below.**

### 2.5 Payout cadence, threshold, hold

- **Cadence:** monthly period close (aligns with the 1/12 revenue recognition in Model B).
- **Minimum threshold:** balances below a minimum (recommend **$25**) roll over — avoids
  dust-transfer fees.
- **Settlement hold:** an earning line becomes *payable* only **30 days** after accrual — the
  clawback + content-theft window (§2.6, §5). SESSION_0098 listed payout timing as an undecided
  manual call; → **Grill fork #4.**

### 2.6 Refund / chargeback clawback

Refunds and disputes on membership subscriptions shrink the *pool*, not one author's line — but
fraud-driven earnings need direct clawback. Mechanism (append-only, §4): post **negative earning
lines** (`kind: CLAWBACK`) against the payee's accrued balance. Balance-offset-first; a Stripe
**transfer reversal** is the escalation path only for fraud/theft after money moved (reversals are
same-currency/limited — never the routine path). Clawback policy was explicitly left open in
SESSION_0098; the hold window (#4) is what makes balance-offset usually sufficient.

## 3. The author-earnings surface — where it lives

Argued against the AdminCollection law (ADR 0045,
`docs/architecture/decisions/0045-admin-collection-one-surface-law.md`) and the profile-surface
conventions:

- **Not `/me`.** `/me` (`apps/web/app/(web)/me/page.tsx`) is the **Passport identity** surface —
  the ONE profile editor per ADR 0025 (`PassportEditor` via the in-place `ProfileEditDrawer`).
  Money UI there would graft a second concern onto the identity surface.
- **Member-facing earnings → the member dashboard, beside billing.** The member's money-in surface
  already lives at `apps/web/app/(web)/dashboard/` (`billing-tab.tsx`,
  `billing-portal-button.tsx`), and so does member authoring (`techniques-tab.tsx`,
  `authored-technique-create.tsx`). An **Earnings tab** is the money-out sibling: payout-account
  status card (onboard CTA → requirements due → payouts enabled), accrued/payable balance, monthly
  statement list, per-post credit breakdown. Render the tab only for payout-eligible authors
  (create-capable per `canCreateCommunityPostForUser` — no new authz system; the repo already has
  four, `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` FI-028 row "no 5th authz").
- **Admin ops → an AdminCollection at `/app/payouts`.** Periods, payee accounts, earning/clawback
  lines, run approval, abuse flags are **admin record lists** — under ADR 0045 D1 they MUST be a
  conformed `AdminCollection` (columns + query, row → detail → one editor; no hand-rolled table),
  sibling to the existing admin money surfaces `apps/web/app/app/billing`, `/app/subscriptions`,
  `/app/entitlements`, `/app/pricing-plans`. The period detail's "approve payout run" is the one
  irreversible admin action (confirmation UX per the G-010 queue precedent,
  `docs/knowledge/wiki/goals-ledger.md` §G-010).
- **Tension flagged, not resolved:** SOT-ADR §D13 put the Instructor Hub *inside* the graduated
  `/app` dashboard — a plausible future where member self-serve surfaces migrate `/app`-ward. Until
  that migration is ratified, earnings follows where billing + authoring live today
  (`(web)/dashboard`); if the dashboard graduates, the tab moves with it. → **OPEN FORK (surface
  home), folded into grill #6's visibility discussion.**

## 4. Schema deltas

All additive; hand-authored migrations per the repo migration law (no `migrate dev` in shared-DB
worktrees — `docs/runbooks/database/`). Shapes (names final at ADR 0048):

```prisma
// Who can be paid. User-keyed: a payee must be a login-capable legal person —
// CommunityPost.authorId is already a User FK (schema, CommunityPost model), and a
// placeholder Passport (no User) cannot pass Connect KYC. Display joins reach the
// Passport per ADR 0025. (Payee-key fork → grill #8 note; techniques' authorPassportId
// resolves to its claimed User at credit time.)
model CreatorPayoutAccount {
  id                     String   @id @default(cuid(2))
  brand                  Brand
  user                   User     @relation(...)
  userId                 String   @unique
  stripeConnectAccountId String   @unique
  payoutsEnabled         Boolean  @default(false)
  requirementsDue        Json?
  weightMultiplier       Decimal  @default(1.0)   // Model C seam, dormant in v1
  status                 CreatorPayoutAccountStatus @default(ONBOARDING) // ONBOARDING|ACTIVE|SUSPENDED
  createdAt/updatedAt
}

// The attribution ledger — one row per entitled premium read-credit.
// Polymorphic subject (mirrors Bookmark's subjectType pattern, schema CommunityPost
// "Polymorphic Bookmark" comment) so premium Techniques join without a new table.
model CreatorEarningEvent {
  id            String   @id @default(cuid(2))
  brand         Brand
  subjectType   PremiumSubjectType   // COMMUNITY_POST (v1) | TECHNIQUE (fast-follow)
  subjectId     String
  authorUserId  String               // denormalized at write — author-at-read-time
  viewerUserId  String
  day           DateTime @db.Date    // dedupe grain
  createdAt     DateTime @default(now())
  @@unique([subjectType, subjectId, viewerUserId, day])  // one credit per viewer·post·day
  @@index([authorUserId, day])
}

// Monthly pool close.
model CreatorPayoutPeriod {
  id / brand / periodStart / periodEnd
  revenueCentsNet Int      // 1/12-recognized net premium-tier revenue (source → grill #2 + OPEN FORK)
  poolCents       Int      // % × revenueCentsNet
  poolBps         Int      // the % actually used, frozen per period
  status          CreatorPayoutPeriodStatus // OPEN|COMPUTED|APPROVED|PAID
  computedAt / approvedAt / approvedByUserId
}

// Append-only money lines. Negative amounts = clawback. kind keeps Model A addable.
model CreatorPayoutLine {
  id / periodId / payeeUserId
  kind             CreatorPayoutLineKind // POOL_SHARE | CLAWBACK | ADJUSTMENT (| CONVERSION_BONUS later)
  creditCount      Int
  weightShare      Decimal
  amountCents      Int                   // may be negative
  payableAt        DateTime              // accrual + hold window
  stripeTransferId String?
  status           CreatorPayoutLineStatus // ACCRUED|PAYABLE|HELD|PAID|FORFEITED
  clawbackOfLineId String?
  @@index([payeeUserId, status])
}
```

**Read-path integration (no gate rewrite):** the earning event is written where the *full* premium
payload is served — the entitled branch of the post read path
(`apps/web/server/web/community/post-access.ts` / the detail action in
`apps/web/server/web/community/actions.ts`) — never inside `gateCommunityPost` itself (the gate stays
a pure no-leak payload shaper, FI-028b's proven invariant). Exclusions at write: `viewer == author`,
admin viewers (their entitlement is RBAC not payment — `isCommunityPostViewerEntitled` already
distinguishes the arms, `POST_LAUNCH_SOT.md` FI-028b row); comp-tier viewers **counted** as weight
(audience is audience; pool is funded by paid revenue regardless) — OPEN FORK noted in grill #2.

**Revenue-base source (build-time verification):** whether net recognized premium revenue is read
from the local `Invoice`/`Payment` mirrors (`apps/web/prisma/schema.prisma` ~lines 1869–1935) or from
Stripe's API for the two lineage products (`BBL_STRIPE_PRODUCTS_SPEC.md`) — the SoT does not state
which mirror is authoritative for BBL membership subscriptions. **OPEN FORK / PR-4 verification
step; recommend Stripe-API-as-truth with the local ledger as cache.**

## 5. Abuse considerations

- **Self-dealing:** author-reads-own-post excluded at event write (§4). Author entitlement to their
  own locked post already exists in the gate (`isCommunityPostViewerEntitled`'s author arm) — the
  exclusion is one predicate away.
- **Read rings / scripted reads:** (a) the `@@unique` viewer·post·day grain caps a bot at 1
  credit/post/day; (b) add a **per-viewer daily contribution cap** across all content (e.g. a single
  viewer's reads count toward at most N credits/day, N ≈ 20) so a two-account ring can't farm the
  pool; (c) pool math means gaming steals share from *other authors*, not from BBL — expect
  author-side reports; surface per-author anomaly deltas (credits vs trailing average) on the
  `/app/payouts` AdminCollection detail (PR-6).
- **Conversion-model gaming:** the sharpest reason Model A is not v1 (§1) — self-referral upgrade
  bounties are trivially farmable with an alt account; if Model A bonuses are ever added
  (`CONVERSION_BONUS` line kind), gate them by the same hold window + admin approval.
- **Content theft (repost-to-earn):** premium-gating stolen content converts theft into cash flow —
  the settlement **hold window** (§2.5) exists so a takedown beats the payout. Requirements: a
  report path on premium posts, admin unpublish (existing `CommunityPostStatus`, schema
  `CommunityPost` model), and `SUSPENDED` payee status freezing lines at `HELD`. A formal
  DMCA-style policy is **OPEN FORK (operator/legal)** — nothing in the SoT set covers takedown
  policy.
- **Paywall-everything drift:** FI-028's authoring warning (double-listing/premium-divergence
  warn-at-authoring, `POST_LAUNCH_SOT.md` FI-028 row) already nudges at create; monitor the
  premium-share of new posts on the admin surface before considering caps.

## 6. Phased slice plan (PR-sized)

Sequential lane, one PR per slice; each PR passes the standard gates (typecheck / oxlint / oxfmt /
`bun run test`, `next build`; e2e where UI ships) and holds at the push gate per repo law
(`CLAUDE.md` push policy). All Stripe work rehearses in **test mode off-prod** first (SOT-ADR §D13;
`[bbl]` CLI profile per `BBL_STRIPE_PRICING_RUNBOOK.md`).

#### PR-1 — ADR 0048 + schema wave 1

- **Agent:** Cody (after operator grill resolves; ADR text = Petey/operator)
- **What:** Ratify the grill outcomes as **ADR 0048 — creator-payout model** (next free number after
  `docs/architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md`); add
  `CreatorPayoutAccount` + `CreatorEarningEvent` +
  enums (hand-authored additive migration).
- **Done means:** ADR merged; migration applies cleanly on a prodsnap copy; zero UI/behavior change.

#### PR-2 — Attribution capture

- **What:** Write earning events on the entitled full-payload read path (§4), with author/admin
  exclusion + viewer-day dedupe + per-viewer daily cap; negative-tests-first (the FI-028 pattern,
  `POST_LAUNCH_SOT.md` FI-028 row: "negative-tests-first").
- **Done means:** unit tests prove: no event for locked/teaser reads, none for author-self/admin,
  exactly one per viewer·post·day, cap enforced; no change to gate payload shapes (`post-gate.test.ts`
  untouched-green, `apps/web/server/web/community/post-gate.test.ts`).

#### PR-3 — Connect onboarding + Earnings tab shell

- **What:** Express account creation + Account Links flow; new Connect webhook destination
  (`/api/stripe/connect/webhooks`, `account.updated` → `payoutsEnabled`/`requirementsDue`;
  idempotent via the `StripeWebhookEvent` pattern); **Earnings tab** in
  `apps/web/app/(web)/dashboard/` (status card + accrued credits; no money yet), visible only to
  payout-eligible authors.
- **Done means:** test-mode Express account onboards end-to-end locally; webhook flips status;
  Desi reviews the tab (UI lane → Desi in the wave per the epic-lane recipe).

#### PR-4 — Period close + `/app/payouts` AdminCollection

- **What:** Schema wave 2 (`CreatorPayoutPeriod`/`CreatorPayoutLine`); monthly compute (net revenue
  base per the §4 verification fork → pool → weights → lines, threshold rollover, hold-window
  `payableAt`); conformed `AdminCollection` at `/app/payouts` (ADR 0045: columns + query +
  row→detail; approve action with confirmation).
- **Done means:** deterministic compute proven by fixture tests (known events + revenue → exact
  lines); an approved test period produces `PAYABLE` lines; AdminCollection passes the ADR 0045
  conformance check.

#### PR-5 — Transfer execution + clawback

- **What:** Approved-period transfer run (Stripe Transfers to `payoutsEnabled` accounts only);
  `transfer.*`/`payout.*` webhook handling (SESSION_0098 event list); refund/dispute → `CLAWBACK`
  negative lines with balance-offset-first policy.
- **Done means:** test-mode transfer round-trips; a simulated refund posts the negative line;
  reversal path documented-not-automated (fraud-only, admin-initiated).

#### PR-6 — Earnings detail + abuse hardening

- **What:** Author-facing per-post credit breakdown + monthly statements on the Earnings tab;
  anomaly deltas + payee `SUSPENDED` freeze + premium-share monitor on `/app/payouts`; content
  report → hold wiring.
- **Done means:** an author sees exactly the credits the ledger holds; suspending a payee freezes
  `PAYABLE→HELD`; Desi + Doug pass.

### Parallelism

Strictly sequential PR-1 → PR-5 (each consumes the prior's schema/seams). PR-6 can overlap PR-5
(disjoint files: author UI vs transfer job) if two worktrees are justified — default is one lane.

### Agent assignments

| Slice | Agent | Rationale |
| --- | --- | --- |
| Grill + ADR 0048 | Operator + Petey | Forks are product/legal calls, not build calls |
| PR-1…PR-5 | Cody, Doug verifying each | Clear execution once ADR ratifies; money code → Doug on every slice |
| PR-3, PR-6 | + Desi in the review wave | Member-facing UI (epic-lane recipe: Desi in the wave on UI lanes) |

### Risks

- **Legal surface is genuinely new** (creator agreement, tax edge cases, takedown policy) — the only
  G-009 workstream with no repo precedent at all; operator may need outside counsel before PR-5
  moves real money.
- **Revenue-base ambiguity** (§4 OPEN FORK): if local `Invoice`/`Payment` mirrors are not populated
  for BBL memberships, PR-4's compute must read Stripe directly — verify before building the job.
- **Tiny pool at current scale:** with near-zero paid subscribers (D13), monthly payouts round to
  dust — the threshold/rollover design is what keeps v1 honest rather than embarrassing.
- **Stripe-facts drift:** §2's Connect capabilities are external knowledge; re-verify Express
  tax-form + cross-border-transfer specifics against Stripe docs at PR-3/PR-5 build time.

### Scope guard

- No per-post purchases / tipping / one-off paid unlocks — that's a different monetization model;
  log separately if wanted.
- No school/org rev-share (the SESSION_0098 "org payout" branch) — G-009 is **author** payouts;
  lineage/org splits are a future goal.
- No public earnings displays before grill #6 resolves.
- Goals-ledger row updates ride the build sessions (a held lane owns the ledger at plan time —
  SESSION_0559 brief).

### Dirstarter implementation template

- **Docs read first:** <https://dirstarter.com/docs/integrations/payments> (2026-07-17)
- **Baseline pattern to extend:** the Stripe seam (`apps/web/server/web/billing/`,
  `apps/web/app/api/stripe/webhooks/`, `StripeCustomer`/`StripeWebhookEvent`) + `UserEntitlement`
  gating + the `AdminCollection` frame (ADR 0045) + the `(web)/dashboard` tab family
- **Custom delta:** Connect payout rail, attribution ledger, earnings surface — Dirstarter ships
  none of these (checkout + subscriptions only)
- **No-bypass proof:** nothing Dirstarter-owned is replaced; every new piece sits beside a confirmed
  gap in the live payments doc

## 7. Consolidated OPEN FORKS (SoT silent)

Grill list below carries the eight operator-facing forks. Additional open items the SoT is silent
on, tracked here so they aren't lost: **creator legal agreement / payout ToS** (§2.4); **DMCA-style
takedown policy** (§5); **unclaimed-balance expiry horizon** (§2.3); **revenue-base source of truth**
(§4, build-time verification); **comp-member reads as pool weight** (§4, recommended yes); **member
dashboard's eventual `/app` graduation** (§3, follow-the-billing-tab for now).

---

## GRILL LIST — the 8 operator forks

1. **Rev-share mechanics — pool vs bounty vs tiers?** → **Recommend Model B: engagement-weighted
   monthly pool** (schema keeps C = a dormant multiplier and A = a future line-kind). Membership
   revenue is pooled by nature, so pooled imputation is the only honest v1; conversion bounties are
   the most gameable option and pay ~everyone $0 at BBL's funnel size (§1).

2. **Pool % and base?** → **Recommend 20% of net (post-Stripe-fee) recognized Premium+Elite revenue,
   straight-lined 1/12 monthly**, frozen per period (`poolBps`), revisit at ≥100 paid members.
   Defensible midpoint: premium posts are one feature of membership (unlike Medium, where content is
   the whole product); 20% is a real incentive signal while structurally cost-capped. Sub-fork
   carried: comp-member reads count as weight (recommend yes — audience value; pool stays funded by
   paid revenue only).

3. **Express vs Standard accounts?** → **Recommend Express.** Stripe-hosted KYC + tax forms + payee
   dashboard-lite, platform keeps payout-schedule control (the hold window depends on it); Standard
   pushes full Stripe-account operation onto hobbyist authors (§2.1).

4. **Payout cadence / minimum / hold?** → **Recommend monthly close · $25 minimum with rollover ·
   30-day settlement hold before payable.** Monthly matches revenue recognition; $25 kills dust
   transfers; 30 days is the clawback + content-theft window that makes balance-offset the routine
   clawback path (§2.5–2.6).

5. **v1 scope — community posts only, or also premium authored techniques?** → **Recommend
   posts-only v1, techniques as a config fast-follow.** The ledger is polymorphic
   (`PremiumSubjectType`) from day one, so techniques (ADR 0046 authored variants,
   `Technique.isPremium`) join by adding an enum value + their read-path event write — no schema
   rework. Ship the simpler surface first; prove the loop.

6. **Earnings visibility?** → **Recommend private-to-author + admin only. No public earnings, no
   leaderboards in v1.** Public money numbers change posting culture irreversibly and create
   comparison/beef dynamics in a lineage community; revisit deliberately once real data exists.
   (Surface home rides along: Earnings tab in `(web)/dashboard` beside billing — §3.)

7. **Geographic scope?** → **Recommend US-only payees at v1**, others accrue balance until
   expansion. Separate transfers from a US platform account to cross-border connected accounts are
   restricted (§2.2), and US-only keeps year-one tax handling to one regime; the accrue-not-forfeit
   stance keeps international authors whole. (Assumes the BBL Stripe account is US-domiciled —
   verify at PR-3.)

8. **Grandfathering / retroactivity?** → **Recommend forward-only: accrual starts at ledger
   go-live.** No retroactive credit for pre-launch reads of existing premium posts (no events exist
   to compute from), but existing premium posts participate fully from day one. Mirrors FI-028b's
   forward-only grandfather stance (`POST_LAUNCH_SOT.md` FI-028b row: "default=free/public/
   grandfather"). Payee key note folded in: payouts bind to the **User** (login-capable legal
   person); technique authorship (Passport-keyed, ADR 0046) resolves to its claimed User at credit
   time — an unclaimed placeholder Passport cannot accrue (§4).
