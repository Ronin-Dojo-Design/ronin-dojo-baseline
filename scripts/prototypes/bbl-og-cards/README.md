# BBL celebration-card SVG prototype

> **PROTOTYPE:** This is a throwaway feasibility spike. App code must not import it.

A dependency-free data-to-SVG renderer for five 1200×630 BBL social-card concepts:

- `promotion`
- `claim-verified`
- `milestone`
- `technique-preview`
- `legacy-wrapped`

## Usage

Render a built-in fake demo payload to the ignored `out/` directory:

```sh
bun scripts/prototypes/bbl-og-cards/index.ts promotion
bun scripts/prototypes/bbl-og-cards/index.ts claim-verified
bun scripts/prototypes/bbl-og-cards/index.ts milestone
bun scripts/prototypes/bbl-og-cards/index.ts technique-preview
bun scripts/prototypes/bbl-og-cards/index.ts legacy-wrapped
```

Choose an explicit destination:

```sh
bun scripts/prototypes/bbl-og-cards/index.ts promotion --out /tmp/promotion.svg
```

Run the focused tests:

```sh
bun test scripts/prototypes/bbl-og-cards
```

## Host-only PNG rasterization

`rasterize.ts` is a macOS host-run helper and must not be run in this sandbox. It uses the host's Quick Look renderer to convert every SVG in either `samples/` or `out/` to a 1200px PNG:

```sh
bun scripts/prototypes/bbl-og-cards/rasterize.ts samples
bun scripts/prototypes/bbl-og-cards/rasterize.ts out --out /tmp/bbl-og-card-pngs
```

By default, PNG output goes to the ignored `out/png/` directory. If `qlmanage` is unavailable, the helper exits non-zero with a host-specific explanation. Its in-lane gate is syntax-only:

```sh
node --check scripts/prototypes/bbl-og-cards/rasterize.ts
```

The renderers in `cards.ts` are pure functions and use system font stacks, so no font files or third-party packages are required. The committed `samples/` files use only fake demo data.

Escaping is minimal and demo-grade. A production version needs a proper XML writer, stricter input constraints, text measurement/wrapping, and a supported SVG-to-raster delivery path.
