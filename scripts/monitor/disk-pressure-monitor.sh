#!/usr/bin/env bash
#
# disk-pressure-monitor.sh — alert when free disk space on / drops below threshold.
#
# Uses `df -g /` (macOS) to check free gigabytes on the main volume. If free space
# falls below $DISK_FREE_MIN_GB (default 15), sends an ntfy notification.
#
# Usage:
#   disk-pressure-monitor.sh [--dry-run]
#
# Environment:
#   DISK_FREE_MIN_GB   Alert when free GB drops below this (default: 15)
#
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NTFY_SEND="${SCRIPT_DIR}/../notify/ntfy-send.sh"

THRESHOLD="${DISK_FREE_MIN_GB:-15}"
dry_run=0
[[ "${1:-}" == "--dry-run" ]] && dry_run=1

# ── Check free disk space on main volume ──────────────────────────────────────
# `df -g /` on macOS prints gigabytes. Columns: Filesystem 512-blocks Used Avail ...
# Using -g (1G blocks) so "Available" is the free GB directly.
df_output="$(df -g / 2>/dev/null)"

# Extract the "Available" column (4th field) from the data line (2nd line of output).
free_gb="$(echo "$df_output" | awk 'NR==2 {print $4}')"

if [ -z "$free_gb" ]; then
  echo "disk-pressure-monitor: could not parse df output" >&2
  exit 0
fi

# Also grab total for context
total_gb="$(echo "$df_output" | awk 'NR==2 {print $2}')"
used_gb="$(echo "$df_output" | awk 'NR==2 {print $3}')"

if [ "$dry_run" -eq 1 ]; then
  echo "disk-pressure-monitor [dry-run]: free=${free_gb}GB total=${total_gb}GB used=${used_gb}GB threshold=${THRESHOLD}GB"
  if (( free_gb < THRESHOLD )); then
    echo "disk-pressure-monitor [dry-run]: WOULD alert — free space below threshold"
  else
    echo "disk-pressure-monitor [dry-run]: OK — no alert needed"
  fi
  exit 0
fi

# ── Alert if below threshold ───────────────────────────────────────────────────
if (( free_gb < THRESHOLD )); then
  echo "disk-pressure-monitor: free ${free_gb}GB < ${THRESHOLD}GB — sending alert"
  "${NTFY_SEND}" \
    --title "Disk pressure: only ${free_gb}GB free" \
    --priority 4 \
    --tags "warning,cd" \
    "Main volume has ${free_gb}GB free of ${total_gb}GB total. Free up space to avoid build failures. Try: brew cleanup, docker system prune, rm -rf ~/Library/Caches."
else
  echo "disk-pressure-monitor: free ${free_gb}GB — OK (threshold ${THRESHOLD}GB)"
fi
