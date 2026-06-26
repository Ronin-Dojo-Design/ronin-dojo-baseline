# AGENTS.md — Ronin Dojo Baseline

> **Session operations (bow-in / bow-out / orchestration) are binding for every agent, including Codex.**
> They live in [`CLAUDE.md`](CLAUDE.md) → "Session operations" (repo paths, the `apps/web` dev-server +
> Prisma gotchas, Graphify-first discovery, the FS-0024 git guard, and the **explicit per-push
> authorization** flow) and in the cross-agent rituals [`docs/rituals/opening.md`](docs/rituals/opening.md)
> / [`docs/rituals/closing.md`](docs/rituals/closing.md). Read those first when starting a session — the
> opening ritual is explicitly agent-agnostic and records `last_agent: codex-session-NNNN` for Codex runs.
>
> **Repo & product strategy** (the platform / multi-product monorepo model, ADR 0034) also lives in
> [`CLAUDE.md`](CLAUDE.md) → "Repo & product strategy" — binding for every agent.

---

## LLM Wiki Schema

The knowledge-wiki maintenance rules (how to maintain `docs/knowledge/wiki/`) live in the canonical,
agent-agnostic doc [`docs/protocols/llm-wiki-schema.md`](docs/protocols/llm-wiki-schema.md) — read it when
doing wiki/knowledge work, not every turn. (Single source of truth; this file previously inlined an older
copy of those rules — de-duplicated SESSION_0450 to point at the canonical doc, matching CLAUDE.md per
ADR 0033 D7.)
