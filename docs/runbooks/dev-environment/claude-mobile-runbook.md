---
title: Claude Mobile Runbook
slug: claude-mobile-runbook
type: runbook
status: active
created: 2026-06-06
updated: 2026-06-06
last_agent: claude-session-0350
pairs_with:
  - docs/runbooks/dev-environment/codex-mobile-runbook.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
backlinks:
  - docs/runbooks/README.md
  - docs/sprints/SESSION_0350.md
tags:
  - mobile
  - remote
  - claude
  - autonomous
  - dev-environment
---

# Claude Mobile Runbook

Run or drive a Claude Code session from your **phone** while the MacBook stays open — for
**dispatch** (fire a session, walk away) or **cowork** (interactive, you type from the phone).
This is the canonical doc for the shared transport (SSH/tmux/Tailscale) and the cloud-container
prerequisites; the [Codex Mobile Runbook](codex-mobile-runbook.md) reuses both.

> **Setup-only.** This documents the setup so a future session *can* be run from the phone. It does
> not start one. The repo is a file-based state machine (see [autonomous-sessions](autonomous-sessions.md)),
> so "mobile" just changes **where you type**, not how a session works.

## Two modes

| Mode | What it is | Best transport |
| --- | --- | --- |
| **Dispatch** | Fire N cold bow-in→bow-out sessions, each lands as a PR; you review/merge from the phone. No live typing. | SSH+tmux running `scripts/auto-session*.sh`, **or** Claude Code on the web against the GitHub repo. |
| **Cowork** | You interactively drive one live session from the phone (grill, approve tools, read output). | SSH+tmux running `claude`, **or** the Claude app / claude.ai/code. |

---

## Transport A — SSH + tmux over Tailscale (full local parity) — CANONICAL

The phone becomes a terminal into **this laptop's real environment**: `graphify`, Postgres.app,
`next dev`, the bow-in/bow-out rituals, and the FS-0024 shell guard all behave exactly as on desktop.
A `tmux` session survives phone disconnects (subway, lock screen), so a long session keeps running.

```text
iPhone (Blink Shell / Termius)
   |  Tailscale tailnet (private, no port-forwarding, no public exposure)
   v
MacBook (lid open, caffeinated)
   tmux session "dojo"
     └─ claude            (cowork)   OR
     └─ scripts/auto-session.sh N    (dispatch)
   + Postgres.app + graphify + next dev  (full ritual parity)
```

### Operator one-time setup (laptop)

1. **Tailscale** — install on the Mac (`brew install --cask tailscale` or the App Store build) and
   sign in. This gives the laptop a stable private IP/MagicDNS name reachable only by your devices.
2. **Enable SSH** — System Settings → General → Sharing → **Remote Login: On** (limit to your user).
   No router/port-forwarding needed; Tailscale carries it.
3. **tmux** — `brew install tmux`. Optionally add to `~/.tmux.conf`: `set -g mouse on` for touch scroll.
4. **Keep awake during a run** — prefix long jobs with `caffeinate -i` (already used by the
   auto-session drivers) so a closed-lid sleep doesn't kill the session.
5. **(Recommended) shell allowlist** — pre-allow close-gate commands so a headless/quick mobile run
   isn't blocked on permission prompts (see [autonomous-sessions](autonomous-sessions.md) → Prerequisite).

### Operator one-time setup (phone)

1. Install **Tailscale** (iOS) and sign in with the same account; confirm the laptop shows in the tailnet.
2. Install an SSH client — **Blink Shell** (best mosh support) or **Termius**. Add a host:
   `user@<laptop-magicdns-name>` with your SSH key.
3. **mosh (optional, recommended for mobile):** `brew install mosh` on the Mac; Blink supports mosh,
   which survives IP changes and latency far better than raw SSH on cellular.

### Daily use

```bash
# from the phone SSH client, on the laptop:
cd /Users/brianscott/dev/ronin-dojo-app
tmux new -As dojo            # create/attach a persistent session named "dojo"

# COWORK:
claude                       # interactive — type the /bow-in prompt, approve tools from the phone

# DISPATCH (cold sessions → PRs):
caffeinate -i scripts/auto-session.sh 3
```

Detach with `Ctrl-b d` (session keeps running); re-attach later with `tmux a -t dojo`.

---

## Transport B — Claude Code in the cloud / app (laptop optional)

Claude Code also runs as a **web app (claude.ai/code)**, a **desktop app**, and with the **Claude
mobile app** (paired-session Remote Control + push notifications). For a phone-first flow:

- **claude.ai/code (web, from the phone browser):** connect the GitHub repo
  `Ronin-Dojo-Design/ronin-dojo-baseline`, start a cloud session, review/merge the PR from the phone.
- **Claude app Remote Control:** when a desktop/SSH session is active and you've been idle, the
  in-session `PushNotification` tool can ping a paired phone; you can steer from the app.

Cloud sessions run in a managed container — see **Cloud container prerequisites** below for why the
local-DB + graphify rituals need extra wiring there.

---

## Autonomous integration (dispatch engine)

The autonomous drivers are the dispatch backend for both transports
(full detail in [autonomous-sessions](autonomous-sessions.md)):

| Script | Use |
| --- | --- |
| `scripts/auto-session.sh N` | N cold **Claude** sessions, each a stacked PR (manual merge). |
| `scripts/auto-session-automerge.sh N` | "Lid up, walk away": runs + **auto-merges each green PR**, pings the phone on any human-decision gate (schema touch, red CI, safety brake). |
| `scripts/notify.sh` → ntfy.sh | Phone push from the bash driver itself (works with no chat open). Set `NTFY_TOPIC` in the gitignored `.claude/notify.env`; subscribe in the ntfy app. |

Phone-from-anywhere recipe: `caffeinate -i scripts/auto-session-automerge.sh 4`, then watch the ntfy
topic on the phone and review/merge PRs from the GitHub mobile app.

---

## Cloud container prerequisites (agent-agnostic)

This repo's rituals assume a **local** machine. A cloud agent container (Claude cloud / Codex Cloud)
does **not** have them by default. To run a *real* session with gates in the cloud, the operator must
supply:

| Need | Local (today) | Cloud container | Operator action |
| --- | --- | --- | --- |
| **Database** | Postgres.app | none | Point `DATABASE_URL` (+ `DIRECT_URL`/`DATABASE_PUBLIC_URL`) at a hosted **Neon** branch; see [neon-advisory-lock-recovery](../database/neon-advisory-lock-recovery.md). |
| **Required secrets** | `apps/web/.env` | none | Provide `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL` (the `min(1)` vars in `apps/web/env.ts`) to the cloud agent's secret store. |
| **Optional integrations** | `.env` | none | Add only if the task touches them: `STRIPE_*`, `RESEND_*`, `S3_*`, `PRINTFUL_*`, `AI_GATEWAY_API_KEY`, `REDIS_REST_*`, `DEV_LOGIN_USER_ID` (dev-login smoke). |
| **Docker / MinIO (local S3)** | Docker Desktop | usually unavailable | Skip media/S3 smokes, **or** set `S3_*` to a real bucket. Not needed for directory/lineage/UI work. |
| **graphify CLI** | installed locally | not installed | **Defer `graphify update` to the next local session** (autonomous-sessions already does this). Graphify-first *discovery* still works only locally. |
| **Local dev server / browser smoke** | `next dev --turbo` + Playwright Chromium | maybe | Operator device/browser smoke is **flagged and skipped**, never faked (closing.md rule). |
| **env parity check** | `scripts/check-vercel-env-parity.ts` | — | Run it locally to confirm Vercel/local env match before trusting a cloud run. |

### What we are missing for a clean cloud session

1. **A dedicated cloud Postgres (Neon) branch + URL** wired into the cloud agent's secrets (the single
   biggest blocker — most gates need a DB).
2. **A secret bundle** for the cloud agent (the 4 required vars minimum).
3. **A graphify decision:** cloud sessions skip `graphify update`; the next *local* session refreshes the
   graph. Acceptable per autonomous-sessions, but note it in the SESSION file.
4. **Browser-smoke parity:** cloud containers may lack a usable Chromium + the locked MCP profile issue
   (SESSION_0349/0350) means a fresh-Chromium fallback script is the reliable path — local only today.

**Recommendation:** for *full-ritual* sessions, prefer **Transport A (SSH+tmux)** — zero new infra, full
parity. Use the cloud transport for lighter PR-style tasks once a Neon branch + secret bundle exist.

## Cross-references

- [Codex Mobile Runbook](codex-mobile-runbook.md) — Codex peer (Codex Cloud + `codex` CLI); reuses this doc's transport + cloud-prereqs.
- [Autonomous Sessions](autonomous-sessions.md) — the cold-process driver scripts + safety model.
- [Notification stack](ntfy-pushover-telegram.md) — phone push wiring (ntfy/Pushover/Telegram).
- [Opening ritual](../../rituals/opening.md) · [Closing ritual](../../rituals/closing.md)
