#!/usr/bin/env bash
#
# auto-session.sh — run N autonomous bow-in → bow-out sessions back-to-back,
# each as its own reviewable PR (stacked), advancing docs/petey-plan-0305.md.
#
# WHY THIS SHAPE: this repo is a file-based state machine. Bow-in reads the
# highest-numbered docs/sprints/SESSION_NNNN.md; bow-out writes the next one.
# So each session is a COLD `claude -p` process — context stays fresh because
# the handoff lives in the SESSION files + git, not in a conversation.
#
# Sessions chain on STACKED branches (session k+1 branches from session k's
# branch) so they can run back-to-back without waiting for you to merge — yet
# each still produces one focused PR. Merge the PRs bottom-up into main when
# you've reviewed them.
#
# Usage:
#   scripts/auto-session.sh [N]      # N = how many sessions this run (default 1)
#
# PREREQUISITE (one-time): the headless agent can't answer permission prompts.
# Either pre-allow bun/git/gh/graphify in .claude/settings.json (recommended —
# the FS-0024 shell-guard still protects you), or add --dangerously-skip-permissions
# below (NOT recommended while pushing branches). See the runbook:
#   docs/runbooks/dev-environment/autonomous-sessions.md
#
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

N="${1:-1}"
case "$N" in (''|*[!0-9]*) echo "N must be a positive integer" >&2; exit 2 ;; esac

# Guard: never run from the read-only dirstarter_template (FS-0024).
remote="$(git remote get-url origin 2>/dev/null || true)"
case "$remote" in
  *ronin-dojo-baseline*) : ;;
  *) echo "✗ wrong repo ($remote) — run from ronin-dojo-app." >&2; exit 2 ;;
esac

git switch main >/dev/null 2>&1
git pull --ff-only origin main

read -r -d '' SESSION_PROMPT <<'PROMPT' || true
Bow in per docs/rituals/opening.md. Your task is the "Next session" block of the
highest-numbered docs/sprints/SESSION_NNNN.md, advancing docs/petey-plan-0305.md.
Act as Petey: orchestrate Cody (build) and Doug (verify); use subagents only for
genuinely disjoint work. SKIP any operator-only browser/device smoke — flag it as
operator-side, do NOT block on it. Implement only the next automatable code slice.

Then bow out per docs/rituals/closing.md as a FULL close: fill the SESSION file,
sweep wiki index/log + component inventory, run `bun run wiki:lint` (it MUST report
0 errors), run typecheck/lint, write the hostile close review, and run
`graphify update` BEFORE the commit (FS-0025 single-push order).

IMPORTANT OVERRIDE: COMMIT your close to the CURRENT branch with a conventional
message, but DO NOT push and DO NOT open a PR — the wrapper script handles git
push + PR. Run the FS-0024 pwd/remote guard before committing. If ANY gate fails
(typecheck/lint/wiki-lint/tests), STOP and leave the working tree UNCOMMITTED.
PROMPT

base_branch="main"

for ((i = 1; i <= N; i++)); do
  last="$(find docs/sprints -name 'SESSION_*.md' | sed -E 's/.*SESSION_([0-9]+)\.md/\1/' | sort -n | tail -1)"
  next="$(printf '%04d' "$((10#$last + 1))")"
  branch="auto/session-${next}"

  echo ""
  echo "════════ session ${i}/${N} → ${branch} (stacked on ${base_branch}) ════════"
  git switch -c "$branch" "$base_branch"

  claude -p "$SESSION_PROMPT" \
    --permission-mode acceptEdits \
    --allowedTools "Bash,Edit,Write,Read,Glob,Grep,TodoWrite,Agent"

  # Brake 1: a clean close leaves no uncommitted changes.
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "✗ dirty tree after ${branch} — session did not close cleanly. Stopping." >&2
    exit 1
  fi
  # Brake 2: the session must have produced exactly one new commit.
  if [[ "$(git rev-parse HEAD)" == "$(git rev-parse "$base_branch")" ]]; then
    echo "✗ no new commit on ${branch} — session produced nothing. Stopping." >&2
    exit 1
  fi

  git push -u origin "$branch"
  gh pr create --base "$base_branch" --head "$branch" --fill \
    --title "auto: SESSION_${next} — lineage epic (stacked on ${base_branch})"

  base_branch="$branch"   # next session stacks on this one
done

echo ""
echo "✓ ${N} session(s) complete. Review the stacked PRs and merge BOTTOM-UP into main:"
echo "  the oldest PR (base main) first; GitHub auto-retargets the next onto main as you go."
