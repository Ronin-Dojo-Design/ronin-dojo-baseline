---
title: "SESSION 0472 — BBL Lane: membership-tier access model (plan-first grill)"
slug: session-0472
type: session--plan
status: closed
created: 2026-06-29
updated: 2026-06-29
last_agent: claude-session-0472
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0471.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0472 — BBL Lane: membership-tier access model (plan-first grill)

> **PRE-STAGED at SESSION_0471 close** (operator-supplied lane). This session is **plan-first**: a Petey
> grill that ratifies the operator's 3-tier access model, reconciles it against what BBL already ships
> (especially the **live** Premium/Elite paid tiers), and locks scope **before** Cody writes any code.
> The matrix below is a **first-pass hypothesis** — every "ships/new" cell MUST be verified against the
> BBL SoT set + the live app during preflight (never assert present/missing from memory).

## Date

2026-06-29 (pre-staged; executes next session)

## Operator

Brian + claude-session-0472

## Goal

Ratify the BBL membership-tier access model (Public free / Standard $65 / Black Belt $45) and produce a
locked **tier → capability → reuse-vs-build matrix**: confirm pricing intent, reconcile the proposed tiers
with the LIVE Premium/Elite Stripe products (the real risk + migration lane), define the tier↔belt-rank
coupling rule, and size the one genuinely-new surface (the Instructor Hub, 7 tabs). No code until the grill
resolves the four open decisions.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0471.md` (Giddy git-hygiene + hostile-repo-review close).
- Carryover: SESSION_0471 staged this lane in its Next-session block. The repo-health/git-hygiene sprint
  (S48) is complete (lean-out exhausted). This opens the BBL product lane (S49).
- **BBL read-path (opening.md §0 — the ONLY first-read for BBL):** `BBL-SOT-Spec.md` → `SOT-ADR.md` →
  `PRD.md` → `STORIES.md` → `CUTOVER_CHECKLIST.md` → `GAP_MATRIX.md` (re-verify GAP_MATRIX vs the live app).

### Branch and worktree

- Branch: `main` (or a `session-0472-bbl-tiers` worktree if the build half is dispatched)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean ✅
- Current HEAD at bow-in: `c445ce3c`

### Read-path executed (TASK_01 prep)

- **SoT set read:** BBL-SOT-Spec · SOT-ADR (D1–D12) · PRD · STORIES · GAP_MATRIX (grep) · CUTOVER (grep)
  + the two on-point specs the §0 set pointed to: `GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md`,
  `BBL_STRIPE_PRODUCTS_SPEC.md`, and `ADR 0012` (tier auto-grant).
- **Live code verified** (not asserted from memory): `lib/entitlements/lineage-comp.ts` (cumulative keys
  `LINEAGE_PREMIUM ⊂ ELITE ⊂ LEGEND`), `lib/entitlements/lineage-tier-policy.ts` (the render read-model:
  free→listing; premium/elite/legend→**identical** full card/profile), `scripts/seed-bbl-lineage-pricing.ts`,
  `app/api/stripe/webhooks/bbl/route.ts`, `server/web/billing/lineage-membership.ts`.
- **Monorepo harvest done** (read-only, `ronin-dojo-monorepo/src/brands/blackbeltlegacy`): legacy tier ladder
  FREE→PREMIUM→INSTRUCTOR→SCHOOL_OWNER→LEGEND, priced Premium $59.99/yr / Instructor **$499/yr** (top tier =
  priciest), gated by **admin-approved role request, NOT belt rank**. Instructor Hub = 8 dashboard tabs
  (`BBLDashboard.jsx` + `dashboardConfig.js`); Seminar/Calendar + Instructor Portal **absent** in BBLApp.
- **Prodsnap verified** (`ronindojo_prodsnap`, 10 users): 4 BBL lineage plans LIVE & sellable (real
  `price_…`/`prod_…`); **paid subscribers = 0**, `UserBrandSubscription` BBL = 0 rows; only 1 comped
  (MANUAL_GRANT) Elite user. → **No payer base to migrate** (confirm vs live Stripe before any product edit).

## Petey plan

### Goal

Ratify the tier model + lock the reuse-vs-build matrix via a grill on four open decisions; hand a scoped,
migration-aware slice to Cody only after the grill closes.

### The operator's proposed model (the input to ratify)

| Tier | Price | Gate | Surfaces |
| --- | --- | --- | --- |
| **Public** | free, no account | none | Home (lineage tree + Dirty Dozen + videos) · Directory (browse/search approved members by belt & academy) · Public Profile (verified profile + lineage + promotion history) · Academies (browse) · Seminars (browse + register) · Learn (free articles + public videos) |
| **Standard** | $65/yr | active paid (White/Blue/Purple/Brown) | all Public + Private Profile (edit info, upload photo, belt history + lineage tree) · profile edit (belt/rank change → admin re-approval) · certificate download · 20% in-network seminar discount · members-only Video Library (active-paid-gated) |
| **Black Belt** | $45/yr | active paid + awarded black belt | all Standard + **Instructor Hub (7 tabs):** My Academy dashboard · Lineage editor · Student tracker · Academy info management · Seminar creation/mgmt + Calendar · Technique library · Instructor Portal (email login → profile editor + view academy's students) |

### Tier → capability → reuse-vs-build matrix (FIRST-PASS — verify every row in preflight)

| Capability | Tier | Hypothesis | Likely reuse target / module |
| --- | --- | --- | --- |
| Home (lineage tree + Dirty Dozen + videos) | Public | ships | landing + lineage canvas (View A timeline / View B) + video embeds |
| Directory (search by belt & academy) | Public | ships | directory module + `ListingCard` + facet bar |
| Public Profile (verified profile + lineage + promo history) | Public | ships | `projectPublicPassport` DTO + lineage drawer (opens for everyone → claim CTA) |
| Academies (browse listings) | Public | ships | directory org/school listings (Affiliation-backed) |
| Seminars (browse + register) | Public | **verify** | seminars/events module — confirm public register flow exists |
| Learn (free articles + public videos) | Public | ships | blog/content + public video |
| Private Profile (edit, photo, belt history, lineage) | Standard | ships | profile editor + avatar upload + `RankAward` history |
| Belt/rank edit → admin re-approval | Standard | ships | profile/claim re-approval (`ProfileClaimRequest` / rank-change review) |
| Certificate download | Standard | **likely new** | cert generation — confirm none exists |
| 20% in-network seminar discount | Standard | **new** | seminar pricing + entitlement-gated discount |
| Members-only Video Library (active-paid gate) | Standard | ships (gate) | comp gate + video library + entitlement check |
| Instructor Hub — My Academy dashboard | Black Belt | **new shell** | dashboard composing existing academy/roster data |
| Instructor Hub — Lineage editor | Black Belt | ships | lineage canvas `editMode` (existing) |
| Instructor Hub — Student tracker | Black Belt | **maps to platform module** | CRM/leads module (the one Mammoth exercises — North Star: any feature on any project) |
| Instructor Hub — Academy info management | Black Belt | ships | org/school profile edit (Affiliation) |
| Instructor Hub — Seminar creation/mgmt + Calendar | Black Belt | **partial/new** | seminars module + a calendar surface (likely new) |
| Instructor Hub — Technique library | Black Belt | **WIP exists** | `codex/technique-graph-curriculum` branch (kept at 0471) + video — DON'T clean-room |
| Instructor Hub — Instructor Portal (email login + view students) | Black Belt | ships (auth) + new (student roster view) | Better Auth magic-link + academy student roster (via LineageTree/Affiliation, NOT Membership) |

### Tasks

#### SESSION_0472_TASK_01 — Petey: read the BBL SoT set, then grill the 4 open decisions

- **Agent:** Petey
- **What:** Resolve the four open decisions below; produce the locked tier→capability→reuse-vs-build matrix.
- **Steps:** read the SoT set (§0 read-path) → grill pricing intent (#1), the LIVE-tier reconciliation + migration (#2), the tier↔rank coupling (#3), reuse-first inventory (#4) → lock scope.
- **Done means:** 4 decisions resolved; matrix verified vs SoT + live app; build slice scoped + sequenced.
- **Depends on:** nothing.

#### SESSION_0472_TASK_02 — Petey/Giddy: Stripe-tier reconciliation + migration plan (the real risk)

- **Agent:** Petey + Giddy
- **What:** Determine whether Standard/Black Belt rename/restructure the LIVE Premium/Elite tiers or are net-new; if restructure, write the Stripe-product + webhook-metadata + existing-payer migration plan.
- **Done means:** a decision + (if needed) a migration plan rehearsable off-prod (Stripe test-mode), ADR if architectural.
- **Depends on:** TASK_01.

#### SESSION_0472_TASK_03 — Cody: scoped build slice (only after the grill closes)

- **Agent:** Cody (cody-preflight first)
- **What:** Build the highest-value, lowest-risk slice the grill locks — reuse-first; no new components without preflight justification.
- **Done means:** TBD by the grill — likely the access-gate/entitlement wiring, not the Instructor Hub (largest new surface, sequence later).
- **Depends on:** TASK_01, TASK_02.

### Open decisions the grill MUST resolve (before any code)

1. **Pricing inversion — Black Belt $45 < Standard $65.** Intentional (subsidize the supply side — the
   instructors/lineage-holders who populate the graph = the asset; optimizes the claim loop)? Or transposed?
2. **Reconcile with the LIVE paid tiers.** BBL runs **Premium/Elite paid LIVE** (`cs_live`, webhook keyed off
   `metadata.userId` — `[[bbl-paid-live-and-e2e-green]]`). Is Standard/Black Belt a **rename/restructure** of
   Premium/Elite or **net-new**? Restructure → existing payers + Stripe products + webhook metadata need a
   migration plan. **This is the real engineering risk — not the spec.**
3. **Tier ↔ belt-rank coupling.** Rank is awarded-truth from `RankAward` (`[[lineage-rank-display-awarded-truth]]`).
   Define the rule for a Standard member **promoted to black belt mid-membership** (auto tier move? price
   change? entitlement flip?). This edge fires constantly in a lineage product.
4. **Reuse vs build.** Most surfaces ship (directory, public profile, lineage, comp gate, video gating).
   The genuinely-new weight is the **Instructor Hub (7 tabs)** — and it maps to existing platform modules
   (student tracker = CRM/leads; lineage editor exists; technique library = the kept `codex` WIP branch).
   Inventory reuse-first (`cody-preflight`) before specing new components.

### Risks

- **Touching live money.** Any Premium/Elite restructure touches prod payments — rehearse off-prod (Stripe
  test-mode), never against `cs_live` unrehearsed.
- **Scope creep via the Instructor Hub.** 7 tabs is a multi-session build; do NOT try to land it in one.
- **Asserting capability present/missing from memory.** Verify every matrix row against the SoT set + live
  app + domain hubs; never assert a negative from an errored/empty search.

### Scope guard

- No code until the grill (TASK_01) closes the 4 open decisions.
- Don't clean-room the technique library — extend the kept `codex/technique-graph-curriculum` WIP.
- Don't scope academy students by `passport.user.memberships` — BBL members are placeholder Passports via
  LineageTree/Affiliation (`[[bbl-roster-via-lineage-tree]]`).

## Cody pre-flight

<!-- Run before TASK_03 only — after the grill locks scope. See docs/protocols/cody-preflight.md. -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0472_TASK_01 | done | Petey grill: SoT set + monorepo harvest + prodsnap + authz audit → ratified the tier model (D472-1..8) |
| SESSION_0472_TASK_02 | done (plan) | Stripe reconciliation: **no payer migration** (0 subscribers) → reprice/rename/reseed plan defined (D472-2); rehearse off-prod test-mode before any live product edit |
| SESSION_0472_TASK_03 | deferred | Cody build slice — **plan-only this session** (operator); sequenced for a build session |

## What landed

Plan-only (session--plan). The Petey grill **ratified the membership-tier access model** and produced the
locked tier → key → capability map below, grounded in the SoT set + the monorepo BBLApp harvest + a
prodsnap verification + an evidence-backed authz-systems audit (no assertions from memory). **No code** —
TASK_03 deferred to a build session (operator: plan-only).

**The ratified model (4 tiers = the 4 existing entitlement keys; annual-only):**

| Tier (customer label) | Internal key | Price | Public render | Verification | Instructor Hub |
| --- | --- | --- | --- | --- | --- |
| **Free Member** | *(account only)* | Free | listed under instructor + **avatar** + **self-declared belt** (unverified badge) | — | — |
| **Premium Member** | `LINEAGE_PREMIUM` | **$35/yr** | full public profile (bio/links/rank history/QR) + members-only video library + cert download | **unlocks submit-for-verification** | — |
| **Elite Member** | `LINEAGE_ELITE` | **$65/yr · $45 black belt** | = Premium | = Premium | **Instructor / School-Owner Hub** |
| **Legend Member** | `LINEAGE_LEGEND` | **comp-only** (lifetime/termed) | = Premium | granted | everything |

Cumulative (`LINEAGE_PREMIUM ⊂ ELITE ⊂ LEGEND`) — already the code's model (`lib/entitlements/lineage-comp.ts`).

## Decisions resolved

- **D472-1 — Pricing inversion = intentional supply subsidy (RATIFIED).** Black-belt instructors pay
  **less** for the instructor tier ($45) than non-black-belt instructors ($65). Belt rank is a **price**
  axis, not a feature axis — it rewards the verified black belts who anchor the lineage (North Star: revenue
  is exhaust, optimize the claim loop). Reverses the legacy model (BBLApp Instructor was $499/yr, the
  *priciest* tier).
- **D472-2 — Tiers map 1:1 onto existing entitlement keys; NO payer migration.** Prodsnap (`ronindojo_prodsnap`,
  10 users) shows **0 paid subscribers**, `UserBrandSubscription` BBL = 0 rows, only 1 comped Elite user. The
  4 BBL lineage `PricingPlan`s are live & sellable (real BBL-account Stripe ids). So the "Stripe migration
  risk" is **reprice/rename + reseed + archive old prices**, not a customer-subscription migration. (Confirm
  0 payers against the **live** Stripe dashboard before editing products — snapshot can lag.)
- **D472-3 — Tier↔rank coupling = rank gates the $45 PRICE only (eligibility), not features.** Resolver
  already exists: `buildBeltProgressions()` (`lib/lineage/rank-progression.ts`), current rank = highest
  awarded `RankAward.sortOrder`. Promotion flips price-eligibility, **never auto-bills** (opt-in). Hub access
  = holding `LINEAGE_ELITE` (anyone can buy); academy/student/lineage surfaces **auto-light-up** only where
  the user holds an `Affiliation` (`TEACHES_AT`/`HEAD_INSTRUCTOR`) / `LineageTreeAccess` scope. Student roster
  sources off the **LineageTree** (per `[[bbl-roster-via-lineage-tree]]`), academy-info off Affiliation/org.
- **D472-4 — Verification = RBAC-reviewed, never auto on payment (moat preserved).** Free = self-declared /
  unverified belt; a steward review (evidence → `VERIFIED` badge) is required — payment never auto-stamps
  verified (SOT-ADR D6; a bought badge is worthless). **⚠ REVISED by D472-15:** verification is **open to
  anyone** and runs on **regular registration** (not Premium-gated) — Premium's value moves to full profile +
  video + cert, not the badge.
- **D472-5 — Comp/gift = ALREADY BUILT (not spaghetti).** `grantUserComp(userId, tier∈{Premium,Elite,Legend},
  termDays|null, reason)` (`server/admin/entitlements/actions.ts:114`) comps **any** tier to anyone,
  lifetime or termed, audited — plus auto-comp on claim-approve (`claim-finalize.ts`) and invite-accept
  (`server/invites/actions.ts`). Legend = `tier: LEGEND, termDays: null`.
- **D472-6 — Consolidation/cruft (evidence-backed audit).** KEEP (load-bearing): `UserEntitlement` = the
  **single** access gate; `PricingPlan`+`EntitlementGrant` = Stripe→entitlement wiring; `Role` =
  media/lineage-editor authz (orthogonal, NOT a tier); `UserRole` + `LineageTreeAccess` = admin RBAC +
  per-tree scope. **RETIRE for gating:** `SubscriptionTier` + `UserBrandSubscription` (0 rows, **nothing
  reads them** — the parallel "tier ladder" that read as spaghetti in the admin). **KEEP + start reading:**
  `AffiliationRole` (display-only today; becomes the academy-scope signal). **FIX gap:** seed the missing
  `LINEAGE_LEGEND` `Entitlement` row (prodsnap has only PREMIUM + ELITE → comping Legend would fail).
- **D472-7 — Instructor Hub shell = ONE graduated `/app` dashboard** (not a separate hub). Instructor tabs
  unlock at Elite; locked tabs = an upgrade funnel for lower tiers. **~all 7 tabs already exist as `/app`
  routes** (`/app/events`=Promotions, `/app/schedule`=Calendar, `/app/certificates`, `/app/lineage/[treeId]/edit`,
  `/app/organizations`, `/app/techniques`+`/app/content`+`/app/posts`, `/app/profile`, `/app/leads`). The real
  work is **scoping** those admin areas to instructor-self-service (SOT-ADR D4 resource grants) + a
  tier-graduated nav. **Only genuine gap:** a **Seminar** entity (+ the 20% in-network discount) wired into
  the existing Calendar component (`/app/events` Promotions is the pattern).
- **D472-8 — Free avatar upload abuse control = reuse `lib/rate-limiter.ts`.** Mirror the `evidence_upload`
  bucket (public, **IP-keyed**, fail-closed); add an `avatar_upload` bucket + `isRateLimited(await getIP(),
  "avatar_upload")`. No new dependency (already on Upstash).

### Instructor Hub grill (tab-by-tab — grounded in a 2nd `/app`-inventory agent pass)

- **D472-9 — Hub shell = ONE graduated `/app` dashboard + an `InstructorRail`.** The graduated-nav mechanism
  already exists: `components/app/sidebar.tsx` `buildVisibleLinks()` filters by `can(user, permission)` and
  there is already a `BblMemberRail` (simplified member nav). Add an `InstructorRail` (gated by owns-an-org /
  `instructor.*`) between member and admin. **The scariest scoping is already built** — the Lineage editor is
  instructor-scoped via `LineageTreeAccess` resource grants (`findLineageTrees` → only your `TREE_ADMIN`
  trees; `requireLineageAccess` guard). Tab verdicts: Lineage editor + Instructor-portal profile =
  **REUSE-AS-IS**; Leads/Content = **REUSE+SCOPE**; My-Academy-dashboard + students-roster + academy-info
  edit + technique-list-page = **BUILD** (but on existing models/FKs). Genuine new build is ~5 scoped views,
  not 7 features.
- **D472-10 — Student tracker = the lineage roster (build), Leads later.** "My students" = placeholder
  Passports under the instructor's lineage node (`[[bbl-roster-via-lineage-tree]]`), NOT the Leads CRM
  (prospects = Mammoth lane). Build one `findStudentsUnderInstructorNode` query + view for go-live; add the
  Leads/prospects pipeline later. **Fold into ONE "Students" workspace** with an internal **tabbed feel**
  (Roster · Invites · Approvals · Promote) — reuse the existing sub-tab pattern (`/app/profile` Suspense
  tabs / directory segmented control), one nav item, tabs inside. Promote = `RankAward` via the existing
  promotion flow.
- **D472-11 — Earnings = stub/placeholder** (coming-soon); analytics/revenue **out** for go-live (the
  platform doesn't run academies' billing).
- **D472-12 — Seminar = `Event{type: SEMINAR}` (NO new entity).** `SEMINAR`/`WORKSHOP` are already
  `EventType` values; the `Event` model already has capacity, `feeCents`/currency, `requiresWaiver`, status,
  org-scope, and **`EventRegistration`** (browse + register + pay) — it's just barely wired. The **`Event` is
  the seminar record**; a `Post` is an optional **announcement** layer on top (don't model seminar→post, that
  loses registration/fees). BBLApp `EVENT_TYPES` map: seminar→`SEMINAR`, social→add `SOCIAL`,
  belt-test→`PromotionEvent`, tournament→out of BBL scope.
- **D472-13 — `Event` ↔ `PromotionEvent` = distinct tables + ONE FK link.** Add `PromotionEvent.eventId →
  Event?` (a seminar `Event` **has-many** promotion ceremonies; standalone promotions keep `eventId=null`).
  Media already shared (`MediaAttachment` polymorphic). **No base-table merge** (keeps the lineage-provenance
  moat off the commerce table; the shared name/date/location fields are shallow and each model stands alone).
  Consolidation that matters is in the **UI**: one "Events" Hub tab + public page surfaces seminars and
  promotions together.
- **D472-14 — IA: `/app/events` = the general `Event` surface (seminars/camps/socials); promotions move to
  the lineage area** (they're provenance + feed the timeline). Added an **IA (Information Architecture)**
  definition to `docs/architecture/ubiquitous-language.md` (operator request).

**Genuine new build for the Hub epic (everything else reuses/wires):** (1) instructor-scoped academy
dashboard, (2) `findStudentsUnderInstructorNode` roster query + Students workspace, (3) wire the existing
`Event`/`EventRegistration` seminar surfaces (admin manage + public browse/register) + the `PromotionEvent.eventId`
link, (4) org-scoped technique **list page** (model has the FK), (5) owner-scoped academy-info edit. The
`InstructorRail` nav + the reuse-as-is tabs are wiring.

### Verification + registration on-ramp grill (the biggest missing piece — operator-flagged)

- **D472-15 — Verification is OPEN to anyone, runs on REGULAR REGISTRATION; claim is the rare admin path.
  (Revises D472-4.)** The operator reframed: *claiming* only happens on placeholder nodes the admin seeds
  (imported WP cohort / lineage holders) — its Elite-year auto-comp was a one-time **loyalty gift** for
  migrating existing customers, NOT the on-ramp. The **common path is registration**, and the
  review/verification machinery must run there. **Verification is decoupled from payment** — the moat is the
  verified graph, so everyone should be verifiable; **Premium ($35) earns its price on full profile + video +
  certificate, NOT the verified badge** (free render already splits minimal-vs-full this way).
  - **Reuse win:** the "fresh member submits rank for review" path is **~70% modeled** — `PassportClaimRequest`
    already carries `claimedRank` (→ mints the `VERIFIED` `RankAward` on approve, ADR 0035), `trainedUnderNode`
    (declared instructor, combobox ref+text), `claimedSchool`, `evidence[]`, and **optional `node`/`tree`** (works
    with no existing placeholder). Build delta = (a) the fresh-submit **UI door** (today's join form is hard-wired
    to claim an existing node), (b) the **no-node approve branch** (create + place a new `LineageNode` under
    `trainedUnderNode`), (c) **instructor-reviewer routing**, (d) the **dedup** gate.
  - **Verifier = instructor-delegated, admin fallback** — the declared instructor (branch-head w/ `LineageTreeAccess`)
    verifies their own students; admin is the fallback. Scales verification off the operator's desk; lineage-native.
  - **Auto-placement = on submit, with a `pending/unverified` badge** — the node is placed under the instructor
    immediately (free-tier "immediate value / listed under my instructor"), flips to `VERIFIED` on approval. Spam
    held back by instructor review + dedup + IP rate-limit.
  - **Off-platform instructor = mint a placeholder instructor node + invite them** — free-text instructor → a
    placeholder the student is placed under, pending, + an invite. Their pending students become the **viral hook**
    that pulls the instructor onto the platform (the claim loop).
  - **Dedup = detect + route to claim, instructor confirms** — a likely name+instructor match routes the submission
    to claim the existing placeholder (set `nodeId`) and surfaces it to the reviewer to confirm; **no auto-merge**.
  - **Net:** registration + verification become the primary graph-growth loop (instructor-reviewed, self-service,
    viral), with `PassportClaimRequest` as the single review queue and `claim` reserved for admin-seeded migration.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0472.md` | grill ratified the tier model (D472-1..8) + Instructor Hub scope (D472-9..14) + locked tier table + reprice/refactor plan |
| `docs/architecture/ubiquitous-language.md` | +`IA (Information Architecture)` definition (operator request, D472-14) |

> Read-only this session: SoT set (`docs/product/black-belt-legacy/*`), live entitlement/billing code
> (`lib/entitlements/*`, `scripts/seed-bbl-lineage-pricing.ts`, `server/admin/entitlements/actions.ts`,
> `lib/rate-limiter.ts`), the monorepo BBLApp (`ronin-dojo-monorepo/src/brands/blackbeltlegacy`, harvest),
> and the prodsnap DB (verification queries). No app code changed.

## Verification

Plan-only session — "verification" = the evidence reads that grounded every decision (verify-don't-assert).

| Command / smoke | Result |
| --- | --- |
| prodsnap payer query (`Bun.SQL`) | BBL lineage: **0 paid subscribers**, 0 `UserBrandSubscription` rows, 1 comped Elite — no payer migration |
| prodsnap entitlement rows | `LINEAGE_PREMIUM` + `LINEAGE_ELITE` present; **`LINEAGE_LEGEND` MISSING** → seed in S1 |
| comp action (`server/admin/entitlements/actions.ts:114`) | `grantUserComp(tier∈{Premium,Elite,Legend}, termDays)` — any-tier comp already BUILT |
| `/app` route inventory (agent) | ~all 7 Hub tabs exist as routes; lineage editor already instructor-scoped via `LineageTreeAccess` |
| `Event`/`EventType` read | `SEMINAR`/`WORKSHOP` already `EventType`; `Event`+`EventRegistration` = full seminar model (capacity/fee/register) |
| `PassportClaimRequest` read | already carries `claimedRank`+`trainedUnderNode`+evidence+optional node → fresh-submit ~70% modeled |
| `bun run wiki:lint` | 0 errors, 15 warnings (all pre-existing in untouched files; this session's docs introduced none) |

## Open decisions / blockers

- **All grill decisions RESOLVED** (D472-1..15: tier model, Instructor Hub scope, verification on-ramp). No
  external blocker on the planning.
- **Operator action for S1 (SESSION_0473):** create the live BBL-account Stripe prices ($35/$65/$45 annual) +
  supply the `price_…` env vars (`BBL_STRIPE_PRODUCTS_SPEC.md`). S1 stages rows + rehearses off-prod until then.
- **Push:** changes committed at close; **awaiting operator "go" before push** (explicit-push-authorization).

## Build sequencing (epic plan)

Plan-only output (TASK_03 deferred). Ordered, dependency-aware slices, ~1 session each unless noted.
**Reuse-first** — most is wiring/scoping. **Per-slice gates:** typecheck · oxlint · oxfmt · `bun run test`
(touched areas) · browser-proof on `bbl.local`. **Stripe fence:** S1 rehearses off-prod (test-mode, BBL
account) and re-confirms 0 live payers before any live product edit; never `cs_live` unrehearsed.

### P1 — Foundation (tiers + free render) · lowest risk, unblocks the customer tiers

- **S1 — Tier reprice + consolidate.** Seed `LINEAGE_LEGEND` entitlement row; reprice/relabel `PricingPlan`s
  (Premium **$35**, Elite **$65** + new **$45 black-belt-rate**), **annual-only** (drop monthly); archive old
  $59.99/$299 Stripe prices; black-belt eligibility (`buildBeltProgressions`) on the $45 plan; deprecate the
  `SubscriptionTier` ladder for gating. Depends: none. Gate: off-prod Stripe grant+revoke rehearsal,
  `/lineage/join` lists 3 plans.
- **S2 — Free tier render + avatar + rate-limit.** Free render policy (avatar + self-declared belt + listed
  under instructor); `avatar_upload` IP rate-limit bucket (mirror `evidence_upload`); unverified-belt display
  (highest `STATED` award + badge). Depends: none (parallel w/ S1).

### P2 — Verification on-ramp (the growth engine) · ~70% modeled in `PassportClaimRequest`

- **S3 — Fresh-member rank-submission door.** "Add yourself to the lineage" form → `PassportClaimRequest`
  (no `nodeId`) with `claimedRank` + `trainedUnderNode` + `claimedSchool` + evidence; reuse CreatableCombobox
  selectors. Depends: S2.
- **S4 — No-node approve branch + placement.** Finalize creates a `LineageNode` placed under `trainedUnderNode`
  + mints the `VERIFIED` `RankAward` (reuse ADR 0035 claim→award); pending-badge node visible on submit.
  Depends: S3.
- **S5 — Instructor-reviewer routing + dedup + off-platform invite.** Route review to the `trainedUnderNode`
  branch-head (`LineageTreeAccess`), admin fallback (reuse + scope the claim-review surface); dedup
  detect→route-to-claim (reviewer confirms); off-platform instructor → mint placeholder + invite. Depends: S3, S4.

### P3 — Instructor Hub epic (largest; instructor tooling)

- **S6 — InstructorRail nav + tier-gated shell.** `InstructorRail` (between `BblMemberRail` and admin), gated by
  Elite / owns-org (reuse `buildVisibleLinks`); expose the reuse-as-is tabs (lineage editor — already scoped;
  profile/portal — already self-scoped). Depends: S1.
- **S7 — Student roster + Students workspace.** `findStudentsUnderInstructorNode` + tabbed Students workspace
  (Roster · Invites · Approvals · Promote); reuse invite + promotion flows. Depends: S6. (~1–2 sessions.)
- **S8 — Academy dashboard + academy-info edit.** Instructor-scoped overview (compose org stats/students/events)
  + owner-scoped academy-info (contact/socials). Depends: S6.
- **S9 — Technique library.** Org-scoped technique **list page** (model has the FK) + content scope + extend the
  kept `codex/technique-graph-curriculum` WIP. Depends: S6.
- **S10 — Seminars + unified Events.** Wire `Event`/`EventRegistration` surfaces (admin manage + public
  browse/register), the `PromotionEvent.eventId` link, the unified "Events" view, + the 20% in-network discount
  (entitlement-gated at registration). Depends: S6, S1. (~1–2 sessions.)

**Fold-in:** certificate download (Premium) — small, fold into S2 or S8. **Honest total ≈ 10–12 sessions.**
Each slice is independently shippable + verifiable; the operator can pull any one directly from this list.

## Next session

### Goal

Build the ratified epic, **starting two parallel tracks at once** (both prestaged): **SESSION_0473 (S1 — tier
reprice + consolidate, track A)** and **SESSION_0474 (S2 — free render + avatar + rate-limit, track B)**. Each
is self-contained in its own worktree (disjoint files). Full slice order in the **Build sequencing** block above.

### First task

Dispatch **S1 (SESSION_0473)** and **S2 (SESSION_0474)** in parallel worktrees (`session-0473-tier-reprice`,
`session-0474-free-render`). S2 is fully self-contained (start anytime); S1 gates on an off-prod Stripe
rehearsal + the operator supplying live price ids. Then track A → S6 (Hub shell) → S7–S10; track B → S3 → S4 → S5
(verification on-ramp).

## Review log

### SESSION_0472_REVIEW_01 — Plan-first grill ratification

- **Reviewed tasks:** SESSION_0472_TASK_01 (grill — done), TASK_02 (Stripe reconciliation — done-plan), TASK_03 (deferred).
- **Dirstarter docs check:** not applicable — no Dirstarter baseline layer changed (reuses the existing
  entitlement/Stripe spine; the reprice is config, planned for S1).
- **Verdict:** A disciplined plan-first session. Every "ships/new" cell was verified against live code +
  prodsnap + the monorepo harvest, never asserted from memory — which repeatedly *shrank* the build (the
  seminar "gap" was already an `EventType`; the verification on-ramp is ~70% modeled in `PassportClaimRequest`;
  comp-any-tier already ships). The tier model collapsed cleanly onto the 4 existing entitlement keys; the
  cruft is one dead ladder. Zero code committed, as agreed.
- **Score:** 9/10 — strong plan quality; −1 because the verification/registration on-ramp expanded scope late
  and is a larger sub-epic than the original tier goal (correctly captured, deserves its own ADR pass when built).
- **Follow-up:** S1 (SESSION_0473) + S2 (SESSION_0474) prestaged; SOT-ADR **D13** records the model; the
  `SubscriptionTier`-vs-entitlement drift is logged → retired in S1.

## Hostile close review

- **Giddy:** pass — decisions are evidence-grounded (file:line + prodsnap), reuse-first, no new authz system
  (entitlements stay the single gate), no Dirstarter divergence; tier model maps 1:1 to existing keys.
- **Doug:** pass — no runtime surface touched (plan-only); the live-Stripe fence is explicit in every build
  slice (off-prod rehearsal + 0-payer re-confirm before any live edit); verification stays RBAC-reviewed (moat).
- **Desi:** pass — Hub IA ratified (one graduated `/app` + `InstructorRail`, reuse-first); the "tabbed feel"
  Students workspace uses the existing sub-tab pattern. No UI built this session.
- **Kaizen aggregate:** 9/10 — exemplary verify-don't-assert discipline; the only ding is late scope growth.

## ADR / ubiquitous-language check

- ADR update **required** — recorded as **SOT-ADR D13** (`docs/product/black-belt-legacy/SOT-ADR.md`): the
  ratified BBL membership-tier + verification-on-ramp model. No Dirstarter baseline layer changed (reuses the
  existing entitlement/Stripe spine), so no Dirstarter-docs proof table is needed.
- Ubiquitous language update **done** — added **IA (Information Architecture)** to
  `docs/architecture/ubiquitous-language.md` (operator request). No other new domain terms (tier names are
  customer labels over the existing `LINEAGE_*` keys).

## Reflections

- **"Verify, don't assert" repeatedly shrank the build.** Every "gap" checked against live source turned out
  mostly built: seminars are already an `EventType` with full registration/fees; the operator-flagged "biggest
  missing piece" (fresh-member rank submission) is ~70% modeled in `PassportClaimRequest` (`claimedRank` +
  `trainedUnderNode` + evidence + optional node); comp-any-tier already ships. The operator's calibration
  ("more wiring than building") was right; my harvest-summary estimate was pessimistic — grounding in source beat it.
- **The prodsnap was the single highest-leverage check.** One `Bun.SQL` query (0 paid subscribers) turned the
  session's framed "real risk" (payer migration) into a clean reprice. Knowing the installed base is the
  difference between a scary migration and a config change.
- **Scope grew late but correctly.** The grill drifted from "tier model" into the verification/registration
  claim-loop — a larger sub-epic, and the right North-Star territory. Captured in D472-15 + the build plan;
  worth its own ADR pass when S3–S5 land.
- **IA is load-bearing.** The `Event` vs `PromotionEvent` split (commerce vs lineage-provenance) only stayed
  clean because we separated data-modeling from IA from visual design — hence the new glossary term.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `ubiquitous-language.md` `last_agent`→claude-session-0472 (`updated` already 2026-06-29); `SOT-ADR.md` bumped; SESSION_0473/0474 created with full frontmatter; SESSION_0472 `status`→closed |
| Backlinks/index sweep | `ubiquitous-language.md` already in wiki index; SESSION_0473↔0474↔0472 `pairs_with`; wiki index row added for 0472 |
| Wiki lint | `bun run wiki:lint` — **0 errors, 15 warnings** (all pre-existing in `SESSION_VIDEO_R001.md` / `petey-plan-0436`; touched docs introduced none) |
| Kaizen reflection | `## Reflections` present (4 notes) |
| Hostile close review | SESSION_0472_REVIEW_01 + Giddy/Doug/Desi pass |
| Code-quality gate (Class-A) | no Class-A custom code this session (plan-only; docs) |
| Runtime verification (Doug) | no runtime surface touched (plan-only) |
| Review & Recommend | next session written + **two parallel sessions prestaged** (0473 S1, 0474 S2) |
| Memory sweep | updated project memory — ratified BBL tier model + verification on-ramp |
| Next session unblock check | S2 (0474) fully unblocked + self-contained; S1 (0473) needs operator Stripe price ids (noted) |
| Git hygiene | docs-only; single commit at close; **awaiting push authorization** — hash in chat / `git log` |
| Graphify update | refreshed before the close commit — **15,670 nodes / 30,791 edges / 2,093 communities / 2,362 files** |
