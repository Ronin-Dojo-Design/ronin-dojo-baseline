# CLAUDE.md — Black-Belt-Legacy

Standing context for every Claude Code session in this repo. This is a **router, not a rulebook**:
subjects point to their homes; the rules themselves live in the referenced docs and in the
enforced gates (githooks, arch-gate, bow-in/bow-out gate runners). Read referenced docs on
demand, not per turn.

## The repo (five-repo era — ADR 0055/0059)

- **This is the Black Belt Legacy brand repo** (`/Users/brianscott/dev/ronin-dojo-app`, remote
  `Ronin-Dojo-Design/Black-Belt-Legacy`) — one of five sibling repos forked at `ecefd008` with
  full shared history (fork-don't-rewrite). Siblings: Baseline-Martial-Arts ·
  Mammoth-Metal-Buildings · USA-Stickfighting · **Ronin-Dojo-Design-Monorepo** (keeps
  everything; upstream-of-record for `packages/ui-kit` + the process OS — portfolio-wide law
  lands there first and syncs down by cherry-pick).
- **Session = one repo** (ADR 0059). Other brands' work happens in their own checkouts, never
  as worktrees of this one. Unpinned days start with RDD portfolio triage.
- Surviving surface here: `apps/web` (the BBL app — Next.js + Prisma + Better Auth) +
  `packages/ui-kit` + `packages/api-client`. Deploy unit = the app's own Vercel project + DB.
- Dev server: `cd apps/web && npx next dev --turbo` (FS-0002 — not `bun dev`/`pnpm dev`).
  VSCode's primary cwd may be the read-only `dirstarter_template` — never git/build/write
  there; run the FS-0024 `pwd` + `git remote` guard before any mutating git.
- Tooling: Vercel CLI, GitHub CLI (`gh`), Docker (MinIO only), MCP servers.

## Session operations

- **Bow-in and bow-out are mandatory** (`/bow-in`, `/bow-out` → `docs/rituals/`). Default task =
  the **"Next session" block of the highest-numbered `docs/sprints/SESSION_NNNN.md`**.
- **Discovery is Graphify-first** (`graphify stats`/`query` before repo-wide grep on cross-area
  work — `docs/runbooks/dev-environment/graphify-repo-memory.md`). One graph per repo; after
  structural changes run a full rebuild, not incremental.
- **Default to Petey orchestration** for multi-part/unclear lanes (`docs/protocols/petey-plan.md`
  → Cody builds → Doug verifies). The 5-pillar map + task→workflow router + allowed-vs-never
  table: `docs/knowledge/wiki/agent-systems-map.md`.
- **Bow-out = full close** (`docs/rituals/closing.md`): deep items, Graphify refresh, and the
  **finding router** (closing.md §6.7) — wiring→WL, drift→D, SOP miss→FS, unclean
  close→incidents, smoke boundary→MB, decision→ADR.
- **Push policy: explicit per-push authorization** — build, verify, show, then push on the
  operator's word. **`main` is PR-only, server-enforced** (ADR 0056:
  `git push -u origin HEAD` → `gh pr create --fill` → `gh pr merge --squash --delete-branch`);
  gates (typecheck / oxlint / oxfmt / tests / wiki-lint) pass first; never force-push. One push
  per session at close. Prod deploys are decoupled via `vercel.json` `ignoreCommand`.

## BBL north star

The verified lineage **graph** is the asset/moat; the **mission** (preserve the Machado /
Bob Bass lineage) is the engine; revenue is exhaust. **Optimize the claim loop above all.**
For any BBL/launch work, open the SoT set FIRST (order in `docs/rituals/opening.md` §0):
`docs/product/black-belt-legacy/` — `BBL-SOT-Spec.md` · `SOT-ADR.md` (D1–D7, supersedes
scattered ADRs) · `PRD.md` · `STORIES.md` · `CUTOVER_CHECKLIST.md` · `GAP_MATRIX.md` (stale —
re-verify live). SoT set + live app win over any other doc.

## Subject router

| Subject | Home |
| --- | --- |
| Current law (live ADRs, 0055+) | `docs/adr/` (legacy 0001–0054 frozen at `docs/architecture/decisions/`) |
| Session rituals + templates | `docs/rituals/` · `docs/sprints/_template/` |
| Operating system + recipes | `docs/protocols/WORKFLOW_6.0.md` · `docs/protocols/SOT_Cookbook.md` · `docs/protocols/recipes/` |
| Ledgers / backlog | `bun scripts/ledger-backlog.ts` · board: `apps/web/scripts/board-backlog.ts` · ledger files in `docs/protocols/` + `docs/knowledge/wiki/` |
| BBL product SoT | `docs/product/black-belt-legacy/` |
| Identity / claims / lineage canon | `docs/knowledge/wiki/concepts/passport-and-shells.md` · `docs/product/black-belt-legacy/lineage-data-wiring-flow.md` · domain hubs in `docs/runbooks/domain-features/` |
| Design system doctrine | `docs/knowledge/wiki/design-system-doctrine.md` · component inventory: `docs/knowledge/wiki/custom-component-inventory.md` |
| DB / deploys / environment | `docs/runbooks/` (start at `docs/runbooks/README.md`) |
| Dirstarter L1 alignment | `docs/knowledge/wiki/dirstarter-docs-inventory.md` (extend, never bypass) |
| Prior failures / drift | `docs/protocols/failed-steps-log.md` · `docs/knowledge/wiki/drift-register.md` · learning records: `docs/learning/ddd/learning-records/` |
| Wiki maintenance rules | `docs/protocols/llm-wiki-schema.md` |
| Portfolio map / cross-brand strategy | `docs/knowledge/wiki/ronin-project-context.md` (canonical copy: RDD-Monorepo) |

## Kernel & taxonomy (pointers)

- `kernel → brand → app` taxonomy survives the fork (legacy ADR 0051, as amended by ADR 0055 —
  only the one-monorepo hosting clause died). `packages/ui-kit` is the kernel; RDD-Monorepo is
  its upstream-of-record — cherry-pick ui-kit commits down, don't fork them.
- Operating mantra — "What would Apple / Facebook do?": one foundation + single-purpose pieces,
  ratify-then-conform, kill confidently-wrong docs on sight, tokens-as-contract, lean over
  sprawl. (Lesson: `docs/learning/ddd/learning-records/0006-design-systems-and-ui-kits.md`.)
- The in-app multi-brand `Brand`-enum harness is dead; brand-per-deploy is the model. The
  `Brand` enum + literal sites stay until the parked Stage-2 column drop.
