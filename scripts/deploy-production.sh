#!/usr/bin/env bash
# scripts/deploy-production.sh
# Pre-flight checks before pushing to main (which triggers Vercel deploy).
# Usage: ./scripts/deploy-production.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="apps/web"

echo "🥋 Ronin Dojo — Production Deploy Pre-flight"
echo "============================================="
echo ""

# 1. Check we're on main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo -e "${RED}✗ Not on main branch (on: $BRANCH). Switch to main first.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ On branch: main${NC}"

# 2. Check clean working tree
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}✗ Working tree is dirty. Commit or stash changes first.${NC}"
  git status --short
  exit 1
fi
echo -e "${GREEN}✓ Working tree clean${NC}"

# 3. Pull latest
echo "  Pulling latest from origin/main..."
git pull --ff-only origin main
echo -e "${GREEN}✓ Up to date with origin/main${NC}"

# 4. Type check
echo "  Running type check..."
cd "$APP_DIR"
if bun run typecheck 2>/dev/null; then
  echo -e "${GREEN}✓ Type check passed${NC}"
else
  echo -e "${RED}✗ Type check failed. Fix errors before deploying.${NC}"
  exit 1
fi

# 5. Lint
echo "  Running linter..."
if bun run lint 2>/dev/null; then
  echo -e "${GREEN}✓ Lint passed${NC}"
else
  echo -e "${YELLOW}⚠ Lint warnings found (non-blocking)${NC}"
fi

# 6. Build test
echo "  Running build..."
if bun run build; then
  echo -e "${GREEN}✓ Build succeeded${NC}"
else
  echo -e "${RED}✗ Build failed. Fix errors before deploying.${NC}"
  exit 1
fi

cd ../..

echo ""
echo "============================================="
echo -e "${GREEN}✓ All pre-flight checks passed!${NC}"
echo ""
echo "Vercel deploys automatically on push to main."
echo "If you have unpushed commits, run:"
echo ""
echo "  git push origin main"
echo ""
echo "Monitor deploy at: https://vercel.com/dashboard"
