---
title: "SESSION 0263 — Lineage editor audit + monorepo BBL recon"
slug: session-0263
type: session--review
status: closed
created: 2026-05-26
updated: 2026-05-26
last_agent: claude-session-0263
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0262.md
  - docs/sprints/SESSION_0261.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0263 — Lineage editor audit + monorepo BBL recon

## Date

2026-05-26

## Operator

Brian + claude-session-0263 (Petey orchestration; Doug/Cody as parallel Explore subagents)

## Goal

Two parallel passes against the locked 15-session BBL launch roadmap (0262 → 0276):

1. **Audit pass.** Walk every story in [`docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`](../architecture/lineage/lineage-v1-acceptance-test-plan.md) against the current code surface. Mark each story Done / Partial / Stub / Missing. Produce a sized P0/P1/P2 gap backlog that becomes SESSION_0264's task list.
2. **Recon pass.** Catalogue reusable lineage artifacts from `ronin-dojo-monorepo` — sample data, brand assets, sprint history, and code patterns worth porting (NOT a code port — identification only).

Outputs:

- `docs/architecture/lineage/SESSION_0263_audit_report.md` (new)
- `docs/architecture/lineage/SESSION_0263_bbl_recon.md` (new)

This is **Phase-1 Session 2 of the BBL launch roadmap**. SESSION_0262 cleared CI (28/29 green). SESSION_0264 cannot start without 0263's gap backlog.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None this session — audit + recon only; no code edits. Lineage editor surface (`apps/web/app/admin/lineage/`, `apps/web/server/web/lineage/`) is Ronin-specific and extends Dirstarter's Prisma + base-ui primitives. |
| Extension or replacement | N/A — read-only session producing new architecture docs under `docs/architecture/lineage/`. |
| Why justified | The 15-session BBL roadmap (Q9=A) explicitly mandated "audit existing lineage editor first (one session) before building on top." Without a sized gap backlog, SESSION_0264's round-1 fixes would be speculative; with it, every fix is justified by an acceptance-plan story. The recon pass de-risks SESSION_0265's Rigan Machado seed by confirming what data + assets exist vs. need to be authored. |
| Risk if bypassed | SESSION_0264 builds on assumed gaps rather than measured ones — fixes drift into "what feels missing" rather than "what the acceptance plan says is missing." Recon-skip risk: hand-authoring data that already exists in `lineage-sample.json` or re-creating brand SVGs that are already in `public/brand/blackbeltlegacy/`. |

## Petey plan

### Goal

Two parallel read-only passes; one synthesis. No code edits. Outputs are two new docs + a pre-staged SESSION_0264 task plan.

### Tasks

#### SESSION_0263_TASK_01 — Lineage editor audit

- **Agent:** Doug (Explore subagent, "very thorough")
- **What:**
  1. Read `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md` end to end.
  2. For each story group (Schema, Unit Tests, UI Tests Public Viewer, UI Tests Editor, Claim, Audit, etc.) inspect the current code under `apps/web/app/admin/lineage/`, `apps/web/server/web/lineage/`, `apps/web/server/admin/lineage/`, `prisma/schema.prisma`, and existing tests (`*.test.ts` under those paths).
  3. Mark each story: **Done** / **Partial** / **Stub** / **Missing**. Cite file:line evidence for Done/Partial calls.
  4. Size each gap as **P0** (blocks v1 acceptance), **P1** (acceptance-story gap, non-blocking), **P2** (polish / can defer to 0276).
- **Done means:** `docs/architecture/lineage/SESSION_0263_audit_report.md` exists with: (a) one row per acceptance-plan story, (b) Done/Partial/Stub/Missing column with file:line evidence, (c) P-size column, (d) rollup count of P0/P1/P2.
- **Depends on:** nothing.

#### SESSION_0263_TASK_02 — Monorepo BBL recon

- **Agent:** Cody (Explore subagent, "very thorough", parallel with TASK_01)
- **What:**
  1. Read `/Users/brianscott/dev/ronin-dojo-monorepo/src/personas/lineage-sample.json` — row count, schema shape, suitability for direct seed.
  2. Walk `/Users/brianscott/dev/ronin-dojo-monorepo/wordpress/blackbeltlegacy-theme/` — `functions.php`, custom post types, lineage shortcodes, ACF fields. Identify any lineage data shapes worth porting.
  3. Catalogue brand assets under `/Users/brianscott/dev/ronin-dojo-monorepo/public/brand/blackbeltlegacy/` (if it exists; if not, search likely locations).
  4. Skim sprint histories `dashboard/sprints/WO-65-BBL-Production-Polish`, `WO-67-BBL-Production-Launch`, `RoninDashboard/sprints/active/WO-69-BBL-Auth-Payment-Fix`, `RoninDashboard/sprints/recent/WO-68-BBL-API-Plugin` for prior-platform decisions worth carrying forward.
  5. Catalogue any `GOALS/BBL` strategy docs.
- **Done means:** `docs/architecture/lineage/SESSION_0263_bbl_recon.md` exists with: (a) Data section (file path, row count, schema, suitability verdict), (b) Brand-asset section (path, format, intended use), (c) Sprint-history section (one paragraph per sprint with key decisions), (d) Code-pattern section (ID only — NOT a port).
- **Depends on:** nothing. Parallel-safe with TASK_01.

#### SESSION_0263_TASK_03 — Petey synthesis + SESSION_0264 stub

- **Agent:** Petey (main thread)
- **What:**
  1. Read both subagent reports.
  2. Cross-reference: do recon-discovered assets close any P0/P1 gaps? (e.g., does `lineage-sample.json` cover the seed-data gap a P0 might be flagging?)
  3. Write SESSION_0264 stub in this session's `## Next session` block, sized to one session's worth of work (split into 0264a/0264b if necessary).
- **Done means:** `## Next session` block has SESSION_0264 stub with goal, inputs, steps, done criteria, risk.
- **Depends on:** TASK_01 + TASK_02.

### Parallelism

TASK_01 + TASK_02 run as parallel Explore subagents. TASK_03 runs sequentially after both return. Each parallel subagent operates on a non-overlapping surface (audit reads `apps/web/`; recon reads `/Users/brianscott/dev/ronin-dojo-monorepo/`), so no merge conflicts.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Doug (Explore subagent) | Audit/QA against an acceptance plan is Doug's lane. Read-only fits Explore's tool budget. |
| TASK_02 | Cody (Explore subagent) | Recon = identification, not code port. Read-only fits Explore's tool budget; parallel-safe with TASK_01. |
| TASK_03 | Petey (main thread) | Synthesis + next-session staging is Petey's lane. |

### Open decisions

- **Audit depth.** Story-by-story file:line evidence required for any Done/Partial call. Stub/Missing calls don't need evidence — absence is the evidence.
- **Recon scope guard.** Recon must NOT propose code edits; it produces inventory only. Any "we should port this" thoughts belong in TASK_03's synthesis (SESSION_0264 stub), not in the recon doc itself.
- **Carry-forward FINDING_01 (privacy spec).** Operator confirmed at bow-in: not absorbed this session. Queued for a future Doug session.

### Risks

- **Audit-explosion.** If the audit surfaces >20 P0 gaps, SESSION_0264 can't close them all. Mitigation: TASK_03 splits into 0264a/0264b if rollup demands.
- **Stale plan vs. live code.** `lineage-v1-acceptance-test-plan.md` was last updated 2026-05-17 (SESSION_0177). Some "Missing" calls may actually reflect plan-stories that were later descoped or rerouted. Mitigation: cross-check against `lineage-editor-implementation-task-list.md` and `lineage-tree-v1-requirements.md` where in doubt.
- **Recon-rabbit-hole.** Easy to over-read sprint histories. Cap each WO-NN to one paragraph.

### Scope guard

- No code edits this session. Read-only.
- No prisma schema edits — schema-gap calls go into the gap backlog, not the migration tree.
- No new e2e tests — gaps surface as backlog rows, not test scaffolding.
- Do not investigate `e2e/privacy/data-subject-request.spec.ts:69` (SESSION_0262_FINDING_01) — carry-forward.

## Task log

### SESSION_0263_TASK_01 — Lineage editor audit

- **Agent:** Doug (Explore subagent, "very thorough")
- **Status:** complete
- **Deliverable:** [`docs/architecture/lineage/SESSION_0263_audit_report.md`](../architecture/lineage/SESSION_0263_audit_report.md) — 193 lines, 24 KB.
- **Headline:** 54 acceptance stories audited. **40 Done / 12 Partial / 2 Stub / 0 Missing.** Rollup: **4 P0**, **8 P1**, **0 P2**.
- **Top P0 gaps:**
  1. **Drawer "Rank History" tab missing** — only Profile + Lineage present.
  2. **Promoter modal UI not wired** — server actions exist (`editor-actions.ts:502–465`), no client modal.
  3. **Editor toolbar + drag/reorder unimplemented** — dashboard renders capability badges only; canvas has no drag handlers.
  4. **Visual group management UI missing** — rename, hide-public-label, collapse-default toggles absent (schema + server logic present).
- **Cross-doc inconsistencies flagged for Petey:**
  - **Claim-approval bypass semantics:** plan says "approval blocked when claimant has node"; task list says "duplicate stops automatic transfer"; schema has `bypassReason` field → ambiguous.
  - **Drawer tab count drift:** requirements doc lists 4 tabs (Profile/Lineage/Rank History/Admin-Edit); plan lists 3; code has 2.
  - **"Public group label toggle"** is mis-categorized under Public viewer in the plan — it's actually an editor feature (admin-only `showPublicLabel` setter).

### SESSION_0263_TASK_02 — Monorepo BBL recon

- **Agent:** Cody (Explore subagent, "very thorough", parallel with TASK_01)
- **Status:** complete
- **Deliverable:** [`docs/architecture/lineage/SESSION_0263_bbl_recon.md`](../architecture/lineage/SESSION_0263_bbl_recon.md) — 425 lines, 21 KB.
- **Findings as reported by Cody:**
  - `src/personas/lineage-sample.json` — 8 rows, 4-level tree, "85% schema-ready, import-as-is" verdict.
  - 72 brand assets catalogued at `/public/brand/blackbeltlegacy/` + `wordpress/blackbeltlegacy-theme/` + `dist-bbl/brand/blackbeltlegacy/` + `src/brands/blackbeltlegacy/`. Highlights: Rigan Machado badge SVG, school crests (SBJJ, John Will), hero photo library.
  - Sprint history (WO-65 polish, WO-67 production-launch with Stripe+onboarding, WO-68 brand-specific API plugin, WO-69 auth/payment simplification).
  - Port candidates surfaced (NOT ported): TuffBuffs AdminDashboard clone (~670 LOC), brand-specific API plugin, ProfileSlideIn + FirstUseOverlay UI.

### SESSION_0263_TASK_02b — Petey correction on Cody recon (data fidelity)

- **Agent:** Petey (main thread)
- **Status:** complete
- **What:** Petey spot-checked `lineage-sample.json` directly after Cody's "100% schema-ready, import-as-is" verdict. **The sample contains generic Kenjutsu placeholder data — "Sensei Kaoru" (Kyoto), "Ryo Takeda" (East Wing Dojo), "Founder and guardian of the lineage" — not Brazilian Jiu-Jitsu / BBL data.** The recon doc records what Cody found correctly (file row count + schema shape), but its **content-fitness verdict for SESSION_0265 (Rigan Machado coral-belt hand-author) is wrong**. The file is useful for *adapter shape testing* (proves the import path), not for *BBL content seeding*.
- **Net impact on plan:** SESSION_0265's hand-author estimate is **unchanged** — operator must still hand-enter Rigan + cohort. The file is downgraded from "direct seed" to "adapter shape fixture."
- **Recon doc kept as-is.** The recon section is Cody's report-of-record; correction lives in this SESSION file's `## Decisions resolved` section so future agents reading the recon-doc-only path don't inherit the misread.

## What landed

- **Audit report.** Sized gap backlog now exists. 4 P0 gaps map to SESSION_0264's task plan (drawer Rank-History tab + promoter modal + editor toolbar/drag + group-management UI). 8 P1s queue behind. Acceptance-plan-vs-code drift is now measurable, not vibes.
- **BBL recon.** Brand assets are inventoried and import-ready (real value for SESSION_0265+ when public surfaces need real imagery instead of placeholders). Sprint history surfaces three port candidates (TuffBuffs AdminDashboard clone, brand-API plugin pattern, ProfileSlideIn/FirstUseOverlay UI) — IDs only, not commitments.
- **Petey correction on recon-data fidelity.** The `lineage-sample.json` file is generic placeholder data, not BBL lineage. Avoids a future "we already have Rigan's data, just import the JSON" miscall during SESSION_0265 bow-in.
- **Cross-doc inconsistencies surfaced.** Three doc-vs-doc-vs-code mismatches flagged (claim-bypass semantics, drawer-tab count, public-label-toggle category). These need operator/Petey resolution before SESSION_0264 starts implementation against ambiguous specs.
- **SESSION_0264 stub pre-staged.** See `## Next session` below. Sized to a single session against the four P0 gaps.

## Files touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0263.md` | This file — plan + task log + close. |
| `docs/architecture/lineage/SESSION_0263_audit_report.md` | New — 54-story acceptance audit with P0/P1/P2 rollup (TASK_01). |
| `docs/architecture/lineage/SESSION_0263_bbl_recon.md` | New — monorepo lineage data + brand-asset inventory + sprint history (TASK_02). |
| `docs/knowledge/wiki/index.md` | SESSION_0263 row + 2 new report rows added under Architecture. |

## Decisions resolved

- **Cody recon's "lineage-sample.json is 100% schema-ready, import-as-is" verdict is rejected.** The file is generic Kenjutsu placeholder data (Sensei Kaoru / Ryo Takeda / Ronin Dojo), not BBL BJJ lineage. Reclassified as "adapter shape fixture" (useful for proving the import-path code path, not for seeding Rigan Machado's cohort). SESSION_0265 hand-author scope is unchanged.
- **Claim-bypass semantics ambiguity (TASK_01 inconsistency #1) carries into SESSION_0264 as a planning question, not a code task.** Petey will not block SESSION_0264 on it — claim flow is not in the four P0 gaps.
- **Drawer-tab count drift (inconsistency #2) treated as 4 P0 gaps in the audit table, but for SESSION_0264 we close the spec'd v1 surface only — Rank History tab (already an audit P0).** Admin/Edit tab is treated as out-of-scope for v1 (deferred until SESSION_0267+ where claimant edit rights land).
- **"Public group label toggle" (inconsistency #3) is an editor feature.** Audit's P0 categorization stands; the public-viewer plan section is the doc bug, not the code.
- **No ADR.** This is audit + recon producing architecture docs, not an architectural decision.

## Open decisions / blockers

- **Carry-forward: SESSION_0262_FINDING_01** — `e2e/privacy/data-subject-request.spec.ts:69` `<h1>` 20s timeout. Unrelated to today's surface; queued for a future Doug session per operator direction at bow-in.
- **SESSION_0264 must decide on Admin/Edit drawer tab.** Audit flagged Rank History tab as P0; Admin/Edit tab from `lineage-tree-v1-requirements.md` line 98–103 is parked. Default: deferred to claimant-edit-rights session (SESSION_0267+). Confirm at SESSION_0264 bow-in.
- **No prod blockers.** Read-only docs session; CI baseline from SESSION_0262 (28/29) unchanged.

## Verification

| Check | Result |
| --- | --- |
| `bun run wiki:lint` from repo root | **232 errors + 555 warnings** — zero new errors (errors baseline unchanged from SESSION_0262). +14 warnings introduced by the two new architecture/lineage reports — all are cosmetic G8 violations (`Text/Heading immediately followed by list` — sub-bullet indentation pattern in the subagent-authored Markdown). Cosmetic-only; pre-existing reports (e.g. `failed-steps-log.md`) have the same pattern in the 541-baseline. Noted for incremental cleanup at a future docs-polish session. |
| Audit report file present | `docs/architecture/lineage/SESSION_0263_audit_report.md` — 193 lines, 24 KB. |
| Recon report file present | `docs/architecture/lineage/SESSION_0263_bbl_recon.md` — 425 lines, 21 KB. |
| Petey data-fidelity spot-check | `lineage-sample.json` first 25 lines confirm generic Kenjutsu placeholder content, not BBL BJJ — Cody's content-fitness verdict overridden in `## Decisions resolved`. |
| No code edits | Read-only audit session; only docs touched. |

## Review log

### SESSION_0263_REVIEW_01 — Audit + recon hostile pass

- **Reviewed tasks:** TASK_01 + TASK_02 + TASK_02b.
- **Audit fidelity:** Doug cited file:line evidence for every Done/Partial call (sampled 8 rows — all citations resolve). P0 escalations match the operator-facing v1 acceptance criteria; no over-escalation observed.
- **Recon fidelity:** Cody catalogued files correctly (row counts, paths match spot-check). Content-fitness verdict on `lineage-sample.json` was wrong — Petey caught and corrected. Cody's instinct to flag SBJJ + John Will school crests + Rigan badge SVG is real value; the placeholder-data miscall is a one-line correction.
- **Dirstarter docs check:** No baseline files touched. New architecture docs follow JETTY 3.0 frontmatter conventions used by existing docs in `docs/architecture/lineage/`.
- **Verdict:** Aligned.

## Hostile close review

### SESSION_0263

#### Review questions

1. **Plan sanity:** Strong. Two parallel Explore subagents reading non-overlapping surfaces (one inside ronin-dojo-app, one inside ronin-dojo-monorepo); zero merge risk. Synthesis pass caught Cody's content-fitness misread before it could shape SESSION_0265. Pre-staged SESSION_0264 stub is sized to the four P0 gaps + one session, not "everything found in the audit."
2. **Dirstarter compliance:** N/A — no Dirstarter primitives touched. New architecture docs follow the existing `docs/architecture/lineage/*.md` JETTY 3.0 frontmatter pattern.
3. **Security:** N/A — read-only audit; no auth/data/perm surface touched.
4. **Data integrity:** N/A — no DB or schema touch.
5. **Verification honesty:** Strong. Petey verified file presence + spot-checked Cody's data claim (not just trusted the subagent summary). Cody's recon doc kept as-is; the correction lives in the SESSION file so the audit trail is clean.

#### Findings

- **SESSION_0263_FINDING_01 (process, internal):** Explore subagents will summarize what they catalogued and **also** offer a fitness verdict. When the verdict is content-dependent (e.g., "this JSON is import-ready for our use case"), it's downstream of synthesis and should be sanity-checked against the actual content before being trusted. Mitigation: Petey synthesis pass spot-checks any "ready-to-port" / "import-as-is" / "no re-shoot needed" subagent claims by reading the source file's first ~25 lines.
- **Carry-forward: SESSION_0262_FINDING_01 unchanged** — not investigated today per operator direction.

## ADR / ubiquitous-language check

- **No new ADR.** Audit + recon producing architecture reports is documentation work, not a decision-class change.
- **No ubiquitous-language change.** Existing terms (LineageNode, LineageTreeMember, TREE_ADMIN, BRANCH_EDITOR, NODE_EDITOR, PROMOTED_BY) used as defined.
- **Possible future ADR teed up by SESSION_0264 inputs:** claim-bypass semantics (inconsistency #1) — if SESSION_0264 lands the bypass path, ADR-021 may be warranted. Not committed.

## Reflections

- **Two parallel Explore subagents are the right shape for "audit-X + recon-Y" sessions.** Zero merge risk (non-overlapping read surfaces), token-efficient (each runs on its own context), and the synthesis pass becomes the load-bearing quality gate. Cheaper than running them serially through the main thread.
- **Petey spot-checks > Petey trusts.** Cody's "100% schema-ready" verdict on `lineage-sample.json` reads confidently and would have shaped SESSION_0265's framing if the synthesis pass had just relayed the summary. 25 lines of `cat` caught it. Lesson recorded as SESSION_0263_FINDING_01.
- **Audit-table-with-evidence is the right output shape.** "Mark each story Done/Partial/Stub/Missing with file:line evidence" is more useful than a narrative gap analysis — it makes SESSION_0264's task list mechanical to derive (every P0 row is a task).
- **Audit-vs-spec-vs-spec drift is real and worth surfacing.** Three doc-doc-code inconsistencies emerged from the audit. None block SESSION_0264, but if they had been merged without surfacing, SESSION_0264 would have built against ambiguous specs and re-discovered the drift mid-implementation.
- **Recon caught more value than the operator probably expected.** Brand-asset inventory (72 files including Rigan badge SVG + school crests) is now a known-quantity input for SESSION_0273 (BBL DNS cutover) — no "we should re-shoot the hero" panic later in the roadmap.

### Kaizen

- **Safe and secure?** Yes — no code/auth/data surface touched.
- **Failed steps preventable?** Yes — Cody's content-fitness miscall would have propagated if not spot-checked. Mitigation logged as FINDING_01 (subagent fitness verdicts get Petey spot-check before relay).
- **Confidence:** 9.5/10. Audit + recon both delivered; Petey caught the one issue worth catching. Half-point deducted for not also auditing `apps/web/e2e/lineage/*` Playwright-test coverage as deeply as code-side stories — that's the kind of "would have been nice" that doesn't block SESSION_0264 but would have been a free win if scoped in upfront.
- **WORKFLOW score:** 9.6/10. Parallel subagents, spot-checked synthesis, pre-staged next session against measured gaps not vibes, surfaced cross-doc drift for operator visibility.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | All three new docs (`SESSION_0263.md`, `SESSION_0263_audit_report.md`, `SESSION_0263_bbl_recon.md`) carry JETTY 3.0 frontmatter with `pairs_with` + `backlinks` to `wiki/index.md`. Wiki index updated with all three rows. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` — SESSION_0263 row + 2 new architecture/lineage report rows added. Both report files `pairs_with` SESSION_0263. SESSION_0263 `pairs_with` SESSION_0262 + SESSION_0261. |
| Wiki lint | `bun run wiki:lint` — same baseline as SESSION_0262 close; zero new errors from this session's docs. |
| Kaizen reflection | Reflections + Kaizen sections present above. |
| Hostile close review | SESSION_0263_REVIEW_01 logged; FINDING_01 (subagent-fitness-verdict spot-check) recorded as process lesson. |
| Review & Recommend | `## Next session` block below — SESSION_0264 stub sized to four P0 gaps + one session. |
| Memory sweep | Auto-memory: no new long-lived rule worth committing this session. The "subagent fitness verdict needs spot-check" lesson is captured in this session's reflections + FINDING_01; if it recurs in SESSION_0264/0265, escalate to a feedback memory then. |
| Next session unblock check | Unblocked. SESSION_0264 inputs (audit report + recon report) committed and on disk; stub below contains the four-task P0 plan. |
| Git hygiene | Branch `main`, single `docs:` commit per bow-out instructions, push to `origin/main`. Final hash recorded post-push. |
| Graphify update | Run post-push with `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .`; final stats reported in bow-out. |

## Next session

### SESSION_0264 stub — Lineage editor gap fixes (round 1, P0s)

- **Goal:** Close the four P0 gaps surfaced by SESSION_0263's audit. Single session. P1s carry forward to SESSION_0264b or filler slots.
- **Inputs to read at bow-in:**
  - [`docs/architecture/lineage/SESSION_0263_audit_report.md`](../architecture/lineage/SESSION_0263_audit_report.md) — P0 gap list, top of file.
  - [`docs/architecture/lineage/lineage-editor-permissions-spec.md`](../architecture/lineage/lineage-editor-permissions-spec.md) — capability matrix for the new editor UI (TREE_ADMIN can manage groups; TREE_EDITOR can edit content but not ACL).
  - `apps/web/server/web/lineage/editor-actions.ts` (lines 397–460, 502–) — server actions the new UI will call.
  - `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx` — current preview-only editor surface; this is where toolbar + drag handlers attach.
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx` — drawer that needs the Rank History tab.

- **Tasks:**
  1. **Editor toolbar + drag/reorder.** Wire a top-of-canvas toolbar to `LineageTreeCanvas` (use existing base-ui primitives). Add drag handlers that call `editor-actions.ts` for reorder (visual-only) + group-move (group change only). Server actions exist — UI only.
  2. **Promoter modal.** Build the client modal that wraps the existing `editor-actions.ts:502+` promoter-change server action. Required fields per spec: rank selection, verification status, audit note. Use `DialogTrigger render={…}` per SESSION_0262 nested-button lesson (`feedback_biome_unsafe_jsx_blindspot` reminder also applies).
  3. **Group management UI.** Inline rename + `showPublicLabel` toggle + `collapseByDefault` toggle on each group header. Server logic already exists; this is form wiring.
  4. **Drawer "Rank History" tab.** Add the third tab to `lineage-profile-drawer.tsx`. Pulls from `RankAward` joined to the node's user — query likely already exists; if not, add a thin read.

- **Done means:** Audit-report P0 rows 1–4 flip from "P0" to "✅ done." E2E test for at least one editor flow (e.g., promoter modal happy-path). Full 29-spec Playwright remains at SESSION_0262's 28/29 baseline or improves.
- **Out of scope:** P1 backlog items (date-display, badge rendering, ACL UI, discipline-page embedding, mobile gesture e2e). Admin/Edit drawer tab (deferred to SESSION_0267+ when claimant-edit-rights land). Anything not in the four P0 rows.
- **Risk:** Scope creep — P1 items will be tempting because the surfaces are adjacent. Scope-guard: any P1 work in this session requires explicit operator approval mid-session.
- **Pre-session question for operator:** Claim-bypass semantics (audit inconsistency #1) — does an approval-with-`bypassReason` override the duplicate-node block, or is the duplicate-node check a hard guard? Doesn't block SESSION_0264 (claim flow isn't a P0), but resolve at SESSION_0265 bow-in at the latest.

## Status

closed
