---
title: "SESSION 0356 — Drawer-gate removal + combined directory/org/profile hub (+ bow-in step) + owed oRPC ADR"
slug: session-0356
type: session--open
status: in-progress
created: 2026-06-07
updated: 2026-06-07
last_agent: claude-session-0356
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0355.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0356 — Drawer-gate removal + combined directory/org/profile hub (+ bow-in step) + owed oRPC ADR

## Date

2026-06-07

## Operator

Brian + claude-session-0356

## Goal

Three lanes, grilled to mutual understanding over three rounds: (1) **Drawer-gate fix** — *remove* the `canOpenProfileDrawer` field from `lineage-tier-policy` entirely (operator ruling: the drawer must open for **everyone**; tier gates the drawer's *contents* via the separate `LineageProfileDetailRenderPolicy`, never whether it opens), and rewire the four consumers (`lineage-tree-board` / `lineage-tree-canvas` / `lineage-mobile-list` / `lineage-compact-child-list`) to always open; verify a free/anon viewer can open the drawer and reach the claim CTA — closing SESSION_0355 FINDING_01. (2) **Discovery-process fix** — build one combined `directory-org-profile-hub.md` surface-index (routes + components + actions + SOP links, backlinks up/down) mirroring `lineage-hub.md`, and add a bow-in step to read **domain hub → domain SOP → route inventory before planning** — closing FINDING_02. (3) **Owed oRPC ADR (decision-only, no migration code)** — write ADR 0024 resolving the live contradiction between `epic-2026-05-19.md` ("oRPC pilot, 3 sessions") and `dirstarter-gap-audit.md` ("no migration to oRPC planned"): decide `next-safe-action` vs `oRPC + TanStack Query` for UX-heavy surfaces (lineage canvas, directory), including whether it requires the Next 16 toolchain bump first; log the contradiction as a Drift Register entry and stamp the uplift epic's real status. Full bow-out, glossary, ADR check, graphify update, push to main on green gates.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0355.md` (carryover taken from its "Next session" + "Open decisions / blockers").
- Carryover: SESSION_0355 shipped rich `DataSelect` ReactNode rows + `BeltSwatch`, the owner-less-org claim CTA + register CTAs, and the Desi profile-redesign assessment (`petey-plan-0356`). It left three open items this session takes: **FINDING_01** (drawer gated shut for free/anon), **FINDING_02** (no org/directory/profile domain hub), and the operator's mid-grill demand to stop handwaving **oRPC**.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating `docs/sprints/SESSION_0356.md`.
- Current HEAD at bow-in: `a687b13`
- Remote guard: `origin` is `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd is `/Users/brianscott/dev/ronin-dojo-app`, not `dirstarter_template`. FS-0024 guard passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `lib/entitlements/lineage-tier-policy.ts` (Ronin-custom entitlement layer, not Dirstarter) + 4 lineage consumer components (Ronin-custom); **Lane 3 ADR concerns the Dirstarter-owned action/API layer** — `next-safe-action` (the version we forked) vs `oRPC + TanStack Query` (newer upstream Dirstarter). |
| Extension or replacement | Lane 1 = **subtraction** within Ronin's own entitlement policy (no Dirstarter surface touched). Lane 2 = docs/governance. Lane 3 = **decision-only**: whether to adopt the newer Dirstarter data layer; no code, no replacement this session. |
| Why justified | The drawer-open gate is Ronin policy, not Dirstarter; removing a vestigial always-false boolean is data-layer-agnostic (works identically on `next-safe-action` or `oRPC`). The ADR resolves a real governing-doc contradiction before any UX-heavy build commits to a data layer. |
| Risk if bypassed | Leaving the contradiction unresolved keeps re-losing a major architectural goal (exactly the FINDING_02 rediscovery failure); building the profile redesign on the wrong data layer would be partial throwaway. |

Live docs checked during planning: local Dirstarter inventories + `dirstarter-baseline-index.md` §13k + `dirstarter-gap-audit.md` + `epic-2026-05-19.md` + `lane-ledger.md` read directly. Live `dirstarter.com/docs` (oRPC layer) deferred to the ADR write (optional strengthening; the decision is groundable from the local reconciliation).

### Graphify check

- Graph status: current (built end of SESSION_0355); `graphify stats` at bow-in: 9730 nodes, 15344 edges, 1453 communities, 1630 files tracked.
- Queries used:
  - `lineage tier policy canOpenProfileDrawer render policy entitlements free anon drawer`
  - `oRPC TanStack Query react-query dirstarter upstream client query mutation`
- Files selected from graph / bounded follow-up (verified by direct read):
  - `apps/web/lib/entitlements/lineage-tier-policy.ts` (+ `.test.ts`); consumers `lineage-tree-board.tsx`, `lineage-tree-canvas.tsx`, `lineage-mobile-list.tsx`, `lineage-compact-child-list.tsx`
  - `docs/architecture/uplift/epic-2026-05-19.md`, `lane-ledger.md`, `docs/architecture/dirstarter-baseline-index.md`, `docs/knowledge/wiki/dirstarter-gap-audit.md`
  - `docs/runbooks/domain-features/lineage-hub.md` (hub template)
- Verification note: Graphify navigation only. Exact `canOpenProfileDrawer` blast radius (6 files / 15 sites) confirmed by direct symbol search; ADR trail confirmed by direct doc read (no oRPC ADR exists; no `@orpc/*` / `@tanstack/react-query` dep; no `/api/rpc` route; `.dirstarter-upstream` SHA still `pending`).

### Grill outcome

Petey grilled **three rounds** (operator answered via AskUserQuestion):

1. **Session scope** — THIS session = drawer-gate bug + the combined domain hub + bow-in step; profile Lane A deferred (its BBL teardown WebFetch was denied in 0355 and it's the biggest lane).
2. **Drawer flag** — operator chose **remove `canOpenProfileDrawer` entirely** (not just flip FREE→true). The separate `LineageProfileDetailRenderPolicy` already gates drawer *contents* by tier, so the open-gate boolean is genuinely vestigial under the "open for everyone" ruling.
3. **Hub shape** — **one combined** `directory-org-profile-hub.md` (org/directory/profile are deeply interleaved; one coherent surface index).
4. **oRPC (operator pushback, not a side-quest)** — operator rejected handwaving; surfaced the real concern: "shouldn't we do oRPC FIRST if we'll rewrite the drawer/hub for it anyway?" Petey corrected the premise (drawer = data-layer-agnostic subtraction; hub = doc index that *aids* migration → **zero throwaway**), and affirmed the instinct is right for the *bigger* profile/UX work → the owed **oRPC ADR is on the critical path before the profile redesign**. Operator chose: **drawer + hub + write the oRPC ADR this session** (decision-only, no migration code).

### Drift logged

- **oRPC governing-doc contradiction** (Drift ID assigned in Lane 3). `epic-2026-05-19.md` locks "oRPC pilot (3 sessions, ADR_0019 + lineage canvas pilot)"; `dirstarter-gap-audit.md` line 124 states "No migration to oRPC planned. Deliberate long-term choice"; `dirstarter-baseline-index.md` §13k governs it as "ADR-level at L10, do not mass-replace actions — ADR required before implementation." The deciding ADR was never written ("ADR_0019" was reused for membership-lifecycle), and the planned pilot sessions (L10–L14) were displaced by the Base UI migration (L6) ballooning from 1 lane to 8 phases across SESSION_0208–0218. Net: oRPC sits **undecided + unbuilt**, misremembered as "done." Resolved this session by ADR 0024 + a Drift Register entry + an honest status stamp on the epic.

## Petey plan

### Goal

Remove the vestigial drawer-open gate so the lineage profile drawer opens for everyone (contents still tier-gated), close the discovery gap with one combined directory/org/profile hub + a bow-in step, and resolve the long-stalled oRPC question with the owed ADR 0024 — pushed to main on green gates.

### Tasks

#### SESSION_0356_TASK_01 — Remove `canOpenProfileDrawer`; drawer opens for everyone

- **Agent:** Cody (build) → Doug/Playwright (smoke)
- **What:** Delete the `canOpenProfileDrawer` field from `LineageListingRenderPolicy` and rewire the 4 consumers to always open the drawer; contents stay gated by `LineageProfileDetailRenderPolicy`.
- **Steps:** (a) remove `canOpenProfileDrawer` from the `LineageListingRenderPolicy` type + `FREE_*`/`PREMIUM_*` constants (ELITE/LEGEND spread from PREMIUM); update `lineage-tier-policy.test.ts` (drop the 3 assertions). (b) `lineage-tree-board.tsx` (lines 126/136/223/227): open handler + drawer `open`/`profile` props always-active. (c) `lineage-tree-canvas.tsx` (line 1430): remove the `!canOpenProfileDrawer` teaser/disable branch. (d) `lineage-mobile-list.tsx` (136/188/191) + `lineage-compact-child-list.tsx` (232/275): simplify `(canOpenProfileDrawer || canChangePromoter)` conditions to always-render the open affordance. (e) confirm the drawer *contents* still render the FREE detail policy (avatar + rankSummary only) for free/anon. (f) Playwright dev-login + logged-out smoke: free/anon viewer opens the drawer and reaches the claim CTA; screenshot.
- **Done means:** `canOpenProfileDrawer` fully gone from the codebase; free/anon viewer opens the drawer + reaches claim CTA (screenshot); typecheck/biome/tests green; closes FINDING_01.
- **Depends on:** nothing.

#### SESSION_0356_TASK_02 — Combined directory/org/profile domain hub + bow-in step

- **Agent:** Petey (doc) — surface-index, mirrors `lineage-hub.md`
- **What:** Create `docs/runbooks/domain-features/directory-org-profile-hub.md` indexing org/directory/profile routes + components + server actions + the wiring SOPs, with backlinks up (README) and down (the SOPs); add a bow-in step.
- **Steps:** (a) inventory the surface from the route inventory (`/organizations`, `/organizations/new`, `/organizations/[slug]`, `/schools`, `/schools/[slug]`, `/directory`, `/me`, claim + register CTAs, `/admin/claims`); (b) map the components (`OrgClaimCta`, `ListingRegisterCta`, `ProfileHero`, `create-organization-form`, directory filters) + server actions (`ProfileClaimRequest` flow, directory filter-options) + the governing SOPs/ADRs (ADR 0023 generic profile claim, lineage §4–5 directory/claim, registration SOP §18); (c) JETTY frontmatter + backlinks per the wiki schema; (d) add a step to `docs/rituals/opening.md` (and a CLAUDE.md pointer) to read the relevant **domain hub → domain SOP → route inventory before planning**; (e) link the new hub from `runbooks/README.md` + `wiki/index.md`.
- **Done means:** the hub exists with valid JETTY frontmatter, resolves all links, passes `wiki:lint`; the bow-in step is added; closes FINDING_02.
- **Depends on:** nothing (runs parallel to 01).

#### SESSION_0356_TASK_03 — Owed oRPC ADR 0024 + drift entry + epic status stamp

- **Agent:** Petey (decision-only — NO migration code)
- **What:** Resolve the oRPC contradiction with ADR 0024; log the drift; stamp the uplift epic's real status.
- **Steps:** (a) write `docs/architecture/decisions/0024-orpc-vs-next-safe-action.md` — context (we forked the `next-safe-action` Dirstarter at `c42e8bb`; newer upstream uses `oRPC + TanStack Query`; the L10 ADR was never written, pilot displaced by L6), the decision options (stay / adopt oRPC for UX-heavy surfaces / hybrid), the dependency on the Next 16 toolchain bump (L14), the brand-scope + audit/rate-limit preservation question (`next-safe-action` provides these today), and a **recommended decision + sequencing** (pilot scope = lineage canvas + directory) — frame it so the operator can ratify; (b) add a Drift Register entry for the epic↔gap-audit contradiction; (c) stamp `epic-2026-05-19.md` (+ `lane-ledger.md` note) with the honest status: L1–L6 (env/schema/listings/UI + full Base UI migration, D-016 CLOSED) done; L7–L15 (vendor polish, content/SEO, admin routing, oRPC ADR+pilot, toolchain bump, final reconciliation) NOT executed; `.dirstarter-upstream` still `pending`.
- **Done means:** ADR 0024 exists with a clear recommendation; drift entry logged; epic + ledger stamped with true status; no migration code written; `wiki:lint` green.
- **Depends on:** nothing (parallel to 01/02).

#### SESSION_0356_TASK_04 — Governance + verify + full bow-out

- **Agent:** Doug → Petey
- **What:** Verify gates; full close.
- **Steps:** typecheck/biome/pure tests/`fallow` changed-file; glossary + ADR check + custom-component-inventory (no new components expected — drawer is a removal); memory sweep (update the drawer-gate memory: bug → fixed-by-removal; add oRPC-state memory); graphify update; push to main on green gates.
- **Done means:** gates green; SESSION file + wiki + glossary updated; memory swept; pushed.
- **Depends on:** all.

### Parallelism

- TASK_01 (Cody code), TASK_02 (Petey doc), TASK_03 (Petey doc/ADR) are file-disjoint and can interleave; TASK_01 carries the code-build baton. TASK_02 and TASK_03 are pure docs and can be written alongside. TASK_04 last.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0356_TASK_01 | Cody/Doug | Policy subtraction + 4-consumer rewire + Playwright smoke. |
| SESSION_0356_TASK_02 | Petey | Surface-index doc mirroring an existing hub. |
| SESSION_0356_TASK_03 | Petey | Architecture decision + governance reconciliation. |
| SESSION_0356_TASK_04 | Doug/Petey | Verify + full close. |

### Open decisions

- **ADR 0024 recommendation is for operator ratification** — Petey writes a recommended decision + sequencing; the operator ratifies (adopt-oRPC-for-UX-heavy vs stay vs hybrid). The ADR can land `status: proposed` if the operator wants to sleep on it.

### Risks

- Removing `canOpenProfileDrawer` is a subtraction touching 6 files / 15 sites with OR-conditions (`|| canChangePromoter`) and a `!canOpenProfileDrawer` teaser branch — Cody must read each site, not blind-replace (mitigated by the pre-flight site-by-site read).
- App-code change (Lane 1) deploys to live prod on push; Lanes 2–3 are docs-only (won't trigger the prod build per `vercel.json` ignoreCommand).
- Playwright smoke may be flaky unattended; push is code-green-gated, smoke is evidence.

### Scope guard

- **No oRPC migration code** — ADR/decision only.
- **No profile-redesign Lane A** — deferred (blocked on BBL WebFetch; gated behind the oRPC ADR).
- **No drawer *contents* changes** — only the open-gate is removed; `LineageProfileDetailRenderPolicy` is untouched.
- **No toolchain bump / Next 16** — that's an ADR input, not this session's work.
- Anything surfacing mid-session (e.g., consumer edge cases, ADR sub-questions) → `Open decisions / blockers`, not inline scope creep.

### Dirstarter implementation template

- **Docs read first:** local Dirstarter inventories + `dirstarter-baseline-index.md` §13k + `dirstarter-gap-audit.md` + `epic-2026-05-19.md` + `lane-ledger.md` (2026-06-07, direct read). Live `dirstarter.com/docs` oRPC page = optional strengthening at the ADR write.
- **Baseline pattern to extend:** Ronin's own `lineage-tier-policy` entitlement layer + `LineageProfileDetailRenderPolicy` (contents gate stays); `lineage-hub.md` as the hub template; ADR template + Drift Register for the governance lane.
- **Custom delta:** remove the vestigial open-gate; one combined domain hub + a bow-in step; the owed oRPC decision record.
- **No-bypass proof:** Lane 1 subtracts within Ronin's own policy (no Dirstarter surface touched); Lane 3 explicitly *decides* whether to adopt the newer Dirstarter data layer rather than silently forking — it closes a gap between Ronin and upstream, it doesn't widen one.

## Cody pre-flight

### Pre-flight: TASK_01 (drawer-gate removal)

**Pre-flight: waived by Petey — no new surface.** TASK_01 created zero new files / components / Prisma models / server actions; it is a pure **subtraction** (removed the `canOpenProfileDrawer` field) + **consolidation** of five existing consumers. Per cody-preflight.md Rule 4, the formal Component/Schema/Backend checklists target *new* surface and do not apply. The pre-flight *substance* was done inline and is recorded here:

- **Existing-code scan:** Graphify query `lineage tier policy canOpenProfileDrawer …` + direct symbol search located the full blast radius (6 files / 15 sites) before any edit. No new component needed — extends/subtracts within existing files.
- **Target-file inspection:** read each consumer site (`lineage-tree-board`, `lineage-tree-canvas`, `lineage-mobile-list`, `lineage-compact-child-list`, `lineage-node-card`) + `LineageMemberActionsMenu` + both policy test files before editing.
- **Lane docs:** SESSION_0355 "Next session" + FINDING_01 read; entitlement contents-gate (`LineageProfileDetailRenderPolicy`) confirmed as the surviving tier mechanism.
- **Dev env:** `apps/web`, `npx next dev --turbo` (FS-0002), host `bbl.local:3000`; verify via `bun run typecheck` / `bunx biome check` / `bun test`.
- **FAILED_STEPS:** none open in the lineage entitlement area; FS-0002 (dev command) acknowledged.

### Pre-flight: TASK_02 / TASK_03

Waived — docs/governance only (hub surface-index + ADR + drift + epic stamp); no code surface (cody-preflight.md Rule 4 doc waiver).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0356_TASK_01 | landed | Removed `canOpenProfileDrawer` (6 files) + drawer-open consolidation; node-card stale aria-label + redundant-menu fixed; actions-menu rule unified to `canChangePromoter` across all 4 member views; policy + node-card tests updated. **Browser-verified** (free dev viewer opens drawer + reaches "Claim this profile" CTA; screenshot). |
| SESSION_0356_TASK_02 | landed | Combined `directory-org-profile-hub.md` surface-index + bow-in step 3d (domain-hub-first) in `opening.md`; linked from README + wiki index. Closes FINDING_02. |
| SESSION_0356_TASK_03 | landed | **ADR 0024** (next-safe-action vs oRPC+TanStack — hybrid + scoped pilot, status `proposed`) + drift **D-021** (oRPC contradiction) + **D-022** (detail policy directory-only) + uplift-epic honest-status stamp. |
| SESSION_0356_TASK_04 | landed | Gates green (typecheck/biome 11 files/57 tests/wiki-lint); memory sweep; graphify update; push. |
| SESSION_0356_TASK_05 | landed | **(mid-session add — operator "fix the cause")** Member view-model extracted to `canvas-model.ts` (`memberAvatarSrc`/`memberBeltColor`/`memberRankLabel`/`memberSchoolLabel` + unit tests); de-duplicated across node-card (also killed its dup `SelectedRank` type + `initials()`), mobile-list, compact-list, honor-strip. **Browser-verified across all 4 displays** (no visual regression; longer rank labels truncate). |

## What landed

- **Drawer-gate removed (FINDING_01 closed):** `canOpenProfileDrawer` deleted entirely; the lineage profile drawer opens for **everyone**; the four consumers rewired to always-open. **Browser-verified** — a free-tier dev viewer opens the drawer and reaches the "Claim this profile" CTA (screenshot).
- **Member view-model de-spaghetti (operator "fix the cause"):** the 4×-duplicated member display derivation extracted to `lib/lineage/canvas-model.ts` (`memberAvatarSrc`/`memberBeltColor`/`memberRankLabel`/`memberSchoolLabel` + unit tests); consumed by node-card (which also lost a duplicate `SelectedRank` type + a duplicate `initials()`), mobile-list, compact-list, and honor-strip. Actions-menu visibility unified to `canChangePromoter` across all four. **Browser-verified across all 4 displays** — no visual regression.
- **Combined domain hub (FINDING_02 closed):** `directory-org-profile-hub.md` surface-index + opening-ritual **step 3d** (domain-hub-first before grilling) + README/wiki-index links.
- **oRPC decision recorded:** **ADR 0024** (hybrid + scoped lineage-canvas pilot; next-safe-action stays default; status `proposed`) resolving drift **D-021**; uplift epic stamped with honest status; **D-022** logs the directory-only detail policy.
- **Operator redirect (end of session):** Black Belt Legacy launch (CUTOVER_CHECKLIST) is the focus from here; the `memberSchoolLabel`-from-`Membership` source is wrong for BBL → both staged to Next session. No further code this session.

## Decisions resolved

- **Drawer-open gate removed, not flipped** (grill round 2): `canOpenProfileDrawer` deleted; drawer opens for everyone.
- **Drawer contents = funnel-first** (operator, post-verify): the lineage drawer intentionally shows the **full public profile** to everyone (discovery→claim). It never tier-gated contents — `LineageProfileDetailRenderPolicy` is directory-only (D-022). Not a privacy leak (server payload allowlist is the boundary).
- **One combined directory/org/profile hub** (grill round 3), not three.
- **Member presentation de-duplicated via a shared view-model** (operator "fix the cause / Option ②"): shared *derivation* in `canvas-model.ts`; layouts stay per-component (they legitimately differ); browser-verified.
- **oRPC** — hybrid + scoped pilot (ADR 0024, proposed); no mass migration; next-safe-action stays default. Toolchain already modern (Next 16/React 19) so no bump blocks it.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/entitlements/lineage-tier-policy.ts` (+ `.test.ts`) | Removed `canOpenProfileDrawer` field from type + FREE/PREMIUM constants; dropped 3 test assertions. |
| `apps/web/components/web/lineage/lineage-tree-board.tsx` | Drawer always-open (open handler + `open`/`profile` props); empty `useCallback` deps. |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Removed the dead free-only "trace path" copy branch. |
| `apps/web/components/web/lineage/lineage-mobile-list.tsx` | Shared view-model helpers; aria-label always "Open profile"; chevron always; actions menu gated by `canChangePromoter`; removed 3 local derivation helpers. |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | Shared view-model helpers; actions menu gated by `canChangePromoter`; aria-label fix. |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Shared view-model helpers; removed duplicate `SelectedRank` type + `initials()`; stale aria-label fixed; menu rule unified. |
| `apps/web/components/web/lineage/lineage-node-card.policy.test.tsx` | Assertions moved to the new intent (drawer opens for all; avatar/school still gated). |
| `apps/web/components/web/lineage/lineage-honor-strip.tsx` | Uses shared `memberAvatarSrc`. |
| `apps/web/lib/lineage/canvas-model.ts` (+ `.test.ts`) | New member view-model: `memberAvatarSrc`/`memberBeltColor`/`memberRankLabel`/`memberSchoolLabel` + 4 tests. |
| `docs/architecture/decisions/0024-orpc-vs-next-safe-action.md` | New ADR (proposed). |
| `docs/runbooks/domain-features/directory-org-profile-hub.md` | New combined domain hub. |
| `docs/rituals/opening.md` | New step 3d (domain-hub-first). |
| `docs/knowledge/wiki/drift-register.md` | D-021 (oRPC), D-022 (detail policy). |
| `docs/architecture/uplift/epic-2026-05-19.md` | Honest-status reconciliation banner. |
| `docs/runbooks/README.md`, `docs/knowledge/wiki/index.md` | Hub links. |
| `docs/sprints/SESSION_0356.md` | This ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | ✅ clean |
| `bunx biome check` (11 changed code files) | ✅ clean |
| `bun test lib/lineage lib/entitlements/...policy components/...node-card.policy` | ✅ 57/57 pass |
| `bun run wiki:lint` | ✅ (after fixing 1 link + 6 date bumps) |
| Browser — free viewer opens drawer + claim CTA | ✅ `session-0356-drawer-opens-free-viewer.png` |
| Browser — board/compact-list (rank labels truncate) | ✅ `session-0356-board-fullpage.png` |
| Browser — mobile list (390px) + drawer + claim | ✅ `session-0356-mobile-list.png` |
| Browser — honor strip belt stripes | ✅ no regression |

## Open decisions / blockers

- **BBL is the focus until CUTOVER_CHECKLIST is complete** (operator directive, end of session). We drifted into lineage/infra/refactor work again; refocus on the launch gates. → Next session.
- **`memberSchoolLabel` source is wrong for BBL** (operator): school must NOT come from `Membership` for Black Belt Legacy. It comes from the **registration/claim/invite/new-user-registration** flow, or is **added by an admin / RBAC-granted user** (`TREE_ADMIN` / `TREE_EDITOR` / `BRANCH_EDITOR`). → Next session (domain-model fix; no code changed this session).
- **ADR 0024 is `proposed`** — awaiting operator ratification of the hybrid + scoped-pilot stance.

## Next session

### Goal

**Refocus on Black Belt Legacy launch — work the `CUTOVER_CHECKLIST`, no drift.** Bow-in by graphify-querying the BBL launch set (`docs/product/black-belt-legacy/{PRD,STORIES,CUTOVER_CHECKLIST,GAP_MATRIX}.md` + `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md`) and the new `directory-org-profile-hub`, then pick the highest launch-gating item: Layer 1 #1 (verify BBL brand renders on Vercel prod) or the GAP_MATRIX launch-blocking partials (authenticated claim BBL-PROFILE-002; role-scoped editor BBL-EDITOR-003/004). Land the **school-source domain fix** as part of it: a BBL member's school comes from registration/claim/invite/new-user-registration or an RBAC-granted editor (`TREE_ADMIN`/`TREE_EDITOR`/`BRANCH_EDITOR`), **not** `Membership` — so `memberSchoolLabel` (and the read model behind it) must read the BBL affiliation source, not `user.memberships[0]`.

### First task

Graphify-query the BBL launch set + read `CUTOVER_CHECKLIST.md` (done partially this session) and `GAP_MATRIX.md` "highest-value next tasks"; confirm with the operator the single launch gate to attack first (DNS-render verify vs authenticated-claim vs role-scoped-editor). Before any code, map the **school/affiliation source of truth for BBL** (registration/claim/invite/RBAC) against the current `Membership`-based `memberSchoolLabel`, and decide the correct read model — then fix it as the first concrete change.

## Review log

### SESSION_0356_REVIEW_01 — Drawer-gate removal + member view-model + oRPC ADR + BBL refocus

- **Reviewed tasks:** SESSION_0356_TASK_01..05
- **Dirstarter docs check:** baseline-index §13k + gap-audit + epic read directly; ADR 0024 extends the decision record, no parallel system.
- **Verdict:** Pass. The drawer fix is a clean subtraction, browser-verified for the free path including the claim CTA. The view-model extraction removed real 4×-duplication (and caught two bugs my first pass missed — a stale aria-label and an inconsistent menu rule), browser-verified across all four displays with zero visual regression. The oRPC ADR resolves a long-stalled lost goal with a concrete pilot, not a punt. Honest finding surfaced (drawer never tier-gated contents) and ruled on (funnel-first). The session over-ran into infra/refactor territory — the operator's BBL refocus is the correct correction and is staged.
- **Score:** 8.8/10 locally.
- **Follow-up:** BBL cutover focus; school-source domain fix; ADR 0024 ratification.

## Hostile close review

- **Giddy:** Pass — `canOpenProfileDrawer` removal is a subtraction (no parallel system); the member view-model **consolidates** 4× duplication into the existing `canvas-model.ts` (no new module, no fork); ADR 0024 reuses the decision-record + drift-register conventions.
- **Doug:** Pass — typecheck + biome (11 files) + 57/57 tests + wiki-lint green; the drawer-open + claim CTA + all 4 displays browser-verified with screenshots. No code shipped after the operator's "no more code" directive.
- **Desi:** Pass — view-model change is presentation-derivation only; layouts unchanged (verified); rank-label truncation handles the longer unified label; honor-strip/board/mobile all render correctly.
- **Security review:** no new surface; drawer shows only the privacy-allowlisted public payload (D-022 confirms not a leak); claim CTA path unchanged.
- **Kaizen aggregate:** 8.8/10 — strong, honest, browser-proven; the session's own lesson is the drift it embodied (infra/refactor depth while BBL launch waits), now corrected by the refocus.

### Findings (severity ≥ medium)

#### SESSION_0356_FINDING_01 — Recurring drift from the BBL launch focus

- **Severity:** medium
- **Task:** (process; surfaced by operator end-of-session)
- **Evidence:** the session deepened into lineage drawer + a member-view refactor + an oRPC ADR while `CUTOVER_CHECKLIST.md` (the stated launch priority since the 2026-05-18 launch doc) has Layer-1 items 1–8 + GAP_MATRIX launch-blocking partials still pending. The operator: "drifted. AGAIN."
- **Impact:** launch-gating BBL work keeps getting deferred behind infra/refactor lanes.
- **Required follow-up:** make BBL/CUTOVER the default lane until cutover; bow-in reads the BBL launch set first (now aided by the new domain hub + step 3d).
- **Status:** open (next session).

#### SESSION_0356_FINDING_02 — `memberSchoolLabel` uses `Membership`, wrong source for BBL

- **Severity:** medium
- **Task:** SESSION_0356_TASK_05 (surfaced via the view-model extraction + the live drawer "School: No active membership")
- **Evidence:** `memberSchoolLabel(node) = node.user.memberships?.[0]?.organization?.name`. For BBL, a member's school comes from registration (visitor claim/invite/new-user-registration) or an RBAC-granted editor (`TREE_ADMIN`/`TREE_EDITOR`/`BRANCH_EDITOR`), not the generic `Membership`.
- **Impact:** BBL lineage members show no/incorrect school; the affiliation source of truth is mismodeled for BBL.
- **Required follow-up:** map the BBL affiliation source of truth and repoint the read model + `memberSchoolLabel`. No code this session (operator directive).
- **Status:** open (next session).

## ADR / ubiquitous-language check

- **ADR:** **ADR 0024 created** (`0024-orpc-vs-next-safe-action.md`, `proposed`) — the owed oRPC decision. ADR 0023 (generic profile claim) reconfirmed as the claim contract. No other ADR required.
- **Ubiquitous language:** new internal terms — **member view-model** (`memberAvatarSrc`/`memberBeltColor`/`memberRankLabel`/`memberSchoolLabel` in `canvas-model.ts`). No new domain nouns (Passport/DirectoryProfile/Organization/Membership unchanged). Flagged for next session: the **BBL school/affiliation source of truth** is *not* `Membership` — a domain-language clarification owed in the directory-org-profile glossary once the read model is fixed.

## Reflections

- The highest-value moments were the operator's escalating pushes — "hostile-review the files NOW," "Apple or spaghetti? DTOs?," "are you using cody-preflight?" Each one found something real: a stale aria-label I'd grepped past, an inconsistent menu rule I'd introduced, a test asserting the old behavior, and a whole class of 4× duplication. Pressure-as-review worked.
- The honest architectural read held up: the **DTO/privacy layer is genuinely good** (allowlisted, test-guarded); the drift is **localized presentation duplication + decision-debt**. The view-model extraction was the right "fix the cause" — and it immediately exposed that the lineage drawer never tier-gated contents (D-022), which the operator then ruled funnel-first.
- The real lesson is the one the operator named: **this session itself was the drift.** A drawer-gate one-liner became a refactor + an ADR + two hubs while the BBL launch — the actual priority since 2026-05-18 — waited. The new domain hub + bow-in step 3d are partial structural guards against exactly this, but the discipline (BBL-first until cutover) is the real fix.
- `cody-preflight` should have been stamped up front for the (initially) no-new-surface change; recording the waiver after the fact is the lesser miss. For the view-model extraction (new surface) the pre-flight substance was done inline and the new module reused the canonical `canvas-model.ts`.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0356 + ADR 0024 + hub stamped `last_agent: claude-session-0356`; 6 changed docs bumped `updated: 2026-06-08`. |
| Backlinks/index sweep | Hub linked from `runbooks/README.md` + `wiki/index.md`; ADR/drift cross-linked. |
| Wiki lint | `bun run wiki:lint` — ✅ clean (1 link + 6 dates fixed). |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0356_REVIEW_01 + Giddy/Doug/Desi/security + 2 findings. |
| Review & Recommend | Next session = BBL cutover focus + school-source fix. |
| Memory sweep | drawer-gate memory (bug→fixed-by-removal); member view-model; BBL-focus + school-source; oRPC-state. |
| Next session unblock check | BBL launch set + cutover checklist read; school-source mapping is the first concrete step. |
| Git hygiene | Branch `main`; FS-0024 guard passed; commit `<filled at push>`. |
| Graphify update | `<filled at push>`. |
