#!/usr/bin/env bash
#
# auto-session-automerge.sh — hands-off autonomous driver ("laptop up, walk away").
#
# Runs N bow-in→bow-out sessions and AUTO-MERGES each green PR before the next,
# pinging your phone (ntfy via scripts/notify.sh) at every step. Because each session
# merges before the next branches from a fresh main, sessions never stack → none of the
# doc-collision conflicts the manual stacked flow hit.
#
# It STOPS and pings you (does NOT auto-merge) when a human decision is needed:
#   - the session touched the Prisma schema/migrations (review required)
#   - CI stays red after one automatic flake re-run
#   - a safety brake trips (dirty tree / no-op session)
#
# Usage: scripts/auto-session-automerge.sh [N]   (default 1)
# Prereqs: .claude/settings.local.json allowlist + .claude/notify.env (NTFY_TOPIC).
#
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

N="${1:-1}"
case "$N" in (''|*[!0-9]*) echo "N must be a positive integer" >&2; exit 2 ;; esac

notify() { scripts/notify.sh "$@" >/dev/null 2>&1 || true; }

remote="$(git remote get-url origin 2>/dev/null || true)"
case "$remote" in
  *ronin-dojo-baseline*) : ;;
  *) echo "✗ wrong repo ($remote)" >&2; exit 2 ;;
esac

git switch main >/dev/null 2>&1
git pull --ff-only origin main

read -r -d '' SESSION_PROMPT <<'PROMPT' || true
Bow in per docs/rituals/opening.md. Your task is the "Next session" block of the
highest-numbered docs/sprints/SESSION_NNNN.md, advancing docs/petey-plan-0305.md.
Act as Petey: orchestrate Cody (build) and Doug (verify). SKIP any operator-only
browser/device smoke. Implement only the next automatable code slice. Bow out per
docs/rituals/closing.md as a FULL close: SESSION file, wiki sweep, `bun run wiki:lint`
(MUST be 0 errors), typecheck/lint, `graphify update` BEFORE the commit (FS-0025).
COMMIT to the CURRENT branch with a conventional message. DO NOT push, DO NOT open a
PR — the wrapper handles that. Run the FS-0024 guard. If ANY gate fails, STOP and
leave the tree UNCOMMITTED.
PROMPT

for ((i = 1; i <= N; i++)); do
  last="$(find docs/sprints -name 'SESSION_*.md' | sed -E 's/.*SESSION_([0-9]+)\.md/\1/' | sort -n | tail -1)"
  next="$(printf '%04d' "$((10#$last + 1))")"
  branch="auto/session-${next}"

  echo ""; echo "════════ auto-merge session ${i}/${N} → ${branch} ════════"
  git branch -D "$branch" >/dev/null 2>&1 || true
  git switch -c "$branch" main

  claude -p "$SESSION_PROMPT" \
    --permission-mode acceptEdits \
    --allowedTools "Edit,Write,Read,Glob,Grep,TodoWrite,Agent"

  # --- safety brakes ---
  if [[ -n "$(git status --porcelain)" ]]; then
    notify "Loop stopped: dirty tree after ${branch} — session didn't close." high warning
    echo "✗ dirty tree after ${branch} — stopping." >&2; exit 1
  fi
  if [[ "$(git rev-parse HEAD)" == "$(git rev-parse main)" ]]; then
    notify "Loop stopped: ${branch} produced no commit (no-op)." high warning
    echo "✗ no new commit on ${branch} — stopping." >&2; exit 1
  fi

  git push -u origin "$branch" >/dev/null 2>&1
  pr_num="$(gh pr create --base main --head "$branch" --fill --title "auto: SESSION_${next}" 2>/dev/null | grep -oE '[0-9]+$' | tail -1)"

  # --- schema guard: never auto-merge a Prisma change ---
  if git diff --name-only main..HEAD | grep -qE '^apps/web/prisma/'; then
    notify "SCHEMA change in ${branch} (PR #${pr_num}) — opened for YOUR review, NOT auto-merged." high lock
    echo "⚠ schema change in ${branch} — PR #${pr_num} left open for review. Stopping." >&2
    exit 0
  fi

  notify "PR #${pr_num} opened (${branch}). Waiting on CI…" default hourglass

  # --- wait for CI; one automatic flake re-run, else stop for review ---
  if ! gh pr checks "$pr_num" --watch --interval 30 >/dev/null 2>&1; then
    run="$(gh run list --branch "$branch" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)"
    [ -n "$run" ] && gh run rerun "$run" --failed >/dev/null 2>&1 || true
    if ! gh pr checks "$pr_num" --watch --interval 30 >/dev/null 2>&1; then
      notify "CI RED on PR #${pr_num} (${branch}) after re-run — needs your review." high x
      echo "✗ CI failed on PR #${pr_num} after re-run — stopping." >&2; exit 1
    fi
  fi

  gh pr merge "$pr_num" --merge --delete-branch >/dev/null 2>&1
  notify "Merged PR #${pr_num} (${branch}) → main." default white_check_mark
  echo "✓ merged PR #${pr_num}"

  git switch main >/dev/null 2>&1
  git pull --ff-only origin main >/dev/null 2>&1
done

notify "Auto-merge batch done: ${N} session(s) merged to main." default tada
echo "✓ ${N} session(s) auto-merged."
