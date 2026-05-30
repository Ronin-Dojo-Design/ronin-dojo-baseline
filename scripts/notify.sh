#!/usr/bin/env bash
#
# notify.sh — push a phone notification via ntfy.sh.
#
# Reads the topic from $NTFY_TOPIC or .claude/notify.env (gitignored). Best-effort:
# never fails the caller (a missed notification must not break the driver).
#
# Usage: scripts/notify.sh "message" [title] [priority] [tags]
#   priority: max | high | default | low | min
#   tags:     comma-separated ntfy emoji shortcodes (e.g. white_check_mark,robot)
#
set -uo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ -z "${NTFY_TOPIC:-}" ] && [ -f "$root/.claude/notify.env" ]; then
  # shellcheck disable=SC1091
  . "$root/.claude/notify.env"
fi

topic="${NTFY_TOPIC:-}"
if [ -z "$topic" ]; then
  echo "notify: NTFY_TOPIC unset — set it in .claude/notify.env (skipping)" >&2
  exit 0
fi

msg="${1:-(no message)}"
title="${2:-Ronin Dojo}"
prio="${3:-default}"
tags="${4:-robot}"

if curl -fsS --max-time 10 \
  -H "Title: ${title}" \
  -H "Priority: ${prio}" \
  -H "Tags: ${tags}" \
  -d "${msg}" \
  "https://ntfy.sh/${topic}" >/dev/null 2>&1; then
  echo "notify: sent → ntfy.sh/${topic}"
else
  echo "notify: send failed (non-fatal)" >&2
fi
exit 0
