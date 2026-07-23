#!/usr/bin/env bash
# bow-out-gates.sh — the ONE deterministic close-pass (SESSION_0476 P0).
#
# Read-mostly + FORMAT-FIX-ONLY. Runs from repo root as: `bash scripts/bow-out-gates.sh`.
# Operator posture: AUTO-FIX formatting only; DETECT-only (never auto-edit) for ledger
# cross-off + frontmatter staleness. This script NEVER `git add`/`commit`/`push` — the
# explicit-push gate is sacred. Each gate degrades gracefully (a missing graphify/fallow/DB
# skips that gate with a one-line note; a failed gate prints FAIL but the run still exits 0
# so the agent decides). Mirrors the safe-by-design pattern of scripts/pr-nudge.ts.
#
# The deterministic cells are pre-filled into a copy-pasteable "Full close evidence" table;
# the judgment items land in an "LLM remainder checklist" with fetched context inline.

set -uo pipefail   # NOT -e: a single gate failure must not abort the whole close pass.

# ── Resolve repo root (this script lives in scripts/) ─────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT" || { echo "FATAL: cannot cd to repo root"; exit 0; }

OXFMT="$REPO_ROOT/node_modules/.bin/oxfmt"

hr() { printf '─%.0s' {1..72}; echo; }
section() { echo; hr; echo "▸ $1"; hr; }

# Deterministic cells collected for the evidence table (filled as we go).
EV_TASKLOG="(n/a)"
EV_FORMAT="(n/a)"
EV_WIKILINT="(n/a)"
EV_BUILD="(n/a)"
EV_GGR="(n/a)"
EV_GRAPHIFY="(n/a)"
EV_GITSTATE="(n/a)"

echo "bow-out-gates — deterministic close pass"
echo "repo: $REPO_ROOT"

# ── Gate 1 — Resolve SESSION file (highest NUMERIC NNNN, not lexical) ─────────
section "Gate 1 — SESSION file"
SESSION_FILE=""
SESSION_NUM=-1
for f in docs/sprints/SESSION_[0-9][0-9][0-9][0-9].md; do
  [ -e "$f" ] || continue
  base="$(basename "$f")"
  num="${base#SESSION_}"; num="${num%.md}"
  # strip any non-numeric suffix defensively; keep leading 4 digits
  case "$num" in
    [0-9][0-9][0-9][0-9]) n=$((10#$num)) ;;
    *) continue ;;
  esac
  if [ "$n" -gt "$SESSION_NUM" ]; then SESSION_NUM="$n"; SESSION_FILE="$f"; fi
done
if [ -z "$SESSION_FILE" ]; then
  echo "SKIP: no docs/sprints/SESSION_NNNN.md found — cannot run task-log / ledger / remainder gates."
else
  echo "PASS: SESSION file = $SESSION_FILE (NNNN=$(printf '%04d' "$SESSION_NUM"))"
fi

# ── Gate 2 — Task-log gate (count table rows) ────────────────────────────────
section "Gate 2 — Task log"
TASK_ROWS=0
if [ -n "$SESSION_FILE" ]; then
  # Count only TABLE rows: lines that START with `| SESSION_NNNN_TASK_` (prose mentions excluded).
  TASK_ROWS="$(grep -cE '^\| *SESSION_[0-9]{4}_TASK_[0-9]+' "$SESSION_FILE" || true)"
fi
if [ "$TASK_ROWS" -gt 0 ]; then
  echo "PASS: $TASK_ROWS task rows"
  EV_TASKLOG="PASS ($TASK_ROWS rows)"
else
  echo "FAIL: 0 task rows (expected ≥1 row in the '## Task log' table)"
  EV_TASKLOG="FAIL (0 rows)"
fi

# ── Gate 3 — Touched files (classify) ────────────────────────────────────────
section "Gate 3 — Touched files"
TOUCHED="$( { git diff --name-only HEAD; git diff --cached --name-only; } 2>/dev/null | sort -u )"
TOUCHED_COUNT=0; DOCS_COUNT=0; APP_COUNT=0; OTHER_COUNT=0
APP_TOUCHED=0
CODE_FILES=()   # touched .ts/.tsx for the format-fix gate
while IFS= read -r file; do
  [ -n "$file" ] || continue
  TOUCHED_COUNT=$((TOUCHED_COUNT + 1))
  case "$file" in
    apps/web/*)
      APP_COUNT=$((APP_COUNT + 1)); APP_TOUCHED=1 ;;
    docs/*|*.md|.claude/*)
      DOCS_COUNT=$((DOCS_COUNT + 1)) ;;
    *)
      OTHER_COUNT=$((OTHER_COUNT + 1)) ;;
  esac
  case "$file" in
    *.ts|*.tsx) [ -f "$file" ] && CODE_FILES+=("$file") ;;
  esac
done <<< "$TOUCHED"
echo "touched: $TOUCHED_COUNT total — docs=$DOCS_COUNT · app-code=$APP_COUNT · other=$OTHER_COUNT"

# ── Gate 4 — Format-fix (AUTO — posture: fix code only, NEVER mangle markdown) ─
section "Gate 4 — Format-fix (auto, code only)"
FMT_N=0
if [ ! -x "$OXFMT" ]; then
  echo "SKIP: oxfmt not found at node_modules/.bin/oxfmt — format gate skipped."
  EV_FORMAT="SKIP (oxfmt absent)"
elif [ "${#CODE_FILES[@]}" -eq 0 ]; then
  echo "formatted 0 code files (no touched .ts/.tsx)"
  EV_FORMAT="0 code files"
else
  # oxfmt <paths> = write/fix mode (repo `format` script is `oxfmt .`; `--check` is the read-only variant).
  if "$OXFMT" "${CODE_FILES[@]}" >/dev/null 2>&1; then
    FMT_N="${#CODE_FILES[@]}"
    echo "formatted $FMT_N code files"
    EV_FORMAT="fixed $FMT_N code files"
  else
    echo "WARN: oxfmt exited non-zero on the touched set — inspect manually (not fatal)."
    EV_FORMAT="oxfmt errored"
  fi
fi
echo "markdown: wiki:lint is check-only (no auto-fix) — markdown left untouched by this gate."

# ── Gate 5 — wiki:lint (non-blocking unless E>0) ─────────────────────────────
section "Gate 5 — wiki:lint"
WIKI_OUT="$(bun run wiki:lint 2>&1 || true)"
# Summary line shape: "N error(s), M warning(s)"
WIKI_SUMMARY="$(printf '%s\n' "$WIKI_OUT" | grep -E '[0-9]+ error\(s\), [0-9]+ warning\(s\)' | tail -1 || true)"
if [ -n "$WIKI_SUMMARY" ]; then
  W_E="$(printf '%s' "$WIKI_SUMMARY" | grep -oE '^[0-9]+' | head -1)"
  W_W="$(printf '%s' "$WIKI_SUMMARY" | grep -oE '[0-9]+ warning' | grep -oE '^[0-9]+')"
  echo "${W_E:-?} errors, ${W_W:-?} warnings"
  if [ "${W_E:-0}" -gt 0 ]; then
    echo "  → wiki:lint has ERRORS (blocking gate) — resolve before push."
    EV_WIKILINT="${W_E} err / ${W_W} warn (BLOCKING)"
  else
    echo "  → non-blocking (0 errors)."
    EV_WIKILINT="${W_E} err / ${W_W} warn"
  fi
elif printf '%s' "$WIKI_OUT" | grep -q "No lint violations"; then
  echo "0 errors, 0 warnings"
  EV_WIKILINT="0 err / 0 warn"
else
  echo "SKIP/UNKNOWN: could not parse wiki:lint output (tool missing or output shape changed)."
  EV_WIKILINT="unparsed"
fi

# ── Gate 6 — Build (only if app-code touched) ────────────────────────────────
section "Gate 6 — Build"
if [ "$APP_TOUCHED" -eq 1 ]; then
  echo "app-code touched → running (cd apps/web && bun run build) …"
  if ( cd apps/web && bun run build ) >/dev/null 2>&1; then
    echo "BUILD PASS"
    EV_BUILD="PASS"
  else
    echo "BUILD FAIL — re-run '(cd apps/web && bun run build)' to see the error."
    EV_BUILD="FAIL"
  fi
else
  echo "build: skipped (no apps/web changes — paths-ignored)"
  EV_BUILD="skipped (docs-only)"
fi

# ── Gate 7 — Graphify refresh ────────────────────────────────────────────────
section "Gate 7 — Graphify"
if command -v graphify >/dev/null 2>&1; then
  echo "refreshing graph (GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .) …"
  GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update . >/dev/null 2>&1 || echo "  (update returned non-zero — reading current stats anyway)"
  G_STATS="$(graphify stats 2>/dev/null || true)"
  G_NODES="$(printf '%s\n' "$G_STATS" | grep -iE '^Nodes:' | grep -oE '[0-9]+' | head -1)"
  G_EDGES="$(printf '%s\n' "$G_STATS" | grep -iE '^Edges:' | grep -oE '[0-9]+' | head -1)"
  G_COMM="$(printf '%s\n' "$G_STATS" | grep -iE '^Communities:' | grep -oE '[0-9]+' | head -1)"
  echo "nodes=${G_NODES:-?} · edges=${G_EDGES:-?} · communities=${G_COMM:-?}"
  EV_GRAPHIFY="nodes=${G_NODES:-?} edges=${G_EDGES:-?} communities=${G_COMM:-?}"
else
  echo "SKIP: graphify not on PATH — graph refresh skipped."
  EV_GRAPHIFY="SKIP (absent)"
fi

# ── Gate 7b — State-of-Dojo render (deterministic; publish is agent-on-ask) ───
# The live view is /app/state (0 tokens). This just refreshes the static snapshot
# out/state-of-project.html (gitignored) for a vault copy — never publishes an Artifact
# (that's an agent step). SESSION_0617 / research-review-state-of-dojo-automation.
section "Gate 7b — State-of-Dojo render"
if bun scripts/state-of-project.ts >/dev/null 2>&1; then
  echo "rendered out/state-of-project.html (cite /app/state for the live view; publish only on operator ask)."
else
  echo "SKIP: state-of-project render returned non-zero."
fi

# ── Gate 8 — Git state (report only, never act) ──────────────────────────────
section "Gate 8 — Git state"
G_BRANCH="$(git branch --show-current 2>/dev/null || echo '(detached)')"
echo "branch: $G_BRANCH"
echo "worktrees:"
git worktree list 2>/dev/null | sed 's/^/  /' || echo "  (none)"
echo "status --short:"
GIT_SHORT="$(git status --short 2>/dev/null || true)"
if [ -n "$GIT_SHORT" ]; then
  printf '%s\n' "$GIT_SHORT" | sed 's/^/  /'
else
  echo "  (clean)"
fi
EV_GITSTATE="branch=$G_BRANCH · $( [ -n "$GIT_SHORT" ] && echo "dirty ($(printf '%s\n' "$GIT_SHORT" | grep -c . ) files)" || echo "clean" )"

# ── Gate 9 — Ledger cross-off CANDIDATES (detect-only, NEVER edit) ───────────
section "Gate 9 — Ledger cross-off candidates (detect-only)"
LEDGER_IDS=""
if [ -n "$SESSION_FILE" ]; then
  LEDGER_IDS="$(grep -oE 'GL:G-[0-9]+|WL-P[0-9]+-[0-9]+|FS-[0-9]+|FI-[0-9]+|TD-[0-9]+|D-[0-9]+|\bG-[0-9]{3}\b' "$SESSION_FILE" 2>/dev/null | sort -u || true)"
fi
if [ -n "$LEDGER_IDS" ]; then
  echo "candidates to confirm + flip (NOT edited by this script):"
  printf '%s\n' "$LEDGER_IDS" | sed 's/^/  /'
else
  echo "no ledger IDs referenced in the SESSION file."
fi

# ── Gate 10 — Board backlog (next-pick) ──────────────────────────────────────
section "Gate 10 — Board backlog (next pick)"
BOARD_OUT="$( ( cd apps/web && bun scripts/board-backlog.ts --top=10 ) 2>/dev/null || true )"
if [ -n "$BOARD_OUT" ]; then
  printf '%s\n' "$BOARD_OUT"
  BACKLOG_SOURCE="board-backlog (Kanban)"
else
  echo "board-backlog empty/errored (DB unreachable?) — falling back to file-ledger backlog:"
  LEDGER_OUT="$( bun scripts/ledger-backlog.ts --top=10 2>/dev/null || true )"
  if [ -n "$LEDGER_OUT" ]; then
    printf '%s\n' "$LEDGER_OUT"
    BACKLOG_SOURCE="ledger-backlog (file)"
  else
    echo "  SKIP: both backlog readers empty/unavailable."
    BACKLOG_SOURCE="(none available)"
  fi
fi

# ── Gate 11 — Fallow delta (introduced findings) ─────────────────────────────
section "Gate 11 — Fallow delta"
FALLOW_REMAINDER=""
if command -v fallow >/dev/null 2>&1 || [ -x "$REPO_ROOT/node_modules/.bin/fallow" ]; then
  FALLOW_OUT="$(bun run audit:fallow 2>&1 || true)"
  # Count introduced findings; tolerate multiple phrasings without over-claiming.
  F_INTRO="$(printf '%s\n' "$FALLOW_OUT" | grep -oiE '[0-9]+ (introduced|new) (finding|issue)' | grep -oE '^[0-9]+' | head -1)"
  if [ -z "$F_INTRO" ]; then
    F_INTRO="$(printf '%s\n' "$FALLOW_OUT" | grep -ciE 'introduced' || true)"
  fi
  echo "introduced findings: ${F_INTRO:-0}"
  if [ "${F_INTRO:-0}" -gt 0 ] 2>/dev/null; then
    FALLOW_REMAINDER="consider /fallow-fix-loop (${F_INTRO} introduced findings)"
    echo "  → $FALLOW_REMAINDER"
  fi
else
  echo "SKIP: fallow not available — delta skipped."
fi

# ── Gate 12 — Hostile-review trigger ─────────────────────────────────────────
section "Gate 12 — Hostile-review trigger"
HOSTILE_LAYERS=""
add_layer() { case " $HOSTILE_LAYERS " in *" $1 "*) ;; *) HOSTILE_LAYERS="$HOSTILE_LAYERS $1" ;; esac; }
while IFS= read -r file; do
  [ -n "$file" ] || continue
  case "$file" in
    *schema.prisma*)                       add_layer "schema" ;;
  esac
  case "$file" in
    *auth*)                                add_layer "auth" ;;
  esac
  case "$file" in
    *stripe*|*payment*)                    add_layer "payments" ;;
  esac
  case "$file" in
    *storage*|*media*)                     add_layer "storage/media" ;;
  esac
  case "$file" in
    apps/web/*)                            add_layer "app-code" ;;
  esac
  case "$file" in
    docs/protocols/*)                      add_layer "protocols" ;;
  esac
done <<< "$TOUCHED"
HOSTILE_LAYERS="$(echo "$HOSTILE_LAYERS" | xargs || true)"
if [ -n "$HOSTILE_LAYERS" ]; then
  echo "HOSTILE REVIEW REQUIRED — touched: $HOSTILE_LAYERS"
  HOSTILE_STATE="REQUIRED — layers: $HOSTILE_LAYERS"
else
  echo "hostile review: likely not-applicable (docs-only) — confirm"
  HOSTILE_STATE="likely n/a (docs-only) — confirm"
fi

# ── Gate 12b — Secret scan (touched files, blocking) ─────────────────────────
section "Gate 12b — Secret scan"
SECRET_HITS=""
SECRET_RE='(sk-[A-Za-z0-9]{20}|api[_-]?key[[:space:]]*[:=][[:space:]]*[^[:space:]]{16,}|Bearer [A-Za-z0-9._-]{20,}|BEGIN (RSA|OPENSSH) PRIVATE KEY)'
while IFS= read -r file; do
  [ -n "$file" ] && [ -f "$file" ] || continue
  case "$file" in
    *.md|*.json|*.yml|*.yaml|*.html|*.env*|*.txt) : ;;
    *) continue ;;
  esac
  HIT="$(grep -nE "$SECRET_RE" "$file" 2>/dev/null | head -2 || true)"
  [ -n "$HIT" ] && SECRET_HITS="${SECRET_HITS}${file}: $(echo "$HIT" | head -1)"$'\n'
done <<< "$TOUCHED"
if [ -n "$SECRET_HITS" ]; then
  echo "SECRET SCAN FAILED (blocking) — remove AND rotate before commit/push:"
  printf '%s' "$SECRET_HITS" | sed 's/^/  /'
  EV_SECRETS="FAIL — hits found (blocking)"
else
  echo "secret scan: clean (touched md/json/yaml/html/env/txt)"
  EV_SECRETS="PASS (clean)"
fi

# ── Gate 12c — Evidence-artifact requirement (detect-only; closing.md §6a) ───
# Runtime-verification cell ≠ "no runtime surface touched" ⇒ an Evidence-artifact-URL
# row is required. Both rows live in the `## Full close evidence` table the LLM writes
# at step 6a — usually AFTER this script's first run, so a first pass finds nothing yet
# (silently skipped, not a failure); re-running this script near close re-checks it.
section "Gate 12c — Evidence-artifact requirement"
EV_ARTIFACT_STATE="(n/a — evidence table not yet written; re-run near close to check)"
if [ -n "$SESSION_FILE" ] && grep -qE '^\|\s*Runtime verification \(Doug\)\s*\|' "$SESSION_FILE" 2>/dev/null; then
  RUNTIME_ROW="$(grep -E '^\|\s*Runtime verification \(Doug\)\s*\|' "$SESSION_FILE" | head -1)"
  if printf '%s' "$RUNTIME_ROW" | grep -qiE 'no runtime surface touched'; then
    echo "Runtime verification (Doug): 'no runtime surface touched' — evidence artifact not required."
    EV_ARTIFACT_STATE="n/a — no runtime surface touched"
  else
    echo "Runtime verification (Doug) row present and non-trivial — checking for Evidence-artifact URL…"
    if grep -qE '^\|\s*Evidence-artifact URL\s*\|' "$SESSION_FILE" 2>/dev/null; then
      ARTIFACT_ROW="$(grep -E '^\|\s*Evidence-artifact URL\s*\|' "$SESSION_FILE" | head -1)"
      if printf '%s' "$ARTIFACT_ROW" | grep -qiE 'https?://|n/a'; then
        echo "PASS: Evidence-artifact URL row present."
        EV_ARTIFACT_STATE="PASS (row present)"
      else
        echo "REQUIRED: Evidence-artifact URL row present but empty/placeholder — fill it (closing.md §6a)."
        EV_ARTIFACT_STATE="REQUIRED — row present but empty/placeholder"
      fi
    else
      echo "REQUIRED: Runtime verification (Doug) indicates a runtime surface was touched, but no"
      echo "  Evidence-artifact URL row exists yet — add one before closing (closing.md §6a)."
      EV_ARTIFACT_STATE="REQUIRED — missing (runtime surface touched)"
    fi
  fi
else
  echo "Full close evidence table not found (or not yet written) in $SESSION_FILE — skip for now."
fi

# ── Gate 12d — /ggr score for a code-touching session (blocking) ─────────────
# closing.md §6.5 promises "a code-touching session's close is verified by bow-out-gates
# Gate 12d looking for [the /ggr composite] in ## Review log" — but that gate never existed
# (WL-P2-78 / SESSION_0620 /rr A4 finding: the "invoked ≠ executed" gap — the enforcement
# meant to catch built-not-wired was itself built-not-wired). This IS Gate 12d. Report-style
# like Gate 12b: prints BLOCKING + sets evidence; the script still exit 0 (the reminder hook
# + operator act on it). A "code session" = the diff touched shippable product code.
section "Gate 12d — /ggr score (code session)"
CODE_SESSION=0
while IFS= read -r file; do
  [ -n "$file" ] || continue
  case "$file" in
    apps/web/*|clients/*|packages/*) CODE_SESSION=1; break ;;
  esac
done <<< "$TOUCHED"
if [ "$CODE_SESSION" = "1" ]; then
  if [ -n "$SESSION_FILE" ] && grep -qiE '(^|[^a-z])/?ggr\b|composite[[:space:]]+[~≈]?[0-9]+(\.[0-9]+)?/10|→[[:space:]]*CLEARS' "$SESSION_FILE" 2>/dev/null; then
    echo "PASS: /ggr score found in $SESSION_FILE (## Review log)."
    EV_GGR="PASS (score present)"
  else
    echo "  → code-touching session (apps/web|clients|packages) but NO /ggr composite in"
    echo "     $SESSION_FILE ## Review log. Run /ggr and record the composite before close"
    echo "     (closing.md §6.5, ADR 0052 D4/D5/D6). BLOCKING."
    EV_GGR="MISSING (code session, no /ggr — BLOCKING)"
  fi
else
  echo "no shippable code touched (apps/web|clients|packages) — /ggr score not required."
  EV_GGR="n/a (no code touched)"
fi

# ── Gate 13 — Frontmatter staleness (touched docs, detect-only) ──────────────
# (surfaced in the remainder checklist below; computed here so it's inline)
STALE_FM=""
TODAY="$(date +%Y-%m-%d)"
while IFS= read -r file; do
  [ -n "$file" ] || continue
  case "$file" in
    *.md) ;;
    *) continue ;;
  esac
  [ -f "$file" ] || continue
  # Only inspect files that HAVE frontmatter (start with ---)
  head -1 "$file" | grep -q '^---' || continue
  fm="$(awk 'NR==1{next} /^---/{exit} {print}' "$file")"
  upd="$(printf '%s\n' "$fm" | grep -E '^updated:' | head -1 | sed -E 's/^updated:[[:space:]]*//; s/["'\'']//g')"
  has_agent="$(printf '%s\n' "$fm" | grep -cE '^last_agent:' || true)"
  reasons=""
  if [ -n "$upd" ] && [ "$upd" != "$TODAY" ]; then reasons="stale updated:$upd"; fi
  if [ "$has_agent" -eq 0 ]; then reasons="${reasons:+$reasons, }missing last_agent"; fi
  if [ -n "$reasons" ]; then STALE_FM="${STALE_FM}  - $file ($reasons)\n"; fi
done <<< "$TOUCHED"

# ═══ Emit copy-pasteable block 1 — Full close evidence (pre-filled) ══════════
section "Copy-paste block 1"
cat <<EVIDENCE

## Full close evidence (pre-filled)

| Gate | Result |
| --- | --- |
| Task log | $EV_TASKLOG |
| Format-fix (code) | $EV_FORMAT |
| wiki:lint | $EV_WIKILINT |
| Build | $EV_BUILD |
| /ggr (code session) | $EV_GGR |
| Graphify | $EV_GRAPHIFY |
| Git state | $EV_GITSTATE |
| Secret scan | $EV_SECRETS |
| Evidence-artifact URL | $EV_ARTIFACT_STATE |
| Touched | $TOUCHED_COUNT files (docs=$DOCS_COUNT · app=$APP_COUNT · other=$OTHER_COUNT) |
EVIDENCE

# ═══ Emit copy-pasteable block 2 — LLM remainder checklist ═══════════════════
section "Copy-paste block 2"
{
echo
echo "## LLM remainder checklist"
echo
echo "- [ ] Reflections — write the session's reflections (judgment)."
echo "- [ ] Hostile review — $HOSTILE_STATE"
case "$EV_ARTIFACT_STATE" in
  REQUIRED*) echo "- [ ] Evidence-artifact URL — $EV_ARTIFACT_STATE (closing.md §6a: publish + link before close)." ;;
  "(n/a"*) echo "- [ ] Evidence-artifact URL — table not written yet; re-run this script after filling ## Full close evidence to check." ;;
esac
echo "- [ ] Review & Recommend — next pick from ${BACKLOG_SOURCE:-backlog} (see Gate 10 list above)."
if [ -n "$LEDGER_IDS" ]; then
  echo "- [ ] Ledger cross-off — confirm + flip these candidates (detect-only; NOT edited):"
  printf '%s\n' "$LEDGER_IDS" | sed 's/^/      - /'
else
  echo "- [ ] Ledger cross-off — no ledger IDs referenced in the SESSION file."
fi
if [ -n "$STALE_FM" ]; then
  echo "- [ ] Frontmatter staleness — touched docs with stale updated:/missing last_agent (detect-only):"
  printf "%b" "$STALE_FM" | sed 's/^  //; s/^/      /'
else
  echo "- [ ] Frontmatter staleness — no touched docs with stale updated:/missing last_agent."
fi
echo "- [ ] Memory sweep — capture any durable learnings into MEMORY.md."
echo "- [ ] Finding-router — route findings to their canonical ledger (closing.md §6.7)."
if [ -n "$FALLOW_REMAINDER" ]; then
  echo "- [ ] Fallow — $FALLOW_REMAINDER"
fi
echo
}

# ── Sentinel so the reminder hook can de-nag ─────────────────────────────────
GIT_DIR="$(git rev-parse --git-dir 2>/dev/null || echo "$REPO_ROOT/.git")"
SENTINEL="${CLAUDE_PROJECT_DIR:-$REPO_ROOT}/.git/.bow-out-gates-ran"
# Prefer the resolved git-dir; fall back to repo-root/.git.
if [ -d "$GIT_DIR" ]; then
  touch "$GIT_DIR/.bow-out-gates-ran" 2>/dev/null || touch "$SENTINEL" 2>/dev/null || true
else
  touch "$SENTINEL" 2>/dev/null || true
fi

section "Done"
echo "bow-out-gates complete. This script NEVER git add/commit/push — hold at the explicit-push gate."
echo "Deterministic gates ran; judgment items are in the remainder checklist above."
exit 0
