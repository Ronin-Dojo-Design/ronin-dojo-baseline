---
title: "SESSION 0385 — Lineage View A: privacy + edge-case + mobile (slice 0379-5)"
slug: session-0385
type: session--open
status: closed
created: 2026-06-13
updated: 2026-06-14
last_agent: claude-sonnet-4-6-session-0385
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0384.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0385 — Lineage View A: privacy + edge-case + mobile (slice 0379-5)

## Date

2026-06-13

## Operator

Brian + claude-session-0385

## Goal

Build petey-plan-0379 slice **0379-5**: privacy + edge-case hardening + mobile verification for View A.
Also: add a seed slink (rorion-gracie → rigan-machado) to the BJJ tree so the secondary overlay can
be visually smoked in the browser.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0384.md`
- Carryover: SESSION_0384 landed slice 0379-4 — secondary overlay (`view-secondary-links.ts`),
  payload `relationshipsTo`, island wiring + legend/toggle, browser-verified. Key open: seed has
  no slinks, so visual overlay smoke was deferred to 0379-5.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (20a3128)
- Current HEAD at bow-in: `20a3128`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — seed data change + pure Ronin-native lineage. |
| Extension or replacement | Extension: additive seed data + test assertions. |
| Why justified | Lineage secondary overlay has no Dirstarter primitive; seed is repo-internal. |
| Risk if bypassed | None — no auth/schema/payments involved. |

### Graphify check

- Graph status: current (rebuilt end of SESSION_0384).
- Queries used: `lineage view A privacy edge case mobile visibility toggle`
- Files identified: `queries.visibility.test.ts`, `seed-baseline-lineage.ts`, `to-lineage-visual.ts`,
  `lineage-view-a-island.tsx`, `petey-plan-0379.md §0379-5`, `lineage-mobile-list-port-spec.md`
- Verification: files opened directly after query.

### Grill outcome

Plan locked in petey-plan-0379 §0379-5. No open forks. Key facts:

- `rorion-gracie` exists as a PLACEHOLDER_USER + NODE_SEED but is NOT in the BJJ tree.
- Adding `rorion-gracie → rigan-machado` EDGE_SEED + tree membership creates the slink.
- `LineageRelationship` has no `visibility` field; payload filter is `fromNode: { visibility: "PUBLIC" }`.
- `to-lineage-visual.ts` builds secondary links for: both endpoints in tree + from-member != primary parent.
- `queries.visibility.test.ts` tests already exist and cover materializer drop, rank redaction, privacy scopes.
- Mobile: View A uses D3/CSS transforms; canvas is full-viewport; touch pan/zoom may need polish.

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Slice 0379-5: seed slink smoke, privacy guards green, mobile polish, browser verification.

### Tasks

#### SESSION_0385_TASK_01 — Desi design review: View A visual polish pass

- **Agent:** Desi
- **What:** Review the current View A design (HTML belt cards, focal ring, legend/toggle overlay,
  secondary link dashed paths) against the BBL/Baseline design tokens and reference card images.
  Confirm card proportions, belt color contrast, legend placement, and mobile touch affordances
  are on-brand. Return prioritized feedback (HIGH/MEDIUM/LOW) for Cody.
- **Done means:** Desi returns spec or confirms design is acceptable; Cody has locked feedback to act on.
- **Depends on:** nothing.

#### SESSION_0385_TASK_02 — Seed slink: rorion-gracie in BJJ tree

- **Agent:** Cody
- **What:**
  1. Add `rorion-gracie → rigan-machado` to `EDGE_SEEDS` in `seed-baseline-lineage.ts`.
  2. Add `"rorion-gracie"` to the BJJ tree `memberKeys`.
  3. Add `"rorion-gracie": "carlos-gracie-sr"` to `parentMap`.
  4. Add `"rorion-gracie": { disciplineCode: "bjj", rankShortName: "R9" }` to `selectedRankAwards`.
  5. Run `bun run apps/web/prisma/seed-baseline-lineage.ts` to apply.
- **Done means:** seed runs clean; secondary overlay renders visually with rorion's slink.
- **Depends on:** SESSION_0385_TASK_01.

#### SESSION_0385_TASK_03 — Privacy + edge-case: run & harden visibility tests

- **Agent:** Cody
- **What:**
  1. Run `cd apps/web && bun test server/web/lineage/queries.visibility.test.ts` — all green.
  2. Audit against 0379-5 checklist (materializer drop, parent pointer nulling, group drop,
     phantom card check, privacy scope).
  3. Add any missing tests; run `bun test lib/lineage/to-lineage-visual.test.ts` still green.
- **Done means:** all tests green; checklist covered.
- **Depends on:** SESSION_0385_TASK_01.

#### SESSION_0385_TASK_04 — Mobile polish: View A touch + viewport

- **Agent:** Cody
- **What:**
  1. Verify D3 zoom touch support (no unintentional pointer-events suppression in View A).
  2. Legend overlay: doesn't overlap cards on narrow viewports (< 390px).
  3. Focal node visible on initial render without horizontal scroll on mobile.
- **Done means:** TypeScript clean; no regressions.
- **Depends on:** SESSION_0385_TASK_03.

#### SESSION_0385_TASK_05 — Browser verify (Doug)

- **Agent:** Doug
- **What:**
  1. Desktop: secondary slink rorion→rigan visible; legend+toggle work; 0 console errors.
  2. Mobile emulation (390×844): tree renders; legend no overlap; touch pan works.
  3. Privacy: unauthenticated view shows only PUBLIC nodes.
- **Done means:** all behaviors browser-proven.
- **Depends on:** SESSION_0385_TASK_04.

### Parallelism

Sequential: TASK_01 → (TASK_02 ‖ TASK_03) → TASK_04 → TASK_05.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0385_TASK_01 | Desi | Design review before code lock. |
| SESSION_0385_TASK_02 | Cody | Seed data change. |
| SESSION_0385_TASK_03 | Cody | Test run + gap-fill. |
| SESSION_0385_TASK_04 | Cody | Mobile polish. |
| SESSION_0385_TASK_05 | Doug | Browser verification. |

### Open decisions

- None at plan-lock.

### Risks

- Rorion in tree at `carlos-gracie-sr` level: cosmetic disconnect possible. Acceptable for smoke-test.
- Seed is LOCAL DEV ONLY.

### Scope guard

- No schema changes. No new server endpoints. Never edit `lineage-tree-canvas.tsx`.
- Seed change is additive and idempotent.
- Mobile polish = CSS/prop tweaks only.

## Cody pre-flight

### Pre-flight: TASK_02 — Seed slink

#### 1. Existing component scan

- `seed-baseline-lineage.ts`: `rorion-gracie` exists as PLACEHOLDER_USER + NODE_SEED.
- Not in BJJ tree `memberKeys`. No existing `rorion-gracie → rigan-machado` EDGE_SEED.
- `payloads.ts` filters `relationshipsTo` by `fromNode: { visibility: "PUBLIC" }`.

#### 2–6 (standard pre-flight — no L1 Dirstarter; seed pattern is findFirst+create idempotent)

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0385_TASK_01 | landed | Desi review: HIGH — focal ring overridden by `.card-main` CSS outline (neutralized); Roboto font (→ inherit); `↗` tap target ~12px (→ 28px container); legend toggle `padding:0` (→ 4px 8px). MEDIUM — slink label 9px (→ 11px), canvas height fixed 640 (→ min(640px,75vh)), "Pending" label (→ "Claim pending"), raw `←` arrow (→ ArrowLeftIcon), --background-color variable override. LOW items deferred to 0379-6. |
| SESSION_0385_TASK_02 | landed | Seed: added `rorion-gracie → rigan-machado` EDGE_SEED + rorion to BJJ tree memberKeys + parentMap (carlos-gracie-sr). Added `tim-wolchek` to BJJ tree memberKeys (null parent, secondary BJJ instructor per operator). 1 relationship created, 4 tree members created. Tim Wolchek bio updated. |
| SESSION_0385_TASK_03 | landed | 9 visibility tests green + 13 to-lineage-visual tests green. Checklist: materializer drop ✓, parent nulling ✓, group drop ✓, privacy scope ✓. Phantom card: `single_parent_empty_card` defaults to `false` in `to-family-chart-data.ts` chart options — confirmed safe. |
| SESSION_0385_TASK_04 | landed | Applied all Desi HIGH+MEDIUM: family-chart.css outline neutralized + font-family inherit; island ↗ tap target; legend toggle padding; canvas height responsive; --background-color var; "Claim pending" label; ArrowLeftIcon in page.tsx. slink label 11px. TypeScript clean. |
| SESSION_0385_TASK_05 | in-progress | Doug browser verification running |

## What landed

- **Seed slink (rorion-gracie → rigan-machado)**: Added `rorion-gracie` to `rigan-machado-bjj-lineage` tree memberKeys + parentMap (child of carlos-gracie-sr) + isClaimable:true. New EDGE_SEED creates secondary `LineageRelationship`. Seed ran clean: 1 relationship created, 4 tree members added (×2 brands).
- **Tim Wolchek as secondary BJJ instructor**: Added `tim-wolchek` to BJJ tree memberKeys (null parent = disconnected root-level). Updated bio to note BJJ role. Existing `tim-wolchek → OWNER` EDGE_SEED is already in DB from karate-lineage seed — reused. His slink to OWNER will render when both are in-view (deferred to 0379-6 for out-of-view drawer).
- **Desi HIGH fixes**: (1) `family-chart.css` — `.card-main .card-inner` outline neutralized (`outline: none !important`) so inline `box-shadow` belt-colored focal ring wins. (2) `font-family: 'Roboto'` replaced with `font-family: inherit` — Geist now flows into the D3 canvas. (3) `↗` profile trigger wrapped in `min-width:28px; min-height:28px` container for mobile tap target. (4) Legend "Hide/Show" toggle: `padding: 4px 8px; min-height: 28` for touch target.
- **Desi MEDIUM fixes**: (5) Canvas height `640` → `"min(640px, 75vh)"` with `minHeight: 420` — responsive on mobile. (6) `--background-color` CSS variable overridden on the canvas div (`#f8fafc`) to prevent dark-card bleed from library defaults. (7) Trust badge "Pending" label → "Claim pending" (parity with `lineage-trust-badge.tsx`). (8) `← Board view` raw arrow → `ArrowLeftIcon` Lucide prefix on Button. (9) Secondary link label font-size `"9"` → `"11"` SVG units.
- **Privacy tests**: 9 visibility tests + 13 to-lineage-visual tests all green. No phantom-card risk (`single_parent_empty_card` defaults false in chart options).
- **TypeScript**: clean (0 errors).
- **Wiki lint**: 0 errors, 0 warnings after SESSION_0385.md blank-line fix.

## Decisions resolved

- **Tim Wolchek in BJJ tree**: Operator confirmed Tim Wolchek is a secondary BJJ instructor (also karate). Added to BJJ tree with null parent (disconnected). His slink renders in-view when both nodes are focal-visible; out-of-view case deferred to 0379-6.
- **rorion-gracie slink**: rorion placed as child of carlos-gracie-sr (sibling to carlos-gracie-jr). Secondary relationship `rorion → rigan` is historically accurate (Red Belt promotion, 2026). No BJJ RankAward seeded for rorion — slink renders with neutral gray colorHex. Colored slink is 0379-6 polish.
- **Browser visual verify**: Blocked this session by tool-state lock (all three browser MCPs timed out after Doug agent's session). Page returns HTTP 200. Operator should verify slink overlay visually.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/seed-baseline-lineage.ts` | New EDGE_SEED rorion→rigan; rorion+tim-wolchek added to BJJ tree memberKeys/parentMap/isClaimable; tim-wolchek bio updated |
| `apps/web/lib/lineage/family-chart/styles/family-chart.css` | `font-family: inherit`; `.card-main .card-inner { outline: none !important }` |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | "Claim pending" label; `↗` tap target container; canvas height responsive; `--background-color` var; legend toggle padding |
| `apps/web/lib/lineage/family-chart/renderers/view-secondary-links.ts` | slink label font-size 9→11 |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | `ArrowLeftIcon` import + prefix on Board view button |
| `docs/sprints/SESSION_0385.md` | This file |
| `docs/knowledge/wiki/index.md` | SESSION_0385 row added |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | ✅ 0 errors, 0 warnings |
| `npx tsc --noEmit` (apps/web) | ✅ 0 TypeScript errors |
| `bun test server/web/lineage/queries.visibility.test.ts` | ✅ 9 tests green |
| `bun test lib/lineage/to-lineage-visual.test.ts` | ✅ 13 tests green |
| `bun run prisma/seed-baseline-lineage.ts` | ✅ 1 relationship created, 4 tree members created, 0 errors |
| `curl http://bbl.local:3000/lineage/rigan-machado-bjj-lineage?view=explore` | ✅ HTTP 200 |
| Browser visual — secondary slink overlay | ⚠️ Not verified — browser MCPs timed out. Operator to verify manually at `?view=explore`. |

## Open decisions / blockers

- **Operator visual verify**: Open `bbl.local:3000/lineage/rigan-machado-bjj-lineage?view=explore`. Expect: rorion-gracie card visible alongside carlos-jr; dashed gray slink from rorion → rigan; legend overlay; toggle hides/shows; primary links unaffected; Geist font on cards; focal ring via box-shadow (no gray outline).
- **Tim Wolchek slink not yet visible**: His null parent means he won't appear in the focal view until a depth that includes disconnected roots. Out-of-view secondary listing (drawer) is 0379-6.
- **rorion-gracie no belt color**: No BJJ RankAward seeded → slink is neutral gray. Add R9 award to `BJJ_RANK_AWARD_SEEDS` + `selectedRankAwards` in 0379-6 polish if desired.

## Next session

### Goal

Build petey-plan-0379 slice **0379-6**: Polish wave — depth controls (`ancestry_depth`/`progeny_depth`), out-of-view secondary listing in drawer, focus-URL polish, and optional minimap/export from the fork. Also: seed rorion-gracie's R9 rank award for colored slink.

### Inputs to read

- `docs/petey-plan-0379.md` §0379-6
- `docs/sprints/SESSION_0385.md` `## Open decisions / blockers`

### First task

Bow in; verify the rorion→rigan secondary slink is visually working in the browser; then read §0379-6 and plan depth controls.

## Review log

### SESSION_0385_TASK_REVIEW_LOG

- **Desi (TASK_01):** 15 findings. HIGH: CSS outline override on focal ring (fixed — `outline: none !important`); Roboto font (fixed — `inherit`); `↗` tap target (fixed — 28px container); legend toggle `padding:0` (fixed — `4px 8px; min-height:28`). MEDIUM: slink label 9px (fixed — 11px); canvas fixed height (fixed — `min(640px,75vh)`); "Pending" label (fixed — "Claim pending"); raw arrow (fixed — ArrowLeftIcon); `--background-color` var (fixed). LOW: NetworkIcon on explore button, trust badge 9px→10px, legend toggle color, CatmullRom→quadratic, exit transition zero-vs-falsy, shared TRUST_BADGE_DATA — all deferred 0379-6.
- **Doug (TASK_05):** Browser verification blocked — all browser MCPs (Chrome DevTools, Playwright, Claude-in-Chrome) timed out. HTTP 200 confirmed via curl. Operator visual verify required.

## Hostile close review

- **Dirstarter alignment:** No Dirstarter baseline layer touched. Pure Ronin-native lineage seed + fork CSS + island props. No Dirstarter docs check required.
- **Security check:** Seed file is LOCAL DEV ONLY (documented in file header). No API route changes. `family-chart.css` changes are cosmetic (outline/font). No injection surface introduced.
- **Data integrity:** Seed change is additive + idempotent (`findFirst + create` pattern, FS-0006 compliant). `LineageRelationship` created for rorion→rigan; existing tim-wolchek→OWNER row found (idempotent). No schema migration.
- **Verification honesty:** Browser visual verify was blocked by MCP timeout — documented explicitly. HTTP 200 + TypeScript + 22 tests is the extent of automated verification this session.
- **Privacy:** No privacy regression — materializer drop tests still green; `single_parent_empty_card` defaults false; `relationshipsTo` filter `fromNode.visibility: PUBLIC` unchanged.
- **Score:** PASS with browser visual pending (operator task).

## ADR / ubiquitous-language check

- **ADR 0026** (`lineage-view-a-engine-donatso-fork.md`): No update needed — seed + CSS/UX fixes are within the locked slice plan.
- **No new ADR created**: Tim Wolchek addition and rorion slink are implementation details, not architectural decisions.
- **Ubiquitous language**: No new domain terms introduced. "Secondary promoter" / "slink" remain informal. No glossary update needed.

## Reflections

- Desi's review caught the `family-chart.css` outline override — the focal ring had been silently broken since 0379-1 (library CSS `outline: 4px solid gray` always won over inline `box-shadow`). Critical find; high ROI from the design review pass.
- All three browser MCP tools (Chrome DevTools, Playwright, Claude-in-Chrome) simultaneously timed out — likely the Doug sub-agent left a session-level lock. Pattern to watch: launch a sub-agent for browser work, then if it fails, the parent session's browser MCPs are also blocked. Workaround: verify inline (don't spawn Doug for browser work when the parent session may also need browser access).
- Tim Wolchek's "disconnected root" placement is correct for a secondary BJJ instructor with no verifiable BJJ lineage chain — the slink semantics are right even if the card position is cosmetically orphaned.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0385.md: `status: closed`, `type: session--open`, `last_agent: claude-sonnet-4-6-session-0385`. No other wiki/arch docs changed. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0385 row added. No new wiki pages created. `pairs_with` on SESSION_0385 already references all cross-docs. |
| Wiki lint | `bun run wiki:lint` → ✅ 0 errors, 0 warnings (after blank-line fix in SESSION_0385.md) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | TASK_REVIEW_LOG entry present above; PASS with browser visual pending |
| Review & Recommend | Next session goal written: 0379-6 polish wave |
| Memory sweep | `lineage-tree-pivot-donatso.md` to be updated: 0379-5 complete, next = 0379-6 |
| Next session unblock check | Unblocked — operator browser verify is the only open item; first task defined |
| Git hygiene | Branch `main`; single push at close — hash reported at bow-out / see git log |
| Graphify update | Run before commit — count recorded below |
