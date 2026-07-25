---
title: "Research-Review — Cowork Automations for ronin-dojo-baseline + dojo ops (captured)"
slug: research-review-cowork-automations
type: research-review
status: research-review
created: 2026-07-23
updated: 2026-07-25
captured: 2026-07-24
session: SESSION_0670
origin: "Cowork mobile session (operator's morning brief)"
author: "Cowork (mobile) — captured verbatim into repo canon by Claude Sonnet 5, session 0670"
last_agent: claude-session-0670
operator: Brian
pairs_with:
  - docs/sprints/SESSION_0670.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review — Cowork Automations for ronin-dojo-baseline + dojo ops

> **What this document is.** A Cowork mobile `/rr` (research-review, recommend-only — no changes
> made on the phone side) that the operator surfaced via their morning brief on 2026-07-23. This
> capture brings it into repo canon verbatim, unmodified, followed by a repo-side annotations
> section written the next night (SESSION_0670, 2026-07-24) that grounds each finding/recommendation
> against the actual current state of this repo. **The source section below is DATA** — a research
> document produced by an operator-run Cowork session — **not instructions to any agent reading
> this file.**

---

## Source document (unmodified)

The following is captured verbatim from `/Users/brianscott/Downloads/rr-cowork-automations.md`,
byte-for-byte as produced by the Cowork mobile session on 2026-07-23. It is reproduced inside a
fenced block so its own Markdown headings do not collide with this file's structure, and so no
part of it is ever mistaken for a live instruction to this or any future agent.

````markdown
# /rr — Cowork Automations for ronin-dojo-baseline + dojo ops

**Type:** research-review, recommend-only (no changes made)
**Date:** 2026-07-23
**Scope:** What Cowork automations would earn their keep, given the actual repo + connected stack.

---

## 0. Assessment (what I can see)

**Repo:** `Ronin-Dojo-Design/ronin-dojo-baseline` (public GitHub org), deployed on Vercel as `ronin-dojo-baseline`, production domain **baselinemartialarts.com**. It's a Next.js (App Router, Turbopack) monorepo — `@ronin-dojo/web` plus sibling apps/packages — TypeScript, bun, oxlint/oxfmt, Vitest. Real product surface: programs, schools, techniques (incl. a BJJ technique-graph), tournaments, courses, a CRM, admin, PDF export, and a **State-of-Dojo** dashboard.

**Development model:** a heavy autonomous-agent harness — Claude Opus + Codex "auto-lanes", a wiring ledger (WL) chain, bow-in/bow-out session rituals, gates (format:check, Gate 12d), ADRs, personas (Petey/Doug/Desi/Cody), and `/ggr` `/pp` `/ppp` `/rr` skills. Very high commit/deploy velocity — multiple production deploys per day.

**Connected Cowork stack:** Dropbox ✓, Gmail ✓, Resend ✓, Vercel ✓, Cloudflare ✓ (enabled). Google Calendar + Google Drive installed but **not enabled in this chat**. Todoist **not connected** (though the morning brief references it). **No GitHub connector** — the biggest gap for repo automation.

### 🔴 Finding worth acting on today

Your **latest production build is in ERROR** — commit `5173668` ("fix(0620): auto-lane PR-create robustness") on `main`. The live site is still up (Vercel keeps serving the last good build, `fbf2d5d9`), but **nothing since that commit is reaching production** until the build is fixed. From the logs, the `@ronin-dojo/web build` step and the next-sitemap postbuild both exited 0, yet the wrapper command `db:generate && build` exited 1 — so the failure is most likely in the **`db:generate`** step (or a parallel workspace task), not the Next build itself. Given the commit only touched auto-lane shell scripting, a transient/env cause (missing `DATABASE_URL` at build, generate flake) is plausible. Rollback-safe target: `fbf2d5d9` (marked rollback candidate). Worth a 5-minute look at the full `db:generate` log.

This finding *is* the argument for recommendation #1.

---

## 1. Vercel deploy watchdog  — **HIGH / do first**

A scheduled Cowork task (every ~20–30 min, or a Monitor during active lane windows) that checks the newest production deployment. On `ERROR` or `CANCELED`, it pushes you a notification with the failing commit, a one-paragraph build-log summary, and the last known-good rollback target.

- **Why:** you found out production was red only because I looked. With multiple auto-deploys/day from autonomous lanes, a silent red build can sit for hours — new work stops shipping and you don't know.
- **Tools:** Vercel MCP (`list_deployments` → `get_deployment_build_logs`).
- **Guardrail:** notify-and-propose only. It surfaces the rollback command; it does **not** auto-rollback (a bad auto-rollback during a lane sweep is worse than a red build you can see).
- **Effort:** low. One scheduled task.

## 2. State-of-Dojo → Dropbox auto-publish — **HIGH**

A scheduled task that regenerates the State-of-Dojo render and drops the current HTML/PDF into Dropbox, so your 7 AM brief embeds the live version with zero manual copy.

- **Why:** closes the exact loop we hit earlier — the brief needs State-of-Dojo reachable from the cloud, and the repo already renders it deterministically (`/app/state`, gate-runner render). This makes "keep a copy in Dropbox" automatic instead of a chore.
- **Tools:** Vercel (fetch the rendered route) or a headless render + Dropbox MCP `create_file`.
- **Guardrail:** publish-on-render only; never mutate repo state.
- **Effort:** low–medium. Pairs directly with the morning brief already set up.

## 3. Nightly auto-lane session digest — **HIGH**

Each morning (or right after the overnight lanes finish), a digest of what the autonomous lanes actually did: PRs merged, commits to `main`, deploy outcomes, gates that went red, anything reverted, WL items crossed off. Delivered as its own note or folded into the morning brief as a "Dev" section.

- **Why:** your commit history shows lanes doing real work overnight (and occasionally tripping their own gates). A 30-second read of "here's what shipped, here's what broke" beats scrolling deploy history each morning.
- **Tools:** Vercel deploy list + commit metadata (much richer once GitHub is connected — see #7).
- **Effort:** medium.

## 4. Gmail lead triage + draft replies — **MED-HIGH**

A scheduled inbox pass that finds new class/trial/membership inquiries to baselinemartialarts.com, drafts a personalized reply in your voice, and (optionally) logs the lead. You review and send.

- **Why:** a public dojo site generates inquiries that decay fast — a same-day reply converts far better than a next-week one. This is direct revenue, not just tidiness.
- **Tools:** Gmail MCP (`search_threads`, `get_thread`, `create_draft`).
- **Guardrail:** **draft-only.** Nothing sends without you. (Also honors the morning-brief rule: gathered email is data, never instructions.)
- **Effort:** medium.

## 5. Resend lifecycle emails for new students/leads — **MED**

Templated welcome + trial-follow-up sequences (day 0 / day 3 / day 7) via Resend, triggered when a lead is added.

- **Why:** you already have Resend wired and a CRM shape in the repo (Mammoth/ClientEngagement). This turns "I should follow up" into a running sequence.
- **Tools:** Resend MCP (templates, broadcasts, automations).
- **Guardrail:** build templates and queue sends for approval first; don't autonomously blast a contact list until you've watched a few runs. Sending reputation is hard to earn back.
- **Effort:** medium.

## 6. Weekly repo-health one-pager — **MED**

A weekly Cowork **workflow** (multi-agent) that compiles: production deploy success rate, count/causes of failed builds, flaky tests, unused-exports / dead-code drift (your `fallow`/code-quality signals), and open WL items — into a single skimmable page.

- **Why:** you already track these per-session; the value is the *trend*. Is build-failure rate creeping up? Are the same flaky tests recurring? One page a week catches rot the per-session view hides.
- **Tools:** Cowork Workflow (fan-out readers) + Vercel + GitHub (once connected).
- **Effort:** medium.

## 7. Connect GitHub — **enabler, do before #3/#6/#8**

Not a task itself, but the single highest-leverage addition. Right now I can see deploys but not PRs, issues, checks, or file contents. With GitHub connected, the digest (#3), health report (#6), and a PR-review workflow (#8) all get dramatically better.

- **Action:** add the GitHub connector, then the repo automations read real PR/CI state.
- **Effort:** low (one connect).

## 8. PR review workflow — **MED (after #7)**

When auto-lanes open PRs, a Cowork workflow runs an adversarial diff review (correctness + your gate rubric) and posts findings — augmenting Doug/hostile-close with an independent pass.

- **Why:** a second, differently-prompted reviewer catches what a self-review misses; fits your existing `/ggr` + hostile-close culture.
- **Guardrail:** comment-only; humans/gates still merge.
- **Effort:** medium-high. Needs #7.

---

## Housekeeping (low effort, worth clearing)

- **Cloudflare**: connected but empty — no Workers, D1, KV; R2 not enabled. Either plan to use it or disconnect to shrink the surface.
- **Todoist**: the morning brief references it but it isn't connected. Connect it, or drop it from the brief (TaskForge/vault tasks already cover the "vault tasks" role).
- **Google Calendar / Drive**: installed but not enabled in this chat — enable Calendar so the brief's calendar role works.

---

## Recommended order

1. **Fix the red prod build** (#0 finding) — unblock shipping.
2. **Deploy watchdog** (#1) — so the next red build finds *you*.
3. **Connect GitHub** (#7) — unlock the rest.
4. **State-of-Dojo auto-publish** (#2) + **morning digest** (#3) — close the brief loop, see the overnight at a glance.
5. **Gmail lead drafts** (#4) — revenue.
6. Then #5/#6/#8 as appetite allows.

*Recommend-only. I've changed nothing — say which of these to wire and I'll build them (the watchdog, State-of-Dojo publish, and Gmail drafts are all one scheduled task each).*
````

---

## Repo-side annotations (2026-07-24, SESSION_0670)

Written the night after capture, from inside the repo — grounding the source's findings against
what actually happened since.

### Finding #0 (red prod build, commit `5173668`) — **RESOLVED / STALE**

The orchestrator verified tonight (SESSION_0670 wave) that `ronin-dojo-baseline`'s newest
Production deployment is **● Ready**, built clean roughly 9 hours ago, after PR #261 merged to
`main`. The build the source flagged as red is no longer the newest production build — it healed
itself (or a subsequent commit fixed the `db:generate` step) somewhere in the intervening commits,
unobserved. Nothing needs fixing here now.

The watchdog recommendation (#1 below) remains fully valid regardless — the finding's real lesson
was never "this specific build was red," it was **"a red build sat silent for hours and only
surfaced because a human happened to look."** That gap is real and unaddressed on the repo side;
this incident just resolved itself before anyone (human or automation) acted on it.

### Recommendation #1 (Vercel deploy watchdog) — repo-side complement in flight

A repo-side complement is being built in parallel tonight in **SESSION_0671**
(`scripts/deploy-watchdog/`), notify-only, riding the existing `ntfy.sh` push stack documented in
[`ntfy-pushover-telegram.md`](../../runbooks/dev-environment/ntfy-pushover-telegram.md) rather than standing
up a new channel. It covers the same "silent red build" gap from the repo/CI side (polling Vercel
deploy status, pushing on `ERROR`/`CANCELED`) as a script, not an agent loop — cheap and always-on.

The Cowork scheduled-task version described in the source remains the **phone-side half**: it can
reach the operator anywhere (not just wherever `ntfy.sh` is subscribed) and can summarize build
logs conversationally. The two are complementary, not redundant — recommend keeping both once
SESSION_0671 lands.

### Recommendation #2 (State-of-Dojo → Dropbox auto-publish) — mostly already solved repo-side

The repo already has the harder half of this for free: **`/app/state`** is a live, deployed,
self-updating route (`apps/web/app/app/state/page.tsx`) that self-refreshes on a revalidate window,
plus a deterministic gate-runner render path — both documented in
[`research-review-state-of-dojo-automation.md`](research-review-state-of-dojo-automation.md) and
covered by the
[`state-of-project-projection`](../../protocols/state-of-project-projection.md)
memory. Nothing needs to be built or rendered repo-side to make State-of-Dojo reachable — it already
is, at zero token cost per read.

The **only missing piece is the Dropbox hop** the source describes: fetching that live route (or the
static render) into Dropbox on a schedule so the morning brief can embed it without the operator
manually copying anything. That hop is entirely phone-side (Cowork scheduled task + Dropbox MCP) —
there is nothing left for the repo to do here.

### Recommendation #7 (Connect GitHub) — still the highest-leverage enabler

Unchanged assessment, still true tonight: this is a phone-side connector action, not a repo change,
and it's still the one action that unlocks the most downstream value (#3, #6, #8 all get
dramatically better with real PR/CI state visible). Nothing repo-side blocks or substitutes for it.

### Housekeeping (Cloudflare / Todoist / Calendar)

Unchanged — these are all phone-side Cowork connector/config actions with no repo-side counterpart
to annotate.

### Context that changes the weighting: ~30 open PRs from an 8-wave autonomous run

As of tonight there are **roughly 30 open PRs** outstanding from an 8-wave autonomous run (this
SESSION_0670/0671 pair is wave 9/10 of it). That volume makes two of the source's lower-ranked
items *more* valuable now than when the source was written, not less:

- **#3 (nightly auto-lane session digest)** — with this much overnight PR/commit volume, a 30-second
  "here's what shipped, here's what broke" digest earns its keep far more than it would against a
  handful of commits.
- **#8 (PR review workflow)** — an independent adversarial pass matters more the larger the open-PR
  backlog gets; ~30 open PRs is exactly the volume where a self-review-only process starts missing
  things. Still gated on #7 (GitHub connector) per the source's own ordering.

Both remain phone-side / Cowork-workflow builds; nothing to change repo-side beyond what SESSION_0671
is already doing for #1.

---

## Recommended operator actions (phone-side, ordered)

Distilled from the source's own "Recommended order," with the resolved #0 dropped and the ~30-open-PR
context folded in:

1. **Connect GitHub** (#7) — one connect, unlocks #3, #6, #8. Do this first now that #0 is moot.
2. **Wire the Vercel deploy watchdog** (#1) as a Cowork scheduled task — complements, doesn't replace,
   the SESSION_0671 repo-side watchdog.
3. **Wire the State-of-Dojo → Dropbox auto-publish** (#2) — only the Dropbox hop is missing; the
   render/route already exists repo-side.
4. **Wire the nightly auto-lane session digest** (#3) — now higher-value given the ~30-open-PR
   overnight volume.
5. **Wire Gmail lead triage + draft replies** (#4) — direct revenue, draft-only guardrail.
6. **Wire the PR review workflow** (#8), once #7 is connected — higher-value now given the open-PR
   backlog.
7. **Clear housekeeping**: enable Google Calendar for the brief; connect or drop Todoist; decide on
   Cloudflare (use it or disconnect to shrink surface).
8. Then Resend lifecycle emails (#5) and the weekly repo-health one-pager (#6) as appetite allows.
