-- SESSION_0537 (FI-028b) — per-post READ freemium for community posts.
--
-- Additive, non-destructive. Operator decision (SESSION_0537 grill Q1/Q4): the freemium gate unit is
-- the WHOLE post (a CommunityPost is atomic — one content body + one videoUrl + one imageUrl), and the
-- default is `false` so every EXISTING and new post stays free & PUBLIC (the /posts feed + detail are
-- already public to logged-out visitors). NOT NULL + DEFAULT false so prod applies it during
-- `prebuild → migrate deploy` with an implicit default; no row is dropped, reset, or backfilled.
--
-- No backfill UPDATE (unlike the SESSION_0527 MediaAttachment inherit) — default false IS the
-- grandfather state. No new index: a premium post stays IN the feed (the `where` is unchanged); it
-- renders as a locked teaser, its content/videoUrl/imageUrl stripped server-side before any client
-- payload (the no-leak invariant, mirroring the technique-media gate).

ALTER TABLE "CommunityPost" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;
