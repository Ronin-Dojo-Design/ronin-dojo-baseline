---
title: "SESSION 0599 — PLAN: /app admin-surface consolidation (landing shell + nav + quick-actions + AdminCollection sweep)"
slug: session-0599
type: session--plan
status: in-progress
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0599
sprint: S12
lane: repo
recipe: epic-plan
goal_ids: [G-026]
tickets: []
pairs_with:
  - docs/knowledge/wiki/goals-ledger.md
  - docs/sprints/SESSION_0593.md
  - docs/architecture/decisions/0045-admin-collection-one-surface-law.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0599 — PLAN: /app admin-surface consolidation

## Date

2026-07-21

## Operator

Brian + claude-session-0599 (Petey orchestration)

## Goal

`/pp` Petey plan → executable fan-out for the **`/app` admin-surface consolidation** — the
**interactive/WRITE side** of the admin surface: the landing shell + nav + a quick-action surface +
the 44-route consolidation + finishing the **ADR 0045 AdminCollection conformance sweep** (D5's open
follow-up). New goal **G-026**. The READ side (State-of-Dojo projection surfaces) is owned by
**SESSION_0593** and **mounts** into this lane's landing. NO product code this session — deliverable =
this fan-out + one staged `recipe: lane` build stub (WS-1, `session-0600-admin-landing-shell`).

## Bow-in

### Previous session

- Adopted per ADR 0049: reservation branch `session-0599-admin-consolidation` (claimed off main).
  FS-0024 guard passed (ronin-dojo-app / ronin-dojo-baseline); FS-0030 confirmed 0599 highest claimed;
  `merge --ff-only main` = already up-to-date. Sibling's uncommitted `SESSION_0593.md` edits preserved
  (append-only, no stash/clobber).

### Grill outcome (4 forks resolved; /rr research = Petey + Giddy + Desi subagents)

**Headline research finding — this is an *evolve*, not a *greenfield*:** the grouped-nav taxonomy,
the tile-grid launcher, and the conformance frame all already exist and are ratified/tested.

1. **Fork 3 — quick-action surface → GRID + short CAROUSEL (both).** Promote the beta **Command Deck**
   bento **tile grid** as the grouped launcher AND build a **short quick-action carousel** on
   `components/common/carousel.tsx` for the 5 actions (honors the original framing). Giddy's
   `link`/`trigger` discriminated-union action contract applies to both surfaces.
2. **Fork 1 — taxonomy → KEEP the 7-group `ADMIN_SECTION_GROUPS` SOT + small merges.** Do NOT fork a
   parallel 5-group config (re-forks what SESSION_0501/FI-021 consolidated + is test-asserted). Merges:
   categories+tags→Taxonomy tabs; age-groups+skill-levels→Curriculum-lookups (applied in sweep Batch A).
3. **Fork 6 — conformance sweep → G-026 owns it; stage batches as children.** D5 is **stale**
   (media/organizations/claims already conformed); ~19 hand-rolled tables remain in 5 risk-ordered
   batches (A–E). 0599 stages only WS-1; batches are G-026 children, minted when grabbed.
4. **Fork 2/5 + goal → RATIFY the 0593/0599 split + MINT G-026 + AMEND PL-003.** 0593 = read-projection
   panels + a **frozen mount-contract import path**; 0599 = the shell + nav + quick-actions + route
   consolidation. Re-scopes PL-003 point 5 (which currently gives 0593 the landing composition).

**Recommended-defaults (unvetoed, stand):** Fork 4 AdminTODOist = the loop-board embed IS the todo
surface; do NOT revive a personal-todo surface (re-opens ratified G-003). Fork 5 nav = collapsible
desktop sidebar accordion + mobile routes through `/app/sections`; keep `BottomNav` member chrome +
`Mab` create-only (no third create affordance).

### Drift logged

- **D-052 (proposed):** ADR 0045 D5 (lines 83–86) claims "~29 kit pages" + names media/organizations/
  claims as non-kit stragglers — all three are now conformed onto `AdminCollection`. Count is stale;
  real remaining ≈ 19–21. One-line ADR note queued at close (route via drift-register).

## Petey plan

### Goal

Stand up G-026 (admin-surface consolidation) as an executable fan-out: 6 workstreams, WS-1 staged as a
`recipe: lane` build stub, the rest tracked as G-026 children.

### Workstreams (the fan-out)

#### WS-1 — Landing shell + Command Deck promotion + quick-action surface (STAGED: `session-0600-admin-landing-shell`)

- **Agent:** Cody (build) → Desi + Doug (review wave).
- **What:** the visible `/app` landing. Promote `app/app/beta/command-deck/*` to the `/app` landing as
  the grouped launcher; build `DashboardLanding` shell (slot composition — header + quickActions slot +
  panels region + board slot; ADR 0045 D4 composition, NOT an AdminCollection); quick-action grid
  (Command Deck bento) + short `QuickActionCarousel` on `carousel.tsx`; landing hierarchy (actions +
  attention above fold, metrics demoted below, first-run empty state via `DashboardOnboardingTour`);
  loop-board compact embed (AdminTODOist = this embed).
- **Owned files:** `app/app/page.tsx` · `app/app/_landing/*` (new) · `app/app/beta/command-deck/*`
  (promote/relocate) · `components/common/carousel.tsx` (add `QuickActionCarousel`) ·
  `app/app/_landing/app-quick-actions.ts` (the `APP_QUICK_ACTIONS` config: add-user drawer · add-lead
  drawer · leads-roster link · loop-board jump).
- **Done means:** `/app` renders the launcher + quick-actions + demoted metrics + loop-board embed;
  0593 panel slots present as placeholders (real mount = WS-3); `next build` green; Desi + Doug pass.
- **Depends on:** nothing (placeholder panel slots decouple it from 0593).

#### WS-2 — Nav rationalization

- **Agent:** Cody → Desi.
- **What:** collapsible desktop sidebar accordion (`components/app/nav.tsx` heading entries → accordion,
  groups collapsed except active, remember last-open) + mobile admin nav routes through `/app/sections`.
  Keep `BottomNav` member chrome + `Mab` create-only.
- **Owned files:** `components/app/nav.tsx` · `components/app/sidebar.tsx` · mobile nav wiring.
- **Done means:** desktop sidebar collapses the flat-44 to 7 tappable groups; mobile console reachable.
- **Depends on:** nothing. **Parallel-safe with WS-1** (disjoint files).

#### WS-3 — Mount 0593 panels (SERIAL — gated on the frozen contract)

- **Agent:** Cody.
- **What:** import 0593's read-projection panels into WS-1's shell slots.
- **Frozen mount contract (proposed — needs 0593 sign-off):** panels at
  `components/app/state-of-dojo/{state,component-catalog,card-catalog,cookbook}-panel.tsx`, each a
  self-fetching async server component, placement-agnostic (no outer margin/width), optional
  `{ compact?: boolean }`, owning its own Suspense + empty state. 0599 imports only; never edits panel
  internals. 0593 lands skeleton (placeholder-returning) panels FIRST so 0599 has something importable.
- **Depends on:** WS-1 + **0593 freezing the contract** (the one hard serial gate).

#### WS-4 — ADR 0045 conformance sweep (5 batches, sequential, cheapest-first)

- **Agent:** Cody per batch → Doug/Desi wave.
- **Batches:** **A** categories/tags/age-groups/skill-levels (+ merges) · **B** content/courses/programs/
  certificates · **C** subscriptions/subscription-tiers/pricing-plans/entitlements/memberships
  (Stripe-adjacent — careful review) · **D** roles/invites/leads/reports · **E** tournaments (biggest;
  own table + roles/rule-sets subdirs) / lineage index grid / merch-orders / privacy-requests (each own lane).
- **Done means:** each batch's tables render via `AdminCollection` (columns + query), behavior-preserved.
- **Depends on:** nothing hard (the frame exists); Batch A proves the recipe. Merge-vs-keep-1:1 for
  categories/tags + age-groups/skill-levels = **operator naming call before Batch A dispatches**.

#### WS-5 — Route hygiene

- **Agent:** Cody (small tasks).
- **What:** retire `/app/beta` **after** Command Deck promotion (WS-1) · `/app/email` → Growth card
  (Resend pointer, no persistence) · `/app/profile` relocate off `/app` (duplicate `(web)/dashboard/*`
  mount) · `/app/events` add missing index. Route renames add matching `config/app-redirects.ts` 308s.
- **Depends on:** WS-1 (beta retirement follows Command Deck promotion).

#### WS-6 — `packages/ui-kit` extraction (DEFERRED)

- **Agent:** Giddy (slice) → Cody.
- **What:** extract `Carousel` + `QuickAction` contract to `packages/ui-kit` (inline arrow buttons +
  token CSS — ui-kit has no `Button`/`cx`). Shell stays app-local (one consumer today).
- **Depends on:** **SESSION_0598/RDD proving the second consumer** (abstraction-ladder — do not pre-extract).

### Parallelism

- **Parallel:** WS-1 ∥ WS-2 (disjoint files). WS-4 batches are internally sequential but independent of WS-1/2/3.
- **Serial:** WS-3 after WS-1 + the 0593 contract freeze. WS-5 beta-retirement after WS-1. WS-6 after 0598.
- Merge order for the visible landing: WS-1 → WS-2 → WS-3.

### Agent assignments

| Workstream | Agent | Rationale |
| --- | --- | --- |
| WS-1 shell | Cody + Desi + Doug | UI composition + reuse audit + release check |
| WS-2 nav | Cody + Desi | nav IA is a UX call |
| WS-3 mount | Cody | mechanical import against a frozen contract |
| WS-4 sweep | Cody + Doug/Desi per batch | behavior-preserving conformance |
| WS-5 hygiene | Cody | small route moves |
| WS-6 extraction | Giddy → Cody | kernel structural slice |

### Open decisions

- **Cross-lane (note in BOTH files — done here + SESSION_0593):** 0593 = read-projection framework +
  panels + the **frozen mount contract**; 0599/G-026 = the shell + nav + quick-actions + route
  consolidation, **mounting** 0593's panels. No landing tug-of-war. PL-003 point 5 amended to defer the
  landing *composition* to 0599. Parallel-safe with SESSION_0598 (RDD deploy) — WS-6 extraction feeds it.
- **0593 must sign off the mount-contract import-path + panel prop signature** (WS-3's serial gate).
- **Merge-vs-keep-1:1** (categories/tags; age-groups/skill-levels) — operator naming call before Batch A.
- **G-NNN:** minted **G-026** (per resolution). No separate PL row (goal row + this fan-out is the SoT).

### Risks

- **R1 — route-dir collision:** 0599 must NOT create 0593's `app/app/{state,component-catalog,card-catalog,cookbook}`
  dirs — it mounts *components*, not routes. 0599 owned set = `page.tsx` + `_landing/*`.
- **R2 — subtree layout clobber:** consolidation is **nav-only** (regroup the sidebar; keep route dirs
  flat) → no new route-group `layout.tsx`, R2 doesn't fire. If a batch merges pages (Taxonomy tabs),
  gate the index INLINE per the AdminCollection memory (FI-027).
- **R3 — redirect shadowing:** any route rename (WS-4 merges, WS-5 moves) needs a matching
  `config/app-redirects.ts` 308 or old bookmarks 404; verify against `app-redirects.test.ts`.

### Scope guard

- No product code this session (plan-only). No push (hold for operator "go").
- Do NOT build a parallel 5-group taxonomy · do NOT revive a personal-todo surface (G-003) · do NOT use
  the browse carousel AS the launcher (grid launcher + short action carousel, per resolution) · do NOT
  pre-extract the shell to ui-kit · do NOT big-bang the sweep.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0599_TASK_01 | landed | /rr fan-out (Petey census · Giddy architecture · Desi UX) + 4-fork grill |
| SESSION_0599_TASK_02 | landed | G-026 minted; SESSION_0599 fan-out; WS-1 staged; PL-003 amended; cross-lane note |

## Next session

### Goal

Build **WS-1** — `session-0600-admin-landing-shell`: promote Command Deck to the `/app` landing +
`DashboardLanding` shell + quick-action grid+carousel + landing hierarchy + loop-board embed.

### First task

Adopt `session-0600-admin-landing-shell` (ADR 0049 staged `recipe: lane` stub). Read this session's
Grill outcome + WS-1 spec + the Giddy architecture notes (shell = slot composition; QuickAction =
`link`/`trigger` union; permission-gate the action set at config-build time). Confirm the
merge-vs-keep-1:1 naming call is NOT needed for WS-1 (it's a Batch-A call). Build against placeholder
0593 panel slots; do not create 0593's route dirs.
