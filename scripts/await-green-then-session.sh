#!/usr/bin/env bash
#
# await-green-then-session.sh — wait until main's CI + Playwright E2E are GREEN,
# then launch N autonomous bow-in→bow-out sessions (scripts/auto-session.sh).
#
# WHY: an autonomous run stacks on main; launching on a red base compounds errors.
# This gates the launch on a verified-green main, so "the second CI is good" the
# overnight run starts on its own — no human in the loop.
#
# Usage:
#   scripts/await-green-then-session.sh [N]          # N sessions (default 1)
#   AWAIT_TIMEOUT_MIN=40 scripts/await-green-then-session.sh 5
#
# Safe to run under caffeinate for an unattended overnight run:
#   caffeinate -i scripts/await-green-then-session.sh 5
#
# ⚠️ RUN FROM YOUR OWN TERMINAL — not nested inside an active Claude Code session.
# A `claude -p` spawned from within a Claude Code Bash sandbox has no oauth creds and
# dies with `401 Invalid authentication credentials` (observed SESSION_0453). The cold
# `claude -p` needs the terminal where `claude` is logged in. Verify with `claude --version`
# and that you're logged in, then launch this from that shell.
#
# It launches auto-session.sh (PR gate — nothing merges to main unattended). For
# the hands-off auto-merge peer, swap the launch line for auto-session-automerge.sh.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

N="${1:-1}"
case "$N" in (''|*[!0-9]*) echo "N must be a positive integer" >&2; exit 2 ;; esac

# FS-0024 guard — never operate from the read-only dirstarter_template.
remote="$(git remote get-url origin 2>/dev/null || true)"
case "$remote" in
  *ronin-dojo-baseline*) : ;;
  *) echo "✗ wrong repo ($remote) — run from ronin-dojo-app." >&2; exit 2 ;;
esac

TIMEOUT_MIN="${AWAIT_TIMEOUT_MIN:-40}"
deadline=$(( $(date +%s) + TIMEOUT_MIN * 60 ))

echo "⏳ awaiting GREEN on main (CI + Playwright E2E), timeout ${TIMEOUT_MIN}m…"
while :; do
  # Conclusion of the most recent CI + Playwright E2E runs on main.
  ci=$(gh run list --branch main --workflow CI --limit 1 --json status,conclusion \
        -q '.[0].status+"/"+(.[0].conclusion//"-")' 2>/dev/null || echo "?/?")
  pw=$(gh run list --branch main --workflow "Playwright E2E" --limit 1 --json status,conclusion \
        -q '.[0].status+"/"+(.[0].conclusion//"-")' 2>/dev/null || echo "?/?")
  echo "  CI=$ci  PW=$pw"

  case "$ci $pw" in
    *failure*|*cancelled*|*timed_out*)
      echo "✗ main is RED ($ci / $pw) — refusing to launch on a red base." >&2
      exit 1 ;;
  esac
  if [ "$ci" = "completed/success" ] && [ "$pw" = "completed/success" ]; then
    echo "✓ main GREEN — launching $N autonomous session(s)."
    break
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "✗ timed out after ${TIMEOUT_MIN}m waiting for green." >&2
    exit 1
  fi
  sleep 30
done

exec scripts/auto-session.sh "$N"
