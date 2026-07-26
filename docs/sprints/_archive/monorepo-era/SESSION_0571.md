---
title: "SESSION 0571 — Lean Mammoth operating shell and lead tracer"
slug: session-0571
type: session--closed
status: closed
created: 2026-07-18
updated: 2026-07-19
last_agent: codex-session-0571
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0570.md
  - docs/product/mammoth-build/OPERATING_SYSTEM.md
  - docs/product/mammoth-build/MMB_RECOVERY_MANIFEST.md
  - docs/architecture/decisions/0048-two-repo-vault-kit-and-client-ops-projections.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0571 — Lean Mammoth operating shell and lead tracer

## Date

2026-07-18

## Operator

Brian + codex-session-0571

## Goal

Establish the lean Mammoth operating shell and its first safe sales-cockpit tracer: recover and route the
phone-vault evidence, decide whether the legacy Discussion-Determine-Decision loop deserves promotion to a
small reusable skill, connect MMB work to the canonical goals ledger, and implement the sanitized Today
queue → lead roster → contact workspace → Contact Attempt → Next Action path. HubSpot access remains a calm,
owner-mediated end-of-day gate; no credential or 2FA value enters Markdown, Git, logs, or shell history.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0570.md`.
- Carryover: SESSION_0570 ratified Mammoth's Brand Heartbeat, three-authority operating boundary, missing
  `MMB_INITIAL_INTAKE` status, Keychain-only HubSpot boundary, and the ready-to-run lean MMB package.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `4bc3b7a4`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI composition, server actions, Prisma-backed Mammoth client app |
| Extension or replacement | Extension: reuse the existing Mammoth app, shared UI kit, actions, and DB-backed store |
| Why justified | The tracer deepens the existing product app and sales lifecycle instead of creating a parallel CRM or vault data store. |
| Risk if bypassed | A bespoke list/action stack would fork the UI kernel, auth boundary, and CRM source of truth. |

Live docs checked during planning: local Dirstarter inventories and exact existing app primitives first; live
URLs only if the implementation crosses a purchased L1 layer not already represented in the client app.

### Graphify check

- Graph status: current; stats at bow-in: 18,620 nodes, 35,448 edges, 2,518 communities, 2,822 files tracked.
- Queries used:
  - `Mammoth MMB intake goals goal ledger Todoist HubSpot lead roster contact attempt next action determine dashboard vault`
  - `discuss determine decision skill lean lightweight promotion Petey Giddy`
  - Legacy monorepo: `discuss determine skill lightweight lean decision session goal vault dashboard MMB Mammoth`
- Files selected from graph:
  - `docs/knowledge/wiki/goals-ledger.md`
  - `docs/product/mammoth-build/STORIES.md`
  - `docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md`
  - `docs/knowledge/wiki/agent-systems-map.md`
- Verification note: Graphify found the active goals/dashboard/Mammoth surfaces in the canonical repo. The
  legacy graph had only 59 nodes and returned no matching node, so exact legacy files were verified directly;
  no negative claim is based on that sparse graph.

### Grill outcome

- Repo code/specs/templates, Mammoth DB truth, and private-vault operations remain separate authorities.
- Brand dashboards are generated projections from shared templates; private client content does not move into Git.
- HubSpot rotation is owner-mediated and non-blocking; Todoist is optional and must use scoped local credentials.
- `MMB_INITIAL_INTAKE` remains missing by exact filename; screenshot-named notes and the legacy goal master were located.

## Petey plan

### Goal

Ship one reviewable MMB lane that turns recovered context into a lean operating projection and a safe,
demonstrable lead-to-Next-Action workflow.

### Tasks

#### SESSION_0571_TASK_01 — Recover, determine, and route MMB operating context

- **Agent:** Petey + Giddy
- **What:** Reconcile Graphify results, phone-vault paths, legacy goals, current ledgers, and the
  Discussion-Determine-Decision workflow into one authority map and promotion decision.
- **Steps:** locate artifacts by exact paths; record missing versus recovered evidence; map recent legacy
  `/GOALS` into current ledger references without duplicating bodies; evaluate skill trigger, output, and
  overlap with Petey/grilling.
- **Done means:** paths and authority are documented, the goal-ledger projection is wired, and the skill is
  either validated and promoted or explicitly rejected with evidence.
- **Depends on:** nothing.

#### SESSION_0571_TASK_02 — Build the lean MMB operating projection

- **Agent:** Cody → Doug
- **What:** Add the smallest reusable client-ops shell and Mammoth preset/dashboard projection, preserving
  the private-vault boundary and making Todoist/HubSpot status pointers non-secret and optional.
- **Steps:** reuse the existing vault-kit/dashboard design; create one template authority plus Mammoth
  projection; link repo goal/story/session IDs; prove repeatable installation or deterministic rendering.
- **Done means:** MMB has a usable opening/live-work/closing shell and dashboard projection with no CRM truth,
  PII, secrets, or duplicated canonical ledger bodies.
- **Depends on:** SESSION_0571_TASK_01.

#### SESSION_0571_TASK_03 — Implement the first sales-cockpit tracer

- **Agent:** Cody → Doug + Giddy
- **What:** Extend the existing Mammoth client app with the sanitized Today queue → lead roster → contact
  workspace → Contact Attempt → required Next Action path.
- **Steps:** complete Cody pre-flight; reuse current Project/Activity/store/actions/UI-kit patterns; add the
  smallest data/UI slice with sanitized fixtures; verify empty/loading/error/state transitions and persistence.
- **Done means:** a local user can select a due lead, inspect contact/opportunity context, record a Contact
  Attempt, and leave exactly one owned Next Action; focused tests, typecheck, and build pass.
- **Depends on:** SESSION_0571_TASK_01; may proceed beside TASK_02 only on disjoint files.

### Parallelism

Petey and Giddy research run concurrently and integrate before mutation. TASK_02 and TASK_03 may run in
parallel only if their file sets remain disjoint; shared session/goal/spec files are integrated sequentially.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0571_TASK_01 | Petey + Giddy | Open decisions and structural authority need independent planning and architecture lenses. |
| SESSION_0571_TASK_02 | Cody → Doug | Clear bounded template/projection build with independent verification. |
| SESSION_0571_TASK_03 | Cody → Doug + Giddy | Product implementation requires pre-flight, behavioral proof, and boundary review. |

### Open decisions

- Todoist live API connection proceeds only if a scoped local token exists and the operator explicitly chooses
  the target project; otherwise this session lands the adapter contract/status pointer only.
- HubSpot access remains blocked until Michael rotates the exposed credential and Brian uses the local Keychain prompt.

### Risks

- The phone vault contains large repo copies and stale authorities; recover paths, not wholesale content.
- The Mammoth README is stale relative to the DB-backed app; live code/schema/actions outrank it.
- `MMB_INITIAL_INTAKE` may exist only on an unsynced phone location; do not fabricate recovery.

### Scope guard

- No real lead import, scraping, contact sends/calls/emails, account connection, external sharing, deploy, push, or merge.
- No secrets, PII, or CRM record bodies in repo/vault Markdown.
- No second CRM, second Kanban kernel, or vault-as-transactional-store.
- No wholesale migration of the legacy monorepo or phone vault.

### Dirstarter implementation template

- **Docs read first:** current Dirstarter inventories plus exact existing Mammoth components/actions/schema.
- **Baseline pattern to extend:** shared UI kit, existing client-app shell, Prisma adapter, server actions, and DB-backed board store.
- **Custom delta:** Mammoth-specific due-work, Contact Attempt, and Next Action composition plus a private-vault projection.
- **No-bypass proof:** the tracer extends the current client app and shared primitives; no parallel foundation is introduced.

## Cody pre-flight

### SESSION_0571_TASK_02 — Lean MMB operating projection

- **Docs read first:** `docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md` decisions D2/D5 and
  Workstream B; `docs/sprints/SESSION_0570.md` repository/private-vault/CRM boundary and lean-profile rules;
  canonical `docs/rituals/opening.md` and `docs/rituals/closing.md`; system `skill-creator` instructions.
- **Baseline pattern to extend:** root `vault-kit/` package with one template authority, preset-driven generated
  projections, and an idempotent copy-with-manifest installer. Repo-local skills remain thin adapters over the
  canonical rituals.
- **Custom delta:** generic client-ops opening/live-work/closing templates; a non-secret Mammoth preset and
  dashboard projection linking canonical repo IDs; a deterministic installer that preserves user-edited managed
  files; repo-local `game-on` and `game-off` adapters that always invoke `/bow-in` and `/bow-out`, then apply
  the SESSION_0570 lean-profile rules proportionally.
- **No-bypass proof:** no parallel vault authority, CRM store, goal ledger, session ritual, or client-content
  repository is introduced. The kit proves generated projections in a scratch vault first; the operator's
  explicit request to establish the Mammoth dashboard authorizes the same non-destructive private-vault install.
- **Security and data boundary:** presets may contain product labels, repo-relative links, status-pointer labels,
  and optional integration states only. They must not contain PII, CRM record bodies, passwords, OAuth/API tokens,
  2FA values, `.env` values, or private-vault note bodies.
- **Verification contract:** initialize new skills with the canonical `init_skill.py`, generate
  `agents/openai.yaml`, validate each with `quick_validate.py`, run focused installer tests, and prove the second
  scratch-vault install is byte-stable and the operator-edited live dashboard remains preserved. No push, deploy,
  or external connection.

### SESSION_0571_TASK_03 — Activity-backed sales-cockpit tracer

#### 1. Existing surface scan

- **Graphify query:** `Mammoth CRM Today queue lead roster contact workspace Activity Contact Attempt
  disposition Next Action owner due date AdminKanban actions Project Contact Company`.
- **Found:** the Mammoth DB-backed `AdminKanban`, `Project` detail next-step field, `useProjects`,
  owner-gated `lib/actions.ts`, and the shared kernel `MCard` (`deal`, `record`, `task`). The BBL app also has
  mature DataTable/lead list behavior, but its app-coupled components are not importable by the standalone
  Mammoth product.
- **Decision:** extend the existing Mammoth app and `Activity` model. Add a Mammoth-local cockpit composition;
  do not create another Kanban, CRM store, Lead table, or prematurely extract a universal DataTable.

#### 2. L1 and primitive scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md` and
  `docs/knowledge/wiki/dirstarter-docs-inventory.md`: yes.
- Closest L1 behavior: authenticated admin list → row/detail workspace, responsive sorting/filtering,
  loading/empty/error states, and safe server-side mutation. The standalone client cannot import
  `apps/web/components/common/*`; shared presentation graduates to `packages/ui-kit` only after a second
  consumer.
- Shared primitive spot-check: `MCard(kind: task | deal | record, density: compact | rich, href,
  selected, onSelect, actions)` is presentation-only and suitable for due-work/roster projections;
  `AdminKanban(config, store)` remains the pipeline surface and is not duplicated.

#### 3. Schema and authority spot-check

- No schema migration in this tracer slice.
- Exact existing enum values: `ActivityType = task | call | email | meeting | note`;
  `ActivityStatus = open | completed | at_risk`.
- Exact relations: `Project.activities`, `Contact.activities`, `TeamMember.ownedActivities`;
  `Activity` carries `projectId`, nullable `contactId`/`ownerId`, `type`, `title`, `body`, `status`, nullable
  `dueAt`/`completedAt`.
- Compatibility rule: current Prisma `Project` spans pre-order Opportunity through confirmed Project. The UI
  may call a pre-order row an Opportunity, but this session does not rename/split the persisted model.
- Next Action authority: one open owned `Activity(type=task)` with a due date is transactional truth;
  `Project.nextTask` is updated atomically as the current compatibility/read-model projection.
- Contact Attempt outcome is a bounded tracer catalog serialized in the Activity title/body for this no-schema
  slice; it is explicitly provisional until Michael ratifies durable disposition vocabulary.

#### 4. Backend and data-flow plan

- Auth: reuse `requireOwner()` and `requireOwnedProject()`; every read/mutation remains owner-scoped.
- Mutation: one transaction records the completed Contact Attempt, completes/replaces prior open next-action
  tasks for that Opportunity, creates exactly one owned/due Next Action, and refreshes `Project.nextTask`.
- Read model: Today/overdue/upcoming from open owned Activities; roster/workspace from Contact + active
  pre-order Project + Activity history. No provider send/call/email occurs.
- Runbooks read: `sop-data-and-wiring-flows.md`, `sop-e2e-user-lifecycle.md`,
  `sop-test-writing.md`, and `dev-environment.md`.

#### 5. Verification and prior failures

- Focused pure tests cover due bucketing/sort, bounded outcome labels, and exactly-one-next-action input rules.
- Package gates: focused tests, `bun run typecheck`, and `bun run build` from
  `clients/mammoth-build-crm`; runtime smoke uses sanitized seed/local data only.
- Prior failures acknowledged: FS-0008 (read exact primitive/schema APIs), FS-0014 (do not invent a parallel
  component foundation), FS-0024 (repo location guard), WL-P3-53 (signed-out actions currently fail noisily).
  The cockpit must render an explicit auth/error/retry state rather than treating route HTTP 200 as proof.
- Scope: no import, scraping, real communication, schema migration, HubSpot/Todoist connection, deploy, push,
  or external share.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0571_TASK_01 | landed | Recovered screenshot-listed paths, mapped authorities/goals, retained the five-part decision template as a three-use pilot, and kept `MMB_INITIAL_INTAKE` explicitly missing. |
| SESSION_0571_TASK_02 | landed | Added reusable vault-kit templates/preset/installer, canonical-ritual game adapters, ADR 0048, and a preserved private Mammoth dashboard projection. |
| SESSION_0571_TASK_03 | landed | Added the authenticated Activity-backed sales cockpit, atomic owner claim/attempt/Next Action mutation, explicit states, Denver-time bucketing, and compatibility read-only routing. |

## What landed

- One recovery/authority manifest identifies canonical repo, private vault, iCloud, Downloads, and legacy
  evidence paths without copying private note bodies into Git.
- G-021 now carries the current Mammoth lane. Legacy `/GOALS` files remain historical pointers rather than a
  second backlog; no `discuss-determine` skill was promoted prematurely.
- `vault-kit/` installs one generic client-ops template authority plus the non-secret Mammoth projection,
  preserves operator edits, rejects managed symlink escapes, and is byte-stable on repeat install.
- `/game-on` and `/game-off` are thin lean overlays that always route through the binding canonical rituals.
- Mammoth `/app/sales` now implements Today queue → lead roster → contact workspace → manual Contact Attempt →
  one owned/due Next Action. It neither contacts a provider nor connects HubSpot/Todoist.
- The existing private Mammoth dashboard was preserved and augmented with installed-template links, canonical
  repo IDs, and non-secret integration status pointers.
- Private-vault `MMB_SESSION_0002.md` captures the next-session lean summary/recipe, Michael/Brian goals,
  YAML `session_kind` planning/implementation/review/pickup logs, CV-001/CV-002, BHB/runbook, vault-boundary
  grill, and local-agent feasibility agenda without treating proposed model cost/privacy/locality claims as facts.

## Decisions resolved

- ADR 0048 ratifies three authorities: monorepo for code/specs/reusable templates, Mammoth DB for CRM truth,
  private vault for live consulting operations and read-only projections.
- The legacy Discussion→Determination→Decision artifact remains a tiny template pilot. Promotion requires three
  successful current-repo uses that demonstrate a unique named entry point beyond Petey/grilling/session notes.
- Todoist stays disconnected and one-way-only in concept until source-of-truth, target project, credential scope,
  and explicit connection authorization exist.
- HubSpot remains MB-017: Michael rotates first; Brian uses the Keychain-only prompt later. It did not block work.
- `Project` remains the persisted opportunity/order row this session. `Activity` owns the cockpit queue and
  replacement Next Action; `Project.nextTask` is a compatibility projection and is read-only on project detail.

## Files touched

| File | Change |
| --- | --- |
| `vault-kit/**`, `package.json` | Generic templates, Mammoth preset/dashboard, secure idempotent installer, tests, CLI. |
| `.agents/skills/game-on/**`, `.agents/skills/game-off/**` | Lean adapters over mandatory canonical rituals. |
| `clients/mammoth-build-crm/app/app/sales/**` | Sales cockpit route and explicit loading/error states. |
| `clients/mammoth-build-crm/lib/actions.ts`, `lib/sales-cockpit.ts`, `lib/sales-cockpit.test.ts` | Owner-scoped read model, validated manual attempt transaction, Denver bucketing, pure rules. |
| `clients/mammoth-build-crm/app/app/project/[id]/page.tsx`, `app/app/layout.tsx`, `README.md`, `tsconfig.json` | Route entry, read-only compatibility projection, current DB-backed documentation/test config. |
| `packages/ui-kit/src/m-card/m-card.tsx` | Announces selected button-card state with `aria-pressed`. |
| `docs/architecture/decisions/0048-*.md`, ADR 0034/0038, Obsidian epic | Authority decision, live Dirstarter proof, reciprocal links. |
| `docs/product/mammoth-build/{OPERATING_SYSTEM,MMB_RECOVERY_MANIFEST}.md` | Lean protocol and recovered/missing artifact map. |
| `docs/knowledge/wiki/{goals-ledger,index,log}.md`, this SESSION | G-021, discovery/backlinks, session evidence. |
| `/Users/brianscott/Desktop/Mammoth_Demo_Vault/**` | Private, untracked projection install; existing Command Center preserved/linked and `MMB_SESSION_0002.md` added. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `graphify stats` + targeted queries | Canonical graph healthy; legacy graph sparse and treated as navigation-only. |
| `bun test vault-kit/tests/install.test.ts` | 5 pass; repeat install, edit preservation, traversal and symlink rejection. |
| `bun test lib/sales-cockpit.test.ts` | 3 pass; Denver boundary bucketing, bounded outcomes, required due Next Action. |
| Mammoth `bun run typecheck` | Pass. |
| Mammoth `bun run build` | Pass after remediation; fresh BUILD_ID/routes manifest includes `/app/sales`. Better Auth local configuration warnings only. |
| Focused Biome + `git diff --check` | Pass. |
| `quick_validate.py` for `game-on` / `game-off` | Both valid in an isolated PyYAML validator environment. |
| Independent Doug review | Initial five hard findings fixed; final 8.5/10 with DB-backed concurrency integration proof remaining. |

## Open decisions / blockers

- HubSpot credential rotation and 2FA remain owner-mediated.
- Exact `MMB_INITIAL_INTAKE` source/location remains missing.
- Todoist remains `not-connected`; no scoped credential or target project decision exists.
- Provisional Contact Attempt outcomes require Michael/operator ratification before durable schema/import mapping.
- A sanitized authenticated DB integration test should prove concurrent claim and exactly-one open Next Action.

## Next session

### Goal

Run `MMB_SESSION_0002`: grill the lean Mammoth session/dashboard recipe and brand-vault boundary, then prototype
Michael/Brian goal summaries, YAML `session_kind` routing into planning/implementation/code-review/pickup logs,
CV-001 EEE, CV-002 Token Discipline, BHB/runbook placement, and a gated local-agent feasibility lab. Keep the
sanitized authenticated sales-tracer DB proof as the first implementation-quality gate.

### First task

Run `/grill-me` and `/grill-with-docs` over `MMB_SESSION_0002`, ADR 0048, G-021, and the current dashboard to
determine whether live per-brand vaults stay separate/private or move into the monorepo. Do not move data first.

## Review log

- Petey: recovered authorities/paths and recommended no skill promotion until three current-repo uses.
- Giddy: ratified the three-authority boundary, root vault-kit placement, and one-way integration posture.
- Cody: implemented TASK_02/TASK_03 with focused tests/typecheck/build.
- Doug: found five hard issues (ritual bypass, owner race, focus visibility, reciprocal links, symlink escape)
  plus timezone/compatibility drift; all were fixed. Final review: 8.5/10, with DB integration proof remaining.
- Code-quality matrix §2–§5:
  - `vault-kit/install.ts` — Class C, 9.2/10 strong: verified deterministic behavior/security and documented
    primitive; no cap. Pre-rendering prevents partial installs from future incomplete presets.
  - Mammoth sales tracer — Class A/B, 8.8/10 functional-not-gold: authz/validation/query shape and pure behavior
    verified; D1/D2 remain below gold until a DB-backed concurrency smoke proves the transactional invariant.
  - `fallow audit --changed-since HEAD` and `fallow health` completed with one workspace-discovery warning for
    the standalone Mammoth client; untracked new units were scored directly rather than hidden in blended metrics.

## Hostile close review

- **Score:** 8.5/10 (Doug, independent). Review-recommend: close this bounded tracer and make authenticated DB
  concurrency proof the first next task; do not connect providers or invent a schema first.
- **100/1k/10k:** queue/roster reads are bounded per Opportunity history and indexed on Activity status/due date;
  suitable for the lean local slice. At larger multi-owner scale, add DB-backed concurrency coverage and examine
  the active-project query plan before real imports.
- **Security/integrity:** no credentials/PII/provider actions; owner gates on all reads/mutations; conditional
  row claim precedes task replacement; managed vault symlink escapes rejected. Remaining proof gap is runtime
  concurrency, not a known source defect.

## ADR / ubiquitous-language check

- ADR 0048 added with reciprocal links and live Dirstarter structure/Prisma/auth alignment proof.
- No ubiquitous-language update: existing canonical `Contact Attempt` and `Next Action` govern. Outcome labels
  remain explicitly provisional and therefore were not promoted into the glossary.

## Reflections

- The phone screenshots were most useful as path evidence: they revealed multiple visible vault roots and legacy
  artifacts, but not a trustworthy authority hierarchy. The recovery manifest now supplies that hierarchy.
- A lean wrapper can reduce work-card ceremony, but binding bow-in/bow-out remains universal; the independent
  review caught that distinction before close.
- The smallest useful sales tracer did not need a schema migration or provider integration. Its next meaningful
  evidence is a disposable authenticated DB test, not more interface breadth.
- Token/cost telemetry: unavailable. Client satisfaction: not inferred or self-awarded.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | New session/ADR/product docs carry required fields; source comments explain only non-obvious authority/concurrency rules. |
| Backlinks/index sweep | SESSION, G-021, ADR 0048, operating system, recovery manifest, ADR 0034/0038, and dashboard epic reciprocally linked/indexed. |
| Wiki lint | 0 errors; 54 pre-existing formatting warnings. |
| Deferral guard | Pass; no untracked deferrals. |
| Graphify refresh | 18,717 nodes · 35,644 edges · 2,547 communities · 2,839 files. |
