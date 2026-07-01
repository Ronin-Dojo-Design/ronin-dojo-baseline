#!/bin/bash
# bowout-reminder.sh — Stop-hook safety net for a forgotten/crashed close
# (SESSION_0476 P0). Mirrors bowout-vercel-check.sh: NEVER blocks Stop — it's
# informational (emits a `systemMessage` at most, else `echo '{}'` and exit 0).
#
# Fires the reminder ONLY when the session looks near-close, to avoid per-turn
# spam. All of these must hold:
#   1. The highest-numbered SESSION file has frontmatter `status: in-progress`.
#   2. `git status --porcelain` is non-empty (there is uncommitted work).
#   3. The SESSION file's `## What landed` section is NON-EMPTY (work recorded).
#   4. De-nag: the `.git/.bow-out-gates-ran` sentinel is absent OR older than the
#      SESSION file (i.e. the gate runner hasn't already run on this state).
#
# Guards against a missing SESSION file / non-git repo with a silent exit 0.
# Pure bash + grep/awk — fast and dependency-light.

set -euo pipefail

repo="/Users/brianscott/dev/ronin-dojo-app"

# Gate 0: repo must exist and be a git repo
[ -d "$repo/.git" ] || { echo '{}'; exit 0; }

# Gate 1: resolve highest-NUMERIC SESSION file (not lexical — avoids SESSION_VIDEO_*)
session_file=""
session_num=-1
for f in "$repo"/docs/sprints/SESSION_[0-9][0-9][0-9][0-9].md; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  num="${base#SESSION_}"; num="${num%.md}"
  case "$num" in
    [0-9][0-9][0-9][0-9]) n=$((10#$num)) ;;
    *) continue ;;
  esac
  if [ "$n" -gt "$session_num" ]; then session_num="$n"; session_file="$f"; fi
done
[ -n "$session_file" ] || { echo '{}'; exit 0; }

# Gate 2: frontmatter status must be in-progress. Read only the frontmatter block.
status_line="$(/usr/bin/awk 'NR==1{next} /^---/{exit} /^status:/{print; exit}' "$session_file" 2>/dev/null || true)"
case "$status_line" in
  *in-progress*) : ;;
  *) echo '{}'; exit 0 ;;
esac

# Gate 3: there must be uncommitted work
porcelain="$(cd "$repo" && /usr/bin/git status --porcelain 2>/dev/null || true)"
[ -n "$porcelain" ] || { echo '{}'; exit 0; }

# Gate 4: '## What landed' section must be NON-EMPTY (work recorded → near close).
# Extract lines between '## What landed' and the next '## ' heading; treat a section
# that is only blank lines as empty.
landed="$(/usr/bin/awk '
  /^## What landed/ {f=1; next}
  /^## / {f=0}
  f && $0 ~ /[^[:space:]]/ {print}
' "$session_file" 2>/dev/null || true)"
[ -n "$landed" ] || { echo '{}'; exit 0; }

# Gate 5: de-nag — if the sentinel exists AND is newer than the SESSION file, the
# runner already ran on this state; stay silent.
sentinel="$repo/.git/.bow-out-gates-ran"
if [ -f "$sentinel" ] && [ "$sentinel" -nt "$session_file" ]; then
  echo '{}'; exit 0
fi

# All gates passed — emit the non-blocking reminder.
nnnn="$(printf '%04d' "$session_num")"
/usr/bin/python3 - "$nnnn" <<'PY'
import json, sys
nnnn = sys.argv[1]
msg = (
    f"[bowout-reminder] SESSION_{nnnn} still in-progress with uncommitted work — "
    f"run `bash scripts/bow-out-gates.sh`, then finish the SESSION file + hold at the push gate."
)
print(json.dumps({"systemMessage": msg}))
PY
exit 0
