# @ronin-dojo/ui-kit

Brand-agnostic shared component **kernel** — the DDD Shared Kernel from
[ADR 0033](../../docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md).

> The board is **config + data**. Zero per-project code; brand = a token block.

## What lives here

| Export                      | Module        | PWCC            | What it is                                                                                                                   |
| --------------------------- | ------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `@ronin-dojo/ui-kit/kanban` | `src/kanban/` | PWCC-007        | The config-driven column/stage **AdminKanban** + lead intake + follow-up automations + the `BoardStore` persistence **port** |
| `@ronin-dojo/ui-kit/m-card` | `src/m-card/` | PWCC-002 (stub) | Thin **local stub** of `m-card` — flagged for reconciliation with the real PWCC-002 build                                    |

## The contract (PWCC-007)

A consumer targets a new project by writing **only**:

1. A **board config** (`BoardConfig`) — stages, automations, brand id, card kind. No code.
2. A **token block** — CSS variables (`--accent`, `--surface`, …). No hex in the kernel.

```ts
import { AdminKanban, type BoardConfig } from "@ronin-dojo/ui-kit/kanban"
```

See [ADR 0033 D2](../../docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md):
persistence is a **port** (`BoardStore`), never a hardcoded endpoint. `localStorage`, a Mammoth
backend, or `wp-json/bbl/v1` are all _adapters_.

## Persistence port (D2)

```ts
import {
  createLocalStorageBoardStore,
  createMemoryBoardStore,
  type BoardStore,
} from "@ronin-dojo/ui-kit/kanban"
```

The reusable core never names a brand endpoint. Swap the adapter, not the board.
