#!/usr/bin/env bun
// scripts/render-deck/index.ts
//
// CLI: bun scripts/render-deck/index.ts <outline.md> [-o out.html]
//
// Renders a markdown outline (frontmatter + "## " slides) into one self-contained
// branded HTML slide deck. See README.md for the outline format.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseOutline } from "./core/parse";
import { renderDeck } from "./templates/deck";

export interface CliArgs {
  input: string;
  output: string;
}

export function parseArgs(argv: string[]): CliArgs {
  if (argv.length === 0) {
    throw new Error("usage: bun scripts/render-deck/index.ts <outline.md> [-o out.html]");
  }
  const input = argv[0];
  let output = input.replace(/\.md$/, ".html");

  const flagIdx = argv.indexOf("-o");
  if (flagIdx !== -1) {
    const value = argv[flagIdx + 1];
    if (!value) {
      throw new Error("render-deck: -o requires an output path");
    }
    output = value;
  }

  return { input, output };
}

export function renderFile(input: string, output: string): { slideCount: number; outPath: string } {
  const markdown = readFileSync(resolve(input), "utf8");
  const outline = parseOutline(markdown);
  const html = renderDeck(outline);
  const outPath = resolve(output);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf8");
  return { slideCount: outline.slides.length + 1, outPath };
}

function main(): void {
  try {
    const { input, output } = parseArgs(process.argv.slice(2));
    const { slideCount, outPath } = renderFile(input, output);
    console.log(`render-deck: wrote ${slideCount} slides -> ${outPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
