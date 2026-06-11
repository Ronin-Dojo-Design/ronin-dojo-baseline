#!/bin/bash
# oxlint-fix-nudge.sh — After any `oxlint ... --fix` batch, post a system reminder
# to run a tsc check.
#
# See [[feedback_biome_unsafe_jsx_blindspot]] / FS-0023: auto-fixers have a JSX
# blindspot where the unused-var detector misses JSX-expression usage and `_var`
# prefix renames break working code. SESSION_0360: after the Oxc migration,
# `oxlint --fix` also rewrites code (e.g. no-useless-spread collapse) — the same
# "verify with tsc before declaring it safe" discipline applies.

set -euo pipefail

input="$(cat)"
cmd="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print((data.get("tool_input") or {}).get("command", ""))
' <<<"$input")"

if printf '%s' "$cmd" | grep -qE 'oxlint[[:space:]].*--fix'; then
  cat <<'EOF'
{
  "systemMessage": "[oxlint-fix-nudge] An `oxlint --fix` batch just ran. FS-0023 reminder: auto-fixers have a JSX-expression blindspot and can rewrite working code (e.g. spread/ternary collapse) — run `(cd apps/web && bun run typecheck)` before declaring the change safe."
}
EOF
  exit 0
fi

echo '{}'
