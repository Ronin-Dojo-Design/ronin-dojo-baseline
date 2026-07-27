# 0055 — Brand repo separation (fork, don't rewrite)

Status: accepted (ratified by the operator, SESSION_0711). Amended SESSION_0712
(operator-ratified): repo names normalized to lowercase matching the local dev-folder
convention, and the everything-repo renamed `rdd-monorepo` (was Ronin-Dojo-Design-Monorepo,
already the chat-parlance shorthand); GitHub redirects cover old names. Supersedes legacy ADR 0034
(one-monorepo-hosts-all); amends ADR 0051 (kernel → brand → app taxonomy survives; the
"one monorepo hosts every brand's apps" clause dies).

## Context

The monorepo model was justified by a shared kernel + a library of brand-agnostic
feature-modules that every brand's apps would consume. HRR-07 (SESSION_0711 hostile repo
review) found that library is aspirational: `packages/ui-kit` is 24 files and there are
zero shared feature-modules in production use across brands. Meanwhile the real isolation
already happened at the infra layer — each app has its own database and its own Vercel
project (legacy ADR 0038), so the deploy unit never shared anything but the git DAG.
ADR 0033 D1 already provided the extraction path for client handoff; the MMB client
cutover (2026-08-05) accelerates it portfolio-wide. What remains shared is history,
process OS (rituals/ledgers/skills), and a small ui-kit — none of which requires
co-tenancy in one working tree, and co-tenancy is what drives the 4:1 meta:product doc
ratio, cross-brand blast radius, and per-session context bloat.

## Decision

Fork the monorepo into five sibling repos, each carrying FULL shared history
(fork-don't-rewrite: trim by ordinary deletion commits, never `git filter-repo`):

1. **black-belt-legacy** — rename of `ronin-dojo-baseline` (GitHub redirects old remotes).
2. **baseline-martial-arts**
3. **mammoth-metal-buildings**
4. **usa-stickfighting**
5. **rdd-monorepo** — keeps everything; upstream-of-record for
   `packages/ui-kit` and the process OS. Brand repos cherry-pick from it — the shared
   DAG makes cherry-picks trivial (identical blobs, no rebase surgery).

Each brand repo trims to its own apps/docs by ordinary commits, keeps its own DB +
Vercel project (already separate), and restarts a fresh SESSION era.

## Consequences

- Blast radius, doc corpus, and agent context shrink per repo; per-brand CI is native
  instead of matrix-pruned.
- Process drift ×5 is the new risk — mitigated by RDD-Monorepo as upstream-of-record and
  lean per-repo CLAUDE.md routers.
- ui-kit divergence risk — keep the `file:`/symlink pattern now; publish a versioned
  package only when a second real consumer earns it.
- Security findings (SEC-01) must be fixed pre-fork or they fork five ways.
- ADR 0051's kernel → brand → app model is unchanged; only the hosting clause is
  superseded. Execution plan: `docs/sprints/plans/petey-plan-0711-brand-repo-separation.md`.
