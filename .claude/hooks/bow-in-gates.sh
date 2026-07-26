#!/usr/bin/env bash
# bow-in-gates.sh — SessionStart hook (SESSION_0711): inject the two mechanical bow-in gates
# as context so every session starts knowing claim + push-guard state. Terse by design.
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
claim="free"
[ -f .canonical-session ] && claim="held by $(tr '\n' ' ' < .canonical-session 2>/dev/null | head -c 60)"
if bash scripts/githooks/doctor.sh >/dev/null 2>&1; then doctor="PASS"; else doctor="FAIL — run: bash scripts/githooks/install.sh"; fi
echo "[bow-in gates] canonical claim: ${claim} · githooks doctor: ${doctor}"
