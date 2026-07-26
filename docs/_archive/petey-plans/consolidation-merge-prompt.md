# SESSION_0416 — Consolidation bow-in prompt (BBL prune streams + red CI)

> Paste this into a new local (VSCode) Claude Code session, or `bow in` and read this file.
> Goal: consolidate the divergent BBL-prune streams onto a green `main`.

```
Bow in. This is a CONSOLIDATION session — several BBL-prune streams ran in parallel and CI is
red on most. Land them on a green `main` in the recommended order below.

Read first: docs/rituals/opening.md, docs/sprints/SESSION_0414.md (last closed), this file,
docs/prune-roadmap.md, docs/epics/technique-graph-curriculum-port.md, and memories:
held-work-vs-cloud-pr-base, in-place-prune-supersedes-separate-fork, bbl-roster-via-lineage-tree,
operator-drives-nothing-canonical, next-build-catches-use-server.

CONTEXT: SESSION_0414 closed `main` at the single-brand pivot — the repo (ronin-dojo-baseline,
becoming black-belt-legacy) is pruned IN PLACE to BBL-only; it deploys to blackbeltlegacy.com;
full site is behind /preview?token=bob-tony-BBL-preview. Four streams are now captured on origin:
  - PR #120 (claude/gracious-planck-34onv5) = roadmap #2: brand-resolution → BBL constant
    (getRequestBrand, proxy.ts, brand-features). DRAFT. FOUNDATIONAL.
  - PR #121 (claude/vibrant-hopper-dfogjd) = roadmap #1: schools/orgs premium parity +
    "single-brand query collapse". DRAFT.
  - PR #119 (claude/bbl-header-nav-parity-cf7454) = header/left-nav/right-drawer parity. DRAFT.
  - Branch codex/technique-graph-curriculum (commit 3511b793, also on origin) = BJJ TechniqueGraph
    + Curriculum port, ~4.2k lines (technique-graph.tsx, curriculum browser, server queries,
    prisma/import-bbl-bjj-curriculum.ts + data JSONs, nav/header/footer edits, its own
    SESSION_0415.md). Already preserved — do NOT lose it.

COLLISION MAP (known overlaps):
  - config/brand-features.ts (+ its test): touched by #120, #121, AND the codex branch — the hotspot.
  - server/web/directory/profile-where.ts + queries.ts: #121's "single-brand query collapse"
    overlaps the SESSION_0414 fix (placeholder-Passport roster surfaces via
    lineageNode.treeMembers.tree.brand). DO NOT regress it (directory must keep showing the roster).
  - header.tsx / footer.tsx / nav/nav-sheet.tsx: #119 (header/nav parity) overlaps the codex
    branch's nav/header edits.
  - Likely red-CI cause: #120 deletes brand exports (HOST_TO_BRAND, brandHasFeature, the feature
    gate) that #121 / the codex branch / tests still import.

RECOMMENDED ORDER (default — confirm with the operator after reading the CI logs, then execute one
stream at a time, green before each merge):
  1. #120 first (brand → BBL constant). It's the foundation everything else assumes. Rebase onto
     current main, get typecheck + `next build` + tests green, merge to main.
  2. codex/technique-graph-curriculum. Rebase onto the new main; resolve brand-features.ts;
     run prisma/import-bbl-bjj-curriculum.ts patterns are intact; green; merge. (Its SESSION_0415.md
     lands here — keep this consolidation session as SESSION_0416 to avoid a number clash.)
  3. #121 (schools/orgs). Rebase onto main; resolve brand-features.ts + the directory-query overlap
     WITHOUT regressing the SESSION_0414 lineage-tree roster fix; green; merge.
  4. #119 (header/nav). Rebase onto main; resolve header/footer/nav-sheet vs the codex nav edits;
     green; merge.

PROCESS PER STREAM: find merge-base vs main + file overlap (gh pr diff <n> --name-only); read the
failing CI jobs (gh pr checks <n>); rebase onto main; resolve conflicts; run `bun run typecheck`
AND a local `next build` (catches "use server"/config bugs tsc misses) AND tests; verify the
prod-visual surfaces via the preview cookie; then merge. Bring conflicts + the go/no-go back to the
operator before each merge.

GUARDRAILS: don't lose the codex work; other brands don't matter; don't regress SESSION_0414
(directory roster, premium cards, cinematic-explorer width); brand colors come from BrandSettings
(don't blank); show prod-visual before any push; one coherent main; FS-0024 git guard before
mutating git. Operator drives — surface the order + conflict findings, merge on their go.
```
