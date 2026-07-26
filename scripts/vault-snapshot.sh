#!/usr/bin/env bash
#
# vault-snapshot.sh — weekly-sync step: snapshot the live Obsidian vaults into the
# RDD_Baseline44_Vault git mirror (SESSION_0711 vault-consolidation decision).
#
# Why a mirror instead of .git inside the vault: Dropbox syncing git internals corrupts
# repos; the live vault stays sync-only, history lives here. Runs when the operator
# invokes it (weekly RDD sync session) — it commits AND pushes the mirror.
set -euo pipefail

MIRROR="$HOME/dev/RDD_Baseline44_Vault"
declare -a VAULTS=(
  "$HOME/Dropbox/Obsidian/Baseline_ObsidianDB/RDD_Master_Vault"
  "$HOME/Dropbox/Obsidian/Mammoth_Master_Vault"
)

if [ ! -d "$MIRROR/.git" ]; then
  echo "→ first run: cloning mirror"
  git clone "https://github.com/Ronin-Dojo-Design/RDD_Baseline44_Vault.git" "$MIRROR"
fi

for v in "${VAULTS[@]}"; do
  [ -d "$v" ] || { echo "⚠ vault missing, skipped: $v"; continue; }
  name="$(basename "$v")"
  rsync -a --delete \
    --exclude '.trash/' --exclude '.obsidian/workspace*' --exclude '.DS_Store' \
    "$v/" "$MIRROR/$name/"
  echo "✓ synced $name"
done

cd "$MIRROR"
if git status --porcelain | grep -q .; then
  git add -A
  git commit -m "vault snapshot $(date +%Y-%m-%d)"
  git push
  echo "✓ snapshot pushed: $(git log --oneline -1)"
else
  echo "✓ no changes since last snapshot"
fi
