#!/usr/bin/env bash
#
# auto-session-codex.sh — Codex CLI variant of auto-session.sh.
#
# Runs N autonomous bow-in → bow-out sessions back-to-back, each as a COLD
# `codex exec` process, each its own reviewable PR (stacked). Identical to
# auto-session.sh except the agent invocation is `codex exec` instead of
# `claude -p` — the SESSION-file + git handoff is agent-agnostic (the repo's
# opening.md ritual is explicitly cross-agent), so only the one invocation line
# changes. Records last_agent as codex-session-NNNN (the agent does this at
# bow-out per opening.md's convention).
#
# WHY THIS SHAPE: this repo is a file-based state machine. Bow-in reads the
# highest-numbered docs/sprints/SESSION_NNNN.md; bow-out writes the next one.
# So each session is a COLD process — context stays fresh because the handoff
# lives in the SESSION files + git, not in a conversation.
#
# Usage:
#   scripts/auto-session-codex.sh [N]      # N = how many sessions (default 1)
#   CODEX_MODEL=gpt-5-codex scripts/auto-session-codex.sh 3   # pin a model
#
# PERMISSIONS: a headless `codex exec` cannot answer approval prompts. Codex has
# no per-command allowlist like Claude's settings.json, and its workspace-write
# sandbox blocks network (which `git push` + `gh pr create` need). So this uses
# `--dangerously-bypass-approvals-and-sandbox` for an unattended run. The
# FS-0024 shell-guard still blocks the read-only dirstarter_template dir at the
# shell level, so the repo guardrail remains. The PR gate (you review each PR)
# is the real safety net — nothing reaches main unattended.
#
set -euo pipefail

# Codex lives in the user prefix (installed via `npm i -g @openai/codex --prefix ~/.local`).
export PATH="$HOME/.local/bin:$PATH"
command -v codex >/dev/null || { echo "✗ codex not on PATH (npm i -g @openai/codex --prefix ~/.local)" >&2; exit 2; }

cd "$(git rev-parse --show-toplevel)"
ROOT="$(pwd)"

N="${1:-1}"
case "$N" in (''|*[!0-9]*) echo "N must be a positive integer" >&2; exit 2 ;; esac
if (( N < 1 )); then
  echo "N must be a positive integer" >&2
  exit 2
fi

# Guard: never run from the read-only dirstarter_template (FS-0024).
remote="$(git remote get-url origin 2>/dev/null || true)"
case "$remote" in
  *ronin-dojo-baseline*) : ;;
  *) echo "✗ wrong repo ($remote) — run from ronin-dojo-app." >&2; exit 2 ;;
esac

# Resume support: AUTO_BASE_BRANCH lets a follow-up run stack on an existing session
# branch (e.g. after salvaging a halted session) instead of re-deriving from main.
START_BASE="${AUTO_BASE_BRANCH:-main}"
if [ "$START_BASE" = "main" ]; then
  git switch main >/dev/null 2>&1
  git pull --ff-only origin main
else
  git switch "$START_BASE" >/dev/null 2>&1 || { echo "✗ AUTO_BASE_BRANCH '$START_BASE' not found" >&2; exit 2; }
fi

read -r -d '' SESSION_PROMPT <<'PROMPT' || true
Bow in per docs/rituals/opening.md. Your task is the "Next session" block of the
highest-numbered docs/sprints/SESSION_NNNN.md. If that block names an epic plan doc
(e.g. docs/petey-plan-NNNN.md), READ IT FIRST and treat its locked decisions + the
slice for this session number as binding — headless sessions cannot grill, so do not
re-decide anything the plan already locked. Act as Petey orchestrating Cody (build)
and Doug (verify), doing the work inline (Codex has no subagents). SKIP any
operator-only browser/device smoke — flag it as operator-side, do NOT block on it.
Implement only the next automatable code slice.

Before any UI, schema, or backend edits, write the SESSION Petey plan and Task log
IDs, then complete the relevant Cody pre-flight. For lineage/petey-plan-0305 work,
run Graphify queries over the lane terms from the latest SESSION handoff before
opening broad code surfaces. If a slice mentions trophy.so, achievements, points,
gamification, RankAward persistence, or schema work, treat it as schema/backend
work first: read docs/runbooks/database/schema-migration.md,
docs/runbooks/database/prisma-workflow.md, docs/protocols/cody-preflight.md,
docs/runbooks/domain-features/lineage-hub.md, ADR 0016, and schema.prisma before
editing. Reuse existing GamificationEventType/GamificationEvent/RankAward facts
unless the schema pre-flight explicitly proves they are insufficient.

Then bow out per docs/rituals/closing.md as a FULL close: fill the SESSION file
(set last_agent: codex-session-NNNN), sweep wiki index/log + component inventory, run
`bun run wiki:lint` (it MUST report 0 errors), run `bun run typecheck`, and run the
read-only Oxc gates `(cd apps/web && bun run lint:check && bun run format:check)`. DO NOT
run the root `bun run lint` or the apps/web `lint`/`format` scripts — those use `--fix`/write
and MUTATE files (the old FS-0017 `biome` PATH gap is moot post-Oxc migration, SESSION_0360);
the real gate is "oxlint + oxfmt check + typecheck". Then write the hostile close review
and run `graphify update` BEFORE the commit (FS-0025 single-push order).

IMPORTANT OVERRIDE: COMMIT your close to the CURRENT branch with a conventional
message, but DO NOT push and DO NOT open a PR — the wrapper script handles git
push + PR. Run the FS-0024 pwd/remote guard before committing. If a REAL gate fails
(typecheck, changed-file Biome, wiki:lint, or focused tests), STOP and leave the working
tree UNCOMMITTED. The root `bun run lint` is NOT a gate (known-broken) — do not block on it.
PROMPT

MODEL_ARGS=()
[[ -n "${CODEX_MODEL:-}" ]] && MODEL_ARGS=(-m "$CODEX_MODEL")

base_branch="$START_BASE"

for ((i = 1; i <= N; i++)); do
  last="$(find docs/sprints -name 'SESSION_*.md' | sed -E 's/.*SESSION_([0-9]+)\.md/\1/' | sort -n | tail -1)"
  next="$(printf '%04d' "$((10#$last + 1))")"
  branch="auto/session-${next}"

  echo ""
  echo "════════ codex session ${i}/${N} → ${branch} (stacked on ${base_branch}) ════════"
  git switch -c "$branch" "$base_branch"

  # NB: ${arr[@]+"${arr[@]}"} guard — bash 3.2 (macOS default) errors on an empty
  # array expansion under `set -u`; this expands to nothing when MODEL_ARGS is unset.
  codex exec \
    --cd "$ROOT" \
    --dangerously-bypass-approvals-and-sandbox \
    ${MODEL_ARGS[@]+"${MODEL_ARGS[@]}"} \
    "$SESSION_PROMPT"

  # Brake 1: a clean close leaves no uncommitted changes.
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "✗ dirty tree after ${branch} — session did not close cleanly. Stopping." >&2
    exit 1
  fi
  # Brake 2: the session must have produced exactly one new commit.
  new_commit_count="$(git rev-list --count "${base_branch}..HEAD")"
  if [[ "$new_commit_count" -ne 1 ]]; then
    if [[ "$new_commit_count" -eq 0 ]]; then
      echo "✗ no new commit on ${branch} — session produced nothing. Stopping." >&2
    else
      echo "✗ ${branch} produced ${new_commit_count} commits; expected exactly one. Stopping." >&2
    fi
    exit 1
  fi

  git push -u origin "$branch"
  gh pr create --base "$base_branch" --head "$branch" --fill \
    --title "auto(codex): SESSION_${next} — lineage epic (stacked on ${base_branch})"

  base_branch="$branch"   # next session stacks on this one
done

echo ""
echo "✓ ${N} codex session(s) complete. Review the stacked PRs and merge BOTTOM-UP into main:"
echo "  the oldest PR (base main) first; GitHub auto-retargets the next onto main as you go."
