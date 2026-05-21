#!/bin/sh
# ~/.shell-guards/ronin-cwd-guard.sh — LLM-agnostic FS-0024 guard.
#
# Defines wrapper functions for git / gh / pnpm / bun / vercel / graphify that
# REFUSE to run when the current shell's $PWD is inside the purchased read-only
# DirStarter template (`/Users/brianscott/Local Sites/DirStarter /dirstarter_template`).
#
# This catches the FS-0024 failure pattern at the shell boundary — works for
# Claude Code, GitHub Copilot CLI, OpenAI Codex CLI, Cursor agents, or any
# future LLM that invokes commands through the user's shell.
#
# To bypass intentionally for a single command (e.g., legitimate read-only
# research inside the template), prefix with `RONIN_GUARD_BYPASS=1 git …`.
#
# To remove: delete this file and the `source` lines in ~/.zshenv / ~/.bashrc.

_RONIN_TEMPLATE_DIR="/Users/brianscott/Local Sites/DirStarter /dirstarter_template"
_RONIN_REPO_DIR="/Users/brianscott/dev/ronin-dojo-app"

_ronin_in_template() {
  case "$PWD" in
    "$_RONIN_TEMPLATE_DIR"|"$_RONIN_TEMPLATE_DIR"/*) return 0 ;;
    *) return 1 ;;
  esac
}

_ronin_guard_refuse() {
  # $1 = tool name, $2 = "real" path to forward to if bypass is set
  cat >&2 <<EOF
[FS-0024 GUARD] Refusing to run \`$1\` from inside the read-only DirStarter
template (\$PWD = $PWD). The user's actual git repo is $_RONIN_REPO_DIR.

Fix one of:
  cd $_RONIN_REPO_DIR && $1 ...           # most common — you meant ronin-dojo-app
  RONIN_GUARD_BYPASS=1 $1 ...             # explicit override (e.g. read-only research)

See ~/.claude/projects/.../memory/feedback_ronin_dojo_bash_cwd.md
and docs/protocols/failed-steps-log.md FS-0024 (in the ronin-dojo-app repo).
EOF
  return 1
}

_ronin_wrap() {
  # Usage: _ronin_wrap <tool-name> "$@"
  _tool="$1"
  shift
  if [ "${RONIN_GUARD_BYPASS:-0}" = "1" ]; then
    command "$_tool" "$@"
    return $?
  fi
  if _ronin_in_template; then
    _ronin_guard_refuse "$_tool"
    return 1
  fi
  command "$_tool" "$@"
}

# Tool wrappers — same logic for each.
git()      { _ronin_wrap git      "$@"; }
gh()       { _ronin_wrap gh       "$@"; }
pnpm()     { _ronin_wrap pnpm     "$@"; }
vercel()   { _ronin_wrap vercel   "$@"; }
graphify() { _ronin_wrap graphify "$@"; }

# bun is dual-use — let `bun --version` / `bun --help` through unconditionally
# (those are safe-everywhere version probes).
bun() {
  case "$1" in
    --version|--help|-v|-h|"") command bun "$@"; return $? ;;
  esac
  _ronin_wrap bun "$@"
}
