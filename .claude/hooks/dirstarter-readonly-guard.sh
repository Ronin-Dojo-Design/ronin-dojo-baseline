#!/bin/bash
# dirstarter-readonly-guard.sh — Block any Write/Edit/NotebookEdit targeting the
# purchased read-only DirStarter template.
#
# See [[feedback_dirstarter_template_readonly]]: only file reads (cat/ls/diff) are
# allowed under `/Users/brianscott/Local Sites/DirStarter /dirstarter_template/`.

set -euo pipefail

input="$(cat)"
parsed="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print(data.get("tool_name", ""))
ti = data.get("tool_input") or {}
# Write/Edit use file_path; NotebookEdit uses notebook_path.
print(ti.get("file_path") or ti.get("notebook_path") or "")
' <<<"$input")"

tool="$(printf '%s\n' "$parsed" | sed -n '1p')"
path="$(printf '%s\n' "$parsed" | sed -n '2p')"

case "$tool" in
  Write|Edit|NotebookEdit) ;;
  *) echo '{}'; exit 0 ;;
esac

template_root="/Users/brianscott/Local Sites/DirStarter /dirstarter_template"

case "$path" in
  "$template_root"|"$template_root"/*)
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "[dirstarter-readonly-guard] Refusing to $tool '$path'. The path is inside the purchased read-only DirStarter template — only file reads (cat/ls/diff) are allowed there. If you meant the ronin-dojo-app repo, use /Users/brianscott/dev/ronin-dojo-app/... instead. See ~/.claude/projects/.../memory/feedback_dirstarter_template_readonly.md."
  }
}
EOF
    exit 0
    ;;
esac

echo '{}'
