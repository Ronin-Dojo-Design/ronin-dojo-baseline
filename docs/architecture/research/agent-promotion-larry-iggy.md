---
title: "Agent promotion — Larry (legal) + Iggy (social) from the old monorepo"
slug: agent-promotion-larry-iggy
type: research-review
status: research-review
created: 2026-07-24
updated: 2026-07-24
session: SESSION_0676
last_agent: claude-session-0676
pairs_with:
  - .claude/agents/larry.md
  - .claude/agents/iggy.md
  - docs/knowledge/wiki/agent-systems-map.md
  - docs/sprints/SESSION_0676.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - agents
  - roster
  - legal
  - social-media
---

# Agent promotion — Larry (legal) + Iggy (social)

Autonomous lane (wave 12), operator-directed: assess and promote two agents from the old
monorepo (`/Users/brianscott/dev/ronin-dojo-monorepo`, read-only source material) into this
repo's `.claude/agents/*.md` roster. This doc is the assessment; the ported/designed definitions
are `.claude/agents/larry.md` and `.claude/agents/iggy.md`.

## TL;DR

**Larry was found and ported.** **Iggy was found under that name but doing a different job**
(workflow automation, not social media) — no social-media persona named Iggy exists in the old
monorepo. `.claude/agents/iggy.md` is therefore a **fresh design** for the social-media remit,
keeping the operator-directed name but grounded in this repo's own wave-4 research rather than a
port. Both new files follow this repo's `.claude/agents/*.md` convention (Doug/Petey/Brandon/
Desi/Giddy as the reference set), not the old monorepo's persona-doc shape.

## 1. Discovery — what was found, with paths

All reads below were read-only in `/Users/brianscott/dev/ronin-dojo-monorepo` (never checked out,
never modified). Search: `grep -ri "larry\|iggy"` across `.claude/`, `docs/`, `dashboard/`,
`RoninDashboard/` (the two persona-doc trees that repo uses).

### 1a. Larry — found, single clean source

- **`dashboard/personas/larry.md`** — "Persona Profile — Larry," Title: Legal & Licensing
  Advisor, v3, Active. Mission: "ensure every project, asset, and plugin within the dojo adheres
  to proper legal, licensing, and compliance standards... protects the dojo's intellectual
  property and contractual integrity." Responsibilities: maintain LICENSE/NOTICE docs, advise on
  SaaS/white-label/IP frameworks, audit third-party plugin/asset compliance, collaborate with
  Petey on attribution language, log compliance notes. Communication style: "Professional, clear,
  measured. Keeps documentation human-readable and practical." Relationships: advises Brian,
  works with Brandon on brand protection, reviews external integrations with Juno and Doug.
- **`dashboard/personas/roster.md`** — confirms Larry as an active "Supporting Persona" (⚖️ Larry
  — Legal & Licensing Advisor), quote: *"The spirit of the law should guard the soul of
  creation."* Listed in the Phase quick-reference under "Supporting" alongside Laura, Rei, Juno.
- No `Larry.agent.md` execution-mode counterpart exists (unlike Iggy, below) — Larry in the old
  repo was persona-only, never given an explicit tool/file-whitelist contract.

**Fit:** clean 1:1 concept match to this repo's need. No correction required — only
modernization (this repo's `.claude/agents/*.md` structure, concrete file citations instead of
generic "LICENSE and NOTICE docs," a hard review-only posture with the "not legal advice" line
made literal and mandatory rather than implied by the persona's tone).

### 1b. Iggy — found, but not the persona the mission described

- **`RoninDashboard/personas/Iggy.md`** — "Persona Profile - Iggy," Title: **Workflow Automation
  Integrator**. Status: "execution-capable for automation support lanes." Domain: "orchestration
  seams, evidence bundling, runner composition, backend/frontend automation task shaping."
  Mission: "turn stable, repeated workflow motions into safe automation support without changing
  product ownership or Petey's baton authority." Boundaries: may compose existing runners/
  evidence flows, may not replace Petey as orchestration owner, may not ship product features,
  may not authorize cleanup/delete/archive.
- **`RoninDashboard/personas/AGENTS/Iggy.agent.md`** — the execution-mode counterpart. "Purpose:
  Automation integration, workflow runner execution, evidence bundling, and backend/frontend
  automation task seeding." File whitelist: `RoninDashboard/**`, `scripts/**`,
  `scripts/utilities/**`, `scripts/deployment/**` (conditional: `src/**`, `wordpress/**` only
  with explicit WO authorization).
- **`RoninDashboard/sessions/SESSION_391.md` / `SESSION_392.md`** — rollout history. Iggy was
  added in the `EPIC_BRAND_COMPLETION_SAAS_READINESS_2026` epic as an "Automation Orchestration +
  Evidence reviewer" on the scoring roster (alongside Petey, Julie, Giddy, Cody, Desi, Brandon,
  Doug). Task seeds owned by Iggy across that epic: runner registry index, evidence-bundle
  contract, artifact-naming/session-linkage map, and per-brand backend/frontend automation
  inventories (`EPIC-BCSR-01-BASELINE-SCORING/tasks.md` rows A1–A3, B1–B4, F1–F4) — **none of
  these are social-media work**; they are CI/evidence/runner tooling for the brand-completion
  epic.
- **Exhaustive check for a social-media Iggy:** searched `grep -rli "social media|instagram|
  facebook post|linkedin post|content calendar|posting schedule"` across every `.md` in the repo
  and cross-referenced against every Iggy hit — **zero overlap**. No file anywhere pairs "Iggy"
  with a social-media, content-calendar, or posting-automation concept.

**The one real social-media automation artifact in the old monorepo:**
`RoninDashboard/sprints/active/WO-514_PLAYWRIGHT_SOCIAL_TASKFORGE/plan.md` — "Playwright Capture
Runner + Social Auto-Post + AdminTaskForge." Phase C ("Social Media Auto-Post") built
`wordpress/bbl-social-auto-post.php`: a WordPress `transition_post_status` hook firing on
`bbl_event`/`bbl_technique`/`bbl_curriculum` CPT publish, posting to Instagram Graph API
(container→publish) and YouTube Data API v3, with REST endpoints for status/log/test-post/
settings. **This work is explicitly owned by "Cody" in that plan (Phase C), not Iggy.**

**Conclusion:** Iggy exists in the old monorepo, is a real, well-specified persona, and is
**not** a social-media agent. Per this lane's instruction ("If either agent does NOT exist... do
not invent a port from nothing... write the definition FRESH, clearly labeled"), `.claude/agents/
iggy.md` is written fresh for the social-media remit and says so in its own file header. The name
"Iggy" is kept because the operator directed it explicitly; the role is not a port of the old
Iggy's workflow-automation mandate. (Whether the old Iggy's *actual* role — workflow/evidence
automation — deserves its own separate promotion is a fair question but was not asked this
session; noted as a residual idea below, not actioned.)

## 2. Fit vs. the current 5-pillar roster

Per `docs/knowledge/wiki/agent-systems-map.md` §2 (context discipline — "each agent only sees
what it needs"), the roster is Planner (Petey) → Builder (Cody) → Reviewer (Doug) → Architecture
adversary (Giddy) → Design reviewer (Desi) → Brand/rollout reviewer (Brandon). Both new agents
slot as **advisory reviewers alongside Brandon**, not as a seventh pillar:

- **Larry** is Brandon's legal-risk counterpart — Brandon owns whether a claim is *true to the
  brand*; Larry owns whether a claim (or a contract clause) is *legally exposed*. Same
  review-only posture, same "recommend, operator/attorney ratifies" shape as Brandon's "operator
  ratifies" boundary.
- **Iggy** is Brandon's execution-cadence counterpart for one specific channel — Brandon sets
  voice/mission/message hierarchy across every surface; Iggy turns that ratified voice into a
  scheduled, brand-specific content plan for the social channel specifically, and separately
  keeps an honest ledger of which social automations are worth building.

Neither is a builder (no Write/Edit tool), matching Doug/Petey/Brandon/Desi/Giddy's pattern —
only Cody writes production code/content. This preserves the pillar-2 discipline: adding two
advisory reviewers doesn't add build-authority surface area.

## 3. What changed in porting

| | Larry | Iggy |
| --- | --- | --- |
| Source | `dashboard/personas/larry.md` (old monorepo) | No source — fresh design, name kept per operator direction |
| Structure | Rewritten into this repo's `.claude/agents/*.md` shape (frontmatter + Scope/Review checklist/Required output/Style/Boundaries/Source of truth/Working with the team/Graphify-first/Allowed-never) | Same shape, built from scratch |
| Posture | Old: generic "advise on legal boundaries." New: explicit review-only, never-send/sign/execute/publish, mandatory "not legal advice" line on every output | New agent designed review-only, never-post/schedule/credential from the start |
| Grounding | Old: abstract ("LICENSE and NOTICE docs," "SaaS/white-label/IP frameworks"). New: concrete first assignments against real open PRs (#272 engagement pack, #289 kickoff checklist) with exact section citations | Grounded in this repo's own wave-4 research (SESSION_0652/0653/0654/0658/0666) instead of any old-monorepo social content |
| Relationships | Old: Brian, Brandon, Juno, Doug (Juno doesn't exist in this roster). New: Petey, Brandon, Iggy, Cody, Doug | New: Brandon, Larry, Petey, Cody, Doug |
| Tools | None specified in old persona. New: `Read, Bash, Glob, Grep, WebFetch` (operator-specified) | Same tool set, by analogy to Brandon's reviewer pattern (no Write/Edit — see §4 rationale below) |

**Why Iggy gets no Write/Edit tool despite being a "drafting" persona:** the repo's reviewer
personas (Doug, Petey, Brandon, Desi, Giddy) all return recommendations in chat/SESSION-file
prose rather than writing files directly — Brandon's "Spec deltas" become PRD/STORIES changes
*Cody* implements, not files Brandon writes himself. Iggy's calendars/captions are the same
shape: a draft returned for review, captured into a doc by whoever's running the session (or
handed to Cody once ratified), not written unilaterally by the persona. This also mechanically
enforces "drafts-only, never posts" — a persona with no Write tool cannot accidentally create a
scheduled-post artifact a downstream automation might pick up.

## 4. Proposed agent-systems-map addition

Text ready to paste into `docs/knowledge/wiki/agent-systems-map.md` §2's roster table (the file
itself was **not** edited this session — out of this lane's write allowlist):

```markdown
| (legal/compliance) | Larry (`../../agents/larry.md`, once the stub exists) | confirmed engagement docs, contract drafts, compliance flags (TCPA/consent, IP/licensing) |
| (social/growth) | Iggy (`../../agents/iggy.md`, once the stub exists) | ratified brand voice (Brandon), wave-4 platform defaults, the approval-queue spec, automation keep/adapt/retire calls |
```

(Relative paths above are written for `agent-systems-map.md`'s own location, not this file's —
they resolve once the `docs/agents/{larry,iggy}.md` stubs from §7 exist.)

Also proposed (not applied): the same two rows in `docs/agents/README.md`'s "Active personas"
table, plus the standard **thin pointer stub** files `docs/agents/larry.md` and `docs/agents/
iggy.md` that every other roster member has (per that README's note: "`docs/agents/*.md`... now
hold thin pointer stubs for discovery from a `docs/`-first read path"). **Both stubs are
deliberately not created this session** — `docs/agents/*.md` is not in this lane's write
allowlist (only `.claude/agents/{larry,iggy}.md` (new), this file, and `SESSION_0676.md` are).
Flagged as residual for the AM merge / next session to close the convention gap.

## 5. First-assignment suggestions

- **Larry** → the two live engagement artifacts named in this lane's brief: PR #272 (`docs(mammoth-build): draft RDD client-engagement doc pack`, branch `auto/session-0643-mmb-engagement-pack`) and PR #289 (`docs(0665): MMB engagement-kickoff access checklist draft`, branch `auto/session-0665-mmb-kickoff-checklist`). Both are **open, unmerged PRs** as of this session — read via `git show <branch>:<path>`, not checked out. PR #289's checklist already contains a live, unresolved compliance flag (the TCPA-class SMS consent row) that is exactly Larry's first real job: draft the actual consent-language options, not just re-flag what's already flagged.
- **Iggy** → once the wave-4 research PRs (#0652/0653/0654/0658/0666 — see the source-of-truth section in `iggy.md` for exact branch names) land on `main`, Iggy's first job is turning the RDD LinkedIn calendar draft (SESSION_0658) and the MMB 4-week starter cadence (SESSION_0653) from *templates with bracketed slots* into the first real filled week, once the operator supplies the first batch of real project photos/founder post topics — i.e., Iggy's first assignment is content, not infrastructure; the approval-queue *build* is Cody's job once #0666's spec is ratified.

## 6. Old automations assessed and NOT worth promoting

| Automation | Where | Why not promoted |
| --- | --- | --- |
| `bbl-social-auto-post.php` direct-to-platform auto-post (Instagram Graph API / YouTube Data API on WordPress CPT publish) | WO-514 Phase C, old monorepo | This app is no longer WordPress (ADR 0003 — no-WordPress decision already made); the direct-auto-post mechanism also contradicts this repo's own wave-4 default (approval-queue-first, nothing auto-posts at v1) independently arrived at in SESSION_0654/0666. Nothing to port — the underlying *pattern* (domain event → social content) is correctly re-derived already as the BBL flywheel spec. |
| `playwright-capture-runner.sh` (evidence/screenshot automation) | Same WO-514, Phase B | Release-evidence tooling, not social content. Belongs to Doug/Giddy's domain if ever revisited, not Iggy's — not assessed further here as out of this lane's scope. |
| `AdminTaskForge.jsx` (Todoist-style admin checklist) | Same WO-514 | General admin UX component, unrelated to social media. Not assessed further. |
| The old Iggy's actual automations (runner registry index, evidence-bundle contract, artifact-naming/session-linkage map) | `EPIC-BCSR-01` task seeds A1–A3 | Real, well-specified workflow-automation tooling — but it is **workflow/evidence automation, not social media**, so it is out of scope for the social-media Iggy built this session. Whether it's worth a *separate* promotion (a workflow-automation-integrator agent under a different name, since "Iggy" is now claimed by social) is a fair follow-up question, not actioned here. |

## 7. Residuals

1. `docs/agents/larry.md` and `docs/agents/iggy.md` thin pointer stubs — not created (write
   allowlist). Next session should add them + the `docs/agents/README.md` roster row to close the
   convention gap (§4).
2. The old monorepo's workflow-automation-integrator Iggy role has no home in this repo yet.
   Not actioned — flagged only.
3. Both `larry.md` and `iggy.md` cite wave-4 research and MMB engagement docs that live on
   **open, unmerged PR branches** as of this session (#272, #289, and the SESSION_0652/0653/0654/
   0657/0658/0663/0666 branches). Once those PRs merge, the citations resolve to real `main`
   paths; until then, a reader must `git show <branch>:<path>` to see them. This is noted
   in-file at every citation site, not hidden.
4. Operator review of both personas is required before first dispatch (standard residual for any
   new roster addition — no different treatment requested here).
