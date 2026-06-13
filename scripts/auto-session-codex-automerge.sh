#!/usr/bin/env bash
#
# auto-session-codex-automerge.sh — Codex CLI auto-merge driver for the first
# three safe BBL /app migration waves after SESSION_0374.
#
# Default run:
#   scripts/auto-session-codex-automerge.sh
#
# This is a LOCAL/SSH driver. It launches fresh `codex exec` processes, opens a
# PR for each green session, auto-merges, refreshes main, and then starts the
# next wave. Codex Cloud should use the cloud handoff doc instead of nesting a
# Codex CLI inside a Codex task.
#
set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"
command -v codex >/dev/null || {
  echo "✗ codex not on PATH (npm i -g @openai/codex --prefix ~/.local)" >&2
  exit 2
}
command -v gh >/dev/null || {
  echo "✗ gh not on PATH" >&2
  exit 2
}

cd "$(git rev-parse --show-toplevel)"
ROOT="$(pwd)"

N="${1:-3}"
case "$N" in
  (''|*[!0-9]*) echo "N must be a positive integer" >&2; exit 2 ;;
esac
if (( N < 1 )); then
  echo "N must be a positive integer" >&2
  exit 2
fi
if (( N > 3 )) && [[ "${CODEX_AUTO_SESSION_ALLOW_MORE:-}" != "1" ]]; then
  echo "✗ this driver is capped at the first 3 safe waves; set CODEX_AUTO_SESSION_ALLOW_MORE=1 to override" >&2
  exit 2
fi

notify() { scripts/notify.sh "$@" >/dev/null 2>&1 || true; }

remote="$(git remote get-url origin 2>/dev/null || true)"
case "$remote" in
  *ronin-dojo-baseline*) : ;;
  *) echo "✗ wrong repo ($remote) — run from ronin-dojo-app." >&2; exit 2 ;;
esac

if [[ -n "$(git status --porcelain)" ]]; then
  echo "✗ working tree is dirty; commit/stash before running" >&2
  exit 1
fi

git switch main >/dev/null 2>&1
git pull --ff-only origin main

read -r -d '' SESSION_PROMPT <<'PROMPT' || true
Bow in per docs/rituals/opening.md. Your task is the "Next session" block of the
highest-numbered docs/sprints/SESSION_NNNN.md. For this autonomous Codex
automerge batch, the only intended work is the next safe wave from
docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md:

- Wave 2: roles, entitlements, invites, leads
- Wave 3: email, brand-settings, privacy, reports
- Wave 4: programs, courses, age-groups, skill-levels, schedule

Read SESSION_0374 and APP_AND_SERVER_MIGRATION_MAP.md first. Execute only the
next wave if it is one of those waves. If the next session points to Prisma,
server/<entity> flattening, Phase 3 identity re-root, or any work outside waves
2-4, STOP: write the SESSION file with a human-gated pointer and do not commit
code edits.

Act as Petey orchestrating Cody (build) and Doug/Desi (verify/review), doing the
work inline. Follow the proven per-area recipe exactly:

1. `git mv apps/web/app/admin/<area> apps/web/app/app/<area>`.
2. Rewrite imports scoped to the moved dir only. Do NOT blanket-rewrite
   `server/admin/<area>` imports.
3. Add `apps/web/app/app/<area>/layout.tsx` with
   `requirePermission(APP_AREA_PERMISSIONS.<area>)`.
4. Unwrap `withAdminPage` page exports to plain `/app` PageProps.
5. Ensure APP_AREA_PERMISSIONS has the key.
6. Add `/admin/<area>` + child redirects in config/app-redirects.ts and tests.
7. Repoint route strings and revalidatePath values to `/app/<area>`, without
   touching server import paths.
8. Add permission-gated sidebar entries.
9. Verify redirects and, if the dev auth environment allows, authenticated app
   render. If dev-login is stale, record the gap and prove via typecheck/curl.

AUTONOMOUS SCOPE GUARD:
- Do not edit apps/web/prisma/** or create migrations.
- Do not execute the server/<entity> flatten or move server/web|server/admin
  modules.
- Do not start Phase 3 identity re-root.
- Do not make DNS, Vercel production-domain, or Stripe rehearsal changes.
- If the wave cannot be completed without one of those actions, stop and leave a
  reviewed SESSION handoff rather than widening scope.

Bow out per docs/rituals/closing.md as a FULL close: SESSION file, wiki sweep,
`bun run wiki:lint`, `bun run typecheck`, `(cd apps/web && bun run lint:check &&
bun run format:check)`, focused tests, changed-line fallow, Graphify update
before commit, FS-0024 git guard, one conventional commit to the current branch.
Do not push and do not open a PR — the wrapper handles that. If a real gate
fails, leave the tree uncommitted and stop.
PROMPT

MODEL_ARGS=()
[[ -n "${CODEX_MODEL:-}" ]] && MODEL_ARGS=(-m "$CODEX_MODEL")

for ((i = 1; i <= N; i++)); do
  last="$(find docs/sprints -name 'SESSION_*.md' | sed -E 's/.*SESSION_([0-9]+)\.md/\1/' | sort -n | tail -1)"
  next="$(printf '%04d' "$((10#$last + 1))")"
  branch="auto/codex-session-${next}"

  echo ""
  echo "════════ codex auto-merge session ${i}/${N} → ${branch} ════════"
  if git rev-parse --verify --quiet "$branch" >/dev/null; then
    echo "✗ local branch ${branch} already exists; inspect/delete it before rerunning" >&2
    exit 1
  fi
  git switch -c "$branch" main

  codex exec \
    --cd "$ROOT" \
    --dangerously-bypass-approvals-and-sandbox \
    ${MODEL_ARGS[@]+"${MODEL_ARGS[@]}"} \
    "$SESSION_PROMPT"

  if [[ -n "$(git status --porcelain)" ]]; then
    notify "Codex automerge stopped: dirty tree after ${branch}" high warning
    echo "✗ dirty tree after ${branch} — session did not close cleanly. Stopping." >&2
    exit 1
  fi

  new_commit_count="$(git rev-list --count "main..HEAD")"
  if [[ "$new_commit_count" -ne 1 ]]; then
    notify "Codex automerge stopped: ${branch} produced ${new_commit_count} commits" high warning
    echo "✗ ${branch} produced ${new_commit_count} commits; expected exactly one. Stopping." >&2
    exit 1
  fi

  changed_files="$(git diff --name-only main..HEAD)"
  if grep -qE '^apps/web/prisma/' <<<"$changed_files"; then
    git push -u origin "$branch" >/dev/null 2>&1
    pr_url="$(gh pr create --base main --head "$branch" --fill --title "auto(codex): SESSION_${next}" 2>/dev/null || true)"
    notify "Prisma change in ${branch}; PR left open, not auto-merged. ${pr_url}" high lock
    echo "⚠ Prisma change in ${branch}; left open for review. Stopping." >&2
    exit 0
  fi

  if git diff --name-status main..HEAD | grep -qE '^(R|D)[0-9]*[[:space:]]+apps/web/server/(web|admin)/'; then
    git push -u origin "$branch" >/dev/null 2>&1
    pr_url="$(gh pr create --base main --head "$branch" --fill --title "auto(codex): SESSION_${next}" 2>/dev/null || true)"
    notify "Server flatten-like change in ${branch}; PR left open, not auto-merged. ${pr_url}" high lock
    echo "⚠ server flatten-like change in ${branch}; left open for review. Stopping." >&2
    exit 0
  fi

  git push -u origin "$branch" >/dev/null 2>&1
  pr_url="$(gh pr create --base main --head "$branch" --fill --title "auto(codex): SESSION_${next}" 2>/dev/null)"
  pr_num="$(grep -oE '[0-9]+$' <<<"$pr_url" | tail -1)"
  notify "Codex PR #${pr_num} opened (${branch}). Waiting on CI..." default hourglass

  if ! gh pr checks "$pr_num" --watch --interval 30 >/dev/null 2>&1; then
    run="$(gh run list --branch "$branch" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)"
    [ -n "$run" ] && gh run rerun "$run" --failed >/dev/null 2>&1 || true
    if ! gh pr checks "$pr_num" --watch --interval 30 >/dev/null 2>&1; then
      notify "CI red on Codex PR #${pr_num} (${branch}) after rerun" high x
      echo "✗ CI failed on PR #${pr_num} after rerun — stopping." >&2
      exit 1
    fi
  fi

  gh pr merge "$pr_num" --merge --delete-branch >/dev/null 2>&1
  notify "Merged Codex PR #${pr_num} (${branch}) → main." default white_check_mark
  echo "✓ merged PR #${pr_num}"

  git switch main >/dev/null 2>&1
  git pull --ff-only origin main >/dev/null 2>&1
done

notify "Codex automerge batch done: ${N} session(s) merged to main." default tada
echo "✓ ${N} Codex session(s) auto-merged."
