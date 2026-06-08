import { readdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(import.meta.dir, "..")
const architectureRoot = path.join(repoRoot, "docs", "architecture")
const sourceRoot = path.join(architectureRoot, "source")

const isMarkdown = (file: string) => file.endsWith(".md")
const isSourceSnapshot = (file: string) => file.startsWith(`${sourceRoot}${path.sep}`)

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  if (!existsSync(dir)) return files

  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)))
      continue
    }
    if (entry.isFile() && isMarkdown(entry.name)) {
      if (!isSourceSnapshot(fullPath)) {
        files.push(fullPath)
      }
    }
  }

  return files
}

const isFence = (line: string) => /^```/.test(line.trim())
const isOpeningFenceWithoutLanguage = (line: string) => line.trim() === "```"
const isHeading = (line: string) => /^#{1,6}\s+\S/.test(line.trim())
const isListLine = (line: string) => /^(\s*)([-*+]|\d+[.)])\s+/.test(line)
const isTableRow = (line: string) => /^\s*\|.*\|\s*$/.test(line)
const isTableSeparator = (line: string) =>
  line.includes("|") && /^\s*\|?[\s:-]*-{3,}[\s|:-]*\|?\s*$/.test(line)

function normalizeTableSeparator(line: string) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "")
  const cells = trimmed.split("|").map(cell => {
    const raw = cell.trim()
    const left = raw.startsWith(":")
    const right = raw.endsWith(":")
    if (left && right) return ":---:"
    if (left) return ":---"
    if (right) return "---:"
    return "---"
  })
  return `| ${cells.join(" | ")} |`
}

function normalizeBareUrls(line: string) {
  return line.replace(/https?:\/\/[^\s<>)]+/g, (match, offset: number, full: string) => {
    const before = full.slice(0, offset)
    if (before.endsWith("<") || before.endsWith("](")) return match

    const punctuation = match.match(/[.,;:!?]+$/)?.[0] ?? ""
    const clean = punctuation ? match.slice(0, -punctuation.length) : match
    return `<${clean}>${punctuation}`
  })
}

function normalizeEmphasisHeadings(line: string) {
  const indent = line.match(/^\s*/)?.[0] ?? ""
  const trimmed = line.trim()
  if (/^[-*+]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
    return line
  }

  const bold = trimmed.match(/^\*\*(.+?)\*\*:?\s*$/)
  if (bold) {
    return `${indent}### ${bold[1].replace(/:$/, "")}`
  }

  const italic = trimmed.match(/^\*\((.+?)\)\*\s*$/)
  if (italic) {
    return `${indent}### (${italic[1]})`
  }

  return line
}

function normalizeInlineHtmlPlaceholders(line: string) {
  return line.replace(/<([a-z][a-z0-9_-]*)>/g, "&lt;$1&gt;")
}

function normalizeHeadingPunctuation(line: string) {
  if (!isHeading(line)) return line
  return line
    .replace(/:\*\*\s+\*\*/g, ": ")
    .replace(/\*\*/g, "")
    .replace(/[.,:;!?]+$/g, "")
}

function pushBlankIfNeeded(lines: string[]) {
  if ((lines.at(-1) ?? "").trim() !== "") {
    lines.push("")
  }
}

function nextNonBlank(lines: string[], start: number) {
  for (let index = start; index < lines.length; index++) {
    if (lines[index]?.trim() !== "") {
      return lines[index] ?? ""
    }
  }
  return ""
}

function surroundMarkdownBlocks(lines: string[]) {
  const result: string[] = []
  let inFence = false
  let inFrontmatter = false

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? ""

    if (index === 0 && line.trim() === "---") {
      inFrontmatter = true
      result.push(line)
      continue
    }

    if (inFrontmatter) {
      result.push(line)
      if (index > 0 && line.trim() === "---") {
        inFrontmatter = false
      }
      continue
    }

    if (isFence(line)) {
      const opening = !inFence
      if (opening) {
        pushBlankIfNeeded(result)
      }

      result.push(line)
      inFence = !inFence

      if (!opening && nextNonBlank(lines, index + 1).trim() !== "") {
        result.push("")
      }
      continue
    }

    if (inFence) {
      result.push(line)
      continue
    }

    const next = nextNonBlank(lines, index + 1)

    if (isHeading(line)) {
      pushBlankIfNeeded(result)
      result.push(line)
      if (next.trim() !== "") {
        result.push("")
      }
      continue
    }

    if (isTableRow(line)) {
      const previous = result.at(-1) ?? ""
      const nextLine = lines[index + 1] ?? ""
      if (!isTableRow(previous) && previous.trim() !== "") {
        result.push("")
      }
      result.push(line)
      if (!isTableRow(nextLine) && nextLine.trim() !== "") {
        result.push("")
      }
      continue
    }

    const previous = result.at(-1) ?? ""
    const startsList = isListLine(line) && previous.trim() !== "" && !isListLine(previous)
    if (startsList) {
      result.push("")
    }

    result.push(line)

    const endsList = isListLine(line) && next.trim() !== "" && !isListLine(next)
    if (endsList) {
      result.push("")
    }
  }

  return result
}

function collapseBlankLines(lines: string[]) {
  const collapsed: string[] = []
  for (const line of lines) {
    if (line.trim() === "" && (collapsed.at(-1) ?? "").trim() === "") {
      continue
    }
    collapsed.push(line)
  }
  return collapsed
}

function normalizeLines(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const normalized: string[] = []
  let inFence = false
  let inFrontmatter = false

  for (let index = 0; index < lines.length; index++) {
    let line = lines[index].replace(/\t/g, "  ").replace(/[ \t]+$/g, "")

    if (index === 0 && line.trim() === "---") {
      inFrontmatter = true
      normalized.push(line)
      continue
    }

    if (inFrontmatter) {
      normalized.push(line)
      if (line.trim() === "---") {
        inFrontmatter = false
      }
      continue
    }

    if (isFence(line)) {
      if (!inFence && isOpeningFenceWithoutLanguage(line)) {
        line = "```text"
      }
      inFence = !inFence
      normalized.push(line)
      continue
    }

    if (!inFence) {
      line = normalizeEmphasisHeadings(line)
      line = line.replace(/^(\s*)\*\*(Positive|Negative|Neutral)\*\*\s*$/, "$1### $2")
      line = line.replace(/^(\s*)\d+[.)]\s+/, "$11. ")
      line = line.replace(/^(#{1,6})([A-Za-z0-9])/, "$1 $2")
      if (isTableSeparator(line)) {
        line = normalizeTableSeparator(line)
      }
      line = normalizeBareUrls(line)
      line = normalizeInlineHtmlPlaceholders(line)
      line = normalizeHeadingPunctuation(line)
    }

    normalized.push(line)
  }

  const spaced = surroundMarkdownBlocks(normalized)
  return `${collapseBlankLines(spaced).join("\n").replace(/\n*$/g, "")}\n`
}

const files = await collectMarkdownFiles(architectureRoot)
let changed = 0

for (const file of files) {
  const original = await readFile(file, "utf8")
  const normalized = normalizeLines(original)
  if (normalized !== original) {
    await writeFile(file, normalized)
    changed += 1
  }
}

console.log(`Scanned ${files.length} architecture markdown files; fixed ${changed}.`)
