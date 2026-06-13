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
highest-numbered docs/sprints/SESSION_NNNN.md (if it names an epic plan doc, READ IT
FIRST and treat its locked decisions as binding). Act as Petey: orchestrate Cody
(build) and Doug (verify). SKIP any operator-only browser/device smoke. Implement only
the next automatable code slice. Bow out per docs/rituals/closing.md as a FULL close:
SESSION file, wiki sweep, `bun run wiki:lint` (MUST be 0 errors), `bun run typecheck`,
and the read-only Oxc gates `(cd apps/web && bun run lint:check && bun run format:check)`.
DO NOT run the root `bun run lint` or the `--fix`/write app scripts — those mutate files
(the FS-0017 `biome` PATH gap is moot post-Oxc migration, SESSION_0360). Run `graphify
update` BEFORE the commit (FS-0025). COMMIT to the CURRENT
branch with a conventional message. DO NOT push, DO NOT open a PR — the wrapper handles
that. Run the FS-0024 guard. If a REAL gate fails (typecheck, oxlint/oxfmt check,
wiki:lint, or focused tests), STOP and leave the tree UNCOMMITTED.

AUTONOMOUS SCOPE GUARD: do mechanical, reviewable slices only. DO NOT begin Prisma
schema/migration work (`apps/web/prisma/`), the `server/<entity>` flatten, or any
identity re-root in an autonomous session — those need a human grill + browser proof.
If the next slice requires them, STOP: write the SESSION file noting it is human-gated,
leave a "Next session" pointer, and do NOT commit code edits. When following the
`/app` migration recipe in APP_AND_SERVER_MIGRATION_MAP.md, scope every `sed` to the
moved dir + route-string sites — `s|/admin/<area>|/app/<area>|` also corrupts
`server/admin/<area>` import paths (SESSION_0374). At bow-out, set the next session's
pointer to the FOLLOWING wave in that map.
PROMPT

for ((i = 1; i <= N; i++)); do
  last="$(find docs/sprints -name 'SESSION_*.md' | sed -E 's/.*SESSION_([0-9]+)\.md/\1/' | sort -n | tail -1)"
  next="$(printf '%04d' "$((10#$last + 1))")"
  branch="auto/session-${next}"

  echo ""; echo "════════ auto-merge session ${i}/${N} → ${branch} ════════"
  git branch -D "$branch" >/dev/null 2>&1 || true
  git switch -c "$branch" main

  # --setting-sources loads .claude/settings.local.json so the headless agent's
  # Bash gate commands (bun/git/gh/graphify) are allowlisted — without it the
  # nested `claude -p` couldn't run them and the session aborted in ~15s
  # (SESSION_0374 diagnosis; CLI v2.1.170). If it still stalls on permissions,
  # add --dangerously-skip-permissions (codex-runner parity; FS-0024 still guards).
  claude -p "$SESSION_PROMPT" \
    --model "${AUTO_SESSION_MODEL:-opus}" \
    --setting-sources user,project,local \
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
