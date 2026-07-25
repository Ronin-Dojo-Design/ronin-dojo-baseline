---
title: "SESSION 0647 — auto-codex three.js metal-building 3D prototype (overnight auto lane, wave 2)"
slug: session-0647
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: codex-session-0647
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0647 — auto-codex three.js metal-building 3D prototype (overnight auto lane, wave 2)

> Staged by the SESSION_0635 overnight orchestrator (wave 2, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Dispatch payload = the lane prompt; its HARD
> RULES are binding. Branch: `auto/session-0647-3d-prototype`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-codex three.js metal-building 3D prototype — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0647_TASK_01 | complete | Built the standalone parametric three.js metal-building prototype and recorded verification evidence. |

## Bow-in

- Elected lane: the operator-pinned MMB three.js metal-building prototype.
- Queue/pivot: the overnight dispatch is authoritative, has zero open forks, and explicitly supersedes backlog selection for this lane.
- Parallel-lane assessment: one coherent, isolated file set; no further fan-out.
- State of Dojo: live at `/app/state`; no frozen snapshot requested or permitted by this lane's write boundary.
- Environment: `apps/web/node_modules/three` is absent in this worktree, as anticipated by the dispatch. No install or bootstrap was performed.

## Pre-flight: metal-building-3d prototype

Pre-flight waived by Petey — this is explicitly throwaway prototype code under `scripts/prototypes/`, is never imported by an app, and the operator pinned the implementation shape, dependency source, and verification gates.

## What landed

- Added a dependency-free Bun static server on port 4173 with request-time Three.js dependency checks.
- Added request routes for the installed Three.js ESM build and an in-memory bare-import rewrite for `OrbitControls.js`.
- Added a full-viewport Three.js scene with orbit controls, lighting, grid, metallic box walls, and custom-buffer gable roof geometry.
- Added live width, length, eave-height, roof-pitch, and wall-color controls; geometry is disposed and rebuilt on dimensional input.
- Added prototype-only run/dependency documentation.

## Files touched

| File | Change |
| --- | --- |
| `scripts/prototypes/metal-building-3d/serve.js` | Bun server and workspace-relative Three.js vendor routes. |
| `scripts/prototypes/metal-building-3d/index.html` | Full-viewport shell, import map, and fixed control panel. |
| `scripts/prototypes/metal-building-3d/main.js` | Parametric building scene, custom gable geometry, controls, and disposal. |
| `scripts/prototypes/metal-building-3d/README.md` | Prototype boundary, run command, and dependency note. |
| `docs/sprints/SESSION_0647.md` | Lane adoption, implementation record, verification, review, and close evidence. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `node --check main.js` from prototype directory | PASS — `exit=0` |
| `node --check serve.js` from prototype directory | PASS — `exit=0` |
| `git diff --check` | PASS — exit 0 |
| Browser render | KNOWN UNVERIFIED — no in-sandbox render; morning smoke belongs to the orchestrator. |

## Artifacts

None.

## Decisions resolved

- All product and implementation decisions were pinned by the overnight dispatch; no new architectural decision was made.

## Proposed ledger edits

- On morning acceptance, add an “MMB 3D configurator spike” pointer to G-019, or stage a new goal row if G-019 is no longer the correct parent.

## Review log

### SESSION_0647_REVIEW_01 — Giddy Gate Review

- **Reviewed tasks:** SESSION_0647_TASK_01
- **Rubric:** Build lane, `code-quality-matrix` §§2–5.
- **Evidence:** both required Node syntax gates passed; source/diff inspection confirmed isolated prototype scope, request-time dependency handling, geometry disposal, and no package/dependency additions.
- **Composite:** 9.4/10 (D1 8.0, D2 10.0, D3 10.0, D4 9.5, D5 9.0, D6 10.0, D7 10.0); missing-runtime-verification cap 9.4 applied.
- **Fallow delta:** not run — the lane permits only the two named syntax gates and forbids dependency/bootstrap work.
- **Verdict:** CLEARS (≥9.0). The only residual is the explicitly delegated morning browser smoke.

## Hostile close review

- **Plan sanity:** sound; the deliverable is deliberately throwaway and its boundaries are explicit.
- **Dirstarter docs check:** not applicable; no app or Dirstarter-owned layer changed.
- **Security/data integrity:** no sensitive data, auth, database, external input, or app route is involved. The server exposes only four exact local routes.
- **Verification honesty:** syntax and diff hygiene are proven; rendering is not claimed.
- **Workflow/merge readiness:** one isolated lane, authorized paths only, explicit staging required, commit-only/no-push posture.
- **Kaizen — safety/proof:** source is low-risk and local-only. A morning load at `http://localhost:4173`, slider sweep, orbit/zoom check, and missing-dependency 503 check would close the remaining runtime gap.
- **Kaizen — preventable failed steps:** zero implementation failures. Skipping the general close runner prevented its out-of-scope Graphify/state/format writes.
- **Kaizen — 100/1k/10k confidence:** 9/9/9 for independent static browser sessions; geometry remains constant-size at every allowed dimension and the server has no shared mutable state.
- **Findings:** none at severity medium or above.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed; this is explicitly non-product prototype code.

## Reflections

- The fresh worktree lacked `apps/web/node_modules/three`, exactly as the dispatch anticipated. Request-time file checks keep the server start safe while preserving the no-install boundary.
- Keeping the gable to six profile vertices and two roof slopes made the geometry directly auditable.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Session frontmatter updated to `closed` and `last_agent: codex-session-0647`; prototype files require no JETTY metadata. |
| Backlinks/index sweep | No new wiki pages or cross-references; index edits forbidden by lane boundary. |
| Wiki lint | Not run; operator pinned the two prototype syntax gates and prohibited writes outside the prototype/session paths. |
| Kaizen reflection | Present in `Reflections` and hostile-close triad. |
| Hostile close review | `SESSION_0647_REVIEW_01`; no medium-or-higher findings. |
| Code-quality gate | GGR composite 9.4/10; credible-runtime-verification cap applied. |
| Runtime verification | Known unverified by dispatch; morning browser smoke assigned to orchestrator. |
| Evidence-artifact URL | n/a — no in-sandbox runtime UAT and no snapshot requested. |
| Review & Recommend | Lane explicitly ends at commit; AM orchestrator owns smoke and merge review. |
| Memory sweep | Proposed G-019/new-goal pointer recorded without mutating ledgers. |
| Next session unblock check | Unblocked after morning smoke with `apps/web/node_modules` installed. |
| Git hygiene | Expected branch verified; explicit-path staging and one commit only; no push. |
| Graphify update | Skipped — would write outside the operator-authorized lane paths. |

## Open decisions / blockers

- No implementation blocker.
- Known unverified: no browser render was possible in-sandbox because the reused Three.js installation is absent here. This is intentionally left for the morning orchestrator smoke.

## Residual for AM merge

1. Ensure `apps/web/node_modules/three` is installed.
2. Run `bun scripts/prototypes/metal-building-3d/serve.js`.
3. Smoke `http://localhost:4173`: orbit, zoom, resize, all four sliders, color picker, and gable shape at min/max values.
4. Review/cherry-pick the lane commit. This lane did not push.
