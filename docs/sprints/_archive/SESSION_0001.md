# SESSION_0001 — BaselineDashboard kickoff

**Date:** 2026-04-25
**Operator:** Brian + Claude (Opus 4.7)
**Goal:** Lock the program plan, stand up BaselineDashboard, end with S1 ready to begin in SESSION_0002.
**Status:** closed-full

---

## What landed

- **Program plan reviewed and signed off.** Decisions 1–5 from `docs/architecture/program-plan.md` Section 5 accepted: layered architecture (L1 Dirstarter / L2 GPT plan / L3 Brand / L4 legacy UI), Baseline-Martial-Arts as the first brand exposed, 12-sprint MVP scope, schema renames (`Style→Discipline`, `School→Organization`, `Profile→Passport`, `Belt→Rank`), multi-role memberships from S1.
- **BaselineDashboard system created** at `docs/{agents,protocols,rituals,sprints}/`. Replaces the legacy `RoninDashboard/` system. Lean, model-agnostic, no JETTY metadata.
- **Bucket A v5.0 files ported** (refresh of legacy v4.5):
  - [`docs/agents/README.md`](../agents/README.md) — BaselineDashboard introduction
  - [`docs/agents/petey.md`](../agents/petey.md) — Planner / orchestrator persona
  - [`docs/agents/cody.md`](../agents/cody.md) — Builder / self-reviewer persona
  - [`docs/protocols/chat-handoff.md`](../protocols/chat-handoff.md) — Slim handoff protocol (replaces multi-file legacy state machine)
  - [`docs/rituals/opening.md`](../rituals/opening.md) — Bow-in ritual v5.0
  - [`docs/rituals/closing.md`](../rituals/closing.md) — Bow-out ritual v5.0
- **JETTY annotation system rejected** as fluff after a harsh field-by-field audit. Future docs use no metadata header by default; lightweight 4-line YAML front-matter (`status / pairs_with / version`) is acceptable on docs that need orientation.

## Files touched

- `docs/agents/README.md` — created
- `docs/agents/petey.md` — created (operational core preserved from legacy v3.1; philosophy moved to operator-side memory)
- `docs/agents/cody.md` — created (repositioned from legacy "final reviewer" → "builder + self-reviewer" until Doug joins later)
- `docs/protocols/chat-handoff.md` — created (consolidates legacy `CHAT_HANDOFF.md` + `PETEY_NEXT_SESSION_PROMPT_*.md` into one SESSION file per session)
- `docs/rituals/opening.md` — created (v5.0 refresh; dropped JETTY headers, multi-tier load packs, session-numbered handoff files)
- `docs/rituals/closing.md` — created (v5.0 refresh; quick/full distinction preserved; single state file)
- `docs/sprints/SESSION_0001.md` — this file

## Decisions resolved

| # | Decision | Outcome |
|---|---|---|
| 1 | Four-layer architecture (L1 Dirstarter / L2 GPT plan / L3 Brand / L4 legacy UI) | Accepted |
| 2 | First brand exposed in production | Baseline Martial Arts (uses TuffBuffs as behavioral reference; doesn't build *on top of* TuffBuffs) |
| 3 | 12-sprint MVP scope | Accepted as written in `docs/architecture/program-plan.md` Section 3 |
| 4 | Schema renames in S1 | Style→Discipline, School→Organization, Profile→Passport, Belt→Rank — locked |
| 5 | Multi-role memberships from S1 | Yes — `MembershipRoleAssignment` join table from day one |
| 6 | Port Bucket A agent files now vs. after S1 | Now (this session) |
| 7 | Agent system path | `docs/{agents,protocols,rituals,sprints}/` — accepted |
| 8 | JETTY annotation v3.0 | **Rejected** as fluff; not carried forward |
| 9 | Agent system name | **BaselineDashboard** (replaces legacy "RoninDashboard") |
| 10 | Legacy persona scope for v5.0 | Petey + Cody active; Doug deferred to S5+; Brandon deferred to S11; Giddy deferred to post-MVP; Desi dropped |
| 11 | Personal/cultural/philosophical content (Ronin creed, Brian's preferences, etc.) | Lives in operator-side memory or persistent context, **not** in this repo |

## Open decisions / blockers

None blocking SESSION_0002.

Items deferred but tracked:
- **Neon project setup** — only matters when we deploy; deferred until S12 staging.
- **Better-Auth `lastActiveBrandId` configuration** — was queued before the program-plan revision. Will be revisited after S1's schema rev because the Brand enum may shift relative to the new `Organization`/`Discipline` model.
- **Bucket B agent rework** (WORKFLOW_5.0, refreshed orchestrator/QA loops, Doug v5.0 persona) — postpone until the work warrants it; do not preemptively port.
- **`SESSION_0001`'s author note**: the four-piece backend chunk I started before this program-plan turn (`lib/authz.ts` ✅, `apps/web/middleware.ts` ✅, brand-scope Prisma extension ⏸ not started, Better-Auth config ⏸ not started) needs to be revisited after S1's schema rev. The two files that exist will need rename updates (`School` → `Organization`, etc.).

## Next session — SESSION_0002

- **Goal:** Begin S1 schema rev. Plan-only first; no Prisma migration written this session. Output is a written design (in chat or as a doc) that the user can sign off on before the migration is generated in SESSION_0003.
- **Inputs to read:**
  - `docs/architecture/program-plan.md` — S1 row + open decisions list
  - `docs/architecture/plan-vs-current.md` — gap analysis section
  - `docs/architecture/decisions/0004-multi-brand-as-column.md` — confirms `brand` column stays
  - `docs/architecture/source/chatgpt-original-plan.md` lines 130–401 — source-of-truth for Passport/Org/Discipline/Rank/Tournament/Registration/Entry shapes
  - `apps/web/prisma/schema.prisma` — current model
  - This file
- **First task (Petey):** produce a written schema design for S1 covering: `User` extension, new `Passport` (replacing `Profile`), new `DirectoryProfile`, `Organization` (replacing `School`) with `type` enum + `brand` column, `Discipline` (replacing `Style`), `RankSystem` + `Rank` (replacing flat `Belt`), `MembershipStatus` enum, `Membership` reshape with `disciplineId` + `status` + multi-role via `MembershipRoleAssignment`, `Tournament` reshape with status + venue, new `TournamentDiscipline`/`Division`/`Registration`/`RegistrationEntry` with rank+org snapshot fields. Surface any open questions before writing migration SQL.

## Reflections

- **Reading the actual ChatGPT plan changed the trajectory.** Before reading sections 1–7, I'd been building against my own intuitions (single-role memberships, flat Belt model, simplistic Tournament). The plan's Passport+Shells model is substantially richer and is now the data spine. Lesson: when a behavioral spec exists, read it first.
- **The four-piece backend chunk (authz / middleware / brand-scope / better-auth) was the right idea but premature.** The schema names will change in S1. `lib/authz.ts` and `apps/web/middleware.ts` survived but need rename passes. Nothing is wasted but the timing was off.
- **JETTY skim was instructive.** The legacy system's metadata headers are an honest attempt to add structure but fail the maintenance test. v5.0 dropping them is a leaner, more honest start.
- **Cody's role shift (legacy reviewer → v5.0 builder + self-reviewer)** is a small reframe but matters for the persona naming continuity. When Doug joins later, Cody narrows back to building.
- **Going from `RoninDashboard` to `BaselineDashboard`** isn't *just* a rename — it's an opportunity to drop the 14 legacy session prompts, the multi-file state machine, the JETTY headers, and most of the protocol nesting (intent sanitizer / parse-prioritize-prepare-plan / perfect prompt / bubble dictionary). What's left after the trim is: 2 personas, 2 rituals, 1 protocol. Way leaner. We can earn back complexity if the work demands it.

## Bow-out line

SESSION_0001 closed. BaselineDashboard is live. Next: SESSION_0002 — Petey plans the S1 schema rev. No code yet; design then sign-off, then migration in SESSION_0003.

---

## Post-close addendum — GitHub setup

After the bow-out line above, the user authorized handling the GitHub side of the bootstrap as part of this same session. Per the closing ritual, commits + remote setup are inside the close, not after it.

- **Repo:** [Ronin-Dojo-Design/ronin-dojo-baseline](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline) (private)
- **Initial commit:** `cab9dda` — "Initial commit: project bootstrap through SESSION_0001 close"
- **Author:** BScott `<mrbscott@gmail.com>`
- **Branch:** `main` tracking `origin/main`
- **One config note:** `git config http.postBuffer 524288000` (500MB) was set locally to recover from an HTTP 400 on the initial push. Future pushes are normal-sized and don't need it; the config persists harmlessly.

The `Ronin-Dojo-Design` GitHub org sits alongside the legacy `ronin-dojo-monorepo` repo. They are deliberately separate; this new repo does not import legacy backend code per the program plan's layer rules ([Layer 4](../architecture/program-plan.md) is the only place legacy assets feed in, and that's UI-only at S11).
