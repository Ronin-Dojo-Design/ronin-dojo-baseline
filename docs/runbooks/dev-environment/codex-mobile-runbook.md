---
title: Codex Mobile Runbook
slug: codex-mobile-runbook
type: runbook
status: active
created: 2026-06-06
updated: 2026-07-16
last_agent: codex-session-0542
pairs_with:
  - docs/runbooks/dev-environment/claude-mobile-runbook.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
backlinks:
  - docs/runbooks/README.md
  - docs/sprints/SESSION_0350.md
tags:
  - mobile
  - remote
  - codex
  - autonomous
  - dev-environment
---

# Codex Mobile Runbook

Run or drive a **Codex** session from your **phone** while the MacBook stays open — for **dispatch**
(fire a session, walk away) or **cowork** (interactive). The shared transport (SSH/tmux/Tailscale) and
the cloud-container prerequisites are identical to Claude's and live in the
[Claude Mobile Runbook](claude-mobile-runbook.md) — this doc is the Codex-specific peer.

> **Setup-only.** Documents the setup so a future session *can* run from the phone; it does not start
> one. Codex records `last_agent: codex-session-NNNN` through the normal bow-in/bow-out ritual, so a
> Codex mobile session is a regular session that happens to be driven from a phone.

## Two modes

| Mode | What it is | Best transport |
| --- | --- | --- |
| **Dispatch** | Fire N cold bow-in→bow-out Codex sessions; review/merge PRs from the phone. | SSH+tmux running `scripts/auto-session-codex.sh`, **or** Codex Cloud against the GitHub repo. |
| **Cowork** | Interactively drive one live Codex session from the phone. | SSH+tmux running `codex`, **or** the ChatGPT app's Codex view. |

---

## Transport A — SSH + tmux over Tailscale (full local parity)

Identical setup to the Claude runbook — see
[Claude Mobile Runbook → Transport A](claude-mobile-runbook.md#transport-a--ssh--tmux-over-tailscale-full-local-parity-canonical)
for the one-time Tailscale + Remote Login + tmux + mosh steps. Only the command differs:

```bash
# from the phone SSH client, on the laptop:
cd /Users/brianscott/dev/ronin-dojo-app
tmux new -As dojo

# COWORK:
codex                                   # interactive codex CLI; approve from the phone

# DISPATCH (cold sessions → PRs):
caffeinate -i scripts/auto-session-codex.sh 3
CODEX_MODEL=gpt-5-codex caffeinate -i scripts/auto-session-codex.sh 3

# BBL waves 2-4 auto-merge batch:
caffeinate -i scripts/auto-session-codex-automerge.sh
```

This is the **recommended** path: full parity with `graphify`, Postgres.app, `next dev`, and the
FS-0024 shell guard, exactly as on desktop.

---

## Transport B — Codex Cloud via the ChatGPT app (laptop optional)

Codex Cloud runs tasks in OpenAI's managed container, driven from **chatgpt.com/codex** or the
**ChatGPT iOS/Android app**:

1. Connect the GitHub repo `Ronin-Dojo-Design/ronin-dojo-baseline` to Codex (one-time, on desktop).
2. From the ChatGPT app, describe the task (e.g. paste the next SESSION "First task"); Codex works in
   the cloud and opens a PR you review/merge from the phone.
3. Configure the Codex environment's **setup script + secrets** so the container can build/test — see
   the cloud-container prerequisites (shared) below.

Codex Cloud is best for **lighter PR-style tasks**. The full local-DB + graphify-first ritual does not
run cleanly there without the wiring below, so for ritual sessions prefer Transport A.

---

## Autonomous integration (Codex dispatch engine)

Full detail in [autonomous-sessions](autonomous-sessions.md):

| Script | Use |
| --- | --- |
| `scripts/auto-session-codex.sh N` | N cold **Codex** (`codex exec`) sessions, each a stacked PR. Uses `--dangerously-bypass-approvals-and-sandbox` for unattended local runs; the FS-0024 guard + the PR review gate remain the safety net. |
| `CODEX_MODEL=gpt-5-codex …` | Pin the Codex model for the run. |
| `scripts/auto-session-codex-automerge.sh` | Local Codex auto-merge driver for the first 3 safe BBL `/app` migration waves after SESSION_0374. Defaults to `N=3`; stops before Prisma/server-flatten/Phase 3 identity work. |
| `scripts/auto-session-automerge.sh N` | Claude auto-merge variant. Pings the phone on any human-decision gate. |
| `scripts/notify.sh` → ntfy.sh | Phone push from the driver itself; set `NTFY_TOPIC` in `.claude/notify.env`. |

Codex parity note: Codex does not yet have Claude's per-command allowlist shape, so the codex driver
relies on the bypass flag + the FS-0024 shell guard + stacked-PR human review (see autonomous-sessions
"Codex variant").

For the BBL waves 2-4 automerge lane, prefer local SSH/tmux over Codex Cloud because local runs can
use Graphify, `bbl.local` smoke checks, `gh`, and ntfy. Codex Cloud fallback instructions live in
[Codex Cloud Handoff — BBL /app Waves 2-4](codex-cloud-bbl-waves-2-4.md).

---

## Cloud container prerequisites (shared, agent-agnostic)

Codex Cloud needs the same wiring as any cloud agent running this repo. The full table (Database / required
secrets / optional integrations / Docker-MinIO / graphify / dev-server / env-parity) lives in
[Claude Mobile Runbook → Cloud container prerequisites](claude-mobile-runbook.md#cloud-container-prerequisites-agent-agnostic).
Codex-specific essentials:

- **Database:** set both `DATABASE_URL` and `DIRECT_URL` to the same dedicated **non-production Neon**
  branch in the Codex environment — Postgres.app is local-only, and production must never be used.
  If `DATABASE_PUBLIC_URL` is also configured, it must resolve to that same non-production branch.
- **Required secrets** (`apps/web/env.ts` `min(1)`): `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL`. Add `STRIPE_*` / `RESEND_*` / `S3_*` only if the task needs them.
- **Codex setup script:** in the Codex Cloud env config, install deps (`bun install` / `pnpm install`),
  `bunx prisma generate`, and apply migrations against that dedicated non-production Neon branch so
  tests/build can run.
- **graphify:** not present in the cloud container → **defer `graphify update` to the next local session**
  and note it in the SESSION file (autonomous-sessions already encodes this).
- **Browser/device smoke:** flagged and skipped in cloud, never faked.

### What the operator still needs to do (checklist)

- [ ] Create/choose a dedicated **non-production Neon branch** for cloud runs; set both `DATABASE_URL`
      and `DIRECT_URL` to that same branch and verify neither resolves to production.
- [ ] Put the 4 required secrets (+ any task-specific ones) into the **Codex Cloud environment** secret store.
- [ ] Add a Codex env **setup script** (install → prisma generate → migrate → seed if needed).
- [ ] Connect `Ronin-Dojo-Design/ronin-dojo-baseline` to Codex Cloud (GitHub app authorization).
- [ ] For Transport A: Tailscale + Remote Login + tmux + a phone SSH client (see Claude runbook Transport A).
- [ ] Set `NTFY_TOPIC` in `.claude/notify.env` and subscribe on the phone for dispatch pings.
- [ ] Decide the cloud **graphify defer** policy (skip in cloud; refresh next local session).

## Cross-references

- [Claude Mobile Runbook](claude-mobile-runbook.md) — canonical transport + cloud-container prerequisites + Claude peer.
- [Autonomous Sessions](autonomous-sessions.md) — `auto-session-codex.sh` + the cold-process safety model.
- [Notification stack](ntfy-pushover-telegram.md) — phone push wiring.
- [Opening ritual](../../rituals/opening.md) · [Closing ritual](../../rituals/closing.md)
