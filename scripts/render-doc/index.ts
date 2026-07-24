#!/usr/bin/env bun
/**
 * scripts/render-doc/index.ts — G-030 v1: turn any frontmatter-carrying repo doc into a
 * brand-styled HTML artifact with a metadata header derived from the YAML.
 *
 * Usage: bun scripts/render-doc/index.ts <path/to/doc.md> [--genre=research-review|sop-ritual|generic]
 *
 * Static build script, not an in-app route (G-030 pinned decision) — run on demand, writes to
 * scripts/render-doc/out/.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { parseDoc } from "./core/parse"
import { renderDoc } from "./templates/render"

const OUT_DIR = path.join(import.meta.dir, "out")

function parseArgs(argv: string[]): { inputPath: string; genreOverride?: string } {
  const positional: string[] = []
  let genreOverride: string | undefined

  for (const arg of argv) {
    if (arg.startsWith("--genre=")) {
      genreOverride = arg.slice("--genre=".length)
    } else if (arg === "--genre") {
      throw new Error("--genre requires a value, e.g. --genre=research-review")
    } else {
      positional.push(arg)
    }
  }

  const inputPath = positional[0]
  if (!inputPath) {
    throw new Error(
      "Usage: bun scripts/render-doc/index.ts <path/to/doc.md> [--genre=research-review|sop-ritual|generic]",
    )
  }

  return { inputPath, genreOverride: genreOverride === "auto" ? undefined : genreOverride }
}

function outputSlug(inputPath: string, frontmatterSlug: string | string[] | undefined): string {
  if (typeof frontmatterSlug === "string" && frontmatterSlug.trim() !== "")
    return frontmatterSlug.trim()
  return path.basename(inputPath, path.extname(inputPath))
}

export function renderDocFile(
  inputPath: string,
  genreOverride?: string,
): { outputPath: string; html: string } {
  const resolvedInput = path.resolve(inputPath)
  if (!existsSync(resolvedInput)) {
    throw new Error(`Input doc not found: ${resolvedInput}`)
  }

  const raw = readFileSync(resolvedInput, "utf8")
  const relativeInput = path.relative(path.resolve(import.meta.dir, "../.."), resolvedInput)
  const doc = parseDoc(raw, relativeInput, genreOverride)
  const html = renderDoc(doc, relativeInput)

  const slug = outputSlug(resolvedInput, doc.frontmatter.slug)
  const outputPath = path.join(OUT_DIR, `${slug}.html`)

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(outputPath, html, "utf8")

  return { outputPath, html }
}

if (import.meta.main) {
  try {
    const { inputPath, genreOverride } = parseArgs(process.argv.slice(2))
    const { outputPath } = renderDocFile(inputPath, genreOverride)
    console.log(`Rendered -> ${outputPath}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
