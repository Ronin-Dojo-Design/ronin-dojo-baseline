---
title: "Research-Review — Cheaply automating State-of-Dojo at bow-out (scripts vs agent)"
slug: research-review-state-of-dojo-automation
type: research-review
status: active
created: 2026-07-22
created_at: 2026-07-22T19:30Z
updated: 2026-07-22
author: "Claude (Opus 4.8) — Petey lane"
last_agent: claude-session-0617
session: SESSION_0617
operator: Brian
decision: "pending operator sign-off"
pairs_with:
  - docs/rituals/closing.md
  - docs/protocols/state-of-project-projection.md
  - docs/knowledge/wiki/planning-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Research-Review — Cheaply automating State-of-Dojo at bow-out

> Read-only `/rr`. The question: **how do we get the State-of-Dojo in front of the operator every
> bow-out cheaply (token-wise) but effectively** — what can be a *script* (free) vs. what needs the *agent*
> (tokens)? Durable report for the RDD master vault + this monorepo.

## TL;DR

**The cheapest effective publish already exists and costs zero agent tokens: `/app/state`.** It's a live,
deployed, self-updating route (`apps/web/app/app/state/page.tsx` → `StatePanel`, self-fetches `main` on a
~5-min revalidate, `force-dynamic`). Nothing needs to be *rendered* or *published* per session for the
operator to see the current picture — they open one URL.

So the automation answer is **stop agent-publishing an artifact every session** (the token cost you want to
avoid — and exactly what I mistakenly made a *standing* step earlier today). Instead: **cite `/app/state`
(free) + let the gate runner run the static render (free) + agent-publish an Artifact only on-demand.**

## What's true today (grounded)

| Piece | What it is | Token cost |
| --- | --- | --- |
| `scripts/state-of-project.ts` | Renders the projection → `out/state-of-project.html` (gitignored) | **0** (a script) |
| `apps/web/app/app/state` (`/app/state`) | **Live** in-app projection, self-fetching `main`, ~5-min cache, deployed | **0** (already running) |
| `StatePanel` + `_kernel/*` parse core | Source-agnostic projection kernel (frozen contract, G-023) | — |
| Artifact publish (the `Artifact` tool) | Freezes a per-session HTML snapshot to a private claude.ai URL | **agent tokens** (file read + tool call) |
| `scripts/bow-out-gates.sh` | The deterministic close-gate runner | Does **not** run the projection today |

**The crux (confirmed this session):** *publishing an Artifact is an agent step, not a script step* — a shell
gate structurally cannot do it. That's why "automate it in closing.md" can't mean "gate-runner publishes an
Artifact." It can only mean: gate-runner **renders** (free), and the durable **view** is the deployed route.

## Options

| # | Automation | Token cost | Effective? | Notes |
| --- | --- | --- | --- | --- |
| **A** ⭐ | **Cite `/app/state`** at bow-out; gate runner runs the static render for a local/vault snapshot | **~0** | Yes — always current | Already built; just reference the URL. No per-session agent work. |
| B | Agent publishes an Artifact **every** session (the standing step I added today) | tokens **every** close | Yes but costly | Reverses the token goal; a frozen snapshot the live route already beats. |
| C | Agent publishes an Artifact **on-demand only** (operator asks / milestone) | tokens **only when asked** | Yes, targeted | Keep this — a shareable frozen snapshot when you actually want one. |
| D | Gate runner renders + a script commits/hosts the HTML to a stable URL (gh-pages / committed) | ~0 | Yes | Heavier plumbing than A; A's deployed route already gives a stable URL. |

## Recommendation

1. **Default = Option A.** Make the bow-out State-of-Dojo step **"cite `<prod>/app/state`"** (free, always
   current) — and have **`bow-out-gates.sh` run `bun scripts/state-of-project.ts`** (Gate: deterministic, 0
   tokens) so a fresh static `out/state-of-project.html` always exists for a vault snapshot.
2. **Walk back today's "standing agent-publish" step to on-demand (Option C).** Per-session agent-publishing
   is the token cost you flagged; the live route makes it redundant. Revise `opening.md` + `closing.md`
   accordingly (the change I made this session over-corrected).
3. **Durable vault report:** a small deterministic script (`scripts/state-of-dojo-vault.ts`, or fold into the
   gate runner) writes the render + a short markdown digest into the **RDD master vault** and commits the
   monorepo copy — no agent tokens. (This doc is the monorepo copy; the vault copy needs the confirmed vault path.)

**Net:** the effective/cheap automation is *already deployed* — the work is to **reference it** and **stop
paying agent tokens for a snapshot the live route already gives for free**, keeping agent-publish for
on-demand shareable freezes only.

## Open questions for Brian

1. **Confirm Option A + walk back the standing agent-publish to on-demand?** (My rec.)
2. **Which vault is the "RDD_Master_Vault"** for the durable copy? Candidates on disk: `~/dev/THIS_ONE_VAULT`,
   `~/Vaults/brands/Baseline_Vault`, `~/Desktop/Baseline_Vault`. Name the master and I'll wire the script.
3. **Add `state-of-project.ts` to `bow-out-gates.sh`** as a deterministic gate (0-token render every close)?
