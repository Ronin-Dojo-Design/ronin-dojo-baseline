#!/bin/bash
# ronin-cwd-guard.sh — Block Bash calls that look like ronin-dojo-app work but are
# missing the required `cd /Users/brianscott/dev/ronin-dojo-app && ` prefix.
#
# Why: The VSCode primary cwd in this user's sessions is the purchased read-only
# DirStarter template at `/Users/brianscott/Local Sites/DirStarter /dirstarter_template`.
# `ronin-dojo-app` is listed under additionalDirectories — that grants Edit access
# but does NOT change Bash cwd. Every fresh Bash call starts in the primary cwd.
# Unprefixed `git` / `pnpm` / `bun` / `vercel` calls then silently target the wrong
# repo. See FS-0024 and memory `feedback_ronin_dojo_bash_cwd`.
#
# Hook contract: receives PreToolUse JSON on stdin; emits JSON on stdout per the
# Claude Code hook spec. Exit 0 always (let the decision field do the blocking).

set -euo pipefail

# Parse with /usr/bin/python3 (always present on macOS); jq is not guaranteed in the
# hook's minimal PATH. Reading stdin via python keeps escape handling correct.
input="$(cat)"
parsed="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print(data.get("tool_name", ""))
print((data.get("tool_input") or {}).get("command", ""))
' <<<"$input")"

tool="$(printf '%s\n' "$parsed" | sed -n '1p')"
cmd="$(printf '%s\n' "$parsed" | sed -n '2,$p')"

# Only intercept Bash calls.
if [ "$tool" != "Bash" ]; then
  echo '{}'
  exit 0
fi

# Empty command — allow.
if [ -z "$cmd" ]; then
  echo '{}'
  exit 0
fi

# Already prefixed with the ronin-dojo-app cd → allow.
case "$cmd" in
  "cd /Users/brianscott/dev/ronin-dojo-app"*) echo '{}'; exit 0 ;;
  'cd "/Users/brianscott/dev/ronin-dojo-app'*) echo '{}'; exit 0 ;;
  "cd '/Users/brianscott/dev/ronin-dojo-app"*) echo '{}'; exit 0 ;;
esac

# Other legitimate non-ronin workspaces — allow.
case "$cmd" in
  "cd /Users/brianscott/.claude"*) echo '{}'; exit 0 ;;
  "cd /Users/brianscott/.shell-guards"*) echo '{}'; exit 0 ;;
  "cd ~/.claude"*) echo '{}'; exit 0 ;;
  "cd ~/.shell-guards"*) echo '{}'; exit 0 ;;
  "cd /Users/brianscott/dev/"*) echo '{}'; exit 0 ;;
  "cd /Users/brianscott/Local Sites/tuffbuffs"*) echo '{}'; exit 0 ;;
  'cd "/Users/brianscott/Local Sites/tuffbuffs'*) echo '{}'; exit 0 ;;
esac

# Explicit RONIN_GUARD_BYPASS — allow (mirrors the shell wrapper bypass).
case "$cmd" in
  "RONIN_GUARD_BYPASS=1 "*) echo '{}'; exit 0 ;;
esac

# Explicit cd into the dirstarter_template — allow (read-only template, by design).
case "$cmd" in
  'cd "/Users/brianscott/Local Sites/DirStarter /dirstarter_template"'*) echo '{}'; exit 0 ;;
  "cd '/Users/brianscott/Local Sites/DirStarter /dirstarter_template'"*) echo '{}'; exit 0 ;;
esac

# Does this command look like ronin-dojo-app work?
needs_prefix=0

# Tool invocations at start of command, after && / || / ;
if printf '%s' "$cmd" | grep -qE '(^|[[:space:]]|;|&&|\|\|)(git|gh|pnpm|vercel|graphify)([[:space:]]|$)'; then
  needs_prefix=1
fi

# `bun` is dual-use — `bun --version` is fine standalone. Block only when it targets
# project scripts/tests/configs.
if printf '%s' "$cmd" | grep -qE '(^|[[:space:]]|;|&&|\|\|)bun[[:space:]]+(run|test|tsc|typecheck|install|add|--filter|--env-file|--cwd|x[[:space:]]|--eval)'; then
  needs_prefix=1
fi

# Workspace path references.
if printf '%s' "$cmd" | grep -qE '(apps/web/|docs/sprints/|docs/protocols/|docs/knowledge/wiki/|docs/architecture/|docs/runbooks/|docs/rituals/|\.dirstarter-upstream)'; then
  needs_prefix=1
fi

if [ "$needs_prefix" -eq 0 ]; then
  echo '{}'
  exit 0
fi

# BLOCK with a clear message.
cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "FS-0024 guard: this Bash call looks like ronin-dojo-app work but is missing the required `cd /Users/brianscott/dev/ronin-dojo-app && ` prefix. The harness primary cwd is the read-only DirStarter template — every Bash call referencing git/gh/pnpm/bun/vercel/graphify or workspace paths (apps/web/, docs/sprints/, etc.) MUST start with `cd /Users/brianscott/dev/ronin-dojo-app && …`. If you actually mean the dirstarter_template, prefix with `cd \"/Users/brianscott/Local Sites/DirStarter /dirstarter_template\" && …` instead. See ~/.claude/projects/.../memory/feedback_ronin_dojo_bash_cwd.md and docs/protocols/failed-steps-log.md FS-0024."
  }
}
EOF
