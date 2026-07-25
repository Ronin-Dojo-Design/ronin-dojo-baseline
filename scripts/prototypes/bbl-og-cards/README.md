# BBL celebration-card SVG prototype

> **PROTOTYPE:** This is a throwaway feasibility spike. App code must not import it.

A dependency-free data-to-SVG renderer for three 1200×630 BBL social-card concepts:

- `promotion`
- `claim-verified`
- `milestone`

## Usage

Render a built-in fake demo payload to the ignored `out/` directory:

```sh
bun scripts/prototypes/bbl-og-cards/index.ts promotion
bun scripts/prototypes/bbl-og-cards/index.ts claim-verified
bun scripts/prototypes/bbl-og-cards/index.ts milestone
```

Choose an explicit destination:

```sh
bun scripts/prototypes/bbl-og-cards/index.ts promotion --out /tmp/promotion.svg
```

Run the focused tests:

```sh
bun test scripts/prototypes/bbl-og-cards
```

The renderers in `cards.ts` are pure functions and use system font stacks, so no font files or third-party packages are required. The committed `samples/` files use only fake demo data.

Escaping is minimal and demo-grade. A production version needs a proper XML writer, stricter input constraints, text measurement/wrapping, and a supported SVG-to-raster delivery path.
