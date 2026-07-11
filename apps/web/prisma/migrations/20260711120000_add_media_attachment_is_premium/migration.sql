-- SESSION_0527 Slice 0 — per-video premium (freemium gate unit moves Technique → MediaAttachment).
--
-- Additive, non-destructive. Operator decision (SESSION_0526 Fork 2): the freemium gate unit becomes
-- the ATTACHMENT, so one technique can mix free + premium clips. NOT NULL + DEFAULT false so prod
-- applies it during `prebuild → migrate deploy` with an implicit default; no row is dropped or reset.
--
-- Behavior-preserving backfill: every EXISTING technique attachment inherits its parent
-- `Technique.isPremium`, so a currently-premium technique stays fully locked and a free one stays free
-- (identical to the SESSION_0525 technique-level gate). Non-technique attachments (podcasts, matches,
-- events, ranks, courses, …) keep the `false` default — they were never premium.
--
-- Preserves the SESSION_0526 A1/A2 no-leak invariants: the callers (watch tile, browse rail,
-- buildProfileMedia) strip a locked premium attachment's playable url server-side before any client
-- payload. This migration only moves the flag; the gate rewire lands with it (SESSION_0527 Slice 0).

-- Step 1: add the per-attachment flag (implicit backfill to the default for every existing row).
ALTER TABLE "MediaAttachment" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: behavior-preserving backfill — inherit the parent Technique's premium state for every
-- attachment that references a technique (single UPDATE, idempotent, touches only technique rows).
UPDATE "MediaAttachment" AS ma
SET "isPremium" = t."isPremium"
FROM "Technique" AS t
WHERE ma."techniqueId" = t."id";
