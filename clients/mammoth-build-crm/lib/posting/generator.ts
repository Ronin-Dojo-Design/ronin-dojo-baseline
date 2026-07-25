/**
 * Posting-draft generator (SESSION_0687) — pure rendering rules, no DB/session access.
 *
 * Fills a template's `[PLACEHOLDER]` tokens from a caller-supplied context (typically pulled from
 * a CRM Project — brief: "verify facts against the CRM Project record"). Mirrors the
 * lib/lead-commit.ts split: pure plan/render functions here, tested directly; the "use server" DB
 * wrapper (lib/posting/actions.ts) stays thin and calls into this.
 *
 * NEVER guesses a missing value — an unfilled placeholder is left as its literal bracket token in
 * the rendered body and reported in `missingPlaceholders`, so the draft is visibly incomplete
 * rather than silently wrong. `lib/posting/status.ts` refuses to approve a draft that still has
 * any.
 */

import { getPostingTemplate, type PostingPlatform, type PostingTemplateKey } from "./templates";

/** Placeholder token → replacement value, e.g. `{ BUILDING_TYPE: "Auto Service" }`. */
export type PostingPlaceholderContext = Record<string, string>;

export type RenderedPosting = {
  body: string;
  /** Bracket tokens (e.g. "[CALL_TO_ACTION_URL]") left unfilled, in the order first seen. */
  missingPlaceholders: string[];
};

/**
 * Matches a literal `[UPPER_SNAKE_CASE]` placeholder token (the doc's shared placeholder set).
 * Two separate regex objects on purpose: the global one drives `matchAll`/`replace` (which reset
 * `lastIndex` themselves), while `.test()` on a global regex mutates `lastIndex` across calls —
 * sharing one instance between `hasUnresolvedPlaceholders` and the render path would make repeated
 * `.test()` calls silently skip matches.
 */
const PLACEHOLDER_PATTERN = /\[[A-Z0-9_]+\]/g;
const PLACEHOLDER_EXISTS_PATTERN = /\[[A-Z0-9_]+\]/;

/** Every placeholder token present in `text`, de-duplicated, in first-seen order. */
export function extractPlaceholders(text: string): string[] {
  const seen = new Set<string>();
  for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
    seen.add(match[0]);
  }
  return [...seen];
}

/** Whether `body` still contains any literal `[PLACEHOLDER]` token. */
export function hasUnresolvedPlaceholders(body: string): boolean {
  return PLACEHOLDER_EXISTS_PATTERN.test(body);
}

/**
 * Render one template/platform pair against `context`. A context value must be non-blank to count
 * as filled — an empty string is treated the same as "not provided" (never render blank copy where
 * a fact belongs).
 */
export function renderPostingTemplate(
  templateKey: PostingTemplateKey,
  platform: PostingPlatform,
  context: PostingPlaceholderContext,
): RenderedPosting {
  const template = getPostingTemplate(templateKey);
  const source = template.copy[platform];
  const missing = new Set<string>();
  const body = source.replace(PLACEHOLDER_PATTERN, (token) => {
    const key = token.slice(1, -1);
    const value = context[key];
    if (value === undefined || value.trim() === "") {
      missing.add(token);
      return token;
    }
    return value;
  });
  return { body, missingPlaceholders: [...missing] };
}
