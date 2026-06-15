# Upstream: donatso/family-chart

- **Source:** https://github.com/donatso/family-chart
- **Forked commit SHA:** c7d22492dfc3090109cf28c6d4c82b1ee4ffd770
- **Vendored:** 2026-06-13 (SESSION_0381)
- **License:** MIT (see LICENSE.txt)
- **Decision:** ADR 0026 — Lineage View A engine (donatso fork; one DTO, two engines)

## What we copied

The entire `src/` directory was copied verbatim. We compile it via our own Next.js/TypeScript build
rather than using the upstream rollup/vite distribution. We own this source and may edit internals
freely (per ADR 0026 §1).

## IoC review result

SESSION_0381_TASK_01 — CLEAN:

- LICENSE.txt = MIT confirmed
- No network calls (fetch/XHR/WebSocket)
- No eval / new Function
- No fs / child_process / process calls
- No external URLs (only one ancestry.co.uk comment URL)
- No base64/obfuscation
- No postinstall/prepare/preinstall hooks
- `sideEffects: false` in upstream package.json
- Sole runtime dep: `d3 ^7.9.0`

## Modifications

None at vendor time. Subsequent edits are tracked in git history.
