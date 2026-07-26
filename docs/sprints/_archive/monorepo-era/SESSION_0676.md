---
title: "SESSION 0676 — promote Larry (legal) + Iggy (social) agents from the old monorepo (auto lane, wave 11/12)"
slug: session-0676
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0676
sprint: S12
lane: repo
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0676 — promote Larry (legal) + Iggy (social) agents from the old monorepo (auto lane, wave 11/12)

> Staged by the SESSION_0635 orchestrator (waves 11+12, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0676-agent-promotion-larry-iggy` (base: main).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

promote Larry (legal) + Iggy (social) agents from the old monorepo.

## Discovery evidence (read-only in `/Users/brianscott/dev/ronin-dojo-monorepo`)

`grep -ri "larry\|iggy"` across `.claude/`, `docs/`, `dashboard/`, `RoninDashboard/`:

- **Larry — found, clean match.** `dashboard/personas/larry.md` ("Persona Profile — Larry,"
  Legal & Licensing Advisor, v3, Active — mission: LICENSE/NOTICE, SaaS/white-label/IP advice,
  third-party plugin/asset compliance audits, works with Petey/Brandon/Juno/Doug). Confirmed
  active in `dashboard/personas/roster.md`'s Supporting-personas list. No `Larry.agent.md`
  execution counterpart exists.
- **Iggy — found, but NOT social media.** `RoninDashboard/personas/Iggy.md` +
  `RoninDashboard/personas/AGENTS/Iggy.agent.md` — "Workflow Automation Integrator": runner
  composition, evidence bundling, backend/frontend automation task seeding for the
  `EPIC_BRAND_COMPLETION_SAAS_READINESS_2026` epic (`SESSION_391`/`392`, `EPIC-BCSR-01` task
  seeds A1–A3/B1–B4/F1–F4). Exhaustive cross-search (`social media|instagram|facebook post|
  linkedin post|content calendar|posting schedule` × every Iggy hit) found **zero overlap** — no
  social-media Iggy exists in the old monorepo. The one real social-automation artifact found is
  `RoninDashboard/sprints/active/WO-514_PLAYWRIGHT_SOCIAL_TASKFORGE/plan.md` Phase C
  (`bbl-social-auto-post.php`, WordPress CPT-publish → Instagram/YouTube auto-post), **owned by
  "Cody" in that plan, not Iggy**.
- Full reasoning, fit-vs-roster analysis, and per-old-automation keep/adapt/retire calls:
  `docs/architecture/research/agent-promotion-larry-iggy.md`.
- This repo's own conventions read for the port: `.claude/agents/{doug,petey,brandon,desi,
  giddy}.md` (frontmatter + Scope/Required-output/Style/Boundaries/Source-of-truth/Working-with-
  the-team/Graphify-first/Allowed-never), `docs/knowledge/wiki/agent-systems-map.md` §2 (context
  discipline — where the newcomers slot, as advisory reviewers alongside Brandon).
- Grounding for first assignments: PR #272 (`auto/session-0643-mmb-engagement-pack`, MMB
  engagement pack: proposal-SOW/MSA/NDA drafts) and PR #289 (`auto/session-0665-mmb-kickoff-
  checklist`, kickoff checklist — contains the live TCPA-class SMS-consent flag Larry's first
  job addresses); wave-4 social research SESSION_0652 (RDD)/0653 (MMB)/0654 (BBL)/0658 (RDD
  LinkedIn calendar)/0666 (BBL approval-queue build spec) — all read via `git show <branch>:
  <path>` from their open PR branches, none merged to `main` as of this session.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0676_TASK_01 | done | Discovery — grep + read Larry/Iggy sources in old monorepo, confirm the Iggy social-media mismatch |
| SESSION_0676_TASK_02 | done | Ground first assignments — read PR #272/#289 (MMB engagement pack + kickoff checklist) and the wave-4 social research (0652/0653/0654/0658/0666) via `git show` on their open branches |
| SESSION_0676_TASK_03 | done | Write `.claude/agents/larry.md` (ported + modernized) |
| SESSION_0676_TASK_04 | done | Write `.claude/agents/iggy.md` (fresh design, honestly labeled) |
| SESSION_0676_TASK_05 | done | Write `docs/architecture/research/agent-promotion-larry-iggy.md` (assessment) |
| SESSION_0676_TASK_06 | done | `wiki:lint` on the new research doc — fixed 2 broken links (paste-ready snippet, code-fenced) + missing `updated` frontmatter field |

## What landed

- **`.claude/agents/larry.md`** — legal & licensing reviewer, ported from `dashboard/personas/
  larry.md`. Review-only posture: redlines contracts (MSA/NDA/SOW/change-order), flags
  compliance gaps (TCPA-class consent, IP/licensing, platform-ToS access model), never sends/
  signs/executes/publishes. Every output carries the mandatory "not legal advice — attorney
  review required" line. Tools: `Read, Bash, Glob, Grep, WebFetch`. First assignments: PR #272
  (MMB engagement pack) and PR #289 (MMB kickoff checklist, including drafting the actual
  consent-language options for its already-flagged TCPA row).
- **`.claude/agents/iggy.md`** — social-media strategist, **designed fresh** (no monorepo social
  source exists; the old Iggy is a workflow-automation integrator, not social — labeled honestly
  in the file's own header). Per-brand defaults pulled from this repo's wave-4 research:
  LinkedIn-founder-first for RDD, GBP-first for MMB, approval-queue-first for BBL. Drafts-only /
  never-posts posture — no Write/Edit tool, by design (mirrors Brandon's reviewer pattern; a
  persona with no Write tool cannot accidentally create a live-postable artifact). Includes an
  honest keep/adapt/retire map of the old monorepo's WO-514 social-auto-post automation (retire
  the direct-auto-post mechanism — contradicts approval-queue-first and predates the
  no-WordPress decision; the underlying event→content pattern is already correctly re-derived in
  the BBL flywheel spec).
- **`docs/architecture/research/agent-promotion-larry-iggy.md`** — the full assessment: what was
  found (with exact old-monorepo paths), fit vs. the 5-pillar roster (both slot as advisory
  reviewers alongside Brandon, no Write/Edit), what changed in porting, the proposed
  agent-systems-map addition text, first-assignment suggestions, and the old-automations
  keep/adapt/retire table with reasons.

## Files touched

| File | Change |
| --- | --- |
| `.claude/agents/larry.md` | New. Legal & licensing reviewer persona, ported + modernized. |
| `.claude/agents/iggy.md` | New. Social-media strategist persona, fresh design (labeled honestly — no monorepo source). |
| `docs/architecture/research/agent-promotion-larry-iggy.md` | New. Discovery evidence, fit assessment, porting deltas, proposed ledger edits, first assignments, automations-not-promoted table. |
| `docs/sprints/SESSION_0676.md` | This file — adopted, discovery + task log + landed + proposed ledger edits filled in. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `git branch --show-current` | `auto/session-0676-agent-promotion-larry-iggy` — exit 0 |
| `pwd` | `/Users/brianscott/dev/ronin-0676` — exit 0 |
| `bun run wiki:lint` (before fix) | 3 errors on `agent-promotion-larry-iggy.md` (2 broken links in a paste-ready code-fenced snippet, 1 missing `updated` frontmatter field) — exit 1 |
| `bun run wiki:lint` (after fix) | 0 errors attributable to this session's new file (pre-existing repo-wide warnings/errors on unrelated files unchanged) |
| `git status --porcelain` | Only the 4 allowed files touched — verified before staging |

## Proposed ledger edits

**Agent-systems-map addition** (paste into `docs/knowledge/wiki/agent-systems-map.md` §2's
roster table — file not edited this session, out of the write allowlist):

```markdown
| (legal/compliance) | Larry (`../../agents/larry.md`, once the stub exists) | confirmed engagement docs, contract drafts, compliance flags (TCPA/consent, IP/licensing) |
| (social/growth) | Iggy (`../../agents/iggy.md`, once the stub exists) | ratified brand voice (Brandon), wave-4 platform defaults, the approval-queue spec, automation keep/adapt/retire calls |
```

**`docs/agents/README.md` roster-table addition** (same file/pattern, also not edited this
session):

```markdown
| Larry (`larry.md`, once the stub exists) | Legal & licensing review | Contract redlines, compliance flags, IP/licensing calls |
| Iggy (`iggy.md`, once the stub exists) | Social-media strategy | Content calendars, caption drafts, automation keep/adapt/retire |
```

**Skills-index note:** no `docs/knowledge/wiki/skills-index.md` entry needed — Larry and Iggy are
`.claude/agents/*.md` roster personas (dispatched via `subagent_type`), not slash-command skills.
If a future session wraps either as a `/legal-review` or `/social-draft` skill, that skill would
need its own `skills-index.md` row at that time; no action needed now.

**Thin pointer stubs (residual, not this session):** `docs/agents/larry.md` and `docs/agents/
iggy.md` — every other roster member has one per the README's "thin pointer stub... discovery
from a `docs/`-first read path" convention. Out of this lane's write allowlist
(`.claude/agents/{larry,iggy}.md`, this research doc, and this SESSION file only) — flagged for
the next session/AM merge to close.

## Open decisions / blockers

- None blocking. Both personas are new roster additions awaiting the standard operator review
  before first dispatch (no different treatment requested).
- Open question (not actioned): does the old monorepo's actual workflow-automation-integrator
  Iggy role (runner registry, evidence-bundle contracts, artifact-linkage maps) deserve its own
  separate promotion under a different name, since "Iggy" is now claimed by the social persona?
  Noted in the assessment doc §7, not resolved here.

## Residual for AM merge

- Operator reviews both `larry.md` and `iggy.md` personas before first dispatch.
- Add the `docs/agents/{larry,iggy}.md` thin pointer stubs + the `docs/agents/README.md` roster
  row (proposed text above) in a follow-up session — both are outside this lane's write
  allowlist.
- Apply the `agent-systems-map.md` §2 addition (proposed text above) in a follow-up session —
  also outside this lane's write allowlist.
- All citations in `larry.md`/`iggy.md` to PR #272/#289 and the wave-4 research
  (SESSION_0652/0653/0654/0657/0658/0663/0666) point at **open, unmerged branches** as of this
  session — re-verify merge status before treating a cited path as present on `main`.

