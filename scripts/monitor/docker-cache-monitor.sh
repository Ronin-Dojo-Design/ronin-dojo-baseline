#!/usr/bin/env bash
#
# docker-cache-monitor.sh — alert when Docker build-cache exceeds a threshold.
#
# Runs `docker system df` and computes total cache size in GB. If it exceeds
# $DOCKER_CACHE_THRESHOLD_GB (default 30) sends an ntfy notification via
# scripts/notify/ntfy-send.sh. If Docker daemon is not running, logs and exits 0.
#
# Usage:
#   docker-cache-monitor.sh [--dry-run]
#
# Environment:
#   DOCKER_CACHE_THRESHOLD_GB   Threshold in GB above which to alert (default: 30)
#
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NTFY_SEND="${SCRIPT_DIR}/../notify/ntfy-send.sh"

THRESHOLD="${DOCKER_CACHE_THRESHOLD_GB:-30}"
dry_run=0
[[ "${1:-}" == "--dry-run" ]] && dry_run=1

# ── Check Docker availability ──────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "docker-cache-monitor: docker not in PATH — skipping" >&2
  exit 0
fi

# Try to contact the daemon; if it's not running, exit gracefully.
if ! docker info &>/dev/null 2>&1; then
  echo "docker-cache-monitor: Docker daemon not running — skipping" >&2
  exit 0
fi

# ── Parse docker system df ─────────────────────────────────────────────────────
# Grab the "Build Cache" row. Output format (--format is not reliable across
# versions for build cache), so we parse the human-readable table.
# Example line: "Build Cache    143      0B      42.3GB      0B"
df_output="$(docker system df 2>/dev/null)"

# Extract the total size from the Build Cache line.
# The numeric columns are: Count, Active, Size, Reclaimable.
# We use the "Size" (3rd numeric) column as our measure.
cache_line="$(echo "$df_output" | grep -i "Build Cache" || true)"

if [ -z "$cache_line" ]; then
  echo "docker-cache-monitor: could not parse Build Cache line from docker system df" >&2
  if [ "$dry_run" -eq 1 ]; then
    echo "docker-cache-monitor [dry-run]: cache_gb=0 threshold=${THRESHOLD}GB — no alert (no data)"
  fi
  exit 0
fi

# Parse the size field (third whitespace-separated token after the label).
# "Build Cache    143      0B      42.3GB      0B"
# After stripping "Build Cache", columns: Count ActiveSize Size Reclaimable
size_raw="$(echo "$cache_line" | awk '{print $3}')"

# Convert to GB (handle B, kB, MB, GB, TB)
to_gb() {
  local raw="$1"
  local num unit
  # Strip trailing B variants: extract number and unit
  num="$(echo "$raw" | sed 's/[A-Za-z]*$//')"
  unit="$(echo "$raw" | sed 's/[0-9.]*//g' | tr '[:upper:]' '[:lower:]')"
  case "$unit" in
    tb)   echo "$num * 1024"         | bc -l ;;
    gb)   echo "$num * 1"            | bc -l ;;
    mb)   echo "$num / 1024"         | bc -l ;;
    kb)   echo "$num / (1024*1024)"  | bc -l ;;
    b|'') echo "$num / (1024^3)"     | bc -l ;;
    *)    echo "0" ;;
  esac
}

cache_gb="$(to_gb "$size_raw")"
# Round to 1 decimal for display
cache_gb_display="$(printf '%.1f' "$cache_gb")"

if [ "$dry_run" -eq 1 ]; then
  echo "docker-cache-monitor [dry-run]: cache_gb=${cache_gb_display} threshold=${THRESHOLD}GB"
  if (( $(echo "$cache_gb > $THRESHOLD" | bc -l) )); then
    echo "docker-cache-monitor [dry-run]: WOULD alert — cache exceeds threshold"
  else
    echo "docker-cache-monitor [dry-run]: OK — no alert needed"
  fi
  exit 0
fi

# ── Alert if threshold exceeded ────────────────────────────────────────────────
if (( $(echo "$cache_gb > $THRESHOLD" | bc -l) )); then
  echo "docker-cache-monitor: cache ${cache_gb_display}GB > ${THRESHOLD}GB — sending alert"
  "${NTFY_SEND}" \
    --title "Docker cache ${cache_gb_display}GB > ${THRESHOLD}GB" \
    --priority 4 \
    --tags "whale,warning" \
    "Docker build cache is ${cache_gb_display}GB, exceeding the ${THRESHOLD}GB threshold. Run: docker system prune --filter until=24h"
else
  echo "docker-cache-monitor: cache ${cache_gb_display}GB — OK (threshold ${THRESHOLD}GB)"
fi
