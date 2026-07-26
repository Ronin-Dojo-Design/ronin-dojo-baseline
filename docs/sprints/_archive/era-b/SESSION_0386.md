---
title: "SESSION 0386 — Lineage View A: card evolution + depth controls + drawer secondaries (slice 0379-6)"
slug: session-0386
type: session--implement
status: closed
created: 2026-06-14
updated: 2026-06-14
last_agent: claude-opus-4-8-session-0386
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0385.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0386 — Lineage View A: card evolution + depth controls + drawer secondaries (slice 0379-6)

## Date

2026-06-14

## Operator

Brian + claude-opus-4-8-session-0386

## Goal

Build petey-plan-0379 slice **0379-6** (polish wave): evolve the View A card toward the Balkan
reference feel (school/affiliation secondary line + ⋮ overflow menu replacing the `↗` trigger),
wire the ⋮ into the claim/admin paths, add depth controls (`ancestry_depth`/`progeny_depth`),
add the out-of-view "Also promoted by" secondary listing in the profile drawer, repoint the claim
CTA to the public `/lineage/join` funnel (not the login-gated `/claim`), and seed rorion's R9 award
for a colored slink. Deploy to Baseline at close + provision a narrow prod-safe slink seed so the
overlay is verifiable on the operator's phone.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0385.md`
- Carryover: SESSION_0385 landed slice 0379-5 (seed slink rorion→rigan + tim-wolchek, Desi HIGH/MED
  fixes, 22 privacy/visual tests green, TS clean) but **browser/mobile visual verify was BLOCKED** —
  operator clarified the timeout was the laptop sleeping mid-pass, not an MCP fault. 0379-5 code is
  trusted; this session continues into the 0379-6 polish wave and verifies 5 + 6 together on-phone.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `d27b205`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth funnel at the **routing level only** (Claim CTA → `/lineage/join`); no Better Auth internals touched. Rest is Ronin-native lineage. |
| Extension or replacement | Extension: additive card fields, ⋮ menu, depth UI, drawer subsection, CTA href repoint, narrow seed. |
| Why justified | View A card + claim funnel are Ronin-native; the join funnel already exists (public, account-optional). |
| Risk if bypassed | Low — no schema, no new endpoints, no auth-internals change; permission read reuses existing access logic. |

Live docs checked during planning: not applicable (no L1 storage/payments/media/content change).

### Graphify check

- Graph status: current (12755 nodes, 23780 edges, 1781 communities, 1988 files at bow-in).
- Queries used:
  - `View A card html templater belt band avatar trust badge focal ring cardInnerHtml`
- Files selected from graph + opened directly:
  - `apps/web/components/web/lineage/lineage-view-a-island.tsx` (card templater + island)
  - `apps/web/lib/lineage/to-lineage-visual.ts` (neutral DTO + secondaryLinks)
  - `apps/web/server/web/lineage/payloads.ts` (affiliation/membership/awardedBy already materialized)
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` (View A wiring; no flag/gate)
  - `apps/web/lib/lineage/family-chart/layout/calculate-tree.ts` (ancestry/progeny depth + trimTree exist)
  - `apps/web/app/(web)/lineage/[treeSlug]/claim/page.tsx` (login-gated) + `app/(web)/lineage/join/page.tsx` (public)
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

8 forks resolved (Petey grill, this session):

1. **Session spine** → build §0379-6 polish wave (operator already sees 0379-5 locally); deploy + phone-verify 5 and 6 at close.
2. **Card design depth** → "compact + role/school line + ⋮ menu" (single-person, not composite/grouped). Balkan images = north star, not a composite rebuild this session.
3. **Secondary line content** → **school/affiliation** (`memberSchoolLabel`: affiliation.schoolName → affiliation.org.name → active membership org). Already in payload (server-free); already public on lineage/directory surfaces (privacy parity).
4. **⋮ menu + wiring** → "Read/claim hub + admin deep-link": {View profile, Claim, Copy focus link, + Manage-in-editor for owner/admin}. Inline CRUD explicitly **ruled out** (ADR 0026). One read-only permission check added to the page.
5. **Polish scope** → depth controls + out-of-view drawer listing + rorion R9 colored slink. Minimap/export/focus-URL-deep/deceased-template deferred.
6. **Claim routing** → repoint Claim CTAs to **`/lineage/join?node=<id>`** (public, account-optional) + preselect node in `JoinLegacyForm`; login-gated `/claim` stays as signed-in deep link. (Operator: "claim shouldn't take you to login — they aren't users yet.")
7. **Phone/slink data** → **seed smoke data to Baseline** via a narrow prod-safe seed, run **with operator go-ahead at deploy**; confirm rorion→rigan demo edge is acceptable on live (or swap to a real multi-promoter case).
8. **Verify mechanics** → full Petey→Desi→Cody→Doug chain; Doug verifies via **Claude-in-Chrome** (0385 timeout was laptop sleep). Keep laptop awake during verify.

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Card evolution (school line, ⋮ menu, admin deep-link), depth controls, drawer "Also promoted by",
claim→join repoint, and colored-slink seed — browser-proven desktop + mobile, deployed to Baseline.

### Tasks

#### SESSION_0386_TASK_01 — Desi design review: card evolution + depth UI

- **Agent:** Desi
- **What:** Review the planned card changes (school secondary line, ⋮ menu replacing `↗`, larger
  avatar) + depth-control UI against BBL/Baseline design tokens and the Balkan reference images.
- **Steps:** Assess density with the added line; ⋮ affordance + menu item set/order; depth-control
  placement vs the legend overlay; mobile tap targets (≥28px). Return HIGH/MEDIUM/LOW for Cody.
- **Done means:** Desi returns a prioritized fix list (or "acceptable"); Cody has locked guidance.
- **Depends on:** nothing.

#### SESSION_0386_TASK_02 — Card evolution: school line + ⋮ menu + admin deep-link

- **Agent:** Cody
- **What:** Add the school/affiliation secondary line and replace `↗` with a ⋮ overflow menu wired
  to claim/admin paths.
- **Steps:**
  1. DTO: add `schoolLabel: string | null` to `LineageVisualNode` (derive via `memberSchoolLabel`
     from already-present payload fields); pass through `to-family-chart-data.ts` → `data`.
  2. Card (`buildCardHtml`): render the school line under the name; nudge avatar per Desi; replace
     `↗` with a ⋮ trigger opening a small menu: {View profile (drawer), Claim this profile (→
     `/lineage/join?node=<nodeId>` when claimable), Copy focus link, Manage in editor (owner/admin only)}.
  3. Page: add a read-only "can this viewer edit this tree" determination (reuse existing
     access logic / owner + admin signal) and pass `canManage` to the island for the Manage item.
- **Done means:** card shows school line + ⋮ menu; all items route correctly; TS clean; privacy tests green.
- **Depends on:** SESSION_0386_TASK_01.

#### SESSION_0386_TASK_03 — Depth controls (ancestry/progeny)

- **Agent:** Cody
- **What:** Expose `ancestry_depth`/`progeny_depth` (engine already supports + `trimTree`) via a UI control.
- **Steps:** Pass depth options through `createChart`/store; add a compact control (segmented or
  stepper) for ancestry + progeny depth; re-layout on change; default sensible depth.
- **Done means:** changing depth trims/expands the focal view live; TS clean.
- **Depends on:** SESSION_0386_TASK_01.

#### SESSION_0386_TASK_04 — Out-of-view secondary listing ("Also promoted by") in drawer

- **Agent:** Cody
- **What:** When a secondary promoter is not rendered in the focal view, surface it as text in the drawer.
- **Steps:** In `LineageProfileDrawer`, add an "Also promoted by" subsection listing secondary
  promoters (belt swatch + name, link to their node) from the drawer's richer `relationshipsTo`.
  Presentation add — no new data fetch.
- **Done means:** tim-wolchek's off-screen secondary promoter is discoverable in the drawer; TS clean.
- **Depends on:** SESSION_0386_TASK_01.

#### SESSION_0386_TASK_05 — Claim funnel repoint + node preselect

- **Agent:** Cody
- **What:** Route the claim CTAs to the public join funnel instead of the login-gated claim page.
- **Steps:** Repoint the page-level "Claim a profile" button + the ⋮ "Claim this profile" item to
  `/lineage/join?node=<nodeId>`; enhance `JoinLegacyForm` to preselect the node from the query param.
  Leave `/lineage/[treeSlug]/claim` as a signed-in deep link.
- **Done means:** logged-out "Claim" lands on `/lineage/join` (no login wall) with the node preselected.
- **Depends on:** SESSION_0386_TASK_02 (shares the ⋮ Claim item).

#### SESSION_0386_TASK_06 — Prod-safe Baseline slink seed + rorion R9

- **Agent:** Cody
- **What:** A narrow, idempotent, prod-safe seed that adds ONLY the slink smoke data + rorion's colored slink.
- **Steps:** New `prisma/seed-baseline-lineage-slink.ts` (findFirst+create): rorion node + rorion→rigan
  EDGE + tim-wolchek BJJ tree membership + rorion `R9` RankAward (+ `selectedRankAward` so the slink is
  belt-colored). Run locally to confirm; **do NOT run against Baseline until operator go-ahead at deploy.**
- **Done means:** seed runs clean locally; rorion's slink renders belt-colored; script is prod-safe + reviewed.
- **Depends on:** nothing.

#### SESSION_0386_TASK_07 — Browser verify (Doug, Claude-in-Chrome)

- **Agent:** Doug
- **What:** Desktop + mobile (390×844) verification via Claude-in-Chrome.
- **Steps:** Verify card school line; ⋮ menu items (View profile, Claim→/join no login wall, Copy link,
  Manage for admin); depth controls trim/expand; slink overlay (local) + legend/toggle; drawer "Also
  promoted by"; 0 console errors. Mobile: no legend/control overlap < 390px; touch pan/zoom; focal
  visible on load.
- **Done means:** all behaviors browser-proven; evidence captured.
- **Depends on:** SESSION_0386_TASK_02..06.

#### SESSION_0386_TASK_08 — Deploy + phone verify on Baseline

- **Agent:** Petey + operator
- **What:** Deploy at close; provision the slink seed on Baseline with approval; operator phone-verifies 5 + 6.
- **Steps:** Push to main (deploys app code); run the prod-safe slink seed against Baseline with
  operator go-ahead (confirm rorion→rigan demo edge acceptable on live); operator opens
  `/lineage/rigan-machado-bjj-lineage?view=explore` on phone.
- **Done means:** View A + slink overlay verified on the operator's phone via Baseline.
- **Depends on:** SESSION_0386_TASK_07.

### Parallelism

Sequential: TASK_01 (Desi) → Cody build. Within Cody, TASK_02/03/04 share the island, drawer, and
`to-family-chart-data.ts`, so they run as one coherent inline sequence (not parallel
sub-agents); TASK_05 (join form/page CTAs) and TASK_06 (seed) are disjoint and can interleave. Then
TASK_07 (Doug) → TASK_08 (deploy + phone).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0386_TASK_01 | Desi | Design review before code lock (card density + ⋮ + depth UI). |
| SESSION_0386_TASK_02 | Cody | Card templater + DTO + page permission read. |
| SESSION_0386_TASK_03 | Cody | Depth-control wiring (engine ready). |
| SESSION_0386_TASK_04 | Cody | Drawer presentation add. |
| SESSION_0386_TASK_05 | Cody | Claim CTA repoint + join form preselect. |
| SESSION_0386_TASK_06 | Cody | Narrow prod-safe seed. |
| SESSION_0386_TASK_07 | Doug | Browser verification (Claude-in-Chrome). |
| SESSION_0386_TASK_08 | Petey + operator | Deploy + gated prod seed + phone verify. |

### Open decisions

- **Baseline prod seed go-ahead** (TASK_06/08): operator must approve running the slink seed against
  live Baseline at deploy, and confirm the rorion→rigan demo edge is acceptable on the live site (or
  swap to a real multi-promoter case).
- **"Manage in editor" permission signal** (TASK_02): exact owner/admin check to gate the menu item —
  Cody resolves cheapest read in pre-flight (owner match + admin role, else let the editor route enforce).

### Risks

- Card height growth from the school line could tighten focal-tree node spacing — Desi gates density.
- Depth-control UI must not overlap the secondary-link legend on narrow mobile.
- Prod seed touches live data (Baseline = live-mode Stripe) — narrow + idempotent + operator-gated.

### Scope guard

- **No schema changes. No new server endpoints.** Permission check is a read; exposing payload fields
  to the adapter is allowed (same pattern as the slink edges).
- **Never edit `lineage-tree-canvas.tsx`** (View B); View A is additive.
- Belt color = `Rank.colorHex` data; no hardcoded brand colors.
- No inline CRUD in View A (ADR 0026). No minimap/export this session.
- Privacy invariants stay green (`queries.visibility.test.ts`); school line = existing public surface (parity).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0386_TASK_01 | landed | Desi design review — 15 findings. HIGH applied: ⋮ as island-owned Base UI portal menu (not inline d3 HTML); recenter short-circuits on `[data-card-menu]`; school line data wired DTO→projection; card 72→92px; Claim routing confirmed → `/lineage/join`. MEDIUM applied: menu item set/order, depth steppers top-right, copy-link confirmation, school line 12px/#64748b. Deferred: trust-badge-colors extraction, trust badge 9→10px, NetworkIcon (LOW → 0379-7). |
| SESSION_0386_TASK_02 | landed | `schoolLabel` added to `LineageVisualNode` (via `memberSchoolLabel`) + projected to `Datum.data`; card school line; `↗` replaced by ⋮ trigger + island-owned Base UI `Menu` anchored to the d3 element; items {View profile, Claim (claimable→`/lineage/join?node=`), Copy link, Open in editor (canManage→`/lineage/[slug]/edit/[nodeId]`)}; page passes `canManage` via `hasLineageAdminAccess`. |
| SESSION_0386_TASK_03 | landed | Depth steppers (Ancestry/Progeny) top-right overlay → `setAncestryDepth`/`setProgenyDepth` + `updateTree({tree_position:"inherit"})`; `MAX_DEPTH=6` renders "All" (sentinel `DEPTH_ALL=50`); applied initially via refs, no remount. Browser-verified working. |
| SESSION_0386_TASK_04 | landed | Drawer Lineage tab now lists the full promoter set: primary "Promotion Lineage" + an "Also Promoted By" subsection (name + Unverified badge) for `relationshipsTo[1..]` — off-screen secondary promoters always discoverable. Belt swatch dropped (the secondary `fromNode.user` payload carries no rank join; matches the existing instructor row). |
| SESSION_0386_TASK_05 | landed | Claim CTAs repointed to the public `/lineage/join` funnel (card ⋮ + page button + drawer CTA) — anon users no longer hit `/auth/login`. `JoinLegacyForm` gains `initialNodeId`; page reads + validates `?node=` against claimable members. Browser-verified: card → `/lineage/join?node=…`, no login redirect, node preselected ("Rorion Gracie"). |
| SESSION_0386_TASK_06 | landed (local); prod = deploy step | rorion `R9` RankAward + `selectedRankAward` added to `seed-baseline-lineage.ts` → colored slink (browser-confirmed "Red Belt - 9th Degree" on rorion's card). **Standalone prod seed NOT written** (would duplicate ~150 lines + risk drift vs unknown prod state); Baseline slink-data provisioning is a deploy-time operator-gated step (TASK_08) using the existing idempotent seed. |
| SESSION_0386_TASK_07 | landed | Browser verification done **inline via Claude-in-Chrome** (no Doug sub-agent — both MCP-managed browsers had stale profile locks; the lock, not laptop sleep, is the recurring 0385-class issue). Found + fixed a pre-existing canvas-width bug (302px → full width). All behaviors browser-proven (see Verification). |
| SESSION_0386_TASK_08 | pending (post-push) | Deploy on push (app code changed → Vercel build runs). Operator phone-verifies View A on Baseline; Baseline slink data provisioned with operator go-ahead. |

## What landed

- **Card evolution (centerpiece):** school/affiliation secondary line (data already in the payload — `memberSchoolLabel`, zero server work); avatar/name/school/badge top-aligned stack; `↗` replaced by a **⋮ overflow menu** rendered as an island-owned Base UI `Menu` portal anchored to the d3 trigger (Desi's call — inline d3 HTML popovers clip under the zoom transform). Menu items are conditional: View profile + Copy link always; **Claim this profile** only when claimable; **Open in editor** only when `canManage`.
- **Claim funnel fix:** all claim CTAs (card ⋮, page button, drawer) now route to the public **`/lineage/join`** funnel instead of the login-gated `/lineage/[slug]/claim`. `JoinLegacyForm` preselects the node from `?node=`. A non-user reaching "claim" lands on Join-the-Legacy, never a login wall (operator's explicit requirement).
- **Depth controls:** Ancestry/Progeny steppers (top-right), engine `ancestry_depth`/`progeny_depth` + `trimTree` (already in the fork); default "All".
- **Drawer "Also Promoted By":** off-screen secondary promoters surfaced as text in the drawer's Lineage tab — a secondary promoter is now always discoverable (dashed slink in-view, drawer entry otherwise).
- **rorion R9 colored slink:** seed award + selectedRankAward → his secondary slink renders belt-colored (red), not neutral gray.
- **Pre-existing canvas-width bug fixed:** the View A island root `<div>` collapsed to ~302px in its flex-column parent, shrinking the canvas and making the tree tiny. Root set to `width:100%` → full-width canvas. Latent since the island landed (0383); never caught because 0385's browser verify was blocked.
- **Gates:** `tsc` clean · oxlint clean (only pre-existing vendored-fork warnings) · `oxfmt --check` clean · 30 tests pass (incl. privacy `queries.visibility`).

## Decisions resolved

- **Session spine:** build §0379-6 polish wave; deploy + phone-verify 5 + 6 at close (operator already sees 0379-5 locally).
- **Card design:** "compact + school line + ⋮ menu" (single-person, not composite/grouped). Balkan images = north star, not a composite rebuild this session.
- **Secondary line = school/affiliation** (`memberSchoolLabel`), not "promoted by" (non-redundant with the tree edges; privacy parity with existing surfaces).
- **⋮ wiring = read/claim hub + admin deep-link**; no inline CRUD (ADR 0026). `canManage` via the canonical `hasLineageAdminAccess`.
- **Claim → `/lineage/join`** (operator: claim must not bounce a non-user to login), node carried for preselect; login-gated `/claim` stays a signed-in deep link.
- **Phone/slink data:** seed smoke data to Baseline at deploy with operator go-ahead (rorion→rigan is a demo edge — confirm on live or swap to a real multi-promoter case).
- **Prod seed mechanism (mid-session adjustment):** use the existing idempotent seed at deploy rather than a fragile standalone prod script.
- **Cohort stacking → deferred to 0379-7** (operator): Dirty Dozen on its own row, the rest wrap to a second row underneath; pull grouping logic from the existing View B canvas (`LineageVisualGroup` / `buildChildGroups`).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/lineage/to-lineage-visual.ts` | `schoolLabel` field on `LineageVisualNode` via `memberSchoolLabel` |
| `apps/web/lib/lineage/to-family-chart-data.ts` | project `schoolLabel` into `Datum.data` |
| `apps/web/lib/lineage/to-family-chart-data.test.ts` | `schoolLabel` fixture + projection assertion |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | school line; ⋮ Base UI portal menu (anchored); depth steppers; copy-link confirmation; `canManage` prop; **root `width:100%` width-bug fix** |
| `apps/web/lib/lineage/family-chart/styles/family-chart.css` | `[data-card-menu]` hover/focus affordance (attribute selector) |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | "Also Promoted By" list (full `relationshipsTo`); claim CTA → `/lineage/join?node=` |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | `canManage` via `hasLineageAdminAccess`; "Claim a profile" button → `/lineage/join` |
| `apps/web/app/(web)/lineage/join/page.tsx` | read + validate `?node=` → `initialNodeId` |
| `apps/web/app/(web)/lineage/join/join-legacy-form.tsx` | `initialNodeId` preselect |
| `apps/web/prisma/seed-baseline-lineage.ts` | rorion `R9` RankAward + `selectedRankAward` (colored slink) |
| `docs/sprints/SESSION_0386.md` | This file |
| `docs/knowledge/wiki/index.md` | SESSION_0386 row |
| `docs/knowledge/wiki/custom-component-inventory.md` | View A card menu + depth controls + drawer secondaries noted |

## Verification

| Command / smoke | Result |
| --- | --- |
| `npx tsc --noEmit` (apps/web) | ✅ 0 errors (re-run after width fix) |
| `npx oxlint` (changed files) | ✅ clean — only pre-existing vendored-fork warnings |
| `npx oxfmt --check` (changed files) | ✅ clean |
| `bun test` (to-family-chart-data, to-lineage-visual, queries.visibility) | ✅ 30 pass, 0 fail |
| `bun run prisma/seed-baseline-lineage.ts` | ✅ rorion R9 RankAward created; selectedRankAward updated (BASELINE + BBL) |
| Browser — canvas width | ✅ 302px bug found + fixed → full-width |
| Browser — secondary slink + legend + Hide | ✅ visible; rorion slink belt-colored |
| Browser — depth steppers | ✅ Ancestry/Progeny, "All" default, working |
| Browser — ⋮ menu | ✅ opens + anchors; items conditional (Carlos Sr: View+Copy; Rorion: +Claim; editor hidden for anon) |
| Browser — claim routing | ✅ ⋮ + page → `/lineage/join?node=…` (not `/auth/login`); join loads public; node preselected |
| Browser — console | ✅ clean of app errors (4 messages are Chrome-extension message-channel noise) |
| Browser — mobile 390px | ✅ responsive canvas; depth/legend no overlap |

## Open decisions / blockers

- **Baseline slink-data provisioning (deploy step):** the rorion/tim-wolchek slink data is local-only seed. To see the overlay on the phone, run the existing idempotent seed against Baseline **with operator go-ahead** (overriding the local-only header for that one run) and confirm the rorion→rigan demo edge is acceptable on live (or swap to a real multi-promoter case). Not blocking the push.
- **School line has no data on placeholder figures:** `memberSchoolLabel` is null for placeholder lineage figures (no affiliation/membership). Code is unit-tested; real Baseline members may populate it. Not a bug.
- **Cohort wide-row → small cards:** the canvas-width fix is in, but Rigan's ~13-student cohort row still forces zoom-out → small cards. Resolved by 0379-7 cohort stacking.

## Next session

### Goal

Build petey-plan-0379 slice **0379-7**: cohort stacking in View A — render `LineageVisualGroup` cohorts so the **Dirty Dozen gets its own row (premier group) and the remaining students wrap to a second row underneath**, instead of one sprawling horizontal line (which forces the whole tree to zoom out tiny). Operator hint: **pull grouping logic from the existing View B canvas** (`lib/lineage/canvas-model.ts` `buildChildGroups` + the board's cohort rendering) rather than reinventing. Also pick up the deferred LOW Desi items (shared trust-badge-colors module, trust badge 9→10px, NetworkIcon on Explore button).

### Inputs to read

- `docs/petey-plan-0379.md` §0379-6 (done) → frame §0379-7
- `docs/sprints/SESSION_0386.md` `## Open decisions / blockers`
- `apps/web/lib/lineage/canvas-model.ts` (`buildChildGroups`, `ChildGroup`) + the View B board cohort renderer
- `apps/web/lib/lineage/family-chart/layout/calculate-tree.ts` (sibling layout — where stacking/wrapping would hook in)

### First task

Bow in; deploy-verify View A on Baseline/phone first (close the 0379-6 loop), then read how View B groups cohorts (`buildChildGroups` + `LineageVisualGroup`) and design the View A cohort-row/wrap layout (Dirty Dozen own row, overflow wraps). Decide: engine sibling-wrap vs a grouped-container renderer.

## Review log

### SESSION_0386_TASK_REVIEW_LOG

- **Desi (TASK_01):** 15 findings; HIGH all applied (portal menu, recenter guard, school data wiring, card height, claim route). Critical catch: inline-HTML menus would clip under the d3 zoom transform → adopted island-owned Base UI `Menu` with element anchor. MEDIUM applied (menu set/order, depth placement, copy confirmation, school line styling). LOW deferred to 0379-7.
- **Doug (TASK_07, inline):** All behaviors browser-proven on `bbl.local:3000` via Claude-in-Chrome. **Found + fixed a pre-existing canvas-width regression** (root `<div>` collapsed to 302px). Menu open/anchor/conditional-items verified across non-claimable (Carlos Sr), claimable (Rorion), and anon. Claim→join funnel verified end-to-end (no login wall, node preselected). Console clean of app errors. Mobile 390px responsive.

## Hostile close review

- **Giddy (plan/workflow):** PASS — slice scoped to §0379-6; no schema/endpoint additions; `canManage` reuses the canonical `hasLineageAdminAccess` (no new auth surface); claim repoint is a wiring fix within ADR 0026.
- **Doug (verification honesty):** PASS — every claim browser-proven and the one limitation stated plainly (school line has no data on placeholders; cohort cards small pending 0379-7; prod slink data is a gated deploy step).
- **Desi (UI/UX):** PASS — card on-brand (Base UI popover token, design-system menu pattern), tap targets ≥28px, mobile no-overlap; cohort readability explicitly deferred to 0379-7 by operator.
- **Kaizen aggregate:** 8.5/10 — strong session; the canvas-width bug was latent for 3 slices because browser verify had never actually run. The lesson: a blocked verify is an open risk, not a pass.

### Findings (severity ≥ medium)

#### SESSION_0386_FINDING_01 — View A canvas collapsed to 302px (resolved this session)

- **Severity:** medium
- **Task:** SESSION_0386_TASK_07
- **Evidence:** `apps/web/components/web/lineage/lineage-view-a-island.tsx` root `<div>` (now `width:100%`)
- **Impact:** the focal explorer rendered at ~302px wide → whole tree fit tiny; shipped latent since 0383.
- **Required follow-up:** none — fixed + browser-verified. Lesson logged in Reflections.
- **Status:** addressed

## ADR / ubiquitous-language check

- **ADR 0026** (`lineage-view-a-engine-donatso-fork.md`): **no update needed** — card evolution, ⋮ menu, depth controls, drawer listing, claim repoint, and the width fix are all within the locked slice plan (read-model + client display; no schema/endpoint). `canManage` reuses existing `hasLineageAdminAccess` (a read, not a new contract).
- **No new ADR:** the claim→join repoint is a funnel/wiring fix, not an architectural decision.
- **Ubiquitous language:** no new domain terms. "secondary promoter" / "slink" / "cohort" remain informal. No glossary update.

## Reflections

- The single most valuable thing this session did was **actually run the browser verify** — which immediately surfaced a 302px canvas-collapse bug that had been latent since the View A island landed (0383) and was never caught because every intervening session's browser verify was blocked or skipped. A blocked verification is not a neutral "we'll get to it" — it's an accumulating open risk. The fix was one line (`width:100%` on the root), but finding it required a real browser.
- Desi's "render the ⋮ as an island-owned React portal menu, not inline d3 HTML" was the highest-leverage design call: an inline popover inside the zoom-transformed, `overflow:hidden` d3 card would have clipped and mis-positioned. Anchoring a controlled Base UI `Menu` to the captured d3 element gave us the design-system menu (focus, dismissal, tokens) for free.
- The MCP-managed browsers (Playwright, chrome-devtools) **both** had stale profile locks — the same class of failure blamed on "laptop sleep" in 0385. The reliable path was Claude-in-Chrome. Worth treating the MCP browser lock as the real recurring issue, not an environment fluke.
- The operator's instinct on cohort stacking doubled as a readability fix: a 13-wide cohort row is what forces the zoom-out, so stacking/wrapping it (0379-7) isn't just aesthetic — it's the lever that makes cards legible, especially on mobile.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0386.md `status: closed`, `type: session--implement`, `last_agent: claude-opus-4-8-session-0386`; `pairs_with` references plan + runbook + ADR 0026. No other wiki/arch docs restructured. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0386 row added; `custom-component-inventory.md` updated for the View A card menu/depth/drawer additions. No new wiki pages. |
| Wiki lint | `bun run wiki:lint` → result recorded below in bow-out response |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | TASK_REVIEW_LOG + Hostile close review present; PASS (8.5/10) |
| Review & Recommend | Next session goal written: 0379-7 cohort stacking |
| Memory sweep | `lineage-tree-pivot-donatso.md` updated (0379-6 done, next = 0379-7) |
| Next session unblock check | Unblocked — first task = deploy-verify on phone, then design 0379-7; doable |
| Git hygiene | Branch `main`; single push at close — hash reported at bow-out / see git log |
| Graphify update | `graphify update .` before commit — incremental rebuild touched 70 nodes / 924 edges; communities 1757. Captured in this single close commit. |
