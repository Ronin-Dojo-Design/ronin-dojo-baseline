#!/bin/bash
# biome-unsafe-nudge.sh — After any `biome ... --unsafe` invocation, post a
# system reminder to run a tsc check.
#
# See [[feedback_biome_unsafe_jsx_blindspot]] / FS-0023: biome --unsafe has a
# JSX blindspot where unused-var detector misses JSX-expression usage and the
# `_var` prefix renames break working code.

set -euo pipefail

input="$(cat)"
cmd="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print((data.get("tool_input") or {}).get("command", ""))
' <<<"$input")"

if printf '%s' "$cmd" | grep -qE 'biome[[:space:]].*--unsafe'; then
  cat <<'EOF'
{
  "systemMessage": "[biome-unsafe-nudge] A `biome --unsafe` batch just ran. FS-0023 reminder: biome's unused-var detector has a JSX-expression blindspot — `_var` prefix renames can silently break working code. Run `pnpm --filter dirstarter typecheck` (or equivalent) before declaring the change safe."
}
EOF
  exit 0
fi

echo '{}'
