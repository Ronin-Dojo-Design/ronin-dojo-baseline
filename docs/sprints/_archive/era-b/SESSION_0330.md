---
title: "SESSION 0330 — Lineage Phase 3d persistent panel hardening"
slug: session-0330
type: session--implement
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: claude-session-0330
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0329.md
  - docs/petey-plan-0305.md
  - docs/runbooks/design/motion-system.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0330 — Lineage Phase 3d persistent panel hardening

## Date

2026-06-01

## Operator

Brian + claude-session-0330 (autonomous run via `scripts/auto-session.sh`)

## Goal

Land the next automatable code slice of Phase 3d from `docs/petey-plan-0305.md`:
harden the desktop persistent profile panel and the drawer's reduced-motion
contract, without duplicating the already-present scaffolding
(`LineageProfileDrawer`, `LineageRankHistoryTab`, belt-rail Mode B header bar,
real `RankAward`-backed promotion history). Two concrete gaps closed this
session: (1) drawer animations bypass `prefers-reduced-motion` — the
motion-system runbook calls this a blocking accessibility bug, and (2) the
underlying `Drawer` primitive container forces a `md:pt-[12.5vh]` offset that
makes the desktop persistent panel overflow the viewport. The desktop slide
direction (`from-bottom-4`, 16px upward) is intentionally left as-is — a
restrained sub-20px slide is motion-runbook-compliant and spatially fine for a
right-anchored persistent panel.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0329.md`
- Carryover: SESSION_0329 landed Phase 3c on-card `Change promoter...` wiring
  (capability-gated, single-shot auto-open into the drawer). The handoff
  explicitly framed Phase 3d as "harden the desktop persistent panel + promotion
  history surfaces without duplicating the already-present scaffolding."

### Branch and worktree

- Branch: `auto/session-0330`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `c3e9eaa`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/drawer.tsx` (L1 Drawer primitive). |
| Extension or replacement | Extension: keep the primitive's behavior, add a `motion-reduce` fallback that respects the motion-system runbook. Lineage-specific desktop overrides land in the consumer (`lineage-profile-drawer.tsx`). |
| Why justified | The reduced-motion fallback belongs on the primitive so every Drawer surface inherits it; the panel-positioning overrides are Ronin lineage-specific and stay at the consumer. |
| Risk if bypassed | Drawer surfaces ship a slide animation under `prefers-reduced-motion` — explicit motion-system runbook violation; persistent desktop panel renders with its bottom edge off-viewport. |

Live docs checked during planning: not applicable — no L1 templating change.

### Graphify check

- Graph status: current at bow-in; stats: 8992 nodes, 13903 edges, 1363 communities, 1542 files tracked.
- Queries used:
  - `lineage profile drawer persistent side panel promotion history rank belt color desktop md breakpoint`
- Files selected from graph and confirmed by direct read:
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/components/web/lineage/lineage-rank-history-tab.tsx`
  - `apps/web/components/web/lineage/lineage-tree-board.tsx`
  - `apps/web/components/common/drawer.tsx`
  - `apps/web/server/web/lineage/payloads.ts` (verified `LineageNodeProfile`
    payload already returns the full rank-award history with `awardedBy`,
    `organization`, `promotionEvent`, ordered by `awardedAt desc`)
  - `docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md`
  - `docs/runbooks/design/motion-system.md`
- Verification note: Graphify used as navigation only; exact files read directly.

### Grill outcome

Plan-locked by `docs/petey-plan-0305.md` §Phase 3 slice 3d + the SESSION_0329
"Next session" handoff. Operator-only browser smoke is the remaining 3d
verification path and is intentionally deferred (autonomous run can't perceive
the panel motion).

## Petey plan

### Goal

Close the two concrete Phase 3d hardening gaps: (a) drawer animations honor
`prefers-reduced-motion`, (b) desktop persistent panel positions inside the
viewport.

### Tasks

#### SESSION_0330_TASK_01 — Drawer reduced-motion fallback + desktop persistent panel positioning

- **Agent:** Cody
- **What:** Two surgical edits — one on the L1 `Drawer` primitive to add the
  `motion-reduce:animate-none` fallback that the motion-system runbook
  mandates, one on `LineageProfileDrawer` to override the inherited
  `md:pt-[12.5vh]` container offset so the persistent desktop panel fits the
  viewport.
- **Steps:**
  1. In `apps/web/components/common/drawer.tsx`, append
     `motion-reduce:animate-none` to the `DrawerContent` popup's animation
     class stack so that under `@media (prefers-reduced-motion: reduce)` the
     enter/exit animations resolve to `animation: none` and the popup renders
     at its resting state (the motion-system runbook's required behavior).
  2. In `apps/web/components/web/lineage/lineage-profile-drawer.tsx`, pass a
     `containerClassName` that overrides the inherited
     `md:pt-[12.5vh]` (and the `md:[@media(min-height:1000px)]:pt-[25vh]`
     variant) to a `md:pt-6` gap using the Tailwind v4 `!`-suffix override,
     so the persistent panel's top edge sits 24px below the viewport top and
     the panel's `calc(100dvh-3rem)` height fits inside the viewport (panel
     bottom ≈ 24px above the viewport bottom).
- **Done means:** typecheck + changed-file Biome pass; `prefers-reduced-motion`
  resolves the drawer animation chain to `animation: none`; the desktop
  persistent panel renders fully inside the viewport.
- **Depends on:** nothing.

#### SESSION_0330_TASK_02 — Full close with single push order

- **Agent:** Petey + Doug
- **What:** Run typecheck + changed-file Biome + `bun run wiki:lint`, refresh
  Graphify, write the SESSION close evidence, commit (no push — runner handles
  push + PR per the override).
- **Done means:** All gates pass; SESSION_0330 reflects landed state.
- **Depends on:** SESSION_0330_TASK_01.

### Parallelism

Single coherent change; not parallelized.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0330_TASK_01 | Cody | Three small CSS-level edits across two files — single coherent change. |
| SESSION_0330_TASK_02 | Petey + Doug | Full close + gates. |

### Open decisions

None — plan-locked by `docs/petey-plan-0305.md` §Phase 3 slice 3d.

### Risks

- Tailwind v4 cascade order: the `containerClassName` overrides must merge
  after the primitive's `md:pt-[12.5vh]` so the override wins. The drawer
  primitive already concats `containerClassName` last in its `cx()` call, so
  source-order resolution holds.
- The `motion-reduce:animate-none` utility relies on tw-animate's
  enter/exit keyframes ending at the resting (opaque, untransformed) state —
  which they do for `slide-in-from-bottom-*`, `slide-in-from-right-*`, and
  `fade-in-0`. Confirmed against the tw-animate utility set.

### Scope guard

- Do not change the `LineageRankHistoryTab` contract or data (the existing
  payload already returns the full real-storage rank-award history; no
  localStorage shim needed).
- Do not rewrite the `Drawer` primitive — only add the reduced-motion fallback.
- Do not touch schema, server actions, or the editor toolbar.
- Do not change the belt-rail Mode B header bar (already implemented in
  `lineage-profile-drawer.tsx:306-314`; verified visually-correct in
  SESSION_0329's review log).
- Do not run the local Playwright e2e suite (browser proof is operator-only
  smoke).

### Dirstarter implementation template

- **Docs read first:** Cody pre-flight + `docs/petey-plan-0305.md` + the
  lineage profile drawer port spec + the motion-system runbook.
- **Baseline pattern to extend:** existing `Drawer` (Base UI Dialog-derived)
  primitive; existing `LineageProfileDrawer` desktop persistent panel
  scaffolding.
- **Custom delta:** add the universally-required `motion-reduce` fallback to
  the primitive; pin the lineage drawer's desktop positioning + slide
  direction at the consumer layer.
- **No-bypass proof:** Reduced-motion compliance is mandated by the motion
  system runbook; we are not bypassing a Dirstarter capability, we are
  completing one. The desktop overrides live at the consumer so the primitive
  stays generic.

## Cody pre-flight

### Pre-flight: SESSION_0330_TASK_01 — Drawer reduced-motion + desktop panel positioning

#### 1. Existing component scan

- Graphify query used: `lineage profile drawer persistent side panel promotion history rank belt color desktop md breakpoint`.
- Found: `LineageProfileDrawer`, `LineageRankHistoryTab`, `LineageTreeBoard`,
  `Drawer` (L1 primitive), `LineageNodeProfile` payload.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes (Drawer is
  a Dirstarter-extended Base UI Dialog primitive).
- Closest L1 pattern: `Drawer` itself; no new primitive needed.
- Primitive API spot-check:
  - `Drawer` / `DrawerContent` — already accept `containerClassName`,
    `overlayClassName`, `showOverlay`, and forward `disablePointerDismissal`,
    `modal` to `DialogPrimitive.Root` (verified in Base UI
    `DialogRoot.d.ts`).
  - `motion-reduce:` Tailwind variant — built-in,
    `@media (prefers-reduced-motion: reduce)`.

#### 3. Composition decision

- Extending: `Drawer` primitive (one extra utility class) + `LineageProfileDrawer`
  (extra `containerClassName`, extra desktop slide classes).
- Composing existing primitives only — no new components.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes — SESSION_0329's "Next session" block.
- ADR read: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`
  (no provenance change this session, reconfirmed).
- Runbook consulted: `docs/runbooks/design/motion-system.md` (Section 3,
  reduced-motion discipline — the mandatory clause).

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (not run —
  autonomous run; operator-side smoke deferred).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: deferred to operator-side smoke.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0024 (cwd guard — passed at bow-in), FS-0025
  (single-push close order — followed), FS-0020 (Graphify-first — followed).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0330_TASK_01 | landed | Added `motion-reduce:animate-none` to the `Drawer` primitive popup className stack (after the snappy-entrance animation classes) so under `prefers-reduced-motion` the popup renders at its resting state with no enter/exit keyframes. Passed `containerClassName="md:pt-6! md:[@media(min-height:1000px)]:pt-6!"` from `LineageProfileDrawer` to override the inherited `md:pt-[12.5vh]`/`md:[@media(min-height:1000px)]:pt-[25vh]` flex-container offsets — the persistent desktop panel now fits inside the viewport. |
| SESSION_0330_TASK_02 | landed | Close gates passed (typecheck, changed-file Biome, `bun run wiki:lint`); wiki index + custom-component inventory updated; Graphify refreshed; SESSION evidence filled. Single-commit close per FS-0025. |

## What landed

- `Drawer` (L1 primitive at `components/common/drawer.tsx`): added
  `motion-reduce:animate-none` to the popup className. Under
  `@media (prefers-reduced-motion: reduce)` the tw-animate enter/exit keyframes
  (`slide-in-from-bottom-full`/`slide-in-from-bottom-4`/`fade-in-0` and their
  `out` counterparts) resolve to `animation: none`. Because tw-animate's
  keyframes terminate at the resting state, the popup paints visible and
  untransformed on first frame for reduced-motion users — matching the
  motion-system runbook §3 contract.
- `LineageProfileDrawer` (`components/web/lineage/lineage-profile-drawer.tsx`):
  added `containerClassName="md:pt-6! md:[@media(min-height:1000px)]:pt-6!"`
  on `DrawerContent`. The `!`-suffix is required to win the cascade against the
  primitive's arbitrary-value `md:pt-[12.5vh]` / `md:[@media(min-height:1000px)]:pt-[25vh]`
  utilities (Tailwind v4 emits arbitrary-value utilities after predefined ones
  inside the same variant bucket, so source-order alone would lose). The desktop
  persistent panel now sits 24px below the viewport top; with the popup's
  `md:max-h-[calc(100dvh-3rem)]` height (48px total), its bottom edge sits 24px
  above the viewport bottom.
- Wiki index + `LineageProfileDrawer` row in the custom-component inventory
  refreshed with the SESSION_0330 contract.

## Decisions resolved

- The desktop slide entrance stays at `slide-in-from-bottom-4` (16px upward
  slide). A `slide-in-from-right` would compose against the inherited
  `--tw-enter-translate-y: 1rem` (tw-animate utilities additively set per-axis
  CSS variables) and would need an explicit `[--tw-enter-translate-y:0]`
  override to render purely from the right. Per motion-system §1 ("restraint
  over flash"), the sub-20px bottom slide is the least-flashy entrance that
  still reads as motion; not worth the cascade override.
- The reduced-motion fallback was added to the L1 `Drawer` primitive (not just
  the lineage consumer) because the motion-system runbook §3 makes this
  mandatory for every motion surface, and other Drawer consumers (existing and
  future) benefit from the same fallback for free.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/common/drawer.tsx` | Added `motion-reduce:animate-none` to the popup className stack with a comment pointing at the motion-system runbook. |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | Passed `containerClassName="md:pt-6! md:[@media(min-height:1000px)]:pt-6!"` to `DrawerContent` so the desktop persistent panel fits inside the viewport. |
| `docs/sprints/SESSION_0330.md` | New SESSION ledger. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0330 row + refreshed `last_agent`. |
| `docs/knowledge/wiki/custom-component-inventory.md` | Annotated `LineageProfileDrawer` with the SESSION_0330 contract change. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pwd && git remote -v` | FS-0024 guard pass: cwd `/Users/brianscott/dev/ronin-dojo-app`, remote `Ronin-Dojo-Design/ronin-dojo-baseline`. |
| `cd apps/web && bun run typecheck` | Pass: `next typegen` then `tsc --noEmit --pretty false` exit 0. |
| `apps/web/node_modules/.bin/biome check <changed files>` | Pass: 0 fixes applied across `drawer.tsx` + `lineage-profile-drawer.tsx`. |
| `bun run wiki:lint` | Pass: 0 errors, 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `knowledge/wiki/aliases-and-canonical-ids.md`, `knowledge/wiki/repo-truth-index.md`) — unchanged from SESSION_0329. |
| Browser proof (operator-only) | Deferred: operator-side smoke needed to confirm the persistent-panel viewport fit on a real desktop browser and to validate the reduced-motion fallback via OS-level motion preference. Both are CSS-cascade-level changes verified by source-order analysis + Tailwind v4 `!`-suffix override semantics. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the single close commit; stats reported in `Full close evidence`. |

## Open decisions / blockers

- Operator-side device smoke: open `/dashboard/lineage/<treeId>`, confirm the
  persistent panel's bottom edge is fully visible on a 13–15" laptop and on a
  ≥1000px-tall display, and toggle macOS "Reduce motion" to confirm the
  drawer enter is instant. Flagged as operator-only — not blocking.

## Next session

### Goal

Run 3 of the SESSION_0328 stack — Phase 3-UX polish slice: the lineage UX/design
debt the SESSION_0314 replan identified (card consistency + count-badge collapse
behavior remaining items, plus a tightening pass on the discipline page's board
default).

### First task

Bow in against `docs/petey-plan-0305.md` §Phase 3 slice 3-UX; re-read the
`LineageNodeCard` height/rank-display contract, the count-badge-collapsed-only
rule, and the discipline page's board-default wire-up; harden whichever of
those three are still partial. If 3-UX is fully landed (SESSION_0314 marks it
done), step forward to Phase 3e (SVG 90° connectors) or 3f (search-to-highlight
and PDF export) — pick the smaller automatable slice.

## Review log

### SESSION_0330_REVIEW_01 — Drawer reduced-motion + desktop panel positioning

- **Reviewed tasks:** SESSION_0330_TASK_01, SESSION_0330_TASK_02
- **Dirstarter docs check:** not applicable — no L1 boilerplate touched.
- **Verdict:** Pass. The L1 `Drawer` primitive now satisfies the motion-system
  runbook §3 reduced-motion contract for every Drawer surface (lineage and
  future). The lineage consumer's `containerClassName` override is the
  minimally-invasive fix for the persistent panel's viewport overflow and
  uses the documented `Drawer` extension point (`containerClassName` was
  already wired on the primitive but unused before SESSION_0330).
- **Score:** 9.5/10
- **Follow-up:** Operator-side browser smoke on the dashboard editor + a
  macOS-level reduce-motion toggle.

## Hostile close review

### SESSION_0330 — Drawer reduced-motion + desktop panel positioning

- **Giddy:** Pass. No schema / server-action / API contract change. The
  primitive's enter/exit animation classes are preserved unchanged; the
  reduced-motion variant is additive. The consumer override uses an existing
  extension prop, not a hack.
- **Doug:** Pass. Typecheck, changed-file Biome, and `wiki:lint` all green.
  The Tailwind v4 `!`-suffix override is the documented pattern for beating
  arbitrary-value utilities of the same variant bucket (verified against
  `components/common/accordion.tsx` and `components/common/command.tsx`,
  which already use `p-0!` for the same reason).
- **Desi:** Pass. Restraint-over-flash is honored — the reduced-motion path
  is the resting state on first paint, no decorative slide. The persistent
  panel's 24px viewport gap matches the editor toolbar's vertical rhythm.

### Findings (severity ≥ medium)

None.

### Kaizen aggregate

9.5/10 — the slice is tight and reuses existing surfaces. The remaining 0.5
is operator-side browser smoke + a real `prefers-reduced-motion` toggle,
which the runner cannot perform.

#### Kaizen questions

- **Safe and secure?** Yes. No new permission surface, no new data path.
  Pure CSS hardening.
- **Failed steps prevented?** FS-0020 (Graphify-first): followed. FS-0024
  (cwd guard): followed at bow-in. FS-0025 (single close commit): followed.
  FS-0001/FS-0008/FS-0014 (L1 reuse): the primitive's existing
  `containerClassName` extension was the documented escape hatch — used
  rather than hand-rolling a new drawer.
- **Scale confidence:** 100: 9.5/10, 1,000: 9.5/10, 10,000: 9.4/10. The
  cascade-order risk is bounded by the Tailwind v4 `!`-suffix override; the
  reduced-motion fallback is universally compatible (tw-animate's enter
  keyframes end at the resting state).

## ADR / ubiquitous-language check

- ADR update **not required**. The slice does not change the lineage
  provenance contract (ADR 0016 — `RankAward` is canonical) or any motion
  contract beyond the runbook's existing §3 mandate.
- Ubiquitous language update **not required**. No new domain terms.
- Custom component inventory: updated `LineageProfileDrawer` row with the
  SESSION_0330 contract change.

## Reflections

- The Phase 3d scaffolding was more complete than the SESSION_0329 handoff
  implied. `useDesktopProfilePanel`, `modal={!isDesktopPanel}`, no-overlay,
  `disablePointerDismissal`, the belt-rail Mode B header bar, and the real
  `RankAward`-backed promotion-history tab all already existed. The actual
  hardening surface was just two CSS-level cascade fixes — one on the
  primitive, one on the consumer. The handoff phrasing "without duplicating
  the already-present scaffolding" was the key signal that prevented a
  rebuild.
- The Tailwind v4 cascade rule (arbitrary-value utilities emit *after*
  predefined utilities inside the same variant bucket) is worth pinning as
  a project memory — it's the difference between a passive override and a
  `!`-suffix override. The existing `p-0!` precedents in `accordion.tsx` /
  `command.tsx` confirmed the project's accepted pattern.
- The reduced-motion runbook §3 framed this as "blocking accessibility bug"
  status, which is sharper than most polish gates. Worth treating that
  framing as a real test on every motion surface — not just lineage.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log contains SESSION_0330_TASK_01 + SESSION_0330_TASK_02 (both landed). |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0330.md` created with current frontmatter (`last_agent: claude-session-0330`); `docs/knowledge/wiki/index.md` + `docs/knowledge/wiki/custom-component-inventory.md` updated in-place. |
| Backlinks/index sweep | Wiki index now lists SESSION_0330; SESSION pairs_with SESSION_0329 + petey-plan-0305 + motion-system runbook + autonomous-sessions runbook. |
| Wiki lint | `bun run wiki:lint` returned 0 errors, 3 pre-existing warnings (unchanged). |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | `SESSION_0330` block present above; no findings ≥ medium. |
| Review & Recommend | Next-session goal + first task written for SESSION_0328 Run 3 (Phase 3-UX polish or 3e/3f if 3-UX is closed). |
| ADR / ubiquitous-language check | Not required this slice (no provenance / domain-term change). |
| Memory sweep | No operator memory update needed; the Tailwind v4 cascade rule + reduced-motion mandate are captured in the Reflections and the inventory annotation. |
| Next session unblock check | Next agent inherits a clean `auto/session-0330` tip with Phase 3d hardened; Run 3 (Phase 3-UX or 3e/3f) is unblocked. |
| Git hygiene | FS-0024 guard passed at bow-in (`pwd` + remote verified). Commit deferred to the bow-out step; runner handles push + PR per the session override. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the close commit; stats after refresh: 8993 nodes, 13891 edges, 1348 communities, 1542 files tracked. |
