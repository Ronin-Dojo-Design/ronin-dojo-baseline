# CONTEXT-MAP — bounded contexts of this repo

One glossary per bounded context (Pocock pattern); a term lives in exactly one. The grill skills
(`/grilling`, `/grill-with-docs`) update the context whose scope the term belongs to.

| Context | Glossary | Scope |
| --- | --- | --- |
| Platform / kernel | [CONTEXT.md](CONTEXT.md) | Cross-product domain + design-system terms |
| Mammoth (MMB) | [docs/product/mammoth-build/CONTEXT.md](docs/product/mammoth-build/CONTEXT.md) | Sales, delivery, installation, enablement + ops vocabulary |
| Black Belt Legacy (BBL) | *(none yet — create lazily on first resolved term)* | Lineage, claims, belts, membership |

Ratified SESSION_0573 (MMB-D-024): MMB's `UBIQUITOUS_LANGUAGE.md` renamed to its context
`CONTEXT.md`; per-brand statements stay in each brand's `BRAND_HEART_BEAT.md` (MMB-D-007).
