---
title: "SESSION 0546 — Technique-graph lane continuation: establish state + land the next slice"
slug: session-0546
type: session--open
status: in-progress
created: 2026-07-16
updated: 2026-07-16
last_agent: claude-session-0546
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0544.md
  - docs/epics/technique-graph-curriculum-port.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0546 — Technique-graph lane continuation: establish state + land the next slice

## Date

2026-07-16

## Operator

Brian + claude-session-0546

## Goal

Continue the technique-graph / BJJ-curriculum lane (FI-009 epic: `docs/epics/technique-graph-curriculum-port.md`).
First establish where the lane actually stands (shipped vs stubbed vs deferred — FI-009 verified a harvest
from closed PR #157 at SESSION_0435; ADR 0046 authoring + FI-027 admin collection + freemium gating landed
since), then land the next un-landed slice — likely the technique browser/graph UI + belt/position/category
filters, curriculum rail, and/or watch-page — WITHOUT regressing the technique-media no-leak invariant
(locked ⇒ no url AND no media-id-bearing poster).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0544.md` (PR #210 quality loops; its `Next session` block is
  empty — lean close). Operator directive pins THIS session's lane: continue technique-graph.
- Session number note: 0545 intentionally skipped — a sibling billing-tab lane launched concurrently and
  likely claims it (its SESSION file lives in its own worktree); went above to avoid collision.
- Carryover: local canonical `main` is 2 unpushed docs commits ahead of `origin/main` (SESSION_0544 close
  docs) — untouched by this lane; this worktree is based on `origin/main`.

### Branch and worktree

- Branch: `session-0546-technique-graph`
- Worktree: `/Users/brianscott/dev/ronin-0546` (bootstrapped: .env copied, `bun install`, Prisma client
  generated — note: `bootstrap.sh` self-targets the canonical checkout; steps re-run manually here)
- Status at bow-in: clean
- Current HEAD at bow-in: `0da7e7f6`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (techniques listing/detail), media (video), monetization (premium gating) |
| Extension or replacement | Extension: builds on existing `app/(web)/techniques/` surface + shipped gating seams |
| Why justified | Continues an in-flight epic on an existing surface; no new L1 replacement |
| Risk if bypassed | Parallel technique surfaces / regressed no-leak gating |

Live docs checked during planning: Content, Media, Monetization (via existing shipped seams — ADR 0046, FI-027/028 patterns).

### Graphify check

- Graph status: current in canonical checkout (worktree reads 0 nodes — expected, not a negative signal).
- Queries used:
  - `technique graph curriculum browser filters belt position category watch page video carousel` (budget 2000, run in canonical)
- Files selected from graph:
  - `docs/epics/technique-graph-curriculum-port.md` (the lane epic)
  - `apps/web/components/web/techniques/technique-graph.tsx` + siblings
  - `AuthoredTechniqueWatchPage` (ADR 0046 watch surface)
- Verification note: Explore sub-agent dispatched for shipped-vs-stubbed verification by direct source
  inspection; Graphify used as navigation, not proof.

### Fallow baseline (pre-implementation)

- `npx fallow health`: 707 above threshold · 12,256 analyzed · maintainability 89.5 (good)
- `npx fallow dupes`: 22,874 lines (9.5%) duplicated across 498 files
- Diff both at bow-out.

## Petey plan

<!-- Locked after lane-state recon (Explore sub-agent) returns; see Task log. -->

### Goal

Establish the technique-graph lane's true state, then build the next un-landed slice.

### Tasks

#### SESSION_0546_TASK_01 — Lane-state recon (shipped vs stubbed vs deferred)

- **Agent:** Explore (read-only sub-agent)
- **What:** Map routes/components/gating/curriculum/ledger state for the technique lane
- **Steps:** enumerate `/techniques` + watch routes; grep importers of each `components/web/techniques/*`;
  check filters vs Prisma taxonomy; curriculum render state; SESSION_0435/0525/0528/0530 + ledgers
- **Done means:** structured report: SHIPPED / STUBBED / MISSING vs epic phases + open ledger items
- **Depends on:** nothing

#### SESSION_0546_TASK_02 — TBD (next slice, locked post-recon)

- **Agent:** Cody (build) → Doug (verify), Desi if UI-heavy
- **What:** TBD from recon — candidate: technique browser/graph UI + belt/position/category filters,
  curriculum rail, watch-page wiring
- **Done means:** TBD
- **Depends on:** SESSION_0546_TASK_01 + operator plan sign-off if forked

### Parallelism

Recon runs while the worktree bootstraps (done). Build tasks sequential in this worktree; sibling lanes
(billing-tab, belt followups in ronin-0541) own their worktrees — no shared-file work planned.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0546_TASK_01 | Explore | read-only fan-out search; conclusion-only |
| SESSION_0546_TASK_02 | Cody → Doug (+ Desi) | standard build → verify flow per agent-systems-map router |

### Open decisions

- Next-slice selection (browser/filters vs curriculum rail vs watch-page) — resolve from recon; grill
  operator if genuinely forked.

### Risks

- Regressing the technique-media no-leak invariant (locked ⇒ no url AND no poster) — treat as a hard gate
  in build + verify.
- Sibling-lane collision (billing-tab worktree) — disjoint surfaces expected; flag, don't clobber.

### Scope guard

- No push / PR / deploy without explicit operator authorization (standing rule).
- FI-001 PARKED — do not touch.
- `../ronin-dojo-monorepo` is READ-ONLY parity source.
- No schema migration unless the slice genuinely needs one; hand-authored only.
- BJJ-only (epic scope); no multi-discipline expansion.

### Dirstarter implementation template

- **Docs read first:** epic + ADR 0046 + shipped gating seams (in-repo canon)
- **Baseline pattern to extend:** `app/(web)/techniques/` surface, `components/web/techniques/*`,
  `isTechniqueViewerEntitled` gating seam
- **Custom delta:** graph canvas + curriculum browsing (ported/modernized from Vite monorepo, BJJ-only)
- **No-bypass proof:** extends the existing techniques surface + shipped premium-gating seams; no parallel
  system introduced

## Cody pre-flight

### Pre-flight: UpgradePanel (WL-P2-63)

#### 1. Existing component scan
- Searched `components/web/` + `components/common/` for: `UpgradePanel`, `upgrade-panel`, `LockedPanel`, `lock` — found: none (the idiom exists only as two inline copies: `app/(web)/posts/[slug]/page.tsx:157-173` and `technique-media.tsx:95-121`, byte-identical markup).
#### 2. L1 template scan
- Consulted `dirstarter-component-inventory.md`: yes — no locked/upgrade-panel primitive in `components/common/` or `components/web/ui/` (freemium panel is BBL-custom). Closest L1: none.
- Primitive API spot-check: `Button (variant: fancy|primary|secondary|soft|ghost|destructive, size: xs|sm|md|lg|icon, prefix, isPending, render)`; `Link (href, render-compatible)`; `Card (hover, focus, isRevealed, isHighlighted, render)`.
#### 3. Composition decision
- [x] New component, no L1 match exists: ledger-mandated extraction (WL-P2-63) of two byte-identical copies; composes Button + Link + LockKeyholeIcon; strings-only props (`heading`/`description`/`ctaLabel`/`href`) — cannot carry media. Placed in `components/web/ui/` (web UI primitives).
#### 4. Lane docs loaded
- [x] Wiring-ledger rows WL-P2-63/49/52 read verbatim; SESSION_0529 REVIEW_04 + SESSION_0530 task log read; `technique-media-gate.ts` no-leak type read.
#### 5. Dev environment confirmed
- Worktree `/Users/brianscott/dev/ronin-0546`, `apps/web/`; gates: `bun run typecheck`, `bun run lint` (fixer), `bun run test` (=--parallel=1), `npx next build`.
#### 6. FAILED_STEPS check
- Prior failures: FS-0027 (bare multi-file `bun test`) — mitigated: `bun run test` only. No-leak payload invariant (SESSION_0526/0529) — mitigated: refactor is markup-only; gate types untouched; gating unit tests re-run.

### Pre-flight: SortableMediaGrid unit (WL-P2-49)

#### 1. Existing component scan
- Searched for `useSortable`/`DndContext` consumers: `components/web/media/media-attachment-manager.tsx` + `app/app/content/_components/content-media-panel.tsx` (the ledgered near-copy pair). `app/app/courses/_components/curriculum-items-editor.tsx` has NO dnd (adoption there would be new behavior — skipped, behavior-preserving pass). Event galleries already ride `MediaAttachmentManager`.
#### 2. L1 template scan
- No Dirstarter sortable-grid primitive (dnd-kit is a repo-local addition). Closest pattern: the two existing implementations themselves.
#### 3. Composition decision
- [x] New module `components/web/media/sortable-media-grid.tsx` (ledger-mandated): `useSortableMediaOrder` hook + `SortableMediaGrid`/`SortableMediaTile`/`MediaOrderControls`, composing dnd-kit + `Button`. Both existing surfaces adopt it.
#### 4-6
- Same lane docs / env / FS as above. Manager split-trigger noted (4th boolean knob) — respected: WL-P2-52's chrome fix is a structural split (`MediaAttachmentPanel`), not a 4th knob.

### Pre-flight: Backend — findActiveStaffMembership (WL-P2-49)

#### 1. Auth predicates planned
- Extraction of the existing ACTIVE OWNER/INSTRUCTOR predicate — no new authz system (composes the existing membership seam only).
#### 2. Existing action scan
- The predicate exists in 5 shapes: `server/web/techniques/permissions.ts` (membership.brand), `apply-technique.ts#hasOrgStaffRole` (orgId), `server/web/dashboard/queries.ts#findUserTechniques` (nested, NO ACTIVE — the unhardened drift instance the ledger row exists to kill), `app/(web)/dashboard/techniques-tab.tsx` + `app/app/techniques/new/page.tsx` (organization.brand). Helper lands in `server/web/techniques/permissions.ts` (domain home; `TECHNIQUE_STAFF_ROLES` already lives there).
- Schema spot-check: `Membership { brand Brand (required, denormalized alongside organizationId), status MembershipStatus @default(PENDING) }`; roles via `MembershipRoleAssignment → Role.code`. Brand-scope unification: helper filters on the `Membership.brand` column (the permissions.ts mechanic); sites that used `organization: { brand }` switch — equivalent under the membership-brand=org-brand invariant (memberships are minted with their org's brand).
#### 3. Data flow reference
- ADR 0046 D5 authoring gate; techniques flow per `sop-data-and-wiring-flows.md` (server-resolved booleans passed down).
#### 4. FAILED_STEPS check
- The SESSION_0529 Giddy fix-now (copied unhardened no-ACTIVE predicate) is the exact drift class — mitigation IS this helper. `findUserTechniques` gains `status: ACTIVE` (deliberate, flagged in closing notes: read now matches the write-gates).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0546_TASK_01 | landed | Recon complete: lane essentially SHIPPED (all epic phases but Phase-4 nav entry; zero orphaned components; no-leak gate confirmed type-encoded). Fork surfaced to operator. |
| SESSION_0546_TASK_02 | in-progress | Cody: quality lane WL-P2-63 + WL-P2-49 + WL-P2-52 remainder (behavior-preserving; no-leak hard gate) |
| SESSION_0546_TASK_03 | landed | Desi spec delivered: 20+ proposals in 3 waves (Wave 1 = 11 P1 smalls), 5 operator forks (F1 Lenis, F2 ComboBuilder, F3 schema-vs-derive, F4 tint channels, F5 beta copy). Grill dispatched. |
| SESSION_0546_TASK_04 | pending | Beta-flag the technique graph via EXISTING patterns (feature-log.ts FeatureStatus + /app/beta precedent) — after Desi spec locks treatment |
| SESSION_0546_TASK_05 | pending | Build waves from grilled Desi spec (Cody) → Doug delta verify + live PNG-export check |

### Bow-in discovery (inline, post-recon)

- **Beta convention exists — reuse it, don't invent:** `apps/web/lib/feature-log.ts` `FeatureStatus =
  "live" | "beta" | "planned"` (feeds `/changelog`); gated `/app/beta` preview area (`beta.view` axis-1
  key, layout + leaf-page gates — SESSION_0498 pattern, `/app/beta/lineage-journey` precedent).
- **Scrollytelling precedent:** lineage-story (SESSION_0498, ADR 0044) shipped scrollytelling on
  `motion/react` `useScroll`+`useTransform` — the petey-plan-0494 scroll bake-off (v1 motion → v2 Lenis
  → v3 GSAP) was won by v1 "NO new dep" (`lineage-story-scene.tsx:51`); `useReducedMotion` full
  fallback; palette branching lives in `scene-model.ts`, never components. Lenis is NOT in deps —
  adding it re-opens that bake-off = operator fork (Desi to argue with evidence).
- **Incident:** both sub-agents (Cody build, Desi spec) terminated once mid-task on
  "You've hit your session limit · resets 10:50pm (America/Denver)"; resumed from transcripts after
  reset per operator's continue. Route to incidents ledger at bow-out if it recurs.

### SESSION_0546_TASK_01 — recon findings (condensed)

- **Shipped + wired:** `/techniques` (rails + faceted query), `/techniques/graph` (Prisma-fed canvas:
  zoom/pan/fit, node modal, html2canvas PNG export, type-filter chips), `/curriculum`
  (`BjjCurriculumBrowser`: level tabs + topic filter + detail dialog), `/techniques/[slug]` +
  `/directory/[slug]/techniques/[techniqueSlug]` both gated via `gateTechniqueMedia` (no-leak encoded in
  the `LockedTileMedia` type: no `url` field, `thumbnailUrl: null`), `/app/techniques` AdminCollection.
  Filters shipped: category / position / belt (min-only, SESSION_0525 KISS) / discipline. Seed
  `import-bbl-bjj-curriculum.ts` prod-imported at 0435 (61 techniques / 75 prereqs / 80 items).
- **No orphans** in `components/web/techniques/*` — full import-graph trace clean.
- **The one un-landed epic slice:** Phase 4 "Nav entry" — deliberately suppressed for launch
  (SESSION_0417; `nav-sheet.tsx:52-60` comment invites re-add; footer Browse column never renders under
  `footerMinimalChrome()`); pages reachable only by direct URL + cross-links, present in sitemap.
- **Deliberately-simplified (not ledgered):** QuestPanel / ComboBuilder / AppendixViewer / Carousel not
  ported — one consolidated browser instead.
- **SESSION_0435 deferred:** live-domain PNG-export exercise; optional graph-card tint.
- **Open ledger rows touching lane:** WL-P2-49 (shared sortable-media-grid helper), WL-P2-50 (cacheTag
  granularity — triggered only >500 techniques), WL-P2-52 🟡 (authoring UX remainder), WL-P2-53
  (non-Latin slug fallback — product call), WL-P2-63 (shared UpgradePanel extraction — deferred pending
  its own no-leak-re-verifying pass).

## Decisions resolved (operator grill, bow-in)

- **Nav resurface REJECTED for now** — technique graph goes **beta** instead of full nav/footer promotion.
- **Locked scope (operator's word, 2026-07-16):** quality lane (WL-P2-63 + WL-P2-49 + WL-P2-52, expanded)
  + SESSION_0435 verify items (live PNG export) + full Desi design pass on canvas + curriculum: graph-card
  tint, micro-animations, user delights, tooltips + hovers, ellipsis menus/options, vertical
  scrollytelling-style cards for combo builder + curriculum cards, Lenis smooth scrolling, and content
  depth (definitions, key points of practice, practice notes for techniques/combos/concepts).
  Operator: "I want this epic!!!!" — treat as the §5b epic-lane recipe (brief → deliverable → parallel
  review wave with Desi → batched fixes → delta verify → push gate).
- Standing gates unchanged: no-leak invariant hard gate; motion via `motion/react` + `useReducedMotion`
  reduced fallback; Lenis = NEW dependency → surface for explicit approval before adding
  (operator supply-chain caution); hand-authored migrations only if content depth genuinely needs schema.

### Design-pass forks — operator grill outcomes (F1–F5, all Desi recommendations accepted)

- **F1 Lenis → motion-only.** CurriculumJourney reuses the lineage-story architecture (useScroll +
  useTransform, palette-law model, full reduced-motion fallback). NO new dependency — the shipped v1
  bake-off verdict stands. (Operator's original "add Lenis" superseded by this grill answer.)
- **F2 ComboBuilder → defer; E2 specced follow-up.** E1 proves the scrollytelling shell first; Combo
  Flows = read-only curated chains next lane. No authoring surface this epic.
- **F3 Content → derive-only v1.** Tooltips/cards/scenes consume description + teachingCues + parsed
  keyPoints. Zero migration; schema promotion queued for a future curriculum-admin lane.
- **F4 Graph tint → both channels.** Faint OPAQUE type tint as fill (legend = filter chips) + 3px belt
  bottom-bar from `Rank.colorHex` (adds `beltLevelMin` to graph-query select).
- **F5 Beta copy → default:** chip + removable one-line hardening note (not separately grilled).

### Locked build waves (from Desi spec — TASK_05)

- **Wave 1 (P1 smalls, one commit-batch):** A1 type tint · A2 legend-dot chips · A3 belt edge-bar ·
  A4 curriculum belt tint + BeltSwatch conform · E3 Prose conformance (both literal-hyphen lists) ·
  D1 per-tile unlock CTA (→ `/lineage/join`, reuse UpgradePanel pattern) · D2 access-badge label map +
  upgrade line · C1 card hover lift/press · C6 lock-tile hover delight · G1 watch-page Save row
  (`ListingSaveButton` TECHNIQUE) · H1 beta chip treatment (graph page + library CTA + curriculum
  cross-link).
- **Wave 2:** B1 graph node tooltips (~250ms delay, no media by construction) · C2 filter-chip layoutId
  pill · C4 zoom/fit easing (never during drag) · C5 selected-node neighborhood glow · D3 empty states
  (`EmptyList` + reset) · B2 difficulty-term tooltips.
- **Wave 3:** E1 CurriculumJourney scrollytelling (motion-only; fallback = today's browser) · then
  B3 key-point hover peek · C3 grid stagger · G2 node-modal ellipsis menu.
- **Deferred/vetoed by spec:** E2 Combo Flows (next lane) · QuestPanel/XP · AppendixViewer (Eskrima
  content) · haptics · old-app gold styling · nav promotion · belt-filter changes.
- **Sequencing constraint:** Wave 1 starts only after TASK_02 (quality lane) commits — WL-P2-63 and
  D1/C6 both touch `technique-media.tsx`.

## What landed

<!-- Filled at bow-out. -->

## Decisions resolved

<!-- Filled during session. -->

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

<!-- Carried forward at bow-out. -->

## Next session

### Goal

<!-- Filled at bow-out. -->

### First task

<!-- Filled at bow-out. -->

## Review log

<!-- Filled at bow-out. -->

## Hostile close review

<!-- Filled at bow-out. -->

## ADR / ubiquitous-language check

- ADR update TBD at bow-out (ADR 0046 is the standing canon for technique ownership).
- Ubiquitous language update TBD.

## Reflections

<!-- Filled at bow-out. -->

## Full close evidence

| Step | Proof |
| --- | --- |
