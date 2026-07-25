// Domain types for the Mammoth posting pipeline (SESSION_0687). Mirrors lib/types.ts's
// "flat read-model" convention: components consume this shape; lib/posting/actions.ts maps the
// normalized DB row onto it.

import type { PostingPlatform, PostingTemplateKey } from "./templates";
import type { PostingStatus } from "./status";

export type { PostingPlatform, PostingTemplateKey, PostingStatus };

/** Input to generate a new draft — the caller supplies which project the copy is drawn from. */
export type GeneratePostingDraftInput = {
  templateKey: PostingTemplateKey;
  platform: PostingPlatform;
  /** The CRM Project this draft's facts come from. Optional (a generic FAQ post may have none). */
  projectId: string | null;
  /** Placeholder token (without brackets) → value, e.g. `{ BUILDING_TYPE: "Auto Service" }`. */
  context: Record<string, string>;
  scheduledFor: string | null; // ISO, optional
};

export type PostingDraftRecord = {
  id: string;
  projectId: string | null;
  platform: PostingPlatform;
  templateKey: PostingTemplateKey;
  body: string;
  /** Bracket tokens still unfilled in `body` — empty once every fact is approved-in. */
  missingPlaceholders: string[];
  status: PostingStatus;
  scheduledFor: string | null; // ISO
  approvedAt: string | null; // ISO
  postedAt: string | null; // ISO — never set by this pipeline (see lib/posting/status.ts).
  createdAt: string; // ISO
  updatedAt: string; // ISO
};
