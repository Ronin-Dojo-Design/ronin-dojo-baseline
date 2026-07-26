---
title: "SESSION 0570 — Michael Flores client-intake demo + live notes"
slug: session-0570
type: session--plan
status: closed
created: 2026-07-18
updated: 2026-07-18
last_agent: codex-session-0570
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0569.md
  - docs/sprints/SESSION_0568.md
  - docs/business/leads/mammoth-build-michael-flores.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0570 — Michael Flores client-intake demo + live notes

## Date

2026-07-18

## Operator

Brian + codex-session-0570

## Goal

Provide lightweight Petey orchestration during Brian's Michael Flores conversation: keep the Mammoth
client-intake screen, demo vault, CRM, and website mockup ready to open on request; capture Michael's
actual feedback in the pre-staged note surfaces; and leave build/publish decisions for after the meeting.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0569.md`; its G-013 technique-graph next task is
  overridden by the operator's explicit meeting lane.
- Relevant carryover: `docs/sprints/SESSION_0568.md` prepared and verified the Mammoth demo vault,
  Michael-specific feedback sheets, share ZIP, CRM, and static website mockup. Post-meeting landing
  flesh-out remains open under G-019 pending Michael-approved vocabulary and content.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `0dd5345e`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None; live demo and note-taking only |
| Extension or replacement | Neither |
| Why justified | This session observes prepared surfaces and captures client input; it does not change product behavior. |
| Risk if bypassed | None at plan-lock; any later app change becomes a separately pre-flighted Cody task. |

Live docs checked during planning: not applicable.

### Graphify check

- Graph status: current; stats at bow-in: 18,585 nodes, 35,412 edges, 2,544 communities, 2,818 files tracked.
- Queries used:
  - `Mammoth CRM client intake vault website HTML Michael Flores` (budget 1500)
- Files selected from graph:
  - `docs/business/leads/mammoth-build-michael-flores.md`
  - `docs/business/leads/project-mammoth-build-crm.md`
  - `docs/product/mammoth-build/PRD.md`
  - `clients/mammoth-build-crm/README.md`
  - `docs/product/mammoth-build/files/mockup.html`
  - `docs/knowledge/wiki/files/mammoth-crm-bindings.md`
- Verification note: exact repo and Desktop vault artifacts were checked directly after Graphify;
  Graphify was navigation, not proof.

## Petey plan

### Goal

Act as a quiet demo concierge and accurate meeting scribe for the Michael Flores intake conversation.

### Tasks

#### SESSION_0570_TASK_01 — Live Mammoth demo orchestration + notes

- **Agent:** Petey (inline) + operator
- **What:** Open the requested Mammoth surface on cue, capture Michael's words in the matching
  pre-staged note, and maintain a concise action list without interrupting the conversation.
- **Steps:**
  1. Pull up `/app/new` for client intake, `/app` for the CRM pipeline, or a project detail when asked.
  2. Open the Mammoth Command Center / demo vault or static `mockup.html` website on cue.
  3. Record meeting, cockpit, scripts, and landing feedback in their dedicated Michael-note files.
  4. At meeting end, separate confirmed facts, decisions, open questions, credentials/owner actions,
     and possible build follow-ups.
- **Done means:** requested surfaces were available during the conversation; Michael's feedback is
  captured without invented claims or secrets; follow-ups are ready for operator review.
- **Depends on:** operator cues and Michael's live input.

#### SESSION_0570_TASK_02 — Ratify Mammoth brand canon + Brandon cross-runtime role

- **Agent:** Petey (integration) + Brandon (brand review)
- **What:** Convert the locked north star and meeting transcription into canonical Mammoth mission,
  motto/mantra, brand-heartbeat principles, ubiquitous language, PRD deltas, stories, and a reusable
  Brandon review role for Claude and Codex/model-agnostic sessions.
- **Steps:**
  1. Reconcile existing Mammoth PRD/STORIES and landing copy with the two successful installation paths.
  2. Separate confirmed operator language from Brandon-recommended copy.
  3. Add product-specific ubiquitous language and acceptance-testable stories.
  4. Add Brandon's prose persona, Claude agent config, and Codex/model-agnostic skill from one authority.
- **Done means:** canonical docs carry the mission and two-path successful-close definition; stories
  cover sales enablement, delivery, both installation paths, satisfaction, branded education, and
  experience principles; Brandon is dispatchable/discoverable without duplicated authority.
- **Depends on:** SESSION_0570_TASK_01 meeting capture; operator ratification of the product north star (done).

#### SESSION_0570_TASK_03 — MMB operating system + parallel lead-cockpit next-session package

- **Agent:** Petey → Brandon + Giddy → Desi
- **What:** Research and stage one executable next-session package for MMB-specific `/game-on`→`/game-off`
  operations, vault/dashboard/timesheet/quality evidence, repo-vault boundaries, Brand Heartbeat propagation,
  existing-surface design review, and a parallel Dirstarter-parity lead-pipeline lane.
- **Steps:**
  1. Locate or explicitly record the absence of `MMB_INITIAL_INTAKE` artifacts.
  2. Compare BBL/Baseline rituals, SESSION template, goals/ADRs/ledgers, vault-kit, and client-app precedents.
  3. Recommend monorepo + lean private vault repo versus a premature single-client code repo.
  4. Define MMB `/game-on` and `/game-off`, session template, clock/timesheet/token-efficiency evidence,
     weekly client rating, deliverable/goal/milestone proof, and anti-gaming quality rules.
  5. Map BHB/Soul of Sales across public copy, components, design system, CRM, dashboards, social, SOPs,
     onboarding, employee/client portals, and vault mirrors.
  6. Stage a parallel lead-pipeline/Dirstarter parity lane with exact inputs, handoffs, files, done-means,
     and verification — no implementation this session.
- **Done means:** SESSION_0570 Next session contains a single ready-to-run prompt with sequential agent
  handoffs, parallel lanes, deliverables, scope guard, and explicit architectural recommendation.
- **Depends on:** SESSION_0570_TASK_02 brand canon.

#### SESSION_0570_TASK_04 — Local-only HubSpot credential safety handoff

- **Agent:** Petey (security boundary) + operator
- **What:** Replace the plaintext-vault instinct with a Keychain-backed, Git-ignored MMB credential
  registry and stage rotation as the first next-session access task.
- **Steps:**
  1. Treat the credential visible in the supplied screenshot as exposed; never copy it into repo/vault notes.
  2. Add a local-only vault pointer and secure-prompt helper that stores the rotated credential in macOS Keychain.
  3. Require Michael-mediated rotation and 2FA before HubSpot use; retain no one-time code.
  4. Prefer least-privilege OAuth/scoped access over a shared password for any lasting integration.
- **Done means:** no credential exists in tracked Markdown or source; local files are permission-restricted and
  future-Git-ignored; the dashboard shows rotation status and the next owner action without exposing a secret.
- **Depends on:** Michael rotating the exposed password before use.

### Parallelism

TASK_02 uses one bounded Brandon review while Petey integrates the canonical docs. No production-code
fan-out; all touched product docs and agent definitions are integrated sequentially.
TASK_03 runs Petey/Giddy/Brandon research in parallel, then Desi consumes their combined surface map;
the resulting next-session prompt has two implementation lanes but remains plan-only now.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0570_TASK_01 | Petey (inline) | Live orchestration and note capture require one shared conversational context. |
| SESSION_0570_TASK_02 | Petey + Brandon | Brand synthesis benefits from an independent messaging lens; Petey preserves product/spec authority. |
| SESSION_0570_TASK_03 | Petey → Brandon + Giddy → Desi | One orchestrator, independent brand/architecture lenses, then surface placement review. |

### Open decisions

- Which surface to show first is chosen live by the operator.
- Drive vs Dropbox for the prepared share ZIP remains Michael's choice.
- Any post-meeting product changes require a separate scoped build decision.

### Risks

- Do not record credentials, OAuth tokens, Todoist keys, or other secrets in the vault or repo.
- Do not turn demo copy into approved client claims unless Michael explicitly confirms it.
- Native Obsidian/device operations under MB-016 remain operator-executed.

### Scope guard

- No code changes, DB writes, data imports, pushes, merges, deploys, or external sharing by default.
- No vault consolidation, Git/Sync pairing, credential movement, or phone operations.
- No post-meeting landing flesh-out until the operator reviews the captured notes and explicitly starts it.
- Every push/merge/deploy still requires fresh, explicit authorization.

### Dirstarter implementation template

- **Docs read first:** not applicable; no implementation.
- **Baseline pattern to extend:** none.
- **Custom delta:** none.
- **No-bypass proof:** meeting orchestration and note capture only.

## Cody pre-flight

Not applicable; no code task is authorized.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0570_TASK_01 | landed | Mammoth vault + Michael meeting note opened in Obsidian; CRM dev server verified HTTP 200 at `http://localhost:3020/app/new` after repairing its local UI-kit symlink. Michael's sales-workflow notes were captured and separated into confirmed signal, proposed requirements, dependencies, a one-question-at-a-time grill tree, and a five-slice build sequence in the private demo vault. |
| SESSION_0570_TASK_02 | landed | Product North Star ratified with delivery + two satisfied-installation paths. Brandon independently reviewed the existing canon; PRD/STORIES/lead brief now end at Satisfied Installation, product-specific ubiquitous language is active, and Brandon has one canonical role with Claude + Codex/model-agnostic adapters. |
| SESSION_0570_TASK_03 | landed | `MMB_INITIAL_INTAKE` filename/content scan found no match in repo, Mammoth demo vault, Desktop, Documents, or Downloads. Petey, Brandon, Giddy, then Desi produced the architecture, brand, lean-operations, parity, rating, and surface-placement inputs for the ready-to-run next-session package. |
| SESSION_0570_TASK_04 | landed | Added a local-only, permission-restricted MMB secret registry with secure macOS Keychain add/delete prompts and a dashboard pointer. No password was copied; the exposed password is marked rotation-required before use. |

## What landed

- Ratified Mammoth Product North Star and canonical Successful Close definition.
- Integrated mission, Brand Heartbeat, two Installation Paths, enablement system, sales cockpit backlog,
  satisfaction gates, and brand-quality acceptance criteria into the existing Mammoth PRD/STORIES.
- Added Mammoth product-specific ubiquitous language.
- Promoted Brandon from prose-only voice to one canonical cross-runtime role with thin Claude and Codex adapters.
- Captured Michael's raw sales-workflow notes and converted them into a grill tree plus build-action sequence in
  the private MMB vault.
- Locked the MMB operating-model recommendation: app code remains in the RDD monorepo; live operations remain
  in a lean private MMB vault; transactional CRM truth remains in Mammoth's own database.
- Staged a risk-proportionate MMB Lean Profile and `/game-on`→`/game-off` next-session recipe.
- Added a Keychain-backed, local-only HubSpot credential scaffold without retaining the exposed password.

## Decisions resolved

- **Product North Star:** know every prospect personally, make the next action effortless, and carry every
  building opportunity through delivery and a satisfied installation without dropping the relationship.
- **Successful Close:** both Mammoth-Installed and Customer-Installed paths meet the same satisfaction
  standard; Customer-Installed includes Mammoth-owned education, guidance, support, proof, and follow-through.
- **Automation posture:** remove administrative friction while preserving personal relationships and human control.
- **Repository boundary:** no combined MMB code+vault repository. RDD owns code/reusable templates, the private
  MMB vault owns consulting operations, and Mammoth's DB owns CRM records. Extract code only at contractual
  handoff or a hard access-control boundary.
- **Quality measurement:** keep Michael-entered delivery satisfaction, evidence-backed engineering quality,
  and raw business outcomes separate. Never infer, self-award, or blend a five-star score.
- **Credential posture:** passwords, 2FA codes, API keys, OAuth tokens, `.env` values, and client exports never
  belong in repo/vault Markdown. Temporary HubSpot access is Keychain-only and rotation-required.

## Files touched

| File | Change |
| --- | --- |
| `docs/product/mammoth-build/PRD.md` | Ratified North Star, Brand Heartbeat, two-path finish line, and enablement quality. |
| `docs/product/mammoth-build/STORIES.md` | Added acceptance-testable sales, delivery, installation, satisfaction, and brand stories. |
| `docs/product/mammoth-build/UBIQUITOUS_LANGUAGE.md` | Added product-specific canonical terms and unresolved aliases. |
| `docs/business/leads/mammoth-build-michael-flores.md` | Recorded intake outcome and corrected pipeline finish line. |
| `docs/agents/brandon.md` | Added the canonical Brandon brand-review role. |
| `.agents/skills/brandon/SKILL.md` + `.claude/agents/brandon.md` | Added thin cross-runtime adapters. |
| `docs/agents/README.md` | Added Brandon to the agent roster. |
| `docs/architecture/decisions/0041-agent-roster-dispatch-and-kanban-as-session-driver.md` | Ratified Brandon's dispatch lane. |
| `docs/protocols/petey-plan.md` | Added Brandon to the planning dispatch table. |
| `docs/knowledge/wiki/agent-systems-map.md` + `docs/knowledge/wiki/index.md` | Added agent/product/session discoverability. |
| `docs/knowledge/wiki/manual-boundary-registry.md` + `docs/knowledge/wiki/wiring-ledger.md` | Routed HubSpot rotation to MB-017 and the signed-out action failure to WL-P3-53. |
| `docs/sprints/SESSION_0570.md` | Captured the meeting, decisions, plan, review, and close evidence. |
| `Mammoth_Demo_Vault/00_Inbox/Michael's Notes — Meeting.md` | Captured raw Michael meeting notes outside Git. |
| `Mammoth_Demo_Vault/Michael Flores CRM Buildout — Grill and Action Plan.md` | Structured the grill and action sequence outside Git. |
| `Mammoth_Demo_Vault/SHH_Folder/MMB_SHH/` | Added local Keychain helpers and a non-secret registry pointer outside Git. |
| `Mammoth_Demo_Vault/02_Dashboards/Command Center — Mammoth.md` | Added a non-secret HubSpot rotation/access status card outside Git. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | PASS — 0 errors; 54 pre-existing formatting warnings. |
| `git diff --check` | PASS. |
| `bun scripts/deferral-guard.ts docs/sprints/SESSION_0570.md` | PASS — 2 real deferrals backed by MB-017 and WL-P3-53. |
| Keychain helper `zsh -n` + permissions | PASS — scripts parse; registry `0600`, helpers `0700`; no secret value stored. |
| Tracked-diff sensitive-path/assignment scan | PASS — no `.env`, key/certificate, `node_modules`, or likely plaintext secret assignment. |

## Open decisions / blockers

- Grill required before implementation: mission/motto ratification; Prospect/Lead/Opportunity language;
  attempt-state semantics; roster ownership; BuildingGuides/HubSpot import posture; email/phone consent
  and provider boundaries; Julie's QuickBooks source-of-truth decision; Calendar/Todoist direction;
  install-pipeline boundary; customer-dashboard timing.
- Exact meanings still unresolved: `ATC-001`, "Mammoth Loyalty C," and "get rid of right now."
- `MMB_INITIAL_INTAKE` was not found in the repo, Mammoth vault, Desktop, Documents, or Downloads; Brian or
  Michael must supply its source/location. Do not fabricate a recovered intake.
- The HubSpot password visible in the supplied screenshot is exposed and must be rotated before use. The
  screenshot should be removed from ordinary storage after Brian confirms it is no longer needed.
- No real-data import, account connection, message send, or build authorization has been granted.
- Close changes are committed locally only; no push was authorized.

## Next session

### Goal

Build the lean MMB operating shell and first safe lead-cockpit implementation packet while preserving the
ratified Brand Heartbeat, private-vault boundary, evidence quality, and explicit client authority.

### Inputs to read

- `docs/sprints/SESSION_0570.md`
- `docs/product/mammoth-build/{PRD,STORIES,UBIQUITOUS_LANGUAGE}.md`
- `docs/business/leads/mammoth-build-michael-flores.md`
- `docs/architecture/decisions/{0034-platform-multi-product-monorepo-model,0041-agent-roster-dispatch-and-kanban-as-session-driver}.md`
- Private vault: `Michael Flores CRM Buildout — Grill and Action Plan.md` and `02_Dashboards/Command Center — Mammoth.md`

### First task

Run `/game-on` in repo-touch mode, which invokes canonical `/bow-in` and then the lean MMB overlay. Before any
HubSpot login, have Michael rotate the exposed password; Brian enters the replacement only through the local
Keychain prompt. Record `MMB_INITIAL_INTAKE` as missing and request its source/location.

### Ready-to-run prompt

> Petey leads SESSION_0571 from `/game-on` to `/game-off`. Use one SESSION source of truth and the MMB Lean
> Profile below. First secure access: treat the screenshot password as exposed, require Michael to rotate it,
> and let Brian enter the replacement only through the local macOS Keychain prompt; never print, paste, commit,
> or retain the password/2FA code. Re-run only the targeted `MMB_INITIAL_INTAKE` known-path check, record the
> verified absence, and ask Brian/Michael for the source. Build an authority map separating confirmed,
> recommended, and missing information. Ratify one MMB operating-model ADR affirming three authorities:
> RDD monorepo = code/specs/reusable templates; Mammoth DB = transactional CRM truth; private MMB vault = live
> consulting operations and read-only projections. Create one compact `OPERATING_SYSTEM.md` containing the
> brand propagation, BBL/Dirstarter parity, existing-surface placement, privacy, timekeeping, and non-gameable
> quality contracts. Then Cody runs two bounded lanes: (A) thin `/game-on`/`/game-off` adapters plus generic
> client-ops templates and Mammoth preset, installed twice into a scratch vault with a byte-stable second run;
> (B) the sanitized roster→contact workspace→manual Next Action tracer packet for MB-LEAD-001/002 and
> MB-ACT-001/002. Stop lane B at spec/preflight if vocabulary, sanitized fixtures, consent, or source-of-truth
> gates are unresolved. Desi's SESSION_0570 placement review is the UI input; dispatch Desi again only if a
> surface changes. Doug verifies timestamp math, interrupted sessions, nullable client ratings, evidence links,
> secret absence, template idempotency, accessibility/state coverage, and any touched app build/tests. Giddy
> closes architecture/security. No real imports, scraping, calls, emails, integrations, migrations, deploys,
> external sharing, pushes, or merges without separate authorization. Finish through `/game-off`; if repo files
> changed it invokes canonical `/bow-out`.

## MMB Lean Profile

### Keep from RDD

- One outcome, one SESSION status, numbered tasks, exact done-means, and a named next action.
- Confirmed/proposed/missing authority split; secrets, consent, real-data, and source-of-truth boundaries.
- Brand/ubiquitous-language canon and client-outcome acceptance evidence.
- Graphify-first only for cross-area discovery; Dirstarter alignment only when its layer is touched.
- Proportional verification, FS-0024 location guard, and fresh authorization for every push/deploy/share.

### Lean out without losing quality

- One five-minute opening card, one live task/evidence table, and one closing card.
- One MMB operating-system document; split a matrix only when independent ownership/versioning requires it.
- Cross-link repo task/story/goal/ADR IDs from the vault; never maintain duplicate ledgers or mirrored bodies.
- Default to Petey inline. Dispatch Brandon only for brand changes, Desi for changed surfaces, Giddy for durable
  architecture/security decisions, and Doug for meaningful verification.
- No repo-wide wiki/JETTY/Graphify/build pass for a vault-only meeting; no code-quality score for prose; no
  per-task star prompt. Run one neutral weekly rating only for evidence-ready, client-reviewed deliverables.

### Risk-triggered deep gates

- Schema/import/real data: preview, dedupe, rollback, migration, isolation, and count-neutral proof.
- Auth/roles/portals: permission matrix and IDOR/security review.
- Email/phone/transcription/scraping/OAuth/integrations: consent, audit, stop/failure rules, and separate live authority.
- Shared UI kit/app UI: Dirstarter/design doctrine, responsive/a11y/state review, typecheck/build/runtime smoke.
- Architecture boundary, deploy, push, or external share: Giddy/ADR check and fresh operator authorization.

### Efficiency measures

- Track accepted deliverables per consulting hour, first-pass gate rate, rework count, and scope variance.
- Record actual model tokens/cost only when telemetry exposes them; otherwise write `unavailable`, never estimate.
- Keep Michael's 1–5 satisfaction, Doug's evidence-backed engineering score, and raw sales outcomes separate.
- WIP cap: one primary slice plus one genuinely independent research lane; maximum three specialists before
  Petey integration.

## Desi surface placement contract

| Projection | Owns | First placement | Explicit exclusions |
| --- | --- | --- | --- |
| Private vault Command Center | Consulting/session mirror | Clock, deliverables/evidence, weekly feedback rollup, next-session prompt, Keychain pointer | No CRM truth, customer PII, credential values, or unlabelled stale counters |
| Admin CRM `/app` | Operational sales truth | Today queue → lead roster → contact workspace → attempt/disposition → required Next Action | No universal vanity score or autonomous campaign send |
| Customer portal | Secure project-scoped truth | Later: order, blueprints, delivery, Installation Path, guides, proof, support, satisfaction | No pipeline, internal notes, timesheets/tokens, other customers, or credentials |
| Public landing | Promise and inquiry | Mission/motto, both Installation Paths, inquiry CTA | No internal workflow or unsupported claims |

Reuse the current Mammoth tokens, shared Kanban kernel, responsive pager, Contact/Company/Project/Activity
models, and BBL table/filter patterns. Before shipping, prove empty/loading/error/retry states, narrow-phone
layout, keyboard tab semantics, consistent focus indicators, autosave status, import rollback, and portal IDOR
protection. Never create a second parallel Kanban or vault-as-CRM mirror.

## Review log

### SESSION_0570 — Michael Flores intake, Mammoth canon, and operating-model plan

**SESSION_0570_REVIEW_01 — Plan and security close**

- **Reviewed tasks:** SESSION_0570_TASK_01, SESSION_0570_TASK_02, SESSION_0570_TASK_03,
  SESSION_0570_TASK_04
- **Dirstarter docs check:** not applicable — no Dirstarter-owned implementation layer changed
- **Sources:** local ADR 0034, ADR 0041, Obsidian Dashboard Epic D2/D5, existing Mammoth/BBL surfaces
- **Verdict:** The docs and planning unit is merge-ready as a local commit. It does not claim the lead cockpit,
  vault installer, HubSpot access, or CRM automation is implemented. The next session begins with credential
  rotation and a scratch-vault proof before any real data or communication action.


## Hostile close review

### Giddy + Doug verdict

- **Plan sanity:** sound after replacing the proposed code+vault single repo with three explicit authorities.
- **Dirstarter compliance:** not applicable for this docs/vault session; the future CRM tracer must reuse
  Dirstarter/BBL table, action, auth, and UI-kernel patterns rather than copy BBL domain data.
- **Security:** no password or 2FA value was copied into repo/vault files. The screenshot credential is exposed
  and blocked on rotation under MB-017.
- **Data integrity:** no schema or CRM data changed; future import/attempt semantics remain grill-gated.
- **Lifecycle proof:** the ratified finish line now includes delivery plus Satisfied Installation on both paths.
- **Verification honesty:** HTTP GET 200 proved route rendering only. Unauthenticated server-action calls emitted
  existing `UnauthorizedError` 500s; the session does not claim an authenticated pipeline smoke.
- **Workflow honesty:** numbered tasks, specialist handoffs, local-only scope, and explicit push gate were kept.
- **Merge readiness:** ready for one local docs/governance commit; not authorized to push.
- **Dirstarter docs check:** not applicable; no baseline layer changed. **Verdict:** aligned.

**SESSION_0570_FINDING_01 — Screenshot-supplied HubSpot credential requires rotation**

- **Severity:** high
- **Task:** SESSION_0570_TASK_04
- **Evidence:** MB-017 and the local non-secret MMB registry
- **Impact:** using or preserving the exposed password could grant unauthorized account access.
- **Required follow-up:** Under MB-017, Michael rotates it before use; Brian stores only the replacement through
  the Keychain prompt; prefer scoped OAuth for lasting access.
- **Status:** open

**SESSION_0570_FINDING_02 — Unauthenticated Mammoth actions fail noisily**

- **Severity:** low
- **Task:** SESSION_0570_TASK_01
- **Evidence:** local dev-server close log: route GETs returned 200 while `listProjects()` POSTs returned 500 with
  `UnauthorizedError` when no session existed.
- **Impact:** a signed-out demo can render its shell while producing noisy failed actions; this is not a valid
  authenticated CRM smoke.
- **Required follow-up:** verify the intended signed-out boundary and friendly error state under WL-P3-53 during
  the next app surface tracer.
- **Status:** open

### Kaizen triage

1. **Safety:** the persisted artifacts are safe by inspection and secret scan because they contain only a
   Keychain reference. Rotation, session revocation, metadata-only verification, and an authenticated HubSpot
   login are still owner-mediated proof.
2. **Preventable failed steps:** two. A credential arrived through a screenshot, and early HTTP-200 evidence did
   not exercise authenticated server actions. Next time, open with a “no secrets in chat/screenshots” intake
   card and define the exact authenticated smoke before calling a surface ready.
3. **Scale confidence:** 100 users 9/10; 1,000 users 8/10; 10,000 users 8/10; aggregate 8/10 because the operating
   boundary is strong but sync, permissions, imports, and communication automation are not behaviorally proven.
   SESSION_0571 begins with the required security/authority and scratch-fixture remediation before app work.


## ADR / ubiquitous-language check

- Updated ADR 0041 only to add Brandon's canonical dispatch role; no Dirstarter architecture changed.
- Added `docs/product/mammoth-build/UBIQUITOUS_LANGUAGE.md` for product-specific terms.
- The three-authority MMB boundary reaffirms ADRs 0033/0034/0038; SESSION_0571 should add one focused MMB
  operating-boundary ADR rather than reopening the platform decisions.
- Added MB-017 for the owner-mediated HubSpot credential boundary.


## Reflections

- RDD's strongest pattern is not ritual volume; it is honest authority, evidence, and next-action ownership.
- MMB can preserve that quality with one opening card, one live evidence table, one close card, and risk-triggered
  specialists/gates instead of always loading the full RDD operating system.
- Client satisfaction, engineering proof, and sales outcomes become misleading when blended; keeping all three
  visible and separate makes the system more trustworthy and easier to improve.
- A route rendering is not the same as an authenticated workflow smoke; future demos must name the boundary.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Current dates/`codex-session-0570` stamped on touched architecture/wiki/protocol docs; private-vault notes intentionally follow the vault's lighter schema. |
| Backlinks/index sweep | SESSION_0570 added to wiki index; MB-017 links back to SESSION_0570; Brandon/product pages indexed. |
| Wiki lint | `bun run wiki:lint` via `bow-out-gates.sh`: PASS — 0 errors, 54 pre-existing warnings. |
| Kaizen reflection | Reflections and three-question Kaizen triage present. |
| Hostile close review | `SESSION_0570_REVIEW_01`; high credential-rotation finding routed to MB-017; signed-out runtime limitation disclosed. |
| Code-quality gate (Class-A) | No Class-A custom code; docs, role adapters, and local vault helpers only. |
| Runtime verification (Doug) | `/app/new` and `/app` GET rendered locally; unauthenticated action POSTs returned 500 and are not represented as a passing CRM smoke. |
| Review & Recommend | Operator-pinned MMB goal overrides the unrelated global board top card; executable SESSION_0571 prompt present. |
| Memory sweep | Durable learning captured in ADR 0041, Mammoth UL, MB-017, and this SESSION; no separate MEMORY.md exists or is needed. |
| Next session unblock check | Partially owner-blocked on credential rotation and missing `MMB_INITIAL_INTAKE`; safe operating-shell/scratch-vault work remains executable. |
| Git hygiene | `main`; unrelated existing worktrees retained; single local commit hash reported at bow-out; no push without fresh authorization. |
| Graphify update | `nodes=18620`, `edges=35448`, `communities=2518`, run before close commit. |
| Build | Skipped by gate runner — docs-only repo diff; no `apps/web/**` changes. |


## Full close evidence
