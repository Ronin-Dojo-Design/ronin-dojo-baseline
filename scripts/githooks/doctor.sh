#!/usr/bin/env bash
#
# doctor.sh — prove the push guards are actually live FROM THE ENVIRONMENT THEY GUARD.
#
# WHY THIS EXISTS
# ---------------
# Four consecutive failures say the same thing (FS-0035 → FS-0036 → FS-0037 → FS-0040):
# a guard that cannot prove it is live is not a guard.
#   FS-0035  the rule was prose, so it never ran.
#   FS-0036  the script ran but was a silent no-op on the default path.
#   FS-0037  the step existed but sat outside the executed read-path.
#   FS-0040  the hook was installed with a RELATIVE core.hooksPath, so it was absent from exactly
#            the worktrees it existed to guard — and git skips a missing hooksPath silently, exit 0.
#
# Every one of those passed silently while being broken. So this script's contract is the inverse:
# it FAILS LOUDLY with the one command that fixes each problem, and it must be run from a LANE
# WORKTREE, not just canonical — that is where the coverage hole lived.
#
#   bash scripts/githooks/doctor.sh
#
# Exit 0 = every layer verified live. Non-zero = at least one is not; the fix is printed.
# Network check (the ruleset) degrades to a warning when `gh` is absent or unauthenticated, so
# this stays usable offline — but it never reports a green it did not verify.

set -uo pipefail

REPO='Ronin-Dojo-Design/ronin-dojo-baseline'
fails=0
warns=0

ok()   { echo "  ✓ $1"; }
bad()  { echo "  ✗ $1"; shift; for l in "$@"; do echo "      $l"; done; fails=$((fails + 1)); }
warn() { echo "  ! $1"; shift; for l in "$@"; do echo "      $l"; done; warns=$((warns + 1)); }

common_dir="$(git rev-parse --git-common-dir 2>/dev/null || true)"
if [ -z "$common_dir" ]; then
  echo "githooks/doctor: not inside a git repo" >&2
  exit 2
fi
# The canonical checkout is the parent of the SHARED git dir — correct from a worktree too,
# where --show-toplevel would give the worktree root instead.
canonical="$(cd "$(dirname "$(cd "$common_dir" && pwd)")" && pwd)"
git_dir="$(cd "$(git rev-parse --git-dir)" && pwd)"
in_worktree='no'
[ "$git_dir" != "$(cd "$common_dir" && pwd)" ] && in_worktree='yes'

echo ""
echo "githooks doctor — $(pwd)"
echo "  context: $([ "$in_worktree" = yes ] && echo 'LANE WORKTREE' || echo 'canonical checkout')"
echo ""

# ---- 1. core.hooksPath set, and ABSOLUTE ------------------------------------------------------
hp="$(git config --get core.hooksPath 2>/dev/null || true)"
if [ -z "$hp" ]; then
  bad "core.hooksPath is unset — NO hooks run at all." \
      "fix:  bash $canonical/scripts/githooks/install.sh"
elif [ "${hp#/}" = "$hp" ]; then
  bad "core.hooksPath is RELATIVE ('$hp') — this is the FS-0040 bug." \
      "It resolves per-worktree, so lanes on a branch without that directory get NO hook," \
      "and git skips a missing hooksPath silently." \
      "fix:  bash $canonical/scripts/githooks/install.sh"
else
  ok "core.hooksPath = $hp (absolute)"
fi

# ---- 2. the hook is present where that path points, and executable ----------------------------
if [ -n "$hp" ]; then
  case "$hp" in /*) resolved="$hp" ;; *) resolved="$(pwd)/$hp" ;; esac
  if [ ! -d "$resolved" ]; then
    bad "hooks dir does not exist: $resolved" \
        "git treats a missing hooksPath as 'no hooks' — silently, exit 0." \
        "fix:  bash $canonical/scripts/githooks/install.sh"
  elif [ ! -x "$resolved/pre-push" ]; then
    bad "pre-push missing or not executable in $resolved" \
        "fix:  chmod +x $resolved/pre-push"
  else
    ok "pre-push present and executable"
    grep -q 'RULE B' "$resolved/pre-push" 2>/dev/null \
      && ok "pre-push carries RULE B (main is PR-only)" \
      || bad "pre-push predates RULE B — it blocks only non-fast-forward pushes to main," \
             "so a plain 'git push origin HEAD:main' from a lane still gets through." \
             "fix: update scripts/githooks/pre-push from main."
  fi
fi

# ---- 2b. the WL-P3-65 checkout guards ---------------------------------------------------------
# Prevention is the sourced shell guard (it sees the real $PWD; git has no pre-checkout hook).
# post-checkout is only the detection backstop for shells that never source the guard.
if [ -n "${hp:-}" ] && [ -x "$resolved/post-checkout" ] 2>/dev/null; then
  ok "post-checkout present (WL-P3-65 detection backstop)"
else
  bad "post-checkout missing from $resolved — a linked-worktree HEAD move would go unreported." \
      "fix: restore scripts/githooks/post-checkout from main, then chmod +x it."
fi

guard="$canonical/.claude/shell-guards/ronin-cwd-guard.sh"
if [ ! -f "$guard" ]; then
  bad "shell guard missing: $guard" "fix: restore it from main."
elif ! grep -q '_ronin_moves_head' "$guard" 2>/dev/null; then
  bad "shell guard predates the WL-P3-65 branch-mutation rule." \
      "A stale-cwd 'git checkout -b' can still hijack a sibling worktree's HEAD." \
      "fix: update .claude/shell-guards/ronin-cwd-guard.sh from main and re-source your shell."
else
  ok "shell guard file carries the WL-P3-65 branch-mutation rule"
  grep -q '_ronin_stash_is_foreign' "$guard" 2>/dev/null \
    && ok "shell guard carries the WL-P3-67 shared-stash rule" \
    || bad "shell guard predates the WL-P3-67 shared-stash rule." \
           "refs/stash is SHARED across worktrees — a 'stash pop' here can destroy a sibling" \
           "lane's uncommitted work, which is the one thing git cannot recover." \
           "fix: update .claude/shell-guards/ronin-cwd-guard.sh from main."
  # Check the ACTIVE git wrapper, not merely that the helper function exists — those differ.
  # Claude Code replays a SHELL SNAPSHOT captured at session start, so a guard updated
  # mid-session has its helpers present while the snapshot's OLDER git() still shadows the
  # wrapper. `type _ronin_moves_head` returns yes and prevention is nonetheless inactive.
  # That false green is exactly the FS-0036/FS-0040 shape, so it is checked properly here.
  if declare -f git >/dev/null 2>&1 && declare -f git | grep -q '_ronin_moves_head'; then
    ok "active git wrapper enforces the branch-mutation rule (this shell)"
  else
    warn "the git wrapper in THIS shell does NOT route through the rule — prevention is inactive here." \
         "The guard file is correct, so any NEW shell or session picks it up; a long-running agent" \
         "session replaying a stale snapshot does not. Check your own shell with:" \
         "    type git      # should NOT resolve to ~/.claude/shell-snapshots/..." \
         "Until then post-checkout still REPORTS the hijack (it cannot prevent it)."
  fi
fi

# ---- 3. nothing shadowing via the legacy hooks dir ---------------------------------------------
if [ -x "$(cd "$common_dir" && pwd)/hooks/pre-push" ]; then
  warn "a legacy .git/hooks/pre-push also exists." \
       "core.hooksPath wins, so it is inert — but delete it to avoid confusion."
else
  ok "no shadowing .git/hooks/pre-push"
fi

# ---- 4. the SERVER ruleset — the only layer a local mistake cannot defeat ----------------------
if ! command -v gh >/dev/null 2>&1; then
  warn "gh not on PATH — cannot verify the server ruleset (the layer that actually enforces)."
elif ! gh auth status >/dev/null 2>&1; then
  warn "gh not authenticated — cannot verify the server ruleset."
else
  rules_json="$(gh api "repos/$REPO/rules/branches/main" 2>/dev/null || true)"
  if [ -z "$rules_json" ]; then
    warn "could not read branch rules for main (offline, or insufficient token scope)."
  elif printf '%s' "$rules_json" | grep -q '"type":"pull_request"'; then
    ok "server ruleset active on main: pull_request required"
    printf '%s' "$rules_json" | grep -q '"type":"non_fast_forward"' \
      && ok "server ruleset blocks force-push to main" \
      || warn "no non_fast_forward rule — main can still be force-pushed."
  else
    bad "main is NOT PR-protected on the server — direct pushes are possible from any clone." \
        "This is the only control a missing/So-stale local hook cannot defeat." \
        "fix: see ADR 0053 (ruleset 'main-pr-only')."
  fi
fi

echo ""
if [ "$fails" -gt 0 ]; then
  echo "githooks doctor: $fails FAILED, $warns warning(s) — the guard is NOT fully live."
  echo ""
  exit 1
fi
echo "githooks doctor: all checks passed${warns:+ ($warns warning(s))}."
echo ""
exit 0
