---
title: "SESSION 0361 — BBL launch-readiness audit (grill-with-docs kickoff, verified flow gap map)"
slug: session-0361
type: session--plan
status: closed
created: 2026-06-11
updated: 2026-06-11
last_agent: claude-session-0361
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0360.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0361 — BBL launch-readiness audit (grill-with-docs kickoff, verified flow gap map)

## Date

2026-06-11

## Operator

Brian + claude-session-0361

## Goal

Operator-issued `/goal` kickoff: get BBL launch-ready on `bbl.local` by **auditing** the existing
implementation flow-by-flow (auth onboarding, invite, claim submit/review/approve, placeholder
person, RBAC scope, directory/lineage surfaces, Stripe/entitlement, nav, route drift) against the
SoT set, producing an evidence-backed gap map, and identifying the smallest launch-blocking vertical
slice. **Audit before implementation; no code in this kickoff.** Note: SESSION_0360's planned
"0361 = oRPC scaffold" lane is superseded for this session by the operator `/goal`; the oRPC
scaffold remains the program's Phase-1a next implementation slice pending the slice decision below.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0360.md`
- Carryover: 0360 landed Bun-canonical PM, Biome→Oxc, and the Dirstarter dep uplift (TS6 + majors),
  all gates green, pushed to `main`. Planned next was the oRPC scaffold; this session is instead an
  operator-directed launch-readiness audit.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `7e51032`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None this session (audit only); audit confirms oRPC/`app/app`/`api/v1`/`api/rpc` absent vs upstream `76c8e1e` |
| Extension or replacement | Not applicable — read-only audit |
| Why justified | Verifies GAP_MATRIX (known stale) against live code before committing a slice |
| Risk if bypassed | Building the wrong slice on guessed flow status |

Live docs checked during planning: relied on the Phase-0 captured upstream (`dirstarter_template` @ `76c8e1e`, BBL-SOT-Spec §3) rather than re-fetching dirstarter.com/docs.

### Graphify check

- Graph status: current; stats at bow-in: 9871 nodes, 15636 edges, 1476 communities, 1642 files tracked.
- Queries used: `graphify stats` only — the SoT set + GAP_MATRIX named exact routes/files, so direct
  inspection of known paths was used per opening.md §3c ("if a path is already known, open that exact file").
- Files selected: `lib/auth.ts`, `server/invites/actions.ts`, `server/admin/invites/actions.ts`,
  `server/web/lineage/claim-actions.ts`, `server/admin/lineage/claim-review-actions.ts`,
  `server/admin/users/actions.ts`, `components/web/header.tsx`, route trees under `app/(web)`, `app/admin`, `app/api`.
- Verification note: every audit-table status below is backed by direct file/route inspection.

## Petey plan

### Goal

Produce the verified flow audit + smallest-slice recommendation (output A–F in chat); no implementation.

### Tasks

#### SESSION_0361_TASK_01 — Verified flow audit vs SoT set

- **Agent:** Petey (inline)
- **What:** Inspect routes/server/UI/tests for the 15 operator-named flows; mark built/partial/missing/stale with evidence.
- **Steps:** ls/read route trees; read claim/invite/add-person/review actions; confirm oRPC + `/app` absence; check nav pattern; check e2e coverage.
- **Done means:** audit table delivered in chat + summarized here.
- **Depends on:** nothing

#### SESSION_0361_TASK_02 — Slice recommendation + program-tension callout

- **Agent:** Petey (inline)
- **What:** Identify smallest launch-blocking slice under the goal's "wire existing > minimal seam" rubric; call out tension with BBL-SOT-Spec D2 foundation-first sequencing explicitly.
- **Done means:** recommendation A–F delivered; open decision recorded below.
- **Depends on:** SESSION_0361_TASK_01

### Open decisions

- **RESOLVED (grill round 2): operator ratified oRPC-first (option b), D2 sequencing stands.**
  The claim-proof-first inversion was withdrawn on evidence: `e2e/lineage/authenticated-lifecycle.spec.ts`
  already covers authenticated claim submit **with evidence** → admin approve → ownership transfer +
  placeholder archive + NODE_EDITOR grant → claimant edit → public propagation, and runs in CI
  (chromium full suite; firefox/webkit lineage subset). The behavioral regression net for Phases 1–4
  already exists. Next implementation session = BBL-SOT-Spec Phase 1a oRPC scaffold (per SESSION_0360
  next-session block).

### Drift logged

- **GAP_MATRIX BBL-PROFILE-002 stale (optimistic direction):** "Missing: End-to-end flow validation
  with authenticated browser session" is false — the authenticated claim e2e exists and runs in CI.
  Corrected in GAP_MATRIX this session. CUTOVER Layer-3 rank-4 ("authenticated claim flow") is
  largely retired by the same spec; the remaining cutover-time item is the manual bbl.local live-DOM walk.
- **Residual e2e gap (fold into Phase 4, not a separate slice):** the e2e fixture seeds the
  placeholder via direct DB, not the SESSION_0358 admin add-person action — the add-person → claim
  seam is proven by Phase 4's done-means.

### Scope guard

- No code, no schema changes, no oRPC scaffold this session.
- No porting from legacy BBL repos.
- GAP_MATRIX corrections recorded here + in chat, not rewritten wholesale mid-audit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0361_TASK_01 | landed | 15-flow audit completed; evidence-backed statuses delivered in chat. |
| SESSION_0361_TASK_02 | landed | Smallest slice identified (authenticated claim-loop E2E proof + seam fixes); D2 tension flagged as open decision. |

## What landed

- **15-flow launch audit, evidence-backed** (routes/server/UI/tests inspected directly): core claim
  loop is built + CI-e2e-covered end to end (submit w/ evidence → review → approve → ownership +
  NODE_EDITOR + propagation); oRPC/`/app`/`/api/rpc`/`/api/v1`/`server/orpc` confirmed absent
  (Phases 1–2 not started); ACL-management UI confirmed missing; slide-in nav missing (current
  header = full-screen overlay); `/admin` vs `/dashboard` drift confirmed.
- **GAP_MATRIX corrected both directions** (BBL-PROFILE-002: claim e2e exists; add-person seam +
  cutover-time manual walk are the real residue).
- **Sequencing grill (mattpocock `grill-with-docs`) → SOT-ADR D8 + D7 amendments**: oRPC-first
  ratified; launch gate = Phases 1–5 + nav/landing lane + stripe rehearsal (Phase 6 not gating);
  cutover ARMED early, DNS flip = post-Phase-3 checkpoint (early-flip trigger: real organic WP
  traffic); cuid2 → Phase 3 schema wave.
- **Legacy UX reference pack captured** for the nav/landing lane: `blackbeltlegacy.local` live-DOM
  measurements (right drawer 280px account+nav; left drawer 320px contextual filters; both overlay
  at all widths) + monorepo source pointers (`BBLSideDrawer`/`FinderDrawer`/`BBLHeader`/`DesktopNav`
  — behavior reference ONLY, rebuild on Dirstarter primitives) + landing section inventory +
  `_reference/` screenshots.
- **mattpocock/skills installed** (29 skills → `.agents/skills/` + `.claude/skills/` symlinks):
  grill-me, grill-with-docs, improve-codebase-architecture, et al.

## Decisions resolved

Grill rounds (grill-with-docs, mattpocock/skills — installed this session to `.agents/skills/` +
`.claude/skills/` symlinks):

1. **Q1 — oRPC before claim-proof (operator option b), ratified.** Inversion withdrawn on evidence:
   the authenticated claim e2e (submit with evidence → approve → ownership/grant/propagation) already
   exists in CI. D2 sequencing stands.
2. **Q2 — launch-gating subset ratified + amended:** Phases 1–5 gate launch (operator promoted all of
   Phase 5); Phase 6 WP-parity does NOT gate (live WP site is a dead landing page); `/api/v1` may
   trail the flip; stripe@22 rehearsal gates.
3. **Q3/Q5 — cutover ARMED early, FLIPPED post-Phase-3 (SOT-ADR D8, NEW; final form after one
   operator revision):** decouple arming (nav/landing/L8-essentials/DKIM/301/prod-render-verify —
   interleaves after Phase 1c or natural seam) from flipping (DNS, ~30 min). Default flip checkpoint
   = immediately after Phase 3 (final identity model, pure reseed intact); early-flip trigger = real
   organic traffic on the WP site (operator checks analytics once). cuid2 moves into the Phase 3
   schema wave. Claims open at flip (RBAC-reviewed, D6).
4. **Q4 — nav semantics ratified, then CORRECTED against the live legacy app** (operator repointed
   the UX reference to `blackbeltlegacy.local` — the Local WP site whose theme mounts the legacy
   React SPA; do NOT dig through `ronin-dojo-monorepo`). Measured off the live DOM:
   - **Right slide-in = account + PRIMARY NAV** (not account-only): `w-[280px] max-w-[85vw]`
     `bg-neutral-900 border-l z-[70]`, avatar header ("Guest / Sign in to track your journey"),
     Sign In / Create Account group, divider, app nav (Lineage Builder · Member Directory · School
     Directory · Techniques · Posts), brand footer. Trigger: header hamburger ("Open menu").
   - **Left slide-in = CONTEXTUAL filter/search panel** (per-surface, e.g. directory):
     `w-[320px] max-w-[85vw] bg-neutral-900 border-r z-[80] transition-transform duration-300
     ease-out`; header "School directory / Filter by what matters" + close; search box; chip groups
     ("How far will you travel?": Nearby/Close/Worth the drive/Anywhere; "I'm looking for":
     Kids/Adults/Competition/No-Gi/Self-Defense).
   - Both are overlay slide-ins at ALL viewport widths (offscreen `translate-x` until triggered,
     verified at 1200px). Rebuild on existing drawer/sheet primitives, brand-neutral.
   - Screenshots: `docs/product/black-belt-legacy/_reference/bbl-local-menu-open.png`,
     `_reference/bbl-local-directory.png`. Header pattern: logo left; "Join Now" CTA + hamburger right.
   - **Source pointers (operator re-opened `ronin-dojo-monorepo` as reference, UI behavior only):**
     `src/brands/blackbeltlegacy/components/navigation/BBLSideDrawer.jsx` (right drawer — also defines
     the **authed** nav the Guest walk couldn't show: Dashboard · My Lineage · Member Directory ·
     School Directory · Favorites · Techniques · Posts · ⊕ Create Hub for create-capable roles/tiers ·
     divider · Settings · Logout-in-red; user header = avatar w/ belt badge + displayName +
     @username · belt + tier chip, links to own profile; interactions = backdrop `bg-black/60`
     tap-close, Escape close, body-scroll lock, focus-to-close-button, safe-area insets);
     `components/finder/FinderDrawer.jsx` (left drawer — adds an **active-filters summary bar**
     ("N active filters" + Clear-all + chip overflow "+N more") and a verification radio group
     (All schools / Verified only); FilterPill active = bbl-red tint); `components/BBLHeader.jsx`
     (logo left; right = Join Now for guests OR avatar + hamburger);
     `components/navigation/DesktopNav.jsx` (**third pattern:** authed desktop gets a persistent
     Facebook-style LEFT NAV RAIL, md+, with central Create CTA — the left slide-in is for filters,
     the left rail is for authed desktop nav).
   - Landing section inventory (for the landing lane, captured from `blackbeltlegacy.local`): hero
     "Build Your Legacy" + Register Now/More Info; Rigan video embed; Dirty Dozen card rail
     (#1 Bob Bass…#12 John Will, View Profile cards); "Built on Authentic Lineage" (Bob Bass story);
     "Why Train Here" 3-up; "New Member Features" + school-owner checklist; lineage chain cards
     (Carlos Sr → Carlos Jr → Rigan → Bob Bass); testimonials ×4; FAQ accordion; Register CTA;
     Dave Meyer coral-belt congratulations banner; zoomable family-tree visualization; Posts-feed
     promo; Register-Your-School promo; Technique-Library promo; footer (3 link columns + socials +
     `train@blackbeltlegacy.com`); cookie-consent bar (Accept All / Essential Only / Customize).
5. **SESSION_0362 = BBL-SOT-Spec Phase 1a oRPC scaffold**, exactly as SESSION_0360's next-session
   block specifies (brand-aware context is the key delta).

Docs updated inline: `SOT-ADR.md` (D7 amended, D8 added), `BBL-SOT-Spec.md` (§2.2 amendment callout,
§2.4 migration/cuid2), `GAP_MATRIX.md` (BBL-PROFILE-002 staleness corrected).

Also landed: installed `mattpocock/skills` (29 skills → `.agents/skills/` + `.claude/skills/`
symlinks; grill-me / grill-with-docs / improve-codebase-architecture now first-class).

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0361.md` | New session file: audit, grill decisions, UX reference pack, next-session block. |
| `docs/product/black-belt-legacy/SOT-ADR.md` | D8 added (cutover armed early / post-Phase-3 flip checkpoint); D7 migration + cuid2 bullets amended. |
| `docs/product/black-belt-legacy/BBL-SOT-Spec.md` | §2.2 D8 amendment callout; §2.4 migration/cuid2 corrections; Phase-5 cuid2 note. |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | BBL-PROFILE-002 staleness corrected (claim e2e exists in CI). |
| `docs/product/black-belt-legacy/_reference/*.png` | New: legacy nav-open + directory screenshots from `blackbeltlegacy.local`. |
| `docs/knowledge/wiki/index.md` | SESSION_0360 row backfilled (FS-0019 gap) + SESSION_0361 row added. |
| `.agents/skills/*` + `.claude/skills/*` (symlinks) | mattpocock/skills install (29 skills). |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | Result recorded in Full close evidence below. |
| Flow audit | Direct file/route inspection (no dev server run — audit + planning only). |
| `blackbeltlegacy.local` | Browsed via Playwright MCP; panel specs measured off live DOM. |

## Open decisions / blockers

- None blocking. SESSION_0362 (oRPC Phase 1a) is fully specified and unblocked.
- Standing: D8 early-flip trigger — operator to check WP/Bluehost analytics once for organic traffic.
- Standing follow-up (from 0360, unchanged): stripe@22 runtime rehearsal in a billing session.

## Next session

### SESSION_0362 — oRPC scaffold + brand-aware context (BBL-SOT-Spec Phase 1a)

Run exactly per SESSION_0360's next-session block (it was written for this lane and is current):

- **Upstream files (port source, `dirstarter_template` @ `76c8e1e`):**
  `server/orpc/{context,procedure,permissions,roles,rate-limit,revalidate}.ts`, `server/router.ts`,
  `lib/orpc-{server,client,query}.ts`, `app/api/rpc/[[...rest]]/route.ts`, `lib/auth.ts`.
- **KEY delta:** upstream `Context` is brand-less — Ronin adds `brand` + a `withBrand` middleware
  (resolve host/`x-brand` via `~/lib/brand-context` `getRequestBrand()`, mirroring
  `lib/safe-actions.ts`); `rsc()` must inject brand too (hard gate: SOT-ADR D3 brand-scope).
- **Scope:** scaffold + brand context + `ping`/`health.brand` smoke only. No entity routers, no
  Better-Auth change, no `next-safe-action` removal. Deps already landed + build-proven (0360).
- **Queued after Phase 1c (interleave at a natural seam):** the D8 cutover-arm lane — slide-in nav
  (R = account + primary nav, L = contextual filters; UX ref **`blackbeltlegacy.local`**, measured
  spec in Decisions resolved §4 + `_reference/` screenshots), landing + email-capture proof,
  L8 essentials, DKIM, 301 map, prod render verify.

### First task

Port the oRPC scaffold files from `dirstarter_template` @ `76c8e1e` into `apps/web`, adding the
brand-aware context middleware. Unblocked — no operator input required.

## Review log

### SESSION_0361_REVIEW_01 — audit + grill + D8

- **Reviewed tasks:** SESSION_0361_TASK_01, SESSION_0361_TASK_02
- **Dirstarter docs check:** not applicable — relied on the Phase-0 captured upstream
  (`dirstarter_template` @ `76c8e1e`); no baseline layer touched (docs-only session).
- **Verdict:** The audit did its job: it killed a wrong launch-blocker claim (my own — the claim e2e
  exists) and surfaced the decision that actually mattered (cutover timing), which the grill resolved
  into D8 with the flip pinned to a named checkpoint instead of a vibe. All statuses are
  evidence-backed (file:line / live DOM), no code was touched, and the next session is a fully
  specified implementation slice.
- **Score:** 9.0/10
- **Follow-up:** none beyond the standing items in Open decisions.

## Hostile close review

- **Giddy:** pass — no code, no schema, no security surface changed; D8 is operator-ratified with
  supersession recorded in the SoT ADR doc, not a scattered note.
- **Doug:** pass with one caveat — audit statuses are code-level evidence, not runtime proof; that is
  explicit in the SESSION file and the runtime proof is exactly what later phases gate on.
- **Desi:** not applicable (no UI shipped; UX reference capture only).
- **Kaizen aggregate:** 9/10 — the grill reversed the agent's own recommendation on evidence, which
  is the system working as designed.

## ADR / ubiquitous-language check

- **ADR update: done in-SoT** — D8 added + D7 amended in `SOT-ADR.md` (the consolidated record;
  per SESSION_0359 convention no scattered ADR file is created). No Dirstarter baseline layer touched,
  so no live-docs proof table required.
- Ubiquitous language update not required (no new domain terms; "arm vs flip" is recorded in D8 itself).

## Reflections

- **The grill beat the audit.** The audit confidently named "no end-to-end claim proof" as launch
  blocker #1; one grep during the grill (`e2e/lineage/authenticated-lifecycle.spec.ts`) disproved it.
  Lesson re-learned from SESSION_0355 (FINDING_02): never assert a capability gap without checking the
  e2e tree — the GAP_MATRIX was stale in the *optimistic* direction this time, which is the more
  dangerous staleness because it survives optimistic re-reads.
- **Decouple "arm" from "flip."** The cutover flip-flop dissolved once the decision was split into
  engineering work (identical either way) and a 30-minute DNS action (revocable until done). Most
  sequencing arguments in this program compress the same way.
- **Live DOM + source beats either alone.** `blackbeltlegacy.local` showed real behavior (and Guest
  state); the monorepo source showed the authed nav + a third pattern (DesktopNav rail) the browser
  walk couldn't reach. Twenty minutes captured a complete UX spec the nav session can build from cold.
- **`npx skills add` piped through `head` SIGPIPE-kills the installer mid-write** — the summary box
  prints before files land. Re-run without a pipe.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SOT-ADR.md` / `BBL-SOT-Spec.md` / `GAP_MATRIX.md` `updated: 2026-06-11` + `last_agent: claude-session-0361`; SESSION doc frontmatter current. |
| Backlinks/index sweep | `wiki/index.md`: SESSION_0360 row **backfilled** (FS-0019 gap found at close) + SESSION_0361 row added; existing pairs_with between SoT docs unchanged (already bidirectional). |
| Wiki lint | `bun run wiki:lint` — result captured in bow-out chat. |
| Kaizen reflection | Reflections section present: yes (4 entries). |
| Hostile close review | SESSION_0361_REVIEW_01; Giddy/Doug pass (Doug caveat recorded). |
| Review & Recommend | Next session = SESSION_0362 oRPC Phase 1a, fully specified, unblocked. |
| Memory sweep | `bbl-sot-spec-program.md` + `MEMORY.md` updated (D8, claim-e2e-exists, blackbeltlegacy.local UX ref). |
| Next session unblock check | Unblocked — no operator input required for Phase 1a. |
| Git hygiene | Branch `main`; single push at close; hash reported at bow-out — see git log. FS-0024 guard run at bow-in. |
| Graphify update | Run before the close commit — count captured in bow-out chat. |
