---
title: "SESSION 0393 — Cinematic Lineage View A explorer + Phase 3c browser re-light"
slug: session-0393
type: session--open
status: in-progress
created: 2026-06-15
updated: 2026-06-15
last_agent: claude-session-0393
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0392.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0393 — Cinematic Lineage View A explorer + Phase 3c browser re-light

## Date

2026-06-15

## Operator

Brian + claude-session-0393 (Petey -> Desi -> Cody -> Doug -> Petey)

## Goal

Upgrade `LineageViewAIsland` (the focal `?view=explore` explorer) into a premium cinematic BBL
explorer — dark/legacy/authoritative, belt-color glow card system, trust/claimable badges, current-focus
panel, depth controls, secondary-link overlay, mobile-conscious overlays — on the operator-pasted drop-in,
adapted to the post-SESSION_0392 passport-rooted node shape. Optionally make the explorer the default
public lineage view (board = fallback) and DRY the `passportDisplayName` fallback chains (fallow advisory).
Then verify in-browser at `bbl.local` and follow through to green CI/deploy.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0392.md`
- Carryover: SESSION_0392 landed Phase 3c — full identity repoint to Passport + the destructive `userId`
  column drop (self-sufficient migration), 601 tests green, pushed to `main`, CI green. It deferred live
  browser proof on a local owner-seed blocker and left a fallow DRY follow-up (`passportDisplayName`).
  This session delivers the operator's cinematic Lineage View A explorer and re-lights the deferred
  browser proof on the dropped-column schema.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this session file
- Current HEAD at bow-in: `7bc1d8f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming/UI only — custom Ronin lineage explorer component; no L1 capability replaced. |
| Extension or replacement | Extension: premium restyle of an existing custom component (`LineageViewAIsland`); same data flow. |
| Why justified | Lineage is a Ronin-custom domain with no Dirstarter primitive; the cinematic layer is brand polish. |
| Risk if bypassed | None — no Dirstarter capability bypassed; data wiring unchanged. |

Live docs checked during planning: not applicable; custom lineage UI.

### Graphify check

- Graph status: current (refreshed end of SESSION_0392); stats at bow-in: 12886 nodes, 24503 edges, 1788 communities, 2072 files tracked.
- Queries used (navigation, not proof):
  - `LineageViewAIsland to-lineage-visual family-chart view-secondary-links lineage-profile-drawer explore view toggle page treeSlug`
- Files selected from graph (then verified by direct read):
  - `apps/web/components/web/lineage/lineage-view-a-island.tsx` (replace target)
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` (view toggle, lines 81/180-195)
  - `apps/web/lib/lineage/to-lineage-visual.ts` (`LineageVisualNode` shape — confirmed exposes
    `id/nodeId/displayName/colorHex/rankLabel/schoolLabel/trustStatus/claimable`)
- Verification note: confirmed the paste's `focusNode.*` reads + `LineageProfileDrawer(students,onSelectStudent)`
  + `@base-ui/react/menu` import all match the current code — the paste is an API-compatible superset.

### Grill outcome

No grill (operator directive). Two operator decisions taken from the request:

- **Make `?view=explore` the DEFAULT** public lineage view (`view !== "board"`), board view as the
  labelled fallback — operator's explicit recommendation ("make explore the default for BBL public pages").
- **Adapt, don't blind-paste.** The paste was written against an older node shape; Cody adapts it to the
  post-0392 passport-rooted `LineageVisualNode`/`LineageTreeMemberRow` and the current drawer contract.

### Drift logged

- D-DRIFT-0393-1: `SESSION_0392.md` frontmatter still reads `status: in-progress` despite a full close
  section, evidence table, and pushed post-close addendum. Corrected to `closed` during this session's
  hygiene (the session is demonstrably done — pushed to `main`, CI green).

## Petey plan

### Goal

Ship the cinematic Lineage View A explorer (adapted drop-in) as the default public lineage view, DRY the
passport display-name chains, verify in-browser on the dropped-column schema, and land green on `main`.

### Tasks

#### SESSION_0393_TASK_01 — Design review of the cinematic explorer (Desi)

- **Agent:** Desi
- **What:** Review the operator's pasted cinematic `LineageViewAIsland` against BBL brand + repo
  component conventions; return a prioritized fix list for Cody (no production code).
- **Steps:**
  1. Assess brand fit (dark/legacy/authoritative), belt-color glow system, trust/claimable badge legibility,
     contrast/accessibility, mobile overlay ergonomics, and reuse vs the existing card/drawer patterns.
  2. Flag any hardcoded color that should read from data (belt color = `Rank.colorHex`, never hardcoded),
     and any motion that needs a reduced-motion fallback.
  3. Return findings ranked (must-fix / should-fix / nice-to-have).
- **Done means:** prioritized fix list returned; Cody has a clear punch-list.
- **Depends on:** nothing.

#### SESSION_0393_TASK_02 — Implement cinematic explorer + make explore the default (Cody)

- **Agent:** Cody
- **What:** Replace `lineage-view-a-island.tsx` with the adapted cinematic explorer; apply Desi's
  must-fixes; flip the page default to explore with relabeled toggle.
- **Steps:**
  1. Drop in the cinematic component, adapted to the current `LineageVisualNode` + `LineageTreeMemberRow`
     + `LineageProfileDrawer` contract (verified API-compatible at bow-in). Preserve focus/URL sync,
     depth controls, secondary-link overlay, drawer + student carousel, and the ⋮ menu.
  2. `app/(web)/lineage/[treeSlug]/page.tsx`: `isExploreView = view !== "board"`; relabel toggle
     (Board view <-> Cinematic explorer) per the paste.
  3. Apply Desi must-fix items.
- **Done means:** typecheck/lint/format clean; explorer renders as default; board view reachable via
  `?view=board`.
- **Depends on:** SESSION_0393_TASK_01.

#### SESSION_0393_TASK_03 — DRY `passportDisplayName` fallback chains (Cody)

- **Agent:** Cody
- **What:** Extract a shared `passportDisplayName(passport)` helper to collapse the repeated
  `passport?.displayName ?? passport?.user?.name ?? …` chains flagged by fallow in SESSION_0392.
- **Steps:**
  1. Add `passportDisplayName` (+ avatar sibling if duplicated) to the identity read seam
     (`lib/lineage/canvas-model.ts` or `server/identity`); repoint call sites.
  2. Keep it a thin pure helper — no new abstraction layer (YAGNI).
- **Done means:** fallow new-CRAP on touched files drops below the 0392 baseline; tests green.
- **Depends on:** nothing (can run parallel to TASK_02; different files).

#### SESSION_0393_TASK_04 — Verify: gates + fallow + browser proof (Doug)

- **Agent:** Doug
- **What:** Prove the explorer renders and is interactive in-browser on the dropped-column schema, and all
  static/test gates pass.
- **Steps:**
  1. `npx fallow audit` on touched files; oxc lint; `bun run typecheck`, `lint:check`, `format:check`,
     `bun run test`, `wiki:lint`.
  2. Unblock the local owner seed (magic-link login or `OWNER_ID`), re-run `bun prisma/seed-baseline-lineage.ts`.
  3. Chrome-verify `bbl.local:3000/lineage/<treeSlug>` default explore view: card render, click-to-recenter,
     depth controls, secondary-link toggle, profile drawer + student carousel, claim CTA, mobile width.
- **Done means:** gates green or blockers recorded with exact failing command; browser proof captured (or
  blocker stated plainly per 0392 honesty rule).
- **Depends on:** SESSION_0393_TASK_02, SESSION_0393_TASK_03.

#### SESSION_0393_TASK_05 — Close, Graphify, commit/push, CI/deploy (Petey)

- **Agent:** Petey
- **What:** Full bow-out; correct the SESSION_0392 status drift; update Graphify before git hygiene;
  stage/commit/push to `main`; follow CI + Vercel deploy to green.
- **Steps:** Full closing.md (reflections, hostile close, evidence table, ADR check, memory sweep,
  document the restyled component in the custom-component inventory); `GRAPHIFY_VIZ_NODE_LIMIT=10000
  graphify update .`; FS-0024 guard; commit (conventional) + push; monitor CI + deploy.
- **Done means:** SESSION_0393 closed-full, pushed, CI/deploy green.
- **Depends on:** SESSION_0393_TASK_04.

### Parallelism

TASK_03 (passport helper, identity seam) is file-disjoint from TASK_02 (explorer component) and may run
concurrently. TASK_01 gates TASK_02. TASK_04/05 are sequential at the end.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0393_TASK_01 | Desi | Brand/consistency review of the cinematic UI. |
| SESSION_0393_TASK_02 | Cody | Component replacement + page default flip. |
| SESSION_0393_TASK_03 | Cody | Identity-seam DRY helper. |
| SESSION_0393_TASK_04 | Doug | Gates + browser proof. |
| SESSION_0393_TASK_05 | Petey | Close, graphify, git, CI/deploy. |

### Open decisions

- None. Explore-as-default is operator-recommended; adapt-don't-blind-paste is a safety default.

### Risks

- Browser proof may hit the SESSION_0392 owner-seed blocker again — if unblockable this session, state it
  plainly and lean on integration coverage (honesty rule).
- The paste references `node`-level fields; if the post-0392 visual node diverges anywhere, follow the
  compiler (typecheck is the checklist).

### Scope guard

- No schema change, no new package, no Balkan/family-chart engine swap (owned vendored engine stays).
- Do not merge the two claim systems; do not touch the destructive migration.
- Defer the `ClaimantHasPassportError.code` removal + `phase3b-*` script retirement to a later session
  unless trivially clean during the fallow pass.

### Dirstarter implementation template

- **Docs read first:** SESSION_0392 § Next session, lineage hub, `to-lineage-visual` node type.
- **Baseline pattern to extend:** existing custom `LineageViewAIsland` + vendored `family-chart` engine.
- **Custom delta:** premium cinematic restyle (belt-color glow cards, focus panel, badges) — same data flow.
- **No-bypass proof:** lineage is Ronin-custom; no Dirstarter primitive exists for it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0393_TASK_01 | landed | Desi design review returned a prioritized punch-list (HIGH: brand-red→`primary` token, rank-pill WCAG contrast, preserve menu/claim guards; MEDIUM: trust-badge labels, reduced-motion, mobile collapse, drop Share; LOW deferred). |
| SESSION_0393_TASK_02 | landed | Replaced `lineage-view-a-island.tsx` with the cinematic explorer (adapted to post-0392 passport node shape) + applied all Desi HIGH/MEDIUM fixes; flipped page default to explore (`view !== "board"`), relabeled toggle (Board view ↔ Cinematic explorer). |
| SESSION_0393_TASK_03 | landed | Added `lib/identity/passport-display.ts::passportDisplayName`; collapsed the duplicated `passport?.displayName ?? passport?.user?.name ?? …` head across 8 sites in 7 read-seam/component files. |
| SESSION_0393_TASK_04 | landed | Gates green (typecheck 0, lint clean, format clean, **601 tests pass/0 fail**, wiki:lint clean; fallow advisory-only). Live browser proof captured on localhost (Baseline brand): explorer renders as default, 18 belt-glow cards, Current-focus panel + drawer read Passport identity, mobile chrome collapses, 0 console errors. |
| SESSION_0393_TASK_05 | landed | Full close, Graphify refresh, commit + push to `main`, CI/deploy follow-through. |

## What landed

- **Cinematic Lineage View A explorer** — `LineageViewAIsland` rebuilt as a premium dark/legacy
  explorer: belt-color glow cards (data-driven `Rank.colorHex`), trust/claimable badges with text
  labels, hero pills, a Current-focus panel reading Passport identity, depth steppers, secondary-link
  overlay + legend, focus/URL sync, the ⋮ actions menu, and the composed `LineageProfileDrawer` +
  student carousel. Same data flow as before — a premium restyle, no schema/package/engine change.
- **Explorer is now the default public lineage view.** `app/(web)/lineage/[treeSlug]/page.tsx`:
  `isExploreView = view !== "board"`; the practical board/tree view is the `?view=board` fallback
  (toggle relabeled Board view ↔ Cinematic explorer).
- **Desi HIGH/MEDIUM fixes baked in:** no hardcoded brand red — the brand glow reads the
  BrandSettings `--primary` token via Tailwind `bg-primary` overlays, null belt falls back to neutral
  slate; rank-pill text color uses a WCAG relative-luminance contrast pick (not a brightness midpoint);
  the `closest("[data-card-menu]")` recenter guard and `claimable && isTreeClaimable` claim gate are
  preserved; trust badges keep text labels (not color-only); `useReducedMotion` (`@mantine/hooks`)
  collapses the engine tree transition + secondary-link redraw to instant; hero copy + Current-focus
  panel collapse on mobile so the canvas is reachable; the redundant header "Share" button was dropped.
- **`passportDisplayName` DRY helper** (`lib/identity/passport-display.ts`) — collapses the
  fallow-flagged `passport?.displayName ?? passport?.user?.name ?? …` head across the lineage
  read-seams, lineage components, and promotion/disciplines server reads.
- **Phase 3c browser re-light** (the proof SESSION_0392 deferred): on the dropped-column schema, the
  lineage tree, Current-focus panel, and profile drawer all render identity from Passport; the local
  owner-seed "blocker" resolved via the Baseline-brand org-owner fallback already in the lineage seed.

## Decisions resolved

- **Explore is the default public lineage view** (operator recommendation), board view kept as the
  labelled fallback.
- **Adapt, don't blind-paste** — the operator's drop-in was reconciled to the post-0392 passport node
  shape and hardened against the repo's brand-token / belt-color-from-data / reduced-motion rules.
- **Editorial vs brand color split:** the dark stage + museum-gold accent are fixed editorial chrome
  (documented in-file); the red brand glow is the `--primary` token; belt color is always `Rank.colorHex`.
- **Fallow's two new findings** (`:529`/`:542` effects) are idiomatic React-effect guards with
  coverage-weighted CRAP — advisory, not real debt; not contorted.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | Full rebuild → cinematic dark explorer with Desi HIGH/MEDIUM fixes (brand-token glow, WCAG rank-pill contrast, reduced-motion, mobile collapse, preserved guards). |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Explore is default (`view !== "board"`); toggle hrefs/labels (Board view ↔ Cinematic explorer). |
| `apps/web/lib/identity/passport-display.ts` | New: `passportDisplayName(passport)` identity-display helper. |
| `apps/web/lib/lineage/canvas-model.ts`, `lib/lineage/tree-layout.ts` | Use `passportDisplayName` (collapsed chain). |
| `apps/web/components/web/lineage/lineage-tree-board.tsx`, `lineage-profile-drawer.tsx` | Use `passportDisplayName` (3 sites). |
| `apps/web/server/web/promotion-events/{queries,editor-queries}.ts`, `server/web/disciplines/top-ranked-queries.ts` | Use `passportDisplayName` (3 sites). |
| `docs/sprints/SESSION_0393.md` | Session record. |
| `docs/sprints/SESSION_0392.md` | Frontmatter status drift `in-progress` → `closed` (D-DRIFT-0393-1). |
| `docs/knowledge/wiki/custom-component-inventory.md` | Documented the cinematic `LineageViewAIsland`. |
| `docs/knowledge/wiki/index.md` | SESSION_0393 row. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (0 errors). |
| `bun run lint:check` | PASS (only pre-existing vendored family-chart warnings; none in touched files). |
| `bun run format:check` | PASS. |
| `bun run test` | PASS: **601 pass / 0 fail**, 1853 assertions, 103 files. |
| `bun run wiki:lint` | PASS: no violations. |
| `npx fallow audit --changed-since HEAD --gate new-only --max-crap 30` | Advisory (not a CI gate): 2 new findings are idiomatic React-effect guards (coverage-weighted CRAP 42/30); DRY pass dropped the collapsed chains below threshold. |
| Browser proof (localhost / Baseline brand, `rigan-machado-bjj-lineage`) | PASS: explorer renders as default (bare URL); 18 belt-glow cards; Current-focus panel reads Passport (Carlos Gracie Sr · Red Belt 10th Degree · Verified); "View profile" opens drawer with full Passport profile; depth/secondary controls + claim CTAs present; mobile hero+focus collapse; **0 console errors**. |

## Open decisions / blockers

- **LOW-priority explorer polish deferred** (Desi): reduce focal-state cues to size + one accent (drop
  the gold "Focused" label); auto-dismiss the "Click to recenter" hint after first interaction; cap
  belt-glow blur on bright belts; tidy the minor mobile overlay crowding where the depth steppers sit
  near the recenter/secondary pills at the canvas top.
- **Carry-forward from 0392** (untouched this session): remove the now-unused
  `ClaimantHasPassportError.code`; retire the superseded `scripts/phase3b-*` script/SQL.
- **Unit tests still send live Resend emails** to `@test.local` (pre-existing; visible in the test run).

## Next session

### Goal

Resume the BBL launch queue: D11 minimum-viable flip / post-flip Phases per SOT-ADR (re-flip Bluehost
A `@` → `76.76.21.21`; post-flip BrandSettings in prod + S3/R2 env vars). Optionally clear the small
LOW-priority explorer polish + the two 0392 cleanup carry-forwards if a light session is wanted first.

### First task

Re-read the BBL SoT set (`BBL-SOT-Spec.md`, `SOT-ADR.md` D11, `CUTOVER_CHECKLIST.md`) and pick the next
launch gate. If doing the DNS flip: confirm `blackbeltlegacy.com` Vercel attachment + the post-flip env
checklist, then execute. If a light polish session instead: knock out the Desi LOW items on
`lineage-view-a-island.tsx` and retire the `phase3b-*` scripts.

## Review log

### SESSION_0393_REVIEW_01 — Cinematic Lineage View A explorer + Phase 3c re-light

- **Reviewed tasks:** SESSION_0393_TASK_01–05.
- **Dirstarter docs check:** not applicable — custom Ronin lineage UI; no L1 baseline capability touched.
- **Verdict:** A clean, well-orchestrated UI session. The operator's cinematic drop-in was adapted to the
  live post-0392 passport node shape and hardened against repo law (brand-token glow not hardcoded red,
  WCAG rank-pill contrast, belt-color-from-data, reduced-motion, preserved behavioral guards) on Desi's
  review — not blind-pasted. It also closed the SESSION_0392 browser-proof gap honestly with live
  evidence on the dropped-column schema (drawer + focus panel read Passport). Gates green, 601 tests,
  0 console errors. The DRY helper is small and real. Honest gap: LOW-priority polish + minor mobile
  overlay crowding deferred.
- **Score:** 9/10 — −1 for the deferred LOW polish and the mobile overlay-crowding nit.
- **Follow-up:** Desi LOW items; resume launch queue.

## Hostile close review

- **Giddy:** Pass. No schema/migration touched; purely a presentational restyle + a pure display helper
  on the same data flow. The brand-red removal closes a real white-label drift (a hardcoded `#dc2626`
  would have been wrong on WEKAF/Baseline). No new abstraction layer.
- **Doug:** Pass with live proof. Gates green and the deferred 0392 browser proof was actually captured
  this session (default explore view, belt-glow cards, Passport-fed drawer, 0 console errors) — stated
  with screenshots, not claimed.
- **Desi:** Pass. All HIGH + MEDIUM review items landed (brand token, WCAG contrast, reduced-motion,
  mobile collapse, dropped redundant Share, preserved guards). LOW items explicitly deferred, not
  silently dropped.
- **Kaizen aggregate:** 9/10 — premium, repo-law-compliant, browser-proven; minor polish remains.

## ADR / ubiquitous-language check

- ADR update **not required** — no architectural decision changed; SOT-ADR D1 (Passport identity SoT)
  is reinforced (the explorer + helper read Passport), not altered. The default-view flip is a UI
  routing default, not an ADR-level decision.
- Ubiquitous language update **not required** — no new domain terms (`passportDisplayName` is an impl
  helper, not a domain term).

## Reflections

- **"Adapt, don't blind-paste" earned its keep.** The drop-in looked drop-in-ready, but it hardcoded a
  brand red that is genuinely wrong in this white-label repo (BrandSettings DB token), used a
  brightness-midpoint for rank-pill contrast that fails on mid-luminance belts, and had no
  reduced-motion path. Desi caught all three before they shipped — a one-shot design review on a
  pasted artifact paid for itself.
- **The 0392 "owner-seed blocker" wasn't actually blocking.** The lineage seed already falls back to the
  Baseline-brand org owner (`sensei@baseline.test`), so a single `bun prisma/seed-baseline-lineage.ts`
  populated the trees and unblocked the browser proof that 0392 had deferred. Worth re-testing assumed
  blockers before carrying them forward.
- **Brand on the wrong host reads as "empty," not "broken."** `bbl.local` showed "0 lineage trees"
  because the seed targets the Baseline brand; the trees were there all along on `localhost`. The
  brand→host map (`lib/brand-context.ts`) is the thing to check first when a seeded surface looks empty.
- **Fallow's CRAP is coverage-weighted.** Two idiomatic React effects scored "HIGH" purely because
  client d3-integration effects carry no unit coverage — a reminder that the metric flags untested
  surface, not necessarily complex code. The DRY pass did drop the collapsed `??` chains below threshold.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0393 created + stamped `last_agent: claude-session-0393`; SESSION_0392 status drift corrected; no other doc frontmatter changes needed. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0393 row added; `custom-component-inventory.md` updated for the cinematic `LineageViewAIsland`; no new cross-page pairs_with needed. |
| Wiki lint | `bun run wiki:lint` PASS — no violations. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0393_REVIEW_01 + hostile close present; live browser proof captured. |
| Review & Recommend | Next session goal + first task written (resume BBL launch queue / D11 flip). |
| Memory sweep | Updated lineage-tree-pivot memory with the cinematic View A + explore-default. |
| Next session unblock check | Unblocked — next task (re-read SoT, pick launch gate) is doable; DNS flip needs operator action at Bluehost (noted). |
| Git hygiene | Branch `main`; FS-0024 guard run; single push — hash reported at bow-out / see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before the close commit: 12896 nodes, 24494 edges, 1761 communities, 2073 files tracked. |
