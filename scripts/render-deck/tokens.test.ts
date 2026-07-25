import { describe, expect, test } from "bun:test";
import { BRAND_TOKENS, getBrandTokens, isBrand } from "./tokens";

describe("tokens", () => {
  test("isBrand accepts exactly rdd | bbl | mmb", () => {
    expect(isBrand("rdd")).toBe(true);
    expect(isBrand("bbl")).toBe(true);
    expect(isBrand("mmb")).toBe(true);
    expect(isBrand("acme")).toBe(false);
  });

  test("getBrandTokens returns the matching palette for each brand", () => {
    expect(getBrandTokens("rdd")).toBe(BRAND_TOKENS.rdd);
    expect(getBrandTokens("bbl")).toBe(BRAND_TOKENS.bbl);
    expect(getBrandTokens("mmb")).toBe(BRAND_TOKENS.mmb);
  });

  test("each brand has a distinct primary color", () => {
    const primaries = new Set(Object.values(BRAND_TOKENS).map((t) => t.primary));
    expect(primaries.size).toBe(3);
  });

  test("getBrandTokens throws on an unknown brand", () => {
    expect(() => getBrandTokens("acme")).toThrow(/rdd \| bbl \| mmb/);
  });
});
