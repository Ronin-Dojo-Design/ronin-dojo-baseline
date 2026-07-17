---
title: "SESSION 0546 — Technique graph state, quality lane, and Wave 1 polish"
slug: session-0546
type: session--implement
status: closed
created: 2026-07-16
updated: 2026-07-17
last_agent: codex-session-0546
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0544.md
  - docs/epics/technique-graph-curriculum-port.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0546 — Technique graph state, quality lane, and Wave 1 polish

## Date

2026-07-16

## Operator

Brian + claude-session-0546 + codex-session-0546

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

| Field                       | Answer                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Dirstarter baseline touched | Content (techniques listing/detail), media (video), monetization (premium gating)    |
| Extension or replacement    | Extension: builds on existing `app/(web)/techniques/` surface + shipped gating seams |
| Why justified               | Continues an in-flight epic on an existing surface; no new L1 replacement            |
| Risk if bypassed            | Parallel technique surfaces / regressed no-leak gating                               |

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

#### SESSION_0546_TASK_01 — Lane-state recon (shipped vs stubbed vs unbuilt)

- **Agent:** Explore (read-only sub-agent)
- **What:** Map routes/components/gating/curriculum/ledger state for the technique lane
- **Steps:** enumerate `/techniques` + watch routes; grep importers of each `components/web/techniques/*`;
  check filters vs Prisma taxonomy; curriculum render state; SESSION_0435/0525/0528/0530 + ledgers
- **Done means:** structured report: SHIPPED / STUBBED / MISSING vs epic phases + open ledger items
- **Depends on:** nothing

#### SESSION_0546_TASK_02 — Quality-lane selection (locked post-recon)

- **Agent:** Cody (build) → Doug (verify), Desi if UI-heavy
- **What:** Resolve WL-P2-63, WL-P2-49, and the WL-P2-52 remainder before visual work.
- **Done means:** Shared seams adopted, no-leak invariant re-proven, and canonical gates green.
- **Depends on:** SESSION_0546_TASK_01 + operator plan sign-off if forked

### Parallelism

Recon runs while the worktree bootstraps (done). Build tasks sequential in this worktree; sibling lanes
(billing-tab, belt followups in ronin-0541) own their worktrees — no shared-file work planned.

### Agent assignments

| Task                 | Agent                | Rationale                                                 |
| -------------------- | -------------------- | --------------------------------------------------------- |
| SESSION_0546_TASK_01 | Explore              | read-only fan-out search; conclusion-only                 |
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

### Pre-flight: Wave 1 graph / curriculum / watch polish (SESSION_0546_TASK_05)

#### 1. Existing component scan

- Searched the live technique graph, curriculum browser, watch orchestrator, locked-media tile, and
  `components/common/` / `components/web/` for graph tint, belt swatch, upgrade, Save, Badge, Card, and
  Prose seams. Found: extend the existing `TechniqueGraph`, `BjjCurriculumBrowser`, `TechniqueDetail`,
  and `TechniqueMedia`; compose the canonical `BeltSwatch`, `ListingSaveButton`, `Button`, `Badge`,
  `Card`, `Stack`, and `Prose`. No new component or pattern is needed.

#### 2. L1 template + primitive API scan

- Consulted `dirstarter-component-inventory.md`: yes; `dirstarter-docs-inventory.md` alignment URLs:
  yes (Content / Media / Monetization). Closest L1 patterns: the existing techniques
  Query→Listing→List→Card family plus the shared watch/curriculum components themselves.
- Primitive APIs spot-checked from source: `Badge (variant:
primary|soft|outline|success|caution|warning|info|danger; size: sm|md|lg; prefix/suffix/render)`,
  `Button (variant: fancy|primary|secondary|soft|ghost|destructive; size: xs|sm|md|lg|icon;
prefix/suffix/isPending/render)`, `Card (hover/focus/isRevealed/isHighlighted/render)`, `Stack
(size: xs|sm|md|lg; direction: row|column; wrap; render)`, `Note (p props; as)`, `Prose (div
props/className)`, canonical
  `BeltSwatch (colorHex; variant: dot|belt; size: sm|md|lg|full; degree/secondaryColorHex/beltFamily)`,
  and `ListingSaveButton (subjectType/subjectId/label/showLabel/initialSaved + Button props)`.

#### 3. Composition decision

- [x] Extend existing components: graph node/filter render, curriculum cards/dialog, shared watch
      detail, and locked media tile.
- [x] Compose existing primitives: canonical belt swatch, badges/buttons/cards/stacks/prose, and the
      persisted polymorphic Save control (`subjectType=TECHNIQUE`).
- [ ] New component: none.

#### 4. Lane docs + data contract loaded

- [x] SESSION_0546 locked Wave 1, FI-009 epic, ADR 0046, no-leak gate type/tests, Content/Media/
      Monetization alignment, feature-data prerequisites (seeded BJJ curriculum), data-wiring + lifecycle
      SOPs, and Graphify query loaded.
- [x] Query widening is existing-column only: `Technique.beltLevelMin` is the `TechBeltMin` relation
      and `Rank.colorHex` is nullable `String?`; no schema/migration and no entitlement predicate change.

#### 5. Dev environment + verification

- Canonical worktree `/Users/brianscott/dev/ronin-dojo-app/apps/web`; dev command
  `npx next dev --turbo`; BBL host `localhost:3000` (preview cookie when browser-verifying).
- Gates: focused technique no-leak/query tests, `bun run typecheck`, `bun run lint`, format check,
  `bun run test` (`--parallel=1`), and `npx next build` if feasible. No push/deploy.

#### 6. FAILED_STEPS / boundary check

- FS-0001 / FS-0008 mitigated by inventory + exact primitive/API inspection; FS-0027 mitigated by
  using the canonical parallel-1 runner for multi-file tests. Locked media stays viewer-independent:
  no URL, poster, or media-id-bearing path is added or passed into the lock tile; gate types/tests stay
  untouched. Reduced-motion Tailwind fallbacks cover hover transforms; no new dependency.

## Task log

| ID                   | Status  | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SESSION_0546_TASK_01 | landed  | Recon complete: lane essentially SHIPPED (all epic phases but Phase-4 nav entry; zero orphaned components; no-leak gate confirmed type-encoded). Fork surfaced to operator.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| SESSION_0546_TASK_02 | landed  | Quality lane: 5 commits (85434ba4 UpgradePanel · c8b77b4d sortable-media-grid + findActiveStaffMembership, 6th predicate copy found+killed · be7a9f60 WL-P2-52 remainder · cd3f471e oxfmt · 4bedac24 inventory). All gates PASS (tsc, lint 0 rewrites, format 1971 files, tests 106/0, next build 214/214, wiki-lint). No-leak re-verified (type untouched, grep-proof, 34 gating tests pass). Flagged: findUserTechniques +ACTIVE hardening (deliberate, ledger-intended); entitled-poster P3 SKIPPED (conflicts test-encoded 0529 viewer-independent policy → escalate, re-ledger). Affected e2e (mobile-shell MAB) deferred to CI per standing rule. |
| SESSION_0546_TASK_03 | landed  | Desi spec delivered: 20+ proposals in 3 waves (Wave 1 = 11 P1 smalls), 5 operator forks (F1 Lenis, F2 ComboBuilder, F3 schema-vs-derive, F4 tint channels, F5 beta copy). Grill dispatched.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| SESSION_0546_TASK_04 | landed  | Existing beta convention applied on the graph page: caution chip + removable hardening note, with Technique Library and BJJ Curriculum cross-links; no nav promotion. Desi GO; Doug runtime verification PASS.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| SESSION_0546_TASK_05 | landed  | Wave 1 built by Cody: A1/A2/A3/A4, C1/C6, D1/D2, E3, G1, H1. Derived belt fallback, white-belt hairline, focus/reduced-motion parity, repo Dialog dirty guard, live desktop/mobile routes, and 175,148-byte PNG export verified. Waves 2–3 are captured by G-013.                                                                                                                                                                                                                                                                                                                              |

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
  - SESSION_0435 verify items (live PNG export) + full Desi design pass on canvas + curriculum: graph-card
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
- **F2 ComboBuilder → G-013 after E1.** E1 proves the scrollytelling shell first; Combo
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
- **Not in Wave 1:** E2 Combo Flows (G-013) · QuestPanel/XP · AppendixViewer (Eskrima
  content) · haptics · old-app gold styling · nav promotion · belt-filter changes.
- **Sequencing constraint:** Wave 1 starts only after TASK_02 (quality lane) commits — WL-P2-63 and
  D1/C6 both touch `technique-media.tsx`.

## What landed

- Quality lane merged locally into `main` (`823d94e7`): `UpgradePanel`, shared sortable-media-grid,
  one ACTIVE OWNER/INSTRUCTOR membership helper across all six consumers, and the WL-P2-52 authoring
  polish remainder. WL-P2-49, WL-P2-52, and WL-P2-63 are resolved.
- Wave 1 technique polish: opaque type-tint graph nodes and legend dots; derived/direct belt rails;
  canonical curriculum belt swatches and access copy; motion/focus/press parity; per-tile Unlock CTA;
  persisted Technique Save; beta treatment and cross-links; Prose list fixes.
- White-belt rails gained a neutral hairline on graph, curriculum, and PNG export. The graph now uses an
  explicit technique rank first, then the lowest-sort-order linked course rank, else unranked.
- Native dirty-close confirmation in the authored-technique sheet was replaced by the repository Dialog.
- Desktop/mobile/browser verification covered graph, curriculum, and locked watch routes. The actual graph
  PNG export is preserved with the six route screenshots in `_assets/`.
- Claude's session-limit interruption was recovered without lost edits: quality commits were merged,
  in-flight Wave 1 was completed, Cody handed off, Desi/Doug reviewed, and Codex closed the same session.

## Decisions resolved

- Accept `findUserTechniques` requiring `MembershipStatus.ACTIVE`. Cancelled staff no longer receive
  organization rows that write gates already reject; this is the predicate-drift correction WL-P2-49
  existed to make.
- Retain SESSION_0529's viewer-independent premium-poster suppression. Entitlement unlocks playback, but
  premium clip thumbnails never surface on rail cards. No policy relaxation was opened in this polish lane.
- Belt color remains derive-only v1: direct `Technique.beltLevelMin` wins; linked curriculum rank is a
  display fallback. No schema migration.
- Keep graph beta-only; no main-nav/footer promotion. Continue motion with shipped `motion/react`; no Lenis.
- Wave 2, Wave 3, and read-only Combo Flows continue under G-013. Direct staff-predicate regression coverage
  is WL-P2-64.

## Files touched

| File | Change |
| ---- | ------ |
| `apps/web/components/web/ui/upgrade-panel.tsx` + two consumers | Shared strings-only locked-detail panel; no media-bearing props. |
| `apps/web/components/web/media/sortable-media-grid.tsx` + two consumers | Shared drag/order grid and controls. |
| `apps/web/server/web/techniques/permissions.ts` + six consumers | Shared ACTIVE OWNER/INSTRUCTOR membership lookup. |
| `apps/web/server/web/techniques/graph-query.ts` | Select direct rank and linked-course ranks; derive the graph belt display channel. |
| `apps/web/server/web/techniques/graph-belt-level.ts` + `.test.ts` | Pure direct-first/lowest-linked fallback with four regression tests. |
| `apps/web/components/web/techniques/technique-graph.tsx` | Opaque type tints, legend dots, belt rails/hairlines, export restore, interaction parity, Prose list. |
| `apps/web/components/web/curriculum/bjj-curriculum-browser.tsx` | Canonical BeltSwatch, belt rails/hairlines, card interaction, access labels, upgrade copy, Prose list. |
| `apps/web/app/(web)/techniques/[slug]/_components/technique-detail/technique-media.tsx` | Zero-media-prop locked tile with CTA + reduced-motion hover delight. |
| `apps/web/app/(web)/techniques/[slug]/_components/technique-detail/index.tsx` | Shared watch-page Technique Save row. |
| `apps/web/app/(web)/techniques/graph/page.tsx` | Beta chip/note + library/curriculum cross-links. |
| `apps/web/app/(web)/dashboard/authored-technique-create.tsx` | Controlled repository Dialog for dirty-close confirmation. |
| `docs/sprints/_assets/SESSION_0546-wave1-*.png` | Six responsive route captures plus the real graph export. |
| `docs/knowledge/wiki/{wiring-ledger,goals-ledger,incidents,index}.md` | Resolve quality rows; route G-013/WL-P2-64; record recovery; index close. |
| `docs/sprints/SESSION_0546.md` | Close record, decisions, reviews, and evidence. |

## Verification

| Command / smoke | Result |
| --------------- | ------ |
| Quality-lane gate set before merge | PASS — web typecheck; lint 0 errors; format 1,971 files; 106/106 tests; Next 214/214; wiki lint. |
| `bun test --parallel=1` on five lane/no-leak files | PASS — 51 tests / 155 assertions / 0 fail. |
| No-leak structural proof | PASS — gate files unchanged from `0da7e7f6`; lock component has zero media props/tokens; locked CTA carries only `/lineage/join`. |
| `bun run typecheck`; lint; format; wiki lint | PASS — web typecheck; 0 lint errors (38 baseline warnings); 1,971 formatted; wiki 0 errors / 54 warnings. |
| `bun run build` | PASS — 79 migrations current; Next compiled; TypeScript passed; 234/234 pages generated; sitemap generated. Known NFT trace warning only. |
| Browser verification | PASS — desktop/mobile graph, curriculum, locked watch; 51 belt bars each viewport; zero console errors; correct lock/save links. |
| Actual graph PNG export | PASS — 175,148 bytes; type tints and belt rails/hairlines retained. |
| Full repository `bun run test` | ENV BLOCKED — 1,458 pass / 20 fail / 3 errors; shared-prodsnap timeout→fixture-cleanup cascade, none in touched technique suites. No destructive reset attempted; cannot claim all-green. |
| `bash scripts/bow-out-gates.sh` | PASS with concurrent-session note — selected higher SESSION_0547; format, wiki, build, Graphify, fallow all ran. SESSION_0546 task/ledger/deferral checks repeated explicitly. |

## Open decisions / blockers

- No scoped blocker for the reversible local commit. Push/release remains held for Brian's explicit word.
- Full repository test promotion remains blocked by the shared-prodsnap fixture cascade; G-012 and the
  concurrent test-infrastructure lane own that class. CI or a clean guarded test target must be authoritative
  before release promotion.
- G-013 and WL-P2-64 are future work, not SESSION_0546 blockers.

## Next session

### Goal

Continue G-013 with technique-experience Wave 2, preserving graph beta posture and the media no-leak law.

### Inputs to read

- `docs/sprints/SESSION_0546.md`
- `docs/epics/technique-graph-curriculum-port.md`
- `docs/architecture/decisions/0046-member-authored-techniques.md`
- `docs/knowledge/wiki/goals-ledger.md` (G-013)

### First task

Implement B1 graph-node tooltips and C2 animated filter pill together, with keyboard/reduced-motion parity
and a no-media tooltip data contract; then route through Desi and Doug before C4/C5.

## Review log

- `SESSION_0546_REVIEW_01` — Desi: **GO**, no remaining P1/P2. White-belt contrast, focus/press/reduced
  motion, locked-tile treatment, Dialog replacement, responsive layouts, and export all approved.
- `SESSION_0546_REVIEW_02` — Doug: **GO-WITH-NOTE for local commit, 9.7/10, no hard cap**. Static,
  runtime, no-leak, export, and build gates pass. Repository-wide suite is environment-blocked; do not call
  it green. Push stays held.
- `SESSION_0546_REVIEW_03` — Giddy: scoped code is coherent and policy-safe. Route direct helper query-shape
  coverage as WL-P2-64; retain the ratified viewer-independent poster suppression.

## Hostile close review

- **Verdict:** GO-WITH-NOTE for local commit; no scoped P1/P2 defect; 9.7/10; no hard cap.
- **Dirstarter:** existing Content, Media, Monetization, and Theming seams extended; no parallel L1 surface.
- **Security:** no-leak proven three ways; locked tile remains structurally incapable of carrying media.
- **Data/lifecycle:** rank fallback is color-only and direct-first; no schema/authz expansion. ACTIVE staff
  behavior hardening explicitly accepted.
- **Release note:** full repo suite is environment-blocked by shared fixture state. Local commit is safe;
  push/release promotion requires explicit authorization and authoritative rerun/CI.

## ADR / ubiquitous-language check

- No ADR needed: ADR 0046 remains the standing ownership/gating canon; display-only rank fallback does not
  alter the domain model.
- No ubiquitous-language change: existing terms (`Technique`, `Rank`, `Course`, `locked media`) suffice.

## Reflections

- Real data invalidated the first direct-rank assumption: every visible graph rank was null. Deriving from
  linked curriculum ranks restored the intended belt channel without schema churn.
- White belts require an adjacent neutral hairline; the same export restore path must reapply both layers.
- The session-limit handoff worked because quality work was already committed and the SESSION file held the
  locked decisions. Same-session recovery avoided an artificial new lane.
- A full serial suite against shared prodsnap can cascade after one timeout: cleanup failures contaminate later
  fixtures. Never reset that database to make a close look green; isolate the lane and route infrastructure debt.

## Full close evidence

| Step | Proof |
| ---- | ----- |
| JETTY/frontmatter sweep | SESSION_0546, goals/wiring ledgers, incidents, and wiki index stamped 2026-07-17 / `codex-session-0546`. |
| Backlinks/index sweep | SESSION_0546 added to wiki index; G-013/WL-P2-64 and recovery incident linked from the close record. |
| Wiki lint | `bun run wiki:lint`: 0 errors / 54 warnings. |
| Kaizen reflection | Present; real-data belt fallback, export parity, handoff durability, shared-DB cascade. |
| Hostile close review | Desi GO; Doug GO-WITH-NOTE 9.7; Giddy policy/test-debt routing complete. |
| Code-quality gate | 9.7/10; no hard cap. |
| Runtime verification | Desktop/mobile graph, curriculum, locked watch, and actual PNG export PASS; zero console errors. |
| Review & Recommend | G-013 Wave 2 selected; exact first task recorded. |
| Memory sweep | Incident, goal, wiring debt, policy decisions, and close evidence captured in repository docs. |
| Next-session unblock check | Unblocked for G-013; release promotion awaits explicit push authorization + authoritative full-suite rerun. |
| Git hygiene | `main`; quality branch merged locally; final single local commit planned; no push. SESSION_0546 worktree removed after commit. |
| Graphify update | 17,494 nodes / 34,407 edges / 2,294 communities. |
