---
title: "SESSION 0671 — wave-10 Vercel deploy watchdog script (ntfy push, notify-only) (auto lane, wave 9/10 — final pair)"
slug: session-0671
type: session--implement
status: done
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0671
sprint: S12
lane: repo
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0671 — wave-10 Vercel deploy watchdog script (ntfy push, notify-only) (auto lane, wave 9/10 — final pair)

> Staged by the SESSION_0635 orchestrator (waves 9+10 — operator-directed, morning-deadline work).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0671-deploy-watchdog`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

wave-10 Vercel deploy watchdog script (ntfy push, notify-only).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0671_TASK_01 | done | Build `scripts/deploy-watchdog/` (watchdog.ts + state-parse.ts/test + plist template + README), gate it, PR it |

## What landed

The repo-side half of the Cowork `/rr`'s #1 recommendation: a notify-only
Vercel deploy watchdog. For `ronin-dojo-baseline` and `ronindojodesign`
(scope `brian-scotts-projects-4841d4d6`) it fetches the newest 3 production
deployments (`GET api.vercel.com/v6/deployments`) and, if the newest is
`ERROR` or `CANCELED`, pushes one ntfy.sh alert with project/state/commit/the
most recent `READY` deployment URL as a rollback candidate (a link, never an
automated action). READY/BUILDING/QUEUED exits quietly. `--verbose` prints
every project's state; `--dry-run` prints what would be sent and sends
nothing. Auth: `$VERCEL_TOKEN` first, else the Vercel CLI's `auth.json`
(`~/Library/Application Support/com.vercel.cli/auth.json`, or
`$XDG_CONFIG_HOME/com.vercel.cli/auth.json` if that's set) — token is read
into memory only, never printed/logged/committed. Notification delivery
reuses `scripts/notify/ntfy-send.sh` as-is via subprocess (not edited) so it
inherits the repo's existing `$NTFY_TOPIC` / `~/.config/ronin-alerts.env`
conventions — see `scripts/deploy-watchdog/README.md` "Reused conventions"
for full citations (`scripts/notify/ntfy-send.sh:1-92`,
`scripts/monitor/disk-pressure-monitor.sh:1-60`,
`scripts/monitor/docker-cache-monitor.sh:1-101`,
`docs/runbooks/dev-environment/ntfy-pushover-telegram.md`). Zero new
dependencies — Bun builtins only (`fetch`, `Bun.file`, `Bun.spawn`,
`node:os`/`node:path`). The launchd plist is a `.example` template, not
installed by this lane — operator loads it per the README.

## Files touched

| File | Change |
| --- | --- |
| `scripts/deploy-watchdog/watchdog.ts` | New — the watchdog CLI (auth resolution, Vercel API fetch, alert/notify, `--dry-run`/`--verbose`) |
| `scripts/deploy-watchdog/state-parse.ts` | New — pure `decideAlert()`/`extractCommitInfo()` decision logic, no I/O |
| `scripts/deploy-watchdog/state-parse.test.ts` | New — 13 fixture-driven unit tests (ERROR/READY/CANCELED newest, empty list, building-in-progress, plus edge cases) |
| `scripts/deploy-watchdog/com.ronin.deploy-watchdog.plist.example` | New — launchd template, 20-min `StartInterval`, `~/Library/Logs/ronin-alerts/` log paths, NOT installed |
| `scripts/deploy-watchdog/README.md` | New — install steps, what it does/never does, auth paths, reused-convention citations, Cowork phone-side-twin note |
| `docs/sprints/SESSION_0671.md` | This file — adopted, closed out |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun test scripts/deploy-watchdog` | `13 pass, 0 fail, 24 expect() calls` — exit 0 |
| `bun scripts/deploy-watchdog/watchdog.ts --dry-run` (real network read against api.vercel.com — the one verification run) | `[ronin-dojo-baseline] newest deployment is READY (alert=false)` / `[ronindojodesign] newest deployment is READY (alert=false)` — exit 0. Both prod projects healthy at run time; no notification sent (nothing to alert on) |
| `env -i PATH="$PATH" HOME=/tmp/fake-home-no-vercel-auth bun scripts/deploy-watchdog/watchdog.ts --dry-run` (auth-error path, no network reached) | `watchdog: no Vercel token found...` — exit 2, as specified |
| `bun build scripts/deploy-watchdog/watchdog.ts --target=bun --outdir=/tmp/...` (syntax check) | `Bundled 2 modules` — exit 0 |
| `plutil -lint scripts/deploy-watchdog/com.ronin.deploy-watchdog.plist.example` | `OK` |
| Format/lint | No `oxfmt`/`oxlint`/`prettier`/`tsc` binary present in this dependency-free worktree's `node_modules/.bin` — manual style pass done instead (2-space indent, consistent with the repo's existing `scripts/notify`/`scripts/monitor` `.sh` conventions); no formatter gate was skippable-but-skipped |

## Proposed ledger edits

- **launchd stack (AM, operator-run):** add `com.ronin.deploy-watchdog` alongside
  the existing `com.ronin.docker-cache-monitor` / `com.ronin.disk-pressure-monitor`
  agents documented in `docs/runbooks/dev-environment/ntfy-pushover-telegram.md`
  "Current Wiring in This Repo (SESSION_0334)" — that table should grow a third
  row once this is installed. Not edited by this lane (docs/** is out of scope
  beyond this session file); flagging for whoever next touches that runbook.
- **Cowork phone-side twin:** the Cowork `/rr` recommendation had a cloud-side
  half (poll from Cowork itself, independent of the dev machine being awake).
  Not built here — this session is the repo-side/dev-machine half only. Worth
  its own session if the operator wants coverage when the Mac is asleep.

## Open decisions / blockers

- `BLOCKED` deployment state is intentionally **not** alert-triggering in v1
  (spec said "ERROR or CANCELED"; `BLOCKED` left quiet, same bucket as READY —
  documented in a code comment in `state-parse.ts` and covered by a test).
  Revisit if `BLOCKED` shows up in practice as a real silent-failure mode.
- No `tsc`/`oxlint`/`oxfmt` binaries available in this dependency-free
  worktree to run the repo's normal typecheck/lint gates against these files
  — `bun build` (bundles + erases types, catches syntax errors) stood in.
  Recommend a `tsc --noEmit` pass on `scripts/deploy-watchdog/*.ts` the next
  time a lane with the full toolchain touches this directory.

## Residual for AM merge

- Operator installs the plist (`scripts/deploy-watchdog/README.md` → "Install")
  and confirms `~/.config/ronin-alerts.env` has a real `NTFY_TOPIC` — this
  lane did not touch that file (untracked, outside repo root, per convention).
- Operator decides whether to fold the "Proposed ledger edits" above into the
  ntfy runbook.

