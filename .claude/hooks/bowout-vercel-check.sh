#!/bin/bash
# bowout-vercel-check.sh — Stop-hook nudge. If the user has recently pushed a
# commit to ronin-dojo-app main (last 30 min), check that the latest Vercel
# Production deploy is Ready. If it isn't, emit a systemMessage so the user
# notices BEFORE walking away thinking the session closed clean.
#
# See [[feedback_bowout_vercel_ready_check]]: PR-green is not deploy-green. The
# SESSION_0188 incident pattern (merge succeeded, deploy broken) is exactly
# what this catches.
#
# This hook NEVER blocks Stop — it's informational. Worst case the check fails
# and the user sees a notice; best case it warns of a broken deploy.

set -euo pipefail

repo="/Users/brianscott/dev/ronin-dojo-app"

# Gate 1: repo must exist
[ -d "$repo/.git" ] || { echo '{}'; exit 0; }

# Gate 2: there must be a recent commit on main (within last 30 min)
recent_commit="$(cd "$repo" && /usr/bin/git log -1 --format='%ct %s' main 2>/dev/null || true)"
[ -n "$recent_commit" ] || { echo '{}'; exit 0; }

commit_ts="${recent_commit%% *}"
now="$(/bin/date +%s)"
delta=$((now - commit_ts))
[ "$delta" -le 1800 ] || { echo '{}'; exit 0; }

# Gate 3: vercel CLI must be available
command -v vercel >/dev/null 2>&1 || { echo '{}'; exit 0; }

# Probe latest Production deploy status. Timeout aggressively so a hang doesn't
# stall the Stop hook.
status_line="$(timeout 10 vercel ls --yes 2>/dev/null | /usr/bin/awk '/Production/ {print; exit}' || true)"

[ -n "$status_line" ] || { echo '{}'; exit 0; }

# Parse status — vercel ls output has a status column like `● Ready` / `● Error` / `● Building`
state="$(printf '%s' "$status_line" | /usr/bin/awk '{for(i=1;i<=NF;i++) if($i=="Ready"||$i=="Error"||$i=="Building"||$i=="Canceled"||$i=="Queued") {print $i; exit}}')"

case "$state" in
  Ready)
    echo '{}'
    ;;
  Error|Canceled)
    /usr/bin/python3 - <<PY
import json
print(json.dumps({"systemMessage": "[bowout-vercel-check] Latest ronin-dojo Production deploy is in state '$state'. PR-green != deploy-green. Check 'vercel ls' and 'vercel logs' before declaring the session closed.\n  $status_line"}))
PY
    ;;
  Building|Queued)
    /usr/bin/python3 - <<PY
import json
print(json.dumps({"systemMessage": "[bowout-vercel-check] Latest ronin-dojo Production deploy is still '$state'. Don't walk away yet — wait for Ready or watch for Error.\n  $status_line"}))
PY
    ;;
  *)
    echo '{}'
    ;;
esac
