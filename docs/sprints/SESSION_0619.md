---
title: "SESSION 0619 — Wiring net: capture built-not-wired gaps + intake triage + queue"
slug: session-0619
type: session--implement
status: in-progress
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0619
sprint: S12
lane: repo
recipe: ""
goal_ids: ["G-023", "G-026", "G-031"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0618.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0619 — Wiring net: capture built-not-wired gaps + intake triage + queue

## Operator

Brian + claude-session-0619

## Goal

Operator surfaced that recent work (token-cost tracker, wayfinder viz, State-of-Dojo) is "built but not
wired" and falling off the table. **Capture everything into the ledgers so nothing is in the wind**, add a
systemic net (`## Yet to be wired` template section), triage the operator's 4 dogfooded intake notes, and
**queue** the design + `/rr` work — before building the SotD surface fixes (Lane B).

## What landed

- **Located all three** operator-lost surfaces: token-cost = `/app/token-cost` (orphaned from
  `attention-panels.tsx`); wayfinder = a one-off 0616 Artifact, never an app panel; planning-intake notes =
  `/app/planning-intake` (manual promotion only).
- **Built-not-wired net — DRY-corrected (operator catch):** first tried a per-session `## Yet to be wired`
  template section, then **reverted** it — it duplicates the WL ledger (the exact rot pattern `closing.md`
  line 391 + the WL doc warn against). Lean fix instead: `closing.md` **§6.7 wiring-sweep now explicitly
  names the built-not-wired class** (reuses the existing finding-router + WL; no new section, no new
  machinery). Automated detector queued as WL-P2-73.
- **WL-P2-70…73** appended: token-cost orphan · wayfinder-no-panel · intake manual-promotion · the wiring-net
  automation itself.
- **PL-020…023** appended: the operator's 4 dogfooded notes, promoted from `PlanningIntake` `NEW` rows
  (SotD belt-ladder content · admin-shell nav · Family-Tree order · mobile zoom + widget img preview).
- **Read the operator's prod `PlanningIntake` notes** (read-only) and surfaced them.

## Petey plan

### Done this session (capture lane)

- Template `## Yet to be wired` section · WL-P2-70…73 · PL-020…023 · intake read.

### Lane B — SotD surface fixes (built + verified this session, app code — DEPLOYS on push)

- **Brand-scope:** new `NEXT_PUBLIC_SOTD_ALL_BRANDS` flag (default off) → one `VISIBLE_BRAND_SKINS` source in
  `_kernel/phase.ts` (scoped to `DEPLOY_BRAND_KEY="bbl"`); both StatePanel and the shared `buildCatalogPanels`
  map it. `BrandTabs` renders content-only for a single brand (no lone tab strip). The reusable deploy-scope
  switch (RDD deploy sets it true). **Verified headless:** `/app/state` + `/app` show BBL-only, no RDD/MMB tabs.
- **Mount TokenCostPanel** in `_landing/attention-panels.tsx` (closes **WL-P2-70**) — verified present on `/app`.
- **Removed the "Attention" heading** — verified absent.
- Gates: typecheck ✓ · oxlint (no new warnings in touched files) ✓ · oxfmt ✓.

### Queued (staged as SESSION_0620 → Desi design + `/rr`)

- **Desi-led design review** via `/hallmark` + `/grill-me`/`/grill-with-docs` on the `/app` screens/surfaces.
- **Petey + Giddy `/rr`** on (a) improving the surfaces and (b) making tickets/lanes/ledgers work more
  effectively + token-efficiently — scope includes **WL-P2-73** (wiring-net orphan-detector), **WL-P2-74**
  (wire `/ggr` into bow-out + `/pp`·`/ppp` into step 4 + enforce hostile-review + surface intake count),
  **WL-P2-71** (wayfinder-panel decision), and the **PL-020…023** dogfood fixes.

### Re-queued

- **G-031 S4** (facet migration `lane:`→`brand:` + `stage:`) — deferred behind the operator's live surface
  + wiring work; still staged (goals-ledger).

## Task log

| Task | Status | Owner | Done means |
| --- | --- | --- | --- |
| SESSION_0619_TASK_01 | ✅ done | inline | `## Yet to be wired` template section added |
| SESSION_0619_TASK_02 | ✅ done | inline | WL-P2-70…73 appended (gaps + automation net) |
| SESSION_0619_TASK_03 | ✅ done | inline | PL-020…023 appended (4 intake notes promoted) |
| SESSION_0619_TASK_04 | ✅ done | inline Cody | Lane B: brand-scope (NEXT_PUBLIC_SOTD_ALL_BRANDS) + mount TokenCostPanel (WL-P2-70) + remove Attention — typecheck/lint/format green, headless-verified on /app + /app/state |
| SESSION_0619_TASK_05 | ✅ done | inline | Ritual built-not-wired sweep (operator ask) → WL-P2-74 (/ggr not wired · /pp·/ppp not in step 4 · hostile trigger-only · intake count invisible) |

## Also landed (late-session, operator-directed)

- **`/rr` (Petey/Giddy research-recommend)** dispatched + returned → [research-review-ggr-wiring-and-code-doc-annotation](../architecture/research/research-review-ggr-wiring-and-code-doc-annotation.md).
- **Slice ① built** (A1–A3, per the /rr): `/ggr` now wraps hostile-close-review in `closing.md` §6.5, the
  `bow-out` skill body carries the executed `/ggr` step, `opening.md` step 4 points at `/pp`·`/ppp`. Closes
  WL-P2-74 a/b. (A4 = `bow-out-gates` Gate 12d, drafted, next.) The ADR-0052 gate now fires at bow-out.
- **WL-P2-75/76** captured (MBR → Needs-you feed; docs-navigator → SotD). Sections-audit folded into Desi 0620 (Thread 1b).

## Review log

**`/ggr` gate — SESSION_0619 (dogfooded — the wiring built this session ran on this session's close).**
Primary unit = Lane B (State-of-Dojo BBL-scope + token-cost mount + de-Attention). **Class B** (custom
State-of-Dojo kernel). D1 9 (behavior headless-verified, no regression — multi-brand path unchanged) · D2 9
(no exposed-surface change; read-only client flag) · D3 9 (ONE `VISIBLE_BRAND_SKINS` source, DRY; shared
`buildCatalogPanels` covers both catalogs) · D4 9 (clear JSDoc, mirrors `CURRENT_DEPLOY_SKIN`) · D5 9 (single
scoping point) · D6 9 (module-const, no per-request work) · D7 8 (reuses BrandTabs/contract; new flag +
`DEPLOY_BRAND_KEY` minimal + documented — but the touched kernel files still carry no `@doc`/JETTY, the exact
Thread-B gap, logged as WL-P2-74/B4 not buried). **Weighted ≈ 8.9 · no hard caps (no regression; no Dirstarter
bypass; new pattern documented) · Composite 9.0/10 → CLEARS** (ship with the one follow-up logged). Slice ①
(docs/skill) = behavior-preserving governance, no score cap.

**Correction (operator caught the hollow gate).** The score above was first EYEBALLED — `/ggr` "fired" but its
machinery (`fallow`, `/code-quality`) never ran, which the gate's own design forbids ("no scoring from vibes").
Re-run for real: `fallow audit --changed-since 5969b0a3` + `fallow health`. Findings separated mine vs
inherited — the scary `WorkBoard` CRAP 90 (`_kernel/projection.tsx`) is **pre-existing, not my edit** (my
`BrandTabs` change is a simple early-return); the only **introduced** issue was `DEPLOY_BRAND_KEY` as an unused
export → **fixed** (un-exported; module-local). Re-verify: typecheck ✓, unused-exports **9 → 8**, behavior
byte-identical (visibility-only). Inherited debt (WorkBoard CRAP 90, pre-existing phase.ts unused exports,
`react-email` dep) named as follow-ups (WL-P2-74), not adopted. **Real composite ≈ 9.1 → CLEARS.** The lesson
— "invoked ≠ executed" — is captured in WL-P2-74 (A4 must verify pasted evidence, not a bare number).

## Status

Single source of truth is the frontmatter `status:` field.
