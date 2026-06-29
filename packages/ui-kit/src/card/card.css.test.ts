// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, it } from "bun:test";
// @ts-expect-error - node:fs builtin; @types/node is intentionally not a ui-kit dep (kernel stays dep-light).
import { readFileSync } from "node:fs";
// @ts-expect-error - node:path builtin; @types/node is intentionally not a ui-kit dep.
import { join } from "node:path";
import { CARD_RADIUS_TOKEN_DECLARATION, CARD_SURFACE_DECLARATIONS } from "./card-surface-contract";

/** Bun exposes `import.meta.dir`; TS lacks the type without @types/bun, so cast narrowly. */
const here = (import.meta as unknown as { dir: string }).dir;

/**
 * Anti-drift parity guard (doctrine §6) — fails the build if the ported kernel `Card` surface
 * drifts from the L1 contract it was ported from (apps/web/components/common/card.tsx).
 *
 * The kernel is framework-agnostic and cannot import the app's Tailwind L1, so the contract is
 * pinned in card-surface-contract.ts (with L1-origin comments) and this test asserts the actual
 * CSS encodes it. If someone re-introduces 12px radius, hardcodes a hex, or drops a shell
 * declaration, this test goes red before the three board surfaces silently diverge.
 */

const cardCss = readFileSync(join(here, "card.css"), "utf8");
const tokensCss = readFileSync(join(here, "../tokens/tokens.css"), "utf8");

/** Extract the body of the `.mk-surface { … }` rule (not the :focus-visible / comments). */
function mkSurfaceRule(css: string): string {
  const body = css.match(/\.mk-surface\s*\{([^}]*)\}/)?.[1];
  if (body === undefined) throw new Error("card.css has no `.mk-surface { … }` rule");
  return body;
}

describe("card.css — ported L1 surface contract", () => {
  const rule = mkSurfaceRule(cardCss);

  for (const decl of CARD_SURFACE_DECLARATIONS) {
    it(`.mk-surface encodes the L1 contract: ${decl}`, () => {
      expect(rule).toContain(decl);
    });
  }

  it("the surface is token-only — no literal hex / rgb() (tokens travel, never hardcode)", () => {
    expect(rule).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(rule).not.toMatch(/rgb\(/);
  });
});

describe("tokens.css — the radius the surface resolves to", () => {
  it(`pins --mk-r-card to the reconciled L1 8px (§6 gap #4): ${CARD_RADIUS_TOKEN_DECLARATION}`, () => {
    expect(tokensCss).toContain(CARD_RADIUS_TOKEN_DECLARATION);
  });
});
