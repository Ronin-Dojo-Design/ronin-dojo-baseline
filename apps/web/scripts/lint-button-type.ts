/**
 * Kernel guard against the inert-save-button class (WL-P2-44, FI-025 / SESSION_0520).
 *
 * Base UI's `useRender` never infers a `type` for the rendered `<button>` the way a plain HTML
 * button implicitly resolves to "submit" — a form save button built on the L1 `Button`
 * (`~/components/common/button`) that omits an explicit `type` prop silently does nothing when
 * clicked. 14 call sites shipped broken this way before SESSION_0520's sweep, and nothing
 * prevented the next form from reintroducing the class.
 *
 * This scanner walks every `.tsx` file under a root (default: this package), tracks native
 * `<form>` JSX nesting, and flags every L1 `Button` usage inside a form that has neither an
 * explicit `type` prop nor a `render` prop (which swaps the underlying tag away from `<button>`,
 * e.g. to an `<a>` via `render={<Link />}` — those have no `type` semantics and are exempt).
 *
 * Run:    cd apps/web && bun scripts/lint-button-type.ts
 * Wired into `lint` / `lint:check` (package.json) so CI (`bun run lint:check`) enforces it on
 * every PR. Regression test: `scripts/lint-button-type.test.ts`.
 */

import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import ts from "typescript"

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".generated",
  ".dirstarter-upstream",
  "dist",
  "build",
])

export type Violation = {
  file: string
  line: number
  column: number
}

const collectTsxFiles = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    if (entry.isSymbolicLink()) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      collectTsxFiles(full, out)
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      out.push(full)
    }
  }
  return out
}

/** True if the file imports the L1 `Button` (named export) from `~/components/common/button`. */
const importsL1Button = (source: ts.SourceFile): boolean =>
  source.statements.some(stmt => {
    if (!ts.isImportDeclaration(stmt)) return false
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) return false
    if (!stmt.moduleSpecifier.text.endsWith("/components/common/button")) return false
    const bindings = stmt.importClause?.namedBindings
    return (
      !!bindings &&
      ts.isNamedImports(bindings) &&
      bindings.elements.some(el => el.name.text === "Button")
    )
  })

const hasAttribute = (attributes: ts.JsxAttributes, name: string): boolean =>
  attributes.properties.some(prop => ts.isJsxAttribute(prop) && prop.name.getText() === name)

const jsxTagName = (node: ts.JsxOpeningLikeElement): string => {
  const tag = node.tagName
  return ts.isIdentifier(tag) ? tag.text : tag.getText()
}

/**
 * Parses a single file's already-read source text and returns every inert-Button violation.
 * Exported (alongside `ts.ScriptKind.TSX` parsing) so the regression test can feed fixture
 * strings directly without touching the filesystem.
 */
export const findViolations = (code: string, fileName = "fixture.tsx"): Violation[] => {
  const source = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  if (!importsL1Button(source)) return []

  const violations: Violation[] = []

  const visit = (node: ts.Node, inForm: boolean) => {
    let nextInForm = inForm

    if (ts.isJsxElement(node) && jsxTagName(node.openingElement) === "form") {
      nextInForm = true
    }

    const openingLikeElements: ts.JsxOpeningLikeElement[] = ts.isJsxSelfClosingElement(node)
      ? [node]
      : ts.isJsxElement(node)
        ? [node.openingElement]
        : []

    for (const el of openingLikeElements) {
      if (jsxTagName(el) !== "Button") continue
      if (!nextInForm) continue
      if (hasAttribute(el.attributes, "render")) continue
      if (hasAttribute(el.attributes, "type")) continue

      const { line, character } = source.getLineAndCharacterOfPosition(el.getStart(source))
      violations.push({ file: fileName, line: line + 1, column: character + 1 })
    }

    ts.forEachChild(node, child => visit(child, nextInForm))
  }

  visit(source, false)
  return violations
}

/** Walks `root` (default: this package's directory) and returns every violation found. */
export const lintButtonType = (root: string = join(import.meta.dirname, "..")): Violation[] => {
  const violations: Violation[] = []

  for (const file of collectTsxFiles(root)) {
    const text = readFileSync(file, "utf8")
    violations.push(...findViolations(text, relative(root, file)))
  }

  return violations
}

if (import.meta.main) {
  const violations = lintButtonType()

  if (violations.length > 0) {
    console.error(
      `lint-button-type: ${violations.length} Button(s) inside a <form> without an explicit "type" prop\n`,
    )
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}:${v.column}`)
    }
    console.error(
      '\nAdd type="submit" (the save action) or type="button" (any non-submit action, e.g. Cancel/Add row) — ' +
        "Base UI's Button never infers it (WL-P2-44 / FI-025).",
    )
    process.exit(1)
  }

  console.log("lint-button-type: OK — no inert Button-in-form violations")
}
