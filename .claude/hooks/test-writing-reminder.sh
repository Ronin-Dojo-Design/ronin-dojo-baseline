#!/bin/bash
# test-writing-reminder.sh — PreToolUse (Write|Edit).
#
# When a *.test.* file is created or edited, inject a reminder to read
# sop-test-writing.md FIRST. Pairs with FS-0027: a documented test lesson (the
# `--parallel=1` mock-module rule) got rediscovered SESSION_0452 because nothing
# surfaced it at test-writing time. Non-blocking — it only adds context.

set -euo pipefail

input="$(cat)"
fp="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print((data.get("tool_input") or {}).get("file_path", ""))
' <<<"$input")"

case "$fp" in
  *.test.*|*.test)
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "[test-writing] FS-0027: you are editing a TEST file. Read docs/runbooks/sops/sop-test-writing.md FIRST — especially the \"two-headed concurrency problem\" (run the suite with `bun run test` = `bun test --parallel=1`, NEVER a bare multi-file `bun test fileA fileB`: mock.module leaks across files and false-fails) and the §5d rolled-back-tx pattern for tx-shaped helpers."
  }
}
EOF
    exit 0
    ;;
esac

echo '{}'
