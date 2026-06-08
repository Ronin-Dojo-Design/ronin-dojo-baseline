#!/usr/bin/env bash
#
# ntfy-send.sh — shared ntfy.sh notification sender for ronin-dojo-app automation.
#
# Topic resolution order:
#   1. $NTFY_TOPIC env var
#   2. ~/.config/ronin-alerts.env (KEY=value file, sourced; untracked — never committed)
#
# If no topic is found, logs to stderr and exits 0 (graceful no-op) so launchd
# jobs don't error-spam when the operator hasn't configured a topic yet.
#
# Usage:
#   ntfy-send.sh [options] "message body"
#
# Options:
#   -t, --title   <title>     Notification title (default: "Ronin Alert")
#   -p, --priority <n>        Priority: 1=min 2=low 3=default 4=high 5=urgent (default: 4)
#   -g, --tags    <tags>      Comma-separated ntfy emoji shortcodes (default: robot)
#   --dry-run                 Print what would be sent; do not curl
#
# Examples:
#   ntfy-send.sh --title "Deploy done" --tags white_check_mark "Build passed on main"
#   ntfy-send.sh --priority 5 "Disk critically full"
#
set -uo pipefail

# ── Config resolution ──────────────────────────────────────────────────────────
RONIN_ALERTS_ENV="${HOME}/.config/ronin-alerts.env"
if [ -z "${NTFY_TOPIC:-}" ] && [ -f "$RONIN_ALERTS_ENV" ]; then
  # shellcheck disable=SC1090
  . "$RONIN_ALERTS_ENV"
fi

topic="${NTFY_TOPIC:-}"
if [ -z "$topic" ]; then
  echo "ntfy-send: NTFY_TOPIC not set — configure it in ${RONIN_ALERTS_ENV} (skipping, not an error)" >&2
  exit 0
fi

# ── Argument parsing ───────────────────────────────────────────────────────────
title="Ronin Alert"
priority="4"
tags="robot"
dry_run=0
message=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--title)
      title="$2"; shift 2 ;;
    -p|--priority)
      priority="$2"; shift 2 ;;
    -g|--tags)
      tags="$2"; shift 2 ;;
    --dry-run)
      dry_run=1; shift ;;
    --)
      shift; message="$*"; break ;;
    -*)
      echo "ntfy-send: unknown flag $1" >&2; exit 1 ;;
    *)
      message="$1"; shift ;;
  esac
done

if [ -z "$message" ]; then
  echo "ntfy-send: message body is required" >&2
  exit 1
fi

# ── Send or dry-run ────────────────────────────────────────────────────────────
if [ "$dry_run" -eq 1 ]; then
  echo "ntfy-send [dry-run]:"
  echo "  topic    : ${topic}"
  echo "  title    : ${title}"
  echo "  priority : ${priority}"
  echo "  tags     : ${tags}"
  echo "  message  : ${message}"
  exit 0
fi

if curl -fsS --max-time 15 \
    -H "Title: ${title}" \
    -H "Priority: ${priority}" \
    -H "Tags: ${tags}" \
    -d "${message}" \
    "https://ntfy.sh/${topic}" >/dev/null 2>&1; then
  echo "ntfy-send: sent → ntfy.sh/${topic} [${title}]"
else
  echo "ntfy-send: send failed (non-fatal — check network or topic)" >&2
fi
exit 0
