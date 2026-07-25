// scripts/render-deck/core/parse.ts
//
// Pure markdown-outline parser for render-deck. No I/O — takes a markdown string with
// YAML frontmatter and returns a structured Outline. See README.md for the outline
// format contract.

import { isBrand, type Brand } from "../tokens";

export interface Frontmatter {
  title: string;
  subtitle?: string;
  brand: Brand;
  author?: string;
  date?: string;
}

export type SlideBlock =
  | { type: "bullets"; items: string[] }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string };

export interface Slide {
  title: string;
  blocks: SlideBlock[];
  notes?: string;
  /** "statement" = the slide body is a single lone blockquote (renders as a big-statement slide). */
  layout: "content" | "statement";
}

export interface Outline {
  frontmatter: Frontmatter;
  slides: Slide[];
}

/** Strips one layer of matching double or single quotes from a YAML-ish scalar. */
function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

function parseFrontmatterBlock(block: string): Frontmatter {
  const raw: Record<string, string> = {};
  for (const line of block.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = unquote(line.slice(idx + 1));
    if (key) raw[key] = value;
  }

  if (!raw.title) {
    throw new Error("render-deck: frontmatter is missing required field 'title'");
  }
  if (!raw.brand) {
    throw new Error("render-deck: frontmatter is missing required field 'brand'");
  }
  if (!isBrand(raw.brand)) {
    throw new Error(
      `render-deck: frontmatter 'brand' must be one of rdd | bbl | mmb (got "${raw.brand}")`,
    );
  }

  return {
    title: raw.title,
    subtitle: raw.subtitle || undefined,
    brand: raw.brand,
    author: raw.author || undefined,
    date: raw.date || undefined,
  };
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function splitFrontmatter(markdown: string): { frontmatter: Frontmatter; body: string } {
  const match = FRONTMATTER_RE.exec(markdown);
  if (!match) {
    throw new Error("render-deck: outline is missing a leading YAML frontmatter block (---)");
  }
  const frontmatter = parseFrontmatterBlock(match[1]);
  const body = markdown.slice(match[0].length);
  return { frontmatter, body };
}

const BULLET_RE = /^[-*]\s+(.*)$/;
const QUOTE_RE = /^>\s?(.*)$/;
const NOTES_RE = /^Notes:\s*(.*)$/;
const HEADING_RE = /^##\s+(.+?)\s*$/;

function finalizeSlide(title: string, lines: string[]): Slide {
  const blocks: SlideBlock[] = [];
  let notes: string | undefined;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const notesMatch = NOTES_RE.exec(line);
    if (notesMatch) {
      const notesLines = [notesMatch[1]];
      i++;
      while (i < lines.length && lines[i].trim()) {
        notesLines.push(lines[i].trim());
        i++;
      }
      notes = notesLines.join(" ").trim();
      continue;
    }

    const bulletMatch = BULLET_RE.exec(line);
    if (bulletMatch) {
      const items = [bulletMatch[1].trim()];
      i++;
      while (i < lines.length) {
        const next = BULLET_RE.exec(lines[i]);
        if (!next) break;
        items.push(next[1].trim());
        i++;
      }
      blocks.push({ type: "bullets", items });
      continue;
    }

    const quoteMatch = QUOTE_RE.exec(line);
    if (quoteMatch) {
      const quoteLines = [quoteMatch[1]];
      i++;
      while (i < lines.length) {
        const next = QUOTE_RE.exec(lines[i]);
        if (!next) break;
        quoteLines.push(next[1]);
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ").trim() });
      continue;
    }

    // Plain paragraph: consume consecutive non-blank, non-special lines.
    const paraLines = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !BULLET_RE.test(lines[i]) &&
      !QUOTE_RE.test(lines[i]) &&
      !NOTES_RE.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ").trim() });
  }

  const layout: Slide["layout"] =
    blocks.length === 1 && blocks[0].type === "quote" ? "statement" : "content";

  return { title, blocks, notes, layout };
}

function splitSlides(body: string): Slide[] {
  const lines = body.split("\n");
  const slides: Slide[] = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const heading = HEADING_RE.exec(line);
    if (heading) {
      if (currentTitle !== null) {
        slides.push(finalizeSlide(currentTitle, currentLines));
      }
      currentTitle = heading[1];
      currentLines = [];
      continue;
    }
    // Lines before the first "## " heading are ignored — the deck's title slide is
    // built from frontmatter, not from stray body text.
    if (currentTitle !== null) {
      currentLines.push(line);
    }
  }

  if (currentTitle !== null) {
    slides.push(finalizeSlide(currentTitle, currentLines));
  }

  return slides;
}

export function parseOutline(markdown: string): Outline {
  const { frontmatter, body } = splitFrontmatter(markdown);
  const slides = splitSlides(body);
  return { frontmatter, slides };
}
