#!/bin/bash
# bash-discipline-reminders.sh — PreToolUse (Bash). Two non-blocking reminders:
#
#  1. FS-0027 — a bare multi-file `bun test` (not `bun run test`, no `--parallel`)
#     false-fails on mock.module leakage across files. Nudge toward `bun run test`.
#  2. explicit-push-authorization — any `git push` / `gh pr merge|create` /
#     `vercel` prod deploy needs the operator's explicit "go" first.
#
# Reminders only; nothing is blocked.

set -euo pipefail

input="$(cat)"
cmd="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print((data.get("tool_input") or {}).get("command", ""))
' <<<"$input")"

msg=""

# 1. bare `bun test` (not `bun run test`, no --parallel)
if printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_])bun[[:space:]]+test' \
  && ! printf '%s' "$cmd" | grep -qE 'bun[[:space:]]+run[[:space:]]+test' \
  && ! printf '%s' "$cmd" | grep -q -- '--parallel'; then
  msg="FS-0027: use \`bun run test\` (= bun test --parallel=1). A bare multi-file \`bun test\` false-fails on mock.module leakage across files — see docs/runbooks/sops/sop-test-writing.md."
fi

# 2. push / PR open-or-merge / prod deploy
if printf '%s' "$cmd" | grep -qE '(git[[:space:]]+push|gh[[:space:]]+pr[[:space:]]+(merge|create)|vercel[[:space:]]+deploy|vercel[[:space:]].*--prod)'; then
  msg="${msg:+$msg | }explicit-push-authorization: a push / PR open-or-merge / prod deploy needs the operator's explicit \"go\" first. Build + verify + show, then wait."
fi

if [ -n "$msg" ]; then
  /usr/bin/python3 -c '
import json, sys
print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": sys.argv[1]}}))
' "$msg"
  exit 0
fi

echo '{}'
