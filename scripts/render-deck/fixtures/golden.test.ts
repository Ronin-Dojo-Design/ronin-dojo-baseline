import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseOutline } from "../core/parse";
import { renderDeck } from "../templates/deck";

const FIXTURE_DIR = import.meta.dir;

describe("golden fixture", () => {
  test("renderDeck(parseOutline(sample-outline.md)) matches the committed sample-outline.html", () => {
    const markdown = readFileSync(join(FIXTURE_DIR, "sample-outline.md"), "utf8");
    const expected = readFileSync(join(FIXTURE_DIR, "sample-outline.html"), "utf8");
    const actual = renderDeck(parseOutline(markdown));
    expect(actual).toBe(expected);
  });
});
