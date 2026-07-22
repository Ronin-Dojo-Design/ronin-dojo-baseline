#!/usr/bin/env bash
#
# canonical-claim.sh — Canonical-occupancy guard (FS-0035; mechanizes FS-0034 / LR 0018).
#
# WHY: worktree isolation for parallel lanes was documented in three places (merge-wave.md,
# fan-out-session-recipe.md, LR 0018) but never ENFORCED — so a second interactive session
# keeps squatting the canonical checkout while a first session has uncommitted work there,
# stranding/clobbering it (FS-0034 @ SESSION_0593, recurred @ SESSION_0610/0611). This puts the
# rule in the bow-in READ-PATH: a check the ritual RUNS, not a doc it hopes you read.
#
# OCCUPANCY SIGNAL (primary, stateless): the canonical `git status` shows an uncommitted
#   docs/sprints/SESSION_MMMM.md whose number is NOT yours → another live session is mid-work
#   here. That is exactly the strand hazard (two sessions, simultaneous uncommitted work).
# CLAIM FILE (secondary): .canonical-session (gitignored) closes the bow-in window BEFORE a
#   session has written its SESSION file. Stale after CLAIM_TTL_HOURS (a crashed session that
#   never released) → reclaimable.
#
# Usage:
#   scripts/canonical-claim.sh check   [--session NNNN]
#   scripts/canonical-claim.sh claim   --session NNNN
#   scripts/canonical-claim.sh release --session NNNN [--force]
#
# Exit codes: 0 = free / claimed / released ; 3 = OCCUPIED (isolate into a worktree) ; 2 = usage.
#
set -euo pipefail

CLAIM_TTL_HOURS="${CANONICAL_CLAIM_TTL_HOURS:-12}"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then echo "canonical-claim: not inside a git repo" >&2; exit 2; fi
CLAIM_FILE="$ROOT/.canonical-session"

cmd="${1:-}"; shift || true
SESSION=""; FORCE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --session) SESSION="${2:-}"; shift 2 ;;
    --force)   FORCE=1; shift ;;
    *) echo "canonical-claim: unknown arg '$1'" >&2; exit 2 ;;
  esac
done

# Session numbers with an UNCOMMITTED SESSION file in canonical, excluding $SESSION.
other_uncommitted_sessions() {
  git -C "$ROOT" status --porcelain -- 'docs/sprints/SESSION_*.md' 2>/dev/null \
    | grep -oE 'SESSION_[0-9]{4}\.md' | grep -oE '[0-9]{4}' | sort -u \
    | { if [ -n "$SESSION" ]; then grep -vx "$SESSION" || true; else cat; fi; }
}

claim_is_stale() {  # 0 = stale/absent, 1 = live
  [ -f "$CLAIM_FILE" ] || return 0
  local epoch now age_h
  epoch="$(grep -oE '^claimed_epoch=[0-9]+' "$CLAIM_FILE" 2>/dev/null | cut -d= -f2 || true)"
  [ -n "$epoch" ] || return 1                      # no epoch → treat as live (conservative)
  now="$(date -u +%s)"; age_h=$(( (now - epoch) / 3600 ))
  [ "$age_h" -ge "$CLAIM_TTL_HOURS" ]
}

claim_session() { grep -oE '^session=[0-9]{4}' "$CLAIM_FILE" 2>/dev/null | cut -d= -f2 || true; }

report_occupied() {  # $1 = who, $2 = source
  echo "⛔ CANONICAL OCCUPIED — held by SESSION_$1 ($2)."
  echo "   Do NOT work in the canonical checkout. Isolate this session into its own worktree:"
  echo "     git worktree add ../ronin-${SESSION:-NNNN} -b session-${SESSION:-NNNN}-<lane> main"
  echo "     bash .claude/skills/worktree-setup/SKILL.md   # or /worktree-setup"
  echo "   Run the whole session there; merge-sweep into your branch; ff-to-main behind the merge lock at push."
  echo "   (FS-0035 / FS-0034 / LR 0018 — never share the canonical tree; never 'git add -A' in it.)"
}

case "$cmd" in
  check)
    occ_git="$(other_uncommitted_sessions | head -1)"
    if [ -n "$occ_git" ]; then report_occupied "$occ_git" "uncommitted SESSION file in canonical"; exit 3; fi
    if [ -f "$CLAIM_FILE" ] && ! claim_is_stale; then
      held="$(claim_session)"
      if [ -n "$held" ] && [ "$held" != "${SESSION:-}" ]; then
        report_occupied "$held" "active .canonical-session claim"; exit 3
      fi
    fi
    echo "✅ canonical is free${SESSION:+ for SESSION_$SESSION}."
    exit 0
    ;;
  claim)
    [ -n "$SESSION" ] || { echo "canonical-claim: claim needs --session NNNN" >&2; exit 2; }
    occ_git="$(other_uncommitted_sessions | head -1)"
    if [ -n "$occ_git" ]; then report_occupied "$occ_git" "uncommitted SESSION file in canonical"; exit 3; fi
    if [ -f "$CLAIM_FILE" ] && ! claim_is_stale; then
      held="$(claim_session)"
      if [ -n "$held" ] && [ "$held" != "$SESSION" ]; then
        report_occupied "$held" "active .canonical-session claim"; exit 3
      fi
    fi
    { echo "session=$SESSION"
      echo "claimed=$(date -u +%FT%TZ)"
      echo "claimed_epoch=$(date -u +%s)"
      echo "host=$(hostname)"
    } > "$CLAIM_FILE"
    echo "✅ SESSION_$SESSION claimed the canonical checkout ($CLAIM_FILE)."
    exit 0
    ;;
  release)
    [ -n "$SESSION" ] || { echo "canonical-claim: release needs --session NNNN" >&2; exit 2; }
    if [ ! -f "$CLAIM_FILE" ]; then echo "canonical-claim: no claim to release (noop)."; exit 0; fi
    held="$(claim_session)"
    if [ "$held" = "$SESSION" ] || [ "$FORCE" = 1 ]; then
      rm -f "$CLAIM_FILE"; echo "✅ SESSION_$SESSION released the canonical claim."
    else
      echo "canonical-claim: claim held by SESSION_$held, not $SESSION — not releasing (use --force to override)." >&2
    fi
    exit 0
    ;;
  *)
    echo "usage: canonical-claim.sh check|claim|release [--session NNNN] [--force]" >&2
    exit 2
    ;;
esac
