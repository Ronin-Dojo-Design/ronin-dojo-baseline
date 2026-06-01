---
title: "SESSION 0317 — Lineage non-modal panel + tree repair"
slug: session-0317
type: session
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: codex-session-0317
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0316.md
  - docs/petey-plan-0305.md
  - docs/architecture/lineage/promotion-event-model.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0317 — Lineage non-modal panel + tree repair

## Date

2026-06-01

## Operator

Brian + codex-session-0317

## Goal

Implement the SESSION_0316 carryover: verify the Rigan Machado seed on `/disciplines/bjj`, add an opt-in non-modal `Drawer` path for the persistent lineage panel, and repair the desktop/mobile tree layout without expanding schema or product scope. Use `next dev --webpack` until the Turbopack + Prisma blocker is fixed or becomes blocking.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0316.md`
- Carryover: SESSION_0316 landed the verified Rigan Machado seed, widened board mode, lit up belt-rail Mode B + Rank History, and staged the shared-primitive non-modal panel plus tree-layout repair for SESSION_0317. Visual re-capture was blocked by local Postgres pool/auth instability, so this session begins by proving the DB-backed page renders on webpack.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `becc63c`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming / UI primitives (`Drawer`/Base UI Dialog, variants, Tailwind styling) and Prisma/dev-server behavior if the Turbopack blocker is touched. |
| Extension or replacement | Extension: add an opt-in non-modal path to the existing shared `Drawer` while preserving modal defaults for all current consumers. No primitive fork. |
| Why justified | The BBL lineage page needs a persistent desktop inspector while keeping the shared Dirstarter-derived primitive contract stable. |
| Risk if bypassed | A one-off panel would fork L1 UI behavior; a careless shared-primitive change could regress app-wide dialogs/drawers. |

Live docs checked during planning: Dirstarter Theming (`https://dirstarter.com/docs/theming`), Dirstarter Prisma (`https://dirstarter.com/docs/database/prisma`), Base UI Dialog (`https://base-ui.com/react/components/dialog`) on 2026-06-01.

### Graphify check

- Graph status: current enough for navigation; stats at bow-in: 8812 nodes, 13297 edges, 1348 communities, 1504 files tracked.
- Queries used:
  - `grill-me protocol grill open decisions mutual understanding planning`
  - `lineage persistent panel Drawer modal backdrop LineageProfileDrawer LineageTreeCanvas discipline bjj tree layout root chain`
  - `components common drawer Base UI Dialog DrawerTrigger DrawerBackdrop DrawerContent consumer modal non modal`
- Files selected from graph:
  - `apps/web/components/common/drawer.tsx`
  - `apps/web/components/common/dialog.tsx`
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx`
  - `apps/web/components/web/lineage/lineage-tree-canvas.tsx`
  - `apps/web/components/web/lineage/lineage-tree-board.tsx`
  - `apps/web/lib/lineage/tree-layout.test.ts`
  - `apps/web/e2e/lineage/public-visibility.spec.ts`
  - `apps/web/e2e/lineage/authenticated-lifecycle.spec.ts`
  - `docs/runbooks/dev-environment/dev-environment.md`
  - `docs/runbooks/dev-environment/local-dev-auth-storage.md`
  - `docs/runbooks/database/database.md`
  - `docs/runbooks/database/prisma-workflow.md`
  - `docs/runbooks/database/schema-migration.md`
  - `docs/runbooks/domain-features/lineage-hub.md`
  - `docs/runbooks/domain-features/lineage-listing-runbook.md`
- Verification note: exact files still need to be opened during Cody pre-flight before code. Graphify was used as navigation, not proof.

### Grill outcome

Defaults approved by Brian with one caveat:

- Do not switch to Docker or reset/reseed Postgres unless `/disciplines/bjj` proves missing seed data or the DB becomes unreachable.
- Use webpack for DB-backed capture/implementation smoke.
- Turbopack fix stays out of the critical path, **but circle back at the end** because Turbopack has worked in past sessions and the blocker deserves a concrete status/fix recommendation.
- Desktop persistent panel semantics: pinned non-modal panel; tree interactive behind it; close button/Escape close; outside click does not dismiss; mobile remains modal.
- Keep `docs/knowledge/wiki/log.md` untouched for routine work because the file marks itself superseded; SESSION file + wiki index are the operating record.

### Dev environment / Postgres alignment

- Runbooks read: `dev-environment/dev-environment.md`, `dev-environment/local-dev-auth-storage.md`, `database/database.md`, `database/prisma-workflow.md`, `database/schema-migration.md`, `runbooks/README.md`, `sops/sop-data-and-wiring-flows.md`, `sops/sop-e2e-user-lifecycle.md`, `sops/sop-test-writing.md`, `domain-features/lineage-hub.md`, `domain-features/lineage-listing-runbook.md`.
- Local Postgres.app probes passed: `pg_isready` accepts connections on `localhost:5432`; TCP psql connection to `postgresql://brianscott@localhost:5432/ronindojo_dev` succeeds; HBA rules are `trust`; `brianscott` and `postgres` are login superusers; 12 parallel TCP psql connections succeeded.
- Prisma adapter probes passed from `apps/web` with dotenv loaded: counts returned `{ users: 106, trees: 7, members: 35, groups: 2 }`; 12 parallel `db.user.count()` calls succeeded; BBL `rigan-machado-bjj-lineage` exists and has the Dirty Dozen group with 7 members.
- Drift corrected in docs: DB-backed browser verification should use `npx next dev --webpack` until the SESSION_0316 Turbopack + Prisma blocker is fixed; local DB expects `citext` only because `schema.prisma` declares only `extensions = [citext]`.

## Petey plan

### Goal

Align the dev/Postgres/wiki runbooks, verify the seeded BJJ lineage page, then land the shared `Drawer` non-modal opt-in and live tree-layout repair with desktop/mobile screenshots and full close evidence.

### Tasks

#### SESSION_0317_TASK_01 — Runbook/Postgres alignment + BJJ lineage re-capture

- **Agent:** Cody, with Doug verification after capture
- **What:** Align dev/database/wiki docs, confirm local Postgres state, then start the DB-backed app with webpack, open `/disciplines/bjj`, and prove SESSION_0316 seed data renders.
- **Steps:**
  1. Read `dev-environment`, `database`, `sops`, and lineage domain runbooks before code.
  2. Probe local Postgres.app and Prisma adapter health; do not reset/reseed unless `/disciplines/bjj` proves missing data or DB becomes unreachable.
  3. Patch docs/wiki alignment where runbooks conflict with current SESSION_0316 evidence.
  4. Start `next dev --webpack` from `apps/web`; do not chase Turbopack unless webpack cannot complete the capture or the user explicitly escalates it.
  5. Capture desktop and mobile screenshots for board, tree, and profile panel states.
  6. Record whether belt colors, Dirty Dozen cohort group, Mode B rail, and populated Rank History appear.
- **Done means:** Runbooks/wiki are aligned, Postgres/Prisma probes are recorded, and screenshot artifacts prove the Rigan seed is visible on the live page, or a concrete blocker is documented with command/browser evidence.
- **Depends on:** nothing

#### SESSION_0317_TASK_02 — Add non-modal `Drawer` opt-in for persistent lineage panel

- **Agent:** Cody, supported by an explorer subagent for consumer audit
- **What:** Extend the shared `Drawer` primitive with an opt-in non-modal mode and use it only for the desktop lineage panel.
- **Steps:**
  1. Run Cody component pre-flight: read `Drawer`, `Dialog`, `LineageProfileDrawer`, relevant consumers, and Base UI Dialog API.
  2. Audit current `Drawer` consumers and preserve modal behavior by default.
  3. Add a `modal`-style opt-in and backdrop suppression path without changing unrelated consumers.
  4. Wire `LineageProfileDrawer` so mobile remains modal/bottom-sheet and desktop can stay persistent/non-modal with the tree interactive behind it.
- **Done means:** Desktop lineage panel does not trap/block tree interaction, mobile drawer remains modal, and all audited consumers retain previous behavior.
- **Depends on:** SESSION_0317_TASK_01

#### SESSION_0317_TASK_03 — Repair tree layout + verify, document, close

- **Agent:** Cody for implementation; Desi/Doug for visual/QA review
- **What:** Use live browser measurements to fix the root-chain offset/clipping and mobile empty-tree behavior if reproduced, then close the session fully.
- **Steps:**
  1. Inspect current tree layout source and existing layout tests before editing.
  2. Measure the rendered desktop tree in-browser; adjust scale/origin/width logic based on observed geometry, not blind CSS edits.
  3. Verify mobile tree mode is usable or explicitly document any remaining mobile-specific blocker.
  4. Run focused tests plus `bun run typecheck`, `bun run lint` or changed-file lint where repo lint remains blocked, and `bun run wiki:lint`.
  5. Update component inventory/session docs, run closing ritual full-close including optional ADR/component checks, run `graphify update .`, commit, and push to `main`.
- **Done means:** Re-captured screenshots show the tree is no longer root-chain clipped/offset on desktop, mobile behavior is handled or explicitly carried, verification is recorded, and one final commit is pushed to `main`.
- **Depends on:** SESSION_0317_TASK_02

### Parallelism

TASK_01 is the critical path and stays local. A read-only explorer audited docs/wiki alignment while local Postgres probes ran. After TASK_01 browser capture starts, an explorer can audit `Drawer` consumers and primitive API shape. Tree-layout analysis can be a second explorer if it stays read-only. Code edits are sequential because `LineageProfileDrawer` and `LineageTreeCanvas` share the same rendered workflow and screenshots.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0317_TASK_01 | Cody + explorer | Env/docs alignment + browser capture are blockers for every later visual claim; explorer handled read-only wiki/runbook cross-check. |
| SESSION_0317_TASK_02 | Cody + explorer | Shared primitive change needs exact consumer audit, but implementation should stay single-threaded. |
| SESSION_0317_TASK_03 | Cody + Desi/Doug | Layout repair needs live browser iteration, then UX/QA review and close. |

### Open decisions

- Whether to treat the Turbopack + Prisma blocker as a fix-now item if webpack works. Default: do not fix in this session unless it blocks capture or Brian explicitly promotes it.
- Whether mobile tree repair is mandatory in SESSION_0317 if the desktop root-chain fix lands but mobile requires a different layout treatment. Default: reproduce and fix if local, carry only if it needs a separate design decision.
- Desktop persistent panel behavior: default assumption is node selection opens/pins the panel, tree remains interactive behind it, close button/Escape close the panel, and outside clicks do not dismiss on desktop.
- Wiki log contradiction: repo-level prompt says append `docs/knowledge/wiki/log.md`, but that file marks itself superseded and says routine work should use SESSION files + wiki index. Default: keep `wiki/log.md` untouched unless Brian explicitly wants a compatibility entry.

### Risks

- Local Postgres/auth instability from SESSION_0316 may recur before visual capture.
- `Drawer` is shared app-wide; the modal default and consumer audit are the safety gate.
- The tree issue may be data-shape plus CSS geometry; browser measurement is required before changing layout math.
- Full repo lint may still hit the pre-existing `packages/api-client` Biome toolchain gap.
- `docs/knowledge/wiki/log.md` has conflicting instructions across historical/project prompt layers; this session records the contradiction rather than silently reviving a superseded log.

### Scope guard

- No Prisma schema changes.
- No PromotionEvent implementation; the SESSION_0316 model doc remains staged for a later epic.
- No discipline page ordering/discovery rewrite.
- No one-off panel system outside the shared `Drawer`.
- No unrelated Dirstarter primitive migration or broad styling cleanup.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Theming, Dirstarter Prisma, Base UI Dialog docs checked on 2026-06-01; exact component source still required in Cody pre-flight.
- **Baseline pattern to extend:** Existing `components/common/drawer.tsx` built on Base UI Dialog; existing Ronin `LineageProfileDrawer` / `LineageTreeCanvas` lineage components.
- **Custom delta:** Ronin adds a desktop non-modal persistent inspector and tree-layout correction for lineage visualization.
- **No-bypass proof:** Extend the shared primitive with a default-preserving opt-in instead of adding a bespoke panel or bypassing Dirstarter-derived UI patterns.

## Cody pre-flight

Completed before code edits.

### Source and docs read

- Graphify was used for discovery; exact file reads were used for implementation context.
- Component sources opened: `components/common/drawer.tsx`, `components/common/dialog.tsx`, `components/web/lineage/lineage-profile-drawer.tsx`, `components/web/lineage/lineage-tree-board.tsx`, `components/web/lineage/lineage-tree-canvas.tsx`, `lib/lineage/tree-layout.ts`, and `lib/lineage/tree-layout.test.ts`.
- L1 primitive spot-checks opened: `Avatar`, `Badge`, `Button`, `Tabs`, `Stack`, `DropdownMenu`, and `Tooltip`.
- Dirstarter references checked: `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/dirstarter-docs-inventory.md`, Dirstarter Theming, Dirstarter Prisma, and Base UI Dialog docs.
- Lane docs/runbooks opened: lineage hub/listing runbooks, dev-environment runbooks, database runbooks, SOPs for data/wiring, E2E lifecycle, and test writing.

### Existing patterns

- `components/common/drawer.tsx` is the shared Base UI Dialog-backed drawer primitive. It currently renders a backdrop by default and places content inside a fixed full-screen z-layer.
- `components/common/dialog.tsx` is the sibling Base UI Dialog pattern and stays unchanged.
- `LineageProfileDrawer` is the current direct lineage drawer consumer. `LineageTreeBoard` owns selection/open state and `LineageTreeCanvas` owns tree scaling/scroll geometry.
- `DropdownMenu` already passes `modal={false}` through to a Base UI primitive in lineage actions, so the non-modal behavior is an existing composition pattern in the app.

### Primitive API spot-check

- `Avatar`: Root props plus `AvatarImage` and `AvatarFallback`; no variant contract.
- `Badge`: `variant`, `size`, `prefix`, `suffix`, and `render`.
- `Button`: `variant`, `size`, `prefix`, `suffix`, `isPending`, and `render`.
- `Tabs`: `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent`.
- `Stack`: `size`, `direction`, `wrap`, and `render`.
- `DropdownMenu`: Base UI Menu props pass through; `modal={false}` is already used in lineage action menus.
- `Tooltip`: `TooltipContent` supports `side`, `align`, `sideOffset`, and `size`.

### Implementation decision

- Extend the existing shared `Drawer` with a default-preserving backdrop/interactivity opt-in, then wire only the lineage desktop profile drawer to the non-modal path.
- Keep mobile modal behavior and existing shared drawer consumers unchanged.
- Repair tree geometry from live browser measurements after the seeded page is captured.

### Failed-steps mitigations

- FS-0001 / FS-0008: primitive API and L1 component inventory checked before edits.
- FS-0020: Graphify used for discovery instead of grep-style file finding.
- FS-0024: all commands are run from `/Users/brianscott/dev/ronin-dojo-app` or explicit subdirectories inside it.
- FS-0025: graphify update is reserved for final close after git hygiene to avoid a second commit.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0317_TASK_01 | done | Runbook/Postgres/wiki alignment landed; BBL and Baseline BJJ lineage both verified at 15 members with Rigan R9 and Dirty Dozen group present. |
| SESSION_0317_TASK_02 | done | Added default-preserving non-modal `Drawer` opt-in and wired desktop lineage profile panel to suppress overlay/backdrop while mobile remains modal. |
| SESSION_0317_TASK_03 | done | Repaired desktop/mobile tree auto-fit/pan, removed visible internal rank short-code badges, verified with browser screenshots, tests, typecheck, and close docs. |

## What landed

- Local Postgres.app and Prisma adapter health were proved again, including direct DB checks for both `BASELINE_MARTIAL_ARTS` and `BBL` Rigan BJJ lineage trees.
- The April 10, 2026 ceremony correction was bridged through existing `RankAward` facts, matching the staged `PromotionEvent` model boundary:
  - Rigan Machado now has R9 Red Belt awarded by Rorion Gracie on `2026-04-10`.
  - Erik Paulson, Casey Olsen, Rick Minter, and Rick Williams now have CB7 awards by Rigan Machado on `2026-04-10`.
  - John Will was updated to CB7 on `2025-09-14`; David Meyer was updated to CB7 on `2026-01-17`.
  - Bob Bass was intentionally left unchanged because public sources conflict and the operator's canonical April 10 list did not include him as a changed award.
- The BJJ lineage seed now writes the Rigan tree to both Baseline and BBL brands, refreshes existing node bios/slugs/tree-member placement on rerun, and keeps selected display ranks in sync.
- `Drawer` now supports an opt-in overlay-suppressed path for non-modal desktop panels while preserving the default modal/overlay behavior for existing consumers.
- `LineageProfileDrawer` now uses the non-modal desktop drawer path, disables outside-click dismissal on desktop, keeps mobile modal behavior, and formats rank-award dates in UTC so `2026-04-10` displays as Apr 10 in local time zones.
- Visible rank labels now show belt names instead of internal short codes in the profile drawer, Rank History tab, honor strip, and compact child list.
- Tree mode now auto-fits only in tree layout, uses top-left transform origin, and auto-pans deterministically to the root chain using untransformed layout offsets plus the target scale.
- `app/layout.tsx` now avoids whitespace inside `<head>`, removing a Next dev hydration overlay that was polluting browser screenshots.
- Runbooks/wiki were aligned: Postgres.app `psql` path recorded, `citext` is the only local schema extension expected, and Turbopack is now documented as functional for `/disciplines/bjj` with webpack retained as a fallback.

## Decisions resolved

- Use the existing `RankAward` model for the April 10, 2026 data correction in this session; do not implement `PromotionEvent` until its dedicated ADR/migration session.
- Keep `docs/architecture/lineage/promotion-event-model.md` as the canonical staged model: `PromotionEvent` groups awards, while `RankAward` remains the per-person source of truth.
- Do not model the April 10 cohort as a second `LineageVisualGroup` yet. Current `LineageTreeMember.visualGroupId` supports one group per member, and Dirty Dozen is already occupying that display slot for several practitioners.
- Keep Bob Bass as an unresolved data-quality item instead of silently merging conflicting public claims.
- Turbopack is no longer treated as blocked for `/disciplines/bjj` after SESSION_0317 proof, but webpack remains the fallback if another Prisma-backed route regresses.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/layout.tsx` | Removed whitespace child nodes inside `<head>` by rendering the brand style as an explicit value. |
| `apps/web/components/common/drawer.tsx` | Added default-preserving `showOverlay` / overlay class controls for non-modal drawer usage. |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | Wired desktop non-modal drawer behavior, UTC promotion-date formatting, and belt-name rank display. |
| `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` | Removed visible internal rank short codes and switched date formatting to UTC. |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Repaired tree-mode auto-fit/auto-pan and root-chain visibility for desktop/mobile. |
| `apps/web/components/web/lineage/lineage-honor-strip.tsx` | Removed internal rank short-code display from compact rail labels. |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | Removed internal rank short-code display from board child rows. |
| `apps/web/prisma/seed-baseline-lineage.ts` | Added April 10, 2026 promotion facts, new ceremony participants, BBL tree seeding, and idempotent refresh of existing tree members/nodes. |
| `docs/sprints/SESSION_0317.md` | Created session ledger and draft Petey plan. |
| `docs/runbooks/dev-environment/dev-environment.md` | Aligned dev-server guidance with webpack fallback for DB-backed page verification. |
| `docs/runbooks/database/database.md` | Removed stale `pg_trgm` expectation; aligned reset guidance to current schema extension truth. |
| `docs/runbooks/database/schema-migration.md` | Restored Turbopack as the default smoke command after SESSION_0317 proof; kept webpack fallback. |
| `docs/runbooks/README.md` | Noted webpack fallback only for Turbopack regressions. |
| `docs/knowledge/wiki/topic-index.md` | Added Lineage, PromotionEvent, and Dev Environment / Postgres lookup status. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0315, SESSION_0316, SESSION_0317, and Promotion Event Model entries. |

## Verification

| Command / smoke | Result |
| --- | --- |
| Opening ritual | Completed; SESSION_0316 read, Graphify queries used for discovery, Petey plan written. |
| `pg_isready -h localhost -p 5432 -d ronindojo_dev` | accepting connections |
| psql TCP connection + 12 parallel psql connections | passed |
| Prisma adapter counts + 12 parallel Prisma reads | passed |
| BBL/Baseline Rigan tree DB probe | both brands have `rigan-machado-bjj-lineage` with 15 members |
| Promotion-award DB probe | Rigan R9 by Rorion on `2026-04-10`; Erik/Casey/Rick Minter/Rick Williams CB7 by Rigan on `2026-04-10`; John Will `2025-09-14`; David Meyer `2026-01-17` |
| Dirty Dozen DB probe | Baseline and BBL both have `The Dirty Dozen — Rigan's First Black Belts (1992–96)` with 7 members |
| Browser `/disciplines/bjj` board smoke | 15 members, Rigan Red Belt - 9th Degree, no visible `CB7`/`CB8`/`R9`, no Next overlay |
| Browser Rigan profile | `Red Belt - 9th Degree`, `Rorion Gracie`, `Apr 10, 2026`, desktop drawer overlay count `0`, no internal rank short codes |
| Browser Rank History | R9 and prior CB8 visible by belt name; no internal rank short codes |
| Browser tree desktop | root card horizontally visible; scale `0.5`, scrollLeft `264`, no Next overlay |
| Browser tree mobile | root card horizontally visible; scale `0.5`, scrollLeft `431`, no Next overlay |
| Screenshots | `/tmp/ronin-session-0317/bjj-after-board-desktop.png`, `bjj-after-board-mobile.png`, `bjj-after-rigan-red-profile-desktop.png`, `bjj-after-rigan-rank-history-desktop.png`, `bjj-after-tree-desktop.png`, `bjj-after-tree-mobile.png` |
| `bunx biome check --write app/layout.tsx components/common/drawer.tsx components/web/lineage/lineage-profile-drawer.tsx components/web/lineage/lineage-tree-canvas.tsx components/web/lineage/lineage-honor-strip.tsx components/web/lineage/lineage-compact-child-list.tsx components/web/lineage/lineage-rank-history-tab.tsx prisma/seed-baseline-lineage.ts` | passed |
| `bun test lib/lineage/tree-layout.test.ts` | passed, 3 tests |
| `bun run typecheck` | passed |
| `bun run wiki:lint` | 0 errors, 3 pre-existing stale-frontmatter warnings |
| `bun run lint` from repo root | failed in `packages/api-client` because `biome` is not on that package PATH; changed-file Biome passed |
| `npx next dev --turbo` + browser `/disciplines/bjj` | `200 OK`, Rigan rendered, no Prisma/error overlay; first compile was slow |

## Open decisions / blockers

- `PromotionEvent` is still a staged schema/ADR decision, not implemented. Next work should amend ADR 0016, migrate `PromotionEvent`, link `RankAward.promotionEventId`, and decide how `LineageVisualGroup` derives from events.
- Bob Bass rank/date remains a data-quality conflict. Public search returned inconsistent claims; do not update without a canonical source/operator confirmation.
- Root `bun run lint` is still blocked by `packages/api-client` missing `biome` in its package script PATH.

## Next session

- **Goal:** SESSION_0318 — PromotionEvent ADR/migration + April 10 ceremony event/gallery model, including event-linked rank history and cohort display rules.
- **Inputs to read:** `docs/architecture/lineage/promotion-event-model.md`, `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`, `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`, `docs/runbooks/domain-features/lineage-hub.md`, `apps/web/prisma/schema.prisma`, `apps/web/prisma/seed-baseline-lineage.ts`.
- **First task:** Grill the `PromotionEvent` open questions from the model doc, then write the ADR 0016 amendment before editing Prisma schema.
- **Candidates:**
  1. PromotionEvent schema/ADR — highest domain leverage for BBL/Baseline/RDD/white-label sites.
  2. Data-quality import pass for Bob Bass, Nobuo Yagai, Charlee Minkin, Ben Lowry, and original BBL omissions — useful after the event model is in place.

## Review log

### SESSION_0317 - Lineage non-modal panel + tree repair

#### Review

**SESSION_0317_REVIEW_01 - Close readiness**

- **Reviewed tasks:** SESSION_0317_TASK_01, SESSION_0317_TASK_02, SESSION_0317_TASK_03
- **Dirstarter docs check:** live docs checked
- **Sources:** Dirstarter Theming, Dirstarter Prisma, Base UI Dialog, local Dirstarter inventories
- **Verdict:** Merge-ready for the scoped bridge. The UI primitive change is default-preserving, DB facts are verified for both brands, browser proof covers profile/rank-history/tree desktop/mobile, and the domain boundary is correctly held at `RankAward` until `PromotionEvent` gets its own ADR/migration.

## Hostile close review

### SESSION_0317 - Lineage non-modal panel + tree repair

#### Findings

**SESSION_0317_FINDING_01 - PromotionEvent still staged**

- **Severity:** medium
- **Task:** SESSION_0317_TASK_01
- **Evidence:** `docs/architecture/lineage/promotion-event-model.md`
- **Impact:** April 10, 2026 is represented as linked `RankAward` facts sharing date/location/notes, not a first-class ceremony with shared media/gallery.
- **Required follow-up:** SESSION_0318 should amend ADR 0016 and add `PromotionEvent` + `RankAward.promotionEventId`.
- **Status:** open

**SESSION_0317_FINDING_02 - Bob Bass public source conflict**

- **Severity:** medium
- **Task:** SESSION_0317_TASK_01
- **Evidence:** public source snippets/search results conflicted on Bob Bass coral/red-belt timing; seed left existing approximate award unchanged.
- **Impact:** Profile could remain historically incomplete until a canonical source or operator confirmation resolves it.
- **Required follow-up:** Add Bob Bass to the data-quality import pass with source citations and contradiction notes.
- **Status:** open

**SESSION_0317_FINDING_03 - Root lint package-tooling blocker**

- **Severity:** low
- **Task:** SESSION_0317_TASK_03
- **Evidence:** `bun run lint` fails in `packages/api-client` with `biome: command not found`.
- **Impact:** Full repo lint cannot be used as the merge gate; changed-file Biome and typecheck passed.
- **Required follow-up:** Fix the package lint script or dependency resolution for `packages/api-client`.
- **Status:** accepted-risk

#### Kaizen answers

- **Safe/security:** No new auth, payment, storage, or production-data write paths were added. Seed changes are local-dev idempotent data corrections; UI changes were verified through desktop/mobile browser proof. Remaining safety proof belongs to the future event editor/media upload permissions, not this read-only public display bridge.
- **Preventable failed steps:** Two process slips were preventable: the first browser script used the wrong Playwright import, and tree mobile auto-pan relied on animated transform timing before the deterministic offset fix. Smaller split scripts and measuring untransformed geometry first would have avoided both.
- **Confidence:** 100 users: 9/10. 1,000 users: 8/10 because tree layout is still client-heavy and event grouping is not first-class. 10,000 users: 7/10 until `PromotionEvent` data grouping, media ownership, and query/cache strategy are formalized. Aggregate: 7; stage SESSION_0318 as remediation/architecture before expanding the lineage feature surface.

## ADR / ubiquitous-language check

- ADR update not made this session. `PromotionEvent` is already documented as draft/staged and needs a dedicated ADR 0016 amendment before schema work.
- Ubiquitous language not updated because no new runtime domain term was introduced; `RankAward`, `LineageTree`, `LineageTreeMember`, and `LineageVisualGroup` kept their existing meanings.

## Reflections

- The key domain lesson is that "promotion" and "promotion event" must stay separate. `RankAward` can safely carry the April 10 truth now, but the shared ceremony/media concept should not be faked through `LineageVisualGroup`.
- UI proof needed DB proof and browser proof. Next-tag caching can make a correct seed look stale, so the session used direct DB probes before browser recapture.
- The tree pan bug was not a data problem; it was measuring a scaled element during a CSS transition. Using untransformed layout offsets plus the intended scale is the sturdier pattern.
- The app layout `<head>` whitespace issue was outside the lineage feature, but it directly affected QA because the Next dev overlay became a second dialog. Small platform hygiene can be necessary to get honest UI proof.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs have current `updated: 2026-06-01` and `last_agent: codex-session-0317`; code/wiki annotation health unchanged. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` includes SESSION_0317 and Promotion Event Model; `topic-index.md` links the staged PromotionEvent model; SESSION_0317 `pairs_with` includes the model doc. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 3 pre-existing stale-frontmatter warnings. |
| Kaizen reflection | Present in `## Reflections` and hostile close review Kaizen answers. |
| Hostile close review | `SESSION_0317_REVIEW_01` plus three findings recorded above. |
| Review & Recommend | Next session goal/inputs/first task written for PromotionEvent ADR/migration. |
| Memory sweep | Project-scoped memory is already captured in `promotion-event-model.md`, runbooks, and this SESSION; no external operator memory update needed. |
| Next session unblock check | Unblocked if Brian confirms SESSION_0318 should start with the PromotionEvent ADR. Bob Bass remains a data-source follow-up, not a blocker. |
| Git hygiene | Branch `main`; `git worktree list` shows only `/Users/brianscott/dev/ronin-dojo-app`; task-log gate returned `3`; commit hash reported at bow-out — see git log. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before commit; Nodes: 188, Edges: 1003, Communities: 1389. |
