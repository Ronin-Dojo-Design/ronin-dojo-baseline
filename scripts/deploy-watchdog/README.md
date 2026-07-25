# deploy-watchdog

A Vercel deploy watchdog: checks the newest **production** deployment for
`ronin-dojo-baseline` and `ronindojodesign`, and pushes a phone notification if
either is `ERROR` or `CANCELED`. Built to catch a silent red build — the kind
that ships broken and nobody notices until a customer does.

**NOTIFY-ONLY.** This tool never rolls back a deployment, never cancels
anything, never mutates Vercel state, and never mutates repo state. Its only
side effect is an outbound ntfy.sh push. It reads; it does not act.

## What it does

1. For each project in `PROJECTS` (`watchdog.ts`), fetches the last 3
   production deployments from `api.vercel.com` (`GET /v6/deployments`,
   `target=production`).
2. Hands the list to the pure decision function in `state-parse.ts`:
   - Newest is `ERROR` or `CANCELED` → **alert**.
   - Newest is `BUILDING`/`QUEUED`/`INITIALIZING` → in progress, quiet.
   - Newest is `READY` (or anything else not `ERROR`/`CANCELED`) → quiet.
   - No deployments found → quiet (distinct reason, for `--verbose`).
3. On alert, sends one push via `scripts/notify/ntfy-send.sh` — the project
   name, the state, the commit sha/message if the deployment carries git
   metadata, and the most recent `READY` deployment URL in the fetched window
   as a **rollback candidate** (a link, not an action — nothing is rolled back
   automatically).

## What it never does

- Never calls any Vercel API that mutates state (no rollback, no cancel, no
  redeploy, no promote).
- Never writes to the repo, the DB, or any ledger.
- Never prints, logs, or transmits the Vercel token. Auth is read once into
  memory per run and used only as a bearer header.

## Auth

Checked in this order, first match wins:

1. `$VERCEL_TOKEN` env var.
2. The Vercel CLI's own `auth.json`, read-only, `token` field only:
   - Default macOS path: `~/Library/Application Support/com.vercel.cli/auth.json`
   - If `$XDG_CONFIG_HOME` is set (the CLI's `xdg-app-paths` dependency honors
     it, and some machines set it globally): `$XDG_CONFIG_HOME/com.vercel.cli/auth.json`

If neither resolves to a token, `watchdog.ts` exits `2` with a clear message
and never attempts a network call.

## Usage

```bash
bun scripts/deploy-watchdog/watchdog.ts                # normal run
bun scripts/deploy-watchdog/watchdog.ts --verbose       # print every project's resolved state
bun scripts/deploy-watchdog/watchdog.ts --dry-run        # print what WOULD be sent; send nothing
```

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Healthy (nothing to notify), or an alert was raised and the ntfy send was attempted. |
| `2` | Auth/config error — no token found, or the Vercel API rejected the token (401/403). |

## Install (operator does this — not run automatically by any lane)

1. Confirm the notify stack is configured (SESSION_0334 convention — see
   `docs/runbooks/dev-environment/ntfy-pushover-telegram.md`):
   ```bash
   cp scripts/notify/ronin-alerts.env.example ~/.config/ronin-alerts.env
   # edit ~/.config/ronin-alerts.env, set a real NTFY_TOPIC, then:
   chmod 600 ~/.config/ronin-alerts.env
   ```
2. Copy the launchd template and fill in the placeholders (`__BUN_PATH__` from
   `which bun`, `__REPO_PATH__` = your canonical checkout, `__HOME__` = your
   home dir — macOS plists don't expand `~`):
   ```bash
   cp scripts/deploy-watchdog/com.ronin.deploy-watchdog.plist.example \
      ~/Library/LaunchAgents/com.ronin.deploy-watchdog.plist
   # edit the placeholders in the copy
   mkdir -p ~/Library/Logs/ronin-alerts
   ```
3. Load it:
   ```bash
   uid=$(id -u)
   launchctl bootstrap "gui/${uid}" ~/Library/LaunchAgents/com.ronin.deploy-watchdog.plist
   ```
4. Verify: `bun scripts/deploy-watchdog/watchdog.ts --dry-run --verbose`.

## Reused conventions (cited, not duplicated)

- `scripts/notify/ntfy-send.sh:1-92` — the shared ntfy.sh sender. `watchdog.ts`
  shells out to this script as-is (read-only subprocess call; the file is
  never edited by this lane) rather than reimplementing topic resolution or
  the `curl` call, so it inherits the exact same `$NTFY_TOPIC` /
  `~/.config/ronin-alerts.env` resolution, `--dry-run` semantics, and
  graceful no-op-if-unconfigured behavior as every other alert in the repo.
- `scripts/monitor/disk-pressure-monitor.sh:1-60` and
  `scripts/monitor/docker-cache-monitor.sh:1-101` — the existing launchd-driven
  monitor pattern (`SCRIPT_DIR`-relative call into `ntfy-send.sh`, a
  `--dry-run` flag, real exit codes, non-fatal notification failures). This
  watchdog follows the same shape.
- `docs/runbooks/dev-environment/ntfy-pushover-telegram.md` — the canonical
  ntfy runbook (topic setup, launchd `bootstrap` invocation, log path
  `~/Library/Logs/ronin-alerts/`). This README's install steps mirror its
  "Operator onboarding checklist" section.

## Cowork phone-side twin

This is the **repo-side** half of the Cowork `/rr`'s #1 recommendation (a
deploy watchdog that would have caught the prior day's silent red build). It
runs from the dev machine via launchd (pull-based, polling every 20 minutes).
The phone-side twin — a Cowork-scheduled agent that checks the same Vercel
API from the cloud side, independent of whether the dev machine is awake — is
a separate, not-yet-built complement. This script does not depend on it and
does not require it to be useful on its own; see `SESSION_0671.md` → "Proposed
ledger edits" for the pointer.
